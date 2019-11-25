<template lang="pug">
    .wrap
        .wrap-body
            h3  工序中心
            .wrap-body-contain
                div(v-for="items in processlData"
                    @click="navigatorTo(items.processCode,items.processName)")
                    i.iconfont.iconMaterial-directive
                    span {{items.processName}}
            .no-data(v-if="processlData.length === 0") 暂无数据

</template>
<script>
import { processcenterList } from '@/utils/api';
export default {
    data() {
        return {
            processlData: [],
        };
    },
    mounted() {
        this.queryProcess();
    },
    methods: {
        queryProcess() {
            processcenterList().then(({ data, code }) => {
                if (code === 0) {
                    this.processlData = data.records;
                    let hash = {};
                    this.processlData = this.processlData.reduce(function(item, next) {
                        hash[next.processName] = hash[next.processName] ? '' : true && item.push(next);
                        return item;
                    }, []);
                }
            });
        },
        navigatorTo(id, name) {
            //   const seq = encodeURI(name);
            this.$router.push({
                path: 'workcenter',
                query: {
                    pc: id,
                    pn: name,
                }
            });
        }
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
            height 100%

        &-contain
            flex auto
            height 100%
            display flex
            flex-wrap wrap
            padding 0 32px
            padding-top 2%
            div
                display flex
                flex-direction column
                justify-content center
                align-items center
                background-color #f2f2f2
                width 17.5%
                height 180px
                margin-right 2.5%
                margin-bottom  2%
                border-radius 5px
                color:#888888
                i
                    font-size 60px
                    padding-bottom 15px
                span
                    font-size 18px
        .no-data
            text-align center
            line-height 100px
</style>

