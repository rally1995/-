<template lang="pug">
     ebrain-main.workflow
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
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
                    template(#operation)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(type="primary"  @click="releaseWork(row)") 配置
                                el-button(type="primary" @click="openNode(row)") 节点
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
        ebrain-dialog-table(
            dialogTableSearch
            height="60vh"
            row-key="id"
            :data="tableData_table"
            :isHide="false"
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
            highlight-current-row)
            template(#operation)
                el-table-column(
                    label="操作"
                    align="center")
                    template(v-slot="{row}")
                        el-button(type="primary" @click="openForm(row)") 选择节点
        ebrain-dialog-table(
            dialogTableSearch
            ref="dialog"
            height="60vh"
            row-key="id"
            :data="tableData_dialog"
            :column="tableColumn_dialog"
            :tableLoading='dialogTableLoading_dialog'
            :pageSize="pageSize_dialog"
            :currentPage="currentPage_dialog"
            @changeCurrent="changeCurrent_dialog"
            @changeSize='changeSize_dialog'
            @row-click="query_dialog"
            @search="searchForm_dialog"
            @resetDialog="reset_dialog"
            @select="hanlerDialog"
            :pageTotal="pageTotal_dialog"
            :visible.sync="dialogVisibleDialogTable_dialog"
            highlight-current-row
            @submit="submitFormDialogTable_dialog")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="zip"
            :export-url="'/act/flowdefined/exportZip'"
            :params="exportIds"
            :before-export="handlerExport")
        ebrain-dialog(
            :submitLoading="submitLoadingDialog"
            :visible.sync="dialogVisibleDialog"
            :form.sync="dialogFormDialog"
            @submit="submitDialogData")
            template(#assignee="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="委托人或签收人"  prop="assignee")
                        el-input(:readonly='true' :value="value")
                            el-button(slot="append" @click="showDialogTable('assignee')" icon="el-icon-search")
            template(#deptIds="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="候选部门"  prop="deptIds")
                        el-input(:readonly='true' :value="value")
                            el-button(slot="append" @click="showDialogTable('deptIds')" icon="el-icon-search")
            template(#roleIds="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="候选角色"  prop="roleIds")
                        el-input(:readonly='true' :value="value")
                            el-button(slot="append" @click="showDialogTable('roleIds')" icon="el-icon-search")
            template(#userIds="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="候选人员"  prop="userIds")
                        el-input(:readonly='true' :value="value")
                            el-button(slot="append" @click="showDialogTable('userIds')" icon="el-icon-search")
</template>

<script>
import { mapActions, mapState } from 'vuex';
import dict from '@/utils/dict';
export default {
    name: 'workflow',
    data() {
        return {
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: false,
            }, {
                label: '删除',
                click: () => this.delRow(),
                disabled: () => this.delDisabled,
                className: 'iconfont iconstatus-delete',
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }, {
                label: '启用',
                click: () => this.start(),
                className: 'iconfont iconstatus-start-up',
                disabled: () => this.startDisabled,
                permi: false,
            }, {
                label: '停用',
                click: () => this.stop(),
                className: 'iconfont iconState-Stop',
                disabled: () => this.stopDisabled,
                permi: false,
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: false,
            }],
            searchVisible: true,
            searchForm: [{
                label: '流程名称',
                prop: 'flowName',
                value: '',
            }, {
                label: '状态',
                prop: 'flowStauts',
                type: 'select',
                option: dict.status,
                value: '',
            }],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            tableColumn: [{
                label: '流程名称',
                prop: 'flowName',
                showOverflowTooltip: true
            }, {
                label: '状态',
                prop: 'flowStauts',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.status[cell];
                },
            }, {
                label: '版本',
                prop: 'modeVersion',
                showOverflowTooltip: true
            }, {
                label: '操作员',
                prop: 'createBy',
                showOverflowTooltip: true
            }, {
                slot: 'operation'
            }],
            parentRow: {},
            conditionList: [],
            selectRows: [],
            dialogType: '',
            dialogVisible: false,
            dialogForm: [{
                label: '流程名称',
                prop: 'flowName',
                value: '',
                required: true,
            }, {
                label: '状态',
                prop: 'flowStauts',
                type: 'select',
                option: dict.status,
                value: '',
                disabled: true,
            }, {
                label: '版本',
                prop: 'modeVersion',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数且保留两位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '操作员',
                prop: 'createBy',
                value: '',
                disabled: true,
            }],
            btnsDialog: [{
                label: '保存',
                click: () => this.saveData(),
                loading: false,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
            }],
            tableData_table: [],
            tableColumn_table: [{
                label: '节点key',
                prop: 'taskDefKey',
                showOverflowTooltip: true,
            }, {
                label: '节点名称',
                prop: 'taskName',
                showOverflowTooltip: true,
            }, {
                label: '委托人或签收人',
                prop: 'assignee',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return row.assignee.split('#')[1];
                },
            }, {
                label: '部门名称',
                prop: 'deptIds',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return row.deptIds.split('#')[1];
                },
            }, {
                label: '角色',
                prop: 'roleIds',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    let arr = row.roleIds.split(',');
                    let newArr = arr.map(v => v.split('#')[1]);
                    return newArr.join(',');
                },
            }, {
                label: '候选人',
                prop: 'userIds',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    let arr = row.userIds.split(',');
                    let newArr = arr.map(v => v.split('#')[1]);
                    return newArr.join(',');
                },
            }, {
                slot: 'operation'
            }],
            dialogTableLoading: false,
            pageSize_table: 20,
            currentPage_table: 1,
            pageTotal_table: 0,
            row: {},
            dialogVisibleDialogTable: false,
            dialogSearchForm: {},
            submitLoadingDialog: false,
            dialogVisibleDialog: false,
            dialogFormDialog: [{
                label: '节点名称',
                prop: 'taskName',
                value: '',
                disabled: true,
            }, {
                label: '委托人或签收人',
                prop: 'assignee',
                value: '',
                slot: 'assignee'
            }, {
                label: '部门id',
                prop: 'deptIds',
                value: '',
                slot: 'deptIds'
            }, {
                label: '角色IDS',
                prop: 'roleIds',
                value: '',
                slot: 'roleIds',
            }, {
                label: '候选ID',
                prop: 'userIds',
                value: '',
                slot: 'userIds'
            }],
            tableData_dialog: [],
            tableColumn_dialog: [],
            dialogTableLoading_dialog: false,
            pageSize_dialog: 20,
            currentPage_dialog: 1,
            pageTotal_dialog: 0,
            row_dialog: {},
            dialogVisibleDialogTable_dialog: false,
            dialogForm_dialog: {},
            type: '',
            childRow: [],
            row_Form: {},
            row_Node: {},
            dialogVisabledExport: false,
            exportFilename: '部署文件.zip',
            exportIds: [],
            submitObj: {
                assignee: '',
                userIds: '',
                roleIds: '',
                deptIds: '',
            },
            UserColumn: [{
                label: '用户编码',
                prop: 'username',
                showOverflowTooltip: true,
            }, {
                label: '用户类型',
                prop: 'userType',
                formatter(row, column, cell) {
                    return dict.userType[cell];
                },
            }, {
                label: '状态',
                prop: 'lockFlag',
                formatter(row, column, cell) {
                    return dict.lockFlag[cell];
                },
            }, {
                label: '用户名',
                prop: 'nickname',
                value: '',
            }, {
                label: '有效期',
                prop: 'validityTime',
                minWidth: 110,
                showOverflowTooltip: true,
            }, {
                label: '手机号',
                prop: 'phone',
                showOverflowTooltip: true,
            }],
            roleColumn: [{
                label: '角色名',
                prop: 'roleName',
            }, {
                label: '标识',
                prop: 'roleCode',
                showOverflowTooltip: true,
            }, {
                label: '描述',
                prop: 'roleDesc',
                showOverflowTooltip: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }],
            deptColumn: [{
                label: '部门编码',
                prop: 'deptCode',
            }, {
                label: '部门名称',
                prop: 'deptName',
            }, {
                label: '英文简称',
                prop: 'deptEnName',
            }, {
                label: '排序',
                prop: 'sort',
                sortable: true,
            }],
        };
    },
    computed: {
        ...mapState({
            userInfo: state => state.sysUser
        }),
        editDisabled() {
            const filterData = this.selectRows.some(v => v.flowStauts !== '0');
            return this.selectRows.length !== 1 || filterData;
        },
        delDisabled() {
            const filterData = this.selectRows.some(v => v.flowStauts !== '0');
            return this.selectRows.length === 0 || filterData;
        },
        startDisabled() {
            const filterData = this.selectRows.every(v => v.flowStauts === '1');
            return filterData || this.selectRows.length !== 1;
        },
        stopDisabled() {
            const filterData = this.selectRows.every(v => v.flowStauts !== '1');
            return filterData || this.selectRows.length !== 1;
        },
        dialogDisaled() {
            if (this.type === 'userIds' || this.type === 'roleIds') {
                return this.childRow.length === 0;
            } else {
                return Object.keys(this.row_dialog).length === 0;
            }
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.getData();
                this.dialogType = '';
            }
        },
        dialogVisibleDialogTable_dialog(val) {
            if (!val) {
                this.tableColumn_dialog = [];
                this.currentPage_dialog = 1;
                this.pageSize_dialog = 20;
                this.pageTotal_dialog = 0;
                this.tableData_dialog = [];
                this.type = '';
                this.row_dialog = {};
            }
        },
        dialogVisibleDialogTable(val) {
            if (!val) {
                this.tableData_table = [];
                this.currentPage_table = 1;
                this.pageSize_table = 20;
                this.pageTotal_table = 0;
                this.row_Node = {};
            }
        },
    },
    mounted() {
        this.getData();
    },
    methods: {
        ...mapActions(['queryDict']),
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
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
                conditionList: this.conditionList,
            };
            return this.$http.get(`/act/flowdefined/page`, {
                params
            }).then((res) => {
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },

        newRow() {
            this.dialogVisible = true;
            this.dialogForm[1].value = '0';
            this.dialogType = 'new';
            this.dialogForm[3].value = this.userInfo.nickname;
        },
        editRow(row) {
            this.dialogVisible = true;
            this.dialogType = 'edit';
            if (!row) {
                this.parentRow = { ...this.selectRows[0] };
            }
            this.dialogForm.forEach(v => {
                v.value = this.parentRow[v.prop];
            });
        },
        rowDblClickHandler(row, column, e) {
            if (row.flowStauts !== '0') return false;
            this.parentRow = { ...row };
            this.editRow(row);
        },
        delRow() {
            const ids = this.selectRows.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/act/flowdefined/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPage = 1;
                    this.getData();
                    this.selectRows = [];
                    this.parentRow = {};
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.table1.clearSelection();
                });
            });
        },
        saveData() {
            this.$refs.dialog.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[0].loading = true;
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    if (this.dialogType === 'new') {
                        this.$http.post('/act/flowdefined/save', obj).then(() => {
                            this.$message.success('新增成功');
                            this.dialogVisible = false;
                            this.btnsDialog[0].loading = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.parentRow['id'];
                        this.$http.put('/act/flowdefined/updateById', obj).then(() => {
                            this.$message.success('修改成功');
                            this.dialogVisible = false;
                            this.btnsDialog[0].loading = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                    }
                }
            });
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
        // 配置
        releaseWork(row) {
            let obj = { ...row };
            this.$http.put('/act/flowdefined/designById', obj).then(({ data, code }) => {
                this.parentRow = { ...data };
                window.location.href = `/act/modeler.html?modelId=${this.parentRow['modelId']}`;
            });
        },
        start() {
            let obj = { ...this.selectRows[0] };
            this.$http.put(`/act/flowdefined/startById`, obj).then(() => {
                this.$message.success('流程已启用');
                this.getData();
            });
        },
        stop() {
            let obj = { ...this.selectRows[0] };
            this.$http.put(`/act/flowdefined/stopById`, obj).then(() => {
                this.$message.success('流程已停用');
                this.getData();
            });
        },
        // 节点
        openNode(row) {
            this.dialogSearchForm = {};
            this.dialogVisibleDialogTable = true;
            this.row_Node = row;
            this.getflowpermit();
        },
        // 流程权限列表
        getflowpermit() {
            this.dialogTableLoading = true;
            const params = {
                current: this.currentPage_table,
                size: this.pageSize_table,
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
            this.$http.get(`/act/flowdefinedpermit/list/${this.row_Node.id}`, { params }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data;
                this.pageTotal_table = data.total;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
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
        openForm(row) {
            this.dialogVisibleDialog = true;
            this.row_Form = row;
            this.dialogFormDialog.forEach(v => {
                if (v.prop === 'assignee') {
                    let arr = row.assignee.split('#');
                    v.value = arr[1];
                } else if (v.prop === 'deptIds') {
                    let arr = row.deptIds.split('#');
                    v.value = arr[1];
                } else if (v.prop === 'userIds') {
                    let arr = row.userIds.split(',');
                    let newArr = arr.map(v => v.split('#')[1]);
                    v.value = newArr.join(',');

                } else if (v.prop === 'roleIds') {
                    let arr = row.roleIds.split(',');
                    let newArr = arr.map(v => v.split('#')[1]);
                    v.value = newArr.join(',');
                } else {
                    v.value = row[v.prop];
                }

            });
            this.submitObj = Object.assign(this.submitObj, this.row_Form);
        },
        submitDialogData() {
            let obj = {};
            obj = Object.assign(this.row_Form, this.submitObj);
            this.$http.put(`/act/flowdefinedpermit/updateById`, obj).then(() => {
                this.$message.success('添加成功');
                this.getflowpermit(this.row_Node);
                this.dialogVisibleDialog = false;
            });
        },
        showDialogTable(type) {
            this.dialogVisibleDialogTable_dialog = true;
            this.dialogForm_dialog = {};
            this.type = type;
            this.getDialogData();
        },
        getDialogData() {
            this.dialogTableLoading_dialog = true;
            let api = '';
            const params = {
                current: this.currentPage_dialog,
                size: this.pageSize_dialog,
                conditionList: [],
            };
            const firstObj =
                {
                    type: 'selection',
                    width: 40,
                    minWidth: 40,
                };
            if (this.dialogForm_dialog) {
                for (let i in this.dialogForm_dialog) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogForm_dialog, i)) {
                        if (this.dialogForm_dialog[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogForm_dialog[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            switch (this.type) {
                case 'assignee':
                    this.tableColumn_dialog = this.UserColumn;
                    api = '/admin/user/page';
                    break;
                case 'userIds':
                    this.tableColumn_dialog = [firstObj, ...this.UserColumn];
                    api = '/admin/user/page';
                    break;
                case 'roleIds':
                    this.tableColumn_dialog = [firstObj, ...this.roleColumn];
                    api = 'admin/role/page';
                    break;
                case 'deptIds':
                    this.tableColumn_dialog = this.deptColumn;
                    api = 'admin/dept/tree';
                    break;
            }
            this.$http.get(api, {
                params
            }).then(({ data, code }) => {
                this.tableData_dialog = data.records || data;
                this.pageTotal_dialog = data.total;
                this.dialogTableLoading_dialog = false;
                if (this.type === 'deptIds') {
                    const clickHandler =  () => {
                        this.$refs.dialog.$refs.table.doLayout();
                    };
                    this.$nextTick(() => {
                        const icons = this.$refs.dialog.$refs.table.$el.querySelectorAll(`.el-table__expand-icon`);
                        icons.forEach((icon, index, arr) => {
                            if (index === arr.length - 1) {
                                icon.addEventListener('click', clickHandler, false);
                            }
                            icon.click();
                        });
                    });

                }
            }).catch(() => {
                this.dialogTableLoading_dialog = false;
            }).finally(() => {
                this.$refs.dialog.$refs.table.doLayout();
            });
        },
        changeCurrent_dialog(val) {
            this.currentPage_dialog = val;
            this.getDialogData();
        },
        changeSize_dialog(val) {
            this.pageSize_dialog = val;
            this.currentPage_dialog = 1;
            this.getDialogData();
        },
        query_dialog(row) {
            this.row_dialog = row;
        },
        searchForm_dialog(form) {
            this.dialogForm_dialog = form;
            this.getDialogData();
        },
        reset_dialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        hanlerDialog(select) {
            this.childRow = select;
        },
        submitFormDialogTable_dialog() {
            this.dialogVisibleDialogTable_dialog = false;
            let ids = [];
            let arr = [];
            switch (this.type) {
                case 'assignee':
                    this.dialogFormDialog[1].value = this.row_dialog.username;
                    this.submitObj.assignee = `${this.row_dialog.userId}#${this.row_dialog.username}`;
                    break;
                case 'userIds':
                    ids = this.childRow.map(v => v.username);
                    this.dialogFormDialog[4].value = ids.join(',');
                    arr = this.childRow.map(v => {
                        return `${v.userId}#${v.username}`;
                    });
                    this.submitObj.userIds = arr.join(',');
                    break;
                case 'roleIds':
                    ids = this.childRow.map(v => v.roleName);
                    this.dialogFormDialog[3].value = ids.join(',');
                    arr = this.childRow.map(v => {
                        return `${v.roleId}#${v.roleName}`;
                    });
                    this.submitObj.roleIds = arr.join(',');
                    break;
                case 'deptIds':
                    this.dialogFormDialog[2].value = this.row_dialog.deptName;
                    this.submitObj.deptIds = `${this.row_dialog.deptCode}#${this.row_dialog.deptName}`;
                    break;
            }
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
    }
};
</script>
<style lang="stylus" scoped>
.workflow
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
</style>
