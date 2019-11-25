<template lang="pug">
    div
        el-dialog.dialog(
            :visible.sync="dialogVisible"
            title="转小桶"
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
import * as _ from 'lodash';
import { strip } from '@/utils';
import { mapState } from 'vuex';
export default {
    name: 'FetchMaterial',
    data() {
        return {
            dialogVisible: false,
            column: [{
                label: '序号',
                type: 'index',
                width: 80,
                align: 'center',
            }, {
                label: '生产批次号',
                prop: 'prodBatchNo',
                option: {},
            }, {
                label: '总重（kg)',
                prop: 'totalWeight',
                change: (val, row) => {
                    const reg = /^\d+(\.\d+)?$/;
                    if (val !== null) {
                        if (val !== '') {
                            if (reg.test(val)) {
                                let value = Number(val);
                                value = value.toFixed(4);
                                row.totalWeight = strip(value);
                                return false;
                            } else {
                                row.totalWeight = '';
                            }
                        }
                    }
                },
            }, {
                label: '皮重（kg)',
                prop: 'grossWeight',
                change: (val, row) => {
                    const reg = /^\d+(\.\d+)?$/;
                    if (val !== null) {
                        if (val !== '') {
                            if (reg.test(val)) {
                                let value = Number(val);
                                value = value.toFixed(4);
                                row.grossWeight = strip(value);
                                return false;
                            } else {
                                row.grossWeight = '';
                            }
                        }
                    }
                },
            }, {
                label: '净重（kg)',
                prop: 'suttleWeight',
                change: (val, row) => {
                    const reg = /^\d+(\.\d+)?$/;
                    if (val !== null) {
                        if (val !== '') {
                            if (reg.test(val)) {
                                let value = Number(val);
                                value = value.toFixed(4);
                                row.suttleWeight = strip(value);
                                return false;
                            } else {
                                row.suttleWeight = '';
                            }
                        }
                    }
                },
            }],
            tableData: [],
            apiProperty: ['prodBatchNo', 'totalWeight', 'grossWeight', 'suttleWeight']
        };
    },
    computed: {
        orderId() {
            return this.$route.query.id;
        },
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.getData();
                this.getBatch();
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
            const conconditionList = [{
                fieldName: 'orderId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.id,
            }];
            this.$http.get(`/productionexe/mixgluekeg/page`, {
                params: {
                    conconditionList
                }
            }).then(({ data }) => {
                this.tableData = data.records;
            });
        },
        getBatch() {
            this.$http.post(`/productionexe/orderprodbatch/list`, null, {
                params: {
                    state: '',
                    orderId: this.workcenter.id
                }
            }).then(({ data }) => {
                let obj = {};
                data.forEach(v => {
                    obj[v.prodBatchNo] = v.prodBatchNo;
                });
                this.column[1].option = obj;
            });
        },
        newRow() {
            const obj = this.column[1].option;
            let prodBatchNo;
            for (let i in obj) {
                if (prodBatchNo) break;
                else prodBatchNo = i;
            }
            this.$refs.table.new({ prodBatchNo });
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
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/mixgluekeg/save`, obj).then(() => {
                    this.$message.success('新增成功');
                    this.getData();
                    this.getBatch();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/mixgluekeg/updateById`, obj).then(() => {
                    this.$message.success('修改成功');
                    this.getData();
                    this.getBatch();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            }
        }
    },
};
</script>

<style scoped lang="stylus">
.buttons
    padding-bottom 15px

.redact
    & >>> .el-dialog
        height auto
        width 60%
        margin-top 15%!important

    & >>> .el-form-item__label
        line-height 42px
</style>
