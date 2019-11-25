<template lang="pug">
    ebrain-main.consoledesk
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
            :visible.sync="dialogVisible"
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm"
            @submit="submitData")
            template(#selectNode="{value}")
                    el-col(:span="12")
                        el-form-item(label-width="110px" label="代理人" :required="dialogForm[11].required"  prop="dealUser")
                            el-input(style="cursor:pointer" :value="dialogForm[11].value" :disabled="iscontrol")
                                el-button(slot="append" icon="iconfont iconsearch" :disabled="iscontrol" @click="openTransfer")
            template(#button)
                    ebrain-tools(:buttons="btnsDialog")
        chodept(
            ref="chodept"
            @submitFormDialog="submitFormDialog")
        ebrain-dialog(
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitDataSon")
            template(#way)
                el-col(:span="12")
                     el-form-item(label-width="110px" label="退回节点" :required="true" prop="re")
                        el-radio-group(v-model="dialogFormSon[0].value")
                            el-radio(label="null") 退回上一步
                            el-radio(label="1" ) 退回拟稿人
</template>
<script>
import chodept from './chodept';
import dict from '@/utils/dict';
// import _ from 'lodash';
export default {
    components: {
        chodept,
    },
    data() {
        return {
            btnsDialog: [{
                label: '通过',
                click: () => this.submitData(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '退回',
                click: () => this.reBack(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '取消',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconstatus-Import',
                permi: false,
            }],
            dialogTransfer: false,
            searchForm: [],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            userInfo: [],
            dialogVisible: false,
            tableColumn: [{
                label: 'id',
                prop: 'id',
                showOverflowTooltip: true
            }, {
                label: 'executionId',
                prop: 'executionId',
                showOverflowTooltip: true
            }, {
                label: 'name',
                prop: 'name',
                showOverflowTooltip: true
            }, {
                label: 'assignee',
                prop: 'assignee',
                showOverflowTooltip: true
            }, {
                slot: 'operation'
            }],
            parentRow: {},
            selectRows: [],
            conditionList: [],
            approResult: {},
            // dialogTransfer: false,
            iscontrol: true,
            lastTask: false,
            dialogTableLoading: false,
            currentRowKeyDialog: '',
            userList: [],
            dialogData: [],
            dialogVisibleSon: false,
            dialogFormSon: [{
                label: '退回节点',
                prop: 're',
                value: '',
                slot: 'way',
            }],
            dialogColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '标题',
                prop: 'deptName',
                minWidth: 160,
            }, {
                label: '部门编码',
                prop: 'deptCode',
            }, {
                label: '部门名称',
                prop: 'deptName',
            }],
            submitLoading: false,
            dialogSelectRows: {},
            form: {
                taskId: '',
                id: '',
            },
            searchVisible: true,
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            dialogForm: [{
                label: '验收单号',
                prop: 'receiptNum',
                value: '',
                disabled: true,
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
                disabled: true,
            }, {
                label: '验收申请人',
                prop: 'accepter',
                value: '',
                disabled: true,
            }, {
                label: '项目验收状态',
                prop: 'projectStatus',
                option: dict.acceptStatus,
                type: 'select',
                value: '',
                disabled: true,
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                option: dict.examStatus,
                type: 'select',
                value: '',
                disabled: true,
            }, {
                label: '验收内容',
                prop: 'acceptanceContent',
                value: '',
                type: 'textarea',
                disabled: true,
            }, {
                label: '批准结果',
                prop: 'outcome',
                type: 'select',
                value: '',
                option: () => this.approResult,
                required: true,
                change: (val) => {
                    if (val === '同意' || val === '审核') {
                        this.iscontrol = false;
                        this.dialogForm[11].required = true;
                        this.dialogForm[11].value = null;
                        this.$refs.dialog.$refs.form.clearValidate();
                    } else {
                        this.dialogForm[11].required = false;
                        this.iscontrol = true;
                        this.$refs.dialog.$refs.form.clearValidate();
                    }
                }
            }, {
                slot: 'selectNode',
                label: '代理人',
                prop: 'dealUser',
                value: '',
                required: false,
            }, {
                label: '原因',
                prop: 'comment',
                value: '',
                type: 'textarea',
                required: true,
            }],

        };
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.$nextTick(() => {
                    this.$refs.dialog.$refs.form.clearValidate();
                });
                this.iscontrol = true;
            }
        },
    },
    mounted() {
        this.init();
    },
    activated() {
        this.init();
    },
    methods: {
        init() {
            this.getInfo().then(() => {
                this.getData();
            });
        },
        getInfo() {
            return this.$http.get('admin/user/info').then(res => {
                this.userInfo = res.data.sysUser;
            });
        },
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
            return this.$http.get(`/act/equipaccept/listTask/${this.userInfo.username}`, {
                params
            }).then((res) => {
                this.tableData = res.data;
                this.pageTotal = res.data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
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
        approval(row) {
            const params = {
                taskId: row.id,
            };
            this.$http.post(`/act/equipaccept/audit`, params).then((res) => {
                this.dialogVisible = true;
                this.dialogForm.forEach(v => {
                    v.value = res.data.equipAccept[v.prop];
                });
                this.approResult = {};
                res.data.outcomeList.forEach(v => {
                    this.approResult[v] = v;
                });
                this.lastTask = res.data.lastTask;
                this.form.taskId = row.id;
                this.form.id = res.data.equipAccept.id;
            });
        },
        submitData() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        obj[v.prop] = v.value;
                    });
                    obj = Object.assign(obj, this.form);
                    this.$http.post(`/act/equipaccept/submitTask`, obj).then(() => {
                        this.$message.success('已审批');
                        this.getData();
                        this.dialogVisible = false;
                    });
                }
            });
        },
        submitDataSon() {
            const params = {
                taskId: this.form.taskId,
                type: null
            };
            let str = this.dialogFormSon[0].value === 'null' ? null : '1';
            params.type = str;
            this.$http.get(`/act/equipaccept/backToPreAvtivity`, {
                params
            }).then(() => {
                this.$message.success('已退回');
                this.getData();
                this.dialogVisible = false;
                this.dialogVisibleSon = false;
            });
        },
        reBack() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    const params = {
                        taskId: this.form.taskId,
                        type: null
                    };
                    if (this.lastTask) {
                        this.dialogVisibleSon = true;
                        this.dialogFormSon[0].value = 'null';
                        return false;
                    }
                    this.$http.get(`/act/equipaccept/backToPreAvtivity`, {
                        params
                    }).then(() => {
                        this.$message.success('已退回');
                        this.getData();
                        this.dialogVisible = false;
                    });
                }
            });
        },
        openTransfer() {
            this.$refs.chodept.init();
        },
        selectNode(selection) {
            this.dialogSelectRows = selection;
        },
        submitFormDialog(arrStr) {
            let data = this.dialogForm.find(v => v.prop === 'dealUser');
            data.value = arrStr;
        },
    },
};
</script>
<style lang="stylus" scoped>
.consoledesk
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
    height 30vh
    overflow-y auto

.pallent >>>
    .el-dialog
        width 1200px

</style>
