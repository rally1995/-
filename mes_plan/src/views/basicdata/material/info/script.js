import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import * as _ from 'lodash';

export default {
    name: 'Role',
    data() {
        return {
            searchObj: {},
            tableLoading: false,
            submitLoading: false,
            dialogVisibleSon: false,
            tableData: [],
            tableColumn: [{
                type: 'selection',
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
                label: '物料类别',
                // prop: 'materialTypeCode',
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
                label: 'MES自动领料',
                prop: 'storageMaterial',
                formatter(row, column, cell) {
                    return dict.isRaire[cell];
                }
            }, {
                label: '选择仓位',
                prop: 'positions',
                formatter: (row, column, cell) => {
                    return this.storeDict['MATERIAL_POSITIONS'][cell];
                }
            }, {
                label: '备注',
                prop: 'remarks',
            }],
            dialogVisible: false,
            uploadExecl: [],
            dialogForm: [{
                label: '料号',
                prop: 'materialCode',
                value: '',
                rule: {
                    required: true,
                    message: '请输入料号'
                },
            }, {
                label: '物料名称',
                prop: 'materialName',
                rule: {
                    required: true,
                    message: '请输入物料名称'
                },
                value: '',
            }, {
                label: 'SAP料号',
                prop: 'goodsCode',
                value: '',
            }, {
                label: 'SAP名称',
                prop: 'sapName',
                value: '',
            }, {
                label: '主要来源',
                prop: 'mainSource',
                value: '',
                type: 'select',
                option: dict.mainSource,
                rule: {
                    required: true,
                    message: '请选择主要来源'
                },
            }, {
                label: '库存单位',
                prop: 'stockUnitId',
                value: '',
                type: 'select',
                option: {},
                rule: {
                    required: true,
                    message: '请选择库存单位'
                },
            }, {
                label: '长',
                prop: 'leng',
                value: '',
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
                label: '宽',
                prop: 'width',
                value: '',
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
                label: '高',
                prop: 'height',
                value: '',
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
                label: '对角线',
                prop: 'diagonal',
                value: '',
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
                label: '厚度',
                prop: 'thickNess',
                value: '',
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
                label: '物料类别',
                prop: 'materialTypeCode',
                value: '',
                type: 'select',
                option: {},
                rule: {
                    required: true,
                    message: '请选择物料类别'
                },
                readonly: true,
                selectSlot: 'materialType',
                change: () => {
                    this.dialogForm[15].value = '1';
                }
            }, {
                label: '属性类别',
                prop: 'attributeType',
                value: '',
                type: 'select',
                option: () => this.storeDict['material_attri'],
            }, {
                label: '材料类型',
                prop: 'materialType',
                value: '',
                type: 'select',
                rule: {
                    required: true,
                    message: '请选择材料类型'
                },
                option: dict.materialType,
            }, {
                label: '快捷码',
                prop: 'shortcutCode',
                value: '',
            }, {
                label: '物料状态',
                prop: 'materialState',
                value: '',
                type: 'select',
                option: dict.materialState,
                disabled: true,
            }, {
                // validator(rule, value, callback) {
                //     const val = Number(value);
                //     if (!_.isNaN(val)) {
                //         if (value > 0)
                //     }
                // },
                rule: [{
                    validator(rule, value, callback) {
                        const val = Number(value);
                        if ((val > 0 && _.isInteger(val)) || value === '' || value === null) {
                            callback();
                        } else {
                            callback(new Error('请输入正整数或者不填'));
                        }
                    },
                    trigger: 'blur',
                }],
                label: '保质期',
                prop: 'expirationTime',
                value: '',
                slot: 'expirationTime',
            }, {
                label: '数据来源',
                prop: 'isAuto',
                value: '',
                type: 'select',
                disabled: true,
                option: dict.dataSource,
            }, {
                label: 'MES自动领料',
                prop: 'storageMaterial',
                value: '',
                type: 'select',
                option: dict.isRaire,
            }, {
                label: '选择仓位',
                prop: 'positions',
                value: '',
                type: 'select',
                option: () => this.storeDict['MATERIAL_POSITIONS'],
            }, {
                label: '备注',
                prop: 'remarks',
                value: '',
                type: 'textarea',
            }, {
                slot: 'upload',
            }],
            currentRowKey: '',
            dialogType: '',
            pageSize: 20,
            imgUrl: '',
            currentPage: 1,
            pageTotal: 0,
            searchForm: [{
                label: '物料料号',
                prop: 'materialCode',
                value: '',
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
            }],
            treeVisible: false,
            treeData: [],
            treeLoading: false,
            treeProps: {
                label: 'materialTypeName',
            },
            treeSelection: '',
            addDisabled: false,
            selection: [],
            routeCode: '',
            searchVisible: true,
            photo: '',
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicbasicmaterial_add',
                disabled: () => !this.addDisabled,
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicbasicmaterial_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicbasicmaterial_del',
                disabled: () => this.delDisabled,
            }, {
                label: '选中导出',
                click: () => this.selectExport(),
                className: 'iconfont iconstatus-export',
                disabled: () => !this.isvilated,
                permi: 'basicdata_dicbasicmaterial_exportsel',
            }, {
                label: '全部导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'basicdata_dicbasicmaterial_exportall',
            }, {
                label: '下载模版',
                click: () => this.downloadModule(),
                className: 'iconfont iconstatus-download',
                permi: 'basicdata_dicbasicmaterial_downFile',
            }, {
                label: '导入',
                className: 'iconfont iconstatus-download',
                permi: 'basicdata_dicbasicmaterial_import',
                action: '/basicdata/dicbasicmaterial/importData',
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
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
        delDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            // return !item || item.isAuto.toString() === '2' || item.materialState.toString() === '1';
            if (!item) {
                return true;
            } else {
                return item.isAuto === '2';
            }
        },
        isvilated() {
            return this.selection.length !== 0;
        }
    },
    watch: {
        treeSelection: 'queryMaterial',
        dialogVisible(val) {
            if (!val) {
                this.photo = '';
                this.uploadExecl = [];
            }
        },
    },
    created() {
        Promise.all([
            this.queryDict('material_attri'),
            this.queryDict('MATERIAL_POSITIONS'),
            this.queryMaterialType(),
            this.queryUnit(),
            this.queryMaterialTypeEnd()
        ]).then(() => {
            this.queryMaterial();
        });
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        ...mapActions(['queryDict']),
        /**
         * 获取物料类别树
         */
        queryMaterialType() {
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree').then(({ data }) => {
                this.treeData = data;
            });
        },
        /**
         * 获取物料类别树末节点
         */
        queryMaterialTypeEnd() {
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeEndList').then(({ data }) => {
                const item  = this.dialogForm.find(v => v.prop === 'materialTypeCode');
                const arr = data.filter(v => v.materialTypeCode !== 'SAP');
                let obj = {};
                arr.forEach(v => {
                    obj[v.materialTypeCode] = v.materialTypeName;
                });
                item.option = obj;
            });
        },
        // 上表搜索
        searchQueryMaterial() {
            this.searchObj = {};
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.searchObj[v.prop] = v.value;
                }
            });
            this.currentPage = 1;
            this.queryMaterial();
        },
        /**
         * 通过类别获取物料信息
         */
        queryMaterial() {
            this.tableLoading = true;
            this.tableData = [];
            if (this.treeSelection) {
                this.currentRowKey = '';
                this.searchObj.materialTypeCode = this.treeSelection;
            }
            this.$http.get('/basicdata/dicbasicmaterial/pageByMaterialType', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchObj,
                }
            }).then(({ data }) => {
                this.tableLoading = false;
                this.pageTotal = data.total;
                const tableData = data ? data.records : [];
                // 在每个表格数据中新增字段materialCatogary(物料类别), 编码和名称的结合
                tableData.forEach(item => {
                    const materialCatogary = Object.assign({}, item, { materialCatogary: item.materialTypeCode + '-' + item.materialTypeName });
                    this.tableData.push({
                        ...materialCatogary
                    });
                });
            });
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
        /**
         * 获取库存单位
         */
        queryUnit() {
            this.$http.get(`/basicdata/dicbasicunit/getDicBasicUnitByType/IS_INVENTORY_UNIT`, {
                params: {
                    size: 999
                }
            }).then(({ data }) => {
                let stockUnit = this.dialogForm.find(v => v.prop === 'stockUnitId');
                data.forEach(v => {
                    stockUnit.option[v.unitCode] = v.unitName;
                });
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
            let item = this.dialogForm.find(v => v.prop === 'materialTypeCode');
            item.value = this.treeSelection;
            let isAuto = this.dialogForm.find(v => v.prop === 'isAuto');
            let materialType = this.dialogForm.find(v => v.prop === 'materialType');
            materialType.value = '0';
            let positions = this.dialogForm.find(v => v.prop === 'positions');
            positions.value = '0';
            isAuto.value = '1';
            let materialState = this.dialogForm.find(v => v.prop === 'materialState');
            materialState.value = '1';
            const newArr = this.dialogForm.filter((item, index) => {
                if (index < 4) {
                    item.disabled = false;
                }
                return item;
            });
            Object.assign(this.dialogForm, newArr);
        },
        editRow() {
            this.$http.get(`/basicdata/dicbasicmaterial/${this.currentRowKey}`).then(({ data }) => {
                this.dialogForm.forEach(v => {
                    v.value = data[v.prop] || '';
                });
                let { photo } = data;
                // const { origin } = window.location;
                this.photo = photo;
                this.dialogType = 'edit';
                this.dialogVisible = true;
                // let isAuto = this.dialogForm.find(v => v.prop === 'isAuto');
                // 修改编码变成中文状态
                let materialState = this.dialogForm.find(v => v.prop === 'materialState');
                let materialTypeCode = this.dialogForm.find(v => v.prop === 'materialTypeCode');
                materialTypeCode.disabled = false;
                materialState.value = String(data.materialState);
                // if (isAuto.value === '1') materialState.value = '1';
                // else materialState.value = '2';
                let materialType = this.dialogForm.find(v => v.prop === 'materialType');
                materialType.value = String(data.materialType);
                const newArr = this.dialogForm.filter((item, index) => {
                    if (index < 4) {
                        item.disabled = true;
                    }
                    return item;
                });
                Object.assign(this.dialogForm, newArr);
            });
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/dicbasicmaterial/removeByIds', {
                    data: [this.currentRowKey],
                }).then(() => {
                    this.submitLoading = false;
                    this.queryMaterial();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        beforeAvatarUpload(file) {
            let isJPG = /^image\//.test(file.type);
            if (!isJPG) {
                this.$message.error('只能上传图片！');
            }
            return isJPG;
        },
        uploadPreview(file) {
            this.imgUrl = file.url;
            this.dialogVisibleSon = true;
            this.$nextTick(() => {
                this.$refs.img.src = file.url;
            });
        },
        downloadFile() {
            window.open(this.imgUrl);
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                if (v.prop === 'expirationTime') {
                    obj.expirationTime = v.value === '' || v.value === null ? null : Number(v.value);
                } else {
                    obj[v.prop] = v.value;
                }
            });
            this.submitLoading = true;
            obj.photo = this.photo;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/dicbasicmaterial', obj).then(() => {
                    this.submitLoading = false;
                    this.queryMaterial();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/dicbasicmaterial', obj).then(() => {
                    this.submitLoading = false;
                    this.queryMaterial();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        treeChangeHandler(row, node) {
            this.searchObj = {};
            this.treeSelection = row.materialTypeCode;
            if (row.children.length === 0 && row.materialTypeCode !== 'SAP') this.addDisabled = true;
            else this.addDisabled = false;
        },
        // 选择导出
        selectExport() {
            // selection为选中的id数组
            const selection = this.selection.map(v => v.id);
            this.$http.post(`/basicdata/dicbasicmaterial/exportListByIds`, selection, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料信息.xls';
                    $a.click();
                }
            });
        },
        // 全部导出
        exportAll() {
            this.$http.post(`/basicdata/dicbasicmaterial/exportAllList`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料信息.xls';
                    $a.click();
                }
            });
        },
        // 下载模块
        downloadModule() {
            this.$http.get('/basicdata/dicbasicmaterial/downloadTemplate', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料信息模版.xls';
                    $a.click();
                }
            });
        },
        // 多选事件
        selectionChangeHandler(selection) {
            this.selection = selection;
        },
        removeChangeHandler() {
            this.photo = '';
        },
        successFile(response, file, fileList) {
            const { code, msg } = response;
            if (code === 0) {
                this.$message.success(`导入成功!`);
            } else {
                this.$alert(`${msg}`, {
                    type: 'error'
                });
            }
        },
        uploadSuccessHandler(response, file, fileList) {
            const { data } = response;
            const { bucketName, fileName } = data;
            this.photo = `/basicdata/dicbasicmaterial/getfile/${bucketName}-${fileName}`;
        }
    }
};
