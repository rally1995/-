<template lang="pug">
    ebrain-main.pointTask
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    ref="table"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    highlight-current-row
                    @row-dblclick="seeRepair"
                    @selection-change="hanlderSelect"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize')
        ebrain-dialog(
                ref="dialog"
                :isCancel="false"
                :isShow="false"
                :form.sync="dialogForm"
                :visible.sync="dialogVisible")
                template(#button)
                    ebrain-tools(:buttons="btnsCheck")
        el-dialog.dialog_title(
            title="提示"
            width="400px"
            :visible.sync="dialogVisibleComplete")
            span(v-if="isCheck") 本次维修单验收完成，报修单(单号:{{billCode}})将会关闭，是否继续验收
            span(v-else) 本次维修不合格，报修单(单号:{{billCode}})将会退回给维修人，是否继续
            template(#footer)
                el-button(@click="dialogVisibleComplete = false") 取消
                el-button( type="primary" @click="submitParent" :loading="isLoading") 确定
        ebrain-dialog.dialog_form(
            :isCancel="false"
            :isShow="false"
            :visible.sync="dialogVisibleLook")
            template(#headline)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="基本信息" name="first")
                    el-tab-pane(label="配件更换" name="second")
            frame-form(
                title="保障信息"
                ref="fram1"
                v-if="activeName==='first'"
                :form.sync="dialogFormBao")
            frame-form(
                ref="fram2"
                title="维修描述"
                v-if="activeName==='first'"
                :form.sync="dialogFormRepair")
            ebrain-box-table.dialog_table(
                v-if="activeName==='second'"
                :loading="tableLoadingchild"
                :pageSize="pageSizechild"
                :pageCurrent="currentPagechild"
                :pageTotal="pageTotalchild"
                :data="tableDatachild"
                :column="tableColumnchild"
                row-key="id"
                highlight-current-row
                @page-change="ChangeCurrentchild"
                @size-change="ChangeSizechild")
</template>
<script>
import moment from 'moment';
import FrameForm from '../FrameForm';
import dict from '@/utils/dict';
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
import { strip }  from '@/utils';

export default {
    name: '',
    components: {
        FrameForm
    },
    data() {
        return {
            isCheck: true,
            filterData: [],
            dialogVisibleComplete: false,
            searchVisible: true,
            isLoading: false,
            searchForm: [{
                label: '报修单号',
                prop: 'faultReportBillCode',
                value: '',
            }, {
                label: '状态',
                prop: 'status',
                type: 'select',
                option: {},
                value: '',
            }, {
                label: '维修单号',
                prop: 'repairNum',
                value: '',
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: '',
            }],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            dialogVisible: false,
            billCode: '',
            dialogType: '',
            tableColumn: [{
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.repair_status[cell];
                }
            }, {
                label: '验收结果',
                prop: 'acceptanceResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.check_result[cell];
                }
            }, {
                label: '维修单号',
                prop: 'repairNum',
                showOverflowTooltip: true
            }, {
                label: '报修单号',
                prop: 'faultReportBillCode',
                showOverflowTooltip: true,
            }, {
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true
            }, {
                label: '报修时间',
                prop: 'repairTime',
                showOverflowTooltip: true,
            }, {
                label: '报修人',
                prop: 'repairer',
                showOverflowTooltip: true,
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                showOverflowTooltip: true,
            }, {
                label: '维修结果',
                prop: 'repairResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['REPAIR_RESULT'][cell];
                }
            }, {
                label: '维修人(班组)',
                prop: 'executor',
                showOverflowTooltip: true,
            }, {
                label: '验收人',
                prop: 'acceptor',
                showOverflowTooltip: true,
            }, {
                label: '验收时间',
                prop: 'receptionTime',
                showOverflowTooltip: true,
            }, {
                label: '验收说明',
                prop: 'acceptDesc',
                showOverflowTooltip: true,
            }],
            muliption: [],
            parentRow: {},
            btnsTop: [{
                label: '验收',
                click: () => this.checkAccept(),
                disabled: () => this.addDisabled,
                className: 'iconfont iconstatus-edit',
                permi: false,
            }, {
                label: '查看维修单',
                click: () => this.seeRepair(),
                disabled: () => this.lookDisabled,
                className: 'iconfont iconsee',
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsCheck: [{
                label: '验收完成',
                click: () => this.acceptClo(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'devicemanager_repair_acceptance',
                loading: false,
                disabled: false,
            }, {
                label: '不合格退回',
                click: () => this.needReset(),
                className: 'iconfont iconrevoke',
                permi: 'devicemanager_repair_sendback',
                disabled: false,
            }],
            dialogForm: [{
                label: '维修单号',
                prop: 'repairNum',
                value: '',
                // required: true,
                disabled: true,
            }, {
                label: '验收结果',
                prop: 'acceptanceResult',
                value: '',
                type: 'select',
                option: () => dict.check_result,
                required: true,
                change: (val) => {
                    if (val === '0') {
                        this.btnsCheck[1].disabled = true;
                    } else {
                        this.btnsCheck[1].disabled = false;
                    }
                }
            }, {
                label: '验收说明',
                prop: 'acceptDesc',
                value: '',
                type: 'textarea',
            }, {
                label: '验收人',
                prop: 'acceptor',
                value: '',
                disabled: true,
            }, {
                label: '验收时间',
                prop: 'receptionTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }],
            dialogVisibleLook: false,
            activeName: 'first',
            dialogFormBao: [{
                label: '维修单号',
                prop: 'repairNum',
                value: '',
                disabled: true,
            }, {
                label: '报修单号',
                prop: 'faultReportBillCode',
                value: '',
                disabled: true,
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: '',
                disabled: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                disabled: true,
            }, {
                label: '安装位置',
                prop: 'installPosition',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['device_position'],
            }, {
                label: '设备类型',
                prop: 'equipType',
                value: '',
                disabled: true,
                type: 'select',
                option: () => this.storeDict['device_classification'],
            }, {
                label: '故障分类',
                prop: 'faultClassification',
                type: 'select',
                value: '',
                disabled: true,
                option: () => this.storeDict['FAULT_CLASS'],
            }, {
                label: '故障等级',
                prop: 'failureLevel',
                type: 'select',
                value: '',
                disabled: true,
                option: () => this.storeDict['FAILURE_LEVEL'],
            }, {
                label: '单据状态',
                type: 'select',
                prop: 'status',
                value: '',
                option: dict.REPAIR_STATUS,
                disabled: true,
            }, {
                label: '执行人(班组)',
                prop: 'executor',
                value: '',
                disabled: true,
            }, {
                label: '故障描述',
                prop: 'faultRemark',
                type: 'textarea',
                value: '',
                disabled: true,
            }],
            dialogFormRepair: [{
                label: '维修开始时间',
                prop: 'repairStartTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '维修结束时间',
                prop: 'repairEndTime',
                value: '',
                disabled: true,
                type: 'datetime',
            }, {
                label: '是否停机',
                prop: 'halt',
                value: '',
                type: 'select',
                option: dict.isRaire,
                disabled: true,
            }, {
                label: '是否影响生产',
                prop: 'effect',
                value: '',
                type: 'select',
                option: dict.isRaire,
                disabled: true,
            }, {
                label: '停机用时(分钟)',
                prop: 'haltTime',
                value: '',
                disabled: true,
            }, {
                label: '开机时间',
                prop: 'upTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '停机时间',
                prop: 'stopTime',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '处理办法',
                prop: 'disposalMeasures',
                value: '',
                disabled: true,
                type: 'textarea',
            }, {
                label: '维修结果',
                prop: 'repairResult',
                value: '',
                type: 'select',
                option: () => this.storeDict['REPAIR_RESULT'],
                disabled: true,
            }, {
                label: '维修工时(小时)',
                prop: 'maintenanceWork',
                value: '',
                disabled: true,
            }, {
                label: '是否委外',
                prop: 'outsourcing',
                value: '',
                type: 'select',
                option: dict.isRaire,
                disabled: true,
            }, {
                label: '委外单位',
                prop: 'outsourcingUnit',
                value: '',
                disabled: true,
            }, {
                label: '委外负责人',
                prop: 'outsourcingCharger',
                value: '',
                disabled: true,
            }, {
                label: '维修费用(元)',
                prop: 'maintenanceCosts',
                value: '',
                disabled: true,
            }],
            tableLoadingchild: false,
            pageSizechild: 20,
            currentPagechild: 1,
            pageTotalchild: 0,
            tableDatachild: [],
            conditionList: [],
            tableColumnchild: [{
                label: '配件编号',
                prop: 'sparePartNum',
                showOverflowTooltip: true,
            }, {
                label: '配件名称',
                prop: 'sparePartName',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }, {
                label: '单价',
                prop: 'unitPrice',
                showOverflowTooltip: true,
            }, {
                label: '总金额(元)',
                prop: 'money',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        }),
        addDisabled() {
            return this.muliption.length !== 1 || this.filterData;
        },
        lookDisabled() {
            return this.muliption.length !== 1;
        }
    },
    watch: {
        activeName(val) {
            if (val === 'second') this.getRepair();
        },
        dialogVisibleLook(val) {
            if (!val) this.activeName = 'first';
        },
        dialogVisible(val) {
            if (!val) {
                this.activeName = 'first';
            } else {
                this.$nextTick(() => {
                    this.btnsCheck[1].disabled = false;
                    this.$refs.dialog.$refs.form.resetFields();
                });
            }
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        ...mapActions(['queryDict']),
        init() {
            Promise.all([this.queryDict('REPAIR_RESULT'),
                this.queryDict('device_classification'),
                this.queryDict('device_position'),
            ]).then(() => {
                this.getData();
                let item = {};
                item['0'] = dict.repair_status['0'];
                item['1'] = dict.repair_status['1'];
                this.searchForm[1].option = item;
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            return this.$http.get(`/devicemanager/repair/repairPass`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
                this.$refs.table.setCurrentRow();
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        hanlderSelect(selection) {
            this.muliption = selection;
            this.muliption.forEach((v, i) => {
                if (typeof (v) === 'undefined') {
                    _.pull(this.muliption, v);
                }
            });
            this.parentRow = this.muliption[0];
            this.filterData = this.muliption.some(v => v.status === '1');
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = row;
            }
        },
        checkAccept() {
            this.dialogVisible = true;
            this.billCode = this.parentRow['faultReportBillCode'];
            this.dialogForm.forEach(v => {
                v.value = this.parentRow[v.prop];
            });
            this.dialogForm[3].value = this.sysUser.nickname;
            this.dialogForm[4].value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // this.$refs.dialog.$refs.form.resetFields();
        },
        seeRepair() {
            this.dialogVisibleLook = true;
            this.dialogFormBao.forEach(v => {
                v.value = this.parentRow[v.prop];
            });
            this.dialogFormRepair.forEach(v => {
                v.value = this.parentRow[v.prop];
            });
            //  if (v.prop === 'status' && v.value === '0') v.value = '4';
            // else if (v.prop === 'status' && v.value === '1') v.value = '5';
            if (this.dialogFormBao[8].value === '0') this.dialogFormBao[8].value = '4';
            else this.dialogFormBao[8].value = '5';
            // this.dialogFormRepair.forEach(v => {
            //     v.value = this.parentRow[v.prop];
            // });
        },
        acceptClo() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    this.dialogVisibleComplete = true;
                    this.dialogType = 'new';
                    this.isCheck = true;
                }
            });
        },
        needReset() {
            this.$refs.dialog.$refs.form.validate(res => {
                if (res) {
                    this.dialogVisibleComplete = true;
                    this.dialogType = 'reset';
                    this.isCheck = false;
                }
            });
        },
        submitParent() {
            let params = {};
            params = Object.assign({}, this.parentRow);
            this.dialogForm.forEach(v => {
                params[v.prop] = v.value;
            });
            if (this.dialogType === 'new') {
                this.isLoading = true;
                this.$http.post(`/devicemanager/repair/acceptanceById`, params).then(() => {
                    this.$message.success('验收完成');
                    this.dialogVisible = false;
                    this.dialogVisibleComplete = false;
                    this.getData();
                    this.isLoading = false;
                }).catch(() => {
                    this.isLoading = false;
                });
            } else {
                this.isLoading = true;
                this.$http.post(`/devicemanager/repair/sendBackById`, params).then(() => {
                    this.$message.success('已退回');
                    this.getData();
                    this.dialogVisible = false;
                    this.isLoading = false;
                    this.dialogVisibleComplete = false;
                }).catch(() => {
                    this.isLoading = true;
                });
            }
        },
        // 更换配件
        getRepair() {
            this.tableLoadingchild = true;
            const params = {
                size: this.pageSizechild,
                current: this.currentPagechild,
                conditionList: [],
            };
            if (this.dialogFormBao[0].value !== '') {
                params.conditionList.push({
                    fieldName: 'repairNum',
                    operation: 'EQ',
                    value: this.dialogFormBao[0].value,
                });
            }
            this.$http.get(`/devicemanager/repairsparepart/page`, {
                params
            }).then(res => {
                this.tableDatachild = res.data.records;
                this.pageTotalchild = res.data.total;
                this.tableLoadingchild = false;
                this.tableDatachild.forEach(v => {
                    v.money = strip(Number(v.quantity) * Number(v.unitPrice));
                });
            }).catch(() => {
                this.tableLoadingchild = false;
            });
        },
        ChangeCurrentchild(val) {
            this.currentPagechild = val;
            this.getRepair();
        },
        ChangeSizechild(val) {
            this.pageSizechild = val;
            this.currentPagechild = 1;
            this.getRepair();
        },
    }
};
</script>

<style lang="stylus" scoped>
.pointTask
  & >>> .fr
    float right;
.search
  padding 14px 10px;
  background #f5f5f5;
  overflow hidden;
  box-sizing border-box;
  transition-duration 0.2s;
  height auto;

  &.hide
    padding-top: 0;
    padding-bottom: 0;
    height 0;
.dialog_table
    margin-top 10px
    height 50vh
.dialog_title
    >>> .el-dialog__body
            border-top: 1px solid #ccc
            border-bottom: 1px solid #ccc
</style>

