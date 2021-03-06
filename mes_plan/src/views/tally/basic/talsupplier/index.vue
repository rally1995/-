<template lang="pug">
    ebrain-main.supplier
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchData"
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
                    @changeSize='changeSize'
                    @selection-change="changeHandler")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>

<script>
import dict from '@/utils/dict';
export default {
    name: 'index',
    data() {
        return {
            conditionList: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: '',
            searchVisible: true,
            searchForm: [{
                label: '供应商编号',
                prop: 'supplierCode',
                value: '',
            }],
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '供应商编号',
                prop: 'supplierCode',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '联系人',
                prop: 'contact',
                showOverflowTooltip: true,
            }, {
                label: '联系方式',
                prop: 'contactInformation',
                showOverflowTooltip: true,
            }, {
                label: '邮箱',
                prop: 'email',
                showOverflowTooltip: true,
            }, {
                label: '供应商状态',
                prop: 'status',
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '来源',
                prop: 'source',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.source[cell];
                },
            }, {
                label: '备注',
                prop: 'description',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                required: true,
            }, {
                label: '供应商编号',
                prop: 'supplierCode',
                value: '',
                required: true,
            }, {
                label: '供应商状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.supplier_status,
                required: true,
            }, {
                label: '联系人',
                prop: 'contact',
                value: '',
            }, {
                label: '联系方式',
                prop: 'contactInformation',
                value: '',
                rule: [{
                    validator(rule, value, callback) {
                        let reg = /^((0\d{2,3}-\d{7,8})|(1[345678]\d{9}))$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的联系方式'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }]
            }, {
                label: '邮箱',
                prop: 'email',
                value: '',
                maxLength: 50,
                rule: [{
                    validator(rule, value, callback) {
                        let reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]+$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的邮箱号'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }]
            }, {
                label: '来源',
                prop: 'source',
                value: '',
                type: 'select',
                option: dict.source,
                disabled: true,
            }, {
                label: '备注',
                prop: 'description',
                type: 'textarea',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'purchase_prsupplierinfo_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'purchase_prsupplierinfo_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'purchase_prsupplierinfo_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        }
    },
    watch: {
        dialogType(val) {
            if (val === 'new') {
                this.dialogForm[1].disabled = false;
            } else {
                this.dialogForm[1].disabled = true;
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.currentRowKey = '';
            }
        },
    },
    mounted() {
        this.getData();
    },
    methods: {
        searchData() {
            this.conditionList = [];
            this.currentPage = 1;
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
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            this.$http.get(`/purchase/prsupplierinfo/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[2].value = '1';
            this.dialogForm[6].value = '0';
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (item.source === '1') {
                this.$message.error('供应商来源于SAP系统，不能修改');
                return;
            }
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            const delData = this.multiption.map(v => v.id);
            const isBoolean = this.multiption.some(v => {
                if (v.source === '1' || v.status === '1') {
                    this.$alert('供应商来源于SAP系统或者启用状态，不能删除', {
                        type: 'warning'
                    });
                    return true;
                }
                return false;
            });
            if (isBoolean) return;
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                // this.submitLoading = true;
                this.$http.delete('/purchase/prsupplierinfo/removeByIds', {
                    data: delData,
                }).then(() => {
                    // this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/purchase/prsupplierinfo/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/purchase/prsupplierinfo/updateById', obj).then(() => {
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    this.getData();
                    this.submitLoading = false;
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            }
        },
        exportAll() {
            // window.open('/purchase/prsupplierinfo/exportAll');
            this.$http.post(`/purchase/prsupplierinfo/exportAll`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '供应商.xls';
                    $a.click();
                }
            });
        },
        changeHandler(selection) {
            this.multiption = selection;
            this.currentRowKey = '';
        },
        selectExport() {
            const ids = this.multiption.map(v => v.id);
            // window.open(`/purchase/prsupplierinfo/export?id=${this.multipleSelection}`, '_blank');
            this.$http.post(`/purchase/prsupplierinfo/export`, ids, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '供应商.xls';
                    $a.click();
                }
            });
        },
    }
};
</script>
<style lang="stylus" scoped>
.supplier
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

