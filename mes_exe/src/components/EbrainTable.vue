<template lang="pug">
    .ebrainTable
        .table(:style="{height:isShow?'calc(100% - 48px)':'100%'}")
            el-table(
                ref="table"
                v-loading="loading"
                :data="tableData"
                :row-key="rowKey"
                :height="height"
                border
                tooltip-effect="light"
                :highlight-current-row="highlightCurrentRow"
                :current-row-key="cr"
                @current-change="currentChange"
                @selection-change="selectionChange")
                template(v-for="col in column")
                    slot(v-if="col.slot" :name="col.slot")
                    table-column(
                        v-else
                        :options="col"
                        :edit-row="editRow")
                el-table-column(
                    v-if="tableRowEdit"
                    label="操作"
                    v-slot="{row, $index, column, store}"
                    :width="buttonWidth")
                    template(
                        v-if="editRow._id===row._id")
                        el-button(
                            @click="cancel"
                            :disabled="saveLoading") 取消
                        el-button(
                            type="primary"
                            @click="save(row)"
                            :loading="saveLoading") 保存
                    template(v-else)
                        el-button(
                            v-if="editRowMsg"
                            :disabled="isDisabled"
                            type="primary"
                            @click="edit(row)") 编辑
                        slot(name="operation" :row="row")
        el-pagination.pagination(
            @size-change="changeSize"
            v-if="isShow"
            @current-change="changeCurrent"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="pageTotal"
            background)

</template>

<script>
import tableColumn from '@/components/tableColumn';
import nanoid from 'nanoid';
import * as _ from 'lodash';

export default {
    name: 'EbrainTable',
    components: {
        tableColumn,
    },
    props: {
        isDisabled: {
            type: Boolean,
            default: () => false,
        },
        loading: {
            type: Boolean,
            default: () => false,
        },
        rowKey: String,
        data: {
            type: Array,
            default: () => [],
        },
        column: {
            type: Array,
            default: () => [],
        },
        highlightCurrentRow: {
            type: Boolean,
            default: () => true,
        },
        height: {
            type: String,
            default: () => '100%'
        },
        currentRowKey: [String, Number],
        tableRowEdit: Boolean,
        isShow: {
            type: Boolean,
            default: () => false,
        },
        currentPage: {
            type: Number,
            default: () => 1,
        },
        pageSize: {
            type: Number,
            default: () => 20,
        },
        pageTotal: {
            type: Number,
            default: () => 0,
        },
        buttonWidth: {
            type: String,
            default: () => '194'
        },
        editRowMsg: {
            type: Boolean,
            default: () => true,
        }
    },
    data() {
        return {
            saveLoading: false,
            editRow: {},
        };
    },
    computed: {
        cr() {
            return this.currentRowKey;
        },
        tableData() {
            return this.data.map(v => ({
                ...v,
                _id: nanoid(),
            }));
        },
    },
    methods: {
        changeSize(val) {
            this.$emit('change-size', val);
        },
        changeCurrent(val) {
            this.$emit('update:current-row-key', '');
            this.$emit('change-current', val);
        },
        selectionChange(selection) {
            this.$emit('selection-change', selection);
        },
        currentChange(row) {
            if (row) {
                this.$emit('update:current-row-key', row[this.rowKey]);
                this.$emit('current-change', row);
            }
        },
        edit(row) {
            this.cancel();
            this.editRow = { ...row };
        },
        save() {
            this.saveLoading = true;
            this.$emit('cell-save', this.editRow, this.finish, this.killLoading);
        },
        cancel() {
            if (!this.editRow._id) {
                _.pullAllBy(this.tableData, [{ _id: this.editRow._id }], '_id');
            }
            this.editRow = {};
        },
        new(row = {}) {
            this.cancel();
            this.tableData.unshift(row);
            this.editRow = { ...row };
        },
        finish() {
            this.saveLoading = false;
            this.cancel();
        },
        killLoading() {
            this.saveLoading = false;
        }
    },
};
</script>

<style scoped lang="stylus">
.ebrainTable
    height 100%

    .table
        & >>> th
            background-color #f5f5f5

        & >>> .cell
            text-align center

    .pagination
        flex none
        background-color #ffffff
        padding 15px 14px 5px

        & >>> .el-pagination__total,
        & >>> .el-input__inner
            font-size 14px
</style>
