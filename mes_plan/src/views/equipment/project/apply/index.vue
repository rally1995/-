<template lang="pug">
    ebrain-main.apply
        ebrain-frame.halfHeight(
            title="设备项目申请")
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
                    @row-click="getDateSon"
                    row-key="id"
                    @row-dblclick="rowDblClickHandler"
                    @selection-change="selectionChange"
                    @current-change="currentChange_List"
                    highlight-current-row)
        ebrain-frame.halfHeight(
            title="项目明细清单")
            template(#table)
                ebrain-box-table(
                    :columnCheck="false"
                    :loading="loading_down"
                    :pageSize="pageSize_down"
                    :pageCurrent="currentPage_down"
                    :pageTotal="pageTotal_down"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @page-change="changeCurrent_down"
                    @size-change="changeSize_Down"
                    :highlight-current-row="false")
        ebrain-dialog(
            :expandVisible="collapse"
            ref="form"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#button)
                ebrain-tools.butsDialog(:buttons="btnsDialog")
            template(#projectLeaderName)
                el-col(:span="12")
                    el-form-item(label="项目负责人" prop="projectLeaderName" required)
                        el-input(readonly=true v-model="dialogFormParent[3].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search"  :disabled="isDisabled" @click="enterTableDetails('projectLeaderName')")
            template(#applicantPersonnelName)
                el-col(:span="12")
                    el-form-item(label="申请人" prop="applicantPersonnelName" required)
                        el-input(readonly=true v-model="dialogFormParent[6].value" :disabled="isDisabled")
                            el-button(slot="append" icon="el-icon-search" :disabled="isDisabled" @click="enterTableDetails('applicantPersonnelName')")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件" prop="attachment")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="10"
                            action="/devicemanager/equipprojectapp/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler"
                            :disabled="uploadDisabled")
                            el-button(
                                type="primary"
                                :disabled="uploadDisabled") 上传附件
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            ebrain-frame(
                title="项目明细清单")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom")
                template(#table)
                    div(style="height:300px")
                        ebrain-box-table(
                            ref="dialogTable"
                            :loading='tableLoadingDownDialog'
                            :pageSize='pageSizeDownDialog'
                            :pageCurrent='currentPageDownDialog'
                            :pageTotal='pageTotalDownDialog'
                            :data="tableDataDetailDialog"
                            :column="tableColumnSonDialog"
                            @page-change="changeCurrentDownDialog"
                            @size-change="changeSizeDownDialog"
                            @selection-change="getSelectionDownDialog"
                            row-key="id"
                            highlight-current-row)
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="staffColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @select="selectChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            :disabled="!selectionArr.length"
            @submit="submitFormDialog(type)")
        ebrain-dialog(
            :submitLoading="submitLoadingDetailDialog"
            :visible.sync="dialogVisibleDetailDialog"
            :form.sync="dialogFormDetailDialog"
            @submit="submitFormDetailDialog")
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/devicemanager/equipprojectappdet/exportAllList/'+this.projectApplicationCode"
            :params="exportIds"
            :before-export="handlerExport")
</template>

<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    name: 'apply',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            selectionArr: [],
            uploadDisabled: false,
            exportIds: [],
            exportFilename: '',
            dialogVisabledExport: false,
            uploadList: [],
            conditionList: [],
            rowObj_main: {},
            islook: false,
            isDelete: false,
            idsDetailDialog: [],
            selectionDetailDialog: [],
            projectApplicationId: '',
            projectApplicationCode: '',
            dialogVisibleDetailDialog: false,
            submitLoadingDetailDialog: false,
            tableLoadingDownDialog: false,
            pageSizeDownDialog: 20,
            currentPageDownDialog: 1,
            pageTotalDownDialog: 0,
            tableDataDetailDialog: [],
            collapse: false,
            pageSize_down: 20,
            pageTotal_down: 0,
            currentPage_down: 1,
            tableDataSon: [],
            loading_down: false,
            projectLeader: '',
            applicantPersonnel: '',
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
            dialogFormDetailDialog: [{
                label: '子项名称',
                prop: 'subItemName',
                value: '',
                required: true,
            }, {
                label: '子项描述',
                prop: 'subItemDescribe',
                value: '',
                required: true,
                type: 'textarea'
            }],
            tableColumnSon: [{
                label: '子项名称',
                prop: 'subItemName',
                showOverflowTooltip: true,
            }, {
                label: '子项描述',
                prop: 'subItemDescribe',
                showOverflowTooltip: true,
            }],
            tableColumnSonDialog: [{
                label: '子项名称',
                prop: 'subItemName',
                showOverflowTooltip: true,
            }, {
                label: '子项描述',
                prop: 'subItemDescribe',
                showOverflowTooltip: true,
            }],
            staffColumn: [{
                type: 'selection',
                width: '50',
                align: 'center',
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '员工名称',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '岗位',
                prop: 'postName',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '申请单号',
                prop: 'projectApplicationCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目单号',
                prop: 'itemNo',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '项目负责人',
                prop: 'projectLeaderName',
                showOverflowTooltip: true,
            }, {
                label: '立项时间',
                prop: 'projectTime',
                showOverflowTooltip: true,
            }, {
                label: '申请人',
                prop: 'applicantPersonnelName',
                showOverflowTooltip: true,
            }, {
                label: '申请时间',
                prop: 'applicantDate',
                showOverflowTooltip: true,
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.transferOutStauts[cell];
                }
            }],
            dialogFormParent: [{
                label: '项目申请单号',
                prop: 'projectApplicationCode',
                value: '',
                disabled: true,
            }, {
                label: '项目编号',
                prop: 'itemNo',
                value: '',
                required: true,
            }, {
                label: '项目名称',
                prop: 'itemName',
                value: '',
                required: true,
            }, {
                label: '项目负责人',
                slot: 'projectLeaderName',
                prop: 'projectLeaderName',
                value: '',
                required: true,
            }, {
                label: '立项时间',
                prop: 'projectTime',
                value: '',
                required: true,
                type: 'datetime',
            }, {
                label: '项目类型',
                prop: 'projectType',
                value: '',
                type: 'select',
                option: () => this.storeDict['PROJECT_TYPE'],
                required: true,
            }, {
                label: '申请人',
                slot: 'applicantPersonnelName',
                prop: 'applicantPersonnelName',
                value: '',
            }, {
                label: '申请时间',
                prop: 'applicantDate',
                value: '',
                required: true,
                type: 'datetime',
            }, {
                label: '审核人',
                prop: 'reviewerPersonnellName',
                value: '',
                disabled: true,
            }, {
                label: '审核时间',
                prop: 'reviewerDate',
                value: '',
                disabled: true,
                type: 'datetime',
            }, {
                label: '审核状态',
                prop: 'reviewerStatus',
                value: '',
                type: 'select',
                option: dict.transferOutStauts,
                disabled: true,
            }, {
                label: '创建人员',
                prop: 'createByName',
                value: '',
                disabled: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                slot: 'upload',
                prop: 'attachment'
            }, {
                label: '立项原因',
                prop: 'projectReasons',
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
            }, {
                label: '总经理意见',
                prop: 'generalManagerOpinion',
                value: '',
                type: 'textarea',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_equipprojectapp_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.selection.length !== 1 || this.selection[0].reviewerStatus === '1',
                permi: 'devicemanager_equipprojectapp_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selection.length === 0 || this.isDelete,
                permi: 'devicemanager_equipprojectapp_dels',
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
                label: '申请单号',
                prop: 'projectApplicationCode',
                value: ''
            }, {
                label: '项目名称',
                prop: 'itemName',
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
            }, {
                label: '审核',
                loading: false,
                click: () => this.submitStatus(),
                disabled: () => this.btnsDialog[0].label === '保存' || this.islook,
                className: 'iconfont iconstatus-examine',
                permi: 'devicemanager_equipprojectapp_audit',
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.dialogParent === 'new' || this.islook,
                permi: 'devicemanager_equipprojectapp_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.selectionDetailDialog.length === 0 || this.islook,
                permi: 'devicemanager_equipprojectapp_dels',
            }, {
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                disabled: () => this.dialogParent === 'new' || !this.tableDataDetailDialog.length,
                permi: false,
            }],
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
                this.islook = false;
                this.tableDataDetailDialog = [];
                this.projectApplicationCode = '';
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'projectApplicationCode' || v.prop === 'reviewerPersonnellName' || v.prop === 'reviewerDate' || v.prop === 'reviewerStatus' || v.prop === 'createByName' || v.prop === 'createTime') {
                        v.disabled = true;
                    } else {
                        v.disabled = false;
                    }
                });
                this.isDisabled = false;
                this.btnsDialog[0].disabled = false;
                this.currentPageDownDialog = 1;
                this.pageSizeDownDialog = 20;
                this.pageTotalDownDialog = 0;
                this.tableDataSon = [];
                this.getDateParent();
                this.$refs.table.setCurrentRow();
                this.uploadDisabled = false;
                this.selectionDetailDialog = [];
                this.idsDetailDialog = [];
                this.$refs.dialogTable.clearSelection();
                this.dialogParent = '';
            }
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '项目明细清单';
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.selectionArr = [];
            }
        }
    },
    created() {
        Promise.all([
            this.queryDict('PROJECT_TYPE'),
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
        // 主表搜索
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
            this.$http.get('/devicemanager/equipprojectapp/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.loading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.$refs.table.setCurrentRow();
            });
        },
        // 获取员工信息
        getStaffInfo(val = 1) {
            this.dialogTableLoading = true;
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    value: '0',
                    joinType: 'AND',
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
            this.$http.get('/basicdata/dicpersonnel/page', {
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
            this.getStaffInfo();
        },
        // 获取当前行
        currentChange(row) {
            this.rowObj = row;
        },
        selectChange(selection) {
            this.selectionArr = selection;
        },
        changeCurrent_1(val) {
            this.getStaffInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getStaffInfo();
        },
        submitFormDialog(type) {
            this.dialogVisible = false;
            switch (type) {
                case 'projectLeaderName':
                    this.projectLeader = this.selectionArr.map(v => v.personnelNumber).join(',');
                    this.dialogFormParent[3].value = this.selectionArr.map(v => v.personnelFullName).join(', ');
                    break;
                case 'applicantPersonnelName':
                    this.applicantPersonnel = this.selectionArr.map(v => v.personnelNumber).join(',');
                    this.dialogFormParent[6].value = this.selectionArr.map(v => v.personnelFullName).join(', ');
                    // this.applicantPersonnel = this.rowObj.personnelNumber;
                    // this.dialogFormParent[6].value = this.rowObj.personnelFullName;
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
            this.getStaffInfo();
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
            obj.projectLeader = this.projectLeader;
            obj.applicantPersonnel = this.applicantPersonnel;
            delete obj.projectApplicationCode;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    this.btnsDialog[0].loading = true;
                    if (this.dialogParent === 'new') {
                        this.$http.post('/devicemanager/equipprojectapp/saveEquipProjectApp', obj).then(res => {
                            this.projectApplicationId = res.data.id;
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.$message({
                                message: '保存成功!',
                                type: 'success',
                            });
                            this.dialogFormParent.forEach(v => {
                                v.value = res.data[v.prop];
                            });
                            this.projectApplicationCode = res.data.projectApplicationCode;
                            // this.btnsDialog[0].label = '修改';
                            this.btnsDialog[2].disabled = false;
                            this.dialogParent = 'edit';
                            this.getDateParent();
                        }).catch(() => {
                            this.submitLoading = false;
                            this.btnsDialog[0].loading = false;
                        });
                    } else {
                        obj.id = this.projectApplicationId || this.rowKeyObj.id;
                        this.$http.put('/devicemanager/equipprojectapp/updateById', obj).then(() => {
                            this.btnsDialog[0].loading = false;
                            this.submitLoading = false;
                            this.getDateParent();
                            this.$message({
                                message: '修改成功!',
                                type: 'success',
                            });
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
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[2].disabled = true;
            this.dialogVisibleParent = true;
            this.dialogFormParent[0].value = '系统自动生成';
            this.dialogFormParent[10].value = '0';
            this.uploadList = [];
        },
        // 上表修改
        editRowParent(row) {
            if (row) this.projectApplicationCode = row.projectApplicationCode;
            // this.btnsDialog[0].label = '修改';
            this.btnsDialog[2].disabled = false;
            this.dialogParent = 'edit';
            this.rowKeyObj = row || this.selection[0];
            this.dialogFormParent.forEach(v => {
                v.value = this.rowKeyObj[v.prop];
            });
            this.projectLeader = this.rowKeyObj.projectLeader;
            this.applicantPersonnel = this.rowKeyObj.applicantPersonnel;
            this.dialogVisibleParent = this.rowKeyObj.reviewStatus === '1' ? false : true;
            this.getProjectDetailInfo();
            this.islook = false;
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
        },
        selectionChange(selection) {
            this.isDelete = false;
            this.selection = selection;
            this.selection.forEach(item => {
                if (item.reviewerStatus === '1') {
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
                this.$http.delete('/devicemanager/equipprojectapp/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getDateParent();
                    this.tableDataSon = [];
                    this.pageSize_down = 20;
                    this.currentPage_down = 1;
                    this.pageTotal_down = 0;
                    this.$refs.table.clearSelection();
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitStatus() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.reviewerPersonnel = this.sysUser.userId;
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[2].loading = true;
                    obj.id = this.projectApplicationId || this.rowKeyObj.id;
                    this.$http.post('/devicemanager/equipprojectapp/audit', obj).then(() => {
                        this.btnsDialog[2].loading = false;
                        this.getDateParent();
                        this.$message({
                            message: '审核成功!',
                            type: 'success',
                        });
                        this.dialogVisibleParent = false;
                    }).catch(() => {
                        this.btnsDialog[2].loading = false;
                    });
                }
            });
        },
        look(row) {
            this.uploadDisabled = true;
            this.dialogVisibleParent = true;
            const item = row || this.selection[0];
            if (row) this.projectApplicationCode = row.projectApplicationCode;
            this.dialogFormParent.forEach(v => {
                v.disabled = true;
                v.value = item[v.prop];
            });
            this.isDisabled = true;
            this.btnsDialog[0].label = '保存';
            this.btnsDialog[0].disabled = true;
            this.btnsDialog[2].disabled = true;
            this.getProjectDetailInfo();
            this.islook = true;
        },
        cancel() {
            this.dialogVisibleParent = false;
        },
        rowDblClickHandler(row, column, e) {
            this.rowKeyObj = row;
            if (this.rowKeyObj.reviewerStatus !== '1' && this.permissions.includes('devicemanager_equipprojectapp_edit')) {
                this.editRowParent(row);
            } else {
                this.look(row);
            }
        },
        currentChange_List(row) {
            this.rowObj_main = row;
            if (row) {
                this.getDateSon();
            }
        },
        getDateSon() {
            this.projectApplicationCode = this.rowObj_main.projectApplicationCode;
            this.loading_down = true;
            this.$http.get(`/devicemanager/equipprojectappdet/getByProjectApplicationCode/${this.projectApplicationCode}`, {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                }
            }).then(res => {
                this.loading_down = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
            }).catch(() => {
                this.loading_down = false;
            });
        },
        // 下表分页
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDateSon();
        },
        // 下表分页
        changeSize_Down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDateSon();
        },
        // 获取弹出页面明细
        getProjectDetailInfo(val = 1) {
            this.projectApplicationCode = this.projectApplicationCode || this.selection[0].projectApplicationCode;
            this.tableLoadingDownDialog = true;
            this.$http.get(`/devicemanager/equipprojectappdet/getByProjectApplicationCode/${this.projectApplicationCode}`, {
                params: {
                    current: val,
                    size: this.pageSizeDownDialog,
                },
            }).then(res => {
                this.tableLoadingDownDialog = false;
                this.currentPageDownDialog = val;
                this.tableDataDetailDialog = res.data.records;
                this.pageTotalDownDialog = res.data.total;
            }).catch(() => {
                this.tableLoadingDownDialog = false;
            });
        },
        // 明细新增
        newRowSon() {
            this.dialogVisibleDetailDialog = true;
        },
        // 删除明细
        delRowSon() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDownDialog = true;
                this.$http.delete('/devicemanager/equipprojectappdet/removeByIds', {
                    data: this.idsDetailDialog,
                }).then(() => {
                    this.tableLoadingDownDialog = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getProjectDetailInfo();
                    this.$refs.dialogTable.clearSelection();
                }).catch(() => {
                    this.tableLoadingDownDialog = false;
                });
            });
        },
        // 页码
        changeCurrentDownDialog(val) {
            this.getProjectDetailInfo(val);
        },
        // 页面数据数量
        changeSizeDownDialog(val) {
            this.pageSizeDownDialog = val;
            this.currentPageDownDialog = 1;
            this.getProjectDetailInfo();
        },
        // 明细选中数组
        getSelectionDownDialog(selection) {
            this.selectionDetailDialog = selection;
            this.idsDetailDialog = selection.map(v => v.id);
        },
        // 新增明细提交
        submitFormDetailDialog() {
            this.submitLoadingDetailDialog = true;
            this.$http.post('/devicemanager/equipprojectappdet/save', {
                projectApplicationCode: this.projectApplicationCode || this.selection[0].projectApplicationCode,
                subItemDescribe: this.dialogFormDetailDialog[1].value,
                subItemName: this.dialogFormDetailDialog[0].value,
            }).then(() => {
                this.submitLoadingDetailDialog = false;
                this.$message({
                    message: '项目明细清单保存成功!',
                    type: 'success',
                });
                this.dialogVisibleDetailDialog = false;
                this.getProjectDetailInfo();
            }).catch(() => {
                this.submitLoadingDetailDialog = false;
            });
        },
        // 文件上传
        uploadChangeHandler(file, fileList) {
            const newFileList = fileList.map(v => {
                if (v.url) return v;
                const url = v.response
                    && v.response.data
                    && `/devicemanager/equipprojectapp/getfile/${v.response.data.bucketName}-${v.response.data.fileName}`;
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
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },
        // 导出
        exportAll() {
            this.dialogVisabledExport = true;
        },
        handlerExport(dataSetting) {
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.idsDetailDialog.length) {
                    this.exportIds = this.idsDetailDialog;
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.tableDataDetailDialog.map(v => v.id);
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
.table_dialog
    & >>> .table
        height auto!important
    & >>> .el-table__body-wrapper
        min-height 150px!important
.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    .iconfont
        transition transform .25s
        display inline-block
.collapse
    .iconfont
        transform rotate(180deg)
.apply
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
