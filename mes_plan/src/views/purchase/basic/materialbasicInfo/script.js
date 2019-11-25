// import dict from '@/utils/dict';
// import { mapState, mapActions } from 'vuex';
import { mapState } from 'vuex';
export default {
    name: 'index',
    data() {
        return {
            tableLoading: false,
            tableData: [],
            searchForm: [{
                label: '料号',
                prop: 'materialCode',
                value: '',
            }],
            // {
            //     label: '物料名称',
            //     prop: 'materialName',
            //     value: '',
            // }
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '料号',
                prop: 'materialCode',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: 'SAP料号',
                prop: 'goodsCode',
            }, {
                label: 'SAP物料名称',
                prop: 'sapName',
            }, {
                label: '库存单位',
                prop: 'stockUnitName',
            }, {
                label: '采购单位',
                prop: 'purchaseUnitName',
            }, {
                label: '入库上限%',
                prop: 'warehousingFloatingMax',
            }, {
                label: '入库下限%',
                prop: 'warehousingFloatingMin',
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '料号',
                prop: 'materialCode',
                value: '',
                option: {},
                type: 'select',
                required: true,
                change: val => {
                    const row = this.treeTableData.find(v => v.materialCode === val);
                    this.dialogForm[1].value = val;
                    this.dialogForm[0].value = row.materialName;
                    this.dialogForm[2].value = row.goodsCode;
                    this.dialogForm[3].value = row.sapName;
                    this.dialogForm[4].value = row.stockUnit;
                    this.dialogForm[5].value = row.stockUnit;
                }
            }, {
                label: 'SAP物料名称',
                prop: 'sapName',
                value: '',
                disabled: true,
            }, {
                label: 'SAP料号',
                prop: 'goodsCode',
                value: '',
                disabled: true,
            }, {
                label: '采购单位',
                prop: 'purchaseUnitId',
                value: '',
                type: 'select',
                option: {},
                required: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                value: '',
                disabled: true,
            }, {
                label: '入库浮动上限%',
                prop: 'warehousingFloatingMax',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数且保留两位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '入库浮动下限%',
                prop: 'warehousingFloatingMin',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数且保留两位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => !this.addDisabled,
                permi: 'purchase_prmaterial_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'purchase_prmaterial_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.deleteDisabled,
                permi: 'purchase_prmaterial_dels',
            }, {
                label: '全部导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                disabled: () => this.DelDisabledParent,
                permi: false,
            }, {
                label: '导出选中',
                click: () => this.selectExport(),
                className: 'iconfont iconstatus-export',
                disabled: () => this.deleteDisabled,
                permi: false,
            }, {
                label: '下载模板',
                click: () => this.moduleDown(),
                className: 'iconfont iconstatus-download',
                permi: false,
            }, {
                label: '导入',
                className: 'iconfont iconstatus-download',
                permi: false,
                action: `/purchase/prmaterial/import`,
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            currentRowKey: '',
            dialogType: '',
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            searchVisible: true,
            multipleSelection: [],
            treeVisible: false,
            treeData: [],
            treeLoading: false,
            treeProps: {
                label: 'materialTypeName',
            },
            treeSelection: '',
            uploadList: [],
            addDisabled: false,
            treeTableData: [],
            conditionList: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        editDisabled() {
            return this.currentRowKey === '';
        },
        deleteDisabled() {
            return this.changeCurrent === '' || this.multipleSelection.length === 0;
        }
    },
    watch: {
        treeSelection: 'queryMaterial',
        dialogVisible(val) {
            if (!val) this.uploadList = [];
        },
    },
    created() {
        this.queryMaterialType();
        this.queryMaterial();
        this.queryUnit();
    },
    methods: {
        /**
         * 获取物料信息树
         */
        queryMaterialType() {
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree').then(({ data }) => {
                this.treeData = data;
            });
        },
        /**
         * 通过类别获取物料信息
         */
        queryMaterialTypeEnd() {
            this.$http.get(`/purchase/prmaterial/getDicBasicMaterialByMaterialTypeCode/${this.treeSelection}`).then(({ data }) => {
                let obj = {};
                const item  = this.dialogForm.find(v => v.prop === 'materialCode');
                data.forEach((item, index) => {
                    obj[item.materialCode] = item.materialCode;
                });
                item.option = obj;
                this.treeTableData = data;
            });
        },
        /**
         * 获取采购单位
         */
        queryUnit() {
            this.$http.get(`/basicdata/dicbasicunit/page`, {
                params: {
                    size: 999,
                    conditionList: [{
                        fieldName: 'isPurchasingUnit',
                        operation: 'EQ',
                        value: 1
                    }]
                }
            }).then(({ data }) => {
                let purchase = this.dialogForm.find(v => v.prop === 'purchaseUnitId');
                data.records.forEach(v => {
                    purchase.option[v.unitCode] = v.unitName;
                });
            });
        },
        search() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.queryMaterial();
        },
        queryMaterial() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: [...this.conditionList],
            };
            if (this.treeSelection === '') {
                this.$http.get('/purchase/prmaterial/page', {
                    params
                }).then(({ data }) => {
                    this.tableLoading = false;
                    this.pageTotal = data.total;
                    this.tableData = data ? data.records : [];
                });
            } else {
                params.conditionList.push({
                    fieldName: 'materialTypeCode',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: this.treeSelection,
                });
                this.$http.get('/purchase/prmaterial/page', {
                    params
                }).then(({ data }) => {
                    this.tableLoading = false;
                    this.pageTotal = data.total;
                    this.tableData = data ? data.records : [];
                }).catch(() => {
                    this.tableLoading = false;
                });
            }
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.queryMaterial();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.queryMaterial();
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            this.dialogForm[6].value = '0';
            this.dialogForm[7].value = '0';
            this.queryMaterialTypeEnd();
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                if (v.prop === 'stockUnit') v.value = item.stockUnitName;
                else v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/purchase/prmaterial/removeByIds', {
                    data: this.multipleSelection,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.queryMaterial();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                if (this.dialogType === 'new' && v.prop === 'purchaseUnitId') {
                    let findKey = (value, compare = (a, b) => a === b) => {
                        return Object.keys(v.option).find(k => compare(v.option[k], value));
                    };
                    obj[v.prop] = findKey(v.value);
                } else {
                    obj[v.prop] = v.value;
                }
            });
            obj.materialTypeCode = this.treeSelection;
            const updata = () => {
                this.$http.post('/purchase/prmaterial/save', obj).then(() => {
                    this.queryMaterial();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                });
            };
            const edit = () => {
                obj.id = this.currentRowKey;
                this.$http.put('/purchase/prmaterial/updateById', obj).then(() => {
                    this.queryMaterial();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.currentRowKey = '';
                });

            };
            this.dialogType === 'new' ? updata() : edit();
        },
        treeChangeHandler(row, node) {
            this.treeSelection = row.materialTypeCode;
            if (row.children.length === 0) this.addDisabled = true;
            else this.addDisabled = false;
        },
        exportAll() {
            // window.open('/purchase/prmaterial/exportAll');
            this.$http.post(`/purchase/prmaterial/exportAll`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料采购信息.xls';
                    $a.click();
                }
            });
        },
        selectExport() {
            // window.open(`/purchase/prmaterial/export?id=${this.multipleSelection}`, '_blank');
            this.$http.post(`/purchase/prmaterial/export`, this.multipleSelection, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料采购信息.xls';
                    $a.click();
                }
            });
        },
        moduleDown() {
            window.open(`/purchase/prmaterial/downloadTemplate`, '_blank');
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        handleSelectionChange(val) {
            this.multipleSelection = val.map(item => item.id);
        },
        successFile(response, file, fileList) {
            const { code, msg } = response;
            if (code === 0) {
                this.$message.success(`导入成功!`);
                this.queryMaterial();
            } else {
                this.$alert(`${msg}`, {
                    type: 'error'
                });
            }
        },
    }
};
