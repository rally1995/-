<template lang="pug">
    ebrain-main.config
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
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
                        @changeSize="changeSize"
                        @selection-change="changeHandler")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            :isShow="false"
            :isCancel="false"
            ref="dialog")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
</template>
<script>
import dict from '@/utils/dict';
export default {
    name: 'index',
    data() {
        return {
            conditionList: [],
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallytransport_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallytransport_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'tallymanager_tallytransport_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '装运路线编号',
                prop: 'transportCode',
                value: '',
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                value: '',
            }],
            tableLoading: false,
            currentRowKey: '',
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: [],
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '装运路线编号',
                prop: 'transportCode',
                showOverflowTooltip: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                showOverflowTooltip: true,
            }, {
                label: '装运路线状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }, {
                label: '来源',
                prop: 'source',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.source[cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            btnsForm: [{
                label: '保存',
                click: () => this.submitForm(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '关闭',
                click: () => this.closeDialog(),
                className: 'iconfont iconClose-',
                permi: false,
            }],
            submitLoading: false,
            dialogVisible: false,
            dialogType: '',
            dialogForm: [{
                label: '装运路线编号',
                prop: 'transportCode',
                value: '',
                required: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                value: '',
                required: true,
            }, {
                label: '装运路线状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.supplier_status,
                required: true,
            }, {
                label: '来源',
                prop: 'source',
                value: '',
                type: 'select',
                option: dict.source,
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }]
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        },
    },
    watch: {
        dialogType(val) {
            if (val === 'new') {
                this.dialogForm[0].disabled = false;
            } else {
                this.dialogForm[0].disabled = true;
            }
        }
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
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: v.value,
            //             joinType: 'AND',
            //         });
            //     }
            // });
            return this.$http.get(`/tallymanager/tallytransport/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[3].value = '0';
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogVisible = true;
            this.dialogType = 'edit';
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
        },
        delRow() {
            const delData = this.multiption.map(v => v.id);
            const status = this.multiption.map(v => v.status);
            if (status.includes('1')) {
                this.$alert('该数据状态为已启用，不可删除！', {
                    type: 'warning'
                });
                return;
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallytransport/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
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
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeHandler(selection) {
            this.multiption = selection;
            this.currentRowKey = '';
        },
        closeDialog() {
            this.dialogVisible = false;
        },
        submitForm() {
            const updata = () => {
                let obj = {};
                this.dialogForm.forEach(v => {
                    obj[v.prop] = v.value;
                });
                if (this.dialogType === 'new') {
                    return this.$http.post('/tallymanager/tallytransport/save', obj).then(() => {
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.getData();
                        this.dialogVisible = false;
                    });
                } else {
                    obj.id = this.currentRowKey;
                    return this.$http.put('/tallymanager/tallytransport/updateById', obj).then(() => {
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.getData();
                        this.currentRowKey = '';
                        this.dialogVisible = false;
                    });
                }
            };
            return new Promise((resolve, reject) => {
                this.$refs.dialog.$refs.form.validate(valid => {
                    if (valid) {
                        updata().then(() => {
                            resolve();
                        });
                    }
                });
            });
        },
        submitAndClear() {
            this.submitForm().then(() => {
                this.dialogForm.forEach(v => {
                    v.value = '';
                });
                this.$refs.dialog.$refs.form.resetFields();
            });
        }
    }
};
</script>
<style lang="stylus" scoped>
    .config
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

