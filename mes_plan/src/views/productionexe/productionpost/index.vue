<template lang="pug">
    ebrain-main.IQC
        ebrain-frame(
            title="工序过账")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRowParent"
                    @selection-change="getSelectionParent"
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-dialog(
            ref='form'
            :expandVisible="collapse"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            template(#itemNum)
                el-col(:span="12")
                    el-form-item(label-width="110px" label="物料编码" prop="itemNum" required)
                        el-input(readonly=true v-model="dialogFormParent[4].value" :disabled="noClick")
                            el-button(slot="append" @click="showDialogTable('materielCode')" icon="el-icon-search" :disabled="noClick")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(
                title="过账物料明细")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom")
                template(#table)
                    ebrain-table.table_dialog(
                        :isShow="false"
                        :tableLoading='tableLoadingDown'
                        :pageSize='pageSize_down'
                        :currentPage='currentPage_down'
                        :pageTotal='pageTotal_down'
                        :data="tableDataSon"
                        :column="tableColumnSon"
                        @changeCurrent="changeCurrent_down"
                        @changeSize='changeSize_down'
                        @selection-change="getSelectionSon"
                        row-key="id"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#itemNum_table)
                el-col(:span="12")
                    el-form-item(label-width="110px" label="物料编码" prop="itemNum" required)
                        el-input(readonly=true v-model="dialogFormSon[0].value")
                            el-button(slot="append" @click="showDialogTable('itemNum_table')" icon="el-icon-search")
            template(#operr)
                el-col(:span="12")
                    el-form-item(label-width="110px" prop="operr" label="操作员工号" required)
                        el-input(readonly=true v-model="dialogFormSon[7].value")
                            el-button(slot="append" @click="showDialogTable('operr')" icon="el-icon-search")
        ebrain-dialog-table.materielCode(
            dialogTableSearch
            :isShow="isShow"
            height="60vh"
            row-key="id"
            :data="tableData_table"
            :column="tableColumn_table"
            :tableLoading='dialogTableLoading'
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @row-click="query_table"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            @current-change="currentChange"
            :pageTotal="pageTotal_table"
            :visible.sync="dialogVisibleDialogTable"
            highlight-current-row
            @submit="submitFormDialogTable(type)")
</template>

<script>
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import dict from '@/utils/dict';
import moment from 'moment';

export default {
    name: 'index',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            conditionList: [],
            noClick: false,
            stockUnit_table: '',
            stockUnitId_table: '',
            stockUnit: '',
            rowObj: {},
            postingId: '',
            collapse: false,
            ids: [],
            ids_son: [],
            isShow: true,
            tableColumn_table: [],
            type: '',
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            dialogTableLoading: false,
            dialogVisibleDialogTable: false,
            tableData_table: [],
            selectionParent: [],
            selectionSon: [],
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSon: [],
            tableColumnParent: [{
                width: '50',
                align: 'center',
                type: 'selection'
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '工单号',
                prop: 'billNum',
                showOverflowTooltip: true,
            }, {
                label: '所属工序',
                prop: 'belongProcess',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.belongProcess[cell];
                },
            }, {
                label: '批次',
                prop: 'batch',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'itemNum',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '库存地点',
                prop: 'invtryLoc',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'invtryCorp',
                showOverflowTooltip: true,
            }, {
                label: '开始制备时间',
                prop: 'startBackTm',
                showOverflowTooltip: true,
            }, {
                label: '结束制备时间',
                prop: 'startTm',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'qnty',
                showOverflowTooltip: true,
            }, {
                label: '实际产出数量',
                prop: 'actlProdQnty',
                showOverflowTooltip: true,
            }, {
                label: '生产版本',
                prop: 'prodVer',
                showOverflowTooltip: true,
            }, {
                label: '机台号',
                prop: 'machineNum',
                showOverflowTooltip: true,
            }, {
                label: '信息描述',
                prop: 'msg',
                showOverflowTooltip: true,
            }, {
                label: '凭证号',
                prop: 'voucher',
                showOverflowTooltip: true,
            }, {
                label: '过账时间',
                prop: 'submitDate',
                showOverflowTooltip: true,
            }, {
                label: '过账状态',
                prop: 'postingStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.postingStatus[cell];
                },
            }],
            tableColumnSon: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '物料编码',
                prop: 'itemNum',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'invtryCorp',
                showOverflowTooltip: true,
            // }, {
            //     label: '需求数量',
            //     prop: 'reqmentQnty',
            //     showOverflowTooltip: true,
            }, {
                label: '实际领料数量',
                prop: 'actlQnty',
                showOverflowTooltip: true,
            }, {
                label: '其中报废数量',
                prop: 'thrintoDiscardQnty',
                showOverflowTooltip: true,
            }, {
                label: '批次',
                prop: 'batch',
                showOverflowTooltip: true,
            }, {
                label: '领料仓',
                prop: 'bindingWarehouse',
                showOverflowTooltip: true,
            }, {
                label: '叠制/组合',
                prop: 'combination',
                showOverflowTooltip: true,
            }, {
                label: '是否过账物料',
                prop: 'tranEntry',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.tranEntry[cell];
                },
            }, {
                label: '操作员',
                prop: 'operrName',
                showOverflowTooltip: true,
            }, {
                label: '操作时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '工厂',
                prop: 'factory',
                value: '',
                disabled: true,
            }, {
                label: '工单号',
                prop: 'billNum',
                value: '',
            }, {
                label: '所属工序',
                prop: 'belongProcess',
                value: '',
                type: 'select',
                option: () => dict.belongProcess,
                required: true,
            }, {
                label: '批次',
                prop: 'batch',
                value: '',
                required: true,
            }, {
                slot: 'itemNum',
                prop: 'itemNum',
                value: '',
                required: true,
            }, {
                label: '物料名称',
                prop: 'itemName',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '库存地点',
                prop: 'invtryLoc',
                value: '',
                type: 'select',
                required: true,
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
            }, {
                label: '库存单位',
                prop: 'invtryCorp',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '开始制备时间',
                prop: 'time',
                value: '',
                type: 'datetimerange',
                required: true,
            }, {
                label: '数量',
                prop: 'qnty',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '实际产出数量',
                prop: 'actlProdQnty',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '生产版本',
                prop: 'prodVer',
                value: '',
                required: true,
            }, {
                label: '机台号',
                prop: 'machineNum',
                value: '',
                required: true,
            }, {
                label: '信息描述',
                prop: 'msg',
                value: '',
                disabled: true,
            }, {
                label: '凭证号',
                prop: 'voucher',
                value: '',
                disabled: true,
            }, {
                label: '过账时间',
                prop: 'submitDate',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '过账状态',
                prop: 'postingStatus',
                value: '',
                disabled: true,
                type: 'select',
                option: () => dict.postingStatus,
            }],
            dialogFormSon: [{
                label: '物料编码',
                prop: 'itemNum',
                value: '',
                disabled: true,
                required: true,
                slot: 'itemNum_table'
            }, {
                disabled: true,
                label: '物料名称',
                prop: 'itemName',
                value: '',
                required: true,
            }, {
                disabled: true,
                label: '库存单位',
                prop: 'invtryCorp',
                value: '',
                required: true,
            // }, {
            //     label: '需求数量',
            //     prop: 'reqmentQnty',
            //     value: '',
            //     required: true,
            //     rule: {
            //         validator: (rule, value, callback) => {
            //             let reg = /^[0-9]+(\.\d+)?$/;
            //             if (value !== '') {
            //                 if (!reg.test(value)) {
            //                     callback(new Error('请输入大于等于0的数!'));
            //                 } else {
            //                     callback();
            //                 }
            //             } else {
            //                 callback();
            //             }
            //         },
            //         trigger: 'blur',
            //     },
            }, {
                label: '实际领料数量',
                prop: 'actlQnty',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '其中报废数量',
                prop: 'thrintoDiscardQnty',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '批次',
                prop: 'batch',
                value: '',
                required: true,
            }, {
                label: '领料仓',
                prop: 'bindingWarehouse',
                required: true,
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
            }, {
                slot: 'operr',
                prop: 'operr',
                required: true,
                value: '',
            }, {
                label: '操作员名称',
                prop: 'operrName',
                disabled: true,
                required: true,
                value: '',
            }],
            tableColumnMaterielCode: [{
                label: '料号',
                prop: 'materialCode',
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                searchBy: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
            }],
            tableColumnStaff: [{
                label: '操作员工号',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '操作员名称',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogParent: 'new',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            row: [],
            posting_id: '',
            subId: false,
            pageTotal_down: 0,
            pageSize_down: 20,
            currentPage_down: 1,
            businessCode: '',
            businessId: '',
            searchVisible: true,
            dialogSearchForm: {},
            loadingDisabled: false,
            // conditionList: [],
            // postingStatus: '',
            searchForm: [{
                label: '工单号',
                prop: 'billNum',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectapply_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'qc_iqcinspectapply_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.delDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_iqcinspectapply_dels',
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
                permi: 'proplan_postingde_add',
                disabled: () => this.addDisabledSon || this.noClick,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.addDisabledSon || !this.currentRowKeySon || this.noClick,
                className: 'iconfont iconstatus-edit',
                permi: 'proplan_postingde_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => !this.selectionSon.length || this.btnsDialog[0].label === '保存' || this.noClick,
                className: 'iconfont iconstatus-delete',
                permi: 'proplan_postingde_dels',
            }],
            btnsDialog: [{
                label: '保存',
                click: () => this.saveParentdialog(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectapplydet_add',
                disabled: () => this.noClick,
            }, {
                label: '过账',
                click: () => this.posting(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectapplydet_add',
                disabled: () => this.dialogParent === 'new' || !this.tableDataSon.length || this.dialogFormParent[16].value !== 'N' || this.noClick || this.loadingDisabled,
                loading: false,
                //  this.postingStatus === 'Y'
            }, {
                label: '冲销',
                click: () => this.against(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectapplydet_add',
                disabled: () => this.subAgainst || this.dialogFormParent[16].value === '0',
                loading: false,
            }, {
                label: '取消',
                click: () => this.cancle(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectapplydet_add',
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser,
        }),
        generate() {
            return true;
        },
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        delDisabledParent() {
            const pass = this.selectionParent.some(v => v.postingStatus === 'Y');
            return !this.selectionParent.length || pass;
        },
        addDisabledSon() {
            return this.btnsDialog[0].label === '保存';
        },
        subAgainst() {
            return !(this.dialogParent === 'edit' && this.dialogFormParent[16].value === 'Y');
        }
    },
    watch: {
        dialogVisibleDialogTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
                this.currentPage_table = 1;
                this.pageSize_table = 20;
                this.pageTotal_table = 0;
            }
        },
        dialogVisibleParent(val) {
            if (!val) {
                this.getDataParent();
                this.subId = false;
                this.noClick = false;
                this.loadingDisabled = false;
                this.btnsDialog[1].loading = false;
                this.btnsDialog[2].loading = false;
                // this.postingStatus = '';
            }
        },
    },
    mounted() {
        const arr = [
            this.queryDict('BILL_POSTING_WAREHOUSE_RESULT'),
        ];
        Promise.all(arr).then(() => {
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchTop() {
            this.conditionList = [];
            this.currentPage = 1;
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
            this.getDataParent();
        },
        getDataParent(val = 1) {
            this.tableLoadingTop = true;
            // const conditionList = [];
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: v.value,
            //             joinType: 'OR',
            //         });
            //     }
            // });
            this.$http.get('/productionplan/posting/page', {
                params: {
                    current: val,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPage = val;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon(row) {
            this.businessCode = row.applyCode;
            this.businessId = row.id;
        },
        changeCurrent(val) {
            this.getDataParent(val);
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getTableDataSon();
        },
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getTableDataSon();
        },
        newRowParent() {
            this.btnsDialog[0].label = '保存';
            this.dialogParent = 'new';
            this.dialogFormParent[0].value = 'SY00';
            this.dialogFormParent[16].value = 'N';
            this.dialogVisibleParent = true;
            this.tableDataSon = [];
            this.dialogFormParent[1].disabled = false;
        },
        editRowParent() {
            this.btnsDialog[0].label = '修改';
            this.dialogParent = 'edit';
            this.dialogVisibleParent = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.noClick = item.postingStatus !== 'N';
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            // this.stockUnitId = item.invtryCorp;
            this.dialogFormParent[8].value = [item.startBackTm, item.startTm];
            this.materialCode = this.dialogFormParent[4].value;
            this.materialName = this.dialogFormParent[5].value;
            this.stockUnit = this.dialogFormParent[7].value;
            this.dialogFormParent[1].disabled = true;
            this.getTableDataSon();
        },
        // 取消
        cancle() {
            this.dialogVisibleParent = false;
            this.getDataParent();
        },
        // 过账
        posting() {
            this.loadingDisabled = true;
            this.btnsDialog[1].loading = true;
            this.posting_id = this.subId ? this.postingId : this.currentRowKeyParent;
            this.submitLoading = true;
            this.$http.get(`/productionplan/posting/getPosting/${this.posting_id}`).then(res => {
                this.dialogFormParent.forEach(v => {
                    v.value = res.data[v.prop];
                });
                this.dialogFormParent[8].value = [res.data.startBackTm, res.data.startTm];
                this.$message({
                    message: '过账成功!',
                    type: 'success',
                });
                this.noClick = true;
                this.loadingDisabled = false;
                this.btnsDialog[1].loading = false;
                // this.postingStatus = 'Y';
            }).catch(() => {
                this.loadingDisabled = false;
                this.btnsDialog[1].loading = false;
                this.submitLoading = false;
            });
        },
        // 冲销
        against() {
            this.posting_id = this.subId ? this.postingId : this.currentRowKeyParent;
            this.btnsDialog[2].loading = true;
            this.submitLoading = true;
            this.$http.get(`/productionplan/posting/getWriteOff/${this.posting_id}`).then(res => {
                this.dialogFormParent.forEach(v => {
                    v.value = res.data[v.prop];
                });
                this.dialogFormParent[8].value = [res.data.startBackTm, res.data.startTm];
                this.$message({
                    message: '冲销成功!',
                    type: 'success'
                });
                this.noClick = true;
                this.btnsDialog[2].loading = false;
            }).catch(() => {
                this.submitLoading = false;
                this.btnsDialog[2].loading = false;
            });
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/posting/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        currentChange(row) {
            this.rowObj = row;
        },
        // 获取物料
        getmaterielCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_table,
                conditionList: []
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/dicbasicmaterial/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_table = val;
                this.tableData_table = res.data.records;
                this.pageTotal_table = res.data.total;
            });
        },
        // 获取员工信息列表
        getStaff(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_table,
                conditionList: [{
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    value: '0',
                    joinType: 'AND',
                }],
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/dicpersonnel/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_table = val;
                this.tableData_table = res.data.records;
                this.pageTotal_table = res.data.total;
            });
        },
        // 保存按钮
        saveParentdialog() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'qnty' || v.prop === 'actlProdQnty') {
                    obj[v.prop] = Number(v.value);
                } else {
                    obj[v.prop] = v.value;
                }
            });
            // obj.invtryCorp = this.stockUnitId;
            obj.startBackTm = moment(obj.time[0]).format('YYYY-MM-DD HH:mm:ss');
            obj.startTm = moment(obj.time[1]).format('YYYY-MM-DD HH:mm:ss');
            delete obj.time;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$refs.form.$refs.form.validate(valid => {
                    if (valid) {
                        this.$http.post('/productionplan/posting/save', obj).then(({ data }) => {
                            this.dialogFormParent.forEach(v => {
                                v.value = data[v.prop];
                            });
                            this.dialogFormParent[8].value = [data.startBackTm, data.startTm];
                            this.postingId = data.id;
                            this.submitLoading = false;
                            this.getTableDataSon();
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.btnsDialog[0].label = '修改';
                            this.dialogParent = 'edit';
                            this.subId = true;
                            this.dialogFormParent[1].disabled = true;
                        }).catch(() => {
                            this.submitLoading = false;
                        });
                    }
                });
            } else {
                obj.id = this.currentRowKeyParent;
                obj.id = this.subId ? this.postingId : this.currentRowKeyParent;
                this.$http.put('/productionplan/posting/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getTableDataSon();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    // this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
        },
        editRowSon() {
            this.dialogSon = 'edit';
            this.dialogVisibleSon = true;
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/postingde/removeByIds', {
                    data: this.ids_son,
                }).then(() => {
                    this.getTableDataSon();
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 刷子表
        getTableDataSon(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_down,
            };
            if (this.postingId === '') {
                params.conditionList = [{
                    fieldName: 'postingId',
                    operation: 'EQ',
                    value: this.currentRowKeyParent
                }];
            } else {
                params.conditionList = [{
                    fieldName: 'postingId',
                    operation: 'EQ',
                    value: this.postingId
                }];
            }
            this.tableLoadingDown = true;
            this.$http.get(`/productionplan/postingde/page`, {
                params
            }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSon = data.records;
                this.pageTotal_down = data.total;
                this.pageSize_down = data.size;
                this.currentRowKeySon = '';
            });
        },
        submitFormSon() {
            let obj = {};
            const finish = () => {
                this.getTableDataSon();
                this.dialogVisibleSon = false;
                this.submitLoading = false;
            };
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            // obj.invtryCorp = this.stockUnitId_table;
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                if (this.postingId !== '') {
                    obj.postingId = this.postingId;
                } else {
                    obj.postingId = this.currentRowKeyParent;
                }
                this.$http.post('/productionplan/postingde/save', obj).then(() => {
                    finish();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/productionplan/postingde/updateById', obj).then(() => {
                    finish();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 弹表刷表
        showDialogTable(type) {
            this.type = type;
            this.dialogVisibleDialogTable = true;
            switch (type) {
                case 'materielCode':
                    this.tableColumn_table = this.tableColumnMaterielCode;
                    this.getmaterielCodeInfo();
                    break;
                case 'operr':
                    this.tableColumn_table = this.tableColumnStaff;
                    this.getStaff();
                    break;
                case 'itemNum_table':
                    this.tableColumn_table = this.tableColumnMaterielCode;
                    this.getmaterielCodeInfo();
                    break;
                default:
                    break;
            }
        },
        changeCurrent_table(val) {
            switch (this.type) {
                case 'materielCode':
                    this.getmaterielCodeInfo(val);
                    break;
                case 'operr':
                    this.getStaff(val);
                    break;
                case 'itemNum_table':
                    this.getmaterielCodeInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            switch (this.type) {
                case 'materielCode':
                    this.getmaterielCodeInfo();
                    break;
                case 'operr':
                    this.getStaff();
                    break;
                case 'itemNum_table':
                    this.getmaterielCodeInfo();
                    break;
                default:
                    break;
            }
        },
        query_table(row) {
            this.row = row;
        },
        submitFormDialogTable(type) {
            this.dialogVisibleDialogTable = false;
            switch (type) {
                case 'materielCode':
                    if (this.btnsDialog[0].label === '修改') {
                        let rowObj = this.row;
                        this.$confirm('更改物料会删除原物料的明细,确认更改吗？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.dialogFormParent[4].value = rowObj.materialCode;
                            this.dialogFormParent[5].value = rowObj.materialName;
                            this.stockUnitId = rowObj.stockUnitId;
                            this.dialogFormParent[7].value = rowObj.stockUnit;
                            this.stockUnit = rowObj.stockUnit;
                            // this.detail(this.rowObj.materialCode);
                            this.saveParentdialog();
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '更换已取消'
                            });
                        });
                    } else {
                        this.dialogFormParent[4].value = this.rowObj.materialCode;
                        this.dialogFormParent[5].value = this.rowObj.materialName;
                        this.stockUnitId = this.rowObj.stockUnitId;
                        this.dialogFormParent[7].value = this.rowObj.stockUnit;
                        this.stockUnit = this.rowObj.stockUnit;
                        this.detail(this.rowObj.materialCode);
                    }
                    break;
                case 'operr':
                    this.dialogFormSon[7].value = this.rowObj.personnelNumber;
                    this.dialogFormSon[8].value = this.rowObj.personnelFullName;
                    break;
                case 'itemNum_table':
                    this.dialogFormSon[0].value = this.rowObj.materialCode;
                    this.dialogFormSon[1].value = this.rowObj.materialName;
                    this.dialogFormSon[2].value = this.rowObj.stockUnit;
                    this.stockUnitId_table = this.rowObj.stockUnitId;
                    this.stockUnit_table = this.rowObj.stockUnit;
                    break;
                default:
                    break;
            }
        },
        detail(masterCode) {
            this.$http.get(`/productionplan/bom/getSubListByMasterCode/${masterCode}`).then(res => {
                res.data.forEach(item => {
                    item.itemNum = item.masterCode;
                    item.itemName = item.materialName;
                    item.invtryCorp = item.unitName;
                });
                this.tableDataSon = res.data;
            });
        },
        getSelectionParent(selection) {
            this.selectionParent = selection;
            this.ids = selection.map(v => v.id);
        },
        getSelectionSon(selection) {
            this.selectionSon = selection;
            this.ids_son = selection.map(v => v.id);
        },
        // 表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'materielCode':
                    this.getmaterielCodeInfo();
                    break;
                case 'operr':
                    this.getStaff();
                    break;
                case 'itemNum_table':
                    this.getmaterielCodeInfo();
                    break;
                default:
                    break;
            }
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
    }
};
</script>

<style lang="stylus" scoped>
.import
    display inline

.container
    width 600px
    height 400px
    border-radius 10px
    margin 0 auto
    overflow hidden
    padding 0px
    .footer
        display block
        margin 20px auto

.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)

.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        min-height 150px!important
.IQC
    & >>> .fr
        float right
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
</style>
