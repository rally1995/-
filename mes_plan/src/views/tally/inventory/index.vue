<template lang="pug">
    ebrain-main.inventory
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="getData"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoading"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-click="getDataSon"
                    @changeCurrent="changeCurrentParent"
                    @changeSize="changeSizeParent"
                    @selection-change="changeHandler")
        ebrain-frame(title="交货单物料明细")
            template(#table)
                ebrain-table(
                    :isShow="false"
                    :tableLoading="tableLoadingSon"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    :pageSize="pageSizeSon"
                    :currentPage="currentPageSon"
                    :pageTotal="pageTotalSon"
                    :row-class-name="tableRowClassName"
                    @changeCurrent="changeCurrentSon"
                    @changeSize="changeSizeSon")
                    template(#batch)
                        el-table-column(label="出货物料批次" width="150px")
                            template(v-slot="{row, $index}")
                                el-select(v-model="row.lockBatches['batchID']" :placeholder="row.lockBatches[0].batchID" v-if="row.lockBatches !== null")
                                    el-option(
                                        v-for="(item, index) in row.lockBatches"
                                        :label="item.batchID"
                                        :value="item.batchID"
                                        :key="index")
                                span(v-else)
</template>
<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import dict from '@/utils/dict';
export default {
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            searchForm: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                value: '',
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: {},
            }],
            btnsTop: [{
                label: '锁定',
                click: () => this.locking(),
                className: 'iconfont iconpassword_all',
                disabled: () => !this.lockDisabled,
                permi: 'tallymanager_TallyPrepare_lock',
            }, {
                label: '取消锁定',
                click: () => this.lockCancel(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.unlockDisabled,
                permi: 'tallymanager_TallyPrepare_unlock',
            }, {
                label: '打印单据',
                click: () => this.printVoucher(),
                className: 'iconfont iconstatus-Printing',
                disabled: () => this.printDisabled,
                permi: 'tallymanager_TallyPrepare_print',
            }, {
                label: '出库领料',
                click: () => this.OutMater(),
                className: 'iconfont iconTo-be-producedorder',
                disabled: () => this.OutMaterDisabled,
                permi: 'tallymanager_TallyPrepare_picking',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchVisible: true,
            tableLoading: false,
            currentRowKey: '',
            tableData: [],
            dialogSearchForm: {},
            tableColumn: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                showOverflowTooltip: true,
            }, {
                label: '备货单号',
                prop: 'notesPrepareNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '客户送达方',
                prop: 'customService',
                showOverflowTooltip: true,
            }, {
                label: '客户送达地址',
                prop: 'customServiceAddress',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }, {
                label: '是否打印',
                prop: 'printStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    if (row.printStatus >= 1) {
                        return '是';
                    } else {
                        return '否';
                    }
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            muliption: [],
            tableLoadingSon: false,
            currentRowKeySon: '',
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            isblo: false,
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPageSon - 1) * this.pageSizeSon + index + 1;
                },
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同项目号',
                prop: 'saleItemNo',
                showOverflowTooltip: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '库存状态',
                prop: 'stockStatus',
                showOverflowTooltip: true,
            }, {
                label: '销售合同数量',
                prop: 'saleNumber',
                showOverflowTooltip: true,
            }, {
                label: '本次出货数量',
                prop: 'crtDeliverNumber',
                showOverflowTooltip: true,
            }, {
                slot: 'batch'
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '运点',
                prop: 'transportPoint',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'isSatisfied',
                formatter: (row, column, cell) => {
                    return dict.isSatisfied[cell];
                },
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        lockDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return item && item.noteStatus === 300 && this.isblo;
        },
        unlockDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || item.noteStatus !== 301 || item.printStatus !== 0;
        },
        OutMaterDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || (item && item.printStatus === 0 || item.noteStatus === 303);
        },
        printDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || item.noteStatus === 300;
        }
    },
    watch: {
        currentRowKey(val) {
            this.isblo = false;
        }
    },
    mounted() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 300: obj['300'], 301: obj['301'], 303: obj['303'] };
            this.searchForm[1].option = params;
        });
    },
    activated() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 300: obj['300'], 301: obj['301'], 303: obj['303'] };
            this.searchForm[1].option = params;
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: [],
            };
            this.searchForm.forEach(v => {
                if (v.value) {
                    params.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.$http.get(`/tallymanager/TallyPrepare/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        changeCurrentParent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSizeParent(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeHandler(selection) {
            this.muliption = selection;
        },
        close() {
            this.dialogVisible = false;
        },
        locking() {
            this.$confirm('是否确认锁定?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.get(`/tallymanager/TallyPrepare/lock/${this.currentRowKey}`).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '锁定成功!',
                        type: 'success'
                    });
                });
            });
        },
        lockCancel() {
            this.$confirm('是否确认取消锁定?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.get(`/tallymanager/TallyPrepare/unlock/${this.currentRowKey}`).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '解锁成功!',
                        type: 'success'
                    });
                });
            });
        },
        printVoucher() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if ((item.printStatus >= 0) && (item.printStatus < 3)) {
                this.$http.get(`/tallymanager/TallyPrepare/print /${this.currentRowKey}`).then(() => {
                    this.$message.success('打印成功');
                    this.getData();
                });
            } else {
                this.$confirm('打印已经超过三次,是否需要继续打印', {
                    type: 'warning',
                }).then(() => {
                    this.$http.get(`/tallymanager/TallyPrepare/print /${this.currentRowKey}`).then(() => {
                        this.$message.success('打印成功');
                        this.getData();
                    });
                }).catch(() => {
                    this.$message.warning('已取消');
                });
            }
        },
        OutMater() {
            this.$confirm('是否确定出库领料?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.get(`/tallymanager/TallyPrepare/picking/${this.currentRowKey}`).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '出库领料成功!',
                        type: 'success'
                    });
                    // this.currentRowKey = '';
                });
            });
        },
        getDataSon() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.tableDataSon = [];
            this.$http.get(`/tallymanager/tallydeliveryde/pageDelivery/${item.notesDeliveryNo}`).then(({ code, data }) => {
                this.tableDataSon = data.records;
                this.isblo = this.tableDataSon.every(v => v.isSatisfied !== '0');
            });
        },
        changeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        changeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        // 错误行变色
        tableRowClassName({ row, rowIndex }) {
            if (row.isSatisfied === '0') return 'warning-row';
        },
    }
};

</script>
<style lang="stylus" scoped>
.inventory
    & >>> .fr
        float right
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

.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        height 150px!important
</style>

