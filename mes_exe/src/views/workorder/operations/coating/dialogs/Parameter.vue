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
                label: '机速M/min',
                prop: 'machineSpeed',
            }, {
                label: '张力设定',
                align: 'center',
                children: [{
                    label: '放卷',
                    prop: 'unwindingEffort',
                }, {
                    label: '含浸',
                    prop: 'immersionEffort',
                }, {
                    label: '烘箱',
                    prop: 'ovenEffort',
                }, {
                    label: '收卷',
                    prop: 'windingEffort',
                }]
            }, {
                label: '计量杆',
                align: 'center',
                children: [{
                    label: '上1位置/φ',
                    prop: 'positionFirst',
                }, {
                    label: '2位置/φ',
                    prop: 'positionSecond',
                }, {
                    label: '3位置/φ',
                    prop: 'positionThird',
                }, {
                    label: '下4位置/φ',
                    prop: 'positionFourth',
                }]
            }, {
                label: '操作员',
                prop: 'createBy',
                disabled: true,
            }],
            tableData: [],
            apiProperty: ['className', 'machineSpeed', 'unwindingEffort', 'immersionEffort',
                'ovenEffort', 'windingEffort', 'positionFirst', 'positionSecond', 'positionThird', 'positionFourth'],
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
            this.$http.get(`/productionexe/putglueprodparams/page`, {
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
            // const reg = /^\d+(\.\d{0,4})?$/;
            // for (let key in obj) {
            //     if (key !== 'className') {
            //         console.log(obj);
            //         if (obj[key] !== null) {
            //             if (obj[key] !== '') {
            //                 if (!reg.test(obj[key])) {
            //                     this.$alert('请输入正整数', {
            //                         type: 'warning'
            //                     });
            //                     killLoading();
            //                     return false;
            //                 }
            //             }
            //         }
            //     }
            // }
            obj.orderId = this.workcenter.id;
            if (row.id) obj.id = row.id;
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/putglueprodparams/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/putglueprodparams/updateById`, obj).then(() => {
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
