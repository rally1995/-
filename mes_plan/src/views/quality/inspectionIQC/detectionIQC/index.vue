<template lang="pug">
    ebrain-main.iqc
        ebrain-frame(
            title="IQC检验单列表")
            template(#tools)
                ebrain-tools(:buttons="buttons")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="getData"
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
        el-dialog.dialog(
            height="550"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false")
            div.flex
                el-button(type="primary" v-show="step!==0" @click="prevStep") 上一步
                el-steps.steps(:active="step" align-center finish-status="success" simple)
                    el-step(title="检验信息")
                    el-step(title="检验明细")
                    el-step(title="检验结果")
                    el-step(title="决策结果")
                el-button(type="primary" v-show="step!==3" @click="nextStep" :disabled="nextBtnDisabled||nextClick") 下一步
            div.detial(v-show="step===0")
                div.button
                    el-button(@click="addDetection" :loading="submitLoading" :disabled="isSubClick||noEdit") {{submitName}}
                    el-button(@click="cancel") 取消
                el-form.form(
                    label-width="125px"
                    ref="form"
                    :model="form"
                    inline)
                    div.form_1
                        h3.title IQC检验-申请单信息
                        el-row(:gutter="20")
                            el-col(:span="12")
                                el-form-item(label="申请单号" prop="applyCode" required)
                                    el-input(readonly=true v-model="form.applyCode" :disabled="submitName==='修改'")
                                        el-button(slot="append" icon="el-icon-search" @click="enterDetailTable('applyCode')" :disabled="submitName==='修改'")
                            el-col(:span="12")
                                el-form-item(label="检验单类型" prop="inspectType" required)
                                    el-input(v-model="form.inspectType" disabled)
                            el-col(:span="12")
                                el-form-item(label="申请人" required)
                                    el-input(v-model="form.applyMan" disabled)
                            el-col(:span="12")
                                el-form-item(label="申请时间" required)
                                    el-date-picker(
                                        v-model="form.applyTime"
                                        type="datetime"
                                        disabled
                                        placeholder="选择日期时间")
                            el-col(:span="12")
                                el-form-item(label="料号" required)
                                    el-input(v-model="form.materielCode" disabled)
                            el-col(:span="12")
                                el-form-item(label="料号名称")
                                    el-input(v-model="form.materielName" disabled)
                            el-col(:span="12")
                                el-form-item(label="供应商编码")
                                    el-input(v-model="form.supplierCode" disabled)
                            el-col(:span="12")
                                el-form-item(label="供应商名称")
                                    el-input(v-model="form.supplierName" disabled)
                            el-col(:span="12")
                                el-form-item(label="报检数量" prop="receivingAmount" required)
                                    el-input(v-model="form.receivingAmount")
                    div.form_2
                        el-row(:gutter="20")
                            el-col(:span="12")
                                el-form-item(label="检验单号")
                                    el-input(v-model="form.checkCode" disabled)
                            el-col(:span="12")
                                el-form-item(label="状态" required )
                                    el-select(v-model="form.checkStatus" placeholder="请选择" disabled)
                                        el-option(
                                            v-for="(option, optionKey) in storeDict['BILL_QC_IQC_INSPECT_CHECK_STATUS']"
                                            :label="option"
                                            :value="optionKey"
                                            :key="option")
                            el-col(:span="12")
                                el-form-item(label="取样人" prop="samplingMan" required)
                                    el-input(v-model="form.samplingMan" disabled)
                                        //- el-button(slot="append" icon="el-icon-search" @click="enterDetailTable('samplingMan')")
                            el-col(:span="12")
                                el-form-item(label="取样位置")
                                    el-input(v-model="form.samplingPlace")
                            el-col(:span="12")
                                el-form-item(label="物料质检方案" prop="inspectMaterielCode" required)
                                    el-input(v-model="form.inspectMaterielCode" readonly=true)
                                        el-button(slot="append" icon="el-icon-search" @click="enterDetailTable('inspectMaterielCode')")
                            el-col(:span="12")
                                el-form-item(label="物料质检方案名称")
                                    el-input(v-model="form.inspectMaterielName" disabled)
                            el-col(:span="12")
                                el-form-item(label="检验方式")
                                    el-select(v-model="form.inspectMethod" disabled)
                                        el-option(
                                            v-for="(option, optionKey) in storeDict['DIC_IQC_INSPECT_METHOD']"
                                            :label="option"
                                            :value="optionKey"
                                            :key="option")
                            el-col(:span="12")
                                el-form-item(label="检验批次" prop="inspectLot" required)
                                    el-input(v-model="form.inspectLot")
                            el-col(:span="12")
                                el-form-item(label="检验数量" prop="checkAmount" required)
                                    el-input(v-model="form.checkAmount")
                            el-col(:span="12")
                                el-form-item(label="检验单位" prop="inspectUnitName")
                                    el-input(v-model="form.inspectUnitName" disabled)
                                    // 无字段
                            el-col(:span="12")
                                el-form-item(label="检验员" prop="checkMan" required)
                                    el-input(v-model="form.checkMan")
                            el-col(:span="12")
                                el-form-item(label="检验时间" prop="checkTime" required)
                                    el-date-picker(
                                        v-model="form.checkTime"
                                        type="datetime"
                                        placeholder="选择日期时间")
                            el-col(:span="24")
                                el-form-item(label="备注")
                                    el-input(type="textarea" v-model="form.remark")
                            el-col(:span="24")
                                el-form-item(label-width="100px" label="上传附件")
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
            div.box(v-show="step===1")
                ebrain-frame(
                    title="IQC检验单列表")
                    template(#tools)
                        ebrain-tools(
                            :add="newRowIQCDetail"
                            :edit="editRowIQCDetail"
                            :del="delRowIQCDetail"
                            :addDisabled="noEdit"
                            :editDisabled="editDisabled_det"
                            :delDisabled="selection_down.length===0||noEdit")
                    template(#table)
                        ebrain-table(
                            @row-dblclick="editRowIQCDetail"
                            :tableLoading="dialigTableLoading_det"
                            :pageSize="pageSize_det"
                            :currentPage="currentPage_det"
                            :pageTotal="pageTotal_det"
                            :data="tableDataIQCDetail"
                            :column="IQCDetailTableColumn"
                            @changeCurrent="changeCurrent_det"
                            @changeSize="changeSize_det"
                            @selection-change="selectionChange_det"
                            row-key="id"
                            highlight-current-row
                            :current-row-key.sync="currentRowKey_detail")
            div.detial(v-show="step===2")
                div.button
                    el-button.lastStep(@click="subResult" :disabled="noEdit||form.checkStatus==='4'" :loading="submitResult") 提交检验结论
                    el-button.nextStep(@click="resultApproval" :disabled="form.checkStatus==='3'||form.checkStatus==='1'||form.checkStatus==='2'" :loading="submitExe") 检验结果审批
                el-form.submit(
                    label-width="100px"
                    ref="form"
                    :model="form"
                    inline)
                    el-row(:gutter="20")
                        el-col(:span="24")
                            el-form-item(label="检验结论" required)
                                el-select(v-model="form.checkResult" placeholder="请选择"
                                        @change="changeCheckResult" :disabled="form.checkStatus==='1'||form.checkStatus==='2'")
                                    el-option(
                                        v-for="(option, optionKey) in storeDict['BILL_QCD_IQC_INSPECT_CHECK_RESULT']"
                                        :label="option"
                                        :value="optionKey"
                                        :key="option")
            div.detial(v-show="step===3")
                div.button
                    el-button.nextStep(@click="subExe" :disabled="form.checkStatus==='2'" :loading="submitExe") 提交执行决策
                el-form.submit(
                    label-width="100px"
                    ref="form"
                    :model="form"
                    inline)
                    el-row(:gutter="20")
                        el-col(:span="24")
                            el-form-item(label="执行决策" required)
                                el-select(v-model="form.checkOperation" :disabled="form.checkStatus==='2'" placeholder="请选择")
                                    el-option(
                                        v-for="(option, optionKey) in storeDict['BILL_QC_IQC_INSPECT_CHECK_OPERATION']"
                                        :label="option"
                                        :value="optionKey"
                                        :key="option")
        ebrain-dialog-table(
            :dialogTableSearch="!(type==='ntLOT'||type==='inspectMaterielCode')"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            height="55vh"
            :tableLoading="dialigTableLoading"
            :data="dialogTableDate"
            :column="listDetailsColumn"
            :submitLoading='submitLoading'
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @current-change="currentChange"
            :pageTotal="pageTotal_1"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            :isShow="isShow"
            @submit="submitFormDialogTable(type)")
        ebrain-dialog.formAndTable(
            ref="IQCDetail"
            title="IQC检验单明细"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            :expandVisible="isExpand"
            :isCancel="false"
            :isShow="false")
            template(#nantongLot)
                el-col(:span="12")
                    el-form-item(label-width="110px" label="南通LOT号" prop="nantongLot" required)
                        el-input(v-model="dialogFormParent[2].value")
                            el-button(slot="append" @click="enterDetailTable('ntLOT')"  icon="iconfont iconsearch")
            template(#button)
                el-button(type="primary" :loading="submitLoading" @click="submitIQCQualityDetail" :disabled="noEdit") {{submitName_det}}
                el-button(@click="cancel_detail") 取消
            div.expand_toggle(@click="toggleClick")
                i.iconfont.icondouble_pull_down
            ebrain-frame(title="检验项目")
                template(#table)
                    ebrain-table(
                        :tableLoading="tableLoadingDownL"
                        :isShow="false"
                        key="table1"
                        :data="tableDataSonL"
                        :column="tableColumnSonL"
                        @cell-dblclick="cellDbclick"
                        row-key="id"
                        highlight-current-row
                        @cell-edit="tableDisabled"
                        @cell-change="tableEdit"
                        :current-row-key.sync="currentRowKeySonL")
</template>

<script>
// import dict from '@/utils/dict';
import { mapState, mapActions, mapMutations } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
import * as _ from 'lodash';
export default {
    name: 'materialtest',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            rowBadCodeOrInstrument: '',
            measurType: '',
            submitExe: false,
            submitResult: false,
            nextClick: false,
            searchVisible: true,
            instrument: [],
            addEq: false,
            dialigTableLoading_det: false,
            isShow: true,
            uploadList: [],
            isDisable: false,
            eqDisable: true,
            isSubClick: false,
            ids_downR: [],
            currentRowKey_detail: '',
            IQCDetailInfo: {},
            selectionDownR: [],
            currentRowKeySonL: '',
            currentRowKeySonR: '',
            tableDataSonL: [],
            tableDataSonR: [],
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            activeName: 'first',
            isExpand: false,
            checkId: '',
            submitName: '保存',
            submitName_det: '保存',
            inspectUnit: '',
            materialTestDate: [],
            tableDataIQCDetail: [],
            type: '',
            listDetailsColumn: [],
            noEdit: false,
            form: {
                inspectMaterielMethodId: '',
                inspectMaterielId: '',
                applyId: '',
                planId: '',
                applyCode: '',
                inspectType: '',
                applyMan: '',
                applyTime: '',
                materielCode: '',
                materielName: '',
                supplierCode: '',
                supplierName: '',
                receivingAmount: '',
                checkCode: '',
                checkStatus: '',
                samplingMan: '',
                samplingPlace: '',
                inspectMaterielCode: '',
                inspectMaterielName: '',
                inspectMethod: '',
                inspectLot: '',
                checkAmount: '',
                inspectUnit: '',
                inspectUnitName: '',
                checkMan: '',
                checkTime: '',
                remark: '',
                checkResult: null,
                checkOperation: null,
            },
            dialigTableLoading: false,
            rowObj: {},
            dialogTableDate: [],
            dialogVisibleTable: false,
            step: 0,
            ids: [],
            selection: [],
            selection_down: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            ntLOTColumn: [{
                label: '南通LOT',
                prop: 'ntLot',
                showOverflowTooltip: true,
            }, {
                label: '供应商LOT',
                prop: 'supplierLot',
                showOverflowTooltip: true,
            }],
            tableColumnSonL: [{
                label: '项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '检验单位',
                prop: 'inspectUnitName',
                showOverflowTooltip: true,
            }, {
                label: '实测值 (回车提交)',
                prop: 'checkValue',
                showOverflowTooltip: true,
                editable: true,
            }, {
                label: '标准值',
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
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'][cell];
                },
                option: () => this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'],
            }, {
                label: '不良代码(双击修改)',
                prop: 'bacCodeName',
                showOverflowTooltip: true,
            }, {
                label: '计量器具类型',
                prop: 'measurType',
                showOverflowTooltip: true,
            }, {
                label: '内部编码(双击修改)',
                prop: 'intCode',
                showOverflowTooltip: true,
            }],
            badCodeColumn: [{
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
                label: '计量仪器类型',
                prop: 'measurType',
                showOverflowTooltip: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            IQCDetailTableColumn: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '供应商LOT号',
                prop: 'supplierLot',
                showOverflowTooltip: true,
            }, {
                label: '南通LOT号',
                prop: 'nantongLot',
                showOverflowTooltip: true,
            }, {
                label: '检验数量',
                prop: 'checkAmount',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'pass',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'][cell];
                }
            }],
            applyCodeColumn: [{
                label: '检验申请单号',
                prop: 'applyCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料编码',
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
            }],
            samplingManColumn: [{
                label: '员工编码',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '员工姓名',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            inspectMaterielCodeColumn: [{
                label: '物料质检方案编码',
                prop: 'inspectMaterielCode',
                showOverflowTooltip: true,
            }, {
                label: '物料质检方案名称',
                prop: 'inspectMaterielName',
                showOverflowTooltip: true,
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
            }],
            tableColumn: [{
                type: 'selection',
                width: '40',
                align: 'center',
            }, {
                label: 'IQC检验单号',
                prop: 'checkCode',
            }, {
                label: '检验申请单号',
                prop: 'iqcInspectApplyEntity.applyCode',
            }, {
                label: '检验单状态',
                prop: 'checkStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_CHECK_STATUS'][cell];
                }
            }, {
                label: '料号',
                prop: 'iqcInspectMethodEntity.materielCode',
            }, {
                label: '物料名称',
                prop: 'iqcInspectMethodEntity.materielName',
            }, {
                label: '供应商名称',
                prop: 'iqcInspectApplyEntity.supplierName',
                showOverflowTooltip: true,
            }, {
                label: '检验结论',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QCD_IQC_INSPECT_CHECK_RESULT'][cell];
                }
            }, {
                label: '执行决策',
                prop: 'checkOperation',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_CHECK_OPERATION'][cell];
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
            dialogFormParent: [{
                label: '检验单号',
                prop: 'checkCode',
                disabled: true,
                value: '',
            }, {
                label: '检验单类型',
                prop: 'inspectType', // 无字段
                disabled: true,
                required: true,
                value: '',
            }, {
                label: '南通LOL号',
                prop: 'nantongLot',
                slot: 'nantongLot',
                value: '',
                required: true,

            }, {
                label: '供应商LOT号',
                prop: 'supplierLot',
                disabled: true,
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (reg.test(value) && value > 0) {
                            callback();
                        } else {
                            callback(new Error('请输入大于0的数且最多四位小数'));
                        }
                    },
                    trigger: 'blur',
                },
                label: '收货数量',
                prop: 'checkAmount',
                required: true,
                value: '',
            }, {
                label: '是否合格',
                prop: 'pass',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'],
                value: '',
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            searchForm: [{
                label: 'IQC检验单号',
                prop: 'checkCode',
                value: ''
            }, {
                label: '检验单状态',
                prop: 'checkStatus',
                value: '',
                type: 'select',
                option: '',
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                type: 'select',
                option: '',
            }, {
                label: '检验日期',
                prop: 'checkTime',
                value: '',
                type: 'pickertime',
            }],
            buttons: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectcheck_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-edit',
                permi: 'qc_iqcinspectcheck_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.selection.length === 0 || this.isDelete,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_iqcinspectcheck_dels',
            }, {
                label: '导出列表',
                click: () => this.allExport(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导出检验报告(WORD)',
                click: () => this.exportReport_word(),
                disabled: () => this.exportReport_PDF_disabled,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导出检验报告(PDF)',
                click: () => this.exportReport_PDF(),
                disabled: () => this.exportReport_PDF_disabled,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            isDelete: false,
            stockUnitId: '',
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            pageTotal_1: 0,
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_det: 0,
            pageSize_det: 20,
            currentPage_det: 1,
            currentRowKey: '',
            dialog: '',
            dialogVisible: false,
            dialogVisibleParent: false,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            pageObject: state => state.pageObject,
        }),
        editDisabled() {
            return this.currentRowKey === '';
        },
        editDisabled_det() {
            return this.currentRowKey_detail === '';
        },
        exportReport_PDF_disabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (!item) {
                return true;
            } else {
                return typeof (item.checkResult) === 'object' ? true : false;
            }
        },
        nextBtnDisabled() {
            if (this.step === 0) {
                return this.submitName === '保存';
            } else if (this.step === 1) {
                return this.tableDataIQCDetail.length === 0;
            } else if (this.step === 2) {
                return this.form.checkStatus === '0' || this.form.checkStatus === '3' || this.form.checkStatus === '4';
            } else {
                return false;
            }
        }
    },
    watch: {
        tableDataSonL(newVal) {
            // bool: -1：不合格 ，0：空，1：合格
            const pass = newVal.every(v => v.checkResult === 'Y'); // 1
            const fault = newVal.some(v => v.checkResult === null || v.checkResult === '' || !v.hasOwnProperty('checkResult')); // 0
            if (pass) {
                this.dialogFormParent[5].value = 'Y';
            } else if (fault) {
                this.dialogFormParent[5].value = '';
            } else {
                this.dialogFormParent[5].value = 'N';
            }
        },
        dialogVisibleParent(val) {
            if (!val) {
                this.currentRowKeySonL = '';
                this.tableLoadingDownL = false;
                this.tableLoadingDownR = false;
                this.tableDataSonR = [];
                this.getIQCDetailList();
                this.submitName_det = '保存';
                this.activeName = 'first';
                this.eqDisable = true;
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.pageTotal_1 = 0;
                this.pageSize_1 = 20;
                this.curretPage_1 = 1;
                this.rowObj = {};
                this.dialogTableDate = [];
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.nextClick = false;
                this.noEdit = false;
                this.uploadList = [];
                this.currentRowKey_detail = '';
                this.$refs.form.resetFields();
                this.step = 0;
                this.getData();
                this.submitName = '保存';
                this.checkId = '';
                this.form = {
                    inspectMaterielMethodId: '',
                    inspectMaterielId: '',
                    applyId: '',
                    planId: '',
                    applyCode: '',
                    inspectType: '',
                    applyMan: '',
                    applyTime: '',
                    materielCode: '',
                    materielName: '',
                    supplierCode: '',
                    supplierName: '',
                    receivingAmount: '',
                    checkCode: '',
                    checkStatus: '',
                    samplingMan: '',
                    samplingPlace: '',
                    inspectMaterielCode: '',
                    inspectMaterielName: '',
                    inspectMethod: '',
                    inspectLot: '',
                    checkAmount: '',
                    inspectUnit: '',
                    inspectUnitName: '',
                    checkMan: '',
                    checkTime: '',
                    remark: '',
                    checkResult: '',
                    checkOperation: '',
                };
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_OPERATION'),
            this.queryDict('BILL_QCD_IQC_INSPECT_CHECK_RESULT'),
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_STATUS'),
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_DET_PASS'),
            this.queryDict('DIC_IQC_SAMPLING_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_METHOD'),
            this.queryDict('DIC_IQC_INSPECT_METHOD_VALID'),
        ]).then(() => {
            this.getData();
            this.searchForm[1].option = this.storeDict['BILL_QC_IQC_INSPECT_CHECK_STATUS'];
            this.searchForm[2].option = this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'];
        });
    },
    mounted() {
        this.initPage();
    },
    methods: {
        ...mapActions(['queryDict']),
        ...mapMutations({
            setState: 'SET_STATE',
        }),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 获取员工信息列表
        getStaff(val = 1) {
            this.dialigTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    value: '0',
                    joinType: 'AND',
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
            this.$http.get('/basicdata/dicpersonnel/page', {
                params,
            }).then(res => {
                this.dialigTableLoading = false;
                this.currentPage_1 = val;
                this.dialogTableDate = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取质检方案编码
        getQualityTestInfo(val = 1) {
            this.dialigTableLoading = true;
            const params = {
                // current: val,
                // size: this.pageSize_1,
                inspectType: this.form.inspectType,
                materielCode: this.form.materielCode,
                supplierCode: this.form.supplierCode,
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/qc/dicqciqcinspectmateriel/getPage',
                params,
            ).then(res => {
                this.dialigTableLoading = false;
                // this.currentPage_1 = val;
                this.dialogTableDate = res.data;
                // this.pageTotal_1 = res.data.total || 0;
            });
        },
        cancel_detail() {
            this.dialogVisibleParent = false;
        },
        // 放大镜
        enterDetailTable(type) {
            this.type = type;
            this.isShow = true;
            switch (type) {
                case 'applyCode':
                    this.dialogVisibleTable = true;
                    this.listDetailsColumn = this.applyCodeColumn;
                    this.getApplyInfo();
                    break;
                case 'samplingMan':
                    this.dialogVisibleTable = true;
                    this.listDetailsColumn = this.samplingManColumn;
                    this.getStaff();
                    break;
                case 'inspectMaterielCode':
                    this.isShow = false;
                    if (this.form.applyCode !== '') {
                        this.dialogVisibleTable = true;
                        this.listDetailsColumn = this.inspectMaterielCodeColumn;
                        this.getQualityTestInfo();
                    } else {
                        this.$message.error('请先选择申请单号！');
                    }
                    break;
                default:
                    this.isShow = false;
                    this.dialogVisibleTable = true;
                    this.listDetailsColumn = this.ntLOTColumn;
                    this.getntLOT();
                    break;
            }
        },
        submitFormDialogTable(type) {
            this.dialogVisibleTable = false;
            this.type = type;
            switch (this.type) {
                case 'applyCode':
                    this.form.applyId = this.rowObj.id;                                // 申请单id
                    this.form.applyCode = this.rowObj.applyCode;                       // 申请单编号
                    this.form.inspectType = this.rowObj.inspectType;                   // 检验类型
                    this.form.applyMan = this.rowObj.applyMan;                         // 申请人
                    this.form.applyTime = this.rowObj.applyTime;                       // 申请时间
                    this.form.materielCode = this.rowObj.materielCode;                 // 物料编码
                    this.form.materielName = this.rowObj.materielName;                 // 物料名称
                    this.form.supplierCode = this.rowObj.supplierCode;                 // 供应商编码
                    this.form.supplierName = this.rowObj.supplierName;                 // 供应商编码
                    this.form.receivingAmount = this.rowObj.receivingAmount;           // 到货数量
                    this.form.inspectLot = this.rowObj.applyCode;
                    this.form.samplingMan = this.rowObj.applyMan;
                    this.getMaterialTest(this.form.materielCode, this.form.supplierCode).then(() => {
                        this.setDefault();
                    });
                    break;
                case 'samplingMan':
                    this.form.samplingMan = this.rowObj.personnelFullName;
                    break;
                case 'inspectMaterielCode':
                    this.form.inspectMaterielId = this.rowObj.id;
                    this.form.planId = this.rowObj.planId;
                    this.form.inspectMaterielCode = this.rowObj.inspectMaterielCode;
                    this.form.inspectMaterielName = this.rowObj.inspectMaterielName;
                    break;
                case 'bacCodeName':
                    this.rowBadCodeOrInstrument.bacCodeId = this.rowObj.id;
                    this.editBadCodeOrInstrument();
                    break;
                case 'intCode':
                    this.rowBadCodeOrInstrument.measurId = this.rowObj.id;
                    this.editBadCodeOrInstrument();
                    break;
                default:
                    this.dialogFormParent[2].value = this.rowObj.ntLot;
                    this.dialogFormParent[3].value = this.rowObj.supplierLot;
                    break;
            }
        },
        editBadCodeOrInstrument() {
            this.$http.put('/qc/iqcinspectcheckitem/saveOrupdate', this.rowBadCodeOrInstrument).then(res => {
                this.getMaterialTestItems();
            });
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'applyCode':
                    this.getApplyInfo(val);
                    break;
                case 'samplingMan':
                    this.getStaff(val);
                    break;
                case 'inspectMaterielCode':
                    this.getQualityTestInfo(val);
                    break;
                case 'bacCodeName':
                    this.getBadCodeInfo(val);
                    break;
                case 'intCode':
                    this.getInstrumentInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'applyCode':
                    this.getApplyInfo();
                    break;
                case 'samplingMan':
                    this.getStaff();
                    break;
                case 'inspectMaterielCode':
                    this.getQualityTestInfo();
                    break;
                case 'bacCodeName':
                    this.getBadCodeInfo();
                    break;
                case 'intCode':
                    this.getInstrumentInfo();
                    break;
                default:
                    break;
            }
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'applyCode':
                    this.getApplyInfo();
                    break;
                case 'samplingMan':
                    this.getStaff();
                    break;
                case 'inspectMaterielCode':
                    this.getQualityTestInfo();
                    break;
                case 'bacCodeName':
                    this.getBadCodeInfo();
                    break;
                case 'intCode':
                    this.getInstrumentInfo();
                    break;
                default:
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
        setDefault() {
            this.$http.get('/qc/dicqciqcinspectmateriel/getDefault', {
                params: {
                    inspectType: this.form.inspectType,
                    materielCode: this.form.materielCode,
                    customerCode: this.form.customerCode,
                    supplierCode: this.form.supplierCode,
                },
            }).then(res => {
                if (res.data) {
                    this.form.inspectMaterielCode = res.data.inspectMaterielCode;
                    this.form.inspectMaterielName = res.data.inspectMaterielName;
                    this.form.inspectMaterielId = res.data.id;
                } else {
                    this.form.inspectMaterielCode = '';
                    this.form.inspectMaterielName = '';
                }
            });
        },
        // 获取物料检验列表信息
        getData(val = 1) {
            const params = {
                current: val,
                size: this.pageSize,
                conditionList: [],
            };
            this.tableLoading = true;
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'checkTime') {
                        params.beginTime = moment(v.value[0]).format('YYYY-MM-DD HH:mm:ss');
                        params.endTime = moment(v.value[1]).format('YYYY-MM-DD HH:mm:ss');
                    } else {
                        params.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                            joinType: 'AND',
                        });
                    }
                }
            });
            this.$http.get('/qc/iqcinspectcheck/page', {
                params
            }).then(res => {
                this.tableLoading = false;
                this.currentPage = val;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.getData(val);
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        // 上表新增页面
        newRowParent() {
            this.nextClick = false;
            this.dialog = 'new';
            this.dialogVisible = true;
            this.step = 0;
            this.form.checkCode = '系统自动生成';
            this.form.checkStatus = '0';
            this.form.checkMan = this.sysUser.nickname;
            this.form.checkTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        nextStep() {
            this.step += 1;
            if (this.step === 1) {
                this.getIQCDetailList();
                this.nextClick = true;
            } else if (this.step === 2) {
                const passN = this.tableDataIQCDetail.some(v => v.pass === 'N');
                if (!this.form.checkResult) {
                    this.form.checkResult = passN ? 'N' : 'Y';
                    this.form.checkOperation = this.form.checkResult === 'Y' ? '0' : '';
                }
            } else {
                this.nextClick = false;
            }
        },
        prevStep() {
            this.step -= 1;
            if (this.step === 0) {

                this.nextClick = false;
            }
        },
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            this.submitName = '修改';
            this.dialogVisible = true;
            let item = this.tableData.find(v => v.id === this.currentRowKey);
            // if (item.checkStatus === '2') {
            //     this.noEdit = true;
            // }
            this.noEdit = item.checkStatus === '0' || item.checkStatus === '3' ? false : true;
            let newItem = { ...item, ...item.iqcInspectApplyEntity, ...item.inspectMaterielEntity, ...item.iqcInspectMethodEntity };
            this.checkId = item.id;
            for (let key in this.form) {
                if (!Object.prototype.hasOwnProperty(key)) {
                    this.form[key] = newItem[key];
                }
            }
            this.getUploadList();
            this.form.remark = item.remark;
            this.form.checkResult = item.checkResult;
            this.form.checkOperation = item.checkOperation;
            this.form.inspectUnitName = item.iqcInspectMethodEntity.inspectUnitName;
            this.form.checkCode = item.checkCode;
        },
        selectionChange(selection) {
            this.selection = selection;
            this.isDelete = false;
            this.selection.forEach(item => {
                if (item.checkStatus === '2') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        selectionChange_det(selection) {
            this.selection_down = selection;
            this.ids_det = selection.map(v => v.id);
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectcheck/removeByIds', {
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
        // 保存/修改数据
        addDetection() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.submitLoading = true;
                    if (this.submitName === '保存') {
                        this.$http.post('/qc/iqcinspectcheck/save', {
                            inspectMaterielMethodId: this.form.inspectMaterielMethodId,
                            inspectMaterielId: this.form.inspectMaterielId,
                            applyId: this.form.applyId,
                            receivingAmount: this.form.receivingAmount,
                            samplingMan: this.form.samplingMan,
                            samplingPlace: this.form.samplingPlace,
                            inspectLot: this.form.inspectLot,
                            checkAmount: this.form.checkAmount,
                            checkMan: this.form.checkMan,
                            // checkUnit: this.form.inspectUnit,
                            checkTime: moment(new Date(this.form.checkTime).getTime()).format('YYYY-MM-DD HH:mm:ss'),
                            remark: this.form.remark,
                        }).then(res => {
                            this.submitLoading = false;
                            const { data } = res;
                            this.uploadAttach(data.id, 'BILL_QC_IQC_INSPECT_CHECK').then(() => {
                                this.$message({
                                    message: '保存成功!',
                                    type: 'success',
                                });
                                this.form.checkCode = res.data.checkCode;
                                this.submitName = '修改';
                                this.checkId = res.data.id;
                            });
                        }).catch(() => {
                            this.submitLoading = false;
                        });
                    } else {
                        const item = this.tableData.find(v => v.id === this.currentRowKey);
                        const checkId = this.currentRowKey ? this.currentRowKey : this.checkId;
                        this.$http.put('/qc/iqcinspectcheck/updateById', {
                            id: checkId,
                            inspectMaterielMethodId: this.form.inspectMaterielMethodId,
                            inspectMaterielId: this.form.inspectMaterielId,
                            applyId: this.form.applyId,
                            receivingAmount: this.form.receivingAmount,
                            samplingMan: this.form.samplingMan,
                            samplingPlace: this.form.samplingPlace,
                            inspectLot: this.form.inspectLot,
                            checkAmount: this.form.checkAmount,
                            checkMan: this.form.checkMan,
                            checkTime: moment(new Date(this.form.checkTime).getTime()).format('YYYY-MM-DD HH:mm:ss'),
                            remark: this.form.remark,
                            // checkUnit: this.form.inspectUnit,
                        }).then(res => {
                            this.uploadAttach(item.id, 'BILL_QC_IQC_INSPECT_CHECK').then(() => {
                                this.submitLoading = false;
                                this.$message({
                                    message: '修改成功!',
                                    type: 'success',
                                });
                            });
                        }).catch(() => {
                            this.submitLoading = false;
                        });
                    }
                }
            });
        },
        cancel() {
            this.dialogVisible = false;
        },
        // 获取IQC申请单信息
        getApplyInfo(val = 1) {
            this.dialigTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'applyStatus',
                    operation: 'EQ',
                    value: '1',
                    joinType: 'AND',
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
            this.$http.get('/qc/iqcinspectapply/page', {
                params,
            }).then(res => {
                this.currentPage_1 = val;
                this.dialogTableDate = res.data.records;
                this.dialigTableLoading = false;
                this.pageTotal_1 = res.data.total;
            }).catch(() => {
            });
        },
        // 通过料号获取物料检验方式信息
        getMaterialTest(materielCode, supplierCode) {
            return this.$http.get('/qc/dicqciqcinspectmethod/getByMaterielCodeAndValid/{materielCode}/{supplierCode}', {
                params: {
                    materielCode: materielCode,
                    supplierCode: supplierCode,
                }
            }).then(res => {
                if (res.code === 0) {
                    this.isSubClick = false;
                    this.materialTestDate = res.data;
                    this.form.inspectMethod = this.materialTestDate.inspectMethod;
                    this.form.inspectUnitName = this.materialTestDate.inspectUnitName;
                    this.form.inspectMaterielMethodId = this.materialTestDate.id;
                    switch (this.materialTestDate.inspectMethod) {
                        case 'P':
                            this.form.checkAmount = this.form.receivingAmount * this.materialTestDate.samplingScale * 0.01;
                            break;
                        case 'F':
                            this.form.checkAmount = res.data.samplingFixedQuantity;
                            break;
                        default:
                            this.form.checkAmount = this.form.receivingAmount;
                            break;
                    }
                } else {
                    // this.isSubClick = true;
                    // this.$confirm(res.msg, '提示', {
                    //     type: 'warning'
                    // });
                }
            }).catch(() => {
                this.isSubClick = true;
            });
        },
        // 获取IQC明细列表
        getIQCDetailList(val = 1) {
            this.nextClick = true;
            this.dialigTableLoading_det = true;
            this.$http.get('/qc/iqcinspectcheckdet/page', {
                params: {
                    current: val,
                    size: this.pageSize_det,
                    conditionList: [{
                        fieldName: 'checkId',
                        operation: 'EQ',
                        value: this.checkId,
                    }]
                },
            }).then(res => {
                let sum = 0;
                this.currentPage_det = val;
                this.tableDataIQCDetail = res.data.records;
                if (this.tableDataIQCDetail.length) {
                    this.$http.get('/qc/iqcinspectcheck/page', {
                        params: {
                            conditionList: [{
                                fieldName: 'id',
                                operation: 'LIKE',
                                value: this.checkId,
                            }]
                        }
                    }).then(res => {
                        this.form.checkStatus = res.data.records[0].checkStatus;
                    });
                }
                this.tableDataIQCDetail.forEach(item => {
                    sum = sum + item.checkAmount;
                });
                const pass = this.tableDataIQCDetail.some(v => !v.pass);
                this.dialigTableLoading_det = false;
                this.pageTotal_det = res.data.total;
                if (this.form.checkAmount <= sum && !pass) {
                    this.nextClick = false;
                } else {
                    this.$message({
                        message: '存在未完成检验的批次 或 IQC检验单列表信息的总检验数量小于检验信息的总检验数量,请检查',
                        type: 'warning'
                    });
                }
            });
        },
        changeCurrent_det(val) {
            this.getIQCDetailList(val);
        },
        changeSize_det(val) {
            this.pageSize_det = val;
            this.currentPage_det = 1;
            this.getIQCDetailList();
        },
        // IQC明细新增页面
        newRowIQCDetail() {
            this.tableDataSonL = [];
            this.IQCDetailInfo = {};
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = this.form.checkCode;
            this.dialogFormParent[1].value = this.form.inspectType;
            this.dialogFormParent[4].value = 1;
            this.getCheckItemInfo();
        },
        // 切换类
        toggleClick() {
            this.isExpand = !this.isExpand;
        },
        // 获取LOT号
        getntLOT() {
            this.dialigTableLoading = true;
            this.$http.get('/qc/iqcinspectapplydet/getByApplyId', {
                params: {
                    applyId: this.form.applyId,
                }
            }).then(res => {
                this.dialogTableDate = res.data;
                this.dialigTableLoading = false;
            });
        },
        // 点击新增检验单明细 获取检验项目
        getCheckItemInfo() {
            this.tableLoadingDownL = true;
            this.$http.get('qc/iqcinspectmrdet/page', {
                params: {
                    conditionList: [{
                        fieldName: 'inspectMaterielId',
                        operation: 'EQ',
                        value: this.form.inspectMaterielId,
                    }]
                }
            }).then(res => {
                this.tableDataSonL = res.data.records;
                this.tableLoadingDownL = false;
            });
        },
        // 获取物料质检方案检验项目
        getMaterialTestItems() {
            this.tableLoadingDownL = true;
            this.$http.get(`/qc/iqcinspectcheckitem/getByDetId/${this.IQCDetailInfo.id}`).then(res => {
                let { data } = res;
                this.tableDataSonL = data;
                this.tableLoadingDownL = false;
            });
        },
        cellDbclick(row, column, cell, event) {
            this.type = column.property;
            this.rowBadCodeOrInstrument = row;
            if (column.property === 'bacCodeName' && row.checkResult && row.checkResult === 'N') {
                this.dialogVisibleTable = true;
                this.listDetailsColumn = this.badCodeColumn;
                this.getBadCodeInfo();
            } else if (column.property === 'intCode') {
                this.dialogVisibleTable = true;
                this.listDetailsColumn = this.measurTypeColumn;
                this.measurType = row.measurType;
                this.getInstrumentInfo();
            }
        },
        // 获取计量器具
        getInstrumentInfo(val = 1) {
            this.dialigTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                latestCalibDateEnd: '',
                latestCalibDateStart: '',
                conditionList: [{
                    fieldName: 'measurType',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: this.measurType,
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
            this.$http.post('/qc/dicqcmeasurtoolsaccount/page', null, {
                params,
            }).then(res => {
                this.dialigTableLoading = false;
                this.currentPage_1 = val;
                this.dialogTableDate = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取不良代码
        getBadCodeInfo(val = 1) {
            this.dialigTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
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
            this.$http.get('/qc/iqcbadcode/page', {
                params,
            }).then(res => {
                this.dialigTableLoading = false;
                this.currentPage_1 = val;
                this.dialogTableDate = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        tableDisabled(el, row, head) {
            if ((this.submitName_det === '修改') && !this.noEdit) {
                let { standardUpper, standardLower, checkResult } = row;
                standardUpper = Number(standardUpper);
                standardLower = Number(standardLower);
                if (head === 'checkResult') {
                    if (standardUpper && standardLower) {
                        el.setStatus('editable', false);
                    }
                }
                if (head === 'bacCodeName') {
                    if (checkResult === 'Y') {
                        el.setStatus('editable', false);
                    }
                }
            } else {
                el.setStatus('editable', false);
            }
        },
        tableEdit(value, row, head) {
            let { standardUpper, standardLower } = row; // inspectItemId
            standardUpper = Number(standardUpper);
            standardLower = Number(standardLower);
            let obj = {
                checkDetId: this.IQCDetailInfo.id,
                itemCode: row.itemCode,
                itemName: row.itemName,
                checkResult: row.checkResult,
                checkValue: row.checkValue,
                inspectItemId: row.inspectItemId,
                standardLower: row.standardLower,
                standardUpper: row.standardUpper,
                standardValue: row.standardValue,
                measurId: row.measurId,
                bacCodeId: row.bacCodeId,
                bacCodeName: row.bacCodeName,
                intCode: row.intCode,
                measurType: row.measurType,
            };
            if (head === 'checkValue') {
                obj.checkValue = value;
                if (standardUpper && standardLower) {
                    if (Number(value) <= Number(standardUpper) && Number(value) >= Number(standardLower)) {
                        obj.checkResult = 'Y';
                    } else {
                        obj.checkResult = 'N';
                    }
                }
            } else if (head === 'checkResult') {
                obj.checkResult = value;
            } else if (head === 'equipment') {
                obj.equipmentCode = value;
                obj.equipmentName = value;
            }
            return this.$http.put('/qc/iqcinspectcheckitem/saveOrupdate', obj).then(res => {
                this.getMaterialTestItems();
            });
        },

        // IQC明细修改页面
        editRowIQCDetail() {
            this.dialog = 'edit';
            this.submitName_det = '修改';
            this.dialogVisibleParent = true;
            const item = this.tableDataIQCDetail.find(v => v.id === this.currentRowKey_detail);
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.IQCDetailInfo = item;
            this.dialogFormParent[0].value = this.form.checkCode;
            this.dialogFormParent[1].value = this.form.inspectType;
            this.getMaterialTestItems();
        },
        // IQC明细删除
        delRowIQCDetail() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectcheckdet/removeByIds', {
                    data: this.ids_det,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getIQCDetailList();
                    this.currentRowKey_detail = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        currentChange(row) {
            this.rowObj = row;
        },
        submitIQCQualityDetail() {
            this.$refs.IQCDetail.$refs.form.validate(valid => {
                if (valid) {
                    let obj = {};
                    this.dialogFormParent.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    obj.checkId = this.checkId;
                    this.submitLoading = true;
                    if (this.submitName_det === '保存') {
                        this.$http.post('/qc/iqcinspectcheckdet/save', obj).then(res => {
                            this.IQCDetailInfo = res.data;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.batchAddItemsTest();
                            this.submitName_det = '修改';
                        }).catch(() => {
                            this.submitLoading = false;
                        });
                    } else {
                        obj.id = this.IQCDetailInfo.id;
                        this.$http.put('/qc/iqcinspectcheckdet/updateById', obj).then(() => {
                            this.submitLoading = false;
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            // this.currentRowKey = '';
                        }).catch(() => {
                            this.submitLoading = false;
                        });
                    }
                }
            });
        },
        // 批量新增检验单明细的检验项目
        batchAddItemsTest() {
            this.tableDataSonL.forEach(item => {
                item.checkDetId = this.IQCDetailInfo.id;
                item.inspectItemId = item.id;
                item.measurId = item.measurToolsId;
                item.bacCodeId = item.iqcBadId;
                delete item.id;
            });
            this.$http.post('/qc/iqcinspectcheckitem/saveBatch', this.tableDataSonL).then(() => {
            });
        },
        selectChangeDownR(select) {
            this.selectionDownR = select;
            this.ids_downR = select.map(v => v.id);
        },
        allExport() {
            this.$http.get('/qc/iqcinspectcheck/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有IQC检验单.xls';
                    $a.click();
                }
            });
        },
        // 提交检验结论
        subResult() {
            if (typeof (this.form.checkResult) === 'object') {
                this.$message({
                    message: '检验结论必填!',
                    type: 'warn',
                });
            } else {
                this.noEdit = true;
                this.submitResult = true;
                this.$http.put('/qc/iqcinspectcheck/submitResult', {
                    id: this.checkId,
                    checkResult: this.form.checkResult,
                }).then(res => {
                    this.form.checkStatus = res.data.checkStatus;
                    this.submitResult = false;
                    this.$message({
                        message: '提交检验结果成功!',
                        type: 'success',
                    });
                }).catch(() => {
                    this.submitResult = false;
                });
            }
        },
        resultApproval() {
            this.$confirm('该检验单检验审批通过, 请确认。', '提示', {
                confirmButtonText: '退回',
                cancelButtonText: '通过',
                type: 'warning'
            }).then(() => {
                this.submitResult = true;
                this.$http.get('/qc/iqcinspectcheck/getApproval', {
                    params: {
                        id: this.checkId,
                        status: '1',
                    }
                }).then(res => {
                    this.form.checkStatus = res.data.checkStatus;
                    this.submitResult = false;
                    this.$message({
                        message: '退回成功!',
                        type: 'success',
                    });
                    this.noEdit = false;
                    this.step = 1;
                }).catch(() => {
                    this.submitResult = false;
                });
            }).catch(() => {
                this.submitResult = true;
                this.$http.get('/qc/iqcinspectcheck/getApproval', {
                    params: {
                        id: this.checkId,
                        status: '0',
                    }
                }).then(res => {
                    this.form.checkStatus = res.data.checkStatus;
                    this.submitResult = false;
                    this.$message({
                        message: '审批通过!',
                        type: 'success',
                    });
                }).catch(() => {
                    this.submitResult = false;
                });
            });
        },
        // 提交执行决策
        subExe() {
            if (typeof (this.form.checkOperation) === 'object' || this.form.checkOperation === '') {
                this.$message({
                    message: '执行决策必填!',
                    type: 'warn',
                });
            } else {
                this.submitExe = true;
                this.$http.put('/qc/iqcinspectcheck/submitOperation', {
                    id: this.checkId,
                    checkOperation: this.form.checkOperation,
                }).then(() => {
                    this.submitExe = false;
                    this.$message({
                        message: '提交检验结论成功!',
                        type: 'success',
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitExe = false;
                });
            }
        },
        exportReport_word() {
            this.$http.get(`/qc/iqcinspectcheck/exportWord/${this.currentRowKey}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'IQC检验报告.doc';
                    $a.click();
                }
            });
        },
        exportReport_PDF() {
            this.$http.get(`/qc/iqcinspectcheck/exportPdf/${this.currentRowKey}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'IQC检验报告.pdf';
                    $a.click();
                }
            });
        },
        initPage() {
            const notQuery = _.isEmpty(this.pageObject);
            if (!notQuery) {
                this.newRowParent();
                this.form.applyId = this.pageObject.id;                                // 申请单id
                this.form.applyCode = this.pageObject.applyCode;                       // 申请单编号
                this.form.inspectType = this.pageObject.inspectType;                   // 检验类型
                this.form.applyMan = this.pageObject.applyMan;                         // 申请人
                this.form.applyTime = this.pageObject.applyTime;                       // 申请时间
                this.form.materielCode = this.pageObject.materielCode;                 // 物料编码
                this.form.materielName = this.pageObject.materielName;                 // 物料名称
                this.form.supplierCode = this.pageObject.supplierCode;                 // 供应商编码
                this.form.supplierName = this.pageObject.supplierName;                 // 供应商编码
                this.form.receivingAmount = this.pageObject.receivingAmount;           // 到货数量
                this.form.inspectLot = this.pageObject.applyCode;                      // 检验批次
                this.form.samplingMan = this.pageObject.applyMan;
                this.getMaterialTest(this.form.materielCode, this.form.supplierCode).then(this.setDefault);
                this.setState({ pageObject: {}});
                // this.$router.replace({ query: {}});
                // this.$router.push({ query: {}});
            }
        },
        // 获取上传文件
        changeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        // 删除文件
        removeChangeHandler(file, fileList) {
            if (file.status === 'success') {
                this.$http.delete(`/qc/qcfile/removeById/${file.id}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success('删除成功!');
                    }
                });
            }
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
            this.$http.get(`/qc/qcfile/getList/BILL_QC_IQC_INSPECT_CHECK/${item.id}`).then(({ data }) => {
                this.uploadList = data.map(v => ({
                    name: v.fileName,
                    url: v.fileUrl,
                    id: v.id,
                }));
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
            }).then(res => {
                this.uploadList.forEach(v => {
                    if (v.status === 'ready') v.status = 'success';
                });
            });
        },
        changeCheckResult(val) {
            this.form.checkOperation = val === 'Y' ? '0' : '';
        },
    },
};
</script>

<style lang="stylus" scoped>
.dialog
    & >>> .el-dialog
        width 900px

    .flex
        display flex
        .steps
            flex auto
            padding 13px 48px
    .detial
        height 60vh
        .form
            // border 1px solid red
            height 60vh
            overflow auto
            overflow-x hidden
            .form_1
                border-bottom 1px solid #e5e5e5
                .title
                    height 40px
                    line-height 40px
                & >>> .el-row
                    margin 0
            .form_2
                margin-top 15px
        .button
            background #e5e5e5
        .submit
            margin-top 20px
    .box >>> .frame
        height 60vh
.formAndTable >>>
        .expand_toggle
                border-top 1px dashed  #EBEEF5
                border-bottom 1px dashed #EBEEF5
                height 40px
                line-height: 40px
                text-align center
        .frame
           margin 20px 0
           .table
               height 100%
               .el-table__body-wrapper
                height 100% !important
        .el-input-group__append
            overflow hidden
            .el-button.is-disabled:hover
                background #f5f7fa
                color #90959f
.form >>> .el-form-item
    width 100%
    &__content
        width calc(100% - 125px)
        font-size 0

.iqc
    & >>> .fr
        float right
.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    // height 57px
    & >>> .el-form-item
        margin-bottom 0
        width 250px
        &:nth-child(4)
            width 390px

    & >>> .el-date-editor--datetimerange
        width 320px!important
    &.hide
        padding-top 0
        padding-bottom 0
        height 0
</style>
