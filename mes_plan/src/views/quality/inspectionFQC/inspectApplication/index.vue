<template lang="pug">
    ebrain-main.inspect_application
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
                    :columnIndex='false'
                    @row-dblclick="rowDblClickHandler"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
        ebrain-dialog(
            ref="dialog"
            :expandVisible="collapse"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                    ebrain-tools(:buttons="btnsFormDiaolog")
            template(#materielCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="物料编号" required prop="matreialCode")
                        el-input(:readonly='true' :value="value" :disabled="isDisabled")
                            el-button(slot="append" @click="showDialogTable('物料')" icon="el-icon-search" :disabled="isDisabled")
            template(#InspecPaln="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="检验方案" required prop="inspectPlanCode")
                        el-input(:readonly='true' :value="value" :disabled="isDisabled")
                            el-button(slot="append" @click="showDialogTable('方案')" icon="el-icon-search" :disabled="isDisabled")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title='检验明细' v-if="formType === '检验报告'")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table2"
                        key="table2"
                        :columnCheck="false"
                        :columnIndex="false"
                        v-if="dialogVisible"
                        :show-summary="true"
                        :loading="tableLoadingCheck"
                        :summary-method="summaryMethod"
                        :pageSize="pageSizeCheck"
                        :pageCurrent="currentPageCheck"
                        :pageTotal="pageTotalCheck"
                        :data="tableDataCheck"
                        :column="column"
                        row-key="id")
            ebrain-frame(title='抽样信息' v-else)
                template(#tools)
                    ebrain-tools(:buttons="btnsDialog")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table3"
                        key="table3"
                        v-if="dialogVisible"
                        :loading="tableLoadingSamp"
                        :pageSize="pageSizeSamp"
                        :pageCurrent="currentPageSamp"
                        :pageTotal="pageTotalSamp"
                        :data="tableDataSamp"
                        :column="tableColumnSamp"
                        row-key="id"
                        @selection-change="SelectChangeDialog"
                        @page-change="ChangeCurrentSamp"
                        @size-change="ChangeSizeSamp")
        ebrain-dialog-table.materielCode(
            dialogTableSearch
            height="60vh"
            row-key="id"
            :data="tableData_table"
            :column="tableColumn_table"
            :tableLoading='dialogTableLoading'
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @row-click="query_table"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :pageTotal="pageTotal_table"
            :disabled="Object.keys(row).length === 0"
            :visible.sync="dialogVisibleDialogTable"
            highlight-current-row
            @submit="submitFormDialogTable")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/qc/fqcinspectioncheck/export/0'"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-dialog(
            ref="dialog2"
            :submitLoading='submitLoadingDialog'
            :visible.sync="dialogVisibleDialog"
            :form.sync="dialogFormDialog"
            top="2vh"
            @submit="submitDialogData")
