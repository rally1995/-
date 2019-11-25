<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="过程记录"
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
                label: '时间',
                prop: 'createTime',
                comp: 'elDatePicker',
                compProp: {
                    type: 'datetime'
                }
            }, {
                label: '实际温度',
                prop: 'realTemperature',
            }, {
                label: '实际真空',
                prop: 'realVacuuma',
            }, {
                label: '实际压力',
                prop: 'realPressure',
            }, {
                label: '机械表压力',
                prop: 'mechanicalPressure',
            }, {
                label: '料温',
                prop: 'materielTemperature'
            }, {
                label: '备注',
                prop: 'remark'
            }, {
                label: '操作员',
                prop: 'createBy',
            }],
            tableData: [],
            apiProperty: ['className', 'realTemperature', 'realVacuuma', 'realPressure', 'mechanicalPressure',
                'materielTemperature', 'remark']
        };
    },
    computed: {
        orderId() {
            return this.$route.query.id;
        },
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
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
            this.$http.get(`/productionexe/laminationprodrecord/page`, {
                params
            }).then(({ data }) => {
                this.tableData = data.records;
            });
        },
        newRow() {
            this.$refs.table.new({
                createBy: this.sysUser.nickname,
                createTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
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
            obj.createTime = row.createTime;
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/laminationprodrecord/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/laminationprodrecord/updateById`, obj).then(() => {
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
