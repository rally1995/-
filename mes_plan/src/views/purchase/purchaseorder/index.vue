<template lang="pug">
    ebrain-main.purchaseorder
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                //- ebrain-tools
                //-     button.fr(
                //-         @click="searchVisible = !searchVisible")
                //-         i.iconfont.iconsearch
                //-         |搜索
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    :default-sort = "{prop: 'aedat', order: 'descending'}"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="明细项目")
            template(#table)
                ebrain-table(
                    :default-sort = "{prop: 'ebelp', order: 'descending'}"
                    :tableLoading='tableLoadingDown'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    @changeCurrent="changeCurrent_down"
                    @changeSize='changeSize_down'
                    :pageSize='pageSize_down'
                    :currentPage='currentPage_down'
                    :pageTotal='pageTotal_down'
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon")
</template>
<script>
import dict from '@/utils/dict';
export default {
    name: 'index',
    data() {
        return {
            tableLoadingTop: false,
            tableLoadingDown: false,
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            tableColumnParent: [{           // 上表头
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: 'SAP采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购日期',
                prop: 'aedat',
                sortable: true,
                showOverflowTooltip: true,
            }, {
                label: 'SAP供应商编号',
                prop: 'lifnr',
                showOverflowTooltip: true,
            }, {
                label: 'SAP工厂',
                prop: 'werks',
                showOverflowTooltip: true,
            }, {
                label: 'SAP供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: 'SAP项目号',
                prop: 'ebelp',
                sortable: true,
                showOverflowTooltip: true,
            }, {
                label: 'SAP物料料号',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: 'SAP物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购单位',
                prop: 'meins2',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购数量（采购单位）',
                prop: 'menge',
                showOverflowTooltip: true,
            }, {
                label: 'SAP库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购数量（库存单位）',
                prop: 'menge1',
                showOverflowTooltip: true,
            }, {
                label: 'SAP仓库',
                prop: 'lgort',
                showOverflowTooltip: true,
            }, {
                label: 'SAP库存类型',
                prop: 'insmk',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.InventoryType[cell];
                },
            }, {
                label: 'SAP预期交货日期',
                prop: 'eindt',
                showOverflowTooltip: true,
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentPage_down: 1,
            pageSize_down: 20,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            pageTotal_down: 0,
            routeCode: '',
            searchVisible: true,
            conditionList: [],
            searchForm: [{
                label: 'SAP采购订单号',
                prop: 'ebeln',
                value: '',
            }, {
                label: '供应商编号',
                prop: 'lifnr',
                value: '',
            }],
            // {
            // label: 'SAP采购日期',
            // prop: 'aedat',
            // value: '2019-09-06 12:30:00',
            // type: 'datetime',
            // },
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
    },
    created() {
        this.getDataParent();
    },
    methods: {
        reset() {
            this.searchForm.forEach(v => {
                v.value = '';
            });
        },
        search() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getDataParent();
            this.tableDataSon = [];
            this.pageSize_down = 20;
            this.currentPage_down = 1;
            this.pageTotal_down = 0;
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/purchase/purchaseorder/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                }
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon(row) {
            const conditionList = [];
            conditionList.push({
                fieldName: 'ebeln',
                operation: 'EQ',
                value: row.ebeln,
                joinType: 'AND',
            });
            this.tableLoadingDown = true;
            this.$http.get(`/purchase/purchaseorderdet/page`, {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                    conditionList
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
            }).catch(() => {
                this.tableLoadingDown = true;
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDataSon();
        },
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDataSon();
        },
    }
};
</script>

<style scoped lang="stylus">
.purchaseorder
    & >>> .el-dialog
            margin-top 4vh!important

    & >>> .fr
        float left

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0
</style>