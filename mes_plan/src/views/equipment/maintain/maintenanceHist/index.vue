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
                    row-key="id"
                    highlight-current-row
                    @current-change="CurrentChangeSon"
                    @page-change="ChangeCurrentSon"
                    @size-change="ChangeSizeSon")
</template>
<script>
import dict from '@/utils/dict';
export default {
    name: '',
    data() {
        return {
            searchVisible: true,
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            parentRow: {},
            tableColumn: [{
                label: '计划编码',
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
            childRow: {},
            tableColumnSon: [{
                label: '维保异常情况',
                prop: 'repairException',
                showOverflowTooltip: true,
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
            conditionList: [],
            conditionListDown: [],
            searchFormSon: [{
                type: 'select',
                label: '作业状态',
                prop: 'jobStatus',
                value: '',
                option: dict.jobStatus
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch',
                permi: false,
            }],
            searchForm: [{
                label: '计划名称',
                prop: 'planName',
                value: ''
            }, {
                label: '计划编号',
                prop: 'planCode',
                value: '',
            }],
            btnsDown: [{
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch',
                permi: false,
            }],
        };
    },
    mounted() {
        this.getData();
    },
    methods: {
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
            // this.searchFormSon.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'EQ',
            //             value: v.value,
            //             joinType: 'AND',
            //         });
            //     }
            // });
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

</style>

