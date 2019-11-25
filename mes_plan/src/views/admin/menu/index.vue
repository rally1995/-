<template lang="pug">
    ebrain-main
        ebrain-frame(:title="$route.name")
            template(#tools)
                    ebrain-tools(:buttons="btns")
            template(#table)
                ebrain-table(
                    :isShow='false'
                    @row-dblclick="editRow"
                    :data="tableData"
                    row-key="id"
                    :column="tableColumn"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey")
        ebrain-dialog(
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>

<script>
import dict from '@/utils/dict';

export default {
    name: 'Menu',
    data() {
        return {
            tableData: [],
            tableColumn: [{
                label: '标题',
                prop: 'name',
                minWidth: 160,
                showOverflowTooltip: true,
            }, {
                label: '父节点',
                prop: 'parentId',
                formatter(row, col, cell, index) {
                    return cell === '-1' ? '-' : cell;
                }
            }, {
                label: '节点ID',
                prop: 'id',
            }, {
                label: '权限标识',
                prop: 'authority',
                showOverflowTooltip: true,
            }, {
                label: '图标',
                prop: 'icon',
                showOverflowTooltip: true,
            }, {
                label: '类型',
                prop: 'type',
                formatter(row, col, cell) {
                    return dict.type[cell];
                }
            }, {
                label: '排序',
                prop: 'sort',
            }, {
                label: '组件',
                prop: 'component',
                showOverflowTooltip: true,
            }, {
                label: '路径',
                prop: 'path',
                minWidth: 100,
                showOverflowTooltip: true,
            }, {
                label: '路由缓冲',
                prop: 'keepAlive',
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '标题',
                prop: 'name',
                value: '',
                required: true,
            }, {
                label: '父节点',
                prop: 'parentId',
                type: 'selecttree',
                option: [],
                required: true,
                value: '',
            }, {
                label: '节点ID',
                prop: 'menuId',
                required: true,
                value: '',
                disabled: false,
            }, {
                label: '权限标识',
                prop: 'permission',
                value: '',
                maxLength: false
            }, {
                label: '图标',
                prop: 'icon',
                value: '',
                maxLength: false
            }, {
                label: '类型',
                prop: 'type',
                value: '',
                type: 'select',
                required: true,
                option: dict.type,
            }, {
                label: '排序',
                prop: 'sort',
                type: 'sort',
                value: '',
            }, {
                label: '组件',
                prop: 'component',
                value: '',
                maxLength: false
            }, {
                label: '路径',
                prop: 'path',
                value: '',
                maxLength: false
            }],
            currentRowKey: '',
            dialogType: '',
            parentId: '',
            btns: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'sys_menu_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'sys_menu_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'sys_menu_del',
                disabled: () => this.editDisabled,
            }]
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    watch: {
        dialogType(val) {
            this.dialogForm[2].disabled = val === 'edit';
        },
    },
    created() {
        this.queryTree();
    },
    methods: {
        queryTree() {
            this.$http.get('/admin/menu/tree').then(res => {
                this.tableData = res.data;
                const item = this.dialogForm.find(v => v.prop === 'parentId');
                const root = {
                    id: '-1',
                    label: '无',
                };
                item.option = [root, ...res.data];
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            this.$http.get(`/admin/menu/${this.currentRowKey}`).then(({ data }) => {
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop];
                });
                this.dialogType = 'edit';
                this.dialogVisible = true;
            });
            // const enumer = (target) => {
            //     let i = null;
            //     for (let v of target) {
            //         if (v.id === this.currentRowKey) {
            //             i = v;
            //             break;
            //         } else {
            //             if (v.children && v.children.length) {
            //                 i = enumer(v.children);
            //                 if (i) break;
            //             }
            //         }
            //     }
            //     return i;
            // };
            // const item = enumer(this.tableData);
            // this.dialogForm.forEach(v => {
            //     v.value = item[v.prop];
            // });
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/admin/menu/' + this.currentRowKey).then(() => {
                    this.queryTree();
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
            const finish = () => {
                this.queryTree();
                this.dialogVisible = false;
            };
            this.dialogForm.forEach(v => {
                // if (v.prop === 'id') obj['menuId'] = v.value;
                obj[v.prop] = v.value;
            });
            if (this.dialogType === 'new') {
                this.$http.post('/admin/menu', obj).then(() => {
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    finish();
                });
            } else {
                this.$http.put('/admin/menu', obj).then(() => {
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    finish();
                });
            }
        }
    }
};
</script>

<style scoped>

</style>
