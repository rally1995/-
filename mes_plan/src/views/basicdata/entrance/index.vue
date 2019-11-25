<template lang="pug">
    ebrain-main.entrance
        ebrain-frame(:title="$route.name")
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
                    :tableLoading='tableLoading'
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
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize")
        ebrain-frame(title="料口信息表")
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="料口信息表" name="first")
                    el-tab-pane(label="料口区域绑定" name="second")
            template(#tools)
                ebrain-tools(:buttons="btnsDown")
                .search(
                    :class="{hide:searchVisibleSon}")
                    ebrain-search(
                        :form="searchFormSon"
                        @search="searchSon"
                        @reset="resetSon")
            template(#table)
                    ebrain-table(
                        :key="activeName"
                        :tableLoading="tableLoadingSon"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySon"
                        row-key="id"
                        :data="tableDataSon"
                        :column="column"
                        :pageSize="pageSizeSon"
                        :currentPage="currentPageSon"
                        :pageTotal="pageTotalSon"
                        @row-dblclick="editRowSon"
                        @changeCurrent="changeCurrentSon"
                        @changeSize="changeSizeSon")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
        ebrain-dialog(
            :submitLoading="submitLoadingSon"
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
        ebrain-dialog(
            @submit="submitFormSonR"
            :isClick="selectRow.length === 0"
            :submitLoading="submitLoadingSonR"
            :visible.sync="dialogVisibleSonR")
            template
                el-tabs(v-model="bindType" type="card" :before-leave="handlerTabs")
                    el-tab-pane(label="物料" name="materiel")
                    el-tab-pane(label="托盘" name="tray")
                //- ebrain-tools(:buttons="btnsDialog")
                //- .search(
                //-     :class="{hide:searchVisibleDialog}")
                //-     ebrain-search(
                //-         :form="searchForm"
                //-         @search="searchParent"
                //-         @reset="reset")
                div(v-if ="bindType === 'materiel'")
                    el-form.dialog_form(
                        :model="form"
                        inline)
                        el-col(:span="10" )
                            el-form-item(label="物料料号" prop="materialNo")
                                el-input(style="cursor:pointer" v-model="form.materialNo" clearable)
                        el-col(:span="8")
                            el-button(type="primary" @click="searchMaTR") 搜索
                            el-button(@click="resetDialog") 清空
                div(v-if ="bindType === 'tray'")
                    el-form.dialog_form(
                        :model="form"
                        inline)
                        el-col(:span="10" )
                            el-form-item(label="托盘类型" prop="palletType")
                                el-input(style="cursor:pointer" v-model="form.palletType" clearable)
                        el-col(:span="8")
                            el-button(type="primary" @click="searchPall") 搜索
                            el-button(@click="resetDialog") 清空
            template
                ebrain-box-table.box_table(
                    :key="bindType"
                    :loading='tableLoadingSonR'
                    highlight-current-row
                    row-key="id"
                    :data="tableDataDialog"
                    :column="columnDialog"
                    :pageSize="pageSizeDialog"
                    :pageCurrent="currentPageDialog"
                    :pageTotal="pageTotalDialog"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")

</template>

<script>
import dict from '@/utils/dict';
import * as _ from 'lodash';
export default {
    name: 'index',
    data() {
        return {
            // form: {
            //     materialNo: '',
            //     materialName: '',
            // },
            tableLoadingSonR: false,
            activeName: 'first',
            conditionListDown: [],
            conditionList: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: '',
            searchVisible: true,
            searchForm: [{
                label: '料口区域编码',
                prop: 'mpAreaNo',
                value: '',
            }, {
                label: '料口区域名称',
                prop: 'mpAreaName',
                value: '',
            }],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '料口区域编码',
                prop: 'mpAreaNo',
                showOverflowTooltip: true,
            }, {
                label: '料口区域名称',
                prop: 'mpAreaName',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '料口区域编码',
                prop: 'mpAreaNo',
                value: '',
                required: true,
            }, {
                label: '料口区域名称',
                prop: 'mpAreaName',
                value: '',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'transportmanager_materialportarea_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'transportmanager_materialportarea_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabled,
                permi: 'transportmanager_materialportarea_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDialog: [{
                label: '搜索',
                click: () => { this.searchVisibleDialog = !this.searchVisibleDialog },
                className: 'iconfont iconsearch',
                permi: false,
            }],
            searchVisibleDialog: true,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            submitLoadingSon: false,
            tableLoadingSon: false,
            tableDataSon: [],
            pageSizeSon: 20,
            currentPageSon: 1,
            pageTotalSon: 0,
            multiptionSon: '',
            searchVisibleSon: true,
            searchFormSon: [{
                label: '料口编码',
                prop: 'mpNo',
                value: '',
            }, {
                label: '料口名称',
                prop: 'mpName',
                value: '',
            }],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '料口编码',
                prop: 'mpNo',
                showOverflowTooltip: true,
            }, {
                label: '料口名称',
                prop: 'mpName',
                showOverflowTooltip: true,
            }, {
                label: '料口类型',
                prop: 'mpType',
                formatter: (row, column, cell) => {
                    return dict['entranceType'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnSonR: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '绑定类型',
                prop: 'bindType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict['bindType'][cell];
                },
            }, {
                label: '料号',
                prop: 'materialNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '托盘类型名称',
                prop: 'palletTypeName',
                showOverflowTooltip: true,
            }],
            dialogFormSon: [{
                label: '料口编码',
                prop: 'mpNo',
                value: '',
                required: true,
            }, {
                label: '料口名称',
                prop: 'mpName',
                value: '',
                required: true,
            }, {
                label: '料口类型',
                prop: 'mpType',
                value: '',
                type: 'select',
                option: dict.entranceType,
                required: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            btnsSon: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'transportmanager_materialport_add',
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledSon,
                permi: 'transportmanager_materialport_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabledSon,
                permi: 'transportmanager_materialport_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsSonR: [{
                label: '新增',
                click: () => this.newRowSonR(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'transportmanager_mpareabind_batchSave',
            }, {
                label: '删除',
                click: () => this.delRowSonR(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabledSon,
                permi: 'transportmanager_mpareabind_dels',
            }],
            currentRowKeySon: '',
            dialogTypeSon: '',
            dialogVisibleSon: false,
            submitLoadingSonR: false,
            dialogVisibleSonR: false,
            bindType: 'materiel',
            tableDataDialog: [],
            pageSizeDialog: 20,
            currentPageDialog: 1,
            pageTotalDialog: 0,
            selectRow: [],
            materialNo: '',
            form: {
                materialNo: '',
                materialName: '',
                palletType: '',
            },
            columnMaterial: [{
                label: '料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }],
            columnTray: [{
                label: '托盘类型编码',
                prop: 'palletTypeNo',
                showOverflowTooltip: true,
            }, {
                label: '托盘类型名称',
                prop: 'palletTypeName',
                showOverflowTooltip: true,
            }],
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        editDisabledSon() {
            return !this.currentRowKeySon;
        },
        btnsDown() {
            if (this.activeName === 'first') return this.btnsSon;
            else return this.btnsSonR;
        },
        column() {
            if (this.activeName === 'first') return this.tableColumnSon;
            else return this.tableColumnSonR;
        },
        columnDialog() {
            if (this.bindType === 'materiel') return this.columnMaterial;
            else return this.columnTray;
        }
    },
    watch: {
        dialogType(val) {
            if (val === 'new') {
                this.dialogForm[0].disabled = false;
            } else {
                this.dialogForm[0].disabled = true;
            }
        },
        dialogTypeSon(val) {
            if (val === 'new') {
                this.dialogFormSon[0].disabled = false;
            } else {
                this.dialogFormSon[0].disabled = true;
            }
        },
        activeName(val) {
            this.tableDataSon = [];
            this.pageSizeSon = 20;
            this.currentPageSon = 1;
            this.pageTotalSon = 0;
            this.currentRowKeySon = '';
            if (this.currentRowKey) this.getDataSon();
        },
        bindType(val) {
            this.tableDataDialog = [];
            this.pageSizeDialog = 20;
            this.currentPageDialog = 1;
            this.pageTotalDialog = 0;
            this.selectRow = [];
            this.materialNo = '';
            this.palletType = '';
            this.form.materialNo = '';
            this.form.palletType = '';
            if (this.dialogVisibleSonR) this.getDialogData();
        },
        dialogVisibleSonR() {
            this.bindType = 'materiel';
            this.materialNo = '';
            this.form.materialNo = '';
            this.form.palletType = '';
            this.palletType = '';
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            this.$http.get(`transportmanager/materialportarea/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/transportmanager/materialportarea/removeByIds', {
                    data: [this.currentRowKey],
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData();
                    this.tableDataSon = [];
                    this.activeName = 'first';
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/transportmanager/materialportarea/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/transportmanager/materialportarea/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            }
        },
        searchSon() {
            this.conditionListDown = [];
            this.searchFormSon.forEach(v => {
                if (v.value) {
                    this.conditionListDown.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.currentPageSon = 1;
            this.getDataSon();
        },
        getDataInfo() {
            this.tableLoadingSon = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.conditionListSon = [{
                fieldName: 'mpAreaNo',
                operation: 'EQ',
                value: encodeURI(item.mpAreaNo),
            }, ...this.conditionListDown];
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                conditionList: this.conditionListSon,
            };
            this.$http.get(`transportmanager/materialport/page`, {
                params
            }).then(({ code, data }) => {
                this.tableDataSon = data.records;
                this.pageTotalSon = data.total;
                this.tableLoadingSon = false;
            }).catch(() => {
                this.tableLoadingSon = false;
            });
        },
        newRowSon() {
            this.dialogTypeSon = 'new';
            this.dialogVisibleSon = true;
        },
        editRowSon() {
            if (this.activeName === 'first') {
                const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                this.dialogFormSon.forEach(v => {
                    v.value = item[v.prop];
                });
                this.dialogTypeSon = 'edit';
                this.dialogVisibleSon = true;
            }
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoadingSon = true;
                this.$http.delete('/transportmanager/materialport/removeByIds', {
                    data: [this.currentRowKeySon],
                }).then(() => {
                    this.submitLoadingSon = false;
                    this.currentPageSon = 1;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                });
            });
        },
        changeSizeSon(val) {
            this.pageSizeSon = val;
            this.currentPageSon = 1;
            this.getDataSon();
        },
        changeCurrentSon(val) {
            this.currentPageSon = val;
            this.getDataSon();
        },
        getDataSon() {
            if (this.activeName === 'first') {
                this.getDataInfo();
            } else {
                this.getBindArea();
            }
        },
        // 料口区域绑定列表
        getBindArea() {
            this.tableLoadingSon = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            // this.conditionListSon = [{
            //     fieldName: 'mpAreaNo',
            //     operation: 'EQ',
            //     value: encodeURI(item.mpAreaNo),
            // }];
            const params = {
                current: this.currentPageSon,
                size: this.pageSizeSon,
                // conditionList: this.conditionListSon,
                mpAreaNo: item.mpAreaNo
            };
            this.$http.get(`/transportmanager/mpareabind/page`, {
                params
            }).then(({ code, data }) => {
                this.tableDataSon = data.records;
                this.pageTotalSon = data.total;
                this.tableLoadingSon = false;
            }).catch(() => {
                this.tableLoadingSon = false;
            });
        },
        delRowSonR() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoadingSon = true;
                this.$http.delete('/transportmanager/mpareabind/removeByIds', {
                    data: [this.currentRowKeySon],
                }).then(() => {
                    this.submitLoadingSon = false;
                    this.currentPageSon = 1;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                });
            });
        },
        resetSon() {
            this.searchFormSon.forEach(item => {
                item.value = '';
            });
        },
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            obj.mpAreaNo = item.mpAreaNo;
            obj.mpAreaName = item.mpAreaName;
            this.submitLoadingSon = true;
            if (this.dialogTypeSon === 'new') {
                this.$http.post('/transportmanager/materialport/save', obj).then(() => {
                    this.submitLoadingSon = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getDataSon();
                    this.dialogVisibleSon = false;
                }).catch(v => {
                    this.submitLoadingSon = false;
                });
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/transportmanager/materialport/updateById', obj).then(() => {
                    this.submitLoadingSon = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                    this.getDataSon();
                    this.dialogVisibleSon = false;
                }).catch(v => {
                    this.submitLoadingSon = false;
                });
            }
        },
        newRowSonR() {
            this.dialogVisibleSonR = true;
            this.getDialogData();
        },
        submitFormSonR() {
            let objArr = [];
            this.submitLoadingSonR = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (this.bindType === 'materiel') {
                this.selectRow.forEach(v => {
                    objArr.push({
                        bindNo: v.materialCode,
                        bindType: '1',
                        mpAreaNo: item.mpAreaNo,
                    });
                });
            } else {
                this.selectRow.forEach(v => {
                    objArr.push({
                        bindNo: v.palletTypeNo,
                        bindType: '2',
                        mpAreaNo: item.mpAreaNo,
                    });
                });
            }
            this.$http.post(`/transportmanager/mpareabind/batchSave`, objArr).then(() => {
                this.$message.success('新增成功');
                this.getDataSon();
                this.submitLoadingSonR = false;
                this.dialogVisibleSonR = false;
            }).catch(() => {
                this.submitLoadingSonR = false;
            });
        },
        // 获取托盘或者物料
        getDialogData() {
            if (this.bindType === 'materiel') {
                this.getMaterial();
            } else {
                this.getTray();
            }
        },
        getMaterial() {
            this.tableLoadingSonR = true;
            const params = {
                current: this.currentPageDialog,
                size: this.pageSizeDialog,
                materialNo: this.materialNo,
            };
            // if (!_.isEmpty(this.form.materialNo)) params.materialNo = this.materialNo;
            this.$http.get(`/transportmanager/mpareabind/listUnbindMaterial`, {
                params
            }).then((res) => {
                this.tableDataDialog = res.data.records;
                this.pageTotalDialog = res.data.total;
                this.tableLoadingSonR = false;
            }).catch(() => {
                this.tableLoadingSonR = false;
            });
        },
        getTray() {
            this.tableLoadingSonR = true;
            const params = {
                current: this.currentPageDialog,
                size: this.pageSizeDialog,
                palletType: this.palletType,
            };
            this.$http.get(`/transportmanager/mpareabind/listUnbindPalletType`, {
                params
            }).then((res) => {
                this.tableDataDialog = res.data.records;
                this.pageTotalDialog = res.data.total;
                this.tableLoadingSonR = false;
            }).catch(() => {
                this.tableLoadingSonR = false;
            });
        },
        ChangeSize(val) {
            this.pageSizeDialog = val;
            this.currentPageDialog = 1;
            this.getDialogData();
        },
        ChangeCurrent(val) {
            this.currentPageDialog = val;
            this.getDialogData();
        },
        SelectChange(selection) {
            this.selectRow = selection;
        },
        searchMaTR() {
            this.currentPageDialog = 1;
            if (!_.isEmpty(this.form.materialNo)) {
                this.materialNo = this.form.materialNo;
            } else {
                this.materialNo = '';
            }
            this.getDialogData();
        },
        resetDialog() {
            this.materialNo = '';
            this.palletType = '';
            if (this.form) {
                for (let i in this.form) {
                    if (Object.prototype.hasOwnProperty.call(this.form, i)) {
                        this.form[i] = '';
                    }
                }
            }
        },
        searchPall() {
            this.currentPageDialog = 1;
            if (!_.isEmpty(this.form.palletType)) {
                this.palletType = this.form.palletType;
            } else {
                this.palletType = '';
            }
            this.getTray();
        },
        handlerTabs() {
            if (this.selectRow.length) {
                this.$confirm('切换标签将会丢失选中的物料或托盘,是否切换', {
                    type: 'warning'
                }).then(() => {
                    this.selectRow = [];
                    if (this.bindType === 'materiel') this.bindType = 'tray';
                    else this.bindType = 'materiel';
                }).catch(() => {
                    return false;
                });
                return false;
            }
        },
    }
};
</script>
<style lang="stylus" scoped>
.entrance
    & >>> .fr
        float right

.tabs
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF

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
.box_table
    height 50vh !important
    margin-top 15px
.dialog_form
    height 20px
    margin-top 10px
</style>

