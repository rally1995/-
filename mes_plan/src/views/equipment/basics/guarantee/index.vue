<template lang="pug">
    ebrain-main.guarantee
        ebrain-frame.halfHeight(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchTopVisible}")
                    ebrain-search(
                        :form="searchTopForm"
                        @search="resetTopTable"
                        @reset="reset(searchTopForm)")
            template(#table)
                ebrain-box-table(
                    row-key="id"
                    ref="topTable"
                    :loading="topTableLoading"
                    :page-size="topPageSize"
                    :page-current="topCurrentPage"
                    :page-total="topPageTotal"
                    :data="topTableData"
                    :column="topTableColumn"
                    highlight-current-row
                    @current-change="topRowchange"
                    @page-change="topChangeCurrent"
                    @size-change="topChangeSize"
                    @selection-change="topSelectChange"
                    @row-dblclick="TopDblclick"
                    )
        ebrain-frame.halfHeight(title="维保内容")
            template(#tools)
                ebrain-tools(:buttons="btnsUnder")
                .search(
                    :class="{hide:searchUnderVisible}")
                    ebrain-search(
                        :form="searchUnderForm"
                        @search="resetUnderTable"
                        @reset="resetSon(searchUnderForm);")
            template(#table)
                ebrain-box-table(
                    highlight-current-row
                    :loading="underTableLoading"
                    :page-size="underpageSize"
                    :page-current="underPageCurrent"
                    :page-total="underpageTotal"
                    :data="underTableData"
                    :column="underTableColumn"
                     @size-change="underChangeSize"
                     @page-change="underChangeCurrent")
        //-新增修改弹窗
        ebrain-dialog(
            ref="addFrom"
            :expandVisible="collapse"
            :submitLoading="submitLoading"
            :visible.sync="dialogAddVisible"
            :form.sync="dialogAddForm"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#headline)
                .dialog-title
                    ebrain-frame(title="维保方案")
            //- 图片上传还有疑问
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="添加图片")
                        ebrain-upload.upload(
                            accept="image/*"
                            list-type="picture-card"
                            :disabled="isUpLoad"
                            :file-list="uploadList"
                            :limit="10"
                            action="/devicemanager/devicefile/upload"
                            :before-upload="beforeAvatarUpload"
                            :on-success="uploadChangeHandler"
                            :on-preview="uploadPreview"
                            :before-remove="removeChangeHandler")
                            i.el-icon-plus
            div(:class="{collapse}")
                div.expand_toggle(@click="collapse = !collapse")
                    i.iconfont.icondouble_pull_top-copy
            .table-list
                ebrain-frame(title="维保内容列表")
                    template(#tools)
                        ebrain-tools(:buttons="dialogBtn")
                        .search(
                            :class="{hide:searchDialogVisible}")
                            ebrain-search(
                                :form="searchDialogForm"
                                @search="resetDialogTable"
                                @reset="reset(searchDialogForm)")
                    template(#table)
                        ebrain-box-table(
                            ref="dialogTable"
                            :loading='dialogTableLoading'
                            :pageSize='dialogPageSize'
                            :pageCurrent='dialogCurrentPage'
                            :pageTotal='dialogPageTotal'
                            :data="dialogTableData"
                            :column="dialogTableColumn"
                            row-key="id"
                            highlight-current-row
                            @page-change="dialogChangeCurrent"
                            @size-change='dialogChangeSize'
                            @selection-change="dialogSelectChange")
        el-dialog(:visible.sync="dialogVisiblePreview")
            template
                div.container
                    img(ref="img")
                //- el-button(type="primary" ref="downfile" @click="downloadFile").footer 下载附件
        ebrain-dialog(
            ref="addPlanFrom"
            :submitLoading='submitLoading'
            :visible.sync="addPlanVisible"
            :form.sync="addPlanForm"
            @submit="submitForm")
            template(#standardJobHours)
                el-col(:span="12")
                    el-form-item(label-width="110px" label="标准工时" prop="standardJobHours")
                        el-input(style="cursor:pointer" v-model="addPlanForm[6].value")
                            i(slot="suffix" style="font-style:normal") （h）
        ebrain-dialog-import(
            ref="import"
            :visible.sync="importVisible"
            accept="xls,xlsx"
            download-url="/devicemanager/repairprogramdet/downloadTemplate"
            :import-url="'/devicemanager/repairprogramdet/importData/'+topRow.programCode"
            download-filename="维保内容列表模板.xlsx"
            :import-success="importSuccessHandler")
        //-导出
        ebrain-dialog-export(
            :visible.sync="dialogVisabledExport"
            v-model="exportFilename"
            accept="xls,xlsx"
            :export-url="'/devicemanager/repairprogramdet/exportAll/'+topRow.programCode"
            :params="exportIds"
            :before-export="handlerExport")
</template>
<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';
export default {
    name: 'guarantee',
    data() {
        return {
            btnsTop: [
                {
                    label: '新增',
                    click: () => this.newRowTop(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_repairprogram_add'
                },
                {
                    label: '修改',
                    click: () => {
                        this.editRowTop();
                    },

                    className: 'iconfont iconstatus-edit',
                    permi: 'devicemanager_repairprogram_edit',
                    disabled: () => this.btnTopEdit
                },
                {
                    label: '删除',
                    click: () => this.delRow(),
                    className: 'iconfont iconstatus-delete',
                    permi: 'devicemanager_repairprogram_dels',
                    disabled: () => this.isDel
                },
                {
                    label: '启动',
                    click: () => this.startUp(),
                    className: 'iconfont iconstatus-start-up',
                    permi: 'devicemanager_repairprogram_start',
                    disabled: () => this.isStar
                },
                {
                    label: '停用',
                    click: () => this.stopIt(),
                    className: 'iconfont iconstatus-suspend',
                    permi: 'devicemanager_repairprogram_stop',
                    disabled: () => this.isStop
                },
                {
                    label: '复制',
                    click: () => this.copy(),
                    className: 'iconfont icontarget',
                    permi: 'devicemanager_repairprogram_copy',
                    disabled: () => this.isCopy,
                },
                {
                    label: '搜索',
                    click: () => {
                        this.searchTopVisible = !this.searchTopVisible;
                    },
                    className: 'iconfont iconsearch fr',
                    permi: false
                }
            ],
            searchTopVisible: true,
            searchTopForm: [
                {
                    label: '方案名称',
                    prop: 'programName',
                    value: ''
                },
                {
                    label: '维保分类',
                    prop: 'repairType',
                    value: '',
                    type: 'select',
                    option: {}
                }
            ],
            // -- 上表
            topTableLoading: false,
            topPageTotal: 0,
            topPageSize: 20,
            topCurrentPage: 1,
            topRow: {},
            topCurrentRow: {},
            topSelection: [],
            topSelectionId: [],
            topTableData: [],
            topTableColumn: [
                {
                    label: '方案编码',
                    prop: 'programCode',
                    showOverflowTooltip: true
                },
                {
                    label: '方案名称',
                    prop: 'programName',
                    showOverflowTooltip: true
                },
                {
                    label: '维保分类',
                    prop: 'repairType',
                    showOverflowTooltip: true,
                    formatter: (row, column, cell) => {
                        return this.storeDict['maintenance'][cell];
                    }
                },
                {
                    label: '维护人员',
                    prop: 'updateBy',
                    showOverflowTooltip: true
                },
                {
                    label: '维护日期',
                    prop: 'updateTime',
                    showOverflowTooltip: true
                },
                {
                    label: '状态',
                    prop: 'status',
                    showOverflowTooltip: true,
                    formatter(row, col, cell, index) {
                        return dict['status'][cell];
                    }
                },
                {
                    label: '备注',
                    prop: 'remark',
                    showOverflowTooltip: true
                }
            ],
            // 下按钮的工具条,下搜索
            btnsUnder: [
                {
                    label: '搜索',
                    click: () => {
                        this.searchUnderVisible = !this.searchUnderVisible;
                    },
                    className: 'iconfont iconsearch',
                    permi: false
                }
            ],
            searchUnderVisible: true,
            searchUnderForm: [
                {
                    label: '事项名称',
                    prop: 'itemName',
                    value: ''
                },
                {
                    label: '维保部位',
                    prop: 'repairPart',
                    value: ''
                }
            ],
            // --下表
            underTableLoading: false,
            underpageSize: 20,
            underPageCurrent: 1,
            underpageTotal: 0,
            underTableData: [],
            underTableColumn: [
                {
                    label: '事项名称',
                    prop: 'itemName',
                    showOverflowTooltip: true
                },
                {
                    label: '维保部位',
                    prop: 'repairPart',
                    showOverflowTooltip: true
                },
                {
                    label: '维保方法',
                    prop: 'repairMethod',
                    showOverflowTooltip: true
                },
                {
                    label: '维保要求',
                    prop: 'repairRequire',
                    showOverflowTooltip: true
                },
                {
                    label: '参考下限',
                    prop: 'referenceLowerLimit',
                    showOverflowTooltip: true
                },
                {
                    label: '参考上限',
                    prop: 'referenceUpLimit',
                    showOverflowTooltip: true,
                },
                {
                    label: '标准工时',
                    prop: 'standardJobHours',
                    showOverflowTooltip: true
                },
                {
                    label: '备注',
                    prop: 'remark',
                    showOverflowTooltip: true
                }
            ],
            // --维保方案增加修改弹窗--
            // isSave: false,
            submitLoading: false,
            collapse: false,
            dialogAddVisible: false,
            dialogAddForm: [
                {
                    label: '方案编码',
                    prop: 'programCode',
                    value: '',
                    // disabled: true,
                },
                {
                    label: '方案名称',
                    prop: 'programName',
                    value: '',
                    required: true
                },
                {
                    label: '维保分类',
                    prop: 'repairType',
                    value: '',
                    type: 'select',
                    option: () => this.storeDict['maintenance']
                },
                {
                    label: '状态',
                    prop: 'status',
                    value: '',
                    type: 'select',
                    option: () => dict['status'],
                    // disabled: true
                },
                {
                    label: '维护人员',
                    prop: 'updateBy',
                    value: '',
                    // disabled: true
                },
                {
                    label: '维护时间',
                    type: 'datetime',
                    prop: 'updateTime',
                    value: '',
                    // disabled: true
                },
                {
                    label: '备注',
                    type: 'textarea',
                    prop: 'remark',
                    value: ''
                },
                {
                    slot: 'upload'
                }
            ],
            btnsDialog: [
                {
                    label: '保存',
                    click: () => this.saveData(),
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_repairprogram_add',
                    loading: false
                },
                {
                    label: '返回',
                    click: () => {
                        this.dialogAddVisible = !this.dialogAddVisible;
                    },
                    className: 'iconfont iconstatus-Import',
                    permi: false
                }
            ],
            // 图片上传
            uploadList: [],
            isUpLoad: false,
            imgUrl: '',
            dialogVisiblePreview: false,
            dialogBtn: [
                {
                    label: '添加',
                    click: () => {
                        this.addPlanVisible = !this.addPlanVisible;
                    },
                    className: 'iconfont iconadd_',
                    permi: 'devicemanager_repairprogramdet_add',
                    disabled: () => this.isEditDialog,
                },
                {
                    label: '删除',
                    click: () => this.dialogRelRow(),
                    className: 'iconfont iconstatus-delete',
                    permi: 'devicemanager_repairprogramdet_dels',
                    disabled: () => this.dialogIsedit
                },
                {
                    label: '导出',
                    click: () => {
                        this.dialogVisabledExport = !this.dialogVisabledExport;
                    },
                    className: 'iconfont iconstatus-export',
                    permi: 'devicemanager_workcenter_add',
                    disabled: () => this.dialogIsExport
                },
                {
                    label: '导入',
                    click: () => {
                        this.importVisible = !this.importVisible;
                    },
                    className: 'iconfont iconstatus-Import',
                    permi: 'devicemanager_repairprogramdet_importData',
                    disabled: () => this.isEditDialog,
                },
                {
                    label: '搜索',
                    click: () => {
                        this.searchDialogVisible = !this.searchDialogVisible;
                    },
                    className: 'iconfont iconsearch fr',
                    permi: false,
                    disabled: () => !this.dialogTableData.length,
                }
            ],
            searchDialogVisible: true,
            searchDialogForm: [
                {
                    label: '事项名称',
                    prop: 'itemName',
                    value: ''
                }
            ],
            // 维保内容table
            dialogState: '',
            // dialogSelect: [],
            isEditDialog: true,
            dialogTableLoading: false,
            dialogPageSize: 20,
            dialogCurrentPage: 1,
            dialogPageTotal: 0,
            dialogTableData: [],
            dialogTableColumn: [
                {
                    label: '事项名称',
                    prop: 'itemName',
                    showOverflowTooltip: true
                },
                {
                    label: '维保部位',
                    prop: 'repairPart',
                    showOverflowTooltip: true
                },
                {
                    label: '维保方法',
                    prop: 'repairMethod',
                    showOverflowTooltip: true
                },
                {
                    label: '维保要求',
                    prop: 'repairRequire',
                    showOverflowTooltip: true
                },
                {
                    label: '参考下限',
                    prop: 'referenceLowerLimit',
                    showOverflowTooltip: true
                },
                {
                    label: '参考上限',
                    prop: 'referenceUpLimit',
                    showOverflowTooltip: true
                },
                {
                    label: '标准工时(H)',
                    prop: 'standardJobHours',
                    showOverflowTooltip: true
                },
                {
                    label: '备注',
                    prop: 'remark',
                    showOverflowTooltip: true
                }
            ],
            dialogSelectionId: [],
            // 从表添加
            addPlanVisible: false,
            addPlanForm: [
                {
                    label: '事项名称',
                    prop: 'itemName',
                    value: '',
                    required: true
                },
                {
                    label: '维保部位',
                    prop: 'repairPart',
                    value: '',
                    required: true
                },
                {
                    label: '维保方法',
                    prop: 'repairMethod',
                    value: '',
                    required: true
                },
                {
                    label: '维保要求',
                    prop: 'repairRequire',
                    value: ''
                },
                {
                    label: '参考下限',
                    prop: 'referenceLowerLimit',
                    value: '',
                    rule: {
                        validator: (rule, value, callback) => {
                            let part = /^[+-]?\d*\.?\d{0,4}$/;
                            if (!value) callback();
                            if (isNaN(value) || !part.test(value)) {
                                return callback(new Error('请输入数字，保留四位小数!'));
                            } else {
                                let downNum = Number(value);
                                let upNum = Number(this.addPlanForm[5].value);
                                if (upNum) {
                                    if (upNum < downNum) {
                                        return callback(new Error('下限值应小于等于上限值!'));
                                    } else {
                                        callback();
                                    }
                                } else {
                                    callback();
                                }

                            }
                        },
                        trigger: 'blur'
                    }
                },
                {
                    label: '参考上限',
                    prop: 'referenceUpLimit',
                    value: '',
                    rule: {
                        validator: (rule, value, callback) => {
                            let part = /^[+-]?\d*\.?\d{0,4}$/;
                            if (!value) callback();
                            if (isNaN(value) || !part.test(value)) {
                                return callback(new Error('请输入数字，保留四位小数!'));
                            } else {
                                let downNum = Number(this.addPlanForm[4].value);
                                let upNum = Number(value);
                                if (upNum < downNum) {
                                    return callback(new Error('上限值应大于下限值!'));
                                } else {
                                    callback();
                                }
                            }
                        },
                        trigger: 'blur'
                    }
                },
                {
                    label: '标准工时',
                    prop: 'standardJobHours',
                    slot: 'standardJobHours',
                    value: '',
                    rule: {
                        validator: (rule, value, callback) => {
                            const reg = /^(?!0+(\.0+)?$)\d+(\.\d+)?$/;
                            if (!value) callback();
                            if (!reg.test(value)) {
                                return callback(new Error('请输入非负数!'));
                            } else {
                                let part = /^-?\d+(\.\d{1,2})?$/;
                                let result = part.test(value);
                                if (!result) {
                                    this.addPlanForm[6].value = this.round(value).toString();
                                }
                                callback();
                            }
                        },
                        trigger: 'blur'
                    },
                },
                {
                    label: '备注',
                    prop: 'remark',
                    value: '',
                    type: 'textarea'
                }
            ],
            // 导入
            importVisible: false,
            // 导出
            dialogVisabledExport: false,
            exportFilename: '',
            exportIds: [],
            conditionList: [],
            conditionListDown: [],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser
        }),
        // 编辑row
        btnTopEdit() {
            return this.topSelection.length !== 1 || this.topSelection.some(v => v.status === '1') || this.topSelection.some(v => v.status === '2');
        },
        isStar() {
            return this.topSelection.length !== 1 || this.topSelection.some(v => v.status === '1');
        },
        isStop() {
            return this.topSelection.length !== 1 || this.topSelection.some(v => v.status === '2') || this.topSelection.some(v => v.status === '0');
        },
        isDel() {
            return !this.topSelection.length || this.topSelection.some(v => v.status === '1') || this.topSelection.some(v => v.status === '2');
        },
        isCopy() {
            return this.topSelection.length !== 1;
        },
        // 弹窗按钮禁用
        dialogIsedit() {
            if (this.topRow.status === '1' || this.topRow.status === '2') {
                return true;
            } else {
                return !this.dialogSelectionId.length;
            }
        },
        dialogIsExport() {
            return !this.dialogTableData.length;
        }
    },
    watch: {
        dialogAddVisible(val) {
            if (!val) {
                // 清空弹窗数据
                this.dialogState = '';
                this.uploadList = [];
                this.reset(this.searchDialogForm);
                this.clearData('dialogCurrentPage', 'dialogPageTotal', 'dialogTableData');
                this.topRow = {};
                // 上表
                this.getTopTable();
                this.clearData('underPageCurrent', 'underpageTotal', 'underTableData');
                this.$refs.topTable.setCurrentRow();
                this.$refs.dialogTable.clearSelection();
            }
        },
        // 检查状态
        dialogState(val) {
            if (val === 'add') {
                this.isEditDialog = true;
                this.isUpLoad = false;
                this.stateHandle();
            } else if (val === 'edit') {
                let status = this.topRow.status;
                if (status === '1' || status === '2') {
                    this.isEditDialog = true;
                    this.isUpLoad = true;
                    this.dialogAddForm.forEach(v => {
                        v.disabled = true;
                    });
                } else {
                    this.isEditDialog = false;
                    this.isUpLoad = false;
                    this.stateHandle();
                }
            }
        },
        // 图片导出
        importVisible(val) {
            if (!val) {
                this.$refs.import.$refs.upload.clearFiles();
            }
        },
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '维保内容列表';
            }
        }
    },
    created() {
        Promise.all([this.queryDict('maintenance')]).then(() => {
            this.getTopTable();
            this.searchTopForm[1].option = this.storeDict['maintenance'];
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // --上表搜索
        resetTopTable() {
            this.topCurrentPage = 1;
            this.conditionList = [];
            this.searchTopForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND'
                    });
                }
            });
            this.getTopTable();
        },
        reset(searchForm) {
            this.conditionList = [];
            searchForm.forEach(item => {
                item.value = '';
            });
        },
        resetSon(searchUnderForm) {
            this.conditionListDown = [];
            searchUnderForm.forEach(item => {
                item.value = '';
            });
        },
        // --上表table
        TopDblclick(row) {
            this.topRow = this.topCurrentRow;
            this.editRowTop();
        },
        getTopTable() {
            this.topTableLoading = true;
            this.$http
                .get('/devicemanager/repairprogram/page', {
                    params: {
                        current: this.topCurrentPage,
                        size: this.topPageSize,
                        conditionList: this.conditionList,
                    }
                })
                .then(res => {
                    this.topTableLoading = false;
                    this.topTableData = res.data.records;
                    this.topPageTotal = res.data.total;
                    this.$refs.topTable.setCurrentRow();
                })
                .catch(() => {
                    this.topTableLoading = false;
                });
        },
        topRowchange(row) {
            this.topCurrentRow = row;
            if (row) this.resetUnderTable();
        },
        topChangeCurrent(val) {
            this.topCurrentPage = val;
            this.getTopTable();
        },
        topChangeSize(val) {
            this.topPageSize = val;
            this.topCurrentPage = 1;
            this.getTopTable();
        },
        topSelectChange(selection) {
            let topSelect = selection.filter(v => v);
            if (!topSelect.length) {
                this.topRow = {};
            } else {
                this.topRow = topSelect[0];
            }
            // 获取勾选的ID
            this.topSelection = topSelect;
            this.topSelectionId = topSelect.map(v => v.id);
        },
        // --下表
        underChangeSize(val) {
            this.underpageSize = val;
            this.underPageCurrent = 1;
            this.getUnderTable();
        },
        underChangeCurrent(val) {
            this.underPageCurrent = val;
            this.getUnderTable();
        },
        resetUnderTable() {
            this.underPageCurrent = 1;
            this.searchUnderForm.forEach(v => {
                if (v.value) {
                    this.conditionListDown.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND'
                    });
                }
            });
            this.getUnderTable();
        },
        getUnderTable() {
            this.underTableLoading = true;
            const conditionList = [{
                fieldName: 'programCode',
                operation: 'EQ',
                value: this.topCurrentRow.programCode,
                joinType: 'AND'
            }, ...this.conditionListDown];
            this.$http
                .get('/devicemanager/repairprogramdet/page', {
                    params: {
                        current: this.underPageCurrent,
                        size: this.underpageSize,
                        conditionList,
                    }
                })
                .then(res => {
                    this.underTableLoading = false;
                    this.underTableData = res.data.records;
                    this.underpageTotal = res.data.total;
                })
                .catch(() => {
                    this.underTableLoading = false;
                });
            this.conditionListDown = [];
        },
        resetUnder() {
            this.underPageCurrent = 1;
            this.getUnderTable();
        },
        // 下表搜索
        searchUnder() {
            this.resetUnder();
        },
        // -- 新增弹窗
        newRowTop() {
            this.dialogState = 'add';
            this.dialogAddVisible = !this.dialogAddVisible;
            this.dialogAddForm[2].value = '1';
            this.dialogAddForm[3].value = '0';
            this.dialogAddForm[4].value = this.userInfo.nickname;
            this.dialogAddForm[5].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.$set(
                this.btnsDialog, 0,
                {
                    label: '保存',
                    click: () => this.saveData(),
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_repairprogram_add',
                    loading: false,
                });

        },
        editRowTop() {
            // let status = this.topRow.status;
            // status === '1' || status === '2'
            // this.dialogAddForm.forEach(v => {
            //     v.disabled = true;
            // });
            this.dialogAddVisible = !this.dialogAddVisible;
            this.editRowData(this.topRow);
            this.getDialogTable();
        },
        editRowData(data) {
            this.dialogState = 'edit';
            // this.isEditDialog = false;
            this.$set(
                this.btnsDialog, 0,
                {
                    label: '保存',
                    click: () => this.editData(),
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_repairprogram_edit',
                    loading: false,
                    disabled: () => this.isEditDialog
                });

            // 处理图片
            this.dialogAddForm.forEach(v => {
                v.value = data[v.prop];
            });
            // 处理图片
            let arr = [];
            for (let i = 0; i < 10; i++) {
                const path = data[`image${i + 1}`];
                if (path) {
                    arr.push({
                        url: path,
                    });
                }
            }
            this.uploadList = arr;
        },
        editData() {
            this.$refs.addFrom.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[0].loading = true;
                    let param = this.topParam();
                    param.id = this.topRow.id;
                    // debugger;
                    this.$http
                        .put('/devicemanager/repairprogram/updateById', param)
                        .then(({ data }) => {
                            this.btnsDialog[0].loading = false;
                            this.topRow = data;
                            this.dialogAddForm.forEach(v => {
                                v.value = data[v.prop];
                            });
                            this.$message({ message: '修改成功!', type: 'success' });
                        })
                        .catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                }
            });
        },
        saveData() {
            this.$refs.addFrom.$refs.form.validate(valid => {
                if (valid) {
                    let param = this.topParam();
                    this.btnsDialog[0].loading = true;
                    // 新增
                    this.$http
                        .post('/devicemanager/repairprogram/save', param)
                        .then(({ data }) => {
                            this.btnsDialog[0].loading = false;
                            this.$message({ message: '新增成功!', type: 'success' });
                            this.editRowData(data);
                            this.dialogAddForm.forEach(v => {
                                v.value = data[v.prop];
                            });
                            this.topRow = data;
                        })
                        .catch(() => {
                            this.btnsDialog[0].loading = false;
                        });
                }
            });
        },
        // 处理公共参数
        topParam() {
            let param = this.handleData(this.dialogAddForm);
            // debugger;
            // 图片处理
            this.uploadList.forEach((v, i) => {
                if (v.response && v.response.data) {
                    const { fileUrl } = v.response.data;
                    param[`image${i + 1}`] = fileUrl;
                } else {
                    param[`image${i + 1}`] = v.url;
                }
            });
            for (let i = 0; i < 10; i++) {
                param[`image${i + 1}`] = param[`image${i + 1}`] || '';
            }
            return param;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', { type: 'warning' }).then(() => {
                this.topTableLoading = true;

                this.$http
                    .delete(`/devicemanager/repairprogram/removeByIds`, {
                        data: this.topSelectionId
                    })
                    .then(() => {
                        this.topTableLoading = false;
                        this.$message({ message: '删除成功!', type: 'success' });
                        this.topSelection = [];
                        this.$refs.topTable.clearSelection();
                        this.resetTopTable();
                        this.resetUnderTable();
                        this.topSelectionId = [];

                    })
                    .catch(() => {
                        this.topTableLoading = false;
                    });
            });
        },
        // 启动
        startUp() {
            this.topTableLoading = true;
            this.$http
                .post(`/devicemanager/repairprogram/startProgram`, this.topSelectionId)
                .then(() => {
                    this.topTableLoading = false;
                    this.$message({ message: '启动成功!', type: 'success' });
                    this.topSelectionId = [];
                    this.topSelection = [];
                    this.getTopTable();
                })
                .catch(() => {
                    this.topTableLoading = false;
                });
        },
        // 停止
        stopIt() {
            this.topTableLoading = true;
            this.$http
                .post(`/devicemanager/repairprogram/stopProgram`, this.topSelectionId)
                .then(() => {
                    this.topTableLoading = false;
                    this.$message({ message: '停止成功!', type: 'success' });
                    this.topSelectionId = [];
                    this.topSelection = [];
                    this.getTopTable();

                })
                .catch(() => {
                    this.topTableLoading = false;
                });
        },
        // 复制
        copy() {
            this.topTableLoading = true;
            this.$http
                .post(
                    `/devicemanager/repairprogram/copyRepairProgram/${this.topRow.id}`
                )
                .then(() => {
                    this.topTableLoading = false;
                    this.$message({ message: '复制成功!', type: 'success' });
                    this.topSelectionId = [];
                    this.topSelection = [];
                    this.getTopTable();
                })
                .catch(() => {
                    this.topTableLoading = false;
                });
        },
        // 下表
        // 图片上传
        beforeAvatarUpload(file) {
            let isJPG = /^image\//.test(file.type);
            if (!isJPG) {
                this.$message.error('只能上传图片！');
            }
            return isJPG;
        },
        uploadChangeHandler(res, file, fileList) {
            this.uploadList = fileList;
        },
        uploadPreview(file) {
            this.dialogVisiblePreview = true;
            this.$nextTick(() => {
                this.$refs.img.src = file.url;
                this.imgUrl = file.url;
            });
        },
        // downloadFile() {
        //     window.open(this.imgUrl);
        // },
        // 图片删除
        removeChangeHandler(file, fileList) {
            // let url;
            // const over = () => {
            //     const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            //     const fileName = url.match(reg);
            //     this.$http.get(`/devicemanager/pointcheckplan/deleteFile/${String(fileName)}`);
            // };
            // if (file.response && file.raw) {
            //     url = file.response.data.fileUrl;
            //     over();
            // } else if (!file.raw && !file.response) {
            //     url = file.url;
            //     over();
            // }
            this.uploadList = fileList;
        },
        // 维保内容table
        dialogChangeCurrent(val) {
            this.dialogCurrentPage = val;
            this.getDialogTable();
        },
        dialogChangeSize(val) {
            this.dialogPageSize = val;
            this.getDialogTable();
        },
        dialogSelectChange(selection) {
            let dialogSelect = selection.filter(v => v);
            this.dialogSelectionId = dialogSelect.map(v => v.id);
        },
        // 添加维保方案列表
        getDialogTable() {
            this.dialogTableLoading = true;
            const conditionList = [{
                fieldName: 'programCode',
                operation: 'EQ',
                value: this.topRow.programCode
                // joinType: 'AND'
            }];
            this.searchDialogForm.forEach(v => {
                if (v.value) {
                    conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND'
                    });
                }
            });
            this.$http
                .get('/devicemanager/repairprogramdet/page', {
                    params: {
                        current: this.dialogCurrentPage,
                        size: this.dialogPageSize,
                        conditionList
                    }
                })
                .then(res => {
                    this.dialogTableLoading = false;
                    this.dialogTableData = res.data.records;
                    this.dialogPageTotal = res.data.total;
                })
                .catch(() => {
                    this.dialogTableLoading = false;
                });
        },
        // --弹窗table列表
        resetDialogTable() {
            this.dialogCurrentPage = 1;
            this.getDialogTable();
        },
        // 删除
        dialogRelRow() {
            this.$confirm('是否确认删除?', '提示', { type: 'warning' }).then(() => {
                this.dialogTableLoading = true;
                this.$http
                    .delete(`/devicemanager/repairprogramdet/removeByIds`, {
                        data: this.dialogSelectionId
                    })
                    .then(() => {
                        this.dialogTableLoading = false;
                        this.dialogSelectionId = [];
                        this.$message({ message: '删除成功!', type: 'success' });
                        this.resetDialogTable();
                        this.$refs.dialogTable.clearSelection();
                    })
                    .catch(() => {
                        this.dialogTableLoading = false;
                    });
            });
        },
        submitForm() {
            this.$refs.addPlanFrom.$refs.form.validate(valid => {
                if (valid) {
                    let param = this.handleData(this.addPlanForm);
                    param.programCode = this.topRow.programCode;
                    this.submitLoading = true;
                    // debugger;
                    // 新增
                    this.$http
                        .post('/devicemanager/repairprogramdet/save', param)
                        .then(() => {
                            this.submitLoading = false;
                            this.addPlanVisible = false;
                            this.$message({ message: '新增成功!', type: 'success' });
                            this.getDialogTable();
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                }
            });
        },
        // 导入
        importSuccessHandler() {
            this.importVisible = false;
            this.$message({ message: '导入成功!', type: 'success' });
            this.getDialogTable();
        },
        handlerExport(dataSetting) {
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.dialogSelectionId.length) {
                    this.exportIds = this.dialogSelectionId;
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.dialogTableData.map(v => v.id);
            }
        },
        // 公共处理数据
        handleData(arrForm) {
            let obj = {};
            arrForm.forEach(v => {
                if (v.value) {
                    obj[v.prop] = v.value;
                }
            });
            return obj;
        },
        // 清空分页
        clearData(cur, total, data) {
            this[cur] = 1;
            this[total] = 0;
            this[data] = [];
        },
        // 状态处理表单禁用
        stateHandle() {
            this.dialogAddForm.forEach(v => {
                if (v.prop === 'programCode' || v.prop === 'status' || v.prop === 'updateBy' || v.prop === 'updateTime') {
                    v.disabled = true;
                } else {
                    v.disabled = false;
                }
            });
        },
        // 四舍五入封装函数
        round(roundNum) {
            let num = roundNum.toString();
            let result;
            let numIndex1 = (num.indexOf('.') + 3);
            let n = num.substring(numIndex1, numIndex1 + 1);
            if (parseInt(n, 10) >= 5) { // 入
                let str = num.substring(0, numIndex1);
                let isUp = true;
                for (let i = (str.length - 1); i >= 0; i--) {
                    let char = str[i];
                    if (char !== '.' && isUp) {
                        if (parseInt(char, 10) === 9) {
                            char = '0';
                        } else {
                            char = (parseInt(char, 10) + 1).toString();
                            isUp = false; // 停止向上入
                        }
                    }
                    result = char + result;
                }
            } else { // 舍
                result = num.substring(0, numIndex1);
            }
            result = parseFloat(result);
            return result;
        }
    }
};
</script>

