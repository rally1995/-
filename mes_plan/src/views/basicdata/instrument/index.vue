<template lang="pug">
    ebrain-main.equitestorder
        ebrain-frame(
            title="计量器具台账管理")
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
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change="changeSize"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="selectionChange"
                    :highlight-current-row="false")
        ebrain-dialog(
            ref="form"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
            template(#departmentName)
                el-col(:span="12")
                    el-form-item(label="部门科室" prop="departmentName" required)
                        el-input(readonly=true v-model="dialogFormParent[13].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('departmentName')")
            template(#partTimeMeterName)
                el-col(:span="12")
                    el-form-item(label="兼职计量员" prop="partTimeMeterName" required)
                        el-input(readonly=true v-model="dialogFormParent[15].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('partTimeMeterName')")
            template(#usedName)
                el-col(:span="12")
                    el-form-item(label="使用人" prop="usedName" required)
                        el-input(readonly=true v-model="dialogFormParent[16].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('usedName')")
        ebrain-dialog-table(
            :dialogTableSearch="type!=='departmentName'"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :isShow="isShow"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="dialogColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialog(type)")
        ebrain-dialog-export(
            :visible.sync="exportVisible"
            v-model="exportFilename"
            accept="xls,xlsx"
            export-url="/qc/dicqcmeasurtoolsaccount/export"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-dialog-import(
            ref="import"
            :visible.sync="importVisible"
            accept="xls,xlsx"
            download-url="/qc/dicqcmeasurtoolsaccount/template"
            import-url="/qc/dicqcmeasurtoolsaccount/import"
            download-filename="计量器具台账模板.xlsx"
            :import-success="importSuccessHandler")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
import EbrainDialogExport from '@/components/EbrainDialogExport';
import EbrainDialogImport from '@/components/EbrainDialogImport';
export default {
    name: 'equiscraporder',
    components: {
        EbrainDialogTable,
        EbrainDialogExport,
        EbrainDialogImport,
    },
    data() {
        return {
            departmentNameOpertion: {},
            latestCalibDateEnd: '',
            latestCalibDateStart: '',
            partTimeMeter: '',
            used: '',
            department: false,
            isShow: true,
            dialogColumn: [],
            conditionList: [],
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
            departmentNameColumn: [{
                label: '部门编码',
                prop: 'deptCode',
                showOverflowTooltip: true,
            }, {
                label: '部门名称',
                prop: 'deptName',
                showOverflowTooltip: true,
            }],
            partTimeMeterColumn: [{
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
            tableColumnParent: [{
                label: '器具状态',
                prop: 'measurStatus',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.measurStatus[cell];
                }
            }, {
                label: '计量器具类别',
                prop: 'measurType',
                showOverflowTooltip: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'amount',
                showOverflowTooltip: true,
            }, {
                label: '精度',
                prop: 'precision',
                showOverflowTooltip: true,
            }, {
                label: '出场编号',
                prop: 'serialNum',
                showOverflowTooltip: true,
            }, {
                label: '厂家',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '到货日期',
                prop: 'arrivalDate',
                showOverflowTooltip: true,
            }, {
                label: '是否校准',
                prop: 'isCalib',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.isCalib[cell];
                }
            }, {
                label: '检验周期(月)',
                prop: 'inspCycle',
                showOverflowTooltip: true,
            }, {
                label: '最新校准日期',
                prop: 'latestCalibDate',
                showOverflowTooltip: true,
            }, {
                label: '证书编号',
                prop: 'certifNo',
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
            }, {
                label: '使用人',
                prop: 'usedName',
                showOverflowTooltip: true,
            }, {
                label: '维护人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '创建日期',
                prop: 'createTime',
                showOverflowTooltip: true,
            }, {
                label: '修改日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '器具状态',
                prop: 'measurStatus',
                value: '',
                type: 'select',
                required: true,
                option: dict.measurStatus,
            }, {
                label: '计量器具类别',
                prop: 'measurType',
                value: '',
                required: true,
            }, {
                label: '内部编码',
                prop: 'intCode',
                value: '',
                required: true,
            }, {
                label: '规格型号',
                prop: 'spec',
                value: '',
                required: true,
            }, {
                label: '数量',
                prop: 'amount',
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
                label: '精度',
                prop: 'precision',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,3})$/;
                        if (value !== '') {
                            if (typeof (value) !== 'object') {
                                if (!reg.test(value) || !Number(value)) {
                                    callback(new Error('请输入零到一千万之间的三位小数或空'));
                                } else {
                                    if (Number(value) > 10000000) {
                                        callback(new Error('请输入零到一千万之间的三位小数或空'));
                                    } else {
                                        callback();
                                    }
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
            }, {
                label: '出场编号',
                prop: 'serialNum',
                value: '',
            }, {
                label: '厂家',
                prop: 'factory',
                value: '',
            }, {
                label: '到货日期',
                prop: 'arrivalDate',
                value: '',
                required: true,
                type: 'datetime',
            }, {
                label: '是否校准',
                prop: 'isCalib',
                value: '',
                required: true,
                type: 'select',
                option: dict.isCalib,
            }, {
                label: '检验周期(月)',
                prop: 'inspCycle',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        // let reg =  /^[1-9]\d*$/;
                        // if (!value) callback();
                        if (value) {
                            if (Number(value) && Number(value) <= 1200) {
                                callback();
                            } else {
                                callback(new Error('请输入小于1200的正整数!'));
                            }
                        } else {
                            callback();
                        }

                    },
                    trigger: 'blur'
                },
            }, {
                label: '最新校准日期',
                prop: 'latestCalibDate',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '证书编号',
                prop: 'certifNo',
                value: '',
            }, {
                slot: 'departmentName',
                label: '部门科室',
                prop: 'departmentName',
                value: '',
                required: true,
            }, {
                label: '具体使用',
                prop: 'specifUse',
                value: '',
                required: true,
            }, {
                slot: 'partTimeMeterName',
                label: '兼职计量员',
                prop: 'partTimeMeterName',
                value: '',
                required: true,
            }, {
                slot: 'usedName',
                label: '使用人',
                prop: 'usedName',
                value: '',
            }, {
                label: '维护人',
                prop: 'updateBy',
                value: '',
                disabled: true,
            }, {
                label: '创建日期',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '修改日期',
                prop: 'updateTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_dicqcmeasurtoolsaccount_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1,
                permi: 'qc_dicqcmeasurtoolsaccount_edit',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
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
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '计量器具类别',
                prop: 'measurType',
                value: ''
            }, {
                label: '器具状态',
                prop: 'measurStatus',
                value: '',
                type: 'select',
                option: dict.measurStatus,
            }, {
                label: '最新校准日期',
                prop: 'time',
                value: '',
                type: 'picker',
            }, {
                label: '部门科室',
                prop: 'department',
                value: '',
                type: 'select',
                option: {},
            }],
            searchVisible: true,
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
            }],
            importVisible: false,
            exportVisible: false,
            exportFilename: '计量器具台帐',
            exportIds: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            permissions: state => state.permissions,
        }),
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'createTime' || v.prop === 'updateBy' || v.prop === 'updateTime') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.rowObj = {};
                this.selection = [];
                this.getDateParent();
                this.$refs.table.clearSelection();
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('device_classification'),
            this.getdepartmentInfoList(),
        ]).then(() => {
            this.getDateParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 搜索清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'time') {
                        this.latestCalibDateStart = moment(v.value[0]).format('YYYY-MM-DD');
                        this.latestCalibDateEnd = moment(v.value[1]).format('YYYY-MM-DD');
                    } else {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                            joinType: 'AND',
                        });
                    }
                } else {
                    if (v.prop === 'time') {
                        this.latestCalibDateEnd = '';
                        this.latestCalibDateStart = '';
                    }
                }
            });
            this.currentPage = 1;
            this.getDateParent();
        },
        // 获取上表列表
        getDateParent() {
            this.loading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                latestCalibDateEnd: this.latestCalibDateEnd,
                latestCalibDateStart: this.latestCalibDateStart,
                conditionList: this.conditionList,
            };
            this.$http.post('/qc/dicqcmeasurtoolsaccount/page', null, {
                params
            }).then(res => {
                this.loading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 获取员工信息
        getStaffInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: '0',
                }]
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'EQ',
                                joinType: 'AND',
                                value: this.dialogSearchForm[i],
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/dicpersonnel/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取部门信息
        getdepartmentInfoList(val = 1) {
            this.departmentNameOpertion = {};
            this.$http.get('/admin/dept/getDeptAll').then(res => {
                res.data.forEach(v => {
                    this.departmentNameOpertion[v.deptCode] = v.deptName;
                });
                this.searchForm[3].option = this.departmentNameOpertion;
            });
        },
        // 获取部门信息树
        getdepartmentInfo(val = 1) {
            this.dialogTableLoading = true;
            this.$http.get('/admin/dept/tree').then(res => {
                this.dialogTableLoading = false;
                this.dialogData = res.data;
            });
        },
        enterTableDetails(type) {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.type = type;
            this.dialogVisible = true;
            this.isShow = true;
            switch (type) {
                case 'departmentName':
                    this.dialogColumn = this.departmentNameColumn;
                    this.isShow = false;
                    this.getdepartmentInfo();
                    break;
                case 'partTimeMeterName':
                    this.dialogColumn = this.partTimeMeterColumn;
                    this.getStaffInfo();
                    break;
                case 'usedName':
                    this.dialogColumn = this.partTimeMeterColumn;
                    this.getStaffInfo();
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
            this.getStaffInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getStaffInfo();
        },
        submitFormDialog(type) {
            this.dialogVisible = false;
            switch (type) {
                case 'departmentName':
                    this.dialogFormParent[13].value = this.rowObj.deptName;
                    this.department = this.rowObj.deptCode;
                    break;
                case 'partTimeMeterName':
                    this.dialogFormParent[15].value = this.rowObj.personnelFullName;
                    this.partTimeMeter = this.rowObj.personnelNumber;
                    break;
                case 'usedName':
                    this.dialogFormParent[16].value = this.rowObj.personnelFullName;
                    this.used = this.rowObj.personnelNumber;
                    break;
                default:
                    break;
            }
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getStaffInfo();
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
            obj.partTimeMeter = this.partTimeMeter;
            obj.used = this.used;
            obj.department = this.department;
            obj.precision = Number(this.dialogFormParent[5].value) || '';
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/qc/dicqcmeasurtoolsaccount/save', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                            this.currentPage = 1;
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.rowKeyObj.id;
                        this.$http.put('/qc/dicqcmeasurtoolsaccount/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
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
            this.dialogVisibleParent = true;
            this.dialogFormParent[17].value = this.sysUser.nickname;
            this.dialogFormParent[18].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogFormParent[19].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 上表修改
        editRowParent(row) {
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.partTimeMeter = this.rowKeyObj.partTimeMeter;
            this.used = this.rowKeyObj.used;
            this.department = this.rowKeyObj.department;
            this.dialogVisibleParent = true;
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
            // this.$refs.table.clearSelection();
        },
        selectionChange(selection) {
            this.selection = selection;
            this.ids = selection.map(v => v.id);
        },
        look(row) {
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.isDisabled = true;
            this.btnsDialog[0].disabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('basicdata_equiphandoveracceptance_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
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
                if (this.ids.length) {
                    this.exportIds = this.ids;
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (setting === 2) {
                this.exportIds = this.tableDataParent.map(v => v.id);
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.equitestorder
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
