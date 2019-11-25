<template lang="pug">
    ebrain-main.dicbasicunit
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="currentReset"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoading'
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>
<script>
import dict from '@/utils/dict';

export default {
    name: 'Dicbasicunit',
    data() {
        return {
            conditionList: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [
                {
                    label: '序号',
                    type: 'index',
                    width: 50,
                    align: 'center',
                    index: index => {
                        return (this.currentPage - 1) * this.pageSize + index + 1;
                    },
                }, {
                    label: '单位编号',
                    prop: 'unitCode',
                    showOverflowTooltip: true,
                }, {
                    label: '单位名称',
                    prop: 'unitName',
                }, {
                    label: '采购单位',
                    prop: 'isPurchasingUnit',
                    formatter(row, column, cell) {
                        return dict.isPurchasingUnit[cell];
                    },
                }, {
                    label: '生产单位',
                    prop: 'isProductionUnit',
                    formatter(row, column, cell) {
                        return dict.isProductionUnit[cell];
                    },
                }, {
                    label: '库存单位',
                    prop: 'isInventoryUnit',
                    formatter(row, column, cell) {
                        return dict.isInventoryUnit[cell];
                    },
                }, {
                    label: '销售单位',
                    prop: 'isSaleUnit',
                    formatter(row, column, cell) {
                        return dict.isSaleUnit[cell];
                    },
                }, {
                    label: '检验单位',
                    prop: 'isInspectionUnit',
                    formatter(row, column, cell) {
                        return dict.isInspectionUnit[cell];
                    },
                }, {
                    label: '包装单位',
                    prop: 'isPackingUnit',
                    formatter(row, column, cell) {
                        return dict.isPackingUnit[cell];
                    },
                }, {
                    label: '描述',
                    prop: 'description',
                    showOverflowTooltip: true,
                }
            ],
            dialogForm: [{
                label: '单位编号',
                prop: 'unitCode',
                value: '',
                required: true,
            }, {
                label: '单位名称',
                prop: 'unitName',
                value: '',
                required: true,
            }, {
                label: '采购单位',
                prop: 'isPurchasingUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isPurchasingUnit,
            }, {
                label: '生产单位',
                prop: 'isProductionUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isProductionUnit,
            }, {
                label: '库存单位',
                prop: 'isInventoryUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isInventoryUnit,
            }, {
                label: '销售单位',
                prop: 'isSaleUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isSaleUnit,
            }, {
                label: '检验单位',
                prop: 'isInspectionUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isInspectionUnit,
            }, {
                label: '包装单位',
                prop: 'isPackingUnit',
                type: 'select',
                required: true,
                value: '',
                option: dict.isPackingUnit,
            }, {
                label: '描述',
                prop: 'description',
                value: '',
                type: 'textarea'
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            searchForm: [{
                label: '单位编号',
                prop: 'unitCode',
                value: '',
            }, {
                label: '单位名称',
                prop: 'unitName',
                value: '',
            }],
            routeCode: '',
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicbasicunit_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicbasicunit_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicbasicunit_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }]
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    created() {
        this.getData();
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 重置分页
        currentReset() {
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
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get('/basicdata/dicbasicunit/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[0].disabled = false;
            // const items = this.dialogForm.filter(v => v.option);
            // items.forEach(v => {
            //     v.value = 'false';
            // })
            const arr = ['isPurchasingUnit', 'isProductionUnit', 'isInventoryUnit', 'isSaleUnit', 'isInspectionUnit', 'isPackingUnit'];
            this.dialogForm.forEach(v => {
                const isInclude = arr.includes(v.prop);
                if (isInclude) v.value = 'false';
            });
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm[0].disabled = true;
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
                if (v.value === true) v.value = 'true';
                else if (v.value === false) v.value = 'false';
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/dicbasicunit/' + this.currentRowKey).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/dicbasicunit', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/dicbasicunit', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.dicbasicunit
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
