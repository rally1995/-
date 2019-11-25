<template lang="pug">
    ebrain-main.partsclass
        ebrain-frame(
            title="零部件分类")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    ref="table"
                    :loading="loading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change="changeSize"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="selectionChange"
                    :highlight-current-row="false")
        ebrain-dialog(
            ref="form"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="15vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
export default {
    name: 'equiscraporder',
    data() {
        return {
            conditionList: [],
            isDelete: false,
            rowKeyObj: {},
            isDisabled: false,
            ids: [],
            selection: [],
            unitCode: '',
            type: '',
            rowObj: {},
            dialogSearchForm: {},
            dialogParent: '',
            submitLoading: false,
            dialogVisibleParent: false,
            loading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableDataParent: [],
            tableColumnParent: [{
                label: '零部件分类编码',
                prop: 'sparePartType',
                showOverflowTooltip: true,
            }, {
                label: '零部件分类名称',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.status[cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '零部件分类编码',
                prop: 'sparePartType',
                value: '',
                disabled: true,
            }, {
                label: '零部件分类名称',
                prop: 'sparePartTypeName',
                value: '',
                required: true,
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: () => dict.status,
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_sparepartstype_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1 || this.selection[0].status !== '0',
                permi: 'basicdata_sparepartstype_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0 || this.isDelete,
                permi: 'basicdata_sparepartstype_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '启用',
                click: () => this.star(),
                className: 'iconfont iconstatus-start-up',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '停用',
                click: () => this.stop(),
                className: 'iconfont iconState-Stop',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '零部件分类名称',
                prop: 'sparePartTypeName',
                value: ''
            }],
            searchVisible: true,
            btnsDialog: [{
                label: '保存',
                loading: false,
                click: () => this.submitForm(),
                disabled: false,
                className: 'iconfont iconstatus-Preservation-',
                permi: false,
            }, {
                label: '取消',
                click: () => this.cancel(),
                className: 'iconfont iconstatus-Import',
                permi: false,
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            permissions: state => state.permissions,
        }),
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'sparePartTypeName' || v.prop === 'remark') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.getDateParent();
                this.$refs.table.clearSelection();
            }
        }
    },
    created() {
        this.getDateParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        // 搜索清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.currentPage = 1;
            this.getDateParent();
        },
        // 获取上表列表
        getDateParent() {
            this.loading = true;
            this.$http.get('/basicdata/sparepartstype/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.loading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 提交form表单
        submitForm() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.declarationUnit = this.unitCode;
            delete obj.sparePartType;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/basicdata/sparepartstype/save', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                            this.currentPage = 1;
                            // this.getDateParent();
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.rowKeyObj.id;
                        this.$http.put('/basicdata/sparepartstype/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            // this.getDateParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                        });
                    }
                }
            });
        },
        // 上表新增
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[2].value = '0';
        },
        // 上表修改
        editRowParent(row) {
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.unitCode = this.rowKeyObj.declarationUnit;
            this.dialogVisibleParent = true;
        },
        // 上表页码
        changeCurrent(val) {
            this.currentPage = val;
            this.getDateParent();
        },
        // 上表页面数据数量
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDateParent();
        },
        selectionChange(selection) {
            this.isDelete = false;
            this.selection = selection;
            this.selection.forEach(item => {
                if (item.status !== '0') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/sparepartstype/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentPage = 1;
                    this.getDateParent();
                    this.$refs.table.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        look(row) {
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.isDisabled = true;
            this.btnsDialog[0].disabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('basicdata_sparepartstype_edit') && row.status === '0') {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        star() {
            if (this.selection[0].status === '1') {
                this.$message({
                    message: `分类编码[${this.selection[0].sparePartType}]已被启用,无需在启用`,
                    type: 'warning'
                });
            } else {
                this.$confirm(`你确定启用分类编码[${this.selection[0].sparePartType}]吗？`, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get(`/basicdata/sparepartstype/getEnabling/${this.selection[0].id}`).then(res => {
                        this.$message({
                            message: `分类编码[${res.data.sparePartType}]已被启用成功！`,
                            type: 'success'
                        });
                        this.getDateParent();
                    });
                });
            }
        },
        stop() {
            if (this.selection[0].status === '2') {
                this.$message({
                    message: `分类编码[${this.selection[0].sparePartType}]已被停用,无需在停用`,
                    type: 'warning'
                });
            } else if (this.selection[0].status === '0') {
                this.$message({
                    message: `分类编码[${this.selection[0].sparePartType}]未启用，不能停用！`,
                    type: 'warning'
                });
            } else {
                this.$confirm(`你确定停用分类编码[${this.selection[0].sparePartType}]吗？`, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get(`/basicdata/sparepartstype/getDiscontinuation/${this.selection[0].id}`).then(res => {
                        this.$message({
                            message: `分类编码[${res.data.sparePartType}]已成功被停用！`,
                            type: 'success'
                        });
                        this.getDateParent();
                    });
                });
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.partsclass
    & >>> .frame
        .fr
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