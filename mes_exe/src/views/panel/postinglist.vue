<template lang="pug">
ebrain-main
        ebrain-box
            .wrap
                .wrap-body
                    h3.middle 工单信息（{{workcenter.orderNo}}）
                    .wrap-body-span.middle
                        span 料号：{{workcenter.materialNo}}
                        span 物料名称：{{workcenter.materialName}}
                        span 数量：{{workcenter.materialAmount}}{{workcenter.materialUnit}}
                .wrap-button.middle
                    el-button(
                        type="primary"
                        size="medium"
                        @click="open('conditionQuery')") 条件查询
            .wrap
                .wrap-body-contain
                    swiper-item.border(
                        v-for="(items,index) in jobpoolList"
                        :key='items.id'
                        :btn-name="btnName(items.state)"
                        :btn-click="btnClick(items)"
                        :btn-color="btnColor(items.state)")
                        .wrap-body-contain-list
                            .left(:class="{blue: items.state == 0, orange: items.state == 1, gray: items.state == 2, red: items.state == 3 }") {{index + 1}}
                            .right
                                span 生产批次：{{items.prodBatchNo}}
                                span 过账状态：{{dict['postingState'][items.state]}}
                                span 批次数量: {{items.realAmount}} {{items.materialUnit}}
        not-posting(ref="notposting" :code="code")
        posting(ref="posting" :code="code")
        condition-query(ref="conditionQuery" @submit-dialog="queryPool")
</template>
<script>
import { prodBatch, applyById } from '@/utils/api';
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';
import conditionQuery from '@/components/postinglistDialogs/conditionQuery';
import notPosting from '@/components/postinglistDialogs/NotPosting';
import SwiperItem from '@/components/SwiperItem';
import posting from '@/components/postinglistDialogs/Posting';

export default {
    components: {
        conditionQuery,
        notPosting,
        posting,
        SwiperItem,
    },
    data() {
        return {
            postingId: '',
            code: {},
            jobpoolList: [],
            dict,
            moveX: 0,
            startX: 0,
            left: 'auto',
            currentItem: null,
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderId() {
            return this.$route.query.id;
        },
        order() {
            return this.$route.query.order;
        },
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    mounted() {
        this.queryPool();
        this.queryOrderInfo(this.workcenter.id);
    },
    methods: {
        ...mapActions('workcenter', ['queryOrderInfo']),
        queryPool(val) {
            let obj = {
                orderId: this.workcenter.id,
            };
            if (val) {
                obj.prodBatchNo = val.prodBatchNo;
                obj.state = val.checkList.toString();
            }
            prodBatch(obj).then(({ data }) => {
                // const random = () => {
                //     let r = Math.random() * 3;
                //     r = Math.round(r);
                //     return r;
                // };
                this.jobpoolList = data;
            });
        },
        open(item) {
            this.$refs[item].open();
        },
        btnPos(code) {
            this.code = code;
            this.open('notposting');
        },
        destroy(code) {
            this.code = code;
            this.open('posting');
        },
        viewHistory(postingId, prodBatchNo) {
            this.$router.push({
                path: '/panel/history',
                query: {
                    ...this.$route.query,
                    postingId,
                    prodBatchNo,
                }
            });
        },
        reSent(id) {
            this.$alert('是否重新发送SAP过账？', {
                type: 'warning',
            }).then(() => {
                applyById(id).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success('发送成功!');
                    }
                });
            });
        },
        btnName(state) {
            switch (state) {
                case '0':
                    return ['过账'];
                case '1':
                    return ['重新发送', '查看编辑'];
                case '2':
                    return ['查看历史', '冲销'];
                case '3':
                    return ['过账', '查看历史'];
            }
        },
        btnClick(items) {
            switch (items.state) {
                case '0':
                    return [() => this.btnPos(items)];
                case '1':
                    return [() => this.reSent(items.postingId), () => this.btnPos(items)];
                case '2':
                    return [() => this.viewHistory(items.postingId, items.prodBatchNo), () => this.destroy(items)];
                case '3':
                    return [() => this.btnPos(items), () => this.viewHistory(items.postingId, items.prodBatchNo)];
            }
        },
        btnColor(state) {
            switch (state) {
                case '0':
                    return ['#1eae81'];
                case '1':
                    return ['#f4aa3b', '#1eae81'];
                case '2':
                    return ['#2d8cf0', '#ff3300'];
                case '3':
                    return ['#1eae81', '#2d8cf0'];
            }
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
    overflow auto

    &-button
        position absolute
        top 50px
        right 70px

        button
            height 50px

    &-body
        flex auto
        display flex
        flex-flow column nowrap
        border-bottom 1px solid #dedede

        h3
            $font-title()
            border-bottom 1px solid $color-decoration
            padding 25px 16px
            flex none
            font-size 18px
            width 50%

        .middle
            padding 25px 16px

        &-span
            flex auto
            padding 0 16px

            & > * + *
                margin-left 48px

        &-contain
            flex auto
            flex-wrap wrap
            width 50%
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

            &-btn
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

                for i in 1 2 3
                    &:nth-child({i})
                        right -1 * 100 * i px

.blue
    background-color #2b8cf1
.red
    background-color #cc3c3c
.gray
    background-color #536275
.green
    background-color #0f8b71
.orange
    background-color #f4aa3b

.border
    border-bottom 1px solid $color-decoration
</style>
