<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="出板"
            :close-on-click-modal="false")
            div.buttons
                el-button(type="primary" @click="newRow()")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
                :column="column"
                :loading="loading"
                :data="tableData"
                :highlight-current-row="false")
            template(#footer)
                el-button.auto(
                    type="primary"
                    @click="$emit('switch', 'OutofThePlateManual')") 切换手动出板
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
                inline)
                h3
                    |出板来源
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="来源工位编号" required prop="sourceStationNo")
                            el-input(v-model="form.sourceStationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('来源工位编号')" icon="iconfont iconsearch")
                h3
                    |出板目标
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="目标" required prop="fromType")
                            el-select(
                                v-model="form.fromType"
                                placeholder="请选择"
                                @change="sourceChange")
                                el-option(
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled")
                    el-col(:span="12" v-if="source")
                        el-form-item(label="目标工位编号")
                            el-input(v-model="form.targetStationNo" placeholder="按搜索键搜索选择" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('目标工位编号')" icon="iconfont iconsearch")
                h3
                    |出板信息
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="类型")
                            el-select(
                                disabled
                                v-model="form.materialType"
                                placeholder="来源工位编码带出"
                                @change="typeChange")
                                el-option(
                                    v-for="item in optionss"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value")
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料料号")
                            el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" disabled)
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料名称")
                            el-input(v-model="form.materielName" disabled)
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="物料批号")
                            el-input(v-model="form.materialBatchNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="数量" prop="planAmount")
                            el-input(v-model="form.planAmount" disabled)
                    el-col(:span="12" v-if="mold")
                        el-form-item(label="单位" prop="until")
                            el-input(v-model="form.until" disabled)
                    el-col(:span="12")
                        el-form-item(label="操作员" required prop="operator")
                            el-input(v-model="form.operator" disabled)
                    el-col(:span="12")
                        el-form-item(label="时间" required prop="applyTime")
                            el-date-picker(
                                v-model="form.applyTime"
                                type="datetime"
                                placeholder="选择日期时间")
                h3
                    |出板备注
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
                    :loading="isLoading"
                    :disabled="isSubmit"
                    type="primary"
                    @click="submitFormDialog") 保存提交
        ebrain-dialog-table.mation(
            :table-loading="tableLoading"
            :isShow="isShow"
            :key="type"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @resetDialog="resetDialog"
            @search="searchFormWork"
            @row-click="getMeg"
            @submit="submitFormTable(type)")
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
            isSubmit: false,
            loading: false,
            tableLoading: false,
            mold: false,
            source: false,
            isLoading: false,
            options: [{
                label: '仓库',
                value: '2',
            }, {
                label: '工位',
                value: '1',
                disabled: false,
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
                prop: 'planAmount',
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
                sourceStationNo: '',
                fromType: '',
                targetStationNo: '',
                materialType: '',
                materialNo: '',
                materielName: '',
                materialBatchNo: '',
                palletTypeNo: '',
                planAmount: '',
                until: '',
                operator: '',
                applyTime: '',
                remark: '',
            },
            tableColumnMaterial: [{
                label: '物料编码',
                prop: 'materialCode',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '长',
                prop: 'leng',
                showOverflowTooltip: true,
            }, {
                label: '宽',
                prop: 'width',
                showOverflowTooltip: true,
            }, {
                label: '高',
                prop: 'height',
                showOverflowTooltip: true,
            }, {
                label: '对角线',
                prop: 'diagonal',
                showOverflowTooltip: true,
            }, {
                label: '厚度',
                prop: 'thickNess',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
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
                this.form = {
                    sourceStationNo: '',
                    fromType: '',
                    targetStationNo: '',
                    materialType: '',
                    materialNo: '',
                    materielName: '',
                    materialBatchNo: '',
                    palletTypeNo: '',
                    planAmount: '',
                    until: '',
                    applyTime: '',
                    remark: '',
                    operator: '',
                };
                this.mold = false;
                this.source = false;
                this.isSubmit = false;
                this.$refs.dialogForm.clearValidate();
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.row = {};
            }
        },
    },
    mounted() {
        this.getData();
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        getData() {
            this.loading = true;
            this.$http.get('/productionexe/boardio/list', {
                params: {
                    boardType: '2',
                    orderId: this.workcenter.id,
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
        },
        submitFormDialog() {
            this.$refs.dialogForm.validate((valid) => {
                if (valid) {
                    this.isLoading = true;
                    let obj = {
                        // boardType: '2',
                        fromType: this.form.fromType,
                        sourceStationNo: this.form.sourceStationNo,
                        targetStationNo: this.form.targetStationNo,
                        materialType: this.form.materialType,
                        materialNo: this.form.materialNo,
                        materialBatchNo: this.form.materialBatchNo,
                        palletTypeNo: this.form.palletTypeNo,
                        planAmount: this.form.planAmount,
                        workcenterNo: this.wc,
                        orderId: this.workcenter.id,
                        operator: this.form.operator,
                        applyTime: moment(this.form.applyTime).format('YYYY-MM-DD HH:mm:ss'),
                        remark: this.form.remark,
                    };
                    this.$http.post(`/productionexe/boardio/applyBoardOutAuto`, obj).then(() => {
                        this.$message.success('新增成功!');
                        this.getData();
                        this.dialogVisibleDialog = false;
                        this.isLoading = false;
                    }).catch(() => {
                        this.isLoading = false;
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
                case '来源工位编号':
                    // this.form.materialNo = '';
                    // this.form.materielName = '';
                    // this.form.materialBatchNo = '';
                    // this.form.planAmount = '';
                    // this.form.until = '';
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
                case '来源工位编号':
                    this.isSubmit = false;
                    if (this.row.palletRfid) {
                        this.form.materielName = '';
                        this.form.materialBatchNo = '';
                        this.form.until = '';
                        this.form.sourceStationNo = this.row.stationNo;
                        this.form.materialNo = this.row.materialNo;
                        this.form.palletTypeNo = this.row.palletTypeNo;
                        if (this.row.materialAmount) {
                            this.form.materialType = '1';
                            this.mold = true;
                            this.form.materielName = this.row.materialName;
                            this.form.materialBatchNo = this.row.materialBatchNo;
                            this.form.planAmount = this.row.materialAmount;
                            this.form.until = this.row.materialUnit;
                        } else {
                            this.form.materialType = '2';
                            this.form.planAmount = 1;
                            this.mold = false;
                        }
                        if (this.row.stationType === '1') {
                            this.form.fromType = '2';
                            this.options[1].disabled = true;
                        } else if (this.row.stationType === '3') {
                            this.options[1].disabled = false;
                        }
                    } else {
                        this.isSubmit = true;
                        this.$alert(`当前工位不存在托盘RFID，不能出板!`, {
                            type: 'error'
                        });
                        this.form.materialType = '';
                        this.form.materialNo = '';
                        this.form.materielName = '';
                        this.form.planAmount = '';
                        this.form.materialBatchNo = '';
                        this.form.until = '';
                        this.options[1].disabled = false;
                    }
                    break;
                case '目标工位编号':
                    this.form.targetStationNo = this.row.stationNo;
                    this.form.targetStationName = this.row.stationName;
                    break;
                default:
                    break;
            }
            this.currentRowKey = '';
            this.row = [];
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
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
        getDialogTable_source(val = 1) {
            const obj = {
                workcenterNo: this.wc,
                status: '3'
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
                stationType: '1',
                status: '0',
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
            if (val === '2') {
                this.source = false;
            } else {
                this.source = true;
                this.form.targetStationNo = '';
            }
        },
        typeChange(val) {
            if (val === '1') {
                this.mold = true;
                this.form.planAmount = '';
            } else {
                this.mold = false;
                this.form.planAmount = 1;
            }
        },
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
