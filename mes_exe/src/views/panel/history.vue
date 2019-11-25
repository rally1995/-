<template lang="pug">
ebrain-main
    ebrain-box
        .wrap
            .wrap-body
                h3.middle 生产批次过账信息（{{workcenter.orderNo}}）
                .wrap-body-span.middle
                    span 料号：{{workcenter.materialNo}}
                    span 物料名称：{{workcenter.materialName}}
                    span 数量：{{workcenter.materialAmount}}{{workcenter.materialUnit}}
        .wrap
            .wrap-body-contain
                .wrap-body-contain-list.hide(
                    v-for="(items,index) in jobpoolList"
                    :key='items.id'
                    @click="showPosting(items)")
                    .left(:class="{blue: items.state == 1, orange: items.state == 2, gray:items.state == 3}") {{index + 1}}
                    .right
                        span 料号：{{items.materialNo}}
                        span 物料名称：{{items.materialName}}
                        span 批次数量: {{items.realAmount}} {{items.materialUnit}}
                        span 过账状态: {{dict['state'][items.state]}}
                        span 过账时间: {{items.createTime}}
    posting(ref="posting" :code="code")
    not-posting(ref="notPosting" :code="code")
</template>
<script>
import { postingHistory } from '@/utils/api';
import { mapState, mapActions } from 'vuex';
import Posting from '@/components/postinglistHistory/Posting';
import notPosting from '@/components/postinglistHistory/NotPosting';
import dict from '@/utils/dict';

export default {
    components: {
        Posting,
        notPosting,
    },
    data() {
        return {
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
        prodBatchNo() {
            return this.$route.query.prodBatchNo;
        },
        orderId() {
            return this.$route.query.id;
        },
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    mounted() {
        this.queryPool();
    },
    methods: {
        ...mapActions('workcenter', ['queryOrderInfo']),
        queryPool() {
            postingHistory(
                this.workcenter.id,
                this.prodBatchNo,
            ).then(({ data }) => {
                this.jobpoolList = data;
            });
        },
        open(item) {
            this.$refs[item].open();
        },
        showPosting(code) {
            this.code = code;
            if (code.state === '2') {
                this.open('posting');
            } else if (code.state === '3') {
                this.open('notPosting');
            }
        }
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
                border-bottom  1px solid $color-decoration
                display flex
                align-items center
                width 100%
                padding 16px
                position relative
                left -232px
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
                        width 33.3%
                        padding-top 5px

                &.hide
                    left 0

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
</style>
