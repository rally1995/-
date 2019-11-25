<template lang="pug">
    ebrain-main
        ebrain-dialog.pallent(
            top="2vh"
            :submitLoading="submitLoading"
            :visible.sync="dialogTransfer"
            :isClick="tableDataSub.length === 0"
            @submit="submitFormDialog")
            div.bindPa
                el-tree.bindTree(
                    @node-click="clickNode"
                    default-expand-all
                    :data="tableForm"
                    node-key="id")
                ebrain-box-table.table_form(
                    :loading='dialogTableLoading'
                    :isPagination='false'
                    :data="tableDataParent"
                    :column="dialogColumn"
                    @selection-change="selectNode"
                    row-key="id")
                div.parent
                    div.children
                        el-button.son(type="primary" :disabled="dialogSelectRows.length === 0" @click="getData") 确定选中
                        br
                        el-button.son(type="primary" :disabled="tableDataSub.length === 0" @click="tableDataSub = []") 清空全部
                ebrain-box-table.table_form(
                    :loading='dialogTableLoading'
                    :isPagination='false'
                    :data="tableDataSub"
                    :column="dialogColumnR"
                    row-key="id")
                    template(#operation)
                        el-table-column(
                            label="操作"
                            align="center")
                            template(v-slot="{row}")
                                el-button(type="primary"  @click="delRow(row)") 删除
</template>
<script>
import _ from 'lodash';
export default {
    name: 'chodept',
    props: {
        tav: Boolean,
    },
    data() {
        return {
            submitLoading: false,
            dialogTransfer: false,
            tableDataSub: [],
            tableForm: [],
            dialogTableLoading: false,
            tableDataParent: [],
            dialogSelectRows: [],
            dialogColumn: [{
                label: '用户名',
                prop: 'username',
            }, {
                label: '昵称',
                prop: 'nickname',
            }],
            dialogColumnR: [{
                label: '用户名',
                prop: 'username',
            }, {
                label: '昵称',
                prop: 'nickname',
            }, {
                slot: 'operation'
            }],
        };
    },
    watch: {
        dialogTransfer(val) {
            if (!val) {
                this.tableDataSub = [];
                this.tableDataParent = [];
            }
        }
    },
    methods: {
        init() {
            this.dialogTransfer = true;
            this.$http.get(`/admin/dept/tree`).then(res => {
                this.tableForm = res.data;
                const recur = (obj) => {
                    if (obj.children && obj.children.length) {
                        obj.label = obj.deptName;
                        obj.children.forEach(h => {
                            if (h.children && h.children.length) {
                                h.label = h.deptName;
                                recur(h);
                            } else {
                                h.label = h.deptName;
                            }
                        });
                    }
                };
                this.tableForm.forEach(v => {
                    recur(v);
                });
            });
        },
        clickNode(row, node, resolve) {
            if (!_.isEmpty(row.userList)) {
                this.tableDataParent = row.userList;
            } else {
                this.tableDataParent = [];
            }
        },
        selectNode(selection) {
            this.dialogSelectRows = selection;
        },
        getData() {
            this.tableDataSub.push(...this.dialogSelectRows);
            let set = new Set(this.tableDataSub);
            this.tableDataSub = Array.from(set);
        },
        delRow(row) {
            const index = this.tableDataSub.findIndex(v => v.userId === row.userId);
            this.tableDataSub.splice(index, 1);
        },
        submitFormDialog() {
            const arr = this.tableDataSub.map(v => v.username);
            const arrStr = arr.join(',');
            this.$emit('submitFormDialog', arrStr);
            this.dialogTransfer = false;
        }
    }
};
</script>
<style lang="stylus" scoped>
.pallent >>>
    .el-dialog
        min-width 1200px
.bindPa
    color #0094ff
    display flex
    justify-content space-between
    .bindTree
        width 300px
    .table_form
       height 80vh
       flex auto
    .parent
        margin 0 30px
        display flex
        justify-content center
        align-items center
        flex-wrap wrap
        .children
            .el-button
                margin 10px 0
</style>