</template>
<script>
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
import _ from 'lodash';
export default {
    name: 'inspectApplication',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            row: {},
            type: '',
            collapse: false,
            selectChildRows: [],
            searchVisible: true,
            childRow: {},
            dialogType2: '',
            formType: '',
            exportIds: [],
            btnsFormDiaolog: [],
            column: [],
            btnCheck: [{
                label: '导出PDF',
                click: () => this.exportPDF(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
                loading: false,
                disabled: false,
            }, {
                label: '导出WORD',
                click: () => this.exportWORK(),
                className: 'iconfont iconstatus-Submission',
                permi: false,
                disabled: () => false,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }],
            searchObj: {
                deliverStartTime: '',
                deliverEndTime: '',
                inspectStartTime: '',
                inspectEndTime: '',
                recipientStarTime: '',
                recipientEndTime: '',
            },
            searchForm: [{
                label: '检验单状态',
                prop: 'checkStatus',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '决策结果',
                prop: 'decisionResult',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '物料编码',
                prop: 'matreialCode',
                value: '',
            }, {
                label: '工单号',
                prop: 'workerOrderCode',
                value: '',
            }, {
                label: '模号',
                prop: 'modelNo',
                value: '',
            }, {
                label: '检验单号',
                prop: 'checkCode',
                value: '',
            }, {
                label: '申请时间',
                prop: 'deliverTime',
                value: '',
                type: 'picker',
            }, {
                label: '检验时间',
                prop: 'inspectTime',
                value: '',
                type: 'picker',
            }, {
                label: '接收人',
                prop: 'recipients',
                value: '',
            }],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            submitLoading: false,
            dialogVisible: false,
            dialogType: '',
            tableData_table: [],
            tableColumn_table: [],
            dialogTableLoading: false,
            pageSize_table: 20,
            currentPage_table: 1,
            pageTotal_table: 0,
            dialogVisibleDialogTable: false,
            tableColumnMaterielCode: [{
                label: '料号',
                prop: 'materialCode',
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                searchBy: true,
            }, {
                label: 'SAP料号',
                prop: 'goodsCode',
            }, {
                label: 'SAP名称',
                prop: 'sapName',
            }, {
                label: '主要来源',
                prop: 'mainSource',
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                }
            }, {
                label: '库存单位',
                prop: 'stockUnit',
            }, {
                label: '物料类别编码',
                prop: 'materialTypeCode',
            }, {
                label: '属性类别',
                prop: 'attributeType',
                formatter: (row, column, cell) => {
                    return this.storeDict['material_attri'][cell];
                }
            }, {
                label: '材料类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.materialType[cell];
                }
            }, {
                label: '快捷码',
                prop: 'shortcutCode',
            }, {
                label: '物料状态',
                prop: 'materialState',
                formatter(row, column, cell) {
                    return dict.materialState[cell];
                }
            }, {
                label: '数据来源',
                prop: 'isAuto',
                formatter(row, column, cell) {
                    return dict.dataSource[cell];
                }
            }, {
                label: 'MES自动领料',
                prop: 'storageMaterial',
                formatter(row, column, cell) {
                    return dict.isRaire[cell];
                }
            }, {
                label: '备注',
                prop: 'remarks',
            }],
            dialogOperation: [{
                label: '检验单号',
                prop: 'checkCode',
                value: '',
                required: true,
                disabled: true
            }, {
                label: '检验类型',
                prop: 'checkType',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                required: true,
                disabled: true
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_SOURCE'],
            }, {
                label: '物料编号',
                prop: 'matreialCode',
                value: '',
                required: true,
                slot: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'matreialName',
                value: '',
                required: true,
                disabled: true
            }, {
                label: '工单号',
                prop: 'workerOrderCode',
                value: '',
                required: true,
            }, {
                label: '模号',
                prop: 'modelNo',
                value: '',
                required: true,
            }, {
                label: '接收人',
                prop: 'recipientsName',
                value: '',
                disabled: true
            }, {
                label: '接收时间',
                prop: 'recipientTime',
                value: '',
                disabled: true
            }, {
                label: '审核人',
                prop: 'inspectorName',
                value: '',
                disabled: true
            }, {
                label: '审核时间',
                prop: 'approvalTime',
                value: '',
                disabled: true
            }, {
                label: '申请人',
                prop: 'delivererName',
                value: '',
                disabled: true
            }, {
                label: '申请时间',
                prop: 'deliverTime',
                value: '',
                disabled: true
            }, {
                label: '检验方案',
                prop: 'inspectPlanCode',
                value: '',
                required: true,
                slot: 'InspecPaln',
            }, {
                label: '抽样方式',
                prop: 'samplingMethod',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_METHOD'],
                required: true,
                disabled: true,
            }, {
                label: '抽样数量',
                prop: 'samplingAmount',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^[1-9]\d*$/;
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '是否加急',
                prop: 'ifUrgent',
                value: '',
                type: 'select',
                option: () => dict.isEmergency,
                required: true,
                // change: (val) => {
                //     if (val === '0') {
                //         let dd = new Date();
                //         let now = dd.getHours();
                //         if (now < 10) {
                //             dd.setHours(5);
                //             dd.setMinutes(0);
                //             dd.setSeconds(0);
                //             this.dialogForm[17].value = moment(dd).format('YYYY-MM-DD HH:mm:ss');
                //         } else if (now >= 10 && now < 14) {
                //             dd.setDate(dd.getDate() + 1);
                //             dd.setHours(10);
                //             dd.setMinutes(0);
                //             dd.setSeconds(0);
                //             this.dialogForm[17].value = moment(dd).format('YYYY-MM-DD HH:mm:ss');
                //         } else if (now >= 14 && now < 24) {
                //             dd.setDate(dd.getDate() + 1);
                //             dd.setHours(17);
                //             dd.setMinutes(0);
                //             dd.setSeconds(0);
                //             this.dialogForm[17].value = moment(dd).format('YYYY-MM-DD HH:mm:ss');
                //         }
                //     } else {
                //         let dd = new Date(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
                //         this.dialogForm[17].value = moment(dd.setHours(dd.getHours() + 4)).format('YYYY-MM-DD HH:mm:ss');
                //     }
                // }
            }, {
                label: '预计报告时间',
                prop: 'estimatedReportingTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '检验状态',
                prop: 'checkStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_STATUS'],
                disabled: true
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_RESULT'],
            }, {
                label: '决策结果',
                prop: 'decisionResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_DECOSION_RESULT'],
            }],
            tableColumn: [{
                label: '检验单状态',
                prop: 'checkStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DICT_CHECK_STATUS'][cell];
                },
            }, {
                label: '检验申请时间',
                prop: 'deliverTime',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'matreialCode',
                showOverflowTooltip: true,
            }, {
                label: '工单号',
                prop: 'workerOrderCode',
                showOverflowTooltip: true,
            }, {
                label: '模号',
                prop: 'modelNo',
                showOverflowTooltip: true,
            }, {
                label: '样品编号',
                prop: 'samplingNo',
                showOverflowTooltip: true,
            }, {
                label: '检验单号',
                prop: 'checkCode',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DICT_CHECK_RESULT'][cell];
                },
            }, {
                label: '决策结果',
                prop: 'decisionResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DICT_DECOSION_RESULT'][cell];
                },
            }, {
                label: '接收人',
                prop: 'recipientsName',
                showOverflowTooltip: true,
            }, {
                label: '样品数量',
                prop: 'samplingAmount',
                showOverflowTooltip: true,
            }, {
                label: '检验时间',
                prop: 'inspectTime',
                showOverflowTooltip: true,
            }],
            parentRow: {},
            dialogVisabledExport: false,
            exportFilename: '',
            selectRows: [],
            conditionList: [],
            dialogForm: [],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcinspectioncheck_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'qc_fqcinspectioncheck_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                disabled: () => this.delDisabled,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_fqcinspectioncheck_dels',
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'qc_fqcinspectioncheck_export',
                disabled: false,
            }, {
                label: '查看检验报告',
                click: () => this.InspectReport(),
                className: 'iconfont iconsee',
                permi: false,
                disabled: () => this.viewDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            isSave: true,
            btnsOper: [{
                label: '保存',
                click: () => this.saveData(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
                loading: false,
                disabled: () => this.isDisabled,
            }, {
                label: '提交',
                click: () => this.submitData(),
                className: 'iconfont iconstatus-Submission',
                permi: 'qc_fqcinspectioncheck_submit',
                disabled: () => this.subDisabled,
                loading: false
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }],
            inspactCloum: [{
                label: '物料质检方案编码',
                prop: 'inspectMaterielCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '质检方案名称',
                prop: 'inspectMaterielName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '质检类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '物料类别',
                prop: 'materielTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materielCode',
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
                label: '客户编码',
                prop: 'customerCode',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customerName',
                showOverflowTooltip: true,
            }, {
                label: '是否默认',
                prop: 'defaultInspect',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'][cell];
                }
            }, {
                label: '状态',
                prop: 'inspectMaterielStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_MATERIEL_STATUS'][cell];
                }
            }],
            dialogInspect: [{
                label: '检验单号',
                prop: 'checkCode',
                value: '',
                disabled: true
            }, {
                label: '检验类型',
                prop: 'checkType',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                disabled: true
            }, {
                label: '检验申请时间',
                prop: 'deliverTime',
                value: '',
                disabled: true
            }, {
                label: '物料编号',
                prop: 'matreialCode',
                value: '',
                disabled: true,
            }, {
                label: '物料名称',
                prop: 'matreialName',
                value: '',
                disabled: true
            }, {
                label: '工单号',
                prop: 'workerOrderCode',
                value: '',
                disabled: true,
            }, {
                label: '模号',
                prop: 'modelNo',
                value: '',
                disabled: true,
            }, {
                label: '抽样数量',
                prop: 'samplingAmount',
                value: '',
                disabled: true,
                required: true
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_RESULT'],
            }, {
                label: '决策结果',
                prop: 'decisionResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_DECOSION_RESULT'],
            }],
            tableLoadingSamp: false,
            pageSizeSamp: 20,
            currentPageSamp: 1,
            pageTotalSamp: 0,
            tableDataSamp: [],
            tableColumnSamp: [{
                label: '样品编号',
                prop: 'samplingNo',
                showOverflowTooltip: true,
            }, {
                label: '批号',
                prop: 'batchNo',
                showOverflowTooltip: true,
            }, {
                label: 'BOOK号',
                prop: 'bookNo',
                showOverflowTooltip: true,
            }, {
                label: '位置',
                prop: 'position',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DICT_CHECK_RESULT'][cell];
                },
            }],
            btnsDialog: [{
                label: '新增',
                click: () => this.newRowDialog(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.addDialogDisabled,
                permi: false,
            }, {
                label: '修改',
                click: () => this.editRowDialog(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDialogDisabled,
                permi: false,
            }, {
                label: '删除',
                click: () => this.delRowDialog(),
                disabled: () => this.delDialogDisabled,
                className: 'iconfont iconstatus-delete',
                permi: false,
            }],
            submitLoadingDialog: false,
            dialogVisibleDialog: false,
            dialogFormDialog: [{
                label: '样品编号',
                prop: 'samplingNo',
                value: '',
                required: true,
            }, {
                label: 'Book号',
                prop: 'bookNo',
                value: '',
                required: true,
            }, {
                label: '批号',
                prop: 'batchNo',
                value: '',
                required: true,
            }, {
                label: '位置',
                prop: 'position',
                value: '',
                required: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_RESULT'],
            }],
            tableLoadingCheck: false,
            pageSizeCheck: 20,
            currentPageCheck: 1,
            pageTotalCheck: 0,
            tableDataCheck: [],
            isDisabled: false,
            status: '0',
            checkResult: false,
            tableColumnCheck: [{
                label: '项目',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '检验标准',
                prop: 'standardValue',
                showOverflowTooltip: true,
            }, {
                label: '标准值上线',
                prop: 'standardUpper',
                showOverflowTooltip: true,
            }, {
                label: '标准值下限',
                prop: 'standardLower',
                showOverflowTooltip: true,
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                showOverflowTooltip: true,
            }],
            checkResultArr: [],
            userArr: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser,
        }),
        editDisabled() {
            return this.selectRows.length !== 1;
        },
        delDisabled() {
            const filterData = this.selectRows.some(v => v.checkStatus !== '0');
            return this.selectRows.length === 0 || filterData;
        },
        viewDisabled() {
            let parentRow = {};
            const apiArr = ['5', '6', '7'];
            if (this.selectRows.length) {
                parentRow = this.selectRows[0];
            }
            return this.selectRows.length !== 1 || (parentRow && !apiArr.includes(parentRow.checkStatus));
        },
        subDisabled() {
            if (this.parentRow) {
                return this.parentRow.checkStatus !== '0' || this.isDisabled || this.tableDataSamp.length === 0;
            } else {
                return true;
            }
        },
        editDialogDisabled() {
            return this.selectChildRows.length !== 1 || this.isDisabled;
        },
        delDialogDisabled() {
            return this.selectChildRows.length === 0 || this.isDisabled;
        },
        addDialogDisabled() {
            return (this.dialogForm.length && this.dialogForm[0].value === '系统生成') || this.isDisabled;
        }
    },
    watch: {
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = 'FQC成品检验申请单';
            }
        },
        dialogVisibleDialogTable(val) {
            if (val) {
                this.tableData_table = [];
                this.currentPage_table = 1;
                this.pageSize_table = 20;
                this.pageTotal_table = 0;
                this.row = {};
            }
        },
        dialogVisibleDialog(val) {
            if (!val) {
                this.getSamp();
            }
        },
        status(val) {
            if (val === '0') {
                this.isDisabled = false;
                this.dialogOperation.forEach(v => {
                    if (v.prop === 'checkSource' || v.prop === 'workerOrderCode' || v.prop === 'modelNo' || v.prop === 'samplingAmount' || v.prop === 'ifUrgent') {
                        v.disabled = false;
                    }
                });
            }
            else {
                this.isDisabled = true;
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                });
            }
        },
        dialogVisible(val) {
            if (val) {
                if (this.formType !== '检验报告') {
                    this.btnsFormDiaolog = this.btnsOper;
                    this.dialogForm = Object.assign([], this.dialogOperation);
                    this.dialogForm[0].value = '系统生成';
                    this.dialogForm[1].value = 'FQC';
                    this.dialogForm[2].value = '0';
                    this.dialogForm[16].value = '1';
                    this.dialogForm[18].value = '0';
                    this.dialogForm[12].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    // let dd = new Date(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
                    // this.dialogForm[17].value = moment(dd.setHours(dd.getHours() + 4)).format('YYYY-MM-DD HH:mm:ss');
                    if (this.dialogType === 'edit') {
                        this.getSamp();
                        this.dialogForm.forEach(v => {
                            v.value = this.parentRow[v.prop];
                        });
                    }
                    this.status = this.dialogForm[18].value;
                }
            } else {
                this.getData();
                this.parentRow = {};
                this.dialogType = '';
                this.formType = '';
                this.dialogForm = [];
                this.tableDataCheck = [];
                this.pageSizeCheck = 20;
                this.currentPageCheck = 1;
                this.pageTotalCheck = 0;
                this.tableDataSamp = [];
                this.pageSizeSamp = 20;
                this.currentPageSamp = 1;
                this.pageTotalSamp = 0;
                this.selectChildRows = [];
                this.dialogOperation.forEach(v => {
                    v.value = '';
                });
                this.dialogInspect.forEach(v => {
                    v.value = '';
                });
                this.tableDataCheck = [];
                this.checkResultArr = [];
            }
        },
    },
    mounted() {
        this.init();
    },
    // activated() {
    //     this.init();
    // },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('DICT_CHECK_STATUS'),
                this.queryDict('DICT_CHECK_RESULT'),
                this.queryDict('DIC_IQC_INSPECT_METHOD'),
                this.queryDict('DIC_IQC_SAMPLING_METHOD'),
                this.queryDict('DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'),
                this.queryDict('DIC_IQC_INSPECT_MATERIEL_STATUS'),
                this.queryDict('DIC_IQC_INSPECT_TYPE'),
                this.queryDict('DICT_CHECK_SOURCE'),
                this.queryDict('DICT_DECOSION_RESULT'),
                this.queryDict('material_attri'),
                this.queryDict('DIC_IQC_INSPECT_TYPE')]).then(() => {
                this.getData();
                this.getUser();
                this.searchForm[0].option = this.storeDict['DICT_CHECK_STATUS'];
                this.searchForm[1].option = this.storeDict['DICT_CHECK_RESULT'];
                this.searchForm[2].option = this.storeDict['DICT_DECOSION_RESULT'];
            });
        },
        // 查询用户表
        getUser() {
            this.userArr = [];
            this.$http.get(`/admin/user/all`).then(({ code, data }) => {
                for (let item in data) {
                    if (item) {
                        let newObj = {};
                        newObj[item] = data[item];
                        this.userArr.push(newObj[item]);
                    }
                }
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchObj.deliverStartTime = '';
            this.searchObj.deliverEndTime = '';
            this.searchObj.inspectStartTime = '';
            this.searchObj.inspectEndTime = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'deliverTime') {
                        this.searchObj.deliverStartTime = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
                        this.searchObj.deliverEndTime = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
                    } else if (v.prop === 'inspectTime') {
                        this.searchObj.inspectStartTime = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
                        this.searchObj.inspectEndTime = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
                    } else if (v.prop === 'recipients') {
                        if (this.userArr.length) {
                            let arr = this.userArr.filter(j => j.nickname.includes(v.value));
                            if (arr.length) {
                                this.conditionList.push({
                                    fieldName: v.prop,
                                    operation: 'EQ',
                                    value: arr[0].userId,
                                    joinType: 'AND',
                                });
                            } else {
                                this.conditionList.push({
                                    fieldName: v.prop,
                                    operation: 'EQ',
                                    value: '',
                                    joinType: 'AND',
                                });
                            }
                        }
                    } else {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                            joinType: 'AND',
                        }); }
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
                ...this.searchObj,
                conditionList: [...this.conditionList]
            };
            this.$http.get(`/qc/fqcinspectioncheck/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.formType = 'new';
        },
        editRow(row) {
            this.dialogType = 'edit';
            this.formType = 'new';
            this.dialogVisible = true;
            if (!_.isEmpty(row)) {
                this.parentRow = { ...row };
            } else {
                this.parentRow = { ...this.selectRows[0] };
            }
        },
        delRow() {
            const ids = this.selectRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/qc/fqcinspectioncheck/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPage = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.selectRows = [];
                    this.$refs.table1.clearSelection();
                });
            });
        },
        rowDblClickHandler(row) {
            this.editRow(row);
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = { ...row };
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
        saveData() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    this.btnsOper[0].loading = true;
                    if (this.dialogType === 'new') {
                        delete obj.checkCode;
                        this.$http.post('/qc/fqcinspectioncheck/saveFqcInspectionCheck', obj).then(({ code, data }) => {
                            this.parentRow = data;
                            this.$message.success('新增成功');
                            this.dialogForm.forEach(v => {
                                v.value = data[v.prop];
                            });
                            this.btnsOper[0].loading = false;
                            this.dialogType = 'edit';
                        }).catch(() => {
                            this.btnsOper[0].loading = false;
                        });
                    } else {
                        obj.id = this.parentRow.id;
                        this.$http.put('/qc/fqcinspectioncheck/updateById', obj).then(() => {
                            this.$message.success('修改成功');
                            this.btnsOper[0].loading = false;
                            this.parentRow = Object.assign(this.parentRow, obj);
                        }).catch(() => {
                            this.btnsOper[0].loading = false;
                        });
                    }
                }
            });
        },
        submitData() {
            this.btnsOper[1].loading = true;
            let obj = { ...this.parentRow };
            delete obj.tenantId;
            this.$http.post(`/qc/fqcinspectioncheck/submit`, this.parentRow).then(({ data }) => {
                this.$message.success('提交成功');
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
                this.status = data.checkStatus;
                this.btnsOper[1].loading = false;
            }).catch(() => {
                this.btnsOper[1].loading = false;
            });
        },
        showDialogTable(type) {
            this.dialogSearchForm = {};
            this.type = type;
            this.dialogVisibleDialogTable = true;
            this.getDialogData();
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getDialogData();
        },
        getDialogData() {
            switch (this.type) {
                case '物料':
                    this.tableColumn_table = this.tableColumnMaterielCode;
                    this.getMaterial();
                    break;
                case '方案':
                    this.tableColumn_table = this.inspactCloum;
                    this.getInspctPaln();
                    break;
            }
        },
        // 获取物料信息的物料
        getMaterial() {
            const params = {
                current: this.currentPage_table,
                size: this.pageSize_table,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'materialState',
                operation: 'EQ',
                value: '1',
                joinType: 'AND',
            }, {
                fieldName: 'mainSource',
                operation: 'NEQ',
                value: 'F',
                joinType: 'AND',
            });
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
            this.dialogTableLoading = true;
            this.$http.get(`basicdata/dicbasicmaterial/page`, { params }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        getInspctPaln() {
            if (this.dialogForm[3].value === '') return;
            const obj = {
                page: {
                    current: this.currentPage_table,
                    size: this.pageSize_table,
                },
                conditions: {
                    conditionList: []
                },
                materialCode: this.dialogForm[3].value
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj.conditions.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.dialogTableLoading = true;
            this.$http.post(`/qc/fqcinspectioncheck/getPageByMaterialCode`, obj).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrent_table(val) {
            this.currentPage_table = val;
            this.getDialogData();
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            this.getDialogData();
        },
        query_table(row) {
            this.row = row;
        },
        exportAll() {
            this.dialogVisabledExport = true;
        },
        handlerExport(dataSetting) {
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.selectRows.length) {
                    this.exportIds = this.selectRows.map(v => v.id);
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.tableData.map(v => v.id);
            }
        },
        submitFormDialogTable() {
            let materialCode = '';
            switch (this.type) {
                case '物料':
                    this.dialogForm[3].value = this.row.materialCode;
                    this.dialogForm[4].value = this.row.materialName;
                    if (_.isEmpty(this.row.materialCode)) materialCode = this.row.materialTypeCode;
                    else materialCode = this.row.materialCode;
                    // 根据物料查询物料检验方案
                    this.$http.get(`/qc/fqcinspectioncheck/getInspectMethodByMaterialCode/${materialCode}`).then(({ data, code }) => {
                        this.dialogForm[14].value = data.inspectMethod;
                        this.dialogForm[15].value = data.samplingFixedQuantity;
                    }).catch(() => {
                        this.dialogForm[14].value = '';
                        this.dialogForm[15].value = '';
                        this.dialogForm[13].value = '';
                    });
                    //  根据物料查找默认的物料检验方案
                    this.$http.get(`/qc/fqcinspectioncheck/getDefaultInspectByMaterialCode/${materialCode}`).then(({ data, code }) => {
                        this.dialogForm[13].value = data.inspectMaterielCode;
                    });
                    break;
                case '方案':
                    this.dialogForm[13].value = this.row.inspectMaterielCode;
            }
            this.dialogVisibleDialogTable = false;
        },
        // 检验报告
        InspectReport() {
            this.formType = '检验报告';
            this.dialogVisible = true;
            this.btnsFormDiaolog = this.btnCheck;
            this.parentRow = { ...this.selectRows[0] };
            this.dialogForm = Object.assign([], this.dialogInspect);
            const params = {
                id: this.parentRow['id']
            };
            this.tableLoadingCheck = true;
            this.$http.post(`/qc/fqcinspectioncheck/checkInspectionReport`, null, {
                params
            }).then(res => {
                this.dialogForm.forEach(v => {
                    v.value = res.data[v.prop];
                });
                this.tableLoadingCheck = false;
                const { samplingInfoList } = res.data;
                const { column, data, checkResultArr } = this.transformData(samplingInfoList);
                this.column = [...this.tableColumnCheck, ...column];
                this.tableDataCheck = data;
                this.checkResultArr = checkResultArr;
            }).catch(() => {
                this.tableLoadingCheck = false;
            });
        },
        // 抽样信息
        getSamp() {
            this.tableLoadingSamp = true;
            const params = {
                current: this.currentPageSamp,
                size: this.pageSizeSamp,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'checkId',
                operation: 'EQ',
                value: this.parentRow['id'],
                joinType: 'AND',
            });
            this.$http.get(`/qc/fqcsamplinginfo/page`, {
                params
            }).then(res => {
                this.tableDataSamp = res.data.records;
                this.pageTotalSamp = res.data.total;
                this.tableLoadingSamp = false;
            }).catch(() => {
                this.tableLoadingSamp = false;
            });
        },
        ChangeCurrentSamp(val) {
            this.currentPageSamp = val;
            this.getSamp();
        },
        ChangeSizeSamp(val) {
            this.pageSizeSamp = val;
            this.currentPageSamp = 1;
            this.getSamp();
        },
        summaryMethod(params) {
            const { columns, data } = params;
            let sum = [];
            columns.forEach((column, index) => {
                if (index === 0) {
                    sum[index] = '检验结果';
                    return;
                }
            });
            if (data.length) {
                let arr = this.checkResultArr.map(v => v.checkResult);
                arr.reverse();
                for (let i = columns.length - this.parentRow.samplingAmount; i < columns.length; i++) {
                    sum[i] = this.storeDict['DICT_CHECK_RESULT'][arr[columns.length - (i + 1)]];
                }
            }
            return sum;
        },
        newRowDialog() {
            this.dialogVisibleDialog = true;
            this.dialogType2 = 'new';
        },
        editRowDialog() {
            this.childRow = { ...this.selectChildRows[0] };
            this.dialogVisibleDialog = true;
            this.dialogType2 = 'edit';
            this.dialogFormDialog.forEach(v => {
                v.value = this.childRow[v.prop];
            });
        },
        delRowDialog() {
            const ids = this.selectChildRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/qc/fqcsamplinginfo/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPageSamp = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getSamp();
                    this.$refs.table3.clearSelection();
                });
            });
        },
        SelectChangeDialog(selection) {
            this.selectChildRows = selection;
        },
        submitDialogData() {
            let obj = {};
            this.dialogFormDialog.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.checkId = this.parentRow['id'];
            this.submitLoadingDialog = true;
            if (this.dialogType2 === 'new') {
                this.$http.post(`/qc/fqcsamplinginfo/save`, obj).then(() => {
                    this.$message.success('添加成功');
                    this.dialogVisibleDialog = false;
                    this.submitLoadingDialog = false;
                }).catch(() => {
                    this.submitLoadingDialog = false;
                });
            } else {
                obj.id = this.childRow['id'];
                this.$http.put(`/qc/fqcsamplinginfo/updateById`, obj).then(() => {
                    this.$message.success('修改成功');
                    this.dialogVisibleDialog = false;
                    this.submitLoadingDialog = false;
                }).catch(() => {
                    this.submitLoadingDialog = false;
                });
            }
        },
        exportPDF() {
            this.$http.get(`/qc/fqcinspectioncheck/exportPdf/${this.parentRow['id']}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'FQC成品检验.pdf';
                    $a.click();
                }
            });
        },
        exportWORK() {
            this.$http.get(`/qc/fqcinspectioncheck/exportWord/${this.parentRow['id']}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'FQC成品检验.doc';
                    $a.click();
                }
            });
        },
        transformData(data) {
            let arr = [];
            let col = [];
            let res = [];
            data.forEach(v => {
                if (v.fqcInspectionItemList && v.fqcInspectionItemList.length) {
                    v.fqcInspectionItemList.forEach(j => {
                        let item = arr.find(k => k.itemCode === j.itemCode);
                        if (!item) {
                            item = j;
                            arr.push(item);
                        }
                        const { fqcInspectionItemList, ...other } = v;
                        let colItem = col.find(k => k.prop === 'sampLingInfo_' + other.samplingNo);
                        if (!colItem) {
                            col.push({
                                label: other.samplingNo,
                                prop: 'sampLingInfo_' + other.samplingNo,
                                showOverflowTooltip: true,
                            });
                        }
                        item['sampLingInfo_' + other.samplingNo] = j.actValue;
                        let result = res.find(k => k.samplingNo === other.samplingNo);
                        if (!result) {
                            res.push(other);
                        }
                    });
                }
            });
            return { data: arr, column: col, checkResultArr: res };
        }
    },
};
</script>
<style lang="stylus" scoped>
.inspect_application
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
.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    margin-bottom 20px
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)

.dialog_table
    height 40vh
</style>
