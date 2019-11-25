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
            ebrain-table.dialogTable(
                :column="column"
                :data="tableData"
                :loading="loading"
                :highlight-current-row="false")
            template(#footer)
                el-button.manual(
                    type="primary"
                    @click="$emit('switch', 'IntoThePlateAuto')") 切换自动进板
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
                    |进板目标
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="目标工位编号" required prop="sourceStationNo")
                            el-input(v-model="form.sourceStationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('目标工位编号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="目标工位名称")
                            el-input(v-model="form.sourceStationName" disabled)
                h3
                    |进板信息
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="类型" required prop="materialType")
                            el-select(
                                :disabled="source"
                                v-model="form.materialType"
                                placeholder="请选择"
                                @change="typeChange")
                                el-option(
                                    v-for="item in optionss"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value")
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料料号" required prop="materialNo")
                            el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true :disabled="source")
                                el-button(slot="append" @click="getDialogTable('物料料号')" icon="iconfont iconsearch" :disabled="source")
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
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料名称")
                            el-input(v-model="form.materielName" disabled)
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料批号")
                            el-input(v-model="form.materialBatchNo")
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
                        el-form-item(label="领用日期" required prop="applyTime")
                            el-date-picker(
                                v-model="form.applyTime"
                                type="datetime"
                                placeholder="选择日期时间")
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
            :isHide="isHide"
            :table-loading="tableLoading"
            :isShow="isShow"
            :key="type"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            @resetDialog="resetDialog"
            @search="searchFormWork"
            :disabled="Object.keys(row).length===0"
            highlight-current-row
            @row-click="getMeg"
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
            :table-loading="tableLoading"
            :isShow="isShow"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTableTP"
            highlight-current-row
            :disabled="tpDisabled===0"
            @row-click="getMegTP"
            @submit="submitFormTableTP")
        ebrain-dialog-table.mation(
            ref="dataCheckInventoryTable"
            highlight-current-row
            title="库存信息"
            dialogTableSearch
            @resetDialog="resetDialog"
            @search="searchFormKucun"
            :table-loading="tableLoadingLook"
            :isShow="isShow"
            :disabled="materialDisabled===0"
            :data="tableDialogDataCheckInventory"
            :column="tableColumnCheckInventory"
            :visible.sync="dialogVisibleTableLook"
            @current-change="getMegCheckInventory"
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
            optionPalletTypeInfo: [],
            typeCase: '',
            dialogVisibleTableTP: false,
            rowTP: {},
            rowCheckInventory: {},
            isHide: true,
            tableLoadingLook: false,
            dialogVisibleTableLook: false,
            tableDialogDataCheckInventory: [],
            kucunDialogSearchForm: {},
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
            }, {
                label: '托盘',
                value: '2'
            }],
            dialogSearchForm: {},
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
            column: [{
                label: '进板工位编号',
                prop: 'sourceStationNo',
            }, {
                label: '材料类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.goodsType[cell];
                }
            }, {
                label: '目标类型',
                prop: 'fromType',
                formatter(row, column, cell) {
                    return dict.fromType[cell];
                }
            }, {
                label: '物料编号',
                prop: 'materialNo',
            }, {
                label: '计划数量',
                prop: 'realAmount',
            }, {
                label: '实际数量',
                prop: 'planAmount',
            }, {
                label: '领用日期',
                prop: 'applyTime',
            }, {
                label: '状态',
                prop: 'boardOutStats',
                formatter(row, column, cell) {
                    return dict.boardOutStats[cell];
                }
            }],
            tableData: [],
            form: {
                boardType: '',
                fromType: '',
                sourceStationName: '',
                sourceStationNo: '',
                targetStationNo: '',
                materialType: '',
                materialNo: '',
                materialBatchNo: '',
                planAmount: '',
                workcenterNo: '',
                operator: '',
                applyTime: '',
                remark: '',
                stockSite: '',
                palletTypeNo: '',
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
                palletTypeNo: [
                    { required: true, trigger: 'blur' },
                ],
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
            return Object.keys(this.rowCheckInventory).length;
        },
        tpDisabled() {
            return Object.keys(this.rowTP).length;
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
                this.form.operator = this.sysUser.nickname;
                this.form.applyTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.$nextTick(() => {
                    this.$refs.dialogForm.clearValidate();
                });
            } else {
                this.isSubmit = false;
                this.source = false;
                this.mold = false;
                this.form = {
                    fromType: '',
                    sourceStationNo: '',
                    sourceStationName: '',
                    targetStationNo: '',
                    materialType: '',
                    materialNo: '',
                    materialBatchNo: '',
                    planAmount: '',
                    operator: '',
                    applyTime: '',
                    remark: '',
                    stockSite: '',
                    palletTypeNo: ''
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
                this.rowCheckInventory = {};
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
            this.loading = true;
            this.$http.get('/productionexe/boardio/list', {
                params: {
                    boardType: '1',
                    orderId: this.workcenter.id,
                    // fromType: '2',
                    materialType: '1',
                }
            }).then(({ data }) => {
                this.loading = false;
                this.tableData = data;
            }).catch(() => {
                this.loading = false;
            });
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
                        palletTypeNo: this.form.palletTypeNo,
                        fromType: this.form.fromType,
                        sourceStationNo: this.form.sourceStationNo,
                        targetStationNo: this.form.targetStationNo,
                        materialType: this.form.materialType,
                        materialNo: this.form.materialNo,
                        materialBatchNo: this.form.materialBatchNo,
                        planAmount: this.form.planAmount,
                        workcenterNo: this.wc,
                        orderId: this.workcenter.id,
                        operator: this.form.operator,
                        applyTime: moment(this.form.applyTime).format('YYYY-MM-DD HH:mm:ss'),
                        remark: this.form.remark,
                        stockSite: this.form.stockSite,
                    };
                    this.isSaving = true;
                    this.$http.post('/productionexe/boardio/applyBoardIn', obj).then(() => {
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
            if (this.typeCase === '1') {
                this.dialogVisibleTable = true;
            } else if (this.typeCase === '2') {
                this.dialogVisibleTableTP = true;
            } else {
                this.dialogVisibleTable = true;
            }
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
        submitFormTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case '物料料号':
                    this.form.materialNo = this.row.materialNo;
                    break;
                case '来源工位编号':
                    this.isSubmit = false;
                    if (this.row.palletRfid) {
                        this.form.materielName = '';
                        this.form.materialBatchNo = '';
                        this.form.targetStationNo = this.row.stationNo;
                        this.form.until = this.row.materialUnit;
                        this.form.materialNo = this.row.materialNo;
                        if (this.row.materialAmount) {
                            this.form.materialType = '1';
                            this.mold = true;
                            this.form.materielName = this.row.materialName;
                            this.form.materialBatchNo = this.row.materialBatchNo;
                            this.form.planAmount = this.row.materialAmount;
                            this.form.palletTypeNo = '';
                        } else {
                            this.form.materialType = '2';
                            this.mold = false;
                            this.form.planAmount = 1;
                            this.form.palletTypeNo = this.row.palletTypeNo;
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
                        this.form.materialBatchNo = '';
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
        submitFormTableTP() {
            this.form.sourceStationNo = this.rowTP.stationNo;
            this.form.sourceStationName = this.rowTP.stationName;
            this.dialogVisibleTableTP = false;
        },
        // 表内搜索
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
        getMeg(row) {
            this.row = row;
        },
        getMegTP(row) {
            this.rowTP = row;
        },
        getMegCheckInventory(row) {
            // if (row.lgort === 'SN05') {
            //     this.$refs.dataCheckInventoryTable.setCurrentRow();
            //     this.rowCheckInventory = {};
            // } else {
            this.rowCheckInventory = row;
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
        searchFormKucun(form) {
            this.kucunDialogSearchForm = form;
            this.getKucun();
        },
        getDataMaterial() {
            const params = {
                size: 999,
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
        getDialogTable_source() {
            const obj = {
                stationType: '3',
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
            this.$http.post('/productionexe/station/list?size=999', obj).then(res => {
                this.tableLoading = false;
                this.tableDialogData = res.data;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        getDialogTable_target() {
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
            this.$http.post('/productionexe/station/list?size=999', obj).then(res => {
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
            this.form.materialBatchNo = '';
            this.form.planAmount = '';
            this.form.palletTypeNo = '';
            this.form.remark = '';
            if (val === '2') {
                this.source = false;
            } else {
                this.source = true;
                this.form.targetStationNo = '';
            }
        },
        typeChange(val) {
            this.typeCase = val;
            this.form.until = '';
            this.form.materialNo = '';
            this.form.materielName = '';
            this.form.materialBatchNo = '';
            this.form.palletTypeNo = '';
            if (val === '1') {
                this.mold = true;
                this.form.planAmount = '';
            } else {
                this.mold = false;
                this.form.planAmount = 1;
                // this.form.until = this.workcenter.materialUnit;
            }
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
            this.form.materialNo = this.rowCheckInventory.matnr;
            this.form.materielName = this.rowCheckInventory.maktx;
            this.form.until = this.rowCheckInventory.meins;
            this.form.materialBatchNo = this.rowCheckInventory.charg;
            this.form.stockSite = this.rowCheckInventory.lgort;
            this.form.planAmount = this.rowCheckInventory.menge;
            this.planAmount = this.rowCheckInventory.menge;
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

.dialog
    height 100%

    & >>> .el-dialog__body
        height 100%

        & >>> .el-table__body-wrapper
            overflow-y auto
.redact
    & >>> .el-dialog
        height auto
        width 60%
        margin-top 3%!important

    & >>> .el-form-item__label
        line-height 42px

.dialogForm >>> .el-form-item__content
    width: calc(100% - 110px);
.manual
    float left
</style>
