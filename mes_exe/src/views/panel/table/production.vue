<template lang="pug">
    div.box
        ebrain-box(v-if="workcenter.state!=='4'")
            .wrap
                h3.title 生产参数
                div.buttons
                    el-button(type="primary" @click="newRows")
                        i.iconfont.iconstatus-Preserve-and-add
                        |新增
                ebrain-table.table(
                    :loading="topLoading"
                    :column="columnParamter"
                    :data="parameterData"
                    @current-change="showMeTable"
                    highlight-current-row
                    table-row-edit
                    @cell-save="cellSaveTop")
                    template(#operation="{row}")
                        el-button(
                            type="danger"
                            @click="delTop(row)") 删除
                h3.title 参数列表
                div.buttons
                    el-button(
                        type="primary"
                        @click="newRowParams"
                        :disabled="isNewRow===0")
                        i.iconfont.iconstatus-Preserve-and-add
                        |新增参数
                    el-button(
                        type="primary"
                        @click="newRowRecords"
                        :disabled="isNewRow===0")
                        i.iconfont.iconstatus-Preserve-and-add
                        |新增记录
                    el-button(
                        type="primary"
                        @click="delRow"
                        :disabled="isNewRow===0")
                        i.iconfont.iconstatus-delete
                        |删除参数
                ebrain-table.table(
                    :editRowMsg="false"
                    :loading="bottomLoading"
                    ref="table"
                    :column="columnList"
                    :table-row-edit="!!(columnList.length)"
                    :data="paramterList"
                    highlight-current-row
                    @current-change="getShow"
                    @cell-save="cellSaveBottom"
                    buttonWidth="200")
                    template(#operation="{row}")
                        el-button(
                            type="danger"
                            @click="delBottom(row)") 删除
                ebrain-dialog-table.mation(
                    :disabled="Object.keys(this.row).length===0"
                    :subLoading="subLoading"
                    :isShow="isShow"
                    row-key="id"
                    :current-row-key.sync="currentRowKeyTable"
                    :data="tableDialogData"
                    :column="tableColumn"
                    :visible.sync="dialogVisibleTable"
                    highlight-current-row
                    @row-click="getMeg"
                    @submit="submitFormTable")
                ebrain-dialog-table.delRow(
                    :isHide="false"
                    :subLoading="subLoading"
                    :isShow="false"
                    row-key="id"
                    :current-row-key.sync="currentRowKeyTableDel"
                    :data="tableDialogDataDel"
                    :column="tableColumnDel"
                    :visible.sync="dialogVisibleTableDel"
                    highlight-current-row)
                    template(#operation)
                        el-table-column(
                            v-slot="{row}"
                            label="操作"
                            width="120"
                            align="center")
                            el-button(
                                type="danger"
                                @click="delParams(row)") 删除
                el-dialog.dialogView(
                    :visible.sync="dialogVisibleParams"
                    :close-on-click-modal="false")
                    el-form.dialogForm(
                        ref="formDialog"
                        :model="form"
                        :rules="rules"
                        inline)
                        h3 参数新增
                        el-row(:gutter="20")
                            el-col(:span="24")
                                el-form-item(label="参数编码" prop="paramCode")
                                    el-input(v-model="form.paramCode")
                            el-col(:span="24")
                                el-form-item(label="参数名称" prop="paramName")
                                    el-input(v-model="form.paramName")
                            el-col(:span="24")
                                el-form-item(label="参数值" prop="actualValue")
                                    el-input(v-model="form.actualValue")
                    template(#footer)
                        el-button(
                            type="primary"
                            @click="success") 确定
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
// import dict from '@/utils/dict';
import * as _ from 'lodash';
// import moment from 'moment';
export default {
    name: 'production',
    data() {
        return {
            dialogVisibleTableDel: false,
            tableColumnDel: [{
                label: '参数编码',
                prop: 'paramNo',
            }, {
                label: '参数名称',
                prop: 'paramName',
            }, {
                slot: 'operation'
            }],
            tableDialogDataDel: [],
            currentRowKeyTableDel: '',
            viewMsg: {},
            formView: {
                actualValue: ''
            },
            viewRow: {},
            currentRowKeyTableView: '',
            tableColumnView: [{
                label: '参数编码',
                prop: 'paramNo',
                showOverflowTooltip: true
            }, {
                label: '参数名称',
                prop: 'paramName',
                showOverflowTooltip: true
            }, {
                label: '参数值',
                prop: 'paramValue',
                showOverflowTooltip: true
            }, {
                label: '实际值',
                prop: 'actualValue',
                showOverflowTooltip: true
            }, {
                label: '记录时间',
                prop: 'recordingTime',
                showOverflowTooltip: true
            }],
            tableDialogDataView: [],
            dialogVisibleTableView: false,
            rules: {
                actualValue: [{
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,3})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数且保留三位小数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }, {
                    required: true,
                    message: '请输入参数值!',
                    trigger: 'blur',
                }],
                paramName: [{
                    required: true,
                    message: '请输入参数名称!',
                    trigger: 'blur',
                }],
                paramCode: [{
                    required: true,
                    message: '请输入参数编码!',
                    trigger: 'blur',
                }]
            },
            form: {
                paramName: '',
                paramCode: '',
                actualValue: '',
            },
            dialogVisibleParams: false,
            topLoading: false,
            bottomLoading: false,
            topRow: {},
            bottomRow: {},
            row: {},
            currentRowKeyTable: '',
            dialogVisibleTable: false,
            tableDialogData: [],
            tableColumn: [{
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
            }],
            isShow: false,
            subLoading: false,
            columnParamter: [{
                label: '程式编码',
                prop: 'programNo',
                disabled: true,
            }, {
                label: '程式名称',
                prop: 'programName',
                disabled: true,
            }, {
                label: '开始时间',
                prop: 'startTime',
                comp: 'el-date-picker',
                compProp: {
                    type: 'datetime',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                }
            }, {
                label: '结束时间',
                prop: 'endTime',
                comp: 'el-date-picker',
                compProp: {
                    type: 'datetime',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                }
            }, {
                slot: 'operation'
            }],
            columnList: [],
            prodBatchId: '',
            parameterData: [],
            paramterList: [],
            topProperty: [
                'startTime',
                'endTime',
            ],
            bottomProperty: [
                'paramNo',
                'paramName',
                'paramValue',
            ],
            listId: '',
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        ...mapState('sys', {
            permissions: state => state.permissions,
        }),
        pn() {
            return this.$route.query.pn;
        },
        wn() {
            return this.$route.query.wn;
        },
        isNewRow() {
            return Object.keys(this.topRow).length;
        },
        isDelRow() {
            return Object.keys(this.bottomRow).length;
        },
        isEditRow() {
            return Object.keys(this.viewRow).length;
        }
    },
    watch: {
        workcenter(val) {
            if (val.workcenterNo) {
                this.getData();
            }
        },
        dialogVisibleParams(v) {
            if (!v) {
                this.form = {
                    paramName: '',
                    actualValue: '',
                    recordingTime: '',
                };
                this.$refs.formDialog.resetFields();
            }
        },
    },
    mounted() {
        this.getData();
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        getData() {
            const conditionList = [{
                fieldName: 'orderId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.id,
            }];
            this.topLoading = true;
            this.$http.get(`/productionexe/orderProgram/page`, {
                params: {
                    conditionList
                }
            }).then(({ data }) => {
                this.parameterData = data.records;
                this.topLoading = false;
            }).catch(() => {
                this.topLoading = false;
            });
        },
        newRows() {
            this.dialogVisibleTable = true;
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.workcenterNo
            }];
            this.subLoading = true;
            this.$http.get(`/basicdata/program/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(({ data }) => {
                this.subLoading = false;
                this.tableDialogData = data.records;
            }).catch(() => {
                this.subLoading = false;
            });
        },
        // 修改上表
        cellSaveTop(row, finish, killLoading) {
            let obj = _.pick(row, this.topProperty);
            const isEmpty = _.some(obj, _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            if (row.id) obj.id = row.id;
            this.$http.put(`/productionexe/orderProgram/updateById`, obj).then(() => {
                this.$message.success('修改成功!');
                this.getData();
                finish();
            }).catch(() => {
                killLoading();
            });
        },
        // 上表删除
        delTop(row) {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete(`/productionexe/orderProgram/removeByIds`, {
                    data: [row.id]
                }).then(() => {
                    this.getDataList();
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.topRow = {};
                });
            });
        },
        getMeg(row) {
            this.row = row;
        },
        submitFormTable() {
            let obj = {};
            obj.programNo = this.row.programNo;
            obj.programName = this.row.programName;
            obj.remark = this.row.remark;
            obj.workcenterNo = this.workcenter.workcenterNo;
            obj.orderId = this.workcenter.id;
            this.subLoading = true;
            this.$http.post(`/productionexe/orderProgram/save`, obj).then(({ data }) => {
                this.subLoading = false;
                this.getData();
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
                this.dialogVisibleTable = false;
                this.listId = data.id;
                this.getDataList();
            }).catch(() => {
                this.subLoading = false;
            });
        },
        showMeTable(row) {
            this.topRow = row;
            this.listId = row.id;
            if (row) {
                this.getDataList();
            }
        },
        getDataList() {
            this.bottomLoading = true;
            this.$http.post(`/productionexe/orderprogramparam/listByProgramId`, null, {
                params: {
                    programId: this.listId,
                }
            }).then(({ data }) => {
                this.columnList = data.map(v => ({
                    label: v.paramName,
                    prop: v.paramNo,
                    id: v.id,
                    param: v.paramValue,
                }));
                this.columnList.reverse();
                this.columnList.push({
                    label: '时间',
                    prop: 'createTime',
                    disabled: true,
                }, {
                    label: '记录员',
                    prop: 'updateBy',
                    disabled: true,
                });
                this.paramterList = [];
                const isClosed = (a, b) => {
                    const aTime = new Date(a).getTime();
                    const bTime = new Date(b).getTime();
                    return Math.abs(aTime - bTime) < 2000;
                };
                const findItem = value => this.paramterList.find(k => isClosed(k.createTime, value));
                data.forEach(v => {
                    v.details.forEach(j => {
                        let paramter = findItem(j.createTime);
                        if (paramter) {
                            paramter[v.paramNo] = j.actualValue;
                            paramter['id_' + v.paramNo] = j.id;
                        } else {
                            paramter = {};
                            paramter.createTime = j.createTime;
                            paramter.recordingTime = j.recordingTime;
                            paramter.updateBy = j.updateBy;
                            paramter['id_' + v.paramNo] = j.id;
                            paramter[v.paramNo] = j.actualValue;
                            this.paramterList.push(paramter);
                        }
                    });
                });
                // console.log(this.paramterList);
                this.bottomLoading = false;
            }).catch(() => {
                this.bottomLoading = false;
            });
        },
        newRowRecords() {
            this.$refs.table.new();
        },
        // 修改下表
        cellSaveBottom(row, finish, killLoading) {
            let { recordingTime, updateBy, createTime, _id, ...params } = row;
            let arr = [];
            for (let key in params) {
                if (Object.prototype.hasOwnProperty.call(params, key)) {
                    const isId = key.match(/^id_(.+)/);
                    let item;
                    if (isId) {
                        item = arr.find(v => v.prop === isId[1]);
                        const columnItem = this.columnList.find(v => v.prop === isId[1]);
                        if (item) {
                            item.id = params[key];
                        } else {
                            arr.push({
                                id: params[key],
                                prop: isId[1],
                                isNew: false,
                                parameterValue: columnItem.param,
                            });
                        }
                    } else {
                        item = arr.find(v => v.prop === key);
                        const columnItem = this.columnList.find(v => v.prop === key);
                        if (item) {
                            item.actualValue = params[key];
                        } else {
                            arr.push({
                                actualValue: params[key],
                                prop: key,
                                programParamId: columnItem.id,
                                isNew: true,
                                parameterValue: columnItem.param,
                            });
                        }
                    }
                }
            }
            const arrNew = [];
            const arrEdit = [];
            arr.forEach(v => {
                if (v.isNew) {
                    arrNew.push(v);
                } else {
                    arrEdit.push(v);
                }
            });
            if (arrNew.length) {
                const arrNew1 = arrNew.map(v => ({
                    actualValue: v.actualValue,
                    parameterValue: v.parameterValue,
                    programParamId: v.programParamId,
                }));
                this.$http.post(`/productionexe/orderprogramparamdetail/save`, arrNew1).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getDataList();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$alert('请输入记录值', '提示', {
                    type: 'warning',
                }).then(() => {
                    killLoading();
                });
            }
            // if (arrEdit.length) {
            //     const arrEdit1 = arrEdit.map(v => ({
            //         actualValue: v.actualValue,
            //         id: v.id,
            //     }));
            //     this.$http.put(`/productionexe/orderprogramparamdetail/updateById`, arrEdit1).then(() => {
            //         this.$message.success('修改成功');
            //         this.getDataList();
            //         finish();
            //     }).catch(() => {
            //         killLoading();
            //     });
            // }
        },
        getShow(row) {
            this.bottomRow = row;
        },
        newRowParams() {
            this.dialogVisibleParams = true;
        },
        delRow() {
            this.dialogVisibleTableDel = true;
            this.$http.post(`/productionexe/orderprogramparam/listByProgramId`, null, {
                params: {
                    programId: this.listId,
                }
            }).then(({ data }) => {
                this.tableDialogDataDel = data;
            });
        },
        delParams(row) {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete(`/productionexe/orderprogramparam/removeByIds`, {
                    data: [row.id]
                }).then(() => {
                    this.delRow();
                    this.getDataList();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                });
            });
        },
        delBottom(row) {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                let arr = [];
                for (let i in row) {
                    if (Object.prototype.hasOwnProperty.call(row, i)) {
                        const ids = i.match(/^id_(.+)/);
                        if (ids) {
                            arr.push(
                                row[ids[0]],
                            );
                        }
                    }
                }
                this.$http.delete(`/productionexe/orderprogramparamdetail/removeByIds`, {
                    data: arr,
                }).then(() => {
                    this.getDataList();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                });
            });
        },
        success() {
            let obj = {};
            obj.programId = this.topRow.id;
            obj.paramNo = this.form.paramCode;
            obj.paramName = this.form.paramName;
            obj.paramValue = this.form.actualValue;
            this.$refs.formDialog.validate(v => {
                if (v) {
                    this.$http.post(`/productionexe/orderprogramparam/save`, obj).then(() => {
                        this.getDataList();
                        this.$message({
                            message: '新增成功!',
                            type: 'success'
                        });
                        this.dialogVisibleParams = false;
                    });
                }
            });
        },
    }
};
</script>

<style scoped lang="stylus">
.box
    position relative

.wrap
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow-y auto
    overflow-x hidden

    & >>> .el-table
        height auto!important

    & >>> .el-table__body-wrapper
        height auto!important

    .contain
        flex auto
        padding 0 16px
        height 60px
        border-bottom 1px solid #dedede
        box-sizing border-box

        & > * + *
            margin-left 48px
            line-height 60px

    .table
        margin-bottom 10px
        height auto

    .title
        margin 5px 10px
        padding 5px 10px

    .submit
        position absolute
        bottom 0
        right 0
        margin 10px
        float right

.buttons
    padding 0 0 15px 15px

.dialog
    & >>> .el-dialog
        height auto
        margin-top 16%!important

        & >>> .el-table__body-wrapper
            overflow-y auto

.dialogForm >>> .el-form-item__content
    width calc(100% - 110px)

.el-table-button
    padding-bottom 20px

.dialogView

    & >>> .el-dialog
        width 35%
        height auto
        margin-top 16%!important

        & >>> .el-table__body-wrapper
            overflow-y auto

    .dialogForm

        & >>> .el-form-item__label
            width 80px

.delRow
    & >>> .el-dialog
        width 30%

    & >>> .el-dialog__body
        height 100%
        position absolute
        top 0
        left 0
        right 0
        bottom 0
        overflow-y auto
        overflow-x hidden
</style>
