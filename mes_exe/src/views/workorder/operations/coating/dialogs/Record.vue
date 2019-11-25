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
                label: '胶水',
                align: 'center',
                children: [{
                    label: '比重',
                    prop: 'glueProportion',
                }, {
                    label: '粘度',
                    prop: 'glueViscosity',
                }, {
                    label: 'PH/温度',
                    prop: 'gluePhTemperature',
                }]
            }, {
                label: '胶片重量g/cm²',
                align: 'center',
                children: [{
                    label: '左',
                    prop: 'glueWeightLeft',
                }, {
                    label: '中',
                    prop: 'glueWeightMiddle',
                }, {
                    label: '右',
                    prop: 'glueWeightRight',
                }]
            }, {
                label: '烘箱温度℃',
                align: 'center',
                children: [{
                    label: '1区/2区',
                    prop: 'ovenTemperatureFirst',
                }, {
                    label: '3区/4区',
                    prop: 'ovenTemperatureThird',
                }, {
                    label: '5区/6区',
                    prop: 'ovenTemperatureFifth',
                }, {
                    label: '记录时间',
                    prop: 'ovenWorkDate',
                    comp: 'elDatePicker',
                    compProp: {
                        type: 'datetime'
                    }
                }]
            }, {
                label: '顶轮温度℃',
                prop: 'wheelTemperature',
            }, {
                label: '胶片外观',
                prop: 'appearance',
            }, {
                label: '布/半制品基重g/㎡/RC',
                prop: 'halfBlankWeight'
            }, {
                label: '操作员',
                prop: 'createBy',
                disabled: true,
            }],
            tableData: [],
            apiProperty: ['className', 'glueProportion', 'glueViscosity', 'gluePhTemperature', 'glueWeightLeft', 'glueWeightMiddle', 'glueWeightRight', 'ovenTemperatureFirst', 'ovenTemperatureThird', 'ovenTemperatureFifth',
                'wheelTemperature', 'appearance', 'halfBlankWeight'],
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
            this.$http.get(`/productionexe/putglueprodrecord/page`, {
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
            //     if (key !== 'className' || key !== 'appearance') {
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
            if (!row.ovenWorkDate) obj.ovenWorkDate = '';
            else obj.ovenWorkDate = moment(new Date(row.ovenWorkDate)).format('YYYY-MM-DD HH:mm:ss');
            if (!obj.hasOwnProperty('id')) {
                this.$http.post(`/productionexe/putglueprodrecord/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/putglueprodrecord/updateById`, obj).then(() => {
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
