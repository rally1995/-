<template lang="pug">
    ebrain-main.delivery
        ebrain-frame(:title="$route.name")
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
                    :tableLoading="tableLoading"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRow"
                    @row-click="getDataSon"
                    @changeCurrent="changeCurrentParent"
                    @changeSize="changeSizeParent"
                    @selection-change="changeHandler")
        ebrain-frame(title="交货单物料明细")
            template(#table)
                ebrain-table(
                    :row-class-name="tableRowClassName"
                    :tableLoading="tableLoadingSon"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    :pageSize="pageSizeSon"
                    :currentPage="currentPageSon"
                    :pageTotal="pageTotalSon"
                    @changeCurrent="changeCurrentSon"
                    @changeSize="changeSizeSon")
        ebrain-dialog(
            :visible.sync="dialogVisible"
            ref="dialog"
            top="6vh"
            :expandVisible="collapse"
            :isShow="false"
            :isCancel="false"
            :form.sync="dialogForm")
            template(#button)
                ebrain-tools(:buttons="btnsForm")
            template(#saleNo="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="销售合同号" :required="true" prop="saleNo")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" :disabled="isClick" @click="dialogSearchForm={};showSaile()"  icon="iconfont iconsearch")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(title="交货单物料明细")
                template(#tools)
                    ebrain-tools(:buttons="btnsDown")
                template(#table)
                    ebrain-table.table_dialog(
                        :isShow="false"
                        :tableLoading="tableLoadingDialog"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyDialog"
                        row-key="id"
                        :data="tableDataDialog"
                        :column="tableColumnSonDialog"
                        :pageSize="pageSizeDialog"
                        :row-class-name="tableRowClassName"
                        :currentPage="currentPageDialog"
                        :pageTotal="pageTotalDialog"
                        @cell-change="tableEdit"
                        @selection-change="selectHandlerSon"
                        @changeCurrent="changeCurrentDialog"
                        @changeSize="changeSizeDialog")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatContract"
            :column="tableColumnContract"
            :tableLoading="submitLoadingContract"
            :visible.sync="dialogVisibleContract"
            :pageSize="pageSizeContract"
            :currentPage="currentPageContract"
            :pageTotal="pageTotalContract"
            :disabled="!currentRowKeyContract"
            @changeCurrent="changeCurrentContract"
            @changeSize="changeSizeContract"
            @search="searchContract"
            @resetDialog="resetContract"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyContract"
            @submit="submitFormContract")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDatContractSon"
            :column="tableColumnContractSon"
            :tableLoading="submitLoadingContractSon"
            :visible.sync="dialogVisibleContractSon"
            :pageSize="pageSizeContractSon"
            :currentPage="currentPageContractSon"
            :pageTotal="pageTotalContractSon"
            :disabled="submitDialogAdd"
            @changeCurrent="changeCurrentContractSon"
            @changeSize="changeSizeContractSon"
            @select="handleContractSon"
            row-key="id"
            :current-row-key.sync="currentRowKeyContractSon"
            @submit="submitFormContractSon")
</template>
<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            conditionList: [],
            searchForm: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                value: '',
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: () => {},
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallydelivery_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallydelivery_mod',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabled,
                permi: 'tallymanager_tallydelivery_del',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.addSonDisabeled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallydeliveryde_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.DelSonDisabeled,
                permi: 'tallymanager_tallydeliveryde_dels',
            }],
            collapse: false,
            isClick: false,
            searchVisible: true,
            tableLoading: false,
            currentRowKey: '',
            tableData: [],
            dialogSearchForm: {},
            dialogSearchFormSon: {},
            noteStatus: '100',
            tableColumn: [{
                label: '交货单',
                prop: 'notesDeliveryNo',
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '销售合同',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: [],
            tableLoadingSon: false,
            currentRowKeySon: '',
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            submitId: '',
            dialogType: '',
            isloading: false,
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
                index: index => {
                    return (this.currentPageSon - 1) * this.pageSizeSon + index + 1;
                },
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同项目号',
                prop: 'saleItemNo',
                showOverflowTooltip: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '库存状态',
                prop: 'stockStatus',
                showOverflowTooltip: true,
            }, {
                label: '销售合同数量',
                prop: 'saleNumber',
                showOverflowTooltip: true,
            }, {
                label: '可出货数量',
                prop: 'deliverableNumber',
                showOverflowTooltip: true,
            }, {
                label: '本次出货数量',
                prop: 'crtDeliverNumber',
                showOverflowTooltip: true,
            }, {
                label: '托盘数',
                prop: 'trayNumber',
                showOverflowTooltip: true,
            }, {
                label: '净重',
                prop: 'netWeight',
                showOverflowTooltip: true,
            }, {
                label: '毛重',
                prop: 'grossWeight',
                showOverflowTooltip: true,
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '运点',
                prop: 'transportPoint',
                showOverflowTooltip: true,
            }],
            tableColumnSonDialog: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
                index: index => {
                    return (this.currentPageDialog - 1) * this.pageSizeDialog + index + 1;
                },
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同项目号',
                prop: 'saleItemNo',
                showOverflowTooltip: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '库存状态',
                prop: 'stockStatus',
                showOverflowTooltip: true,
            }, {
                label: '销售合同数量',
                prop: 'saleNumber',
                showOverflowTooltip: true,
            }, {
                label: '可出货数量',
                prop: 'deliverableNumber',
                showOverflowTooltip: true,
            }, {
                label: '本次出货数量',
                prop: 'crtDeliverNumber',
                editable: true,
                showOverflowTooltip: true,
            }, {
                label: '托盘数',
                prop: 'trayNumber',
                showOverflowTooltip: true,
            }, {
                label: '净重',
                prop: 'netWeight',
                showOverflowTooltip: true,
            }, {
                label: '毛重',
                prop: 'grossWeight',
                showOverflowTooltip: true,
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '运点',
                prop: 'transportPoint',
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '交货单号',
                prop: 'notesDeliveryNo',
                value: '',
                disabled: true,
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                value: '',
                slot: 'saleNo',
            }, {
                label: '客户编号',
                prop: 'customNo',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                value: '',
                disabled: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                type: 'datetime',
                value: '',
                required: true,
                pickerOption: {
                    disabledDate: time => {
                        const oldTimeDate = new Date(new Date().setHours(0, 0, 0, 0));
                        return oldTimeDate > time.getTime();
                    }
                },
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_TALLY_STATUS'],
                disabled: true,
            }, {
                label: '创建人',
                prop: 'createBy',
                value: '',
                disabled: true,
                // required: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                type: 'datetime',
                disabled: true,
                value: '',
                // required: true,
            }, {
                label: '备注',
                type: 'textarea',
                prop: 'remark',
                value: '',
            }],
            tableDatContract: [],
            submitLoadingContract: false,
            dialogVisibleContract: false,
            pageSizeContract: 20,
            currentPageContract: 1,
            pageTotalContract: 0,
            currentRowKeyContract: '',
            tableColumnContract: [{
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableDatContractSon: [],
            submitLoadingContractSon: false,
            dialogVisibleContractSon: false,
            pageSizeContractSon: 20,
            currentPageContractSon: 1,
            pageTotalContractSon: 0,
            currentRowKeyContractSon: '',
            multiptionContarctSon: [],
            tableColumnContractSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '销售合同号',
                prop: 'saleNo',
                showOverflowTooltip: true,
            }, {
                label: '销售合同项目号',
                prop: 'saleItemNo',
                showOverflowTooltip: true,
            }, {
                label: '客户采购订单号',
                prop: 'purchaseOrderNo',
                showOverflowTooltip: true,
            }, {
                label: '客户编号',
                prop: 'customNo',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'customName',
                showOverflowTooltip: true,
            }, {
                label: '物料料号',
                prop: 'materielNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '可用库存数量',
                prop: 'stockNumber',
                showOverflowTooltip: true,
            }, {
                label: '预交货日',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '工厂',
                prop: 'factory',
                showOverflowTooltip: true,
            }, {
                label: '运点',
                prop: 'transportPoint',
                showOverflowTooltip: true,
            }],
            tableLoadingDialog: false,
            currentRowKeyDialog: '',
            tableDataDialog: [],
            pageSizeDialog: 20,
            currentPageDialog: 1,
            pageTotalDialog: 0,
            multiptionSon: [],
            isSubmit: false,
            savaLoading: false,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        btnsForm() {
            let arr =  [{
                label: '保存',
                click: () => this.saveData(),
                disabled: () => this.saveDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'tallymanager_tallydelivery_add',
                loading: this.savaLoading,
            }, {
                label: '提交',
                click: () => this.submitParent(),
                disabled: () => this.submitValited,
                className: 'iconfont iconstatus-Submission',
                permi: 'tallymanager_tallydelivery_submit',
                loading: this.isloading,
            }, {
                label: '关闭',
                click: () => this.close(),
                className: 'iconfont iconClose-',
                permi: false,
            }];
            if (this.dialogForm[5].value === '100') {
                arr[1] = {
                    label: '提交',
                    click: () => this.submitParent(),
                    disabled: () => this.submitValited,
                    className: 'iconfont iconstatus-Submission',
                    permi: 'tallymanager_tallydelivery_submit',
                    loading: this.isloading,
                };
            } else {
                arr[1] = {
                    label: '取消',
                    click: () => this.disAll(),
                    className: 'iconfont iconstatus-Refresh',
                    disabled: () => this.disValited,
                    permi: 'tallymanager_tallydelivery_cancel',
                    loading: this.isloading,
                };
            }
            return arr;
        },
        saveDisabled() {
            return this.noteStatus !== '100';
        },
        editDisabled() {
            return !this.currentRowKey;
        },
        addSonDisabeled() {
            return !this.dialogForm[0].value || this.noteStatus !== '100';
        },
        DelSonDisabeled() {
            return !this.dialogForm[0].value || this.multiptionSon.length === 0 || this.dialogType === '' || this.noteStatus !== '100';
        },
        submitValited() {
            return !this.dialogForm[0].value || this.isSubmit || this.tableDataDialog.length === 0;
        },
        submitDialogAdd() {
            return this.multiptionContarctSon.length === 0;
        },
        disValited() {
            return this.noteStatus !== '101';
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.noteStatus = '100';
                this.tableDataDialog = [];
                this.getData();
                this.getDataSon();
            } else {
                if (this.dialogForm[0].value !== '') this.getDataDialog();
            }
        },
        noteStatus(val) {
            if (val !== '100' && val !== '') {
                this.dialogForm.forEach(v => {
                    v.disabled = true;
                });
            } else {
                this.dialogForm[1].disabled = false;
                this.dialogForm[4].disabled = false;
                this.dialogForm[8].disabled = false;
            }
        },
        dialogVisibleContract(val) {
            if (!val) {
                this.currentPageDialog = 1;
                this.tableDatContract = [];
                this.currentRowKeyContract = '';
            }
        },
        tableDataDialog(val) {
            if (val.length === 0) this.isClick = false;
            else this.isClick = true;
        },
        dialogVisibleContractSon(val) {
            if (!val) {
                this.currentPageContractSon = 1;
                this.tableDatContractSon = [];
                this.currentRowKeyContractSon = '';
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            // const params = { 100: obj['100'], 101: obj['101'] };
            delete obj['200'];
            delete obj['203'];
            delete obj['400'];
            delete obj['401'];
            delete obj['300'];
            delete obj['301'];
            delete obj['303'];
            this.searchForm[1].option = obj;
        });
    },
    activated() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            delete obj['200'];
            delete obj['203'];
            delete obj['400'];
            delete obj['401'];
            delete obj['300'];
            delete obj['301'];
            delete obj['303'];
            this.searchForm[1].option = obj;
        });
    },
    methods: {
        ...mapActions(['queryDict']),
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
            this.getData();
            this.tableDataSon = [];
            this.pageSizeSon = 20;
            this.currentPageSon = 1;
            this.pageTotalSon = 0;
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: v.value,
            //             joinType: 'AND',
            //         });
            //     }
            // });
            this.$http.get(`/tallymanager/tallydelivery/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.isClick = false;
            this.dialogForm[5].value = '100';
            this.currentRowKey = '';
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.isClick = true;
            this.submitId = item.id;
            this.dialogVisible = true;
            this.dialogType = 'edit';
            this.dialogForm.forEach(v => {
                if (v.prop === 'noteStatus') v.value = item[v.prop].toString();
                else v.value = item[v.prop];
            });
            this.noteStatus = this.dialogForm[5].value;
        },
        delRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (item.noteStatus !== 100) {
                this.$alert('该数据状态为已提交，不可删除!', {
                    type: 'warning'
                });
                return;
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                // this.submitLoading = true;
                this.$http.delete('/tallymanager/tallydelivery/delById', {
                    data: { id: this.currentRowKey },
                }).then(() => {
                    // this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData();
                    this.tableDataSon = [];
                    this.pageTotalSon = 0;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        changeCurrentParent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSizeParent(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeHandler(selection) {
            this.multiption = selection;
        },
        close() {
            this.dialogVisible = false;
        },
        // 保存
        saveData() {
            this.$refs.dialog.$refs.form.validate(valid => {
                if (valid) {
                    let obj = {};
                    this.dialogForm.forEach(v => {
                        if (v.prop === 'noteStatus') obj[v.prop] = Number(v.value);
                        else obj[v.prop] = v.value;
                    });
                    this.savaLoading = true;
                    delete obj.notesDeliveryNo;
                    obj.deliveryDate = moment(obj.deliveryDate).format('YYYY-MM-DD HH:mm:ss');
                    if (this.dialogType === 'new') {
                        this.$http.post(`/tallymanager/tallydelivery/add`, obj).then(({ code, data }) => {
                            this.dialogForm.forEach(v => {
                                if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                                else v.value = data[v.prop];
                            });
                            this.tableDataDialog = data.tallyDeliveryDes;
                            this.$message.success('保存成功');
                            this.btnsForm[0].loading = false;
                            this.submitId = data.id;
                            this.noteStatus = this.dialogForm[5].value;
                            this.getData();
                            this.getDataDialog();
                            this.isClick = true;
                            this.dialogType = 'edit';
                            this.savaLoading = false;
                        }).catch(() => {
                            this.btnsForm[0].loading = false;
                            this.savaLoading = false;
                        });
                    } else {
                        obj.id = this.submitId;
                        obj.createTime = moment(obj.createTime).format('YYYY-MM-DD HH:mm:ss');
                        obj.tallyDeliveryDes = this.tableDataDialog;
                        this.$http.put(`/tallymanager/tallydelivery/modById`, obj).then(({ code, data }) => {
                            this.dialogForm.forEach(v => {
                                if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                                else v.value = data[v.prop];
                            });
                            this.tableDataDialog = data.tallyDeliveryDes;
                            this.$message.success('修改成功');
                            this.getData();
                            this.getDataDialog();
                            this.savaLoading = false;
                        }).catch(() => {
                            this.savaLoading = false;
                        });
                    }
                }
            });
        },
        // 提交
        submitParent() {
            this.isloading = true;
            this.$http.put(`/tallymanager/tallydelivery/submitById`, { id: this.submitId }).then(({ code, data }) => {
                this.$message.success('提交成功');
                this.getData();
                this.dialogForm.forEach(v => {
                    if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                    else v.value = data[v.prop];
                });
                this.noteStatus = this.dialogForm[5].value;
                this.isloading = false;
            }).catch(() => {
                this.isloading = false;
            });
        },
        disAll() {
            const submitId = this.submitId ? this.submitId : this.currentRowKey;
            const cancel = () => {
                this.isloading = true;
                this.$http.put(`/tallymanager/tallydelivery/cancelById`, { id: submitId }).then(({ code, data }) => {
                    this.$message.success('取消成功');
                    this.dialogForm.forEach(v => {
                        if (v.prop === 'noteStatus') v.value = data[v.prop].toString();
                        else v.value = data[v.prop];
                    });
                    this.noteStatus = this.dialogForm[5].value;
                    this.getData();
                    this.isloading = false;
                }).catch(() => {
                    this.isloading = false;
                });
            };
            this.$http.get(`/tallymanager/tallydelivery/getById/${submitId}`).then(({ code, data }) => {
                if (data.noteStatus === 202) {
                    this.$confirm('该数据已经在拣配中,取消将删除拣配单的记录,是否要取消备货', {
                        type: 'warning'
                    }).then(() => {
                        cancel();
                    });
                } else {
                    cancel();
                }
            });
        },
        getDataSon() {
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: [],
            };
            if (this.dialogType === 'edit' && this.submitId !== '') {
                const item = this.tableData.find(v => v.id === this.submitId);
                params.conditionList.push({
                    fieldName: 'notesDeliveryNo',
                    operation: 'EQ',
                    value: item.notesDeliveryNo,
                    joinType: 'AND',
                });
                return this.$http.get(`/tallymanager/tallydeliveryde/page`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataSon = data.records;
                    this.pageTotalSon = data.total;
                    this.dialogType = '';
                    this.submitId = '';
                });
            } else if (this.dialogType === '') {
                const item = this.tableData.find(v => v.id === this.currentRowKey);
                params.conditionList.push({
                    fieldName: 'notesDeliveryNo',
                    operation: 'EQ',
                    value: item.notesDeliveryNo,
                    joinType: 'AND',
                });
                return this.$http.get(`/tallymanager/tallydeliveryde/page`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataSon = data.records;
                    this.pageTotalSon = data.total;
                    this.dialogType = '';
                    this.submitId = '';
                });
            } else {
                this.dialogType = '';
                this.submitId = '';
            }

        },
        changeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        changeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        // 销售合同
        showSaile() {
            this.dialogVisibleContract = true;
            this.submitLoadingContract = true;
            const params = {
                current: this.currentPageContract,
                size: this.pageSizeContract,
                conditionList: [],
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
            this.$http.get('/tallymanager/tallysale/page', { params }).then((res) => {
                this.tableDatContract = res.data.records;
                this.pageTotalContract = res.data.total;
                this.submitLoadingContract = false;
            }).catch(() => {
                this.submitLoadingContract = false;
            });
        },
        searchContract(form) {
            this.currentPageContract = 1;
            this.dialogSearchForm = form;
            this.showSaile();
        },
        resetContract(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentContract(val) {
            this.currentPageContract = val;
            this.showSaile();
        },
        changeSizeContract(val) {
            this.pageSizeContract = val;
            this.currentPageContract = 1;
            this.showSaile();
        },
        submitFormContract() {
            const item = this.tableDatContract.find(v => v.id === this.currentRowKeyContract);
            this.dialogForm[1].value = item.saleNo;
            this.dialogForm[2].value = item.customNo;
            this.dialogForm[3].value = item.customName;
            this.dialogVisibleContract = false;
        },
        // 销售合同明细
        getContractSon() {
            this.submitLoadingContractSon = true;
            this.dialogVisibleContractSon = true;
            const params = {
                current: this.currentPageContractSon,
                size: this.pageSizeContractSon,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'saleNo',
                operation: 'EQ',
                value: this.dialogForm[1].value,
            });
            this.$http.get(`/tallymanager/tallysaleitem/page4TallyDelivery`, { params }).then(res => {
                this.tableDatContractSon = res.data.records;
                this.submitLoadingContractSon = false;
                this.pageTotalContractSon = res.data.total;
            }).catch(() => {
                this.submitLoadingContractSon = false;
            });

        },
        changeCurrentContractSon(val) {
            this.currentPageContractSon = val;
            this.getContractSon();
        },
        changeSizeContractSon(val) {
            this.pageSizeContractSon = val;
            this.currentPageContractSon = 1;
            this.getContractSon();
        },
        handleContractSon(selection) {
            this.multiptionContarctSon = selection;
        },
        getDataDialog() {
            const notesDeliveryNo = this.dialogForm[0].value;
            return this.$http.get(`/tallymanager/tallydeliveryde/getByNotesDeliveryNo/${notesDeliveryNo}`).then(res => {
                this.tableDataDialog = res.data;
                const arr = this.tableDataDialog.map(v => {
                    if (Number(v.deliverableNumber) < Number(v.crtDeliverNumber)) return true;
                    else return false;
                });
                if (arr.includes(true)) this.isSubmit = true;
                else this.isSubmit = false;
            });
        },
        newRowSon() {
            this.dialogSearchFormSon = {};
            this.getContractSon();
        },
        // 新增交货单物料明细
        submitFormContractSon() {
            let newArr = Object.assign([], this.multiptionContarctSon);
            newArr.forEach(v => {
                v.notesDeliveryNo = this.dialogForm[0].value;
            });
            this.$http.post(`/tallymanager/tallydeliveryde/add`, newArr).then(({ code, data }) => {
                this.$message.success('新增成功');
                this.getDataDialog();
                this.dialogVisibleContractSon = false;
            });
        },
        changeCurrentDialog(val) {
            this.currentPageDialog = val;
            this.getDataDialog();
        },
        changeSizeDialog(val) {
            this.pageSizeDialog = val;
            this.currentPageDialog = 1;
            this.getDataDialog();
        },
        selectHandlerSon(selection) {
            this.multiptionSon = selection;
        },
        tableEdit(value, row, head) {
            if (Number(value) <= 0 || isNaN(value)) {
                this.$alert('请输入大于0的数', {
                    type: 'warning',
                });
                return;
            }
            if (this.noteStatus !== '100') {
                this.$alert('提交状态不可修改', {
                    type: 'warning',
                });
                return;
            }
            let obj = Object.assign({}, row);
            obj.crtDeliverNumber = Number(value).toFixed(4);
            return this.$http.put(`/tallymanager/tallydeliveryde/modById`, obj).then(() => {
                this.$message.success('修改成功');
                this.getDataDialog();
                this.currentRowKeyDialog = '';
            });
        },
        delRowSon() {
            const delData = this.multiptionSon.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/tallymanager/tallydeliveryde/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataDialog();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        // 错误行变色
        tableRowClassName({ row, rowIndex }) {
            if (Number(row.deliverableNumber) < Number(row.crtDeliverNumber)) {
                this.isSubmit = true;
                return 'warning-row';
            }
        },
    }
};

</script>
<style lang="stylus" scoped>
.delivery
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
        height 150px!important
        // .warning-row
        //     background oldlace
</style>

