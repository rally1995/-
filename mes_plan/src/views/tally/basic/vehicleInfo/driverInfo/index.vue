<template lang="pug">
    ebrain-main.driverInfo
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
            :form.sync="dialogForm"
            :isShow="false"
            :isCancel="false"
            ref="dialog")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            template(#vehicle="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="车辆信息编号" :required="true")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="dialogSearchForm={};showVehicle()"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDataVehicle"
            :column="tableColumnVehicle"
            :tableLoading="submitLoadingVehicle"
            :visible.sync="dialogVisibleVehicle"
            :pageSize="pageSizeVehicle"
            :currentPage="currentPageVehicle"
            :pageTotal="pageTotalVehicle"
            :disabled="!currentRowKeyVehicle"
            @changeCurrent="changeCurrentVehicle"
            @changeSize="changeSizeVehicle"
            @search="searchVehicle"
            @resetDialog="resetVehicle"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyVehicle"
            @submit="submitFormVehicle")
</template>
<script>
import dict from '@/utils/dict';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'index',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallydriver_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallydriver_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'tallymanager_tallydriver_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '车牌号',
                prop: 'carNumber',
                value: '',
            }],
            tableLoading: false,
            currentRowKey: '',
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            conditionList: [],
            multiption: [],
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '装运路线',
                prop: 'transportName',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员姓名',
                prop: 'driverName',
                showOverflowTooltip: true,
            }, {
                label: '驾驶员身份证',
                prop: 'driverIdcard',
                showOverflowTooltip: true,
            }, {
                label: '联系方式',
                prop: 'driverContact',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
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
                click: () => this.closeDialog(),
                className: 'iconfont iconClose-',
                permi: false,
            }],
            submitLoading: false,
            dialogVisible: false,
            dialogSearchForm: {},
            dialogType: '',
            dialogForm: [{
                label: '车辆信息编号',
                prop: 'carCode',
                value: '',
                required: true,
                slot: 'vehicle',
            }, {
                label: '装运路线',
                prop: 'transportName',
                value: '',
                disabled: true,
            }, {
                label: '供应商编号',
                prop: 'supplierCode',
                value: '',
                disabled: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                disabled: true,
            }, {
                label: '车型',
                prop: 'carType',
                value: '',
                disabled: true,
            }, {
                label: '驾驶员姓名',
                prop: 'driverName',
                value: '',
                required: true,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                value: '',
                required: true,
            }, {
                label: '驾驶员联系方式',
                prop: 'driverContact',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg = /^((0\d{2,3}-\d{7,8})|(1[345678]\d{9}))$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的联系方式'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '驾驶员身份证',
                prop: 'driverIdcard',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的身份证!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '创建时间',
                prop: 'createTime',
                type: 'datetime',
                value: '',
                disabled: '',
            }, {
                label: '状态',
                type: 'select',
                prop: 'status',
                value: '',
                option: dict.supplier_status,
                required: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            tableDataVehicle: [],
            submitLoadingVehicle: false,
            dialogVisibleVehicle: false,
            pageSizeVehicle: 20,
            currentPageVehicle: 1,
            pageTotalVehicle: 0,
            currentRowKeyVehicle: '',
            tableColumnVehicle: [{
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
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '车位数量',
                prop: 'seatNumber',
                showOverflowTooltip: true,
            }, {
                label: '装运路线名称',
                prop: 'transportName',
                searchBy: true,
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
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        },
    },
    watch: {
        dialogVisibleVehicle(val) {
            if (!val) {
                this.tableDataVehicle = [];
                this.currentPageVehicle = 1;
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
            return this.$http.get(`/tallymanager/tallydriver/page`, {
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
            const row = this.dialogForm.find(v => v.prop === 'createTime');
            row.value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
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
            const status = this.multiption.map(v => v.status);
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
                this.$http.delete('/tallymanager/tallydriver/removeByIds', {
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
        closeDialog() {
            this.dialogVisible = false;
        },
        submitForm() {
            const updata = () => {
                let obj = {};
                this.dialogForm.forEach(v => {
                    obj[v.prop] = v.value;
                });
                if (this.dialogType === 'new') {
                    return this.$http.post('/tallymanager/tallydriver/save', obj).then(() => {
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.getData();
                        this.dialogVisible = false;
                    });
                } else {
                    obj.id = this.currentRowKey;
                    obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                    return this.$http.put('/tallymanager/tallydriver/updateById', obj).then(() => {
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.getData();
                        this.currentRowKey = '';
                        this.dialogVisible = false;
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
        showVehicle() {
            this.submitLoadingVehicle = true;
            const params = {
                current: this.currentPageVehicle,
                size: this.pageSizeVehicle,
                conditionList: [{
                    fieldName: 'isUse',
                    value: '1',
                    operation: 'EQ',
                }],
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
            this.$http.get(`/tallymanager/tallycar/page`, {
                params
            }).then(({ code, data }) => {
                this.dialogVisibleVehicle = true;
                this.submitLoadingVehicle = false;
                this.tableDataVehicle = data.records;
                this.pageTotalVehicle = data.total;
            }).catch(() => {
                this.submitLoadingVehicle = false;
            });

        },
        changeCurrentVehicle(val) {
            this.currentPageVehicle = val;
            this.showVehicle();
        },
        changeSizeVehicle(val) {
            this.pageSizeVehicle = val;
            this.currentPageVehicle = 1;
            this.showVehicle();
        },
        searchVehicle(form) {
            this.currentPageVehicle = 1;
            this.dialogSearchForm = form;
            this.showVehicle();
        },
        resetVehicle(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormVehicle() {
            const item  = this.tableDataVehicle.find(v => v.id === this.currentRowKeyVehicle);
            this.dialogForm[0].value = item.carCode;
            this.dialogForm[1].value = item.transportName;
            this.dialogForm[2].value = item.supplierCode;
            this.dialogForm[3].value = item.supplierName;
            this.dialogForm[4].value = item.carType;
            this.dialogVisibleVehicle = false;
        }
    }
};
</script>
<style lang="stylus" scoped>
    .driverInfo
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

