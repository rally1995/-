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
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrentParent"
                    @changeSize="changeSizeParent"
                    @selection-change="changeHandler")
        ebrain-frame(title="交货单物料明细")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoadingSon"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    :pageSize="pageSizeSon"
                    :currentPage="currentPageSon"
                    :pageTotal="pageTotalSon"
                    @changeCurrent="changeCurrentSon"
                    @changeSize="changeSizeSon")
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            top="2vh"
            :expandVisible="collapse"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#button)
                ebrain-tools(:buttons="btnsForm" v-if="!islook")
            template(#carType="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="车型" :required="true" prop="carType")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="dialogSearchForm={};getCustoServe()" :disabled="isClickType"  icon="iconfont iconsearch")
            template(#carLicense="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="车牌号" :required="true" prop="carNumber")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="dialogVisibleLicense = true;dialogSearcCarhForm={};getLicense()" :disabled="isClickLicese" icon="iconfont iconsearch")
            template(#driver)
                el-col(:span="12" style="height:46px" )
                    el-form-item(label-width="110px" label="驾驶员姓名" prop="driverName" :require="true")
                        el-autocomplete(v-model="driver" style="width:100%" :disabled="driveDisabled" :fetch-suggestions="querySearch"   @select="handleSelect")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="装车单明细")
                template(#tools)
                    ebrain-tools(:buttons="btnsDown" v-if="!islook")
                template(#table)
                    ebrain-table.table_dialog(
                        :tableLoading="tableLoadingSonDialog"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySonDialog"
                        row-key="id"
                        :data="tableDataSonDialog"
                        :column="tableColumnSon"
                        :pageSize="pageSizeSonDialog"
                        :currentPage="currentPageSonDialog"
                        :pageTotal="pageTotalSonDialog"
                        @selection-change="changeHandlerSonDialog"
                        @changeCurrent="changeCurrentSonDialog"
                        @changeSize="changeSizeSonDialog")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatType"
            :column="tableColumnType"
            :tableLoading="submitLoadingType"
            :visible.sync="dialogVisibleType"
            :pageSize="pageSizeType"
            :currentPage="currentPageType"
            :pageTotal="pageTotalType"
            :disabled="!currentRowKeyType"
            @changeCurrent="changeCurrentType"
            @changeSize="changeSizeType"
            @search="searchType"
            @resetDialog="resetType"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyType"
            @submit="submitFormType")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatLicense"
            :column="tableColumnLicense"
            :tableLoading="submitLoadingLicense"
            :visible.sync="dialogVisibleLicense"
            :pageSize="pageSizeLicense"
            :currentPage="currentPageLicense"
            :pageTotal="pageTotalLicense"
            :disabled="!currentRowKeyLicense"
            @changeCurrent="changeCurrentLicense"
            @changeSize="changeSizeLicense"
            @search="searchLicense"
            @resetDialog="resetLicense"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyLicense"
            @submit="submitFormLicense")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatDelivery"
            :column="tableColumnDelivery"
            :tableLoading="submitLoadingDelivery"
            :visible.sync="dialogVisibleDelivery"
            :pageSize="pageSizeDelivery"
            :currentPage="currentPageDelivery"
            :pageTotal="pageTotalDelivery"
            :disabled="muliptDelivery.length === 0"
            @select="selectDelivery"
            @changeCurrent="changeCurrentDelivery"
            @changeSize="changeSizeDelivery"
            @search="searchDelivery"
            @resetDialog="resetDelivery"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyDelivery"
            @submit="submitFormDelivery")
        ebrain-dialog-table(
            :isShow="false"
            height="50vh"
            :row-class-name="tableRowClassName"
            :data="tableDatOrder"
            :column="tableColumnOrder"
            :visible.sync="dialogVisibleOrder"
            :disabled="!currentRowKeyOrder"
            @row-click="handlerRow"
            row-key="id"
            :current-row-key.sync="currentRowKeyOrder"
            @submit="submitFormOrder")
            template(v-slot="{ row, $index }")
                el-button(type="primary" :disabled="!currentRowKeyOrder" @click="moveUp") 上移
                el-button(type="primary" :disabled="!currentRowKeyOrder" @click="moveDowm") 下移
</template>
<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import dict from '@/utils/dict';
import moment from 'moment';
import * as _ from 'lodash';
export default {
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            searchForm: [{
                label: '装车单号',
                prop: 'notesLoadNo',
                value: '',
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: {},
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallyload_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallyload_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'tallymanager_tallyload_dels',
            }, {
                label: '查看',
                click: () => this.lookRow(),
                className: 'iconfont icontarget',
                disabled: () => this.editDisabled,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.addSonDisabeled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_confirm_deliverys',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delSonDisabled,
                permi: 'tallymanager_tallyloadde_dels',
            }, {
                label: '设置送货顺序',
                click: () => this.setOrder(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.addSonDisabeled,
                permi: false,
            }],
            collapse: false,
            searchVisible: true,
            tableLoading: false,
            currentRowKey: '',
            move: '',
            tableData: [],
            noteStatus: 400,
            filterData: [],
            islook: false,
            dialogSearchForm: {},
            conditionList: [],
            row: {},
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '装车单号',
                prop: 'notesLoadNo',
                showOverflowTooltip: true,
            }, {
                label: '装运类型',
                prop: 'shipmentType',
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_TALLY_SHIPMENT_TYPE'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '运输计划点',
                prop: 'transportPlanPoint',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'sendOutDate',
                showOverflowTooltip: true,
            }, {
                label: '供应商',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '装运路线',
                prop: 'transportName',
                showOverflowTooltip: true,
            }, {
                label: '车型',
                prop: 'carType',
                showOverflowTooltip: true,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员姓名',
                prop: 'driverName',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员联系方式',
                prop: 'driverContact',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员身份证',
                prop: 'driverIdcard',
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
            pageTotal: 0,
            muliption: [],
            tableLoadingSon: false,
            currentRowKeySon: '',
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            muliptionSon: [],
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '送货顺序',
                prop: 'sendOrder',
                showOverflowTooltip: true,
            }, {
                label: '交货单号',
                prop: 'notesDeliveryNo',
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
                label: '销售合同号',
                prop: 'saileNo',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '装车单号',
                prop: 'notesLoadNo',
                value: '',
                disabled: true,
            }, {
                label: '装运类型',
                prop: 'shipmentType',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_TALLY_SHIPMENT_TYPE'],
                required: true,
            }, {
                label: '运输计划点',
                prop: 'transportPlanPoint',
                value: '',
                disabled: true,
            }, {
                label: '出货日期',
                prop: 'sendOutDate',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '装运条件',
                prop: 'loadCondition',
                value: '',
                disabled: true,
                // slot: 'custoServe'
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_TALLY_STATUS'],
                disabled: true,
            }, {
                label: '车型',
                prop: 'carType',
                value: '',
                slot: 'carType',
                required: true,
            }, {
                label: '装运路线',
                prop: 'transportName',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '物流供应商编号',
                prop: 'supplierCode',
                value: '',
                disabled: true,
            }, {
                label: '物料供应商名称',
                prop: 'supplierName',
                value: '',
                disabled: true,
            }, {
                label: '含税金额',
                prop: 'money',
                value: '',
                disabled: true,
            }, {
                label: '税点',
                prop: 'taxRate',
                value: '',
                disabled: true,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                value: '',
                slot: 'carLicense',
                disabled: true,
            }, {
                label: '服务级别',
                type: 'select',
                option: () => this.storeDict['DIC_TALLY_SERVICE_LEVEL'],
                prop: 'serviceLevel',
                value: '',
                required: true,
            }, {
                label: '驾驶员姓名',
                prop: 'driverName',
                // type: 'select',
                // option: {},
                value: '',
                // slot: 'driver',
                required: true,
            }, {
                label: '驾驶员联系方式',
                prop: 'driverContact',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg = /^((0\d{2,3}-\d{7,8})|(1[345678]\d{9}))$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的联系方式'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '驾驶员身份证',
                prop: 'driverIdcard',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的身份证!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
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
            }, {
                label: '',
                type: 'hidden',
                prop: 'carCode',
                value: '',
            }],
            tableLoadingDatail: false,
            currentRowKeyDatail: '',
            tableDataDatail: [],
            pageSizeDatail: 20,
            currentPageDatail: 1,
            pageTotalDatail: 0,
            tableColumnDatail: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同项目号',
                prop: 'saileItemNo',
                showOverflowTooltip: true,
            }, {
                label: '采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料描述',
                prop: 'materielDesc',
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
                label: '批次号',
                prop: 'deliverableNumber',
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
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }],
            tableDatType: [],
            submitLoadingType: false,
            dialogVisibleType: false,
            pageSizeType: 20,
            currentPageType: 1,
            pageTotalType: 0,
            currentRowKeyType: '',
            tableColumnType: [{
                label: '车辆信息编号',
                prop: 'carCode',
                showOverflowTooltip: true,
            }, {
                label: '车型',
                prop: 'carType',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '车位数量',
                prop: 'seatNumber',
                showOverflowTooltip: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '含税金额',
                prop: 'money',
                showOverflowTooltip: true,
            }, {
                label: '税点',
                prop: 'taxRate',
                showOverflowTooltip: true,
            }, {
                label: '车辆状态',
                prop: 'isUse',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }],
            dialogSearcCarhForm: {},
            tableDatLicense: [],
            submitLoadingLicense: false,
            dialogVisibleLicense: false,
            pageSizeLicense: 20,
            currentPageLicense: 1,
            pageTotalLicense: 0,
            currentRowKeyLicense: '',
            dialogType: '',
            tableColumnLicense: [{
                label: '车牌号',
                prop: 'carNumber',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '驾驶员姓名',
                prop: 'driverName',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员身份证',
                prop: 'driverIdcard',
                showOverflowTooltip: true,
            }, {
                label: '联系方式',
                prop: 'driverContact',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }],
            tableDatDelivery: [],
            submitLoadingDelivery: false,
            dialogVisibleDelivery: false,
            pageSizeDelivery: 20,
            currentPageDelivery: 1,
            pageTotalDelivery: 0,
            currentRowKeyDelivery: '',
            dialogSearchDelivery: {},
            submitId: '',
            muliptDelivery: [],
            transportCode: '',
            tableColumnDelivery: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '交货单',
                prop: 'notesDeliveryNo',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                searchBy: true,
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
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableDatOrder: [],
            dialogVisibleOrder: false,
            currentRowKeyOrder: '',
            tableColumnOrder: [{
                label: '送货顺序',
                type: 'index',
                width: 450,
                index: index => {
                    return index + 1;
                },
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
            }],
            tableDataSonDialog: [],
            pageSizeSonDialog: 20,
            currentPageSonDialog: 1,
            pageTotalSonDialog: 0,
            currentRowKeySonDialog: '',
            tableLoadingSonDialog: false,
            driver: '',
            isClickType: false,
            isClickLicese: false,
            driveDisabled: false,
            isloading: false,
            saveLoading: false,
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
                loading: this.saveLoading,
                permi: false,
            }, {
                label: '提交装车校验',
                click: () => this.submitParent(),
                disabled: () => this.submitValite,
                loading: this.isloading,
                className: 'iconfont iconstatus-Submission',
                permi: 'tallymanager_tallyload_checkSubmit',
            }, {
                label: '关闭',
                click: () => this.close(),
                className: 'iconfont iconClose-',
                permi: false,
            }];
            if (this.dialogForm[5].value === '400') {
                arr[1] = {
                    label: '提交装车校验',
                    click: () => this.submitParent(),
                    disabled: () => this.submitValite,
                    loading: this.isloading,
                    className: 'iconfont iconstatus-Submission',
                    permi: 'tallymanager_tallyload_checkSubmit',
                };
            } else {
                arr[1] = {
                    label: '取消装车校验',
                    click: () => this.disAll(),
                    disabled: () => this.disValited,
                    loading: this.isloading,
                    className: 'iconfont iconstatus-Refresh',
                    permi: 'tallymanager_tallyload_cancelcheck',
                };
            }
            return arr;
        },
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.muliption.length === 0;
        },
        addSonDisabeled() {
            return !this.dialogForm[0].value || this.noteStatus !== 400;
        },
        delSonDisabled() {
            return this.muliptionSon.length === 0 || this.noteStatus !== 400;
        },
        saveDisabled() {
            return this.isClickLicese;
        },
        submitValite() {
            return this.dialogType !== 'edit' || this.tableDataSonDialog.length === 0;
        },
        disValited() {
            return this.noteStatus !== 401;
        }
    },
    watch: {
        dialogVisibleType(val) {
            if (!val) {
                this.changeCurrentType = 1;
                this.tableDatType = [];
                this.getData();
            }
        },
        dialogVisible(val) {
            if (val) {
                this.dialogForm[2].value = '南通生益运输调度';
                this.dialogForm[4].value = '内销装运';
                this.dialogSearcCarhForm = {};
                this.getLicense();
            } else {
                this.tableDataSonDialog = [];
                this.currentPageSonDialog = 1;
                this.pageSizeSonDialog = 20;
                this.noteStatus = 400;
                this.driver = '';
                this.islook = false;
                this.getDataSon();
            }
        },
        dialogVisibleOrder(val) {
            if (!val) {
                this.tableDatOrder = [];
                this.move = '';
            }
        },
        noteStatus(val) {
            if (val !== 400 && val !== '') {
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                });
                this.isClickType = true;
                this.isClickLicese = true;
                // this.driveDisabled = true;
            } else {
                this.dialogForm[1].disabled = false;
                this.dialogForm[3].disabled = false;
                this.dialogForm[13].disabled = false;
                this.dialogForm[14].disabled = false;
                this.dialogForm[15].disabled = false;
                this.dialogForm[16].disabled = false;
                this.dialogForm[18].disabled = false;
                this.isClickType = false;
                this.isClickLicese = false;
                this.driveDisabled = false;
            }
        },
        dialogVisibleDelivery(val) {
            if (!val) {
                this.pageSizeDelivery = 20;
                this.currentPageDelivery = 1;
                this.tableDatDelivery = [];
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS'),
            this.queryDict('DIC_TALLY_SERVICE_LEVEL'),
            this.queryDict('DIC_TALLY_SHIPMENT_TYPE')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 400: obj['400'], 401: obj['401'], 502: obj['502'], 503: obj['503'], 504: obj['504'] };
            this.searchForm[1].option = params;
        });
    },
    activated() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS'),
            this.queryDict('DIC_TALLY_SERVICE_LEVEL'),
            this.queryDict('DIC_TALLY_SHIPMENT_TYPE')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 400: obj['400'], 401: obj['401'], 502: obj['502'], 503: obj['503'], 504: obj['504'] };
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
            this.$http.get(`/tallymanager/tallyload/page`, {
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
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[5].value = '400';
        },
        editRow() {
            this.$http.get(`/tallymanager/tallyload/getById/${this.currentRowKey}`).then(({ code, data }) => {
                this.transportCode = data.transportCode;
                this.submitId = data.id;
                this.noteStatus = data.noteStatus;
                this.dialogVisible = true;
                this.dialogType = 'edit';
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data['noteStatus'].toString();
                    else v.value = data[v.prop];
                });
                this.getDataDialogSon();
            });
        },
        // 查看
        lookRow() {
            this.noteStatus = '';
            this.$http.get(`/tallymanager/tallyload/getById/${this.currentRowKey}`).then(({ code, data }) => {
                this.dialogVisible = true;
                this.isClickType = true;
                this.isClickLicese = true;
                this.driveDisabled = true;
                this.islook = true;
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') {
                        v.value = data['noteStatus'].toString();
                        v.disabled = true;
                    }
                    else {
                        v.value = data[v.prop];
                        v.disabled = true;
                    }
                });
                this.getDataDialogSon();
            });
        },
        delRow() {
            const delData = this.muliption.map(v => v.id);
            const isDel = this.muliption.every(v => v.noteStatus === 400);
            if (!isDel) {
                this.$alert('提交状态不能删除', {
                    type: 'warning'
                });
                return;
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallyload/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData();
                    this.tableDataSon = [];
                    this.pageTotalSon = 0;
                    this.$message({
                        message: '删除成功!',
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
            this.muliption = selection;
        },
        close() {
            this.dialogVisible = false;
        },
        getDataSon() {
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: [],
            };
            if (this.dialogType === 'edit' && this.submitId !== '') {
                const item = this.tableData.find(v => v.id === this.submitId);
                params.conditionList.push({
                    fieldName: 'notesLoadNo',
                    operation: 'EQ',
                    value: item.notesLoadNo,
                });
                return this.$http.get(`/tallymanager/tallyloadde/page`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataSon = data.records;
                    this.pageTotalSon = data.total;
                    this.dialogType = '';
                    this.submitId = '';
                });
            } else if (this.dialogType === '') {
                const item = this.tableData.find(v => v.id === this.currentRowKey);
                params.conditionList.push({
                    fieldName: 'notesLoadNo',
                    operation: 'EQ',
                    value: item.notesLoadNo,
                });
                return this.$http.get(`/tallymanager/tallyloadde/page`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataSon = data.records;
                    this.pageTotalSon = data.total;
                    this.dialogType = '';
                    this.submitId = '';
                });
            } else {
                this.dialogType = '';
                this.submitId = '';
            }
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
        // 车型列表
        getCustoServe() {
            this.dialogVisibleType = true;
            this.submitLoadingType = true;
            const params = {
                current: this.currentPageType,
                size: this.pageSizeType,
                conditionList: [{
                    fieldName: 'isUse',
                    value: '1',
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
            this.$http.get(`/tallymanager/tallycar/page`, { params }).then(res => {
                this.tableDatType = res.data.records;
                this.pageTotalType = res.data.total;
                this.submitLoadingType = false;
            }).catch(() => {
                this.submitLoadingType = false;
            });
        },
        changeCurrentType(val) {
            this.currentPageType = val;
            this.getCustoServe();
        },
        changeSizeType(val) {
            this.pageSizeType = val;
            this.currentPageType = 1;
            this.getCustoServe();
        },
        searchType(form) {
            this.currentPageType = 1;
            this.dialogSearchForm = form;
            this.getCustoServe();
        },
        resetType(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormType() {
            const item = this.tableDatType.find(v => v.id === this.currentRowKeyType);
            this.dialogForm[6].value = item.carType;
            this.dialogForm[7].value = item.transportName;
            this.dialogForm[8].value = item.supplierCode;
            this.dialogForm[9].value = item.supplierName;
            this.dialogForm[10].value = item.money;
            this.dialogForm[11].value = item.taxRate;
            this.dialogForm[19].value = item.carCode;
            this.dialogVisibleType = false;
            this.currentRowKeyType = '';
            this.transportCode = item.transportCode;
        },
        // 车牌列表
        getLicense() {
            const params = {
                current: this.changeCurrentLicense,
                size: this.pageSizeLicense,
                conditionList: [{
                    fieldName: 'status',
                    value: '1',
                    operation: 'EQ',
                }],
            };
            if (this.dialogSearcCarhForm) {
                for (let i in this.dialogSearcCarhForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearcCarhForm, i)) {
                        if (this.dialogSearcCarhForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearcCarhForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.submitLoadingLicense = true;
            return this.$http.get(`/tallymanager/tallydriver/page`, { params }).then(res => {
                this.tableDatLicense = res.data.records;
                this.pageTotalLicense = res.data.total;
                this.submitLoadingLicense = false;
            }).catch(() => {
                this.submitLoadingLicense = false;
            });
        },
        changeCurrentLicense(val) {
            this.currentPageLicense = val;
            this.getLicense();
        },
        changeSizeLicense(val) {
            this.pageSizeLicense = val;
            this.currentPageLicense = 1;
            this.getLicense();
        },
        searchLicense(form) {
            this.currentPageLicense = 1;
            this.dialogSearcCarhForm = form;
            this.getLicense();
        },
        resetLicense(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormLicense() {
            const item = this.tableDatLicense.find(v => v.id === this.currentRowKeyLicense);
            this.dialogForm[12].value = item.carNumber;
            this.dialogForm[14].value = item.driverName;
            this.dialogForm[15].value = item.driverContact;
            this.dialogForm[16].value = item.driverIdcard;
            this.dialogVisibleLicense = false;
            this.currentRowKeyLicense = '';
        },
        // 子表分页
        changeCurrentDatail(val) {
            this.currentPageDatail = val;
            this.getDataSon();
        },
        changeSizeDatail(val) {
            this.pageSizeDatail = val;
            this.currentPageDatail = 1;
            this.getDataSon();
        },
        saveData() {
            this.$refs.dialog.$refs.form.validate(valid => {
                if (valid) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        if (v.prop === 'noteStatus') obj[v.prop] = Number(v.value);
                        else obj[v.prop] = v.value;
                    });
                    this.saveLoading = true;
                    obj.transportCode = this.transportCode;
                    obj.sendOutDate = moment(obj.sendOutDate).format('YYYY-MM-DD HH:mm:ss');
                    delete obj.notesLoadNo;
                    if (this.dialogType === 'new') {
                        this.$http.post(`/tallymanager/tallyload/save`, obj).then(({ code, data }) => {
                            this.dialogForm.forEach(v => {
                                if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                                else v.value = data[v.prop];
                            });
                            this.$message.success('保存成功');
                            this.getData();
                            this.submitId = data.id;
                            this.noteStatus = data.noteStatus;
                            this.dialogType = 'edit';
                            this.saveLoading = false;
                        }).catch(() => {
                            this.saveLoading = false;
                        });
                    } else {
                        obj.id = this.submitId;
                        obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                        this.$http.put(`/tallymanager/tallyload/updateById`, obj).then(({ code, data }) => {
                            this.$message.success('修改成功');
                            this.getData();
                            this.saveLoading = false;
                        }).catch(() => {
                            this.saveLoading = false;
                        });
                    }
                }
            });
        },
        submitParent() {
            this.isloading = true;
            this.$http.post(`/tallymanager/tallyload/checkSubmitLoading/${this.submitId}`).then(({ code, data }) => {
                this.$message.success('提交成功');
                this.noteStatus = data.noteStatus;
                this.getData();
                this.isloading = false;
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
            }).catch(() => {
                this.isloading = false;
            });
        },
        disAll() {
            this.isloading = true;
            this.$http.post(`/tallymanager/tallyload/cancelCheckLoading/${this.submitId}`).then(({ code, data }) => {
                this.$message.success('取消成功');
                this.isloading = false;
                this.noteStatus = data.noteStatus;
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
                this.getData();
            }).catch(() => {
                this.isloading = false;
            });
        },
        // 装车单新增
        newRowSon() {
            this.dialogVisibleDelivery = true;
            this.dialogSearchDelivery = {};
            this.getDelivery();
        },
        getDataDialogSon() {
            const val = this.dialogForm[0].value;
            this.tableLoadingSonDialog = true;
            const params = {
                current: this.currentPageSonDialog,
                size: this.pageSizeSonDialog,
                conditionList: [{
                    fieldName: 'notesLoadNo',
                    operation: 'EQ',
                    value: val,
                }],
            };
            this.$http.get(`/tallymanager/tallyloadde/page`, {
                params
            }).then(({ code, data }) => {
                this.tableDataSonDialog = data.records;
                this.pageTotalSonDialog = data.total;
                this.tableLoadingSonDialog = false;
            }).catch(() => {
                this.tableLoadingSonDialog = false;
            });
        },
        changeCurrentSonDialog(val) {
            this.currentPageSonDialog = val;
            this.getDataDialogSon();
        },
        changeSizeSonDialog(val) {
            this.pageSizeSonDialog = val;
            this.currentPageSonDialog = 1;
            this.getDataDialogSon();
        },
        getDelivery() {
            const params = {
                current: this.currentPageDelivery,
                size: this.pageSizeDelivery,
                conditionList: [],
            };
            if (this.dialogSearchDelivery) {
                for (let i in this.dialogSearchDelivery) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchDelivery, i)) {
                        if (this.dialogSearchDelivery[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchDelivery[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            const notesLoadNo = this.dialogForm[0].value;
            this.submitLoadingDelivery = true;
            this.$http.get(`/tallymanager/tallydelivery/selectTallyDeliveryPage/${notesLoadNo}`, { params }).then(({ code, data }) => {
                this.tableDatDelivery = data.records;
                this.pageTotalDelivery = data.total;
                this.submitLoadingDelivery = false;
            }).catch(() => {
                this.submitLoadingDelivery = false;
            });
        },
        changeCurrentDelivery(val) {
            this.currentPageDelivery = val;
            this.getDelivery();
        },
        changeSizeDelivery(val) {
            this.pageSizeDelivery = val;
            this.currentPageDelivery = 1;
            this.getDelivery();
        },
        searchDelivery(form) {
            this.currentPageDelivery = 1;
            this.dialogSearchDelivery = form;
            this.getDelivery();
        },
        resetDelivery(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormDelivery() {
            const ids = this.muliptDelivery.map(v => v.id);
            this.$http.post(`/tallymanager/tallyloadde/confirmDeliverys/${this.submitId}`, ids).then(() => {
                this.$message.success('新增成功');
                this.dialogVisibleDelivery = false;
                this.getDataDialogSon();
            });
        },
        changeHandlerSonDialog(selection) {
            this.muliptionSon = selection;
        },
        delRowSon() {
            const ids = this.muliptionSon.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDialog = true;
                this.$http.delete('/tallymanager/tallyloadde/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.tableLoadingDialog = false;
                    this.currentPageSon = 1;
                    this.getDataDialogSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                });
            });
        },
        selectDelivery(selection) {
            this.muliptDelivery = selection;
        },
        setOrder() {
            this.dialogVisibleOrder = true;
            const newArr = _.uniqWith(this.tableDataSonDialog, (pre, next) => pre.customName === next.customName);
            this.tableDatOrder = newArr;
        },
        submitFormOrder() {
            const notesLoadNo = this.dialogForm[0].value;
            const newArr = this.tableDatOrder.map(v => v.customName);
            this.$http.post(`/tallymanager/tallyloadde/settingSendOrder/${notesLoadNo}`, newArr).then(({ code, data }) => {
                this.$message.success('排序成功');
                this.getDataDialogSon();
                this.dialogVisibleOrder = false;
            });
        },
        tableRowClassName({ row, rowIndex }) {
            row.index = rowIndex;
            if (this.move !== '') row.sendOrder = rowIndex + 1;
        },
        handlerRow(row) {
            this.row = row;
        },
        // 通过车牌号选择车辆列表
        filterCar() {
            const item = this.dialogForm.find(v => v.prop === 'carNumber');
            if (item.value !== '') {
                const params = {
                    size: 999,
                    conditionList: [{
                        fieldName: 'status',
                        value: '1',
                        operation: 'EQ',
                        joinType: 'AND',
                    }, {
                        fieldName: 'carNumber',
                        value: this.dialogForm[12].value,
                        operation: 'EQ',
                        joinType: 'AND',
                    }],
                };
                return this.$http.get(`/tallymanager/tallydriver/page`, { params }).then(res => {
                    this.filterData = res.data.records;
                });
            }
        },
        querySearch(queryString, cb) {
            const item = this.dialogForm.find(v => v.prop === 'carNumber');
            if (item.value !== '') {
                this.filterCar().then(() => {
                    const newArr = [];
                    this.filterData.forEach(v => {
                        if (v.carNumber === item.value) {
                            newArr.push({
                                value: v.driverName
                            }); }
                    });
                    let results = queryString ? newArr.filter(this.createFilter(queryString)) : newArr;
                    cb(results);
                });
            } else {
                cb([]);
            }
        },
        handleSelect(item) {
            const row = this.filterData.find(v => v.driverName === item.value);
            this.dialogForm[14].value = row.driverName;
            this.dialogForm[15].value = row.driverContact;
            this.dialogForm[16].value = row.driverIdcard;
        },
        createFilter(queryString) {
            return (restaurant) => {
                return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },
        // 实现上移
        moveUp() {
            const index = this.row['index'];
            this.move = 'up';
            if (index > 0) {
                let upDate = this.tableDatOrder[index - 1];
                this.tableDatOrder.splice(index - 1, 1);
                this.tableDatOrder.splice(index, 0, upDate);
            } else {
                this.$message.error('已经是第一条,不可上移');
            }
        },
        // 下移
        moveDowm() {
            const index = this.row['index'];
            this.move = 'down';
            if (index === this.tableDatOrder.length - 1) {
                this.$message.error('已经是最后一条，不可下移');
            } else {
                let downDate = this.tableDatOrder[index + 1];
                this.tableDatOrder.splice(index + 1, 1);
                this.tableDatOrder.splice(index, 0, downDate);
            }
        }
    },
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
</style>

