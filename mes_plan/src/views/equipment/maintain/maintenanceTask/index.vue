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
                    @size-change='ChangeSize'
                    @row-click="getDataSon")
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
                    @selection-change="handlerSelect"
                    @cell-dblclick="cellTable"
                    row-key="id"
                    highlight-current-row
                    @current-change="CurrentChangeSon"
                    @page-change="ChangeCurrentSon"
                    @size-change="ChangeSizeSon")
                    template(v-for="col in tableColumnSon")
                        el-table-column(v-bind="col")
                            template(#header)
                                span
                                    i.iconfont.iconstatus-edit
                                    span {{col.label}}
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
            title="设备维保项目清单"
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
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :isClick="isSubmit"
            :form.sync="dialogForm"
            @submit="submitResult")
            template(#abnormal="{value}")
                el-col(:span="24")
                     el-form-item(label-width="110px" label="是否异常" :required="true" prop="execFlag")
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
            conditionDown: [],
            searchVisible: true,
            tableLoading: false,
            isSubmit: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            parentRow: {},
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
                prop: '',
                showOverflowTooltip: true,
                formatter: (row, column, cell, index) => {
                    const exeTypeType = {
                        0: 'executive',
                        1: 'execGroup'
                    };
                    return row[exeTypeType[row.execType]];
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
                prop: 'status',
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
            muliptionPartrol: [],
            muliptionSchedule: [],
            childRow: {},
            tableColumnSon: [{
                label: '维保异常情况',
                prop: 'repairException',
                showOverflowTooltip: true,
                slot: 'header',
            }, {
                label: '作业开始时间',
                prop: 'jobStartTime',
                showOverflowTooltip: true
            }, {
                label: '作业状态',
                prop: 'jobStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.jobStatus[cell];
                }
            }, {
                label: '设备总数',
                prop: 'deviceNum',
                showOverflowTooltip: true
            }, {
                label: '维保人(部门)',
                prop: 'exe',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    if (row.executive !== null) return row.executive;
                    else return row.execGroup;
                }
            }, {
                label: '维保设备异常数',
                prop: 'repairExceptionNum',
                showOverflowTooltip: true
            }, {
                label: '维保设备漏检数',
                prop: 'repairLeakNum',
                showOverflowTooltip: true
            }, {
                label: '作业中止时间',
                prop: 'jobStopTime',
                showOverflowTooltip: true
            }, {
                label: '作业结束时间',
                prop: 'jobEndTime',
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
            dialogVisibleDown: false,
            submitLoadingDown: false,
            submitLoading: false,
            dialogFormDown: [{
                label: '维保异常情况',
                prop: 'unqualifiedRemark',
                value: '',
                type: 'textarea'
            }],
            dialogVisibleSchedule: false,
            pageSizeSchedule: 20,
            currentPageSchedule: 1,
            pageTotalSchedule: 0,
            tableSchedule: [],
            scheduleLoading: false,
            currentRowKeySchedule: '',
            conditionList: [],
            tableColumnSchedule: [{
                type: 'selection',
                width: 35,
            }, {
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
                index: index => {
                    return (this.currentPageSchedule - 1) * this.pageSizeSchedule + index + 1;
                },
            }, {
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
                showOverflowTooltip: true
            }, {
                label: '漏检数',
                prop: 'leakNum',
                showOverflowTooltip: true
            }, {
                label: '异常数',
                prop: 'exceptionNum',
                showOverflowTooltip: true
            }],
            searchForm: [{
                label: '计划编码',
                prop: 'planCode',
                value: '',
            }, {
                label: '计划名称',
                prop: 'planName',
                value: ''
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
                permi: 'devicemanager_equiprepairjob_finishJob',
            }, {
                label: '中止作业',
                click: () => this.abortWork(),
                disabled: () => this.breakDisabled,
                className: 'iconfont iconState-Stop',
                permi: 'devicemanager_equiprepairjob_endJobs',
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
            btnsPartrol: [{
                label: '填写维保结果',
                click: () => this.insResults(),
                className: 'iconfont iconproduction-execution',
                disabled: () => this.muliptionPartrol.length !== 1,
                permi: 'devicemanager_equiprepairjobitem_edit',
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
                label: '维保部分',
                prop: 'repairPart',
                showOverflowTooltip: true
            }, {
                label: '维保方法',
                prop: 'repairMethod',
                showOverflowTooltip: true
            }, {
                label: '维保要求',
                prop: 'repairRequire',
                showOverflowTooltip: true
            }, {
                label: '参考上限',
                prop: 'referenceUpLimit',
                showOverflowTooltip: true
            }, {
                label: '参考下限',
                prop: 'referenceLowerLimit',
                showOverflowTooltip: true
            }, {
                label: '标准工时',
                prop: 'standardJobHours',
                showOverflowTooltip: true
            }, {
                label: '是否异常',
                prop: 'execFlag',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.isAbnormal[cell];
                }
            }, {
                label: '建议方案',
                prop: 'proposal',
                showOverflowTooltip: true
            }],
            dialogVisible: false,
            conditionListDown: [],
            dialogForm: [{
                prop: 'execFlag',
                value: '',
                slot: 'abnormal',
                required: true,
            }, {
                label: '记录结果',
                prop: 'recordResult',
                value: '',
                required: true,
                type: 'textarea'
            }, {
                label: '建议方案',
                prop: 'proposal',
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
            if (!val) {
                this.getInsItems();
            }
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
                conditionList: [],
            };
            params.conditionList = [...this.conditionList];
            params.conditionList.push({
                fieldName: 'status',
                operation: 'NEQ',
                value: '0',
            });
            return this.$http.get(`/devicemanager/equiprepairjobmain/page`, {
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
                fieldName: 'jobMainId',
                operation: 'EQ',
                value: this.parentRow['id'],
            });
            return this.$http.get(`/devicemanager/equiprepairjob/page`, {
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
            const ids = this.muliptionSon.map(v => v.id);
            this.$http.delete(`/devicemanager/equiprepairjob/finishJob`, {
                data: ids
            }).then(() => {
                this.$message.success('完成已作业!');
                this.getDataSon();
            });
        },
        abortWork() {
            const ids = this.muliptionSon.map(v => v.id);
            this.$http.delete(`/devicemanager/equiprepairjob/endJobs`, {
                data: ids
            }).then(() => {
                this.$message.success('完成已中止!');
                this.getDataSon();
            });
        },
        getDataSchedule() {
            const params = {
                size: this.pageSizeSchedule,
                current: this.currentPageSchedule,
                conditionList: [{
                    fieldName: 'repairJobId',
                    operation: 'EQ',
                    value: this.childRow['id'],
                }]
            };
            this.scheduleLoading = true;
            this.$http.get(`/devicemanager/equiprepairjobdet/page`, {
                params
            }).then(res => {
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
        opeRate() {
            this.dialogVisiblePartrol = true;
            this.getInsItems();
        },
        getInsItems() {
            this.partrolLoading = true;
            let id = '';
            if (this.muliptionSchedule.length !== 0) id = this.muliptionSchedule[0].id;
            const params = {
                current: this.currentPagePartrol,
                size: this.pageSizePartrol,
                conditionList: [{
                    fieldName: 'jobDetId',
                    operation: 'EQ',
                    value: id,
                }],
            };
            this.$http.get(`/devicemanager/equiprepairjobitem/page`, { params }).then(res => {
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
        cellTable(row, columnm, cell, event) {
            if (columnm.property === 'repairException') {
                this.dialogVisibleDown = true;
                this.dialogFormDown[0].value = row.repairException;
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
                obj.repairException = this.dialogFormDown[0].value;
                this.$http.put(`/devicemanager/equiprepairjob/updateById`, obj).then(() => {
                    this.$message.success('添加维保异常情况成功');
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
            this.$http.put(`/devicemanager/equiprepairjobitem/updateById`, obj).then(() => {
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

