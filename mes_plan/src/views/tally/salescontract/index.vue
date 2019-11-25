<template lang="pug">
        ebrain-main.salescontract
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
                        :data="tableDatContract"
                        :column="tableColumnContract"
                        highlight-current-row
                        :tableLoading="submitLoadingContract"
                        :pageSize="pageSizeContract"
                        :currentPage="currentPageContract"
                        :pageTotal="pageTotalContract"
                        @changeCurrent="changeCurrentContract"
                        @changeSize="changeSizeContract"
                        @row-click="getContractSon"
                        @row-dblclick="editRowParent"
                        row-key="id"
                        :current-row-key.sync="currentRowKeyContract")
            ebrain-frame(title="销售合同物料明细")
                template(#table)
                    ebrain-table(
                        :data="tableDatContractSon"
                        :column="tableColumnContractSon"
                        highlight-current-row
                        :tableLoading="submitLoadingContractSon"
                        :pageSize="pageSizeContractSon"
                        :currentPage="currentPageContractSon"
                        :pageTotal="pageTotalContractSon"
                        @changeCurrent="changeCurrentContractSon"
                        @changeSize="changeSizeContractSon"
                        @select="handleContractSon"
                        row-key="id"
                        :current-row-key.sync="currentRowKeyContractSon")
            ebrain-dialog.table_dialog(
                top="10vh"
                :submitLoading="submitLoading"
                :visible.sync="dialogVisible"
                :expandVisible="collapse"
                :form.sync="dialogForm"
                :isShow="false"
                :isCancel="false"
                ref="dialog")
                template(#button)
                    ebrain-tools(:buttons="btnsForm")
                div(:class="{collapse}")
                    div.expand_toggle(@click="collapse = !collapse")
                        i.iconfont.icondouble_pull_top-copy
                ebrain-frame(title="销售合同物料明细")
                    template(#tools)
                        ebrain-tools(:buttons="btnsDown")
                    template(#table)
                        ebrain-table(
                            :data="tableDataDialog"
                            :column="tableColumnContractSon"
                            highlight-current-row
                            :tableLoading="dialogLoading"
                            :pageSize="pageSizeDialog"
                            :currentPage="currentDialog"
                            :pageTotal="pageTotalDialog"
                            @changeCurrent="changeCurrentDialog"
                            @changeSize="changeSizeDialog"
                            @select="handleContractSon"
                            row-key="id"
                            :current-row-key.sync="currentRowKeyDialog")
            ebrain-dialog.sale(
                @submit="submitFormDialog"
                :submitLoading="submitLoadingDialog"
                :visible.sync="dialogVisibleDialog"
                :form.sync="dialogFormDialog")
                template(#material="{value}")
                        el-col(:span="12")
                            el-form-item(label-width="110px" label="物料料号" :required="true" prop="materielNo")
                                el-input(style="cursor:pointer" :value="value" :readonly="true")
                                    el-button(slot="append"  @click="dialogSearchForm={};getMat()"  icon="iconfont iconsearch")
            ebrain-dialog-table(
                height="50vh"
                :data="tableDataMat"
                :column="tableColumnMat"
                :tableLoading="submitLoadingMat"
                :visible.sync="dialogVisibleMat"
                :pageSize="pageSizeMat"
                :currentPage="currentPageMat"
                :pageTotal="pageTotalMat"
                :disabled="!currentRowKeyMat"
                @changeCurrent="changeCurrentMat"
                @changeSize="changeSizeMat"
                @search="searchMat"
                @resetDialog="resetMat"
                dialogTableSearch
                row-key="id"
                :current-row-key.sync="currentRowKeyMat"
                @submit="submitFormMat")
</template>
<script>
import moment from 'moment';
export default {
    data() {
        return {
            searchForm: [{
                label: '销售合同号',
                prop: 'saleNo',
                value: '',
            }, {
                label: '客户名称',
                prop: 'customName',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallysale_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'tallymanager_tallysale_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'tallymanager_tallysale_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            tableDatContract: [],
            conditionList: [],
            searchVisible: true,
            submitLoadingContract: false,
            dialogVisibleContract: false,
            pageSizeContract: 20,
            currentPageContract: 1,
            pageTotalContract: 0,
            currentRowKeyContract: '',
            tableColumnContract: [{
                label: '序号',
                type: 'index',
                width: 50,
                index: index => {
                    return (this.currentPageContract - 1) * this.pageSizeContract + index + 1;
                },
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableDatContractSon: [],
            submitLoadingContractSon: false,
            dialogVisibleContractSon: false,
            pageSizeContractSon: 20,
            currentPageContractSon: 1,
            pageTotalContractSon: 0,
            currentRowKeyContractSon: '',
            multiptionContarctSon: [],
            tableColumnContractSon: [{
                label: '销售合同项目号',
                prop: 'saleItemNo',
                showOverflowTooltip: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '库存状态',
                prop: 'stockStatus',
                showOverflowTooltip: true,
            }, {
                label: '销售合同数量',
                prop: 'saleNumber',
                showOverflowTooltip: true,
            }, {
                label: '预交货日',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '运点',
                prop: 'transportPoint',
                showOverflowTooltip: true,
            }],
            submitLoading: '',
            dialogVisible: false,
            collapse: false,
            dialogType: '',
            dialogForm: [{
                label: '销售合同号',
                prop: 'saleNo',
                value: '',
                required: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                value: '',
                required: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                value: '',
                required: true,
                maxLength: 50,
            }, {
                label: '备注',
                type: 'textarea',
                prop: 'remark',
                value: '',
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
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.isAdd,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallysaleitem_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => !this.currentRowKeyDialog,
                permi: 'tallymanager_tallysaleitem_dels',
            }],
            submitLoadingDialog: false,
            dialogVisibleDialog: false,
            isAdd: true,
            dialogFormDialog: [{
                label: '项目号',
                prop: 'saleItemNo',
                value: '',
                required: true,
            }, {
                label: '预交货日',
                prop: 'deliveryDate',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                value: '',
                required: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                value: '',
                maxLength: 50,
                required: true,
                disabled: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                value: '',
                required: true,
                maxLength: 50,
                slot: 'material',
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                value: '',
                maxLength: 10,
                disabled: true,
            }, {
                label: '库存状态',
                prop: 'stockStatus',
                value: '',
                disabled: true,
            }, {
                label: '数量',
                prop: 'saleNumber',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数且保留两位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '工厂',
                prop: 'factory',
                value: '',
                maxLength: 50,
            }, {
                label: '运点',
                prop: 'transportPoint',
                value: '',
                maxLength: 50,
            }, {
                label: '备注',
                type: 'textarea',
                prop: 'remark',
                value: '',
            }],
            tableDataDialog: [],
            dialogLoading: false,
            pageSizeDialog: 20,
            currentDialog: 1,
            pageTotalDialog: 0,
            currentRowKeyDialog: '',
            submitId: '',
            dialogSearchForm: {},
            tableDataMat: [],
            tableColumnMat: [{
                label: '物料类型名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            submitLoadingMat: false,
            dialogVisibleMat: false,
            pageSizeMat: 20,
            currentPageMat: 1,
            pageTotalMat: 0,
            currentRowKeyMat: '',
        };

    },
    computed: {
        editDisabledParent() {
            return !this.currentRowKeyContract;
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.isAdd = true;
                this.tableDataDialog = [];
                this.pageSizeDialog = 20;
                this.currentDialog = 1;
                this.currentRowKeyContract = '';
                this.dialogType = '';
            }
        },
        dialogVisibleMat(val) {
            if (!val) {
                this.currentPageMat = 1;
                this.pageSizeMat = 20;
                this.tableDataMat = [];
                this.currentRowKeyMat = '';
            }
        },
        dialogVisibleDialog(val) {
            if (val) {
                const row = this.dialogFormDialog.find(v => v.prop === 'stockStatus');
                row.value = '非限制';
            }
        }
    },
    mounted() {
        this.showSaile();
    },
    methods: {
        searchTop() {
            this.currentPageContract = 1;
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
            this.showSaile();
            this.tableDatContractSon = [];
            this.pageSizeContractSon = 20;
            this.currentPageContractSon = 1;
            this.pageTotalContractSon = 0;
        },
        showSaile() {
            this.submitLoadingContract = true;
            const params = {
                current: this.currentPageContract,
                size: this.pageSizeContract,
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
            this.$http.get('/tallymanager/tallysale/page', { params }).then((res) => {
                this.tableDatContract = res.data.records;
                this.pageTotalContract = res.data.total;
                this.submitLoadingContract = false;
            }).catch(() => {
                this.submitLoadingContract = false;
            });
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        changeCurrentContract(val) {
            this.currentPageContract = val;
            this.showSaile();
        },
        changeSizeContract(val) {
            this.pageSizeContract = val;
            this.currentPageContract = 1;
            this.showSaile();
        },
        getContractSon() {
            this.submitLoadingContractSon = true;
            const params = {
                current: this.currentPageContractSon,
                size: this.pageSizeContractSon,
                conditionList: [],
            };
            if (this.dialogType !== '') {
                const saleNo = this.dialogForm[0].value;
                params.conditionList.push({
                    fieldName: 'saleNo',
                    operation: 'EQ',
                    value: saleNo,
                });
            } else {
                const row = this.tableDatContract.find(v => v.id === this.currentRowKeyContract);
                params.conditionList.push({
                    fieldName: 'saleNo',
                    operation: 'EQ',
                    value: row.saleNo,
                });
            }

            this.$http.get(`/tallymanager/tallysaleitem/page`, { params }).then(res => {
                this.tableDatContractSon = res.data.records;
                this.submitLoadingContractSon = false;
                this.pageTotalContractSon = res.data.total;
            });

        },
        changeCurrentContractSon(val) {
            this.currentPageContractSon = val;
            this.getContractSon();
        },
        changeSizeContractSon(val) {
            this.pageSizeContractSon = val;
            this.currentPageContractSon = 1;
            this.getContractSon();
        },
        handleContractSon(selection) {
            this.multiptionContarctSon = selection;
        },
        newRowParent() {
            this.dialogVisible = true;
            this.dialogType = 'new';
        },
        editRowParent() {
            const item = this.tableDatContract.find(v => v.id === this.currentRowKeyContract);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisible = true;
            this.dialogType = 'edit';
            this.isAdd = false;
            this.submitId = item.id;
            this.getContractDialog();
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallysale/removeByIds', {
                    data: [this.currentRowKeyContract],
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPageContract = 1;
                    this.showSaile();
                    this.getContractSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        submitForm() {
            const updata = () => {
                let obj = {};
                this.dialogForm.forEach(v => {
                    obj[v.prop] = v.value;
                });
                if (this.dialogType === 'new') {
                    return this.$http.post('/tallymanager/tallysale/save', obj).then(({ code, data }) => {
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.showSaile();
                        this.isAdd = false;
                        this.dialogType = 'edit';
                        this.submitId = data.id;
                        this.dialogForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                        this.dialogForm[1].value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    });
                } else {
                    obj.id = this.submitId;
                    obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                    return this.$http.put('/tallymanager/tallysale/updateById', obj).then(() => {
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.showSaile();
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
        closeDialog() {
            const arr = this.dialogForm.every(v => v.value === '');
            if (arr || this.dialogType === 'edit' || !this.isAdd) {
                this.dialogVisible = false;
            } else {
                this.$confirm('确认放弃已编辑的数据？', {
                    type: 'warning',
                }).then(() => {
                    this.dialogVisible = false;
                }).catch(() => {
                    this.$message.warning('已取消');
                });
            }
        },
        newRowSon() {
            this.dialogVisibleDialog = true;
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallysaleitem/removeByIds', {
                    data: [this.currentRowKeyDialog],
                }).then(() => {
                    this.submitLoading = false;
                    // this.currentRowKeyContract = '';
                    this.currentPageContractSon = 1;
                    this.getContractSon();
                    this.getContractDialog();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        submitFormDialog() {
            let obj = {};
            this.dialogFormDialog.forEach(v => {
                if (v.prop === 'saleItemNo') obj[v.prop] = Number(v.value);
                obj[v.prop] = v.value;
            });
            obj.saleNo = this.dialogForm[0].value;
            obj.customNo = this.dialogForm[2].value;
            obj.customName = this.dialogForm[3].value;
            obj.deliveryDate = moment(obj.deliveryDate).format('YYYY-MM-DD HH:mm:ss');
            this.$http.post(`/tallymanager/tallysaleitem/save`, obj).then(({ code, data }) => {
                this.$message.success('添加成功');
                this.getContractSon();
                this.getContractDialog();
                this.dialogVisibleDialog = false;
            });
        },
        getContractDialog() {
            this.dialogLoading = true;
            const params = {
                current: this.currentDialog,
                size: this.pageSizeDialog,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'saleNo',
                operation: 'EQ',
                value: this.dialogForm[0].value
            });
            this.$http.get(`/tallymanager/tallysaleitem/page`, { params }).then(res => {
                this.tableDataDialog = res.data.records;
                this.dialogLoading = false;
                this.pageTotalDialog = res.data.total;
            });

        },
        changeCurrentDialog(val) {
            this.currentDialog = val;
            this.getContractDialog();
        },
        changeSizeDialog(val) {
            this.pageSizeDialog = val;
            this.currentDialog = 1;
            this.getContractDialog();
        },
        getMat() {
            this.submitLoadingMat = true;
            this.dialogVisibleMat = true;
            const params =  {
                size: this.pageSizeMat,
                current: this.currentPageMat,
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
            this.$http.get(`/basicdata/dicbasicmaterial/page`, {
                params
            }).then(res => {
                this.tableDataMat = res.data.records;
                this.pageTotalMat = res.data.total;
                this.submitLoadingMat = false;
            }).catch(() => {
                this.submitLoadingMat = false;
            });
        },
        changeCurrentMat(val) {
            this.currentPageMat = val;
            this.getMat();
        },
        changeSizeMat(val) {
            this.pageSizeMat = val;
            this.currentPageMat = 1;
            this.getMat();
        },
        submitFormMat() {
            const item = this.tableDataMat.find(v => v.id === this.currentRowKeyMat);
            this.dialogFormDialog[3].value = item.materialName;
            this.dialogFormDialog[4].value = item.materialCode;
            this.dialogFormDialog[5].value = item.stockUnit;
            this.dialogVisibleMat = false;
        },
        searchMat(form) {
            this.currentPageMat = 1;
            this.dialogSearchForm = form;
            this.getMat();
        },
        resetMat(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.salescontract
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
.sale >>>
    .el-dialog
        .el-form-item__label
            width 120px !important
        .el-form-item__content
            width calc(100% - 120px) !important
.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)
.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        height 150px!important
        // .warning-row
        //     background oldlac
</style>
