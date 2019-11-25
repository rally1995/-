<template lang="pug">
     ebrain-main.demo
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
                                el-button(type="primary"  @click="approval(row)" :disabled="row.taskStauts !== '0'") 提交审核
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            template(#process="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="流程" :required="true" prop="modeId")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="openDialog"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDialog"
            :column="tableColumnDialog"
            :tableLoading="DialogLoading"
            :visible.sync="dialogVisibleDialog"
            :pageSize="pageSizeDialog"
            :currentPage="currentPageDialog"
            :pageTotal="pageTotalDialog"
            :disabled="!currentRowKeyDialog"
            @changeCurrent="changeCurrentDialog"
            @changeSize="changeSizeDialog"
            @search="searchDialog"
            @resetDialog="resetDialog"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyDialog"
            @submit="submitFormDialog")
        ebrain-dialog(
            :visible.sync="dialogVisibleSon"
            ref="dialogSon"
            :form.sync="dialogFormApp"
            @submit="subApproval")
            template(#selectNode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="部门" :required="true" prop="deptName")
                        el-input(style="cursor:pointer" :value="dialogFormApp[1].value")
                            el-button(slot="append" icon="iconfont iconsearch" @click="openTransfer")
            template(#type)
                el-col(:span="24")
                     el-form-item(label-width="110px" label="节点" required prop="type")
                        el-radio-group(v-model="dialogFormApp[2].value")
                            el-radio(label="0") 下一步
                            el-radio(label="1" ) 回退到上一步
                            el-radio(label="2" ) 回退到起点
        ebrain-dialog.pallent(
            top="2vh"
            :visible.sync="dialogTransfer"
            @submit="submitFormTransfer")
            el-tree.bindTree(
                    @node-click="clickNode"
                    default-expand-all
                    :data="tableForm"
                    node-key="id")
</template>
<script>
import dict from '@/utils/dict';
import chodept from '../consoledesk/chodept';
export default {
    name: 'demo',
    components: {
        chodept
    },
    data() {
        return {
            form: {
                deptName: '',
                deptId: [],
                id: '',
                modeId: '',
                roleIds: [],
                userIds: [],
            },
            dialogVisibleSon: false,
            dialogTransfer: false,
            tableForm: [],
            dialogFormApp: [{
                label: '意见',
                prop: 'comment',
                value: '',
                required: true,
            }, {
                prop: 'deptName',
                slot: 'selectNode',
                value: '',
            }, {
                slot: 'type',
                prop: 'type',
                value: '',
            }],
            uploadList: [],
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
            }],
            searchForm: [{
                label: '移交验收单号',
                prop: 'transferAcceptanceCode',
                value: '',
            }, {
                label: '移交人员',
                prop: 'transferPersonnel',
                value: '',
            }],
            searchVisible: true,
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            tableColumn: [{
                label: '移交验收单号',
                prop: 'transferAcceptanceCode',
                showOverflowTooltip: true
            }, {
                label: '移交内容',
                prop: 'transferContent',
                showOverflowTooltip: true
            }, {
                label: '移交时间',
                prop: 'transferDate',
                showOverflowTooltip: true
            }, {
                label: '移交人员',
                prop: 'transferPersonnel',
                showOverflowTooltip: true
            }, {
                label: '验收人员',
                prop: 'inspectionPersonnel',
                showOverflowTooltip: true
            }, {
                label: '验收时间',
                prop: 'inspectionDate',
                showOverflowTooltip: true
            }, {
                label: '作业状态',
                prop: 'taskStauts',
                showOverflowTooltip: true,
                formatter: (column, row, cell) => {
                    return dict.taskStauts[cell];
                }
            }, {
                slot: 'operation'
            }],
            parentRow: {},
            selectRows: [],
            conditionList: [],
            dialogVisible: false,
            dialogType: '',
            dialogSearchDialog: {},
            tableDialog: [],
            tableColumnDialog: [{
                label: '流程名称',
                prop: 'flowName',
                showOverflowTooltip: true,
                searchBy: true,
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
            }],
            DialogLoading: false,
            dialogVisibleDialog: false,
            pageSizeDialog: 20,
            currentPageDialog: 1,
            pageTotalDialog: 0,
            currentRowKeyDialog: '',
            dialogForm: [{
                label: '移交验收单号',
                prop: 'transferAcceptanceCode',
                value: '',
                required: true,
            }, {
                label: '移交内容',
                prop: 'transferContent',
                value: '',
                required: true,
            }, {
                label: '移交时间',
                prop: 'transferDate',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '移交人员',
                prop: 'transferPersonnel',
                value: '',
                required: true,
            }, {
                label: '验收人员',
                prop: 'inspectionPersonnel',
                value: '',
                required: true,
            }, {
                label: '验收时间',
                prop: 'inspectionDate',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                slot: 'process',
                prop: 'modeId',
                value: '',
            }, {
                label: '作业状态',
                prop: 'taskStauts',
                value: '',
                type: 'select',
                option: () => dict.taskStauts,
                disabled: true,
            }],
            btnsDialog: [{
                label: '保存',
                click: () => this.saveData(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
            }]
        };
    },
    computed: {
        editDisabled() {
            return this.selectRows.length !== 1;
        },
        delDisabled() {
            return this.selectRows.length === 0;
        },
        subDisabled() {
            return this.dialogType !== 'edit';
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) this.getData();
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
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
            return this.$http.get(`/act/flowequiphandover/page`, {
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
            this.dialogType = 'new';
            this.dialogForm[7].value = '0';
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
        delRow() {
            const ids = this.selectRows.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/act/flowequiphandover/removeByIds', {
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
        rowDblClickHandler(row) {
            if (row.flowStauts !== '0') return false;
            this.parentRow = { ...row };
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
                        this.$http.post('/act/flowequiphandover/save', obj).then(() => {
                            this.$message.success('新增成功');
                            this.dialogVisible = false;
                            this.btnsDialog[0].loading = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.parentRow['id'];
                        this.$http.put('/act/flowequiphandover/updateById', obj).then(() => {
                            this.$message.success('修改成功');
                            this.dialogVisible = false;
                            this.btnsDialog[0].loading = false;
                            this.dialogType = 'edit';
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
        openDialog() {
            this.dialogSearchDialog = {};
            this.dialogVisibleDialog = true;
            this.getDialogData();
        },
        approval(row) {
            this.dialogVisibleSon = true;
            this.dialogFormApp[2].value = '0';
            this.form.id = row.id;
            this.form.modeId = row.modeId;
        },
        getDialogData() {
            this.DialogLoading = true;
            const params = {
                current: this.currentPageDialog,
                size: this.pageSizeDialog,
                conditionList: [{
                    fieldName: 'flowStauts',
                    operation: 'EQ',
                    value: '1',
                    joinType: 'AND',
                }],
            };
            if (this.dialogSearchDialog) {
                for (let i in this.dialogSearchDialog) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchDialog, i)) {
                        if (this.dialogSearchDialog[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                value: this.dialogSearchDialog[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            return this.$http.get(`/act/flowdefined/page`, {
                params
            }).then((res) => {
                this.tableDialog = res.data.records;
                this.pageTotalDialog = res.data.total;
                this.DialogLoading = false;
            }).catch(() => {
                this.DialogLoading = false;
            });
        },
        searchDialog(form) {
            this.currentPageDialog = 1;
            this.dialogSearchDialog = form;
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
        submitFormDialog() {
            const item = this.tableDialog.find(v => v.id === this.currentRowKeyDialog);
            this.dialogForm[6].value = item.modelId;
            this.dialogVisibleDialog = false;
        },
        changeCurrentDialog(val) {
            this.currentPageDialog = val;
            this.getDialogData();
        },
        changeSizeDialog(val) {
            this.pageSizeDialog = val;
            this.currentPageDialog = 1;
            this.getDialogData();
        },
        subApproval() {
            let obj = {};
            this.dialogFormApp.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.deptIds = this.form.deptId;
            obj.modeId = this.form.modeId;
            this.$http.post(`/act/flowequiphandover/startflow/${this.form.id}`, obj).then(() => {
                this.$message.success('审核成功');
                this.dialogVisibleSon = false;
                this.getData();
            });
        },
        submitFormTransfer() {
            this.dialogTransfer = false;
            this.dialogFormApp[1].value = this.form.deptName;
        },
        clickNode(row, node, resolve) {
            this.form.deptName = row.deptName;
            this.form.deptId = [row.deptCode];
        },
        init() {
            this.dialogTransfer = true;
            this.$http.get(`/admin/dept/tree`).then(res => {
                this.tableForm = res.data;
                const recur = (obj) => {
                    if (obj.children && obj.children.length) {
                        obj.label = obj.deptName;
                        obj.children.forEach(h => {
                            if (h.children && h.children.length) {
                                h.label = h.deptName;
                                recur(h);
                            } else {
                                h.label = h.deptName;
                            }
                        });
                    }
                };
                this.tableForm.forEach(v => {
                    recur(v);
                });
            });
        },
        openTransfer() {
            this.dialogTransfer = true;
            this.init();
        }
    }
};
</script>
<style lang="stylus" scoped>
.demo
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
