<template lang="pug">
    ebrain-main.costcenter
        ebrain-frame(title="成本中心")
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
                    @row-dblclick="editRow"
                    @row-click="getDataSon"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
        ebrain-frame(title="工作中心")
            template(#tools)
                ebrain-tools(:buttons="btnsSon")
                .search(
                    :class="{hide:searchVisibleSon}")
                    ebrain-search(
                        :form="searchFormSon"
                        @search="searchSon"
                        @reset="resetSon")
            template(#table)
                    ebrain-table(
                        :tableLoading='tableLoadingSon'
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySon"
                        row-key="id"
                        :data="tableDataSon"
                        :column="tableColumnSon"
                        :pageSize="pageSizeSon"
                        :currentPage="currentPageSon"
                        :pageTotal="pageTotalSon"
                        @row-dblclick="editRowSon"
                        @changeCurrent="changeCurrentSon"
                        @changeSize='changeSizeSon')
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
        ebrain-dialog(
            :submitLoading='submitLoadingSon'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#workCenterName)
                el-col(:span="12")
                    el-form-item(label="工作中心名称" required prop="workCenterName")
                        el-input(readonly=true v-model="dialogFormSon[1].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork_1"
            @resetDialog="resetDialog_1"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="50vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @current-change="currentChange"
            @submit="submitFormDialogTable")
</template>

<script>
// import dict from '@/utils/dict';
export default {
    name: 'index',
    data() {
        return {
            conditionListSon: [],
            conditionList: [],
            conditionListDown: [],
            rowObj: {},
            listDetailsData: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: '',
            searchVisible: true,
            listDetailsColumn: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
                searchBy: true,
            // }, {
            //     label: '产品工艺编码',
            //     prop: 'processCode',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '产品工艺名称',
            //     prop: 'processName',
            //     showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            searchForm: [{
                label: '成本中心编码',
                prop: 'costCenterCode',
                value: '',
            }, {
                label: '成本中心名称',
                prop: 'costCenterName',
                value: '',
            }],
            tableColumn: [{
                label: '成本中心编码',
                prop: 'costCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '成本中心名称',
                prop: 'costCenterName',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '成本中心编码',
                prop: 'costCenterCode',
                value: '',
                required: true,
            }, {
                label: '成本中心名称',
                prop: 'costCenterName',
                value: '',
                required: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
                // required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_costcentercode_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'basicdata_costcentercode_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabled,
                permi: 'basicdata_costcentercode_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogTableLoading: false,
            currentRowKeyDialogTable: '',
            dialogVisibleTable: false,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            submitLoadingSon: false,
            tableLoadingSon: false,
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            multiptionSon: '',
            searchVisibleSon: true,
            searchFormSon: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: '',
            }],
            tableColumnSon: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            },
            // {
            //     label: '工艺编码',
            //     prop: 'processCode',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '工艺名称',
            //     prop: 'processName',
            //     showOverflowTooltip: true,
            // },
            {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormSon: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
                disabled: true,
            }, {
                slot: 'workCenterName',
                label: '工作中心名称',
                prop: 'workCenterName',
                value: '',
            },
            //  {
            //     label: '工艺编码',
            //     prop: 'processCode',
            //     value: '',
            //     disabled: true,
            // }, {
            //     label: '工艺名称',
            //     prop: 'processName',
            //     value: '',
            //     disabled: true,
            // },
            {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
                disabled: true,
            }],
            btnsSon: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_workcenter_add',
            // }, {
            //     label: '修改',
            //     click: () => this.editRowSon(),
            //     className: 'iconfont iconstatus-edit',
            //     disabled: () => this.editDisabledSon,
            //     permi: 'basicdata_materialport_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabledSon,
                permi: 'devicemanager_workcenter_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            currentRowKeySon: '',
            dialogTypeSon: '',
            dialogVisibleSon: false,
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        editDisabledSon() {
            return !this.currentRowKeySon;
        }
    },
    watch: {
        dialogType(val) {
            this.dialogForm[0].disabled = !(val === 'new');
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm_1 = {};
            }
        }
    },
    activated() {
        this.getData();
        this.currentRowKey = '';
        this.tableDataSon = [];
    },
    mounted() {
        this.getData();
    },
    methods: {
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get(`/basicdata/costcentercode/page`, {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                }
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
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            if (this.tableDataSon.length) {
                this.$alert('存在子表, 不可删除', '提示', {
                    type: 'error',
                });
            } else {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete('/basicdata/costcentercode/removeByIds', {
                        data: [this.currentRowKey],
                    }).then(() => {
                        this.submitLoading = false;
                        this.getData();
                        this.tableDataSon = [];
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKey = '';
                    });
                });
            }
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
                this.$http.post('/basicdata/costcentercode/save', obj).then(() => {
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
                this.$http.put('/basicdata/costcentercode/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            }
        },
        searchSon() {
            this.conditionListDown = [];
            this.searchFormSon.forEach(v => {
                if (v.value) {
                    this.conditionListDown.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.currentPageSon = 1;
            this.getDataSon();
        },
        getDataSon() {
            this.tableLoadingSon = true;
            if (this.currentRowKey) {
                const item = this.tableData.find(v => v.id === this.currentRowKey);
                this.conditionListSon = [{
                    fieldName: 'costCenterCode',
                    operation: 'EQ',
                    value: encodeURI(item.costCenterCode),
                }, ...this.conditionListDown];
            }
            this.$http.get(`/basicdata/workcenter/page`, {
                params: {
                    current: this.currentPageSon,
                    size: this.pageSizeSon,
                    conditionList: this.conditionListSon,
                }
            }).then(({ code, data }) => {
                this.tableDataSon = data.records;
                this.pageTotalSon = data.total;
                this.tableLoadingSon = false;
            }).catch(() => {
                this.tableLoadingSon = false;
            });
        },
        newRowSon() {
            this.dialogTypeSon = 'new';
            this.dialogVisibleSon = true;
        },
        editRowSon() {
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogTypeSon = 'edit';
            this.dialogVisibleSon = true;
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                item.costCenterCode = null;
                this.submitLoadingSon = true;
                this.$http.put('/basicdata/workcenter/updateById', item).then(() => {
                    this.submitLoadingSon = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                });
            });
        },
        changeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        changeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        resetSon() {
            this.searchFormSon.forEach(item => {
                item.value = '';
            });
        },
        submitFormSon() {
            let obj = this.rowObj;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            obj.costCenterCode = item.costCenterCode;
            obj.costCenterName = item.costCenterName;
            this.submitLoadingSon = true;
            this.$http.put('/basicdata/workcenter/updateById', obj).then(() => {
                this.submitLoadingSon = false;
                this.$message({
                    message: '保存成功!',
                    type: 'success'
                });
                this.currentRowKeySon = '';
                this.getDataSon();
                this.dialogVisibleSon = false;
            }).catch(v => {
                this.submitLoadingSon = false;
            });
            // }
        },
        submitFormDialogTable() {
            this.dialogVisibleTable = false;
            this.dialogFormSon[0].value = this.rowObj.workCenterCode;
            this.dialogFormSon[1].value = this.rowObj.workCenterName;
            this.dialogFormSon[2].value = this.rowObj.remark;
        },
        enterTableDetails() {
            this.dialogVisibleTable = true;
            this.getWorkCenterInfo();
        },
        // 列表内搜索
        searchFormWork_1(form) {
            this.dialogSearchForm_1 = form;
            this.getWorkCenterInfo();
        },
        // 列表内清空
        resetDialog_1(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        // 获取工序信息
        getWorkCenterInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'costCenterCode',
                    operation: 'ISNULL',
                }]
            };
            if (this.dialogSearchForm_1) {
                for (let i in this.dialogSearchForm_1) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm_1, i)) {
                        if (this.dialogSearchForm_1[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm_1[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/workcenter/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getWorkCenterInfo();
        },
        changeCurrent_1(val) {
            this.getWorkCenterInfo(val);
        },
        // 获取弹出表  点击时的数据
        currentChange(row) {
            this.rowObj = row;
        },
    }
};
</script>
<style lang="stylus" scoped>
.costcenter
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

