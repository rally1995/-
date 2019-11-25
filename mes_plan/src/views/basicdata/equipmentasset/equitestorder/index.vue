<template lang="pug">
    ebrain-main.equitestorder
        ebrain-frame(
            title="设备移交验收单")
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
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
            template(#equipmentNum)
                el-col(:span="12")
                    el-form-item(label="设备编码" prop="equipmentNum" required)
                        el-input(readonly=true v-model="dialogFormParent[1].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件" prop="attachment")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            action="/basicdata/equiphandoveracceptance/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            :disabled="uploadDisabled")
                            el-button(
                                type="primary"
                                :disabled="uploadDisabled") 上传附件
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
            uploadDisabled: false,
            uploadList: [],
            conditionList: [],
            rowKeyObj: {},
            isDisabled: false,
            ids: [],
            selection: [],
            unitCode: '',
            type: '',
            dialogTableLoading: false,
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogVisible: false,
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
            dialogColumn: [{
                label: '设备编码',
                prop: 'equipNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, col, cell) => {
                    return this.storeDict['device_classification'][cell];
                }
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '移交验收单',
                prop: 'transferAcceptanceCode',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备编码',
                prop: 'equipmentNum',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '移交人员',
                prop: 'transferPersonnel',
                showOverflowTooltip: true,
            }, {
                label: '移交时间',
                prop: 'transferDate',
                showOverflowTooltip: true,
            }, {
                label: '验收人员',
                prop: 'inspectionPersonnel',
                showOverflowTooltip: true,
            }, {
                label: '验收时间',
                prop: 'inspectionDate',
                showOverflowTooltip: true,
            }, {
                label: '移交部门审核状态',
                prop: 'transferDepartmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '使用部门审核状态',
                prop: 'useDepartmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '设备部门审核状态',
                prop: 'equipmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }],
            dialogFormParent: [{
                label: '移交验收单号',
                prop: 'transferAcceptanceCode',
                value: '',
                disabled: true,
            }, {
                label: '设备编码',
                slot: 'equipmentNum',
                prop: 'equipmentNum',
                value: '',
                required: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                disabled: true,
                required: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                disabled: true,
            }, {
                label: '移交人员',
                prop: 'transferPersonnel',
                value: '',
                required: true,
            }, {
                label: '验收人员',
                prop: 'inspectionPersonnel',
                value: '',
                required: true,
            }, {
                label: '移交时间',
                prop: 'transferDate',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const lastVal = this.dialogFormParent.find(v => v.prop === 'inspectionDate');
                        if (lastVal) this.$refs.form.$refs.form.clearValidate('transferDate');
                        if (value) {
                            const date1 = new Date(value);
                            const date2 = new Date(lastVal.value);
                            if (date1 > date2) {
                                callback(new Error('移交时间不能大于验收时间!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback(new Error('移交时间不能为空!'));
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '验收时间',
                prop: 'inspectionDate',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        const firstVal = this.dialogFormParent.find(v => v.prop === 'transferDate');
                        if (firstVal) this.$refs.form.$refs.form.clearValidate('inspectionDate');
                        if (value) {
                            const date1 = new Date(firstVal.value);
                            const date2 = new Date(value);
                            if (date1 > date2) {
                                callback(new Error('验收时间不能小于移交时间!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback(new Error('验收时间不能为空!'));
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                slot: 'upload',
                prop: 'attachment'
            }, {
                label: '移交内容',
                prop: 'transferContent',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '移交部门意见',
                prop: 'transferDepartmentOpinion',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '使用部门意见',
                prop: 'useDepartmentOpinion',
                value: '',
                type: 'textarea',
                required: true,
            }, {
                label: '设备部意见',
                prop: 'equipmentOpinion',
                value: '',
                type: 'textarea',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_equiphandoveracceptance_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1,
                permi: 'basicdata_equiphandoveracceptance_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0,
                permi: 'basicdata_equiphandoveracceptance_dels',
            }, {
                label: '查看',
                click: () => this.look(),
                className: 'iconfont iconsee',
                disabled: () => this.selection.length !== 1,
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '移交验收单',
                prop: 'transferAcceptanceCode',
                value: ''
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
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
                    if (v.prop === 'transferAcceptanceCode' || v.prop === 'equipName' || v.prop === 'specModel') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.rowObj = {};
                this.selection = [];
                this.getDateParent();
                this.$refs.table.clearSelection();
                this.uploadList = [];
                this.uploadDisabled = false;
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('device_classification'),
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
            this.$http.get('/basicdata/equiphandoveracceptance/page', {
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
        // 获取台账信息
        getParameterInfo(val = 1) {
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
                                operation: 'LIKE',
                                joinType: 'AND',
                                value: this.dialogSearchForm[i],
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/deviceaccount/page', {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        enterTableDetails() {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.dialogVisible = true;
            this.getParameterInfo();
        },
        // 获取当前行
        currentChange(row) {
            this.rowObj = row;
        },
        changeCurrent_1(val) {
            this.getParameterInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getParameterInfo();
        },
        submitFormDialog() {
            this.dialogVisible = false;
            this.dialogFormParent[1].value = this.rowObj.equipNum;
            this.dialogFormParent[2].value = this.rowObj.equipName;
            this.dialogFormParent[3].value = this.rowObj.specModel;
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getParameterInfo();
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
            obj.attachment = this.uploadList.map(v => v.url).join(',');
            delete obj.transferAcceptanceCode;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/basicdata/equiphandoveracceptance/saveEquipHandoverAcceptance', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogVisibleParent = false;
                            this.currentPage = 1;
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.rowKeyObj.id;
                        this.$http.put('/basicdata/equiphandoveracceptance/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
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
            this.uploadList = [];
            this.dialogFormParent[0].value = '系统自动生成';
        },
        // 上表修改
        editRowParent(row) {
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.dialogVisibleParent = true;
            if (this.rowKeyObj[`attachment`]) {
                const list = this.rowKeyObj[`attachment`].split(',');
                this.uploadList = list.map(v => ({
                    url: v,
                    name: v.replace(/.+?@/, ''),
                }));
            } else {
                this.uploadList = [];
            }
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
            // this.$refs.table.clearSelection();
        },
        selectionChange(selection) {
            this.selection = selection;
            this.ids = selection.map(v => v.id);
        },
        delRowParent() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/equiphandoveracceptance/removeByIds', {
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
            const list = item.attachment
                ? item.attachment.split(',')
                : [];
            this.uploadList = list.map(v => ({
                url: v,
                name: v.replace(/.+?@/, ''),
            }));
            this.uploadDisabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('basicdata_equiphandoveracceptance_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        // 文件上传
        uploadChangeHandler(file, fileList) {
            const newFileList = fileList.map(v => {
                if (v.url) return v;
                const url = v.response
                    && v.response.data
                    && `/basicdata/equiphandoveracceptance/getfile/${v.response.data.bucketName}-${v.response.data.fileName}`;
                const name = v.response
                    && v.response.data
                    && v.response.data.fileName.replace(/.+?@/, '');
                return {
                    ...v,
                    name,
                    url,
                };
            });
            this.uploadList = newFileList;
        },
        // successHandler(res, file, fileList) {
        //     this.$message.success(`上传成功!`);
        // },
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
            // if (file.status === 'success') {
            //     const { url } = file;
            //     const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            //     const fileName = url.match(reg);
            //     this.$http.get(`/basicdata/equiphandoveracceptance/deleteFile/${String(fileName)}`);
            // }
            // this.$message.success('删除成功!');
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },
    }
};
</script>

<style lang="stylus" scoped>
.equitestorder
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
