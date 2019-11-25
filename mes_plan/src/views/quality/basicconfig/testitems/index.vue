<template lang="pug">
    ebrain-main.testitems
        ebrain-frame(
            title="检验项目")
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
            template(#inspectStep)
                el-col(:span="12")
                    el-form-item(label="检验工序")
                        el-input(readonly=true v-model="dialogForm[5].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('inspectStep')" :disabled="isDisabled")
            template(#inspectionUnitName)
                el-col(:span="12")
                    el-form-item(label="检验单位" prop="inspectionUnitName")
                        el-input(readonly=true v-model="dialogForm[9].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('inspectionUnitName')")
            template(#measuringInstrumentsType)
                el-col(:span="12")
                    el-form-item(label="计量仪器类型" prop="measuringInstrumentsType")
                        el-input(readonly=true v-model="dialogForm[10].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('measuringInstrumentsType')")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            :auto-upload="false"
                            :on-change="changeHandler"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            action=""
                            name="fileList")
                            el-button(type="primary") 上传附件
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork_1"
            @resetDialog="resetDialog_1"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="50vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @current-change="currentChange"
            @submit="submitFormDialogTable(type)")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'workshop',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            delList: [],
            measurToolsAccountId: '',
            inspectionUnit: '',
            type: '',
            conditionList: [],
            isDelete: false,
            dialogSearchForm: {},
            inspectStep: '',
            currentRowKeyInstrument: '',
            tableDataInstrument: [],
            isDisabled: true,
            dialogTableLoading: false,
            ids: [],
            selection: [],
            rowObj: {},
            dialogVisibleTable: false,
            listDetailsData: [],
            currentRowKeyDialogTable: '',
            pageTotal_1: 0,
            pageSize_1: 20,
            currentPage_1: 1,
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            tableColumnInstrument: [{
                label: '设备类型编码',
                prop: 'equipNum',
                showOverflowTooltip: true,
            }, {
                label: '设备类型名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }],
            listDetailsColumn: [],
            inspectStepColumn: [{
                label: '检验工序编码',
                prop: 'processCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '检验工序名称',
                prop: 'processName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            inspectionUnitColumn: [{
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
            instrumentsColumn: [{
                label: '计量器具类型',
                prop: 'measurType',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableColumn: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '检验项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            // }, {
            //     label: '检验项目等级',
            //     prop: 'itemLevel',
            //     showOverflowTooltip: true,
            //     formatter: (row, column, cell) => {
            //         return this.storeDict['DIC_IQC_INSPECT_ITEM_LEVEL'][cell];
            //     }
            // }, {
            //     label: '检验项目类型',
            //     prop: 'itemType',
            //     showOverflowTooltip: true,
            //     formatter: (row, column, cell) => {
            //         return this.storeDict['DIC_IQC_INSPECT_ITEM_TYPE'][cell];
            //     }
            // }, {
            //     label: '取样方式',
            //     prop: 'samplingMode',
            //     showOverflowTooltip: true,
            //     formatter: (row, column, cell) => {
            //         return this.storeDict['DIC_IQC_SAMPLING_METHOD'][cell];
            //     }
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
            // }, {
            //     label: '检验类型',
            //     prop: 'inspectType',
            //     showOverflowTooltip: true,
            //     formatter: (row, column, cell) => {
            //         return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
            //     }
            // }, {
            //     label: '检验工序',
            //     prop: 'inspectStepName',
            //     showOverflowTooltip: true,
            }, {
                label: '试样数',
                prop: 'samplesNumber',
                showOverflowTooltip: true,
            }, {
                label: '样品尺寸',
                prop: 'sampleSize',
                showOverflowTooltip: true,
            }, {
                label: '是否委外',
                prop: 'outsourcing',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.isResponsiblePersonnel[cell];
                }
            }, {
                label: '芯板厚度需大于(mm)',
                prop: 'thicknessRequirement',
                showOverflowTooltip: true,
            }, {
                label: '计量器具类型',
                prop: 'measuringInstrumentsType',
                showOverflowTooltip: true,
            }, {
                label: '默认内部编码',
                prop: 'defaultInternalCode',
                showOverflowTooltip: true,
            }, {
                label: '检验单位',
                prop: 'inspectionUnitName',
                showOverflowTooltip: true,
            }, {
                label: '是否有效',
                prop: 'valid',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_VALID'][cell];
                }
            }, {
                label: '维护人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '检验项目代码',
                prop: 'itemCode',
                value: '',
                required: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                value: '',
                required: true,
            }, {
                label: '检验项目等级',
                prop: 'itemLevel',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_ITEM_LEVEL'],
                value: '',
                required: true,
            }, {
                label: '检验项目类型',
                prop: 'itemType',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_ITEM_TYPE'],
                value: '',
                required: true,
            }, {
                label: '检验类型',
                prop: 'inspectType',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                value: '',
                required: true,
                disabled: false,
                change: val => {
                    this.isDisabled = this.dialogForm[4].value === 'PQC' ? false : true;
                    this.dialogForm[5].value = '';
                }
            }, {
                prop: 'inspectStepName',
                value: '',
                slot: 'inspectStep',
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'],
                value: '',
                required: true,
            }, {
                label: '是否有效',
                prop: 'valid',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_ITEM_VALID'],
                value: '',
                required: true,
            }, {
                label: '取样方式',
                prop: 'samplingMode',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_SAMPLING_METHOD'],
                value: '',
                required: true,
            }, {
                slot: 'inspectionUnitName',
                label: '检验单位',
                prop: 'inspectionUnitName',
                value: '',
            }, {
                slot: 'measuringInstrumentsType',
                label: '计量仪器类型',
                prop: 'measuringInstrumentsType',
                value: '',
                required: true,
            }, {
                label: '默认内部编码',
                prop: 'defaultInternalCode',
                value: '',
                disabled: true,
            }, {
                label: '试样数',
                prop: 'samplesNumber',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg =  /^[1-9]\d*$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '样品尺寸',
                prop: 'sampleSize',
                value: '',
                // rule: {
                //     validator(rule, value, callback) {
                //         const reg = /^\d+(\.\d{0,3})?$/;
                //         if (!value) callback();
                //         if (!reg.test(value) || !Number(value)) {
                //             return callback(new Error('请输入正数且最多保留三位小数或空!'));
                //         } else {
                //             callback();
                //         }
                //     },
                //     trigger: 'blur'
                // },
            }, {
                label: '是否委外',
                prop: 'outsourcing',
                value: '',
                type: 'select',
                required: true,
                option: dict.isResponsiblePersonnel,
            }, {
                label: '芯板厚度大于',
                prop: 'thicknessRequirement',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,3})?$/;
                        if (!value) callback();
                        if (!reg.test(value) || !Number(value)) {
                            return callback(new Error('请输入正数且最多保留三位小数或空!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '测试频率',
                prop: 'inspectRate',
                value: '',
                type: 'textarea',
            }, {
                label: '检测依据',
                prop: 'inspectBasis',
                value: '',
                type: 'textarea',
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }, {
                slot: 'upload'
            }],
            listMeterColumn: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '设备类型编码',
                prop: 'equipNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备类型名称',
                prop: 'equipName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备分类',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '设备型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'corp',
                showOverflowTooltip: true,
            }, {
                label: '维护人员',
                prop: 'matnPerson',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'matnDt',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'rm',
                showOverflowTooltip: true,
            }],
            buttons: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_dicqciqcinspectmateriel_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'qc_dicqciqcinspectmateriel_edit',
            // }, {
            //     label: '删除',
            //     click: () => this.delRowParent(),
            //     className: 'iconfont iconstatus-delete',
            //     disabled: () => this.selection.length === 0 || this.isDelete,
            //     permi: 'qc_dicqciqcinspectmateriel_dels',
            }, {
                label: '全部导出',
                click: () => this.allExport(),
                className: 'iconfont iconstatus-Export_all',
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
                action: '/qc/iqcinspectitem/import',
                onSuccess: (response, file, fileList) => this.uploadSuccess(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '检验项目代码',
                prop: 'itemCode',
                value: ''
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                value: ''
            }, {
                label: '检验类型',
                prop: 'inspectType',
                type: 'select',
                option: '',
                value: '',
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                type: 'select',
                option: '',
                value: '',
            }, {
                label: '是否有效',
                prop: 'valid',
                type: 'select',
                option: '',
                value: '',
            }],
            listDetailsMeter: [],
            dialogVisibleMeter: false,
            pageTotal: 0,
            uploadList: [],
            pageSize: 20,
            currentPage: 1,
            currentRowKey: '',
            dialog: '',
            dialogVisible: false,
            searchVisible: true,
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
                this.inspectStep = '';
                this.rowObj = {};
                this.dialogSearchForm = {};
                this.pageSize_1 = 20;
                this.pageTotal_1 = 0;
                this.currentPage_1 = 1;
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.uploadList = [];
                this.tableDataInstrument = [];
                this.measurToolsAccountId = '';
            }
        },
    },
    created() {
        Promise.all([
            this.queryDict('DIC_IQC_SAMPLING_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_ITEM_LEVEL'),
            this.queryDict('DIC_IQC_INSPECT_ITEM_TYPE'),
            this.queryDict('DIC_IQC_INSPECT_TYPE'),
            this.queryDict('DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_ITEM_VALID'),
        ]).then(() => {
            this.searchForm[2].option = this.storeDict['DIC_IQC_INSPECT_TYPE'];
            this.searchForm[3].option = this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'];
            this.searchForm[4].option = this.storeDict['DIC_IQC_INSPECT_ITEM_VALID'];
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
        // 获取物料检验列表信息
        getData() {
            this.tableLoading = true;
            this.$http.get('/qc/iqcinspectitem/page', {
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
        // 获取弹出表  点击时的数据
        currentChange(row) {
            this.rowObj = row;
        },
        submitFormDialogTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case 'inspectStep':
                    this.dialogForm[5].value = this.rowObj.processName;
                    this.inspectStep = this.rowObj.processCode;
                    break;
                case 'inspectionUnitName':
                    this.dialogForm[9].value = this.rowObj.unitName;
                    this.inspectionUnit = this.rowObj.unitCode;
                    break;
                case 'measuringInstrumentsType':
                    this.dialogForm[10].value = this.rowObj.measurType;
                    this.dialogForm[11].value = this.rowObj.intCode;
                    this.measurToolsAccountId = this.rowObj.id || '';
                    break;
                default:
                    break;
            }
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'inspectStep':
                    this.getProcessInfo(val);
                    break;
                case 'inspectionUnitName':
                    this.getinspectUnitInfo(val);
                    break;
                case 'measuringInstrumentsType':
                    this.getInstrumentsInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'inspectStep':
                    this.getProcessInfo(val);
                    break;
                case 'inspectionUnitName':
                    this.getinspectUnitInfo(val);
                    break;
                case 'measuringInstrumentsType':
                    this.getInstrumentsInfo(val);
                    break;
                default:
                    break;
            }
        },
        enterTableDetails(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            switch (type) {
                case 'inspectStep':
                    this.listDetailsColumn = this.inspectStepColumn;
                    this.getProcessInfo();
                    break;
                case 'inspectionUnitName':
                    this.listDetailsColumn = this.inspectionUnitColumn;
                    this.getinspectUnitInfo();
                    break;
                case 'measuringInstrumentsType':
                    this.listDetailsColumn = this.instrumentsColumn;
                    this.getInstrumentsInfo();
                    break;
                default:
                    break;
            }
        },
        // 获取计量器具信息
        getInstrumentsInfo(val = 1) {
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
            this.$http.get('/qc/dicqcmeasurtoolsaccount/iqcinspectitemPage', {
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
                                operation: 'LIKE',
                                joinType: 'AND',
                                value: this.dialogSearchForm[i],
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
        // 获取工序信息
        getProcessInfo(val = 1) {
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
            this.$http.get('/productionplan/ppprocess/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 列表内搜索
        searchFormWork_1(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'inspectStep':
                    this.getProcessInfo();
                    break;
                case 'inspectionUnitName':
                    this.getinspectUnitInfo();
                    break;
                case 'measuringInstrumentsType':
                    this.getInstrumentsInfo();
                    break;
                default:
                    break;
            }
        },
        // 列表内清空
        resetDialog_1(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        // 上表新增页面
        newRowParent() {
            this.dialog = 'new';
            this.isDisabled = true;
            this.dialogVisible = true;
            this.dialogForm[0].disabled = false;
            this.dialogForm[2].value = 'N';
            this.dialogForm[4].value = 'IQC';
            this.dialogForm[4].disabled = false;
            this.dialogForm[6].value = 'QUANTITATIVE';
        },
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            this.dialogForm[4].disabled = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.inspectionUnit = item.inspectionUnit;
            this.measurToolsAccountId = item.measurToolsAccountId;
            this.dialogForm[0].disabled = true;
            this.inspectStep = item.inspectStep;
            this.isDisabled = item.inspectType === 'PQC' ? false : true;
            this.getUploadList();
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisible = true;
        },
        selectionChange(selection) {
            this.selection = selection;
            this.isDelete = false;
            this.selection.forEach(item => {
                if (item.valid !== 'N') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectitem/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
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
                if (v.prop === 'thicknessRequirement') {
                    obj[v.prop] = Number(v.value);
                } else {
                    obj[v.prop] = v.value;
                }
            });
            obj.inspectStep = this.inspectStep;
            obj.inspectionUnit = this.inspectionUnit;
            obj.measurToolsAccountId = this.measurToolsAccountId;
            delete obj.updateBy;
            delete obj.updateTime;
            this.submitLoading = true;
            if (this.dialog === 'new') {
                obj.itemFile = 'DIC_QC_IQC_INSPECT_ITEM';
                this.$http.post('/qc/iqcinspectitem/save', obj).then((res) => {
                    const { data } = res;
                    this.uploadAttach(data.id, data.itemFile).then(() => {
                        this.submitLoading = false;
                        this.dialogVisible = false;
                        this.getData();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/qc/iqcinspectitem/updateById', obj).then(() => {
                    this.removeFileList();
                    const item = this.tableData.find(v => v.id === this.currentRowKey);
                    this.uploadAttach(obj.id, item.itemFile).then(() => {
                        this.submitLoading = false;
                        this.getData();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisible = false;
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 导出所有
        allExport() {
            this.$http.get('/qc/iqcinspectitem/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有检验项目.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids.join(',');
            this.$http.get('/qc/iqcinspectitem/export', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出选中检验项目.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/iqcinspectitem/template', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '检验项目模板.xls';
                    $a.click();
                }
            });
        },
        // 导入
        uploadSuccess() {
            this.getData();
        },
        // 获取上传文件
        changeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        // 删除文件
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
            // if (file.status === 'success') {
            //     this.$http.delete(`/qc/qcfile/removeById/${file.id}`).then(({ code }) => {
            //         if (code === 0) {
            //             this.$message.success('删除成功!');
            //         }
            //     });
            // }
        },
        previewChangeHandler(file) {
            if (file.status === 'success') {
                window.open(file.url, '_blank');
            } else if (file.status === 'ready') {
                const f = new FileReader();
                f.addEventListener('load', () => {
                    window.open(f.result, '_blank');
                });
                f.readAsDataURL(file.raw);
            }
        },
        // 获取文件
        getUploadList() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.$http.get(`/qc/qcfile/getList/${item.itemFile}/${item.id}`).then(({ data }) => {
                const list = data.map(v => ({
                    name: v.fileName,
                    url: v.fileUrl,
                    id: v.id,
                }));
                this.uploadList = list;
                this.delList = list;
            });
        },
        // 上传附件
        uploadAttach(businessId, businessCode) {
            let fd = new FormData();
            if (!this.uploadList.some(v => v.status === 'ready')) return Promise.resolve();
            this.uploadList.forEach(v => {
                if (v.status === 'ready') {
                    fd.append('fileList', v.raw);
                }
            });
            return this.$http.post(`/qc/qcfile/save/${businessCode}/${businessId}`, fd, {
                headers: {
                    contentType: 'multipart/form-data',
                },
            });
        },
        // 删除附件
        removeFileList() {
            let arr = this.delList.filter(item => !(this.uploadList.some(v => v.id === item.id)));
            if (arr.length) {
                for (let i = 0; i < arr.length; i++) {
                    this.$http.delete(`/qc/qcfile/removeById/${arr[i].id}`).then(({ code }) => {});
                }
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.upload-file
    display inline-block
.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        height 150px!important
.testitems
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
