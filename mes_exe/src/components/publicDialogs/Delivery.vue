<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="投料"
            :close-on-click-modal="false")
            div.buttons
                el-button(type="primary" @click="newRow()")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
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
                ref="dialogForm"
                :model="form"
                label-width="110px"
                :rules="rules"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="工位编号" required prop="stationNo")
                            el-input(v-model="form.stationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable('工位编号')" icon="iconfont iconsearch")
                    //- el-col(:span="12")
                    //-     el-form-item(label="物料料号" required prop="materialNo")
                    //-         el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                    //-             el-button(slot="append" @click="getDialogTable('物料料号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料料号" required  prop="materialNo")
                            el-input(v-model="form.materialNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料批号" required prop="materialBatchNo")
                            //- el-input(v-model="form.materialBatchNo" disabled)
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
            template(#footer)
                el-button(
                    type="primary"
                    :loading="isSaving"
                    @click="submitFormDialog") 保存提交
        ebrain-dialog-table.mation(
            :subLoading="isGet"
            :isShow="isShow"
            row-key="_id"
            :key="type"
            :current-row-key.sync="currentRowKeyTable"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @resetDialog="resetDialog"
            @search="searchFormWork"
            :disabled="!currentRowKeyTable"
            :pageTotal="pageTotal_table"
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            @row-click="getMeg"
            @submit="submitFormTable(type)")
</template>

<script>
import dict from '@/utils/dict';
import { mapState } from 'vuex';
import moment from 'moment';
import nanoid from 'nanoid';
// import * as _ from 'lodash';

export default {
    name: 'FetchMaterial',
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
            this.$refs.dialogForm.clearValidate(lastVal);
            if (value !== '' && lastVal !== '') {
                if (value === null) {
                    callback();
                } else {
                    const tr =  moment(value).format('YYYY-MM-DD HH:mm:ss');
                    if (tr > lastVal) {
                        callback(new Error('开始时间不能大于结束时间!'));
                    } else {
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
            options: [],
            dialogSearchForm: {},
            type: '',
            dialogVisibleTable: false,
            row: {},
            tableColumn: [],
            currentRowKeyTable: '',
            isGet: false,
            tableDialogData: [],
            stationId: '',
            palletRfid: '',
            materialSn: '',
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            isShow: false,
            dialogVisibleDialog: false,
            currentRowKey: '',
            dialogVisible: false,
            isSaving: false,
            column: [{
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
            tableData: [],
            form: {
                materialNo: '',
                materialBatchNo: '',
                materialAmount: '',
                materialUnit: '',
                createBy: '',
                stationNo: '',
                beginTime: '',
                endTime: '',
            },
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
            optionArr: [],
            tableColumnMaterial: [{
                label: '物料编码',
                prop: 'materialNo',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                // searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料批次号',
                prop: 'materialBatchNo',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'materialAmount',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'materialUnit',
                showOverflowTooltip: true,
            }],
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
            }]
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderId() {
            return this.$route.query.id;
        },
        workCenter() {
            return this.$route.query.wc;
        }
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.getData();
            } else {
                this.tableData = [];
            }
        },
        dialogVisibleDialog(val) {
            if (val) {
                this.form.createBy = this.sysUser.nickname;
                this.form.endTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.$nextTick(() => {
                    this.$refs.dialogForm.clearValidate();
                });
            } else {
                this.stationId = '';
                this.palletRfid = '';
                this.materialSn = '';
                this.form = {
                    materialNo: '',
                    materialBatchNo: '',
                    materialAmount: '',
                    materialUnit: '',
                    createBy: '',
                    stationNo: '',
                    beginTime: '',
                    endTime: '',
                    stationId: '',
                };
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.currentRowKeyTable = '';
                this.row = {};
            }
        },
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        getData() {
            this.$http.post(`/productionexe/orderfeed/list`, null, {
                params: {
                    orderId: this.workcenter.id
                }
            }).then(({ data }) => {
                this.tableData = data;
            });
        },
        newRow() {
            this.dialogVisibleDialog = true;
        },
        submitFormDialog() {
            this.$refs.dialogForm.validate((valid) => {
                if (valid) {
                    let obj = {};
                    obj = Object.assign({}, this.form);
                    if (!obj.beginTime) obj.beginTime = '';
                    else obj.beginTime = moment(new Date(obj.beginTime)).format('YYYY-MM-DD HH:mm:ss');
                    delete obj.createBy;
                    obj.orderId = this.workcenter.id;
                    obj.stationId = this.stationId;
                    obj.palletRfid = this.palletRfid;
                    obj.materialSn = this.materialSn;
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

        },
        submitForm() {
            this.dialogVisible = false;
        },
        getDialogTable(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            this.tableDialogData = [];
            switch (type) {
                case '物料料号':
                    // this.tableColumn = this.tableColumnMaterial;
                    // this.getDataMaterial();
                    break;
                case '工位编号':
                    this.tableColumn = this.tableColumnStation;
                    this.getDataStation();
                    break;
                default:
                    break;
            }
        },
        changeCurrent_table(val) {
            switch (this.type) {
                case '物料料号':
                    // this.getDataMaterial(val);
                    break;
                case '工位编号':
                    this.getDataStation(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            switch (this.type) {
                case '物料料号':
                    // this.getDataMaterial();
                    break;
                case '工位编号':
                    this.getDataStation();
                    break;
                default:
                    break;
            }
        },
        hanlderChange(value) {
            const row = this.optionArr.find(v => v.materialBatchNo === value);
            this.form.materialAmount = row.materialAmount;
            this.form.materialUnit = row.materialUnit;
        },
        submitFormTable(type) {
            switch (type) {
                case '物料料号':
                    // this.form.materialNo = this.row.materialNo;
                    // this.form.materialAmount = this.row.materialAmount;
                    // this.form.materialUnit = this.row.materialUnit;
                    // this.materialSn = this.row.materialSn;
                    break;
                case '工位编号':
                    this.form.materialNo = this.row.materialNo;
                    this.materialSn = this.row.materialSn;
                    this.form.stationNo = this.row.stationNo;
                    this.stationId = this.row.id;
                    this.palletRfid = this.row.palletRfid;
                    // 获取所选物料的物料批次
                    this.isGet = true;
                    this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workCenter}/${this.row.stationNo}`).then(({ data }) => {
                        this.optionArr = data;
                        this.isGet = false;
                        this.dialogVisibleTable = false;
                        if (this.optionArr.length !== 0) {
                            this.form.materialBatchNo = this.optionArr[0].materialBatchNo;
                            this.form.materialAmount = this.optionArr[0].materialAmount;
                            this.form.materialUnit = this.optionArr[0].materialUnit;
                            this.$refs.dialogForm.clearValidate();
                        }
                    }).catch(() => {
                        this.isGet = false;
                        this.$refs.dialogForm.clearValidate();
                    });
                    break;
                default:
                    break;
            }
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case '物料料号':
                    // this.getDataMaterial(form);
                    break;
                case '工位编号':
                    this.getDataStation(form);
                    break;
                default:
                    break;
            }
        },
        getMeg(row) {
            this.row = row;
        },
        // 表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        // getDataMaterial() {
        //     const isEmpty = _.every(this.dialogSearchForm, _.isEmpty);
        //     if (!isEmpty) {
        //         this.currentRowKeyTable = '';
        //         this.row = {};
        //         return this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workCenter}/${this.dialogSearchForm.materialNo}`).then(res => {
        //             this.tableDialogData = res.data;
        //             this.tableDialogData.forEach(v => {
        //                 v._id = nanoid();
        //             });
        //         });
        //     } else {
        //         return this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workCenter}`).then(res => {
        //             this.tableDialogData = res.data;
        //             this.tableDialogData.forEach(v => {
        //                 v._id = nanoid();
        //             });
        //             this.pageTotal_table = res.data.total;
        //         });
        //     }
        // },
        getDataStation(val) {
            this.currentRowKeyTable = '';
            this.row = {};
            const params = {
                workcenterNo: this.workCenter,
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
                this.currentPage_table = val;
                this.tableDialogData = res.data;
                this.pageTotal_table = res.data.total;
                this.tableDialogData.forEach(v => {
                    v._id = nanoid();
                });
            });
        }
    },
};
</script>

<style scoped lang="stylus">
.buttons
    padding-bottom 15px

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
