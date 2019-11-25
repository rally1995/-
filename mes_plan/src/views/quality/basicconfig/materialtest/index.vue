<template lang="pug">
    ebrain-main.materialtest
        ebrain-frame(
            title="物料检验方式")
            template(#tools)
                ebrain-tools(:buttons="buttons")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoading"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    @row-dblclick="editRowParent"
                    @selection-change="selectionChange"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#materielTypeCode)
                el-col(:span="12")
                    el-form-item(label="物料类别编码" prop="materielTypeCode" required)
                        el-input(readonly=true v-model="dialogForm[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('materielTypeCode')")
            template(#materielCode)
                el-col(:span="12")
                    el-form-item(label="料号" prop="materielCode")
                        el-input(readonly=true v-model="dialogForm[2].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('materielCode')")
            template(#supplierCode)
                el-col(:span="12")
                    el-form-item(label="供应商编码" prop="supplierCode")
                        el-input(readonly=true v-model="dialogForm[4].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('supplierCode')")
            template(#customerCode)
                el-col(:span="12")
                    el-form-item(label="客户编码" prop="customerCode")
                        el-input(readonly=true v-model="dialogForm[6].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('customerCode')")
            template(#inspectUnit)
                el-col(:span="12")
                    el-form-item(label="检验单位" prop="inspectUnit" required)
                        el-input(readonly=true v-model="dialogForm[12].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('inspectUnit')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            :isShow="isShow"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="55vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialogTable(type)")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'materialtest',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            dialogTableLoading: false,
            ids: [],
            selection: [],
            type: '',
            rowObj: {},
            isShow: true,
            listDetailsData: [],
            listDetailsColumn: [],
            pageSize_1: 20,
            pageTotal_1: 0,
            currentPage_1: 1,
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            tableColumn: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '物料类别编码',
                prop: 'materielTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materielCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '供应商编码',
                prop: 'supplierCode',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '检验方式',
                prop: 'inspectMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_METHOD'][cell];
                }
            }, {
                label: '取样方式',
                prop: 'samplingMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_SAMPLING_METHOD'][cell];
                }
            }, {
                label: '抽样比例(%)',
                prop: 'samplingScale',
                showOverflowTooltip: true,
            }, {
                label: '固定抽样数量',
                prop: 'samplingFixedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                showOverflowTooltip: true,
            }, {
                label: '是否有效',
                prop: 'valid',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_METHOD_VALID'][cell];
                }
            }, {
                label: '维护人员',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                prop: 'materielTypeCode',
                value: '',
                slot: 'materielTypeCode',
            }, {
                label: '物料类型名称',
                prop: 'materielTypeName',
                value: '',
                disabled: true,
            }, {
                prop: 'materielCode',
                value: '',
                slot: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
                value: '',
                disabled: true,
            }, {
                prop: 'supplierCode',
                value: '',
                slot: 'supplierCode',
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                disabled: true,
            }, {
                prop: 'customerCode',
                value: '',
                slot: 'customerCode',
            }, {
                label: '客户名称',
                prop: 'customerName',
                value: '',
                disabled: true,
            }, {
                label: '检验方式',
                prop: 'inspectMethod',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_METHOD'],
                value: '',
                required: true,
                change: val => {
                    this.dialogForm[10].disabled = !(val === 'P');
                    this.dialogForm[10].required = val === 'P';
                    this.dialogForm[11].disabled = !(val === 'F');
                    this.dialogForm[11].required = val === 'F';
                    if (!(val === 'P')) {
                        this.dialogForm[10].value = '';
                    }
                    if (!(val === 'F')) {
                        this.dialogForm[11].value = '';
                    }
                }
            }, {
                label: '取样方式',
                prop: 'samplingMethod',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_SAMPLING_METHOD'],
                value: '',
                required: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogForm[8].value === 'P') {
                            let reg =  /^\d+(\.?\d{0,4})$/;
                            if (value !== '') {
                                if (!reg.test(value) || value > 100) {
                                    callback(new Error('请输入0-100且最多为四位小数'));
                                } else {
                                    callback();
                                }
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '抽样比例(%)',
                prop: 'samplingScale',
                value: '',
                required: false,
                disabled: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogForm[8].value === 'F') {
                            let reg =  /^\d+(\.?\d{0,4})$/;
                            if (value !== '') {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入四位小数的正数或0'));
                                } else {
                                    callback();
                                }
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '固定抽样数量',
                prop: 'samplingFixedQuantity',
                value: '',
                required: false,
                disabled: true,
            }, {
                prop: 'inspectUnit',
                value: '',
                slot: 'inspectUnit'
            }, {
                label: '是否有效',
                prop: 'valid',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_METHOD_VALID'],
                value: '',
                required: true,
            }, {
                label: '维护人员',
                prop: 'updateBy',
                value: '',
                disabled: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            materielTypeCodeColumn: [{
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            materielCodeColumn: [{
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '料号名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            supplierCodeColumn: [{
                label: '供应商编码',
                prop: 'supplierCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            customerCodeColumn: [{
                label: '客户编码',
                prop: 'kunnr',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            inspectUnitColumn: [{
                label: '单位编码',
                prop: 'unitCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '单位名称',
                prop: 'unitName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            searchForm: [{
                label: '物料类别编码',
                prop: 'materielTypeCode',
                value: ''
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                value: ''
            }],
            buttons: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'mes-qc-manager_dicqciqcinspectmethod_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-edit',
                permi: 'mes-qc-manager_dicqciqcinspectmethod_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.selection.length === 0 || this.isDelete,
                className: 'iconfont iconstatus-delete',
                permi: 'mes-qc-manager_dicqciqcinspectmethod_dels',
            }, {
                label: '全部导出',
                click: () => this.allExport(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导出选中',
                click: () => this.exportSelected(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '下载模板',
                click: () => this.downloadTemplate(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导入',
                className: 'iconfont iconstatus-download',
                permi: false,
                action: '/qc/dicqciqcinspectmethod/import',
                onSuccess: (response, file, fileList) => this.uploadSuccess(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKey: '',
            currentRowKeyDialogTable: '',
            dialog: '',
            dialogVisible: false,
            dialogVisibleTable: false,
            isDelete: false,
            dialogSearchForm: {},
            searchVisible: true,
            conditionList: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    watch: {
        dialogVisibleTable(val) {
            if (!val) {
                this.listDetailsData = [];
                this.pageSize_1 = 20;
                this.currentPage_1 = 1;
                this.pageTotal_1 = 0;
                this.dialogSearchForm = {};
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.dialogForm[10].disabled = true;
                this.dialogForm[11].disabled = true;
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('DIC_IQC_SAMPLING_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_METHOD_VALID'),
        ]).then(() => {
            this.getData();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 主表搜索
        search() {
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.currentPage = 1;
            this.getData();
        },
        enterDetail(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            this.isShow = true;
            switch (type) {
                case 'materielTypeCode':
                    this.listDetailsColumn = this.materielTypeCodeColumn;
                    this.isShow = false;
                    this.getmaterielTypeCodeInfo();
                    break;
                case 'materielCode':
                    this.listDetailsColumn = this.materielCodeColumn;
                    this.getmaterielCodeInfo();
                    break;
                case 'supplierCode':
                    this.listDetailsColumn = this.supplierCodeColumn;
                    this.getsupplierCodeInfo();
                    break;
                case 'customerCode':
                    this.listDetailsColumn = this.customerCodeColumn;
                    this.getcustomerCodeCodeInfo();
                    break;
                case 'inspectUnit':
                    this.listDetailsColumn = this.inspectUnitColumn;
                    this.getinspectUnitInfo();
                    break;
                default:
                    break;
            }
        },
        // 获取物料类型编码
        getmaterielTypeCodeInfo() {
            this.dialogTableLoading = true;
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree', {
                params: {
                    conditionList: [{
                        fieldName: 'fieldName',
                        operation: 'EQ',
                        value: '1',
                    }]
                }
            }).then(res => {
                this.dialogTableLoading = false;
                this.listDetailsData = res.data;
                this.listDetailsData = this.listDetailsData.filter(item => item.materialTypeCode !== 'SAP');
                const clickHandler =  () => {
                    this.$nextTick(() => {
                        this.$refs.table.doLayout();
                    });
                };
                this.$nextTick(() => {
                    const icons = this.$refs.table.$el.querySelectorAll('.el-table__expand-icon');
                    icons.forEach((icon, index, arr) => {
                        if (index === arr.length - 1) {
                            icon.addEventListener('click', clickHandler, false);
                        }
                        icon.click();
                    });
                });
            });
        },
        // 获取料号
        getmaterielCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
            };
            if (this.dialogForm[0].value) {
                params.conditionList.push({
                    fieldName: 'materialTypeCode',
                    value: this.dialogForm[0].value,
                    operation: 'EQ',
                    joinType: 'AND',
                });
            }
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
            this.$http.get('/basicdata/dicbasicmaterial/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取供应商编码
        getsupplierCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
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
            this.$http.get('/purchase/prsupplierinfo/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取客户编码
        getcustomerCodeCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {};
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/productionplan/salesplaninfo/listCustom', {
                current: val,
                size: this.pageSize_1,
            }, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取检验单位
        getinspectUnitInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'isInspectionUnit',
                    operation: 'EQ',
                    value: 1,
                    joinType: 'AND'
                }]
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
            this.$http.get('/basicdata/dicbasicunit/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'materielTypeCode':
                    this.getmaterielTypeCodeInfo();
                    break;
                case 'materielCode':
                    this.getmaterielCodeInfo(val);
                    break;
                case 'supplierCode':
                    this.getsupplierCodeInfo(val);
                    break;
                case 'customerCode':
                    this.getcustomerCodeCodeInfo(val);
                    break;
                case 'inspectUnit':
                    this.getinspectUnitInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'materielTypeCode':
                    this.getmaterielTypeCodeInfo();
                    break;
                case 'materielCode':
                    this.getmaterielCodeInfo();
                    break;
                case 'supplierCode':
                    this.getsupplierCodeInfo();
                    break;
                case 'customerCode':
                    this.getcustomerCodeCodeInfo();
                    break;
                case 'inspectUnit':
                    this.getinspectUnitInfo();
                    break;
                default:
                    break;
            }
        },
        currentChange(row) {
            this.rowObj = row;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'materielTypeCode':
                    if ((form.hasOwnProperty('materialTypeCode') && form.materialTypeCode !== '') || (form.hasOwnProperty('materialTypeName') && form.materialTypeName !== '')) {
                        let params = {
                            conditionList: []
                        };
                        if (form.hasOwnProperty('materialTypeCode')) {
                            params.conditionList.push({
                                fieldName: 'materialTypeCode',
                                joinType: 'AND',
                                operation: 'LIKE',
                                value: form.materialTypeCode,
                            });
                        }
                        if (form.hasOwnProperty('materialTypeName')) {
                            params.conditionList.push({
                                fieldName: 'materialTypeName',
                                joinType: 'AND',
                                operation: 'LIKE',
                                value: form.materialTypeName,
                            });
                        }
                        this.dialogTableLoading = true;
                        this.$http.get('/basicdata/dicbasicmaterialtype/page', {
                            params,
                        }).then(res => {
                            this.dialogTableLoading = false;
                            this.listDetailsData = res.data.records;
                        });
                    } else {
                        this.getmaterielTypeCodeInfo();
                    }
                    break;
                case 'materielCode':
                    this.getmaterielCodeInfo();
                    break;
                case 'supplierCode':
                    this.getsupplierCodeInfo();
                    break;
                case 'customerCode':
                    this.getcustomerCodeCodeInfo();
                    break;
                case 'inspectUnit':
                    this.getinspectUnitInfo();
                    break;
                default:
                    break;
            }
            // this.getWorkcenter();
        },
        // 列表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormDialogTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case 'materielTypeCode':
                    this.dialogForm[0].value = this.rowObj.materialTypeCode;
                    this.dialogForm[1].value = this.rowObj.materialTypeName;
                    this.dialogForm[2].value = '';
                    this.dialogForm[3].value = '';
                    break;
                case 'materielCode':
                    this.dialogForm[0].value = this.rowObj.materialTypeCode;
                    this.dialogForm[1].value = this.rowObj.materialTypeName;
                    this.dialogForm[2].value = this.rowObj.materialCode;
                    this.dialogForm[3].value = this.rowObj.materialName;
                    break;
                case 'supplierCode':
                    this.dialogForm[4].value = this.rowObj.supplierCode;
                    this.dialogForm[5].value = this.rowObj.supplierName;
                    break;
                case 'customerCode':
                    this.dialogForm[6].value = this.rowObj.kunnr;
                    this.dialogForm[7].value = this.rowObj.name1;
                    break;
                case 'inspectUnit':
                    this.dialogForm[12].value = this.rowObj.unitName;
                    this.inspectUnit = this.rowObj.unitCode;
                    break;
                default:
                    break;
            }
        },
        // 获取物料检验列表信息
        getData() {
            this.tableLoading = true;
            this.$http.get('/qc/dicqciqcinspectmethod/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        // 上表新增页面
        newRowParent() {
            this.dialog = 'new';
            this.dialogVisible = true;
            this.dialogForm[15].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogForm[14].value = this.sysUser.nickname;
        },
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogForm[12].value = item.inspectUnitName;
            this.inspectUnit = item.inspectUnit;
            this.dialogVisible = true;
            this.dialogForm[10].disabled = !(this.dialogForm[8].value === 'P');
            this.dialogForm[10].required = this.dialogForm[8].value === 'P';
            this.dialogForm[11].disabled = !(this.dialogForm[8].value === 'F');
            this.dialogForm[11].required = this.dialogForm[8].value === 'F';
        },
        selectionChange(selection) {
            this.isDelete = false;
            this.selection = selection;
            this.selection.forEach(item => {
                if (item.valid === 'Y') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/dicqciqcinspectmethod/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 提交上表新增或者修改数据
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            if (this.dialogForm[8].value === 'P') {
                obj.samplingScale = Number(obj.samplingScale);
                obj.samplingFixedQuantity = null;
            } else if (this.dialogForm[8].value === 'F') {
                obj.samplingScale = null;
                obj.samplingFixedQuantity = Number(obj.samplingFixedQuantity);
            } else {
                obj.samplingScale = null;
                obj.samplingFixedQuantity = null;
            }
            delete obj.updateBy;
            delete obj.updateTime;
            obj.inspectUnit = this.inspectUnit;
            this.submitLoading = true;
            if (this.dialog === 'new') {
                this.$http.post('/qc/dicqciqcinspectmethod/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success',
                    });
                    this.dialogVisible = false;
                    this.getData();
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/qc/dicqciqcinspectmethod/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success',
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 导出所有
        allExport() {
            this.$http.get('/qc/dicqciqcinspectmethod/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有物料检验方式.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids.join(',');
            this.$http.get('/qc/dicqciqcinspectmethod/export', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '选中导出物料检验方式.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/dicqciqcinspectmethod/template', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料检验方式模板.xls';
                    $a.click();
                }
            });
        },
        // 导入
        uploadSuccess() {
            this.getData();
        },
    }
};
</script>

<style lang="stylus" scoped>
.upload-file
    display inline-block
.materialtest
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
</style>
