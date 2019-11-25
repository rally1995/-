<template lang="pug">
    ebrain-main.sample_application
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
                    @row-dblclick="rowDblClickHandler"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
        ebrain-dialog(
            ref="dialog"
            :expandVisible="collapse"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            :isShow="false"
            :isCancel="false")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            template(#button)
                ebrain-tools(:buttons="btnsOper")
            ebrain-frame(title='样品信息')
                template(#tools)
                    ebrain-tools(:buttons="btnsSamp")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table2"
                        :loading="tableLoadingSamp"
                        :pageSize="pageSizeSamp"
                        :pageCurrent="currentPageSamp"
                        :pageTotal="pageTotalSamp"
                        :data="tableDataSamp"
                        :column="tableColumnSamp"
                        row-key="id"
                        @current-change="CurrentChange"
                        @selection-change="SelectChangeSamp"
                        @page-change="ChangeCurrentSamp"
                        @size-change="ChangeSizeSamp")
            ebrain-frame(title='检验信息')
                template(#tools)
                    ebrain-tools(:buttons="btnsCheck")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table3"
                        :loading="tableLoadingCheck"
                        :pageSize="pageSizeCheck"
                        :pageCurrent="currentPageCheck"
                        :pageTotal="pageTotalCheck"
                        @selection-change="SelectChangeChecl"
                        @page-change="ChangeCurrentCheck"
                        @size-change="ChangeSizeCheck"
                        :data="tableDataCheck"
                        :column="columnCheck"
                        row-key="id")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/qc/fqcsamplyapply/exportList'"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-dialog-table(
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
        ebrain-dialog(
            ref="dialog2"
            :submitLoading='submitLoadingDialog'
            :visible.sync="dialogVisibleDialog"
            :form.sync="dialogFormDialog"
            @submit="submitDialogData")
            template(#materielCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="物料编号"  prop="materialCode")
                        el-input(:readonly='true' :value="value" :disabled="dialogFormDialog[2].disabled" )
                            el-button(slot="append" @click="showDialogTable('material')" icon="el-icon-search" :disabled="dialogFormDialog[2].disabled" )
        ebrain-dialog(
            ref="dialog3"
            :submitLoading='submitLoadingDialog2'
            :visible.sync="dialogVisibleDialog2"
            :form.sync="dialogFormDialog2"
            @submit="submitDialogData2")
            template(#checkItemCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="检验项目编码"  prop="checkItemCode")
                        el-input(:readonly='true' :value="value" :disabled="dialogFormDialog[0].disabled" )
                            el-button(slot="append" @click="showDialogTable('testItem')" icon="el-icon-search" :disabled="dialogFormDialog[0].disabled" )
        ebrain-dialog(
            ref="dialog4"
            :isShow="false"
            :isCancel="false"
            top="2vh"
            :visible.sync="dialogVisibleInspect"
            :form.sync="dialogFormInspect")
            template(#button)
                ebrain-tools(:buttons="btnsFormDiaolog")
            ebrain-frame(:title="$route.name" :isCollapse="true" )
                template(#table)
                    div(v-for="item in InspectReportData")
                        el-form.form(
                            style="paddingBottom:20px;paddingTop:20px"
                            label-width="110px"
                            :model="item"
                            inline)
                            div.form_1
                                el-row(:gutter="20")
                                    el-col(:span="12")
                                        el-form-item(label="样品编号")
                                            el-input(disabled  v-model="item.samplingNo")
                                    el-col(:span="12")
                                        el-form-item(label="物料编号")
                                            el-input( disabled v-model="item.materialCode" )
                                    el-col(:span="12")
                                        el-form-item(label="物料名称"  )
                                            el-input( disabled v-model="item.materialName")
                                    el-col(:span="12")
                                        el-form-item(label="批次号")
                                            el-input( disabled v-model="item.batchNo")
                        ebrain-box-table.dialog_table(
                            ref="table4"
                            :column="InspectColumn"
                            :columnCheck="false"
                            :columnIndex="false"
                            :show-summary="true"
                            :summary-method="summaryMethod"
                            :isPagination="false"
                            :data="item.samplyCheckInfoList"
                            row-key="id")

</template>
<script>
import _ from 'lodash';
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'sampleApplication',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            searchVisible: true,
            status: '',
            tableData_table: [],
            tableColumn_table: [],
            dialogTableLoading: false,
            pageSize_table: 20,
            currentPage_table: 1,
            pageTotal_table: 0,
            dialogVisibleDialogTable: false,
            dialogType2: '',
            type: '',
            footer: ['检验结果', '', '', ''],
            detailCheckRows: [],
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
                label: '材料类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.materialType[cell];
                }
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
                label: '备注',
                prop: 'remarks',
            }],
            row: {},
            searchForm: [{
                label: '检验单状态',
                prop: 'checkStatus',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '申请单号',
                prop: 'checkCode',
                value: '',
            }, {
                label: '申请时间',
                prop: 'createTime',
                value: '',
                type: 'picker',
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                value: '',
                type: 'select',
                option: {},
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcsamplyapply_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'qc_fqcsamplyapply_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                disabled: () => this.delDisabled,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_fqcsamplyapply_dels',
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'qc_fqcsamplyapply_export',
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
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            conditionList: [],
            searchObj: {
                createTimeEnd: '',
                createTimeStart: '',
            },
            isDisabled: false,
            tableColumn: [{
                label: '检验单状态',
                prop: 'checkStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['CHECK_STATUS'][cell];
                },
            }, {
            //     label: '审批流程号',
            //     prop: 'approvalCode',
            //     showOverflowTooltip: true,
            // }, {
                label: '检验申请时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }, {
                label: '检验单号',
                prop: 'checkCode',
                showOverflowTooltip: true,
            }, {
                label: '样本数',
                prop: 'samplyNum',
                showOverflowTooltip: true,
            }, {
                label: '样品编号',
                prop: 'samplingNo',
                showOverflowTooltip: true,
            }, {
                label: '检验日期',
                prop: 'checkDate',
                showOverflowTooltip: true,
            }, {
                label: '预计报告时间(内检项目)',
                prop: 'predictReportDate',
                showOverflowTooltip: true,
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['PROMOTE_FLAG'][cell];
                },
            }, {
                label: '是否需委外',
                prop: 'trustFlag',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['TRUST_FLAG'][cell];
                },
            }, {
                label: '检验来源',
                prop: 'checkSource',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['CHECK_SOURCE'][cell];
                },
            }],
            parentRow: {},
            dialogType: '',
            dialogVisible: false,
            collapse: false,
            submitLoading: false,
            submitLoadingDialog: false,
            dialogVisibleDialog: false,
            dialogFormDialog: [{
                label: '样品编号',
                prop: 'samplingNo',
                value: '',
                required: true,
            }, {
                label: '芯板厚度',
                prop: 'coreThickness',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,3})?$/;
                        if (!value) callback();
                        if (!reg.test(value) || !Number(value)) {
                            return callback(new Error('请输入正数且最多保留三位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '物料编码',
                prop: 'materialCode',
                value: '',
                slot: 'materielCode'
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '批号',
                prop: 'batchNo',
                value: '',
            }, {
                label: '检验项目数',
                prop: 'checkItemNum',
                value: '',
                disabled: true,
            }],
            selectRows: [],
            dialogForm: [{
                label: '检验单号',
                prop: 'checkCode',
                value: '',
                disabled: true,
            }, {
                label: '委托部门',
                prop: 'trustDept',
                value: '',
                disabled: true,
            }, {
                label: '检验类型',
                prop: 'checkType',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                disabled: true,
            }, {
                label: '样品数量',
                prop: 'samplyNum',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '余样处理',
                prop: 'remainDeal',
                value: '',
                type: 'select',
                option: () => this.storeDict['REMAIN_DEAL'],
                required: true,
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['CHECK_SOURCE']
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['PROMOTE_FLAG'],
            }, {
                label: '预计报告时间',
                prop: 'predictReportDate',
                value: '',
                disabled: true,
            }, {
                label: '检验状态',
                prop: 'checkStatus',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['CHECK_STATUS'],
            }, {
                label: '申请人',
                prop: 'createBy',
                value: '',
                disabled: true,
            }, {
                label: '申请时间',
                prop: 'createTime',
                value: '',
                disabled: true,
            }, {
                label: '接收人',
                prop: 'recipientsName',
                value: '',
                disabled: true,
            }, {
                label: '接收时间',
                prop: 'recipientsTime',
                value: '',
                disabled: true,
            }, {
                label: '审批人',
                prop: 'approvalName',
                value: '',
                disabled: true,
            }, {
                label: '审批时间',
                prop: 'approvalDate',
                value: '',
                disabled: true,
            }],
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
                permi: 'qc_fqcsamplyapply_sumbit',
                disabled: () => this.subDisabled,
                loading: false
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }],
            btnsSamp: [{
                label: '新增',
                click: () => this.newRowSamp(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcsamplyinfo_add',
                disabled: () => this.newDisabledSamp
            }, {
                label: '修改',
                click: () => this.editRowSamp(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledSamp,
                permi: 'qc_fqcsamplyinfo_edit',
            }, {
                label: '删除',
                click: () => this.delRowSamp(),
                disabled: () => this.editDisabledSamp,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_fqcsamplyinfo_dels',
            }, {
                label: '复制新增',
                click: () => this.copyNew(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'qc_fqcsamplyinfo_copyInsert',
                disabled: () => this.editDisabledSamp,
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
                label: '芯板厚度',
                prop: 'coreThickness',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '批号',
                prop: 'batchNo',
                showOverflowTooltip: true,
            }, {
                label: '检验项目数',
                prop: 'checkItemNum',
                showOverflowTooltip: true,
            }],
            selectChildRows: [],
            childRow: {},
            btnsCheck: [{
                label: '新增',
                click: () => this.newRowCheck(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcinspectioncheck_add',
                disabled: () => this.newDisabledCheck,
            }, {
                label: '修改',
                click: () => this.editRowCheck(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledCheck,
                permi: 'qc_fqcinspectioncheck_edit',
            }, {
                label: '删除',
                click: () => this.delRowCheck(),
                disabled: () => this.delDisabledCheck,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_fqcinspectioncheck_dels',
            }, {
                label: '导入物料检验方案',
                click: () => this.exportMaterial(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'qc_fqcinspectioncheck_export',
                disabled: () => this.newDisabledCheck,
                loading: false,
            }],
            dialogVisabledExport: false,
            exportFilename: '',
            exportIds: [],
            tableLoadingCheck: false,
            pageSizeCheck: 20,
            currentPageCheck: 1,
            pageTotalCheck: 0,
            tableDataCheck: [],
            dialogSearchForm: {},
            submitLoadingDialog2: false,
            dialogVisibleDialog2: false,
            dialogType3: '',
            dialogFormDialog2: [{
                label: '检验项目编码',
                prop: 'checkItemCode',
                value: '',
                required: true,
                slot: 'checkItemCode'
            }, {
                label: '检验项目名称',
                prop: 'checkItemName',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '检测要求',
                prop: 'checkRequire',
                value: '',
            }, {
                label: '样品尺寸',
                prop: 'samplySize',
                value: '',
                // required: true,
                disabled: true,
            }, {
                label: '试样数',
                prop: 'sampleNum',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '是否委外',
                prop: 'trustFlag',
                type: 'select',
                value: '',
                option: () => this.storeDict['TRUST_FLAG'],
                required: true,
                disabled: true,
            }],
            columnCheck: [{
                label: '检验项目编码',
                prop: 'checkItemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'checkItemName',
                showOverflowTooltip: true,
            }, {
                label: '检测要求',
                prop: 'checkRequire',
                showOverflowTooltip: true,
            }, {
                label: '样品尺寸(项目)',
                prop: 'samplySize',
                showOverflowTooltip: true,
            }, {
                label: '试样数(项目)',
                prop: 'sampleNum',
                showOverflowTooltip: true,
            }, {
                label: '是否委外(项目)',
                prop: 'trustFlag',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['TRUST_FLAG'][cell];
                },
            }],
            testItemColumn: [{
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
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
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
            }],
            btnsFormDiaolog: [{
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
                click: () => { this.dialogVisibleInspect = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }],
            dialogVisibleInspect: false,
            dialogFormInspect: [{
                label: '检验单号',
                prop: 'checkCode',
                value: '',
                disabled: true,
            }, {
                label: '检验类型',
                prop: 'checkType',
                value: '',
                disabled: true,
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                disabled: true,
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                value: '',
                disabled: true,
            }, {
                label: '样品数量',
                prop: 'samplyNum',
                value: '',
                disabled: true,
            }, {
                label: '检验日期',
                prop: 'checkDate',
                value: '',
                disabled: true,
            }],
            InspectReportData: [],
            InspectColumn: [{
                label: '检验项目',
                prop: 'checkItemName',
                showOverflowTooltip: true,
            }, {
                label: '典型值',
                prop: 'standardValue',
                showOverflowTooltip: true,
            }, {
                label: '实测值',
                prop: 'checkValue',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
            }, {
                label: '检验人',
                prop: 'checkName',
                showOverflowTooltip: true,
            }],
            tableFoot: [],
            fullTableData: [],
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
        subDisabled() {
            if (Object.keys(this.parentRow).length) return this.parentRow.checkStatus !== '0' || this.isDisabled;
            else return true;

        },
        editDisabledSamp() {
            return this.selectChildRows.length !== 1 || this.isDisabled;
        },
        delDisabledSamp() {
            return this.selectChildRows.length === 0 || this.isDisabled;
        },
        newDisabledSamp() {
            return Object.keys(this.parentRow).length === 0 || this.isDisabled;
        },
        newDisabledCheck() {
            return Object.keys(this.childRow).length === 0 || this.isDisabled;
        },
        editDisabledCheck() {
            return this.detailCheckRows.length !== 1 || this.isDisabled;
        },
        delDisabledCheck() {
            return this.detailCheckRows.length === 0 || this.isDisabled;
        },
        viewDisabled() {
            return this.selectRows.length !== 1 || this.selectRows[0].checkStatus !== '5';
        },
    },
    watch: {
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '抽样检测申请单';
            }
        },
        dialogVisibleDialog(val) {
            if (!val) {
                this.getSamp().then(() => {
                    if (!_.isEmpty(this.childRow)) {
                        this.childRow = this.tableDataSamp.find(v => v.id === this.childRow.id);
                    } else {
                        this.childRow = {};
                    }
                });
            } else {
                if (this.dialogType2 !== 'copy') {
                    this.dialogFormDialog.forEach(v => {
                        if (v.prop === 'materialName' || v.prop === 'checkItemNum') {
                            v.disabled = true;
                        }
                    });
                } else {
                    this.dialogFormDialog.forEach(v => {
                        if (v.prop === 'samplingNo') {
                            v.disabled = false;
                        } else {
                            v.disabled = true;
                        }
                    });
                }

            }
        },
        dialogVisible(val) {
            if (val) {
                this.status = this.dialogForm.find(v => v.prop === 'checkStatus').value;
            } else {
                this.dialogType = '';
                this.status = '';
                this.getData();
                this.tableDataSamp = [];
                this.pageTotalSamp = 0;
                this.pageSizeSamp = 20;
                this.currentPageSamp = 1;
                this.tableDataCheck = [];
                this.pageTotalCheck = 0;
                this.pageSizeCheck = 20;
                this.currentPageCheck = 1;
                this.parentRow = {};
                this.childRow = {};
            }

        },
        status(val) {
            if (val !== '0') {
                this.isDisabled = true;
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                });
            } else {
                this.isDisabled = false;
                this.dialogForm.forEach(v => {
                    if (v.prop === 'remainDeal' || v.prop === 'checkSource' || v.prop === 'promoteFlag') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                    }
                });
            }
        },
        dialogVisibleDialogTable(val) {
            if (val) {
                this.row = {};
            } else {
                this.tableData_table = [];
                this.tableColumn_table = [];
                this.pageSize_table = 20;
                this.currentPage_table = 1;
                this.pageTotal_table = 0;
            }
        },
        pageTotalSamp(val) {
            this.dialogForm[3].value = val;
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('CHECK_SOURCE'), // 检验来源
                this.queryDict('CHECK_STATUS'), // 检验状态
                this.queryDict('PROMOTE_FLAG'), // 是否加急
                this.queryDict('REMAIN_DEAL'), // 余样处理
                this.queryDict('DIC_IQC_INSPECT_TYPE'), // 检验类型
                this.queryDict('DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'), // 分析方法
                this.queryDict('DIC_IQC_INSPECT_ITEM_VALID'), // 是否有效
                this.queryDict('TRUST_FLAG')]).then(() => { // 是否委外
                this.getData();
                this.searchForm[0].option = this.storeDict['CHECK_STATUS'];
                this.searchForm[3].option = this.storeDict['CHECK_SOURCE'];
                this.searchForm[4].option = this.storeDict['PROMOTE_FLAG'];
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
            this.$http.get(`/qc/fqcsamplyapply/listPage/0`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchObj.createTimeEnd = '';
            this.searchObj.createTimeStart = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'createTime') {
                        this.searchObj.createTimeEnd = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
                        this.searchObj.createTimeStart = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
                    } else {
                        if (v.prop === 'checkStatus' || v.prop === 'checkSource' || v.prop === 'promoteFlag') {
                            this.conditionList.push({
                                fieldName: v.prop,
                                operation: 'EQ',
                                value: v.value,
                                joinType: 'AND',
                            });
                        } else {
                            this.conditionList.push({
                                fieldName: v.prop,
                                operation: 'LIKE',
                                value: v.value,
                                joinType: 'AND',
                            });
                        }

                    }
                }
            });
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        rowDblClickHandler(row) {
            this.editRow(row);
        },
        CurrentChange(row) {
            if (row) {
                this.childRow = { ...row };
                this.getCheckDetail();
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
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[3].value = this.pageTotalSamp;
            this.dialogForm[2].value = 'SQC';
            this.dialogForm[8].value = '0';
            this.dialogForm[9].value = this.userInfo.nickname;
            this.dialogForm[10].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            if (this.userInfo.staffNum) {
                this.$http.get(`/basicdata/dicpersonnel/getDicPersonnel/${this.userInfo.staffNum}`).then((res) => {
                    if (res.data.whetherPersonnel === '0') {
                        this.dialogForm[1].value = res.data.departmentName;
                    }
                });
            }
        },
        editRow(row) {
            this.dialogType = 'edit';
            if (!_.isEmpty(row)) this.parentRow = { ...row };
            else this.parentRow = { ...this.selectRows[0] };
            this.$http.get(`/qc/fqcsamplyapply/getById/${this.parentRow.id}`).then(({ code, data }) => {
                this.dialogVisible = true;
                this.parentRow = data;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
            });
            this.getSamp();
        },
        delRow() {
            const ids = this.selectRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/qc/fqcsamplyapply/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPage = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.$refs.table1.clearSelection();
                });
            });
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
                        delete obj.createBy;
                        delete obj.createTime;
                        this.$http.post('/qc/fqcsamplyapply/save', obj).then(({ code, data }) => {
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
                        this.$http.put('/qc/fqcsamplyapply/updateById', obj).then(() => {
                            this.$message.success('修改成功');
                            this.parentRow = Object.assign(this.parentRow, obj);
                            this.btnsOper[0].loading = false;
                        }).catch(() => {
                            this.btnsOper[0].loading = false;
                        });
                    }
                }
            });
        },
        // 提交
        submitData() {
            this.btnsOper[1].loading = true;
            let obj = { ...this.parentRow };
            obj.checkStatus = '1';
            this.$http.put('/qc/fqcsamplyapply/sumbit', obj).then(() => {
                this.$message.success('提交成功');
                this.parentRow = Object.assign(this.parentRow, obj);
                this.status = this.parentRow.checkStatus;
                this.dialogForm.forEach(v => {
                    v.value = this.parentRow[v.prop];
                    this.btnsOper[1].loading = false;
                });
            }).catch(() => {
                this.btnsOper[1].loading = false;
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
                fieldName: 'applyId',
                operation: 'EQ',
                value: this.parentRow['id'],
                joinType: 'AND',
            });
            return this.$http.get(`/qc/fqcsamplyinfo/page`, {
                params
            }).then(res => {
                this.tableDataSamp = res.data.records;
                this.pageTotalSamp = res.data.total;
                this.tableLoadingSamp = false;
            }).catch(() => {
                this.tableLoadingSamp = false;
            });
        },
        newRowSamp() {
            this.dialogVisibleDialog = true;
            this.dialogType2 = 'new';
        },
        editRowSamp() {
            this.dialogType2 = 'edit';
            this.childRow = { ...this.selectChildRows[0] };
            this.dialogFormDialog.forEach(v => {
                v.value = this.childRow[v.prop];
            });
            this.dialogVisibleDialog = true;
        },
        delRowSamp() {
            const ids = this.selectChildRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete(`/qc/fqcsamplyinfo/removeByIds/${this.parentRow.id}`, {
                    data: ids,
                }).then(() => {
                    this.currentPageSamp = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getSamp();
                    this.tableDataCheck = [];
                    this.pageTotalCheck = 0;
                    this.pageSizeCheck = 20;
                    this.currentPageCheck = 1;
                    this.$refs.table2.clearSelection();
                });
            });
        },
        copyNew() {
            this.dialogType2 = 'copy';
            this.childRow = { ...this.selectChildRows[0] };
            this.dialogFormDialog.forEach(v => {
                if (v.prop !== 'samplingNo') {
                    v.value = this.childRow[v.prop];
                    v.disabled = true;
                }
            });
            this.dialogVisibleDialog = true;
        },
        newRowCheck() {
            this.dialogVisibleDialog2 = true;
            this.dialogType3 = 'new';
        },
        editRowCheck() {
            this.dialogVisibleDialog2 = true;
            const row = this.detailCheckRows[0];
            this.dialogFormDialog2.forEach(v => {
                v.value = row[v.prop];
            });
            this.dialogType3 = 'edit';
        },
        SelectChangeSamp(selection) {
            this.selectChildRows = selection;
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
        //  提交抽样信息
        submitDialogData() {
            let obj = {};
            this.submitLoadingDialog = true;
            this.dialogFormDialog.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.applyId = this.parentRow['id'];
            const params = {
                samplingNo: this.dialogFormDialog[0].value
            };
            switch (this.dialogType2) {
                case 'new':
                    this.$http.post(`/qc/fqcsamplyinfo/save`, obj).then(() => {
                        this.$message.success('添加成功');
                        this.dialogVisibleDialog = false;
                        this.submitLoadingDialog = false;
                    }).catch(() => {
                        this.submitLoadingDialog = false;
                    });
                    break;
                case 'edit':
                    obj.id = this.childRow['id'];
                    this.$http.put(`/qc/fqcsamplyinfo/updateById`, obj).then(() => {
                        this.$message.success('修改成功');
                        this.dialogVisibleDialog = false;
                        this.submitLoadingDialog = false;
                    }).catch(() => {
                        this.submitLoadingDialog = false;
                    });
                    break;
                case 'copy':
                    this.$http.post(`/qc/fqcsamplyinfo/copyInsert/${this.parentRow.id}/${this.childRow.id}`, null, {
                        params
                    }).then((res) => {
                        this.dialogVisibleDialog = false;
                        this.submitLoadingDialog = false;
                    }).catch(() => {
                        this.submitLoadingDialog = false;
                    });
                    break;
            }
        },
        exportMaterial() {
            this.btnsCheck[3].loading = true;
            this.$http.post(`/qc/fqcsamplycheckinfo/importData/${this.childRow.id}`).then(() => {
                this.$message.success('导入成功');
                this.btnsCheck[3].loading = false;
                this.getCheckDetail();
                this.getSamp();
            }).catch(() => {
                this.btnsCheck[3].loading = false;
            });
        },
        // 找找物料信息
        showDialogTable(type) {
            this.dialogSearchForm = {};
            this.type = type;
            this.dialogVisibleDialogTable = true;
            this.getDialogData();
        },
        getDialogData() {
            switch (this.type) {
                case 'material':
                    this.tableColumn_table = this.tableColumnMaterielCode;
                    this.getMaterial();
                    break;
                case 'testItem':
                    this.tableColumn_table = this.testItemColumn;
                    this.getTestItem();
                    break;
            }
        },
        submitFormDialogTable() {
            switch (this.type) {
                case 'material':
                    this.dialogFormDialog[2].value = this.row.materialCode;
                    this.dialogFormDialog[3].value = this.row.materialName;
                    break;
                case 'testItem':
                    this.dialogFormDialog2[0].value = this.row.itemCode;
                    this.dialogFormDialog2[1].value = this.row.itemName;
                    this.dialogFormDialog2[3].value = this.row.sampleSize;
                    this.dialogFormDialog2[4].value = this.row.samplesNumber;
                    this.dialogFormDialog2[5].value = this.row.outsourcing;

            }
            this.dialogVisibleDialogTable = false;
        },
        // 获取检验信息
        getCheckDetail() {
            this.tableLoadingCheck = true;
            const params = {
                current: this.currentPageCheck,
                size: this.pageSizeCheck,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'samplyInfoId',
                operation: 'EQ',
                value: this.childRow.id,
                joinType: 'AND',
            });
            this.$http.get(`/qc/fqcsamplycheckinfo/page`, {
                params
            }).then(res => {
                this.tableDataCheck = res.data.records;
                this.pageTotalCheck = res.data.total;
                this.tableLoadingCheck = false;
            }).catch(() => {
                this.tableLoadingCheck = false;
            });
        },
        SelectChangeChecl(select) {
            this.detailCheckRows = select;
        },
        ChangeCurrentCheck(val) {
            this.currentPageCheck = val;
            this.getCheckDetail();
        },
        ChangeSizeCheck(val) {
            this.pageSizeCheck = val;
            this.currentPageCheck = 1;
            this.getCheckDetail();
        },
        // 新增检验明细
        submitDialogData2() {
            let obj = {};
            this.dialogFormDialog2.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoadingDialog2 = true;
            if (this.dialogType3 === 'new') {
                obj.analysisMethod = this.row.analysisMethod;
                obj.standardLower = this.row.standardLower;
                obj.standardUpper = this.row.standardUpper;
                obj.samplyInfoId = this.childRow.id;
                this.$http.post(`/qc/fqcsamplycheckinfo/save`, obj).then(() => {
                    this.$message.success('新增成功');
                    this.getCheckDetail();
                    this.getSamp();
                    this.dialogVisibleDialog2 = false;
                    this.submitLoadingDialog2 = false;
                }).catch(() => {
                    this.submitLoadingDialog2 = false;
                });
            } else {
                obj.id = this.detailCheckRows[0].id;
                this.$http.put(`/qc/fqcsamplycheckinfo/updateById`, obj).then(() => {
                    this.$message.success('修改成功');
                    this.getCheckDetail();
                    this.dialogVisibleDialog2 = false;
                    this.submitLoadingDialog2 = false;
                }).catch(() => {
                    this.submitLoadingDialog2 = false;
                });
            }

        },
        delRowCheck() {
            const ids = this.detailCheckRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete(`/qc/fqcsamplycheckinfo/removeByIds/${this.childRow.id}`, {
                    data: ids,
                }).then(() => {
                    this.currentPageCheck = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getCheckDetail();
                    this.getSamp();
                    this.$refs.table3.clearSelection();
                });
            });
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
        // 获取检验项目
        getTestItem() {
            const params = {
                current: this.currentPage_table,
                size: this.pageSize_table,
                thicknessRequirement: this.childRow.coreThickness,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'valid',
                operation: 'EQ',
                value: 'Y',
                joinType: 'AND',
            });
            // {
            //     fieldName: 'inspectType',
            //     operation: 'EQ',
            //     value: 'SQC',
            //     joinType: 'AND',
            // }
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
            this.$http.get(`qc/iqcinspectitem/selectIqcInspectItemPage`, { params }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        exportAll() {
            this.dialogVisabledExport = true;
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getDialogData();
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
        InspectReport() {
            this.$http.post(`/qc/fqcsamplyapply/lookReport/${this.selectRows[0].id}`).then(({ code, data }) => {
                this.dialogFormInspect.forEach(v => {
                    v.value = data[v.prop];
                });
                const { samplyInfoList } = data;
                this.InspectReportData = samplyInfoList;
                this.dialogVisibleInspect = true;
            });
        },
        // transformData(data) {
        //     data.forEach(v => {
        //         if (v.samplyCheckInfoList && v.samplyCheckInfoList.length) {
        //             v.checkResult = new Array(5);
        //             v.checkResult[0] = '检验报告';
        //             let isBol = v.samplyCheckInfoList.some(h => _.isEmpty(v));
        //             if (!isBol) {
        //                 let isBol = v.samplyCheckInfoList.some(v => v === '不合格');
        //                 if (isBol) {
        //                     v.checkResult[3] = '合格';
        //                 } else {
        //                     v.checkResult[3] = '不合格';
        //                 }
        //             }
        //         }
        //     });
        //     return data;
        // },
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
                let isBol = data.some(h => _.isEmpty(h.checkResult));
                if (!isBol) {
                    let bol = data.some(v => v.checkResult === '不合格');
                    if (!bol) {
                        sum[3] = '合格';
                    } else {
                        sum[3] = '不合格';
                    }
                } else {
                    sum[3] = '';
                }
            }
            return sum;
        },
        exportPDF() {
            this.$http.get(`/qc/fqcsamplyapply/exportPdf/${this.selectRows[0].id}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '样品检测申请报告.pdf';
                    $a.click();
                }
            });
        },
        exportWORK() {
            this.$http.get(`/qc/fqcsamplyapply/exportDoc/${this.selectRows[0].id}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '样品检测申请报告.doc';
                    $a.click();
                }
            });
        },
    }
};
</script>
<style lang="stylus" scoped>
.sample_application
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
    height 30vh
.footer
    display flex
    margin 0
    padding 0
    list-style none
    border 1px solid #EBEEF5
    border-top none

    li
        flex 1
        color #606266
        border-right 1px solid #EBEEF5
        padding 6px 10px
        line-height 23px
        font-size 12px
        &:last-child
            border-right none
</style>