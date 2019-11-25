<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            :title="title==='scrap'?'报废':'损耗'"
            :close-on-click-modal="false")
            div.buttons
                el-button(type="primary" @click="newRow()")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
                :column="title==='scrap'?columnScrap:columnLoss"
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
                :rules="rules"
                :model="form"
                inline)
                el-row(:gutter="20")
                    //- el-col(:span="12")
                    //-     el-form-item(label="物料料号" :required="true" prop="materialNo")
                    //-         el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                    //-             el-button(slot="append" @click="getDialogTable('物料料号')" icon="iconfont iconsearch")
                                        el-col(:span="12")
                    el-col(:span="12")
                        el-form-item(label="工位编号" :required="true" prop="stationNo")
                            el-input(v-model="form.stationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable('工位编号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料料号" required  prop="materialNo")
                            el-input(v-model="form.materialNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称" :required="true" prop="materialName")
                            el-input(v-model="form.materialName" disabled)
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
                        el-form-item(:label="title==='scrap'?'报废数量':'损耗数量'" :required="true" prop="materialAmount")
                            el-input(v-model="form.materialAmount")
                    el-col(:span="12")
                        el-form-item(label="单位" :required="true" prop="materialUnit")
                            el-input(v-model="form.materialUnit" disabled)
                    el-col(:span="12")
                        el-form-item(label="时间" :required="true" prop="createTime")
                            el-date-picker(
                                v-model="form.createTime"
                                type="datetime"
                                placeholder="选择日期时间")
                    el-col(:span="12")
                        el-form-item(label="操作员" :required="true" prop="createBy")
                            el-input(v-model="form.createBy" disabled)
                    el-col(:span="24")
                        el-form-item(:label="title==='scrap'?'报废原因':'损耗原因'" :required="true" prop="remark")
                            el-input(
                                v-model="form.remark"
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
            :key="type"
            :current-row-key.sync="currentRowKeyTable"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            :disabled="!currentRowKeyTable"
            highlight-current-row
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @resetDialog="resetDialog"
            @search="searchFormWork"
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
    props: {
        title: String,
    },
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
        return {
            options: [],
            optionArr: [],
            isGet: false,
            dialogSearchForm: {},
            typeId: '',
            materialAmount: 0,
            materialSn: '',
            productBatchId: '',
            dialogVisibleTable: false,
            row: {},
            tableColumn: [],
            stationId: '',
            palletRfid: '',
            currentRowKeyTable: '',
            tableDialogData: [],
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            isShow: false,
            dialogVisibleDialog: false,
            currentRowKey: '',
            dialogVisible: false,
            type: '',
            isSaving: false,
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
                prop: 'materialNo',
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
            tableData: [],
            form: {
                materialNo: '',
                materialName: '',
                materialBatchNo: '',
                materialAmount: '',
                materialUnit: '',
                createTime: '',
                createBy: '',
                stationNo: '',
            },
            rules: {
                materialAmount: [
                    { validator: validator, trigger: 'blur' }
                ]
            },
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
                this.form.createTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.$nextTick(() => {
                    this.$refs.dialogForm.clearValidate();
                });
            } else {
                this.form = {
                    materialNo: '',
                    materialName: '',
                    materialBatchNo: '',
                    materialAmount: '',
                    materialUnit: '',
                    createTime: '',
                    createBy: '',
                    stationNo: '',
                };
                this.stationId = '';
                this.palletRfid = '';
                this.currentRowKeyTable = '';
                this.row = {};
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
            this.typeId = this.title === 'scrap' ? '1' : '2';
            this.$http.get(`productionexe/orderwaste/list/${this.workcenter.id}/${this.typeId}`).then(({ data }) => {
                this.tableData = data;
            });
        },
        newRow() {
            this.dialogVisibleDialog = true;
        },
        submitFormDialog() {
            this.$refs.dialogForm.validate(valid => {
                if (valid) {
                    let obj = {};
                    obj = Object.assign({}, this.form);
                    obj.details = [{
                        materialAmount: this.form.materialAmount,
                        materialSn: this.materialSn,
                    }];
                    delete obj.createBy;
                    obj.orderId = this.workcenter.id;
                    obj.stationId = this.stationId;
                    obj.palletRfid = this.palletRfid;
                    obj.materialAmount = this.form.materialAmount;
                    obj.type = this.title === 'scrap' ? '1' : '2';
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
        submitFormTable(type) {
            switch (type) {
                case '物料料号':
                    // this.form.materialNo = this.row.materialNo;
                    // this.form.materialAmount = this.row.materialAmount;
                    // this.form.materialUnit = this.row.materialUnit;
                    // this.form.materialName = this.row.materialName;
                    // this.materialSn = this.row.materialSn;
                    break;
                case '工位编号':
                    if (Number(this.row.materialAmount) > 0 && this.row.palletRfid !== null) {
                        this.form.materialNo = this.row.materialNo;
                        this.form.materialUnit = this.row.materialUnit;
                        // this.form.materialName = this.row.materialName;
                        this.materialSn = this.row.materialSn;
                        this.form.stationNo = this.row.stationNo;
                        this.stationId = this.row.id;
                        this.palletRfid = this.row.palletRfid;
                        // 获取所选物料的物料批次;
                        this.isGet = true;
                        this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workCenter}/${this.row.stationNo}`).then(({ data }) => {
                            this.optionArr = data;
                            this.isGet = false;
                            this.dialogVisibleTable = false;
                            if (this.optionArr.length !== 0) {
                                this.form.materialBatchNo = this.optionArr[0].materialBatchNo;
                                this.form.materialAmount = this.optionArr[0].materialAmount;
                                this.form.materialUnit = this.optionArr[0].materialUnit;
                                this.form.materialName = this.optionArr[0].materialName;
                            }
                            this.$refs.dialogForm.clearValidate();
                        }).catch(() => {
                            this.isGet = false;
                            this.$refs.dialogForm.clearValidate();
                        });
                    } else {
                        this.$alert('当前工位未领托盘或当前工位不存在物料', {
                            type: 'warning'
                        });
                    }
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
        hanlderChange(value) {
            const row = this.optionArr.find(v => v.materialBatchNo === value);
            this.form.materialAmount = row.materialAmount;
            this.form.materialUnit = row.materialUnit;
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
        //         this.materialAmount = 0;
        //         return this.$http.get(`/productionexe/sidewarehouse/listMaterialInfo/${this.workCenter}`).then(res => {
        //             this.tableDialogData = res.data;
        //             this.tableDialogData.forEach(v => {
        //                 v.id = nanoid();
        //             });
        //             this.pageTotal_table = res.data.total;
        //             this.tableDialogData.forEach(v => {
        //                 v._id = nanoid();
        //             });
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
// .dialogForm >>> .el-form-item__content
//     width: calc(100% - 110px);
</style>
