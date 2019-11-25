<template lang="pug">
    ebrain-main.badcode
        ebrain-frame(
            title="不良代码配置")
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
            //-             action="/qc/iqcbadcode/import"
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
            template(#typeCode)
                el-col(:span="12")
                    el-form-item(label="不良类别代码" prop="typeCode" required)
                        el-input(readonly=true v-model="dialogForm[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails()")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :current-row-key.sync="currentRowKeyBadCategoryCode"
            :height="550"
            :data="badCategoryCodeData"
            :column="badCategoryCodeColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleBadCategoryCode"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormBadCategoryCode")
</template>

<script>
import { mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'badcode',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            dialogSearchForm: {},
            ids: [],
            selection: [],
            rowObj: {},
            pageTotal_1: 0,
            currentPage_1: 1,
            pageSize_1: 20,
            badCategoryCodeData: [],
            currentRowKeyBadCategoryCode: '',
            dialogVisibleBadCategoryCode: false,
            submitLoading: false,
            tableLoading: false,
            tableData: [],                  // 存储上表信息
            badCategoryCodeColumn: [{
                label: '不良类别代码',
                prop: 'typeCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '不良类别描述',
                prop: 'typeDesc',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableColumn: [{
                type: 'selection',
                width: '50',
                align: 'center'
            }, {
                label: '不良类别代码',
                prop: 'iqcBadCodeType.typeCode',
                showOverflowTooltip: true,
            }, {
                label: '不良类别描述',
                prop: 'iqcBadCodeType.typeDesc',
                showOverflowTooltip: true,
            }, {
                label: '不良代码',
                prop: 'badCode',
                showOverflowTooltip: true,
            }, {
                label: '不良代码名称',
                prop: 'badDesc',
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
                slot: 'typeCode',
            }, {
                label: '不良类别描述',
                prop: 'typeDesc',
                value: '',
                disabled: true,
            }, {
                label: '不良代码',
                prop: 'badCode',
                value: '',
                required: true,
            }, {
                label: '不良代码名称',
                prop: 'badDesc',
                value: '',
                required: true,
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
                permi: 'qc_iqcbadcode_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'qc_iqcbadcode_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0,
                permi: 'qc_iqcbadcode_dels',
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
                action: '/qc/iqcbadcode/import',
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
                label: '不良代码',
                prop: 'badCode',
                value: ''
            }, {
                label: '不良代码名称',
                prop: 'badDesc',
                value: ''
            }],
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
        dialogVisibleBadCategoryCode(val) {
            if (!val) {
                this.dialogSearchForm = {};
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
            this.$http.get('/qc/iqcbadcode/page', {
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
        // 进入 table 弹窗
        enterTableDetails() {
            this.dialogVisibleBadCategoryCode = true;
            this.getBadCategoryCode();
        },
        // 上表新增页面
        newRowParent() {
            this.dialog = 'new';
            this.dialogVisible = true;
            this.dialogForm[4].value = this.sysUser.nickname;
            this.dialogForm[5].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 上表修改页面
        editRowParent() {
            this.dialog = 'edit';
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                if (v.prop === 'typeCode' || v.prop === 'typeDesc') {
                    v.value = item.iqcBadCodeType && item.iqcBadCodeType[v.prop];
                } else {
                    v.value = item[v.prop];
                }
            });
            this.dialogVisible = true;
        },
        // 批量删除
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
                this.$http.delete('/qc/iqcbadcode/removeByIds', {
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
            delete obj.updateBy;
            delete obj.updateTime;
            delete obj.typeCode;
            delete obj.typeDesc;
            obj.typeId = this.rowObj.id;
            this.submitLoading = true;
            if (this.dialog === 'new') {
                this.$http.post('/qc/iqcbadcode/save', obj).then(() => {
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
                this.$http.put('/qc/iqcbadcode/updateById', obj).then(() => {
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
        // 获取table弹框内的点击数据
        currentChange(row) {
            this.rowObj = row;
        },
        // 获取不良类型代码配置信息
        getBadCategoryCode(val = 1) {
            this.tableLoading = true;
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
            this.$http.get('/qc/iqcbadcodetype/page', {
                params,
            }).then(res => {
                this.tableLoading = false;
                this.currentPage_1 = val;
                this.badCategoryCodeData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        changeCurrent_1(val) {
            this.getBadCategoryCode(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getBadCategoryCode();
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getBadCategoryCode();
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
        // table 弹窗确认按钮
        submitFormBadCategoryCode() {
            this.dialogVisibleBadCategoryCode = false;
            this.dialogForm[0].value = this.rowObj.typeCode;
            this.dialogForm[1].value = this.rowObj.typeDesc;
        },
        // 导出所有
        allExport() {
            this.$http.get('/qc/iqcbadcode/exportAll', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有不良代码.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids.join(',');
            this.$http.get('/qc/iqcbadcode/export', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '选中导出不良代码.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/iqcbadcode/template', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '不良代码模板.xls';
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
.badcode
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