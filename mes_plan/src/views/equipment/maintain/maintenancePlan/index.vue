<template lang="pug">
    ebrain-main.patroplan
        ebrain-frame.halfHeight(:title="$route.name")
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
                    ref="table1"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    :highlight-current-row="isLight"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize'
                    @selection-change="SelectChange"
                    @row-dblclick="rowDblClickHandler")
        ebrain-frame.halfHeight(title="计划明细")
            template(#table)
                ebrain-box-table(
                    :column="undertableColumn"
                    :loading="undertableLoading"
                    :pageSize="underpageSize"
                    :pageCurrent="undercurrentPage"
                    :pageTotal="underpageTotal"
                    :data="undertableData"
                    @page-change="ChangeCurrentSon"
                    @size-change="ChangeSizeSon"
                    @selection-change="SelectChangeSon"
                    highlight-current-row)
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            top="6vh"
            :expandVisible="collapse"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#stytype="{value}")
                el-col(:span="12")
                     el-form-item(label-width="110px" label="执行类型" :required="true" prop="execType")
                        el-radio-group(v-model="dialogForm[2].value" @change="changeExe")
                            el-radio(label="0" :disabled="isEdit") 员工
                            el-radio(label="1" :disabled="isEdit") 班组
            template(#way)
                el-col(:span="12")
                     el-form-item(label-width="110px" label="循环方式" :required="true" prop="cycleMethod")
                        el-radio-group(v-model="dialogForm[4].value" @change="cyclicMode")
                            el-radio(label="0" :disabled="isEdit") 单次
                            el-radio(label="1" :disabled="isEdit") 多次
            template(#exeMan="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="执行人(班组)" :required="true" prop="exe")
                            el-input(style="cursor:pointer" :value="value" :readonly="true" :disabled="isEdit")
                                el-button(slot="append" :disabled="isEdit"   @click="dialogSearchexeMan={};openexeMan()"  icon="iconfont iconsearch")
            template(#headline)
                ebrain-frame(title="维保计划")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="维保设备清单")
                template(#tools)
                    ebrain-tools(:buttons="btnsDown")
                template(#table)
                    ebrain-box-table(
                        ref="tableBoxDailog"
                        @current-change="curChangeSon"
                        :loading="undertableLoading"
                        :pageSize="underpageSize"
                        :pageCurrent="undercurrentPage"
                        :pageTotal="underpageTotal"
                        :data="undertableData"
                        @page-change="ChangeCurrentSon"
                        @size-change="ChangeSizeSon"
                        :column="undertableColumn"
                        @selection-change="SelectChangeSon"
                        highlight-current-row)
        ebrain-dialog(
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitDataSon")
            template(#equipCode="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="设备编号" :required="true" prop="deviceCode")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="dialogSearchEquip={};openEquip()"  icon="iconfont iconsearch")
            template(#patrol="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="维保方案" :required="true" prop="programName")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="dialogSearchPatrol={};openPatrol()"  icon="iconfont iconsearch")
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
        ebrain-dialog-table(
            height="50vh"
            :data="tablePatrol"
            :column="tableColumnPatrol"
            :tableLoading="patrolLoading"
            :visible.sync="dialogVisiblePatrol"
            :pageSize="pageSizePatrol"
            :currentPage="currentPagePatrol"
            :pageTotal="pageTotalPatrol"
            :disabled="!currentRowKeyPatrol"
            @changeCurrent="changeCurrentPatrol"
            @changeSize="changeSizePatrol"
            row-key="id"
            @search="searchPatrol"
            @resetDialog="resetPatrol"
            dialogTableSearch
            :current-row-key.sync="currentRowKeyPatrol"
            @submit="submitFormPatrol")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/devicemanager/equiprepairplandet/exportAll/'+planCode"
            :params="exportIds"
            :before-export="handlerExport")

</template>
<script>
import moment from 'moment';
import dict from '@/utils/dict';
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
export default {
    name: 'patroplan',
    data() {
        return {
            exportFilename: ' ',
            planCode: '',
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_equiprepairplan_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'devicemanager_equiprepairplan_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'devicemanager_equiprepairplan_dels',
            }, {
                label: '启用',
                click: () => this.start(),
                className: 'iconfont iconstatus-start-up',
                disabled: () => this.startDisabled,
                permi: 'devicemanager_equiprepairplan_start',
            }, {
                label: '停用',
                click: () => this.stop(),
                className: 'iconfont iconState-Stop',
                disabled: () => this.stopDisabled,
                permi: 'devicemanager_equiprepairplan_stop',
            }, {
                label: '复制',
                click: () => this.copy(),
                className: 'iconfont iconstatus-copy',
                disabled: () => this.editDisabled,
                permi: 'devicemanager_equiprepairplan_copy',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchVisible: true,
            searchForm: [{
                label: '计划名称',
                prop: 'planName',
                value: ''
            }],
            tableLoading: false,
            dialogVisabledExport: false,
            fieldName: '',
            exportIds: [],
            isLight: false,
            selection: '',
            pageTotal: 0,
            changeVal: '',
            pageSize: 20,
            currentPage: 1,
            parentRow: {},
            tableData: [],
            dialogType: '',
            palnStatus: '',
            isOperat: true,
            tableColumn: [{
                label: '计划编号',
                prop: 'planCode',
                showOverflowTooltip: true
            }, {
                label: '计划名称',
                prop: 'planName',
                showOverflowTooltip: true
            }, {
                label: '执行类型',
                prop: 'execType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.planExecType[cell];
                }
            }, {
                label: '执行人(班组)',
                prop: 'exe',
                showOverflowTooltip: true,
                formatter: (row, column, cell, index) => {
                    const exeTypeType = {
                        0: 'executive',
                        1: 'execGroup'
                    };
                    return row[exeTypeType[row.execType]];
                },
            }, {
                label: '开始时间',
                prop: 'startTime',
                showOverflowTooltip: true
            }, {
                label: '结束时间',
                prop: 'endTime',
                showOverflowTooltip: true
            }, {
                label: '循环周期',
                prop: 'cycleLoop',
                showOverflowTooltip: true
            }, {
                label: '周期类型',
                prop: 'cycleType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['PERIODIC_TYPE'][cell];
                },
            }, {
                label: '编制人',
                prop: 'createBy',
                showOverflowTooltip: true
            }, {
                label: '编制时间',
                prop: 'createTime',
                showOverflowTooltip: true
            }, {
                label: '计划状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.Palnstatus[cell];
                }
            }],
            // 下表
            undertableLoading: false,
            underpageSize: 20,
            undercurrentPage: 1,
            underpageTotal: 0,
            undertableData: [],
            rowDataSon: {},
            btnsForm: [{
                label: '保存',
                click: () => this.saveDate(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_equiprepairplan_add',
                loading: false,
            }, {
                label: '返回',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false
            }],
            undertableColumn: [{
                label: '维保路线',
                prop: 'repairRouteName',
                showOverflowTooltip: true
            }, {
                label: '设备编号',
                prop: 'deviceCode',
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'deviceName',
                showOverflowTooltip: true
            }, {
                label: '设备类型',
                prop: 'deviceType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '规格型号',
                prop: 'specification',
                showOverflowTooltip: true
            }, {
                label: '维保方案',
                prop: 'programName',
                showOverflowTooltip: true,
            }, {
                label: '维保频次',
                prop: 'frequency',
                showOverflowTooltip: true
            }],
            dialogVisible: false,
            collapse: false,
            CrtNo: '',
            selecSon: [],
            btnsDown: [{
                label: '添加',
                click: () => this.newRowSon(),
                disabled: () => this.addDisabledSon,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_equiprepairprogram_confirm',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledSon,
                permi: 'devicemanager_equiprepairplandet_dels',
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                disabled: () => this.exportDisabled,
                permi: 'devicemanager_equiprepairplandet_exportAll',
            }],
            dialogForm: [{
                label: '计划编号',
                prop: 'planCode',
                value: '',
                // required: true,
                disabled: true,
            }, {
                label: '计划名称',
                prop: 'planName',
                value: '',
                required: true,
            }, {
                label: '执行类型',
                prop: 'execType',
                value: '',
                slot: 'stytype',
                required: true,
            }, {
                label: '执行人(班组)',
                prop: 'exe',
                value: '',
                slot: 'exeMan',
                required: true,
            }, {
                label: '循环方式',
                prop: 'cycleMethod',
                value: '',
                required: true,
                slot: 'way',
            }, {
                label: '开始时间',
                prop: 'startTime',
                value: '',
                type: 'datetime',
                required: true,
                change: () => this.computedNextTime(),
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogForm.find(v => v.prop === 'endTime');
                        this.$refs.dialog.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value > lastVal.value) {
                                    callback(new Error('开始时间不能大于结束时间!'));
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
                label: '结束时间',
                prop: 'endTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogForm.find(v => v.prop === 'startTime');
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value < lastVal.value) {
                                    callback(new Error('结束时间不能小于开始时间!'));
                                } else {
                                    callback();
                                    this.$refs.dialog.$refs.form.clearValidate(lastVal.prop);
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '周期类型',
                prop: 'cycleType',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['PERIODIC_TYPE'],
                change: () => this.computedNextTime(),
            }, {
                label: '下次执行时间',
                prop: 'nextExecTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '维保频次',
                prop: 'frequency',
                value: '',
                disabled: false,
                rule: {
                    validator: (rule, value, callback) => {
                        const reg = /^\d+?$/;
                        if (!value) {
                            callback();
                        }
                        else {
                            if (!reg.test(value)) {
                                this.dialogForm[9].value = Math.round(value);
                                callback();
                            } else {
                                callback();
                            }
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '循环周期',
                prop: 'cycleLoop',
                value: '',
                required: true,
                disabled: false,
                change: () => this.computedNextTime(),
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
                label: '设备数量',
                prop: 'deviceNumber',
                value: '',
                disabled: true,
            }, {
                label: '计划状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.Palnstatus,
                disabled: true,

            }, {
                label: '创建人',
                prop: 'createBy',
                value: '',
                disabled: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                disabled: true,
            }, {
                label: '维护人员',
                prop: 'updateBy',
                value: '',
                disabled: true,
            }, {
                label: '维护时间',
                prop: 'updateTime',
                value: '',
                disabled: true,
                type: 'datetime',
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            dialogVisibleSon: false,
            programeCode: '',
            dialogFormSon: [{
                label: '设备编号',
                prop: 'deviceCode',
                value: '',
                required: true,
                slot: 'equipCode',
            }, {
                label: '设备名称',
                prop: 'deviceName',
                value: '',
                disabled: true,
            }, {
                label: '设备类型',
                prop: 'deviceType',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_classification'],
                disabled: true,
            }, {
                label: '规格型号',
                prop: 'specification',
                value: '',
                disabled: true,
            }, {
                label: '维保方案',
                prop: 'programName',
                value: '',
                required: true,
                slot: 'patrol',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^[1-9]\d*$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('只能输入正整数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '维保路线',
                prop: 'repairRouteName',
                value: '',
                required: true
            }],
            dialogSearchEquip: {},
            dialogSearchPatrol: {},
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
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true
            }],
            tablePatrol: [],
            isChoose: true,
            patrolLoading: false,
            dialogVisiblePatrol: false,
            pageSizePatrol: 20,
            currentPagePatrol: 1,
            pageTotalPatrol: 0,
            currentRowKeyPatrol: '',
            dialogSearchexeMan: {},
            submitId: '',
            conditionList: [],
            tableColumnPatrol: [{
                label: '方案编码',
                prop: 'programCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '方案名称',
                prop: 'programName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '维保分类',
                prop: 'repairType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['maintenance'][cell];
                },
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.Palnstatus[cell];
                }
            }, {
                label: '维护人员',
                prop: 'updateBy',
                showOverflowTooltip: true
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }],
            isEdit: false,
            tableExecutor: [],
            executorLoading: false,
            dialogVisibleExecutor: false,
            pageSizeExecutor: 20,
            currentPageExecutor: 1,
            pageTotalExecutor: 0,
            currentRowKeyExecutor: '',
            filterData: true,
            filterData1: true,
            filterData2: true,
            conditionListDown: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        tableColumnExecutor() {
            const row = this.dialogForm.find(v => v.prop === 'execType');
            let arr = [];
            if (row.value === '0') {
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
            return this.selection.length !== 1;
        },
        delDisabled() {
            return this.selection.length === 0 || !this.filterData;
        },
        startDisabled() {
            return this.selection.length !== 1 || this.filterData1;
        },
        stopDisabled() {
            return this.selection.length !== 1 || this.filterData2;
        },
        addDisabledSon() {
            return this.isOperat || this.isEdit;
        },
        exportDisabled() {
            return this.isOperat || this.undertableData.length === 0;
        },
        delDisabledSon() {
            return this.selecSon.length === 0 || this.isOperat || this.isEdit;
        }
    },
    watch: {
        tablePatrol(val) {
            if (this.dialogVisiblePatrol) {
                if (!val.length) {
                    this.$alert('该设备不存在巡检方案', {
                        type: 'warning'
                    });
                }
            }
        },
        changeVal(val) {
            if (val === '0') this.dialogForm[10].required = false;
            else if (val === '1') this.dialogForm[10].required = true;
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '维保设备清单明细';
            }
        },
        underpageTotal(val) {
            this.dialogForm[11].value = val;
        },
        dialogVisible(val) {
            if (!val) {
                this.undercurrentPage = 1;
                this.underpageSize = 20;
                this.underpageTotal = 0;
                this.undertableData = [];
                this.getData().then(() => {
                    this.getDataSon();
                });
                this.dialogType = '';
                this.selecSon = [];
                this.$refs.tableBoxDailog.clearSelection();
            } else {
                this.undercurrentPage = 1;
                this.underpageSize = 20;
                if (this.dialogType === 'new') {
                    this.underpageTotal = 0;
                    this.undertableData = [];
                } else {
                    this.getDataSon();
                }
            }
        },
        dialogVisibleSon(val) {
            if (!val) this.isChoose = true;
        },
        dialogVisibleExecutor(val) {
            if (!val) {
                this.currentPageExecutor = 1;
                this.pageSizeExecutor = 20;
                this.currentRowKeyExecutor = '';
            }
        },
        dialogVisibleEquip(val) {
            if (!val) {
                this.currentPageEquip = 1;
                this.pageSizeEquip = 20;
                this.currentRowKeyEquip = '';
            }
        },
        dialogVisiblePatrol(val) {
            if (!val) {
                this.currentPagePatrol = 1;
                this.pageSizeExecutor = 20;
                this.currentRowKeyPatrol = '';
                this.tablePatrol = [];
            }
        },
        dialogType(val) {
            if (val === 'edit') {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveDate(),
                    className: 'iconfont iconstatus-edit',
                    disabled: this.isEdit,
                    permi: 'devicemanager_equiprepairplan_edit',
                    loading: false,
                });
            } else if (val === 'new') {
                this.$set(this.btnsForm, 0, {
                    label: '保存',
                    click: () => this.saveDate(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_equiprepairplan_add',
                    loading: false,
                });
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('PERIODIC_TYPE'),
            this.queryDict(`device_classification`),
            this.queryDict(`maintenance`),
        ]).then(() => {
            this.getData();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        search() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getData();
            this.undertableData = [];
            this.underpageTotal = 0;
            this.underpageSize = 20;
            this.undercurrentPage = 1;
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            return this.$http.get(`/devicemanager/equiprepairplan/page`, {
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
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        CurrentChange(row) {
            if (row) this.parentRow = row;
            this.isLight = true;
            this.getDataSon();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        newRow() {
            this.dialogVisible = true;
            this.dialogType = 'new';
            this.isOperat = true;
            this.dialogForm[2].value = '0';
            this.dialogForm[4].value = '1';
            this.dialogForm[7].value = '0';
            this.dialogForm[12].value = '0';
            this.isLight = false;
            this.parentRow = {};
            this.isEdit = false;
            this.dialogForm.forEach(v => {
                if (v.prop === 'planCode' || v.prop === 'status' || v.prop === 'deviceNumber'
                 || v.prop === 'createBy' || v.prop === 'createTime' || v.prop === 'updateBy'
                 || v.prop === 'nextExecTime' || v.prop === 'updateTime') { v.disabled = true }
                else { v.disabled = false }
            });
        },
        editRow(row) {
            this.parentRow = row || { ...this.parentRow };
            const exeTypeType = {
                0: 'executive',
                1: 'execGroup'
            };
            this.isOperat = false;
            this.dialogType = 'edit';
            this.dialogVisible = true;
            this.submitId = this.parentRow.id;
            this.changeVal = this.parentRow.cycleMethod;
            this.palnStatus = this.parentRow.status;
            this.dialogForm.forEach(v => {
                if (v.prop === 'exe') v.value = this.parentRow[exeTypeType[this.parentRow['execType']]];
                else if (v.prop !== 'deviceNumber') v.value = this.parentRow[v.prop];
            });
            if (this.parentRow['status'] !== '0') {
                this.isEdit = true;
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                    // if (v.prop === 'planCode' || v.prop === 'status' || v.prop === 'deviceNumber'
                    // || v.prop === 'createBy' || v.prop === 'createTime' || v.prop === 'nextExecTime'
                    // || v.prop === 'updateBy' || v.prop === 'updateTime') {
                    //     v.disabled = true;
                    // }
                    // else {
                    //     v.disabled = true;
                    // }
                });
            } else {
                this.dialogForm.forEach(v => {
                    if (v.prop === 'planCode' || v.prop === 'status' || v.prop === 'deviceNumber'
                    || v.prop === 'createBy' || v.prop === 'createTime' || v.prop === 'updateBy'
                    || v.prop === 'updateTime' || v.prop === 'nextExecTime') {
                        v.disabled = true;
                    } else if (v.prop === 'frequency' || v.prop === 'cycleLoop') {
                        if (this.changeVal === '1') {
                            v.disabled = false;
                        } else {
                            v.disabled = true;
                        }
                    } else {
                        v.disabled = false; }
                });
                this.isEdit = false;
            }
        },
        delRow() {
            const ids = this.selection.map(v => v.id);
            const palnCode = this.selection.map(v => v.planCode);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/equiprepairplan/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData().then(() => {
                        this.selection = [];
                    });
                    this.getDataSon();
                    this.$message({
                        message: `计划编号${palnCode}已被删除成功`,
                        type: 'success'
                    });
                    this.$refs.table1.clearSelection();
                });
            });
        },
        start() {
            const ids = this.selection.map(v => v.id);
            const startUp = () => {
                this.$http.put(`/devicemanager/equiprepairplan/startEquipRepairPlan`, ids).then(() => {
                    this.$message.success('启用成功');
                    this.getData();
                });
            };
            if ((new Date()).getTime() > (new Date(this.selection[0]['startTime'])).getTime()) {
                this.$confirm('启动失败，启动的时间不能大于开始的时间，请确认修改!', {
                    type: 'warning'
                }).then(() => {
                    this.editRow();
                });
            } else {
                startUp();
            }

        },
        stop() {
            const ids = this.selection.map(v => v.id);
            this.$http.post(`/devicemanager/equiprepairplan/stopEquipRepairPlan`, ids).then(() => {
                this.$message.success('停用成功');
                this.getData();
            });
        },
        copy() {
            const ids = this.selection.map(v => v.id);
            this.$http.post(`/devicemanager/equiprepairplan/copyPlan/${ids}`).then(() => {
                this.$message.success('复制成功');
                this.getData();
            });
        },
        saveDate() {
            this.$refs.dialog.$refs.form.validate(valid => {
                if (valid) {
                    let obj = {};
                    const exeTypeType = {
                        0: 'executive',
                        1: 'execGroup'
                    };
                    this.dialogForm.forEach(v => {
                        if (v.prop === 'exe') {
                            obj[exeTypeType[this.dialogForm[2].value]] = v.value;
                        } else {
                            obj[v.prop] = v.value;
                        }
                    });
                    this.$nextTick(() => {
                        this.btnsForm[0].loading = true;
                    });
                    this.btnsForm[0].loading = true;
                    obj.startTime = moment(obj.startTime).format('YYYY-MM-DD HH:mm:ss');
                    if (!obj.endTime) obj.endTime = '';
                    else obj.endTime = moment(obj.endTime).format('YYYY-MM-DD HH:mm:ss');
                    if (!obj.nextExecTime) obj.nextExecTime = '';
                    else obj.nextExecTime = moment(obj.nextExecTime).format('YYYY-MM-DD HH:mm:ss');
                    // obj.cycleNum = Number(obj.cycleLoop);
                    if (obj.cycleLoop) obj.cycleLoop = Number(obj.cycleLoop);
                    obj.deviceNumber = Number(obj.deviceNumber);
                    obj.frequency = Number(obj.frequency);
                    if (this.dialogType === 'new') {
                        delete obj.planCode;
                        this.$http.post(`/devicemanager/equiprepairplan/save`, obj).then(({ code, data }) => {
                            this.$message.success('新增成功');
                            this.dialogForm.forEach(v => {
                                if (v.prop === 'exe') v.value = data[exeTypeType[data['execType']]];
                                else v.value = data[v.prop];
                            });
                            this.isOperat = false;
                            this.dialogType = 'edit';
                            this.btnsForm[0].loading = false;
                            this.submitId = data.id;
                            this.palnStatus = data.status;
                            this.parentRow = data;

                        }).catch(() => {
                            this.btnsForm[0].loading = false;
                        });
                    } else {
                        obj.id = this.submitId;
                        if (this.palnStatus !== '0') {
                            this.$alert('非草稿状态不能修改', {
                                type: 'warning',
                            });
                        } else {
                            this.$http.put(`/devicemanager/equiprepairplan/updateById`, obj).then(() => {
                                this.$message.success('修改成功');
                                this.btnsForm[0].loading = false;
                            }).catch(v => {});
                            this.btnsForm[0].loading = false;
                        }
                    }
                }
            });
        },
        SelectChange(selection) {
            this.selection = selection;
            this.selection.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.selection, v);
                }
            });
            if (selection.length) this.parentRow = this.selection[0];
            this.filterData = this.selection.every(v => v.status === '0');
            this.filterData1 = this.selection.some(v => v.status === '1' || v.status === '3');
            this.filterData2 = this.selection.some(v => v.status !== '1');
        },
        searchDown() {
            this.currentPageSon = 1;
            this.conditionListDown = this.searchFormSon.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getDataSon();
        },
        // 下表
        getDataSon() {
            if (Object.keys(this.parentRow).length !== 0) {
                this.undertableLoading = true;
                this.conditionListDown.push({
                    fieldName: 'planCode',
                    operation: 'EQ',
                    value: this.parentRow['planCode'],
                });
                const params = {
                    current: this.undercurrentPage,
                    size: this.underpageSize,
                    conditionList: this.conditionListDown,
                };
                this.$http.get(`/devicemanager/equiprepairplandet/page`, {
                    params
                }).then(({ code, data }) => {
                    this.undertableData = data.records;
                    this.underpageTotal = data.total;
                    this.undertableLoading = false;
                }).catch(() => {
                    this.undertableLoading = false;
                }).finally(() => {
                    this.conditionListDown = [];
                });
            }
        },
        ChangeCurrentSon(val) {
            this.undercurrentPage = val;
            this.getDataSon();
        },
        ChangeSizeSon(val) {
            this.underpageSize = val;
            this.undercurrentPage = 1;
            this.getDataSon();
        },
        curChangeSon(row) {
            this.rowDataSon = row;
        },
        // 获取执行人或班组
        openexeMan() {
            this.dialogVisibleExecutor = true;
            this.getExecutor();
        },
        getExecutor() {
            this.executorLoading = true;
            const row = this.dialogForm.find(v => v.prop === 'execType');
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
            if (row.value === '0') {
                params.conditionList.push({
                    fieldName: 'whetherPersonnel',
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
            const row = this.dialogForm.find(v => v.prop === 'execType');
            if (row.value === '0') this.dialogForm[3].value = item.personnelFullName;
            else this.dialogForm[3].value = item.teamName;
            this.dialogVisibleExecutor = false;
        },
        changeExe() {
            this.dialogForm[3].value = '';
            this.$refs.dialog.$refs.form.clearValidate('exe');
        },
        cyclicMode(value) {
            this.changeVal = value;
            this.dialogForm[9].value = '';
            this.dialogForm[10].value = '';
            if (value === '1') {
                this.dialogForm[9].disabled = false;
                this.dialogForm[10].disabled = false;
                this.dialogForm[10].required = true;
            } else if (value === '0') {
                this.dialogForm[9].disabled = true;
                this.dialogForm[10].disabled = true;
                this.dialogForm[10].required = false;
            }
            // this.$refs.dialog.$refs.form.clearValidate('cycleNum');
            this.$refs.dialog.$refs.form.clearValidate('cycleLoop');
            this.dialogForm[8].value = '';
        },
        submitDataSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.planCode = this.dialogForm[0].value;
            obj.programCode = this.programeCode;
            this.$http.post(`/devicemanager/equiprepairplandet/confirmEquipProgram/${obj.planCode}`, obj).then(res => {
                this.$message.success('新增成功');
                this.dialogVisibleSon = false;
                this.getDataSon();
            });
        },
        newRowSon() {
            this.dialogVisibleSon = true;
        },
        delRowSon() {
            const ids = this.selecSon.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/equiprepairplandet/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.undercurrentPage = 1;
                    this.getDataSon().then(() => {
                        this.selecSon = [];
                    });
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.tableBoxDailog.clearSelection();
                });
            });
        },
        SelectChangeSon(selection) {
            this.selecSon = selection;
        },
        exportAll() {
            this.dialogVisabledExport = true;
            this.planCode = this.parentRow['planCode'];
        },
        openEquip() {
            this.dialogVisibleEquip = true;
            this.getEquip();
        },
        getEquip() {
            this.dialogFormSon[4].value = '';
            this.equipLoading = true;
            const params = {
                current: this.currentPageEquip,
                size: this.pageSizeEquip,
                conditionList: [],
                // conditionList: [{
                //     fieldName: 'assetStatus',
                //     operation: 'IN',
                //     value: '1,2,3'
                // }],
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
            this.$http.get(`/devicemanager/equiprepairplan/getDeviceEquipmentAccountPage/${this.parentRow['planCode']}`, {
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
            this.dialogFormSon[0].value = row.equipNum;
            this.dialogFormSon[1].value = row.equipName;
            this.dialogFormSon[2].value = row.equipType;
            this.dialogFormSon[3].value = row.specModel;
            this.dialogVisibleEquip = false;
            this.isChoose = false;
            this.CrtNo = row.id;
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
        // 设置维保方案
        openPatrol() {
            this.dialogVisiblePatrol = true;
            this.getPatrol();
        },
        getPatrol() {
            this.patrolLoading = true;
            const equipNum = this.dialogFormSon[0].value;
            const params = {
                size: this.pageSizePatrol,
                current: this.currentPagePatrol,
                conditionList: [{
                    fieldName: 'status',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: '1',
                }, {
                    fieldName: 'planCode',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: this.parentRow['planCode'],
                }],
            };
            if (this.dialogSearchPatrol) {
                for (let i in this.dialogSearchPatrol) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchPatrol, i)) {
                        if (this.dialogSearchPatrol[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                value: this.dialogSearchPatrol[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/devicemanager/repairprogram/getPageByEquipNum/${equipNum}`, {
                params
            }).then(res => {
                if (res.data === null) this.tablePatrol = [];
                else this.tablePatrol = res.data.records;
                this.pageTotalPatrol = res.data.total;
                this.patrolLoading = false;
            }).catch(() => {
                this.patrolLoading = false;
            });
        },
        searchPatrol(form) {
            this.currentPagePatrol = 1;
            this.dialogSearchPatrol = form;
            this.getPatrol();
        },
        resetPatrol(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentPatrol(val) {
            this.dialogVisiblePatrol = {};
            this.currentPagePatrol = val;
            this.getPatrol();
        },
        changeSizePatrol(val) {
            this.pageSizePatrol = val;
            this.currentPagePatrol = 1;
            this.getPatrol();
        },
        submitFormPatrol() {
            const item = this.tablePatrol.find(v => v.id === this.currentRowKeyPatrol);
            this.dialogFormSon[4].value = item.programName;
            this.programeCode = item.programCode;
            this.dialogVisiblePatrol = false;
        },
        computedNextTime() {
            // 0:时，2:周，1:天，3:月
            let startTime = this.dialogForm[5].value;
            if (startTime) startTime = new Date(startTime);
            const cycleType = this.dialogForm[7].value;
            let cycleNum = this.dialogForm[10].value;
            if (cycleNum) cycleNum = Number(cycleNum);
            if (this.dialogForm[4].value === '0') cycleNum = 1;

            if (startTime && cycleType && cycleNum) {
                const startTimeMonth = startTime.getMonth();
                const startTimeDate = startTime.getDate();
                const startTimeHours = startTime.getHours();
                switch (cycleType) {
                    case '0':
                        startTime.setHours(startTimeHours + cycleNum);
                        break;
                    case '2':
                        startTime.setDate(startTimeDate + cycleNum * 7);
                        break;
                    case '1':
                        startTime.setDate(startTimeDate + cycleNum);
                        break;
                    case '3':
                        startTime.setMonth(startTimeMonth + cycleNum);
                }
                this.dialogForm[8].value = startTime;
            }
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
                if (this.selecSon.length) {
                    this.exportIds = this.selecSon.map(v => v.id);
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.undertableData.map(v => v.id);
            }
        },
        rowDblClickHandler(row, column, e) {
            this.editRow(row);
        }
    }
};
</script>

<style lang="stylus" scoped>
.patroplan
  & >>> .fr
    float right;
.search
  padding 14px 10px;
  background #f5f5f5;
  overflow hidden;
  box-sizing border-box;
  transition-duration 0.2s;
  height 57px;

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
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)

.dialog >>>
    .table
        height 300px
        .el-table__body-wrapper
            height 120px
            overflow-y auto
    .table-list
        .el-form-item
            display: inline-block!important
        .el-form-item__content
             width auto!important
</style>

