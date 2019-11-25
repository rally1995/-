<template lang="pug">
    ebrain-main.assetststuschange
        ebrain-frame(
            title="资产状态变更")
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
            template(#equipmentNum)
                el-col(:span="12")
                    el-form-item(label="设备编码" prop="equipmentNum" required)
                        el-input(readonly=true v-model="dialogFormParent[1].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('equipmentNum')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="dialogColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialog")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'assetststuschange',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            rowKeyObj: {},
            isDelete: false,
            assetStatusChangeId: '',
            isDisabled: false,
            ids: [],
            selection: [],
            unitCode: '',
            dialogTableLoading: false,
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogVisible: false,
            dialogData: [],
            currentRowKeyDialog: '',
            dialogSearchForm: {},
            dialogParent: '',
            submitLoading: false,
            dialogVisibleParent: false,
            loading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableDataParent: [],
            dialogColumn: [{
                label: '设备编码',
                prop: 'equipNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
                searchBy: true,
            // }, {
            //     label: '资产编号',
            //     prop: 'assetNum',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '资产状态',
            //     prop: 'assetStatus',
            //     showOverflowTooltip: true,
            //     formatter: (row, column, cell) => {
            //         return this.storeDict['asset_status'][cell];
            //     }
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                }
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '变更单号',
                prop: 'changeCode',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备资产编号',
                prop: 'assetNum',
                showOverflowTooltip: true,
            }, {
                label: '原资产状态',
                prop: 'oldAssetsStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['asset_status'][cell];
                }
            }, {
                label: '变更时间',
                prop: 'changeDate',
                showOverflowTooltip: true,
            }, {
                label: '现资产状态',
                prop: 'nowAssetsStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['asset_status'][cell];
                }
            }, {
                label: '审核状态',
                prop: 'reviewStatus',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '审核人',
                prop: 'reviewerPersonnelName',
                showOverflowTooltip: true,
            }, {
                label: '审核时间',
                prop: 'reviewerDate',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '变更单号',
                prop: 'changeCode',
                value: '',
                disabled: true,
            }, {
                label: '设备编号',
                slot: 'equipmentNum',
                prop: 'equipmentNum',
                value: '',
                required: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '资产编号',
                prop: 'assetNum',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '原资产状态',
                prop: 'oldAssetsStatus',
                value: '',
                disabled: true,
                placeholder: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['asset_status'],
            }, {
                label: '变更日期',
                prop: 'changeDate',
                value: '',
                required: true,
                type: 'datetime',
            }, {
                label: '现资产状态',
                prop: 'nowAssetsStatus',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['asset_status']
            }, {
                label: '变更原因',
                prop: 'changeReason',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '审核状态',
                prop: 'reviewStatus',
                value: '',
                disabled: true,
                type: 'select',
                option: dict.transferOutStauts,
            }, {
                label: '审核人',
                prop: 'reviewerPersonnelName',
                value: '',
                disabled: true,
            }, {
                label: '审核时间',
                prop: 'reviewerDate',
                value: '',
                type: 'datetime',
                disabled: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_assetstatuschange_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'basicdata_assetstatuschange_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0 || this.isDelete,
                permi: 'basicdata_assetstatuschange_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '变更单号',
                prop: 'changeCode',
                value: ''
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
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
                label: '审核',
                loading: false,
                click: () => this.submitStatus(),
                disabled: () => this.btnsDialog[0].label === '保存',
                className: 'iconfont iconstatus-Submission-',
                permi: 'basicdata_assetstatuschange_audit',
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
        editDisabled() {
            return !(this.selection.length === 1 && this.selection[0].reviewStatus === '0');
        },
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'changeDate' || v.prop === 'nowAssetsStatus' || v.prop === 'changeReason') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.assetStatusChangeId = '';
                this.getDateParent();
                this.$refs.table.clearSelection();
                this.rowObj = {};
                this.selection = [];
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('asset_status'),
            this.queryDict('device_classification'),
        ]).then(() => {
            this.getDateParent();
        });
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
            this.$http.get('/basicdata/assetstatuschange/page', {
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
        // 获取台账信息
        getParameterInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                operation: 'LIKE',
                                joinType: 'AND',
                                value: this.dialogSearchForm[i],
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/deviceaccount/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        enterTableDetails() {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.dialogVisible = true;
            this.getParameterInfo();
        },
        // 获取当前行
        currentChange(row) {
            this.rowObj = row;
        },
        changeCurrent_1(val) {
            this.getParameterInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getParameterInfo();
        },
        submitFormDialog() {
            this.dialogVisible = false;
            this.dialogFormParent[1].value = this.rowObj.equipNum;
            this.dialogFormParent[2].value = this.rowObj.equipName;
            this.dialogFormParent[3].value = this.rowObj.assetNum;
            this.dialogFormParent[4].value = this.rowObj.assetStatus;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getParameterInfo();
        },
        // 列表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        // 提交form表单
        submitForm() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            delete obj.changeCode;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/basicdata/assetstatuschange/saveAssetStatusChange', obj).then(res => {
                            this.assetStatusChangeId = res.data.id;
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogFormParent.forEach(v => {
                                v.value = res.data[v.prop];
                            });
                            // this.btnsDialog[0].label = '修改';
                            this.btnsDialog[1].disabled = false;
                            this.dialogParent = 'edit';
                            this.currentPage = 1;
                            // this.getDateParent();
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.assetStatusChangeId || this.rowKeyObj.id;
                        this.$http.put('/basicdata/assetstatuschange/updateById', obj).then(res => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            // this.getDateParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
                            // this.dialogVisibleParent = false;
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
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[1].disabled = true;
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[6].value = '1';
            this.dialogFormParent[8].value = '0';
        },
        // 上表修改
        editRowParent(row) {
            // this.btnsDialog[0].label = '修改';
            this.btnsDialog[1].disabled = false;
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.dialogVisibleParent = this.rowKeyObj.reviewStatus === '1' ? false : true;
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
                if (item.reviewStatus === '1') {
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
                this.$http.delete('/basicdata/assetstatuschange/removeByIds', {
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
        submitStatus() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.reviewerPersonnel = this.sysUser.userId;
            obj.reviewerDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.$confirm('是否完成审核？', '提示', {
                        type: 'warning'
                    }).then(() => {
                        this.btnsDialog[1].loading = true;
                        obj.id = this.assetStatusChangeId || this.rowKeyObj.id;
                        this.$http.post('/basicdata/assetstatuschange/audit', obj).then(() => {
                            this.btnsDialog[1].loading = false;
                            // this.getDateParent();
                            this.$message({
                                message: '审核成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                        }).catch(() => {
                            this.btnsDialog[1].loading = false;
                        });
                    });
                }
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
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[0].disabled = true;
            this.btnsDialog[1].disabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.rowKeyObj.reviewStatus !== '1' && this.permissions.includes('basicdata_assetstatuschange_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
.assetststuschange
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