<template lang="pug">
    div.box
        ebrain-box(v-if="workcenter.state!=='4'")
            .wrap
                h3.title 工单信息
                div.contain
                    span 工单号: {{workcenter.orderNo}}
                    span 工序: {{pn}}
                    span 工作中心: {{wn}}
                    span 成本中心: {{orderSelect.costCenterName}}
                h3.title 产出明细
                ebrain-table.table(
                    :column="columnOutput"
                    :data="dataOutput"
                    @current-change="showMeTable"
                    highlight-current-row
                    table-row-edit
                    @cell-save="cellSaveOutput")
                h3.title 投入明细
                ebrain-table.table(
                    :column="columnInto"
                    table-row-edit
                    :data="dataInto[prodBatchId] || []"
                    :highlight-current-row="false"
                    @cell-save="cellSaveInto")
                el-button.submit(
                    type="primary"
                    style="width:100px;"
                    :loading="reportLoading"
                    @click="report") 报工
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import dict from '@/utils/dict';
import axios from 'axios';
import * as _ from 'lodash';
import nanoid from 'nanoid';
import { finishOrder } from '@/utils/api';
import { strip }  from '@/utils';
export default {
    name: 'workcenter',
    data() {
        return {
            reportLoading: false,
            columnOutput: [{
                label: '工单号',
                prop: 'orderNo',
            }, {
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'prodBatchNo',
            }, {
                label: '数量',
                prop: 'realAmount',
            }, {
                label: '生产版本',
                prop: 'productEdition',
                option: dict.productEdition,
            }, {
                label: '库存地点',
                prop: 'stockSite',
                option: dict.stockSite,
            }, {
                label: '状态',
                prop: 'state',
                formatter(row, column, cell) {
                    return dict.autopostingState[cell];
                },
                option: dict.autopostingState,
            }],
            columnInto: [{
                label: '序号',
                type: 'index',
                width: 50
            }, {
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
            }, {
                label: '总数量',
                prop: 'materialTotalAmount',
                disabled: true,
            }, {
                label: '投料数量',
                prop: 'materialFeedAmount',
            }, {
                label: '报废数量',
                prop: 'materialScrapAmount',
            }, {
                label: '损耗数量',
                prop: 'materialLossAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }, {
                label: '库存地点',
                prop: 'stockSite',
                option: dict.stockSite,
            }],
            prodBatchId: '',
            dataOutput: [],
            dataInto: {},
            OutputProperty: [
                'orderNo',
                'materialNo',
                'materialName',
                'prodBatchNo',
                'realAmount',
                'state',
                'id',
            ],
            intoProperty: [
                'materialNo',
                'materialName',
                'materialBatchNo',
                'materialTotalAmount',
                'materialFeedAmount',
                'materialScrapAmount',
                'materialLossAmount',
                'materialUnit',
            ],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
            orderSelect: state => state.orderSelect,
        }),
        pn() {
            return this.$route.query.pn;
        },
        wn() {
            return this.$route.query.wn;
        },
    },
    watch: {
        workcenter(val) {
            if (val.id) {
                this.getAllData();
            }
        },
    },
    mounted() {
        if (this.workcenter.id) {
            this.getAllData();
        }
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        getDataOutput() {
            return this.$http.post(`/productionexe/orderprodbatch/list`, null, {
                params: {
                    state: '2',
                    orderId: this.workcenter.id
                }
            }).then(({ data }) => {
                this.dataOutput = data.map(v => {
                    return {
                        ...v,
                        productEdition: 'SA00',
                        stockSite: 'SN04'
                    };
                });
                return data;
            });
        },
        showMeTable(row) {
            if (row) {
                this.prodBatchId = row.id;
            }
        },
        getDataInto(prodBatchId) {
            return this.$http.get(`/productionexe/orderfeed/listAllByProdBatchId/${prodBatchId}`)
                .then(({ data }) => data.map(v => ({
                    ...v,
                    _id_: nanoid(),
                    stockSite: v.stockSite,
                    materialTotalAmount: String(strip(v.materialFeedAmount + v.materialScrapAmount + v.materialLossAmount)),
                    materialFeedAmount: String(v.materialFeedAmount),
                    materialScrapAmount: String(v.materialScrapAmount),
                    materialLossAmount: String(v.materialLossAmount),
                })));
        },
        async getAllData() {
            let data = await this.getDataOutput();
            const fetchList = data.map(v => this.getDataInto(v.id));
            axios.all(fetchList).then(axios.spread((...res) => {
                if (res && res.length) {
                    res.forEach((v, i) => {
                        this.dataInto[data[i].id] = v;
                    });
                }
            }));
        },
        // 修改上表
        cellSaveOutput(row, finish, killLoading) {
            let obj = _.pick(row, this.OutputProperty);
            obj.realAmount = String(obj.realAmount);
            const isEmpty = _.some(obj, _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            let save = this.dataOutput.findIndex(v => v.id === obj.id);
            this.$set(this.dataOutput, save, row);
            finish();
        },
        // 修改下表
        cellSaveInto(row, finish, killLoading) {
            let obj = _.pick(row, this.intoProperty);
            const isEmpty = _.every(obj, _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            let index = this.dataInto[this.prodBatchId].findIndex(v => v._id_ === row._id_);
            this.dataInto[this.prodBatchId][index] = row;
            this.dataInto[this.prodBatchId][index].materialTotalAmount = String(Number(row.materialFeedAmount) + Number(row.materialScrapAmount) + Number(row.materialLossAmount));
            finish();
            const batchId = this.prodBatchId;
            this.prodBatchId = '';
            this.$nextTick(() => {
                this.prodBatchId = batchId;
            });
        },
        report() {
            const data = this.dataOutput.map(v => ({
                costCenterNo: this.orderSelect.costCenterNo,
                details: this.dataInto[v.id].map(v => ({
                    stockSite: v.stockSite,
                    feedAmount: Number(v.materialFeedAmount),
                    lossAmount: Number(v.materialLossAmount),
                    scrapAmount: Number(v.materialScrapAmount),
                    materialAmount: Number(v.materialTotalAmount),
                    materialBatchNo: v.materialBatchNo,
                    materialName: v.materialName,
                    materialNo: v.materialNo,
                    materialUnit: v.materialUnit,
                })),
                materialAmount: Number(v.realAmount),
                materialName: v.materialName,
                materialNo: v.materialNo,
                materialUnit: v.materialUnit,
                orderId: this.workcenter.id,
                orderNo: v.orderNo,
                prodBatchNo: v.prodBatchNo,
                workCenterNo: this.workcenter.workcenterNo,
                stockSite: v.stockSite,
                productEdition: v.productEdition,
            }));
            this.reportLoading = true;
            this.$http.post(`/productionexe/autoposting/reportWorker/${this.workcenter.id}`, data).then(({ code }) => {
                if (code === 0) {
                    finishOrder(this.workcenter.id).then(({ code }) => {
                        if (code === 0) {
                            this.SET_STATE({
                                module: 'workcenter',
                                params: {
                                    orderSelect: {},
                                },
                            });
                            this.reportLoading = false;
                            this.$alert('工单已完工，工单报工信息正发送至SAP系统，具体信息请移步中控查看!', {
                                type: 'success',
                            });
                            this.queryOrderInfo(this.workcenter.id);
                            this.$router.push({
                                path: '/panel/operating/linePosition',
                                query: {
                                    ...this.$route.query,
                                },
                            });
                        }
                    }).catch(() => {
                        this.reportLoading = false;
                    });
                }
            }).catch(() => {
                this.reportLoading = false;
            });
        },
    }
};
</script>

<style scoped lang="stylus">
.box
    position relative

.wrap
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow-y auto
    overflow-x hidden

    & >>> .el-table
        height auto!important

    & >>> .el-table__body-wrapper
        height auto!important

    .contain
        flex auto
        padding 0 16px
        height 60px
        border-bottom 1px solid #dedede
        box-sizing border-box

        & > * + *
            margin-left 48px
            line-height 60px

    .table
        margin-bottom 10px
        height auto

    .title
        margin 5px 10px
        padding 5px 10px

    .submit
        position absolute
        bottom 0
        right 0
        margin 10px
        float right
</style>
