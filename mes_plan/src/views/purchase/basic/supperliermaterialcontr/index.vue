<template lang="pug">
    ebrain-main.contr
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                //- ebrain-tools(
                //-     :add="newRow"
                //-     :edit="editRow"
                //-     :del="delRowParent"
                //-     :editDisabled="editDisabledParent"
                //-     :delDisabled="delDisabled")
                //-     button(
                //-         @click="exportAll")
                //-         i.iconfont.iconstatus-Export_all
                //-         |全部导出
                //-     button(
                //-         @click="selectExport"
                //-         :disabled="delDisabled"
                //-         :class="{disabled: delDisabled}")
                //-         i.iconfont.iconstatus-export
                //-         |导出选中
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoading'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableData"
                    :column="tableColumnParent"
                    :default-sort = "{prop: 'supplierCode', order: 'descending'}"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRow"
                    row-key="id"
                    highlight-current-row
                    @selection-change="changeHandler"
                    :current-row-key.sync="currentRowKey")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#supplierId="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="供应商编号" required=true prop="supplierId" )
                        el-input(style="cursor:pointer" :value="value")
                            el-button(slot="append" @click="dialogSearchSupplier={};openSupplierSelect()"  icon="iconfont iconsearch")
            template(#materialCode="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="MES料号" required=true prop="materialCode")
                        el-input(style="cursor:pointer" :value="value")
                            el-button(slot="append" @click="dialogSearchMes={};openMESMateral()"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="dialogTableData"
            :column="tableColumnForm"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleForm"
            highlight-current-row
            :pageSize='pageSize_formF'
            :currentPage='currentPage_formF'
            :pageTotal='pageTotal_formF'
            row-key="id"
            :current-row-key.sync="currentRowKeyFormF"
            @search="searchSupplier"
            @resetDialog="resetSupplier"
            dialogTableSearch
            @changeCurrent="changeCurrent_formF"
            @changeSize='changeSize_formF'
            @submit="submitDialog")
        ebrain-dialog-table(
            height="50vh"
            :data="MEStableData"
            :column="tableColumnMES"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleMES"
            highlight-current-row
            :pageSize="pageSize_formS"
            :currentPage="currentPage_formS"
            :pageTotal="pageTotal_formS"
            @changeCurrent="changeCurrent_formS"
            @changeSize="changeSize_formS"
            @search="searchMes"
            @resetDialog="resetMes"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyFormMES"
            @submit="submitDialogMES")
</template>

<script>
import dict from '@/utils/dict';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'workshop',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            submitLoading: false,
            tableLoading: false,
            dialogVisibleSon: false,
            dialogVisibleForm: false,
            dialogVisibleMES: false,
            currentRowKeyFormMES: '',
            searchVisible: true,
            conditionList: [],
            MEStableData: [],
            currentRowKeyFormF: '',
            pageSize_formF: 20,
            currentPage_formF: 1,
            pageTotal_formF: 0,
            pageSize_formS: 20,
            currentPage_formS: 1,
            pageTotal_formS: 0,
            dialogSearchSupplier: {},
            dialogSearchMes: {},
            dialogTableData: [],
            tableData: [],                  // 存储上表信息
            List: [],                       // 修改页信息
            tableColumnParent: [{           // 上表头
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '供应商编号',
                prop: 'supplierId',
                sortable: true,
                showOverflowTooltip: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                showOverflowTooltip: true,
            }, {
                label: '供应商料号',
                prop: 'sapMaterialCode',
                showOverflowTooltip: true,
            }, {
                label: '供应商物料名称',
                prop: 'sapMaterialName',
                showOverflowTooltip: true,
            }, {
                label: 'MES料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: 'MES物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }],
            tableColumnForm: [{
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
            tableColumnMES: [{
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
                searchBy: true,
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
                prop: 'stockUnit',
            }],
            // {
            //     label: '采购单位',
            //     prop: 'purchaseUnitName',
            // }, {
            //     label: '入库上限',
            //     prop: 'warehousingFloatingMax',
            // }, {
            //     label: '入库下限',
            //     prop: 'warehousingFloatingMin',
            // }
            dialogForm: [{
                prop: 'supplierId',
                value: '',
                slot: 'supplierId',
                required: true,
            }, {
                label: '供应商名称',
                prop: 'supplierName',
                readonly: true,
                value: '',
                disabled: true,
            }, {
                label: '供应商料号',
                prop: 'sapMaterialCode',
                value: '',
                required: true,
            }, {
                label: '供应商物料名称',
                prop: 'sapMaterialName',
                value: '',
                required: true,
            }, {
                slot: 'materialCode',
                prop: 'materialCode',
                value: '',
                required: true,
            }, {
                label: 'MES物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'purchase_prsuppliermaterial_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'purchase_prsuppliermaterial_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'purchase_prsuppliermaterial_edit',
            }, {
                label: '全部导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: false,
            }, {
                label: '导出选中',
                click: () => this.selectExport(),
                className: 'iconfont iconstatus-export',
                disabled: () => this.delDisabled,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '供应商编号',
                prop: 'supplierId',
                value: '',
            }, {
                label: '供应商料号',
                prop: 'sapMaterialCode',
                value: '',
            }, {
                label: 'MES料号',
                prop: 'materialCode',
                value: '',
            }],
            // searchTableSupplier: [{
            //     label: '供应商编号',
            //     prop: 'supplierCode',
            //     value: '',
            // }, {
            //     label: '供应商名称',
            //     prop: 'supplierName',
            //     value: '',
            // }],
            searchTableMES: [{
                label: '料号',
                prop: 'materialCode',
                value: '',
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            multiption: [],
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKey === '';
        },
        delDisabled() {
            return this.multiption.length === 0;
        }
    },
    watch: {
        dialogVisibleForm(val) {
            if (!val) {
                this.dialogTableData = [];
                this.pageSize_formF = 20;
                this.currentPage_formF = 1;
                this.pageTotal_formF = 0;
            }
        },
        dialogVisibleMES(val) {
            if (!val) {
                this.MEStableData = [];
                this.pageSize_formS = 20;
                this.currentPage_formS = 1;
                this.pageTotal_formS = 0;
            }
        }
    },
    created() {
        this.getDataParent();
    },
    methods: {
        // 获取表格信息
        search() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getDataParent();
        },
        getDataParent() {
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            this.tableLoading = true;
            this.$http.get('/purchase/prsuppliermaterial/page', {
                params
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        // 上表新增页面
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        // 上表修改页面
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/purchase/prsuppliermaterial/removeByIds', {
                    data: this.multiption,
                }).then(() => {
                    this.submitLoading = false;
                    this.changeCurrent = 1;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        // 提交上表新增或者修改数据
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/purchase/prsuppliermaterial/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
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
                this.$http.put('/purchase/prsuppliermaterial/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        exportAll() {
            // window.open('/purchase/prsuppliermaterial/exportAll', '_blank');
            this.$http.post(`/purchase/prsuppliermaterial/exportAll`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '供应商物料对应关系.xls';
                    $a.click();
                }
            });
        },
        changeHandler(selection) {
            this.multiption = selection.map(v => v.id);
        },
        selectExport() {
            // window.open(`/purchase/prsuppliermaterial/export?id=${this.multiption}`, '_blank');
            this.$http.post(`purchase/prsuppliermaterial/export`, this.multiption, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '供应商物料对应关系.xls';
                    $a.click();
                }
            });
        },
        openSupplierSelect() {
            this.dialogVisibleForm = true;
            this.getData();
        },
        openMESMateral() {
            this.dialogVisibleMES = true;
            this.getDataMes();
        },
        getDataMes() {
            const params = {
                current: this.currentPage_formS,
                size: this.pageSize_formS,
                conditionList: [{
                    fieldName: 'materialState',
                    value: 1,
                    operation: 'EQ',
                    joinType: 'AND',
                }],
            };
            if (this.dialogSearchMes) {
                for (let i in this.dialogSearchMes) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchMes, i)) {
                        if (this.dialogSearchMes[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchMes[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            return this.$http.get('basicdata/dicbasicmaterial/page', {
                params
            }).then(({ data }) => {
                this.tableLoading = false;
                this.MEStableData = data.records;
                this.pageTotal_formS = data.total;
            });
        },
        submitDialogMES() {
            const item = this.MEStableData.find(v => v.id === this.currentRowKeyFormMES);
            this.dialogForm[4].value = item.materialCode;
            this.dialogForm[5].value = item.materialName;
            this.dialogVisibleMES = false;

        },
        submitDialog() {
            const item = this.dialogTableData.find(v => v.id === this.currentRowKeyFormF);
            this.dialogForm[1].value = item.supplierName;
            this.dialogForm[0].value = item.supplierCode;
            this.dialogVisibleForm = false;
        },
        getData() {
            const params = {
                current: this.currentPage_formF,
                size: this.pageSize_formF,
                conditionList: [{
                    fieldName: 'status',
                    operation: 'EQ',
                    value: '1'
                }]
            };
            if (this.dialogSearchSupplier) {
                for (let i in this.dialogSearchSupplier) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchSupplier, i)) {
                        if (this.dialogSearchSupplier[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchSupplier[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get(`/purchase/prsupplierinfo/page`, { params }).then(({ code, data }) => {
                this.dialogTableData = data.records;
                this.pageTotal_formF = data.total;
            });
        },
        // 供应商编码弹出列表分页
        changeCurrent_formF(val) {
            this.currentPage_formF = val;
            this.getData();
        },
        changeSize_formF(val) {
            this.pageSize_formF = val;
            this.currentPage_formF = 1;
            this.getData();
        },
        // MES编码弹出列表分页
        changeCurrent_formS(val) {
            this.currentPage_formS = val;
            this.getDataMes();
        },
        changeSize_formS(val) {
            this.pageSize_formS = val;
            this.currentPage_formS = 1;
            this.getDataMes();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchSupplier(form) {
            this.currentPage_formF = 1;
            this.dialogSearchSupplier = form;
            this.getData();
        },
        resetSupplier(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        searchMes(form) {
            this.currentPage_formS = 1;
            this.dialogSearchMes = form;
            this.getDataMes();
        },
        resetMes(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
.contr
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