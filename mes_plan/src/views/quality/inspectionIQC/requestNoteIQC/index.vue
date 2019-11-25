<template lang="pug">
    ebrain-main.IQC
        ebrain-frame(
            :title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
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
            :expandVisible="collapse"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            template(#receivingCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="收料凭证物料")
                        el-input(readonly=true :value="value" :disabled="editDisabled")
                            el-button(slot="append" @click="showDialogTable('采购收料凭证')" icon="el-icon-search" :disabled="editDisabled")
            template(#materielCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="物料编号" required=true)
                        el-input(readonly=true :value="value" :disabled="editDisabled || fromRCDisabled")
                            el-button(slot="append" @click="showDialogTable('物料')" icon="el-icon-search" :disabled="editDisabled || fromRCDisabled")
            template(#supplierCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="供应商编号" )
                        el-input(readonly=true :value="value" :disabled="editDisabled || fromRCDisabled")
                            el-button(slot="append" @click="showDialogTable('供应商')" icon="el-icon-search" :disabled="editDisabled || fromRCDisabled")
            template(#customerCode="{value}" v-if="show")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="客户编号")
                        el-input(readonly=true :value="value" :disabled="editDisabled || fromRCDisabled")
                            el-button(slot="append" @click="showDialogTable('客户')" icon="el-icon-search" :disabled="editDisabled || fromRCDisabled")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            :auto-upload="false"
                            :on-change="changeHandler"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            action=""
                            name="fileList"
                            :disabled="uploadDisabled")
                            el-button(
                                type="primary"
                                :disabled="uploadDisabled") 上传附件
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(
                v-if="table_Son"
                title="检验申请明细")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom")
                template(#table)
                    ebrain-table.table_dialog(
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
            :pageTotal="pageTotal_table"
            :visible.sync="dialogVisibleDialogTable"
            highlight-current-row
            @submit="submitFormDialogTable(type)")
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import dict from '@/utils/dict';
import * as _ from 'lodash';
import moment from 'moment';

export default {
    name: 'index',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            conditionList: [],
            fromRCDisabled: false,
            applyId: '',
            show: true,
            editDisabled: false,
            collapse: false,
            table_Son: false,
            isUpload: true,
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
            uploadList: [],
            dialogVisibleWork: false,
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSon: [],
            tableDataWork: [],
            tableColumnParent: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '检验申请单号',
                prop: 'applyCode',
            }, {
                label: '收料凭证号',
                prop: 'receivingCode',
                showOverflowTooltip: true,
            }, {
                label: '检验单号',
                prop: 'checkCode',
                showOverflowTooltip: true,
            }, {
                label: 'IQC申请单来源',
                prop: 'IQCsource',
            }, {
                label: '检验状态',
                prop: 'applyStatus',
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_APPLY_STATUS'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'][cell];
                },
            }, {
                label: '执行决策',
                prop: 'checkOperation',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '采购订单',
                prop: 'ebeln',
                showOverflowTooltip: true,
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
            }, {
                label: '供应商LOT号',
                prop: 'supplierLot',
                showOverflowTooltip: true,
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                label: '净重',
                prop: 'netWeight',
                showOverflowTooltip: true,
            }, {
                label: '库存地点',
                prop: 'lgort',
                showOverflowTooltip: true,
            }, {
                label: '生产日期',
                prop: 'productionTime',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '检验申请单号',
                prop: 'applyCode',
                value: '',
                disabled: true,
                // readonly: true,
                // required: true,
            }, {
                label: '检验类型',
                prop: 'inspectType',
                value: '',
                required: true,
                type: 'select',
                disabled: true,
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                change: val => {
                    this.dialogFormParent[11].show = val !== 'IQC';
                    this.show = val !== 'IQC';
                },
            }, {
                label: '状态',
                prop: 'applyStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_QC_IQC_INSPECT_APPLY_STATUS'],
                disabled: true,
            }, {
                slot: 'receivingCode',
                prop: 'receivingCode',
                value: '',
            }, {
                label: '申请人',
                prop: 'applyMan',
                value: '',
                required: true,
            }, {
                label: '申请时间',
                prop: 'applyTime',
                value: '',
                type: 'datetime',
                required: true,
            }, {
                slot: 'materielCode',
                prop: 'materielCode',
                value: '',
            }, {
                label: '物料名称',
                prop: 'materielName',
                value: '',
                disabled: true,
            }, {
                slot: 'supplierCode',
                prop: 'supplierCode',
                value: '',
                required: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                disabled: true,
            }, {
                slot: 'customerCode',
                prop: 'customerCode',
                value: '',
            }, {
                label: '客户名称',
                prop: 'customerName',
                value: '',
                disabled: true,
            }, {
                label: '送货单号',
                prop: 'deliveryCode',
                value: '',
                required: true,
            }, {
                label: '到货数量',
                prop: 'receivingAmount',
                value: '',
                disabled: true,
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
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea'
            }, {
                slot: 'upload'
            }],
            dialogFormSon: [{
                label: '采购订单',
                prop: 'ebeln',
                value: '',
            }, {
                label: '项目号',
                prop: 'ebelp',
                value: '',
            }, {
                label: '供应商LOT号',
                prop: 'supplierLot',
                value: '',
                required: true,
                change: (val) => {
                    this.dialogFormSon[3].value
                            = val.length > 10
                            ? val.substr(val.length - 10, val.length - 1)
                            : val;
                }
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                value: '',
                required: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '数量',
                prop: 'actualQuantity',
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
                label: '净重',
                prop: 'netWeight',
                required: true,
                value: '',
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
                label: '库存地点',
                prop: 'lgort',
                required: true,
                value: '',
            }, {
                label: '生产日期',
                prop: 'productionTime',
                required: true,
                value: '',
                type: 'datetime',
            }],
            tableColumnPrcertificatedet: [{
                label: '收料凭证号',
                prop: 'prCertificateCode',
                searchBy: true,
            }, {
                label: '料号',
                prop: 'materialCode',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '供应商编码',
                prop: 'lifnr',
            }, {
                label: '供应商名称',
                prop: 'sortl',
            }, {
                label: '送货单号',
                prop: 'ebeln'
            }, {
                label: '收料人',
                prop: 'createBy',
            }, {
                label: '采购收货计划编号',
                prop: 'prPlanCode',
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
                label: 'SAP料号',
                prop: 'goodsCode',
            }, {
                label: 'SAP名称',
                prop: 'sapName',
            }, {
                label: '主要来源',
                prop: 'mainSource',
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                }
            }, {
                label: '库存单位',
                prop: 'stockUnit',
            }, {
                label: '物料规格',
                prop: 'spec',
            }, {
                label: '物料类别',
                prop: 'materialCatogary',
            }, {
                label: '属性类别',
                prop: 'attributeType',
                formatter: (row, column, cell) => {
                    return this.storeDict['material_attri'][cell];
                }
            }, {
                label: '材料类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.materialType[cell];
                }
            }, {
                label: '快捷码',
                prop: 'shortcutCode',
            }, {
                label: '物料状态',
                prop: 'materialState',
                formatter(row, column, cell) {
                    return dict.materialState[cell];
                }
            }, {
                label: '数据来源',
                prop: 'isAuto',
                formatter(row, column, cell) {
                    return dict.dataSource[cell];
                }
            }, {
                label: '备注',
                prop: 'remarks',
            }],
            tableColumnSupplier: [{
                label: '供应商编号',
                prop: 'supplierCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '供应商状态',
                prop: 'status',
                formatter(row, column, cell) {
                    return dict.supplier_status[cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '来源',
                prop: 'source',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.source[cell];
                },
            }],
            tableColumnClient: [{
                label: '客户编号',
                prop: 'kunnr',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            unitCode_: '',
            unitName_: '',
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogParent: 'new',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            processCode: '',
            row: [],
            subId: false,
            workCenter: '',
            pageTotal_down: 0,
            pageSize_down: 20,
            currentPage_down: 1,
            businessCode: '',
            businessId: '',
            list: [],
            Ids: [],
            editDis: false,
            isClick: false,
            dialogSaveParent: false,
            tableDataSons: [],
            searchVisible: true,
            dialogSearchForm: {},
            isDelete: false,
            uploadDisabled: false,
            searchForm: [{
                label: '收料凭证号',
                prop: 'receivingCode',
                value: '',
            }, {
                label: '检验申请单号',
                prop: 'applyCode',
                value: '',
            }, {
                label: '检验状态',
                prop: 'applyStatus',
                value: '',
                type: 'select',
                option: '',
            }, {
                label: '检验结果',
                prop: 'checkResult',
                value: '',
                type: 'select',
                option: '',
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
                disabled: () => this.selectionParent.length === 0 || this.isDelete,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_iqcinspectapply_dels',
            }, {
                label: '导出',
                click: () => this.exportParent(),
                disabled: () => !this.isvilatedParent,
                className: 'iconfont iconstatus-Submission',
                permi: false,
            }, {
                label: '生成检验单',
                click: () => this.generateHandler(),
                disabled: () => this.generate,
                className: 'iconfont iconstatus-Submission',
                permi: false,
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
                permi: 'qc_iqcinspectapplydet_add',
                disabled: () => this.newSon || this.isClick,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon || this.isClick,
                className: 'iconfont iconstatus-edit',
                permi: 'qc_iqcinspectapplydet_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.delDisabledSon || this.isClick,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_iqcinspectapplydet_dels',
            }, {
                label: '导出',
                click: () => this.exportSon(),
                disabled: () => this.delDisabledSon || this.isClick,
                className: 'iconfont iconstatus-Submission',
                permi: false,
            }, {
                label: '导入',
                disabled: () => this.newSon || this.isClick,
                className: 'iconfont iconstatus-download',
                action: '/qc/iqcinspectapplydet/importItems/' + this.applyId,
                permi: false,
                showFileList: false,
                onSuccess: this.importSuccess,
                comp: 'ebrain-upload',
            }, {
                label: '下载模板',
                click: () => this.download(),
                disabled: () => !this.currentRowKeySon,
                className: 'iconfont iconstatus-download',
                permi: false,
            }, {
                label: '复制',
                click: () => this.copy(),
                disabled: () => this.editDisabledSon || this.isClick,
                className: 'iconfont iconstatus-download',
                permi: false,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser,
        }),
        generate() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (this.currentRowKeyParent === '' || item.applyStatus !== '1');
        },
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            let hasItem = false;
            let item;
            if (this.dialogParent !== 'new') {
                item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                hasItem = !item || (this.currentRowKeySon === '' || item.applyStatus !== '0');
            } else {
                hasItem = this.currentRowKeySon === '';
            }
            return hasItem || this.fromRCDisabled;
        },
        delDisabledSon() {
            let hasItem = false;
            let item;
            if (this.dialogParent !== 'new') {
                item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                hasItem = !item || (this.selectionSon.length === 0 || item.applyStatus !== '0');
            } else {
                hasItem = this.selectionSon.length === 0;
            }
            return hasItem || this.fromRCDisabled;
        },
        isvilatedParent() {
            return this.selectionParent.length !== 0;
        },
        newSon() {
            const applyCode = this.dialogFormParent.find(v => v.prop === 'applyCode');
            const applyStatus = this.dialogFormParent.find(v => v.prop === 'applyStatus');
            return !(applyCode.value !== '系统自动生成' && applyStatus.value === '0') || this.fromRCDisabled;
        },
        saveDialog() {
            const applyCode = this.dialogFormParent.find(v => v.prop === 'applyCode');
            const applyStatus = this.dialogFormParent.find(v => v.prop === 'applyStatus');
            return applyCode.value !== '系统自动生成' && applyStatus.value === '0';
        },
        dialogParentForm() {
            return this.dialogFormParent[0].value !== '系统自动生成';
        },
        btnsDialog() {
            let arr = [{
                label: '保存',
                click: () => this.saveMsg(),
                className: 'iconfont iconstatus-download',
                disabled: () => this.submitLoading,
                permi: false
            }, {
                label: '取消',
                click: () => this.abolish(),
                className: 'iconfont iconClose-',
                permi: false,
            }, {
                label: '提交',
                click: () => this.submitDialog(),
                className: 'iconfont iconstatus-test',
                disabled: () => this.submitT,
                permi: false,
            }];
            if (this.dialogFormParent[0].value === '系统自动生成') {
                arr[0] = {
                    label: '保存',
                    click: () => this.saveMsg(),
                    className: 'iconfont iconstatus-download',
                    disabled: () => this.submitLoading,
                    permi: false
                };
            } else {
                arr[0] = {
                    label: '修改',
                    click: () => this.editMsg(),
                    disabled: () => this.isClick,
                    className: 'iconfont iconstatus-edit',
                    permi: false,
                };
            }
            return arr;
        },
        submitT() {
            if (this.dialogFormParent[0].value === '系统自动生成') {
                return true;
            } else {
                let item;
                if (this.dialogParent === 'new') {
                    item = this.tableDataParent.find(v => v.id === this.applyId);
                } else if (this.dialogParent === 'edit') {
                    item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                }
                return !item || item.applyStatus === '0' ? false : true;
            }
        },
    },
    watch: {
        tableDataSon(val) {
            let sum = 0;
            val.forEach(item => {
                sum = sum + Number(item.actualQuantity);
            });
            this.dialogFormParent[13].value = sum;
        },
        dialogVisibleDialogTable(val) {
            if (!val) this.dialogSearchForm = {};
        },
        dialogVisibleParent(val) {
            if (!val) {
                this.getDataParent();
                this.isClick = false;
                this.uploadList = [];
                this.subId = false;
            }
        },
    },
    mounted() {
        const arr = [
            this.queryDict('BILL_QC_IQC_INSPECT_APPLY_STATUS'),
            this.queryDict('DIC_IQC_INSPECT_TYPE'),
            this.queryDict('material_attri'),
            this.queryDict('BILL_QC_IQC_INSPECT_APPLY_STATUS'),
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_DET_PASS')
        ];
        Promise.all(arr).then(() => {
            this.searchForm[2].option = this.storeDict['BILL_QC_IQC_INSPECT_APPLY_STATUS'];
            this.searchForm[3].option = this.storeDict['BILL_QC_IQC_INSPECT_CHECK_DET_PASS'];
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        ...mapMutations({
            setState: 'SET_STATE',
        }),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 主表搜索
        search() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        joinType: 'AND',
                        value: v.value,
                    });
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/qc/iqcinspectapply/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records.map(v => {
                    const isSYS = v.applyCode.substr(v.applyCode.length - 3, v.applyCode.length - 1) === 'SYS';
                    const IQCsource = isSYS ? '采购收料' : '人工收料';
                    return { ...v, IQCsource };
                });
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
            this.currentPage = val;
            this.getDataParent();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.refresh();
        },
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.refresh();
        },
        newRowParent() {
            this.isClick = false;
            this.fromRCDisabled = false;
            this.tableDataSon = [];
            this.table_Son = true;
            this.dialogParent = 'new';
            const applyStatus = this.dialogFormParent.find(v => v.prop === 'applyStatus');
            applyStatus.value = '0';
            const applyTime = this.dialogFormParent.find(v => v.prop === 'applyTime');
            applyTime.value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            const applyMan = this.dialogFormParent.find(v => v.prop === 'applyMan');
            applyMan.value = this.userInfo.nickname;
            const inspectType = this.dialogFormParent.find(v => v.prop === 'inspectType');
            inspectType.value = 'IQC';
            this.isUpload = false;
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.editDisabled = false;
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'applyCode' || v.prop === 'materielName' || v.prop === 'supplierName' || v.prop === 'customerName' || v.prop === 'applyStatus' || v.prop === 'inspectType' || v.prop === 'receivingAmount') {
                    v.disabled = true;
                } else {
                    v.disabled = false;
                }
            });
        },
        editRowParent() {
            this.fromRCDisabled = false;
            this.table_Son = true;
            this.dialogParent = 'edit';
            this.isUpload = true;
            this.dialogVisibleParent = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.unitCode_ = item.stockUnitId;
            this.unitName_ = item.stockUnitName;
            // this.dialogVisibleParent = item.applyStatus === '0' ? true : false;
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.editDisabled = false;
            this.uploadDisabled = false;
            if (item.applyStatus === '0' && item.receivingCode) {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'receivingCode' || v.prop === 'remark') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                        this.fromRCDisabled = true;
                    }
                });
                this.dialogFormParent[3].disabled = false;
            } else if (item.applyStatus !== '0' || item.receivingCode) {
                this.isClick = true;
                this.dialogFormParent.forEach(v => {
                    v.disabled = true;
                });
                this.editDisabled = true;
                this.uploadDisabled = true;
            } else {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'applyCode' || v.prop === 'materielName' || v.prop === 'supplierName' || v.prop === 'customerName' || v.prop === 'applyStatus' || v.prop === 'inspectType' || v.prop === 'receivingAmount') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                    }
                });
                // this.editDisabled = false;
            }
            this.getUploadList();
            this.getTableDataSon();
        },
        refresh(val = 1) {
            this.tableLoadingDown = true;
            this.currentRowKeySon = '';
            const params = {
                current: val,
                size: this.pageSize_down,
            };
            params.conditionList = [{
                fieldName: 'prCertificateCode',
                joinType: 'AND',
                operation: 'EQ',
                value: this.dialogFormParent[3].value,
            }];
            // params.conditionList.push({
            //     fieldName: 'matnr',
            //     joinType: 'AND',
            //     operation: 'EQ',
            //     value: this.dialogFormParent[6].value,
            // });
            this.$http.get('/purchase/prcertificatedet/page', { params }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSon = data ? data.records : [];
                this.pageTotal_down = data.total;
                this.pageSize_down = data.size;
                const receivingAmount = this.dialogFormParent.find(v => v.prop === 'receivingAmount');
                receivingAmount.value = _.reduce(this.tableDataSon, function(sum, n) {
                    return sum + n.actualQuantity;
                }, 0);
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        getUploadList() {
            this.$http.get(`/qc/qcfile/getList/${this.businessCode}/${this.businessId}`).then(({ data }) => {
                this.uploadList = data.map(v => ({
                    name: v.fileName,
                    url: v.fileUrl,
                    id: v.id,
                }));
            });
        },
        successHandler(res, file, fileList) {
            const { data } = res;
            file.id = data[0].id;
            file.url = data[0].fileUrl;
        },
        changeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        delRowParent() {
            const hasCG = this.selectionParent.every(v => v.applyStatus === '0');
            if (hasCG) {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete('/qc/iqcinspectapply/removeByIds', {
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
            } else {
                let isCG = this.selectionParent.filter(v => v.applyStatus !== '0');
                isCG = isCG.map(v => v.applyCode);
                this.$alert(`只有草稿状态的记录才能删除，单据号${isCG.join(', ')}不符合删除条件。`, {
                    type: 'error',
                });
            }
        },
        // 上传附件
        uploadAttach(businessId, businessCode) {
            let fd = new FormData();
            if (!this.uploadList.some(v => v.status === 'ready')) return Promise.resolve();
            this.uploadList.forEach(v => {
                if (v.status === 'ready') {
                    fd.append('fileList', v.raw);
                }
            });
            return this.$http.post(`/qc/qcfile/save/${businessCode}/${businessId}`, fd, {
                headers: {
                    contentType: 'multipart/form-data',
                },
            });

        },
        // 保存按钮
        saveParentdialog() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'receivingAmount') obj[v.prop] = Number(v.value);
                else obj[v.prop] = v.value;
            });
            obj.applyMan = this.userInfo.userId;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                obj.list = this.tableDataSon.map(v => ({
                    ebeln: v.ebeln,
                    ebelp: v.ebelp,
                    stockUnit: v.stockUnit,
                    lgort: v.lgort,
                    netWeight: v.netWeight,
                    ntLot: v.ntLot,
                    actualQuantity: v.actualQuantity,
                    productionTime: v.productionTime,
                    supplierLot: v.supplierLot,
                }));
                this.$http.post('/qc/iqcinspectapply/save', obj).then(({ data }) => {
                    this.dialogFormParent.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.applyId = data.id;
                    this.submitLoading = false;
                    this.getTableDataSon();
                    this.uploadAttach(data.id, data.applyCode).then(() => {
                        this.submitLoading = false;
                        this.getDataParent();
                        this.$message({
                            message: '保存成功!',
                            type: 'success',
                        });
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                this.tableDataSon.forEach(item => {
                    delete item.tenantId;
                    delete item.id;
                    delete item.createBy;
                    delete item.createTime;
                    delete item.delFlag;
                    delete item.updateBy;
                    delete item.updateTime;
                });
                obj.list = this.tableDataSon;
                obj.id = this.subId ? this.applyId : this.currentRowKeyParent;
                this.$http.put('/qc/iqcinspectapply/updateById', obj).then(() => {
                    this.uploadAttach(obj.id, obj.applyCode).then(() => {
                        this.submitLoading = false;
                        this.getDataParent();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        // this.dialogVisibleParent = false;
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            // this.getDicbasicunit().then(() => {
            //     this.dialogVisibleSon = true;
            // });
            this.dialogFormSon.forEach(v => {
                if (v.prop === 'ntLot' || v.prop === 'stockUnit') v.disabled = true;
                else v.disabled = false;
            });
            this.dialogFormSon[4].value = this.unitName_;
        },
        editRowSon() {
            this.dialogSon = 'edit';
            this.dialogVisibleSon = true;
            // this.getDicbasicunit().then(() => {
            //     this.dialogVisibleSon = true;
            // });
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
                if (v.prop === 'supplierLot' || v.prop === 'actualQuantity' || v.prop === 'netWeight' || v.prop === 'lgort' || v.prop === 'productionTime') {
                    v.disabled = false;
                } else {
                    v.disabled = true;
                }
            });
            // this.unitCode_ = item.stockUnitId;
            // this.unitName_ = item.row.stockUnit;
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectapplydet/removeByIds', {
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
            // const item = this.dialogFormParent.find(v => v.prop === 'applyCode');
            const params = {
                current: val,
                size: this.pageSize_down,
            };
            if (this.applyId === '') {
                params.conditionList = [{
                    fieldName: 'applyId',
                    operation: 'EQ',
                    value: this.currentRowKeyParent
                }];
            } else {
                params.conditionList = [{
                    fieldName: 'applyId',
                    operation: 'EQ',
                    value: this.applyId
                }];
            }
            this.$http.get(`/qc/iqcinspectapplydet/page`, {
                params
            }).then(({ data }) => {
                this.tableDataSon = data.records;
                this.pageTotal_down = data.total;
                this.pageSize_down = data.size;
            });
        },
        submitFormSon() {
            let obj = {};
            const finish = () => {
                this.getTableDataSon();
                this.dialogVisibleSon = false;
                this.submitLoading = false;
            };
            obj.stockUnit = this.unitName_;
            // const item = this.dialogFormParent.find(v => v.prop === 'applyCode');
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                if (this.applyId !== '') {
                    obj.applyId = this.applyId;
                } else {
                    obj.applyId = this.currentRowKeyParent;
                }
                this.$http.post('/qc/iqcinspectapplydet/save', obj).then(() => {
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
                this.$http.put('/qc/iqcinspectapplydet/updateById', obj).then(() => {
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
        // 父表导出
        exportParent() {
            const selection = this.selectionParent.map(v => v.id);
            const ids = selection.join(',');
            this.$http.get(`/qc/iqcinspectapply/export`, {
                params: {
                    ids,
                },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'IQC检验申请单选中导出.xls';
                    $a.click();
                }
            });
        },
        // 生成检验单
        generateHandler() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.setState({ pageObject: item });
            this.$router.push('/quality/inspectionIQC/detectionIQC');
        },
        // 导入成功触发函数
        importSuccess() {
            this.getTableDataSon();
        },
        // 子表导出
        exportSon() {
            const selection = this.selectionSon.map(v => v.id);
            const ids = selection.join(',');
            this.$http.get(`/qc/iqcinspectapplydet/export`, {
                params: {
                    ids,
                },
                responseType: 'blob'
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'IQC检验申请明细单选中导出.xls';
                    $a.click();
                }
            });
        },
        // 下载模块
        download(row) {
            this.$http.get(`/qc/iqcinspectapplydet/template`, {
                responseType: 'blob'
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = 'IQC检验申请明细单选中导出.xls';
                    $a.click();
                }
            });
        },
        // 复制
        copy() {
            this.dialogSon = 'new';
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
            this.getDicbasicunit().then(() => {
                this.dialogVisibleSon = true;
            });
        },
        // 获取单位表
        getDicbasicunit() {
            return this.$http.get('/basicdata/dicbasicunit/page?size=999').then(res => {
                let son = this.dialogFormSon.find(v => v.prop === 'stockUnit');
                res.data.records.forEach(v => {
                    son.option[v.unitCode] = v.unitName;
                });
            });
        },
        // 弹表刷表
        showDialogTable(type) {
            this.type = type;
            this.dialogVisibleDialogTable = true;
            switch (type) {
                case '采购收料凭证':
                    this.tableColumn_table = this.tableColumnPrcertificatedet;
                    this.getPrcertificatedet();
                    break;
                case '物料':
                    this.tableColumn_table = this.tableColumnMaterielCode;
                    this.getMaterielCode();
                    break;
                case '供应商':
                    this.tableColumn_table = this.tableColumnSupplier;
                    this.getSupplier();
                    break;
                case '客户':
                    this.tableColumn_table = this.tableColumnClient;
                    this.getClient();
                    break;
                default:
                    break;
            }
        },
        // 获取采购收料凭证
        getPrcertificatedet(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_table,
            };
            params.conditionList = [];
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'OR',
                            });
                        }
                    }
                }
            }
            this.dialogTableLoading = true;
            this.$http.get(`/purchase/prcertificatesummary/getPage`, { params }).then(({ code, data }) => {
                this.dialogTableLoading = false;
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
                this.currentPage_table = val;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        // 获取物料表
        getMaterielCode(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_table,
            };
            params.conditionList = [{
                fieldName: 'delFlag',
                value: '0',
                operation: 'EQ',
                joinType: 'AND',
            }, {
                fieldName: 'materialState',
                value: 1,
                operation: 'EQ',
                joinType: 'AND',
            }];
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'OR',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/dicbasicmaterial/page', {
                params
            }).then(({ data }) => {
                const { records } = data;
                this.dialogTableLoading = false;
                this.currentPage_table = val;
                this.pageTotal_table = data.total;
                this.tableData_table = records.map(v => ({
                    ...v,
                    materialCatogary: v.materialTypeCode + v.materialTypeName
                })) || [];
                this.tableData_table = this.tableData_table.filter(v => v.materialState === 1 && v.delFlag !== '1');
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        // 获取供应商
        getSupplier(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_table,
            };
            params.conditionList = [];
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'OR',
                            });
                        }
                    }
                }
            }
            this.dialogTableLoading = true;
            this.$http.get(`/purchase/prsupplierinfo/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
                this.dialogTableLoading = false;
                this.currentPage_table = val;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        // 获取客户
        getClient(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_table,
            };
            params.conditionList = [];
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'OR',
                            });
                        }
                    }
                }
            }
            this.dialogTableLoading = true;
            this.$http.post(`/productionplan/salesplaninfo/listCustom`, {
                params
            }).then(({ code, data }) => {
                this.tableData_table = data.records;
                this.pageTotal_table = data.total;
                this.dialogTableLoading = false;
                this.currentPage_table = val;
            }).catch(() => {
                this.dialogTableLoading = false;
            });
        },
        changeCurrent_table(val) {
            switch (this.type) {
                case '采购收料凭证':
                    this.getPrcertificatedet(val);
                    break;
                case '物料':
                    this.getMaterielCode(val);
                    break;
                case '供应商':
                    this.getSupplier(val);
                    break;
                case '客户':
                    this.getClient(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            switch (this.type) {
                case '采购收料凭证':
                    this.getPrcertificatedet();
                    break;
                case '物料':
                    this.getMaterielCode();
                    break;
                case '供应商':
                    this.getSupplier();
                    break;
                case '客户':
                    this.getClient();
                    break;
                default:
                    break;
            }
        },
        query_table(row) {
            this.row = row;
        },
        submitFormDialogTable(type) {
            if (this.row.length === 0) {
                this.$alert(`请选择${type}信息!`, {
                    type: 'warning'
                });
            } else {
                this.dialogVisibleDialogTable = false;
                switch (type) {
                    case '采购收料凭证':
                        this.dialogFormParent[3].value = this.row.prCertificateCode;
                        this.dialogFormParent[4].value = this.row.createBy;
                        this.dialogFormParent[6].value = this.row.materialCode;
                        this.dialogFormParent[7].value = this.row.materialName;
                        this.dialogFormParent[8].value = this.row.lifnr;
                        this.dialogFormParent[9].value = this.row.sortl;
                        this.dialogFormParent[12].value = this.row.ebeln;
                        this.dialogFormParent[1].value = 'IQC';
                        this.dialogFormParent[11].show = false;
                        this.show = false;
                        this.dialogFormParent[4].disabled = true;
                        this.dialogFormParent[5].disabled = true;
                        this.dialogFormParent[7].disabled = true;
                        this.dialogFormParent[9].disabled = true;
                        this.dialogFormParent[10].disabled = true;
                        this.dialogFormParent[11].disabled = true;
                        this.dialogFormParent[12].disabled = true;
                        this.dialogFormParent[13].disabled = true;
                        this.fromRCDisabled = true;
                        this.refresh();
                        break;
                    case '物料':
                        this.unitCode_ = this.row.stockUnitId;
                        this.unitName_ = this.row.stockUnit;
                        if (this.dialogFormParent[0].value !== '系统自动生成') {
                            let rowObj = this.row;
                            this.$confirm(`将原料号（${this.dialogFormParent[6].value}）修改为新料号（${this.row.materialCode}），将清空原料号（${this.dialogFormParent[6].value}）的检验申请明细，请确认?`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                this.dialogFormParent[6].value = rowObj.materialCode;
                                this.dialogFormParent[7].value = rowObj.materialName;
                                this.tableDataSon = [];
                                this.editMsg();
                            }).catch(() => {
                                this.$message({
                                    type: 'info',
                                    message: '更换已取消'
                                });
                            });
                        } else {
                            this.dialogFormParent[6].value = this.row.materialCode;
                            this.dialogFormParent[7].value = this.row.materialName;
                        }
                        break;
                    case '供应商':
                        this.dialogFormParent[8].value = this.row.supplierCode;
                        this.dialogFormParent[9].value = this.row.supplierName;
                        break;
                    case '客户':
                        this.dialogFormParent[10].value = this.row.kunnr;
                        this.dialogFormParent[11].value = this.row.name1;
                        break;
                    default:
                        break;
                } }
            this.row = [];
        },
        // 删除附件
        removeChangeHandler(file, fileList) {
            if (file.status === 'success') {
                this.$http.delete(`/qc/qcfile/removeById/${file.id}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success('删除成功!');
                    }
                });
            }
        },
        previewChangeHandler(file) {
            if (file.status === 'success') {
                window.open(file.url, '_blank');
            } else if (file.status === 'ready') {
                const f = new FileReader();
                f.addEventListener('load', () => {
                    window.open(f.result, '_blank');
                });
                f.readAsDataURL(file.raw);
            }
        },
        getSelectionParent(selection) {
            this.selectionParent = selection;
            this.isDelete = false;
            this.selectionParent.forEach(item => {
                if (item.applyStatus !== '0') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        getSelectionSon(selection) {
            this.selectionSon = selection;
            this.ids_son = selection.map(v => v.id);
        },
        saveMsg() {
            this.dialogParent = 'new';
            this.saveParentdialog();
            this.subId = true;
        },
        editMsg() {
            this.dialogParent = 'edit';
            this.saveParentdialog();
            this.subId = false;
        },
        abolish() {
            this.dialogVisibleParent = false;
        },
        // 提交按钮
        submitDialog() {
            let id;
            // const item = this.dialogFormParent.find(v => v.prop === 'applyCode');
            if (this.applyId !== '') {
                id = this.applyId;
            } else {
                id = this.currentRowKeyParent;
            }
            this.$http.get(`/qc/iqcinspectapply/getSubmit/${id}`).then(({ data }) => {
                this.$message.success('提交成功!');
                this.dialogVisibleParent = false;
                // this.getDataParent();
            });
        },
        // 表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case '采购收料凭证':
                    this.getPrcertificatedet();
                    break;
                case '物料':
                    this.getMaterielCode();
                    break;
                case '供应商':
                    this.getSupplier();
                    break;
                case '客户':
                    this.getClient();
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
    // height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0
</style>
