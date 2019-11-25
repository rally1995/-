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
                    :columnIndex='false'
                    row-key="id"
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
                    ebrain-tools(:buttons="btnsDialog")
            template(#InspecPaln="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="检验方案" required prop="inspectPlanCode")
                        el-input(:readonly='true' :value="value" :disabled="saveDisabled")
                            el-button(slot="append" @click="showDialogTable('inspectPlanCode')" icon="el-icon-search" :disabled="saveDisabled")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="抽样信息" v-if="tableType == 'check'")
                template(#table)
                    ebrain-box-table.dialog_table(
                            ref="table1"
                            :loading="tableLoadingSamp"
                            :pageSize="pageSizeSamp"
                            :pageCurrent="currentPageSamp"
                            :pageTotal="pageTotalSamp"
                            :data="tableDataSamp"
                            :column="tableColumnSamp"
                            row-key="id"
                            @current-change="CurrentChangeSamp"
                            @page-change="ChangeCurrentSamp"
                            @size-change="ChangeSizeSamp")
            ebrain-frame(title="检验明细" v-if="formType !== 'checkOut'")
                template(#tools)
                    ebrain-tools(:buttons="btnsDetail")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table2"
                        :key="Math.random()"
                        v-if="dialogVisible"
                        :loading="tableLoadingDetail"
                        :pageSize="pageSizeDetail"
                        :pageCurrent="currentPageDetail"
                        :pageTotal="pageTotalDetail"
                        :data="tableDataDetail"
                        :column="tableColumnDetail"
                        @cell-dblclick="cellDbclick"
                        row-key="id"
                        @selection-change="SelectChangeDetail"
                        @page-change="ChangeCurrentDetail"
                        @size-change="ChangeSizeDetail")
            ebrain-frame(title="检验报告" v-if="tableType == 'view'")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table3"
                        key="table3"
                        v-if="dialogVisible"
                        :show-summary="true"
                        :columnCheck="false"
                        :columnIndex="false"
                        :summary-method="summaryMethod"
                        :loading="tableLoadingCheck"
                        :data="tableDataCheck"
                        :column="column"
                        row-key="id")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/qc/fqcinspectioncheck/export/1'"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-tag-dialog(
            :visible.sync="dialogVisibleAppro"
            :title="title"
            :isOk="false"
            :submitLoading="subApproLoading")
            div
                el-form(style="marginTop:15px" :model="form")
                    el-form-item(label="审批结果" required)
                        el-select(v-model="form.approvalResult" disabled)
                            el-option(
                                v-for="(option, optionKey) in appResult"
                                :label="option"
                                :value="optionKey"
                                :key="option")
            template(#footer2)
                el-button(type="primary" @click="adopt" :loading="isPastLoading") 通过
                el-button(type="primary" @click="backDown" :loading="isBackLoading") 退回
        ebrain-tag-dialog(
            :visible.sync="dialogVisibleCard"
            :title="title"
            :submitLoading="subTagLoading"
            @submit="submit")
            div(v-if="parentRow && (parentRow.checkStatus === '2' || parentRow.checkStatus === '3')")
                span 该检验单已完成所有检验，请确认提交
                el-form(style="marginTop:15px" :model="form")
                    el-form-item(label="检验结果" required)
                        el-select(v-model="form.checkResult" disabled)
                            el-option(
                                v-for="(option, optionKey) in storeDict['DICT_CHECK_RESULT']"
                                :label="option"
                                :value="optionKey"
                                :key="option")
            div(v-if="parentRow && parentRow.checkStatus === '5'")
                el-form(style="marginTop:15px" :model="form")
                    el-form-item(label="决策结果")
                        el-select(v-model="form.decisionResult"   @change="changeHanler" :disabled="disabledForm.inputDisabled")
                            el-option(
                                v-for="(option, optionKey) in storeDict['DICT_DECOSION_RESULT']"
                                :label="option"
                                :value="optionKey"
                                :key="option")
                    el-form-item(label-width="50px")
                        el-checkbox-group(v-model="form.isChekck")
                            el-checkbox(label="触发不合格审批流程(流程卡)" @change="handlerCheck" :disabled="disabledForm.checkedDisabled")
        ebrain-dialog(
            ref="dialogDetailForm"
            :submitLoading='submitDetailLoading'
            :visible.sync="dialogVisibleDetail"
            :form.sync="dialogFormDetail"
            @submit="submitFormDetail")
            template(#badCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="不良代码" :required="dialogFormDetail[9].required" prop="badName")
                        el-input(:readonly='true' :value="value" :disabled="dialogFormDetail[9].disabled")
                            el-button(slot="append" @click="showDialogTable('badName')" icon="el-icon-search" :disabled="dialogFormDetail[9].disabled")
            template(#measurementType="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="计量器具类型"  prop="measurementType")
                        el-input(:readonly='true' :value="value" :disabled="dialogFormDetail[10].disabled")
                            el-button(slot="append" @click="showDialogTable('measurementType')" icon="el-icon-search" :disabled="dialogFormDetail[10].disabled")
            template(#internalNo="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="内部编码"  prop="internalNo")
                        el-input(:readonly='true' :value="value" :disabled="dialogFormDetail[11].disabled")
                            el-button(slot="append" @click="showDialogTable('internalNo')" icon="el-icon-search" :disabled="dialogFormDetail[11].disabled")
        ebrain-dialog-table.materielCode(
            dialogTableSearch
            height="60vh"
            row-key="id"
            :data="tableData_table"
            :column="dialogColumn"
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
</template>
<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import EbrainTagDialog from '@/components/EbrainTagDialog';
import moment from 'moment';
import dict from '@/utils/dict';
import _ from 'lodash';
import { strip }  from '@/utils';
export default {
    name: 'inspectApplication',
    components: {
        EbrainDialogTable,
        EbrainTagDialog
    },
    data() {
        return {
            row: [],
            type: '',
            dialogColumn: [],
            parentMaterialType: '',
            isChekck: false,
            collapse: false,
            tableType: '',
            btnsDialog: [],
            searchVisible: true,
            formType: '',
            exportIds: [],
            selectDetailRows: [],
            isPastLoading: false,
            isBackLoading: false,
            submitDetailLoading: false,
            dialogVisibleDetail: false,
            dialogVisibleDialogTable: false,
            tableData_table: [],
            dialogTableLoading: false,
            column: [],
            pageSize_table: 20,
            currentPage_table: 1,
            pageTotal_table: 0,
            codeObj: {},
            measObj: {},
            inCodeObj: {},
            dialogVisibleAppro: false,
            subApproLoading: false,
            checkResult: '',
            actData: [],
            ResultValue: '',
            badCode: '',
            dialogFormDetail: [{
                label: '检验项目名称',
                prop: 'itemName',
                value: '',
                disabled: true,
            }, {
                label: '抽样试样数',
                prop: 'samplingAmount',
                value: '',
                disabled: true,
            }, {
                label: '实测值',
                prop: 'actValue',
                value: '',
                required: true,
                placeholder: `请输入X个实测值,并用逗号隔开`,
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.selectDetailRows[0].analysisMethod === 'QUANTITATIVE') {
                            if (value) {
                                let actValueStr = this.dialogFormDetail.find(v => v.prop === 'actValue').value;
                                actValueStr = actValueStr.replace(/\s+/g, '');
                                actValueStr = actValueStr.replace(/，/ig, ',');
                                this.dialogFormDetail[2].value = actValueStr;
                                let actValueArr = actValueStr.split(',');
                                let reg = /^[0-9]+(\.\d+)?$/;
                                const item = this.dialogFormDetail.find(v => v.prop === 'samplingAmount');
                                const isblo = actValueArr.some(v => !reg.test(v));
                                if (isblo) {
                                    callback(new Error('请输入大于等于0的数!'));
                                } else if (actValueArr.length !== Number(item.value)) {
                                    callback(new Error(`请输入${item.value}个抽样试样数!`));
                                } else {
                                    let sum = 0;
                                    actValueArr.forEach(v => {
                                        sum += Number(v);
                                    });
                                    this.dialogFormDetail[3].value = strip(sum / actValueArr.length).toFixed(4);
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
                change: (val) => {
                    let actValueStr = this.dialogFormDetail.find(v => v.prop === 'actValue').value;
                    actValueStr = actValueStr.replace(/\s+/g, '');
                    actValueStr = actValueStr.replace(/，/ig, ',');
                    this.dialogFormDetail[2].value = actValueStr;
                    if (val && this.selectDetailRows[0].analysisMethod === 'QUANTITATIVE') {
                        const val1 = this.dialogFormDetail.find(v => v.prop === 'standardLower').value;
                        const val2 = this.dialogFormDetail.find(v => v.prop === 'standardUpper').value;
                        let actValueArr = actValueStr.split(',');
                        for (let i = 0; i < actValueArr.length; i++) {
                            if (Number(actValueArr[i]) <= Number(val2) && Number(actValueArr[i]) >= Number(val1)) {
                                this.ResultValue = '0';
                            } else {
                                this.ResultValue = '1';
                                break;
                            }
                        }
                        this.dialogFormDetail[8].value = this.ResultValue;
                    } else {
                        this.dialogFormDetail[8].value = '';
                        this.$refs.dialogDetailForm.$refs.form.resetFields();
                    }
                }
            }, {
                label: '均值',
                prop: 'average',
                value: '',
                disabled: true,
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                value: '',
                disabled: true,
            }, {
                label: '典型值',
                prop: 'standardValue',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '标准值下限',
                prop: 'standardLower',
                value: '',
                disabled: true,
            }, {
                label: '标准值上限',
                prop: 'standardUpper',
                value: '',
                disabled: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                required: true,
                type: 'select',
                change: (val) => {
                    this.ResultValue = val;
                    if (val === '0') {
                        // 合格
                        this.dialogFormDetail[9].value = '';
                        this.dialogFormDetail[9].required = false;
                        this.dialogFormDetail[9].disabled = true;
                    } else {
                        this.dialogFormDetail[9].required = true;
                        this.dialogFormDetail[9].disabled = false;
                        this.dialogFormDetail[9].value = this.selectDetailRows[0].badName;
                        this.badCode = this.row.badCode;
                    }
                },
                option: () => this.storeDict['DICT_CHECK_RESULT'],
            }, {
                label: '不良代码',
                prop: 'badName',
                value: '',
                required: true,
                disabled: true,
                slot: 'badCode'
            }, {
                label: '计量器具类型',
                prop: 'measurementType',
                value: '',
                type: 'select',
                option: () => this.measObj,
                slot: 'measurementType',
            }, {
                label: '内部编码',
                prop: 'internalNo',
                value: '',
                type: 'select',
                option: () => this.inCodeObj,
                slot: 'internalNo',
            }, {
                label: '检验人',
                prop: 'updateBy',
                value: '',
                disabled: true,
            }, {
                label: '检验时间',
                prop: 'updateTime',
                value: '',
                disabled: true,
            }, {
                label: '审批结果',
                prop: 'approvalResult',
                value: '',
                required: true,
                type: 'select',
                option: () => dict.appResult,
            }],
            childRows: {},
            searchForm: [{
                label: '检验状态',
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
                label: '接收时间',
                prop: 'recipientTime',
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
            form: {
                checkResult: '',
                approvalResult: '',
                decisionResult: '',
                isChekck: '',
            },
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            submitLoading: false,
            dialogVisible: false,
            dialogType: '',
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
            dialogOperation: [{
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
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['DICT_CHECK_SOURCE'],
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
                disabled: true,
                slot: 'InspecPaln',
            }, {
                label: '抽样方式',
                prop: 'samplingMethod',
                value: '',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_METHOD'],
                disabled: true,
            }, {
                label: '抽样数量',
                prop: 'samplingAmount',
                value: '',
                disabled: true,
            }, {
                label: '是否加急',
                prop: 'ifUrgent',
                value: '',
                type: 'select',
                option: () => dict.isEmergency,
                disabled: true,
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
                label: '接收时间',
                prop: 'recipientTime',
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
            badColumn: [{
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
            parentRow: {},
            dialogVisabledExport: false,
            exportFilename: '',
            selectRows: [],
            conditionList: [],
            dialogForm: [],
            searchObj: {
                deliverStartTime: '',
                deliverEndTime: '',
                inspectStartTime: '',
                inspectEndTime: '',
                recipientStartTime: '',
                recipientEndTime: '',
            },
            disabledForm: {
                inputDisabled: false,
                checkedDisabled: false,
            },
            btnsTop: [{
                label: '接收',
                click: () => this.receive(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.receiveDisabled,
                permi: 'qc_fqcinspectioncheck_receive',
            }, {
                label: '检验',
                click: () => this.checkout(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.checkOutDisabled,
                permi: false,
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
                disabled: () => this.viewCheckDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsApproval: [{
                label: '暂存',
                click: () => this.saveData(),
                className: 'iconfont iconstatus-Submission',
                permi: 'qc_fqcinspectioncheck_edit',
                loading: false,
                disabled: () => this.saveDisabled,
            }, {
                label: '提交',
                click: () => this.submitData(),
                className: 'iconfont iconstatus-Submission',
                permi: 'qc_fqcinspectioncheck_submit_inspection',
                loading: false,
                disabled: () => this.subDisabled,
            }, {
                label: '审批',
                click: () => this.approval(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcinspectioncheck_approval',
                loading: false,
                disabled: () => this.approDisabled,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }],
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

            btnsDetail: [{
                label: '删除',
                click: () => this.delRowDetail(),
                disabled: () => this.delDisabled,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_fqcinspectionitem_dels',
            }],
            tableLoadingDetail: false,
            pageSizeDetail: 20,
            currentPageDetail: 1,
            pageTotalDetail: 0,
            tableDataDetail: [],
            dialogVisibleCard: false,
            title: '检验结果',
            appResult: {},
            subTagLoading: false,
            tableLoadingCheck: false,
            tableDataCheck: [],
            tableColumnDetail: [{
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '抽样试样数',
                prop: 'samplingAmount',
                showOverflowTooltip: true,
            }, {
                label: '实测值(回车提交)',
                prop: 'actValue',
                type: 'select',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.updateDetail(value, prop, row),
            }, {
                label: '均值',
                prop: 'average',
                showOverflowTooltip: true,
            }, {
                label: '典型值',
                prop: 'standardValue',
                showOverflowTooltip: true,
            }, {
                label: '标准值下限',
                prop: 'standardLower',
                showOverflowTooltip: true,
            }, {
                label: '标准值上限',
                prop: 'standardUpper',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                editable: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DICT_CHECK_RESULT'][cell];
                },
                option: {},
                change: (value, prop, row) => this.updateDetail(value, prop, row),
            }, {
                label: '不良代码(双击修改)',
                prop: 'badName',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    if (row.checkResult === '1') {
                        return row.badName;
                    } else {
                        return '';
                    }
                }
            }, {
                label: '计量器具类型(双击修改)',
                prop: 'measurementType',
                showOverflowTooltip: true,
            }, {
                label: '内部编码(双击修改)',
                prop: 'internalNo',
                showOverflowTooltip: true,
            }, {
                label: '检验人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '检验时间',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }, {
                label: '审批结果',
                prop: 'approvalResult',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.updateDetail(value, prop, row),
                formatter: (row, column, cell) => {
                    return dict.appResult[cell];
                },
            }],
            checkResultArr: [],
            userArr: [],
            objData: {},
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser,
        }),
        receiveDisabled() {
            const filterData = this.selectRows.every(v => v.checkStatus === '1');
            return this.selectRows.length === 0 || !filterData;
        },
        checkOutDisabled() {
            let stuStr = '';
            const status = this.selectRows.map(v => v.checkStatus);
            if (status.length) stuStr = status[0];
            return this.selectRows.length !== 1 || stuStr === '1';
        },
        viewCheckDisabled() {
            let parentRow = {};
            const apiArr = ['5', '6', '7'];
            if (this.selectRows.length) {
                parentRow = this.selectRows[0];
            }
            return this.selectRows.length !== 1 || (parentRow && !apiArr.includes(parentRow.checkStatus));
        },
        approDisabled() {
            return this.parentRow && this.parentRow.checkStatus !== '4' || this.tableDataDetail.length === '0';
        },
        editDisabled() {
            return this.selectDetailRows.length !== 1;
        },
        delDisabled() {
            const arr = ['2', '3'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return this.selectDetailRows.length === 0 || !flag;
        },
        saveDisabled() {
            const arr = ['2', '3'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return !flag;
        },
        subDisabled() {
            const arr = ['2', '3', '5'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return !flag;
        },
    },
    watch: {
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = 'FQC成品检验单';
            }
        },
        dialogVisibleDialogTable(val) {
            if (!val) {
                this.dialogColumn = [];
                this.tableData_table = [];
                this.pageSize_table = 20;
                this.currentPage_table = 1;
                this.pageTotal_table = 0;
            } else {
                this.row = {};
            }
        },
        dialogVisibleCard(val) {
            if (!val) {
                this.form.checkResult = '';
                this.form.approvalResult = '';
                this.form.decisionResult = '';
                this.form.isChekck = '';
                this.title = '';
            }
        },
        dialogVisibleDetail(val) {
            if (val) {
                this.$nextTick(() => {
                    const num = this.dialogFormDetail[1].value;
                    this.dialogFormDetail[2].placeholder = `请输入${num}个值,并用逗号隔开`;
                });
                if (this.selectDetailRows[0].analysisMethod === 'QUALITATION') {
                    // QUALITATION 定性
                    this.dialogFormDetail[2].required = false;
                    this.dialogFormDetail[8].disabled = false;
                } else {
                    //  QUANTITATIVE 定量
                    this.dialogFormDetail[2].required = true;
                    this.dialogFormDetail[8].disabled = true;
                }
                if (this.parentRow.checkStatus === '4') {
                    // 待审批
                    this.dialogFormDetail[14].value = '0';
                    this.dialogFormDetail.forEach(v => {
                        if (v.prop === 'approvalResult') {
                            v.disabled = false;
                            v.required = true;
                        } else {
                            v.disabled = true;
                        }
                    });
                } else if (this.parentRow.checkStatus === '2' || this.parentRow.checkStatus === '3') {
                    // 检验中和待检验
                    const api = ['actValue', 'measurementType', 'internalNo'];
                    this.dialogFormDetail.forEach(v => {
                        if (api.includes(v.prop)) {
                            v.disabled = false;
                        } else {
                            if (v.prop === 'approvalResult') {
                                v.disabled = true;
                                v.required = false;
                            }
                        }
                    });
                    this.$nextTick(() => {
                        if (this.dialogFormDetail[8].value === '1') {
                            this.dialogFormDetail[9].required = true;
                            this.dialogFormDetail[9].disabled = false;
                            this.dialogFormDetail[9].value = this.selectDetailRows[0].badName;
                            this.badCode = this.row.badCode;
                        } else {
                            this.dialogFormDetail[9].value = '';
                            this.dialogFormDetail[9].required = false;
                            this.dialogFormDetail[9].disabled = true;
                        }
                    });
                } else {
                    // 决策状态
                    this.dialogFormDetail.forEach(v => {
                        v.disabled = true;
                    });
                }
            } else {
                this.ResultValue = '';
                this.badCode = '';
            }
        },
        ResultValue(val) {
            if (this.parentRow.checkStatus === '2' || this.parentRow.checkStatus === '3') {
                if (val === '1') {
                    this.dialogFormDetail[9].required = true;
                    this.dialogFormDetail[9].disabled = false;
                    this.dialogFormDetail[9].value = this.selectDetailRows[0].badName;
                    this.badCode = this.row.badCode;
                } else {
                    this.dialogFormDetail[9].value = '';
                    this.dialogFormDetail[9].required = false;
                    this.dialogFormDetail[9].disabled = true;
                }
            }

        },
        dialogVisible(val) {
            if (!val) {
                this.getData();
                this.parentRow = {};
                this.dialogType = '';
                this.formType = '';
                this.dialogForm = [];
                this.tableDataSamp = [];
                this.currentPageSamp = 1;
                this.pageTotalDetail = 0;
                this.pageSizeDetail = 20;
                this.tableDataDetail = [];
                this.currentPageDetail = 1;
                this.pageTotalDetail = 0;
                this.pageSizeDetail = 20;
                this.tableType = '';
                this.column = [];
                this.tableDataCheck = [];
                this.selectDetailRows = [];
                this.parentMaterialType = '';
                this.checkResultArr = [];
            }
        },
        parentRow(parentRow) {
            if (parentRow) {
                if (parentRow.checkStatus === '2' || parentRow.checkStatus === '3') {
                    this.tableColumnDetail[2].editable = true;
                    this.tableColumnDetail[7].editable = true;
                    this.tableColumnDetail[13].editable = false;
                } else if (parentRow.checkStatus === '4') {
                    this.tableColumnDetail[2].editable = false;
                    this.tableColumnDetail[7].editable = false;
                    this.tableColumnDetail[13].editable = true;
                } else {
                    this.tableColumnDetail[2].editable = false;
                    this.tableColumnDetail[7].editable = false;
                    this.tableColumnDetail[13].editable = false;
                }
            }
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('DICT_CHECK_STATUS'),
                this.queryDict('DICT_CHECK_RESULT'),
                this.queryDict('DIC_IQC_INSPECT_METHOD'),
                this.queryDict('DIC_IQC_SAMPLING_METHOD'),
                this.queryDict('DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'),
                this.queryDict('DIC_IQC_INSPECT_MATERIEL_DEFAULT_INSPECT'),
                this.queryDict('DIC_IQC_INSPECT_METHOD_VALID'),
                this.queryDict('DIC_IQC_INSPECT_MATERIEL_STATUS'),
                this.queryDict('DIC_IQC_INSPECT_TYPE'),
                this.queryDict('DICT_CHECK_SOURCE'),
                this.queryDict('DICT_DECOSION_RESULT'),
                this.queryDict('DIC_IQC_INSPECT_TYPE')]).then(() => {
                this.appResult = dict.appResult;
                this.tableColumnDetail[7].option = this.storeDict['DICT_CHECK_RESULT'];
                this.tableColumnDetail[13].option = dict.appResult;
                this.searchForm[0].option = this.storeDict['DICT_CHECK_STATUS'];
                delete this.searchForm[0].option['0'];
                this.searchForm[1].option = this.storeDict['DICT_CHECK_RESULT'];
                this.searchForm[2].option = this.storeDict['DICT_DECOSION_RESULT'];
            }).then(() => {
                this.getData();
                this.getUser();
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
            this.searchObj.recipientStartTime = '';
            this.searchObj.recipientEndTime = '';
            this.searchObj.inspectStartTime = '';
            this.searchObj.inspectEndTime = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'recipientTime') {
                        this.searchObj.recipientStartTime = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
                        this.searchObj.recipientEndTime = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
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
                        });
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
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                ...this.searchObj,
                conditionList: [{
                    fieldName: 'checkStatus',
                    operation: 'NEQ',
                    value: 0,
                    joinType: 'AND',
                }],
            };
            if (this.conditionList.length) params.conditionList = [...this.conditionList];
            return this.$http.get(`/qc/fqcinspectioncheck/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        receive() {
            const ids = this.selectRows.map(v => v.id);
            this.$http.post(`/qc/fqcinspectioncheck/receive`, ids).then(() => {
                this.$message.success('接收成功');
                this.getData();
                this.$refs.table1.clearSelection();
            });
        },
        checkout() {
            this.tableType = 'check';
            this.btnsDialog = [...this.btnsApproval];
            this.dialogVisible = true;
            this.dialogForm = [...this.dialogOperation];
            this.parentRow = { ...this.selectRows[0] };
            this.dialogForm.forEach(v => {
                v.value = this.parentRow[v.prop];
            });
            this.getSamp();
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
        approval() {
            const params = {
                id: this.parentRow['id']
            };
            this.$http.post(`/qc/fqcinspectioncheck/approval`, null, {
                params
            }).then(({ data }) => {
                if (data) {
                    this.form.approvalResult = '1';
                } else {
                    this.form.approvalResult = '0';
                }
                this.dialogVisibleAppro = true;
                this.title = '审批结果';
            });
        },
        submit() {
            if (this.parentRow.checkStatus === '2' || this.parentRow.checkStatus === '3') {
                let obj = { ...this.parentRow };
                obj.checkResult = this.form.checkResult;
                this.subTagLoading = true;
                this.$http.post(`/qc/fqcinspectioncheck/submitInspection`, obj).then(({ data }) => {
                    this.$message.success('提交成功');
                    this.getSamp();
                    this.getDatailData();
                    this.dialogVisibleCard = false;
                    this.dialogVisible = false;
                    this.parentRow = data;
                    this.subTagLoading = false;
                    this.dialogForm.forEach(v => {
                        v.value = data[v.prop];
                    });
                }).catch(() => {
                    this.subTagLoading = false;
                });
            } else if (this.parentRow.checkStatus === '5') {
                // 如果没有勾选,更新状态为已决策
                let obj = { ...this.parentRow };
                // obj.approvalResult = this.form.decisionResult;
                obj.decisionResult = this.form.decisionResult;
                // 勾选不合格审批流程,跟新状态为决策中,
                if (this.form.isChekck) {
                    obj.checkStatus = '6';
                    this.subTagLoading = true;
                    this.$http.put(`/qc/fqcinspectioncheck/updateFqcInspectionCheck`, obj).then(({ data }) => {
                        this.$message.success('提交成功');
                        this.getSamp();
                        this.getDatailData();
                        this.dialogVisibleCard = false;
                        this.dialogVisible = false;
                        this.parentRow = data;
                        this.subTagLoading = false;
                        this.dialogForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                    }).catch(() => {
                        this.subTagLoading = false;
                    });
                } else if (!this.form.isChekck && this.form.decisionResult) {
                    // 如果没有勾选并且有决策结果,更新状态为已决策
                    obj.checkStatus = '7';
                    obj.decisionResult = this.form.decisionResult;
                    this.subTagLoading = true;
                    this.$http.put(`/qc/fqcinspectioncheck/updateFqcInspectionCheck`, obj).then(({ data }) => {
                        this.$message.success('提交成功');
                        this.getSamp();
                        this.getDatailData();
                        this.dialogVisibleCard = false;
                        this.dialogVisible = false;
                        this.parentRow = data;
                        this.subTagLoading = false;
                        this.dialogForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                    }).catch(() => {
                        this.subTagLoading = false;
                    });
                }
            }
        },
        // 审批通过
        adopt() {
            let obj = { ...this.parentRow };
            obj.approvalResult = this.form.approvalResult;
            obj.checkStatus = '5';
            obj.inspectorName = this.userInfo.nickname;
            obj.inspector = this.userInfo.userId;
            obj.approvalTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.isPastLoading = true;
            this.$http.put(`/qc/fqcinspectioncheck/updateFqcInspectionCheck`, obj).then(({ data }) => {
                this.$message.success('审批成功');
                this.getSamp();
                this.getDatailData();
                // this.dialogVisibleCard = false;
                this.dialogVisibleAppro = false;
                this.dialogVisible = false;
                this.parentRow = data;
                this.isPastLoading = false;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
            }).catch(() => {
                this.isPastLoading = false;
            });
            this.isPastLoading = false;
        },
        // 退回
        backDown() {
            let obj = { ...this.parentRow };
            obj.approvalResult = this.form.approvalResult;
            obj.checkStatus = '3';
            this.isBackLoading = true;
            this.$http.put(`/qc/fqcinspectioncheck/updateFqcInspectionCheck`, obj).then(({ data }) => {
                this.$message.success('退回成功');
                this.getSamp();
                this.getDatailData();
                // this.dialogVisibleCard = false;
                this.parentRow = data;
                this.isBackLoading = false;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
                this.dialogVisibleAppro = false;
                this.dialogVisible = false;
            }).catch(() => {
                this.isBackLoading = false;
            });
        },
        // 提交
        submitData() {
            // 检验中和待检验状态检验结果为空的时候直接调用提交接口
            let checkResult =  this.dialogForm.find(v => v.prop === 'checkResult').value;
            if (this.parentRow.checkStatus !== '5') {
                if (_.isEmpty(checkResult)) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    obj.id = this.parentRow['id'];
                    this.btnsApproval[1].loading = true;
                    this.$http.post(`/qc/fqcinspectioncheck/submitInspection`, obj).then(({ data }) => {
                        this.$message.success('已提交检验');
                        this.btnsApproval[1].loading = false;
                        this.getSamp();
                        this.getDatailData();
                        this.dialogForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                    }).catch(() => {
                        this.btnsApproval[1].loading = false;
                    });
                } else {
                    this.title = '检验结果';
                    this.form.checkResult = checkResult;
                    this.dialogVisibleCard = true;
                }
            } else {
                // 待决策
                this.title = '决策结果';
                this.dialogVisibleCard = true;
                this.form.checkResult = checkResult;
                if (this.form.checkResult) {
                    this.form.isChekck = false;
                    this.disabledForm.inputDisabled = false;
                    this.disabledForm.checkedDisabled = false;
                    if (this.form.checkResult === '0') {
                        // 如果检验结果为合格,决策结果默认为合格入库
                        this.form.decisionResult = '0';
                    } else {
                        this.form.decisionResult = '';
                    }
                } else {
                    // 检验结果为空,勾选不合格审批流程
                    this.form.decisionResult = '';
                    this.disabledForm.inputDisabled = true;
                    this.disabledForm.checkedDisabled = true;
                    this.form.isChekck = true;
                }
            }

        },
        saveData() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    obj.checkStatus = '3';
                    obj.id = this.parentRow['id'];
                    this.btnsApproval[0].loading = true;
                    this.$http.put(`/qc/fqcinspectioncheck/updateFqcInspectionCheck`, obj).then(({ data }) => {
                        this.$message.success('已暂存');
                        this.btnsApproval[0].loading = false;
                        this.dialogForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                    }).catch(() => {
                        this.btnsApproval[0].loading = false;
                    });
                }
            });
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
            return this.$http.get(`/qc/fqcsamplinginfo/page`, {
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
        InspectReport() {
            this.formType = 'checkOut';
            this.btnsDialog = [...this.btnCheck];
            this.dialogForm = [...this.dialogInspect];
            this.parentRow = { ...this.selectRows[0] };
            this.column = [...this.tableColumnCheck];
            this.dialogVisible = true;
            this.tableType = 'view';
            this.getCheck();
        },
        // 查看检验报告
        getCheck() {
            this.tableLoadingCheck = true;
            const params = {
                id: this.parentRow['id']
            };
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
            for (let i = 0; i < arr.length; i++) {
                arr[i].checkResult = res[i].checkResult;
            }
            return { data: arr, column: col, checkResultArr: res };
        },
        // 获取检验方案
        showDialogTable(type) {
            this.dialogVisibleDialogTable = true;
            this.dialogSearchForm = {};
            this.type = type;
            switch (type) {
                case 'inspectPlanCode':
                    this.dialogColumn = this.inspactCloum;
                    this.getDialogData();
                    break;
                case 'badName':
                    this.dialogColumn = this.badColumn;
                    this.getMatrtailTypeCode().then(() => {
                        this.getUnCode();
                    });
                    break;
                case 'measurementType':
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                    break;
                case 'internalNo':
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                    break;
            }
        },
        getDialogData() {
            switch (this.type) {
                case 'inspectPlanCode':
                    this.getInspctPaln();
                    break;
                case 'badName':
                    // this.getMatrtailTypeCode().then(() => {
                    //     this.getUnCode();
                    // });
                    this.getUnCode();
                    break;
                case 'measurementType':
                    this.getMeas();
                    break;
                case 'internalNo':
                    this.getMeas();
                    break;
            }
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
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getDialogData();
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
        submitFormDialogTable() {
            let obj = { ...this.objData };
            console.log(this.objData);
            obj.checkId = this.parentRow['id'];
            obj.samplingId = this.childRows['id'];
            delete obj.tenantId;
            switch (this.type) {
                case 'inspectPlanCode':
                    this.dialogForm[13].value = this.row.inspectMaterielCode;
                    break;
                case 'badName':
                    // this.dialogFormDetail[9].value = this.row.badDesc;
                    // this.badCode = this.row.badCode;
                    obj.badCode = this.row.badCode;
                    obj.badName = this.row.badDesc;
                    break;
                case 'measurementType':
                    // this.dialogFormDetail[10].value = this.row.measurType;
                    // this.dialogFormDetail[11].value = this.row.intCode;
                    obj.measurementType = this.row.measurType;
                    obj.internalNo = this.row.intCode;
                    break;
                case 'internalNo':
                    obj.measurementType = this.row.measurType;
                    obj.internalNo = this.row.intCode;
                    break;
            }
            this.$http.put(`/qc/fqcinspectionitem/updateInspectionItem`, obj).then(() => {
                this.$message.success('修改成功');
                this.getDatailData();
                this.getSamp();
                this.getData().then(() => {
                    this.parentRow = this.tableData.find(v => v.id === this.parentRow['id']);
                    this.dialogForm.forEach(v => {
                        v.value = this.parentRow[v.prop];
                    });
                });
            });
            this.dialogVisibleDialogTable = false;
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
        // 获取检验明细
        getDatailData() {
            this.tableLoadingDetail = true;
            const params = {
                current: this.currentPageDetail,
                size: this.pageSizeDetail,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'checkId',
                operation: 'EQ',
                value: this.parentRow['id'],
                joinType: 'AND',
            }, {
                fieldName: 'samplingId',
                operation: 'EQ',
                value: this.childRows['id'],
                joinType: 'AND',
            });
            return this.$http.get(`/qc/fqcinspectionitem/page`, {
                params
            }).then(res => {
                this.tableDataDetail = res.data.records;
                this.pageTotalDetail = res.data.total;
                this.tableLoadingDetail = false;
            }).catch(() => {
                this.tableLoadingDetail = false;
            });
        },
        ChangeCurrentDetail(val) {
            this.currentPageDetail = val;
            this.getDatailData();
        },
        ChangeSizeDetail(val) {
            this.pageSizeDetail = val;
            this.currentPageDetail = 1;
            this.getDatailData();
        },
        CurrentChangeSamp(row) {
            if (row) {
                this.childRows = row;
                this.getDatailData();
            }
        },
        SelectChangeDetail(selection) {
            this.selectDetailRows = selection;
        },
        editRowDetail() {
            this.dialogVisibleDetail = true;
            const data = this.selectDetailRows[0];
            this.$nextTick(() => {
                this.dialogFormDetail.forEach(v => {
                    if (v.prop !== 'badCode') {
                        v.value = data[v.prop];
                    }
                });
                this.$refs.dialogDetailForm.$refs.form.resetFields();
            });

        },
        // 获取物料类别
        getMatrtailTypeCode() {
            const materialCode = this.dialogForm[3].value;
            return this.$http.get(`/basicdata/dicbasicmaterial/getByMaterialCode/${materialCode}`).then(res => {
                this.parentMaterialType = res.data.materialTypeCode;

            });
        },
        // 获取不良代码
        getUnCode() {
            this.dialogTableLoading = true;
            const params = {
                current: this.currentPage_table,
                size: this.pageSize_table,
                parentMaterialType: this.parentMaterialType,
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
            this.$http.post(`qc/iqcbadcode/getPageUsedIqcinspectItem`, null, {
                params
            }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        // 获取计量仪器
        getMeas() {
            this.dialogTableLoading = true;
            const params = {
                current: this.currentPage_table,
                size: this.pageSize_table,
                latestCalibDateStart: '',
                latestCalibDateEnd: '',
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
            }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        changeHanler() {
            this.isChekck = false;
            this.form.isChekck = '';
        },
        handlerCheck() {
            this.form.decisionResult = '';
        },
        delRowDetail() {
            const ids = this.selectDetailRows.map(v => v.id);
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/qc/fqcinspectionitem/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPageDetail = 1;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getDatailData();
                    this.$refs.table2.clearSelection();
                });
            });
        },
        submitFormDetail() {
            let obj = {};
            this.dialogFormDetail.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.selectDetailRows[0].id;
            obj.itemId = this.selectDetailRows[0].itemId;
            obj.checkId = this.parentRow['id'];
            obj.samplingId = this.childRows['id'];
            obj.analysisMethod = this.selectDetailRows[0].analysisMethod;
            obj.inspectUnit = this.selectDetailRows[0]['inspectUnit'];
            if (obj.checkResult === '0') {
                // 如果是合格就不传不良代码,如果是不合格就传不良代码
                delete obj.badCode;
                delete obj.badName;
            } else {
                obj.badCode = this.badCode;
            }
            delete obj.updateBy;
            this.submitDetailLoading = true;
            this.$http.put(`/qc/fqcinspectionitem/updateInspectionItem`, obj).then(() => {
                this.$message.success('修改成功');
                this.dialogVisibleDetail = false;
                this.submitDetailLoading = false;
                this.getDatailData();
                this.getSamp();
                this.getData().then(() => {
                    this.parentRow = this.tableData.find(v => v.id === this.parentRow['id']);
                    this.dialogForm.forEach(v => {
                        v.value = this.parentRow[v.prop];
                    });
                });
            }).catch(() => {
                this.submitDetailLoading = false;
            });

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
        // 修改检验明细
        updateDetail(value, head, row) {
            let obj = { ...row };
            obj.checkId = this.parentRow['id'];
            obj.samplingId = this.childRows['id'];
            delete obj.tenantId;
            delete obj.average;
            if (head === 'actValue') {
                obj.actValue = value;
                if (row.analysisMethod === 'QUANTITATIVE') {
                    let actValueArr = obj.actValue.split('/');
                    let reg = /^[0-9]+(\.\d+)?$/;
                    const isblo = actValueArr.some(v => !reg.test(v));
                    if (isblo) {
                        this.$message.warning(`请输入大于等于0的数`);
                        return false;
                    } else if (actValueArr.length !== row.samplingAmount) {
                        this.$message.warning(`请输入${row.samplingAmount}个实测值,并用/隔开`);
                        return false;
                    }
                }
            } else if (head === 'checkResult') {
                obj.checkResult = value;
            } else if (head === 'approvalResult') {
                obj.approvalResult = value;
            }
            this.$http.put(`/qc/fqcinspectionitem/updateInspectionItem`, obj).then(() => {
                this.$message.success('修改成功');
                this.getDatailData();
                this.getSamp();
                this.getData().then(() => {
                    this.parentRow = this.tableData.find(v => v.id === this.parentRow['id']);
                    this.dialogForm.forEach(v => {
                        v.value = this.parentRow[v.prop];
                    });
                });
            });
        },
        // 双击弹出表格
        cellDbclick(row, column, cell, event) {
            this.type = column.property;
            this.dialogSearchForm = {};
            this.objData = {};
            this.objData = { ...row };
            if (this.parentRow.checkStatus === '2' || this.parentRow.checkStatus === '3') {
                if (column.property === 'badName' && row.checkResult === '1') {
                    this.dialogVisibleDialogTable = true;
                    this.dialogColumn = this.badColumn;
                    this.getMatrtailTypeCode().then(() => {
                        this.getUnCode();
                    });
                } else if (column.property === 'measurementType') {
                    this.dialogVisibleDialogTable = true;
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                } else if (column.property === 'internalNo') {
                    this.dialogVisibleDialogTable = true;
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                }
            }
        },
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
