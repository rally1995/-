<template lang="pug">
    ebrain-main.vehicleinfor
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchData"
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
            ref="dialog"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            template(#supplier="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="供应商编号" :required="true" prop="supplierCode")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="dialogSearchForm={};showSupplier()"  icon="iconfont iconsearch")
            template(#router="{value}")
               el-col(:span="12")
                   el-form-item(label-width="110px" label="装运路线编号" :required="true" prop="transportCode")
                       el-input(style="cursor:pointer" :value="value" :readonly="true")
                           el-button(slot="append" @click="dialogRouterForm={};showRouter()"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDataSupplier"
            :column="tableColumnSupplier"
            :tableLoading="submitLoadingSupplier"
            :visible.sync="dialogVisibleSupplier"
            :pageSize="pageSizeSonSupplier"
            :currentPage="currentPageSupplier"
            :pageTotal="pageTotalSonSupplier"
            :disabled="!currentRowKeySupplier"
            @changeCurrent="changeCurrentSupplier"
            @changeSize="changeSizeSupplier"
            @search="searchSupplier"
            @resetDialog="resetSupplier"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeySupplier"
            @submit="submitFormSupplier")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDataRouter"
            :column="tableColumnRouter"
            :tableLoading="submitLoadingRouter"
            :visible.sync="dialogVisibleRouter"
            :pageSize="pageSizeRouter"
            :currentPage="currentPageRouter"
            :pageTotal="pageTotalRouter"
            :disabled="!currentRowKeyRouter"
            @changeCurrent="changeCurrentRouter"
            @changeSize="changeSizeRouter"
            @search="searchRouter"
            @resetDialog="resetRouter"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyRouter"
            @submit="submitFormRouter")
</template>
<script>
import dict from '@/utils/dict';
import moment from 'moment';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'index',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallycar_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallycar_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'tallymanager_tallycar_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '车型',
                prop: 'carType',
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
                label: '车辆信息编号',
                prop: 'carCode',
                showOverflowTooltip: true,
            }, {
                label: '车型',
                prop: 'carType',
                showOverflowTooltip: true,
            }, {
                label: '车位数量',
                prop: 'seatNumber',
                showOverflowTooltip: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '含税金额',
                prop: 'money',
                showOverflowTooltip: true,
            }, {
                label: '税点',
                prop: 'taxRate',
                showOverflowTooltip: true,
            }, {
                label: '车辆状态',
                prop: 'isUse',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }],
            btnsForm: [{
                label: '保存',
                click: () => this.submitForm(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
            }, {
                label: '关闭',
                click: () => { this.dialogVisible = false },
                className: 'iconfont iconClose-',
                permi: false,
            }],
            submitLoading: false,
            dialogVisible: false,
            dialogType: '',
            dialogForm: [{
                label: '车辆信息编号',
                prop: 'carCode',
                value: '',
                disabled: true,
            }, {
                label: '车型',
                prop: 'carType',
                value: '',
                required: true,
            }, {
                label: '供应商名称',
                prop: 'supplierCode',
                value: '',
                slot: 'supplier'
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                disabled: true,
            }, {
                label: '装运路线编号',
                prop: 'transportCode',
                value: '',
                slot: 'router'
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                value: '',
                disabled: true,
            }, {
                label: '含税金额',
                prop: 'money',
                value: '',
                required: true,
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
                label: '税点',
                prop: 'taxRate',
                value: '',
                required: true,
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
                label: '车位数量',
                prop: 'seatNumber',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+$/;
                        if (value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入正整数!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '允许总重',
                prop: 'totalWeight',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^\d+(\.\d{0,2})?$/;
                        if (value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入最多两位小数的整数!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: 'SC',
                prop: 'sc',
                value: '',
            }, {
                label: 'SPPI',
                prop: 'sppi',
                value: '',
            }, {
                label: '有效开始时间',
                type: 'datetime',
                prop: 'validBgDate',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogForm.find(v => v.prop === 'validEdDate');
                        this.$refs.dialog.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value > lastVal.value) {
                                    callback(new Error('开始时间不能大于结束时间!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '有效结束时间',
                type: 'datetime',
                prop: 'validEdDate',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogForm.find(v => v.prop === 'validBgDate');
                        this.$refs.dialog.$refs.form.clearValidate(lastVal.prop);
                        if (value !== '' && lastVal.value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (value < lastVal.value) {
                                    callback(new Error('结束时间不能小于开始时间!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                disabled: true,
            }, {
                label: '车辆状态',
                prop: 'isUse',
                type: 'select',
                option: dict.supplier_status,
                value: '',
                required: true,
            }],
            dialogSupplierForm: {},
            dialogRouterForm: {},
            tableDataSupplier: [],
            submitLoadingSupplier: false,
            dialogVisibleSupplier: false,
            pageSizeSonSupplier: 20,
            currentPageSupplier: 1,
            pageTotalSonSupplier: 0,
            currentRowKeySupplier: '',
            tableColumnSupplier: [{
                label: '供应商编号',
                prop: 'supplierCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '联系人',
                prop: 'contact',
                showOverflowTooltip: true,
            }, {
                label: '联系方式',
                prop: 'contactInformation',
                showOverflowTooltip: true,
            }, {
                label: '供应商状态',
                prop: 'status',
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '来源',
                prop: 'source',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.source[cell];
                },
            }, {
                label: '备注',
                prop: 'description',
                showOverflowTooltip: true,
            }],
            tableDataRouter: [],
            submitLoadingRouter: false,
            dialogVisibleRouter: false,
            pageSizeRouter: 20,
            currentPageRouter: 1,
            pageTotalRouter: 0,
            currentRowKeyRouter: '',
            conditionList: [],
            tableColumnRouter: [{
                label: '装运路线编号',
                prop: 'transportCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
            }, {
                label: '来源',
                prop: 'source',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }]
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        }
    },
    watch: {
        dialogVisibleSupplier(val) {
            if (!val) {
                this.tableDataSupplier = [];
                this.currentPageSupplier = 1;
            }
        },
        dialogVisibleRouter(val) {
            if (!val) {
                this.tableDataRouter = [];
                this.currentPageRouter = 1;
            }
        },
    },
    mounted() {
        this.getData();
    },
    methods: {
        searchData() {
            this.conditionList = [];
            this.currentPage = 1;
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
            this.$http.get(`/tallymanager/tallycar/page`, {
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
            this.dialogForm[15].value = '0';
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
            const status = this.multiption.map(v => v.isUse);
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
                this.$http.delete('/tallymanager/tallycar/removeByIds', {
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
        submitForm() {
            const updata = () => {
                let obj = {};
                this.dialogForm.forEach(v => {
                    if (v.prop === 'seatNumber') obj[v.prop] = parseInt(v.value, 10);
                    else if (v.prop === 'totalWeight') obj[v.prop] = parseFloat(v.value);
                    else obj[v.prop] = v.value;
                });
                if (this.dialogType === 'new') {
                    return this.$http.post('/tallymanager/tallycar/save', obj).then(() => {
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.getData();
                        this.dialogVisible = false;
                        this.currentRowKey = '';
                    });
                } else {
                    obj.id = this.currentRowKey;
                    obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                    return this.$http.put('/tallymanager/tallycar/updateById', obj).then(() => {
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisible = false;
                        this.currentRowKey = '';
                        this.getData();
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
        },
        showSupplier() {
            this.submitLoadingSupplier = true;
            this.dialogVisibleSupplier = true;
            const params = {
                current: this.currentPageSupplier,
                size: this.pageSizeSonSupplier,
                conditionList: [{
                    fieldName: 'status',
                    value: '1',
                    operation: 'EQ',
                }],
            };
            if (this.dialogSupplierForm) {
                for (let i in this.dialogSupplierForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSupplierForm, i)) {
                        if (this.dialogSupplierForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSupplierForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/purchase/prsupplierinfo/page`, {
                params
            }).then(({ code, data }) => {
                this.submitLoadingSupplier = false;
                this.tableDataSupplier = data.records;
                this.pageTotalSonSupplier = data.total;
            }).catch(() => {
                this.submitLoadingSupplier = false;
            });
        },
        changeCurrentSupplier(val) {
            this.currentPageSupplier = val;
            this.showSupplier();
        },
        changeSizeSupplier(val) {
            this.changeSizeSupplier = val;
            this.currentPageRouter = 1;
            this.showSupplier();
        },
        searchSupplier(form) {
            this.currentPageRouter = 1;
            this.dialogSupplierForm = form;
            this.showSupplier();
        },
        resetSupplier(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormSupplier() {
            this.dialogVisibleSupplier = false;
            const item = this.tableDataSupplier.find(v => v.id === this.currentRowKeySupplier);
            this.dialogForm[2].value = item.supplierCode;
            this.dialogForm[3].value = item.supplierName;
        },
        showRouter() {
            this.submitLoadingRouter = true;
            const params = {
                current: this.currentPageRouter,
                size: this.pageSizeRouter,
                conditionList: [{
                    fieldName: 'status',
                    value: '1',
                    operation: 'EQ',
                }],
            };
            if (this.dialogRouterForm) {
                for (let i in this.dialogRouterForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogRouterForm, i)) {
                        if (this.dialogRouterForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogRouterForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/tallymanager/tallytransport/page`, {
                params
            }).then(({ code, data }) => {
                this.submitLoadingRouter = false;
                this.dialogVisibleRouter = true;
                this.tableDataRouter = data.records;
                this.pageTotalRouter = data.total;
            }).catch(() => {
                this.submitLoadingRouter = false;
            });
        },
        changeCurrentRouter(val) {
            this.currentPageRouter = val;
            this.showRouter();
        },
        changeSizeRouter(val) {
            this.pageSizeRouter = val;
            this.currentPageRouter = 1;
            this.showRouter();
        },
        searchRouter(form) {
            this.currentPageRouter = 1;
            this.dialogRouterForm = form;
            this.showRouter();
        },
        resetRouter(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormRouter() {
            this.dialogVisibleRouter = false;
            const item = this.tableDataRouter.find(v => v.id === this.currentRowKeyRouter);
            this.dialogForm[4].value = item.transportCode;
            this.dialogForm[5].value = item.transportName;
        },
    }
};
</script>
<style lang="stylus" scoped>
    .vehicleinfor
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

