import dict from '@/utils/dict';
import * as _ from 'lodash';
import moment from 'moment';
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';


export default {
    name: 'index',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            conditionList: [],
            currentRowKeyParent: '',
            prcerCode: '',
            tableLoadingTop: false,
            choosePlay: '',
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            submitLoading: false,
            dialogVisibleDetailed: false,
            showSummary: true,
            currentRowKeySonR: '',
            activeName: 'first',
            tableDataDialog: [],
            tableDataDialogDown: [],
            currentRowKeyDialog: '',
            dialogVisibleSonDown: false,
            currentRowKeyPaly: '',
            tableDataParent: [],
            tableDataSonL: [],
            tableDataSonR: [],
            uploadList: [],
            selectionDownL: [],
            prCertificateCode: '',
            selectionDownR: [],
            list: [],
            currentPageDialog: 1,
            dialogDetailType: '',
            searchVisible: true,
            tableDataError: [],
            dialogVisibleError: false,
            dialogSearchForm: {},
            searchForm: [{
                label: '收货凭证号',
                prop: 'prCertificateCode',
                value: '',
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                value: '',
            }],
            // {
            //     label: '收料时间',
            //     // type: 'datatime',
            //     prop: 'createTime',
            //     value: '',
            // }, {
            //     label: '供应商编码',
            //     prop: 'lifnr',
            //     value: '',
            // }, {
            //     label: '供应商名称',
            //     prop: 'sortl',
            //     value: '',
            // }, {
            //     label: '实际到厂时间',
            //     // type: 'datatime',
            //     prop: 'actuallyTime',
            //     value: '',
            // }, {
            //     label: '单据状态',
            //     prop: 'documentStatus',
            //     value: '',
            //     type: 'select',
            //     option: dict.purchase_documentStatus,
            //     disabled: true,
            // }
            tableColumnDialogDown: [{
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                width: 100
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
                searchBy: true,
                width: 100
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                searchBy: true,
                width: 180
            }, {
                label: '工厂',
                prop: 'werks',
                showOverflowTooltip: true,
            }, {
                label: '库存地点',
                prop: 'lgort',
                showOverflowTooltip: true,
            }, {
                label: 'SAP物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 130
            }, {
                label: 'SAP物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
                width: 150
            }, {
                label: '采购数量（库存单位）',
                prop: 'plannedArrivalQuantity',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: '预计到厂时间',
                prop: 'dueTime',
                showOverflowTooltip: true,
                width: 180
            }, {
                label: '供应商编码',
                prop: 'lifnr',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true,
            }],
            // {
            //     label: '采购数量上限',
            //     prop: 'wfMaxAmount',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '采购数量下限',
            //     prop: 'wfMinAmount',
            //     showOverflowTooltip: true,
            // }
            tableColumnParent: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '收货凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
            }, {
                label: '收料凭证类型',
                prop: 'prCertificateType',
                showOverflowTooltip: true,
            }, {
                label: '收料人',
                prop: 'createBy',
                showOverflowTooltip: true,
            }, {
                label: '收料时间',
                prop: 'createTime',
                showOverflowTooltip: true,
                width: 150,
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
            }, {
                label: '工厂',
                prop: 'werks',
                showOverflowTooltip: true,
            }, {
                label: '供应商编号',
                prop: 'lifnr',
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true,
            }, {
                label: '送货单号',
                prop: 'deliveryCode',
                showOverflowTooltip: true,
            }, {
                label: '库存类型',
                prop: 'stockStatus',
                formatter(row, column, cell) {
                    return dict.InventoryType[cell];
                }
            }, {
                label: '实际到厂时间',
                prop: 'actuallyTime',
                showOverflowTooltip: true,
                width: 150,
            }, {
                // label: '一般贸易',
                // prop: 'generalTradeCode',
                // showOverflowTooltip: true,
                slot: 'enclosure'
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '单据状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.purchase_documentStatus[cell];
                }
            }],
            tableColumnSonL: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                width: 180,
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: '物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: '库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: '计划收货数量',
                prop: 'plannedArrivalQuantity',
                showOverflowTooltip: true,
            }, {
                // label: '附件',
                // prop: 'attachment',
                // showOverflowTooltip: true,
                // slot: 'enclosure'
                slot: 'enclosure'
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                label: '批号汇总数',
                prop: 'summaryQuantity',
                showOverflowTooltip: true,
            }, {
                label: 'IQC检测申请单号',
                prop: 'iqcApplyCode',
                showOverflowTooltip: true,
                width: 150,
            }, {
                label: '单据状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.print_documentStatus[cell];
                }
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'purchase_prcertificate_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'purchase_prcertificate_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledParent,
                permi: 'purchase_prcertificate_dels',
            }, {
                label: '导出列表',
                click: () => this.exportAll(),
                // disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-Export_all',
                permi: 'purchase_prcertificate_exportall',
            }, {
                label: '提交检验',
                click: () => this.submitValit(),
                disabled: () => this.allSubmit,
                loading: false,
                className: 'iconfont iconOrder',
                permi: 'purchase_prcertificate_edit',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            bthDownL: [{
                label: '选择采购收货计划',
                click: () => this.choosePurchasePlay(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstate-determination',
                permi: 'purchase_prcertificate_add',
            }, {
                label: '删除',
                click: () => this.delRowSonL(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledSonL,
                permi: 'purchase_prcertificate_add',
            }],
            btnsDownR: [{
                label: '新增',
                click: () => this.newRowSonR(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'purchase_prcertificatedet_add',
            }, {
                label: '修改',
                click: () => this.editRowSonR(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledSonR,
                permi: 'purchase_prcertificatedet_edit',
            }, {
                label: '删除',
                click: () => this.delRowSonR(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledSonR,
                permi: 'purchase_prcertificatedet_dels',
            }, {
                label: '下载模板',
                click: () => this.moudleDown(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-download',
                permi: false,
            }, {
                label: '导出Execel',
                click: () => this.exportAllSon(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-export',
                permi: 'purchase_prcertificate_edit',
            }, {
                label: '导入',
                className: 'iconfont iconstatus-Import',
                permi: false,
                action: '',
                disabled: () => this.editDisabledParent,
                onSuccess: (response, file, fileList) => this.uploadSuccess(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }],
            title: [{
                name: '总条数',
            }, {
                name: '成功数',
            }, {
                name: '失败数',
            }],
            tableColumnSonR: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '采购收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                width: 180
            }, {
                label: '采购订单',
                prop: 'ebeln',
                showOverflowTooltip: true,
                width: 180
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120
            }, {
                label: '物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
                width: 120
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
                label: '毛重',
                prop: 'grossWeight',
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
                width: 180
            }],
            dialogFormParent: [{
                label: '收货凭证号',
                prop: 'prCertificateCode',
                value: '',
                disabled: true,
                placeholder: '系统生成'
            }, {
                label: '收料凭证类型',
                prop: 'prCertificateType',
                value: '',
                disabled: true,
                placeholder: '系统生成'
            }, {
                label: '收料人',
                prop: 'createBy',
                value: '',
                disabled: true,
            }, {
                label: '收料时间',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                slot: 'search',
                prop: 'ebeln',
                value: '',
            }, {
                label: '工厂',
                prop: 'werks',
                value: '',
                disabled: true
            }, {
                label: '供应商编号',
                prop: 'lifnr',
                value: '',
                disabled: true
            }, {
                label: '供应商名称',
                prop: 'sortl',
                value: '',
                disabled: true,
            }, {
                label: '送货单号',
                prop: 'deliveryCode',
                value: '',
                required: true,
            }, {
                label: '库存类型',
                prop: 'stockStatus',
                type: 'select',
                disabled: true,
                option: dict.InventoryType,
            }, {
                label: '实际到厂时间',
                prop: 'actuallyTime',
                value: '',
                type: 'datetime'
            }, {
                label: '一般贸易',
                prop: 'generalTradeCode',
                value: '',
                placeholder: '填写海关编号',
            }, {
                label: '车牌号',
                prop: 'carNumber',
                value: '',
                required: true,
            }, {
                label: '单据状态',
                prop: 'documentStatus',
                value: '',
                type: 'select',
                option: dict.purchase_documentStatus,
                disabled: true,
            }, {
                slot: 'upload',
            }],
            tableColumnDialog: [{
                label: 'SAP采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                searchBy: true,
                width: 180
            }, {
                label: 'SAP采购日期',
                prop: 'aedat',
                showOverflowTooltip: true,
                width: 180
            }, {
                label: 'SAP供应商编号',
                prop: 'lifnr',
                showOverflowTooltip: true,
                searchBy: true,
                width: 120
            }, {
                label: 'SAP工厂',
                prop: 'werks',
                showOverflowTooltip: true,
            }, {
                label: 'SAP供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true,
            }],
            dialogFormDetailed: [{
                slot: 'detail',
                prop: 'prPlanCode',
                value: '',
                required: true,
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                value: '',
                disabled: true,
            }, {
                label: '项目号',
                prop: 'ebelp',
                value: '',
                disabled: true,
            }, {
                label: '物料编码',
                prop: 'matnr',
                value: '',
                disabled: true,
            }, {
                label: '物料名称',
                prop: 'txz01',
                value: '',
                disabled: true,
            }, {
                label: '库存地点',
                prop: 'lgort',
                value: '',
                required: true,
            }, {
                label: '供应商LOT号',
                prop: 'supplierLot',
                value: '',
                required: true,
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                value: '',
                disabled: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                value: '',
                disabled: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                value: '',
                required: true,
                rule: [{
                    validator(rule, value, callback) {
                        if (!value) callback();
                        const pattern = /^[0-9]+([.]\d{1,4})?$/;
                        if (Number(value) < 0 || !pattern.test(value) || parseFloat(value).toString() === 'NaN') {
                            return callback(new Error('请输入正整数并保留四位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }]
            }, {
                label: '毛重',
                prop: 'grossWeight',
                value: '',
                rule: [{
                    validator(rule, value, callback) {
                        if (!value) callback();
                        const pattern = /^[0-9]+([.]\d{1,4})?$/;
                        if (Number(value) < 0 || !pattern.test(value) || parseFloat(value).toString() === 'NaN') {
                            return callback(new Error('请输入正整数并保留四位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }]
            }, {
                label: '净重',
                prop: 'netWeight',
                value: '',
                rule: [{
                    validator(rule, value, callback) {
                        if (!value) callback();
                        const pattern = /^[0-9]+([.]\d{1,4})?$/;
                        if (Number(value) < 0 || !pattern.test(value) || parseFloat(value).toString() === 'NaN') {
                            return callback(new Error('请输入正整数并保留四位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }]
            }, {
                label: '生产日期',
                prop: 'productionTime',
                type: 'datetime',
                value: '',
                required: true,
            }],
            tableColumnError: [{
                label: '总条数',
                prop: 'sum',
                showOverflowTooltip: true,
            }, {
                label: '成功数',
                prop: 'success',
                showOverflowTooltip: true,
            }, {
                label: '失败数',
                prop: 'fail',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            pageSizeSonDialog: 20,
            pageSizeSonDown: 20,
            currentPageSonDown: 1,
            pageTotalSonDowm: 0,
            currentPage: 1,
            pageTotal: 0,
            pageTotalDialog: 0,
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySonL: '',
            dialogVisibleDialog: false,
            prodOrderCode: '',
            productType: '',
            selection: [],
            sourceCodes: [],
            dialogVisibleEdit: false,
            productionPlanDetailCode: '',
            commissioningType: '',
            selectParent: [],
            pageTotalSonDialog: 0,
            selectDown: [],
            isClick: false,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict
        }),
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !this.currentRowKeyParent || !item || (item && item.documentStatus === 1);
        },
        delDisabledParent() {
            const newArr = this.selectParent.map(v => v.documentStatus);
            return this.selectParent.length === 0 || newArr.includes(1);
        },
        delDisabledSonL() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            // return this.selectionDownL.length === 0 || this.tableDataSonR.length !== 0 || !item || (item && item.documentStatus === 1);
            return this.selectionDownL.length === 0 || !item || (item && item.documentStatus === 1);
        },
        editDisabledSonR() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !this.currentRowKeySonR || !item || (item && item.documentStatus === 1);
        },
        delDisabledSonR() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return this.selectionDownR.length === 0 || !item || (item && item.documentStatus === 1);
        },
        allSubmit() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !(item && item.documentStatus === 0 && this.tableDataSonL.length > 0 && this.tableDataSonR.length > 0);
        },
    },
    watch: {
        activeName(val) {
            if (val === 'first' && this.currentRowKeyParent !== '') this.getDataSon();
            else if (val === 'second' && this.tableDataSonL.length !== 0 && this.currentRowKeyParent !== '') this.getRecdatail();
        },
        dialogVisibleParent(val) {
            if (!val) {
                this.uploadList = [];
                this.getDataSon();
            }
        },
        dialogVisibleDialog(val) {
            if (!val) {
                this.tableDataDialog = [];
                this.currentPageDialog = 1;
                this.pageSizeSonDialog = 20;
            }
        },
        dialogVisibleSonDown(val) {
            if (!val) {
                this.tableDataDialogDown = [];
                this.currentPageSonDown = 1;
                this.pageSizeSonDown = 20;
            }
        },
        dialogVisibleError(val) {
            if (!val) {
                this.tableDataError = [];
            }
        },
    },
    mounted() {
        this.getDataParent();
        this.queryDict('product_type');
    },
    methods: {
        ...mapActions(['queryDict']),
        // 上表查询
        getDataParent(val = 1) {
            const params = {
                conditionList: this.conditionList,
                size: this.pageSize,
                current: val,
            };
            this.tableLoadingTop = true;
            return this.$http.get('/purchase/prcertificate/page', {
                params
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPage = val;
                this.tableDataParent = res.data.records.map(v => {
                    let enclosure = [v.attachment1, v.attachment2, v.attachment3, v.attachment4, v.attachment5];
                    v.enclosure = enclosure.map(h => {
                        if (!_.isEmpty(h)) {
                            return {
                                fileName: h.replace(/.+?@/, ''),
                                url: h,
                            };
                        } else {
                            return {
                                fileName: null,
                                url: null,
                            };
                        }
                    });
                    return {
                        ...v,
                    };
                });
                this.pageTotal = res.data.total;
                this.isClick = false;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        searchData() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getDataParent().then(() => {
                this.searchForm.forEach(v => {
                    if (v.value !== '') {
                        this.isClick = true;
                    }
                });
            });
            this.tableDataSonL = [];
            this.tableDataSonR = [];
        },
        // 点击行查询tab第一栏列表
        getDataSon() {
            if (!this.currentRowKeyParent) return false;
            this.tableLoadingDownL = true;
            const params = {
                size: 999,
            };
            if (this.currentRowKeyParent) {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                if (item.prCertificateCode) {
                    params.conditionList = [{
                        fieldName: 'prCertificateCode',
                        joinType: 'AND',
                        operation: 'EQ',
                        value: item.prCertificateCode
                    }];
                }
            }
            return this.$http.get('/purchase/prcertificatesummary/page', { params }).then(res => {
                this.tableLoadingDownL = false;
                this.tableDataSonL = res.data.records;
                this.tableDataSonL.forEach(v => {
                    if (v.attachment !== null) {
                        let oldArr = v.attachment.split('/');
                        let newArr = oldArr[oldArr.length - 1].split('-');
                        let lastArr = newArr.slice(4).join('');
                        v.fileName = lastArr.substring(16);
                    }
                });
            }).catch(() => {
                this.tableLoadingDownL = false;
            });
        },
        ProSend() {
            this.getDataSon();
            this.getRecdatail();
            this.currentRowKeySonR = '';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.prcerCode = item.prCertificateCode;
            this.btnsDownR[5].action = `/purchase/prcertificatedet/importPurchaseTItems/${this.prcerCode}`;
        },
        changeCurrent(val) {
            this.getDataParent(val);
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrentDialog(val) {
            this.currentPageDialog = val;
            this.getDataParentForm();
        },
        changeSizeSonDialog(val) {
            this.pageSizeSonDialog = val;
            this.currentPageDialog = 1;
            this.getDataParentForm();
        },
        changeCurrentSonDown(val) {
            this.currentPageSonDown = val;
            this.getDataPlay();
        },
        changeSizeSonDown(val) {
            this.pageSizeSonDown = val;
            this.currentPageSonDown = 1;
            this.getDataPlay();
        },
        selectionHandlerDown(select) {
            this.selectDown = select;
        },
        newRowParent() {
            this.tableDataSonL = [];
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统生成';
            this.dialogFormParent[1].value = '采购收料';
            this.dialogFormParent[9].value = 'X';
            this.dialogFormParent[13].value = '0';
            this.dialogFormParent[10].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        editRowParent() {
            this.dialogParent = 'edit';
            this.list = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (this.list['documentStatus'] !== 0) return;
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'documentStatus') v.value = v.option[this.list[v.prop]];
                else v.value = this.list[v.prop];
            });
            // const { origin } = window.location;
            let arr = [];
            const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            for (let i = 0; i < 5; i++) {
                const path = this.list[`attachment${i + 1}`];
                let name = path ? path.match(reg) : '';
                name = String(name);
                if (path) {
                    arr.push({
                        url: path,
                        name
                    });
                }
            }
            this.uploadList = arr;
            this.dialogVisibleParent = true;
        },
        delRowParent() {
            const delData = this.selectParent.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/purchase/prcertificate/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                });
            });
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (this.dialogParent === 'new') {
                    obj[v.prop] = v.value;
                } else {
                    if (v.prop === 'documentStatus') obj[v.prop] = v.option[v.value];
                    else obj[v.prop] = v.value;
                }
            });
            this.uploadList.forEach((v, i) => {
                if (v.response && v.response.data) {
                    const { bucketName, fileName } = v.response.data;
                    obj[`attachment${i + 1}`] = `/purchase/prplandet/getfile/${bucketName}-${fileName}`;
                } else {
                    obj[`attachment${i + 1}`] = v.url;
                }
            });
            for (let i = 0; i < 5; i++) {
                obj[`attachment${i + 1}`] = obj[`attachment${i + 1}`] || '';
            }
            delete obj.prCertificateCode;
            delete obj.createBy;
            delete obj.createTime;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/purchase/prcertificate/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeyParent;
                this.$http.put('/purchase/prcertificate/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        submitValit() {
            this.btnsTop[4].loading = true;
            this.$http.post(`/purchase/prcertificate/commitIQC/${this.currentRowKeyParent}`).then(({ code, data }) => {
                this.$message.success('检验成功');
                this.getDataParent();
                this.getDataSon();
                this.btnsTop[4].loading = false;
            }).catch(() => {
                this.btnsTop[4].loading = false;
            });
        },
        exportAll() {
            const params = {};
            if (this.isClick) {
                this.searchForm.forEach(v => {
                    if (v.prop === 'ebeln') params.ebeln = v.value;
                    else params.prCertificateCode = v.value;
                });
            }
            this.$http.post(`/purchase/prcertificate/exportAllList`, null, { responseType: 'blob', params }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '采料收购凭证.xls';
                    $a.click();
                }
            });
        },
        exportAllSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.post(`purchase/prcertificatedet/exportAllList/${item.prCertificateCode}`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '采料收购凭证明细.xls';
                    $a.click();
                }
            });
        },
        // 获取第二个tab栏列表
        getRecdatail() {
            this.tableLoadingDownR = true;
            const params = {
                size: 999,
            };
            if (this.currentRowKeyParent) {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                this.prCertificateCode = item.prCertificateCode;
                if (item.ebeln) {
                    params.conditionList = [{
                        fieldName: 'prCertificateCode',
                        joinType: 'AND',
                        operation: 'EQ',
                        value: item.prCertificateCode
                    }];
                }
            }
            return this.$http.get('/purchase/prcertificatedet/page', { params }).then(res => {
                this.tableLoadingDownR = false;
                // this.currentPage = val;
                this.tableDataSonR = res.data.records;
                // this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoadingDownR = false;
            });
        },
        delRowSonL() {
            const delData = this.selectionDownL.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/purchase/prcertificatesummary/removeByIds', {
                    data: delData
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySonL = '';
                });
            });
        },
        newRowSonR() {
            this.dialogVisibleDetailed = true;
            this.dialogDetailType = 'new';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormDetailed[12].value = item.createTime;
        },
        editRowSonR() {
            this.dialogVisibleDetailed = true;
            this.dialogDetailType = 'edit';
            this.$http.get(`/purchase/prcertificatedet/getById/${this.currentRowKeySonR}`).then(({ data }) => {
                this.dialogFormDetailed.forEach(v => {
                    v.value = data[v.prop];
                });
            });
        },
        // 明细删除
        delRowSonR() {
            const delData = this.selectionDownR.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDownR = true;
                this.$http.delete('/purchase/prcertificatedet/removeByIds', {
                    data: delData
                }).then(() => {
                    this.tableLoadingDownR = false;
                    this.getRecdatail();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySonR = '';
                });
            });
        },
        // 上表弹出框提交
        submitFormSonDialog() {
            const item = this.tableDataDialog.find(v => v.id === this.currentRowKeyDialog);
            this.dialogFormParent[4].value = item.ebeln;
            this.dialogFormParent[5].value = item.werks;
            this.dialogFormParent[6].value = item.lifnr;
            this.dialogFormParent[7].value = item.sortl;
            this.dialogVisibleDialog = false;
        },
        // 子表修改
        submitFormEdit() {
            this.submitLoading = true;
            let edit = {};
            this.dialogFormEdit.forEach(v => {
                edit[v.prop] = v.value;
            });
            const item = this.tableDataSonL.find(v => v.orderDetId === this.currentRowKeySonL);
            edit.prodOrderCodeDetCode = item.prodOrderCodeDetCode;
            this.$http.put('/productionplan/ppprodorderdet/updateById', edit).then(() => {
                this.submitLoading = false;
                this.getDataSon();
                this.$message({
                    message: '修改成功!',
                    type: 'success'
                });
                this.dialogVisibleEdit = false;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        selectionHandler(selection) {
            this.selection = selection;
        },
        uploadChangeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        changeHanleder(selection) {
            this.currentRowKeyParent = '';
            this.selectParent = selection;
        },
        selectChangeDownL(select) {
            this.selectionDownL = select;
        },
        selectChangeDownR(select) {
            this.selectionDownR = select;
        },
        showParentFrom() {
            this.dialogVisibleDialog = true;
            this.getDataParentForm();
        },
        getDataParentForm() {
            this.submitLoading = true;
            const params = {
                current: this.currentPageDialog,
                size: this.pageSizeSonDialog,
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
            this.$http.get('/purchase/purchaseorder/page', { params }).then(res => {
                this.submitLoading = false;
                this.tableDataDialog = res.data.records;
                this.pageTotalSonDialog = res.data.total;
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.currentPageDialog = 1;
            this.dialogSearchForm = form;
            this.getDataParentForm();
        },
        // 列表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        getDataPlay() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            let params = {
                current: this.currentPageSonDown,
                size: this.pageSizeSonDown,
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.ebelp = this.dialogSearchForm['ebelp'];
                            params.prPlanCode = this.dialogSearchForm['prPlanCode'];
                        }
                    }
                }
            }
            if (this.choosePlay === 'summery') {
                params.ebeln = item.ebeln;
                params.status = 0;
            } else {
                params.certificateCode = item.prCertificateCode;
            }
            this.tableLoading = true;
            return this.$http.get('/purchase/prplandet/pagePrPlanDet', { params }).then(res => {
                this.tableLoading = false;
                this.tableDataDialogDown = res.data.records;
                this.pageTotalSonDowm = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        choosePurchasePlay() {
            this.choosePlay = 'summery';
            this.dialogVisibleSonDown = true;
            this.getDataPlay();
            this.dialogSearchForm = {};
        },
        choosePlayCode() {
            this.choosePlay = 'detail';
            this.dialogVisibleSonDown = true;
            this.getDataPlay();
        },
        // 提交采料收购计划
        submitPurchasePlay() {
            if (!this.dialogVisibleDetailed) {
                // 物料汇总
                const item = this.tableDataDialogDown.find(v => v.id === this.currentRowKeyPaly);
                const itemParent = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                const obj = Object.assign({}, item);
                obj.prCertificateCode = itemParent.prCertificateCode;
                obj.prPlanCode = item.prPlanCode;
                this.submitLoading = true;
                this.$http.post('/purchase/prcertificatesummary/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSonDown = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                // 物料明细
                const item = this.tableDataDialogDown.find(v => v.id === this.currentRowKeyPaly);
                const newArr = this.dialogFormDetailed.slice(0, 6);
                newArr.forEach(v => {
                    v.value = item[v.prop];
                });
                this.dialogFormDetailed[8].value = item.meins1;
                this.dialogVisibleSonDown = false;
            }
        },
        // 明细提交
        submitFormDetailed() {
            let obj = {};
            if (this.dialogDetailType === 'new') {
                const item = this.tableDataDialogDown.find(v => v.id === this.currentRowKeyPaly);
                obj = Object.assign({}, item);
            }
            const item = this.tableDataSonR.find(v => v.id === this.currentRowKeySonR);
            this.dialogFormDetailed.forEach(v => {
                if (typeof (v.value) !== 'undefined') obj[v.prop] = v.value;
                else obj[v.prop] = '';
            });
            const val = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            obj.prCertificateCode = val.prCertificateCode;
            obj.prPlanCode = this.dialogFormDetailed[0].value;
            if (this.dialogDetailType === 'new') {
                this.submitLoading = true;
                this.$http.post(`/purchase/prcertificatedet/save`, obj).then(({ code, data }) => {
                    this.submitLoading = false;
                    this.getRecdatail();
                    this.$message({
                        message: '新增成功',
                        type: 'success'
                    });
                    this.dialogVisibleDetailed = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = item.id;
                this.$http.put(`/purchase/prcertificatedet/updateById`, obj).then(({ code, data }) => {
                    if (code === 0) {
                        this.getRecdatail();
                        this.$message({
                            message: '修改成功',
                            type: 'success',
                        });
                        this.dialogVisibleDetailed = false;
                    }
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
            this.$message.success('删除成功');
        },
        // 明细下载模板
        moudleDown() {
            window.open('/purchase/prcertificatedet/purchaseTemplate');
        },
        // successHandler(res, file, fileList) {
        //     this.$message.success(`上传成功!`);
        // },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },
        searchFormPlay(form) {
            this.changeCurrentSonDown = 1;
            this.dialogSearchForm = form;
            this.getDataPlay();
        },
        uploadSuccess(res, file, fileList) {
            this.getRecdatail();
            const { code, data } = res;
            if (code === 6) {
                this.dialogVisibleError = true;
                this.tableDataError = data;
            }
        },
        resetPlay(form) {
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
