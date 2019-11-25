<template lang="pug">
    ebrain-main.personnel
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchParent"
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
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRow")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>

<script>
import dict from '@/utils/dict';

export default {
    name: 'Client',
    data() {
        return {
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
                label: '员工姓名',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
            }, {
                label: '性别',
                prop: 'personnelSex',
                formatter(row, column, cell) {
                    return dict.personnelSex[cell];
                },
            }, {
                label: '手机号',
                prop: 'personnelPhone',
                showOverflowTooltip: true,
            }, {
                label: '部门编码',
                prop: 'departmentCode',
                showOverflowTooltip: true,
            }, {
                label: '部门名称',
                prop: 'departmentName',
                showOverflowTooltip: true,
            }, {
                label: '岗位',
                prop: 'postName',
                showOverflowTooltip: true,
            }, {
                label: '是否有效',
                prop: 'delFlag',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.delFlag[cell];
                },
            }, {
                label: '是否在岗',
                prop: 'whetherPersonnel',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.dicPersonnel[cell];
                },
            }, {
                label: '年龄',
                prop: 'personnelAge',
                showOverflowTooltip: true,
            }, {
                label: '入职日期',
                prop: 'personnelEntryTime',
                showOverflowTooltip: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }, {
                label: '修改时间',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }, {
                label: '联系地址',
                prop: 'personnelAddress',
                showOverflowTooltip: true,
            }, {
                label: '电子邮件',
                prop: 'personnelEmail',
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '员工姓名',
                prop: 'personnelFullName',
                value: '',
                required: true,
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                value: '',
                required: true,
            }, {
                label: '性别',
                prop: 'personnelSex',
                value: '',
                required: true,
                type: 'select',
                option: dict.personnelSex,
            }, {
                label: '手机号',
                prop: 'personnelPhone',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^([1][3,4,5,7,8]\d{9})$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入11位有效的手机号'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }
            }, {
                label: '部门编号',
                prop: 'departmentCode',
                value: '',
                readonly: true,
                placeholder: '请选择部门名称'
            }, {
                label: '部门名称',
                prop: 'departmentName',
                value: '',
                type: 'select',
                option: {},
                required: true,
                change: val => {
                    this.dialogForm[4].value = val;
                }
            }, {
                label: '岗位',
                prop: 'post',
                value: '',
                type: 'select',
                option: {},
                required: true,
            }, {
                label: '是否在岗',
                prop: 'whetherPersonnel',
                value: '',
                type: 'select',
                option: dict.dicPersonnel,
                required: true,
            }, {
                label: '年龄',
                prop: 'personnelAge',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const val = Number(value);
                        if (isNaN(val)) {
                            return callback(new Error('请输入数字'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }
            }, {
                label: '入职日期',
                prop: 'personnelEntryTime',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '电子邮件',
                prop: 'personnelEmail',
                value: '',
            }, {
                label: '联系地址',
                prop: 'personnelAddress',
                value: '',
                type: 'textarea'
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            searchForm: [{
                label: '员工姓名',
                prop: 'personnelFullName',
                value: '',
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                value: '',
            }],
            routeCode: '',
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicpersonnel_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicpersonnel_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicpersonnel_del',
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
        searchParent() {
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
            this.$http.get('/basicdata/dicpersonnel/page', {
                params: {
                    conditionList: this.conditionList,
                    current: this.currentPage,
                    size: this.pageSize,
                }
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
        getDepartmentCode() {
            return this.$http.get('/basicdata/dicpersonnel/departmentCode').then(res => {
                let item = this.dialogForm.find(v => v.prop === 'departmentName');
                res.data.forEach(v => {
                    item.option[v.deptCode] = v.deptName;
                });
            });
        },
        getDicpost() {
            return this.$http.get('/basicdata/dicpersonnel/getPostAll').then(res => {
                let item = this.dialogForm.find(v => v.prop === 'post');
                res.data.forEach(v => {
                    item.option[v.postCode] = v.postName;
                });
            });
        },
        newRow() {
            this.dialogType = 'new';
            Promise.all([this.getDepartmentCode(), this.getDicpost()]).then(() => {
                this.dialogVisible = true;
            });
            this.dialogForm[8].value = '0';
        },
        editRow() {
            Promise.all([this.getDepartmentCode(), this.getDicpost()]).then(() => {
                this.dialogVisible = true;
            });
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
        },
        delRow() {
            this.$confirm('是否继续删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete(`/basicdata/dicpersonnel/${this.currentRowKey}`).then(() => {
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
            const finish = () => {
                this.getData();
                this.dialogVisible = false;
            };
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/dicpersonnel', obj).then(() => {
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
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/dicpersonnel', obj).then(() => {
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
        }
    }
};
</script>

<style scoped lang="stylus">
.personnel
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
