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
                        @search="searchSon"
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
            childRow: {},
            conditionList: [],
            conditionListDowm: [],
            tableColumnSon: [{
                label: '巡检异常情况',
                prop: 'unqualifiedRemark',
                showOverflowTooltip: true,
            }, {
                label: '作业开始时间',
                prop: 'startTime',
                showOverflowTooltip: true
            }, {
                label: '作业状态',
                prop: 'jobStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.jobStatus[cell];
                },
            }, {
                label: '设备总数',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '巡检人(部门)',
                prop: 'checkMan',
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
                label: '作业中指时间',
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
            searchForm: [{
                label: '计划编号',
                prop: 'pointCheckScheduleNo',
                value: '',
            }, {
                label: '计划名称',
                prop: 'pointCheckScheduleName',
                value: ''
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
                conditionList: this.conditionList,
            };
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
                this.getDataSon();
            }
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        searchSon() {
            this.currentPageSon = 1;
            this.conditionListDowm = this.searchFormSon.map(v => ({
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
            params.conditionList = [...this.conditionListDowm];
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

