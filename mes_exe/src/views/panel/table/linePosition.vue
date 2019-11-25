<template lang="pug">
    div
        h3.title 线边仓信息
        ebrain-table(
            :column="column"
            :data="data"
            :highlight-current-row="false")
</template>
<script>
export default {
    name: 'linePosition',
    data() {
        return {
            column: [{
                label: '工位编号',
                prop: 'stationNo',
            }, {
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '批次号',
                prop: 'materialBatchNo'
            }, {
                label: '数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }],
            data: [],
        };
    },
    computed: {
        wc() {
            return this.$route.query.wc;
        }
    },
    mounted() {
        this.getData();
        this.timer = setInterval(this.getData, 3000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.timer = null;
    },
    methods: {
        getData() {
            this.$http.get(`/productionexe/sidewarehouse/listMaterialBatchInfo/${this.wc}?size=9999`).then(({ data }) => {
                this.data = data;
            });
        }
    },
};
</script>
<style scoped lang="stylus">
div
    height 100%
    flex-flow column nowrap
.title
    margin 5px 10px
    padding 5px 10px
</style>
