<template lang="pug">
    ebrain-main.inventoryQuery
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
                    :loading='topTableLoading'
                    :page-size='topPageSize'
                    :page-current='topCurrentPage'
                    :page-total='topPageTotal'
                    :data="topTableData"
                    :column="topTableColumn"
                    row-key="id"
                    highlight-current-row
                    @page-change="topChangeCurrent"
                    @size-change='topChangeSize'
                    @selection-change="topSelectChange"
                    @current-change="getUnderTable")
        ebrain-frame.halfHeight(title="零部件清单")
            template(#table)
                ebrain-box-table(
                    :loading='underTableLoading'
                    :page-size='underpageSize'
                    :page-current='undercurrentPage'
                    :page-total='underpageTotal'
                    :data="undertableData"
                    :column="underTableColumn"
                    highlight-current-row
                    @page-change="underChangeCurrent"
                    @size-change='underChangeSize')
</template>
<script>
import { mapState, mapActions } from 'vuex';
import * as _ from 'lodash';
import { strip }  from '@/utils';

export default {
    name: 'inventoryQuery',
    data() {
        return {
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false
            }],
            // 搜索
            searchVisible: true,
            searchForm: [{
                label: '零部件编号',
                prop: 'PartsNumber',
                value: '',
            }, {
                label: '零部件名称',
                prop: 'PartsName',
                value: '',
            }],
            // 上表
            topTableLoading: false,
            selectionTop: '',
            topPageTotal: 0,
            topPageSize: 20,
            topCurrentPage: 1,
            currentRowTopKey: '',
            topTableData: [],
            topTableColumn: [{
                label: '零部件编号',
                prop: 'sparePartNumber',
                showOverflowTooltip: true
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                }
            }, {
                label: '零部件分类',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true
            }, {
                label: '备件属性',
                prop: 'sparePartProperty',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['SPARE_PART_TYPE'][cell];
                },
            }, {
                label: '型号规格',
                prop: 'specModel',
                showOverflowTooltip: true
            }, {
                label: '库存数量',
                prop: 'storeQuantity',
                showOverflowTooltip: true
            }, {
                label: '单价（元）',
                prop: 'unitPrice',
                showOverflowTooltip: true
            }, {
                label: '总金额（元）',
                prop: 'rental',
                showOverflowTooltip: true
            }],
            // 下表
            underTableLoading: false,
            underpageSize: 20,
            undercurrentPage: 1,
            underpageTotal: 0,
            undertableData: [],
            underTableColumn: [{
                label: '零部件SN/Lot',
                prop: 'snLot',
                showOverflowTooltip: true
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true
            }, {
                label: '单位',
                prop: 'unit',
                showOverflowTooltip: true
            }, {
                label: '单价（元）',
                prop: 'unitPrice',
                showOverflowTooltip: true
            }, {
                label: '项目总金额（元）',
                prop: 'rental',
                showOverflowTooltip: true
            }],
            topRow: {}
        };
        //
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
    },
    mounted() {
        Promise.all([
            this.queryDict('BILL_POSTING_WAREHOUSE_RESULT'),
            this.queryDict('SPARE_PART_TYPE'),
        ]).then(() => {
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 搜索
        searchTop() {
            this.topTableLoading = true;
            this.$http.get('/basicdata/spareparts/page?size=9999', {
                params: {
                    conditionList: [{
                        fieldName: 'sparePartNum',
                        operation: 'LIKE',
                        value: this.searchForm[0].value,
                        joinType: 'AND',
                    }, {
                        fieldName: 'sparePartName',
                        operation: 'LIKE',
                        value: this.searchForm[1].value,
                        joinType: 'AND',
                    }],
                }
            }).then(({ data }) => {
                const { records } = data;
                const newNums = _.intersection(records.map(v => v.id));
                this.topCurrentPage = 1;
                this.undertableData = [];
                if (newNums.length) {
                    this.getDataParent(newNums);
                } else {
                    this.topTableLoading = false;
                    this.topTableData = [];
                    this.topPageTotal = 0;
                }
            }).catch(() => {
                this.topTableLoading = false;
            });
        },
        // 搜索清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        getDataParent(newNums = []) {
            this.topTableLoading = true;
            let obj = {
                sparePartNum: '',
                sparePartNums: newNums,
            };
            this.$http.post(`/devicemanager/sparepartsstore/pageStore`, obj, {
                params: {
                    current: this.topCurrentPage,
                    size: this.topPageSize,
                }
            }).then(res => {
                this.topTableLoading = false;
                this.topPageSize = res.data.size;
                this.topPageTotal = res.data.total;
                this.topTableData = res.data.records.map(v => {
                    const rental = strip(v.unitPrice * v.storeQuantity);
                    return { ...v, rental };
                });
                this.$refs.table.setCurrentRow();
            }).catch(() => {
                this.topTableLoading = false;
            });
        },
        // 上表
        topChangeCurrent(val) {
            this.topCurrentPage = val;
            this.getDataParent();
        },
        topChangeSize(val) {
            this.topPageSize = val;
            this.topCurrentPage = 1;
            this.getDataParent();
        },
        topSelectChange(selection) {
            this.selectionTop = selection.map(v => v.id);
        },
        getUnderTable(row) {
            this.topRow = row;
            row && this.getDataSon();
        },
        getDataSon() {
            this.underTableLoading = true;
            const conditionList = [{
                fieldName: 'sparePartNum',
                joinType: 'AND',
                operation: 'EQ',
                value: this.topRow.sparePartNum
            }];
            this.$http.get(`/devicemanager/sparepartsstore/page`, {
                params: {
                    current: this.undercurrentPage,
                    size: this.underpageSize,
                    conditionList
                }
            }).then(res => {
                this.undertableData = res.data.records.map(v => {
                    const rental = strip(v.quantity * v.unitPrice);
                    return { ...v, rental };
                });
                this.underpageTotal = res.data.total;
                this.underTableLoading = false;
            }).catch(() => {
                this.underTableLoading = false;
            });
        },
        underChangeCurrent(val) {
            this.undercurrentPage = val;
            this.getDataSon();
        },
        underChangeSize(val) {
            this.underpageSize = val;
            this.undercurrentPage = 1;
            this.getDataSon();
        }
    }
};
</script>

<style lang="stylus" scoped>
.inventoryQuery
  & >>> .fr
    float left
.search
  padding 14px 10px
  background #f5f5f5
  overflow hidden
  box-sizing border-box
  transition-duration 0.2s
  height 57px

  &.hide
    padding-top 0
    padding-bottom 0
    height 0
</style>

