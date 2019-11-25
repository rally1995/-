<template lang="pug">
    ebrain-main.materialqualitytest
        ebrain-frame(title="物料检验方案")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    :loading='tableLoading'
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent"
                    row-key="id"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="rowDblClickHandler"
                    @page-change="changeCurrent"
                    @size-change='changeSize'
                    @current-change="currentChangeParent"
                    @selection-change="selectionChange")
        ebrain-frame(title="检验项目")
            template(#tools)
                ebrain-tools(:buttons="btnsDown")
            template(#table)
                ebrain-box-table(
                    :isPagination="false"
                    :loading="tableLoading_down"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @selection-change="selectionChangeDown")
        ebrain-dialog.dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#materielTypeCode)
                el-col(:span="12")
                    el-form-item(label="物料类别编码" prop="materielTypeCode" required)
                        el-input(readonly=true v-model="dialogFormParent[2].value" :disabled="materielDisabled")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('materielTypeCode')" :disabled="materielDisabled")
            template(#materielCode)
                el-col(:span="12")
                    el-form-item(label="料号" prop="materielCode")
                        el-input(readonly=true v-model="dialogFormParent[4].value" :disabled="materielDisabled")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('materielCode')" :disabled="materielDisabled")
            template(#supplierCode)
                el-col(:span="12")
                    el-form-item(label="供应商编码" prop="supplierCode")
                        el-input(readonly=true v-model="dialogFormParent[8].value" :disabled="supplierCode_disabled")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('supplierCode')" :disabled="supplierCode_disabled")
            template(#customerCode)
                el-col(:span="12")
                    el-form-item(label="客户编码" prop="customerCode")
                        el-input(readonly=true v-model="dialogFormParent[10].value" :disabled="customerCode_disabled")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('customerCode')" :disabled="customerCode_disabled")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#itemCode)
                el-col(:span="12")
                    el-form-item(label="检验项目编码" prop="itemCode" required)
                        el-input(readonly=true v-model="dialogFormSon[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail")
            template(#badDesc)
                el-col(:span="12")
                    el-form-item(label="不良代码名称" prop="badDesc")
                        el-input(readonly=true v-model="dialogFormSon[8].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('badDesc')")
            template(#measurType)
                el-col(:span="12")
                    el-form-item(label="计量器具类型" prop="measurType")
                        el-input(readonly=true v-model="dialogFormSon[9].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('measurType')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            :isShow="isShow"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            :disabled="subDisabled"
            :height="550"
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
        el-dialog(
            title="提示"
            :visible.sync="setDefault_dialog"
            width="30%")
            span 该组合已有默认物料检验方案是否把当前默认方案替换该方案？
            span(slot="footer" class="dialog-footer")
                el-button(@click="setDefault_dialog = false") 取 消
                el-button(type="primary" @click="subSetDefault") 确 定
        ebrain-dialog-export(
            :visible.sync="exportVisible"
            v-model="exportFilename"
            accept="xls,xlsx"
            export-url="/qc/dicqciqcinspectmateriel/exportAll"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-dialog-import(
            ref="import"
            :visible.sync="importVisible"
            accept="xls,xlsx"
            download-url="/qc/dicqciqcinspectmateriel/template"
            import-url="/qc/dicqciqcinspectmateriel/import"
            download-filename="物料检验方案模板.xlsx"
            :import-success="importSuccessHandler")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'materialqualitytest',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            order: '',
            materialCode: '',
            conditionList: [],
            importVisible: false,
            exportIds: [],
            exportFilename: '物料检验方案',
            exportVisible: false,
            measurToolsAccountId: '',
            iqcBadId: '',
            inspectionUnit: '',
            selectionDown: [],
            itemId: '',
            dialogSon: '',
            rowObjParent: {},
            subDisabled: false,
            materielDisabled: false,
            materialTypeCode: '',
            materialTypeName: '',
            supplierCode_disabled: true,
            customerCode_disabled: true,
            setDefault_dialog: false,
            ids: [],
            selection: [],
            dialogTableLoading: false,
            materielCodeRow: {},
            rowObj: {},
            type: '',
            isShow: true,
            listDetailsData: [],
            listDetailsColumn: [],
            dialogVisibleParent: false,
            uploadExecl: [],
            tableLoading: false,
            tableLoading_down: false,
            submitLoading: false,
            dialogVisibleSon: false,
            tableDataParent: [],
            tableDataSon: [],
            tableColumnSon: [{
                label: '检验项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                showOverflowTooltip: true,
            }, {
                label: '样品试样数',
                prop: 'sampleNum',
                showOverflowTooltip: true,
            }, {
                label: '典型值',
                prop: 'standardValue',
                showOverflowTooltip: true,
            }, {
                label: '标准值上限',
                prop: 'standardUpper',
                showOverflowTooltip: true,
            }, {
                label: '标准值下限',
                prop: 'standardLower',
                showOverflowTooltip: true,
            }, {
                label: '不良代码名称',
                prop: 'badDesc',
                showOverflowTooltip: true,
            }, {
                label: '计量器具类型',
                prop: 'measurType',
                showOverflowTooltip: true,
            }, {
                label: '默认内部编码',
                prop: 'intCode',
                showOverflowTooltip: true,
            }, {
                label: '检验频度周期',
                prop: 'inspFreqCycle',
                showOverflowTooltip: true,
            }, {
                label: '周期类型',
                prop: 'cycleType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.cycleType[cell];
                }
            }, {
                label: '维护人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '最新检验时间',
                prop: 'checkTime',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '物料检验方案编码',
                prop: 'inspectMaterielCode',
                showOverflowTooltip: true,
            }, {
                label: '物料检验方案名称',
                prop: 'inspectMaterielName',
                showOverflowTooltip: true,
            }, {
                label: '质检类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '物料类别编码',
                prop: 'materielTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'materielCode',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'inspectMaterielStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_MATERIEL_STATUS'][cell];
                }
            }, {
                label: '是否默认',
                prop: 'defaultInspect',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'][cell];
                }
            }, {
                label: '维护人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护时间',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '物料检验方案编码',
                prop: 'inspectMaterielCode',
                disabled: true,
                value: '',
            }, {
                label: '物料检验方案名称',
                prop: 'inspectMaterielName',
                required: true,
                value: '',
                maxLength: false
            }, {
                label: '物料类别编码',
                prop: 'materielTypeCode',
                required: true,
                value: '',
                slot: 'materielTypeCode',
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                disabled: true,
                value: '',
            }, {
                label: '物料料号',
                prop: 'materielCode',
                value: '',
                slot: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
                disabled: true,
                value: '',
            }, {
                label: '检验类型',
                prop: 'inspectType',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                change: val => {
                    this.inspectType = val;
                    if (val === 'IQC') {
                        this.supplierCode_disabled = false;
                        this.customerCode_disabled = true;
                        this.dialogFormParent[10].value = '';
                        this.dialogFormParent[11].value = '';
                    } else if (val === 'PQC' || val === 'FQC') {
                        this.supplierCode_disabled = true;
                        this.customerCode_disabled = false;
                        this.dialogFormParent[8].value = '';
                        this.dialogFormParent[9].value = '';
                    } else {
                        this.supplierCode_disabled = true;
                        this.customerCode_disabled = true;
                        this.dialogFormParent[8].value = '';
                        this.dialogFormParent[9].value = '';
                        this.dialogFormParent[10].value = '';
                        this.dialogFormParent[11].value = '';
                    }
                }
            }, {
                label: '超期复检',
                prop: 'recheckOverdue',
                required: true,
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_MATERIEL_OVERDU'],
            }, {
                label: '供应商',
                prop: 'supplierCode',
                disabled: false,
                value: '',
                slot: 'supplierCode',
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                disabled: true,
                value: '',
            }, {
                label: '客户编码',
                prop: 'customerCode',
                disabled: false,
                value: '',
                slot: 'customerCode',
            }, {
                label: '客户名称',
                prop: 'customerName',
                disabled: true,
                value: '',
            }, {
                label: '是否默认',
                prop: 'defaultInspect',
                required: true,
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'],
            }, {
                label: '维护人员',
                prop: 'updateBy',
                disabled: true,
                value: '',
            }, {
                label: '维护日期',
                prop: 'updateTime',
                disabled: true,
                value: '',
            }, {
                label: '状态',
                prop: 'inspectMaterielStatus',
                required: true,
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_MATERIEL_STATUS'],
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea'
            }],
            dialogFormSon: [{
                slot: 'itemCode',
                label: '检验项目编码',
                prop: 'itemCode',
                value: '',
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                disabled: true,
                required: true,
                value: '',
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                disabled: true,
                required: true,
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'],
                value: '',
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                value: '',
                disabled: true,
            }, {
                label: '抽样试样数',
                prop: 'sampleNum',
                required: true,
                value: '',
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
                // rule: {
                //     validator: (rule, value, callback) => {
                //         if (this.dialogFormSon[2].value === 'QUANTITATIVE') {
                //             let reg =  /^\d+(\.?\d{0,4})$/;
                //             if (value !== '') {
                //                 if (!reg.test(value)) {
                //                     callback(new Error('请输入0或正数且最多三位小数'));
                //                 } else {
                //                     callback();
                //                 }
                //             } else {
                //                 callback();
                //             }
                //         } else {
                //             callback();
                //         }
                //     },
                //     trigger: 'blur',
                // },
                label: '典型值',
                prop: 'standardValue',
                required: true,
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogFormSon[2].value === 'QUANTITATIVE') {
                            let reg =  /^\d+(\.?\d{0,3})$/;
                            if (value !== '') {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入非负数且最多三位小数'));
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
                label: '标准值上限',
                prop: 'standardUpper',
                value: '',
                required: false,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogFormSon[2].value === 'QUANTITATIVE') {
                            let reg =  /^\d+(\.?\d{0,3})$/;
                            if (value !== '') {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入非负数且最多三位小数'));
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
                label: '标准值下限',
                prop: 'standardLower',
                value: '',
                required: false,
            }, {
                slot: 'badDesc',
                label: '不良代码',
                prop: 'badDesc',
                value: '',
                required: true,
            }, {
                slot: 'measurType',
                label: '计量器具类型',
                prop: 'measurType',
                value: '',
                required: true,
            }, {
                label: '默认内部编码',
                prop: 'intCode',
                value: '',
                disabled: true,
            }, {
                label: '检验频度周期',
                prop: 'inspFreqCycle',
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
                label: '周期类型',
                prop: 'cycleType',
                value: '',
                required: true,
                type: 'select',
                option: () => dict.cycleType,
            }, {
                label: '维护人',
                prop: 'updateBy',
                value: '',
                // required: true,
                disabled: true,
            }, {
                label: '最新检验时间',
                prop: 'checkTime',
                value: '',
                // required: true,
                disabled: true,
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
            inspectUnitColumn: [{
                label: '检验项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '检验类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
            }, {
                label: '计量器具类型',
                prop: 'measuringInstrumentsType',
                showOverflowTooltip: true,
            }, {
                label: '默认内部编码',
                prop: 'defaultInternalCode',
                showOverflowTooltip: true,
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
            planCodeColumn: [{
                label: '质检方案编码',
                prop: 'planCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '质检方案名称',
                prop: 'planName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            iqcBadColumn: [{
                label: '不良代码编码',
                prop: 'badCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '不良代码名称',
                prop: 'badDesc',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            measurTypeColumn: [{
                label: '计量器具类别',
                prop: 'measurType',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '规格型号',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '出厂编码',
                prop: 'serialNum',
                showOverflowTooltip: true,
            }, {
                label: '部门科室',
                prop: 'departmentName',
                showOverflowTooltip: true,
            }, {
                label: '具体使用',
                prop: 'specifUse',
                showOverflowTooltip: true,
            }, {
                label: '兼职计量员',
                prop: 'partTimeMeterName',
                showOverflowTooltip: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_dicqciqcinspectmateriel_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1,
                permi: 'qc_dicqciqcinspectmateriel_edit',
            }, {
                label: '设置默认',
                click: () => this.setDefault(),
                disabled: () => this.selection.length !== 1 || this.selection[0].defaultInspect === 'Y',
                className: 'iconfont iconstatus-start-up',
                permi: 'qc_dicqciqcinspectmateriel_default',
            }, {
                label: '导出',
                className: 'iconfont iconstatus-export',
                permi: false,
                click: () => {
                    this.exportVisible = !this.exportVisible;
                },
            }, {
                label: '导入',
                className: 'iconfont iconstatus-Import',
                permi: false,
                click: () => {
                    this.importVisible = !this.importVisible;
                },
            }, {
                label: '复制',
                click: () => this.copy(),
                disabled: () => this.selection.length !== 1,
                className: 'iconfont iconstatus-copy',
                permi: 'qc_iqcinspectplan_add',
            }, {
                label: '时间升序',
                click: () => this.positiveSequence(),
                // className: 'el-icon-top',
                permi: 'qc_iqcinspectplan_add',
            }, {
                label: '时间降序',
                click: () => this.invertedOrder(),
                // className: 'el-icon-bottom',
                permi: 'qc_iqcinspectplan_add',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => !this.rowObjParent.hasOwnProperty('id'),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'com.ebrain.mes_iqcinspectmrdet_add',
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.selectionDown.length !== 1,
                className: 'iconfont iconstatus-edit',
                permi: 'com.ebrain.mes_iqcinspectmrdet_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selectionDown.length === 0,
                className: 'iconfont iconstatus-edit',
                permi: 'com.ebrain.mes_iqcinspectmrdet_dels',
            }],
            searchForm: [{
                label: '物料检验方案名称',
                prop: 'inspectMaterielName',
                value: ''
            }, {
                label: '物料类别编码',
                prop: 'materielTypeCode',
                value: ''
            }, {
                label: '物料料号',
                prop: 'materialCode',
                value: ''
            }, {
                label: '检验类型',
                prop: 'inspectType',
                value: '',
                type: 'select',
                option: '',
            }, {
                label: '状态',
                prop: 'inspectMaterielStatus',
                value: '',
                type: 'select',
                option: '',
            }],
            dialogVisibleTable: false,
            currentRowKeyDialogTable: '',
            currentRowKeyParent: '',
            currentRowKeySon: '',
            dialogType: '',
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageSize_1: 20,
            pageTotal_1: 0,
            currentPage_1: 1,
            treeVisible: false,
            treeLoading: false,
            uploadList: [],
            addDisabled: false,
            submitType: 'material',
            searchVisible: true,
            inspectType: '',
            planCode_disabled: false,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            permissions: state => state.permissions,
        }),
        default() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (!item) {
                return true;
            } else {
                return item.defaultInspect === 'Y' || item.inspectMaterielStatus !== '1' ? true : false;
            }
        },
        editDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (!item) {
                return true;
            } else {
                const itemSon = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                return itemSon && item.inspectMaterielStatus === '0' ? false : true;
            }
        },
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.inspectType = '';
                this.supplierCode_disabled = true;
                this.customerCode_disabled = true;
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.rowObj = {};
                this.dialogSearchForm = {};
                this.listDetailsData = [];
                this.pageSize_1 = 20;
                this.currentPage_1 = 1;
                this.pageTotal_1 = 0;
            }
        },
        dialogVisibleSon(val) {
            if (!val) {
                this.dialogFormSon[6].required = false;
                this.dialogFormSon[7].required = false;
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('DIC_IQC_INSPECT_TYPE'),
            this.queryDict('DIC_IQC_INSPECT_MATERIEL_OVERDU'),
            this.queryDict('DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'),
            this.queryDict('DIC_IQC_INSPECT_MATERIEL_STATUS'),
            this.queryDict('DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD')
        ]).then(() => {
            this.searchForm[3].option = this.storeDict['DIC_IQC_INSPECT_TYPE'];
            this.searchForm[4].option = this.storeDict['DIC_IQC_INSPECT_MATERIEL_STATUS'];
            this.queryMaterialQualiutyTest(this.order);
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // table 弹窗
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
                case 'planCode':
                    this.listDetailsColumn = this.planCodeColumn;
                    this.getplanCodeInfo();
                    break;
                case 'badDesc':
                    this.listDetailsColumn = this.iqcBadColumn;
                    this.getIQCBadInfo();
                    break;
                case 'measurType':
                    this.listDetailsColumn = this.measurTypeColumn;
                    this.getInstrumentsInfo();
                    break;
                default:
                    this.listDetailsColumn = this.inspectUnitColumn;
                    this.getTestItemsInfo();
                    break;
            }
        },
        // 获取计量器具信息
        getInstrumentsInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                latestCalibDateEnd: '',
                latestCalibDateStart: '',
                conditionList: [{
                    fieldName: 'measurStatus',
                    operation: 'LIKE',
                    joinType: 'AND',
                    value: '1',
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
            this.$http.post('/qc/dicqcmeasurtoolsaccount/page', null, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取物料类型编码
        getmaterielTypeCodeInfo() {
            this.dialogTableLoading = true;
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree').then(res => {
                this.dialogTableLoading = false;
                this.listDetailsData = res.data;
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
            if (this.dialogFormParent[2].value) {
                params.materialType = this.dialogFormParent[2].value;
                this.$http.get('/basicdata/dicbasicmaterial/pageByType', {
                    params,
                }).then(res => {
                    this.dialogTableLoading = false;
                    this.currentPage_1 = val;
                    this.listDetailsData = res.data.records;
                    this.pageTotal_1 = res.data.total;
                });
            } else {
                this.$http.get('/basicdata/dicbasicmaterial/page', {
                    params,
                }).then(res => {
                    this.dialogTableLoading = false;
                    this.currentPage_1 = val;
                    this.listDetailsData = res.data.records;
                    this.pageTotal_1 = res.data.total;
                });
            }
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
        // 获取质检方案编码
        getplanCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'inspectStatus',
                    operation: 'EQ',
                    value: 1,
                    joinType: 'AND',
                }]
            };
            if (this.inspectType) {
                params.conditionList.push({
                    fieldName: 'inspectType',
                    operation: 'EQ',
                    value: this.inspectType,
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
            this.$http.get('/qc/iqcinspectplan/page', {
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
                case 'planCode':
                    this.getplanCodeInfo(val);
                    break;
                case 'badDesc':
                    this.getIQCBadInfo(val);
                    break;
                case 'measurType':
                    this.getInstrumentsInfo(val);
                    break;
                default:
                    this.getTestItemsInfo(val);
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
                case 'planCode':
                    this.getplanCodeInfo();
                    break;
                case 'badDesc':
                    this.getIQCBadInfo();
                    break;
                case 'measurType':
                    this.getInstrumentsInfo();
                    break;
                default:
                    this.getTestItemsInfo();
                    break;
            }
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
                case 'planCode':
                    this.getplanCodeInfo();
                    break;
                case 'badDesc':
                    this.getIQCBadInfo();
                    break;
                case 'measurType':
                    this.getInstrumentsInfo();
                    break;
                default:
                    this.getTestItemsInfo();
                    break;
            }
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
                    this.dialogFormParent[2].value = this.rowObj.materialTypeCode;
                    this.dialogFormParent[3].value = this.rowObj.materialTypeName;
                    this.dialogFormParent[4].value = '';
                    this.dialogFormParent[5].value = '';
                    break;
                case 'materielCode':
                    this.dialogFormParent[2].value = this.rowObj.materialTypeCode;
                    this.dialogFormParent[3].value = this.rowObj.materialTypeName;
                    this.dialogFormParent[4].value = this.rowObj.materialCode;
                    this.dialogFormParent[5].value = this.rowObj.materialName;
                    this.materielCodeRow = this.rowObj;
                    break;
                case 'supplierCode':
                    this.dialogFormParent[8].value = this.rowObj.supplierCode;
                    this.dialogFormParent[9].value = this.rowObj.supplierName;
                    break;
                case 'customerCode':
                    this.dialogFormParent[10].value = this.rowObj.kunnr;
                    this.dialogFormParent[11].value = this.rowObj.name1;
                    break;
                case 'badDesc':
                    this.dialogFormSon[8].value = this.rowObj.badDesc;
                    this.iqcBadId = this.rowObj.id;
                    break;
                case 'measurType':
                    this.dialogFormSon[9].value = this.rowObj.measurType;
                    this.dialogFormSon[10].value = this.rowObj.intCode;
                    this.measurToolsAccountId = this.rowObj.id;
                    break;
                default:
                    this.dialogFormSon[0].value = this.rowObj.itemCode;
                    this.dialogFormSon[1].value = this.rowObj.itemName;
                    this.dialogFormSon[2].value = this.rowObj.analysisMethod;
                    this.dialogFormSon[3].value = this.rowObj.inspectionUnitName;
                    this.dialogFormSon[4].value = this.rowObj.samplesNumber;
                    this.dialogFormSon[5].value = '';
                    this.dialogFormSon[6].value = '';
                    this.dialogFormSon[7].value = '';
                    this.dialogFormSon[6].required = this.dialogFormSon[2].value === 'QUANTITATIVE';
                    this.dialogFormSon[7].required = this.dialogFormSon[2].value === 'QUANTITATIVE';
                    this.dialogFormSon[9].value = this.rowObj.measuringInstrumentsType;
                    this.dialogFormSon[10].value = this.rowObj.defaultInternalCode;
                    this.itemId = this.rowObj.id;
                    this.inspectionUnit = this.rowObj.inspectionUnit;
                    this.measurToolsAccountId = this.rowObj.measurToolsAccountId;
                    break;
            }
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.conditionList = [];
            this.materialCode = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'materialCode') {
                        this.materialCode = v.value;
                    } else {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                            joinType: 'AND',
                        });
                    }
                }
            });
            this.currentPage = 1;
            this.queryMaterialQualiutyTest(this.order);
        },
        queryMaterialQualiutyTest(order) {
            this.tableLoading = true;
            this.tableDataParent = [];
            this.$http.post('/qc/dicqciqcinspectmateriel/page', null, {
                params: {
                    order,
                    materialCode: this.materialCode,
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                }
            }).then(({ data }) => {
                this.tableLoading = false;
                this.pageTotal = data.total;
                this.tableDataParent = data ? data.records : [];
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.queryMaterialQualiutyTest(this.order);
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.queryMaterialQualiutyTest(this.order);
        },
        currentChange(row) {
            this.rowObj = row;
        },
        // 新增页面
        newRow() {
            this.dialogType = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[6].disabled = false;
            this.planCode_disabled = false;
            this.dialogFormParent[12].value = 'Y';
            this.dialogFormParent[14].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogFormParent[13].value = this.sysUser.nickname;
            this.dialogFormParent[15].value = '1';
        },
        // 上表修改
        editRowParent(row) {
            this.dialogType = 'edit';
            this.dialogVisibleParent = true;
            this.rowKeyObj = row || this.selection[0];
            // this.planCodeId = this.rowKeyObj.planId;
            this.dialogVisibleParent = true;
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.dialogFormParent[6].disabled = true;
            this.planCode_disabled = true;
            if (this.dialogFormParent[6].value === 'IQC') {
                this.supplierCode_disabled = false;
            } else if (this.dialogFormParent[6].value === 'PQC' || this.dialogFormParent[6].value === 'FQC') {
                this.customerCode_disabled = false;
            } else {
                this.supplierCode_disabled = true;
                this.customerCode_disabled = true;
            }
            this.inspectType = this.dialogFormParent[6].value;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('qc_dicqciqcinspectmateriel_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        look(row) {
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.materielDisabled = true;
            this.subDisabled = true;
            // this.isDisabled = true;
            // this.btnsDialog[0].disabled = true;
        },
        // 获取上表多选
        selectionChange(selection) {
            this.selection = selection;
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            // obj.planId = this.planCodeId;
            if (this.dialogType === 'new') {
                this.$http.post('/qc/dicqciqcinspectmateriel/save', obj).then(() => {
                    this.submitLoading = false;
                    this.queryMaterialQualiutyTest(this.order);
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.rowKeyObj.id;
                this.$http.put('/qc/dicqciqcinspectmateriel/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.queryMaterialQualiutyTest(this.order);
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 全部导出
        allExport() {
            this.$http.get('/qc/dicqciqcinspectmateriel/exportAll', {
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
        // 设置默认
        setDefault() {
            this.submitLoading = true;
            this.$http.get(`/qc/dicqciqcinspectmateriel/checkDefault/${this.selection[0].id}`).then(res => {
                if (res.data) {
                    this.setDefault_dialog = true;
                    this.submitLoading = false;
                } else {
                    this.$message.success(`设置默认成功。`);
                    this.subSetDefault();
                    this.submitLoading = false;
                }
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        subSetDefault() {
            this.$http.put(`/qc/dicqciqcinspectmateriel/setDefault/${this.selection[0].id}`).then(res => {
                this.queryMaterialQualiutyTest(this.order);
                this.setDefault_dialog = false;
            });
        },
        // 复制
        copy() {
            this.submitLoading = true;
            this.$confirm('是否需要复制', {
                type: 'warning'
            }).then(() => {
                this.$http.post(`/qc/dicqciqcinspectmateriel/copy/${this.selection[0].id}`).then(() => {
                    this.submitLoading = false;
                    this.queryMaterialQualiutyTest(this.order);
                    this.$message({
                        message: '复制成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        currentChangeParent(row) {
            this.rowObjParent = row;
            row && this.getDataSon();
        },
        // 获取下表信息
        getDataSon() {
            this.tableLoading_down = true;
            this.$http.get('/qc/iqcinspectmrdet/page', {
                params: {
                    size: 9999,
                    conditionList: [{
                        fieldName: 'inspectMaterielId',
                        operation: 'EQ',
                        value: this.rowObjParent.id,
                    }]
                }
            }).then(({ data }) => {
                this.tableLoading_down = false;
                this.tableDataSon = data ? data.records : [];
            });
        },
        getTestItemsInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                inspectMaterielId: this.rowObjParent.id,
                checkType: this.rowObjParent.inspectType,
                conditionList: [],
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
            this.$http.post('/qc/iqcinspectitem/getListByMaterielId', null, {
                params
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        getIQCBadInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                parentMaterialType: this.rowObjParent.materielTypeCode,
                conditionList: [],
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
            this.$http.post('/qc/iqcbadcode/getPageUsedIqcinspectItem', null, {
                params
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            if (this.rowObjParent.inspectType === 'IQC') {
                this.dialogFormSon[11].value = 1;
                this.dialogFormSon[12].value = '4';
            }
            this.dialogFormSon[13].value = this.sysUser.nickname;
        },
        selectionChangeDown(selection) {
            this.selectionDown = selection;
            this.ids = selection.map(v => v.id);
        },
        // 下表修改
        editRowSon() {
            this.dialogSon = 'edit';
            this.dialogFormSon.forEach(v => {
                v.value = this.selectionDown[0][v.prop];
            });
            this.dialogFormSon[6].required = this.dialogFormSon[2].value === 'QUANTITATIVE';
            this.dialogFormSon[7].required = this.dialogFormSon[2].value === 'QUANTITATIVE';
            this.itemId = this.selectionDown[0].itemId;
            this.iqcBadId = this.selectionDown[0].iqcBadId;
            this.measurToolsAccountId = this.selectionDown[0].measurToolsId;
            this.inspectionUnit = this.selectionDown[0].inspectUnit;
            this.dialogVisibleSon = true;
        },
        delRowSon() {
            this.$confirm('是否确认删除', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoading_down = true;
                this.$http.delete('/qc/iqcinspectmrdet/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.tableLoading_down = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.tableLoading_down = false;
                });
            });
        },
        subFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            obj.inspectMaterielId = this.rowObjParent.id;
            obj.itemId = this.itemId;
            obj.iqcBadId = this.iqcBadId;
            obj.measurToolsId = this.measurToolsAccountId;
            obj.inspectUnit = this.inspectionUnit;
            if (this.dialogSon === 'new') {
                this.$http.post('/qc/iqcinspectmrdet/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.selectionDown[0].id;
                this.$http.put('/qc/iqcinspectmrdet/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 下表提交
        submitFormSon() {
            if (this.dialogFormSon[2].value === 'QUANTITATIVE') {
                if (Number(this.dialogFormSon[7].value) <= Number(this.dialogFormSon[6].value)) {
                    this.subFormSon();
                } else {
                    this.$message.error('标准值上限不小于标准值下限，请重新输入。');
                }
            } else {
                this.subFormSon();
            }
        },
        importSuccessHandler() {
            this.importVisible = false;
            this.$message({ message: '导入成功!', type: 'success' });
            this.getDateParent();
        },
        handlerExport(setting) {
            if (setting === 0) {
                this.exportIds = [];
            } else if (setting === 1) {
                const ids = this.selection.map(v => v.id);
                if (ids.length) {
                    this.exportIds = ids;
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (setting === 2) {
                this.exportIds = this.tableDataParent.map(v => v.id);
            }
        },
        // 时间升序
        positiveSequence() {
            this.order = 'a';
            this.queryMaterialQualiutyTest(this.order);
        },
        // 时间降序
        invertedOrder() {
            this.order = 'd';
            this.queryMaterialQualiutyTest(this.order);
        },
    }
};

</script>

<style lang="stylus" scoped>
.materialqualitytest
    & >>> .fr
        float right
.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    // height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0
.dialog
    & >>> .el-form-item__label
        width 140px!important
    & >>> .el-form-item__content
        width calc(100% - 140px)
</style>
