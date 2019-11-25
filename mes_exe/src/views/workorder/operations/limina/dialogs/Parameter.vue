<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="参数设置"
            :close-on-click-modal="false")
            div.buttons
                el-button(type="primary" @click="newRow")
                    i.iconfont.iconstatus-Preserve-and-add
                    |新增
            ebrain-table(
                ref="table"
                :column="column"
                :data="tableData"
                :highlight-current-row="false"
                table-row-edit
                @cell-save="cellSave")
            template(#footer)
                el-button(
                    type="primary"
                    @click="submitForm") 确定
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
import * as _ from 'lodash';
export default {
    name: 'FetchMaterial',
    data() {
        return {
            dialogVisible: false,
            column: [{
                label: '序号',
                type: 'index',
                width: 50
            }, {
                label: '班别',
                prop: 'className',
            }, {
                label: '设定温度',
                prop: 'setTemperature',
            }, {
                label: '设定真空',
                prop: 'setVacuuma',
            }, {
                label: '设定压力',
                prop: 'setPressure',
            }, {
                label: '压合程式',
                prop: 'tableProgram',
            }, {
                label: '开始时间',
                prop: 'workStartTime',
                comp: 'elDatePicker',
                compProp: {
                    type: 'datetime'
                }
            }, {
                label: '结束时间',
                prop: 'workEndTime',
                comp: 'elDatePicker',
                compProp: {
                    type: 'datetime'
                }
            }, {
                label: '操作员',
                prop: 'createBy',
            }],
            tableData: [],
            apiProperty: ['className', 'setTemperature', 'setVacuuma', 'setPressure', 'tableProgram']
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderId() {
            return this.$route.query.id;
        }
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.getData();
            } else {
                this.tableData = [];
            }
        },
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        getData() {
            const params = {
                size: 999,
                conditionList: [],
            };
            params.conditionList.push({
                fieldName: 'orderId',
                operation: 'EQ',
                value: this.workcenter.id,
            });
            this.$http.get(`/productionexe/laminationprodparams/page`, {
                params
            }).then(({ data }) => {
                this.tableData = data.records;
            });
        },
        newRow() {
            this.$refs.table.new({
                createBy: this.sysUser.nickname
            });
        },
        submitForm() {
            this.dialogVisible = false;
        },
        cellSave(row, finish, killLoading) {
            let obj = _.pick(row, this.apiProperty);
            const isEmpty = _.every(obj, _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            if (row.id) obj.id = row.id;
            obj.orderId = this.workcenter.id;
            if (!row.workStartTime) obj.workStartTime = '';
            else obj.workStartTime = moment(new Date(row.workStartTime)).format('YYYY-MM-DD HH:mm:ss');
            if (!row.workEndTime) obj.workEndTime = '';
            else obj.workEndTime = moment(new Date(row.workEndTime)).format('YYYY-MM-DD HH:mm:ss');
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/laminationprodparams/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/laminationprodparams/updateById`, obj).then(() => {
                    this.$message.success('修改成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.buttons
    padding-bottom 15px
.dialog >>>
    .el-date-editor
        width auto
        vertical-align middle
</style>
