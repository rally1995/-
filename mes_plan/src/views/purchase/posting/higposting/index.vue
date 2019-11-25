<template lang="pug">
     ebrain-main.posting
        ebrain-frame.halfHeight(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    ref="table1"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    highlight-current-row
                    @row-dblclick="rowDblClickHandler"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize'
                    @selection-change="SelectChange")
        ebrain-frame.halfHeight(title="采购仓库退货过账明细")
            //- template(#tools)
            //-     ebrain-tools(:buttons="btnsDown")
            //-     .search(
            //-         :class="{hide:searchVisibleSon}")
            //-         ebrain-search(
            //-             :form="searchFormSon"
            //-             @search="searchDown"
            //-             @reset="resetDown")
            template(#table)
                ebrain-box-table(
                    ref="table2"
                    :loading="tableLoadingSon"
                    :pageSize="pageSizeSon"
                    :pageCurrent="currentPageSon"
                    :pageTotal="pageTotalSon"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    highlight-current-row
                    @current-change="CurrentChangeSon"
                    @page-change="ChangeCurrentSon"
                    @size-change='ChangeSizeSon'
                    @selection-change="SelectChangeSon")
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
    name: 'purposting',
    data() {
        return {
            btnsTop: [{
                label: '过账',
                click: () => this.posTing(),
                disabled: () => this.postingDisabled,
                className: 'iconfont iconPosting',
                permi: 'purchase_purchaseposting_posting',
                loading: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '复制',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '删除',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchVisible: true,
            searchForm: [{
                label: '收料凭证号',
                prop: 'prCertificateCode',
                value: '',
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                value: '',
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                value: '',
            }, {
                label: '状态',
                prop: 'postingStatus',
                value: '',
                type: 'select',
                option: {},
            }],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            tableColumn: [{
                label: '收料凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true
            }, {
                label: '过账类型',
                prop: 'postingType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_POSTING_DET_CHANGE_TYPE'][cell];
                },
            }, {
                label: '状态',
                prop: 'postingStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_POSTING_STATUS'][cell];
                },
            }, {
                label: '供应商编号',
                prop: 'lifnr',
                showOverflowTooltip: true
            }, {
                label: '供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true
            }, {
                label: '送货单号',
                prop: 'deliveryCode',
                showOverflowTooltip: true
            }, {
                label: '凭证号',
                prop: 'sapCertificateCode',
                showOverflowTooltip: true
            }, {
                label: '信息描述',
                prop: 'sapMsg',
                showOverflowTooltip: true
            }, {
                label: '过账时间',
                prop: 'sapLongTime',
                showOverflowTooltip: true
            }],
            parentRow: {},
            selectRows: [],
            conditionList: [],
            searchVisibleSon: [],
            searchFormSon: [],
            conditionListSon: [],
            tableLoadingSon: false,
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            tableDataSon: [],
            tableColumnSon: [{
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true
            }, {
                label: '物料',
                prop: 'matnr',
                showOverflowTooltip: true
            }, {
                label: '库存数量',
                prop: 'menge',
                showOverflowTooltip: true
            }, {
                label: '库存单位',
                prop: 'meins',
                showOverflowTooltip: true
            }, {
                label: '库存地点',
                prop: 'lgort',
                showOverflowTooltip: true
            }, {
                label: '批次(南通LOT号)',
                prop: 'charg',
                showOverflowTooltip: true
            }, {
                label: '收/发',
                prop: 'shkzg',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_POSTING_DET_SHKZG'][cell];
                },
            }, {
                label: '异动类型',
                prop: 'changeType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_POSTING_DET_CHANGE_TYPE'][cell];
                },
            }],
            selectSonRows: [],
            childrenRow: {},
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        postingDisabled() {
            const filterData = this.selectRows.some(v => v.postingStatus === '1');
            return this.selectRows.length === 0 || filterData;
        },
        writeOffDisabled() {
            // const filterData = this.selectRows.some(v => v.postingStatus === '0' )
            return this.selectSonRows.length === 0;
        }
    },
    mounted() {
        this.init();
    },
    activated() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('DIC_POSTING_STATUS'),
                this.queryDict('DIC_POSTING_TYPE'),
                this.queryDict('DIC_POSTING_DET_CHANGE_TYPE'),
                this.queryDict('DIC_POSTING_DET_SHKZG')]).then(() => {
                this.getData();
                this.searchForm[3].option = this.storeDict['DIC_POSTING_STATUS'];
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: [...this.conditionList],
            };
            params.conditionList.push({
                fieldName: 'postingType',
                operation: 'EQ',
                value: '13',
                joinType: 'AND',
            });
            this.$http.get(`/purchase/purchaseposting/page`, {
                params
            }).then(res => {
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        rowDblClickHandler(row, column, e) {
            this.parentRow = { ...row };
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = { ...row };
                this.getDataSon();
            }
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        SelectChange(selection) {
            this.selectRows = selection;
        },
        searchDown() {
            this.currentPageSon = 1;
            this.conditionListSon = [];
            this.searchFormSon.forEach(v => {
                if (v.value) {
                    this.conditionListSon.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.getDataSon();
        },
        getDataSon() {
            this.tableLoadingSon = true;
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'postingId',
                operation: 'EQ',
                value: this.parentRow['id'],
                joinType: 'AND',
            });
            this.$http.get(`/purchase/purchasepostingdet/page`, {
                params
            }).then((res) => {
                this.tableDataSon = res.data.records;
                this.pageTotalSon = res.data.total;
                this.tableLoadingSon = false;
            }).catch(() => {
                this.tableLoadingSon = false;
            });
        },
        resetDown() {
            this.searchFormSon.forEach(item => {
                item.value = '';
            });
        },
        CurrentChangeSon(row) {
            if (row) {
                this.childrenRow = { ...row };
            }
        },
        ChangeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        ChangeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        SelectChangeSon(selection) {
            this.selectSonRows = selection;
        },
        writeOff() {
            const ids = this.selectSonRows.map(v => v.id);
            this.$confirm('是否确定冲销?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.post('/purchase/purchaseposting/batchReversal', ids).then(() => {
                    this.getData();
                    this.parentRow = {};
                    this.selectRows = [];
                    this.$message.success('冲销成功');
                    this.$refs.table1.clearSelection();
                });
            });
        },
        posTing() {
            const ids = this.selectRows.map(v => v.id);
            this.btnsTop[0].loading = true;
            this.$confirm('是否确定过账?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.post('/purchase/purchaseposting/batchPostings', ids).then(({ code, msg }) => {
                    if (code === 0) {
                        this.$message.success('已过账');
                    } else if (code === 2) {
                        this.$message.warning(`${msg}`);
                    }
                    this.getData();
                    this.parentRow = {};
                    this.selectRows = [];
                    this.$refs.table1.clearSelection();
                    this.btnsTop[0].loading = false;
                }).catch(() => {
                    this.btnsTop[0].loading = false;
                });
            });
        }
    }
};
</script>
<style lang="stylus" scoped>
.posting
    & >>> .fr
        float right;

.search
  padding 14px 10px;
  background #f5f5f5;
  overflow hidden;
  box-sizing border-box;
  transition-duration 0.2s;
  height auto;

  &.hide
    padding-top: 0;
    padding-bottom: 0;
    height 0;
</style>
