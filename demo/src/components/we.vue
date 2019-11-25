<template lang="pug">
    ebrain-main.router
        ebrain-frame(
            :title="$route.name")
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
            title="产品工序信息")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :isShow='false'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    row-key="id"
                    highlight-current-row
                    @selection-change="selectionChange"
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#materialCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="主件料号" required=true)
                        el-input(style="cursor:pointer" :value="value")
                            el-button(slot="append" @click="dialogSearchForm={};openTableDialog()" icon="iconfont iconsearch")
        //- ebrain-dialog(
        //-     :submitLoading='submitLoading'
        //-     :visible.sync="dialogVisibleSon"
        //-     :form.sync="dialogFormSon"
        //-     @submit="submitFormSon")
        ebrain-dialog-table(
            :data="tableDataDialog"
            height="60vh"
            :isShow="false"
            :column="dialogFormSon"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            @select="selectionHandler"
            @submit="submitFormSon"
            :highlight-current-row="false"
            ref="table")
        ebrain-dialog-table.materielCode(
            height="60vh"
            :data="tableDataMaterielCode"
            :column="tableColumnMaterielCode"
            :submitLoading='submitLoading'
            :pageSize="pageSizeM"
            :currentPage="currentPageM"
            @changeCurrent="changeCurrentM"
            @changeSize='changeSizeM'
            @row-click="queryM"
            :pageTotal="pageTotalM"
            :visible.sync="dialogVisibleMaterielCode"
            highlight-current-row
            row-key="id"
            @submit="submitFormMaterielCode"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            dialogTableSearch)
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSonForm"
            :form.sync="dialogFormEdit"
            @submit="submitFormEdit")
</template>

<script>
import dict from '@/utils/dict';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import * as _ from 'lodash';

