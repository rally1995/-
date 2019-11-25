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
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="样品信息")
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
            ebrain-frame(title="检验信息")
                template(#tools)
                    ebrain-tools(:buttons="btnsDetail")
                template(#table)
                    ebrain-box-table.dialog_table(
                        ref="table2"
                        :key="new Date().getTime()"
                        v-if="dialogVisible"
                        :loading="tableLoadingDetail"
                        :pageSize="pageSizeDetail"
                        :pageCurrent="currentPageDetail"
                        :pageTotal="pageTotalDetail"
                        :data="tableDataDetail"
                        :column="tableColumnDetail"
                        row-key="id"
                        @cell-dblclick="cellDbclick"
                        @selection-change="SelectChangeDetail"
                        @page-change="ChangeCurrentDetail"
                        @size-change="ChangeSizeDetail")
                        template(#trustResult)
                            el-table-column(
                                prop="trustResult"
                                label="委外结果")
                                    template(v-slot="{row}")
                                        a(:href="row.trustResultUrl" target="_blank") {{row.trustResult}}
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/qc/fqcsamplyapply/exportList'"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-tag-dialog(
            :visible.sync="dialogVisibleAppro"
            title="审批窗口"
            :isOk="false"
            :submitLoading="subApproLoading")
            div
                span 当前检验已完成，请审批当前结果。
            div
                el-form(style="marginTop:15px" :model="form")
                    el-form-item(label="审批意见")
                        el-input(type="textarea" v-model="form.approvalRemark")
            template(#footer2)
                el-button(type="primary" @click="adopt" :loading="passLoading") 通过
                el-button(type="primary" @click="backDown" :loading="backDownLoading") 退回
        ebrain-dialog(
            ref="dialogDetailForm"
            :submitLoading='submitDetailLoading'
            :visible.sync="dialogVisibleDetail"
            :form.sync="dialogFormDetail"
            @submit="submitFormDetail")
            template(#intCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="内部编码" prop="intCode")
                        el-input(:readonly='true' :value="value" :disabled="parentRow.checkStatus==='4'")
                            el-button(slot="append" @click="showDialogTable('intCode')" icon="el-icon-search" :disabled="parentRow.checkStatus==='4'")
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
            objData: {},
            passLoading: false,
            backDownLoading: false,
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
                label: '检验时间',
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
            row: [],
            type: '',
            dialogColumn: [],
            collapse: false,
            btnsDialog: [],
            searchVisible: true,
            exportIds: [],
            selectDetailRows: [],
            submitDetailLoading: false,
            dialogVisibleDetail: false,
            dialogVisibleDialogTable: false,
            tableData_table: [],
            dialogTableLoading: false,
            column: [],
            pageSize_table: 20,
            currentPage_table: 1,
            pageTotal_table: 0,
            dialogVisibleAppro: false,
            subApproLoading: false,
            dialogFormDetail: [{
                label: '检验项目名称',
                prop: 'checkItemName',
                value: '',
                disabled: true,
            }, {
                label: '检测要求',
                prop: 'checkRequire',
                value: '',
                disabled: true,
            }, {
                label: '试样数',
                prop: 'sampleNum',
                value: '',
                disabled: true,
            }, {
                label: '实测值',
                prop: 'checkValue',
                value: '',
                required: false,
                placeholder: '',
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.selectDetailRows[0].analysisMethod === 'QUANTITATIVE') {
                            if (value) {
                                let actValueStr = this.dialogFormDetail.find(v => v.prop === 'checkValue').value;
                                actValueStr = actValueStr.replace(/\s+/g, '');
                                actValueStr = actValueStr.replace(/，/g, ',');
                                let actValueArr = actValueStr.split(',');
                                let reg = /^[0-9]+(\.\d+)?$/;
                                const item = this.dialogFormDetail.find(v => v.prop === 'sampleNum');
                                const isblo = actValueArr.every(v => !reg.test(v));
                                if (isblo) {
                                    callback(new Error('请输入大于等于0的数!'));
                                } else if (actValueArr.length !== Number(item.value)) {
                                    callback(new Error(`请输入${item.value}个抽样试样数!`));
                                } else {
                                    let sum = 0;
                                    actValueArr.forEach(v => {
                                        sum += Number(v);
                                    });
                                    this.dialogFormDetail[4].value = strip(sum / actValueArr.length).toFixed(4);
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
                    const val1 = this.dialogFormDetail.find(v => v.prop === 'standardLower').value;
                    const val2 = this.dialogFormDetail.find(v => v.prop === 'standardUpper').value;
                    if (val) {
                        if (Number(val1) && Number(val2)) {
                            this.dialogFormDetail[7].disabled = true;
                            let actValueStr = this.dialogFormDetail.find(v => v.prop === 'checkValue').value;
                            actValueStr = actValueStr.replace(/\s+/g, '');
                            actValueStr = actValueStr.replace(/，/g, ',');
                            let actValueArr = actValueStr.split(',');
                            for (let i = 0; i < actValueArr.length; i++) {
                                if (Number(actValueArr[i]) >= Number(val1) && Number(actValueArr[i]) <= Number(val2)) {
                                    this.dialogFormDetail[7].value = '1';
                                } else {
                                    this.dialogFormDetail[7].value = '0';
                                    break;
                                }
                            }
                        } else {
                            this.dialogFormDetail[7].disabled = false;
                        }
                    } else {
                        this.dialogFormDetail[7].value = '';
                        this.dialogFormDetail[7].disabled = false;
                        this.$refs.dialogDetailForm.$refs.form.resetFields();
                    }
                }
            }, {
                label: '平均值',
                prop: 'avgValue',
                value: '',
                disabled: true,
            }, {
                label: '标准值上限',
                prop: 'standardUpper',
                value: '',
                disabled: true,
            }, {
                label: '标准值下限',
                prop: 'standardLower',
                value: '',
                disabled: true,
            }, {
                label: '是否合格',
                prop: 'resultFlag',
                value: '',
                type: 'select',
                option: () => this.storeDict['RESULT_FLAG'],
            }, {
                label: '计量器具类型',
                prop: 'measurType',
                value: '',
                disabled: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                value: '',
                slot: 'intCode',
            }, {
                label: '检验人',
                prop: 'checkName',
                value: '',
                disabled: true,
            }, {
                label: '检验时间',
                prop: 'checkDate',
                value: '',
                disabled: true,
            }, {
                label: '审批结果',
                prop: 'checkResult',
                value: '',
                disabled: true,
                type: 'select',
                option: () => dict.appResult,
            }],
            childRows: {},
            searchForm: [{
                label: '检验单状态',
                prop: 'checkStatus',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '接收时间',
                prop: 'recipientsTime',
                value: '',
                type: 'picker',
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '检验单号',
                prop: 'checkCode',
                value: '',
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                value: '',
                type: 'select',
                option: {},
            }],
            form: {
                approvalRemark: '',
            },
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            submitLoading: false,
            dialogVisible: false,
            dialogOperation: [{
                label: '检验单号',
                prop: 'checkCode',
                value: '',
                disabled: true
            }, {
                label: '委托部门',
                prop: 'trustDept',
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
                label: '样品数量',
                prop: 'samplyNum',
                value: '',
                disabled: true,
            }, {
                label: '余样处理',
                prop: 'remainDeal',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['REMAIN_DEAL'],
            }, {
                label: '检验来源',
                prop: 'checkSource',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['CHECK_SOURCE'],
            }, {
                label: '是否加急',
                prop: 'promoteFlag',
                value: '',
                disabled: true,
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
                type: 'select',
                option: () => this.storeDict['CHECK_STATUS'],
                disabled: true
            }, {
                label: '申请人',
                prop: 'createBy',
                value: '',
                disabled: true
            }, {
                label: '接收人',
                prop: 'recipientsName',
                value: '',
                disabled: true
            }, {
                label: '审批人',
                prop: 'approvalName',
                value: '',
                disabled: true
            }, {
                label: '申请时间',
                prop: 'createTime',
                value: '',
                disabled: true
            }, {
                label: '接收时间',
                prop: 'recipientsTime',
                value: '',
                disabled: true
            }, {
                label: '审批时间',
                prop: 'approvalDate',
                value: '',
                disabled: true
            }],
            tableColumn: [{
                label: '检验单状态',
                prop: 'checkStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['CHECK_STATUS'][cell];
                },
            }, {
                label: '接收时间',
                prop: 'recipientsTime',
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
                label: '接收人',
                prop: 'recipientsName',
                showOverflowTooltip: true,
            }, {
                label: '检验来源',
                prop: 'checkSource',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['CHECK_SOURCE'][cell];
                },
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
                recipientsTimeEnd: '',
                recipientsTimeStart: '',
            },
            btnsTop: [{
                label: '接收',
                click: () => this.receive(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.receiveDisabled,
                permi: 'qc_fqcsamplyapply_receive',
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
                permi: 'qc_fqcsamplyapply_export',
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
                label: '审批',
                click: () => this.approval(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_fqcsamplyapply_checkback',
                loading: false,
                disabled: () => this.approDisabled,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
                disabled: false,
            }, {
                label: '提交',
                click: () => this.submitData(),
                className: 'iconfont iconstatus-Submission',
                permi: 'qc_fqcsamplyapply_checkSumbit',
                disabled: () => this.subDisabled,
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
                label: '芯板厚度(mm)',
                prop: 'coreThickness',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '批次',
                prop: 'batchNo',
                showOverflowTooltip: true,
            }, {
                label: '检验项目数量',
                prop: 'checkItemNum',
                showOverflowTooltip: true,
            }],
            btnsDetail: [{
            //     label: '修改',
            //     click: () => this.editRowDetail(),
            //     className: 'iconfont iconstatus-edit',
            //     disabled: () => this.editDisabled,
            //     permi: 'qc_fqcsamplycheckinfo_edit',
            // }, {
                label: '上传委外报告',
                icon: 'iconfont iconstatus-download',
                permi: false,
                action: '',
                disabled: () => this.fileList,
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }],
            tableLoadingDetail: false,
            pageSizeDetail: 20,
            currentPageDetail: 1,
            pageTotalDetail: 0,
            tableDataDetail: [],
            // title: '检验结果',
            // appResult: {},
            tableLoadingCheck: false,
            tableDataCheck: [],
            tableColumnDetail: [{
                label: '检验项目名称',
                prop: 'checkItemName',
                showOverflowTooltip: true,
            }, {
                label: '检测要求',
                prop: 'checkRequire',
                showOverflowTooltip: true,
            }, {
                label: '试样数',
                prop: 'sampleNum',
                showOverflowTooltip: true,
            }, {
                label: '实测数',
                prop: 'checkValue',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.updateDetail(value, prop, row),
            }, {
                label: '平均值',
                prop: 'avgValue',
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
                label: '是否合格',
                prop: 'resultFlag',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['RESULT_FLAG'][cell];
                },
                editable: true,
                option: {},
                change: (value, prop, row) => this.updateDetail(value, prop, row),
            }, {
                label: '委外结果',
                prop: 'trustResult',
                slot: 'trustResult',
                showOverflowTooltip: true,
            }, {
                label: '计量器类型',
                prop: 'measurType',
                showOverflowTooltip: true,
            }, {
                label: '内部编码(双击修改)',
                prop: 'intCode',
                showOverflowTooltip: true,
            }, {
                label: '检验人',
                prop: 'checkName',
                showOverflowTooltip: true,
            }, {
                label: '检验时间',
                prop: 'checkDate',
                showOverflowTooltip: true,
            }, {
                label: '审批结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.appResult[cell];
                },
                option: {},
                editable: true,
                change: (value, prop, row) => this.updateDetail(value, prop, row),
            }],
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
            return !(this.selectRows.length === 1 && this.selectRows[0].checkStatus === '5');
        },
        approDisabled() {
            return this.parentRow && this.parentRow.checkStatus !== '4';
        },
        editDisabled() {
            return !(this.selectDetailRows.length === 1 && this.parentRow.checkStatus !== '5');
        },
        delDisabled() {
            const arr = ['2', '3'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return this.selectDetailRows.length === 0 || !flag;
        },
        subDisabled() {
            const arr = ['2', '3'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return !flag;
        },
        fileList() {
            const arr = ['2', '3'];
            const flag = arr.includes(this.parentRow.checkStatus);
            return !(this.selectDetailRows.length === 1 && flag && this.selectDetailRows[0].trustFlag === '0');
        }
    },
    watch: {
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '样品检测检验';
            }
        },
        dialogVisibleDialogTable(val) {
            if (!val) {
                this.dialogColumn = [];
                this.tableData_table = [];
                this.pageSize_table = 20;
                this.currentPage_table = 1;
                this.pageTotal_table = 0;
                this.row = {};
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.getData();
                this.parentRow = {};
                this.dialogType = '';
                this.dialogForm = [];
                this.tableDataSamp = [];
                this.currentPageSamp = 1;
                this.pageTotalDetail = 0;
                this.pageSizeDetail = 20;
                this.tableDataDetail = [];
                this.currentPageDetail = 1;
                this.pageTotalDetail = 0;
                this.pageSizeDetail = 20;
                this.column = [];
                this.tableDataCheck = [];
                this.selectDetailRows = [];
            }
        },
        dialogVisibleAppro(val) {
            if (!val) {
                this.form.approvalRemark = '';
            }
        },
        parentRow(parentRow) {
            if (parentRow) {
                if (parentRow.checkStatus === '2' || parentRow.checkStatus === '3') {
                    this.tableColumnDetail[3].editable = true;
                    this.tableColumnDetail[7].editable = true;
                    this.tableColumnDetail[13].editable = false;
                } else if (parentRow.checkStatus === '4') {
                    this.tableColumnDetail[3].editable = false;
                    this.tableColumnDetail[7].editable = false;
                    this.tableColumnDetail[13].editable = true;
                } else {
                    this.tableColumnDetail[3].editable = false;
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
            Promise.all([this.queryDict('CHECK_STATUS'),
                this.queryDict('TRUST_FLAG'),
                this.queryDict('PROMOTE_FLAG'),
                this.queryDict('RESULT_FLAG'),
                this.queryDict('REMAIN_DEAL'),
                this.queryDict('CHECK_SOURCE')
            ]).then(() => {
                this.searchForm[0].option = this.storeDict['CHECK_STATUS'];
                this.searchForm[2].option = this.storeDict['CHECK_SOURCE'];
                this.searchForm[4].option = this.storeDict['PROMOTE_FLAG'];
                this.tableColumnDetail[7].option = this.storeDict['RESULT_FLAG'];
                this.tableColumnDetail[13].option = dict.appResult;
            }).then(() => {
                this.getData();
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchObj.recipientsTimeEnd = '';
            this.searchObj.recipientsTimeStart = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'recipientsTime') {
                        this.searchObj.recipientsTimeEnd = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
                        this.searchObj.recipientsTimeStart = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
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
        successFile(response, file, fileList) {
            let uploadList = fileList;
            const { code, msg } = response;
            let obj = {};
            obj = Object.assign({}, this.selectDetailRows[0]);
            uploadList.forEach(v => {
                obj.trustResultUrl = v.url;
                obj.trustResult = v.name;
            });
            if (code === 0) {
                this.$http.put('/qc/fqcsamplycheckinfo/updateById', obj).then(() => {
                    this.getDatailData();
                    this.$message({
                        message: '上传成功!',
                        type: 'success'
                    });
                });
            } else {
                this.$alert(`${msg}`, {
                    type: 'error'
                });
            }
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
                createTimeStart: '',
                createTimeEnd: '',
                ...this.searchObj,
                conditionList: [...this.conditionList],
            };
            this.$http.get(`/qc/fqcsamplyapply/listPage/1`, {
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
            this.$http.post(`/qc/fqcsamplyapply/receive`, ids, {
                params: {
                    recipientsName: this.userInfo.nickname,
                }
            }).then(() => {
                this.$message.success('接收成功');
                this.getData();
                this.$refs.table1.clearSelection();
            });
        },
        checkout() {
            this.btnsDialog = [...this.btnsApproval];
            this.dialogVisible = true;
            this.dialogForm = [...this.dialogOperation];
            this.parentRow = { ...this.selectRows[0] };
            this.$http.get(`/qc/fqcsamplyapply/getById/${this.parentRow.id}`).then(({ data }) => {
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
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
            this.dialogVisibleAppro = true;
        },
        // 审批通过
        adopt() {
            this.passLoading = true;
            this.$http.post(`/qc/fqcsamplyapply/checkPass/${this.selectRows[0].id}`, null, {
                params: {
                    approvalRemark: this.form.approvalRemark,
                    approvalName: this.userInfo.nickname,
                }
            }).then(({ data }) => {
                this.$message.success('审批成功');
                this.dialogVisible = false;
                // this.getSamp();
                this.parentRow = data;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
                this.passLoading = false;
                this.dialogVisibleAppro = false;
            }).catch(() => {
                this.passLoading = false;
            });
        },
        // 退回
        backDown() {
            this.backDownLoading = true;
            this.$http.post(`/qc/fqcsamplyapply/checkBack/${this.selectRows[0].id}`, null, {
                params: {
                    approvalRemark: this.form.approvalRemark,
                    approvalName: '',
                }
            }).then(({ data }) => {
                this.$message.success('退回成功');
                this.getSamp();
                this.getDatailData();
                this.parentRow = data;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
                this.backDownLoading = false;
                this.dialogVisibleAppro = false;
            }).catch(() => {
                this.backDownLoading = false;
            });
        },
        // 表内编辑 提交表单
        updateDetail(value, head, row) {
            let obj = { ...row };
            obj[head] = value;
            if (head === 'checkValue') {
                let actValueArr = obj[head].split('/');
                let reg = /^[0-9]+(\.\d+)?$/;
                const isblo = actValueArr.some(v => !reg.test(v));
                if (isblo && Number(row.trustFlag)) {
                    this.$message.warning(`请输入大于等于0的数`);
                    return false;
                } else if (actValueArr.length !== row.sampleNum && Number(row.trustFlag)) {
                    this.$message.warning(`请输入${row.sampleNum}个实测值,并用/隔开`);
                    return false;
                } else if (actValueArr.length !== row.sampleNum && !Number(row.trustFlag)) {
                    if (value) {
                        this.$message.warning(`请输入${row.sampleNum}个实测值,并用/隔开,或者不填`);
                        return false;
                    }
                } else {
                    let avgValue = 0;
                    actValueArr.forEach(v => {
                        avgValue += Number(v);
                    });
                    obj.avgValue = Number(avgValue / row.sampleNum).toFixed(3);
                    if (Number(row.standardUpper) && Number(row.standardLower)) {
                        for (let i = 0; i < actValueArr.length; i++) {
                            if (Number(actValueArr[i]) <= Number(row.standardUpper) && Number(actValueArr[i]) >= Number(row.standardLower)) {
                                obj.resultFlag = '1';
                            } else {
                                obj.resultFlag = '0';
                                break;
                            }
                        }
                    }
                }
            }
            obj.checkName = this.userInfo.nickname;
            this.$http.put(`/qc/fqcsamplycheckinfo/updateById`, obj).then(() => {
                this.$message.success('修改成功');
                this.dialogVisibleDialogTable = false;
                this.getDatailData();
            });
        },
        // 双击弹出表格
        cellDbclick(row, column, cell, event) {
            this.objData = {};
            this.objData = { ...row };
            this.type = column.property;
            this.dialogSearchForm = {};
            if (this.parentRow.checkStatus === '2' || this.parentRow.checkStatus === '3') {
                if (column.property === 'intCode') {
                    this.dialogVisibleDialogTable = true;
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                }
            }
        },
        // 提交
        submitData() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.parentRow['id'];
            this.$http.put(`/qc/fqcsamplyapply/checkSumbit`, obj).then(({ data }) => {
                this.$message.success('提交成功');
                this.getSamp();
                this.getDatailData();
                this.parentRow = data;
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
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
                conditionList: [{
                    fieldName: 'applyId',
                    operation: 'EQ',
                    value: this.parentRow['id'],
                    joinType: 'AND',
                }],
            };
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
            this.$http.post(`/qc/fqcsamplyapply/lookReport/${this.selectRows[0].id}`).then(({ code, data }) => {
                this.dialogFormInspect.forEach(v => {
                    v.value = data[v.prop];
                });
                const { samplyInfoList } = data;
                this.InspectReportData = samplyInfoList;
                this.dialogVisibleInspect = true;
            });
        },
        // 获取检验方案
        showDialogTable(type) {
            this.dialogVisibleDialogTable = true;
            this.dialogSearchForm = {};
            this.type = type;
            switch (type) {
                case 'intCode':
                    this.dialogColumn = this.measurTypeColumn;
                    this.getDialogData();
                    break;
                default:
                    break;
            }
        },
        getDialogData() {
            switch (this.type) {
                case 'intCode':
                    this.getMeas();
                    break;
                default:
                    break;
            }
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
            // switch (this.type) {
            //     case 'intCode':
            //         this.dialogFormDetail[8].value = this.row.measurType;
            //         this.dialogFormDetail[9].value = this.row.intCode;
            //         break;
            //     default:
            //         break;
            // }
            let obj = { ...this.objData };
            obj.measurType = this.row.measurType ? this.row.measurType : '';
            obj.intCode = this.row.intCode ? this.row.intCode : '';
            obj.checkName = this.userInfo.nickname;
            this.$http.put(`/qc/fqcsamplycheckinfo/updateById`, obj).then(() => {
                this.$message.success('修改成功');
                this.dialogVisibleDialogTable = false;
                this.getDatailData();
            });
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
                    $a.download = '样品检测检验报告.pdf';
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
                    $a.download = '样品检测检验报告.doc';
                    $a.click();
                }
            });
        },
        // 获取检验信息
        getDatailData() {
            this.tableLoadingDetail = true;
            const params = {
                current: this.currentPageDetail,
                size: this.pageSizeDetail,
                conditionList: [{
                    fieldName: 'samplyInfoId',
                    operation: 'EQ',
                    value: this.childRows['id'],
                    joinType: 'AND',
                }],
            };
            return this.$http.get(`/qc/fqcsamplycheckinfo/page`, {
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
            if (this.selectDetailRows.length) {
                this.btnsDetail[0].action = `/qc/fqcsamplycheckinfo/updateTrustResult/${this.selectDetailRows[0].id}?checkName=${this.userInfo.nickname}`;
            }
        },
        editRowDetail() {
            this.dialogVisibleDetail = true;
            const data = this.selectDetailRows[0];
            this.$nextTick(() => {
                this.dialogFormDetail[3].disabled = this.parentRow.checkStatus === '4' ? true : false;
                this.dialogFormDetail[7].disabled = this.parentRow.checkStatus === '4' ? true : false;
                this.dialogFormDetail[12].disabled = this.parentRow.checkStatus === '4' ? false : true;
                this.dialogFormDetail.forEach(v => {
                    v.value = data[v.prop];
                });
                this.dialogFormDetail[10].value = this.userInfo.nickname;
                this.$refs.dialogDetailForm.$refs.form.resetFields();
                if (!Number(data.trustFlag)) { // 委外
                    this.dialogFormDetail[3].required = false;
                    this.dialogFormDetail[7].disabled = false;
                } else {
                    this.dialogFormDetail[3].required = true;
                    this.dialogFormDetail[3].placeholder = `请输入${this.dialogFormDetail[2].value}个实测值，并且用逗号分割`;
                    this.dialogFormDetail[7].disabled = Number(this.dialogFormDetail[5].value) && Number(this.dialogFormDetail[6].value) ? true : false;
                }
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
        uploadRowDetail() {
            this.$http.post(`/qc/fqcsamplycheckinfo/updateTrustResult/${this.selectDetailRows[0].id}`, null, {
                params: {
                    checkName: this.form.approvalRemark
                }
            }).then(() => {
                this.$message({
                    message: '删除成功!',
                    type: 'success'
                });
                this.getDatailData();
            });
        },
        submitFormDetail() {
            let obj = {};
            this.dialogFormDetail.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.selectDetailRows[0].id;
            this.submitDetailLoading = true;
            this.$http.put(`/qc/fqcsamplycheckinfo/updateById`, obj).then(() => {
                this.$message.success('修改成功');
                this.dialogVisibleDetail = false;
                this.submitDetailLoading = false;
                this.getDatailData();
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
