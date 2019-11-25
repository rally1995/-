<template lang="pug">
    ebrain-main.purchase
        ebrain-frame.halfHeight(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchTopVisible}")
                    ebrain-search(
                        :form="searchTopForm"
                        @search="searchParent"
                        @reset="resetTop")
            template(#table)
                ebrain-box-table(
                    ref="parentDataTable"
                    :loading='topTableLoading'
                    :page-size='topPageSize'
                    :page-current='topCurrentPage'
                    :page-total='topPageTotal'
                    :data="topTableData"
                    :column="topTableColumn"
                    row-key="id"
                    highlight-current-row
                    @page-change="topChangeCurrent"
                    @size-change='topChangeSize'
                    @selection-change="topSelectChange"
                    @current-change="currentChangeHandler"
                    @row-dblclick="editRowTop")
        ebrain-frame.halfHeight(title="零部件清单")
            template(#tools)
                ebrain-tools(:buttons="btnsUnder")
                .search(
                    :class="{hide:searchUnderVisible}")
                    ebrain-search(
                        :form="searchUnderForm"
                        @search="searchDataSon"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    :loading='underTableLoading'
                    :page-size='underPageSize'
                    :page-current='underCurrentPage'
                    :page-total='underPageTotal'
                    :data="tableUnderData"
                    :column="gatherColumn"
                    highlight-current-row
                    @page-change="bottomChangeCurrent"
                    @size-change='bottomChangeSize')
                    template(#snLotList)
                        el-table-column(
                            label="零部件SN/Lot")
                            template(v-slot="{row}")
                                el-collapse(v-if="row.snLotList && row.snLotList.length>1")
                                    el-collapse-item(:title="row.snLotList && row.snLotList[0]")
                                        div(
                                            v-for="(sn, index) in lo.tail(row.snLotList)"
                                            :key="index") {{sn}}
                                span(v-else) {{row.snLotList && row.snLotList[0]}}
        ebrain-dialog(
            ref="warehousingFrom"
            :expandVisible="collapse"
            :submitLoading='submitLoading'
            :visible.sync="dialogTopVisible"
            :form.sync="dialogTopForm"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#headline)
                .dialog-title
                    ebrain-frame(title="采购入库单")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame.tabs
                template(#tabs)
                    el-tabs(v-model="activeName" type="card")
                        el-tab-pane(label="零部件明细" name="first")
                        el-tab-pane(label="零部件汇总" name="second")
                template(#tools)
                    ebrain-tools(
                        v-if="activeName === 'first'"
                        :buttons="btnsDetailed")
                template(#table)
                    div(style="height:300px")
                        ebrain-box-table(
                            ref="dialogUnderTable"
                            v-if="activeName === 'first'"
                            key="first"
                            :loading="sparePartsLoading"
                            :page-size="detailsPageSize"
                            :page-current="detailsCurrentPage"
                            :page-total="detailsTotal"
                            :data="detailsData"
                            :column="detailsColumn"
                            @page-change="leftChangeCurrent"
                            @size-change="leftChangeSize"
                            @selection-change="leftSelectChange")
                        ebrain-box-table(
                            :columnCheck="false"
                            v-if="activeName === 'second'"
                            key="second"
                            :table-loading="sparePartsLoading"
                            :page-size="gatherPageSize"
                            :page-current="gatherCurrentPage"
                            :page-total="gatherTotal"
                            :data="gatherData"
                            :column="gatherColumn"
                            @page-change="rightChangeCurrent"
                            @size-change="rightChangeSize")
                            template(#snLotList)
                                el-table-column(
                                    label="零部件SN/Lot")
                                    template(v-slot="{row}")
                                        el-collapse(v-if="row.snLotList && row.snLotList.length>1")
                                            el-collapse-item(:title="row.snLotList && row.snLotList[0]")
                                                div(
                                                    v-for="(sn, index) in lo.tail(row.snLotList)"
                                                    :key="index") {{sn}}
                                        span(v-else) {{row.snLotList && row.snLotList[0]}}
        ebrain-dialog(
            ref="detailFrom"
            :submitLoading='submitLoading'
            :visible.sync="detailedVisible"
            :form.sync="detailedForm"
            @submit="submitForm")
            template(#sparePartNum="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="零部件编号" required=true)
                        el-input(style="cursor:pointer"  readonly=true :value="value" :disabled="isClickType")
                            el-button(slot="append" @click="getPartsNo()" :disabled="isClickType"  icon="iconfont iconsearch")
            template(#headline)
                .dialog-title
                    ebrain-frame(title="添加明细")
        ebrain-dialog-table(
            height="50vh"
            :column="partsNoColumn"
            :data="partsNoData"
            :submitLoading="submitLoading"
            :visible.sync="partsNoVisible"
            :page-size="partsNoPageSize"
            :current-page="partsNoCurrentPage"
            :page-total="partsNoPageTotal",
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @search="searchType"
            @resetDialog="resetType"
            @row-click="getMeg"
            @submit="submitFormTable"
            dialogTableSearch)
        ebrain-dialog-import(
            :visible.sync="importVisible"
            accept="xls,xlsx"
            download-url="/devicemanager/sparepartspurchaselist/template"
            :import-url="'/devicemanager/sparepartspurchaselist/importItems/'+newSaveId"
            download-filename="零部件信息.xlsx"
            :import-success="importSuccessHandler")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import * as _ from 'lodash';

export default {
    name: 'purchase',
    data() {
        return {
            conditionList: [],
            'lo': _,
            partsId: '',
            importVisible: false,
            btnsTop: [{
                label: '新增',
                click: () => this.newRowTop(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_sparepartspurchase_add',
            }, {
                label: '修改',
                click: () => this.editRowTop(this.selectionTop[0]),
                disabled: () => this.selectionTop.length !== 1 || this.selectionTop.some(v => v.status === '1'),
                className: 'iconfont iconstatus-edit',
                permi: 'devicemanager_sparepartspurchase_edit'
            }, {
                label: '删除',
                click: () => this.delRowTop(),
                disabled: () => this.delDataParent,
                className: 'iconfont iconstatus-delete',
                permi: 'devicemanager_sparepartspurchase_dels'
            }, {
                label: '查看',
                click: () => this.viewTop(this.selectionTop[0]),
                disabled: () => this.selectionTop.length !== 1,
                className: 'iconfont iconsee',
                permi: false,
            }, {
                label: '搜索',
                click: () => {
                    this.searchTopVisible = !this.searchTopVisible;
                },
                className: 'iconfont iconsearch fr',
                permi: false
            }],
            dialogParent: '',
            searchTopVisible: true,
            searchTopForm: [{
                label: '入库单号',
                prop: 'storageCode',
                value: '',
            }, {
                label: '入库状态',
                prop: 'status',
                type: 'select',
                option: dict.purchasStatus,
                value: '',
            }],
            dialogSecond: '',
            newSaveId: '',
            topTableLoading: false,
            selectionTop: [],
            topPageTotal: 0,
            topPageSize: 20,
            topCurrentPage: 1,
            topTableData: [],
            topTableColumn: [{
                label: '入库单号',
                prop: 'storageCode',
                showOverflowTooltip: true,
            }, {
                label: '入库时间',
                prop: 'storageTime',
                showOverflowTooltip: true,
            }, {
                label: '业务类型',
                prop: 'businessType',
                showOverflowTooltip: true,
            }, {
                label: '申请人',
                prop: 'applicant',
                showOverflowTooltip: true,
            }, {
                label: '入库状态',
                prop: 'status',
                formatter(row, column, cell) {
                    return dict.purchasStatus[cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            btnsUnder: [{
                label: '搜索',
                click: () => { this.searchUnderVisible = !this.searchUnderVisible },
                className: 'iconfont iconsearch',
                permi: false
            }],
            searchUnderVisible: true,
            searchUnderForm: [{
                label: '零部件编号',
                prop: 'sparePartNum',
                value: ''
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                value: ''
            }],
            row: [],
            dialogSearchForm: {},
            underTableLoading: false,
            selectionUnder: '',
            underPageTotal: 0,
            underPageSize: 20,
            underCurrentPage: 1,
            tableUnderData: [],
            selectionIds: [],
            collapse: false,
            submitLoading: false,
            dialogTopVisible: false,
            dialogTopForm: [{
                label: '入库单号',
                prop: 'storageCode',
                value: '',
                disabled: true,
            }, {
                label: '入库时间',
                prop: 'storageTime',
                type: 'datetime',
                value: '',
                required: true,
            }, {
                label: '业务类型',
                prop: 'businessType',
                value: '',
                required: true
            }, {
                label: '申请人',
                prop: 'applicant',
                value: '',
            }, {
                label: '入库状态',
                prop: 'status',
                value: '',
                type: 'select',
                disabled: true,
                option: dict.purchasStatus,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            activeName: 'first',
            btnsDetailed: [{
                label: '添加',
                click: () => this.newRowDialog(),
                className: 'iconfont iconadd_',
                disabled: () => this.newDetail,
                permi: 'devicemanager_sparepartspurchaselist_add'
            }, {
                label: '删除',
                click: () => this.delRowDialog(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDetail,
                permi: 'devicemanager_sparepartspurchaselist_dels'
            }, {
                label: '修改',
                click: () => this.eidtRowDialog(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDetail,
                permi: 'devicemanager_sparepartspurchaselist_edit'
            }, {
                label: '导入',
                click: () => { this.importVisible = true },
                className: 'iconfont iconstatus-Import',
                disabled: () => this.newDetail,
                permi: false
            }],
            sparePartsLoading: false,
            detailsPageSize: 20,
            detailsCurrentPage: 1,
            detailsTotal: 0,
            detailsColumn: [{
                label: '零部件编号',
                prop: 'sparePartNum',
                showOverflowTooltip: true
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                showOverflowTooltip: true
            }, {
                label: '零部件分类',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true
            }, {
                label: '备件分类',
                prop: 'sparePartProperty',
                formatter: (row, column, cell) => {
                    return this.storeDict['SPARE_PART_TYPE'][cell];
                },
                showOverflowTooltip: true
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true
            }, {
                label: '零部件SN/Lot',
                prop: 'snLot',
                showOverflowTooltip: true
            }, {
                label: '入库数量',
                prop: 'quantity',
                showOverflowTooltip: true
            }, {
                label: '生产日期',
                prop: 'manufactureTime',
                showOverflowTooltip: true
            }],
            selectionLeft: [],
            selectionLeftIds: [],
            detailsData: [],
            gatherPageSize: 20,
            gatherCurrentPage: 1,
            gatherTotal: 0,
            gatherData: [],
            gatherColumn: [{
                label: '零部件编号',
                prop: 'sparePartNum',
                showOverflowTooltip: true
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                showOverflowTooltip: true
            }, {
                label: '零部件分类',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true
            }, {
                label: '备件分类',
                prop: 'sparePartProperty',
                formatter: (row, column, cell) => {
                    return this.storeDict['SPARE_PART_TYPE'][cell];
                },
                showOverflowTooltip: true
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true
            }, {
                slot: 'snLotList',
                prop: 'snLotList',
            }, {
                label: '入库数量',
                prop: 'quantity',
                showOverflowTooltip: true
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true
            }, {
                label: '单价',
                prop: 'unitPrice',
                showOverflowTooltip: true
            }, {
                label: '项目总金额',
                prop: 'total',
                showOverflowTooltip: true
            }],
            detailedVisible: false,
            detailedForm: [{
                slot: 'sparePartNum',
                prop: 'sparePartNum',
                value: '',
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '零部件分类',
                prop: 'sparePartTypeName',
                value: '',
                disabled: true,
            }, {
                label: '备件分类',
                prop: 'sparePartProperty',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['SPARE_PART_TYPE']
            }, {
                label: '单位',
                prop: 'unit',
                value: '',
                disabled: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                disabled: true,
            }, {
                label: '单价',
                prop: 'unitPrice',
                value: '',
                disabled: true,
            }, {
                label: '零部件SN/Lot',
                prop: 'snLot',
                value: '',
                required: true,
            }, {
                label: '生产日期',
                prop: 'manufactureTime',
                value: '',
                type: 'datetime',
                pickerOption: {
                    disabledDate(date) {
                        const calendar = date.getTime();
                        const now = Date.now();
                        return calendar > now;
                    }
                }
            }, {
                label: '数量',
                prop: 'quantity',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^[1-9]\d*$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                return callback(new Error('请输入正整数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }],
            isClickType: false,
            partsNoVisible: false,
            partsNoPageSize: 20,
            partsNoCurrentPage: 1,
            partsNoPageTotal: 0,
            partsNoColumn: [{
                label: 'No',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.partsNoCurrentPage - 1) * this.partsNoPageSize + index + 1;
                },
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '零部件编码',
                prop: 'sparePartNum',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                },
            }, {
                label: '零部件分类',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true,
            }, {
                label: '备件属性',
                prop: 'sparePartProperty',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['SPARE_PART_TYPE'][cell];
                },
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '单价',
                prop: 'unitPrice',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.status[cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            partsNoData: [],
            topRow: {},
        };
    },
    computed: {
        ...mapState({
            sysUser: state => state.sysUser,
            storeDict: state => state.dict,
        }),
        delDataParent() {
            return !this.selectionTop.length || this.selectionTop.some(v => v.status === '1');
        },
        submitDisabled() {
            const storageCode = this.dialogTopForm.find(v => v.prop === 'storageCode');
            const status = this.dialogTopForm.find(v => v.prop === 'status');
            return !(storageCode.value !== '系统自动生成' && status.value === '0') || this.dialog === 'view';
        },
        newDetail() {
            const storageCode = this.dialogTopForm.find(v => v.prop === 'storageCode');
            const status = this.dialogTopForm.find(v => v.prop === 'status');
            return !(storageCode.value !== '系统自动生成' && status.value === '0') || this.dialog === 'view';
        },
        editDetail() {
            let hasItem = false;
            switch (this.dialog) {
                case 'new':
                    hasItem = this.selectionLeft.length !== 1;
                    break;
                case 'edit':
                    hasItem = this.dialogTopForm[4].value === '1' || this.selectionLeft.length !== 1;
                    break;
                case 'view':
                    hasItem = true;
                    break;
                default:
                    break;
            }
            return hasItem;
        },
        delDetail() {
            let hasItem = false;
            switch (this.dialog) {
                case 'new':
                    hasItem = this.selectionLeft.length === 0;
                    break;
                case 'edit':
                    hasItem = this.dialogTopForm[4].value === '1' || this.selectionLeft.length === 0;
                    break;
                case 'view':
                    hasItem = true;
                    break;
                default:
                    break;
            }
            return hasItem;
        },
        btnsDialog() {
            let arr = [{
                label: '保存',
                click: () => this.saveData(),
                disabled: () => this.isClickType,
                className: 'iconfont iconstatus-Preservation-',
                permi: 'devicemanager_sparepartspurchase_add'
            }, {
                label: '提交',
                click: () => this.submitData(),
                className: 'iconfont iconstate-determination',
                disabled: () => this.submitDisabled,
                permi: false,
            }, {
                label: '返回',
                click: () => this.getBack(),
                className: 'iconfont iconstatus-Import',
                permi: false,
            }];
            if (this.dialogTopForm[0].value === '系统自动生成' || this.dialog === 'view') {
                arr[0] = {
                    label: '保存',
                    click: () => this.saveData(),
                    disabled: () => this.isClickType,
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_sparepartspurchase_add',
                };
            } else {
                arr[0] = {
                    label: '保存',
                    click: () => this.editDialog(),
                    disabled: () => this.submitDisabled,
                    className: 'iconfont iconstatus-edit',
                    permi: false,
                };
            }
            return arr;
        }
    },
    watch: {
        dialogTopVisible(val) {
            if (!val) {
                this.newSaveId = '';
                this.detailsCurrentPage = 1;
                this.getDataParent();
                this.detailsData = [];
                this.gatherData = [];
                this.tableUnderData = [];
                this.selectionLeft = [];
                this.selectionLeftIds = [];
                this.$refs.parentDataTable.setCurrentRow();
                this.$refs.parentDataTable.clearSelection();
                this.$refs.dialogUnderTable.clearSelection();
            }
        },
        partsNoVisible(val) {
            if (!val) {
                this.partsNoCurrentPage = 1;
                this.row = [];
            }
        },
        activeName(activeName) {
            switch (activeName) {
                case 'second':
                    this.$refs.dialogUnderTable.clearSelection();
                    this.$refs.dialogUnderTable.setCurrentRow();
                    break;
            }
        }
    },
    mounted() {
        Promise.all([
            this.queryDict('BILL_POSTING_WAREHOUSE_RESULT'),
            this.queryDict('SPARE_PART_TYPE'),
        ]).then(() => {
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 查看
        viewTop(row) {
            this.dialog = 'view';
            this.dialogTopVisible = true;
            this.dialogTopForm.forEach(v => {
                v.value = row[v.prop];
                v.disabled = true;
                this.isClickType = true;
            });
            this.newSaveId = row.id;
            this.getDetail();
            this.getCollect();
        },
        // 上表清空搜索
        resetTop() {
            this.searchTopForm.forEach(item => {
                item.value = '';
            });
        },
        // 下标清空搜索
        reset() {
            this.searchUnderForm.forEach(item => {
                item.value = '';
            });
        },
        // 上表搜索
        searchParent() {
            this.conditionList = [];
            this.searchTopForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND'
                    });
                }
            });
            this.topCurrentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.topTableLoading = true;
            this.$http.get('/devicemanager/sparepartspurchase/page', {
                params: {
                    current: this.topCurrentPage,
                    size: this.topPageSize,
                    conditionList: this.conditionList,
                }
            }).then(res => {
                this.topTableLoading = false;
                this.topTableData = res.data.records;
                this.topPageTotal = res.data.total;
                this.tableUnderData = [];
                this.$refs.parentDataTable.setCurrentRow();
            }).catch(() => {
                this.topTableLoading = false;
            });
        },
        searchDataSon() {
            this.underTableLoading = true;
            this.$http.get('/basicdata/spareparts/page?size=9999', {
                params: {
                    conditionList: [{
                        fieldName: 'sparePartName',
                        operation: 'LIKE',
                        value: this.searchUnderForm[1].value,
                        joinType: 'AND',
                    }, {
                        fieldName: 'sparePartNum',
                        operation: 'LIKE',
                        value: this.searchUnderForm[0].value,
                        joinType: 'AND',
                    }],
                }
            }).then(({ data }) => {
                this.underTableLoading = false;
                const { records } = data;
                const newIds = records.map(v => v.id);
                this.underCurrentPage = 1;
                if (newIds.length) {
                    this.getDataSon(newIds);
                } else {
                    this.tableUnderData = [];
                    this.underPageTotal = 0;
                }
            }).catch(() => {
                this.underTableLoading = false;
            });
        },
        getDataSon(sparePartIds = []) {
            this.underTableLoading = true;
            this.$http.post(`/devicemanager/sparepartspurchaselist/pageByPurchaseId/${this.topRow.id}`,
                sparePartIds,
                {
                    params: {
                        current: this.underCurrentPage,
                        size: this.underPageSize,
                    },
                }).then(res => {
                this.underTableLoading = false;
                this.tableUnderData = res.data.records;
                this.underPageTotal = res.data.total;
            }).catch(() => {
                this.underTableLoading = false;
            });
        },
        // 上表
        topChangeCurrent(val) {
            this.topCurrentPage = val;
            this.getDataParent();
        },
        topChangeSize(val) {
            this.topPageSize = val;
            this.topCurrentPage = 1;
            this.getDataParent();
        },
        // 下表
        bottomChangeCurrent(val) {
            this.underCurrentPage = val;
            this.getDataSon();
        },
        bottomChangeSize(val) {
            this.underPageSize = val;
            this.underCurrentPage = 1;
            this.getDataSon();
        },
        topSelectChange(selection) {
            this.selectionTop = selection;
            this.selectionIds = selection.map(v => v.id);
        },
        // 上表新增
        newRowTop() {
            this.dialog = 'new';
            this.dialogTopVisible = true;
            const status = this.dialogTopForm.find(v => v.prop === 'status');
            status.value = '0';
            const applicant = this.dialogTopForm.find(v => v.prop === 'applicant');
            applicant.value = this.sysUser.nickname;
            const storageCode = this.dialogTopForm.find(v => v.prop === 'storageCode');
            storageCode.value = '系统自动生成';
            this.dialogTopForm.forEach(v => {
                if (v.prop === 'storageCode' || v.prop === 'status') {
                    v.disabled = true;
                } else {
                    v.disabled = false;
                    this.isClickType = false;
                }
            });
        },
        // 上表修改
        editRowTop(row) {
            this.dialog = 'edit';
            this.dialogTopVisible = true;
            this.dialogTopForm.forEach(v => {
                v.value = row[v.prop];
            });
            if (row.status === '1') {
                this.dialogTopForm.forEach(v => {
                    v.disabled = true;
                });
                this.isClickType = true;
            } else {
                this.dialogTopForm.forEach(v => {
                    if (v.prop === 'storageCode' || v.prop === 'status') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                        this.isClickType = false;
                    }
                });
            }
            this.newSaveId = row.id;
            this.getDetail();
            this.getCollect();
        },
        // 上表删除
        delRowTop() {
            this.$confirm('是否删除？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/sparepartspurchase/removeByIds', {
                    data: this.selectionIds
                }).then(() => {
                    this.submitLoading = false;
                    this.tableDataSon = [];
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.$refs.parentDataTable.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 保存
        saveData() {
            let obj = {};
            this.submitLoading = true;
            this.dialogTopForm.forEach(v => {
                if (v.prop === 'storageCode') obj[v.prop] = '';
                else obj[v.prop] = v.value;
            });
            this.$refs.warehousingFrom.$refs.form.validate(v => {
                if (v) {
                    this.$http.post(`/devicemanager/sparepartspurchase/save`, obj).then(({ data }) => {
                        this.getDataParent();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.submitLoading = false;
                        this.dialogTopForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                        this.newSaveId = data.id;
                        this.dialog = 'edit';
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            });
        },
        // 弹框修改
        editDialog() {
            let obj = {};
            this.submitLoading = true;
            this.dialogTopForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.id = this.newSaveId;
            this.$refs.warehousingFrom.$refs.form.validate(v => {
                if (v) {
                    this.$http.put(`/devicemanager/sparepartspurchase/updateById`, obj).then(res => {
                        this.getDataParent();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogTopForm.forEach(v => {
                            v.value = res.data[v.prop];
                        });
                        this.submitLoading = false;
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            });
        },
        // 提交
        submitData() {
            this.$http.get(`/devicemanager/sparepartspurchase/getSubmit/${this.newSaveId}`).then(({ data }) => {
                this.$message.success('提交成功!');
                this.getDataParent();
                this.dialogTopForm.forEach(v => {
                    v.value = data[v.prop];
                    v.disabled = true;
                });
            });
        },
        // 返回
        getBack() {
            this.dialogTopVisible = false;
        },
        // 获取tab页明细
        getDetail() {
            this.sparePartsLoading = true;
            const params = {
                current: this.detailsCurrentPage,
                size: this.detailsPageSize,
            };
            params.conditionList = [{
                fieldName: 'purchaseId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.newSaveId,
            }];
            this.$http.post(`/devicemanager/sparepartspurchaselist/page`, [], {
                params
            }).then(res => {
                this.sparePartsLoading = false;
                this.detailsData = res.data.records;
                this.detailsTotal = res.data.total;
            }).catch(() => {
                this.sparePartsLoading = false;
            });
        },
        // 获取tab页汇总
        getCollect() {
            let sparePartIds = [];
            const params = {
                current: this.gatherCurrentPage,
                size: this.gatherPageSize,
            };
            this.sparePartsLoading = true;
            this.$http.post(`/devicemanager/sparepartspurchaselist/pageByPurchaseId/${this.newSaveId}`, sparePartIds, {
                params
            }).then(res => {
                this.sparePartsLoading = false;
                this.gatherData = res.data.records;
                this.gatherTotal = res.data.total;
            }).catch(() => {
                this.sparePartsLoading = false;
            });
        },
        leftChangeCurrent(val) {
            this.detailsCurrentPage = val;
            this.getDetail();
        },
        leftChangeSize(val) {
            this.detailsPageSize = val;
            this.detailsCurrentPage = 1;
            this.getDetail();
        },
        // 弹框新增
        newRowDialog() {
            this.dialogSecond = 'new';
            this.detailedVisible = true;
        },
        // 弹框修改
        eidtRowDialog() {
            this.dialogSecond = 'edit';
            this.detailedVisible = true;
            this.detailedForm.forEach(v => {
                v.value = this.selectionLeft[0][v.prop];
            });
            this.partsId = this.selectionLeft[0].sparePartId;
        },
        // 弹框删除
        delRowDialog() {
            this.$confirm('是否删除？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/devicemanager/sparepartspurchaselist/removeByIds', {
                    data: this.selectionLeftIds
                }).then(() => {
                    this.submitLoading = false;
                    this.tableDataSon = [];
                    this.getDetail();
                    this.getCollect();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.$refs.dialogUnderTable.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitForm() {
            let obj = {};
            this.detailedForm.forEach(v => {
                if (v.prop === 'sparePartNum') obj[v.prop] = this.partsId;
                else obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            obj.purchaseId = this.newSaveId;
            if (this.dialogSecond === 'new') {
                this.$http.post(`/devicemanager/sparepartspurchaselist/save`, obj).then(res => {
                    this.getDetail();
                    this.getCollect();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.detailedVisible = false;
                    this.submitLoading = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.selectionLeftIds[0];
                this.$http.put(`/devicemanager/sparepartspurchaselist/updateById`, obj).then(res => {
                    this.getDetail();
                    this.getCollect();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.detailedVisible = false;
                    this.submitLoading = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        rightChangeCurrent(val) {
            this.gatherCurrentPage = val;
            this.getCollect();
        },
        rightChangeSize(val) {
            this.gatherPageSize = val;
            this.gatherCurrentPage = 1;
            this.getCollect();
        },
        leftSelectChange(selection) {
            this.selectionLeft = selection;
            this.selectionLeftIds = selection.map(v => v.id);
        },
        // 弹表
        getPartsNo() {
            this.partsNoVisible = true;
            const params = {
                current: this.partsNoCurrentPage,
                size: this.partsNoPageSize,
            };
            params.conditionList = [{
                fieldName: 'status',
                joinType: 'AND',
                operation: 'EQ',
                value: '1'
            }];
            this.submitLoading = true;
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
            this.$http.get('/basicdata/spareparts/page', {
                params
            }).then(res => {
                this.submitLoading = false;
                this.partsNoData = res.data.records;
                this.partsNoPageTotal = res.data.total;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        changeCurrent_table(val) {
            this.partsNoCurrentPage = val;
            this.getPartsNo();
        },
        changeSize_table(val) {
            this.partsNoPageSize = val;
            this.partsNoCurrentPage = 1;
            this.getPartsNo();
        },
        getMeg(row) {
            this.row = row;
        },
        submitFormTable() {
            if (this.row.length === 0) {
                this.$alert('请选择零部件信息!', {
                    type: 'warning'
                });
            } else {
                this.partsNoVisible = false;
                this.detailedForm[0].value = this.row.sparePartNum;
                this.detailedForm[1].value = this.row.sparePartName;
                this.detailedForm[2].value = this.row.warehouse;
                this.detailedForm[3].value = this.row.sparePartTypeName;
                this.detailedForm[4].value = this.row.sparePartProperty;
                this.detailedForm[5].value = this.row.unitName;
                this.detailedForm[6].value = this.row.specModel;
                this.detailedForm[7].value = this.row.unitPrice;
                this.partsId = this.row.id;
            }
            this.row = [];
        },
        searchType(form) {
            this.dialogSearchForm = form;
            this.partsNoCurrentPage = 1;
            this.getPartsNo();
        },
        resetType(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        currentChangeHandler(row) {
            this.topRow = row;
            row && this.getDataSon();
        },
        importSuccessHandler(response, file) {
            const { code } = response;
            if (code === 0) {
                this.getDataParent();
                this.getDetail();
                this.getCollect();
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
.purchase
    & >>> .fr
        float right

    & >>> .el-collapse-item__header
        height auto
        line-height inherit
        border-bottom none
        color #606266
        font-size 12px
        background-color transparent

    & >>> .el-collapse-item__content
        padding-bottom 0
        color #606266
        font-size 12px
        background-color transparent
        div
            text-align left

    & >>> .el-collapse-item__wrap
        background-color transparent

    & >>> .el-collapse
        border none

.search
  padding 14px 10px
  background #f5f5f5
  overflow hidden
  box-sizing border-box
  transition-duration 0.2s
  height 57px

  &.hide
    padding-top 0
    padding-bottom 0
    height 0

.expand_toggle
    margin-bottom 15px
    cursor pointer
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

.dialog >>>
    .table
        height 100%
        .el-table__body-wrapper
            height 120px
            overflow-y auto

.collapse
    .iconfont
        transform rotate(180deg)

.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
</style>