export default { 
    name: 'index',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_processroute_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'productionplan_processroute_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabledParent,
                permi: 'productionplan_processroute_del',
            }, {
                label: '复制',
                click: () => this.copy(),
                className: 'iconfont iconstatus-copy',
                disabled: () => !this.currentRowKeyParent,
                permi: 'productionplan_processroute_copyProcessRoute',
            }, {
                label: '启用',
                click: () => this.startUp(),
                className: 'iconfont iconstatus-start-up',
                disabled: () => !this.currentRowKeyParent || this.tableDataSon.length === 0,
                permi: 'productionplan_processroute_setEnableRoute',
            }, {
                label: '停用',
                click: () => this.stop(),
                className: 'iconfont iconState-Stop',
                disabled: () => !this.currentRowKeyParent || this.tableDataSon.length === 0,
                permi: 'productionplan_processroute_setDisabletRoute',
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
                disabled: () => this.addDisabledSon,
                permi: 'productionplan_procedure_add',
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                className: 'iconfont iconstatus-edit',
                disabled: () => !this.editDiasbledSon,
                permi: 'productionplan_procedure_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.tableDataSonSelection.length === 0,
                permi: 'productionplan_procedure_dels',
            }],
            tableDataSonSelection: [],
            currentPageM: 1,
            pageSizeM: 20,
            dialogVisibleMaterielCode: false,
            tableDataMaterielCode: [],
            pageTotalM: 0,
            rowM: [],
            submitLoading: false,
            dialogVisibleSonForm: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSon: [],
            tableDataDialog: [],
            selection: [],
            List: [],
            list: [],
            dialogFormEdit: [{
                label: '投料间距',
                prop: 'transferInterval',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入有效数字!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
                change: val => {
                    let value = Number(val);
                    const isNum = !isNaN(value);
                    if (isNum) {
                        value = value.toFixed(2);
                        this.dialogFormEdit[0].value = Number(value);
                    }
                },
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
            }],
            tableColumnParent: [{
                label: '工艺路线编码',
                prop: 'routeCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线名称',
                prop: 'routeName',
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
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
                option: dict.mainSource,
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.status[cell];
                },
                option: dict.status,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
                formType: 'datetime'
            }],
            tableColumnSon: [{
                type: 'selection',
            }, {
                label: '工序',
                prop: 'procedureCode',
                value: '',
            }, {
                label: '产品工艺编码',
                prop: 'prodProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺主件物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '主件物料名称',
                prop: 'materialName',
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
                }
            }, {
                label: '投料间距（秒）',
                prop: 'transferInterval',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnMaterielCode: [{
                label: '主件料号',
                prop: 'masterCode',
                showOverflowTooltip: true,
                searchBy: true
            }, {
                label: '名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: 'BOM单号',
                prop: 'bomCode',
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
                }
            }, {
                label: '标准批量',
                prop: 'standardlotSize',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编号',
                prop: 'productProcessCode',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '工艺路线名称',
                prop: 'routeName',
                value: '',
                required: true,
            }, {
                prop: 'materialCode',
                slot: 'materialCode',
                value: '',
                // change: val => {
                //     const row = this.list.find(v => v.masterCode === val);
                //     this.dialogFormParent[2].value = row.materialName;
                //     this.dialogFormParent[3].value = row.stockUnitId;
                //     this.dialogFormParent[4].value = row.spec;
                //     this.dialogFormParent[5].value = dict.mainSource[row.mainSource];
                // }
            }, {
                label: '主件物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
                placeholder: '请选择主件料号',
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
                disabled: true,
                type: 'select',
                option: dict.mainSource
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: () => dict.status,
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            dialogFormSon: [{
                type: 'selection',
            }, {
                label: '工序',
                prop: 'procedureCode',
                showOverflowTooltip: true
            }, {
                label: '产品工艺编码',
                prop: 'proProcessCode',
                showOverflowTooltip: true
            }, {
                label: '工艺子件料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                disabled: true
            }, {
                label: '子件物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                disabled: true
            }, {
                label: '工艺编码',
                prop: 'processCode',
                showOverflowTooltip: true,
                disabled: true
            }, {
                label: '物料库存单位',
                prop: 'unitName',
                showOverflowTooltip: true,
                disabled: true
            }, {
                label: '工艺名称',
                prop: 'processName',
                showOverflowTooltip: true,
                disabled: true
            }, {
                label: '投料间距（秒）',
                prop: 'transferInterval',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,2})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入有效数字!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
                change: val => {
                    let value = Number(val);
                    const isNum = !isNaN(value);
                    if (isNum) {
                        value = value.toFixed(2);
                        this.dialogFormSon[7].value = Number(value);
                    }
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }],
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            meterialList: [],
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '工艺路线编码',
                prop: 'routeCode',
                value: '',
            }, {
                label: '工艺路线名称',
                prop: 'routeName',
                value: '',
            }],
            dialogSearchForm: {},
        };
    },
    computed: {
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (item && item.status !== 0);
        },
        delDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (item && item.status !== 0 || !this.currentRowKeySon);
        },
        editDiasbledSon() {
            return this.currentRowKeySon !== '';
        },
        addDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || (item && item.status !== 0 || !this.currentRowKeyParent);
        }
    },
    mounted() {
        this.getDataParent();
    },
    methods: {
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
            this.$http.get('/productionplan/processroute/page', {
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
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.routeCode = item.routeCode;
            this.$http.get('/productionplan/procedure/page?size=999', {
                params: {
                    conditionList: [{
                        fieldName: 'routeCode',
                        operation: 'EQ',
                        value: this.routeCode
                    }]
                }
            }).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSon = data ? data.records : [];
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
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
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            const item = this.dialogFormParent.find(v => v.prop === 'status');
            item.value = '0';
            item.disabled = true;
        },
        editRowParent() {
            this.List = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (this.List.status === 0) {
                this.dialogParent = 'edit';
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'status') v.value = String(this.List[v.prop]);
                    else v.value = this.List[v.prop];
                });
                this.dialogVisibleParent = true;
            } else {
                this.dialogVisibleParent = false;
            }
        },
        delRowParent() {
            const confirmMsg = this.tableDataSon.length === 0 ? '是否确认删除?' : '存在明细，是否确认删除？';
            this.$confirm(confirmMsg, '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/processroute/removeByIds', {
                    data: {
                        ids: [this.currentRowKeyParent]
                    }
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
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/productionplan/processroute', obj).then(() => {
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
            } else {
                obj.id = this.currentRowKeyParent;
                this.$http.put('/productionplan/processroute', obj).then(() => {
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
        newRowSon() {
            this.dialogSon = 'new';
            this.getProductprocess().then(() => {
                this.dialogVisibleSon = true;
                this.$nextTick(() => {
                    this.$refs.table.toggleAllSelection();
                });
            });
        },
        // 获取产品工艺编码
        getProductprocess() {
            return this.$http.get(`/productionplan/procedure/getProcedure/${this.routeCode}`).then(res => {
                const filterData = _.differenceBy(res.data, this.tableDataSon, 'orderKey');
                this.tableDataDialog = filterData;
            });
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/procedure/removeByIds', {
                    data: this.tableDataSonSelection
                }).then(() => {
                    this.submitLoading = false;
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
        // 子表新增
        submitFormSon() {
            if (this.selection.length > 0) {
                this.submitLoading = true;
                this.$http.post('/productionplan/procedure/listProcedureByRouteCode', {
                    routeCode: this.routeCode,
                    procedures: this.selection
                }).then(res => {
                    this.submitLoading = false;
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
                this.$alert('请先选择产品工艺信息!', {
                    type: 'warning'
                });
            }
        },
        // 复制
        copy() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.post(`/productionplan/processroute/copyProcessRoute`, null, {
                params: {
                    id: this.currentRowKeyParent,
                    remark: item.remark
                }
            }).then(() => {
                this.$message({
                    message: '复制成功!',
                    type: 'success'
                });
                this.getDataParent();
            });
        },
        // 启用
        startUp() {
            this.$confirm('是否确认启用?', '提示', {
                type: 'warning'
            }).then(() => {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                if (item.status === 1) {
                    this.$alert('已启用信息，无需再启用！', {
                        type: 'warning'
                    });
                } else {
                    this.$http.post('/productionplan/processroute/setEnableRoute', {
                        ids: [this.currentRowKeyParent]
                    }).then(() => {
                        this.getDataParent();
                    });
                }
            });
        },
        // 停用
        stop() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.status === 2) {
                this.$alert('已停用信息，无需再停用！', {
                    type: 'warning'
                });
            } else if (item.status === 0) {
                this.$alert('草稿无须停用，可直接删除！', {
                    type: 'warning'
                });
            } else {
                this.$confirm('是否确认停用?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.post('/productionplan/processroute/setDisabletRoute', {
                        ids: [this.currentRowKeyParent]
                    }).then(() => {
                        this.getDataParent();
                    });
                });
            }
        },
        selectionHandler(selection) {
            this.selection = selection;
        },
        editRowSon() {
            this.dialogVisibleSonForm = true;
            this.$http.get(`/productionplan/procedure/getById/${this.currentRowKeySon}`).then(res => {
                this.dialogFormEdit.forEach(v => {
                    v.value = res.data[v.prop];
                });
            });
        },
        // 下表提交修改
        submitFormEdit() {
            let obj = {};
            this.submitLoading = true;
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            obj = Object.assign({}, item);
            this.dialogFormEdit.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.$http.put(`/productionplan/procedure/updateById`, obj).then((res) => {
                this.dialogVisibleSonForm = false;
                this.submitLoading = false;
                this.getDataSon();
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 获取物料料号
        getMaterielCode(val = 1) {
            this.dialogVisibleMaterielCode = true;
            this.tableLoadingTop = true;
            const params = {
                current: val,
                size: this.pageSizeM,
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
            this.$http.get('/productionplan/bom/page', {
                params
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPageM = val;
                this.tableDataMaterielCode = res.data.records;
                this.pageTotalM = res.data.total;
            });
        },
        // 物料分页
        changeCurrentM(val) {
            this.getMaterielCode(val);
        },
        changeSizeM(val) {
            this.pageSizeM = val;
            this.currentPageM = 1;
            this.getMaterielCode();
        },
        // 物料确认
        submitFormMaterielCode() {
            if (this.rowM.length === 0) {
                this.$alert('请选择物料信息!', {
                    type: 'warning'
                });
            } else {
                this.dialogFormParent[1].value = this.rowM.masterCode;
                this.dialogFormParent[2].value = this.rowM.materialName;
                this.dialogFormParent[3].value = this.rowM.unitName;
                this.dialogFormParent[4].value = this.rowM.spec;
                this.dialogFormParent[5].value = this.rowM.mainSource;
                this.dialogVisibleMaterielCode = false;
            }
            this.rowM = [];
        },
        // 物料表选择
        queryM(row) {
            this.rowM = row;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getMaterielCode();
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
        openTableDialog() {
            this.currentPageM = 1;
            this.tableDataMaterielCode = [];
            this.getMaterielCode();
        },
        selectionChange(selection) {
            this.tableDataSonSelection = selection.map(v => v.id);
        },
    }
};
</script>

<style scoped lang="stylus">
.router >>> .materielCode
    .el-dialog
        margin-top 5vh!important
.router
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
