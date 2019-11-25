<template lang="pug">
    ebrain-main.badtypecode
        ebrain-frame(
            title="不良类别代码配置")
            template(#tools)
                ebrain-tools(:buttons="buttons")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
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
            template(#materialTypeName)
                el-col(:span="12")
                    el-form-item(label="物料类别" prop="materialTypeName")
                        el-input(readonly=true v-model="dialogForm[2].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails('materialTypeName')")
        ebrain-dialog-table(
            :tableLoading="dialogTableLoading"
            :isShow="false"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="55vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleTable"
            @current-change="currentChange"
            @submit="submitFormDialogTable")
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
export default {
    name: 'workshop',
    data() {
        return {
            rowObj: {},
            dialogVisibleTable: false,
            currentRowKeyDialogTable: '',
            dialogTableLoading: false,
            listDetailsData: [],
            listDetailsColumn: [{
                label: '物料类别编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true,
            }],
            conditionList: [],
            ids: [],
            selection: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            tableColumn: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '不良类别代码',
                prop: 'typeCode',
                showOverflowTooltip: true,
            }, {
                label: '不良类别描述',
                prop: 'typeDesc',
                showOverflowTooltip: true,
            }, {
                label: '物料类别名称',
                prop: 'materialTypeName',
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
                label: '不良类别代码',
                prop: 'typeCode',
                value: '',
                required: true,
            }, {
                label: '不良类别描述',
                prop: 'typeDesc',
                value: '',
                required: true,
            }, {
                slot: 'materialTypeName',
                label: '物料类别',
                prop: 'materialTypeName',
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
                permi: 'qc_iqcbadcodetype_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'qc_iqcbadcodetype_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0,
                permi: 'qc_iqcbadcodetype_dels',
            }, {
                label: '全部导出',
                click: () => this.allExport(),
                className: 'iconfont iconstatus-Export_all',
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
                action: '/qc/iqcbadcodetype/import',
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
                label: '不良类别代码',
                prop: 'typeCode',
                value: ''
            }, {
                label: '不良类别描述',
                prop: 'typeDesc',
                value: ''
            }],
            materialTypeCode: '',
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKey: '',
            dialog: '',
            dialogVisible: false,
            searchVisible: true,
        };
    },
    computed: {
        ...mapState({
            sysUser: state => state.sysUser,
        }),
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    watch: {
        dialogVisibleTable(val) {
            if (!val) {
                this.rowObj = {};
            }
        }
    },
    created() {
        this.getData();
    },
    methods: {
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
            this.$http.get('/qc/iqcbadcodetype/page', {
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
        // 上表新增页面
        newRowParent() {
            this.dialog = 'new';
            this.dialogVisible = true;
            this.materialTypeCode = '';
            this.dialogForm[3].value = this.sysUser.nickname;
            this.dialogForm[4].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.materialTypeCode = item.materialTypeCode;
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisible = true;
        },
        selectionChange(selection) {
            this.selection = selection;
            this.ids = selection.map(v => v.id);
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('是否确认删除', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcbadcodetype/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
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
            obj.materialTypeCode = this.materialTypeCode;
            delete obj.updateBy;
            delete obj.updateTime;
            this.submitLoading = true;
            if (this.dialog === 'new') {
                this.$http.post('/qc/iqcbadcodetype/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
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
                this.$http.put('/qc/iqcbadcodetype/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
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
        enterTableDetails() {
            this.rowObj = {};
            this.dialogVisibleTable = true;
            this.getmaterielTypeCodeInfo();
        },
        // 获取物料类型编码
        getmaterielTypeCodeInfo() {
            this.dialogTableLoading = true;
            this.$http.get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree', {
                params: {
                    conditionList: [{
                        fieldName: 'fieldName',
                        operation: 'EQ',
                        value: '1',
                    }]
                }
            }).then(res => {
                this.dialogTableLoading = false;
                this.listDetailsData = res.data;
                this.listDetailsData = this.listDetailsData.filter(item => item.materialTypeCode !== 'SAP');
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
        currentChange(row) {
            this.rowObj = row;
        },
        submitFormDialogTable(type) {
            this.dialogVisibleTable = false;
            if (this.rowObj.materialTypeCode) {
                this.materialTypeCode = this.rowObj.materialTypeCode;
                this.dialogForm[2].value = this.rowObj.materialTypeName;
            } else {
                this.materialTypeCode = '';
                this.dialogForm[2].value = '';
            }
        },
        // 导出所有
        allExport() {
            this.$http.get('/qc/iqcbadcodetype/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有不良类别代码.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids.join(',');
            this.$http.get('/qc/iqcbadcodetype/export', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '选中导出不良类别代码.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/iqcbadcodetype/template', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '不良类别代码模板.xls';
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
.badtypecode
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