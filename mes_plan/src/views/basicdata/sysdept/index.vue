<template lang="pug">
    ebrain-main
        ebrain-frame(
            title="班组")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoadingTop"
                    :pageSize="pageSize_top"
                    :currentPage="currentPage_top"
                    :pageTotal="pageTotal_top"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent_top"
                    @changeSize="changeSize_top"
                    @row-click="getDateSon"
                    @row-dblclick="editRowParent"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="班组人员")
            template(#tools)
                ebrain-tools(:buttons="btnsDown")
            template(#table)
                ebrain-table(
                    :pageSize="pageSize_down"
                    :current-page="currentPage_down"
                    :pageTotal="pageTotal_down"
                    @changeCurrent="changeCurrent_down"
                    @changeSize="changeSize_down"
                    :tableLoading="tableLoadingDown"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @selection-change="selectionChange"
                    row-key="id"
                    highlight-current-row
                    @cell-change="tableEdit"
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyStaff"
            height="50vh"
            :data="staffTableData"
            :column="staffTableColumn"
            :disabled="selectionDialog.length===0"
            :submitLoading="submitLoadingTable"
            :visible.sync="dialogVisibleStaffTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @select="selectionChangeDialog"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormStaffTable")
</template>

<script>
import dict from '@/utils/dict';
export default {
    name: 'sysdept',
    data() {
        return {
            selectionDialog: [],
            dialogSearchForm: {},
            selection: [],
            ids: [],
            dialogTableLoading: false,
            dialogParent: '',
            dialogSon: '',
            submitLoadingTable: false,
            dialogVisibleStaffTable: false,
            currentRowKeyStaff: '',
            staffTableData: [],
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            submitLoading: false,
            dialogVisibleParent: false,
            tableLoadingTop: false,
            tableLoadingDown: false,
            pageSize_top: 20,
            currentPage_top: 1,
            pageTotal_top: 0,
            pageSize_down: 20,
            currentPage_down: 1,
            pageTotal_down: 0,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            tableDataParent: [],
            tableDataSon: [],
            tableColumnParent: [{
                label: '班组编码',
                prop: 'teamNumber',
                showOverflowTooltip: true,
            }, {
                label: '班组名称',
                prop: 'teamName',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '班组编号',
                prop: 'teamNumber',
                value: '',
                disabled: false,
                required: true,
            }, {
                label: '班组名称',
                prop: 'teamName',
                value: '',
                required: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            tableColumnSon: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '员工编号',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
            }, {
                label: '员工名称',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
            }, {
                label: '负责人',
                prop: 'responsiblePersonnel',
                showOverflowTooltip: true,
                editable: true,
                formatter: (row, column, cell) => {
                    return dict.isResponsiblePersonnel[cell];
                },
                option: () => dict.isResponsiblePersonnel,
            }, {
                label: '备注(回车提交)',
                prop: 'remark',
                showOverflowTooltip: true,
                editable: true,
            }],
            staffTableColumn: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '员工姓名',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '岗位',
                prop: 'postName',
                showOverflowTooltip: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicTeam_basicteam_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'basicTeam_basicteam_edit',
            }],
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.editDisabledParent,
                permi: 'devicemanager_basicteammembers_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0,
                permi: 'devicemanager_basicteammembers_dels',
            }]
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
    },
    mounted() {
        this.getDateParent();
    },
    methods: {
        // 获取上表列表
        getDateParent(val = 1) {
            this.tableLoadingTop = true;
            this.$http.get('/basicdata/basicteam/page', {
                params: {
                    current: val,
                    size: this.pageSize_top,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPage_top = val;
                this.tableDataParent = res.data.records;
                this.pageTotal_top = res.data.total;
            });
        },
        // 上表新增
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
        },
        // 上表修改
        editRowParent() {
            this.dialogParent = 'edit';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisibleParent = true;
        },
        // 上表页码
        changeCurrent_top(val) {
            this.getDateParent(val);
        },
        // 上表页面数据数量
        changeSize_top(val) {
            this.pageSize_top = val;
            this.currentPage_top = 1;
            this.getDateParent();
        },
        // 上表新增修改提交
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/basicdata/basicteam/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDateParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeyParent;
                this.$http.put('/basicdata/basicteam/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDateParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 获取下表列表
        getDateSon() {
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.get('/basicdata/basicteammembers/page', {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                    conditionList: [{
                        fieldName: 'teamId',
                        operation: 'EQ',
                        value: item.id,
                    }],
                },
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
            });
        },
        // 上表页码
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDateSon();
        },
        // 上表页面数据数量
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDateSon();
        },
        // 获取员工列表
        getStaffInfo(val = 1) {
            const params = {
                size: this.pageSize_1,
                current: val,
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
            this.dialogTableLoading = true;
            this.$http.get(`/basicdata/dicpersonnel/onGuardStaffs/${this.currentRowKeyParent}`, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.staffTableData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 下表新增
        newRowSon() {
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.currentRowKeyStaff = '';
            this.dialogSearchForm = {};
            this.dialogSon = 'new';
            this.dialogVisibleStaffTable = true;
            this.getStaffInfo();
        },
        selectionChange(selection) {
            this.selection = selection;
            this.ids = this.selection.map(v => v.id);
        },
        selectionChangeDialog(selection) {
            this.selectionDialog = selection;
        },
        // table弹出页
        changeCurrent_1(val) {
            this.getStaffInfo(val);
        },
        // table弹出页
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getStaffInfo();
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/basicdata/basicteammembers/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getDateSon();
                    this.currentRowKeySon = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 提交table数据
        submitFormStaffTable() {
            const arr = [];
            this.selectionDialog.forEach(item => {
                let obj = {};
                obj = {
                    teamId: this.currentRowKeyParent,
                    personnelFullName: item.personnelFullName,
                    personnelNumber: item.personnelNumber,
                };
                arr.push(obj);
            });
            this.submitLoadingTable = true;
            this.$http.post('/basicdata/basicteammembers/save', arr).then(res => {
                this.dialogVisibleStaffTable = false;
                this.submitLoadingTable = false;
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
                this.getDateSon();
            }).catch(() => {
                this.submitLoadingTable = false;
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
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
        tableEdit(value, row, head) {
            let obj = {};
            if (head === 'responsiblePersonnel') {
                if (value === '1') {
                    return this.$http.put('/basicdata/basicteammembers/updateById', {
                        id: row.id,
                        responsiblePersonnel: value,
                    }).then(res => {
                        this.getDateSon();
                    });
                } else {
                    return this.$http.get(`/basicdata/basicteammembers/updateFunctionary/${row.id}`).then(res => {
                        this.getDateSon();
                    });
                }
            } else {
                obj = {
                    id: row.id,
                    remark: value,
                };
                return this.$http.put('/basicdata/basicteammembers/updateById', obj).then(res => {
                    this.getDateSon();
                });
            }
        },
    }
};
</script>

<style lang="stylus" scoped>

</style>

