<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="进板"
            :close-on-click-modal="false")
            div.buttons
                el-button(type="primary" @click="newRow()")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
                :column="column"
                :data="tableData"
                :loading="loading"
                :highlight-current-row="false")
            template(#footer)
                el-button.auto(
                    type="primary"
                    @click="$emit('switch', 'IntoThePlateManual')") 切换手动进板
                el-button(
                    type="primary"
                    @click="submitForm") 确定
        el-dialog.redact(
            :visible.sync="dialogVisibleDialog"
            :close-on-click-modal="false")
            el-form.dialogForm(
                label-width="110px"
                ref="dialogForm"
                :model="form"
                :rules="rules"
                inline)
                h3
                    |进板来源
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="来源" required prop="fromType")
                            el-select(
                                v-model="form.fromType"
                                placeholder="请选择"
                                @change="sourceChange")
                                el-option(
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value")
                    el-col(:span="12" v-if="source")
                        el-form-item(label="来源工位编号" required prop="targetStationNo")
                            el-input(v-model="form.targetStationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('来源工位编号')" icon="iconfont iconsearch")
                h3
                    |进板信息
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="类型" prop="materialType")
                            el-select(
                                :disabled="source"
                                v-model="form.materialType"
                                placeholder="请选择"
                                @change="typeChange")
                                el-option(
                                    v-for="item in optionss"
                                    :key="item.value"
                                    :label="item.label"
                                    :disabled="workcenter.id?false:item.disabled"
                                    :value="item.value")
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料料号" prop="materialNo")
                            el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true :disabled="source")
                                el-button(slot="append" @click="getDialogTable('物料料号')" icon="iconfont iconsearch" :disabled="source")
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料名称")
                            el-input(v-model="form.materielName" disabled)
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料批号")
                            el-input(v-model="form.materialBatchNo" disabled)
                    el-col(:span="12" v-if="!mold")
                        el-form-item(label="托盘类型" prop="palletTypeNo")
                            el-select(
                                :disabled="source"
                                v-model="form.palletTypeNo"
                                placeholder="请选择")
                                el-option(
                                    v-for="item in optionPalletTypeInfo"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value")
                    el-col(:span="12")
                        el-form-item(label="领用数量" required prop="planAmount")
                            el-input(
                                v-model="form.planAmount"
                                :disabled="!mold || source")
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="单位")
                            el-input(v-model="form.until" disabled)
                    el-col(:span="12" v-if="!mold")
                        el-form-item(label="操作员" required prop="operator")
                            el-input(v-model="form.operator" disabled)
                    el-col(:span="12")
                        el-form-item(label="时间" required prop="applyTime")
                            el-date-picker(
                                v-model="form.applyTime"
                                type="datetime"
                                placeholder="选择日期时间" disabled)
                h3
                    |进板目标
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="目标工位编号" prop="sourceStationNo")
                            el-input(v-model="form.sourceStationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true :disabled="sourceStationNoDisabled")
                                el-button(slot="append" @click="getDialogTable('目标工位编号')" icon="iconfont iconsearch" :disabled="sourceStationNoDisabled")
                    el-col(:span="12")
                        el-form-item(label="目标工位名称")
                            el-input(v-model="form.sourceStationName" disabled)
                h3
                    |领用备注
                el-row(:gutter="20")
                    el-col(:span="24")
                        el-form-item(label="备注")
                            el-input(
                                v-model="form.remark"
                                type="textarea"
                                resize="none"
                                :autosize={minRows:3,maxRows:12}
                                :row="3")
            template(#footer)
                el-button(
                    :disabled="isSubmit"
                    :loading="isSaving"
                    type="primary"
                    @click="submitFormDialog") 保存提交
        ebrain-dialog-table.mation(
            :table-loading="tableLoading"
            :isShow="isShow"
            :key="type"
            :isHide="isHide"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @resetDialog="resetDialog"
            @search="searchFormWork"
            @row-click="getMeg"
            :disabled="!row.hasOwnProperty('id')"
            @submit="submitFormTable(type)")
            template(#operation)
                el-table-column(
                    v-slot="{row}"
                    label="操作"
                    width="180"
                    align="center")
                    el-button(
                        type="primary"
                        @click="look(row)") 查询库存
        ebrain-dialog-table.mation(
            ref="dataCheckInventoryTable"
            title="库存信息"
            :table-loading="tableLoadingLook"
            :isShow="isShow"
            dialogTableSearch
            @resetDialog="resetDialog"
            @search="searchFormKucun"
            :data="tableDialogDataCheckInventory"
            :column="tableColumnCheckInventory"
            :visible.sync="dialogVisibleTableLook"
            highlight-current-row
            :disabled="materialDisabled===0"
            @current-change="getMegCheck"
            @submit="closeLook")
        //- :row-style="rowStyleHander"
</template>

<script>
import dict from '@/utils/dict';
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'FetchMaterial',
    props: {
        visible: {
            type: Boolean,
            default: () => false,
        }
    },
    data() {
        return {
            rowCheck: {},
            isHide: true,
            tableLoadingLook: false,
            dialogVisibleTableLook: false,
            tableDialogDataCheckInventory: [],
            isSubmit: false,
            loading: false,
            tableLoading: false,
            mold: false,
            source: false,
            isSaving: false,
            options: [{
                label: '仓库',
                value: '2',
            }, {
                label: '工位',
                value: '1'
            }],
            optionss: [{
                label: '物料',
                value: '1',
                disabled: true,
            }, {
                label: '托盘',
                value: '2'
            }],
            optionPalletTypeInfo: [],
            dialogSearchForm: {},
            kucunDialogSearchForm: {},
            type: '',
            dialogVisibleTable: false,
            row: {},
            tableColumn: [],
            currentRowKeyTable: '',
            tableDialogData: [],
            isShow: false,
            dialogVisibleDialog: false,
            currentRowKey: '',
            // dialogVisible: false,
            sourceStationNoDisabled: false,
            column: [{
                label: '运输单号',
                prop: 'transportNo',
            }, {
                label: '类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.goodsType[cell];
                }
            }, {
                label: '物料编号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '数量',
                prop: 'realAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '时间',
                prop: 'applyTime',
            }, {
                label: '操作员',
                prop: 'operator',
            }, {
                label: '备注',
                prop: 'remark',
            }],
            tableData: [],
            form: {
                boardType: '',
                fromType: '',
                sourceStationNo: '',
                targetStationNo: '',
                materialType: '',
                materialNo: '',
                palletTypeNo: '',
                planAmount: '',
                workcenterNo: '',
                operator: '',
                applyTime: '',
                remark: '',
                materialBatchNo: '',
                stockSite: '',
            },
            planAmount: '',
            rules: {
                planAmount: [{
                    validator: (rule, value, callback) => {
                        const amount = Number(this.planAmount);
                        const reg = /^\d+(\.\d{0,4})?$/;
                        if (!value) callback();
                        if (amount) {
                            if (Number(value) > amount) {
                                return callback(new Error('领用数量不可大于库存数量!'));
                            } else {
                                if (!reg.test(value)) {
                                    return callback(new Error('请输入有效数字'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            if (!reg.test(value)) {
                                return callback(new Error('请输入有效数字'));
                            } else {
                                callback();
                            }
                        }
                    },
                    trigger: 'blur',
                }],
                materialType: [
                    { required: true, trigger: 'blur' },
                ],
                materialNo: [
                    { required: true, trigger: 'blur' },
                ],
                palletTypeNo: [
                    { required: true, trigger: 'blur' },
                ],
                sourceStationNo: [
                    { required: true, trigger: 'blur' },
                ]
            },
            tableColumnMaterial: [{
                label: '物料编码',
                prop: 'materialNo',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料类型编号',
                prop: 'materialTypeNo',
                showOverflowTooltip: true,
            }, {
                label: '物料单位',
                prop: 'materialUnit',
                showOverflowTooltip: true,
            }, {
                label: '需用数量',
                prop: 'planAmount',
                showOverflowTooltip: true,
            }, {
                label: '待领取的数量',
                prop: 'unclaimedCount',
                showOverflowTooltip: true,
            }, {
                slot: 'operation'
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
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '工位类型',
                prop: 'stationType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.stationType[cell];
                }
            }],
            tableColumnCheckInventory: [{
                label: '物料料号',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'maktx',
                showOverflowTooltip: true,
            }, {
                label: '批次',
                prop: 'charg',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'menge',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'meins',
                showOverflowTooltip: true,
            }, {
                label: '仓库',
                prop: 'lgort',
                showOverflowTooltip: true,
            }],
            kucunMaterialNo: '',
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        wc() {
            return this.$route.query.wc;
        },
        dialogVisible: {
            get() {
                return this.visible;
            },
            set(v) {
                this.$emit('update:visible', v);
            }
        },
        materialDisabled() {
            return Object.keys(this.rowCheck).length;
        },
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
                this.form.operator = this.sysUser.nickname;
                this.form.applyTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.$nextTick(() => {
                    this.$refs.dialogForm.clearValidate();
                });
            } else {
                this.getData();
                this.sourceStationNoDisabled = false;
                this.isSubmit = false;
                this.source = false;
                this.mold = false;
                this.form = {
                    fromType: '',
                    sourceStationNo: '',
                    targetStationNo: '',
                    palletTypeNo: '',
                    materialType: '',
                    materialNo: '',
                    planAmount: '',
                    operator: '',
                    applyTime: '',
                    remark: '',
                    materialBatchNo: '',
                    stockSite: '',
                };
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.row = {};
            }
        },
        dialogVisibleTableLook(v) {
            if (!v) {
                this.rowCheck = {};
                this.kucunDialogSearchForm = {};
                this.kucunMaterialNo = '';
            }
        },
        workcenter(v) {
            if (v.id) {
                this.getData();
            }
        }
    },
    mounted() {
        if (this.workcenter.id) {
            this.getData();
        }
    },
    methods: {
        // 获取托盘类型信息
        getPalletTypeInfo() {
            this.loading = true;
            this.optionPalletTypeInfo = [];
            this.$http.get('/basicdata/pallettype/page?size=9999').then(({ data }) => {
                data.records.forEach(item => {
                    const obj = {};
                    obj.label = item.palletTypeName;
                    obj.value = item.palletTypeNo;
                    this.optionPalletTypeInfo.push(obj);
                });
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        open() {
            this.dialogVisible = true;
        },
        getData() {
            if (this.workcenter.id) {
                this.loading = true;
                this.$http.get('/productionexe/boardio/list', {
                    params: {
                        boardType: '1',
                        orderId: this.workcenter.id,
                        materialType: '1',
                    }
                }).then(({ data }) => {
                    this.loading = false;
                    this.tableData = data;
                }).catch(() => {
                    this.loading = false;
                });
            }
        },
        newRow() {
            this.dialogVisibleDialog = true;
            this.getPalletTypeInfo();
        },
        submitFormDialog() {
            this.$refs.dialogForm.validate((valid) => {
                if (valid) {
                    let obj = {
                        // boardType: '1',
                        fromType: this.form.fromType,
                        sourceStationNo: this.form.sourceStationNo,
                        targetStationNo: this.form.targetStationNo,
                        materialType: this.form.materialType,
                        materialNo: this.form.materialNo,
                        planAmount: this.form.planAmount,
                        materialUnit: this.form.until,
                        workcenterNo: this.wc,
                        palletTypeNo: this.form.palletTypeNo,
                        orderId: this.workcenter.id,
                        operator: this.form.operator,
                        materialBatchNo: this.form.materialBatchNo,
                        stockSite: this.form.stockSite,
                        applyTime: moment(this.form.applyTime).format('YYYY-MM-DD HH:mm:ss'),
                        remark: this.form.remark,
                    };
                    this.isSaving = true;
                    this.$http.post('/productionexe/boardio/applyBoardInAuto', obj).then(() => {
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
        materialChangeHandler(val) {
            const item = this.materielOptions.find(v => v.materielCode === val);
            this.form.materielName = item.materialName;
            this.form.subMtNeed = item.subMtNeed;
            this.form.stationCode = item.stationCode;
            this.form.needAmount = item.takeAmount;
            this.unit = item.unit;
        },
        getDialogTable(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            this.tableDialogData = [];
            switch (type) {
                case '物料料号':
                    this.tableColumn = this.tableColumnMaterial;
                    this.getDataMaterial();
                    break;
                case '来源工位编号':
                    this.tableColumn = this.tableColumnStation;
                    this.getDialogTable_source();
                    break;
                case '目标工位编号':
                    this.tableColumn = this.tableColumnStation;
                    this.getDialogTable_target();
                    break;
                default:
                    break;
            }
        },
        // 通过物料获取工单编号
        getSourceStationInfo(materialNo) {
            this.$http.get(`/productionexe/stationmaterialtype/getStationByMaterialNo/${this.wc}/${materialNo}`).then(res => {
                if (res.data.state === '0') {
                    this.form.sourceStationNo = res.data.stationNo;
                    this.form.sourceStationName = res.data.stationName;
                } else {
                    this.$message.error('该物料对应的目标工位为非空闲工位！');
                }
            });
        },
        submitFormTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case '物料料号':
                    this.form.materialNo = this.row.materialNo;
                    this.getSourceStationInfo(this.row.materialNo);
                    break;
                case '来源工位编号':
                    this.isSubmit = false;
                    if (this.row.palletRfid) {
                        this.form.materielName = '';
                        this.form.targetStationNo = this.row.stationNo;
                        if (this.row.materialAmount) {
                            this.form.materialType = '1';
                            this.sourceStationNoDisabled = true;
                            this.mold = true;
                            this.form.materialNo = this.row.materialNo;
                            this.form.materielName = this.row.materialName;
                            this.form.planAmount = this.row.materialAmount;
                            this.form.until = this.row.materialUnit;
                            this.form.palletTypeNo = '';
                            this.getSourceStationInfo(this.row.materialNo);
                        } else {
                            this.form.materialNo = '';
                            this.form.materielName = '';
                            this.form.sourceStationNo = '';
                            this.form.sourceStationName = '';
                            this.form.materialType = '2';
                            this.sourceStationNoDisabled = false;
                            this.form.palletTypeNo = this.row.palletTypeNo;
                            this.mold = false;
                            this.form.planAmount = 1;
                        }
                    } else {
                        this.isSubmit = true;
                        this.$alert(`当前工位不存在托盘RFID，不能进板!`, {
                            type: 'error'
                        });
                        this.form.materialType = '';
                        this.form.materialNo = '';
                        this.form.materielName = '';
                        this.form.planAmount = '';
                        this.form.until = '';
                    }
                    break;
                case '目标工位编号':
                    this.form.sourceStationNo = this.row.stationNo;
                    this.form.sourceStationName = this.row.stationName;
                    break;
                default:
                    break;
            }
            this.currentRowKey = '';
            this.row = {};
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case '物料料号':
                    this.getDataMaterial(form);
                    break;
                case '来源工位编号':
                    this.getDialogTable_source(form);
                    break;
                case '目标工位编号':
                    this.getDialogTable_target(form);
                    break;
                default:
                    break;
            }
        },
        searchFormKucun(form) {
            this.kucunDialogSearchForm = form;
            this.getKucun();
        },
        getMeg(row) {
            this.row = row;
        },
        getMegCheck(row) {
            // if (row.lgort === 'SN05') {
            //     this.$refs.dataCheckInventoryTable.setCurrentRow();
            //     this.rowCheck = {};
            // } else {
            this.rowCheck = row;
            // }
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
        getDataMaterial() {
            const params = {
                size: 9999,
                conditionList: [],
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
            this.tableLoading = true;
            this.$http.get(`/productionexe/orderbom/listOrderBom/${this.workcenter.id}`, {
                params
            }).then(res => {
                this.tableLoading = false;
                this.tableDialogData = res.data;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        getDialogTable_source(val = 1) {
            const obj = {
                // workcenterNo: this.wc,
                // stationType: '1',
                status: '3',
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/productionexe/station/list?size=9999', obj).then(res => {
                this.tableLoading = false;
                this.tableDialogData = res.data;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        getDialogTable_target(val = 1) {
            const obj = {
                workcenterNo: this.wc,
                status: '0',
                // stationType: '1',
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/productionexe/station/list?size=9999', obj).then(res => {
                this.tableLoading = false;
                this.tableDialogData = res.data;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        sourceChange(val) {
            // val === '1' ? this.source = false : this.source = true;
            this.isSubmit = false;
            this.form.sourceStationNo = '';
            this.form.sourceStationName = '';
            this.form.targetStationNo = '';
            this.form.materialType = '';
            this.form.materialNo = '';
            this.form.materielName = '';
            this.form.until = '';
            this.form.palletTypeNo = '';
            this.form.planAmount = '';
            this.form.remark = '';
            if (val === '2') {
                this.source = false;
            } else {
                this.source = true;
                this.form.targetStationNo = '';
            }
            this.$refs.dialogForm.clearValidate();
        },
        typeChange(val) {
            this.form.sourceStationNo = '';
            this.form.sourceStationName = '';
            this.form.palletTypeNo = '';
            this.form.remark = '';
            this.form.until = '';
            this.form.materialNo = '';
            this.form.materielName = '';
            if (val === '1') {
                this.sourceStationNoDisabled = true;
                this.mold = true;
                this.form.planAmount = '';
            } else {
                this.sourceStationNoDisabled = false;
                this.mold = false;
                this.form.planAmount = 1;
            }
            // this.$refs.dialogForm.resetField();
        },
        look(row) {
            this.dialogVisibleTableLook = true;
            this.tableLoadingLook = true;
            this.kucunMaterialNo = row.materialNo;
            this.getKucun();
        },
        getKucun() {
            const params = {};
            if (this.kucunDialogSearchForm) {
                for (let i in this.kucunDialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.kucunDialogSearchForm, i)) {
                        if (this.kucunDialogSearchForm[i]) {
                            params[i] = this.kucunDialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.get(`/productionexe/orderbom/sapStock/search/${this.kucunMaterialNo}`, {
                params
            }).then(res => {
                this.tableLoadingLook = false;
                this.tableDialogDataCheckInventory = res.data.filter(v => v.menge !== '0');
            }).catch(() => {
                this.tableLoadingLook = false;
            });
        },
        closeLook() {
            this.dialogVisibleTableLook = false;
            this.dialogVisibleTable = false;
            this.form.materialNo = this.rowCheck.matnr;
            this.form.materielName = this.rowCheck.maktx;
            this.form.planAmount = this.rowCheck.menge;
            this.form.until = this.rowCheck.meins;
            this.form.materialBatchNo = this.rowCheck.charg;
            this.form.stockSite = this.rowCheck.lgort;
            this.planAmount = this.rowCheck.menge;
            this.getSourceStationInfo(this.rowCheck.matnr);
        },
        // rowStyleHander({ row, rowIndex }) {
        //     if (row.lgort === 'SN05') {
        //         return {
        //             backgroundColor: '#E4E7ED',
        //         };
        //     }
        // }
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
        margin-top 3%!important

    & >>> .el-form-item__label
        line-height 42px
.dialogForm >>> .el-form-item__content
    width: calc(100% - 110px);
.auto
    float left
</style>
