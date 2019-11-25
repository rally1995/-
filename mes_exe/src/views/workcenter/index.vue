<template lang="pug">
            .wrap
                .wrap-body
                    h3 {{pn}}
                    .wrap-body-contain
                        div(v-for="items in processlData"
                            @click="navigatorTo(items.workCenterName,items.workCenterCode)")
                            i.iconfont.icondata
                            div
                                span {{items.workCenterName}}
                                span {{items.workCenterCode}}
                    .no-data(v-if="processlData.length === 0") 暂无数据


</template>
<script>
import { mapMutations } from 'vuex';
import { getworkcenterList } from '@/utils/api';
export default {
    data() {
        return {
            processlData: [],
        };
    },
    computed: {
        pn() {
            return this.$route.query.pn;
        },
        pc() {
            return this.$route.query.pc;
        }
    },
    mounted() {
        this.queryProcess();
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        queryProcess() {
            getworkcenterList(this.pc).then(({ data, code }) => {
                if (code === 0) {
                    this.processlData = data.records;
                }
            });
        },
        // navigatorTo(name, code) {
        //     // const wn = encodeURI(name);
        //     this.$router.push({
        //         path: 'jobpool',
        //         query: {
        //             ...this.$route.query,
        //             wn: name,
        //             wc: code
        //         },
        //     });
        // }
        navigatorTo(name, code) {
            this.SET_STATE({
                module: 'workcenter',
                params: {
                    orderSelect: {},
                }
            });
            this.$router.push({
                path: 'panel/operating/linePosition',
                query: {
                    ...this.$route.query,
                    wn: name,
                    wc: code
                },
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
    border-radius  5px
    border 1px solid $color-decoration
    max-height 100%
    overflow auto
    &-body
        flex auto
        display flex
        flex-flow column nowrap
        h3
            $font-title()
            border-bottom 1px solid $color-decoration
            padding 16px 32px
            flex auto
        &-contain
            flex auto
            display flex
            flex-wrap wrap
            padding 0 32px
            padding-top 2%
            >div
                display flex
                flex-direction column
                justify-content center
                align-items center
                background-color #f2f2f2
                width 17.5%
                height 180px
                margin-bottom 2%
                border-radius 5px
                margin-right 2.5%
                color:#888888
                i
                    font-size 50px
                    padding-bottom 15px
                span
                    font-size 18px
                    display block
                    text-align center
        .no-data
            text-align center
            line-height 100px
</style>

