<template lang="pug">
    ebrain-main.partsinfo
        ebrain-frame(
            title="零部件信息")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    ref="table"
                    :loading="loading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change="changeSize"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="selectionChange"
                    :highlight-current-row="false")
        ebrain-dialog(
            ref="form"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="15vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
            template(#unitName)
                el-col(:span="12")
                    el-form-item(label="单位" prop="unitName" required)
                        el-input(readonly=true v-model="dialogFormParent[5].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search"  :disabled="isDisabled" @click="enterTableDetails('unitName')")
            template(#sparePartTypeName)
                el-col(:span="12")
                    el-form-item(label="零部件分类" prop="sparePartTypeName" required)
                        el-input(readonly=true v-model="dialogFormParent[3].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('sparePartTypeName')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="dialogColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialog(type)")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'equiscraporder',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            sparePartType: '',
            isDelete: false,
            rowKeyObj: {},
            isDisabled: false,
            ids: [],
            selection: [],
            unit: '',
            type: '',
            dialogTableLoading: false,
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogVisible: false,
            dialogColumn: [],
            dialogData: [],
            currentRowKeyDialog: '',
            dialogSearchForm: {},
            dialogParent: '',
            submitLoading: false,
            dialogVisibleParent: false,
            loading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableDataParent: [],
            sparePartTypeColumn: [{
                label: '零部件分类编码',
                prop: 'sparePartType',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '零部件分类名称',
                prop: 'sparePartTypeName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.status[cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            unitColumn: [{
                label: '单位编码',
                prop: 'unitCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '单位名称',
                prop: 'unitName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableColumnParent: [{
                label: '零部件编码',
                prop: 'sparePartNum',
                showOverflowTooltip: true,
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true,
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                }
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
                }
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
            dialogFormParent: [{
                label: '零部件编号',
                prop: 'sparePartNum',
                value: '',
                required: true,
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                value: '',
                required: true,
            }, {
                label: '所属仓库',
                prop: 'warehouse',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
                required: true,
            }, {
                label: '零部件分类',
                slot: 'sparePartTypeName',
                prop: 'sparePartTypeName',
                value: '',
                required: true,
            }, {
                label: '备件属性',
                prop: 'sparePartProperty',
                value: '',
                type: 'select',
                option: () => this.storeDict['SPARE_PART_TYPE'],
                required: true,
            }, {
                label: '单位',
                prop: 'unitName',
                slot: 'unitName',
                value: '',
                required: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                required: true,
            }, {
                label: '单价(元)',
                prop: 'unitPrice',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        if (Number(value) <= 0 || isNaN(value)) {
                            callback(new Error('请输入大于0的数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                disabled: true,
                type: 'select',
                option: () => dict.status,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_spareparts_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1 || this.selection[0].status !== '0',
                permi: 'basicdata_spareparts_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0 || this.isDelete,
                permi: 'basicdata_spareparts_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '启用',
                click: () => this.star(),
                className: 'iconfont iconstatus-start-up',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '停用',
                click: () => this.stop(),
                className: 'iconfont iconState-Stop',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '零部件编码',
                prop: 'sparePartNum',
                value: ''
            }, {
                label: '零部件名称',
                prop: 'sparePartName',
                value: ''
            }],
            searchVisible: true,
            btnsDialog: [{
                label: '保存',
                loading: false,
                click: () => this.submitForm(),
                disabled: false,
                className: 'iconfont iconstatus-Preservation-',
                permi: false,
            }, {
                label: '取消',
                click: () => this.cancel(),
                className: 'iconfont iconstatus-Import',
                permi: false,
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
            permissions: state => state.permissions,
        }),
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'status') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                    }
                });
                this.rowObj = {};
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.getDateParent();
                this.$refs.table.clearSelection();
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('BILL_POSTING_WAREHOUSE_RESULT'),
            this.queryDict('SPARE_PART_TYPE'),
        ]).then(() => {
            this.getDateParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 搜索清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.currentPage = 1;
            this.getDateParent();
        },
        // 获取上表列表
        getDateParent() {
            this.loading = true;
            this.$http.get('/basicdata/spareparts/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.loading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 获取零部件分类信息
        getSparePartTypeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'status',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: '1',
                }]
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
            this.$http.get('/basicdata/sparepartstype/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 获取申请部门信息
        getUnitInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
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
            this.$http.get('/basicdata/dicbasicunit/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        enterTableDetails(type) {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.type = type;
            this.dialogVisible = true;
            switch (type) {
                case 'sparePartTypeName':
                    this.dialogColumn = this.sparePartTypeColumn;
                    this.getSparePartTypeInfo();
                    break;
                case 'unitName':
                    this.dialogColumn = this.unitColumn;
                    this.getUnitInfo();
                    break;
                default:
                    break;
            }
        },
        // 获取当前行
        currentChange(row) {
            this.rowObj = row;
        },
        changeCurrent_1(val) {
            switch (this.type) {
                case 'sparePartTypeName':
                    this.getSparePartTypeInfo(val);
                    break;
                case 'unitName':
                    this.getUnitInfo(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'sparePartTypeName':
                    this.getSparePartTypeInfo();
                    break;
                case 'unitName':
                    this.getUnitInfo();
                    break;
                default:
                    break;
            }
        },
        submitFormDialog(type) {
            this.dialogVisible = false;
            switch (type) {
                case 'sparePartTypeName':
                    this.dialogFormParent[3].value = this.rowObj.sparePartTypeName;
                    this.sparePartType = this.rowObj.sparePartType;
                    break;
                case 'unitName':
                    this.unit = this.rowObj.unitCode;
                    this.dialogFormParent[5].value = this.rowObj.unitName;
                    break;
                default:
                    break;
            }
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            switch (this.type) {
                case 'sparePartTypeName':
                    this.getSparePartTypeInfo();
                    break;
                case 'unitName':
                    this.getUnitInfo();
                    break;
                default:
                    break;
            }
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
        // 提交form表单
        submitForm() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.sparePartType = this.sparePartType;
            obj.unit = this.unit;
            delete obj.scrapCode;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/basicdata/spareparts/save', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                            this.currentPage = 1;
                            // this.getDateParent();
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.rowKeyObj.id;
                        this.$http.put('/basicdata/spareparts/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            // this.getDateParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                        }).catch(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                        });
                    }
                }
            });
        },
        // 上表新增
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[8].value = '0';
        },
        // 上表修改
        editRowParent(row) {
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.unit = this.rowKeyObj.unit;
            this.sparePartType = this.rowKeyObj.sparePartType;
            this.dialogVisibleParent = true;
        },
        // 上表页码
        changeCurrent(val) {
            this.currentPage = val;
            this.getDateParent();
        },
        // 上表页面数据数量
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDateParent();
        },
        selectionChange(selection) {
            this.isDelete = false;
            this.selection = selection;
            this.selection.forEach(item => {
                if (item.status !== '0') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/spareparts/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentPage = 1;
                    this.getDateParent();
                    this.$refs.table.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        look(row) {
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.isDisabled = true;
            this.btnsDialog[0].disabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('basicdata_sparepartstype_edit') && row.status === '0') {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        star() {
            if (this.selection[0].status === '1') {
                this.$message({
                    message: `零部件编码[${this.selection[0].sparePartNum}]已被启用,无需在启用`,
                    type: 'warning'
                });
            } else {
                this.$confirm(`你确定启用零部件编码[${this.selection[0].sparePartNum}]吗？`, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get(`/basicdata/spareparts/getEnabling/${this.selection[0].id}`).then(res => {
                        this.$message({
                            message: `零部件编码[${res.data.sparePartNum}]已被启用成功！`,
                            type: 'success'
                        });
                        this.getDateParent();
                    });
                });
            }
        },
        stop() {
            if (this.selection[0].status === '2') {
                this.$message({
                    message: `零部件编码[${this.selection[0].sparePartNum}]已被停用,无需在停用`,
                    type: 'warning'
                });
            } else if (this.selection[0].status === '0') {
                this.$message({
                    message: `零部件编码[${this.selection[0].sparePartNum}]未启用，不能停用！`,
                    type: 'warning'
                });
            } else {
                this.$confirm(`你确定停用零部件编码[${this.selection[0].sparePartNum}]吗？`, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get(`/basicdata/spareparts/getDiscontinuation/${this.selection[0].id}`).then(res => {
                        this.$message({
                            message: `零部件编码[${res.data.sparePartNum}]已成功被停用！`,
                            type: 'success'
                        });
                        this.getDateParent();
                    });
                });
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.partsinfo
    & >>> .frame
        .fr
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