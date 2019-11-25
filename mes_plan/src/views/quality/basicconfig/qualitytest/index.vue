<template lang="pug">
    ebrain-main.qualitytest
        ebrain-frame(
            title="质检方案")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @current-change="currentChange_top"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRowParent"
                    @selection-change="selectionChange_top"
                    row-key="id"
                    @row-click="getDataSon"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="检验项目")
            template(#tools)
                ebrain-tools(:buttons="btnsDown")
                //- ebrain-tools(
                //-     :add="newRowSon"
                //-     :del="delRowSon"
                //-     :addDisabled="editDisabledParent"
                //-     :delDisabled="selection_down.length===0 || editDisabledParent")
                //-     button(
                //-         :disabled="!currentRowKeyParent"
                //-         :class="{disabled: !currentRowKeyParent}"
                //-         @click="allExport")
                //-         i.iconfont.iconstatus-copy
                //-         |全部导出
                //-     button(
                //-         @click="exportSelected"
                //-         :disabled="selection_down.length===0"
                //-         :class="{disabled: selection_down.length===0}")
                //-         i.iconfont.iconstatus-copy
                //-         |导出选中
                //-     button(
                //-         @click="downloadTemplate")
                //-         i.iconfont.iconstatus-copy
                //-         |下载模板
                //-     ebrain-upload.upload-file(
                //-         :action="'/qc/iqcinspectplan/importItems/'+currentRowKeyParent"
                //-         :on-success="successFile"
                //-         :show-file-list="false")
                //-         button(
                //-             :disabled="editDisabledParent"
                //-             :class="{disabled: editDisabledParent}")
                //-             i.iconfont.iconstatus-download
                //-             |导入
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :isShow='false'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @selection-change="selectionChange_down"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#operate)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="操作指导书")
                        ebrain-upload.upload(
                            :file-list="uploadFile"
                            :limit="10"
                            :auto-upload="false"
                            :on-change="changeHandlerFile"
                            :on-remove="removeChangeHandlerFile"
                            :on-preview="previewChangeHandlerFile"
                            action=""
                            name="fileList")
                            el-button(type="primary") 上传操作指导书
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            :auto-upload="false"
                            :on-change="changeHandler"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            action=""
                            name="fileList")
                            el-button(type="primary") 上传附件
        ebrain-dialog-table(
            :tableLoading="dialogTableLoading"
            :isShow=false
            row-key="id"
            :pageSize='pageSize_1'
            :currentPage='currentPage_1'
            :pageTotal='pageTotal_1'
            @changeCurrent="changeCurrent_1"
            @changeSize='changeSize_1'
            :current-row-key.sync="currentRowKeyCheckItems"
            :height="550"
            :data="checkItemsData"
            :column="checkItemsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleCheckItems"
            @current-change="currentChange"
            @submit="submitFormCheckItems")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'qualitytest',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            ids_down: [],
            ids: [],
            selection_top: [],
            selection_down: [],
            dialogTableLoading: false,
            ishaschildren: 0,
            rowObj: {},
            rowObj_top: {},
            uploadFile: [],
            dialogVisibleCheckItems: false,
            currentRowKeyCheckItems: '',
            checkItemsData: [],
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            uploadList: [],
            tableDataSon: [],
            checkItemsColumn: [{
                label: '检验项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '检验项目等级',
                prop: 'itemLevel',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_LEVEL'][cell];
                }
            }, {
                label: '检验项目类型',
                prop: 'itemType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_TYPE'][cell];
                }
            }, {
                label: '检验类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '检验工序',
                prop: 'inspectStep',
                showOverflowTooltip: true,
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
            }],
            tableColumnParent: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '质检方案编码',
                prop: 'planCode',
                showOverflowTooltip: true,
            }, {
                label: '检验方案名称',
                prop: 'planName',
                showOverflowTooltip: true,
            }, {
                label: '检验类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '状态',
                prop: 'inspectStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_PLAN_INSPECT_STATUS'][cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }, {
                label: '维护人员',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                type: 'selection',
                width: '55',
                align: 'center',
            }, {
                label: '检验项目代码',
                prop: 'itemCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '检验项目等级',
                prop: 'itemLevel',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_LEVEL'][cell];
                }
            }, {
                label: '检验项目类型',
                prop: 'itemType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_TYPE'][cell];
                }
            }, {
                label: '检验类型',
                prop: 'inspectType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_TYPE'][cell];
                }
            }, {
                label: '检验工序',
                prop: 'inspectStep',
                showOverflowTooltip: true,
            }, {
                label: '分析方法',
                prop: 'analysisMethod',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD'][cell];
                }
            }],
            dialogFormParent: [{
                label: '检验方案编码',
                prop: 'planCode',
                disabled: true,
                value: '',
            }, {
                label: '检验方案名称',
                prop: 'planName',
                required: true,
                value: '',
            }, {
                label: '检验类型',
                prop: 'inspectType',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_TYPE'],
                required: true,
                disabled: false,
                value: '',
            }, {
                label: '状态',
                prop: 'inspectStatus',
                type: 'select',
                option: () => this.storeDict['DIC_IQC_INSPECT_PLAN_INSPECT_STATUS'],
                required: true,
                disabled: true,
                value: '',
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }, {
                slot: 'operate'
            }, {
                label: '维护人员',
                prop: 'updateBy',
                disabled: true,
                value: '',
            }, {
                label: '维护日期',
                prop: 'updateTime',
                disabled: true,
                value: '',
            }, {
                slot: 'upload'
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectplan_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'qc_iqcinspectplan_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection_top.length === 0 || this.isDelete,
                permi: 'qc_iqcinspectplan_del',
            }, {
                label: '复制',
                click: () => this.copy(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-copy',
                permi: 'qc_iqcinspectplan_add',
            }, {
                label: '启用',
                click: () => this.startUsing(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-start-up',
                permi: 'qc_iqcinspectplan_enable',
            }, {
                label: '停用',
                click: () => this.blockUp(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconState-Stop',
                permi: 'qc_iqcinspectplan_disable',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'qc_iqcinspectplanitem_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection_down.length === 0 || this.editDisabledParent,
                permi: 'qc_iqcinspectplanitem_dels',
            }, {
                label: '全部导出',
                click: () => this.allExport(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导出选中',
                click: () => this.exportSelected(),
                disabled: () => this.selection_down.length === 0,
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '下载模板',
                click: () => this.downloadTemplate(),
                className: 'iconfont iconstatus-copy',
                permi: false,
            }, {
                label: '导入',
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-download',
                permi: false,
                action: '',
                onSuccess: (response, file, fileList) => this.uploadSuccess(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }],
            searchForm: [{
                label: '质检方案编码',
                prop: 'planCode',
                value: ''
            }, {
                label: '质检方案名称',
                prop: 'planName',
                value: ''
            }],
            isDelete: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            searchVisible: true,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !item || item.inspectStatus !== '0';
        },
        editDisabledSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return this.ishaschildren === 0 || this.currentRowKeySon === '' || (item && item.status !== 0);
        },
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.uploadList = [];
                this.uploadFile = [];
            }
        },
        currentRowKeyParent(val) {
            if (val) {
                this.btnsDown[5].action = `/qc/iqcinspectplan/importItems/${this.currentRowKeyParent}`;
            }
        }
    },
    created() {
        this.queryDict('DIC_IQC_INSPECT_TYPE');
        this.queryDict('DIC_IQC_INSPECT_PLAN_INSPECT_STATUS');
        this.queryDict('DIC_IQC_INSPECT_ITEM_LEVEL');
        this.queryDict('DIC_IQC_INSPECT_ITEM_TYPE');
        this.queryDict('DIC_IQC_INSPECT_ITEM_ANALYSIS_METHOD');
        this.getDataParent();
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
            this.getDataParent();
        },
        // 获取检验项目列表
        getTestItems(val = 1) {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogTableLoading = true;
            this.$http.get('/qc/iqcinspectitem/page', {
                params: {
                    current: val,
                    size: this.pageSize_1,
                    conditionList: [{
                        fieldName: 'inspectType',
                        operation: 'EQ',
                        value: item.inspectType,
                    }, {
                        fieldName: 'valid',
                        operation: 'EQ',
                        value: 'Y',
                    }]
                },
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.checkItemsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        changeCurrent_1(val) {
            this.getTestItems(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getTestItems();
        },
        // 获取上表信息
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/qc/iqcinspectplan/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
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
        // 获取上表的删除项
        selectionChange_top(selection) {
            this.selection_top = selection;
            this.isDelete = false;
            this.selection_top.forEach(item => {
                if (item.inspectStatus !== '0') {
                    this.isDelete = true;
                }
            });
            this.ids = this.selection_top.map(v => v.id);
        },
        // 上表新增页面
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[2].disabled = false;
            this.dialogFormParent[3].value = '0';
            this.dialogFormParent[6].value = this.sysUser.nickname;
            this.dialogFormParent[7].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 上表修改页面
        editRowParent() {
            this.dialogParent = 'edit';
            this.dialogFormParent[2].disabled = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            Promise.all([this.getUploadListFile(item.id, item.inspectBook), this.getUploadList(item.id, item.inspectFile)]);
            this.dialogVisibleParent = item.inspectStatus === '0' ? true : false;
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
        },
        // 复制
        copy() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.submitLoading = true;
            this.$confirm('是否需要复制', {
                type: 'warning'
            }).then(() => {
                this.$http.post(`/qc/iqcinspectplan/copy/${item.id}`).then(() => {
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
            if (this.tableDataSon.length === 0) {
                this.$confirm('子表无检验项目不能启用！', {
                    type: 'warning',
                });
                return;
            }
            if (item.inspectStatus === '1') {
                this.$confirm('已启用无需在启用。', '提示', {
                    type: 'warning'
                });
            } else {
                this.$confirm('是否启用？', '提示', {
                    type: 'warning'
                }).then(() => {
                    const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                    this.$http.put(`/qc/iqcinspectplan/setEnable/${item.id}`).then(() => {
                        this.getDataParent();
                    });
                });
            }
        },
        // 停用
        blockUp() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.inspectStatus === '0') {
                this.$confirm('草稿无须停用，可直接删除。', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete('/qc/iqcinspectplan/removeById', {
                        data: [this.currentRowKeyParent],
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
            } else if (item.inspectStatus === '1') {
                this.$confirm('是否停用？', '提示', {
                    type: 'warning'
                }).then(() => {
                    const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                    this.$http.put(`/qc/iqcinspectplan/setDisable/${item.id}`).then(() => {
                        this.getDataParent();
                    });
                });
            } else {
                this.$confirm('已停用无须再停用。', '提示', {
                    type: 'warning'
                });
            }
        },
        currentChange_top(row) {
            this.rowObj_top = row;
        },
        // 删除上表数据
        delRowParent() {
            // const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectplan/removeById', {
                    data: this.ids,
                }).then(() => {
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
        },
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop) obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                return this.$http.post('/qc/iqcinspectplan/save', obj).then((res) => {
                    const { data } = res;
                    Promise.all([this.uploadAttach(data.id, data.inspectFile), this.uploadAttachFile(data.id, data.inspectBook)])
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataParent();
                            this.$message({
                                message: '新增成功!',
                                type: 'success'
                            });
                            this.dialogVisibleParent = false;
                        });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else if (this.dialogParent === 'edit') {
                obj.id = this.currentRowKeyParent;
                return this.$http.put('/qc/iqcinspectplan/updateById', obj).then(() => {
                    const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                    Promise.all([this.uploadAttach(obj.id, item.inspectFile), this.uploadAttachFile(obj.id, item.inspectBook)])
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            this.dialogVisibleParent = false;
                        });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 获取下表信息
        getDataSon() {
            this.currentRowKeySon = '';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);// 获取点击的那一组数据
            this.tableLoadingDown = true;
            this.$http.get(`/qc/iqcinspectplan/getItemsById/${item.id}`).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data;
            });
        },
        selectionChange_down(selection) {
            this.selection_down = selection;
            this.ids_down = this.selection_down.map(v => v.id);
        },
        // 下表新增
        newRowSon() {
            this.dialogVisibleCheckItems = true;
            this.getTestItems();
        },
        currentChange(row) {
            this.rowObj = row;
        },
        // 新增提交
        submitFormCheckItems() {
            this.submitLoading = true;
            this.$http.post('/qc/iqcinspectplanitem/save', {
                planId: this.currentRowKeyParent,
                itemId: this.rowObj.id
            }).then(() => {
                this.submitLoading = false;
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
                this.dialogVisibleCheckItems = false;
                this.getDataSon();
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // 下表删除
        delRowSon() {
            this.$confirm('是否确认删除？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/qc/iqcinspectplanitem/removeByIds', {
                    data: this.ids_down,
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
        // 导出所有
        allExport() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.get(`/qc/iqcinspectplan/exportItems/${item.id}`, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出所有质检方案检验项目.xls';
                    $a.click();
                }
            });
        },
        // 导出选中
        exportSelected() {
            const ids = this.ids_down.join(',');
            this.$http.get('/qc/iqcinspectplan/exportItemsByItemIds', {
                params: { ids },
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '导出选中质检方案检验项目.xls';
                    $a.click();
                }
            });
        },
        // 导出模板
        downloadTemplate() {
            this.$http.get('/qc/iqcinspectplan/ItemsTemplate', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '质检方案检验项目模板.xls';
                    $a.click();
                }
            });
        },
        // 导入
        uploadSuccess() {
            this.getDataSon();
        },
        // 获取操作文件
        changeHandlerFile(file, fileList) {
            this.uploadFile = fileList;
        },
        removeChangeHandlerFile(file, fileList) {
            if (file.status === 'success') {
                this.$http.delete(`/qc/qcfile/removeById/${file.id}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success('删除成功!');
                    }
                });
            }
        },
        previewChangeHandlerFile(file) {
            if (file.status === 'success') {
                window.open(file.url, '_blank');
            } else if (file.status === 'ready') {
                const f = new FileReader();
                f.addEventListener('load', () => {
                    window.open(f.result, '_blank');
                });
                f.readAsDataURL(file.raw);
            }
        },
        // 获取上传文件
        changeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        // 删除文件
        removeChangeHandler(file, fileList) {
            if (file.status === 'success') {
                this.$http.delete(`/qc/qcfile/removeById/${file.id}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success('删除成功!');
                    }
                });
            }
        },
        previewChangeHandler(file) {
            if (file.status === 'success') {
                window.open(file.url, '_blank');
            } else if (file.status === 'ready') {
                const f = new FileReader();
                f.addEventListener('load', () => {
                    window.open(f.result, '_blank');
                });
                f.readAsDataURL(file.raw);
            }
        },
        // 获取文件
        getUploadList(id, code) {
            return this.$http.get(`/qc/qcfile/getList/${code}/${id}`).then(({ data }) => {
                this.uploadList = data.map(v => ({
                    name: v.fileName,
                    url: v.fileUrl,
                    id: v.id,
                }));
            });
        },
        // 获取文件
        getUploadListFile(id, code) {
            return this.$http.get(`/qc/qcfile/getList/${code}/${id}`).then(({ data }) => {
                this.uploadFile = data.map(v => ({
                    name: v.fileName,
                    url: v.fileUrl,
                    id: v.id,
                }));
            });
        },
        // 上传附件
        uploadAttach(businessId, businessCode) {
            let fd = new FormData();
            if (!this.uploadList.some(v => v.status === 'ready')) return Promise.resolve();
            this.uploadList.forEach(v => {
                if (v.status === 'ready') {
                    fd.append('fileList', v.raw);
                }
            });
            return this.$http.post(`/qc/qcfile/save/${businessCode}/${businessId}`, fd, {
                headers: {
                    contentType: 'multipart/form-data',
                },
            });

        },
        uploadAttachFile(businessId, businessCode) {
            let fd = new FormData();
            if (!this.uploadFile.some(v => v.status === 'ready')) return Promise.resolve();
            this.uploadFile.forEach(v => {
                if (v.status === 'ready') {
                    fd.append('fileList', v.raw);
                }
            });
            return this.$http.post(`/qc/qcfile/save/${businessCode}/${businessId}`, fd, {
                headers: {
                    contentType: 'multipart/form-data',
                },
            });

        },
    }
};
</script>

<style lang="stylus" scoped>
.upload-file
    display inline-block
.qualitytest
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
