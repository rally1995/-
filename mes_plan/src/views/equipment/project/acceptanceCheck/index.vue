<template lang="pug">
    ebrain-main.acceptanceCheck
        ebrain-frame.halfHeight(
            title="设备项目验收")
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
                    ref="table"
                    :loading="loading"
                    row-key="id"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change="changeSize"
                    @row-click="getDateSon"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="selectionChange"
                    @current-change = "currentChange_List"
                    highlight-current-row)
        ebrain-frame.halfHeight(
            title="验收清单")
            template(#tools)
                ebrain-tools(:buttons="btnsButtom")
                .search(
                    :class="{hide:searchVisibleDown}")
                    ebrain-search(
                        :form="searchFormDown"
                        @search="searchDown"
                        @reset="resetDown")
            template(#table)
                ebrain-box-table(
                    :columnCheck="false"
                    :loading="loading_down"
                    :pageSize="pageSize_down"
                    :pageCurrent="currentPage_down"
                    :pageTotal="pageTotal_down"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @page-change="changeCurrent_down"
                    @size-change="changeSize_Down"
                    :highlight-current-row="false")
        ebrain-dialog(
            :expandVisible="collapse"
            ref="form"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
            template(#itemNo)
                el-col(:span="12")
                    el-form-item(label="项目编码" prop="itemNo" required)
                        el-input(readonly=true v-model="dialogFormParent[1].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search"  :disabled="isDisabled" @click="enterTableDetails('itemNo')")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件" prop="attachment")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            action="/devicemanager/equipprojectreceipt/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            :disabled="uploadDisabled")
                            el-button(
                                type="primary"
                                :disabled="uploadDisabled") 上传附件
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(
                title="验收清单")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom")
                template(#table)
                    div(style="height:300px")
                        ebrain-box-table(
                            ref="dialogTable"
                            :loading='tableLoadingDownDialog'
                            :pageSize='pageSizeDownDialog'
                            :pageCurrent='currentPageDownDialog'
                            :pageTotal='pageTotalDownDialog'
                            :data="tableDataDetailDialog"
                            :column="tableColumnSonDialog"
                            @page-change="changeCurrentDownDialog"
                            @size-change="changeSizeDownDialog"
                            @selection-change="getSelectionDownDialog"
                            row-key="id"
                            highlight-current-row)
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="allColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            :disabled="!rowObj.hasOwnProperty(type)"
            @submit="submitFormDialog(type)")
        ebrain-dialog(
            ref="dialogFormDetailDialog"
            :submitLoading="submitLoadingDetailDialog"
            :visible.sync="dialogVisibleDetailDialog"
            :form.sync="dialogFormDetailDialog"
            @submit="submitFormDetailDialog")
            template(#selectBy)
                el-col(:span="12")
                    el-form-item(label="选择已有设备" required)
                        el-radio-group(v-model="dialogFormDetailDialog[0].value" @change='selectByChange')
                            el-radio(label="1") 是
                            el-radio(label="0") 否
            template(#equipNum)
                el-col(:span="12")
                    el-form-item(label="设备编号" prop="equipNum" required)
                        el-input(:readonly="dialogFormDetailDialog[0].value==='1'?true:false" v-model="dialogFormDetailDialog[1].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search"  :disabled="isDisabled" @click="enterTableDetails('equipNum')" v-if="dialogFormDetailDialog[0].value==='1'")
        ebrain-dialog(
            :expandVisible="collapseDetail"
            ref="formDetail"
            :submitLoading="submitLoadingDetail"
            :visible.sync="dialogVisibleDetail"
            :form.sync="dialogFormDetail"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsBottomDetail")
            div(:class="{collapseDetail}")
                div.expand_toggle(@click="collapseDetail = !collapseDetail")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(
                title="设备验收明细列表")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottomDetailList")
                template(#table)
                    div(style="height:300px")
                        ebrain-box-table(
                            ref="detailsDialogTable"
                            :loading='tableLoadingDetailList'
                            :pageSize='pageSizeDetailList'
                            :pageCurrent='currentPageDetailList'
                            :pageTotal='pageTotalDetailList'
                            :data="tableDataDetailList"
                            :column="tableColumnDetailList"
                            @page-change="changeCurrentDetailList"
                            @size-change="changeSizeDetailList"
                            @selection-change="getSelectionDetailList"
                            row-key="id"
                            highlight-current-row)
        ebrain-dialog(
            :submitLoading="submitLoadingDetailForm"
            :visible.sync="dialogVisibleDetailForm"
            :form.sync="dialogFormDetailForm"
            top="15vh"
            @submit="submitDetailForm")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/devicemanager/equipprojectreceiptdet/exportAllList/'+this.receiptNum"
            :params="exportIds"
            :before-export="handlerExport")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'acceptanceCheck',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            uploadDisabled: false,
            exportIds: [],
            exportFilename: '',
            dialogVisabledExport: false,
            uploadList: [],
            conditionListDown: [],
            conditionList: [],
            submit: true,
            idsDetailList: [],
            selectionDetailList: [],
            tableDataDetailList: [],
            currentPageDetailList: 1,
            pageTotalDetailList: 0,
            pageSizeDetailList: 20,
            tableLoadingDetailList: false,
            submitLoadingDetailForm: false,
            dialogVisibleDetailForm: false,
            submitLoadingDetail: false,
            dialogVisibleDetail: false,
            allColumn: [],
            rowObj_main: {},
            islook: false,
            isDelete: false,
            isDeleteStatus: false,
            idsDetailDialog: [],
            selectionDetailDialog: [],
            projectApplicationId: '',
            receiptNum: '',
            dialogVisibleDetailDialog: false,
            submitLoadingDetailDialog: false,
            tableLoadingDownDialog: false,
            pageSizeDownDialog: 20,
            currentPageDownDialog: 1,
            pageTotalDownDialog: 0,
            tableDataDetailDialog: [],
            collapse: false,
            collapseDetail: false,
            pageSize_down: 20,
            pageTotal_down: 0,
            currentPage_down: 1,
            tableDataSon: [],
            loading_down: false,
            rowKeyObj: {},
            isDisabled: false,
            ids: [],
            selection: [],
            unitCode: '',
            type: '',
            dialogTableLoading: false,
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogVisible: false,
            dialogData: [],
            currentRowKeyDialog: '',
            dialogSearchForm: {},
            dialogParent: '',
            submitLoading: false,
            dialogVisibleParent: false,
            loading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableDataParent: [],
            tableColumnDetailList: [{
                label: '验收项名称',
                prop: 'receiptItem',
                showOverflowTooltip: true,
            }, {
                label: '验收要求',
                prop: 'receiptRequirement',
                showOverflowTooltip: true,
            }, {
                label: '验收数据',
                prop: 'receiptData',
                showOverflowTooltip: true,
            }, {
                label: '验收结论',
                prop: 'receiptConclude',
                showOverflowTooltip: true,
            }],
            dialogFormDetailForm: [{
                label: '验收项名称',
                prop: 'receiptItem',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '验收要求',
                prop: 'receiptRequirement',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '验收数据',
                prop: 'receiptData',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '验收结论',
                prop: 'receiptConclude',
                value: '',
                type: 'textarea',
                required: true,
            }],
            dialogFormDetail: [{
                label: '设备名称',
                prop: 'equipName',
                value: '',
                disabled: true,
            }, {
                label: '验收人员',
                prop: 'accepter',
                value: '',
            }, {
                label: '验收结果',
                prop: 'acceptResult',
                value: '',
                required: true,
                type: 'select',
                option: dict.acceptResult,
            }, {
                label: '验收时间',
                prop: 'receiptTime',
                value: '',
                type: 'datetime',
                pickerOption: {
                    disabledDate: time => {
                        return time.getTime() > Date.now();
                    }
                },
            }],
            dialogFormDetailDialog: [{
                slot: 'selectBy',
                prop: 'selectBy',
            }, {
                slot: 'equipNum',
                label: '设备编号',
                prop: 'equipNum',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['device_classification'],
                disabled: true,
            }, {
                label: '规格/型号',
                prop: 'specModel',
                value: '',
                disabled: true,
            }, {
                label: '设备用途',
                prop: 'equipClass',
                value: '',
                disabled: true,
            }],
            tableColumnSon: [{
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '设备用途',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '验收结果',
                prop: 'acceptResult',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.acceptResult[cell];
                }
            }, {
                label: '验收人员',
                prop: 'accepter',
                showOverflowTooltip: true,
            }, {
                label: '验收日期',
                prop: 'receiptTime',
                showOverflowTooltip: true,
            }, {
                label: '设备验收状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.equiStatus[cell];
                }
            }],
            tableColumnSonDialog: [{
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '设备用途',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '验收结果',
                prop: 'acceptResult',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.acceptResult[cell];
                }
            }, {
                label: '验收人员',
                prop: 'accepter',
                showOverflowTooltip: true,
            }, {
                label: '验收日期',
                prop: 'receiptTime',
                showOverflowTooltip: true,
            }, {
                label: '设备验收状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.equiStatus[cell];
                }
            }],
            equiParameterColumn: [{
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }],
            equiApplyColumn: [{
                label: '申请单号',
                prop: 'projectApplicationCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目编号',
                prop: 'itemNo',
                showOverflowTooltip: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目负责人',
                prop: 'projectLeaderName',
                showOverflowTooltip: true,
            }, {
                label: '立项时间',
                prop: 'projectTime',
                showOverflowTooltip: true,
            }, {
                label: '申请人',
                prop: 'applicantPersonnelName',
                showOverflowTooltip: true,
            }, {
                label: '申请时间',
                prop: 'applicantDate',
                showOverflowTooltip: true,
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.transferOutStauts[cell];
                }
            }],
            tableColumnParent: [{
                label: '验收单号',
                prop: 'receiptNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目编号',
                prop: 'itemNo',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '项目负责人',
                prop: 'projectLeaderName',
                showOverflowTooltip: true,
            }, {
                label: '验收申请人',
                prop: 'accepter',
                showOverflowTooltip: true,
            }, {
                label: '验收申请时间',
                prop: 'receiptTime',
                showOverflowTooltip: true,
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '项目验收状态',
                prop: 'projectStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.projectStatus[cell];
                }
            }],
            dialogFormParent: [{
                label: '验收单号',
                prop: 'receiptNum',
                value: '',
                disabled: true,
            }, {
                slot: 'itemNo',
                label: '项目编号',
                prop: 'itemNo',
                value: '',
                required: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                value: '',
                disabled: true,
            }, {
                label: '项目负责人',
                prop: 'projectLeaderName',
                value: '',
                disabled: true,
            }, {
                label: '项目类型',
                prop: 'projectType',
                value: '',
                type: 'select',
                option: () => this.storeDict['PROJECT_TYPE'],
                disabled: true,
            }, {
                label: '验收申请时间',
                prop: 'receiptTime',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '验收申请人',
                prop: 'accepter',
                value: '',
                required: true,
            }, {
                label: '项目验收状态',
                prop: 'projectStatus',
                type: 'select',
                option: dict.projectStatus,
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '审核人',
                prop: 'reviewerPersonnellName',
                value: '',
                disabled: true,
            }, {
                label: '审核时间',
                prop: 'reviewerDate',
                value: '',
                disabled: true,
                type: 'datetime',
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                value: '',
                type: 'select',
                option: dict.transferOutStauts,
                disabled: true,
            }, {
                label: '创建人员',
                prop: 'createByName',
                value: '',
                disabled: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                slot: 'upload',
                prop: 'attachment'
            }, {
                label: '验收内容',
                prop: 'acceptanceContent',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '验收组意见',
                prop: 'accGroupOption',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '验收组长意见',
                prop: 'accGroupLeaderOption',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '总经理意见',
                prop: 'generalManagerOption',
                value: '',
                type: 'textarea',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_equipprojectapp_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1 || this.selection[0].reviewerStatus === '1',
                permi: 'devicemanager_equipprojectapp_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0 || this.isDelete,
                permi: 'devicemanager_equipprojectapp_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsButtom: [{
                label: '搜索',
                click: () => { this.searchVisibleDown = !this.searchVisibleDown },
                className: 'iconfont iconsearch',
                permi: false,
            }],
            searchForm: [{
                label: '验收单号',
                prop: 'receiptNum',
                value: ''
            }, {
                label: '项目名称',
                prop: 'itemName',
                value: ''
            }],
            searchFormDown: [{
                label: '设备编号',
                prop: 'equipNum',
                value: ''
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: ''
            }],
            searchVisible: true,
            searchVisibleDown: true,
            btnsDialog: [{
                label: '保存',
                loading: false,
                click: () => this.submitForm(),
                disabled: false,
                className: 'iconfont iconstatus-Preservation-',
                permi: false,
            }, {
                label: '取消',
                click: () => this.cancel(),
                className: 'iconfont iconstatus-Import',
                permi: false,
            }, {
                label: '审核',
                loading: false,
                click: () => this.submitStatus(),
                disabled: () => this.btnsDialog[0].label === '保存' || this.islook,
                className: 'iconfont iconstatus-examine',
                permi: 'devicemanager_equipprojectreceipt_audit',
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.dialogParent === 'new' || this.islook,
                permi: 'devicemanager_equipprojectreceiptdet_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selectionDetailDialog.length === 0 || this.isDeleteStatus || this.islook,
                permi: 'devicemanager_equipprojectreceiptdet_dels',
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                disabled: () => this.dialogParent === 'new' || !this.tableDataDetailDialog.length,
                permi: false,
            }, {
                label: '验收明细',
                click: () => this.checkAcceptDetail(),
                className: 'iconfont iconstatus-details',
                disabled: () => this.selectionDetailDialog.length !== 1,
                permi: false,
            }],
            btnsBottomDetail: [{
                label: '保存',
                loading: false,
                click: () => this.newEquiDetail(),
                className: 'iconfont iconstatus-Preservation-',
                disabled: () => this.selectionDetailDialog.length !== 1 || this.selectionDetailDialog[0].status === '1' || this.islook,
                permi: 'devicemanager_equipprojectreceiptdet_edit',
            }, {
                label: '返回',
                click: () => this.equiDetailCancel(),
                className: 'iconfont iconstatus-Import',
                permi: false,
            }, {
                label: '提交',
                loading: false,
                click: () => this.equiDetailSubmit(),
                className: 'iconfont iconstatus-Preservation-',
                disabled: () => (this.disableEquiSubmit && this.submit) || this.islook,
                permi: 'devicemanager_equipprojectreceiptdet_submit',
            }],
            btnsBottomDetailList: [{
                label: '添加',
                click: () => this.newEquiDetailList(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.selectionDetailDialog.length !== 1 || this.selectionDetailDialog[0].status === '1' || this.islook,
                permi: 'devicemanager_equipprojreceiptlist_add',
            }, {
                label: '删除',
                click: () => this.delEquiDetailList(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selectionDetailDialog.length !== 1 || this.selectionDetailDialog[0].status === '1' || this.selectionDetailList.length === 0 || this.islook || this.islook,
                permi: 'devicemanager_equipprojreceiptlist_dels',
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            permissions: state => state.permissions,
        }),
        disableEquiSubmit() {
            if (this.selectionDetailDialog.length === 1) {
                return !this.selectionDetailDialog[0].acceptResult || this.selectionDetailDialog[0].status === '1';
            } else {
                return false;
            }
        }
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.islook = false;
                this.tableDataDetailDialog = [];
                this.receiptNum = '';
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'receiptTime' || v.prop === 'accepter' || v.prop === 'acceptanceContent' || v.prop === 'accGroupOption' || v.prop === 'accGroupLeaderOption' || v.prop === 'generalManagerOption') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                    }
                });
                this.projectApplicationId = '';
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.currentPageDownDialog = 1;
                this.pageSizeDownDialog = 20;
                this.pageTotalDownDialog = 0;
                this.tableDataSon = [];
                this.getDateParent();
                this.$refs.table.setCurrentRow();
                this.$refs.table.clearSelection();
                this.$refs.dialogTable.clearSelection();
                this.uploadDisabled = false;
                this.isDeleteStatus = [];
                this.selectionDetailDialog = [];
                this.idsDetailDialog = [];
                this.dialogParent = '';
            }
        },
        dialogVisibleDetail(val) {
            if (!val) {
                this.updateStatus();
                this.submit = true;
                this.$refs.detailsDialogTable.clearSelection();
            }
        },
        dialogVisibleDetailDialog(val) {
            if (!val) {
                this.updateStatus();
                this.dialogFormDetailDialog.forEach(item => {
                    if (item.prop !== 'selectBy') {
                        item.disabled = true;
                        item.value = '';
                    }
                });
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.rowObj = {};
            }
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '验收清单';
            }
        },
    },
    created() {
        Promise.all([
            this.queryDict('PROJECT_TYPE'),
            this.queryDict('device_classification'),
        ]).then(() => {
            this.getDateParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 重新获取上表数据 更新项目验收状态
        updateStatus() {
            this.getProjectDetailInfo();
            const id = this.projectApplicationId || this.selection[0].id;
            this.$http.get(`/devicemanager/equipprojectreceipt/getById/${id}`).then(res => {
                this.dialogFormParent.forEach(v => {
                    v.value = res.data[v.prop];
                });
            });
        },
        // 搜索清空
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
            this.getDateParent();
        },
        // 获取上表列表
        getDateParent() {
            this.loading = true;
            this.$http.get('/devicemanager/equipprojectreceipt/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.loading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.$refs.table.setCurrentRow();
            });
        },
        // 获取台账信息
        getParameterInfo(val = 1) {
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
            this.$http.get('/basicdata/deviceaccount/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取设备项目申请信息
        getEquiApplyInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'reviewerStatus',
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
            this.$http.get('/devicemanager/equipprojectapp/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        enterTableDetails(type) {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.type = type;
            this.dialogVisible = true;
            switch (type) {
                case 'itemNo':
                    this.allColumn = this.equiApplyColumn;
                    this.getEquiApplyInfo();
                    break;
                case 'equipNum':
                    this.allColumn = this.equiParameterColumn;
                    this.getParameterInfo();
                    break;
                default:
                    break;
            }
        },
        // 获取当前行
        currentChange(row) {
            this.rowObj = row;
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'itemNo':
                    this.getEquiApplyInfo(val);
                    break;
                case 'equipNum':
                    this.getParameterInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'itemNo':
                    this.getEquiApplyInfo();
                    break;
                case 'equipNum':
                    this.getParameterInfo();
                    break;
                default:
                    break;
            }
        },
        submitFormDialog(type) {
            switch (type) {
                case 'itemNo':
                    this.dialogFormParent[1].value = this.rowObj.itemNo;
                    this.dialogFormParent[2].value = this.rowObj.itemName;
                    this.dialogFormParent[3].value = this.rowObj.projectLeaderName;
                    this.dialogFormParent[4].value = this.rowObj.projectType;
                    this.projectLeader = this.rowObj.projectLeader;
                    break;
                case 'equipNum':
                    this.dialogFormDetailDialog[1].value = this.rowObj.equipNum;
                    this.dialogFormDetailDialog[2].value = this.rowObj.equipName;
                    this.dialogFormDetailDialog[3].value = this.rowObj.equipType;
                    this.dialogFormDetailDialog[4].value = this.rowObj.specModel;
                    this.dialogFormDetailDialog[5].value = this.rowObj.equipClass;
                    break;
                default:
                    break;
            }
            this.dialogVisible = false;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            switch (this.type) {
                case 'itemNo':
                    this.getEquiApplyInfo();
                    break;
                case 'equipNum':
                    this.getParameterInfo();
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
        // 提交form表单
        submitForm() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.projectLeader = this.projectLeader;
            obj.attachment = this.uploadList.map(v => v.url).join(',');
            delete obj.receiptNum;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/devicemanager/equipprojectreceipt/saveEquipProjectReceipt', obj).then(res => {
                            this.projectApplicationId = res.data.id;
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogFormParent.forEach(v => {
                                v.value = res.data[v.prop];
                            });
                            this.receiptNum = res.data.receiptNum;
                            // this.btnsDialog[0].label = '修改';
                            this.btnsDialog[2].disabled = false;
                            this.dialogParent = 'edit';
                            // this.getDateParent();
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.projectApplicationId || this.rowKeyObj.id;
                        this.$http.put('/devicemanager/equipprojectreceipt/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            // this.getDateParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                        });
                    }
                }
            });
        },
        // 上表新增
        newRowParent() {
            this.dialogParent = 'new';
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[2].disabled = true;
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[7].value = '0';
            this.dialogFormParent[10].value = '0';
            this.uploadList = [];
        },
        // 上表修改
        editRowParent(row) {
            if (row) this.receiptNum = row.receiptNum;
            // this.btnsDialog[0].label = '修改';
            this.btnsDialog[2].disabled = false;
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.dialogVisibleParent = this.rowKeyObj.reviewStatus === '1' ? false : true;
            this.getProjectDetailInfo();
            this.islook = false;
            if (this.rowKeyObj[`attachment`]) {
                const list = this.rowKeyObj[`attachment`].split(',');
                this.uploadList = list.map(v => ({
                    url: v,
                    name: v.replace(/.+?@/, ''),
                }));
            } else {
                this.uploadList = [];
            }
        },
        // 上表页码
        changeCurrent(val) {
            this.currentPage = val;
            this.getDateParent();
        },
        // 上表页面数据数量
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDateParent();
        },
        selectionChange(selection) {
            this.isDelete = false;
            this.selection = selection;
            this.selection.forEach(item => {
                if (item.reviewerStatus === '1') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/equipprojectreceipt/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getDateParent();
                    this.tableDataSon = [];
                    this.pageSize_down = 20;
                    this.currentPage_down = 1;
                    this.pageTotal_down = 0;
                    this.$refs.table.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitStatus() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.reviewerPersonnel = this.sysUser.userId;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[2].loading = true;
                    obj.id = this.projectApplicationId || this.rowKeyObj.id;
                    this.$http.post(`/devicemanager/equipprojectreceipt/audit`, obj).then(() => {
                        this.btnsDialog[2].loading = false;
                        this.getDateParent();
                        this.$message({
                            message: '审核成功!',
                            type: 'success',
                        });
                        this.dialogVisibleParent = false;
                    }).catch(() => {
                        this.btnsDialog[2].loading = false;
                    });
                }
            });
        },
        look(row) {
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            if (row) this.receiptNum = row.receiptNum;
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.isDisabled = true;
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[0].disabled = true;
            this.btnsDialog[2].disabled = true;
            this.getProjectDetailInfo();
            this.islook = true;
            this.uploadDisabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.rowKeyObj.reviewerStatus !== '1' && this.permissions.includes('devicemanager_equipprojectapp_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        currentChange_List(row) {
            this.rowObj_main = row;
            this.resetDown();
            this.conditionListDown = [];
            if (row) {
                this.getDateSon();
            }
        },
        getDateSon() {
            this.receiptNum = this.rowObj_main.receiptNum;
            this.loading_down = true;
            this.$http.get(`/devicemanager/equipprojectreceiptdet/getByReceiptNum/${this.receiptNum}`, {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                    conditionList: this.conditionListDown,
                }
            }).then(res => {
                this.loading_down = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
            }).catch(() => {
                this.loading_down = false;
            });
        },
        // 子表清空
        resetDown() {
            this.searchFormDown.forEach(item => {
                item.value = '';
            });
        },
        // 子表搜索
        searchDown() {
            this.conditionListDown = this.searchFormDown.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.currentPage_down = 1;
            this.getDateSon();
        },
        // 下表分页
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDateSon();
        },
        // 下表分页
        changeSize_Down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDateSon();
        },
        // 获取弹出页面明细
        getProjectDetailInfo(val = 1) {
            this.receiptNum = this.receiptNum || this.selection[0].receiptNum;
            this.tableLoadingDownDialog = true;
            this.$http.get(`/devicemanager/equipprojectreceiptdet/getByReceiptNum/${this.receiptNum}`, {
                params: {
                    current: val,
                    size: this.pageSizeDownDialog,
                },
            }).then(res => {
                this.tableLoadingDownDialog = false;
                this.currentPageDownDialog = val;
                this.tableDataDetailDialog = res.data.records;
                this.pageTotalDownDialog = res.data.total;
            }).catch(() => {
                this.tableLoadingDownDialog = false;
            });
        },
        // 明细新增
        newRowSon() {
            this.dialogVisibleDetailDialog = true;
            this.dialogFormDetailDialog[0].value = '1';
        },
        // 删除明细
        delRowSon() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDownDialog = true;
                this.$http.delete('/devicemanager/equipprojectreceiptdet/removeByIds', {
                    data: this.idsDetailDialog,
                }).then(() => {
                    this.tableLoadingDownDialog = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    // this.getProjectDetailInfo();
                    this.updateStatus();
                    this.$refs.dialogTable.clearSelection();
                }).catch(() => {
                    this.tableLoadingDownDialog = false;
                });
            });
        },
        // 页码
        changeCurrentDownDialog(val) {
            this.getProjectDetailInfo(val);
        },
        // 页面数据数量
        changeSizeDownDialog(val) {
            this.pageSizeDownDialog = val;
            this.currentPageDownDialog = 1;
            this.getProjectDetailInfo();
        },
        // 明细选中数组
        getSelectionDownDialog(selection) {
            if (selection.length) {
                this.isDeleteStatus = selection.some(v => v.status === '1');
            }
            this.selectionDetailDialog = selection;
            this.idsDetailDialog = selection.map(v => v.id);
        },
        // 新增明细提交
        submitFormDetailDialog() {
            const obj = {};
            this.dialogFormDetailDialog.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.status = '0';
            obj.receiptNum = this.receiptNum || this.selection[0].receiptNum;
            this.submitLoadingDetailDialog = true;
            this.$http.post('/devicemanager/equipprojectreceiptdet/saveEquipProjectReceiptDet', obj).then(() => {
                this.submitLoadingDetailDialog = false;
                this.$message({
                    message: '验收清单保存成功!',
                    type: 'success',
                });
                this.dialogVisibleDetailDialog = false;
                this.getProjectDetailInfo();
            }).catch(() => {
                this.submitLoadingDetailDialog = false;
            });
        },
        checkAcceptDetail() {
            this.dialogVisibleDetail = true;
            this.dialogFormDetail[0].value = this.selectionDetailDialog[0].equipName;
            this.dialogFormDetail[1].value = this.selectionDetailDialog[0].accepter;
            this.dialogFormDetail[2].value = this.selectionDetailDialog[0].acceptResult;
            this.dialogFormDetail[3].value = this.selectionDetailDialog[0].receiptTime;
            this.getDetailList();
        },
        // 明细表单保存
        newEquiDetail() {
            let obj = {};
            this.dialogFormDetail.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.selectionDetailDialog[0].id;
            this.$refs.formDetail.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsBottomDetail[0].loading = true;
                    this.$http.put('/devicemanager/equipprojectreceiptdet/updateById', obj).then(() => {
                        this.btnsBottomDetail[0].loading = false;
                        this.submit = false;
                        this.submitLoading = false;
                        this.$message({
                            message: '验收明细保存成功!',
                            type: 'success',
                        });
                    }).catch(() => {
                        this.btnsBottomDetail[0].loading = false;
                        this.submitLoading = false;
                    });
                }
            });
        },
        // 明细返回
        equiDetailCancel() {
            this.dialogVisibleDetail = false;
        },
        // 明细表单提交
        equiDetailSubmit() {
            this.btnsBottomDetail[2].loading = true;
            this.$http.post(`/devicemanager/equipprojectreceiptdet/submit/${this.selectionDetailDialog[0].id}`).then(() => {
                this.$message({
                    message: '提交成功!',
                    type: 'success'
                });
                this.btnsBottomDetail[2].loading = false;
                this.dialogVisibleDetail = false;
            }).catch(() => {
                this.btnsBottomDetail[2].loading = false;
            });
        },
        // 弹出明细列表新增
        newEquiDetailList() {
            this.dialogVisibleDetailForm = true;
        },
        // 弹出明细列表单确认提交
        submitDetailForm() {
            let obj = {};
            this.dialogFormDetailForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.detId = this.selectionDetailDialog[0].id;
            this.submitLoadingDetailForm = true;
            this.$http.post('/devicemanager/equipprojreceiptlist/save', obj).then(res => {
                this.submitLoadingDetailForm = false;
                this.dialogVisibleDetailForm = false;
                this.$message({
                    message: '验收明细添加成功!',
                    type: 'success',
                });
                this.getDetailList();
            }).catch(() => {
                this.submitLoadingDetailForm = false;
            });
        },
        // 获取明细列表页数据
        getDetailList(val = 1) {
            this.tableLoadingDetailList = true;
            this.$http.get('/devicemanager/equipprojreceiptlist/page', {
                params: {
                    current: val,
                    size: this.pageSizeDetailList,
                    conditionList: [{
                        fieldName: 'detId',
                        joinType: 'AND',
                        operation: 'EQ',
                        value: this.selectionDetailDialog[0].id,
                    }],
                },
            }).then(res => {
                this.tableLoadingDetailList = false;
                this.currentPageDetailList = val;
                this.tableDataDetailList = res.data.records;
                this.pageTotalDetailList = res.data.total;
            });
        },
        // 弹出明细列表删除
        delEquiDetailList() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoadingDetailForm = true;
                this.$http.delete('/devicemanager/equipprojreceiptlist/removeByIds', {
                    data: this.idsDetailList,
                }).then(() => {
                    this.submitLoadingDetailForm = false;
                    this.$message({
                        message: '设备验收明细删除成功!',
                        type: 'success'
                    });
                    this.getDetailList();
                    this.$refs.detailsDialogTable.clearSelection();
                }).catch(() => {
                    this.submitLoadingDetailForm = false;
                });
            });
        },
        // 分页
        changeCurrentDetailList(val) {
            this.getDetailList(val);
        },
        changeSizeDetailList(val) {
            this.pageSizeDetailList = val;
            this.currentPageDetailList = 1;
            this.getDetailList();
        },
        // 详细列表多选
        getSelectionDetailList(selection) {
            this.selectionDetailList = selection;
            this.idsDetailList = selection.map(v => v.id);
        },
        // 文件上传
        uploadChangeHandler(file, fileList) {
            const newFileList = fileList.map(v => {
                if (v.url) return v;
                const url = v.response
                    && v.response.data
                    && `/devicemanager/equipprojectreceipt/getfile/${v.response.data.bucketName}-${v.response.data.fileName}`;
                const name = v.response
                    && v.response.data
                    && v.response.data.fileName.replace(/.+?@/, '');
                return {
                    ...v,
                    name,
                    url,
                };
            });
            this.uploadList = newFileList;
        },
        // successHandler(res, file, fileList) {
        //     this.$message.success(`上传成功!`);
        // },
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },
        // 导出
        exportAll() {
            this.dialogVisabledExport = true;
        },
        handlerExport(dataSetting) {
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.idsDetailDialog.length) {
                    this.exportIds = this.idsDetailDialog;
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.tableDataDetailDialog.map(v => v.id);
            }
        },
        selectByChange() {
            this.dialogFormDetailDialog.forEach(item => {
                if (this.dialogFormDetailDialog[0].value === '0') {
                    if (item.prop !== 'selectBy') {
                        item.disabled = false;
                        item.value = '';
                    }
                } else {
                    if (item.prop !== 'selectBy') {
                        item.disabled = true;
                        item.value = '';
                    }
                }
            });
            this.$refs.dialogFormDetailDialog.$refs.form.resetFields();
        }
    }
};
</script>

<style lang="stylus" scoped>
.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        min-height 150px!important
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
.acceptanceCheck
    & >>> .frame
        .fr
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
