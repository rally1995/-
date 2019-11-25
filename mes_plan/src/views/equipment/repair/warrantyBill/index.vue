<template lang="pug">
    ebrain-main.warrBill
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
                    :highlight-current-row="isLight"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="hanlderSelect"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize')
        ebrain-frame.tabs.halfHeight(title="作业列表")
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="派工记录" name="first")
                    el-tab-pane(label="维修记录" name="second")
            template(#table)
                ebrain-box-table(
                    key="table1"
                    v-if="activeName==='first'"
                    :loading="tableLoadingSonL"
                    :pageSize="pageSizeSonL"
                    :pageCurrent="currentPageSonL"
                    :pageTotal="pageTotalSonL"
                    :data="tableDataSonL"
                    :column="tableColumnSonL"
                    row-key="id"
                    highlight-current-row
                    @page-change="ChangeCurrentSonL"
                    @size-change="ChangeSizeSonL")
                ebrain-box-table(
                    key="table2"
                    v-if="activeName==='second'"
                    :loading="tableLoadingSonR"
                    :pageSize="pageSizeSonR"
                    :pageCurrent="currentPageSonR"
                    :pageTotal="pageTotalSonR"
                    :data="tableDataSonR"
                    :column="tableColumnSonR"
                    row-key="id"
                    highlight-current-row
                    @page-change="ChangeCurrentSonR"
                    @size-change="ChangeSizeSonR")
        ebrain-dialog.dialog_form(
            :isCancel="false"
            :isShow="false"
            :visible.sync="dialogVisible"
            :submitLoading="submitLoading")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            frame-form(
                title="车间设备"
                ref="fram1"
                :form.sync="dialogForm")
                template(#equipNum="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="设备编号" :required="true" prop="equipNum")
                            el-input(style="cursor:pointer" :value="value" :readonly="true" :disabled="isSubmit")
                                el-button(slot="append" :disabled="isSubmit"  @click="dialogSearchEquip={};openEquip()"  icon="iconfont iconsearch")
            frame-form.cssSty(
                ref="fram2"
                title="故障描述"
                :form.sync="dialogFormDown")
                template(#upload)
                    el-col(:span="24")
                        el-form-item(label-width="110px" label="上传附件" prop="attachment")
                            ebrain-upload.upload(
                                :file-list="uploadList"
                                :limit="10"
                                action="/devicemanager/faultreport/upload"
                                :on-change="uploadChangeHandler"
                                list-type="text"
                                :on-remove="removeChangeHandler"
                                :on-preview="previewChangeHandler"
                                :disabled="isSubmit")
                                el-button(type="primary" :disabled="isSubmit") 上传附件
                template(#repairer="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="报修人" :required="true" prop="repairer")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="dialogSearchexeMan={};openexeMan('报修人')"  icon="iconfont iconsearch")
                template(#discoverer="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="发现人" :required="true" prop="discoverer")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="dialogSearchexeMan={};openexeMan('发现人')"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableEquip"
            :column="tableColumnEquip"
            :tableLoading="equipLoading"
            :visible.sync="dialogVisibleEquip"
            :pageSize="pageSizeEquip"
            :currentPage="currentPageEquip"
            :pageTotal="pageTotalEquip"
            :disabled="!currentRowKeyEquip"
            @changeCurrent="changeCurrentEquip"
            @changeSize="changeSizeEquip"
            @search="searchEquip"
            @resetDialog="resetEquip"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyEquip"
            @submit="submitFormEquip")
        ebrain-dialog(
            ref="formWork"
            :form.sync="dialogFormWork"
            :visible.sync="dialogVisibleWork"
            :submitLoading="submitLoadingWork"
            :isCancel="false"
            :isShow="false"
            @submit="dispathWork")
            template(#button)
                ebrain-tools(:buttons="btnsWork")
            template(#exeMan="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="执行人(班组)" :required="true" prop="executor")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="dialogSearchexeMan={};openexeMan('派工人')"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableExecutor"
            :column="tableColumnExecutor"
            :tableLoading="executorLoading"
            :visible.sync="dialogVisibleExecutor"
            :pageSize="pageSizeExecutor"
            :currentPage="currentPageExecutor"
            :pageTotal="pageTotalExecutor"
            :disabled="!currentRowKeyExecutor"
            @changeCurrent="changeCurrentExecutor"
            @changeSize="changeSizeExecutor"
            row-key="id"
            @search="searchExecutor"
            @resetDialog="resetExecutor"
            dialogTableSearch
            :current-row-key.sync="currentRowKeyExecutor"
            @submit="submitFormExecutor")
</template>
<script>
import FrameForm from '../FrameForm';
import dict from '@/utils/dict';
import moment from 'moment';
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
export default {
    components: {
        FrameForm
    },
    data() {
        return {
            searchVisible: true,
            tableLoading: false,
            getPeople: '',
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            parentRow: {},
            dialogType: '',
            activeName: 'first',
            conditionList: [],
            dialogVisible: false,
            isLight: false,
            muliption: [],
            dialogForm: [{
                label: '报修单号',
                prop: 'billCode',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '单据状态',
                type: 'select',
                prop: 'status',
                value: '',
                option: dict.REPAIR_STATUS,
                required: true,
                disabled: true,
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: '',
                slot: 'equipNum',
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '安装位置',
                prop: 'installPosition',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_position'],
                disabled: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_classification'],
                required: true,
                disabled: true,
            }],
            dialogFormDown: [{
                label: '报修人',
                prop: 'repairer',
                value: '',
                type: 'select',
                option: {},
                // nodeKey: 'personnelFullName',
                // nodeLabel: 'personnelFullName',
                required: true,
                slot: 'repairer',
            }, {
                label: '报修时间',
                prop: 'repairTime',
                value: '',
                type: 'datetime',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        if (value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (new Date(value).getTime() > new Date().getTime()) {
                                    callback(new Error('报修时间不能大于当前时间!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '发现人',
                prop: 'discoverer',
                value: '',
                type: 'select',
                option: {},
                // nodeKey: 'personnelFullName',
                // nodeLabel: 'personnelFullName',
                required: true,
                slot: 'discoverer'
            }, {
                label: '发现时间',
                prop: 'discoveryTime',
                type: 'datetime',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        if (value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (new Date(value).getTime() > new Date().getTime()) {
                                    callback(new Error('发现时间不能大于当前时间!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                type: 'select',
                value: '',
                required: true,
                option: () => this.storeDict['FAULT_CLASS'],
            }, {
                label: '故障等级',
                prop: 'failureLevel',
                type: 'select',
                value: '',
                required: true,
                option: () => this.storeDict['FAILURE_LEVEL'],
            }, {
                label: '设备状态',
                prop: 'equipWokerStatus',
                type: 'select',
                value: '',
                required: true,
                option: () => this.storeDict['work_status'],
            }, {
                label: '故障描述',
                prop: 'faultRemark',
                type: 'textarea',
                value: '',
                required: true,
            }, {
                label: '附件',
                prop: 'attachment',
                value: '',
                slot: 'upload'
            }],
            btnsForm: [{
                label: '保存',
                click: () => this.saveData(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_faultreport_add',
                loading: false,
            }, {
                label: '提交',
                click: () => this.submitParent(),
                disabled: () => this.submitValited,
                className: 'iconfont iconstatus-Submission',
                permi: false,
                loading: false,
            }, {
                label: '关闭',
                click: () => this.close(),
                className: 'iconfont iconClose-',
                permi: false,
            }],
            submitLoading: false,
            dialogVisibleWork: false,
            submitLoadingWork: false,
            tableExecutor: [],
            executorLoading: false,
            dialogVisibleExecutor: false,
            pageSizeExecutor: 20,
            currentPageExecutor: 1,
            pageTotalExecutor: 0,
            currentRowKeyExecutor: '',
            filterBol: true,
            uploadList: [],
            tableColumn: [{
                label: '报修单号',
                prop: 'billCode',
                showOverflowTooltip: true
            }, {
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true
            }, {
                label: '报修时间',
                prop: 'repairTime',
                showOverflowTooltip: true,
            }, {
                label: '报修人',
                prop: 'repairer',
                showOverflowTooltip: true
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                showOverflowTooltip: true
            }, {
                label: '发现时间',
                prop: 'discoveryTime',
                showOverflowTooltip: true,
            }, {
                label: '发现人',
                prop: 'discoverer',
                showOverflowTooltip: true,
            }, {
                label: '故障等级',
                prop: 'failureLevel',
                formatter: (row, column, cell) => {
                    return this.storeDict['FAILURE_LEVEL'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.REPAIR_STATUS[cell];
                }
            }],
            selection: [],
            dialogSearchEquip: {},
            tableEquip: [],
            equipLoading: false,
            dialogVisibleEquip: false,
            pageSizeEquip: 20,
            currentPageEquip: 1,
            pageTotalEquip: 0,
            currentRowKeyEquip: '',
            tableColumnEquip: [{
                label: '设备编号',
                prop: 'equipNum',
                searchBy: true,
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'equipName',
                searchBy: true,
                showOverflowTooltip: true
            }, {
                label: '安装位置',
                prop: 'installPosition',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_position'][cell];
                },
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }],
            tableLoadingSonL: false,
            pageSizeSonL: 20,
            currentPageSonL: 1,
            pageTotalSonL: 0,
            tableDataSonL: [],
            childRow: {},
            tableColumnSonL: [{
                label: '派工人',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
            }, {
                label: '派工时间',
                prop: 'dispatchTime',
                showOverflowTooltip: true
            }, {
                label: '执行人',
                prop: 'executor',
                showOverflowTooltip: true
            }, {
                label: '执行时间',
                prop: 'updateTime',
                showOverflowTooltip: true
            }],
            tableLoadingSonR: false,
            pageSizeSonR: 20,
            currentPageSonR: 1,
            pageTotalSonR: 0,
            tableDataSonR: [],
            SubmitId: '',
            isSubmit: false,
            empyData: [],
            searchObj: {
                repairStartTime: null,
                repairEndTime: null,
                personnelNumber: null,
            },
            tableColumnSonR: [{
                label: '维修单号',
                prop: 'repairNum',
                showOverflowTooltip: true,
            }, {
                label: '诊断情况',
                prop: 'disposalMeasures',
                showOverflowTooltip: true
            }, {
                label: '维修费用',
                prop: 'maintenanceCosts',
                showOverflowTooltip: true
            }, {
                label: '维修结果',
                prop: 'repairResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['REPAIR_RESULT'][cell];
                }
            }, {
                label: '创建人',
                prop: 'createBy',
                showOverflowTooltip: true
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_faultreport_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'devicemanager_faultreport_add',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'devicemanager_faultreport_dels',
            }, {
                label: '提交',
                click: () => this.submitParent(),
                className: 'iconfont iconstatus-Submission',
                disabled: () => this.submitDisabled,
                permi: false,
                loading: false,
            }, {
                label: '撤销提交',
                click: () => this.disAll(),
                className: 'iconfont iconrevoke',
                disabled: () => this.resetDisabled,
                loading: false,
                permi: false,
            }, {
                label: '派工',
                click: () => this.openDispathWork(),
                className: 'iconfont iconTo-be-producedorder',
                disabled: () => this.resetDisabled,
                permi: 'devicemanager_faultreportdispatch_add',
            }, {
                label: '搜索',
                click: () => this.search(),
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '报修单号',
                prop: 'billCode',
                value: ''
            }, {
                label: '状态',
                prop: 'status',
                type: 'select',
                option: dict.REPAIR_STATUS,
                multiple: true,
                value: [],
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: ''
            }, {
                label: '发现人',
                prop: 'discoverer',
                value: ''
            }, {
                label: '报修时间',
                prop: 'repairTime',
                value: '',
                type: 'picker',
            }],
            dialogSearchexeMan: {},
            status: '',
            dialogFormWork: [{
                label: '派工人',
                prop: 'personnelNumber',
                value: '',
                disabled: true,
            }, {
                label: '派工时间',
                prop: 'dispatchTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '执行类型',
                prop: 'performType',
                value: '',
                type: 'select',
                option: dict.planExecType,
                required: true,
                change: () => {
                    this.dialogFormWork[3].value = '';
                }
            }, {
                label: '执行人(班组)',
                prop: 'executor',
                value: '',
                slot: 'exeMan',
            }, {
                label: '描述',
                prop: 'description',
                value: '',
                type: 'textarea',
            }],
            btnsWork: [{
                label: '保存',
                click: () => this.dispathWork(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
                loading: false,
            }, {
                label: '关闭',
                click: () => { this.dialogVisibleWork = false },
                className: 'iconfont iconClose-',
                permi: false,
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        submitValited() {
            return this.status !== '0' || this.dialogType !== 'edit';
        },
        submitReset() {
            return this.status !== '1' || this.dialogType !== 'edit';
        },
        tableColumnExecutor() {
            const row = this.dialogFormWork.find(v => v.prop === 'performType');
            let arr = [];
            if (row.value === '0' || this.getPeople !== '派工人') {
                arr = [{
                    label: '员工姓名',
                    prop: 'personnelFullName',
                    value: '',
                    searchBy: true,
                }, {
                    label: '员工编码',
                    prop: 'personnelNumber',
                    value: '',
                    searchBy: true,
                }, {
                    label: '岗位',
                    prop: 'postName',
                    value: ''
                }];
            } else {
                arr = [{
                    label: '班组编码',
                    prop: 'teamNumber',
                    searchBy: true,
                    value: ''
                }, {
                    label: '班组名称',
                    prop: 'teamName',
                    searchBy: true,
                    value: ''
                }, {
                    label: '备注',
                    prop: 'remark',
                    value: ''
                }];
            }
            return arr;
        },
        editDisabled() {
            return this.muliption.length !== 1 || this.muliption[0].status !== '0';
        },
        delDisabled() {
            return this.muliption.length === 0 || this.filterBol;
        },
        submitDisabled() {
            return this.muliption.length !== 1 || this.muliption[0].status !== '0';
        },
        resetDisabled() {
            return this.muliption.length !== 1 || this.muliption[0].status !== '1';
        },
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.dialogForm.forEach(v => {
                    v.value = '';
                });
                this.dialogFormDown.forEach(v => {
                    v.value = '';
                });
                this.$refs.fram1.$refs.form.resetFields();
                this.$refs.fram2.$refs.form.resetFields();
                this.dialogType = '';
                this.status = '';
                this.uploadList = [];
                this.isSubmit = false;
                this.SubmitId = '';
                this.tableDataSonL = [];
                this.tableDataSonR = [];
                this.getData();
            }
        },
        dialogVisibleEquip(val) {
            if (!val) {
                this.currentRowKeyEquip = '';
                this.currentPageEquip = 1;
                this.pageSizeEquip = 20;
                this.dialogSearchexeMan = {};
                // this.dialogFormWork[2].value = '0';
            }
        },
        dialogVisibleExecutor(val) {
            if (!val) {
                this.currentRowKeyExecutor = '';
                this.pageSizeExecutor = 20;
                this.currentPageExecutor = 1;
            }
        },
        activeName(val) {
            if (val === 'first' && Object.keys(this.parentRow).length !== 0) this.getDataSonL();
            else if (val === 'second' && Object.keys(this.parentRow).length !== 0) this.getDataSonR();
        },
        status(val) {
            if (val === '0' || val === '') {
                this.isSubmit = false;
                this.dialogFormDown.forEach(v => {
                    v.disabled = false;
                });
                this.$set(this.btnsForm, 1, {
                    label: '提交',
                    click: () => this.submitParent(),
                    disabled: () => this.submitValited,
                    className: 'iconfont iconstatus-Submission',
                    permi: false,
                    loading: false,
                });
            } else {
                this.isSubmit = true;
                this.dialogFormDown.forEach(v => {
                    v.disabled = true;
                });
                this.$set(this.btnsForm, 1, {
                    label: '撤销提交',
                    click: () => this.disAll(),
                    className: 'iconfont iconrevoke',
                    disabled: () => this.submitReset,
                    permi: false,
                    loading: false,
                });
            }
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '配件更换';
            }
        },
        dialogType(val) {
            if (val === 'new') {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveData(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_faultreport_add',
                    loading: false,
                });
            } else {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveData(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_faultreport_edit',
                    disabled: () => this.isSubmit,
                    loading: false,
                });
            }
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('FAILURE_LEVEL'),
                this.queryDict(`device_classification`),
                this.queryDict('work_status'),
                this.queryDict('REPAIR_RESULT'),
                this.queryDict('device_position'),
                this.queryDict('FAULT_CLASS')]).then(() => {
                this.getData();
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.tableDataSonL = [];
            this.tableDataSonR = [];
            this.pageSizeSonL = 20;
            this.currentPageSonL = 1;
            this.pageTotalSonL = 0;
            this.pageSizeSonR = 20;
            this.currentPageSonR = 1;
            this.pageTotalSonR = 0;
            this.searchForm.forEach(v => {
                if (v.prop === 'repairTime') {
                    this.searchObj.repairStartTime = v.value ? moment(v.value[0]).format('YYYY-MM-DD HH:mm:ss') : null;
                    this.searchObj.repairEndTime = v.value ? moment(v.value[1]).format('YYYY-MM-DD HH:mm:ss') : null;
                } else if (v.prop === 'status') {
                    if (v.value.length) {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'IN',
                            value: v.value.join(','),
                        });
                    }
                } else {
                    if (v.value) {
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
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                ...this.searchObj,
                conditionList: [],
            };
            params.conditionList = [...this.conditionList];
            return this.$http.post(`/devicemanager/faultreport/page`, null, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
                this.$refs.table1.setCurrentRow();
            }).catch(() => {
                this.tableLoading = false;
            });

        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
            this.conditionList = [];
        },
        search() {
            this.searchVisible = !this.searchVisible;
            this.parentRow = {};
            this.isLight = false;
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        CurrentChange(row) {
            if (row) this.parentRow = row;
            this.isLight = true;
            if (this.activeName === 'first') this.getDataSonL();
            else if (this.activeName === 'second') this.getDataSonR();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        newRow() {
            this.dialogVisible = true;
            this.dialogType = 'new';
            this.isLight = false;
            this.dialogForm[0].value = '系统自动生成';
            this.dialogForm[1].value = '0';
            this.dialogFormDown[1].value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogFormDown[5].value = '0';
            this.dialogFormDown[6].value = '2';
            this.status = '0';
            this.uploadList = [];
        },
        rowDblClickHandler(row, column, e) {
            this.editRow(row);
        },
        editRow(row) {
            let newRow = row || { ...this.parentRow };
            this.status = newRow['status'];
            this.SubmitId = newRow['id'];
            this.dialogVisible = true;
            this.dialogType = 'edit';
            this.dialogForm.forEach(v => {
                v.value = newRow[v.prop];
            });
            this.dialogFormDown.forEach(v => {
                v.value = newRow[v.prop];
            });
            if (newRow[`attachment`]) {
                const list = newRow[`attachment`].split(',');
                this.uploadList = list.map(v => ({
                    url: v,
                    name: v.replace(/.+?@/, ''),
                }));
            } else {
                this.uploadList = [];
            }
            // const url = newRow[`attachment`];
            // const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            // let name = url ? url.match(reg) : '';
            // name = String(name);
            // this.uploadList = newRow[`attachment`] ? [{ url, name }] : [];
        },
        delRow() {
            const ids = this.muliption.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/faultreport/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData().then(() => {
                        this.muliption = [];
                    });
                    this.parentRow = {};
                    this.tableDataSonL = [];
                    this.tableDataSonL = [];
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.table1.clearSelection();
                });
            });
        },
        hanlderSelect(selection) {
            this.muliption = selection;
            this.isLight = false;
            this.muliption.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.muliption, v);
                }
            });
            if (selection.length !== 0) {
                this.parentRow = this.muliption[0];
                this.SubmitId = this.parentRow['id'];
            }
            this.filterBol = this.muliption.some(v => v.status !== '0');
        },
        saveData() {
            this.$refs.fram1.$refs.form.validate(valid1 => {
                this.$refs.fram2.$refs.form.validate(valid2 => {
                    if (valid1 && valid2) {
                        if (this.dialogForm[4].value === null) {
                            this.$alert('请在设备资产增加安装位置。否则将不能保存!', {
                                type: 'warning'
                            });
                            return;
                        }
                        let obj = {};
                        this.dialogForm.forEach(v => {
                            obj[v.prop] = v.value;
                        });
                        this.dialogFormDown.forEach(v => {
                            obj[v.prop] = v.value;
                        });
                        // 对文件进行处理
                        obj.attachment = this.uploadList.map(v => v.url).join(',');
                        // obj.attachment = '';
                        // this.uploadList.forEach(v => {
                        //     obj.attachment = v.url;
                        //     // if (v.response && v.response.data) {
                        //     //     const { bucketName, fileName } = v.response.data;
                        //     //     obj.attachment = `/devicemanager/faultreport/getfile/${bucketName}-${fileName}`;
                        //     // } else {
                        //     //     obj.attachment = v.url;
                        //     // }
                        // });
                        this.btnsForm[0].loading = true;
                        if (this.dialogType === 'new') {
                            delete obj.billCode;
                            if (obj.repairTime !== '') obj.repairTime = moment(obj.repairTime).format('YYYY-MM-DD HH:mm:ss');
                            if (obj.discoveryTime !== '') obj.discoveryTime = moment(obj.discoveryTime).format('YYYY-MM-DD HH:mm:ss');
                            this.$http.post(`/devicemanager/faultreport/save`, obj).then(({ code, data }) => {
                                this.$message.success('添加成功');
                                this.dialogType = 'edit';
                                this.dialogForm[0].value = data.billCode;
                                this.dialogForm[1].value = data.status;
                                this.status = data.status;
                                this.parentRow = data;
                                this.SubmitId = data.id;
                                // this.getData();
                                this.btnsForm[0].loading = false;
                            }).catch(() => {
                                this.btnsForm[0].loading = false;
                            });
                        } else {
                            obj.id = this.SubmitId;
                            this.$http.put(`/devicemanager/faultreport/updateById`, obj).then(() => {
                                this.$message.success('修改成功');
                                // this.getData();
                                this.btnsForm[0].loading = false;
                            }).catch(() => {
                                this.btnsForm[0].loading = false;
                            });
                        }
                    }
                });
            });
        },
        // 提交
        submitParent() {
            if (this.dialogType !== '') this.btnsForm[1].loading = true;
            else this.btnsTop[3].loading = true;
            this.$http.get(`/devicemanager/faultreport/submit/${this.SubmitId}`).then(({ code, data }) => {
                this.SubmitId = data.id;
                if (this.dialogType !== '') {
                    this.dialogForm.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.dialogFormDown.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.status = data.status;
                }
                this.$message.success('提交成功');
                if (this.dialogType !== '') this.btnsTop[1].loading = false;
                this.getData().then(() => {
                    this.btnsTop[3].loading = false;
                }).catch(() => {
                    this.btnsTop[3].loading = false;
                });
            }).catch(() => {
                this.btnsTop[3].loading = false;
                this.btnsForm[1].loading = false;
            });
        },
        // 撤销提交
        disAll() {
            if (this.dialogType !== '') this.btnsForm[1].loading = true;
            else this.btnsTop[4].loading = true;
            this.$http.get(`/devicemanager/faultreport/getRevocation/${this.SubmitId}`).then(({ code, data }) => {
                this.SubmitId = data.id;
                if (this.dialogType !== '') {
                    this.dialogForm.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.dialogForm.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.status = data.status;
                }
                this.$message.success('撤销提交成功');
                if (this.dialogType !== '') this.btnsForm[1].loading = false;
                this.getData().then(() => {
                    this.btnsTop[4].loading = false;
                }).catch(() => {
                    this.btnsTop[4].loading = false;
                });
            }).catch(() => {
                this.btnsForm[1].loading = false;
            });
        },
        // 派工
        openDispathWork() {
            this.dialogVisibleWork = true;
            this.dialogFormWork[0].value = this.sysUser.nickname;
            this.dialogFormWork[2].value = '0';
            this.dialogFormWork[1].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.getExecutor();
        },
        dispathWork() {
            const ids = this.muliption[0].id;
            this.submitLoadingWork = true;
            let obj = {};
            this.dialogFormWork.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.faultReportId = ids;
            this.$refs.formWork.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsWork[0].loading = true;
                    if (obj.dispatchTime !== null) obj.dispatchTime = moment(obj.dispatchTime).format('YYYY-MM-DD HH:mm:ss');
                    this.$http.post(`/devicemanager/faultreportdispatch/save`, obj).then(() => {
                        this.$message.success('派工完成');
                        this.dialogVisibleWork = false;
                        this.btnsWork[0].loading = false;
                        this.getData();
                    }).catch(() => {
                        this.btnsWork[0].loading = false;
                    });
                }
            });
        },
        close() {
            this.dialogVisible = false;
        },
        // 派工单
        getDataSonL() {
            if (Object.keys(this.parentRow).length !== 0) {
                this.tableLoadingSonL = true;
                const params = {
                    current: this.currentPageSonL,
                    size: this.pageSizeSonL,
                    conditionList: [{
                        fieldName: 'faultReportId',
                        operation: 'EQ',
                        value: this.parentRow['id'],
                    }],
                };
                return this.$http.get(`/devicemanager/faultreportdispatch/page`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataSonL = data.records;
                    this.pageTotalSonL = data.total;
                    this.tableLoadingSonL = false;
                }).catch(() => {
                    this.tableLoadingSonL = false;
                });

            }
        },
        ChangeCurrentSonL(val) {
            this.currentPageSonL = val;
            this.getDataSonL();
        },
        ChangeSizeSonL(val) {
            this.pageSizeSonL = val;
            this.currentPageSonL = 1;
            this.getDataSonL();
        },
        // 维修记录
        getDataSonR() {
            this.tableLoadingSonR = true;
            const params = {
                current: this.currentPageSonR,
                size: this.pageSizeSonR,
                conditionList: [],
                startTimeBegin: null,
                startTimeEnd: null,
                endTimeBegin: null,
                endTimeEnd: null,
                executor: null,
            };
            params.conditionList.push({
                fieldName: 'faultReportBillCode',
                operation: 'EQ',
                value: this.parentRow['billCode'],
            });
            return this.$http.post(`/devicemanager/repair/page`, null, {
                params
            }).then(({ code, data }) => {
                this.tableDataSonR = data.records;
                this.pageTotalSonR = data.total;
                this.tableDataSonR.forEach(v => {
                    v.createBy = this.sysUser.nickname;
                });
                this.tableLoadingSonR = false;
            }).catch(() => {
                this.tableLoadingSonR = false;
            });

        },
        ChangeCurrentSonR(val) {
            this.currentPageSonR = val;
            this.getDataSonR();
        },
        ChangeSizeSonR(val) {
            this.pageSizeSonR = val;
            this.currentPageSonR = 1;
            this.getDataSonR();
        },
        // 获取设备
        openEquip() {
            this.dialogVisibleEquip = true;
            this.getEquip();
        },
        getEquip() {
            this.equipLoading = true;
            const params = {
                current: this.currentPageEquip,
                size: this.pageSizeEquip,
                conditionList: [],
            };
            if (this.dialogSearchEquip) {
                for (let i in this.dialogSearchEquip) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchEquip, i)) {
                        if (this.dialogSearchEquip[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                value: this.dialogSearchEquip[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/basicdata/deviceaccount/selectEquipmentAccountPage`, {
                params
            }).then(res => {
                this.tableEquip = res.data.records;
                this.pageTotalEquip = res.data.total;
                this.equipLoading = false;
            }).catch(() => {
                this.equipLoading = false;
            });
        },
        submitFormEquip() {
            const row = this.tableEquip.find(v => v.id === this.currentRowKeyEquip);
            this.dialogForm[2].value = row.equipNum;
            this.dialogForm[3].value = row.equipName;
            this.dialogForm[4].value = row.installPosition;
            this.dialogForm[5].value = row.equipType;
            this.dialogVisibleEquip = false;
        },
        searchEquip(form) {
            this.currentPageEquip = 1;
            this.dialogSearchEquip = form;
            this.getEquip();
        },
        resetEquip(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentEquip(val) {
            this.dialogSearchEquip = {};
            this.currentPageEquip = val;
            this.getEquip();
        },
        changeSizeEquip(val) {
            this.pageSizeEquip = val;
            this.currentPageEquip = 1;
            this.getEquip();
        },
        // 获取执行人或班组
        openexeMan(value) {
            this.getPeople = value;
            this.dialogVisibleExecutor = true;
            this.getExecutor();
        },
        getExecutor() {
            this.executorLoading = true;
            const row = this.dialogFormWork.find(v => v.prop === 'performType');
            let params = {
                current: this.currentPageExecutor,
                size: this.pageSizeExecutor,
                conditionList: [],
            };
            if (this.dialogSearchexeMan) {
                for (let i in this.dialogSearchexeMan) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchexeMan, i)) {
                        if (this.dialogSearchexeMan[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                value: this.dialogSearchexeMan[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            if (row.value === '0' || this.getPeople !== '派工人') {
                params.conditionList.push({
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    value: '0',
                });
                params.conditionList.push({
                    fieldName: 'delFlag',
                    operation: 'EQ',
                    value: '0',
                });
                this.$http.get(`/basicdata/dicpersonnel/page`, {
                    params
                }).then(res => {
                    this.tableExecutor = res.data.records;
                    this.pageTotalExecutor = res.data.total;
                    this.executorLoading = false;
                }).catch(() => {
                    this.executorLoading = false;
                });
            } else {
                this.$http.get(`/basicdata/basicteam/page`, {
                    params
                }).then(res => {
                    this.tableExecutor = res.data.records;
                    this.pageTotalExecutor = res.data.total;
                    this.executorLoading = false;
                }).catch(() => {
                    this.executorLoading = false;
                });
            }
        },
        searchExecutor(form) {
            this.currentPageExecutor = 1;
            this.dialogSearchexeMan = form;
            this.getExecutor();
        },
        resetExecutor(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentExecutor(val) {
            this.dialogSearchexeMan = {};
            this.currentPageExecutor = val;
            this.getExecutor();
        },
        changeSizeExecutor(val) {
            this.pageSizeExecutor = val;
            this.currentPageExecutor = 1;
            this.getExecutor();
        },
        submitFormExecutor() {
            const item = this.tableExecutor.find(v => v.id === this.currentRowKeyExecutor);
            const row = this.dialogFormWork.find(v => v.prop === 'performType');
            switch (this.getPeople) {
                case '报修人':
                    this.dialogFormDown[0].value = item.personnelFullName;
                    break;
                case '发现人':
                    this.dialogFormDown[2].value = item.personnelFullName;
                    break;
                case '派工人':
                    if (row.value === '0') this.dialogFormWork[3].value = item.personnelFullName;
                    else this.dialogFormWork[3].value = item.teamName;
            }
            this.dialogVisibleExecutor = false;
        },
        // 文件上传
        uploadChangeHandler(file, fileList) {
            const newFileList = fileList.map(v => {
                if (v.url) return v;
                const url = v.response
                    && v.response.data
                    && `/devicemanager/faultreport/getfile/${v.response.data.bucketName}-${v.response.data.fileName}`;
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
            // if (file.status === 'success') {
            //     const { url } = file;
            //     // if(!_.isEmpty) {
            //     // }
            //     const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            //     const fileName = url.match(reg);
            //     await this.$http.get(`/devicemanager/faultreport/deleteFile/${String(fileName)}`);
            // }
            this.uploadList = fileList;
            // this.$message.success('删除成功!');
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },

    }
};
</script>

<style lang="stylus" scoped>
.warrBill
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

.dialog_form >>> .expand
    padding 0
.cssSty
    padding-top 18px

.tabs
    .el-tabs
        & >>> .el-tabs__header
            margin 0
            background #ffffff
            .el-tabs__item.is-active
                border-top 2px solid #409EFF

</style>

