<template lang="pug">
    ebrain-main.overduecheck
        ebrain-frame(
            title="物料超期检验设置")
            template(#tools)
                ebrain-tools(:buttons="buttons")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            //- template(#tools)
            //-     ebrain-tools(
            //-         :add="newRowParent"
            //-         :edit="editRowParent"
            //-         :del="delRowParent"
            //-         :editDisabled="editDisabled"
            //-         :delDisabled="selection.length===0")
            //-         button(
            //-             @click="allExport")
            //-             i.iconfont.iconstatus-copy
            //-             |全部导出
            //-         button(
            //-             @click="exportSelected"
            //-             :disabled="selection.length===0"
            //-             :class="{disabled: selection.length===0}")
            //-             i.iconfont.iconstatus-copy
            //-             |导出选中
            //-         button(
            //-             @click="downloadTemplate")
            //-             i.iconfont.iconstatus-copy
            //-             |下载模板
            //-         ebrain-upload.upload-file(
            //-             action="/qc/iqcinspectoverdue/import"
            //-             :on-success="successFile"
            //-             :show-file-list="false")
            //-             button
            //-                 i.iconfont.iconstatus-download
            //-                 |导入
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoading"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    @row-dblclick="editRowParent"
                    @selection-change="selectionChange"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#materielTypeCode)
                el-col(:span="12")
                    el-form-item(label="物料类别编码" prop="materielTypeCode" required)
                        el-input(readonly=true v-model="dialogForm[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterMaterielTypeCode")
            template(#materielCode)
                el-col(:span="12")
                    el-form-item(label="料号" prop="materielCode")
                        el-input(readonly=true v-model="dialogForm[2].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterMaterielCode")
        ebrain-dialog-table(
            :tableLoading="dialogTableLoading"
            :isShow="false"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyMaterialType"
            :height="550"
            :data="materialTypeData"
            :column="materialTypeColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleMaterialType"
            @current-change="currentChange"
            @submit="submitFormDetail('materialType')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            row-key="id"
            :current-row-key.sync="currentRowKeyMaterial"
            :height="550"
            :data="materialData"
            :column="materialColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleMaterial"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDetail('material')")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'materialoverduecheck',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            searchVisible: true,
            dialogTableLoading: false,
            ids: [],
            selection: [],
            rowObj: {},
            materialData: [],
            materialTypeData: [],
            listMaterielTypeCodeColumn: [],
            dialogVisibleMaterial: false,
            dialogVisibleMaterialType: false,
            currentRowKeyMaterial: '',
            currentRowKeyMaterialType: '',
            pageTotal_1: 0,
            currentPage_1: 1,
            pageSize_1: 20,
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            materialTypeColumn: [{
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }],
            materialColumn: [{
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableColumn: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '物料类别编码',
                prop: 'materielTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'materielCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materielName',
                showOverflowTooltip: true,
            }, {
                label: '首次复检有效期(天)',
                prop: 'firstRecheckValidDays',
                showOverflowTooltip: true,
            }, {
                label: '复检周期(天)',
                prop: 'recheckDays',
                showOverflowTooltip: true,
            }, {
                label: '最大复检次数',
                prop: 'recheckMaxNumber',
                showOverflowTooltip: true,
            }, {
                label: '是否有效',
                prop: 'valid',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_OVERDUE_VALID'][cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }, {
                label: '维护人',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                // label: '物料类别编码',
                prop: 'materielTypeCode',
                value: '',
                slot: 'materielTypeCode',
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                value: '',
                disabled: true,
            }, {
                // label: '料号',
                prop: 'materielCode',
                value: '',
                slot: 'materielCode',
            }, {
                label: '物料名称',
                prop: 'materielName',
                value: '',
                disabled: true,
            }, {
                label: '是否有效',
                prop: 'valid',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_OVERDUE_VALID'],
                value: '',
                required: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value) {
                            let reg =  /^[0-9]+?$/;
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负整数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '首次复检有效期(天)',
                prop: 'firstRecheckValidDays',
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value) {
                            let reg =  /^[0-9]+?$/;
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负整数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '复检周期(天)',
                prop: 'recheckDays',
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value) {
                            let reg =  /^[0-9]+?$/;
                            if (!reg.test(value)) {
                                callback(new Error('请输入非负整数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '最大复检次数',
                prop: 'recheckMaxNumber',
                value: '',
            }, {
                label: '维护人员',
                prop: 'updateBy',
                value: '',
                disabled: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            buttons: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectoverdue_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-edit',
                permi: 'qc_iqcinspectoverdue_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.selection.length === 0 || this.isDelete,
                className: 'iconfont iconstatus-delete',
                permi: 'qc_iqcinspectoverdue_dels',
            }, {
                label: '全部导出',
                click: () => this.allExport(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导出选中',
                click: () => this.exportSelected(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '下载模板',
                click: () => this.downloadTemplate(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导入',
                className: 'iconfont iconstatus-download',
                permi: false,
                action: '/qc/iqcinspectoverdue/import',
                onSuccess: (response, file, fileList) => this.uploadSuccess(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '物料类别编码',
                prop: 'materielTypeCode',
                value: ''
            }, {
                label: '物料类别名称',
                prop: 'materielTypeName',
                value: ''
            }],
            isDelete: false,
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKey: '',
            dialog: '',
            dialogVisible: false,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    watch: {
        dialogVisibleMaterial(val) {
            if (!val) {
                this.pageSize_1 = 20;
                this.pageTotal_1 = 0;
                this.currentPage_1 = 1;
                this.dialogSearchForm = {};
            }
        }
    },
    created() {
        this.queryDict('DIC_IQC_INSPECT_OVERDUE_VALID');
        this.getData();
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 主表搜索
        search() {
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.currentPage = 1;
            this.getData();
        },
        // 获取物料检验列表信息
        getData() {
            this.tableLoading = true;
            this.$http.get('/qc/iqcinspectoverdue/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        enterMaterielTypeCode() {
            this.dialogVisibleMaterialType = true;
            this.getmaterielTypeCodeInfo();
        },
        enterMaterielCode() {
            this.dialogVisibleMaterial = true;
            this.getmaterielCodeInfo();
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeCurrent_1(val) {
            this.getmaterielCodeInfo(val);
        },
        // 改变上表页面数据数时获取的数据
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getmaterielCodeInfo();
        },
        // 上表新增页面
        newRowParent() {
            this.dialog = 'new';
            this.dialogVisible = true;
            this.dialogForm[8].value = this.sysUser.nickname;
            this.dialogForm[9].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 获取列表页选择的数据
        selectionChange(selection) {
            this.selection = selection;
            this.isDelete = false;
            this.selection.forEach(item => {
                if (item.valid !== 'N') {
                    this.isDelete = true;
                }
            });
            this.ids = selection.map(v => v.id);
        },
        // 获取物料类型编码
        getmaterielTypeCodeInfo() {
            this.dialogTableLoading = true;
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree').then(res => {
                this.dialogTableLoading = false;
                this.materialTypeData = res.data;
                const clickHandler =  () => {
                    this.$nextTick(() => {
                        this.$refs.table.doLayout();
                    });
                };
                this.$nextTick(() => {
                    const icons = this.$refs.table.$el.querySelectorAll('.el-table__expand-icon');
                    icons.forEach((icon, index, arr) => {
                        if (index === arr.length - 1) {
                            icon.addEventListener('click', clickHandler, false);
                        }
                        icon.click();
                    });
                });
            });
        },
        // 获取料号
        getmaterielCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: []
            };
            if (this.dialogForm[0].value) {
                params.conditionList.push({
                    fieldName: 'materialTypeCode',
                    value: this.dialogForm[0].value,
                    operation: 'EQ',
                    joinType: 'AND',
                });
            }
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
            this.$http.get('/basicdata/dicbasicmaterial/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.materialData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        currentChange(row) {
            this.rowObj = row;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getmaterielCodeInfo();
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
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisible = true;
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('是否确认删除？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectoverdue/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
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
            delete obj.updateBy;
            delete obj.updateTime;
            this.submitLoading = true;
            if (this.dialog === 'new') {
                this.$http.post('/qc/iqcinspectoverdue/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.getData();
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/qc/iqcinspectoverdue/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        submitFormDetail(type) {
            this.dialogForm[0].value = this.rowObj.materialTypeCode;
            this.dialogForm[1].value = this.rowObj.materialTypeName;
            if (type === 'material') {
                this.dialogVisibleMaterial = false;
                this.dialogForm[2].value = this.rowObj.materialCode;
                this.dialogForm[3].value = this.rowObj.materialName;
            } else {
                this.dialogForm[2].value = '';
                this.dialogForm[3].value = '';
                this.dialogVisibleMaterialType = false;
            }
        },
        // 导出所有
        allExport() {
            this.$http.get('/qc/iqcinspectoverdue/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有物料超期检验.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids.join(',');
            this.$http.get('/qc/iqcinspectoverdue/export', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出选中物料超期检验.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/iqcinspectoverdue/template', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '物料超期检验模板.xls';
                    $a.click();
                }
            });
        },
        // 导入
        uploadSuccess() {
            this.getData();
        },
    }
};
</script>

<style lang="stylus" scoped>
.upload-file
    display inline-block

.overduecheck
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