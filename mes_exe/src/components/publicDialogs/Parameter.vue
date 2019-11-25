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
                :column="processTable.columnParams"
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
import tableColumn from '@/components/publicDialogs/tableColumn';
import * as _ from 'lodash';
export default {
    name: 'FetchMaterial',
    data() {
        return {
            dialogVisible: false,
            tableData: [],
            apiProperty: [],
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        processTable() {
            let obj = [];
            for (let i in tableColumn) {
                if (Object.prototype.hasOwnProperty.call(tableColumn, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.pn)) obj = tableColumn[i];
                }
            }
            return obj;
        },
        pn() {
            return this.$route.query.pn;
        },
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
            let api;
            const params = {
                size: 999,
                conditionList: [],
            };
            api = this.processTable.apiParams;
            params.conditionList.push({
                fieldName: 'orderId',
                operation: 'EQ',
                value: this.workcenter.id,
            });
            this.$http.get(api, {
                params
            }).then(({ data }) => {
                this.tableData = data.records;
            });
        },
        newRow() {
            this.$refs.table.new({
                operator: this.sysUser.nickname,
            });
        },
        submitForm() {
            this.dialogVisible = false;
        },
        cellSave(row, finish, killLoading) {
            const enume = (arr, result = []) => {
                arr.forEach(v => {
                    if (v.prop) result.push(v.prop);
                    if (v.children && v.children.length) enume(v.children, result);
                });
                return result;
            };
            this.apiProperty = enume(this.processTable.columnParams);
            let api;
            let obj = _.pick(row, this.apiProperty);
            const isEmpty = _.every(_.omit(obj, ['operator']), _.isEmpty);
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
                api = this.processTable.addParams;
                this.$http.post(api, obj).then(({ code }) => {
                    this.$message.success('新增成功');
                    this.getData();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                api = this.processTable.updateParams;
                this.$http.put(api, obj).then(() => {
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
