<template lang="pug">
    ebrain-main
        ebrain-frame(:title="$route.name")
            template(#tools)
                    ebrain-tools(
                        :add="newRow"
                        :edit="editRow"
                        :del="delRow"
                        :editDisabled="editDisabled"
                        :delDisabled="editDisabled")
            template(#table)
                ebrain-table(
                    ref="table"
                    :isShow='false'
                    :data="tableData"
                    row-key="id"
                    :column="tableColumn"
                    highlight-current-row
                    @current-change="currentChange"
                    :current-row-key.sync="currentRowKey"
                    @row-dblclick="editRow")
        ebrain-dialog(
            :visible.sync="dialogVisible"
            :submitLoading='submitLoading'
            :form.sync="dialogForm"
            @submit="submitForm")
</template>

<script>
export default {
    name: 'Dept',
    data() {
        return {
            rowObj: {},
            tableData: [],
            tableColumn: [{
                label: '标题',
                prop: 'deptName',
                minWidth: 160,
            }, {
                label: '部门编码',
                prop: 'deptCode',
            }, {
                label: '部门名称',
                prop: 'deptName',
            }, {
                label: '英文简称',
                prop: 'deptEnName',
            }, {
                label: '排序',
                prop: 'sort',
                sortable: true,
            }],
            dialogVisible: false,
            submitLoading: false,
            dialogForm: [{
                label: '部门名称',
                prop: 'deptName',
                required: true,
                value: '',
            }, {
                label: '上级部门ID',
                prop: 'parentId',
                type: 'selecttree',
                option: [],
                required: true,
                value: '',
                nodeKey: 'id',
                nodeLabel: 'deptName',
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogForm[0].value !== '' && this.dialogType !== 'new') {
                            const item = this.enumer(this.tableData);
                            if (item.id === value) {
                                callback(new Error('不能输入和自己相同的节点'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'change',
                },
            }, {
                label: '部门编码',
                prop: 'deptCode',
                required: true,
                value: '',
            }, {
                label: '英文简称',
                prop: 'deptEnName',
                required: true,
                value: '',
            }, {
                label: '排序',
                prop: 'sort',
                value: '',
                type: 'sort'
            }],
            currentRowKey: '',
            dialogType: '',
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'sys_dept_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'sys_dept_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'sys_dept_del',
                disabled: () => this.editDisabled,
            }],
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    created() {
        this.queryTree();
    },
    methods: {
        queryTree() {
            this.$http.get('/admin/dept/tree').then(res => {
                this.tableData = res.data;
                const dialogItem = this.dialogForm.find(v => v.prop === 'parentId');
                const root = {
                    id: '0',
                    deptName: '无',
                };
                dialogItem.option = [root, ...res.data];
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
        currentChange(row) {
            this.rowObj = row;
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[1].value = '0';
            if (this.rowObj.hasOwnProperty('deptCode')) {
                this.dialogForm[1].value = this.rowObj.id;
            } else {
                this.dialogForm[1].value = '0';
            }
            // const current = this.enumer(this.tableData, this.currentRowKey);
            // let item = this.dialogForm.find(v => v.prop === 'parentId');
            // item.value = current && current.id;
        },
        editRow() {
            const current = this.enumer(this.tableData, this.currentRowKey);
            let item2 = this.dialogForm.find(v => v.prop === 'parentId');
            item2.value = current && current.id;
            const item = this.enumer(this.tableData);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        enumer(target, key) {
            let i = null;
            for (let v of target) {
                if (v.id === this.currentRowKey) {
                    i = v;
                    v.disabled = true;
                    break;
                } else {
                    if (v.children && v.children.length) {
                        i = this.enumer(v.children);
                        if (i) break;
                    }
                }
            }
            return i;
        },
        delRow() {
            const item = this.enumer(this.tableData);
            if (item.children.length !== 0) {
                this.$message({
                    message: '请先清除子部门后再删除!',
                    type: 'error'
                });
            } else {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete('/admin/dept/' + this.currentRowKey).then(() => {
                        this.queryTree();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKey = '';
                    });
                });
            }
        },
        submitForm() {
            let obj = {};
            this.submitLoading = true;
            const finish = () => {
                this.queryTree();
                this.dialogVisible = false;
                this.submitLoading = false;
            };
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            if (this.dialogType === 'new') {
                this.$http.post('/admin/dept', obj).then(() => {
                    this.dialogVisible = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    finish();
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.deptId = this.currentRowKey;
                this.$http.put('/admin/dept', obj).then(() => {
                    this.dialogVisible = false;
                    finish();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        }
    }
};
</script>

<style scoped>

</style>
