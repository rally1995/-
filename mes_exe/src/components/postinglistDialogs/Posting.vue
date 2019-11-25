<template lang="pug">
    div.not-posting
        el-dialog(
            :visible.sync="dialogVisible"
            title="已过账"
            :close-on-click-modal="false")
            el-form.dialogForm(
                :model="form"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="物料编号")
                            el-input(v-model="form.materielNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称")
                            el-input(v-model="form.materielName" disabled)
                    el-col(:span="12")
                        el-form-item(label="单位")
                            el-input(v-model="form.materielUnit" disabled)
                    el-col(:span="12")
                        el-form-item(label="工单数量")
                            el-input(v-model="form.orderAmount" disabled)
                    el-col(:span="12")
                        el-form-item(label="实际产出数量")
                            el-input(v-model="form.productAmount" disabled)
                    el-col(:span="12")
                        el-form-item(label="生产批次")
                            el-input(v-model="form.productLot" disabled)
                    el-col(:span="12")
                        el-form-item(label="开始时间")
                            el-date-picker(
                                v-model="form.beginTime"
                                type="datetime" disabled)
                    el-col(:span="12")
                        el-form-item(label="结束时间")
                            el-date-picker(
                                v-model="form.endTime"
                                type="datetime" disabled)
                    el-col(:span="12")
                        el-form-item(label="库存地点")
                            el-select(v-model="form.storageLocation" placeholder="请选择" disabled)
                                el-option(
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value")
                    el-col(:span="12")
                        el-form-item(label="生产版本" required=true)
                            el-input(v-model="form.productVersiion" disabled)
                    el-col(:span="12")
                        el-form-item(label="机台号")
                            el-input(v-model="form.machinePlatformNo" disabled)
                    el-col(:span="12")
                        el-form-item(label="操作员")
                            el-input(v-model="form.updateByName" disabled)
                    el-col(:span="24")
                        el-form-item(label="SAP过账信息描述")
                            el-input(v-model="form.sapResult" disabled)
                    el-col(:span="24")
                        el-form-item(label="SAP凭证号")
                            el-input(v-model="form.sapVoucherNo" disabled)
                    el-col(:span="24")
                        el-form-item(label="SAP过账时间")
                            el-date-picker(
                                v-model="form.sapTime"
                                type="datetime" disabled)
                    el-col(:span="24")
                        el-form-item(label="过账状态")
                            el-input(v-model="form.state" disabled)
            template(#footer)
                el-button(
                    type="primary"
                    @click="getBatch") 查看投料明细
                el-button(
                    type="primary"
                    @click="submitForm") 冲销
        ebrain-dialog-table(
                :data="tableDataBatch"
                :column="tableColumnBatch"
                :submitLoading='submitLoadingBatch'
                :visible.sync="dialogVisibleBatch"
                highlight-current-row
                :is-hide="false")
</template>

<script>
import {
    getPosting,
    getNotPosting,
    postWithDraw,
} from '@/utils/api';
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';

export default {
    name: 'Transfer',
    props: {
        code: Object
    },
    data() {
        return {
            dialogVisibleBatch: false,
            submitLoadingBatch: true,
            dialogVisible: false,
            materialData: [],
            tableColumnBatch: [{
                label: '料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '生产批次',
                prop: 'prodBatchNo',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '需求数量',
                prop: 'needAmount',
            }, {
                label: '实际领料数量',
                prop: 'drawAmount',
            }, {
                label: '其中报废数量',
                prop: 'scrapAmount',
            }, {
                label: '领料仓',
                prop: 'warehouse',
                editable: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                },
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
            }, {
                label: '是否过账物料',
                prop: 'needPosting',
                formatter(row, column, cell) {
                    return dict.needPosting[cell];
                }
            }],
            options: [
                {
                    label: 'SN01',
                    value: 'SN01'
                }, {
                    label: 'SN02',
                    value: 'SN02'
                }, {
                    label: 'SN03',
                    value: 'SN03'
                }, {
                    label: 'SN04',
                    value: 'SN04'
                }, {
                    label: 'SN05',
                    value: 'SN05'
                }, {
                    label: 'SN09',
                    value: 'SN09'
                }, {
                    label: 'SN10',
                    value: 'SN10'
                }
            ],
            form: {
                materielNo: '',
                materielName: '',
                materielUnit: '',
                orderAmount: '',
                productAmount: '',
                productLot: '',
                beginTime: '',
                endTime: '',
                storageLocation: '',
                productVersiion: '',
                machinePlatformNo: '',
                sapResult: '',
                sapVoucherNo: '',
                sapTime: '',
                state: '',
                updateByName: '',
            },
            tableDataBatch: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        ...mapState('sys', {
            sysUser: state => state.sysUser,
            storeDict: state => state.dict,
        }),
        orderNo() {
            return this.$route.query.order;
        },
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.form.orderAmount = this.workcenter.materialAmount;
                this.queryMaterial();
            } else {
                this.form = {
                    materielNo: '',
                    materielName: '',
                    materielUnit: '',
                    orderAmount: '',
                    productAmount: '',
                    productLot: '',
                    beginTime: '',
                    endTime: '',
                    storageLocation: '',
                    productVersiion: '',
                    machinePlatformNo: '',
                    sapResult: '',
                    sapVoucherNo: '',
                    sapTime: '',
                    state: '',
                    updateByName: ''
                };
                this.materialData = [];
                this.tableDataBatch = [];
            }
        },
    },
    methods: {
        ...mapActions('sys', ['queryDict']),
        open() {
            this.dialogVisible = true;
        },
        getBatch() {
            this.dialogVisibleBatch = true;
            getNotPosting(this.workcenter.id).then(({ data }) => {
                this.tableDataBatch = data;
            });
        },
        queryMaterial() {
            getPosting(
                this.code.postingId
            ).then(({ data }) => {
                if (data) {
                    this.form.materielNo = data.materialNo;
                    this.form.materielName = data.materialName;
                    this.form.materielUnit = data.materialUnit;
                    this.form.productAmount = data.realAmount;
                    this.form.productLot = data.materialBatchNo;
                    this.form.beginTime = data.beginTime;
                    this.form.endTime = data.endTime;
                    this.form.storageLocation = data.storageLocation;
                    this.form.productVersiion = data.productVersion;
                    this.form.machinePlatformNo = data.machineNo;
                    this.form.updateByName = data.updateBy;
                    this.form.sapResult = data.sapResult;
                    this.form.sapTime = data.sapTime;
                    this.form.state = dict.state[data.state];
                    this.postingId = data.id;
                    this.form.sapVoucherNo = data.sapVoucherNo;
                }
            });
        },
        submitForm() {
            postWithDraw(this.postingId).then(({ code }) => {
                if (code === 0) {
                    this.dialogVisible = false;
                    this.$message.success(`冲销成功`);
                }
            });
        },
    },
};
</script>

<style scoped lang="stylus">
.not-posting >>> .el-dialog
    height 94%!important
</style>