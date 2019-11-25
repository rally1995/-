<template lang="pug">
    ebrain-main.workshop
        ebrain-frame(
            title="工作中心")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchParent"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRowParent"
                    row-key="id"
                    highlight-current-row
                    @row-click="getAllSon"
                    @selection-change="selectChangeParent"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame.tabs
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="设备信息" name="first")
                    el-tab-pane(label="生产参数" name="second")
                    el-tab-pane(label="工位信息" name="third")
                    el-tab-pane(label="SOP" name="four")
                    //- el-tab-pane(label="过程记录" name="five")
            template(#tools)
                ebrain-tools(
                    :buttons="bthsDownL"
                    v-show="activeName === 'first'")
                ebrain-tools(
                    :buttons="btnsDownC"
                    v-show="activeName === 'second'")
                ebrain-tools(
                    :buttons="btnsDownR"
                    v-show="activeName === 'third'")
                ebrain-tools(
                    :buttons="btnsDownF"
                    v-show="activeName === 'four'")
                ebrain-tools(
                    :buttons="btnsDownS"
                    v-show="activeName === 'five'")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoadingDown"
                    :isShow="false"
                    v-if="activeName === 'first'"
                    :data="tableDataSonL"
                    :column="tableColumnSonL"
                    row-key="id"
                    key="first"
                    highlight-current-row
                    @selection-change="selectChangeDown"
                    :current-row-key.sync="currentRowKeySon")
                ebrain-table(
                    :tableLoading="tableLoadingDown"
                    :data="tableDataSonC"
                    :column="tableColumnSonC"
                    :isShow="false"
                    v-if="activeName === 'second'"
                    row-key="id"
                    key="second"
                    @row-dblclick="editRowSon"
                    @selection-change="selectChangeDown"
                    :current-row-key.sync="currentRowKeySon"
                    highlight-current-row)
                    template(#operate)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    width="50"
                                    type="primary"
                                    @click="configuration(row)") 配置
                ebrain-table(
                    :tableLoading="tableLoadingDown"
                    :data="tableDataSonR"
                    :column="tableColumnSonR"
                    :isShow="false"
                    v-if="activeName === 'third'"
                    row-key="id"
                    key="third"
                    @row-dblclick="editRowSon"
                    @selection-change="selectChangeDown"
                    :current-row-key.sync="currentRowKeySon"
                    highlight-current-row)
                    template(#material)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    width="50"
                                    type="primary"
                                    @click="allocation(row)") 配置
                ebrain-table(
                    :tableLoading="tableLoadingDown"
                    :isShow="false"
                    v-if="activeName === 'four'"
                    :data="tableDataSonF"
                    :column="tableColumnSonF"
                    row-key="id"
                    key="four"
                    highlight-current-row
                    @selection-change="selectChangeDown"
                    :current-row-key.sync="currentRowKeySon")
                    template(#SOP)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                upload-button(
                                    :row-key="currentRowKeySon"
                                    @finish="getDataSonF")
                ebrain-table(
                    :tableLoading="tableLoadingDown"
                    :isShow="false"
                    v-if="activeName === 'five'"
                    :data="tableDataSonS"
                    :column="tableColumnSonS"
                    row-key="id"
                    key="five"
                    highlight-current-row
                    @selection-change="selectChangeDown"
                    :current-row-key.sync="currentRowKeySon")
                    template(#records)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    width="50"
                                    type="primary"
                                    @click="configuration_Records(row)") 配置
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
        ebrain-dialog(
            ref="dialogFormSon"
            key="xzsccs"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#equipNum)
                el-col(:span="12")
                    el-form-item(label="设备编码" prop="equipNum" required)
                        el-input(readonly=true v-model="dialogFormSonL[1].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails")
        ebrain-dialog(
            key="cslb"
            ref="dialogTableEbrain"
            :submitLoading='submitLoading'
            :visible.sync="dialogCenter"
            :form.sync="dialogFormSonC"
            :isShow="false"
            :isCancel="false")
            ebrain-frame(title="参数列表")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom")
                template(#table)
                    ebrain-table.table_dialog(
                        :tableLoading='tableLoadingDown'
                        :pageSize='pageSize_down'
                        :currentPage='currentPage_down'
                        :pageTotal='pageTotal_down'
                        :data="tableDataDialog"
                        :column="tableColumnDialog"
                        @changeCurrent="changeCurrent_down"
                        @changeSize='changeSize_down'
                        @selection-change="getSelectionSon"
                        row-key="id"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyDialog")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogRecords"
            :form.sync="dialogFormSonS"
            :isShow="false"
            :isCancel="false")
            ebrain-frame(title="过程记录")
                template(#tools)
                    ebrain-tools(:buttons="btnsRecords")
                template(#table)
                    ebrain-table.table_dialog(
                        :tableLoading='tableLoadingDown'
                        :pageSize='pageSize_down_Records'
                        :currentPage='currentPage_down_Records'
                        :pageTotal='pageTotal_down_Records'
                        :data="tableDataDialog_Records"
                        :column="tableColumnDialog_Records"
                        @changeCurrent="changeCurrent_down_Records"
                        @changeSize='changeSize_down_Records'
                        @selection-change="getSelectionSon_Records"
                        row-key="id"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyDialog_Records")
        ebrain-dialog(
            key="pz"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleTable"
            :form.sync="dialogTable"
            @submit="submitFormDialogTable")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleTable_Records"
            :form.sync="dialogTable_Records"
            @submit="submitFormDialogTable_Records")
        ebrain-dialog-table(
            row-key="id"
            height="50vh"
            :data="tableData_table"
            :column="tableColumn_table"
            :visible.sync="dialogVisibleDialogTable"
            :current-row-key.sync="currentRowKeyDialogTable"
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            :pageTotal="pageTotal_table"
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @select="getSelectionMaterial"
            highlight-current-row
            @submit="submitFormDialog_table")
            template(#tools)
                div.el-table-button
                    el-button(@click="newTable2" type="primary") 新增
                    el-button(@click="delTable" type="primary" :disabled="deleteMaterial") 删除
        ebrain-dialog-table(
            :tableLoading="dialogTableLoading"
            :isShow="false"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable2"
            height="50vh"
            :data="listDetailsData"
            :column="tableColumn_table2"
            :submitLoading="submitLoading2"
            :visible.sync="dialogVisibleTable_dialog"
            @current-change="currentChange"
            @submit="submitFormDialogTable2")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialogDetail"
            height="50vh"
            :data="dialogData"
            :column="dialogColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleDetail"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChangeDiaolgDetail"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialog")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import dict from '@/utils/dict';
import uploadButton from './uploadButton';
// import * as _ from 'lodash';
export default {
    name: 'workshop',
    components: {
        uploadButton
    },
    data() {
        return {
            row: {},
            uploadLoading: false,
            tableColumnDialog_Records: [{
                type: 'selection'
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage_down_Records - 1) * this.pageSize_down_Records + index + 1;
                }
            }, {
                label: '记录表编号',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '记录表名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            }, {
                label: '理论值',
                prop: 'plcAddr',
                showOverflowTooltip: true,
            }],
            tableDataDialog_Records: [],
            dialogVisibleTable_Records: false,
            selectionDialog_Records: [],
            currentRowKeyDialog_Records: '',
            pageSize_down_Records: 20,
            currentPage_down_Records: 1,
            pageTotal_down_Records: 0,
            dialogRecords: false,
            tableColumnSonS: [{
                type: 'selection'
            }, {
                label: '记录表编号',
                prop: 'materialTypeNo',
                showOverflowTooltip: true
            }, {
                label: '记录表名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }, {
                slot: 'records',
            }],
            tableDataSonS: [],
            tableColumnSonF: [{
                type: 'selection'
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
            }, {
                label: '文件编号',
                prop: 'fileNo',
                showOverflowTooltip: true,
            }, {
                label: '文件名称',
                prop: 'fileName',
                showOverflowTooltip: true,
            }, {
                slot: 'SOP',
            }],
            tableDataSonF: [],
            conditionList: [],
            corp: '',
            dialogVisibleDetail: false,
            rowObjDetail: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            submitLoadingDetail: false,
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
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                }
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true
            }],
            dialogData: [],
            currentRowKeyDialogDetail: '',
            rowObj: {},
            dialogVisibleTable_dialog: false,
            submitLoading2: false,
            listDetailsData: [],
            currentRowKeyDialogTable2: '',
            dialogTableLoading: false,
            allocationId: '',
            configurationId: '',
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            MaterialSelection: [],
            dialogVisibleTableData2: false,
            currentRowKeyDialogTable: '',
            tableData_table: [],
            tableColumn_table: [{
                type: 'selection'
            }, {
                label: '物料类型编码',
                prop: 'materialTypeNo',
                showOverflowTooltip: true
            }, {
                label: '物料类型名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true
            }],
            tableColumn_table2: [{
                label: '物料类型编码',
                prop: 'materialTypeCode',
                showOverflowTooltip: true
            }, {
                label: '物料类型名称',
                prop: 'materialTypeName',
                showOverflowTooltip: true
            }],
            dialogVisibleDialogTable: false,
            currentRowKeyDialog: '',
            dialogVisibleTable: false,
            dialogCenter: false,
            selectionDialog: [],
            tableDataDialog: [],
            pageTotal_down: 0,
            pageSize_down: 20,
            currentPage_down: 1,
            selection: [],
            equipmentInfo: [],
            selectionParent: [],
            activeName: 'first',
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSonL: [],
            tableDataSonR: [],
            tableDataSonC: [],
            List: [],
            tableColumnParent: [{
                type: 'selection'
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                }
            }, {
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true
            }, {
                label: 'PLC地址',
                prop: 'plcAddr',
                showOverflowTooltip: true
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }],
            tableColumnSonL: [{
                type: 'selection'
            }, {
                label: '设备编码',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                }
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true
            }, {
                label: '单位',
                prop: 'corp',
                showOverflowTooltip: true
            }, {
                label: 'PLC地址',
                prop: 'plcAddr',
                showOverflowTooltip: true
            }],
            tableColumnSonC: [{
                type: 'selection'
            }, {
                label: '程式编码',
                prop: 'programNo',
                showOverflowTooltip: true
            }, {
                label: '程式名称',
                prop: 'programName',
                showOverflowTooltip: true
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }, {
                slot: 'operate'
            }],
            tableColumnSonR: [{
                type: 'selection'
            }, {
                label: '工位编号',
                prop: 'stationNo',
                showOverflowTooltip: true
            }, {
                label: '工位名称',
                prop: 'stationName',
                showOverflowTooltip: true
            }, {
                label: '工位类型',
                prop: 'stationType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.stationType[cell];
                }
            }, {
                label: '工位描述',
                prop: 'stationDesc',
                showOverflowTooltip: true
            }, {
                label: '料台标记',
                prop: 'hasPlatform',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.platformMark[cell];
                }
            }, {
                label: '是否暂存工位',
                prop: 'isTempStorage',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.whetherCrossDay[cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true
            }, {
                slot: 'material'
            }],
            tableColumnDialog: [{
                type: 'selection'
            }, {
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                }
            }, {
                label: '参数编码',
                prop: 'paramNo',
                showOverflowTooltip: true
            }, {
                label: '参数名',
                prop: 'paramName',
                showOverflowTooltip: true
            }, {
                label: '参数值',
                prop: 'paramValue',
                showOverflowTooltip: true
            }],
            dialogFormParent: [{
                // 上表修改页信息
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
                required: true,
                disabled: true
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: '',
                required: true
            }, {
                label: 'PLC地址',
                prop: 'plcAddr',
                value: ''
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: ''
            }],
            dialogFormSon: [],
            dialogFormSonL: [{
                label: '设备编码',
                prop: 'equipNum',
                value: '',
                slot: 'equipNum',
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                disabled: true
            }, {
                label: '设备类型',
                prop: 'equipType',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_classification'],
                disabled: true
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                disabled: true
            }, {
                label: '单位',
                prop: 'unitName',
                value: '',
                disabled: true,
            }, {
                label: 'PLC地址',
                prop: 'plcAddr',
                value: ''
            }],
            dialogFormSonC: [{
                label: '程式编码',
                prop: 'programNo',
                value: '',
                required: true
            }, {
                label: '程式名称',
                prop: 'programName',
                value: '',
                required: true
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: ''
            }],
            dialogFormSonR: [{
                label: '工位编号',
                prop: 'stationNo',
                value: '',
                required: true
            }, {
                label: '工位名称',
                prop: 'stationName',
                value: '',
                required: true,
            }, {
                label: '工位类型',
                prop: 'stationType',
                value: '',
                type: 'select',
                option: dict.stationType,
            }, {
                label: '工位描述',
                prop: 'stationDesc',
                value: ''
            }, {
                label: '料台标记',
                prop: 'hasPlatform',
                value: '',
                type: 'select',
                option: dict.platformMark,
            }, {
                label: '是否暂存工位',
                prop: 'isTempStorage',
                value: '',
                type: 'select',
                option: dict.whetherCrossDay,
                change: val => {
                    this.dialogFormSonR[6].show = val !== '0';
                }
            }, {
                label: '排序号',
                prop: 'seq',
                value: '',
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^[1-9]\d*$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入有效数字!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                show: false,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            dialogFormSonF: [{
                label: '文件编号',
                prop: 'fileNo',
                value: '',
                required: true,
            }, {
                label: '文件名称',
                prop: 'fileName',
                value: '',
            }],
            dialogFormSonS: [{
                label: '记录表编号',
                prop: 'fileNo',
                value: '',
            }, {
                label: '记录表名称',
                prop: 'fileName',
                value: '',
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: ''
            }],
            dialogTable: [{
                label: '参数编码',
                prop: 'paramNo',
                value: '',
                required: true
            }, {
                label: '参数名',
                prop: 'paramName',
                value: '',
                required: true
            }, {
                label: '参数值',
                prop: 'paramValue',
                value: ''
            }],
            dialogTable_Records: [{
                label: '记录表编号',
                prop: 'a',
                value: '',
                required: true
            }, {
                label: '记录表名称',
                prop: 'b',
                value: '',
                required: true
            }, {
                label: '理论值',
                prop: 'c',
                value: ''
            }],
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: ''
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: ''
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_workcenter_add'
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'devicemanager_workcenter_edit'
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.selectionParent.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'devicemanager_workcenter_dels'
            }, {
                label: '搜索',
                click: () => {
                    this.searchVisible = !this.searchVisible;
                },
                className: 'iconfont iconsearch fr',
                permi: false
            }],
            bthsDownL: [
                {
                    label: '新增',
                    click: () => this.newRowSon(),
                    className: 'iconfont iconstatus-Preserve-and-add',
                    permi: 'devicemanager_workcenterdevicelist_add',
                    disabled: () => !this.currentRowKeyParent
                },
                {
                    // label: '修改',
                    // click: () => this.editRowSon(),
                    // disabled: () => this.editDisabledSon,
                    // className: 'iconfont iconstatus-edit',
                    // permi: 'devicemanager_workcenterdevicelist_edit',
                },
                {
                    label: '删除',
                    click: () => this.delRowSon(),
                    disabled: () => this.selection.length === 0,
                    className: 'iconfont iconstatus-delete',
                    permi: 'devicemanager_workcenterdevicelist_dels'
                }
            ],
            btnsDownC: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionexe_prodprogram_add',
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'productionexe_prodprogram_edit'
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'productionexe_prodprogram_dels'
            }],
            btnsDownR: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: false,
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: false
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: false
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newdialog(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionexe_prodprogramparam_add',
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editdialog(),
                disabled: () => this.editDisabledDialog,
                className: 'iconfont iconstatus-edit',
                permi: 'productionexe_prodprogramparam_edit'
            }, {
                label: '删除',
                click: () => this.deldialog(),
                disabled: () => this.selectionDialog.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'productionexe_prodprogramparam_dels'
            }],
            btnsRecords: [{
                label: '新增',
                click: () => this.newdialog_Records(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionexe_stationmaterialbind_add',
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editdialog_Records(),
                disabled: () => this.editDisabledDialog,
                className: 'iconfont iconstatus-edit',
                permi: 'productionexe_prodprogramparam_edit'
            }, {
                label: '删除',
                click: () => this.deldialog_Records(),
                disabled: () => this.selectionDialog.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'productionexe_stationmaterialbind_dels'
            }],
            btnsDownF: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_basicsop_add',
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_basicsop_edit'
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_basicsop_dels'
            }],
            btnsDownS: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_basicsop_add',
                disabled: () => !this.currentRowKeyParent
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_basicsop_edit'
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_basicsop_dels',
            }],
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
        editDisabledDialog() {
            return this.currentRowKeyDialog === '';
        },
        editDisabledDialogTable() {
            return this.currentRowKeyDialogTable === '';
        },
        deleteMaterial() {
            return this.MaterialSelection.length === 0;
        },
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser
        })
    },
    watch: {
        dialogVisibleSon(v) {
            if (!v) {
                if (this.$refs.dialogFormSon && this.$refs.dialogFormSon.$refs.form) {
                    this.$refs.dialogFormSon.$refs.form.resetFields();
                }
                if (this.$refs.dialogTableEbrain && this.$refs.dialogTableEbrain.$refs.form) {
                    this.$refs.dialogTableEbrain.$refs.form.resetFields();
                }
            }
        },
        dialogCenter(v) {
            if (!v) {
                if (this.$refs.dialogFormSon && this.$refs.dialogFormSon.$refs.form) {
                    this.$refs.dialogFormSon.$refs.form.resetFields();
                }
                if (this.$refs.dialogTableEbrain && this.$refs.dialogTableEbrain.$refs.form) {
                    this.$refs.dialogTableEbrain.$refs.form.resetFields();
                }
            }
        }
    },
    created() {
        this.queryDict('device_classification');
    },
    activated() {
        this.getDataParent();
        this.currentRowKeyParent = '';
        this.tableDataSonL = [];
        this.tableDataSonC = [];
        this.tableDataSonR = [];
        this.tableDataSon = [];
    },
    mounted() {
        this.getDataParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'OR'
                    });
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        // 获取上表信息
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/basicdata/workcenter/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                }
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        // 获取下表信息
        getDataSonL() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            this.$http.get(`/basicdata/workcenterdevicelist/pageByworkCenterCode/${item.workCenterCode}?size=9999`).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSonL = data.records;
            });
        },
        getDataSonC() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: item.workCenterCode
            }];
            this.$http.get(`/basicdata/program/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSonC = res.data.records;
            });
        },
        getDataSonR() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: item.workCenterCode
            }];
            this.$http.get(`/productionexe/station/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSonR = res.data.records;
            });
        },
        getDataSonF() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: item.workCenterCode
            }];
            this.$http.get(`/basicdata/basicsop/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSonF = res.data.records;
            });
        },
        getDataSonS() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: item.workCenterCode
            }];
            this.$http.get(`/basicdata/basicsop/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSonS = res.data.records;
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
        // 上表新增页面
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogFormParent[0].disabled = false;
            this.dialogVisibleParent = true;
        },
        // 上表修改页面
        editRowParent() {
            this.dialogParent = 'edit';
            this.dialogFormParent[0].disabled = true;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisibleParent = true;
        },
        // 删除上表数据
        delRowParent() {
            const isLen =
            this.tableDataSonL.length +
            this.tableDataSonR.length +
            this.tableDataSonC.length >
            0;
            if (isLen) {
                this.$alert('存在子表, 不可删除', '提示', {
                    type: 'error'
                });
            } else {
                this.$confirm('是否删除？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete('/basicdata/workcenter/removeByIds', {
                        data: this.selectionParent
                    }).then(() => {
                        this.submitLoading = false;
                        this.tableDataSon = [];
                        this.getDataParent();
                        this.tableDataSonL = [];
                        this.tableDataSonC = [];
                        this.tableDataSonR = [];
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeyParent = '';
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                });
            }
        },
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/basicdata/workcenter/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeyParent;
                obj.costCenterCode = this.row.costCenterCode;
                obj.processCode = this.row.processCode;
                this.$http.put('/basicdata/workcenter/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 获取设备台账明细
        getEquipmentInfo(val = 1) {
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
            this.$http.get(`/basicdata/devicetype/page`, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
                // const item = this.dialogFormSonL.find(v => v.prop === 'equipName');
                // this.equipmentInfo = res.data.records;
                // const filterData = _.differenceBy(
                //     res.data.records,
                //     this.tableDataSonL,
                //     'equipNum',
                // );
                // let obj = {};
                // filterData.forEach(v => {
                //     obj[v.equipNum] = v.equipName;
                // });
                // item.option = obj;
            });
        },
        // 获取单位表
        getDicbasicunit() {
            return this.$http.get('/basicdata/dicbasicunit/page?size=999').then(res => {
                let son = this.dialogFormSonL.find(v => v.prop === 'corp');
                res.data.records.forEach(v => {
                    son.option[v.unitCode] = v.unitName;
                });
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getEquipmentInfo();
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
        enterTableDetails() {
            this.dialogSearchForm = {};
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.dialogVisibleDetail = true;
            this.getEquipmentInfo();
        },
        currentChangeDiaolgDetail(row) {
            this.rowObjDetail = row;
        },
        changeCurrent_1(val) {
            this.getEquipmentInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getEquipmentInfo();
        },
        submitFormDialog() {
            this.dialogVisibleDetail = false;
            this.dialogFormSonL[0].value = this.rowObjDetail.equipNum;
            this.dialogFormSonL[1].value = this.rowObjDetail.equipName;
            this.dialogFormSonL[2].value = this.rowObjDetail.equipType;
            this.dialogFormSonL[3].value = this.rowObjDetail.specModel;
            this.dialogFormSonL[4].value = this.rowObjDetail.unitName;
            this.corp = this.rowObjDetail.corp;
        },
        // 下表新增页面
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            if (this.activeName === 'first') {
                this.dialogFormSon = this.dialogFormSonL;
                // this.getEquipmentInfo();
            } else if (this.activeName === 'second') {
                this.dialogFormSon = this.dialogFormSonC;
                this.dialogFormSonC.forEach(v => {
                    v.disabled = false;
                });
                const programNo = this.dialogFormSonC.find(v => v.prop === 'programNo');
                programNo.disabled = false;
            } else if (this.activeName === 'third') {
                this.dialogFormSon = this.dialogFormSonR;
                const isTempShelf = this.dialogFormSonR.find(v => v.prop === 'isTempStorage');
                isTempShelf.value = '0';
                if (this.dialogFormSonR[5].value === '0') {
                    this.dialogFormSonR[6].show = false;
                }
            } else if (this.activeName === 'four') {
                this.dialogFormSon = this.dialogFormSonF;
            } else if (this.activeName === 'five') {
                this.dialogFormSon = this.dialogFormSonS;
            }
        },
        // 下表修改页面
        editRowSon() {
            this.dialogSon = 'edit';
            this.dialogVisibleSon = true;
            if (this.activeName === 'first') {
                this.dialogFormSon = this.dialogFormSonL;
                // this.getEquipmentInfo();
                const item = this.tableDataSonL.find(
                    v => v.id === this.currentRowKeySon
                );
                this.dialogFormSonL.forEach(v => {
                    v.value = item[v.prop];
                });
                this.getDicbasicunit().then(() => {
                    this.dialogVisibleSon = true;
                });
            } else if (this.activeName === 'second') {
                this.dialogFormSon = this.dialogFormSonC;
                const item = this.tableDataSonC.find(
                    v => v.id === this.currentRowKeySon
                );
                this.dialogFormSonC.forEach(v => {
                    v.value = item[v.prop];
                    v.disabled = false;
                });
                const programNo = this.dialogFormSonC.find(v => v.prop === 'programNo');
                programNo.disabled = true;
            } else if (this.activeName === 'third') {
                this.dialogFormSon = this.dialogFormSonR;
                const item = this.tableDataSonR.find(
                    v => v.id === this.currentRowKeySon
                );
                this.dialogFormSonR.forEach(v => {
                    this.dialogFormSonR[6].show = v.isTempStorage === '0';
                    v.value = item[v.prop];
                });
                if (this.dialogFormSonR[5].value === '1') {
                    this.dialogFormSonR[6].show = true;
                }
            } else if (this.activeName === 'four') {
                this.dialogFormSon = this.dialogFormSonF;
                const item = this.tableDataSonF.find(
                    v => v.id === this.currentRowKeySon
                );
                this.dialogFormSonF.forEach(v => {
                    v.value = item[v.prop];
                });
            } else if (this.activeName === 'five') {
                this.dialogFormSon = this.dialogFormSonS;
                const item = this.tableDataSonS.find(
                    v => v.id === this.currentRowKeySon
                );
                this.dialogFormSonS.forEach(v => {
                    v.value = item[v.prop];
                });
            }
        },
        // 删除下表信息
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                if (this.activeName === 'first') {
                    this.$http.delete('/basicdata/workcenterdevicelist/removeByIds', {
                        data: this.selection
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSonL();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeySon = '';
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else if (this.activeName === 'second') {
                    this.$http.delete('/basicdata/program/removeByIds', {
                        data: this.selection
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSonC();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeySon = '';
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else if (this.activeName === 'third') {
                    this.$http.delete('/productionexe/station/removeByIds', {
                        data: this.selection
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSonR();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeySon = '';
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else if (this.activeName === 'four') {
                    this.$http.delete(`/basicdata/basicsop/removeByIds`, {
                        data: this.selection
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSonF();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else if (this.activeName === 'five') {
                    this.$http.delete(`/basicdata/basicsop/removeByIds`, {
                        data: this.selection
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSonS();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            });
        },
        // 提交下表新增或者修改数据
        submitFormSon() {
            let obj = {};
            if (this.activeName === 'first') {
                this.dialogFormSonL.forEach(v => {
                    obj[v.prop] = v.value;
                });
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    const item = this.tableDataParent.find(
                        v => v.id === this.currentRowKeyParent
                    );
                    obj.workCenterCode = item.workCenterCode;
                    obj.corp = this.corp;
                    this.$http
                        .post('/basicdata/workcenterdevicelist/save', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonL();
                            this.$message({
                                message: '新增成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http
                        .put('/basicdata/workcenterdevicelist/updateById', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonL();
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                }
            } else if (this.activeName === 'second') {
                this.dialogFormSonC.forEach(v => {
                    obj[v.prop] = v.value;
                });
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    const item = this.tableDataParent.find(
                        v => v.id === this.currentRowKeyParent
                    );
                    obj.workcenterNo = item.workCenterCode;
                    this.$http
                        .post('/basicdata/program/save', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonC();
                            this.$message({
                                message: '新增成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http
                        .put('/basicdata/program/updateById', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonC();
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                }
            } else if (this.activeName === 'third') {
                this.dialogFormSonR.forEach(v => {
                    obj[v.prop] = v.value;
                });
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    const item = this.tableDataParent.find(
                        v => v.id === this.currentRowKeyParent
                    );
                    obj.workcenterNo = item.workCenterCode;
                    this.$http
                        .post('/productionexe/station/save', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonR();
                            this.$message({
                                message: '新增成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http
                        .put('/productionexe/station/updateById', obj)
                        .then(() => {
                            this.submitLoading = false;
                            this.getDataSonR();
                            this.$message({
                                message: '修改成功!',
                                type: 'success'
                            });
                            this.dialogVisibleSon = false;
                        })
                        .catch(() => {
                            this.submitLoading = false;
                        });
                }
            } else if (this.activeName === 'four') {
                this.dialogFormSonF.forEach(v => {
                    obj[v.prop] = v.value;
                });
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    const item = this.tableDataParent.find(
                        v => v.id === this.currentRowKeyParent
                    );
                    obj.workcenterNo = item.workCenterCode;
                    this.$http.post('/basicdata/basicsop/save', obj).then(() => {
                        this.submitLoading = false;
                        this.getDataSonF();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.dialogVisibleSon = false;
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http.put('/basicdata/basicsop/updateById', obj).then(() => {
                        this.submitLoading = false;
                        this.getDataSonF();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisibleSon = false;
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            } else if (this.activeName === 'five') {
                this.dialogFormSonS.forEach(v => {
                    obj[v.prop] = v.value;
                });
                this.submitLoading = true;
                if (this.dialogSon === 'new') {
                    const item = this.tableDataParent.find(
                        v => v.id === this.currentRowKeyParent
                    );
                    obj.workcenterNo = item.workCenterCode;
                    this.$http.post('/basicdata/basicsop/save', obj).then(() => {
                        this.submitLoading = false;
                        this.getDataSonS();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.dialogVisibleSon = false;
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                } else {
                    obj.id = this.currentRowKeySon;
                    this.$http.put('/basicdata/basicsop/updateById', obj).then(() => {
                        this.submitLoading = false;
                        this.getDataSonS();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisibleSon = false;
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                }
            }
        },
        // copyParent() {
        //     this.dialogParent = 'new';
        //     this.List = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
        //     this.dialogFormParent.forEach(v => {
        //         v.value = this.List[v.prop];
        //     });
        //     this.dialogVisibleParent = true;
        // },
        selectChangeDown(selection) {
            this.selection = selection.map(v => v.id);
        },
        selectChangeParent(selection) {
            this.selectionParent = selection.map(v => v.id);
        },
        configuration(row) {
            this.dialogFormSonC.forEach(v => {
                v.value = row[v.prop];
                v.disabled = true;
            });
            this.dialogCenter = true;
            this.configurationId = row.id;
            this.getDialogTable();
        },
        configuration_Records(row) {
            this.dialogFormSonS.forEach(v => {
                v.value = row[v.prop];
                v.disabled = true;
            });
            this.dialogRecords = true;
            // this.configurationId = row.id;
            this.getDialogTable_Records();
        },
        changeCurrent_down(val) {
            this.getDialogTable(val);
        },
        changeCurrent_down_Records(val) {
            this.getDialogTable_Records(val);
        },
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDialogTable();
        },
        changeSize_down_Records(val) {
            this.pageSize_down_Records = val;
            this.currentPage_down_Records = 1;
            this.getDialogTable_Records();
        },
        changeCurrent_table(val) {
            this.getMaterialType(val);
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            this.getMaterialType();
        },
        getSelectionSon(selection) {
            this.selectionDialog = selection.map(v => v.id);
        },
        getSelectionSon_Records(selection) {
            this.selectionDialog_Records = selection.map(v => v.id);
        },
        // 生产参数配置刷表
        getDialogTable(val = 1) {
            const conditionList = [{
                fieldName: 'programId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.configurationId
            }];
            this.$http
                .get(`/basicdata/programparam/page`, {
                    params: {
                        current: val,
                        size: this.pageSize_down,
                        conditionList
                    }
                })
                .then(res => {
                    this.tableDataDialog = res.data.records;
                    this.pageTotal_down = res.data.total;
                    this.currentPage_down = val;
                });
        },
        // 过程记录配置刷表
        getDialogTable_Records(val = 1) {
            const conditionList = [{
                fieldName: 'programId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.configurationId
            }];
            this.$http
                .get(`/productionexe/programparam/page`, {
                    params: {
                        current: val,
                        size: this.pageSize_down_Records,
                        conditionList
                    }
                })
                .then(res => {
                    this.tableDataDialog = res.data.records;
                    this.pageTotal_down_Records = res.data.total;
                    this.currentPage_down_Records = val;
                });
        },
        newdialog() {
            this.dialog = 'new';
            this.dialogVisibleTable = true;
        },
        newdialog_Records() {
            this.dialog = 'new';
            this.dialogRecords = true;
        },
        editdialog() {
            this.dialog = 'edit';
            const item = this.tableDataDialog.find(
                v => v.id === this.currentRowKeyDialog
            );
            this.dialogTable.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisibleTable = true;
        },
        editdialog_Records() {
            this.dialog = 'edit';
            const item = this.tableDataDialog_Records.find(
                v => v.id === this.currentRowKeyDialog_Records
            );
            this.dialogTable.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogRecords = true;
        },
        deldialog() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http
                    .delete('/basicdata/programparam/removeByIds', {
                        data: this.selectionDialog
                    })
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeyDialog = '';
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            });
        },
        deldialog_Records() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http
                    .delete('/productionexe/programparam/removeByIds', {
                        data: this.selectionDialog_Records
                    })
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable_Records();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeyDialog_Records = '';
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            });
        },
        submitFormDialogTable() {
            let obj = {};
            this.dialogTable.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialog === 'new') {
                obj.programId = this.configurationId;
                this.$http
                    .post('/basicdata/programparam/save', obj)
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.dialogVisibleTable = false;
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            } else {
                obj.id = this.currentRowKeyDialog;
                this.$http
                    .put('/basicdata/programparam/updateById', obj)
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisibleTable = false;
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            }
        },
        submitFormDialogTable_Records() {
            let obj = {};
            this.dialogTable_Records.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialog === 'new') {
                obj.programId = this.configurationId;
                this.$http
                    .post('/productionexe/programparam/save', obj)
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable_Records();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.dialogVisibleTable_Records = false;
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            } else {
                obj.id = this.currentRowKeyDialog_Records;
                this.$http
                    .put('/productionexe/programparam/updateById', obj)
                    .then(() => {
                        this.submitLoading = false;
                        this.getDialogTable_Records();
                        this.$message({
                            message: '修改成功!',
                            type: 'success'
                        });
                        this.dialogVisibleTable_Records = false;
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            }
        },
        // 工位信息匹配物料类型
        allocation(row) {
            this.dialogVisibleDialogTable = true;
            this.allocationId = row.id;
            this.getMaterialType();
        },
        getMaterialType(val = 1) {
            const conditionList = [
                {
                    fieldName: 'stationId',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: this.allocationId
                }
            ];
            this.$http
                .get(`/productionexe/stationmaterialtype/page`, {
                    params: {
                        current: val,
                        size: this.pageSize_table,
                        conditionList
                    }
                })
                .then(res => {
                    this.tableData_table = res.data.records;
                    this.pageTotal_table = res.data.total;
                    this.currentPage_table = val;
                });
        },
        submitFormDialog_table() {
            this.dialogVisibleDialogTable = false;
        },
        getSelectionMaterial(selection) {
            this.MaterialSelection = selection.map(v => v.id);
        },
        // 工位信息_配置
        newTable() {
            this.dialogVisibleTableData = true;
        },
        newTable2() {
            this.rowObj = {};
            this.dialogVisibleTable_dialog = true;
            this.getMatterData();
        },
        currentChange(row) {
            this.rowObj = row;
        },
        submitFormDialogTable2() {
            const { children, materialTypeName } = this.rowObj;
            const materialTypeNo = this.rowObj.materialTypeCode;
            if (!materialTypeNo || !materialTypeName) {
                this.$message.warning('没有选择不能提交！');
                return false;
            }

            if (children.length > 0) {
                this.$message.warning('只能选择最末级的物料类型！');
                return false;
            }

            let obj = { materialTypeNo, materialTypeName };

            this.dialogTableLoading = true;
            obj.stationId = this.allocationId;
            const item = this.tableDataParent.find(
                v => v.id === this.currentRowKeyParent
            );
            obj.workcenterNo = item.workCenterCode;
            this.$http
                .post('/productionexe/stationmaterialtype/save', obj)
                .then(() => {
                    this.dialogTableLoading = false;
                    this.getMaterialType();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleTable_dialog = false;
                })
                .catch(() => {
                    this.dialogTableLoading = false;
                });
        },
        getMatterData() {
            this.$http
                .get('/basicdata/dicbasicmaterialtype/getMaterialTypeTree')
                .then(res => {
                    const { data } = res;
                    this.listDetailsData = data;
                })
                .catch(() => {
                    this.dialogVisibleTableData2 = false;
                });
        },
        delTable() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/productionexe/stationmaterialtype/removeByIds', {
                    data: this.MaterialSelection
                })
                    .then(() => {
                        this.submitLoading = false;
                        this.getMaterialType();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeyDialogTable = '';
                    })
                    .catch(() => {
                        this.submitLoading = false;
                    });
            });
        },
        getAllSon(row) {
            this.row = row;
            if (row) {
                this.getDataSonL();
                this.getDataSonC();
                this.getDataSonR();
                this.getDataSonF();
                this.getDataSonS();
            }
        },
    }
};
</script>

<style scoped lang="stylus">
.workshop
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

.tabs

.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF

.table_dialog

    & >>> .table
        height auto!important

    & >>> .el-table__body-wrapper
        min-height 250px!important

.el-table-button
    padding-bottom 20px
</style>
