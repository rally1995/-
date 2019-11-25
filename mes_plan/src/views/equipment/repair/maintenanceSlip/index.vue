<template lang="pug">
    ebrain-main.pointTask
        ebrain-frame.halfHeight(title="报修单")
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
                    ref="table"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    highlight-current-row
                    @selection-change="hanlderSelect"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize')
        ebrain-frame.halfHeight(title="维修单")
            template(#tools)
                ebrain-tools(:buttons="btnsDown")
                .search(
                    :class="{hide:searchVisibleSon}")
                    ebrain-search(
                        :form="searchFormSon"
                        @search="searchDown"
                        @reset="resetSon")
            template(#table)
                ebrain-box-table(
                    ref="table1"
                    :loading="tableLoadingSon"
                    :pageSize="pageSizeSon"
                    :pageCurrent="currentPageSon"
                    :pageTotal="pageTotalSon"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    highlight-current-row
                    @row-dblclick="editRowDown"
                    @current-change="CurrentChangeDown"
                    @selection-change="hanlderSelectDown"
                    @page-change="ChangeCurrentSon"
                    @size-change="ChangeSizeSon")
        ebrain-dialog.dialog_form(
            :isCancel="false"
            :isShow="false"
            :visible.sync="dialogVisible"
            :submitLoading="submitLoading")
            template(#headline)
                el-tabs(v-model="activeName" type="card"  :before-leave="handlerTabs")
                    el-tab-pane(label="基本信息" name="first" )
                    el-tab-pane(label="配件更换" name="second")
            template(#button)
                ebrain-tools(
                    :buttons="btnsForm"
                    v-if="activeName==='first'")
                ebrain-tools(
                    :buttons="btnsForm2"
                    v-if="activeName==='second'")
            frame-form(
                title="报障信息"
                ref="fram1"
                v-if="activeName==='first'"
                :form.sync="dialogForm")
            frame-form.cssSty(
                ref="fram2"
                title="维修描述"
                v-if="activeName==='first'"
                :form.sync="dialogFormRepair")
            ebrain-box-table.dialog_table(
                ref="dialogTable"
                v-if="activeName==='second'"
                :loading="tableLoadingchild"
                :pageSize="pageSizechild"
                :pageCurrent="currentPagechild"
                :pageTotal="pageTotalchild"
                :data="tableDatachild"
                :column="tableColumnchild"
                row-key="id"
                highlight-current-row
                @selection-change="hanlderSelectChild"
                @page-change="ChangeCurrentchild"
                @size-change="ChangeSizechild")
        ebrain-dialog-table(
                height="50vh"
                :data="tableParts"
                :column="tableColumnParts"
                :tableLoading="partsLoading"
                :visible.sync="dialogVisibleParts"
                :pageSize="pageSizeParts"
                :currentPage="currentPageParts"
                :pageTotal="pageTotalParts"
                :disabled="muliptionDiolog.length === 0"
                :submitLoading="partsSubLoading"
                @select="handlerSelectSon"
                @changeCurrent="changeCurrentParts"
                @changeSize="changeSizeParts"
                @search="searchParts"
                @resetDialog="resetParts"
                dialogTableSearch
                row-key="id"
                :current-row-key.sync="currentRowKeyParts"
                @submit="submitFormParts")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/devicemanager/repairsparepart/exportListByIds?repairNum='+this.rapirCode"
            :params="exportIds"
            :before-export="handlerExport")
</template>
<script>
import dict from '@/utils/dict';
import _ from 'lodash';
import FrameForm from '../FrameForm';
import moment from 'moment';
import { mapState, mapActions } from 'vuex';
import { strip }  from '@/utils';
export default {
    name: '',
    components: {
        FrameForm
    },
    data() {
        return {
            status: '',
            isSubmit: true,
            exportFilename: '',
            dialogVisabledExport: false,
            hasEmpty: false,
            parentDownRow: {},
            exportIds: [],
            searchVisible: true,
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            dialogType: '',
            tableData: [],
            parentRow: {},
            muliption: [],
            muliptionDown: [],
            downRow: {},
            tableColumn: [{
                label: '报修单号',
                prop: 'billCode',
                showOverflowTooltip: true,
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
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['FAILURE_LEVEL'][cell];
                }
            }, {
                label: '派工人',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
            }, {
                label: '派工班组',
                prop: 'executor',
                showOverflowTooltip: true,
            }, {
                label: '派工时间',
                prop: 'dispatchTime',
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
            tableLoadingSon: false,
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            tableDataSon: [],
            childRow: {},
            dialogVisible: false,
            submitLoading: false,
            rapirCode: '',
            activeName: 'first',
            tableLoadingchild: false,
            pageSizechild: 20,
            currentPagechild: 1,
            pageTotalchild: 0,
            tableDatachild: [],
            tableAllRepair: [],
            filterData: true,
            filterData2: true,
            tableColumnchild: [{
                label: '配件编号',
                prop: 'sparePartNum',
                showOverflowTooltip: true,
            }, {
                label: '配件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
                value: '',
                change: (value, prop, row) => this.editTable(value, prop, row),
                editable: true,
            }, {
                label: '单价',
                prop: 'unitPrice',
                showOverflowTooltip: true,
            }, {
                label: '总金额(元)',
                prop: 'momey',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            mulptionChild: [],
            emptyData: [],
            btnsForm: [{
                label: '保存',
                click: () => this.saveDate(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_repair_add',
                loading: false,
            }, {
                label: '返回',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false
            }],
            btnsForm2: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_repairsparepart_add',
                disabled: () => this.addDisabledSon,
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                permi: 'devicemanager_repairsparepart_dels',
                disabled: () => this.delDisabledChild,
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'repair_spare_sart_part_exportListByIds',
                disabled: () => this.ExportDisabled,
            }],
            dialogForm: [{
                label: '维修单号',
                prop: 'repairNum',
                value: '',
                // required: true,
                disabled: true,
            }, {
                label: '报修单号',
                prop: 'faultReportBillCode',
                value: '',
                required: true,
                disabled: true,
            }, {
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
                disabled: true,
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                type: 'select',
                value: '',
                required: true,
                disabled: true,
                option: () => this.storeDict['FAULT_CLASS'],
            }, {
                label: '故障等级',
                prop: 'failureLevel',
                type: 'select',
                value: '',
                required: true,
                disabled: true,
                option: () => this.storeDict['FAILURE_LEVEL'],
            }, {
                label: '单据状态',
                type: 'select',
                prop: 'status',
                value: '',
                option: dict.REPAIR_STATUS,
                required: true,
                disabled: true,
            }, {
                label: '维修人(班组)',
                prop: 'executor',
                value: '',
                disabled: true,
            }, {
                label: '故障描述',
                prop: 'faultRemark',
                type: 'textarea',
                value: '',
                required: true,
                disabled: true,
            }],
            dialogFormRepair: [{
                label: '维修开始时间',
                prop: 'repairStartTime',
                value: '',
                required: true,
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogFormRepair.find(v => v.prop === 'repairEndTime');
                        this.$refs.fram2.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value > lastVal.value) {
                                    callback(new Error('维修开始时间不能大于维修结束时间!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '维修结束时间',
                prop: 'repairEndTime',
                value: '',
                required: true,
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogFormRepair.find(v => v.prop === 'repairStartTime');
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value < lastVal.value) {
                                    callback(new Error('维修结束时间不能小于维修开始时间!'));
                                } else {
                                    callback();
                                    this.$refs.fram2.$refs.form.clearValidate(lastVal.prop);
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '是否停机',
                prop: 'halt',
                value: '',
                type: 'select',
                option: dict.isRaire
            }, {
                label: '是否影响生产',
                prop: 'effect',
                value: '',
                type: 'select',
                option: dict.isRaire,
            }, {
                label: '停机用时(分钟)',
                prop: 'haltTime',
                value: '',
                disabled: true,
            }, {
                label: '停机时间',
                prop: 'stopTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogFormRepair.find(v => v.prop === 'upTime');
                        this.$refs.fram2.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value > lastVal.value) {
                                    callback(new Error('停机时间不能大于开机时间!'));
                                } else {
                                    const remark =  new Date(lastVal['value']).getTime() - new Date(value).getTime();
                                    this.dialogFormRepair[4].value = Math.round(remark / 1000 / 60);
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '开机时间',
                prop: 'upTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogFormRepair.find(v => v.prop === 'stopTime');
                        this.$refs.fram2.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value < lastVal.value) {
                                    callback(new Error('开机时间不能小于停机时间!'));
                                } else {
                                    const remark = new Date(value).getTime() - new Date(lastVal['value']).getTime();
                                    this.dialogFormRepair[4].value = Math.round(remark / 1000 / 60);
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '处理办法',
                prop: 'disposalMeasures',
                value: '',
                required: true,
                type: 'textarea',
            }, {
                label: '维修结果',
                prop: 'repairResult',
                value: '',
                type: 'select',
                option: () => this.storeDict['REPAIR_RESULT'],
                required: true,
            }, {
                label: '维修工时(小时)',
                prop: 'maintenanceWork',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,2})$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负数，且最多保留两位小数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '是否委外',
                prop: 'outsourcing',
                value: '',
                type: 'select',
                option: dict.isRaire,
            }, {
                label: '委外单位',
                prop: 'outsourcingUnit',
                value: '',
            }, {
                label: '委外负责人',
                prop: 'outsourcingCharger',
                value: '',
            }, {
                label: '维修费用(元)',
                prop: 'maintenanceCosts',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,2})$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负数，且最多保留两位小数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }],
            tableColumnSon: [{
                label: '维修单号',
                prop: 'repairNum',
                showOverflowTooltip: true,
            }, {
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                showOverflowTooltip: true
            }, {
                label: '故障等级',
                prop: 'failureLevel',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['FAILURE_LEVEL'][cell];
                }
            }, {
                label: '维修开始时间',
                prop: 'repairStartTime',
                showOverflowTooltip: true
            }, {
                label: '维修结束时间',
                prop: 'repairEndTime',
                showOverflowTooltip: true
            }, {
                label: '维修结果',
                prop: 'repairResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['REPAIR_RESULT'][cell];
                }
            }, {
                label: '单据状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.repair_status[cell];
                }
            }, {
                label: '维修人(班组)',
                prop: 'executor',
                showOverflowTooltip: true
            }],
            searchVisibleSon: true,
            searchForm: [{
                label: '报修单号',
                prop: 'billCode',
                value: '',
            }, {
                label: '状态',
                prop: 'status',
                option: dict.REPAIR_STATUS,
                type: 'select',
                multiple: true,
                value: ['2', '3', '4'],
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: '',
            }, {
                label: '发现人',
                prop: 'discoverer',
                value: '',
            }, {
                label: '报修时间',
                type: 'picker',
                prop: 'repairTime',
                value: '',
            }, {
                label: '派工人',
                prop: 'personnelNumber',
                value: '',
            }],
            btnsTop: [{
                label: '添加维修单',
                click: () => this.newRow(),
                disabled: () => this.addDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_repair_add',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchFormSon: [{
                label: '维修单号',
                prop: 'repairNum',
                value: ''
            }, {
                label: '维修开始时间',
                type: 'picker',
                prop: 'repairStartTime',
                value: '',
            }, {
                label: '维修人(班组)',
                prop: 'executor',
                value: ''
            }, {
                label: '维修结束时间',
                type: 'picker',
                prop: 'repairEndTime',
                value: '',
            }],
            tableParts: [],
            muliptionDiolog: [],
            tableColumnParts: [{
                type: 'selection',
                width: 35,
            }, {
                label: '备件名称',
                prop: 'sparePartName',
                searchBy: true,
                showOverflowTooltip: true
            }, {
                label: '备件编号',
                prop: 'sparePartNum',
                searchBy: true,
                showOverflowTooltip: true
            }],
            partsLoading: false,
            partsSubLoading: false,
            dialogVisibleParts: false,
            dialogSearchParts: {},
            pageSizeParts: 20,
            currentPageParts: 1,
            pageTotalParts: 0,
            currentRowKeyParts: '',
            saveObj: {},
            searchObj: {
                repairStartTime: null,
                repairEndTime: null,
                personnelNumber: null,
            },
            searchDownObj: {
                startTimeBegin: null,
                startTimeEnd: null,
                endTimeBegin: null,
                endTimeEnd: null,
                executor: null,
            },
            conditionList: [],
            conditionListDown: [],
            btnsDown: [{
                label: '修改',
                click: () => this.editRowDown(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'devicemanager_repair_edit',
            }, {
                label: '删除',
                click: () => this.delRowDwon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'devicemanager_repair_dels',
            }, {
                label: '提交',
                click: () => this.submitParent(),
                className: 'iconfont iconstatus-Submission',
                disabled: () => this.submitDisable,
                permi: 'devicemanager_repair_submit',
                loading: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        addDisabled() {
            return this.muliption.length !== 1;
        },
        editDisabled() {
            return this.muliptionDown.length !== 1;
        },
        delDisabled() {
            return this.muliptionDown.length === 0 || this.filterData;
        },
        submitDisable() {
            return this.muliptionDown.length === 0 || this.filterData2;
        },
        addDisabledSon() {
            return this.rapirCode === '' || this.isSubmit;
        },
        delDisabledChild() {
            return this.mulptionChild.length === 0 || this.isSubmit || this.rapirCode === '';
        },
        ExportDisabled() {
            return this.rapirCode === '' || this.tableDatachild.length === 0;
        },
    },
    watch: {
        activeName(val) {
            if (val === 'second') {
                this.getRepair();
                this.mulptionChild = [];
            }
        },
        dialogVisible(val) {
            if (!val) {
                if (this.hasEmpty) {
                    this.$alert('请输入数量', {
                        type: 'warning'
                    });
                    this.dialogVisible = true;
                    return false;
                }
                this.getData();
                // this.getDataSon().then(() => {
                //     this.saveObj = {};
                // });
                this.tableDataSon = [];
                this.activeName = 'first';
                this.rapirCode = '';
                this.tableDatachild = [];
                this.pageSizechild = 20;
                this.currentPagechild = 1;
                this.dialogFormRepair.forEach(v => {
                    if (v.prop === 'haltTime') v.disabled = true;
                    else v.disabled = false;
                    v.value = '';
                });
                this.dialogForm.forEach(v => {
                    v.value = '';
                });
                this.mulptionChild = [];
                this.$refs.dialogTable && this.$refs.dialogTable.clearSelection();
            } else {
                if (!this.hasEmpty) {
                    this.$nextTick(() => {
                        this.$refs.fram2.$refs.form.resetFields();
                    });
                    this.dialogFormRepair.forEach(v => {
                        if (v.prop === 'haltTime') v.disabled = true;
                        else v.disabled = false;
                    });
                }
                this.$refs.dialogTable && this.$refs.dialogTable.clearSelection();

            }
        },
        status(val) {
            if (val === '3' || val === '2') {
                this.dialogFormRepair.forEach(v => {
                    if (v.prop === 'haltTime') v.disabled = true;
                    else v.disabled = false;
                });
                this.isSubmit = false;
            } else {
                this.dialogFormRepair.forEach(v => {
                    if (v.prop === 'haltTime') v.disabled = true;
                    else v.disabled = true;
                });
                this.isSubmit = true;
            }
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '配件更换';
            }
        },
        dialogVisibleParts() {
            this.tableParts = [];
        },
        rapirCode(val) {
            if (val !== '') {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveDate(),
                    disabled: () => this.isSubmit,
                    className: 'iconfont iconstatus-edit',
                    permi: 'devicemanager_repair_edit',
                    loading: false,
                });
            } else {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveDate(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_repair_add',
                    loading: false,
                });
            }
        },
        tableData(data) {
            if (!_.isEmpty(this.parentRow)) {
                this.parentRow = data.find(v => v.id === this.parentRow.id) || {};
            }
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('FAILURE_LEVEL'),
                this.queryDict(`device_classification`),
                this.queryDict('device_position'),
                this.queryDict('REPAIR_RESULT'),
                this.queryDict('work_status'),
                this.queryDict('FAULT_CLASS')]).then(() => {
                this.getData();
                // this.getEmpy();
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.tableDataSon = [];
            this.currentPageSon = 1;
            this.pageTotalSon = 0;
            this.pageSizeSon = 20;
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
                    } else {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'IN',
                            value: '2,3,4',
                        });
                    }
                } else if (v.prop === 'personnelNumber') {
                    this.searchObj.personnelNumber = v.value;
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
                conditionList: [{
                    fieldName: 'status',
                    operation: 'IN',
                    value: '2,3,4',
                }],
                ...this.searchObj,
            };
            if (this.conditionList.length) params.conditionList = [...this.conditionList];
            return this.$http.post(`/devicemanager/faultreport/page`, null, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
                this.$refs.table.setCurrentRow();
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
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = row;
                this.getDataSon();
            }
        },
        newRow() {
            this.dialogVisible = true;
            const item = this.muliption[0];
            this.dialogType = 'new';
            this.dialogForm.forEach(v => {
                if (v.prop !== 'repairNum') v.value = item[v.prop];
                if (v.prop === 'faultReportBillCode') v.value = item.billCode;
            });
            this.rapirCode = this.dialogForm[0].value;
        },
        hanlderSelect(select) {
            this.muliption = select;
            this.muliption.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.muliption, v);
                }
            });
        },
        saveDate() {
            this.$refs.fram1.$refs.form.validate(valid1 => {
                this.$refs.fram2.$refs.form.validate(valid2 => {
                    if (valid1 && valid2) {
                        let obj = {};
                        this.dialogFormRepair.forEach(v => {
                            obj[v.prop] = v.value;
                        });
                        this.dialogForm.forEach(v => {
                            obj[v.prop] = v.value;
                            if (v.prop === 'failureLevel') {
                                let findKey = (value, compare = (a, b) => a === b) => {
                                    return Object.keys(this.storeDict['FAILURE_LEVEL']).find(k => compare(this.storeDict['FAILURE_LEVEL'][k], value));
                                };
                                obj[v.prop] = findKey(v.value);
                            }
                            else { obj[v.prop] = v.value }
                        });
                        obj.repairStartTime = moment(obj.repairStartTime).format('YYYY-MM-DD HH:mm:ss');
                        obj.repairEndTime = moment(obj.repairEndTime).format('YYYY-MM-DD HH:mm:ss');
                        if (!obj.upTime) obj.upTime = '';
                        else obj.upTime = moment(obj.upTime).format('YYYY-MM-DD HH:mm:ss');
                        if (!obj.stopTime) obj.stopTime = '';
                        else obj.stopTime = moment(obj.stopTime).format('YYYY-MM-DD HH:mm:ss');
                        obj.haltTime = Number(obj.haltTime);
                        obj.maintenanceCosts = Number(obj.maintenanceCosts);
                        obj.maintenanceWork = Number(obj.maintenanceWork);
                        this.btnsForm[0].loading = true;
                        if (this.dialogType === 'new') {
                            this.$http.post(`/devicemanager/repair/save`, obj).then(({ data }) => {
                                this.$message.success('新增成功');
                                this.rapirCode = data.repairNum;
                                this.dialogType = 'edit';
                                this.parentRow = data;
                                this.status = data.status;
                                this.dialogForm[0].value = data.repairNum;
                                this.rapirCode = data.repairNum;
                                this.btnsForm[0].loading = false;
                                this.saveObj = data;
                            }).catch(() => {
                                this.btnsForm[0].loading = false;
                            });
                        } else {
                            obj.id = this.editRow['id'];
                            this.$http.put(`/devicemanager/repair/updateById`, obj).then(() => {
                                this.$message.success('修改成功');
                                this.btnsForm[0].loading = false;
                            }).catch(() => {
                                this.btnsForm[0].loading = false;
                            });
                        }
                    }
                });
            });
        },
        // 配件更换操作
        getRepair() {
            if (this.rapirCode === '') return false;
            this.tableLoadingchild = true;
            const params = {
                size: this.pageSizechild,
                current: this.currentPagechild,
                conditionList: [],
            };
            if (this.dialogForm[0].value !== '') {
                params.conditionList.push({
                    fieldName: 'repairNum',
                    operation: 'EQ',
                    value: this.dialogForm[0].value,
                });
            }
            return this.$http.get(`/devicemanager/repairsparepart/page`, {
                params
            }).then(res => {
                this.tableDatachild = res.data.records;
                this.pageTotalchild = res.data.total;
                this.tableLoadingchild = false;
                this.hasEmpty = this.tableDatachild.some(v => v.quantity === null);
                this.tableDatachild.forEach(v => {
                    v.momey = strip(Number(v.quantity) * Number(v.unitPrice));
                });
            }).catch(() => {
                this.tableLoadingchild = false;
            });
        },
        getRepairAll() {
            if (this.rapirCode === '') return false;
            const params = {
                size: 999,
                conditionList: [],
            };
            if (this.dialogForm[0].value !== '') {
                params.conditionList.push({
                    fieldName: 'repairNum',
                    operation: 'EQ',
                    value: this.dialogForm[0].value,
                });
            }
            return this.$http.get(`/devicemanager/repairsparepart/page`, {
                params
            }).then(res => {
                this.tableAllRepair = res.data.records;
            });
        },
        editTable(value, head, row) {
            if (Number(value) <= 0 || isNaN(Number(value))) {
                this.$alert('请输入大于0的数', {
                    type: 'warning',
                });
            } else if (this.status === '0' || this.status === '1') {
                this.$alert('待提交和退回状态才可修改', {
                    type: 'warning',
                });
            } else {
                const obj = Object.assign({}, row);
                obj.quantity = Number(value).toFixed(0);
                delete obj.tenantId;
                obj.quantity = Number(obj.quantity);
                this.$http.put(`/devicemanager/repairsparepart/updateById`, obj).then(() => {
                    this.$message.success('修改数量成功');
                    this.getRepair();
                });
            }

        },
        ChangeCurrentchild(val) {
            this.currentPagechild = val;
            this.getRepair();
        },
        ChangeSizechild(val) {
            this.pageSizechild = val;
            this.currentPagechild = 1;
            this.getRepair();
        },
        delRowSon() {
            const ids = this.mulptionChild.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingchild = true;
                this.$http.delete('/devicemanager/repairsparepart/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.tableLoadingchild = false;
                    this.currentPagechild = 1;
                    this.getRepair().then(() => {
                        this.mulptionChild = [];
                    });
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.table1.clearSelection();
                });
            });
        },
        hanlderSelectChild(selection) {
            this.mulptionChild = selection;
            this.mulptionChild.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.mulptionChild, v);
                }
            });
        },
        exportAll() {
            this.dialogVisabledExport = true;
        },
        handlerExport(dataSetting) {
            // if (!this.exportFilename) {
            //     this.$alert('请输入文件名', {
            //         type: 'warning'
            //     });
            //     return false;
            // }
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.mulptionChild.length) {
                    this.exportIds = this.mulptionChild.map(v => v.id);
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.tableDatachild.map(v => v.id);
            }
        },
        // 获取配件
        handlerSelectSon(selection) {
            this.muliptionDiolog = selection;
        },
        newRowSon() {
            this.dialogSearchParts = {};
            this.dialogVisibleParts = true;
            this.getRepairAll().then(() => {
                this.getParts();
            });
        },
        getParts() {
            this.partsLoading = true;
            const ids = this.tableAllRepair.map(v => v.sparePartNum);
            const params = {
                current: this.currentPageParts,
                size: this.pageSizeParts,
                conditionList: [],
            };
            if (this.dialogSearchParts) {
                for (let i in this.dialogSearchParts) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchParts, i)) {
                        if (this.dialogSearchParts[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                value: this.dialogSearchParts[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.post(`/basicdata/spareparts/getSparePartsPage`, ids, {
                params
            }).then(res => {
                this.tableParts = res.data.records;
                this.pageTotalParts = res.data.total;
                this.partsLoading = false;
            }).catch(() => {
                this.partsLoading = false;
            });
        },
        submitFormParts() {
            this.partsSubLoading = true;
            this.muliptionDiolog.forEach((v, i) => {
                if (v.hasOwnProperty('tenantId')) {
                    delete v.tenantId;
                }
                if (v.hasOwnProperty('id')) {
                    delete v.id;
                }
                v.repairNum = this.dialogForm[0].value;
            });
            this.$http.post(`/devicemanager/repairsparepart/save`, this.muliptionDiolog).then(() => {
                this.$message.success('新增成功');
                this.partsSubLoading = false;
                this.dialogVisibleParts = false;
                this.getRepair();
            }).catch(() => {
                this.partsSubLoading = false;
            });
        },
        searchParts(form) {
            this.currentPageParts = 1;
            this.dialogSearchParts = form;
            this.getParts();
        },
        resetParts(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentParts(val) {
            this.currentPageParts = val;
            this.getParts();
        },
        changeSizeParts(val) {
            this.pageSizeParts = val;
            this.currentPageParts = 1;
            this.getParts();
        },
        searchDown() {
            this.currentPageSon = 1;
            this.conditionListDown = [];
            this.searchFormSon.forEach(v => {
                if (v.prop === 'repairStartTime') {
                    this.searchDownObj.startTimeBegin = v.value ? moment(v.value[0]).format('YYYY-MM-DD HH:mm:ss') : null;
                    this.searchDownObj.startTimeEnd = v.value ? moment(v.value[1]).format('YYYY-MM-DD HH:mm:ss') : null;
                } else if (v.prop === 'repairEndTime') {
                    this.searchDownObj.endTimeBegin = v.value ? moment(v.value[0]).format('YYYY-MM-DD HH:mm:ss') : null;
                    this.searchDownObj.endTimeEnd = v.value ? moment(v.value[1]).format('YYYY-MM-DD HH:mm:ss') : null;
                } else if (v.prop === 'executor') {
                    this.searchDownObj.executor = v.value;
                } else {
                    if (v.value) {
                        this.conditionListDown.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                        });
                    }
                }
            });
            this.getDataSon();
        },
        // 下表操作
        getDataSon() {
            // if (Object.keys(this.parentRow).length === 0) return false;
            this.tableLoadingSon = true;
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: [],
                ...this.searchDownObj,
            };
            params.conditionList = [...this.conditionListDown];
            if (this.parentRow['billCode']) {
                params.conditionList.push({
                    fieldName: 'faultReportBillCode',
                    operation: 'EQ',
                    value: this.parentRow['billCode'],
                });
            } else if (this.parentRow['faultReportBillCode']) {
                params.conditionList.push({
                    fieldName: 'faultReportBillCode',
                    operation: 'EQ',
                    value: this.parentRow['faultReportBillCode'],
                });
            }
            return this.$http.post(`/devicemanager/repair/page`, null, {
                params
            }).then(({ code, data }) => {
                this.tableDataSon = data.records;
                this.pageTotalSon = data.total;
                this.tableLoadingSon = false;
            }).catch(() => {
                this.tableLoadingSon = false;
            });
        },
        resetSon() {
            this.searchFormSon.forEach(item => {
                item.value = '';
            });
            this.conditionListDown = [];
        },
        CurrentChangeSon(row) {
            if (row) this.childRow = row;
        },
        ChangeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        ChangeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        hanlderSelectDown(selection) {
            this.muliptionDown = selection;
            this.muliptionDown.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.muliptionDown, v);
                }
            });
            this.parentDownRow = this.muliptionDown[0];
            this.filterData = this.muliptionDown.some(v => v.status !== '3');
            this.filterData2 = this.muliptionDown.some(v => v.status < 2);
        },
        CurrentChangeDown(row) {
            this.parentDownRow = row;
        },
        editRowDown(row) {
            let newRow = row || { ...this.parentDownRow };
            this.editRow = row || { ...this.parentDownRow }; // 临时添加一个全局变量用于修改时传id值
            this.rapirCode = newRow.repairNum;
            this.dialogType = 'edit';
            this.dialogForm.forEach(v => {
                if (v.prop === 'status') v.value = this.parentRow['status'];
                else v.value = newRow[v.prop];
            });
            this.dialogFormRepair.forEach(v => {
                v.value = newRow[v.prop];
            });
            this.status = newRow.status;
            this.dialogVisible = true;
        },
        delRowDwon() {
            const ids = this.muliptionDown.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.partsLoading = true;
                this.$http.delete('/devicemanager/repair/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.partsLoading = false;
                    this.currentPageSon = 1;
                    this.getDataSon().then(() => {
                        this.muliptionDown = [];
                    });
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.dialogTable.clearSelection();
                });
            });
        },
        // 获取员工信息
        // getEmpy() {
        //     let params = {
        //         size: 999,
        //     };
        //     this.$http.get(`admin/user/page`, {
        //         params
        //     }).then(res => {
        //         this.emptyData = res.data.records;
        //     });
        // },
        submitParent() {
            this.$confirm('确认提交报障人验收？', '提示', {
                type: 'warning',
            }).then(() => {
                this.btnsDown[2].loading = true;
                const ids = this.muliptionDown.map(v => v.id);
                this.$http.post(`/devicemanager/repair/submitById`, ids).then(() => {
                    this.btnsDown[2].loading = false;
                    this.$message.success('提交成功');
                    this.getDataSon();
                    this.getData();
                }).catch(() => {
                    this.btnsDown[2].loading = false;
                });
            });
        },
        handlerTabs() {
            if (this.hasEmpty) {
                this.$alert('请输入数量', {
                    type: 'warning'
                });
                return false;
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.pointTask
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
.dialog_table
    margin-top 10px
    height 50vh
.dialog_form
.cssSty
    padding-top 15px
</style>

