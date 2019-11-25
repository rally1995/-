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
                label: '首件尺寸（mm）',
                prop: 'firstPieceSize',
            }, {
                label: '合格数量(pc)',
                prop: 'qualifiedCount',
            }, {
                label: '操作员',
                prop: 'createBy',
                disabled: true,
            }],
            tableData: [],
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),...mapState('workcenter', {
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
            this.$http.get(`/productionexe/cuttingprodrecord/page`, {
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
            let obj = Object.assign({}, row);
            obj.orderId = this.workcenter.id;
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/cuttingprodrecord/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/cuttingprodrecord/updateById`, obj).then(() => {
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
