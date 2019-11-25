<template lang="pug">
    ebrain-main.box
        ebrain-box
            .wrap
                .wrap-body
                    h3  【{{pn}}】{{wn}}
                    //- el-button.postingBtn.middle(
                    //-     type="primary"
                    //-     size="medium"
                    //-     @click="routeTo()") 工单过账
                    //- el-button.button.middle(
                    //-     type="primary"
                    //-     size="medium"
                    //-     @click="open('building')") 人工建单
                    .wrap-body-contain
                        .border(
                            v-for="(item, index) in orderList"
                            :key="item.orderNo"
                            @click="navigatorTo(item.id, item)")
                            .wrap-body-contain-list
                                .left(:class="{gray: item.state == 0, blue: item.state == 1,red:item.state == 3, green: item.state == 4 }") {{index + 1}}
                                .right
                                    span 生产工单号：{{item.orderNo}}
                                    span 料号：{{item.materialNo}}
                                    span 开始时间: {{item.beginTime}}
                                    span 明细编号: {{item.taskDetailNo}}
                                    span 物料名称：{{item.materialName}}
                                    span 数量：{{item.materialAmount}} {{item.materialUnit}}
                                    span 结束时间: {{item.completeTime}}
                                    span 状态：{{dict['orderStatus'][item.state]}}
        building(ref="building" @submit-dialog="queryOrderInfo")
</template>
<script>
import { deleteManual } from '@/utils/api';
import dict from '@/utils/dict';
import { mapState, mapActions, mapMutations } from 'vuex';
import building from '@/components/jobpoolDialog/building';
import SwiperItem from '@/components/SwiperItem';

export default {
    components: {
        building,
        SwiperItem,
    },
    props: {
        data: {
            type: Array,
            default: () => {},
        }
    },
    data() {
        return {
            jobpoolList: [],
            dict,
            moveX: 0,
            startX: 0,
            left: 'auto',
            currentItem: null,
            target: null,
        };
    },
    computed: {
        ...mapState('workcenter', {
            orderList: state => state.orderList,
        }),
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
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        navigatorTo(id, val) {
            this.SET_STATE({
                module: 'workcenter',
                params: {
                    orderSelect: val,
                },
            });
            this.queryOrderInfo(id);
            this.$router.push({
                path: '/panel/operating/linePosition',
                query: {
                    ...this.$route.query,
                    id,
                },
            });
        },
        routeTo(order, id) {
            this.$router.push({
                path: '/panel/posting',
                query: {
                    ...this.$route.query,
                    order,
                    id,
                }
            });
        },
        open(item) {
            this.$refs[item].open();
        },
        btnView() {
            this.open('building');
        },
        btnDel(id, canDel) {
            if (canDel === '1') {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    deleteManual(id).then(() => {
                        this.$message.success(`删除成功!`);
                    });
                });
            } else {
                this.$alert(`非手录工单,不允许删除!`, {
                    type: 'error'
                });
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.box
    position relative

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
        position relative

        .button
            position absolute
            top 25px
            right 50px
            height 50px

        .postingBtn
            position absolute
            top 25px
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
            overflow-x hidden
            overflow-y auto
            -webkit-overflow-scrolling touch
            position absolute
            top 95px
            bottom 0
            left 0
            right 0

            &-list
                display flex
                align-items center
                width 100%
                padding 16px
                position relative
                box-sizing border-box

                .left
                    width 45px
                    height 45px
                    border-radius 50%
                    text-align center
                    color #fff
                    line-height 45px
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
            &-btnDel
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
                right -100px

            &-btnDel
                background $color-red
                right -200px

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
