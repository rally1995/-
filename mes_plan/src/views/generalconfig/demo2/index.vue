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
                            width="200"
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(type="primary"  @click="releaseWork(row)" :disabled="row.reviewerStatus !== '0'") 申请
                                el-button(type="primary"  @click="lookWork(row)" :v-if="row.reviewerStatus !== '0'") 查看
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#process="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="流程" :required="true" prop="procInstId")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="openDialog('流程')"  icon="iconfont iconsearch")
            template(#itemNo="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="项目编号" :required="true" prop="itemNo")
                            el-input(style="cursor:pointer" :value="value" :readonly="true")
                                el-button(slot="append"  @click="openDialog('项目编号')"  icon="iconfont iconsearch")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
        ebrain-dialog-table(
            ref="dialogTable"
            height="50vh"
            :data="tableDialog"
            :column="column"
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
</template>
<script>
import dict from '@/utils/dict';
export default {
    name: 'demo',
    data() {
        return {
            uploadList: [],
            dialogTableType: '',
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
                label: '提交审核',
                click: () => this.subExam(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Submission',
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
                label: '项目名称',
                prop: 'itemName',
                showOverflowTooltip: true
            }, {
                label: '项目负责人',
                prop: 'projectLeader',
                showOverflowTooltip: true
            }, {
                label: '项目验收状态',
                prop: 'projectStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.acceptStatus[cell];
                },
            }, {
                label: '验收单号',
                prop: 'receiptNum',
                showOverflowTooltip: true
            }, {
                label: '验收时间',
                prop: 'receiptTime',
                showOverflowTooltip: true
            }, {
                label: '验收人',
                prop: 'accepter',
                showOverflowTooltip: true
            }, {
                label: '验收内容',
                prop: 'acceptanceContent',
                showOverflowTooltip: true
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.examStatus[cell];
                }
            }, {
                slot: 'operation',
            }],
            parentRow: {},
            selectRows: [],
            conditionList: [],
            dialogVisible: false,
            dialogType: '',
            dialogSearchDialog: {},
            tableDialog: [],
            itemColumn: [{
                label: '申请单号',
                prop: 'projectApplicationCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目单号',
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
                    return dict.examStatus[cell];
                }
            }],
            processColumn: [{
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
            lookColumn: [{
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
                label: '验收单号',
                prop: 'receiptNum',
                value: '',
                required: true,
            }, {
                slot: 'itemNo',
                label: '项目编号',
                prop: 'itemNo',
                value: '',
                disabled: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                value: '',
                disabled: true,
            }, {
                label: '项目负责人',
                prop: 'projectLeader',
                value: '',
                disabled: true,
            }, {
                label: '项目类型',
                prop: 'projectType',
                value: '',
                disabled: true,
            }, {
                label: '验收申请时间',
                prop: 'receiptTime',
                type: 'datetime',
                value: '',
                required: true,
            }, {
                label: '验收申请人',
                prop: 'accepter',
                value: '',
                required: true,
            }, {
                label: '项目验收状态',
                prop: 'projectStatus',
                option: dict.acceptStatus,
                type: 'select',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                option: dict.examStatus,
                type: 'select',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '验收内容',
                prop: 'acceptanceContent',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                slot: 'process',
                prop: 'procInstId',
                value: '',
            }],
            commentColumn: [{
                label: '审核人',
                prop: 'userId',
                searchBy: true,
                showOverflowTooltip: true
            }, {
                label: '部门意见',
                prop: 'message',
                showOverflowTooltip: true
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
        },
        column() {
            if (this.dialogTableType === '流程') {
                return this.processColumn;
            } else if (this.dialogTableType === '项目编号') {
                return this.itemColumn;
            } else if (this.dialogTableType === '查看') {
                return this.commentColumn;
            } else {
                return [];
            }
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) { this.getData() }
            else {
                if (this.dialogForm[8].value !== '0') {
                    this.dialogForm.forEach(v => {
                        v.disabled = true;
                    });
                } else {
                    this.dialogForm[2].disabled = true;
                    this.dialogForm[3].disabled = true;
                    this.dialogForm[4].disabled = true;
                    this.dialogForm[7].disabled = true;
                    this.dialogForm[8].disabled = true;
                }
            }
        },
        dialogVisibleDialog(val) {
            if (!val) {
                this.dialogTableType = '';
            }
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
            return this.$http.get(`/act/equipaccept/page`, {
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
            this.dialogForm[8].value = '0';
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
                this.$http.delete('/act/equipaccept/removeByIds', {
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
                        this.$http.post('/act/equipaccept/save', obj).then(() => {
                            this.$message.success('新增成功');
                            this.dialogVisible = false;
                            this.btnsDialog[0].loading = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.parentRow['id'];
                        this.$http.put('/act/equipaccept/updateById', obj).then(() => {
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
        uploadChangeHandler() {
            console.log('123');
        },
        removeChangeHandler() {
            console.log('123');
        },
        previewChangeHandler() {
            console.log('456');
        },
        openDialog(type) {
            this.dialogSearchDialog = {};
            this.dialogVisibleDialog = true;
            this.dialogTableType = type;
            this.getDialogData();
        },
        getDialogData() {
            switch (this.dialogTableType) {
                case '流程':
                    this.getWorkFlow();
                    break;
                case '项目编号':
                    this.getItem();
                    break;
                case '查看':
                    this.lookWork();
                    break;
            }
        },
        getItem() {
            this.DialogLoading = true;
            const params = {
                current: this.currentPageDialog,
                size: this.pageSizeDialog,
                conditionList: [{
                    fieldName: 'reviewerStatus',
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
            return this.$http.get(`devicemanager/equipprojectapp/page`, {
                params
            }).then((res) => {
                this.tableDialog = res.data.records;
                this.pageTotalDialog = res.data.total;
                this.DialogLoading = false;
            }).catch(() => {
                this.DialogLoading = false;
            });
        },
        getWorkFlow() {
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
            if (this.dialogTableType === '查看') return false;
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
            switch (this.dialogTableType) {
                case '流程':
                    this.dialogForm[10].value = item.modelId;
                    break;
                case '项目编号':
                    this.getItem();
                    this.dialogForm[1].value = item.itemNo;
                    this.dialogForm[2].value = item.itemName;
                    this.dialogForm[3].value = item.projectLeader;
                    this.dialogForm[4].value = item.projectType;
                    // this.dialogForm[5].value = item.applicantDate;
                    // this.dialogForm[6].value = item.applicantPersonnelName;
                    // this.dialogForm[7].value = item.projectStatus;
                    break;
            }
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
        subExam() {
            this.$http.post(`/act/task/submit/${this.parentRow['id']}`).then(() => {
                this.$message.success('已提交审核');
            });
        },
        backNext() {
            console.log('退回');
        },
        lookProcess() {
            console.log('查看进度');
        },
        generDoc() {
            console.log('生成文档');
        },
        releaseWork(row) {
            // this.parentRow = { ...row };
            this.$http.get(`/act/equipaccept/submit/${row.id}`).then(() => {
                this.$message.success('申请已提交');
                this.getData();
            });
        },
        lookWork(row) {
            this.dialogTableType = '查看';
            this.dialogVisibleDialog = true;
            this.DialogLoading = true;
            if (this.dialogSearchDialog) {
                return this.$http.get(`/act/equipaccept/viewHisComment/${row.id}`).then((res) => {
                    this.tableDialog = res.data.commentList;
                    this.DialogLoading = false;
                }).catch(() => {
                    this.DialogLoading = false;
                });
            }
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
