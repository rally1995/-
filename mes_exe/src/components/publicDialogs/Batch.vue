<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="生产批次"
            :close-on-click-modal="false")
            el-tabs.tabs(v-model="activeName" type="card" v-if="pn === '混胶'")
                el-tab-pane(name="batch" label="生产批次")
                el-tab-pane(name="bucket" label="转小桶")
            div.buttons
                el-button(type="primary" @click="newRow()")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
                :loading="loadingBatch"
                v-if="activeName === 'batch'"
                :key="activeName"
                :column="batchColumn"
                :data="tableData"
                :highlight-current-row="false")
            ebrain-table(
                :key="activeName"
                :loading="loadingRunblet"
                v-if="pn==='混胶' && activeName==='bucket'"
                :column="rundletColumn"
                :data="rundletData"
                :highlight-current-row="false")
            template(#footer)
                el-button(
                    type="primary"
                    @click="submitForm") 确定
        el-dialog.redact(
            :visible.sync="dialogVisibleDialog"
            :close-on-click-modal="false")
            el-form.dialogForm(
                v-if="activeName === 'batch' && dialogVisibleDialog"
                ref="dialogForm"
                :rules="rules"
                :model="form"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="生产批次号" required prop="prodBatchNo")
                            el-input(v-model="form.prodBatchNo")
                    el-col(:span="12")
                        el-form-item(label="工位编号" required prop="stationNo")
                            el-input(v-model="form.stationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable('工位编号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料料号" required prop="materialNo")
                            el-input(v-model="form.materialNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称" required prop="materialName")
                            el-input(v-model="form.materialName" disabled)
                    el-col(:span="12")
                        el-form-item(label="数量" required prop="realAmount")
                            el-input(v-model="form.realAmount")
                    el-col(:span="12")
                        el-form-item(label="单位" required prop="materialUnit")
                            el-input(v-model="form.materialUnit" disabled)
                    el-col(:span="12")
                        el-form-item(label="开始时间" required prop="beginTime")
                            el-date-picker(
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                v-model="form.beginTime"
                                type="datetime"
                                placeholder="选择日期时间")
                    el-col(:span="12")
                        el-form-item(label="结束时间" required prop="endTime")
                            el-date-picker(
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                v-model="form.endTime"
                                type="datetime"
                                placeholder="选择日期时间")
                    el-col(:span="12")
                        el-form-item(label="操作员" required prop="operator")
                            el-input(v-model="form.operator")
                    template(v-if="pn==='层压'||pn==='手动分发'||isReport")
                        el-col(:span="12")
                            el-form-item(label="模号")
                                el-input(v-model="form.moduleNo" v-if="pn==='层压'")
                                el-select(v-model="form.moduleNo" v-if="pn==='手动分发'||isReport")
                                    el-option(
                                        v-for="item in options"
                                        :key="item.id"
                                        :label="item.moduleNo"
                                        :value="item.moduleNo")
                    el-col(:span="12")
                        el-form-item(label="是否新增下一个批次" required prop="nextFlag")
                            el-select(v-model="form.nextFlag")
                                el-option(
                                    v-for="(item, key) in nextData"
                                    :label="item.label"
                                    :value="item.value"
                                    :key="item.value")
                    //- el-col(:span="24")
                    //-     el-form-item(label="备注")
                    //-         el-input(
                    //-             v-model="form.reason"
                    //-             type="textarea"
                    //-             resize="none"
                    //-             :autosize={minRows:3,maxRows:12}
                    //-             :row="3")
            el-form.dialogForm(
                v-if="activeName === 'bucket' && dialogVisibleDialog && pn ==='混胶'"
                ref="dialogForm2"
                :rules="rules2"
                :model="formRundlet"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="生产批次号" required prop="prodBatchNo")
                            el-select(v-model="formRundlet.prodBatchNo"
                                placeholder="请选择")
                                el-option(
                                    v-for="item in tableData"
                                    :key="item.prodBatchNo"
                                    :value="item.prodBatchNo")
                    el-col(:span="12")
                        el-form-item(label="总重"  prop="totalWeight")
                            el-input(v-model="formRundlet.totalWeight")
                    el-col(:span="12")
                        el-form-item(label="净重"  prop="grossWeight")
                            el-input(v-model="formRundlet.grossWeight")
                    el-col(:span="12")
                        el-form-item(label="毛重"  prop="suttleWeight")
                            el-input(v-model="formRundlet.suttleWeight")
            template(#footer)
                el-button(
                    type="primary"
                    :loading="isSaving"
                    @click="submitFormDialog") 保存提交
        ebrain-dialog-table.mation(
            :isShow="isShow"
            row-key="_id"
            :key="type"
            :current-row-key.sync="currentRowKeyTable"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            :disabled="!currentRowKeyTable"
            @changeCurrent="changeCurrent_table"
            @changeSize="changeSize_table"
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

export default {
    name: 'FetchMaterial',
    data() {
        const validator = (rule, value, callback) => {
            const reg = /^\d+(\.\d{0,4})?$/;
            if (!value) callback();
            if (!reg.test(value)) {
                return callback(new Error('请输入大于0且最多保留四位小数'));
            } else {
                if (!Number(value)) {
                    return callback(new Error('请输入大于0且最多保留四位小数'));
                } else {
                    callback();
                }
            }
        };
        return {
            loadingBatch: false,
            loadingRunblet: false,
            activeName: 'batch',
            options: [],
            dialogSearchForm: {},
            type: '',
            dialogVisibleTable: false,
            row: {},
            tableColumn: [],
            DeliveryData: [],
            currentRowKeyTable: '',
            tableDialogData: [],
            prodDetails: [],
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            isShow: false,
            dialogVisibleDialog: false,
            currentRowKey: '',
            dialogVisible: false,
            isSaving: false,
            rundletData: [],
            BatchData: [],
            nextData: [{
                label: '是',
                value: true,
            }, {
                label: '否',
                value: false,
            }],
            batchColumn: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '生产批次号',
                prop: 'prodBatchNo',
            }, {
                label: '数量',
                prop: 'realAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '操作员',
                prop: 'operator',
            }, {
                label: '开始时间',
                prop: 'beginTime',
            }, {
                label: '结束时间',
                prop: 'endTime',
            }],
            rundletColumn: [{
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
            }, {
                label: '生产批次号',
                prop: 'prodBatchNo',
            }, {
                label: '总重（kg)',
                prop: 'totalWeight',
            }, {
                label: '皮重（kg)',
                prop: 'grossWeight',
            }, {
                label: '净重（kg)',
                prop: 'suttleWeight',
            }],
            tableData: [],
            form: {
                prodBatchNo: '',
                stationNo: '',
                materialNo: '',
                materialName: '',
                realAmount: '',
                materialUnit: '',
                beginTime: '',
                endTime: '',
                operator: '',
                stationId: '',
                palletRfid: '',
                nextFlag: '',
                moduleNo: '',
            },
            formRundlet: {
                prodBatchNo: '',
                totalWeight: '',
                grossWeight: '',
                suttleWeight: '',
            },
            rules: {
                realAmount: [
                    { validator: validator, trigger: 'blur' }
                ]
            },
            rules2: {
                totalWeight: [
                    { validator: validator, trigger: 'blur' }
                ],
                grossWeight: [
                    { validator: validator, trigger: 'blur' }
                ],
                suttleWeight: [
                    { validator: validator, trigger: 'blur' }
                ],
            },
            tableColumnStation: [{
                label: '工作中心',
                prop: 'workcenterNo',
                // searchBy: true,
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
        pn() {
            return this.$route.query.pn;
        },
        column() {
            if (this.activeName === 'batch') return this.batchColumn;
            if (this.activeName === 'bucket') return this.rundletColumn;
            return [];
        },
        isReport() {
            const reg = new RegExp('修边', 'g');
            const isMatch = reg.test(this.pn);
            return isMatch;
        },
    },
    watch: {
        activeName() {
            this.getData();
        },
        dialogVisible(val) {
            if (val) {
                this.getData();
                this.activeName = 'batch';
            } else {
                this.tableData = [];
            }
        },
        dialogVisibleDialog(val) {
            if (val) {
                this.form.operator = this.sysUser.nickname;
                this.form.endTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.form.beginTime = this.workcenter.beginTime;
                if (this.pn === '手动分发' || this.pn === '外观修边') {
                    this.getModuleNo();
                }
            } else {
                this.form = {
                    prodBatchNo: '',
                    orderId: '',
                    materialNo: '',
                    materialName: '',
                    realAmount: '',
                    materialUnit: '',
                    beginTime: '',
                    endTime: '',
                    operator: '',
                    stationId: '',
                    stationNo: '',
                    materialAmount: '',
                    palletRfid: '',
                    nextFlag: '',
                    moduleNo: '',
                };
                this.formRundlet = {
                    prodBatchNo: '',
                    totalWeight: '',
                    grossWeight: '',
                    suttleWeight: '',
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
            this.getDelivery().then(() => {
                if (this.DeliveryData.length) {
                    this.dialogVisible = true;
                } else {
                    this.$alert('请先投料生产', {
                        type: 'warning'
                    });
                }
            });
        },
        // 获取模号列表
        getModuleNo() {
            this.$http.get(`/productionexe/module/listByAllBomFeed`).then(({ data }) => {
                this.options = (data.filter(v => v.moduleNo)).map(v => v.moduleNo);
                this.options = new Set(this.options);
                // this.form.moduleNo = data && data[0] && data[0].moduleNo;
            });
        },
        // 获取投料记录
        getDelivery() {
            return this.$http.post(`/productionexe/orderfeed/list`, null, {
                params: {
                    orderId: this.workcenter.id,
                }
            }).then(({ data }) => {
                this.DeliveryData = data;
            });
        },
        getBatch() {
            this.loadingBatch = true;
            const params = {
                state: '2',
                orderId: this.workcenter.id,
            };
            this.$http.post(`/productionexe/orderprodbatch/list`, null, {
                params
            }).then(({ data }) => {
                this.tableData = data;
                this.loadingBatch = false;
            }).catch(() => {
                this.loadingBatch = false;
            });
        },
        getRundlet() {
            this.loadingRunblet = true;
            const conditionList = [{
                fieldName: 'orderId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.id,
            }];
            this.$http.get(`/productionexe/mixgluekeg/page`, {
                params: {
                    size: 10,
                    conditionList,
                }
            }).then(({ data }) => {
                this.rundletData = data.records;
                this.loadingRunblet = false;
            }).catch(() => {
                this.loadingRunblet = false;
            });
        },
        // 转小桶获取物料批次
        // getRundletBatch() {
        //     this.$http.post(`/productionexe/orderprodbatch/list`, null, {
        //         params: {
        //             state: '2',
        //             workcenterNo: this.workcenter.workcenterNo
        //         }
        //     }).then(({ data }) => {
        //         this.BatchData = data;
        //     });
        // },
        getData() {
            switch (this.activeName) {
                case 'batch':
                    this.getBatch();
                    break;
                case 'bucket':
                    this.getRundlet();
                    this.getBatch();
                    break;
            }
        },
        newRow() {
            this.dialogVisibleDialog = true;
        },
        submitFormDialog() {
            switch (this.activeName) {
                case 'batch':
                    this.$refs.dialogForm.validate(valid => {
                        if (valid) {
                            let obj = {};
                            obj = Object.assign({}, this.form);
                            obj.orderId = this.workcenter.id;
                            delete obj.materialAmount;
                            // obj.prodDetails = [{
                            //     materialAmount: this.form.realAmount,
                            //     materialSn: '1',
                            //     seq: 1,
                            // }];
                            this.isSaving = true;
                            this.$http.post(`/productionexe/orderprodbatch/complete`, obj).then(({ code }) => {
                                if (code === 0) {
                                    this.$message.success('新增成功!');
                                    this.getData();
                                    this.isSaving = false;
                                    this.dialogVisibleDialog = false;
                                }
                            }).catch(() => {
                                this.isSaving = false;
                            });
                        }
                    });
                    break;
                case 'bucket':
                    this.$refs.dialogForm2.validate(valid => {
                        if (valid) {
                            this.isSaving = true;
                            let obj = { ...this.formRundlet };
                            obj.orderId = this.workcenter.id;
                            this.$http.post(`/productionexe/mixgluekeg/save`, obj).then(() => {
                                this.$message.success('新增成功');
                                this.getData();
                                this.isSaving = false;
                                this.dialogVisibleDialog = false;
                            }).catch(() => {
                                this.isSaving = false;
                            });
                        }
                    });
                    break;
            }
        },
        submitForm() {
            this.dialogVisible = false;
        },
        getDialogTable(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            this.tableDialogData = [];
            this.tableColumn = this.tableColumnStation;
            this.getDataStation();
        },
        changeCurrent_table(val) {
            this.getDataStation(val);
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            this.getDataStation();
        },
        submitFormTable() {
            if (Number(this.row.materialAmount) === 0 && this.row.palletRfid !== null) {
                this.form.stationNo = this.row.stationNo;
                this.form.stationId = this.row.id;
                this.form.materialAmount = Number(this.row.materialAmount);
                this.form.palletRfid = this.row.palletRfid;
                this.$http.post(`/productionexe/orderprodbatch/getProcessingByOrderId/${this.workcenter.id}`).then(({ data }) => {
                    this.form.materialNo = data.materialNo;
                    this.form.materialName = data.materialName;
                    this.form.realAmount = data.planAmount;
                    this.form.materialUnit = data.materialUnit;
                    // this.$refs.dialogForm.clearValidate();
                });
                this.dialogVisibleTable = false;
                // this.$refs.dialogForm.clearValidate();
            } else {
                this.$alert('当前工位未领托盘或当前工位已存在物料', {
                    type: 'warning'
                });
            }
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getDataStation(form);
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
        // handlerChange(val) {
        //     const reg = /^\d+(\.\d{0,4})?$/;
        //     if (!reg.test(val)) {
        //         Ma
        //     }
        // },
        getDataStation(val) {
            const params = {
                workcenterNo: this.workcenter.workcenterNo,
                stationType: '3',
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
                // this.currentPage_table = val;
                this.tableDialogData = res.data.map(v => ({
                    ...v,
                    _id: nanoid(),
                }));
                this.pageTotal_table = res.data.total;
                // this.tableDialogData.forEach(v => {
                //     v._id = nanoid();
                // });
            });
        }
    },
};
</script>

<style scoped lang="stylus">
.tabs
    padding-bottom 15px
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
.buttons
    padding-bottom 15px

.redact
    & >>> .el-dialog
        height auto
        width 60%
        margin-top 15%!important

    & >>> .el-form-item__label
        line-height 42px
</style>
