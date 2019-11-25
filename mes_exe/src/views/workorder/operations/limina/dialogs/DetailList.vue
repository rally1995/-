<template lang="pug">
    el-dialog(
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
import dict from '@/utils/dict';

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
                label: '单号',
                prop: 'boardInCode',
            }, {
                label: '单据类型',
                prop: 'boardInType',
                formatter(row, column, cell, index) {
                    return dict.boardinType[cell];
                },
            }, {
                label: '工单号',
                prop: 'orderId',
            }, {
                label: '料号',
                prop: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
            }, {
                label: '工作中心编号',
                prop: 'workcenterCode',
            }, {
                label: '工位编号',
                prop: 'stationCode',
            }, {
                label: '托盘RFID',
                prop: 'rfid',
            }, {
                label: '状态',
                prop: 'boardInStats',
                formatter(row, column, cell, index) {
                    return dict.boardInStats[cell];
                },
            }, {
                label: '申请时间',
                prop: 'boardInApplyTime',
            }, {
                label: '完成时间',
                prop: 'boardInCompleteTime',
            }],
            columnOutboard: [{
                label: '单号',
                prop: 'boardOutCode',
            }, {
                label: '单据类型',
                prop: 'boardOutType',
                formatter(row, column, cell, index) {
                    return dict.boardinType[cell];
                },
            }, {
                label: '工单号',
                prop: 'orderId',
            }, {
                label: '料号',
                prop: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
            }, {
                label: '工作中心编号',
                prop: 'workcenterCode',
            }, {
                label: '工位编号',
                prop: 'stationCode',
            }, {
                label: '托盘RFID',
                prop: 'rfid',
            }, {
                label: '状态',
                prop: 'boardOutStats',
                formatter(row, column, cell, index) {
                    return dict.boardInStats[cell];
                },
            }, {
                label: '申请时间',
                prop: 'boardOutApplyTime',
            }, {
                label: '完成时间',
                prop: 'boardOutCompleteTime',
            }],
            columnInmaterial: [{
                label: '工单号',
                prop: 'orderId',
            }, {
                label: '料号',
                prop: 'subMaterielCode',
            }, {
                label: '物料名称',
                prop: 'subMaterielName',
            }, {
                label: '批次号',
                prop: 'lot',
            }, {
                label: 'SN',
                prop: 'sn',
            }, {
                label: '投料数量',
                prop: 'amount',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                label: '投料开始时间',
                prop: 'feedTimeBegin',
            }, {
                label: '投料结束时间',
                prop: 'feedTimeEnd',
            }],
            columnUsematerial: [{
                label: '工单号',
                prop: 'orderId',
            }, {
                label: '料号',
                prop: 'subMaterielCode',
            }, {
                label: '物料名称',
                prop: 'subMaterielName',
            }, {
                label: '批次号',
                prop: 'lot',
            }, {
                label: 'SN',
                prop: 'sn',
            }, {
                label: '耗料类型',
                prop: 'usage',
                formatter(row, column, cell, index) {
                    return dict.usageType[cell];
                },
            }, {
                label: '耗料数量',
                prop: 'amount',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                label: '记录时间',
                prop: 'updateTime',
            }],
            columnOutput: [{
                label: '工单号',
                prop: 'orderId',
            }, {
                label: '料号',
                prop: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次号',
                prop: 'mlot',
            }, {
                label: 'SN',
                prop: 'sn',
            }, {
                label: '数量',
                prop: 'amount',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                label: '记录时间',
                prop: 'updateTime',
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
        queryList() {
            let type = this.type;
            type = type.replace(/^\S/, w => w.toUpperCase());
            const api = `list${type}`;
            this[api]().then(({ data, code }) => {
                if (code === 0) {
                    this.tableData = data.records;
                }
            });
        },
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
