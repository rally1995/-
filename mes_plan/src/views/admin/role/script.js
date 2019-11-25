import { mapActions } from 'vuex';

export default {
    name: 'Role',
    data() {
        return {
            searchVisible: true,
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '角色名',
                prop: 'roleName',
            }, {
                label: '标识',
                prop: 'roleCode',
                showOverflowTooltip: true,
            }, {
                label: '描述',
                prop: 'roleDesc',
                showOverflowTooltip: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '角色名',
                prop: 'roleName',
                required: true,
                value: '',
            }, {
                label: '标识',
                prop: 'roleCode',
                required: true,
                value: '',
            }, {
                label: '描述',
                prop: 'roleDesc',
                type: 'textarea',
                value: '',
            }],
            currentRowKey: '',
            dialogType: '',
            searchForm: [{
                label: '角色名',
                prop: 'roleName',
                value: '',
            }, {
                label: '标识',
                prop: 'roleCode',
                value: '',
            }],
            treeVisible: false,
            treeData: [],
            treeLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            btns: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'sys_role_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'sys_role_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'sys_role_del',
                disabled: () => this.editDisabled,
            }, {
                label: '权限',
                click: () => this.rowPermission(),
                className: 'iconfont iconstate-determination',
                permi: 'sys_role_perm',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchObj: {},
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    created() {
        this.getRole();
    },
    methods: {
        ...mapActions(['signout']),
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.searchObj = {};
            this.searchForm.forEach(v => {
                if (v.value) this.searchObj[v.prop] = v.value;
            });
            this.currentPage = 1;
            this.getRole();
        },
        getRole() {
            this.tableLoading = true;
            this.$http.get('/admin/role/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchObj,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getRole();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getRole();
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            const item = this.tableData.find(v => v.roleId === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/admin/role/' + this.currentRowKey).then(() => {
                    this.submitLoading = false;
                    this.getRole();
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
                this.$http.post('/admin/role', obj).then(() => {
                    this.submitLoading = false;
                    this.getRole();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.roleId = this.currentRowKey;
                this.$http.put('/admin/role', obj).then(() => {
                    this.submitLoading = false;
                    this.getRole();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        rowPermission() {
            this.treeData = [];
            this.treeVisible = true;
            this.treeLoading = true;
            const getTree = () => this.$http.get('/admin/menu/tree');
            const getChecked = () => this.$http.get(`/admin/menu/tree/${this.currentRowKey}`);
            Promise.all([getTree(), getChecked()]).then(res => {
                let [tree, permi] = res;
                this.treeData = tree.data;
                this.$nextTick(() => {
                    permi = permi.data.map(v => {
                        const item = this.$refs.tree.getNode(v);
                        return item && item.childNodes && item.childNodes.length ? null : v;
                    });
                    this.$refs.tree.setCheckedKeys(permi);
                    this.treeLoading = false;
                });
            });
        },
        permissionSubmit() {
            const menu = this.$refs.tree.getCheckedKeys();
            const menuRoot = this.$refs.tree.getHalfCheckedKeys();
            const menuIds = [...menu, ...menuRoot].join(',');
            const roleId = this.currentRowKey;
            this.$http.put('/admin/role/menu', { roleId, menuIds }).then(res => {
                const { data } = res;
                if (data) {
                    this.$message.success('修改成功');
                    this.treeVisible = false;
                    this.$alert('请重新登录!', {
                        type: 'warning'
                    }).then(() => {
                        this.signout();
                    });
                }
            });
        },
    }
};
