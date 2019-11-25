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
                label: '底板编号',
                prop: 'baseboardNumber',
            }, {
                label: '钢板编号',
                prop: 'steelPlateNumber',
            }, {
                label: '钢板缺陷',
                align: 'center',
                children: [{
                    label: '油污',
                    prop: 'oilPollution',
                }, {
                    label: '氧化',
                    prop: 'oxidation',
                }, {
                    label: '划痕',
                    prop: 'scratch',
                }, {
                    label: '杂质',
                    prop: 'impurity',
                }, {
                    label: '水印',
                    prop: 'watermark',
                }]
            }, {
                label: '操作员',
                prop: 'createBy',
                disabled: true,
            }],
            tableData: [],
            apiProperty: ['className', 'baseboardNumber', 'steelPlateNumber', 'oilPollution', 'oxidation', 'scratch', 'impurity', 'watermark'],
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
            this.$http.get(`/productionexe/distributeprodrecord/page`, {
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
            obj.orderId = this.workcenter.id;
            if (row.id) obj.id = row.id;
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/distributeprodrecord/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/distributeprodrecord/updateById`, obj).then(() => {
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
</style>
