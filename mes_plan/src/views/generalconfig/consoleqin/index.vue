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
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
                    template(#operation)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(type="primary"  @click="approval(row)") 审批
        ebrain-dialog(
            top="4vh"
            :visible.sync="dialogVisible"
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            el-form.form(inline :model="form" label-width="110px" ref="dialogForm2")
                el-form-item(label="部门id" :required="true" prop="deptName")
                    el-input(style="cursor:pointer" v-model="form.deptName")
                        el-button(slot="append" icon="iconfont iconsearch" @click="openTransfer")
                el-form-item(label="意见" required prop="comment")
                    el-input(v-model="form.comment")
                el-form-item(label="节点" required prop="type")
                    el-radio-group(v-model="form.type")
                        el-radio(label="0") 下一步
                        el-radio(label="1" ) 回退到上一步
                        el-radio(label="2" ) 回退到起点
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            ebrain-box-table.dialog_table(
                    ref="table1"
                    :loading="tableHisLoading"
                    :data="tableHisData"
                    :column="tableHisColumn"
                    row-key="id")
        //- chodept(
        //-     ref="chodept"
        //-     @submitFormDialog="submitData")
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
import processForm from './formRow';
export default {
    name: 'demo',
    components: {
        chodept
    },
    data() {
        return {
            uploadList: [],
            processName: '',
            isAppro: false,
            tableHisLoading: false,
            tableHisData: [],
            tableHisColumn: [{
                label: '部门意见',
                prop: 'fullMessage',
                showOverflowTooltip: true,
            }, {
                label: '时间',
                prop: 'time',
                showOverflowTooltip: true,
            }],
            form: {
                comment: '',
                deptIds: [],
                roleIds: [],
                type: '0',
                userIds: [],
                deptName: '',
                taskId: '',
            },
            tableForm: [],
            dialogTransfer: false,
            btnsTop: [{
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
                label: 'id',
                prop: 'id',
                showOverflowTooltip: true
            }, {
                label: '节点名称',
                prop: 'name',
                showOverflowTooltip: true
            }, {
                label: 'executionId',
                prop: 'executionId',
                showOverflowTooltip: true
            }, {
                label: '签收人或委托人',
                prop: 'assignee',
                showOverflowTooltip: true
            }, {
                label: '委托类型',
                prop: 'delegation',
                showOverflowTooltip: true
            }, {
                label: '优先级别',
                prop: 'priority',
                showOverflowTooltip: true
            }, {
                label: '过期时间',
                prop: 'dueDate',
                showOverflowTooltip: true
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
            btnsDialog: [{
                label: '提交审核',
                click: () => this.saveData(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Submission',
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
        processForm() {
            let obj = [];
            for (let i in processForm) {
                if (Object.prototype.hasOwnProperty.call(processForm, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.processName)) obj = processForm[i];
                }
            }
            return obj;
        },
        dialogForm: {
            get() {
                return this.processForm.dialogForm;
            },
            set(val) {
                console.log(val);
            }
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.getData();
                this.form.comment = '';
                this.form.deptIds = [];
                this.form.type = '0';
                this.form.userIds = [];
                this.form.deptName = '';
                this.form.taskId = '';
            }
        },
        dialogTransfer(val) {
            if (val) {
                this.form.deptIds = [];
                this.form.userIds = [];
                this.form.deptName = '';
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
        init() {
            this.$http.get(`/admin/dept/tree`).then(res => {
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
            });
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            return this.$http.get(`/act/task/page`, {
                params
            }).then((res) => {
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        saveData() {
            this.$refs.dialogForm2.validate(valid => {
                if (valid) {
                    this.$http.post(`/act/task/submit/${this.form.taskId}`, this.form).then(() => {
                        this.$message.success('已提交审核');
                        this.dialogVisible = false;
                    });
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
        openTransfer() {
            this.dialogTransfer = true;
            this.init();
        },
        approval(row) {
            if (!row.bussinesskey) row.bussinesskey = [];
            const arr = row.bussinesskey.split('.');
            this.processName = arr[0];
            let api = `${this.processForm.api}/${arr[1]}`;
            this.$http.get(api).then(res => {
                this.dialogForm.forEach(v => {
                    v.value = res.data[v.prop];
                });
                this.$forceUpdate();
            });
            this.tableHisLoading = true;
            this.$http.post(`/act/task/findComment/${row.id}`).then(res => {
                this.tableHisData = res.data;
                this.tableHisLoading = false;
            }).catch(() => {
                this.tableHisLoading = false;
            });
            this.dialogVisible = true;
            this.form.taskId = row.id;
        },
        submitFormTransfer() {
            this.dialogTransfer = false;
        },
        clickNode(row, node, resolve) {
            this.form.deptIds = [row.deptCode];
            this.form.deptName = row.deptName;
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

.dialog_table
    height 40vh
</style>
