<template lang="pug">
    div
        el-dialog(
            :visible.sync="dialogVisible"
            title="未过账"
            :close-on-click-modal="false")
            el-steps(
                :active="step"
                align-center
                finish-status="success")
                el-step(title="填写过账信息")
                el-step(title="确认投入批次")
            div(v-show="step===0")
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
                            el-form-item(label="生产批次" required=true)
                                el-input(v-model="form.productLot" disabled)
                        el-col(:span="12")
                            el-form-item(label="开始时间" required=true)
                                el-date-picker(
                                    v-model="form.beginTime"
                                    type="datetime")
                        el-col(:span="12")
                            el-form-item(label="结束时间" required=true)
                                el-date-picker(
                                    v-model="form.endTime"
                                    type="datetime")
                        el-col(:span="12")
                            el-form-item(label="库存地点" required=true)
                                el-select(v-model="form.storageLocation" placeholder="请选择")
                                    el-option(
                                        v-for="item in options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value")
                        el-col(:span="12")
                            el-form-item(label="生产版本" required=true)
                                el-input(v-model="form.productVersiion")
                        el-col(:span="12")
                            el-form-item(label="机台号" required=true)
                                el-input(v-model="form.machinePlatformNo")
                        el-col(:span="12")
                            el-form-item(label="操作员")
                                el-input(v-model="form.operator" disabled)
            ebrain-table(
                v-if="dialogVisible"
                v-show="step===1"
                :column="materialColumn"
                :data="materialData"
                :highlight-current-row="false"
                row-key="id")
                template(#materialNo)
                    el-table-column(label="料号" v-slot="{row}")
                        el-input(
                            v-model="row.materialNo"
                            @change="changeHandler(row.id, 'materialNo', row.materialNo)")
                template(#materialName)
                    el-table-column(label="物料名称" v-slot="{row}")
                        el-input(
                            v-model="row.materialName"
                            @change="changeHandler(row.id, 'materialName', row.materialName)")
                template(#prodBatchNo)
                    el-table-column(label="批次" v-slot="{row}")
                        el-input(
                            v-model="row.prodBatchNo"
                            @change="changeHandler(row.id, 'prodBatchNo', row.prodBatchNo)")
                template(#materialUnit)
                    el-table-column(label="单位" v-slot="{row}")
                        el-input(
                            v-model="row.materialUnit"
                            @change="changeHandler(row.id, 'materialUnit', row.materialUnit)")
                template(#needAmount)
                    el-table-column(label="需求数量" v-slot="{row}")
                        el-input(
                            v-model="row.needAmount"
                            @change="changeHandler(row.id, 'needAmount', row.needAmount)")
                template(#drawAmount)
                    el-table-column(label="实际领料数量" v-slot="{row}")
                        el-input(
                            v-model="row.drawAmount"
                            @change="changeHandler(row.id, 'drawAmount', row.drawAmount)")
                template(#scrapAmount)
                    el-table-column(label="其中报废数量" v-slot="{row}")
                        el-input(
                            v-model="row.scrapAmount"
                            @change="changeHandler(row.id, 'scrapAmount', row.scrapAmount)")
                template(#warehouse)
                    el-table-column(label="领料仓" v-slot="{row}")
                        el-select(
                            v-model="row.warehouse"
                            @change="changeHandler(row.id, 'warehouse', row.warehouse)")
                            el-option(
                                v-for="(item, key) in storeDict['BILL_POSTING_WAREHOUSE_RESULT']"
                                :label="item"
                                :value="key"
                                :key="key")
                template(#needPosting)
                    el-table-column(label="是否过账物料" v-slot="{row}")
                        el-select(
                            v-model="row.needPosting"
                            @change="changeHandler(row.id, 'needPosting', row.needPosting)")
                            el-option(label="否" value="0")
                            el-option(label="是" value="1")
            template(#footer)
                el-button(
                    @click="step-=1"
                    v-if="step>0") 上一步
                el-button(
                    @click="step+=1"
                    v-if="step<1") 下一步
                el-button(
                    type="primary"
                    v-if="step===1"
                    @click="submitForm") 提交
        ebrain-dialog-table(
                :data="tableDataBatch"
                :column="tableColumnBatch"
                :submitLoading='submitLoadingBatch'
                :visible.sync="dialogVisibleBatch"
                highlight-current-row
                @row-click="getMegBatch"
                @submit="submitFormBatch()")
</template>

<script>
import {
    notPostingApply,
    getNotPosting,
} from '@/utils/api';
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';
import moment from 'moment';
import * as _ from 'lodash';
import nanoid from 'nanoid';

export default {
    name: 'NotTransfer',
    props: {
        code: Object
    },
    data() {
        return {
            selection: {},
            notPosting: {},
            tableDataBatch: [],
            submitLoadingBatch: true,
            rowBatch: [],
            dialogVisibleBatch: false,
            dialogVisible: false,
            step: 0,
            materialColumn: [{
                slot: 'materialNo'
            }, {
                slot: 'materialName',
            }, {
                slot: 'prodBatchNo',
            }, {
                slot: 'materialUnit',
            }, {
                slot: 'needAmount',
            }, {
                slot: 'drawAmount',
            }, {
                slot: 'scrapAmount',
            }, {
                slot: 'warehouse',
            }, {
                slot: 'needPosting',
            }],
            tableColumnBatch: [{
                label: '料号',
                prop: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
            }, {
                label: '批次号/SN',
                prop: 'prodBatchNo',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                label: '生产数量',
                prop: 'amount',
            }],
            materialData: [],
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
                operator: '',
            },
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
            ]
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
        selectionLength() {
            return Object.keys(this.selection).length;
        },
        orderId() {
            return this.$route.query.id;
        },
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.step = 0;
                this.form.operator = this.sysUser.nickname;
                this.form.endTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.form.productVersiion = 'SA00';
                this.form.productAmount = this.code.realAmount;
                this.form.productLot = this.code.prodBatchNo;
                this.form.materielNo = this.workcenter.materialNo;
                this.form.materielName = this.workcenter.materialName;
                this.form.materielUnit = this.workcenter.materialUnit;
                this.form.orderAmount = this.workcenter.materialAmount;
                this.form.beginTime = this.workcenter.planBeginTime;
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
                    operator: '',
                };
                this.materialData = [];
                this.tableDataBatch = [];
                this.selection = {};
            }
        },
        step(val) {
            switch (val) {
                case 1:
                    this.queryMaterial();
                    break;
            }
        },
    },
    created() {
        this.queryDict('BILL_POSTING_WAREHOUSE_RESULT');
    },
    methods: {
        ...mapActions('sys', ['queryDict']),
        open() {
            this.dialogVisible = true;
        },
        editReasonAmount(val) {
            this.form.productAmount = val;
        },
        getMegBatch(row) {
            this.rowBatch = row;
        },
        submitFormBatch() {
            this.form.productLot = this.rowBatch.prodBatchNo;
            this.dialogVisibleBatch = false;
        },
        queryMaterial() {
            getNotPosting(
                this.workcenter.id
            ).then(({ data }) => {
                this.materialData = data.map(v => ({
                    id: nanoid(),
                    warehouse: '',
                    ...v
                }));
            });
        },
        materialChange(selection) {
            this.selection = selection;
        },
        submitForm() {
            this.$confirm('确定是否过账?', '提示', {
                type: 'warning'
            }).then(() => {
                const processNo = _.findKey(dict.procedureNo, v => v === this.$route.query.pn);
                const inputList = this.materialData.map(v => ({
                    materielLot: v.prodBatchNo,
                    materielName: v.materialName,
                    materielNo: v.materialNo,
                    materielUnit: v.materialUnit,
                    needAmount: Number(v.needAmount),
                    postingFlag: v.needPosting,
                    realAmount: Number(v.drawAmount),
                    scrapAmount: Number(v.scrapAmount),
                    warehouse: v.warehouse,
                }));
                notPostingApply({
                    beginTime: moment(this.form.beginTime).format('YYYY-MM-DD HH:mm:ss'),
                    endTime: moment(this.form.endTime).format('YYYY-MM-DD HH:mm:ss'),
                    inputList,
                    machineNo: this.form.machinePlatformNo,
                    materialName: this.form.materielName,
                    materialNo: this.form.materielNo,
                    materialUnit: this.form.materielUnit,
                    needAmount: Number(this.form.orderAmount),
                    orderId: this.workcenter.id,
                    processNo,
                    realAmount: Number(this.form.productAmount),
                    materialBatchNo: this.code.prodBatchNo,
                    productVersion: this.form.productVersiion,
                    storageLocation: this.form.storageLocation,
                    factoryNo: 'SY00',
                }).then(({ code }) => {
                    if (code === 0) {
                        this.dialogVisible = false;
                        this.$message.success(`提交成功`);
                    }
                });
            });
        },
        changeHandler(id, key, value) {
            let item = this.materialData.find(v => v.id === id);
            item[key] = value;
        }
    },
};
</script>

<style scoped lang="stylus">

</style>
