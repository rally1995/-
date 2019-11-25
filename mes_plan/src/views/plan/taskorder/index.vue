<template lang="pug">
    ebrain-main.taskorder
        ebrain-frame(
            :title="$route.name")
            template(#tools)
                ebrain-tools
                    //- button(
                    //-     @click="setTop"
                    //-     :disabled="!currentRowKeyParent"
                    //-     :class="{disabled: !currentRowKeyParent}")
                    //-     i.iconfont.iconstate-determination
                    //-     |加急置顶
                    button(
                        @click="completion"
                        :disabled="!currentRowKeyParent"
                        :class="{disabled: !currentRowKeyParent}")
                        i.iconfont.iconstate-determination
                        |指定完工
                    button.fr(
                        @click="searchVisible = !searchVisible")
                        i.iconfont.iconsearch
                        |搜索
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="getDataParent"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame.tabs
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="生产订单明细" name="first")
                    el-tab-pane(label="物料BOM明细" name="second")
            template(#table)
                ebrain-table(
                    :isShow='false'
                    :tableLoading='tableLoadingDownL'
                    v-if="activeName === 'first'"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon")
                ebrain-table(
                    :isShow='false'
                    :tableLoading='tableLoadingDownR'
                    v-if="activeName === 'second'"
                    :data="tableDataSonBOM"
                    :column="tableColumnSonBOM"
                    row-key="id"
                    highlight-current-row)
</template>

<script>
import dict from '@/utils/dict';
import moment from 'moment';

export default {
    name: 'index',
    data() {
        return {
            tableLoadingTop: false,
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            activeName: 'first',
            tableDataParent: [],
            tableDataSon: [],
            tableDataSonBOM: [],
            tableColumnParent: [{
                label: '任务工单编号',
                prop: 'prodTaskSheetCode',
                showOverflowTooltip: true,
            }, {
                label: '来源单号',
                prop: 'sourceCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            }, {
                label: '设备编码',
                prop: 'equipmentCode',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '工艺编号',
                prop: 'processCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺名称',
                prop: 'processName',
                showOverflowTooltip: true,
            }, {
                label: '实际开始时间',
                prop: 'actualStartDate',
                showOverflowTooltip: true,
            }, {
                label: '实际结束时间',
                prop: 'actualEndDate',
                showOverflowTooltip: true,
            }, {
                label: '单据状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.prodtasksheet_documentStatus[cell];
                }
            }],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'needQuantity',
                showOverflowTooltip: true,
            }, {
                label: '已生产数量',
                prop: 'producedQuantity',
                showOverflowTooltip: true,
            }],
            tableColumnSonBOM: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return (this.currentPage - 1) * 10 + index + 1;
                },
            }, {
                label: '物料料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '预计用量',
                prop: 'predictAmount',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '任务工单编号',
                prop: 'prodTaskSheetCode',
                value: '',
            }],
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
    },
    mounted() {
        this.getDataParent();
    },
    methods: {
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        getDataParent(val = 1) {
            const conditionList = [];
            this.tableLoadingTop = true;
            this.searchForm.forEach(v => {
                if (v.value) {
                    conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'OR',
                    });
                }
            });
            this.$http.get('/productionplan/prodtasksheet/page', {
                params: {
                    current: val,
                    size: this.pageSize,
                    conditionList,
                },
            }).then(res => {
                this.currentPage = val;
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon(row) {
            this.currentRowKeySon = '';
            // 查任务工单明细
            this.tableLoadingDownL = true;
            this.$http.get('/productionplan/prodtasksheetdet/getByProdTaskSheetCode', {
                params: {
                    prodTaskSheetCode: row.prodTaskSheetCode
                }
            }).then(res => {
                this.tableLoadingDownL = false;
                this.tableDataSon = res.data ? res.data : [];
            });
            // 查物料bom明细
            this.tableLoadingDownR = true;
            this.$http.get('/productionplan/prodtasksheetbomdet/getByProdTaskSheetCode', {
                params: {
                    prodTaskSheetCode: row.prodTaskSheetCode
                }
            }).then(res => {
                this.tableLoadingDownR = false;
                this.tableDataSonBOM = res.data ? res.data : [];
            });
        },
        changeCurrent(val) {
            this.getDataParent(val);
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        setTop() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            item.createTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.$http.put('/productionplan/prodtasksheet/updateBySetTopDate', item).then(() => {
                this.getDataParent();
            });
        },
        completion() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.documentStatus === 0) {
                this.$confirm('是否要指定完工', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get('/productionplan/prodtasksheet/getByFinished/' + this.currentRowKeyParent).then(() => {
                        this.$message.success('指定完工成功');
                        this.getDataParent();
                    });
                });
            } else {
                this.$http.get('/productionplan/prodtasksheet/getByFinished/' + this.currentRowKeyParent).then(() => {
                    this.$message.success('指定完工成功');
                    this.getDataParent();
                });
            }
        },
    }
};
</script>

<style scoped lang="stylus">
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
.disabled
    cursor not-allowed
    color lighten($color-dark, 50)
    background-color #f5f5f5

.taskorder
    & >>> .fr
        float right

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0
</style>