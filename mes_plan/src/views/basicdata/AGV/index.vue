<template lang="pug">
    ebrain-main.AGV
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnTop")
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
                    @selection-change="selectChange"
                    @changeSize='changeSize')
        ebrain-dialog-table(
            height="50vh"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :data="tableData_table"
            :column="tableColumn_table"
            :visible.sync="dialogVisibleDialogTable"
            :current-row-key.sync="currentRowKeyDialogTable"
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            :pageTotal="pageTotal_table"
            @search="searchDialog"
            @resetDialog="resetDialog"
            dialogTableSearch
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @row-click="getStation"
            highlight-current-row
            @submit="submitFormDialog_table")
        ebrain-dialog.dialog_form(
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
            dialogSearchForm: {},
            conditionList: [],
            dialogTableLoading: false,
            relevanceType: '',
            tableColumn_table: [],
            selectionChange: [],
            stationCode: '',
            currentRowKeyDialogTable: '',
            dialogVisibleDialogTable: false,
            tableData_table: [],
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [{
                type: 'selection',
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: 'AGV站点编码',
                prop: 'siteNo',
                showOverflowTooltip: true,
            }, {
                label: '关联分类主体编号',
                prop: 'siteItemNo',
                showOverflowTooltip: true,
            }, {
                label: '站点分类',
                prop: 'siteType',
                formatter(row, column, cell) {
                    return dict.siteType[cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'siteState',
                formatter(row, column, cell) {
                    return dict.siteState[cell];
                },
                showOverflowTooltip: true,
            }],
            tableColumnStation: [{
                label: '工位编号',
                prop: 'stationNo',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '工位名称',
                prop: 'stationName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '工位类型',
                prop: 'stationType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.stationType[cell];
                },
            }, {
                label: '工位描述',
                prop: 'stationDesc',
                showOverflowTooltip: true,
            }, {
                label: '是否暂存工位',
                prop: 'isTempStorage',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.whetherCrossDay[cell];
                }
            }, {
                label: '料台标记',
                prop: 'hasPlatform',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.platformMark[cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnMaterial: [{
                label: '料口编号',
                prop: 'mpNo',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '料口名称',
                prop: 'mpName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '料口区域编号',
                prop: 'mpAreaNo',
                showOverflowTooltip: true,
            }, {
                label: '料口区域名称',
                prop: 'mpAreaName',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: 'AGV站点编码',
                prop: 'siteNo',
                value: '',
                disabled: false,
                required: true,
            }, {
                label: '关联分类主体编号',
                prop: 'siteItemNo',
                value: '',
                disabled: true,
            }, {
                label: '站点分类',
                prop: 'siteType',
                value: '',
                type: 'select',
                option: dict.siteType,
                disabled: true,
            }, {
                label: '状态',
                prop: 'siteState',
                value: '',
                type: 'select',
                option: dict.siteState,
            }],
            searchVisible: true,
            dialogVisible: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            type: '',
            btnTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'transportmanager_transportsite_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'transportmanager_transportsite_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'transportmanager_transportsite_dels',
                disabled: () => this.selectionChange.length === 0,
            }, {
                label: '关联工位',
                click: () => this.relevanceS(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.editDisabled,
                permi: 'basicdata_transportsite_edit',
            }, {
                label: '关联料口',
                click: () => this.relevanceM(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.editDisabled,
                permi: 'basicdata_transportsite_edit',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: 'AGV站点编码',
                prop: 'siteNo',
                value: '',
            }, {
                label: '关联分类主体编号',
                prop: 'siteItemNo',
                value: '',
            }]
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    watch: {
        dialogVisibleDialogTable(val) {
            if (!val) {
                this.pageSize_table = 20;
                this.currentPage_table = 1;
                this.pageTotal_table = 0;
                this.dialogSearchForm = {};
            }
        }
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
            this.$http.get('/transportmanager/transportsite/page', {
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
        relevanceS(val = 1) {
            this.relevanceType = 'relevanceS';
            this.tableColumn_table = this.tableColumnStation;
            this.stationCode = '';
            this.dialogVisibleDialogTable = true;
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_table,
                conditionList: [],
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/productionexe/station/page`, {
                params
            }).then(res => {
                this.dialogTableLoading = false;
                this.tableData_table = res.data.records;
                this.pageTotal_table = res.data.total;
                this.currentPage_table = val;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        relevanceM(val = 1) {
            this.relevanceType = 'relevanceM';
            this.mpNo = '';
            this.tableColumn_table = this.tableColumnMaterial;
            this.dialogVisibleDialogTable = true;
            this.dialogTableLoading = true;
            let params = {
                current: val,
                size: this.pageSize_table,
                conditionList: [],
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/transportmanager/materialport/page`, {
                params
            }).then(res => {
                this.dialogTableLoading = false;
                this.tableData_table = res.data.records;
                this.pageTotal_table = res.data.total;
                this.currentPage_table = val;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        searchDialog(form) {
            this.currentPage_table = 1;
            this.dialogSearchForm = form;
            switch (this.relevanceType) {
                case 'relevanceS':
                    this.relevanceS();
                    break;
                case 'relevanceM':
                    this.relevanceM();
                    break;
                default:
                    break;
            }

        },
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrent_table(val) {
            switch (this.relevanceType) {
                case 'relevanceS':
                    this.relevanceS(val);
                    break;
                case 'relevanceM':
                    this.relevanceM(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            switch (this.relevanceType) {
                case 'relevanceS':
                    this.relevanceS();
                    break;
                case 'relevanceM':
                    this.relevanceM();
                    break;
                default:
                    break;
            }
        },
        getStation(row) {
            this.row = row;
            if (this.relevanceType === 'relevanceS') {
                this.stationCode = row.stationNo;
            } else {
                this.mpNo = row.mpNo;
            }
        },
        submitFormDialog_table() {
            if (this.relevanceType === 'relevanceS') {
                if (!this.stationCode) {
                    this.$alert('请选择工位信息!', {
                        type: 'warning',
                    });
                } else {
                    let obj = {};
                    obj.id = this.currentRowKey;
                    obj.siteItemNo = this.stationCode;
                    obj.siteType = '1';
                    this.$http.put('/transportmanager/transportsite/updateById', obj).then(() => {
                        this.getData();
                        this.$message({
                            message: '关联成功!',
                            type: 'success'
                        });
                        this.dialogVisibleDialogTable = false;
                    });
                }
            } else {
                if (!this.mpNo) {
                    this.$alert('请选择料口信息!', {
                        type: 'warning',
                    });
                } else {
                    let obj = {};
                    obj.id = this.currentRowKey;
                    obj.siteItemNo = this.mpNo;
                    obj.siteType = '2';
                    this.$http.put('/transportmanager/transportsite/updateById', obj).then(() => {
                        this.getData();
                        this.$message({
                            message: '关联成功!',
                            type: 'success'
                        });
                        this.dialogVisibleDialogTable = false;
                    });
                }
            }
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[0].disabled = false;
            this.dialogForm[3].value = '1';
        },
        editRow() {
            this.dialogForm[0].disabled = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
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
                this.$http.delete(`/transportmanager/transportsite/removeByIds`, {
                    data: this.selectionChange,
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
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
                this.$http.post('/transportmanager/transportsite/save', obj).then(() => {
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
                this.$http.put('/transportmanager/transportsite/updateById', obj).then(() => {
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
        },
        selectChange(selection) {
            this.selectionChange = selection.map(v => v.id);
        }
    }
};
</script>

<style scoped lang="stylus">
.AGV
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
.dialog_form
    >>> .el-dialog
        width 800px
        .el-form-item__label
            width 124px !important
        .el-form-item__content
            width calc(100% - 124px)
</style>
