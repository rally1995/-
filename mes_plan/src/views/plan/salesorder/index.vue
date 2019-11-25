<template lang="pug">
    ebrain-main.salesorder
        ebrain-frame(
            title="SAP销售计划列表")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchParent"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    row-key="docno"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="销售订单明细")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :isShow='false'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    highlight-current-row
                    @row-dblclick="editView"
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            ebrain-frame(
                title="成品库存锁定")
                template(#tools)
                    ebrain-tools(:buttons="btnsDialog")
            el-form.dialogForm-form(
                ref="inventory"
                label-width="110px"
                :model="inventory"
                :rules="inventoryRules")
                el-row
                    el-col(:span="12")
                        el-form-item(label="可用库存数量" prop="availableStockQuantity")
                            el-input.block(v-model="inventory.availableStockQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="库存锁定数量" prop="inventoryLockedQuantity")
                            el-input.block(
                                v-model="inventory.inventoryLockedQuantity"
                                :disabled="disabledQuantity"
                                @change="inventoryLockedQuantityChangeHandler")
                    el-col(:span="12")
                        el-form-item(label="库存锁定时间" prop="inventoryLockTime")
                            el-date-picker.block(v-model="inventory.inventoryLockTime" type="datetime" disabled)
</template>
<script>
import dict from '@/utils/dict';
// import * as _ from 'lodash';
import moment from 'moment';

export default {
    name: 'index',
    data() {
        return {
            inventoryRules: {
                inventoryLockedQuantity: [{
                    validator: (rule, value, callback) => {
                        if (!value) callback();
                        const ltStock = this.inventory.inventoryLockedQuantity <= this.inventory.availableStockQuantity;
                        const ltQuality = this.inventory.inventoryLockedQuantity <= this.dialogForm[10].value;
                        const ltZero = this.inventory.inventoryLockedQuantity >= 0;
                        if (ltStock && ltQuality && ltZero) {
                            callback();
                        } else {
                            return callback(new Error('库存锁定数量必须大于零并且小于等于可用库存数量和可排产数量!'));
                        }
                    },
                    trigger: 'blur',
                }],
            },
            unlockDisabled: false,
            inventoryDisabled: false,
            inventory: {
                availableStockQuantity: '',
                inventoryLockedQuantity: '',
                inventoryLockTime: '',
            },
            disabledQuantity: false,
            dialogVisible: false,
            submitLoading: false,
            tableLoadingTop: false,
            tableLoadingDown: false,
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            tableColumnParent: [{
                label: 'SAP销售计划编号',
                prop: 'docno',
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'kunnr',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                showOverflowTooltip: true,
            }
                // label: '订单状态',
                // prop: 'status',
                // formatter(row, column, cell) {
                //     return dict.orderStatus[cell];
                // },
                // showOverflowTooltip: true,
                // option: dict.orderStatus,
            ],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                width: 50
            }, {
                label: 'SAP销售计划编号',
                prop: 'docno',
                showOverflowTooltip: true,
            }, {
                label: '项目号',
                prop: 'posnr',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'maktx',
                showOverflowTooltip: true,
            }, {
                label: '计划订单数量',
                prop: 'menge',
                showOverflowTooltip: true,
            }, {
                label: '库存锁定数量',
                prop: 'inventoryLockedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'plannedProductionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '预交货日',
                prop: 'dlvdt',
                showOverflowTooltip: true,
            }, {
                label: '销售备注',
                prop: 'smemo',
                showOverflowTooltip: true,
            }, {
                label: '计划备注',
                prop: 'pmemo',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                formatter(row, column, cell) {
                    return dict.plan_documentStatus[cell];
                },
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: 'SAP销售编号',
                prop: 'docno',
                value: '',
                disabled: true
            }, {
                label: '项目号',
                prop: 'posnr',
                value: '',
                disabled: true
            }, {
                label: '客户编号',
                prop: 'kunnr',
                value: '',
                disabled: true
            }, {
                label: '客户名称',
                prop: 'name1',
                value: '',
                disabled: true
            }, {
                label: '物料编号',
                prop: 'matnr',
                value: '',
                disabled: true
            }, {
                label: '物料名称',
                prop: 'maktx',
                value: '',
                disabled: true
            }, {
                label: '计划订单数量',
                prop: 'menge',
                value: '',
                disabled: true
            }, {
                label: '预交货日',
                prop: 'dlvdt',
                value: '',
                disabled: true
            }, {
                label: '已排产数量',
                prop: 'scheduledProductionNumber',
                value: '',
                disabled: true
            }, {
                label: '计划生产数量',
                prop: 'plannedProductionQuantity',
                value: '',
                disabled: true
            }, {
                label: '可排产数量',
                prop: 'arrangeableQuantity',
                value: '',
                disabled: true
            }, {
                label: '已生产数量',
                prop: 'productionQuantity',
                value: '',
                disabled: true
            }, {
                label: '单据状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.plan_documentStatus,
                disabled: true
            }, {
                label: '同步时间',
                prop: 'updateTime',
                value: '',
                disabled: true
            }, {
                label: '销售备注',
                prop: 'smemo',
                value: '',
                type: 'textarea'
            }, {
                label: '计划备注',
                prop: 'pmemo',
                value: '',
                type: 'textarea'
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: 'SAP销售计划编号',
                prop: 'docno',
                value: '',
            }, {
                label: '客户编号',
                prop: 'kunnr',
                value: '',
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsBottom: [{
                label: '编辑/查看',
                click: () => this.editView(),
                className: 'iconfont iconstatus-edit',
                disabled: () => !this.currentRowKeySon,
                permi: 'productionplan_bizppsalesplaninfo_edit',
            }],
            btnsDialog: [{
                label: '锁定库存',
                click: () => this.inventoryLock(),
                className: 'iconfont iconpassword',
                disabled: () => this.inventoryDisabled,
                permi: 'productionplan_bizppsalesplaninfo_lockingStock',
            }, {
                label: '解锁库存',
                click: () => this.unlockInventory(),
                className: 'iconfont iconpassword',
                disabled: () => this.unlockDisabled,
                permi: 'productionplan_bizppsalesplaninfo_unlockInventory',
            }],
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
    },
    created() {
        this.getDataParent();
    },
    methods: {
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/productionplan/salesplaninfo/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                }
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.docno === this.currentRowKeyParent);
            return this.$http.get(`/productionplan/salesplaninfo/page/${item.docno}`).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data ? res.data : [];
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        changeSize(val) {
            this.currentPage = 1;
            this.pageSize = val;
            this.getDataParent();
        },
        tableSearch(val) {
            this.searchForm = val;
            this.getDataParent();
        },
        tableReset() {
            this.searchForm = {};
            this.getDataParent();
        },
        // 编辑查看
        editView() {
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.inventory.availableStockQuantity = Number(item.availableStockQuantity);
            this.inventory.inventoryLockedQuantity = Number(item.inventoryLockedQuantity);
            this.inventory.inventoryLockTime = item.inventoryLockTime;
            if (this.inventory.inventoryLockedQuantity) {
                this.disabledQuantity = true;
                this.inventoryDisabled = true;
                this.unlockDisabled = false;
            } else {
                this.disabledQuantity = false;
                this.unlockDisabled = true;
                this.inventoryDisabled = false;
            }
            this.dialogVisible = true;
        },
        // 锁定库存
        inventoryLock() {
            const quantity = Number(this.inventory.inventoryLockedQuantity);
            const id = this.currentRowKeySon;
            const api = () => this.$http.post(`/productionplan/salesplaninfo/lockingStock`, null, {
                params: {
                    id: this.currentRowKeySon,
                    inventoryLockedQuantity: quantity
                }
            }).then(() => {
                this.getDataSon().then(() => {
                    this.unlockDisabled = false;
                    this.currentRowKeySon = id;
                    const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                    this.inventory.availableStockQuantity = Number(item.availableStockQuantity);
                    this.inventory.inventoryLockTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    this.dialogForm.forEach(v => {
                        v.value = item[v.prop];
                    });
                    if (this.inventory.inventoryLockedQuantity) {
                        this.disabledQuantity = true;
                    } else {
                        this.disabledQuantity = false;
                    }
                });
            }).catch(() => {
                this.inventoryDisabled = false;
            });
            this.$refs.inventory.validate(v => {
                if (v && quantity) {
                    this.inventoryDisabled = true;
                    api();
                } else {
                    return false;
                }
            });
        },
        // 解锁库存
        unlockInventory() {
            this.unlockDisabled = true;
            const id = this.currentRowKeySon;
            this.$http.post(`/productionplan/salesplaninfo/unlockInventory`, null, {
                params: {
                    id: this.currentRowKeySon
                }
            }).then(() => {
                this.getDataSon().then(() => {
                    this.inventoryDisabled = false;
                    this.currentRowKeySon = id;
                    const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                    this.dialogForm.forEach(v => {
                        v.value = item[v.prop];
                    });
                    this.inventory.inventoryLockedQuantity = Number(item.inventoryLockedQuantity);
                    this.inventory.availableStockQuantity = Number(item.availableStockQuantity);
                    if (this.inventory.inventoryLockedQuantity) this.disabledQuantity = true;
                    else this.disabledQuantity = false;
                });
            }).catch(() => {
                this.unlockDisabled = false;
            });
        },
        // 明细确认
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.currentRowKeySon;
            this.submitLoading = true;
            this.$http.put(`/productionplan/salesplaninfo`, obj).then(() => {
                this.submitLoading = false;
                this.getDataSon();
                this.$message({
                    message: '修改成功!',
                    type: 'success'
                });
                this.dialogVisible = false;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        inventoryLockedQuantityChangeHandler(value) {
            this.inventory.inventoryLockedQuantity = Number(value) || 0;
        }
    }
};
</script>

<style scoped lang="stylus">

.salesorder
    & >>> .el-dialog
        margin-top 8vh!important

    & >>> .fr
        float left

    & >>> .tools
        height 34px

.dialogForm-form
    margin-top 20px

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0

.el-form-item
    display block

    &__content
        width calc(100% - 110px)

    & >>> .el-row
        margin-bottom -18px

    & >>> .el-date-editor
        width 100%
.block
    display block
</style>
