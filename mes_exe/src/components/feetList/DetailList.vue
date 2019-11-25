<template lang="pug">
    el-dialog.detailList(
        v-if="isShow"
        :visible.sync="dialogVisible"
        :title="title+'明细列表'"
        :close-on-click-modal="false")
        ebrain-table(
            :key="type"
            :column="column"
            :data="tableData"
            :highlight-current-row="false")
            template(#operate)
                el-table-column(
                    v-if="type==='inventory'?true:false"
                    label="操作"
                    width="180"
                    align="center")
                    template(v-slot="{row}")
                        el-button(
                            v-if="type==='inventory'&&sign?true:false"
                            type="primary"
                            @click="start(row.workcenterCode)") 查看工位库存明细
    el-dialog(
        v-else
        :visible.sync="dialogVisible"
        title="工位库存列表"
        :close-on-click-modal="false")
        ebrain-table(
            key="inventorylistcolumn"
            :column="inventorylistcolumn"
            :data="inventoryListData"
            :highlight-current-row="false")
        template(#footer)
            el-button(
                type="primary"
                @click="lastStep()") 上一步
            el-button(
                type="primary"
                @click="goback") 返回主页
</template>

<script>
import {
    listInboard,
    listOutboard,
    listInmaterial,
    listUsematerial,
    listOutput,
    listInventory,
    getStationInventory,
} from '@/utils/api';
// import dict from '@/utils/dict';
import { mapState } from 'vuex';

export default {
    name: 'DetailList',
    props: {
        type: String,
    },
    data() {
        return {
            sign: true,
            isShow: true,
            dialogVisible: false,
            listInboard,
            listOutboard,
            listInmaterial,
            listUsematerial,
            listOutput,
            listInventory,
            tableData: [],
            inventoryListData: [],
            inventorylistcolumn: [{
                label: '工作中心编码',
                prop: 'workcenterCode',
            }, {
                label: '工位',
                prop: 'stationCode',
            }, {
                label: '料号',
                prop: 'subMaterielCode',
            }, {
                label: '物料名称',
                prop: 'subMaterielName',
            }, {
                label: '批次号',
                prop: 'sn',
            }, {
                label: '批次数量',
                prop: 'amount',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                label: '托盘RFID',
                prop: 'rfid',
            }],
            columnInboard: [{
                label: '物料料号',
                prop: 'materialNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'realAmount',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'materialUnit',
                showOverflowTooltip: true,
            }, {
                label: '时间',
                prop: 'applyTime',
                showOverflowTooltip: true,
            }, {
                label: '操作员',
                prop: 'operator',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            columnOutboard: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '目标工位编号',
                prop: 'targetStationNo',
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
                prop: 'operator'
            }, {
                label: '备注',
                prop: 'remark',
            }],
            columnInmaterial: [{
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
            columnUsematerial: [{
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
            columnOutput: [{
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
                prop: 'createBy',
            }, {
                label: '开始时间',
                prop: 'beginTime',
            }, {
                label: '结束时间',
                prop: 'endTime',
            }],
            columnInventory: [{
                label: '工作中心编号',
                prop: 'workcenterCode',
            }, {
                label: '料号',
                prop: 'subMaterielCode',
            }, {
                label: '物料名称',
                prop: 'subMaterielName',
            }, {
                label: '数量',
                prop: 'amount',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                slot: 'operate',
            }],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderId() {
            return this.$route.query.id;
        },
        workCenter() {
            return this.$route.query.wc;
        },
        title() {
            return {
                inboard: '进板',
                outboard: '出板',
                inmaterial: '投料',
                usematerial: '耗料',
                output: '产出',
                inventory: '当前工作中心库存',
            }[this.type];
        },
        column() {
            let type = this.type;
            type = type.replace(/^\S/, w => w.toUpperCase());
            return this[`column${type}`];
        },
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.queryList();
            } else {
                this.isShow = true;
                this.sign = true;
            }
        }
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        // 获取进出板列表
        getInOrOutList(boardType, fromType, materialType) {
            const params = {
                boardType,
                workcenterNo: this.workcenter.workcenterNo,
                // fromType,
                materialType,
            };
            // if (boardType === '1') {}
            this.$http.get(`/productionexe/boardio/list`, {
                params
            }).then(({ data }) => {
                this.tableData = data;
            });
        },
        // 获取投料列表
        getInmaterialList() {
            this.$http.post(`/productionexe/orderfeed/list`, null, {
                params: {
                    workcenterNo: this.workcenter.workcenterNo,
                }
            }).then(({ data }) => {
                this.tableData = data;
            });
        },
        // 获取耗料列表
        getUsematerialList() {
            this.$http.get(`/productionexe/orderwaste/list/${this.workcenter.id}/2`).then(({ data }) => {
                this.tableData = data;
            });
        },
        // 获取产出列表（先默认生产批次）
        getOutputList() {
            this.$http.post(`/productionexe/orderprodbatch/list`, null, {
                params: {
                    state: '2',
                    workcenterNo: this.workcenter.workcenterNo,
                }
            }).then(({ data }) => {
                this.tableData = data;
            });
        },
        queryList() {
            let type = this.type;
            switch (type) {
                case 'inboard':
                    this.getInOrOutList(1, 1, 1);
                    break;
                case 'outboard':
                    this.getInOrOutList(2);
                    break;
                case 'inmaterial':
                    this.getInmaterialList();
                    break;
                case 'usematerial':
                    this.getUsematerialList();
                    break;
                case 'output':
                    this.getOutputList();
                    break;
                default:
                    break;
            }
            // type = type.replace(/^\S/, w => w.toUpperCase());
            // const api = `list${type}`;
            // this[api]().then(({ data, code }) => {
            //     if (code === 0) {
            //         this.tableData = data.records;
            //     }
            // });
        },
        // 当前工作中心库存列表页按钮
        start(workcenterCode) {
            this.sign = false;
            this.isShow = false;
            getStationInventory(workcenterCode).then(({ data, code }) => {
                if (code === 0) {
                    this.inventoryListData = data.records;
                }
            });
        },
        lastStep() {
            this.isShow = true;
            this.sign = true;
        },
        goback() {
            this.dialogVisible = false;
        }
    },
};
</script>

<style scoped lang="stylus">
// .detailList
//     .el-table__body-wrapper

</style>
