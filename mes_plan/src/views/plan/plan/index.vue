<template lang="pug">
    ebrain-main.plan
        ebrain-frame(
            title="生产计划列表")
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
                    :tableLoading="tableLoadingTop"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    @selection-change="selectionChange"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
                    template(#operate)
                        el-table-column(
                            label="BOM信息"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    width="50"
                                    :disabled="row.bomType==='1'||row.bomType==='2'||row.bomType==='3'?false:true"
                                    type="primary"
                                    @click="lookBom(row)") 查看
        ebrain-main.planDown
            template(#leftColumn)
                div.process(v-if="activeName === 'second'")
                    label.process-item.total(v-if="currentRowKeyParent")
                        .process-tiao(:style="{width:processList.totalComplete+'%'}")
                        .process-percentage(v-if="dataSon.status === '2'") {{processList.totalComplete}}%
                        .process-name(v-if="dataSon.status === '2'") 完成度:
                    label.process-item(v-if="currentRowKeyParent" v-for="item in processList.data")
                        .process-tiao(:style="{width:item.processNum+'%'}")
                        .process-percentage {{item.processNum}}%
                        .process-name {{ item.processName }}
                        input(type="radio" name="process" :value="item.processCode" v-model="mao")
                        .process-radio
            ebrain-frame.tabs
                template(#tabs)
                    el-tabs(v-model="activeName" type="card")
                        el-tab-pane(label="物料明细" name="first")
                        el-tab-pane(label="订单进度" name="second")
                template(#tools)
                    ebrain-tools(
                        v-if="activeName === 'first'"
                        :add="newRowSon"
                        :edit="editRowSon"
                        :del="delRowSon"
                        :addDisabled="editDisabledParent"
                        :editDisabled="editDisabledSon"
                        :delDisabled="editDisabledSon")
                        button(
                            @click="look"
                            :disabled="editDisabledSon_1"
                            :class="{disabled: editDisabledSon_1}")
                            i.iconfont.iconstatus-copy
                            |查看
                    ebrain-tools(:buttons="btnsRight" v-if="activeName === 'second'")
                template(#table)
                    ebrain-table(
                        v-if="activeName === 'first'"
                        :tableLoading="tableLoadingDownLeft"
                        :isShow="false"
                        :data="tableDataSon"
                        :column="tableColumnSon"
                        row-key="id"
                        key="first"
                        highlight-current-row
                        @row-dblclick="editRowSon"
                        :current-row-key.sync="currentRowKeySon")
                    ebrain-table(
                        ref="tableDownRight"
                        v-if="activeName === 'second'"
                        :tableLoading="tableLoadingDownRight"
                        :isShow="false"
                        :data="tableDataRight"
                        :column="tableColumnRight"
                        row-key="id"
                        key="second"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySonRight")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
        ebrain-dialog(
            top="5vh"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleSon"
            :form.sync="judge?dialogFormSon_MTO:dialogFormSon_MTS"
            @submit="submitFormSon"
            :isShow="isClick")
            template(#SAP)
                el-col(:span="12")
                    el-form-item(label="SAP销售编号" prop="docno" required)
                        el-input(readonly=true v-model="judge?dialogFormSon_MTO[3].value:dialogFormSon_MTS[3].value")
                            el-button(slot="append" icon="el-icon-search" @click="dialogSearchForm={};enterSalesPlanDetails()")
            template(#material)
                el-col(:span="12")
                    el-form-item(label="物料编号" prop="materialCode" required)
                        el-input(readonly=true required v-model="judge?dialogFormSon_MTO[3].value:dialogFormSon_MTS[3].value")
                            el-button(slot="append" icon="el-icon-search" @click="openTableDialog()")
            template(#processRoute)
                el-col(:span="24")
                    el-form-item(label="工艺路线" prop="processRoute ")
                        ebrain-table.processRoute(
                            ref="table"
                            :isShow="false"
                            :loading='tableLoadingProcessRoute'
                            :data="tableDataProcessRoute"
                            :column="tableColumnProcessRoute"
                            row-key="id"
                            @selection-change="selectionChangeProcessRoute"
                            highlight-current-row)
                            template(#operate)
                                el-table-column(
                                    label="物料信息"
                                    align="center")
                                    template(v-slot="{row}")
                                        el-button(
                                            width="50"
                                            type="primary"
                                            @click="lookProcessRouteSon(row)") 查看
        ebrain-dialog-table.dialog-table(
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyTable"
            :height='550'
            :data="salesPlanDetails"
            :column="judge?salesPlanDetailsColumn:materialDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleSalesPlan"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormSalesPlan"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            dialogTableSearch)
        ebrain-dialog-table(
            :tableLoading="dialogTableLoading"
            :isShow="false"
            :height="550"
            :data="dialogTableData"
            :column="tableColumn"
            :visible.sync="dialogVisibleBOM"
            :isHide="false")
        el-dialog(
            :visible.sync="dialogVisibleSub"
            title="提交确认生产")
            el-radio(v-model="radio" label="1") 基于库存
            el-radio(v-model="radio" label="2") 完全自制
            //- el-radio(v-model="radio" label="3") 部分自制
            template(#footer)
                el-button(@click="cancel") 取消
                el-button(type="primary" :loading='submitLoading' @click="submitProductiuonPlan") 确定
        ebrain-dialog(
            :submitLoading='submitLoadingLook'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm"
            :disabled="false")
            ebrain-frame(
                title="物料生产信息")
            el-form.clearfix(label-width="110px")
                el-row
                    el-col(:span="12")
                        el-form-item(label="物料编号" prop="materialCode")
                            el-input.block(v-model="materialCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称" prop="materialName")
                            el-input.block(v-model="materialName" disabled)
            el-form.clearfix(label-width="60px")
                .multi
                    el-form-item(label="长" prop="leng" label-width="110px")
                        el-input(v-model="leng" disabled)
                    el-form-item(label="宽" prop="width")
                        el-input(v-model="width" disabled)
                    el-form-item(label="高" prop="height")
                        el-input(v-model="height" disabled)
                    el-form-item(label="对角线" prop="diagonal")
                        el-input(v-model="diagonal" disabled)
                    el-form-item(label="厚度" prop="thickNess")
                        el-input.block(v-model="thickNess" disabled)
            el-form.clearfix(label-width="110px")
                el-row
                    el-col(:span="12")
                        el-form-item(label="产品工艺编号" prop="proProcessCode")
                            el-input.block(v-model="proProcessCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="需生产数量" prop="needAmount")
                            el-input.block(v-model="needAmount" disabled)
                    el-col(:span="12")
                        el-form-item(label="生产中数量" prop="productionInQuantity")
                            el-input.block(v-model="productionInQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="已生产数量" prop="productionQuantity")
                            el-input.block(v-model="productionQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="待分配数量" prop="distributableQuantity")
                            el-input.block(v-model="distributableQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="已分配数量" prop="assignedQuantity")
                            el-input.block(v-model="assignedQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="当前进度（%）" prop="progress")
                            el-input.block(v-model="progress" disabled)
</template>

<script>
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'workshop',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            dataSon: {},
            processList: {},
            currentRowKeySonRight: '',
            tableColumnRight: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '生产订单编号',
                prop: 'prodOrderCode',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编号',
                prop: 'proProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'needAmount',
                showOverflowTooltip: true,
            }, {
                label: '已分配数量',
                prop: 'assignedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '可分配数量',
                prop: 'distributableQuantity',
                showOverflowTooltip: true,
            }, {
                label: '生产中数量',
                prop: 'productionInQuantity',
                showOverflowTooltip: true,
            }, {
                label: '已生产数量',
                prop: 'productionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '当前进度(％)',
                prop: 'progress',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.documentStatus[cell];
                }
            }],
            tableData: [],
            materialCode: '',
            materialName: '',
            leng: '',
            height: '',
            width: '',
            diagonal: '',
            thickNess: '',
            proProcessCode: '',
            needAmount: '',
            productionInQuantity: '',
            productionQuantity: '',
            distributableQuantity: '',
            assignedQuantity: '',
            progress: '',
            dialogForm: [{
                label: '生产订单编号',
                prop: 'prodOrderCode',
                value: '',
                disabled: true,
            }, {
                label: '生产计划编号',
                prop: 'sourceCode',
                value: '',
                disabled: true,
            }, {
                label: '计划类型',
                prop: 'sourceType',
                value: '',
                disabled: true,
                type: 'select',
                option: dict.sourceType
            }, {
                label: '生产计划明细号',
                prop: 'sourceDeCode',
                value: '',
                disabled: true,
            }, {
                label: 'SAP销售编号',
                prop: 'docno',
                value: '',
                disabled: true,
            }, {
                label: '项目号',
                prop: 'projectCode',
                value: '',
                disabled: true,
            }, {
                label: '客户编号',
                prop: 'kunnr',
                value: '',
                disabled: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                value: '',
                disabled: true,
            }, {
                label: '预计开始时间',
                prop: 'planStartTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        let startTime = value;
                        let endTime = this.dialogForm[8].value;
                        startTime = new Date(startTime).getTime();
                        endTime = new Date(endTime).getTime();
                        if (endTime < startTime) {
                            callback(new Error('计划结束时间应大于开始时间!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                disabled: true,
            }, {
                label: '预计结束时间',
                prop: 'planEndTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        let startTime = this.dialogForm[7].value;
                        let endTime = value;
                        startTime = new Date(startTime).getTime();
                        endTime = new Date(endTime).getTime();
                        if (endTime < startTime) {
                            callback(new Error('计划结束时间应大于开始时间!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                disabled: true,
            }, {
                label: '实际开始时间',
                prop: 'actualStartTime',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                label: '实际结束时间',
                prop: 'actualEndTime',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                label: '状态',
                prop: 'documentStatus',
                value: '',
                type: 'select',
                option: dict.documentStatus,
                disabled: true,
            }, {
                label: '预交货日',
                prop: 'dlvdt',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
                disabled: true,
            }],
            submitLoadingLook: false,
            dialogVisible: false,
            activeName: 'first',
            processRouteSelection: [],
            tableDataProcessRoute: [],
            tableLoadingProcessRoute: false,
            tableColumnProcessRoute: [{
                type: 'selection',
                width: '50'
            }, {
                label: '工艺路线编码',
                prop: 'routeCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线名称',
                prop: 'routeName',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                slot: 'operate',
            }],
            code_SAP: '',
            dialogTableLoading: false,
            isClick: true,
            routeCode: '',
            searchVisible: true,
            startTime: '',
            endTime: '',
            dueTime_1: '',
            selections: [],
            ids: [],
            radio: '1',
            dialogVisibleSub: false,
            dialogTableData: [],
            dialogVisibleBOM: false,
            dialogVisibleSalesPlan: false,
            salesPlanDetails: [],
            judge: true,
            tableLoadingTop: false,
            tableLoadingDownLeft: false,
            tableLoadingDownRight: false,
            submitLoading: false,
            techniqueInfo: [],              // 存储工艺信息
            mterialsInfo: [],               // 存储物料信息
            tableDataParent: [],            // 存储上表信息
            tableDataSon: [],               // 存储下表信息
            List: [],                       // 修改页信息
            searchForm: [{
                label: '生产计划编号',
                prop: 'productionPlanCode',
                value: '',
            }],
            tableColumn: [],
            tableColumnProcessRouteSon: [{
                label: '子件料号',
                prop: 'masterCode',
                showOverflowTooltip: true,
            }, {
                label: '名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '组成用量',
                prop: 'composition',
                showOverflowTooltip: true,
            }, {
                label: '损耗率(%)',
                prop: 'lossRate',
                showOverflowTooltip: true,
            }, {
                label: '固定损耗',
                prop: 'fixedLoss',
                showOverflowTooltip: true,
            }],
            tableColumnBom: [{
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                label: '预计用量',
                prop: 'predictAmount',
                showOverflowTooltip: true,
            }, {
                label: '库存锁定量',
                prop: 'lockingStock',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'plannedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '当前库存数量',
                prop: 'currentStock',
                showOverflowTooltip: true,
            }],
            materialDetailsColumn: [{
                label: '序号',
                type: 'index',
                align: 'center',
            }, {
                label: '物料编号',
                prop: 'materialCode',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '当前库存数量',
                prop: 'availableStock',
                showOverflowTooltip: true,
            }],
            salesPlanDetailsColumn: [{
                label: '序号',
                type: 'index',
                align: 'center',
            }, {
                label: 'SAP销售计划编号',
                prop: 'docno',
                // searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '项目号',
                prop: 'posnr',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'matnr',
                showOverflowTooltip: true,
                searchBy: true,
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
                prop: 'arrangeableQuantity',
                showOverflowTooltip: true,
            }, {
                label: '预交货日',
                prop: 'dlvdt',
                showOverflowTooltip: true,
            }, {
                slot: 'processRoute'
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
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.plan_documentStatus[cell];
                },
            }],
            tableColumnParent: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '序号',
                type: 'index',
                align: 'center',
            }, {
                label: '生产计划编码',
                prop: 'productionPlanCode',
                showOverflowTooltip: true,
            }, {
                label: '计划类型',
                prop: 'sourceType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.sourceType[cell];
                },
            }, {
                label: '生产方式',
                prop: 'bomType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.bomType[cell];
                },
            }, {
                slot: 'operate',
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.plan_status[cell];
                },
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{           // 下表头
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '生产计划编码',
                prop: 'productionPlanCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线编码',
                prop: 'routeCode',
                showOverflowTooltip: true,
            }, {
                label: '明细号',
                prop: 'productionPlanDetailCode',
                showOverflowTooltip: true,
            // }, {
            //     label: 'SAP销售计划编号',
            //     prop: 'docno',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '销售计划项目号',
            //     prop: 'posnr',
            //     showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '计划生产数量',
                prop: 'plannedProductionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '预计开始时间',
                prop: 'startTime',
                showOverflowTooltip: true,
            }, {
                label: '预计结束时间',
                prop: 'endTime',
                showOverflowTooltip: true,
            }, {
                label: '预交货日',
                prop: 'dueTime',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'productionStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.productionStatus[cell];
                },
            }],
            dialogFormParent: [{
                label: '计划类型',
                prop: 'sourceType',
                value: '',
                type: 'select',
                option: dict.sourceType,
                disabled: true,
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.plan_status,
                disabled: true,
            }],
            dialogFormSon_MTO: [{
                label: '生产计划编号',
                prop: 'productionPlanCode',
                value: '',
                disabled: true,
            }, {
                label: '明细号',
                prop: 'productionPlanDetailCode',
                value: '',
                disabled: true,
            }, {
                label: '计划类型',
                prop: 'sourceType',
                value: '',
                type: 'select',
                option: dict.sourceType,
                disabled: true,
            }, {
                required: true,
                slot: 'SAP',
                prop: 'docno',
                value: '',
            }, {
                label: '项目号',
                prop: 'posnr',
                value: '',
                disabled: true,
            }, {
                label: '客户编号',
                prop: 'kunnr',
                value: '',
                disabled: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                value: '',
                disabled: true,
            }, {
                label: '物料编号',
                prop: 'materialCode',
                value: '',
                disabled: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '预交货日',
                prop: 'dueTime',
                value: '',
                required: true,
                disabled: true,
                type: 'datetime',
                pickerOption: {
                    disabledDate: time => {
                        if (this.dialogFormSon_MTO[3].value) {
                            const oldTimeDate = new Date(this.dlvdt).getTime();
                            const selectTimeDate = time.getTime();
                            return selectTimeDate > oldTimeDate;
                        }
                    }
                },
                change: val => {
                    if (val) {
                        this.dueTime_1 = val;
                        this.dialogFormSon_MTO[11].value = [];
                        this.dialogFormSon_MTO[11].disabled = false;
                        this.dialogFormSon_MTO[11].required = true;
                    } else {
                        this.dialogFormSon_MTO[11].disabled = true;
                        this.dialogFormSon_MTO[11].required = false;
                        this.dialogFormSon_MTO[11].value = [];
                    }
                },
            }, {
                slot: 'processRoute'
            }, {
                label: '预计时间',
                prop: 'time_MTO',
                value: '',
                type: 'datetimerange',
                required: true,
                disabled: true,
                pickerOption: {
                    disabledDate: time => {
                        const oldTimeDate = new Date(this.dueTime_1).getTime();
                        const selectTimeDate = time.getTime();
                        return selectTimeDate > oldTimeDate;
                    }
                },
            }, {
                label: '可排产数量',
                prop: 'plannedQuantity',
                value: '',
                disabled: true,
            }, {
                label: '状态',
                prop: 'productionStatus',
                disabled: true,
                value: '',
                type: 'select',
                option: dict.productionStatus,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (this.dialogFormSon_MTO[3].value) {
                            if (value > 0 && value <= this.dialogFormSon_MTO[12].value) {
                                callback();
                            } else {
                                callback(new Error(`请输入大于0且小于等于${this.dialogFormSon_MTO[12].value}得数`));
                            }
                        }
                    },
                    trigger: 'blur',
                },
                label: '计划生产数量',
                prop: 'plannedProductionQuantity',
                value: '',
                required: true,
            }, {
                label: '备注',
                prop: 'planRemark',
                value: '',
                type: 'textarea'
            }],
            dialogFormSon_MTS: [{
                label: '生产计划编号',
                prop: 'productionPlanCode',
                value: '',
                disabled: true,
            }, {
                label: '明细号',
                prop: 'productionPlanDetailCode',
                value: '',
                disabled: true,
            }, {
                label: '计划类型',
                prop: 'sourceType',
                value: '',
                type: 'select',
                option: dict.sourceType,
                disabled: true,
            }, {
                label: '物料编号',
                slot: 'material',
                prop: 'materialCode',
                value: '',
                required: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '预交货日',
                prop: 'dueTime',
                value: '',
                required: true,
                type: 'datetime',
                change: val => {
                    if (val) {
                        this.dueTime_1 = val;
                        this.dialogFormSon_MTS[7].value = [];
                        this.dialogFormSon_MTS[7].disabled = false;
                        this.dialogFormSon_MTS[7].required = true;
                    } else {
                        this.dialogFormSon_MTS[7].disabled = true;
                        this.dialogFormSon_MTS[7].required = false;
                        this.dialogFormSon_MTS[7].value = [];
                    }
                },
            }, {
                slot: 'processRoute'
            }, {
                label: '预计时间',
                prop: 'time_MTS',
                value: '',
                type: 'datetimerange',
                required: false,
                disabled: true,
                pickerOption: {
                    disabledDate: time => {
                        const oldTimeDate = new Date(this.dueTime_1).getTime();
                        const selectTimeDate = time.getTime();
                        return selectTimeDate > oldTimeDate;
                    }
                },
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (value !== '') {
                            if (!reg.test(value) || Number(value) === 0) {
                                callback(new Error('请输入大于0的数且最多四位小数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '计划生产数量',
                prop: 'plannedProductionQuantity',
                value: '',
                required: true,
            }, {
                label: '状态',
                prop: 'productionStatus',
                disabled: true,
                value: '',
                type: 'select',
                option: dict.productionStatus,
            }, {
                label: '当前库存数量',
                prop: 'halfProductionLock',
                value: '',
                disabled: true,
            }, {
                label: '备注',
                prop: 'planRemark',
                value: '',
                type: 'textarea'
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            currentRowKeyParent: '',
            currentRowKeyTable: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            dueTime: '',
            dialogSearchForm: {},
            btnsTop: [{
                label: '新建MTO',
                click: () => this.newMTO(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_prodplan_add',
            }, {
                label: '新建MTS',
                click: () => this.newMTS(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_prodplan_add',
            }, {
                label: '删除',
                click: () => this.deleteTable(),
                className: 'iconfont iconstatus-delete',
                disabled: () => !this.selections.length || this.submitBtn,
                permi: 'productionplan_prodplan_dels',
            }, {
                label: '提交生产计划',
                click: () => this.subProductiuonPlan(),
                className: 'iconfont iconstatus-copy',
                disabled: () => this.submitBtn || this.selections.length === 0,
                permi: 'productionplan_prodplan_submit',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_prodplandetail_add',
                disabled: () => this.editDisabledParent,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_prodplandetail_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_prodplandetail_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                disabled: () => this.editDisabledSon_1,
                className: 'iconfont iconproduction_plan',
                permi: false,
            }],
            btnsRight: [{
                label: '指定结束',
                click: () => this.specifyTheEnd(),
                disabled: () => this.whetherSpecifyTheEnd,
                className: 'iconfont iconstatus-edit',
                permi: 'prodplan_prodorder_edit_end',
            }, {
                label: '编辑/查看',
                click: () => this.editView(),
                disabled: () => !this.currentRowKeySonRight,
                className: 'iconfont iconstatus-edit',
                permi: 'prodplan_prodorder_edit',
            }],
            conditionList: [],
            mao: '',
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || item.status !== '1';
        },
        editDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (!this.currentRowKeySon || item.status !== '1') ? true : false;
        },
        editDisabledSon_1() {
            return this.currentRowKeySon === '';
        },
        submitBtn() {
            return !this.selections.every(v => v.status === '1');
        },
        dlvdt() {
            if (this.dialogFormSon_MTO[3].value) {
                this.getDueTime();
            }
            return this.dueTime;
        },
        whetherSpecifyTheEnd() {
            const item = this.tableDataRight.find(v => v.id === this.currentRowKeySonRight);
            return !item || item.documentStatus !== 0;
        },
    },
    watch: {
        dialogVisibleSon(val) {
            if (!val) {
                this.isClick = true;
                this.dialogFormSon_MTO[11].disabled = true;
                this.dialogFormSon_MTO[12].disabled = true;
                this.dialogFormSon_MTS[7].disabled = true;
                this.tableDataProcessRoute = [];
            }
        },
        mao(val) {
            this.getOrderPercentage(val);
        }
    },
    created() {
        this.getDataParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        // 获取上表信息
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
                        joinType: 'OR',
                    });
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/productionplan/prodplan/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
                this.tableDataRight = [];
                this.currentRowKeyParent = '';
                this.activeName = 'first';
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        selectionChange(selection) {
            this.selections = selection;
            this.ids = selection.map(item => item.id);
        },
        // 获取下表信息
        getDataSon() {
            this.tableLoadingDownLeft = true;
            this.currentRowKeySon = '';
            this.activeName = 'first';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);// 获取点击的那一组数据
            this.dataSon = item;
            this.$http.get(`/productionplan/prodplandetail/getByProductionPlanCode/${item.productionPlanCode}`).then(res => {
                this.tableLoadingDownLeft = false;
                this.tableDataSon = res.data;
                if (res.data.length >= 1) {
                    this.code_SAP = res.data[0].docno;
                } else {
                    this.code_SAP = '';
                }
            });
            if (item.status === '2') {
                this.$http.get(`/productionplan/ppprocess/getProcessAll/${item.productionPlanCode}`).then(res => {
                    this.processList = res.data;
                });
                this.getOrderPercentage();
            } else {
                this.processList = [];
                this.tableDataRight = [];
            }
        },
        // 获取订单进度
        getOrderPercentage(process) {
            this.tableLoadingDownRight = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            let conditionList = [{
                fieldName: 'sourceCode',
                operation: 'EQ',
                value: item.productionPlanCode,
                joinType: 'AND',
            }];
            if (process) {
                conditionList.push({
                    fieldName: 'processCode',
                    operation: 'EQ',
                    value: process,
                    joinType: 'AND',
                });
            }
            this.$http.get('/productionplan/ppprodorder/getPagePriorityAscDesc', {
                params: {
                    size: 9999,
                    conditionList,
                }
            }).then(res => {
                this.tableLoadingDownRight = false;
                this.tableDataRight = res.data.records;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrent_1(val) {
            this.enterSalesPlanDetails(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.enterSalesPlanDetails();
        },
        // 新建MTO
        newMTO() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '1';
            this.dialogFormParent[1].value = '1';
        },
        // 新建MTS
        newMTS() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '2';
            this.dialogFormParent[1].value = '1';
        },
        // 删除
        deleteTable() {
            this.$confirm('是否确认删除。', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/prodplan/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 提交生产计划
        subProductiuonPlan() {
            this.radio = '1';
            this.dialogVisibleSub = true;
        },
        // 取消
        cancel() {
            this.dialogVisibleSub = false;
        },
        // 确认提交生产计划
        submitProductiuonPlan() {
            this.submitLoading = true;
            this.$http.post(`/productionplan/prodplan/submitProductionPlan/${this.radio}`, this.ids).then(res => {
                this.getDataParent();
                this.$message({
                    message: '确认提交生产计划成功!',
                    type: 'success'
                });
                this.submitLoading = false;
                this.dialogVisibleSub = false;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 查看BOM信息
        lookBom(row) {
            this.dialogVisibleBOM = true;
            this.tableColumn = this.tableColumnBom;
            this.dialogTableLoading = true;
            this.submitLoading = true;
            const params = {
                bomType: row.bomType,
                productionPlanCode: row.productionPlanCode,
            };
            this.$http.post('/productionplan/prodplan/lookOver', null, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.submitLoading = false;
                this.dialogTableData = res.data;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 查看工艺路线子件信息
        lookProcessRouteSon(row) {
            this.dialogVisibleBOM = true;
            this.dialogTableLoading = true;
            this.tableColumn = this.tableColumnProcessRouteSon;
            this.submitLoading = true;
            this.$http.post(`/productionplan/bom/bomlist/${row.routeCode}?size=9999`).then(res => {
                this.dialogTableLoading = false;
                this.submitLoading = false;
                this.dialogTableData = res.data;
            }).catch(() => {
                this.submitLoading = false;
                this.dialogTableLoading = false;
            });
        },
        // 添加
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop) obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            this.$http.post('/productionplan/prodplan/save', obj).then(() => {
                this.submitLoading = false;
                this.getDataParent();
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
                this.dialogVisibleParent = false;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 新增下表
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.sourceType === '1') {
                this.judge = true;
                this.dialogFormSon_MTO[0].value = item.productionPlanCode;
                this.dialogFormSon_MTO[1].value = '系统自动生成';
                this.dialogFormSon_MTO[2].value = item.sourceType;
                this.dialogFormSon_MTO[13].value = '1';
            } else {
                this.judge = false;
                this.dialogFormSon_MTS[0].value = item.productionPlanCode;
                this.dialogFormSon_MTS[1].value = '系统自动生成';
                this.dialogFormSon_MTS[2].value = item.sourceType;
                this.dialogFormSon_MTS[9].value = '1';
            }
        },
        // 下表修改页面
        editRowSon() {
            let obj = {};
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogSon = 'edit';
            const itemPar = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.judge = itemPar.sourceType === '1' ? true : false;
            if (this.judge) {
                this.dialogFormSon_MTO.forEach(v => {
                    v.value = item[v.prop];
                });
                this.dialogFormSon_MTO[2].value = itemPar.sourceType;
                this.dialogFormSon_MTO[11].value = [item.startTime, item.endTime];
                this.dueTime_1 = this.dialogFormSon_MTO[9].value;
                this.dialogFormSon_MTO[9].disabled = false;
                this.dialogFormSon_MTO[11].disabled = false;
            } else {
                this.dialogFormSon_MTS.forEach(v => {
                    if (v.prop !== 'processRoute') {
                        v.value = item[v.prop];
                    }
                });
                this.dialogFormSon_MTS[7].value = [item.startTime, item.endTime];
                this.dialogFormSon_MTS[2].value = itemPar.sourceType;
                this.dialogFormSon_MTS[7].disabled = false;
                this.dueTime_1 = this.dialogFormSon_MTS[5].value;
            }
            this.dialogVisibleSon = itemPar.status !== '1' ? false : true;
            this.getProcessRoute(item.materialCode).then(() => {
                this.$http.get('/productionplan/processroute/page', {
                    params: {
                        conditionList: [{
                            fieldName: 'routeCode',
                            joinType: 'AND',
                            operation: 'EQ',
                            value: item.routeCode,
                        }, {
                            fieldName: 'status',
                            joinType: 'AND',
                            operation: 'EQ',
                            value: 1,
                        }]
                    }
                }).then(res => {
                    obj = this.tableDataProcessRoute.find(v => v.id === res.data.records[0].id);
                    this.$refs.table.toggleRowSelection(obj, true);
                });
            });
        },
        look() {
            let obj = {};
            this.isClick = false;
            const itemPar = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogVisibleSon = true;
            this.judge = itemPar.sourceType === '1' ? true : false;
            this.getProcessRoute(item.materialCode);
            if (this.judge) {
                this.dialogFormSon_MTO.forEach(v => {
                    v.value = item[v.prop];
                });
                this.dialogFormSon_MTO[2].value = itemPar.sourceType;
                this.dialogFormSon_MTO[11].value = [item.startTime, item.endTime];
                this.dueTime_1 = this.dialogFormSon_MTO[9].value;
                this.dialogFormSon_MTO[9].disabled = false;
                this.dialogFormSon_MTO[11].disabled = false;
            } else {
                this.dialogFormSon_MTS.forEach(v => {
                    v.value = item[v.prop];
                });
                this.dialogFormSon_MTS[7].value = [item.startTime, item.endTime];
                this.dialogFormSon_MTS[2].value = itemPar.sourceType;
                this.dialogFormSon_MTS[7].disabled = false;
                this.dueTime_1 = this.dialogFormSon_MTS[5].value;
            }
            this.getProcessRoute(item.materialCode).then(() => {
                this.$http.get('/productionplan/processroute/page', {
                    params: {
                        conditionList: [{
                            fieldName: 'routeCode',
                            joinType: 'AND',
                            operation: 'EQ',
                            value: item.routeCode,
                        }, {
                            fieldName: 'status',
                            joinType: 'AND',
                            operation: 'EQ',
                            value: 1,
                        }]
                    }
                }).then(res => {
                    obj = this.tableDataProcessRoute.find(v => v.id === res.data.records[0].id);
                    this.$refs.table.toggleRowSelection(obj, true);
                });
            });
        },
        selectionChangeProcessRoute(selection) {
            this.processRouteSelection = selection;
        },
        // 提交下表新增或者修改数据
        submitFormSon() {
            let obj = {};
            if (this.judge) {
                this.dialogFormSon_MTO.forEach(v => {
                    obj[v.prop] = v.value;
                });
                obj.startTime = this.dialogFormSon_MTO[11].value[0];
                obj.endTime = this.dialogFormSon_MTO[11].value[1];
                delete obj.time_MTO;
            } else {
                this.dialogFormSon_MTS.forEach(v => {
                    obj[v.prop] = v.value;
                });
                obj.startTime = this.dialogFormSon_MTS[7].value[0];
                obj.endTime = this.dialogFormSon_MTS[7].value[1];
                delete obj.time_MTS;
            }
            if (this.processRouteSelection.length === 1) {
                obj.routeCode = this.processRouteSelection[0].routeCode;
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    this.$http.post('/productionplan/prodplandetail/save', obj).then(res => {
                        if (res.code === 0) {
                            this.submitLoading = false;
                            this.getDataSon();
                            this.$message({
                                message: '添加成功',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        }
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http.put('/productionplan/prodplandetail/updateById', obj).then(res => {
                        if (res.code === 0) {
                            this.submitLoading = false;
                            this.getDataSon();
                            // this.getDataParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        }
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            } else {
                this.$message.error('请勾选一条工艺路线!');
            }
        },
        // 删除下表
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/prodplandetail/removeByIds', {
                    data: [this.currentRowKeySon]
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        getDueTime() {
            const conditionList = [{
                fieldName: 'docno',
                joinType: 'AND',
                operation: 'EQ',
                value: this.dialogFormSon_MTO[3].value,
            }, {
                fieldName: 'posnr',
                joinType: 'AND',
                operation: 'EQ',
                value: this.dialogFormSon_MTO[4].value,
            }];
            this.$http.get('/productionplan/salesplaninfo/getPage', {
                params: {
                    conditionList,
                }
            }).then(res => {
                this.dueTime = res.data.records[0].dlvdt;
            });
        },
        // 获取SAP数据
        enterSalesPlanDetails(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
            };
            for (let i in this.dialogSearchForm) {
                if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                    if (this.dialogSearchForm[i]) {
                        params.conditionList.push({
                            fieldName: i,
                            operation: 'LIKE',
                            joinType: 'AND',
                            value: this.dialogSearchForm[i],
                        });
                    }
                }
            }
            this.dialogVisibleSalesPlan = true;
            this.dialogTableLoading = true;
            if (this.judge) {
                if (this.code_SAP) {
                    params.conditionList.push({
                        fieldName: 'docno',
                        operation: 'LIKE',
                        joinType: 'AND',
                        value: this.code_SAP,
                    });
                }
                this.$http.get('/productionplan/salesplaninfo/getPage', {
                    params
                }).then(res => {
                    this.dialogTableLoading = false;
                    this.currentPage_1 = val;
                    this.salesPlanDetails = res.data.records;
                    this.pageTotal_1 = res.data.total;
                });
            } else {
                this.$http.get('/productionplan/ppmaterial/page', {
                    params
                }).then(res => {
                    this.dialogTableLoading = false;
                    this.currentPage_1 = val;
                    this.salesPlanDetails = res.data.records;
                    this.pageTotal_1 = res.data.total;
                });
            }
        },
        openTableDialog() {
            this.currentPage_1 = 1;
            this.salesPlanDetails = [];
            this.dialogSearchForm = {};
            this.enterSalesPlanDetails();
        },
        // 搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.enterSalesPlanDetails();
        },
        // 清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitFormSalesPlan() {
            const item = this.salesPlanDetails.find(v => v.id === this.currentRowKeyTable);
            if (!this.judge) {
                this.dialogFormSon_MTS.forEach(v => {
                    if (item[v.prop]) {
                        v.value = item[v.prop];
                    }
                });
                this.dialogFormSon_MTS[10].value = item.availableStock;
                this.getProcessRoute(this.dialogFormSon_MTS[3].value);
            } else {
                this.dialogFormSon_MTO.forEach(v => {
                    if (item[v.prop]) {
                        v.value = item[v.prop];
                    }
                });
                this.dialogFormSon_MTO[7].value = item.matnr;
                this.dialogFormSon_MTO[8].value = item.maktx;
                this.dialogFormSon_MTO[9].value = item.dlvdt;
                this.dialogFormSon_MTO[12].value = item.arrangeableQuantity;
                this.dialogFormSon_MTO[14].value = item.arrangeableQuantity;
                this.dialogFormSon_MTO[9].disabled = false;
                this.dialogFormSon_MTO[11].disabled = false;
                this.dueTime_1 = this.dialogFormSon_MTO[9].value;
                this.getProcessRoute(this.dialogFormSon_MTO[7].value);
            }
            this.dialogVisibleSalesPlan = false;
        },
        // 通过物料查询工艺路线
        getProcessRoute(materialCode) {
            this.tableLoadingProcessRoute = true;
            return this.$http.get('/productionplan/processroute/page', {
                params: {
                    size: 999,
                    conditionList: [{
                        fieldName: 'materialCode',
                        joinType: 'AND',
                        operation: 'EQ',
                        value: materialCode,
                    }, {
                        fieldName: 'status',
                        joinType: 'AND',
                        operation: 'EQ',
                        value: 1,
                    }]
                }
            }).then(res => {
                this.tableLoadingProcessRoute = false;
                this.tableDataProcessRoute = res.data.records;
            }).catch(() => {
                this.tableLoadingProcessRoute = false;
            });
        },
        // 指定结束
        specifyTheEnd() {
            this.$confirm('是否确认指定结束?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.post(`/productionplan/ppprodorder/updateOrderEnd/${this.currentRowKey}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success(`指定结束!`);
                        this.getDataSon();
                    }
                });
            });
        },
        // 编辑查看
        editView() {
            this.dialogVisible = true;
            const item = this.tableDataRight.find(v => v.id === this.currentRowKeySonRight);
            if (item.documentStatus === 0 || item.documentStatus === 1) this.dialogForm[14].disabled = false;
            else this.dialogForm[14].disabled = true;
            this.dialogForm.forEach(v => {
                if (v.prop === 'documentStatus') v.value = String(item[v.prop]);
                else v.value = item[v.prop];
            });
            this.materialCode = item.materialCode;
            this.materialName = item.materialName;
            this.leng = item.leng;
            this.width = item.width;
            this.height = item.height;
            this.diagonal = item.diagonal;
            this.thickNess = item.thickNess;
            this.proProcessCode = item.proProcessCode;
            this.needAmount = item.needAmount;
            this.productionInQuantity = item.productionInQuantity;
            this.productionQuantity = item.productionQuantity;
            this.distributableQuantity = item.distributableQuantity;
            this.assignedQuantity = item.assignedQuantity;
            this.progress = item.progress;
        },
        submitForm() {
            const obj = {};
            const item = this.tableDataRight.find(v => v.id === this.currentRowKeySonRight);
            if (item.documentStatus === 0 || item.documentStatus === 1) {
                obj.id = this.currentRowKeySonRight;
                obj.remark = this.dialogForm[14].value;
                this.$http.put(`/productionplan/ppprodorder/updateById`, obj).then(() => {
                    this.dialogVisible = false;
                    this.getDataSon();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKeySonRight = '';
                });
            } else {
                this.dialogVisible = false;
            }
        }
    }
};
</script>

<style scoped lang='stylus'>
.plan
    & >>> .fr
        float right

    & >>> .dialog-table
        .el-dialog
            margin-top 5vh!important
.planDown
    height 50%
    .process
        background-color #fff
        overflow-y auto
        border-radius 4px
        border 1px solid #d1d1d1
        flex auto
        display flex
        flex-flow column nowrap
        padding 5px 10px

        &-name
            margin-right 45px
            margin-left 5px
            position relative

        &-percentage
            float right
            width 40px
            margin-right 5px
            text-align right
            position relative

        &-item
            position relative
            height 28px
            font-size 12px
            line-height 28px
            margin 2px 0
            padding-left 15px
            cursor pointer

            &.total
                padding-left 0

        &-tiao
            position absolute
            height 28px
            width 0
            background $color-blue
            top 0
            left 0

        &-radio
            position absolute
            top 0
            left -8px
            height 28px
            width 4px
            background transparent

        input[type=radio]
                visibility hidden

        input[type=radio]:checked + .process-radio
            background $color-green

.processRoute
    height 20vh

.right
    margin-left 300px
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

.multi
    display flex

    &:before, &:after
        display table
        content ''

    & >>> .el-form-item

        &:first-child .el-form-item__content
            width calc(100% - 110px)!important

        & .el-form-item__content
            width calc(100% - 60px)!important
</style>
