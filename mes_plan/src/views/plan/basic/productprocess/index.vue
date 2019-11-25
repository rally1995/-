<template lang="pug">
    ebrain-main.productprocess
        ebrain-frame(
            title="产品工艺")
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
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRowParent"
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="子件信息")
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
                    @row-dblclick="editRowSon"
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#materialCode)
                el-col(:span="12")
                    el-form-item(label="主件料号" required prop="materialCode")
                        el-input(readonly=true v-model="dialogFormParent[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('materialCode')")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#subMaterialCode)
                el-col(:span="12")
                    el-form-item(label="子件料号" required prop="subMaterialCode")
                        el-input(readonly=true v-model="dialogFormSon[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('subMaterialCode')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="50vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading_table"
            :visible.sync="dialogVisibleTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @current-change="currentChange"
            @submit="submitFormDialogTable(type)")
</template>

<script>
import dict from '@/utils/dict';
import axios from 'axios';
const CancelToken = axios.CancelToken;

export default {
    name: 'workshop',
    data() {
        return {
            conditionList: [],
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            listDetailsColumn: [],
            type: '',
            rowObj: {},
            currentRowKeyDialogTable: '',
            dialogVisibleTable: false,
            submitLoading_table: false,
            ishaschildren: 0,
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            techniqueInfo: [],              // 存储工艺信息
            mterialsInfo: [],               // 存储物料主料
            mterialsInfoSon: [],            // 存储物料子料
            tableDataParent: [],            // 存储上表信息
            tableDataSon: [],               // 存储下表信息
            List: [],                       // 修改页信息
            tableColumnParent: [{
                label: '产品工艺编码',
                prop: 'proProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '主件料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '主件物料名称',
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
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                label: '标准批量',
                prop: 'standardlotSize',
                showOverflowTooltip: true,
            }, {
                label: '标准工时',
                prop: 'standardTime',
                showOverflowTooltip: true,
            }, {
                label: '工艺编码',
                prop: 'processCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺名称',
                prop: 'processName',
                showOverflowTooltip: true,
            }, {
                label: '工艺属性',
                prop: 'processType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.processType[cell];
                },
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
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '投放顺序',
                prop: 'curOrder',
                showOverflowTooltip: true,
            }, {
                label: '子件料号',
                prop: 'subMaterialCode',
                showOverflowTooltip: true,
            }, {
                label: '子件物料名称',
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
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                label: '材料类型',
                prop: 'subMaterialType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.materialType[cell];
                },
            }, {
                label: '组成用量',
                prop: 'quantityPerassembly',
                showOverflowTooltip: true,
            }, {
                label: '耗损率（%）',
                prop: 'shrinkageRate',
                showOverflowTooltip: true,
            }, {
                label: '固定耗损',
                prop: 'fixedloss',
                showOverflowTooltip: true,
            }, {
                label: '位置',
                prop: 'location',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '主件料号',
                prop: 'materialCode',
                slot: 'materialCode',
                value: '',
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '单位',
                prop: 'unitName',
                disabled: true,
                value: '',
            }, {
                label: '规格',
                prop: 'spec',
                disabled: true,
                value: '',
            }, {
                label: '主要来源',
                prop: 'mainSource',
                type: 'select',
                option: dict.mainSource,
                disabled: true,
                value: '',
            }, {
                label: '标准批量',
                prop: 'standardlotSize',
                required: true,
                value: '',
                disabled: true,
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                required: true,
                type: 'select',
                option: dict.status,
                disabled: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^[1-9]\d*$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('只能输入正整数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '标准工时(秒)',
                prop: 'standardTime',
                required: true,
                value: '',
            }, {
                label: '工艺名称',
                prop: 'processName',
                option: {},
                value: '',
                type: 'select',
                nodeKey: 'processCode',
                nodeLabel: 'processName',
                required: true,
                change: val => {
                    const row = this.techniqueInfo.find(v => v.processCode === val);
                    this.dialogFormParent[9].value = val;
                    this.dialogFormParent[10].value = row.processType;
                },
            }, {
                label: '工艺编号',
                prop: 'processCode',
                disabled: true,
                value: '',
            }, {
                label: '工艺属性',
                prop: 'processType',
                disabled: true,
                value: '',
                type: 'select',
                option: dict.processType,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            dialogFormSon: [{
                label: '子件料号',
                prop: 'subMaterialCode',
                slot: 'subMaterialCode',
                value: '',
            }, {
                label: '子件名称',
                prop: 'materialName',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '单位',
                prop: 'unitName',
                value: '',
                disabled: true,
            }, {
                label: '规格',
                prop: 'spec',
                value: '',
                disabled: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                value: '',
                type: 'select',
                option: dict.mainSource,
                disabled: true,
            }, {
                label: '材料类型',
                prop: 'subMaterialType',
                value: '',
                type: 'select',
                option: dict.materialType,
                disabled: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负数且最多四位小数'));
                            } else {
                                this.dialogFormSon[6].value = Number(value).toFixed(4);
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '组成用量',
                prop: 'quantityPerassembly',
                value: '',
                required: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value < 0 || value > 100) {
                            callback(new Error('损耗率值为0-100'));
                        } else if (value === '') {
                            callback();
                        } else {
                            let reg =  /^\d+(\.?\d{0,4})$/;
                            if (!reg.test(value)) {
                                callback(new Error('损耗率最多四位小数'));
                            } else {
                                this.dialogFormSon[7].value = Number(value).toFixed(4);
                                callback();
                            }
                        }
                    },
                    trigger: 'blur',
                },
                label: '损耗率(%)',
                prop: 'shrinkageRate',
                value: '',
                required: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (value !== '') {
                            if (!reg.test(value) || Number(value) > 10000000) {
                                callback(new Error('不大于八位数的非负数且最多四位小数'));
                            } else {
                                this.dialogFormSon[8].value = Number(value).toFixed(4);
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '固定损耗',
                prop: 'fixedloss',
                value: '',
                required: true,
            }, {
                label: '位置',
                prop: 'location',
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^[1-9]+[0-9]*$/;
                        if (Number(value) === 0) {
                            callback();
                        } else if (!reg.test(value)) {
                            callback(new Error('请输入正整数或0'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '投放顺序',
                required: true,
                prop: 'curOrder',
                value: '',
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            routeCode: '',
            searchVisible: true,
            dialogTableLoading: false,
            materialColumn: [{
                label: '主件料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }],
            subMaterialColumn: [{
                label: '物料料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                label: '材料类型',
                prop: 'materialType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.materialType[cell];
                },
            }],
            listDetailsData: [],
            searchForm: [{
                label: '产品工艺编码',
                prop: 'proProcessCode',
                value: '',
            }, {
                label: '主件料号',
                prop: 'materialCode',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_bizppproductprocess_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_bizppproductprocess_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_bizppproductprocess_del',
            }, {
                label: '复制',
                click: () => this.copy(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-copy',
                permi: 'productionplan_bizppproductprocess_copyProductProcess',
            }, {
                label: '启用',
                click: () => this.startUsing(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-start-up',
                permi: 'productionplan_bizppproductprocess_updateStuts',
            }, {
                label: '停用',
                click: () => this.blockUp(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconState-Stop',
                permi: 'productionplan_bizppproductprocess_updateStuts',
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
                permi: 'productionplan_bizppprocesssub_add',
                disabled: () => this.editDisabledParent,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_bizppprocesssub_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_bizppprocesssub_del',
            }],
            topCancel: null,
            bottomCancel: null,
        };
    },
    computed: {
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (item && item.status !== 0);
        },
        editDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return this.ishaschildren === 0 || this.currentRowKeySon === '' || (item && item.status !== 0);
        },
    },
    watch: {
        dialogVisibleTable(val) {
            if (!val) {
                this.pageSize_1 = 20;
                this.currentPage_1 = 1;
                this.pageTotal_1 = 0;
                this.dialogSearchForm = {};
            }
        }
    },
    created() {
        Promise.all([
            this.getTechniqueInfo()
        ]).then(() => {
            this.getDataParent();
        });
    },
    methods: {
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        enterTableDetails(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            switch (type) {
                case 'materialCode':
                    this.listDetailsColumn = this.materialColumn;
                    this.getMterialsInfo();
                    break;
                case 'subMaterialCode':
                    this.listDetailsColumn = this.subMaterialColumn;
                    this.getSubMaterialCodeInfo();
                    break;
                default:
                    break;
            }
        },
        submitFormDialogTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case 'materialCode':
                    this.dialogFormParent[0].value = this.rowObj.materialCode;
                    this.dialogFormParent[1].value = this.rowObj.materialName;
                    this.dialogFormParent[2].value = this.rowObj.unitName;
                    this.dialogFormParent[3].value = this.rowObj.spec;
                    this.dialogFormParent[4].value = this.rowObj.mainSource;
                    break;
                case 'subMaterialCode':
                    this.dialogFormSon[0].value = this.rowObj.materialCode;
                    this.dialogFormSon[1].value = this.rowObj.materialName;
                    this.dialogFormSon[2].value = this.rowObj.unitName;
                    this.dialogFormSon[3].value = this.rowObj.spec;
                    this.dialogFormSon[4].value = this.rowObj.mainSource;
                    this.dialogFormSon[5].value = this.rowObj.materialType.toString();
                    break;
                default:
                    break;
            }
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'materialCode':
                    this.getMterialsInfo(val);
                    break;
                case 'subMaterialCode':
                    this.getSubMaterialCodeInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'materialCode':
                    this.getMterialsInfo();
                    break;
                case 'subMaterialCode':
                    this.getSubMaterialCodeInfo();
                    break;
                default:
                    break;
            }
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'materialCode':
                    this.getMterialsInfo();
                    break;
                case 'subMaterialCode':
                    this.getSubMaterialCodeInfo();
                    break;
                default:
                    break;
            }
            // this.getWorkcenter();
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
        // 获取弹出表  点击时的数据
        currentChange(row) {
            this.rowObj = row;
        },
        // 获取工艺信息
        getTechniqueInfo() {
            this.$http.get('/productionplan/ppprocess/page', {
                params: {
                    size: 999,
                }
            }).then(res => {
                let obj = {};
                const item = this.dialogFormParent.find(v => v.prop === 'processName');
                res.data.records.forEach((item, index) => {
                    obj[item.processCode] = item.processName;
                });
                item.option = obj;
                this.techniqueInfo = res.data.records;
            });
        },
        // 获取工艺主料
        getMterialsInfo(val = 1) {
            this.dialogTableLoading = true;
            const obj = {
                page: {
                    size: this.pageSize_1,
                    current: val,
                }
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/basicdata/dicbasicmaterial/getMaterial', obj).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取工艺子件物料
        getSubMaterialCodeInfo(val = 1) {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const obj = {
                parentMaterialCode: item.materialCode,
                page: {
                    size: this.pageSize_1,
                    current: val,
                }
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.post('/basicdata/dicbasicmaterial/getMaterialZiJian', obj).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取上表信息
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
            this.topCancel && this.topCancel();
            this.$http.get('/productionplan/productprocess/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList
                },
                cancelToken: new CancelToken(c => {
                    this.topCancel = c;
                })
            }).then(res => {
                this.tableLoadingTop = false;
                let datas = res.data.records;
                datas = datas.map(v => ({ ...v, mainSource: String(v.mainSource) }));
                this.tableDataParent = datas;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
                this.topCancel = null;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        // 获取下表信息
        getDataSon() {
            this.currentRowKeySon = '';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);// 获取点击的那一组数据
            this.tableLoadingDown = true;
            this.bottomCancel && this.bottomCancel();
            this.$http.get(
                `/productionplan/processsub/processSub/${item.proProcessCode}`,
                {
                    cancelToken: new CancelToken(c => {
                        this.bottomCancel = c;
                    })
                }
            ).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data;
                this.bottomCancel = null;
            }).then(() => {
                // 判断是否存在子件
                this.$http.get(`/productionplan/productprocess/count/${item.id}`, {
                    params: {
                        id: item.id,
                    }
                }).then(({ code, data }) => {
                    this.ishaschildren = data;
                });
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
        // 上表新增页面
        newRowParent() {
            this.dialogParent = 'new';
            this.getTechniqueInfo();
            // this.getMterialsInfo();
            this.dialogVisibleParent = true;
            this.dialogFormParent[5].value = 1;
            this.dialogFormParent[0].disabled = false;
            this.dialogFormParent[6].value = '0';
        },
        // 上表修改页面
        editRowParent() {
            this.dialogParent = 'edit';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormParent[0].disabled = item.status !== 0 ? true : false;
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogFormParent[6].value = this.dialogFormParent[6].value.toString();
            this.dialogVisibleParent = item.status === 0 ? true : false;
        },
        // 复制
        copy() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.submitLoading = true;
            this.$confirm('是否需要复制', {
                type: 'warning'
            }).then(() => {
                this.$http.post('/productionplan/productprocess/copyProductProcess', null, {
                    params: {
                        id: item.id,
                        remark: item.remark,
                    }
                }).then((res) => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '复制成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 启用
        startUsing() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (this.ishaschildren === 0) {
                this.$confirm('没有子件不能启用/停用', {
                    type: 'warning',
                });
                return;
            }
            if (item.status === 1) {
                this.$message.error('已启用信息无需启用!');
            } else {
                this.$confirm('是否启用？', '提示', {
                    type: 'warning'
                }).then(() => {
                    const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                    this.$http.post('/productionplan/productprocess/updateStuts', null, {
                        params: {
                            proProcessCode: item.proProcessCode,
                            status: 1,
                        },
                    }).then(() => {
                        this.getDataParent();
                    });
                });
            }
        },
        // 停用
        blockUp() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.status === 0) {
                this.$confirm('草稿无须停用，可直接删除。', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    // this.$http.delete('/productionplan/productprocess/removeByIds', {
                    //     data: [this.currentRowKeyParent],
                    this.$http.delete(`/productionplan/productprocess/${this.currentRowKeyParent}`).then(() => {
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
            } else if (item.status === 1) {
                this.$confirm('是否停用？', '提示', {
                    type: 'warning'
                }).then(() => {
                    const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                    this.$http.post('/productionplan/productprocess/updateStuts', null, {
                        params: {
                            proProcessCode: item.proProcessCode,
                            status: 2,
                        },
                    }).then(() => {
                        this.getDataParent();
                    });
                });
            } else {
                this.$confirm('已停用无需再停用。', '提示');
            }
        },
        // 删除上表数据
        delRowParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.status === 0) {
                this.$http.get('/productionplan/productprocess/count/{id}', {
                    params: {
                        id: item.id,
                    }
                }).then(res => {
                    if (res.data > 0) {
                        this.$confirm('有子件信息，是否确认删除?', '提示', {
                            type: 'warning'
                        }).then(() => {
                            this.submitLoading = true;
                            // this.$http.delete('/productionplan/productprocess/removeByIds', {
                            //     data: [this.currentRowKeyParent],
                            this.$http.delete(`/productionplan/productprocess/${this.currentRowKeyParent}`).then(() => { // 单项删除
                                this.submitLoading = false;
                                this.tableDataSon = [];
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
                        this.$confirm('是否确认删除?', '提示', {
                            type: 'warning'
                        }).then(() => {
                            this.submitLoading = true;
                            // this.$http.delete('/productionplan/productprocess/removeByIds', {
                            //     data: [this.currentRowKeyParent],
                            this.$http.delete(`/productionplan/productprocess/${this.currentRowKeyParent}`).then(() => { // 单项删除
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
                    }
                });
            } else {
                this.$confirm('产品工艺已启用/停用,不能删除。', '提示', {
                    type: 'warning'
                });
            }
        },
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop) obj[v.prop] = v.value;
            });
            let copyObj = { ...obj };         // 拷贝obj 删除多余的请求字段
            delete copyObj.materialName;
            delete copyObj.processName;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/productionplan/productprocess', copyObj).then(() => {
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
            } else if (this.dialogParent === 'edit') {
                copyObj.id = this.currentRowKeyParent;
                this.$http.put('/productionplan/productprocess', copyObj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 下表新增页面
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            this.dialogFormSon[7].value = '0.0000';
            this.dialogFormSon[8].value = '0.0000';
        },
        // 下表修改页面
        editRowSon() {
            this.dialogSon = 'edit';
            const Parantitem = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogVisibleSon = Parantitem.status === 0 ? true : false;
            // this.dialogVisibleSon = true;
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
        },
        // 删除下表信息
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                // this.$http.delete('/productionplan/processsub/removeByIds', {
                //     data: [this.currentRowKeySon],
                this.$http.delete(`/productionplan/processsub/${this.currentRowKeySon}`).then(() => {
                    this.getDataSon();
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
        // 提交下表新增或者修改数据
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.curOrder = Number(obj.curOrder);
            if (this.dialogSon === 'new') {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                obj.workCenterCode = item.workCenterCode;
                obj.prodProcessCode = item.proProcessCode;
                this.$http.post('/productionplan/processsub', obj).then(() => {
                    this.getDataSon();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/productionplan/processsub', obj).then(() => {
                    this.getDataSon();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
    }
};
</script>

<style scoped lang="stylus">
.productprocess
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
