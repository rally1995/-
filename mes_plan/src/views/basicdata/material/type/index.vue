<template lang="pug">
    ebrain-main
        ebrain-frame(:title="$route.name")
            template(#tools)
                    ebrain-tools(:buttons="btnsTop")
            template(#table)
                ebrain-table(
                    :isShow = 'false'
                    :tableLoading='tableLoading'
                    @row-dblclick="editRow"
                    @row-click="getMes"
                    ref="table"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :current-row-key.sync="currentRowKey"
                    @select-all="selectAll"
                    @select="selectChange"
                    default-expand-all)
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>
<script>
export default {
    name: 'index',
    data() {
        return {
            submitLoading: false,
            tableLoading: false,
            reserveData: [],
            ischeck: false,
            multipleSelection: '',
            tableData: [],
            selecMore: [],
            selecAll: [],
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }, {
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '上级物料类别编号',
                prop: 'parentMaterialType',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '物料类别名称',
                prop: 'materialTypeName',
                value: '',
                required: true,
            }, {
                label: '物料类别编码',
                prop: 'materialTypeCode',
                value: '',
                required: true,
            }, {
                label: '上级类别名称',
                prop: 'parentMaterialType',
                value: '',
                type: 'selecttree',
                option: [],
                required: true,
                nodeKey: 'materialTypeCode',
                nodeLabel: 'materialTypeName',
                change: val => {
                    this.dialogForm[3].value = val.materialTypeCode;
                },
            }, {
                label: '上级类别编号',
                prop: 'parentMaterialType',
                value: '',
                readonly: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            parentMaterialType: '',
            isShow: '',
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicbasicmaterialtype_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicbasicmaterialtype_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicbasicmaterialtype_del',
                disabled: () => this.ChooseDisabled,
            }, {
                label: '报废',
                click: () => this.scrap(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabled,
                permi: 'basicdata_dicbasicmaterialtype_Scrap',
            }, {
                label: '选中导出',
                click: () => this.selectExport(),
                className: 'iconfont iconstatus-export',
                disabled: () => this.ChooseDisabled,
                permi: 'basicdata_dicbasicmaterialtype_exportsel',
            }, {
                label: '全部导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'basicdata_dicbasicmaterialtype_exportAll',
            }]
        };
    },
    computed: {
        editDisabled() {
            return !!(this.selecMore.length !== 1 || (this.selecMore[0].children && this.selecMore[0].children.length));
        },
        ChooseDisabled() {
            return this.multipleSelection === '';
        }
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.tableLoading = true;
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree').then(res => {
                this.tableLoading = false;
                this.tableData = res.data;
                const item = this.dialogForm.find(v => v.label === '上级类别名称');
                const root = {
                    materialTypeCode: 'MT000',
                    materialTypeName: '无',
                };
                item.option = [root, ...res.data];
                const clickHandler =  () => {
                    this.$nextTick(() => {
                        this.$refs.table.doLayout();
                    });
                };
                this.$nextTick(() => {
                    const icons = this.$refs.table.$el.querySelectorAll('.el-table__expand-icon');
                    icons.forEach((icon, index, arr) => {
                        if (index === arr.length - 1) {
                            icon.addEventListener('click', clickHandler, false);
                        }
                        icon.click();
                    });
                });
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            const current = this.enumer(this.tableData, this.currentRowKey);
            let item = this.dialogForm.find(v => v.label === '上级类别名称');
            let itemCode = this.dialogForm.find(v => v.label === '上级类别编号');
            item.value = current && current.materialTypeCode;
            itemCode.value = current && current.materialTypeCode;
            this.dialogForm[1].disabled = false;
            this.dialogForm[2].disabled = false;
            this.dialogForm[3].disabled = false;
        },
        editRow() {
            if (this.selecMore && this.selecMore.length) {
                const [row] = this.selecMore;
                const item = this.enumer(this.tableData, row.id);
                this.dialogForm.forEach(v => {
                    if (v.label === '上级类别编号') v.value = item.parentMaterialType;
                    else v.value = item[v.prop];
                });
                this.dialogType = 'edit';
                this.dialogVisible = true;
                this.dialogForm[3].disabled = true;
                this.dialogForm[1].disabled = true;
            }
        },
        /**
         * 获取树的被选择的节点
         * @param target
         * @returns {*}
         */
        enumer(target, key) {
            let i = null;
            for (let v of target) {
                if (v.id === key) {
                    i = v;
                    break;
                } else {
                    if (v.children && v.children.length) {
                        i = this.enumer(v.children, key);
                        if (i) break;
                    }
                }
            }
            return i;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                const exportData = this.multipleSelection !== '' ? this.multipleSelection.split(',') : [this.currentRowKey];
                this.$http.delete('/basicdata/dicbasicmaterialtype/removeByIds', {
                    data: exportData
                }).then(() => {
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
        selectChange(selection, row) {
            const isVialited = selection.some(v => v.id === row.id);
            const recursionAdd = (obj) => {
                if (obj.children && obj.children.length) {
                    obj.children.forEach(h => {
                        if (isVialited) {
                            this.$refs.table.toggleRowSelection(h, true);
                        } else {
                            this.$refs.table.toggleRowSelection(h, false);
                        }
                        if (h.children && h.children.length) {
                            recursionAdd(h);
                        }
                    });
                }
            };
            recursionAdd(row);
            this.multipleSelection = selection.map(item => item.id).join(',');
            this.selecMore = selection;
        },
        selectAll(selection) {
            this.selectAll = selection;
            this.multipleSelection = selection.join(',');
        },
        submitForm() {
            let obj = {};
            const finish = () => {
                this.getData();
                this.dialogVisible = false;
            };
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/dicbasicmaterialtype', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    finish();
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.selecMore[0].id;
                this.$http.put('/basicdata/dicbasicmaterialtype', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    finish();
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        getMes(row) {
            this.parentMaterialType = row.parentMaterialType;
            if (row.children.length === 0) {
                this.isShow = true;
                this.selecMore = [row];
            } else {
                this.isShow = false;
            }
        },
        // 报废
        scrap() {
            this.$confirm('是否确认报废?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.get(`/basicdata/dicbasicmaterialtype/ScrapMaterialType`, {
                    params: {
                        id: this.currentRowKey,
                    },
                }).then(() => {
                    this.getData();
                });
            });
        },
        // 选中导出
        selectExport() {
            const exportData = this.multipleSelection !== '' ? this.multipleSelection : this.currentRowKey;
            this.$http.get('/basicdata/dicbasicmaterialtype/export', {
                params: {
                    id: exportData,
                },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出选中物料类型.xls';
                    $a.click();
                }
            });
        },
        // 全部导出
        exportAll() {
            this.$http.get('/basicdata/dicbasicmaterialtype/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出全部物料类别.xls';
                    $a.click();
                }
            });
        }
    }
};
</script>

<style scoped>

</style>
