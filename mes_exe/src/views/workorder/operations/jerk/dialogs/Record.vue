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
            loading: false,
            column: [{
                label: '序号',
                type: 'index',
                width: 50
            }, {
                label: '胶水型号',
                prop: 'glueModel',
            }, {
                label: '原液比重',
                prop: 'stosteProportion',
            }, {
                label: '固含量',
                prop: 'solidsContent',
            }, {
                label: '原液PH值',
                prop: 'stostePh',
            }, {
                label: '胶水PH值',
                prop: 'gluePh',
            }, {
                label: '温度',
                prop: 'glueTemperature',
            }, {
                label: '胶水比重',
                prop: 'glueProportion'
            }, {
                label: '胶水粘度',
                prop: 'glueViscosity',
            }, {
                label: 'DI水电导率',
                prop: 'diConductivity'
            }, {
                label: '室温',
                prop: 'indoorTemperature'
            }],
            tableData: [],
            apiProperty: ['glueModel', 'stosteProportion', 'solidsContent', 'stostePh', 'gluePh',
                'glueTemperature', 'glueProportion', 'glueViscosity', 'diConductivity', 'indoorTemperature']
        };
    },
    computed: {
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
            this.$http.get(`/productionexe/mixglueprodrecord/page`, {
                params
            }).then(({ data }) => {
                this.tableData = data.records;
            });
        },
        newRow() {
            this.$refs.table.new();
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
            //     if (key !== 'glueModel') {
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
                this.$http.post(`/productionexe/mixglueprodrecord/save`, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                this.$http.put(`/productionexe/mixglueprodrecord/updateById`, obj).then(() => {
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
