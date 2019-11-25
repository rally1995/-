<template lang="pug">
    ebrain-main.deviceGuarantee
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
                    ref="topTable"
                    row-key="id"
                    highlight-current-row
                    :loading="topTableLoading"
                    :pageSize="topPageSize"
                    :pageCurrent="topCurrentPage"
                    :pageTotal="topPageTotal"
                    :data="topTableData"
                    :column="topTableColumn"
                    @current-change="topRowchange"
                    @page-change="topChangeCurrent"
                    @size-change="topChangeSize"
                    @selection-change="topSelectChange"
                    @row-dblclick="TopDblclick")
        ebrain-frame.halfHeight(title="维保方案")
            template(#tools)
                ebrain-tools(:buttons="btnsUnder")
                .search(
                    :class="{hide:searchUnderVisible}")
                    ebrain-search(
                        :form="searchUnderForm"
                        @search="resetUnderTable"
                        @reset="reset(searchUnderForm);")
            template(#table)
                ebrain-box-table(
                    :loading='underTableLoading'
                    :pageSize='underpageSize'
                    :currentPage='underPageCurrent'
                    :pageTotal='underpageTotal'
                    :data="underTableData"
                    :column="underTableColumn"
                    highlight-current-row
                    @size-change="underChangeSize"
                    @page-change="underChangeCurrent")
        //-新增修改弹窗
        ebrain-dialog(
            ref="addFrom"
            :expandVisible="collapse"
            :visible.sync="dialogAddVisible"
            :form.sync="dialogAddForm"
            top="2vh"
            :isShow="false"
            :isCancel="false")
            template(#headline)
                .dialog-title
                    ebrain-frame(title="设备维保方案")
            template(#button)
                ebrain-tools(:buttons="btnsDialog")
            template(#no="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="设备编号" :required="true" prop="deviceCode")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="getDeviceNo()" :disabled="isClickType"  icon="iconfont iconsearch")
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
                ebrain-frame(title="维保方案列表")
                    template(#tools)
                        ebrain-tools(:buttons="dialogBtn")
                        .search(
                            :class="{hide:searchDialogVisible}")
                            ebrain-search(
                                :form="searchDialogForm"
                                @search="resetDialogTable()"
                                @reset="reset(searchDialogForm);")
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
        //-零部件编号
        ebrain-dialog-table(
            height="50vh"
            :column="deviceNoColumn"
            :data="deviceNoData"
            :submitLoading="submitLoading"
            :visible.sync="deviceNoVisible"
            :pageSize="deviceNoPageSize"
            :currentPage="deviceNoPageCurrent"
            :pageTotal="deviceNoPageTotal",
            :tableLoading='dialogTableLoading'
             row-key="id"
            :current-row-key.sync="rowDeviceNoId"
            :disabled="Object.keys(deviceNoRow).length === 0"
             @current-change="getDeviceNoRow"
             @changeCurrent="deviceNoCurrent"
             @changeSize="deviceNoSize"
             @search="deviceNoSearchType"
             @resetDialog="resetType(deviceNoFrom);"
             @submit="DeviceNosubmit"
            dialogTableSearch
            )
        //- 添加维保方案列表
        ebrain-dialog-table(
            :highlight-current-row="false"
            height="50vh"
            :column="addPlanColumn"
            :data="addPlanData"
            :tableLoading="dialogTableLoading"
            :submitLoading="submitLoading"
            :visible.sync="addPlanVisible"
            :pageSize="addPlanPageSize"
            :currentPage="addPlanPageCurrent"
            :pageTotal="addPlanPageTotal",
            :disabled="addPlanSelection.length === 0"
             @select="addPlanGetRow"
             @changeCurrent="addPlanCurrent"
             @changeSize="addPlanSize"
             @search="addPlanSearch"
             @resetDialog="resetType(addPlanFrom);"
             @submit="addPlanSubmit"
             dialogTableSearch)
        //- 上传图片
        el-dialog(:visible.sync="dialogVisiblePreview")
            template
                div.container
                    img(ref="img")
                //- el-button(type="primary" ref="downfile" @click="downloadFile").footer 下载附件

</template>
<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';

export default {
    name: 'deviceGuarantee',
    data() {
        return {
            btnsTop: [
                {
                    label: '新增',
                    click: () => this.newRowTop(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_equiprepairprogram_add'
                },
                {
                    label: '修改',
                    click: () => this.editRowTop(this.topSelection[0]),
                    disabled: () => this.btnTopEdit,
                    className: 'iconfont iconstatus-edit',
                    permi: 'devicemanager_equiprepairprogram_edit'
                },
                {
                    label: '删除',
                    click: () => this.delRow(),
                    disabled: () => this.isDel,
                    className: 'iconfont iconstatus-delete',
                    permi: 'devicemanager_workcenter_dels'
                },
                {
                    label: '启动',
                    click: () => this.startUp(),
                    disabled: () => this.isStar,
                    className: 'iconfont iconstatus-start-up',
                    permi: 'devicemanager_start_program'
                },
                {
                    label: '停用',
                    click: () => this.stopIt(),
                    disabled: () => this.isStop,
                    className: 'iconfont iconstatus-suspend',
                    permi: 'devicemanager_stop_program'
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
            conditionList: [],
            conditionListDown: [],
            searchTopForm: [
                {
                    label: '设备名称',
                    prop: 'deviceName',
                    value: ''
                },
                {
                    label: '设备类型',
                    prop: 'deviceType',
                    value: '',
                    type: 'select',
                    option: {}
                }
            ],
            // -- 上表
            topSelectionId: [],
            topSelection: [],
            topRow: {},
            topCurrentRow: {},
            topTableLoading: false,
            topPageTotal: 0,
            topPageSize: 20,
            topCurrentPage: 1,
            currentRowTopKey: '',
            topTableData: [],
            topTableColumn: [
                {
                    label: '设备编号',
                    prop: 'deviceCode',
                    showOverflowTooltip: true
                },
                {
                    label: '设备名称',
                    prop: 'deviceName',
                    showOverflowTooltip: true
                },
                {
                    label: '设备类型',
                    prop: 'deviceType',
                    formatter: (row, column, cell) => {
                        return this.storeDict['device_classification'][cell];
                    },
                    showOverflowTooltip: true
                },
                {
                    label: '维护人员',
                    prop: 'updateBy',
                    showOverflowTooltip: true
                }, {
                    label: '维护日期',
                    prop: 'updateTime',
                    showOverflowTooltip: true
                }, {
                    label: '状态',
                    prop: 'status',
                    showOverflowTooltip: true,
                    formatter(row, col, cell, index) {
                        return dict['status'][cell];
                    }
                }, {
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
                    label: '方案名称',
                    prop: 'programName',
                    value: ''
                },
                {
                    label: '状态',
                    prop: 'status',
                    value: '',
                    type: 'select',
                    option: dict.status,
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
                    label: '方案编码',
                    prop: 'programCode',
                    showOverflowTooltip: true,
                },
                {
                    label: '方案名称',
                    prop: 'programName',
                    showOverflowTooltip: true,
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
                    showOverflowTooltip: true,
                },
                {
                    label: '维护时间',
                    prop: 'updateTime',
                    showOverflowTooltip: true,
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
            // --维保方案增加修改弹窗--
            // isSave: false,
            dialogState: '',
            submitLoading: false,
            collapse: false,
            dialogAddVisible: false,
            dialogAddForm: [
                {
                    value: '',
                    prop: 'deviceCode',
                    slot: 'no',
                },
                {
                    label: '设备名称',
                    prop: 'deviceName',
                    value: '',
                    required: true,
                    // disabled: true
                },
                {
                    label: '设备类型',
                    prop: 'deviceType',
                    value: '',
                    type: 'select',
                    option: () => this.storeDict['device_classification']
                    // disabled: true
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
            isClickType: false,
            btnsDialog: [
                {
                    label: '保存',
                    click: () => this.saveData(),
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_equiprepairprogram_add'
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
            isEditDialog: false,
            dialogVisiblePreview: false,
            dialogBtn: [
                {
                    label: '添加',
                    click: () => {
                        this.addPlanVisible = !this.addPlanVisible;
                        this.getPlanData();
                    },
                    className: 'iconfont iconadd_',
                    permi: 'devicemanager_equiprepairprogramdet_add',
                    disabled: () => this.isEditDialog
                },
                {
                    label: '删除',
                    click: () => this.dialogRelRow(),
                    disabled: () => this.dialogIsedit,
                    className: 'iconfont iconstatus-delete',
                    permi: 'devicemanager_equiprepairprogramdet_dels'
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
                    label: '方案名称',
                    prop: 'programName',
                    value: ''
                }
            ],
            // 维保内容table
            // dialogTableLoading: false,
            dialogSelectionId: [],
            dialogPageSize: 20,
            dialogCurrentPage: 1,
            dialogPageTotal: 0,
            dialogTableData: [],
            dialogTableColumn: [
                {
                    label: '方案编码',
                    prop: 'programCode',
                    showOverflowTooltip: true
                }, {
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
                    label: '状态',
                    prop: 'status',
                    showOverflowTooltip: true,
                    formatter(row, col, cell, index) {
                        return dict['status'][cell];
                    }
                },
                {
                    label: '维护人员',
                    prop: 'updateBy',
                    showOverflowTooltip: true
                },
                {
                    label: '维护时间',
                    prop: 'updateTime',
                    showOverflowTooltip: true
                },
                {
                    label: '备注',
                    prop: 'remark',
                    showOverflowTooltip: true
                }
            ],
            addPlanForm: {},
            // 零件编号
            deviceNoFrom: {},
            dialogTableLoading: false,
            deviceNoVisible: false,
            rowDeviceNoId: '',
            deviceNoRow: {},
            deviceNoPageSize: 20,
            deviceNoPageCurrent: 1,
            deviceNoPageTotal: 0,
            deviceNoColumn: [
                {
                    label: '设备编号',
                    prop: 'equipNum',
                    searchBy: true,
                    showOverflowTooltip: true,
                }, {
                    label: '设备名称',
                    prop: 'equipName',
                    searchBy: true,
                    showOverflowTooltip: true,
                }, {
                    label: '设备类型',
                    prop: 'equipType',
                    showOverflowTooltip: true,
                    formatter: (row, column, cell) => {
                        return this.storeDict['device_classification'][cell];
                    }
                }
            ],
            deviceNoData: [],
            // 添加维保方案列表
            addPlanFrom: {},
            addPlanVisible: false,
            addPlanSelection: [],
            addPlanPageSize: 20,
            addPlanPageCurrent: 1,
            addPlanPageTotal: 0,
            addPlanColumn: [{
                type: 'selection',
            }, {
                label: '方案编号',
                prop: 'programCode',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '方案名称',
                prop: 'programName',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '维保分类',
                prop: 'repairType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['maintenance'][cell];
                }
            }, {
                label: '维护人员',
                prop: 'updateBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, col, cell, index) {
                    return dict['status'][cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            addPlanData: [],
            newSaveId: '',
            addPlanConditionList: [],
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
        }
    },
    watch: {
        // 添加部件编号
        deviceNoVisible(val) {
            if (!val) {
                this.clearData('deviceNoCurrentPage', 'deviceNoPageTotal', 'deviceNoData');
                this.deviceNoRow = {};
                this.deviceNoFrom = {};
            }
        },
        // 添加方案从表
        addPlanVisible(val) {
            if (!val) {
                this.clearData('addPlanPageCurrent', 'addPlanPageTotal', 'addPlanData');
                this.addPlanSelection = [];
                this.addPlanFrom = {};
            }
        },
        // 新增修改弹窗
        dialogAddVisible(val) {
            if (!val) {
                // 清空弹窗数据
                this.dialogState = '';
                this.uploadList = [];
                this.reset(this.searchDialogForm);
                this.clearData('dialogCurrentPage', 'dialogPageTotal', 'dialogTableData');
                this.topRow = {};
                // // 上表
                this.getTopTable();
                this.clearData('underPageCurrent', 'underpageTotal', 'underTableData');
                this.$refs.topTable.setCurrentRow();
                this.$refs.dialogTable.clearSelection();
            }
        },
        // 检查状态
        dialogState(val) {
            if (val === 'add') {
                this.isClickType = false;
                this.isEditDialog = true;
                this.isUpLoad = false;
                this.stateHandle();
            } else if (val === 'edit') {

                let status = this.topRow.status;
                if (status === '1' || status === '2') {
                    this.isClickType = true;
                    this.isEditDialog = true;
                    this.isUpLoad = true;
                    this.dialogAddForm.forEach(v => {
                        v.disabled = true;
                    });
                } else {
                    this.isClickType = false;
                    this.isEditDialog = false;
                    this.isUpLoad = false;
                    this.stateHandle();
                }

            }
        }
    },
    created() {
        Promise.all([this.queryDict('maintenance'), this.queryDict('device_classification')]).then(() => {
            this.getTopTable();
            this.searchTopForm[1].option = this.storeDict['device_classification'];
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
        reset(arr) {
            arr.forEach(v => {
                v.value = '';
            });
        },
        resetType(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        // --上表table
        getTopTable() {
            this.topTableLoading = true;
            this.$http
                .get('/devicemanager/equiprepairprogram/page', {
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
        delRow() {
            this.$confirm('是否确认删除?', '提示', { type: 'warning' }).then(() => {
                this.topTableLoading = true;
                this.$http
                    .delete('/devicemanager/equiprepairprogram/removeByIds', {
                        data: this.topSelectionId
                    })
                    .then(() => {
                        this.topTableLoading = false;
                        this.$message({ message: '删除成功!', type: 'success' });
                        this.topSelection = [];
                        this.resetTopTable();
                        this.resetUnderTable();
                        this.topSelectionId = [];
                        this.$refs.topTable.clearSelection();
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
                .put('/devicemanager/equiprepairprogram/startProgram', this.topSelectionId)
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
                .post('/devicemanager/equiprepairprogram/stopProgram', this.topSelectionId)
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
        TopDblclick(row) {
            this.topRow = this.topCurrentRow;
            this.editRowTop(row);
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
        // 下表
        underChangeSize(val) {
            this.underpageSize = val;
            this.getUnderTable();
        },
        underChangeCurrent(val) {
            this.underPageCurrent = val;
            this.getUnderTable();
        },
        resetUnderTable() {
            this.conditionListDown = [];
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
            const conditionList = [{
                fieldName: 'equipProgramId',
                operation: 'EQ',
                value: this.topCurrentRow.id,
                joinType: 'AND'
            }, ...this.conditionListDown];
            this.underTableLoading = true;
            this.$http
                .get('/devicemanager/equiprepairprogramdet/page', {
                    params: {
                        current: this.underPageCurrent,
                        size: this.underpageSize,
                        conditionList,
                    }
                })
                .then(res => {
                    this.underTableLoading = false;
                    this.underpageTotal = res.data.total;
                    this.underTableData = res.data.records;
                })
                .catch(() => {
                    this.underTableLoading = false;
                });

        },
        // -- 新增修改弹窗
        editRowTop(row) {
            this.dialogAddVisible = !this.dialogAddVisible;
            this.editRowData(this.topRow, this.dialogAddForm);
            this.newSaveId = row.id;
            // 下表获取数据
            this.getDialogTabe();
        },
        newRowTop() {
            this.dialogState = 'add';
            this.dialogAddVisible = !this.dialogAddVisible;
            this.dialogAddForm[3].value = '0';
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
        saveData() {
            this.$refs.addFrom.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[0].loading = true;
                    let param = this.paramData(this.dialogAddForm);
                    // 新增
                    this.$http.post('/devicemanager/equiprepairprogram/save', param).then(({ data }) => {
                        this.btnsDialog[0].loading = false;
                        this.editRowData(data, this.dialogAddForm);
                        this.topRow = data;
                        this.dialogAddForm.forEach(v => {
                            v.value = data[v.prop];
                        });
                        this.newSaveId = data.id;
                        this.$message({ message: '新增成功!', type: 'success' });
                    }).catch(() => {
                        this.btnsDialog[0].loading = false;
                    });
                }
            });
        },
        editData() {
            this.$refs.addFrom.$refs.form.validate(valid => {
                if (valid) {
                    this.btnsDialog[0].loading = true;
                    let param = this.paramData(this.dialogAddForm);
                    // debugger;
                    param.id = this.topRow.id;
                    this.$http
                        .put('/devicemanager/equiprepairprogram/updateById', param)
                        .then(({ data }) => {
                            this.btnsDialog[0].loading = false;
                            this.$message({ message: '修改成功!', type: 'success' });
                            this.topRow = data;
                            this.dialogAddForm.forEach(v => {
                                v.value = data[v.prop];
                            });
                        })
                        .catch(() => { this.btnsDialog[0].loading = false });
                }
            });
        },
        // 弹窗table操作
        resetDialogTable() {
            this.dialogCurrentPage = 1;
            this.getDialogTabe();
        },
        getDialogTabe() {
            let params = {
                size: this.dialogPageSize,
                current: this.dialogCurrentPage,
                conditionList: [{
                    fieldName: 'equipProgramId',
                    operation: 'EQ',
                    value: this.topRow.id,
                    joinType: 'AND'
                }]
            };
            this.searchDialogForm.forEach(v => {
                if (v.value) {
                    params.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND'
                    });
                }
            });
            this.dialogTableLoading = true;
            this.$http
                .get('/devicemanager/equiprepairprogramdet/page', { params })
                .then(res => {
                    this.dialogTableLoading = false;
                    this.dialogPageTotal = res.data.total;
                    this.dialogTableData = res.data.records;
                })
                .catch(() => {
                    this.dialogTableLoading = false;
                });
        },
        dialogChangeCurrent(val) {
            this.dialogCurrentPage = val;
            this.getDialogTabe();
        },
        dialogChangeSize(val) {
            this.dialogPageSize = val;
            this.getDialogTabe();
        },
        dialogSelectChange(selection) {
            let dialogSelect = selection.filter(v => v);
            this.dialogSelectionId = dialogSelect.map(v => v.id);
        },
        // 删除
        dialogRelRow() {
            this.$confirm('是否确认删除?', '提示', { type: 'warning' }).then(() => {
                this.dialogTableLoading = true;
                this.$http
                    .delete(`/devicemanager/equiprepairprogramdet/removeByIds`, {
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
        // 添加维保方案列表
        getPlanData() {
            this.dialogTableLoading = true;
            let conditionList = [];
            for (let i in this.addPlanFrom) {
                if (this.addPlanFrom[i]) {
                    conditionList.push({
                        fieldName: i,
                        operation: 'LIKE',
                        value: this.addPlanFrom[i],
                        joinType: 'AND'
                    });
                }
            }
            this.$http
                .get(`/devicemanager/repairprogram/selectProgramPage/${this.newSaveId}`, {
                    params: {
                        current: this.addPlanPageCurrent,
                        size: this.addPlanPageSize,
                        conditionList,
                    }
                })
                .then(res => {
                    this.dialogTableLoading = false;
                    this.addPlanData = res.data.records;
                    this.addPlanPageTotal = res.data.total;
                })
                .catch(() => {
                    this.dialogTableLoading = false;
                });
        },
        // 获取编码
        getDeviceNo() {
            this.deviceNoVisible = !this.deviceNoVisible;
            this.getDeviceNoData();
        },
        resetDeviceNoData() {
            this.deviceNoPageCurrent = 1;
            this.getDeviceNoData();
        },
        getDeviceNoData() {
            // 获取设备编号
            this.dialogTableLoading = true;
            const conditionList = [];
            for (let v in this.deviceNoFrom) {
                if (v) {
                    conditionList.push({
                        fieldName: v,
                        operation: 'LIKE',
                        value: this.deviceNoFrom[v],
                        joinType: 'AND'
                    });
                }
            }
            this.$http
                .get('/basicdata/deviceaccount/selectEquipmentAccountPage', {
                    params: {
                        current: this.deviceNoPageCurrent,
                        size: this.deviceNoPageSize,
                        conditionList
                    }
                })
                .then(res => {
                    this.dialogTableLoading = false;
                    this.deviceNoData = res.data.records;
                    this.deviceNoPageTotal = res.data.total;
                })
                .catch(() => {
                    this.dialogTableLoading = false;
                });
        },
        deviceNoSearchType(form) {
            this.deviceNoFrom = form;
            this.resetDeviceNoData();
        },
        getDeviceNoRow(row) {
            this.deviceNoRow = row;
        },
        deviceNoCurrent(val) {
            this.deviceNoPageCurrent = val;
            this.getDeviceNoData();
        },
        deviceNoSize(val) {
            this.deviceNoPageSize = val;
            this.getDeviceNoData();
        },
        DeviceNosubmit() {
            let { equipNum, equipName, equipType } = this.deviceNoRow;
            // 设备编号,设备名称,设备类型
            // deviceCode,deviceName,deviceType
            this.dialogAddForm[0].value = equipNum;
            this.dialogAddForm[1].value = equipName;
            this.dialogAddForm[2].value = equipType;
            this.dialogAddForm[4].value = this.userInfo.nickname;
            this.dialogAddForm[5].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.deviceNoVisible = false;
        },
        // 添加维保方案列表
        addPlanSearch(form) {
            this.addPlanFrom = form;
            this.resetPlanData();
        },
        resetPlanData() {
            this.addPlanPageCurrent = 1;
            this.getPlanData();
        },
        addPlanSize(val) {
            this.addPlanPageSize = val;
            this.getPlanData();
        },
        addPlanCurrent(val) {
            this.addPlanPageCurrent = val;
            this.getPlanData();
        },
        addPlanGetRow(selection) {
            this.addPlanSelection = selection;
        },
        addPlanSubmit() {
            const params = this.addPlanSelection.map(v => ({
                programCode: v.programCode,
                equipProgramId: this.newSaveId,
                programId: v.id,
                programName: v.programName,
                remark: v.remark,
                repairType: v.repairType,
                status: v.status,
            }));
            this.submitLoading = true;
            this.$http.post('/devicemanager/equiprepairprogramdet/save', params).then(() => {
                this.$message({ message: '新增成功!', type: 'success' });
                this.submitLoading = false;
                this.addPlanVisible = false;
                this.getDialogTabe();
            }).catch(() => {
                this.submitLoading = false;
            });
        },
        // --图片上传
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
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        paramData(form) {
            let param = {};
            form.forEach(v => {
                if (v.value) {
                    param[v.prop] = v.value;
                }
            });
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
        editRowData(data, form) {
            this.dialogState = 'edit';
            this.$set(
                this.btnsDialog, 0,
                {
                    label: '保存',
                    click: () => this.editData(),
                    className: 'iconfont iconstatus-Preservation-',
                    permi: 'devicemanager_equiprepairprogram_edit',
                    // devicemanager_equiprepairprogram_edit
                    loading: false,
                    disabled: () => this.isEditDialog
                });

            // 表单赋值
            form.forEach(v => {
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
        clearData(cur, total, data) {
            this[cur] = 1;
            this[total] = 0;
            this[data] = [];
        },
        // 状态处理表单禁用
        stateHandle() {
            this.dialogAddForm.forEach(v => {
                if (v.prop === 'deviceName' || v.prop === 'deviceType' || v.prop === 'status' || v.prop === 'updateBy' || v.prop === 'updateTime') {
                    v.disabled = true;
                } else {
                    v.disabled = false;
                }
            });

        }
    }
};
</script>

<style lang="stylus" scoped>
.deviceGuarantee
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

