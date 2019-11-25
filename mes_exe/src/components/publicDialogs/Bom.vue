<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            :title="'BOM信息（'+datas.orderNo+'）'"
            :close-on-click-modal="false")
            el-form.dialogForm(
                :model="datas"
                inline
                disabled)
                h3 主件
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="料号")
                            el-input(:value="datas.materialNo")
                    el-col(:span="12")
                        el-form-item(label="名称")
                            el-input(:value="datas.materialName")
                    el-col(:span="12")
                        el-form-item(label="状态")
                            el-select(:value="dict['orderStatus'][datas.state]")
                    el-col(:span="12")
                        el-form-item(label="数量")
                            el-input(:value="datas.materialAmount+datas.materialUnit")
            h3 子件
            ebrain-table.tableBottom(
                :column="column"
                :data="tableData"
                height="350px"
                :highlight-current-row="false")
                    template(#operate)
                        el-table-column(
                            v-if="datas.state==='0'"
                            label="操作"
                            width="180"
                            align="center")
                            template(v-slot="{row}")
                                el-button(
                                    v-if="datas.state==='0'"
                                    type="primary"
                                    @click="replace(row)") 使用替代料
            template(#footer)
                el-button(
                    type="primary"
                    @click="cancelDialog") 取消
                el-button(
                    :loading="buttonLoading"
                    v-if="workcenter.state==='0'"
                    type="primary"
                    @click="startOrder") 启动工单
        el-dialog.redact(
            :visible.sync="dialogVisibleDialog"
            :close-on-click-modal="false")
            el-form.dialogForm(
                ref="dialogForm"
                :model="form"
                label-width="110px"
                inline)
                el-row(:gutter="20")
                    el-col(:span="12")
                        el-form-item(label="料号" required prop="materialNo")
                            el-input(v-model="form.materialNo" placeholder="按搜索键搜索选择" style="cursor:pointer" :readonly="true")
                                el-button(slot="append" @click="getDialogTable" icon="iconfont iconsearch")
                    el-col(:span="12")
                        el-form-item(label="物料名称" prop="materialName")
                            el-input(v-model="form.materialName" disabled)
                    el-col(:span="12")
                        el-form-item(label="数量" required prop="needAmount")
                            el-input(v-model="form.needAmount")
                    el-col(:span="12")
                        el-form-item(label="单位" prop="materialUnit")
                            el-input(v-model="form.materialUnit" disabled)
            template(#footer)
                el-button(
                    type="primary"
                    @click="cancel") 取消
                el-button(
                    type="primary"
                    @click="submitFormDialog") 确定
        ebrain-dialog-table(
            :table-loading="tableLoading"
            :isShow="false"
            dialogTableSearch
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @resetDialog="resetDialog"
            @search="searchFormWork"
            @row-click="getMeg"
            @submit="submitFormTable")
</template>

<script>
import { getMaterialInfo, activate } from '@/utils/api';
import { mapState } from 'vuex';
export default {
    name: 'Bom',
    props: {
        datas: Object,
        dict: Object,
    },
    data() {
        return {
            buttonLoading: false,
            form: {
                materialNo: '',
                materialName: '',
                needAmount: '',
                materialUnit: '',
            },
            dialogVisibleDialog: false,
            tableLoading: false,
            dialogVisibleTable: false,
            dialogSearchForm: {},
            tableColumn: [{
                label: '料号',
                prop: 'materialCode',
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '物料单位',
                prop: 'materialUnit',
            }],
            tableDialogData: [],
            tableData: [],
            dialogVisible: false,
            column: [{
                label: '料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '物料单位',
                prop: 'materialUnit',
            }, {
                label: '需用数量',
                prop: 'planAmount',
            },
            // {
            //     label: '比例',
            //     prop: 'proportion',
            //     formatter(row, col, cell, index) {
            //         return cell && (Number(cell) + '%');
            //     },
            // },
            {
                label: '待领取的数量',
                prop: 'unclaimedCount',
            }, {
                slot: 'operate',
            }],
            row: [],
            selectRow: {},
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.queryMaterial();
            }
        },
        dialogVisibleTable(val) {
            if (!val) {
                this.row = [];
                this.dialogSearchForm = {};
            }
        },
        dialogVisibleDialog(v) {
            if (!v) {
                this.form = {
                    materialNo: '',
                    materialName: '',
                    needAmount: '',
                    materialUnit: '',
                };
            }
        }
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        queryMaterial() {
            getMaterialInfo(this.workcenter.id).then(({ data }) => {
                this.tableData = data;
            });
        },
        replace(row) {
            this.selectRow = row;
            this.dialogVisibleDialog = true;
        },
        getDialogTable() {
            this.dialogVisibleTable = true;
            this.showMaterial();
        },
        showMaterial() {
            const params = {
                masterCode: this.workcenter.materialNo,
                replaceCode: this.selectRow.materialNo,
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params[i] = this.dialogSearchForm[i];
                        }
                    }
                }
            }
            this.$http.get(`/productionplan/alternativematerial/listMaterial?size=9999`, {
                params
            }).then(({ data }) => {
                this.tableDialogData = data;
            });
        },
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.showMaterial();
        },
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        getMeg(row) {
            this.row = row;
        },
        submitFormTable() {
            if (this.row.length === 0) {
                this.$alert('请选择物料信息!', {
                    type: 'warning'
                });
            } else {
                this.dialogVisibleTable = false;
                this.form.materialNo = this.row.materialCode;
                this.form.materialName = this.row.materialName;
                this.form.materialUnit = this.row.materialUnit;
            }
            this.row = [];
        },
        submitFormDialog() {
            let obj = {};
            obj.id = this.selectRow.id;
            obj.materialNo = this.form.materialNo;
            obj.needAmount = this.form.needAmount;
            this.$refs.dialogForm.validate(v => {
                if (v) {
                    this.$http.post(`/productionexe/orderbom/addReplaceMaterial`, obj).then(() => {
                        this.$message.success('物料替代成功!');
                        this.dialogVisibleDialog = false;
                        this.queryMaterial();
                    });
                }
            });
        },
        cancel() {
            this.dialogVisibleDialog = false;
        },
        cancelDialog() {
            this.dialogVisible = false;
        },
        startOrder() {
            this.buttonLoading = true;
            activate(this.workcenter.id).then(({ code }) => {
                if (code === 0) {
                    this.buttonLoading = false;
                    this.$message.success('工单启动成功!');
                    this.dialogVisible = false;
                    this.$emit('update-data', this.workcenter.id);
                }
            }).catch(() => {
                this.buttonLoading = false;
            });
        }
    },
};
</script>
<style lang="stylus" scoped>
.dialog
    height 100%

    & >>> .el-dialog__body
        height 100%

        & >>> .el-table__body-wrapper
            overflow-y auto
.redact
    & >>> .el-dialog
        height auto
        width 60%
        margin-top 15%!important

    & >>> .el-form-item__label
        line-height 42px

.dialogForm >>> .el-form-item__content
    width: calc(100% - 110px);

</style>