<style lang="stylus" scoped>
.guarantee
  & >>> .fr
    float right
.search
  padding 14px 10px
  background #f5f5f5
  overflow hidden
  box-sizing border-box
  transition-duration 0.2s
  height 57px

  &.hide
    padding-top 0
    padding-bottom 0
    height 0

.expand_toggle
  margin-bottom 15px
  cursor pointer
  border-top 1px dashed #EBEEF5
  border-bottom 1px dashed #EBEEF5
  height 40px
  line-height 40px
  text-align center
  overflow hidden
  box-sizing border-box
  transition-duration 0.5s

  .iconfont
    transition transform 0.25s
    display inline-block


.dialog >>>
  .frame-table
    height 300px
  .table-list
    .el-form-item
      display inline-block !important
    .el-form-item__content
      width auto

// 图片上传
.upload
  & >>> .el-upload-list__item
    width 100px
    height 100px

.import
  display inline-block

.upload .el-list-leave-active
  display none !important
.image
  width 98px
  height 98px
  display block
  border 1px dashed #d9d9d9
  border-radius 6px
  cursor pointer
  position relative
  overflow hidden
  .el-icon-plus
    font-size 24px
    margin-top 35px


.container
  width 600px
  height 400px
  border-radius 10px
  margin 0 auto
  overflow hidden
  padding 0px

  img
    display block
    height 100%
    max-width 100%
    margin 0 auto

  .footer
    display block
    margin 20px auto

</style>

