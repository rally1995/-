<template lang="pug">
    ebrain-main.pick
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
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
                ebrain-table.table_batch(
                    :tableLoading="tableLoadingSon"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :row-class-name="tableRowClassName"
                    :column="tableColumnSon"
                    :pageSize="pageSizeSon"
                    :currentPage="currentPageSon"
                    :pageTotal="pageTotalSon"
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
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            top="2vh"
            :expandVisible="collapse"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            template(#custoServe="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="客户送达方" :required="true" prop="customService")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" :disabled="isClick" @click="dialogSearchForm={};getCustoServe()"  icon="iconfont iconsearch")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="拣配单物料明细")
                template(#tools)
                    ebrain-tools(:buttons="btnsDown")
                template(#table)
                    ebrain-table.table_dialog(
                        :tableLoading="tableLoadingDatail"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyDatail"
                        row-key="id"
                        :row-class-name="tableRowClassName"
                        :data="tableDataDetail"
                        :column="tableColumnDatail"
                        :pageSize="pageSizeDatail"
                        :currentPage="currentPageDatail"
                        :pageTotal="pageTotalDatail"
                        @changeCurrent="changeCurrentSon"
                        @changeSize="changeSizeSon")
                        template(#batchDetail)
                            el-table-column(label="出货物料批次")
                                template(v-slot="{row, $index}")
                                    el-select(v-model="row.lockBatches['batchID']" :placeholder="row.lockBatches[0].batchID" v-if="row.lockBatches !== null")
                                        el-option(
                                            v-for="(item, index) in row.lockBatches"
                                            :label="item.batchID"
                                            :value="item.batchID"
                                            :key="index")
                                    span(v-else)
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatSerVice"
            :column="tableColumnSerVice"
            :tableLoading="submitLoadingSerVice"
            :visible.sync="dialogVisibleSerVice"
            :pageSize="pageSizeSerVice"
            :currentPage="currentPageSerVice"
            :pageTotal="pageTotalSerVice"
            :disabled="!currentRowKeySerVice"
            @changeCurrent="changeCurrentSerVice"
            @changeSize="changeSizeSerVice"
            @search="searchSerVice"
            @resetDialog="resetSerVice"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeySerVice"
            @submit="submitFormSerVice")
        ebrain-dialog(
            :visible.sync="dialogVisibleBatch"
            @submit="submitBatch"
            :isCancel="false"
            :isClick="islook"
            :form.sync="dialogFormBatch")
            ebrain-frame
                template(#table)
                    ebrain-table.table_dialog(
                        :isShow="false"
                        :tableLoading="tableLoadingBatch"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyBatch"
                        row-key="id"
                        ref="table"
                        @cell-change="tableEdit"
                        :row-class-name="tableDialogClassName"
                        :data="tableDataBatch"
                        :column="tableColumnBatch"
                        :pageSize="pageSizeBatch"
                        :currentPage="currentPageBatch"
                        :pageTotal="pageTotalBatch"
                        @selection-change="changeHandlerDialog"
                        @changeCurrent="changeCurrentBatch"
                        @changeSize="changeSizeBatch")
            template(#isfooter)
                el-button(type="primary" @click="sysChoose" :disabled="islook") 系统选择
                el-button(type="primary" @click="clearAll" :disabled="islook") 清空
</template>
<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import dict from '@/utils/dict';
import * as _ from 'lodash';
import moment from 'moment';
export default {
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            searchForm: [{
                label: '交货单',
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
                label: '开始拣配/编辑',
                click: () => this.startPick(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.addDisabled,
                permi: 'tallymanager_tallypicking_pickOrMod',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.addDisabled,
                permi: 'tallymanager_tallypicking_dels',
            }, {
                label: '满足备货',
                click: () => this.satisFaction(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.satisDisabled,
                permi: 'tallymanager_tallypicking_fulfill_orders',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '选择物料批次',
                click: () => this.selectBatch(),
                disabled: () => this.chooseDiasbled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }],
            collapse: false,
            searchVisible: true,
            tableLoading: false,
            currentRowKey: '',
            tableData: [],
            isClick: false,
            originMount: '',
            dialogSearchForm: {},
            enterType: '',
            pickObj: {},
            multipDialog: [],
            multiption: [],
            noteStatus: 200,
            tableDataDetail: [],
            tableColumn: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                showOverflowTooltip: true,
            }, {
                label: '拣配单号',
                prop: 'notesPickingNo',
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '销售合同',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            dialogType: '',
            pageTotal: 0,
            muliption: [],
            tableLoadingSon: false,
            currentRowKeySon: '',
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            isLoading: false,
            tableColumnSon: [{
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
                slot: 'batch',
                // label: '出货物料批次',
                // prop: 'lockBatches',
                // showOverflowTooltip: true,
            }, {
                label: '托盘数',
                prop: 'trayNumber',
                showOverflowTooltip: true,
            }, {
                label: '净重',
                prop: 'netWeight',
                showOverflowTooltip: true,
            }, {
                label: '毛重',
                prop: 'grossWeight',
                showOverflowTooltip: true,
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
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            batch: '',
            dialogForm: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                value: '',
                disabled: true,
            }, {
                label: '拣配单编号',
                prop: 'notesPickingNo',
                value: '',
                disabled: true,
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                value: '',
                disabled: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                value: '',
                disabled: true,
            }, {
                label: '客户送达方',
                prop: 'customService',
                value: '',
                slot: 'custoServe'
            }, {
                label: '客户送达地址',
                prop: 'customServiceAddress',
                value: '',
                disabled: true,
            }, {
                label: '分销渠道',
                prop: 'saleChannel',
                value: '',
                type: 'select',
                required: true,
                option: () => this.storeDict['DIC_TALLY_DISTRIBUTION_CHANNELS '],
            }, {
                label: '发运方式',
                prop: 'shipmentType',
                type: 'select',
                value: '',
                required: true,
                option: () => this.storeDict['DIC_TALLY_SHIPPING_METHOD'],
            }, {
                label: '发货日期',
                prop: 'deliveryDate',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_TALLY_STATUS'],
                disabled: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '备注',
                type: 'textarea',
                prop: 'remark',
                value: '',
            }],
            tableLoadingDatail: false,
            currentRowKeyDatail: '',
            tableDataDatail: [],
            pageSizeDatail: 20,
            currentPageDatail: 1,
            pageTotalDatail: 0,
            tableColumnDatail: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPageDatail - 1) * this.pageSizeDatail + index + 1;
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
                label: '采购订单号',
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
                // label: '批次号',
                // prop: 'deliverableNumber',
                // showOverflowTooltip: true,
                slot: 'batchDetail',
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
            tableDatSerVice: [],
            submitLoadingSerVice: false,
            dialogVisibleSerVice: false,
            pageSizeSerVice: 20,
            currentPageSerVice: 1,
            pageTotalSerVice: 0,
            currentRowKeySerVice: '',
            tableColumnSerVice: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '客户送达方',
                prop: 'customService',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '客户送达地址',
                prop: 'customServiceAddress',
                showOverflowTooltip: true,
            }, {
                label: '客户送达地址状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }],
            dialogVisibleBatch: false,
            tableLoadingBatch: false,
            currentRowKeyBatch: '',
            pageSizeBatch: 20,
            currentPageBatch: 1,
            pageTotalBatch: 0,
            tableDataBatch: [],
            tableDataOrigin: [],
            islook: false,
            saveLoading: false,
            tableColumnBatch: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
                selectable: () => {
                    if (this.noteStatus !== 200) return 0;
                    else return 1;
                }
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '选择数量',
                prop: 'pickStockNumber',
                showOverflowTooltip: true,
                editable: true,
            }, {
                label: '批次',
                prop: 'meterielBatch',
                showOverflowTooltip: true,
            }, {
                label: '可用库存数',
                prop: 'validStockNumber',
                showOverflowTooltip: true,
            }, {
                label: '仓库号',
                prop: 'storeCode',
                showOverflowTooltip: true,
            }, {
                label: '仓库类型',
                prop: 'storeType',
                showOverflowTooltip: true,
            }, {
                label: '仓位',
                prop: 'storeLocation',
                showOverflowTooltip: true,
            }, {
                label: '托盘',
                prop: 'tray',
                showOverflowTooltip: true,
            }, {
                label: '生产日期',
                prop: 'productDate',
                showOverflowTooltip: true,
            }, {
                label: '净重',
                prop: 'netWeight',
                showOverflowTooltip: true,
            }, {
                label: '毛重',
                prop: 'grossWeight',
                showOverflowTooltip: true,
            }],
            //  {
            //     label: '仓库位置',
            //     prop: 'crtDeliverNumber',
            //     value: '',
            //     disabled: true,
            // },
            dialogFormBatch: [{
                label: '物料料号',
                prop: 'materielNo',
                value: '',
                disabled: true,
            }, {
                label: '本次出货数量',
                prop: 'crtDeliverNumber',
                value: '',
                disabled: true,
            }, {
                label: '可用库存数量',
                prop: 'validStockNumber',
                value: '',
                disabled: true,
            }, {
                label: '未清数量',
                prop: 'uneliQuantity',
                value: '',
                disabled: true,
            }, {
                label: '状态',
                prop: 'isSatisfied',
                value: '',
                type: 'select',
                option: dict.isSatisfied,
                disabled: true,
            }],
            conditionList: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        btnsForm() {
            let arr =  [{
                label: '保存',
                click: () => this.saveData(),
                disabled: () => this.saveDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallypicking_edit',
                loading: this.saveLoading,
            }, {
                label: '提交',
                click: () => this.submitParent(),
                disabled: () => this.subDisabled,
                className: 'iconfont iconstatus-Submission',
                permi: 'tallymanager_tallypicking_commit',
                loading: this.isLoading,
            }, {
                label: '关闭',
                click: () => this.close(),
                className: 'iconfont iconClose-',
                permi: false,
            }];
            if (this.dialogForm[9].value === '200') {
                arr[1] = {
                    label: '提交',
                    click: () => this.submitParent(),
                    disabled: this.subDisabled,
                    loading: this.isLoading,
                    className: 'iconfont iconstatus-Submission',
                    permi: 'tallymanager_tallypicking_commit',
                };
            } else {
                arr[1] = {
                    label: '取消备货',
                    click: () => this.disAll(),
                    loading: this.isLoading,
                    className: 'iconfont iconstatus-Refresh',
                    permi: 'tallymanager_tallypicking_cancel',
                };
            }
            return arr;
        },
        addDisabled() {
            return !this.currentRowKey;
        },
        saveDisabled() {
            return this.isClick;
        },
        delDisabled() {
            return this.multiption.length === 0;
        },
        subDisabled() {
            const isBol = this.tableDataDetail.every(v => {
                if (v.lockBatches === null) return true;
                else return false;
            });
            return this.tableDataDetail.length === 0 || (JSON.stringify(this.pickObj).length !== 0 && (this.pickObj['customService'] === null || this.pickObj['customService'] === '')) || isBol;
        },
        chooseDiasbled() {
            return !this.currentRowKeyDatail || (JSON.stringify(this.pickObj).length !== 0 && (this.pickObj['customService'] === null || this.pickObj['customService'] === ''));
        },
        satisDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || item.noteStatus !== 203;
        },
    },
    watch: {
        dialogVisibleSerVice(val) {
            if (!val) {
                this.changeCurrentSerVice = 1;
                this.tableDatSerVice = [];
                this.getData();
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.noteStatus = 200;
                this.currentRowKeyDatail = '';
                this.dialogType = '';
                this.currentPageDatail = 1;
                this.pageSizeDatail = 20;
                this.getDataSon();
            } else {
                this.dialogType = 'edit';
            }
        },
        dialogVisibleBatch(val) {
            if (!val) {
                this.tableDataBatch = [];
            }
        },
        noteStatus(val) {
            if (val !== 200 && val !== '') {
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                });
                this.isClick = true;
            } else {
                this.dialogForm[4].disabled = false;
                this.dialogForm[6].disabled = false;
                this.dialogForm[7].disabled = false;
                this.dialogForm[11].disabled = false;
                this.isClick = false;
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS'),
            this.queryDict('DIC_TALLY_DISTRIBUTION_CHANNELS '),
            this.queryDict('DIC_TALLY_SHIPPING_METHOD')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 200: obj['200'], 203: obj['203'] };
            this.searchForm[1].option = params;
        });
    },
    activated() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS'),
            this.queryDict('DIC_TALLY_DISTRIBUTION_CHANNELS '),
            this.queryDict('DIC_TALLY_SHIPPING_METHOD')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 200: obj['200'], 203: obj['203'] };
            this.searchForm[1].option = params;
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        searchTop() {
            this.conditionList = [];
            this.currentPage = 1;
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
            this.tableDataSon = [];
            this.pageSizeSon = 20;
            this.currentPageSon = 1;
            this.pageTotalSon = 0;
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: v.value,
            //             joinType: 'AND',
            //         });
            //     }
            // });
            this.$http.get(`/tallymanager/tallypicking/page`, {
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
        // 开始拣配
        startPick() {
            this.dialogVisible = true;
            this.$http.post(`tallymanager/tallypicking/pickingOrMod/${this.currentRowKey}`).then(({ code, data }) => {
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
                this.$refs.dialog.$refs.form.resetFields();
                this.getDataSon();
                this.noteStatus = data.noteStatus;
                this.pickObj = data;
            });
        },
        delRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (item.noteStatus !== 200) {
                this.$alert('已提交状态不可删除', {
                    type: 'warning',
                });
                return;
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallypicking/removeByIds', {
                    data: [this.currentRowKey],
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        // 满足备货
        satisFaction() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.$confirm('是否确认备货?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.post(`/tallymanager/tallypicking/updateNoteStatus/${item.notesDeliveryNo}`).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.getDataSon();
                    this.$message({
                        message: '满足备货成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
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
            this.multiption = selection;
        },
        close() {
            this.dialogVisible = false;
        },
        getDataSon() {
            let params = {};
            if (this.dialogType === '') {
                params = {
                    current: this.currentPageSon,
                    size: this.pageSizeSon,
                };
            } else {
                params = {
                    current: this.currentPageDatail,
                    size: this.pageSizeDatail,
                };
            }
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.$http.get(`/tallymanager/tallydeliveryde/pageDelivery/${item.notesDeliveryNo}`, { params }).then(({ code, data }) => {
                if (this.dialogType === '') {
                    this.tableDataSon = data.records;
                    this.pageTotalSon = data.total;
                } else {
                    this.tableDataDetail = data.records;
                    this.pageTotalDatail = data.total;
                }

            });
        },
        changeCurrentSon(val) {
            if (this.dialogType === '') {
                this.currentPageSon = val;
                this.getDataSon();
            } else {
                this.currentPageDatail = val;
                this.getDataSon();
            }

        },
        changeSizeSon(val) {
            if (this.dialogType === '') {
                this.pageSizeSon = val;
                this.currentPageSon = 1;
                this.getDataSon();
            } else {
                this.pageSizeDatail = val;
                this.currentPageDatail = 1;
                this.getDataSon();
            }

        },
        // 客户送达方列表
        getCustoServe() {
            this.dialogVisibleSerVice = true;
            const params = {
                current: this.currentPageSerVice,
                size: this.pageSizeSerVice,
                conditionList: [{
                    fieldName: 'status',
                    value: 1,
                    operation: 'EQ',
                }],
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.submitLoadingSerVice = true;
            this.$http.get(`/tallymanager/tallycustom/page`, { params }).then(res => {
                this.tableDatSerVice = res.data.records;
                this.pageTotalSerVice = res.data.total;
                this.submitLoadingSerVice = false;
            }).catch(() => {
                this.submitLoadingSerVice = false;
            });
        },
        changeCurrentSerVice(val) {
            this.currentPageSerVice = val;
            this.getCustoServe();
        },
        changeSizeSerVice(val) {
            this.pageSizeSerVice = val;
            this.currentPageSerVice = 1;
            this.getCustoServe();
        },
        searchSerVice(form) {
            this.currentPageSerVice = 1;
            this.dialogSearchForm = form;
            this.getCustoServe();
        },
        resetSerVice(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormSerVice() {
            const item = this.tableDatSerVice.find(v => v.id === this.currentRowKeySerVice);
            this.dialogForm[4].value = item.customService;
            this.dialogForm[5].value = item.customServiceAddress;
            this.dialogVisibleSerVice = false;
        },
        saveData() {
            this.$refs.dialog.$refs.form.validate(valid => {
                if (valid) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        if (v.prop === 'noteStatus') obj[v.prop] = Number(v.value);
                        else obj[v.prop] = v.value;
                    });
                    this.noteStatus = obj.noteStatus;
                    obj.id = this.currentRowKey;
                    obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                    this.saveLoading = true;
                    this.$http.put(`/tallymanager/tallypicking/updateById`, obj).then(({ code, data }) => {
                        this.submitId = data.id;
                        this.$message.success('修改成功');
                        this.getData();
                        this.startPick();
                        this.saveLoading = false;
                    }).catch(() => {
                        this.saveLoading = false;
                    });
                }
            });
        },
        // 提交
        submitParent() {
            this.isLoading = true;
            this.$http.post(`/tallymanager/tallypicking/commitTallyPick/${this.currentRowKey}`).then(({ code, data }) => {
                this.$message.success('提交成功');
                this.getData();
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
                this.noteStatus = data.noteStatus;
                this.isLoading = false;
            }).catch(() => {
                this.isLoading = false;
            });
        },
        // 取消拣配
        disAll() {
            this.isLoading = true;
            this.$http.post(`/tallymanager/tallypicking/cancelTallyPick/${this.currentRowKey}`).then(({ code, data }) => {
                this.$message.success('取消成功');
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
                this.noteStatus = data.noteStatus;
                this.isLoading = false;
                this.getData();
            }).catch(() => {
                this.isLoading = false;
            });
        },
        getBatch() {
            this.islook = false;
            const itemParent = this.tableData.find(v => v.id === this.currentRowKey);
            const item = this.tableDataDetail.find(v => v.id === this.currentRowKeyDatail);
            const params = {
                notesDeliveryNo: itemParent.notesDeliveryNo,
                notesPickingNo: itemParent.notesPickingNo,
                saleItemNo: item.saleItemNo,
                saleNo: item.saleNo,
            };
            return this.$http.post(`/tallymanager/tallypickingmt/listWmsVO`, null, {
                data: params
            }).then(res => {
                this.tableDataBatch = res.data;
                let sum = 0;
                let ChooseQuantity = 0;
                this.tableDataBatch.forEach(v => {
                    sum += v.validStockNumber;
                    ChooseQuantity += v.pickStockNumber;
                });
                this.dialogFormBatch[2].value = sum;
                this.dialogFormBatch[3].value = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
                this.originMount = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
            });

        },
        looKBatch() {
            this.islook = true;
            const item = this.tableDataDetail.find(v => v.id === this.currentRowKeyDatail);
            const params = {
                size: 999,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'deliveryDeId',
                operation: 'EQ',
                value: item.id,
            });
            this.$http.get(`/tallymanager/tallypickingmt/page`, {
                params
            }).then(res => {
                this.tableDataBatch = res.data.records;
                let sum = 0;
                let ChooseQuantity = 0;
                this.tableDataBatch.forEach(v => {
                    sum += v.validStockNumber;
                    ChooseQuantity += v.pickStockNumber;
                });
                this.dialogFormBatch[2].value = sum;
                this.dialogFormBatch[3].value = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
                this.originMount = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
            });
        },
        // 选择物料批次
        selectBatch() {
            this.dialogVisibleBatch = true;
            const item = this.tableDataDetail.find(v => v.id === this.currentRowKeyDatail);
            this.dialogFormBatch.forEach(v => {
                if (v.prop === 'isSatisfied') v.value = item[v.prop].toString();
                else v.value = item[v.prop];
            });
            if (this.noteStatus !== 200) this.looKBatch();
            else this.getBatch();
        },
        changeCurrentBatch(val) {
            this.currentPageBatch = val;
            this.selectBatch();
        },
        changeSizeBatch(val) {
            this.pageSizeBatch = val;
            this.currentPageBatch = 1;
            this.selectBatch();
        },
        // 错误行变色
        tableRowClassName({ row, rowIndex }) {
            if (row.isSatisfied === '0') return 'warning-row';
        },
        tableDialogClassName({ row, rowIndex }) {
            if (Number(row.pickStockNumber) > Number(row.validStockNumber)) {
                return 'warning-row';
            }
        },
        // 编辑表格
        tableEdit(value, row, head) {
            if (this.noteStatus !== 200) {
                this.$alert('已提交状态不可编辑', {
                    type: 'warning',
                });
                return;
            }
            if (Number(value) <= 0 || isNaN(value)) {
                this.$alert('请输入大于0的数', {
                    type: 'warning',
                });
                return;
            }
            this.enterType = 'sys';
            this.$refs.table.toggleRowSelection(row, true);
            this.enterType = '';
            row.pickStockNumber = value;
            let ChooseQuantity = 0;
            this.tableDataBatch.forEach(v => {
                ChooseQuantity += Number(v.pickStockNumber);
            });
            this.originMount = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
            this.dialogFormBatch[3].value = this.originMount;
            if (Number(row.pickStockNumber) !== row.validStockNumber) this.dialogFormBatch[4].value = '0';
            else this.dialogFormBatch[4].value = '1';
        },
        // 系统选择
        sysChoose() {
            // if (Number(this.originMount) === 0) return;
            let sum = 0;
            this.clearAll();
            for (let i = 0; i < this.tableDataBatch.length; i++) {
                const row = this.tableDataBatch[i];
                this.enterType = 'sys';
                if (row.validStockNumber >= Number(this.originMount)) {
                    row.pickStockNumber = this.originMount;
                    this.$refs.table.toggleRowSelection(row, true);
                    this.enterType = '';
                    sum += Number(row.pickStockNumber);
                    this.originMount = Number(this.dialogFormBatch[1].value) - sum;
                    this.dialogFormBatch[3].value = this.originMount;
                    if (row.pickStockNumber !== row.validStockNumber) this.dialogFormBatch[4].value = '0';
                    else this.dialogFormBatch[4].value = '1';
                    break;
                } else {
                    row.pickStockNumber = row.validStockNumber;
                    this.$refs.table.toggleRowSelection(row, true);
                    sum += Number(row.pickStockNumber);
                    this.enterType = '';
                    this.originMount = Number(this.dialogFormBatch[1].value) - sum;
                    this.dialogFormBatch[3].value = this.originMount;
                }
            }
        },
        // 清空全部
        clearAll() {
            let ChooseQuantity = 0;
            let sum = 0;
            this.tableDataBatch.forEach(v => {
                v.pickStockNumber = null;
                sum += v.validStockNumber;
                ChooseQuantity += Number(v.pickStockNumber);
                this.$refs.table.toggleRowSelection(v, false);
            });
            this.dialogFormBatch[2].value = sum;
            this.originMount = Number(this.dialogFormBatch[1].value) - ChooseQuantity;
            this.dialogFormBatch[3].value = this.originMount;
        },
        changeHandlerDialog(select) {
            let sum = 0;
            this.multipDialog = select;
            if (this.enterType === 'sys') return;
            let unSelect = _.differenceWith(this.tableDataBatch, this.multipDialog, _.isEqual);
            if (this.multipDialog.length !== 0) {
                this.multipDialog.forEach(v => {
                    v.pickStockNumber = v.validStockNumber;
                    sum += Number(v.pickStockNumber);
                    this.originMount = Number(this.dialogFormBatch[1].value) - sum;
                    this.dialogFormBatch[3].value = this.originMount;
                    if (v.pickStockNumber !== v.validStockNumber) this.dialogFormBatch[4].value = '0';
                    else this.dialogFormBatch[4].value = '1';
                });
            } else {
                this.clearAll();
                const item = this.tableDataDetail.find(v => v.id === this.currentRowKeyDatail);
                this.dialogFormBatch.forEach(v => {
                    if (v.prop === 'isSatisfied') v.value = item[v.prop].toString();
                    else v.value = item[v.prop];
                    this.originMount = Number(this.dialogFormBatch[1].value) - sum;
                    this.dialogFormBatch[3].value = this.originMount;
                });
            }
            unSelect.forEach(v => {
                v.pickStockNumber = null;
            });
            let allSum = 0;
            this.tableDataBatch.forEach(v => {
                allSum += v.validStockNumber;
            });
            this.dialogFormBatch[2].value = allSum;
        },
        submitBatch() {
            const lastAmount = Number(this.dialogFormBatch[3].value);
            if (lastAmount !== 0 || this.multipDialog.length === 0) {
                this.$alert('请选择批次且未清数量等于0才可以提交', {
                    type: 'warning',
                });
                return;
            }
            const status = this.dialogFormBatch[4].value;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.multipDialog.forEach(v => {
                v.notesDeliveryNo = item.notesDeliveryNo;
            });
            this.$http.post(`/tallymanager/tallypickingmt/confirm/${status}`, this.multipDialog).then(res => {
                this.$message.success('选择批次成功');
                this.getBatch();
                this.getDataSon();
                this.dialogVisibleBatch = false;
            });
        }
    }
};

</script>
<style lang="stylus" scoped>
.pick
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
.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)
.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        height 150px!important
.table_batch >>>
    // input[placeholder]
    //     color #C0C4CC
    // .el-input__inner:first-child
    //     border none
</style>

