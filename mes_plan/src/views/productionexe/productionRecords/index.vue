<template lang="pug">
    ebrain-main.prodRecords
        template(#leftColumn)
            ebrain-frame(title="生产记录")
                template(#table)
                    el-scrollbar(style="margin-left:-10px;margin-right:-10px;")
                        el-tree(
                            ref="tree"
                            highlight-current
                            @current-change="treeChangeHandler"
                            :load="loadNode"
                            :props="nodeProps"
                            lazy)
        ebrain-frame(
            title="产出明细")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="getDataParent"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change='changeSize'
                    row-key="id"
                    highlight-current-row
                    @selection-change="selectChangeParent"
                    @current-change="currentChangeHandler")
                    template(#operate)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    width="50"
                                    type="primary"
                                    @click="detail(row)") 明细
        ebrain-frame.tabs
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="投料明细" name="first")
                    el-tab-pane(label="报废明细" name="second")
                    el-tab-pane(label="损耗明细" name="third")
            template(#table)
                ebrain-box-table(
                    :pageSize='pageSizeBottom'
                    :currentPage='currentPageBottom'
                    :pageTotal='pageTotalBottom'
                    @page-change="changeCurrentBottom"
                    @size-change='changeSizeBottom'
                    :tableLoading="tableLoadingDown"
                    :isShow="false"
                    v-if="activeName === 'first'"
                    :data="tableDataSonL"
                    :column="tableColumnSonL"
                    key="first")
                ebrain-box-table(
                    :pageSize='pageSizeBottom'
                    :currentPage='currentPageBottom'
                    :pageTotal='pageTotalBottom'
                    @page-change="changeCurrentBottom"
                    @size-change='changeSizeBottom'
                    :tableLoading="tableLoadingDown"
                    :data="tableDataSonC"
                    :column="tableColumnSonC"
                    :isShow="false"
                    v-if="activeName === 'second'"
                    key="second")
                ebrain-box-table(
                    :pageSize='pageSizeBottom'
                    :currentPage='currentPageBottom'
                    :pageTotal='pageTotalBottom'
                    @page-change="changeCurrentBottom"
                    @size-change='changeSizeBottom'
                    :tableLoading="tableLoadingDown"
                    :data="tableDataSonR"
                    :column="tableColumnSonR"
                    :isShow="false"
                    v-if="activeName === 'third'"
                    key="third")
        ebrain-dialog-table(
            ref="dialogTable"
            :visible.sync="dialogVisible"
            height="50vh"
            row-key="id"
            :page-size="partsNoPageSize"
            :current-page="partsNoCurrentPage"
            :page-total="partsNoPageTotal",
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            :data="tableDataDialog"
            :column="tableColumnDialog"
            :table-key="activeNameDialog"
            @submit="submitFormDialog")
            template(#tools v-if="processTable.apiParams")
                el-tabs(v-model="activeNameDialog" type="card")
                    el-tab-pane(label="过程记录" name="first")
                    el-tab-pane(label="参数设置" name="second")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import processColumn from './tableColumn';
// import moment from 'moment';
// import dict from '@/utils/dict';
// import * as _ from 'lodash';
import axios from 'axios';
export default {
    name: 'workshop',
    data() {
        return {
            dialogRow: {},
            partsNoPageSize: 20,
            partsNoCurrentPage: 1,
            partsNoPageTotal: 0,
            node: '',
            tableDialogData: [],
            tableDialogColumn: [],
            activeNameDialog: 'first',
            tableDataDialog: [],
            treeSelection: '',
            pageSizeBottom: 20,
            currentPageBottom: 1,
            pageTotalBottom: 0,
            topRow: [],
            treeProps: {
                label: 'workCenterName',
            },
            addDisabledParent: false,
            treeData: [],
            tableDataParent: [],
            dialogVisible: false,
            tableLoadingDown: false,
            activeName: 'first',
            currentRowKeyParent: '',
            selection: [],
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            tableLoadingTop: true,
            searchForm: [{
                label: '工单号',
                prop: 'orderNo',
                value: ''
            }, {
                label: '生产批次号',
                prop: 'prodBatchNo',
                value: '',
            }],
            tableDataSonL: [],
            tableDataSonC: [],
            tableDataSonR: [],
            submitLoading: false,
            searchVisible: true,
            tableColumnParent: [{
                label: '工单号',
                prop: 'orderNo',
                showOverflowTooltip: true
            }, {
                label: '物料料号',
                prop: 'materialNo',
                showOverflowTooltip: true
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true
            }, {
                label: '计划数量',
                prop: 'planAmount',
                showOverflowTooltip: true
            }, {
                label: '实际数量',
                prop: 'realAmount',
                showOverflowTooltip: true
            }, {
                label: '单位',
                prop: 'materialUnit',
                showOverflowTooltip: true
            }, {
                label: '生产批次号',
                prop: 'prodBatchNo',
                showOverflowTooltip: true
            }, {
                label: '开始时间',
                prop: 'beginTime',
                showOverflowTooltip: true
            }, {
                label: '结束时间',
                prop: 'endTime',
                showOverflowTooltip: true
            }, {
                slot: 'operate',
            }],
            tableColumnSonL: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料批号',
                prop: 'materialBatchNo',
            }, {
                label: '数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '工位编号',
                prop: 'stationNo',
            }, {
                label: '投料开始时间',
                prop: 'beginTime',
            }, {
                label: '投料结束时间',
                prop: 'endTime',
            }, {
                label: '操作员',
                prop: 'createBy',
            }],
            tableColumnSonC: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '报废数量',
                prop: 'materialAmount',
            }, {
                label: '报废原因',
                prop: 'remark',
            }, {
                label: '操作员',
                prop: 'createBy',
            }, {
                label: '报废时间',
                prop: 'createTime',
            }],
            tableColumnSonR: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '损耗数量',
                prop: 'materialAmount',
            }, {
                label: '损耗原因',
                prop: 'remark',
            }, {
                label: '操作员',
                prop: 'createBy',
            }, {
                label: '损耗时间',
                prop: 'createTime',
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false
            }],
            nodeProps: {
                label(data, node) {
                    switch (node.level) {
                        case 1:
                            return data.processName;
                        case 2:
                            return data.workCenterName;
                    }
                },
                isLeaf: 'leaf'
            },
            processName: '',
            processNo: '',
            cancel: null,
            orderId: '',
            batchId: '',
            tableColumnDialog: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser
        }),
        processTable() {
            let obj = [];
            for (let i in processColumn) {
                if (Object.prototype.hasOwnProperty.call(processColumn, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.processName)) obj = processColumn[i];
                }
            }
            return obj;
        },
        // tableColumnDialog() {
        //     return this.activeNameDialog === 'first'
        //         ? this.processTable.columnRecords
        //         : this.processTable.columnParams;
        // },
    },
    watch: {
        activeNameDialog() {
            this.detail();
        },
        dialogVisible() {
            this.dialogRow = {};
        }
    },
    mounted() {
        this.getTreeList();
    },
    methods: {
        ...mapActions(['queryDict']),
        // 获取左边列表(弃用)
        getTreeList() {
            this.$http.get('/productionplan/ppprocess/page?size=9999').then(res => {
                this.treeData = res.data.records;
            });
        },
        // 获取左边列表
        loadNode(node, resolve) {
            if (node.level === 0) {
                this.$http.get('/productionplan/ppprocess/page?size=9999').then(res => {
                    resolve(res.data.records);
                });
            } else if (node.level === 1) {
                const processCode = node.data.processCode || '';
                this.$http.get('/basicdata/workcenter/page?size=9999', {
                    params: {
                        conditionList: [{
                            fieldName: 'processCode',
                            operation: 'EQ',
                            value: processCode,
                        }]
                    }
                }).then(res => {
                    resolve(res.data.records.map(v => ({ ...v, leaf: true })));
                });
            }
        },
        treeChangeHandler(row, node) {
            this.node = node;
            this.processNo = row.processCode;
            this.treeSelection = row.workCenterCode;
            this.processName = row.processName || node.parent.data.processName;
            this.addDisabledParent = true;
            this.getDataParent();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 获取上表信息
        getDataParent() {
            const conditionList = {};
            if (this.node.level === 1) {
                conditionList.processNo = this.processNo;
            } else if (this.node.level === 2) {
                conditionList.processNo = this.processNo;
                conditionList.workcenterNo = this.treeSelection;
            }
            this.tableLoadingTop = true;
            this.searchForm.forEach(v => {
                if (v.value) conditionList[v.prop] = v.value;
            });
            this.cancel && this.cancel();
            this.$http.get('/productionexe/orderprodbatch/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...conditionList,
                },
                cancelToken: new axios.CancelToken(c => {
                    this.cancel = c;
                })
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPage = 1;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getAllSon() {
            this.getDataSonL();
            this.getDataSonC();
            this.getDataSonR();
        },
        // 获取下表信息
        getDataSonL() {
            this.tableLoadingDown = true;
            const params = {
                current: this.currentPageBottom,
                size: this.pageSizeBottom,
            };
            params.conditionList = [{
                fieldName: 'prodBatchId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.topRow.id,
            }];
            this.$http.get(`/productionexe/orderfeed/page`, {
                params
            }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSonL = data.records;
                this.currentPageBottom = 1;
                this.pageTotalBottom = data.total;
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        getDataSonC() {
            this.tableLoadingDown = true;
            const params = {
                current: this.currentPageBottom,
                size: this.pageSizeBottom,
            };
            params.conditionList = [{
                fieldName: 'productBatchId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.topRow.id,
            }, {
                fieldName: 'type',
                joinType: 'AND',
                operation: 'EQ',
                value: '1',
            }];
            this.$http.get(`/productionexe/orderwaste/page`, {
                params
            }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSonC = data.records;
                this.currentPageBottom = 1;
                this.pageTotalBottom = data.total;
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        getDataSonR() {
            this.tableLoadingDown = true;
            const params = {
                current: this.currentPageBottom,
                size: this.pageSizeBottom,
            };
            params.conditionList = [{
                fieldName: 'productBatchId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.topRow.id,
            }, {
                fieldName: 'type',
                joinType: 'AND',
                operation: 'EQ',
                value: '2',
            }];
            this.$http.get(`/productionexe/orderwaste/page`, {
                params
            }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSonR = data.records;
                this.currentPageBottom = 1;
                this.pageTotalBottom = data.total;
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        selectChangeParent(selection) {
            this.selection = selection;
        },
        detail(val) {
            this.dialogRow = val;
            let orderId;
            let batchId;
            if (this.dialogRow) orderId = this.orderId = this.dialogRow.orderId;
            else orderId = this.orderId;
            if (this.dialogRow) batchId = this.batchId = this.dialogRow.id;
            else batchId = this.batchId;
            this.dialogVisible = true;
            const params = {
                current: this.partsNoCurrentPage,
                size: this.partsNoPageSize,
            };
            let api;
            if (this.activeNameDialog === 'first') {
                api = this.processTable.apiRecords;
                params.conditionList = [{
                    fieldName: 'orderId',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: orderId,
                }, {
                    fieldName: 'prodBatchId',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: batchId,
                }];
                this.tableColumnDialog = this.processTable.columnRecords;
                this.tableDataDialog = [];
                this.$http.get(api, {
                    params
                }).then(res => {
                    this.partsNoPageTotal = res.data.total;
                    this.tableDataDialog = res.data.records;
                });
            } else if (this.activeNameDialog === 'second') {
                api = '/productionexe/orderprogramparam/listByOrderId';
                params.orderId = this.orderId;
                this.tableColumnDialog = [];
                this.tableDataDialog = [];
                this.$http.post(api, null, {
                    params
                }).then(({ data }) => {
                    let newColumn = data.map(v => ({
                        label: v.paramName,
                        prop: v.paramNo,
                    }));
                    newColumn.reverse();
                    newColumn.push({
                        label: '时间',
                        prop: 'createTime',
                    }, {
                        label: '记录员',
                        prop: 'updateBy',
                    });
                    this.tableColumnDialog = newColumn;

                    let newData = [];
                    const isClosed = (a, b) => {
                        const aTime = new Date(a).getTime();
                        const bTime = new Date(b).getTime();
                        return Math.abs(aTime - bTime) < 2000;
                    };
                    const findItem = value => newData.find(k => isClosed(k.createTime, value));
                    data.forEach(v => {
                        v.details.forEach(j => {
                            let paramter = findItem(j.createTime);
                            if (paramter) {
                                paramter[v.paramNo] = j.actualValue;
                            } else {
                                paramter = {
                                    createTime: j.createTime,
                                    recordingTime: j.recordingTime,
                                    updateBy: j.updateBy,
                                    [v.paramNo]: j.actualValue
                                };
                                newData.push(paramter);
                            }
                        });
                    });
                    // this.partsNoPageTotal = res.data.total;
                    this.tableDataDialog = newData;

                });
            }

        },
        changeCurrent_table(val) {
            this.partsNoCurrentPage = val;
            this.detail(this.dialogRow);
        },
        changeSize_table(val) {
            this.partsNoPageSize = val;
            this.partsNoCurrentPage = 1;
            this.detail(this.dialogRow);
        },
        submitFormDialog() {
            this.dialogVisible = false;
        },
        currentChangeHandler(row) {
            this.topRow = row;
            row && this.getAllSon();
        },
        changeCurrentBottom(val) {
            this.currentPageBottom = val;
            switch (this.activeName) {
                case 'first':
                    this.getDataSonL();
                    break;
                case 'second':
                    this.getDataSonC();
                    break;
                case 'third':
                    this.getDataSonR();
                    break;
                default:
                    break;
            }
        },
        changeSizeBottom(val) {
            this.pageSizeBottom = val;
            this.currentPageBottom = 1;
            switch (this.activeName) {
                case 'first':
                    this.getDataSonL();
                    break;
                case 'second':
                    this.getDataSonC();
                    break;
                case 'third':
                    this.getDataSonR();
                    break;
                default:
                    break;
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.prodRecords
    & >>> .fr
        float left

    & >>> .el-tree-node__loading-icon
        display none

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    & >>> .el-input
        width 150px

    & >>> .el-date-editor
        width 240px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0

.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
</style>
