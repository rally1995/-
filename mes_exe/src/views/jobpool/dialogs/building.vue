<template lang="pug">
    div
        el-dialog(
            :visible.sync="dialogVisible"
            title="人工建单"
            :close-on-click-modal="false")
            el-form.dialogForm(
                :model="form"
                inline
                :rules="rules"
                label-width="120px")
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="SAP销售计划号" required=true)
                            el-input(v-model="form.docno" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('SAP计划号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="项目号" required=true)
                            el-input(v-model="form.posnr" disabled)
                    el-col(:span="12")
                        el-form-item(label="任务工单号" required=true)
                            el-input(v-model="form.workerOrderCode")
                    el-col(:span="12")
                        el-form-item(label="明细编号" required=true)
                            el-input(v-model="form.workerOrderDetCode")
                    el-col(:span="12")
                        el-form-item(label="料号" required=true)
                            el-input(v-model="form.materialCode" readonly=true)
                                el-button(slot="append" @click="getDialogTable('料号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料名称")
                            el-input(v-model="form.materialName" disabled)
                    el-col(:span="12")
                        el-form-item(label="数量" required=true prop="amount")
                            el-input(v-model="form.amount")
                    el-col(:span="12")
                        el-form-item(label="单位")
                            el-input(v-model="form.unit" disabled)
                    el-col(:span="12")
                        el-form-item(label="建单时间")
                            el-input(v-model="form.createTime" disabled)
                    el-col(:span="12")
                        el-form-item(label="建单人")
                            el-input(v-model="form.createBy" disabled)
                    el-col(:span="12")
                        el-form-item(label="工作中心编号")
                            el-input(v-model="form.workCenterCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="工作中心名称")
                            el-input(v-model="form.workCenterName" disabled)
                    el-col(:span="12")
                        el-form-item(label="设备编号" required=true)
                            el-input(v-model="form.equipmentCode" style="cursor:pointer" readonly=true)
                                el-button(slot="append" @click="getDialogTable('设备编号')" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="设备名称")
                            el-input(v-model="form.equipmentName" disabled)
                    el-col(:span="12")
                        el-form-item(label="工艺编号")
                            el-input(v-model="form.processCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="工艺名称")
                            el-input(v-model="form.processName" disabled)
            template.border(#footer)
                el-button(
                    type="primary"
                    @click="submitForm") 提交
        ebrain-dialog-table.mation(
            :isShow="isShow"
            row-key="id"
            :key="type"
            :current-row-key.sync="currentRowKeyTable"
            dialogTableSearch
            :data="tableData"
            :column="tableColumn"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            :disabled="!currentRowKeyTable"
            @changeCurrent="changeCurrent_table"
            @changeSize='changeSize_table'
            @resetDialog="resetDialog"
            @search="searchFormWork"
            :pageTotal="pageTotal_table"
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            @row-click="getMeg"
            @submit="submitFormTable(type)")
</template>

<script>
import {
    getEquitment,
    getSAP,
    manualInputOrder,
} from '@/utils/api';
// import dict from '@/utils/dict';
import { mapState } from 'vuex';
import moment from 'moment';
// import * as _ from 'lodash';

export default {
    name: 'Batch',
    data() {
        return {
            rules: {
                amount: [{
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+$/;
                        if (value !== '') {
                            if (value === null) {
                                callback();
                            } else {
                                if (!reg.test(value)) {
                                    callback(new Error('请输入正整数!'));
                                } else {
                                    callback();
                                }
                            }
                        } else {
                            callback(new Error('请输入内容!'));
                        }
                    },
                    trigger: 'blur',
                }],
            },
            isShow: false,
            dialogSearchForm: {},
            currentPage_table: 1,
            pageSize_table: 20,
            pageTotal_table: 0,
            tableColumnMaterial: [{
                label: '料号',
                prop: 'materialCode',
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                searchBy: true,
            }],
            type: '',
            row: [],
            dialogVisible: false,
            dialogVisibleTable: false,
            submitLoading: false,
            tableColumn: [],
            currentRowKeyTable: '',
            tableData: [],
            form: {
                docno: '',
                posnr: '',
                workerOrderCode: '',
                workerOrderDetCode: '',
                materialCode: '',
                materialName: '',
                amount: '',
                unit: '',
                createTime: '',
                createBy: '',
                workCenterCode: '',
                workCenterName: '',
                equipmentCode: '',
                equipmentName: '',
                processCode: '',
                processName: '',
            },
            tableColumnSAP: [{
                label: 'SAP销售计划号',
                prop: 'docno',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '项目号',
                prop: 'posnr',
                showOverflowTooltip: true,
            }, {
                label: '订单数量',
                prop: 'menge',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'meins',
                showOverflowTooltip: true,
            }],
            tableColumnEquit: [{
                label: '设备编号',
                prop: 'equipNum',
                searchBy: true,
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                searchBy: true,
                showOverflowTooltip: true,
            }],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        orderNo() {
            return this.$route.query.order;
        },
        workcenterCode() {
            return this.$route.query.wc;
        },
        wc() {
            return this.$route.query.wc;
        },
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.form.createBy = this.sysUser.nickname;
                this.form.createTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.form.workCenterCode = this.$route.query.wc;
                this.form.workCenterName = this.$route.query.wn;
                this.form.processCode = this.$route.query.pc;
                this.form.processName = this.$route.query.pn;
            }
        },
        dialogVisibleTable(val) {
            if (!val) this.dialogSearchForm = {};
        },
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        getSalProNum() {
            return getSAP(this.form.processCode).then(({ data }) => {
                return data;
            });
        },
        getEquipNum() {
            return getEquitment(this.workcenterCode).then(({ data }) => {
                return data;
            });
        },
        getMaterialMsg(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_table,
            };
            params.conditionList = [{
                fieldName: 'delFlag',
                value: '0',
                operation: 'EQ',
                joinType: 'AND',
            }, {
                fieldName: 'materialState',
                value: 1,
                operation: 'EQ',
                joinType: 'AND',
            }];
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'OR',
                            });
                        }
                    }
                }
            }
            this.$http.get('/basicdata/dicbasicmaterial/page', {
                params
            }).then(({ data }) => {
                const { records } = data;
                this.currentPage_table = val;
                this.pageTotal_table = data.total;
                this.tableData = records.map(v => ({
                    ...v,
                    materialCatogary: v.materialTypeCode + v.materialTypeName
                })) || [];
                this.tableData = this.tableData.filter(v => v.materialState === 1 && v.delFlag !== '1');
            });
        },
        getDialogTable(type) {
            this.type = type;
            this.dialogVisibleTable = true;
            this.tableData = [];
            switch (type) {
                case 'SAP计划号':
                    this.tableColumn = this.tableColumnSAP;
                    this.getSalProNum().then(data => {
                        this.tableData = data;
                    });
                    this.isShow = false;
                    break;
                case '料号':
                    this.tableColumn = this.tableColumnMaterial;
                    this.isShow = true;
                    this.getMaterialMsg();
                    break;
                case '设备编号':
                    this.tableColumn = this.tableColumnEquit;
                    this.isShow = false;
                    this.getEquipNum().then(data => {
                        this.tableData = data;
                    });
                    break;
                default:
                    break;
            }
        },
        getMeg(row) {
            this.row = row;
        },
        changeCurrent_table(val) {
            switch (this.type) {
                case 'SAP计划号':
                    this.getSalProNum(val);
                    break;
                case '料号':
                    this.getMaterialMsg(val);
                    break;
                case '设备编号':
                    this.getEquipNum(val);
                    break;
                default:
                    break;
            }
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            switch (this.type) {
                case 'SAP计划号':
                    this.getSalProNum();
                    break;
                case '料号':
                    this.getMaterialMsg();
                    break;
                case '设备编号':
                    this.getEquipNum();
                    break;
                default:
                    break;
            }
        },
        submitFormTable(type) {
            this.dialogVisibleTable = false;
            switch (type) {
                case 'SAP计划号':
                    this.form.docno = this.row.docno;
                    this.form.posnr = this.row.posnr;
                    this.form.unit = this.row.meins;
                    this.form.amount = this.row.menge;
                    break;
                case '料号':
                    this.form.materialCode = this.row.materialCode;
                    this.form.materialName = this.row.materialName;
                    break;
                case '设备编号':
                    this.form.equipmentCode = this.row.equipNum;
                    this.form.equipmentName = this.row.equipName;
                    break;
                default:
                    break;
            }
            this.currentRowKey = '';
            this.row = [];
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            switch (this.type) {
                case 'SAP计划号':
                    this.sapSearch(form);
                    break;
                case '料号':
                    this.getMaterialMsg();
                    break;
                case '设备编号':
                    this.equipNumSearch(form);
                    break;
                default:
                    break;
            }
        },
        // 表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        submitForm() {
            manualInputOrder({
                amount: Number(this.form.amount),
                createBy: this.sysUser.userId,
                docno: this.form.docno,
                equipmentCode: this.form.equipmentCode,
                equipmentName: this.form.equipmentName,
                materialCode: this.form.materialCode,
                materialName: this.form.materialName,
                posnr: Number(this.form.posnr),
                processCode: this.form.processCode,
                processName: this.form.processName,
                workCenterCode: this.form.workCenterCode,
                workCenterName: this.form.workCenterName,
                workerOrderCode: this.form.workerOrderCode,
                workerOrderDetCode: this.form.workerOrderDetCode
            }).then(({ code }) => {
                if (code === 0) {
                    this.$message.success(`提交成功!`);
                }
                this.dialogVisible = false;
                this.$emit('submit-dialog');
            });
        },
        sapSearch(form) {
            const { docno } = form;
            const reg = new RegExp(docno);
            this.getSalProNum().then(data => {
                this.tableData = data.filter(v => reg.test(v.docno));
            });
        },
        equipNumSearch(form) {
            const { equipmentCode } = form;
            const reg = new RegExp(equipmentCode);
            this.getEquipNum().then(data => {
                this.tableData = data.filter(v => reg.test(v.equipmentCode));
            });
        }
    },
};
</script>

<style scoped lang="stylus">
.search
    margin-bottom 20px

.dialogForm >>> .el-form-item__content
    width calc(100% - 120px)!important

</style>
