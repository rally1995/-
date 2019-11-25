<template lang="pug">
    div
        el-dialog(
            :visible.sync="dialogVisible"
            :close-on-click-modal="false")
            el-tabs.tabs(v-model="activeName" type="card")
                el-tab-pane(name="Delivery" label="投料记录")
                el-tab-pane(name="Scrap" label="报废记录")
                el-tab-pane(name="Loss" label="损耗记录")
                div.buttons
                    el-button(type="primary" @click="newRow()")
                        i.iconfont.iconstatus-Preserve-and-add
                        |新增
            ebrain-table(
                :loading="loading"
                :column="column"
                :data="tableData"
                :highlight-current-row="false")
            template(#footer)
                el-button(
                    type="primary"
                    @click="submitForm") 确定
        el-dialog.redact(
            :visible.sync="dialogVisibleDialog"
            :close-on-click-modal="false")
            el-form.dialogForm(
                v-if="activeName==='Delivery' && dialogVisibleDialog"
                :rules="rules"
                ref="dialogForm"
                :model="form"
                label-width="110px"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="工位编号" required prop="stationNo")
                            el-input(v-model="form.stationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料料号" required  prop="materialNo")
                            el-input(v-model="form.materialNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料批号" required prop="materialBatchNo")
                            el-select(v-model="form.materialBatchNo"
                                @change="hanlderChange"
                                placeholder="请选择")
                                el-option(
                                    v-for="item in optionArr"
                                    :key="item.materialBatchNo"
                                    :value="item.materialBatchNo")
                    el-col(:span="12")
                        el-form-item(label="数量" required  prop="materialAmount")
                            el-input(v-model="form.materialAmount")
                    el-col(:span="12")
                        el-form-item(label="单位" required prop="materialUnit")
                            el-input(v-model="form.materialUnit" disabled)
                    el-col(:span="12")
                        el-form-item(label="操作员" required prop="createBy")
                            el-input(v-model="form.createBy" disabled)
                    el-col(:span="12")
                        el-form-item(label="投料开始时间" required prop="beginTime")
                            el-date-picker(
                                v-model="form.beginTime"
                                type="datetime"
                                placeholder="选择日期时间")
                    el-col(:span="12")
                        el-form-item(label="投料结束时间" required  prop="endTime")
                            el-date-picker(
                                v-model="form.endTime"
                                type="datetime"
                                placeholder="选择日期时间")
            el-form.dialogForm(
                v-if="activeName!=='Delivery' && dialogVisibleDialog"
                ref="dialogForm2"
                :rules="rules2"
                :model="formSAL"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="工位编号" :required="true" prop="stationNo")
                            el-input(v-model="formSAL.stationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable('工位编号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料料号" required  prop="materialNo")
                            el-input(v-model="formSAL.materialNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称" :required="true" prop="materialName")
                            el-input(v-model="formSAL.materialName" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料批号" required prop="materialBatchNo")
                            el-select(v-model="formSAL.materialBatchNo"
                                @change="hanlderChange"
                                placeholder="请选择")
                                el-option(
                                    v-for="item in optionArr"
                                    :key="item.materialBatchNo"
                                    :value="item.materialBatchNo")
                    el-col(:span="12")
                        el-form-item(:label="activeName==='Scrap'?'报废数量':'损耗数量'" :required="true" prop="materialAmount")
                            el-input(v-model="formSAL.materialAmount")
                    el-col(:span="12")
                        el-form-item(label="单位" :required="true" prop="materialUnit")
                            el-input(v-model="formSAL.materialUnit" disabled)
                    el-col(:span="12")
                        el-form-item(label="时间" :required="true" prop="createTime")
                            el-date-picker(
                                v-model="formSAL.createTime"
                                type="datetime"
                                placeholder="选择日期时间")
                    el-col(:span="12")
                        el-form-item(label="操作员" :required="true" prop="createBy")
                            el-input(v-model="formSAL.createBy" disabled)
                    el-col(:span="24")
                        el-form-item(:label="activeName==='Scrap'?'报废原因':'损耗原因'" :required="true" prop="remark")
                            el-input(
                                v-model="formSAL.remark"
                                type="textarea"
                                resize="none"
                                :autosize={minRows:3,maxRows:12}
                                :row="3")
            template(#footer)
                el-button(
                    type="primary"
                    :loading="isSaving"
                    @click="submitFormDialog") 保存提交
        ebrain-dialog-table.mation(
            :subLoading="isGet"
            :isShow="isShow"
            row-key="_id"
            :key="activeName"
            :current-row-key.sync="currentRowKeyTable"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumnStation"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :disabled="!currentRowKeyTable"
            @row-click="getMeg"
            @submit="submitFormTable")
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
import nanoid from 'nanoid';
import dict from '@/utils/dict';
export default {
    name: 'InputRecord',
    data() {
        const validator = (rule, value, callback) => {
            const reg = /^\d+(\.\d{0,4})?$/;
            if (!value) callback();
            if (!reg.test(value)) {
                return callback(new Error('请输入有效数字'));
            } else {
                callback();
            }
        };
        const validatorStartTime = (rule, value, callback) => {
            const lastVal = this.form.endTime;
            if (value !== '' && lastVal !== '') {
                if (value === null) {
                    callback();
                } else {
                    const tr =  moment(value).format('YYYY-MM-DD HH:mm:ss');
                    if (tr > lastVal) {
                        callback(new Error('开始时间不能大于结束时间!'));
                    } else {
                        this.$refs.dialogForm.clearValidate(lastVal);
                        callback();
                    }
                }
            } else {
                callback();
            }
        };
        const valodatorEndTime = (rule, value, callback) => {
            const lastVal = this.form.beginTime;
            if (value !== '' && lastVal !== '') {
                if (value === null) {
                    callback();
                } else {
                    const tr =  moment(lastVal).format('YYYY-MM-DD HH:mm:ss');
                    const hr =  moment(value).format('YYYY-MM-DD HH:mm:ss');
                    if (hr < tr) {
                        callback(new Error('结束时间不能小于开始时间!'));
                    } else {
                        this.$refs.dialogForm.clearValidate(lastVal);
                        callback();
                    }
                }
            } else {
                callback();
            }
        };
        return {
            loading: false,
            dialogVisible: false,
            dialogVisibleDialog: false,
            isSaving: false,
            optionArr: [],
            tableData: [],
            activeName: 'Delivery',
            isGet: false,
            isShow: false,
            currentRowKeyTable: '',
            tableDialogData: [],
            dialogSearchForm: {},
            tableColumnStation: [{
                label: '工作中心',
                prop: 'workcenterNo',
                showOverflowTooltip: true,
            }, {
                label: '工位编号',
                prop: 'stationNo',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '工位名称',
                prop: 'stationName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '工位类型',
                prop: 'stationType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.stationType[cell];
                }
            }],
            dialogVisibleTable: false,
            row: {},
            DeliveryColumn: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料批号',
                prop: 'materialBatchNo',
            }, {
                label: '数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '工位编号',
                prop: 'stationNo',
            }, {
                label: '投料开始时间',
                prop: 'beginTime',
            }, {
                label: '投料结束时间',
                prop: 'endTime',
            }],
            columnScrap: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '报废数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '工位编号',
                prop: 'stationNo',
            }, {
                label: '报废原因',
                prop: 'remark',
            }, {
                label: '报废时间',
                prop: 'createTime',
            }],
            columnLoss: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '损耗数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '工位编号',
                prop: 'stationNo',
            }, {
                label: '损耗原因',
                prop: 'remark',
            }, {
                label: '损耗时间',
                prop: 'createTime',
            }],
            rules: {
                materialAmount: [
                    { validator: validator, trigger: 'blur' }
                ],
                beginTime: [
                    { validator: validatorStartTime, trigger: 'blur' }
                ],
                endTime: [
                    { validator: valodatorEndTime, trigger: 'blur' }
                ]
            },
            rules2: {
                materialAmount: [
                    { validator: validator, trigger: 'blur' }
                ]
            },
            form: {
                materialNo: '',
                materialBatchNo: '',
                materialAmount: '',
                materialUnit: '',
                createBy: '',
                stationNo: '',
                beginTime: '',
                endTime: '',
                stationId: '',
                palletRfid: '',
                materialSn: '',
            },
            formSAL: {
                materialNo: '',
                materialName: '',
                materialBatchNo: '',
                materialAmount: '',
                materialUnit: '',
                createTime: '',
                createBy: '',
                stationNo: '',
                materialSn: '',
                stationId: '',
                palletRfid: '',
            },
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        column() {
            if (this.activeName === 'Delivery') return this.DeliveryColumn;
            else if (this.activeName === 'Scrap') return this.columnScrap;
            else return this.columnLoss;
            // else return [];if (this.activeName === 'Loss')
        }
    },
    watch: {
        activeName(val) {
            if (this.dialogVisible) this.getData();
        },
        dialogVisible(val) {
            if (!val) {
                this.tableData = [];
                this.activeName = 'Delivery';
            }
        },
        dialogVisibleDialog(val) {
            if (!val) {
                if (this.activeName === 'Delivery') {
                    for (let i in this.form) {
                        if (Object.prototype.hasOwnProperty.call(this.form, i)) {
                            this.form[i] = '';
                        }
                    }
                } else {
                    for (let i in this.formSAL) {
                        if (Object.prototype.hasOwnProperty.call(this.formSAL, i)) {
                            this.formSAL[i] = '';
                        }
                    }
                }
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.currentRowKeyTable = '';
                this.row = {};
            }
        }
    },
    methods: {
        open() {
            this.dialogVisible = true;
            this.getData();
        },
        newRow() {
            this.dialogVisibleDialog = true;
            if (this.activeName === 'Delivery') {
                this.form.createBy = this.sysUser.nickname;
                this.form.beginTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.form.endTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            } else {
                this.formSAL.createBy = this.sysUser.nickname;
            }
        },
        getDelivery() {
            this.loading = true;
            this.$http.post(`/productionexe/orderfeed/list`, null, {
                params: {
                    orderId: this.workcenter.id,
                }
            }).then(({ data }) => {
                this.tableData = data;
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        getScrap() {
            this.loading = true;
            const typeId = '1';
            this.$http.get(`productionexe/orderwaste/list/${this.workcenter.id}/${typeId}`).then(({ data }) => {
                this.tableData = data;
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        getLoss() {
            this.loading = true;
            const typeId = '2';
            this.$http.get(`productionexe/orderwaste/list/${this.workcenter.id}/${typeId}`).then(({ data }) => {
                this.tableData = data;
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        getData() {
            switch (this.activeName) {
                case 'Delivery':
                    this.getDelivery();
                    break;
                case 'Scrap':
                    this.getScrap();
                    break;
                case 'Loss':
                    this.getLoss();
                    break;
                default:
                    break;
            }
        },
        getDialogTable() {
            this.dialogVisibleTable = true;
            this.tableDialogData = [];
            this.getDataStation();
        },
        getDataStation() {
            this.currentRowKeyTable = '';
            this.row = {};
            const params = {
                workcenterNo: this.workcenter.workcenterNo,
                stationType: '1',
                status: '3'
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/productionexe/station/list?size=999', params).then(res => {
                this.tableDialogData = res.data.map(v => ({
                    ...v,
                    _id: nanoid(),
                }));
            });
        },
        hanlderChange(value) {
            const row = this.optionArr.find(v => v.materialBatchNo === value);
            this.form.materialAmount = row.materialAmount;
            this.form.materialUnit = row.materialUnit;
        },
        submitForm() {
            this.dialogVisible = false;
        },
        submitFormDialog() {
            if (this.activeName === 'Delivery') {
                this.$refs.dialogForm.validate((valid) => {
                    if (valid) {
                        let obj = {};
                        obj = Object.assign({}, this.form);
                        if (obj.endTime) obj.endTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                        if (!obj.beginTime) obj.beginTime = '';
                        else obj.beginTime = moment(new Date(obj.beginTime)).format('YYYY-MM-DD HH:mm:ss');
                        delete obj.createBy;
                        obj.orderId = this.workcenter.id;
                        obj.materialAmount = Number(obj.materialAmount);
                        this.isSaving = true;
                        this.$http.post(`/productionexe/orderfeed/add`, obj).then(() => {
                            this.$message.success('新增成功!');
                            this.getData();
                            this.dialogVisibleDialog = false;
                            this.isSaving = false;
                        }).catch(() => {
                            this.isSaving = false;
                        });
                    }
                });
            } else {
                this.$refs.dialogForm2.validate(valid => {
                    if (valid) {
                        let obj = {};
                        obj = Object.assign({}, this.formSAL);
                        obj.details = [{
                            materialAmount: this.formSAL.materialAmount,
                            materialSn: this.formSAL.materialSn,
                        }];
                        delete obj.createBy;
                        obj.orderId = this.workcenter.id;
                        if (this.activeName === 'Scrap') {
                            obj.type = '1';
                        } else if (this.activeName === 'Loss') {
                            obj.type = '2';
                        }
                        this.isSaving = true;
                        this.$http.post(`productionexe/orderwaste/saveBatch`, obj).then(() => {
                            this.$message.success('新增成功!');
                            this.getData();
                            this.dialogVisibleDialog = false;
                            this.isSaving = false;
                        }).catch(() => {
                            this.isSaving = false;
                        });
                    }
                });
            }
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getDataStation();
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
        getMeg(row) {
            this.row = row;
        },
        submitFormTable() {
            if (this.activeName === 'Delivery') {
                this.optionArr = [];
                this.form.materialNo = this.row.materialNo;
                this.form.materialSn = this.row.materialSn;
                this.form.stationNo = this.row.stationNo;
                this.form.stationId = this.row.id;
                this.form.palletRfid = this.row.palletRfid;
                // 获取所选物料的物料批次
                this.isGet = true;
                this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workcenter.workcenterNo}/${this.row.stationNo}`).then(({ data }) => {
                    this.optionArr = data;
                    this.isGet = false;
                    this.dialogVisibleTable = false;
                    if (this.optionArr.length) {
                        this.form.materialNo = this.optionArr[0].materialNo;
                        this.form.materialBatchNo = this.optionArr[0].materialBatchNo;
                        this.form.materialAmount = this.optionArr[0].materialAmount;
                        this.form.materialUnit = this.optionArr[0].materialUnit;
                        // this.$refs.dialogForm.clearValidate();
                    }
                }).catch(() => {
                    this.isGet = false;
                    // this.$refs.dialogForm.clearValidate();
                });
            } else {
                if (Number(this.row.materialAmount) > 0 && this.row.palletRfid !== null) {
                    this.optionArr = [];
                    this.formSAL.materialNo = this.row.materialNo;
                    this.formSAL.materialUnit = this.row.materialUnit;
                    this.formSAL.materialSn = this.row.materialSn;
                    this.formSAL.stationNo = this.row.stationNo;
                    this.formSAL.stationId = this.row.id;
                    this.formSAL.palletRfid = this.row.palletRfid;
                    // 获取所选物料的物料批次;
                    this.isGet = true;
                    this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workcenter.workcenterNo}/${this.row.stationNo}`).then(({ data }) => {
                        this.optionArr = data;
                        this.isGet = false;
                        this.dialogVisibleTable = false;
                        if (this.optionArr.length) {
                            this.formSAL.materialBatchNo = this.optionArr[0].materialBatchNo;
                            this.formSAL.materialAmount = this.optionArr[0].materialAmount;
                            this.formSAL.materialUnit = this.optionArr[0].materialUnit;
                            this.formSAL.materialName = this.optionArr[0].materialName;
                            // this.$refs.dialogForm2.clearValidate();
                        }
                    }).catch(() => {
                        this.isGet = false;
                        // this.$refs.dialogForm2.clearValidate();
                    });
                } else {
                    this.$alert('当前工位未领托盘或当前工位不存在物料', {
                        type: 'warning'
                    });
                }
            }
        }

    }
};
</script>
<style lang="stylus" scoped>
.tabs
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
.buttons
    padding 15px 0
.redact
    & >>> .el-dialog
        height auto
        width 60%
        margin-top 15%!important

    & >>> .el-form-item__label
        line-height 42px
.dialogForm >>> .el-form-item__content
    width: calc(100% - 110px);
</style>
