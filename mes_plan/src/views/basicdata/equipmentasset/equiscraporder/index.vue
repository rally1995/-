<template lang="pug">
    ebrain-main.equiscraporder
        ebrain-frame(
            title="设备报废单")
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
            template(#declarationUnitName)
                el-col(:span="12")
                    el-form-item(label="申报部门" prop="declarationUnitName" required)
                        el-input(readonly=true v-model="dialogFormParent[2].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search"  :disabled="isDisabled" @click="enterTableDetails('declarationUnitName')")
            template(#equipmentNum)
                el-col(:span="12")
                    el-form-item(label="设备编码" prop="equipmentNum" required)
                        el-input(readonly=true v-model="dialogFormParent[3].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('equipmentNum')")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件" prop="attachment")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            action="/basicdata/equipmentscrapped/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            :disabled="uploadDisabled")
                            el-button(
                                type="primary"
                                :disabled="uploadDisabled") 上传附件
        ebrain-dialog-table(
            :dialogTableSearch="type==='equipmentNum'"
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
            :isShow="type==='equipmentNum'"
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
import moment from 'moment';
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
            parameterColumn: [{
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
            unitColumn: [{
                label: '部门编码',
                prop: 'deptCode',
                showOverflowTooltip: true,
                // searchBy: true,
            }, {
                label: '部门名称',
                prop: 'deptName',
                showOverflowTooltip: true,
                // searchBy: true,
            }],
            tableColumnParent: [{
                label: '报废单号',
                prop: 'scrapCode',
                showOverflowTooltip: true,
            }, {
                label: '设备编码',
                prop: 'equipmentNum',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }, {
                label: '申报部门',
                prop: 'declarationUnitName',
                showOverflowTooltip: true,
            }, {
                label: '申报时间',
                prop: 'declarationDate',
                showOverflowTooltip: true,
            }, {
                label: '使用部门审核状态',
                prop: 'useDepartmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '设备部审核状态',
                prop: 'equipmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }, {
                label: '财务部审核状态',
                prop: 'financeDepartmentStauts',
                showOverflowTooltip: true,
                formatter(row, col, cell) {
                    return dict.transferOutStauts[cell];
                }
            }],
            dialogFormParent: [{
                label: '报废单号',
                prop: 'scrapCode',
                value: '',
                disabled: true,
            }, {
                label: '申报日期',
                prop: 'declarationDate',
                value: '',
                required: true,
                type: 'datetime',
                pickerOption: {
                    disabledDate: time => {
                        return time.getTime() < Date.now() - 8.64e7;
                    }
                },
            }, {
                label: '申报部门',
                slot: 'declarationUnitName',
                prop: 'declarationUnitName',
                value: '',
                disabled: true,
                required: true,
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
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                disabled: true,
            }, {
                label: '固定资产编码',
                prop: 'assetNum',
                value: '',
                required: true,
                disabled: '',
            }, {
                label: '生产厂商',
                prop: 'manufacturers',
                value: '',
                disabled: true,
            }, {
                label: '购置成本',
                prop: 'equipCost',
                value: '',
                disabled: true,
            }, {
                label: '维护人员',
                prop: 'updateByName',
                value: '',
                disabled: true,
            }, {
                label: '数量',
                prop: 'quantity',
                value: '',
                disabled: true,
            }, {
                label: '维护时间',
                prop: 'updateTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                slot: 'upload',
                prop: 'attachment'
            }, {
                label: '报废原因',
                prop: 'scrapReason',
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
            }, {
                label: '财务部意见',
                prop: 'financeDepartmentOpinion',
                value: '',
                type: 'textarea',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_equipmentscrapped_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1,
                permi: 'basicdata_equipmentscrapped_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0,
                permi: 'basicdata_equipmentscrapped_dels',
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
                label: '报废单号',
                prop: 'scrapCode',
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
                    if (v.prop === 'declarationDate' || v.prop === 'scrapReason' || v.prop === 'useDepartmentOpinion' || v.prop === 'equipmentOpinion' || v.prop === 'financeDepartmentOpinion') {
                        v.disabled = false;
                    } else {
                        v.disabled = true;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.rowObj = {};
                this.selection = [];
                this.getDateParent();
                this.$refs.table.clearSelection();
                this.uploadDisabled = false;
            }
        },
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
            this.$http.get('/basicdata/equipmentscrapped/page', {
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
                                value: this.dialogSearchForm[i],
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/deviceaccount/getFilterEquipmentAccountPage', {
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
            this.$http.get('/admin/dept/tree').then(res => {
                this.dialogTableLoading = false;
                this.dialogData = res.data;
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
                case 'equipmentNum':
                    this.dialogColumn = this.parameterColumn;
                    this.getParameterInfo();
                    break;
                case 'declarationUnitName':
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
                case 'equipmentNum':
                    this.getParameterInfo(val);
                    break;
                // case 'declarationUnitName':
                //     this.getUnitInfo(val);
                //     break;
                default:
                    break;
            }
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            switch (this.type) {
                case 'equipmentNum':
                    this.getParameterInfo();
                    break;
                // case 'declarationUnitName':
                //     this.getUnitInfo();
                //     break;
                default:
                    break;
            }
        },
        submitFormDialog(type) {
            this.dialogVisible = false;
            switch (type) {
                case 'equipmentNum':
                    this.dialogFormParent[3].value = this.rowObj.equipNum;
                    this.dialogFormParent[4].value = this.rowObj.equipName;
                    this.dialogFormParent[5].value = this.rowObj.specModel;
                    this.dialogFormParent[6].value = this.rowObj.assetNum;
                    this.dialogFormParent[7].value = this.rowObj.manufacturers;
                    this.dialogFormParent[8].value = this.rowObj.equipCost;
                    this.dialogFormParent[10].value = 1;
                    break;
                case 'declarationUnitName':
                    this.unitCode = this.rowObj.deptCode;
                    this.dialogFormParent[2].value = this.rowObj.deptName;
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
                case 'equipmentNum':
                    this.getParameterInfo();
                    break;
                // case 'declarationUnitName':
                //     this.getUnitInfo();
                //     break;
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
            // obj.attachment = '';
            // // 对文件进行处理
            // this.uploadList.forEach(v => {
            //     obj.attachment = v.url;
            // });
            obj.attachment = this.uploadList.map(v => v.url).join(',');
            obj.declarationUnit = this.unitCode;
            delete obj.scrapCode;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/basicdata/equipmentscrapped/saveEquipmentScrapped', obj).then(() => {
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
                        this.$http.put('/basicdata/equipmentscrapped/updateById', obj).then(() => {
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
            this.uploadList = [];
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[9].value = this.sysUser.nickname;
            this.dialogFormParent[11].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        // 上表修改
        editRowParent(row) {
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.unitCode = this.rowKeyObj.declarationUnit;
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
                this.$http.delete('/basicdata/equipmentscrapped/removeByIds', {
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
            this.uploadDisabled = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.permissions.includes('basicdata_equipmentscrapped_edit')) {
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
                    && `/basicdata/equipmentscrapped/getfile/${v.response.data.bucketName}-${v.response.data.fileName}`;
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
            //     this.$http.get(`/basicdata/equipmentscrapped/deleteFile/${String(fileName)}`);
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
.equiscraporder
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
