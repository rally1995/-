<template lang="pug">
ebrain-main
        ebrain-box
            .wrap
                .wrap-body
                    h3  过账状态:
                    el-checkbox-group.checkbox(
                        v-model="checkList"
                        @change="queryPool")
                        el-checkbox(label='0') 未开始
                        el-checkbox(label='1') 进行中
                        el-checkbox(label='2') 已完成
                    el-button.button.middle(
                        type="primary"
                        size="medium"
                        @click="open('conditionQuery')") 条件查询
                    .wrap-body-contain
                        swiper-item.border(
                            v-for="(items,index) in jobpoolList"
                            :key='items.id'
                            :btn-name="['过账', '查看']"
                            :btn-click="[()=>btnPos(items.orderNo, items.id),()=>navigatorTo(items.orderNo, items.id)]"
                            @onclick="navigatorTo(items.id, items)")
                            .wrap-body-contain-list
                                .left(:class="{gray: items.state == '0', blue: items.state == '1',red:items.state == '3', green: items.state == '4' }") {{index + 1}}
                                .right
                                    span 任务工单号：{{items.orderNo}}
                                    span 料号：{{items.materialNo}}
                                    span 开始时间: {{items.planBeginTime}}
                                    span 明细编号:{{items.taskDetailNo}}
                                    span 物料名称：{{items.materialName}}
                                    span 数量：{{items.curAmount}} {{items.materialUnit}}
                                    span 结束时间: {{items.planCompleteTime}}
                                    span 过账状态：{{dict['postingStatus'][items.postingStatus]}}
        condition-query(ref="conditionQuery" @submit-dialog="queryPool")
</template>
<script>
import { finshList } from '@/utils/api';
import dict from '@/utils/dict';
import conditionQuery from '@/components/jobpoolDialog/conditionQuery';
import moment from 'moment';
import SwiperItem from '@/components/SwiperItem';
import { mapState, mapMutations } from 'vuex';

export default {
    components: {
        conditionQuery,
        SwiperItem,
    },
    data() {
        return {
            jobpoolList: [],
            dict,
            moveX: 0,
            startX: 0,
            left: 'auto',
            currentItem: null,
            checkList: ['0', '1'],
        };
    },
    computed: {
        ...mapState('workcenter', {
            orderList: state => state.orderList,
        }),
        wc() {
            return this.$route.query.wc;
        },
        pn() {
            return this.$route.query.pn;
        },
        pc() {
            return this.$route.query.pi;
        },
        wn() {
            return this.$route.query.wn;
        }
    },
    mounted() {
        this.queryPool();
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        queryPool(val) {
            let obj = {
                workcenterCode: this.wc,
                postingStatus: this.checkList.join(encodeURIComponent(',')),
            };
            if (val) {
                obj.taskNo = val.taskNo;
                obj.mainMaterielCode = val.mainMaterielCode;
                obj.mainMaterielName = val.mainMaterielName;
                obj.orderBegStartTime = val.startTime && moment(val.startTime[0]).format('YYYY-MM-DD HH:mm:ss');
                obj.orderBegEndTime = val.startTime && moment(val.startTime[1]).format('YYYY-MM-DD HH:mm:ss');
                obj.orderCmpStartTime = val.endTime && moment(val.endTime[0]).format('YYYY-MM-DD HH:mm:ss');
                obj.orderCmpEndTime = val.endTime && moment(val.endTime[1]).format('YYYY-MM-DD HH:mm:ss');
            }
            finshList(obj).then(({ data, code }) => {
                this.jobpoolList = data.records;
            });
        },
        getFinshLish(val) {
            finshList({
                workcenterCode: this.wc,
                taskNo: val.taskNo,
                mainMaterielCode: val.mainMaterielCode,
                mainMaterielName: val.mainMaterielName,
                orderBegStartTime: moment(val.startTime[0]).format('YYYY-MM-DD HH:mm:ss'),
                orderBegEndTime: moment(val.startTime[1]).format('YYYY-MM-DD HH:mm:ss'),
                orderCmpStartTime: moment(val.endTime[0]).format('YYYY-MM-DD HH:mm:ss'),
                orderCmpEndTime: moment(val.endTime[1]).format('YYYY-MM-DD HH:mm:ss'),
            }).then(({ data }) => {
                this.jobpoolList = data.records;
            });
        },
        navigatorTo(id, val) {
            this.SET_STATE({
                module: 'workcenter',
                params: {
                    orderSelect: val,
                },
            });
            this.$router.push({
                path: '/panel/operating/linePosition',
                query: {
                    ...this.$route.query,
                    id,
                },
            });
        },
        open(item) {
            this.$refs[item].open();
        },
        btnPos(order, id) {
            this.$router.push({
                path: '/panel/postinglist',
                query: {
                    ...this.$route.query,
                    order,
                    id,
                }
            });
        },
    }
};
</script>

<style lang="stylus" scoped>
.wrap
    display flex
    justify-content space-between
    background-color #fff
    font-size 18px
    height 100%
    overflow auto

    &-body
        flex auto
        display flex
        flex-flow column nowrap

        .checkbox
            position absolute
            top 37.5px
            left 150px

            & >>> .el-checkbox__label
                font-size 18px

            & >>> .el-checkbox__inner
                height 20px
                width 20px

                &::after
                    height 10px
                    left 7px
                    border-width 2px

        .button
            position absolute
            top 25px
            right 50px
            height 50px

        .postingBtn
            position absolute
            top 100px
            right 160px
            height 50px

        h3
            $font-title()
            border-bottom 1px solid $color-decoration
            padding 35px 16px
            flex none
            font-size 18px
        &-contain
            flex auto
            flex-wrap wrap
            width 100%
            overflow hidden

            &-list
                display flex
                align-items center
                width 100%
                padding 16px
                position relative
                /*transition left .25s*/

                &:hover
                    background-color #e8f4ff
                .left
                    width 45px
                    height 45px
                    border-radius 50%
                    text-align center
                    color #fff
                    line-height 45px;
                .right
                    display flex
                    flex-wrap wrap
                    flex 1
                    margin-left 30px

                    span
                        display block
                        width 25%
                        padding-top 5px

                &.hide
                    left 0

            &-btnEdit,
            &-btnPos
                height 100%
                padding 16px 0
                border none
                color #fff
                font-weight 500
                font-size 18px
                width 100px
                position absolute
                top 0
                outline none

            &-btnEdit
                background $color-blue
                right -200px

            &-btnPos
                background $color-green
                right -100px

        .blue
            background-color #2b8cf1
        .red
            background-color #cc3c3c
        .gray
            background-color #536275
        .green
            background-color #0f8b71

.border
    border-bottom 1px solid $color-decoration
</style>

