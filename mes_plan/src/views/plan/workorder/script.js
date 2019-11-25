import dict from '@/utils/dict';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import EbrainSeniorSearch from '@/components/EbrainSeniorSearch';
import * as _ from 'lodash';
// import { mapActions, mapState } from 'vuex';
export default {
    components: {
        EbrainDialogTable,
        EbrainSeniorSearch
    },
    name: 'workorder',
    data() {
        return {
            searchForm: [{
                label: '生产工单编号',
                prop: 'workerOrderCode',
                value: '',
            }],
            routeCode: '',
            searchVisible: true,
            tableLoadingTop: false,
            dialogParentType: '',
            tableLoadingTopR: false,
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            processName: '',
            submitLoading: false,
            activeName: 'first',            // 选项卡的标识
            tableDataParent: [],            // 存储上表信息
            tableDataSon: [],               // 存储下表信息
            tableDataWork: [],              // 生产订单列表数据
            dialogVisibleWork: false,
            dialogTableVisible: false,
            dialogFormSelect: [],
            addFormData: [],
            equipForm: [],
            currentRowKeyFormSon: '',
            conditionList: [],
            treeProps: {
                label: 'processName',
            },
            // searchForm: [{
            //     label: '工艺名称',
            //     prop: 'processName',
            //     value: '',
            // }, {
            //     label: '工艺编号',
            //     prop: 'processCode',
            //     value: '',
            // }, {
            //     label: '设备编号',
            //     prop: 'equipmentCode',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '设备名称',
            //     prop: 'equipmentName',
            //     showOverflowTooltip: true,
            // }],
            treeSelection: '',
            addDisabled: false,
            tableColumnParent: [{
                label: '生产工单编号',
                prop: 'workerOrderCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心编号',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            }, {
                label: '工单状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.work_order_status[cell];
                },
                option: dict.work_order_status,
            }, {
                label: '单据状态',
                prop: 'orderStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.order_Status[cell];
                },
                option: dict.order_Status,
            }],
            tableColumnSon: [{
                label: '执行工单号',
                prop: 'execOrderNo',
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
                prop: 'prodProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '计划数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }, {
                label: '实际生产数量',
                prop: 'productionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '差额数量',
                prop: 'balance',
                showOverflowTooltip: true,
            }, {
                label: '待分配数量',
                prop: 'waitAllocationQuantity',
                showOverflowTooltip: true,
            }, {
                label: '来源单号',
                prop: 'sourceCode',
                showOverflowTooltip: true,
            }, {
                label: '销售计划号',
                prop: 'docno',
                showOverflowTooltip: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.work_order_status[cell];
                },
            }],
            dialogFormAllotOrder: [{
                label: '数量',
                prop: 'quantity',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d+)?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正确的数值!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }],
            dialogFormWorkOrder: [{
                label: '生产工单编码',
                prop: 'workerOrderCode',
                value: '系统带出',
                disabled: true,
            }, {
                label: '工艺类型',
                prop: 'processName',
                value: '',
                disabled: true,
            }, {
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
                type: 'select',
                option: {},
                required: true,
                change: val => {
                    // const item = this.dialogFormWorkOrder.find(v => v.prop === 'equipmentCode');
                    // item.option = {};
                    // this.dialogFormWorkOrder[4].value = '';
                    // this.dialogFormWorkOrder[5].value = '';
                    const row = this.addFormData.find(v => v.workCenterCode === val);
                    this.dialogFormWorkOrder[2].value = val;
                    this.dialogFormWorkOrder[3].value = row.workCenterName;
                    // this.dialogFormWorkOrder[9].value = row.remark;
                    // this.$http.get(`/productionplan/workerorder/listEquipmentPeByWCCode/${val}`).then(({ code, data }) => {
                    //     let obj = {};
                    //     data.forEach((item, index) => {
                    //         obj[item.equipmentCode] = item.equipmentCode;
                    //     });
                    //     item.option = obj;
                    //     this.equipForm = data;
                    // });
                }
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: '',
                disabled: true,
            }, {
                label: '实际开始时间',
                prop: 'startTime',
                type: 'datetime',
                value: '系统生成',
                disabled: true,
            }, {
                label: '实际结束时间',
                prop: 'endTime',
                type: 'datetime',
                value: '系统生成',
                disabled: true,
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.work_order_status,
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            tableColumnWork: [{           // 下表新增弹出列表
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return index + 1;
                },
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编码',
                prop: 'proProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'needAmount',
                showOverflowTooltip: true,
            }, {
                label: '生产中的数量',
                prop: 'productionInQuantity',
                showOverflowTooltip: true,
            }, {
                label: '已生产的数量',
                prop: 'productionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '待分配数量',
                prop: 'distributableQuantity',
                showOverflowTooltip: true,
            }, {
                label: '已分配的数量',
                prop: 'assignedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '当前进度(%)',
                prop: 'progress',
                showOverflowTooltip: true,
            }, {
                label: '生产订单编号',
                prop: 'prodOrderCode',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.work_order_documentStatus[cell];
                },
            }],
            BOMDetailColumn: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return index + 1;
                }
            }, {
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '物料类型',
                prop: 'materialType',
                showOverflowTooltip: true,
            }, {
                label: '物料类型名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }],
            pageTotal_top: 0,
            pageSize_top: 20,
            currentPage_top: 1,
            pageTotal_left: 0,
            pageSize_left: 20,
            currentPage_left: 1,
            pageSize_form: 20,
            currentPage_form: 1,
            pageTotal_form: 0,
            currentRowKeyParent: '',
            currentRowKeyWorkCenter: '',
            dialogParent: '',
            dialogVisibleAllotOrder: false, // 修改数量弹框
            dialogVisbleParant: false,
            currentRowKeySon: '',
            delSonData: [],
            selectionParentData: [],
            parentRow: {},
            treeData: [],
            addDisabledParent: false,
            detailForm: {},
            workerOrderCode: '',
            BomTableData: [],
            searchColumnParent: [],
            dialogSearchForm: {},
            childrenRow: {},
            parentLight: true,
            tabLoading: false,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => !this.addDisabledParent,
                permi: 'productionplan_workerorder_add',
            }, {
                label: '修改/查看',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'productionplan_workerorder_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.DelDisabledParent,
                permi: 'productionplan_workerorder_dels',
            }, {
                label: '提交生产',
                click: () => this.submitProduct(),
                className: 'iconfont iconstate-determination',
                disabled: true,
                loading: false,
                permi: 'productionplan_workerorder_commit',
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
                permi: 'productionplan_workerorderdet_add',
                disabled: () => this.addDisabledSon,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_workerorderdet_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.DelDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_workerorderdet_dels',
            }, {
                label: '查看详情',
                click: () => this.checkDetail(),
                disabled: () => this.lookDisabled,
                className: 'iconfont iconstatus-edit',
                permi: false,
            }, {
                label: '工单撤回',
                click: () => this.revocation(),
                disabled: () => this.revocationDisabled,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_workerorderdet_recall',
            }]
        };
    },
    computed: {
        editDisabledParent() {
            if (this.dialogParentType === 'new') {
                return false;
            } else {
                const item = this.parentRow;
                return !Object.keys(item).length || item.orderStatus === '1';
            }
        },
        editDisabled() {
            const item = this.parentRow;
            return !Object.keys(item).length;
        },
        DelDisabledParent() {
            const includus = this.selectionParentData.map(v => v.orderStatus);
            return !this.selectionParentData.length || includus.indexOf('1') !== -1;
        },
        editDisabledSon() {
            const item = this.parentRow;
            return this.delSonData.length !== 1 || item.orderStatus === '1';
        },
        lookDisabled() {
            return this.delSonData.length !== 1;
        },
        addDisabledSon() {
            const item = this.parentRow;
            return Object.keys(item).length === 0 || (item && item.orderStatus === '1');
        },
        DelDisabledSon() {
            const includus = this.parentRow;
            return this.delSonData.length === 0 || !includus || (includus && includus.orderStatus === '1');
        },
        revocationDisabled() {
            const item = this.parentRow;
            return this.delSonData.length !== 1 || ((item && item.orderStatus === '0') && this.delSonData[0].status === '1') || ((item && item.orderStatus === '1') && this.delSonData[0].status === '2') || ((item && item.orderStatus === '1') && this.delSonData[0].status === '3') || this.delSonData[0].status === '4';
        }
    },
    watch: {
        treeSelection(val) {
            this.tableDataParent = [];
            this.tableDataSon = [];
            this.tableLoadingTop = true;
            this.getDataParent();
            this.parentRow = {};
            this.childrenRow = {};
            this.btnsTop[3].disabled = true;
        },
        activeName(val) {
            if (val === 'second') this.queryDetail();
        },
        tableDataSon(val) {
            if (val.length !== 0) {
                const item = this.parentRow;
                const isbol = val.every(v => Number(v.quantity) === 0);
                if (!item || item.orderStatus === '1' || isbol) {
                    this.btnsTop[3].disabled = true;
                } else {
                    this.btnsTop[3].disabled = false;
                }
            } else {
                this.btnsTop[3].disabled = true;
            }
        }
    },
    mounted() {
        this.getDataParent();
        this.getTreeList();
    },
    methods: {
        // 获取左边列表
        getTreeList() {
            this.$http.get('/productionplan/ppprocess/getAll').then(res => {
                this.treeData = res.data;
            });
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = row;
                this.getDataSon();
                this.childrenRow = {};
            }
        },
        CurrentChangeSon(row) {
            if (row) {
                this.childrenRow = row;
            }
        },
        // 获取下表工单物料明细
        getDataSon() {
            let conditionList = [];
            this.btnsTop[3].disabled = true;
            this.tableLoadingDownL = true;
            this.workerOrderCode = this.parentRow.workerOrderCode;
            this.tableDataSon = [];
            this.childrenRow = {};
            conditionList.push({
                fieldName: 'workerOrderCode',
                operation: 'EQ',
                joinType: 'AND',
                value: this.parentRow.workerOrderCode,
            });
            this.$http.get('/productionplan/workerorderdet/page', {
                params: {
                    current: this.currentPage_left,
                    size: this.pageSize_left,
                    conditionList,
                }
            }).then(({ data }) => {
                this.tableLoadingDownL = false;
                this.pageTotal_left = data.total;
                this.tableDataSon = data ? data.records.map(v => {
                    return {
                        ...v,
                        balance: Number(v.quantity) - Number(v.productionQuantity),
                    };
                }) : [];
                this.currentRowKeySon = '';
                // this.childrenRow = {};
            }).catch(() => {
                this.tableLoadingDownL = false;
            });
        },
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
            this.tableDataSon = [];
            this.pageSize_left = 20;
            this.currentPage_left = 1;
            this.pageTotal_left = 0;
            this.parentRow = {};
            this.childrenRow = {};
        },
        // 通过类别获取生产订单列表
        getDataParent() {
            this.tableLoadingTop = true;
            this.tableDataParent = [];
            this.parentRow = {};
            this.searchColumnParent = Object.assign([], this.tableColumnParent);
            this.searchColumnParent = _.drop(this.tableColumnParent, 2);
            let params = {
                current: this.currentPage_top,
                size: this.pageSize_top,
                conditionList: [...this.conditionList],
            };
            if (this.treeSelection) {
                params.conditionList.push({
                    fieldName: 'processCode',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: this.treeSelection,
                });
            }
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: encodeURI(v.value),
            //             joinType: 'OR',
            //         });
            //     }
            // });
            this.$http.get('/productionplan/workerorder/page', { params }).then(({ data }) => {
                this.tableLoadingTop = false;
                this.pageTotal_top = data.total;
                this.tableDataParent = data.records;
                // // this.parentRow = {};
                // this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent_top(val) {
            this.currentPage_top = val;
            this.tableDataSon = [];
            // this.parentRow = {};
            this.getDataParent();
        },
        // 改变上表页面数据数时获取的数据
        changeSize_top(val) {
            // this.parentRow = {};
            this.tableDataSon = [];
            this.pageSize_top = val;
            this.currentPage_top = 1;
            this.getDataParent();
        },
        // 改变上表页码时获取的数据
        changeCurrent_left(val) {
            this.currentPage_left = val;
            this.getDataSon();
            // this.childrenRow = {};
        },
        // 改变上表页面数据数时获取的数据
        changeSize_left(val) {
            this.pageSize_left = val;
            this.currentPage_left = 1;
            this.getDataSon();
            // this.childrenRow = {};
        },
        // 弹出表格当前页码
        changeCurrent_form(val) {
            this.currentPage_form = val;
            this.getDataFormDialog();
        },
        // 弹出表格当前页数
        changeSize_form(val) {
            this.pageSize_form = val;
            this.currentPage_form = 1;
            this.getDataFormDialog();
        },
        // 获取下表弹出框列表
        getDataFormDialog() {
            const item = this.parentRow;
            this.tabLoading = true;
            let params = {
                current: this.currentPage_form,
                size: this.pageSize_form,
            };
            if (item) {
                params.conditionList = [{
                    fieldName: 'processCode',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: item.processCode,
                }, {
                    fieldName: 'documentStatus',
                    operation: 'NEQ',
                    joinType: 'AND',
                    value: '4',
                }, {
                    fieldName: 'distributableQuantity',
                    operation: 'GT',
                    joinType: 'AND',
                    value: 0
                }];
            }
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
            this.$http.get('productionplan/ppprodorder/getPagePriorityAscDesc', { params }).then(({ code, data }) => {
                this.tableDataWork = data.records;
                this.pageTotal_form = data.total;
                this.tabLoading = false;
            }).catch(() => {
                this.tabLoading = false;
            });
        },
        // 下表新增页面
        newRowSon() {
            this.dialogVisibleWork = true;
            this.dialogSearchForm = {};
            this.getDataFormDialog();
        },
        // 下表修改页面
        rowDblClickHandler(row, column, e) {
            if (row.orderStatus === '1') return false;
            else this.editRowSon(row);
        },
        editRowSon(row) {
            const item = this.parentRow;
            if (_.isEmpty(row)) this.childrenRow = { ...this.delSonData[0] };
            else this.childrenRow = { ...row };
            if (item.orderStatus !== '1') {
                this.$http.get(`/productionplan/workerorderdet/getById/${this.childrenRow.id}`).then(({ code, data }) => {
                    this.dialogFormAllotOrder.forEach(v => {
                        v.value = data[v.prop];
                    });
                    this.dialogVisibleAllotOrder = true;
                });
            }
        },
        // 上表删除
        delRow() {
            const selectionParentData = this.selectionParentData.map(item => item.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingTop = true;
                this.$http.delete(`/productionplan/workerorder/removeByIds`, {
                    data: selectionParentData,
                }).then(() => {
                    this.tableLoadingTop = false;
                    this.currentPage_top = 1;
                    this.getDataParent();
                    this.selectionParentData = [];
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyParent = '';
                    this.tableDataSon = [];
                }).catch(() => {
                    this.tableLoadingTop = false;
                });
            });
        },
        // 下表删除
        delRowSon() {
            const delSonData = this.delSonData.map(item => item.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDownL = true;
                this.$http.delete(`/productionplan/workerorderdet/removeByIds`, {
                    data: delSonData,
                }).then(({ data, code }) => {
                    if (code === 0) {
                        this.tableLoadingDownL = false;
                        this.getDataSon();
                        this.delSonData = [];
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                    }
                }).catch(() => { this.tableLoadingDownL = false });
            });
        },
        // 下表新增弹出框多选
        selectFormChange(selection) {
            this.dialogFormSelect = selection;
        },
        // 上表多选
        selectionParent(selection) {
            this.selectionParentData = selection;
            // this.parentRow = {};
        },
        //  下表提交修改数据
        submitFormAllotOrder() {
            let quantity = this.dialogFormAllotOrder[0].value;
            const item = this.tableDataSon.find(v => v.id === this.childrenRow['id']);
            if (quantity < 0 || quantity > item.waitAllocationQuantity + item.quantity || parseFloat(quantity).toString() === 'NaN') {
                this.$message.warning('输入的值不正确');
                return;
            }
            this.$http.post(`/productionplan/workerorderdet/updateProdOrderByQuantity/${quantity}`, item).then(({ code, data }) => {
                if (code === 0) {
                    this.submitLoading = true;
                    const quantityAll = Object.assign({}, item);
                    quantityAll.quantity = parseFloat(quantity, 10);
                    this.$http.put(`/productionplan/workerorderdet/updateById`, quantityAll,).then((code, data) => {
                        this.$message.success('修改成功');
                        this.submitLoading = false;
                        this.dialogVisibleAllotOrder = false;
                        this.getDataSon();
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            });
        },
        selection_change(val) {
            this.delSonData = val;
        },
        // 查看详情
        checkDetail() {
            this.dialogTableVisible = true;
            this.queryDetail();
        },
        treeChangeHandler(row, node) {
            this.treeSelection = row.processCode;
            this.processName = row.processName;
            this.addDisabledParent = true;
        },
        submitProduct() {
            const item = { ...this.parentRow };
            const arr = [item.workerOrderCode];
            this.$confirm('是否确认提交生产?', '提示', {
                type: 'warning'
            }).then(() => {
                this.btnsTop[3].loading = true;
                this.$http.post(`/productionplan/workerorder/commitProd`, arr).then(res => {
                    this.$message.success('提交生产成功');
                    this.getDataParent();
                    this.getDataSon();
                    this.btnsTop[3].loading = false;
                    this.btnsTop[3].disabled = true;
                    this.parentRow = {};
                    this.childrenRow = {};
                });
            }).catch(() => {
                this.btnsTop[3].loading = true;
            }).catch(() => {
                this.btnsTop[3].loading = true;
            });
        },
        getworkCenter() {
            const item = { ...this.parentRow };
            const treeSelection = this.dialogParentType === 'new' ? this.treeSelection : item.processCode;
            return this.$http.get(`/productionplan/workerorder/listWorkCenter/${treeSelection}`).then(({ data }) => {
                let obj = {};
                const item = this.dialogFormWorkOrder.find(v => v.prop === 'workCenterCode');
                data.forEach((item, index) => {
                    obj[item.workCenterCode] = item.workCenterCode;
                });
                item.option = obj;
                this.addFormData = data;
            });
        },
        newRow() {
            this.dialogVisbleParant = true;
            this.dialogParentType = 'new';
            this.dialogFormWorkOrder[6].value = '1';
            this.dialogFormWorkOrder[0].value = '系统带出';
            this.dialogFormWorkOrder[1].value = this.processName;
            this.getworkCenter().then(() => {
                if (this.addFormData.length !== 0) {
                    this.dialogFormWorkOrder[2].value = this.addFormData[0].workCenterCode;
                    this.dialogFormWorkOrder[3].value = this.addFormData[0].workCenterName;
                }
            });
        },
        editRow(row) {
            this.parentRow = row || this.parentRow;
            this.dialogVisbleParant = true;
            this.dialogParentType = 'edit';
            this.$http.get(`/productionplan/workerorder/getById/${this.parentRow['id']}`).then(({ data }) => {
                this.parentRow = data;
                this.dialogFormWorkOrder.forEach(v => {
                    if (v.prop === 'equipName') {
                        v.value = data['equipmentName'];
                    } else {
                        v.value = data[v.prop];
                    }
                });
            });
            this.getworkCenter();
        },
        // 父表提交
        submitWorkOrder() {
            let obj = {};
            this.dialogFormWorkOrder.forEach(v => {
                obj[v.prop] = v.value;
            });
            delete obj.workerOrderCode;
            // delete obj.status;
            delete obj.startTime;
            delete obj.endTime;
            obj.equipmentName = obj.equipName;
            this.submitLoading = true;
            if (this.dialogParentType === 'new') {
                obj.processCode = this.treeSelection;
                this.$http.post('/productionplan/workerorder/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisbleParant = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                const item = { ...this.parentRow };
                obj.processCode = item.processCode;
                obj.id = item.id;
                this.$http.put('/productionplan/workerorder/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisbleParant = false;
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 下表弹出框提交
        submitDialogFormWork() {
            this.submitLoading = true;
            const item = this.dialogFormSelect.map((item, index) => {
                return Object.assign({}, item, { workerOrderCode: this.workerOrderCode });
            });
            this.$http.post(`/productionplan/workerorderdet/saveProdOrder`, item).then(({ code, data }) => {
                if (code === 0) {
                    this.$message.success('新增成功');
                    this.dialogVisibleWork = false;
                    this.submitLoading = false;
                    this.getDataSon();
                }
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 查询详细工单
        queryDetail() {
            this.$http.get(`/productionplan/workerorderdet/selectOrderDetail/${this.delSonData[0].id}`).then(({ code, data }) => {
                this.detailForm = data;
                this.BomTableData = data.bomVOList;
            });
        },
        tableSearch(val) {
            this.searchForm = val;
            this.getDataParent();
        },
        tableReset() {
            this.searchForm = {};
            this.getDataParent();
        },
        // 列表内搜索
        searchFormWork(form) {
            this.currentPage_form = 1;
            this.dialogSearchForm = form;
            this.getDataFormDialog();
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
        // 工单撤回
        revocation() {
            this.$http.post(`/productionplan/workerorderdet/recall/${this.delSonData[0].id}`).then(({ code }) => {
                if (code === 0) {
                    this.$message.success('工单撤回成功!');
                    this.getDataSon();
                }
            });
        }
    }
};
