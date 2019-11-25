<template lang="pug">
    ebrain-main.pointTask
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
                    ref="table"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    highlight-current-row
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize')
        ebrain-frame.halfHeight(title="作业列表")
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
                    :loading="tableLoadingSon"
                    :pageSize="pageSizeSon"
                    :pageCurrent="currentPageSon"
                    :pageTotal="pageTotalSon"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @cell-dblclick="cellTable"
                    row-key="id"
                    highlight-current-row
                    @selection-change="handlerSelect"
                    @current-change="CurrentChangeSon"
                    @page-change="ChangeCurrentSon"
                    @size-change="ChangeSizeSon")
                    template(v-for="col in tableColumnSon")
                        el-table-column(v-bind="col")
                            template(#header)
                                span
                                    i.iconfont.iconstatus-edit
                                    span {{col.label}}
                                    br
                                    span （双击编辑）
        ebrain-dialog-table.tooStyle(
            height="50vh"
            title="作业设备清单"
            :data="tableSchedule"
            :isHide="false"
            :isCancel="false"
            :column="tableColumnSchedule"
            :tableLoading="scheduleLoading"
            :visible.sync="dialogVisibleSchedule"
            :pageSize="pageSizeSchedule"
            :currentPage="currentPageSchedule"
            :pageTotal="pageTotalSchedule"
            :disabled="!currentRowKeySchedule"
            @select="handlerSelectSchedule"
            @changeCurrent="changeCurrentSchedule"
            @changeSize="changeSizeSchedule"
            row-key="id"
            :current-row-key.sync="currentRowKeySchedule")
            template(#tools)
                ebrain-tools(:buttons="btnsSchedule")
        ebrain-dialog-table.tooStyle(
            height="50vh"
            title="设备巡检项目清单"
            :data="tablePartrol"
            :isHide="false"
            :isCancel="false"
            :column="tableColumnPartrol"
            :tableLoading="partrolLoading"
            :visible.sync="dialogVisiblePartrol"
            :pageSize="pageSizePartrol"
            :currentPage="currentPagePartrol"
            :pageTotal="pageTotalPartrol"
            :disabled="!currentRowKeyPartrol"
            @select="hanlderPartrol"
            @changeCurrent="changeCurrentPartrol"
            @changeSize="changeSizePartrol"
            row-key="id"
            :current-row-key.sync="currentRowKeyPartrol")
            template(#tools)
                ebrain-tools(:buttons="btnsPartrol")
        ebrain-dialog(
            :visible.sync="dialogVisibleDown"
            :form.sync="dialogFormDown"
            :submitLoading="submitLoadingDown"
            @submit="submitResultDown")
        ebrain-dialog(
            ref="dialog"
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            :isClick="isSubmit"
            :submitLoading="submitLoading"
            @submit="submitResult")
            template(#abnormal="{value}")
                el-col(:span="24")
                     el-form-item(label-width="110px" label="是否异常" :required="true" prop="isUnqualified")
                        el-radio-group(v-model="dialogForm[0].value")
                            el-radio(label="2" :disabled="isSubmit") 异常
                            el-radio(label="1" :disabled="isSubmit") 正常
</template>
<script>
import dict from '@/utils/dict';
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
export default {
    name: '',
    data() {
        return {
            searchVisible: true,
            tableLoading: false,
            isSubmit: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            parentRow: {},
            conditionList: [],
            conditionListDown: [],
            tableColumn: [{
                label: '计划编号',
                prop: 'pointCheckScheduleNo',
                showOverflowTooltip: true
            }, {
                label: '计划名称',
                prop: 'pointCheckScheduleName',
                showOverflowTooltip: true
            }, {
                label: '执行类型',
                prop: 'exeType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.planExecType[cell];
                }
            }, {
                label: '执行人(班组)',
                prop: '',
                showOverflowTooltip: true,
                formatter: (row, column, cell, index) => {
                    const exeTypeType = {
                        0: 'exeMan',
                        1: 'exeGroup'
                    };
                    return row[exeTypeType[row.exeType]];
                },
            }, {
                label: '计划开始时间',
                prop: 'startTime',
                showOverflowTooltip: true
            }, {
                label: '计划结束时间',
                prop: 'endTime',
                showOverflowTooltip: true
            }, {
                label: '计划状态',
                prop: 'jobScheduleStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.Palnstatus[cell];
                }
            }],
            selection: [],
            tableLoadingSon: false,
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            tableDataSon: [],
            muliptionSon: [],
            childRow: {},
            tableColumnSon: [{
                label: '巡检异常情况',
                prop: 'unqualifiedRemark',
                showOverflowTooltip: true,
                slot: 'header',
            }, {
                label: '作业开始时间',
                prop: 'startTime',
                showOverflowTooltip: true
            }, {
                label: '作业状态',
                prop: 'jobStatus',
                formatter(row, column, cell) {
                    return dict.jobStatus[cell];
                },
                showOverflowTooltip: true
            }, {
                label: '设备总数',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '巡检人(部门)',
                prop: 'exe',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    if (row.checkMan !== null) return row.checkMan;
                    else return row.checkGroup;
                }
            }, {
                label: '巡检设备异常数',
                prop: 'unqualifiedNum',
                showOverflowTooltip: true
            }, {
                label: '巡检设备漏检数',
                prop: 'omitNum',
                showOverflowTooltip: true
            }, {
                label: '作业中止时间',
                prop: 'suspendTime',
                showOverflowTooltip: true
            }, {
                label: '作业结束时间',
                prop: 'endTime',
                showOverflowTooltip: true
            }],
            searchVisibleSon: true,
            searchFormSon: [{
                type: 'select',
                label: '作业状态',
                value: '',
                prop: 'jobStatus',
                option: dict.jobStatus
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch',
                permi: false,
            }],
            tableSchedule: [],
            scheduleLoading: false,
            dialogVisibleSchedule: false,
            pageSizeSchedule: 10,
            currentPageSchedule: 1,
            pageTotalSchedule: 0,
            currentRowKeySchedule: '',
            muliptionSchedule: [],
            muliptionPartrol: [],
            submitLoading: false,
            tableColumnSchedule: [{
                type: 'selection',
                width: 35,
            }, {
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
                index: index => {
                    return (this.currentPageSon - 1) * this.pageSizeSon + index + 1;
                },
            }, {
                label: '巡检路线',
                prop: 'pointCheckLine',
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
            }, {
                label: '点巡检方案',
                prop: 'pointCheckPlanName',
                showOverflowTooltip: true
            }, {
                label: '漏检数',
                prop: 'omitNum',
                showOverflowTooltip: true
            }, {
                label: '异常数',
                prop: 'unqualifiedNum',
                showOverflowTooltip: true
            }],
            searchForm: [{
                label: '计划名称',
                prop: 'pointCheckScheduleName',
                value: ''
            }, {
                label: '计划编号',
                prop: 'pointCheckScheduleNo',
                value: '',
            }],
            btnsDown: [{
                label: '执行',
                click: () => this.exeCute(),
                disabled: () => this.execDisabled,
                className: 'iconfont iconproduction-execution',
                permi: false,
            }, {
                label: '完成作业',
                click: () => this.finshWork(),
                disabled: () => this.finshDisabled,
                className: 'iconfont iconindex-security',
                permi: 'devicemanager_pointcheckjob_finish',
            }, {
                label: '中止作业',
                click: () => this.abortWork(),
                disabled: () => this.breakDisabled,
                className: 'iconfont iconState-Stop',
                permi: 'devicemanager_pointcheckjob_suspend',
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsSchedule: [{
                label: '操作',
                click: () => this.opeRate(),
                className: 'iconfont iconproduction-execution',
                permi: false,
                disabled: () => this.muliptionSchedule.length !== 1,
            }],
            tablePartrol: [],
            partrolLoading: false,
            dialogVisiblePartrol: false,
            pageSizePartrol: 20,
            currentPagePartrol: 1,
            pageTotalPartrol: 0,
            currentRowKeyPartrol: '',
            dialogVisibleDown: false,
            submitLoadingDown: false,
            dialogFormDown: [{
                label: '巡检异常情况',
                prop: 'unqualifiedRemark',
                value: '',
                type: 'textarea'
            }],
            btnsPartrol: [{
                label: '填写巡检结果',
                click: () => this.insResults(),
                className: 'iconfont iconproduction-execution',
                permi: 'devicemanager_pointcheckjobitem_edit',
                disabled: () => this.muliptionPartrol.length !== 1,
            }],
            tableColumnPartrol: [{
                type: 'selection',
                width: 35,
            }, {
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
                index: index => {
                    return (this.currentPagePartrol - 1) * this.pageSizePartrol + index + 1;
                },
            }, {
                label: '事项名称',
                prop: 'itemName',
                showOverflowTooltip: true
            }, {
                label: '点巡检部位',
                prop: 'checkLocat',
                showOverflowTooltip: true
            }, {
                label: '点巡检方法',
                prop: 'checkWay',
                showOverflowTooltip: true
            }, {
                label: '电巡检要求',
                prop: 'checkRequire',
                showOverflowTooltip: true
            }, {
                label: '参考上限',
                prop: 'referenceUp',
                showOverflowTooltip: true
            }, {
                label: '参考下限',
                prop: 'referenceDown',
                showOverflowTooltip: true
            }, {
                label: '标准工时',
                prop: 'standardTime',
                showOverflowTooltip: true
            }, {
                label: '是否异常',
                prop: 'isUnqualified',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.isAbnormal[cell];
                }
            }, {
                label: '建议方案',
                prop: 'itemAdvise',
                showOverflowTooltip: true
            }],
            dialogVisible: false,
            dialogForm: [{
                value: '',
                prop: 'isUnqualified',
                slot: 'abnormal',
            }, {
                label: '记录结果',
                prop: 'itemRecord',
                value: '',
                required: true,
                type: 'textarea'
            }, {
                label: '建议方案',
                prop: 'itemAdvise',
                value: '',
                type: 'textarea'
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        execDisabled() {
            return this.muliptionSon.length !== 1;
        },
        finshDisabled() {
            return this.muliptionSon.length !== 1 || (this.muliptionSon.length !== 0 && this.muliptionSon[0].jobStatus !== '0');
        },
        breakDisabled() {
            return this.muliptionSon.length !== 1 || (this.muliptionSon.length !== 0 && this.muliptionSon[0].jobStatus !== '0');
        },
    },
    watch: {
        dialogVisibleSchedule(val) {
            if (!val) {
                this.getDataSon();
                this.pageSizeSchedule = 20;
                this.currentPageSchedule = 1;
            }
        },
        dialogVisiblePartrol(val) {
            if (!val) {
                this.getDataSchedule();
                this.pageSizePartrol = 20;
                this.currentPagePartrol = 1;
            }
        },
        dialogVisible(val) {
            if (!val) { this.getInsItems() }
            else {
                this.$nextTick(() => {
                    this.$refs.dialog.$refs.form.resetFields();
                });
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict(`device_classification`)]).then(() => {
            this.getData();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        searchTop() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getData();
            this.tableDataSon = [];
            this.pageSizeSon = 20;
            this.currentPageSon = 1;
            this.pageTotalSon = 0;
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            this.conditionList.push({
                fieldName: 'jobScheduleStatus',
                operation: 'NEQ',
                value: '0',
            });
            return this.$http.get(`/devicemanager/pointcheckjobmain/page`, {
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
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = row;
                this.childRow = {};
                this.getDataSon();
            }
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
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
        getDataSon() {
            this.tableLoadingSon = true;
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: [],
            };
            params.conditionList = [...this.conditionListDown];
            params.conditionList.push({
                fieldName: 'pointCheckJobMainId',
                operation: 'EQ',
                value: this.parentRow['id'],
            });
            return this.$http.get(`/devicemanager/pointcheckjob/page`, {
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
        // 执行
        exeCute() {
            this.dialogVisibleSchedule = true;
            this.getDataSchedule();
        },
        handlerSelect(selection) {
            this.muliptionSon = selection;
            this.muliptionSon.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.muliptionSon, v);
                }
            });
            if (this.muliptionSon.length !== 0) this.childRow = this.muliptionSon[0];
        },
        finshWork() {
            this.$http.put(`/devicemanager/pointcheckjob/finishById`, this.childRow).then(() => {
                this.$message.success('完成已作业!');
                this.getDataSon();
            });
        },
        abortWork() {
            this.$http.put(`/devicemanager/pointcheckjob/suspendById`, this.childRow).then(() => {
                this.$message.success('完成已中止!');
                this.getDataSon().then(() => {
                    this.childRow = this.tableDataSon.find(v => v.id === this.childRow['id']);
                });
            });
        },
        // 获取作业设备清单
        getDataSchedule() {
            this.scheduleLoading = true;
            const params = {
                current: this.currentPageSchedule,
                size: this.pageSizeSchedule,
                conditionList: [{
                    fieldName: 'pointCheckJobId',
                    operation: 'EQ',
                    value: this.childRow['id'],
                }],
            };
            this.$http.get(`/devicemanager/pointcheckjobde/page`, { params }).then(res => {
                this.tableSchedule = res.data.records;
                this.pageTotalSchedule = res.data.total;
                this.scheduleLoading = false;
            }).catch(() => {
                this.scheduleLoading = false;
            });
        },
        changeCurrentSchedule(val) {
            this.currentPageSchedule = val;
            this.getDataSchedule();
        },
        changeSizeSchedule(val) {
            this.pageSizeSchedule = val;
            this.currentPageSchedule = 1;
            this.getDataSchedule();
        },
        handlerSelectSchedule(selection) {
            this.muliptionSchedule = selection;
        },
        // 操作
        opeRate() {
            this.dialogVisiblePartrol = true;
            this.getInsItems();
        },
        // 填写巡回结果
        insResults() {
            this.dialogVisible = true;
            const item = this.muliptionPartrol[0];
            if (this.muliptionSon[0].jobStatus !== '0') {
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                    v.value = item[v.prop];
                });
                this.isSubmit = true;
            } else {
                this.dialogForm.forEach(v => {
                    v.disabled = false;
                    v.value = item[v.prop];
                });
                this.isSubmit = false;
            }
        },
        // 获取设备巡检项目清单
        getInsItems() {
            let id = '';
            if (this.muliptionSchedule.length !== 0) id = this.muliptionSchedule[0].id;
            this.partrolLoading = true;
            const params = {
                current: this.currentPagePartrol,
                size: this.pageSizePartrol,
                conditionList: [{
                    fieldName: 'pointCheckJobDeId',
                    operation: 'EQ',
                    value: id,
                }],
            };
            this.$http.get(`/devicemanager/pointcheckjobitem/page`, { params }).then(res => {
                this.tablePartrol = res.data.records;
                this.pageTotalPartrol = res.data.total;
                this.partrolLoading = false;
            }).catch(() => {
                this.partrolLoading = false;
            });
        },
        changeCurrentPartrol(val) {
            this.currentPagePartrol = val;
            this.getInsItems();
        },
        changeSizePartrol(val) {
            this.pageSizePartrol = val;
            this.currentPagePartrol = 1;
            this.getInsItems();
        },
        cellTable(row, columnm, cell, event) {
            if (columnm.property === 'unqualifiedRemark') {
                this.dialogVisibleDown = true;
                this.dialogFormDown[0].value = row.unqualifiedRemark;
            }
        },
        submitResultDown() {
            if (this.childRow['jobStatus'] !== '0') {
                this.$alert('未完成状态才可修改', {
                    type: 'warning'
                });
            } else {
                this.submitLoadingDown = true;
                let obj = Object.assign({}, this.childRow);
                obj.unqualifiedRemark = this.dialogFormDown[0].value;
                this.$http.put(`/devicemanager/pointcheckjob/unqualifiedRemarkById`, obj).then(() => {
                    this.$message.success('添加巡检异常情况成功');
                    this.getDataSon();
                    this.submitLoadingDown = false;
                    this.dialogVisibleDown = false;
                }).catch(() => {
                    this.submitLoadingDown = false;
                });
            }
        },
        hanlderPartrol(selection) {
            this.muliptionPartrol = selection;
        },
        submitResult() {
            const row = this.muliptionPartrol[0];
            let obj = Object.assign({}, row);
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            this.$http.put(`/devicemanager/pointcheckjobitem/checkById`, obj).then(() => {
                this.$message.success('修改成功');
                this.dialogVisible = false;
                this.submitLoading = false;
            }).catch(() => {
                this.submitLoading = false;
            });
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

.tooStyle >>>
    .el-dialog__body
        padding-top 10px
    .tools
        margin-bottom 14px

.dialog >>>
    .table
        height 100%
        .el-table__body-wrapper
            height 120px
            overflow-y auto
    .table-list
        .el-form-item
            display: inline-block!important
        .el-form-item__content
             width auto!important
</style>

