<template lang="pug">
    .table
        .table-list(:style="{bottom:isPagination?'48px':'0'}")
            el-table(
                v-loading='loading'
                ref="table"
                height="100%"
                :data="data"
                :border="border"
                :row-key="rowKey"
                tooltip-effect="light"
                :highlight-current-row="highlightCurrentRow"
                :span-method="spanMethod"
                :show-summary="showSummary"
                :summary-method="summaryMethod"
                @cell-mouse-enter="(row, column, cell, event) => $emit('cell-mouse-enter', row, column, cell, event)"
                @cell-mouse-leave="(row, column, cell, event) => $emit('cell-mouse-leave', row, column, cell, event)"
                @cell-dblclick="(row, column, cell, event) => $emit('cell-dblclick', row, column, cell, event)"
                @selection-change="selectionChangeHandler"
                @row-dblclick="(row, column, event) => $emit('row-dblclick', row, column, event)"
                @current-change="(currentRow, oldCurrentRow) => $emit('current-change', currentRow, oldCurrentRow)")
                el-table-column(
                    v-if="columnCheck"
                    width="40"
                    min-width="40"
                    type="selection"
                    align="center")
                el-table-column(
                    label="序号"
                    width="45"
                    type="index"
                    align="center"
                    :index="indexHandler"
                    v-if="columnIndex")
                template(v-for="(col, index) in column")
                    slot(v-if="col.slot" :name="col.slot")
                    table-column(
                        v-else
                        :option="col"
                        :key="index")
        el-pagination.table-pagination(
            v-if="isPagination"
            :disabled="loading"
            :current-page="pageCurrent"
            :total="pageTotal"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="prev, pager, next, sizes, total"
            background
            @current-change="pageChangeHandler"
            @size-change="pageSizeChangeHandler")
</template>

<script>
import tableColumn from '@/components/tableColumn';
import * as _ from 'lodash';

export default {
    name: 'EbrainEditTable',
    components: {
        tableColumn,
    },
    props: {
        title: String,
        rowKey: String,
        data: {
            type: Array,
            default: () => [],
        },
        border: {
            type: Boolean,
            default: () => true,
        },
        column: {
            type: Array,
            default: () => [],
        },
        config: Object,
        pageCurrent: {
            type: Number,
            default: () => 1,
        },
        pageSize: {
            type: Number,
            default: () => 20,
        },
        pageSizes: {
            type: Array,
            default: () => [20, 50, 100, 200],
        },
        pageTotal: {
            type: Number,
            default: () => 1,
        },
        showSummary: {
            type: Boolean,
            default: () => false
        },
        loading: Boolean,
        spanMethod: Function,
        summaryMethod: Function,
        highlightCurrentRow: {
            type: Boolean,
            default: () => true,
        },
        columnCheck: {
            type: Boolean,
            default: () => true,
        },
        columnIndex: {
            type: Boolean,
            default: () => true,
        },
        isPagination: {
            type: Boolean,
            default: () => true,
        }
    },
    data() {
        return {
            selection: [],
            isPageChange: false,
        };
    },
    watch: {
        data() {
            this.$nextTick(() => {
                if (this.isPageChange) {
                    this.setSelection();
                    this.isPageChange = false;
                }
            });
        }
    },
    activated() {
        this.$refs.table.doLayout();
    },
    methods: {
        // 遍历序号
        indexHandler(index) {
            return (this.pageCurrent - 1) * this.pageSize + index + 1;
        },
        toggleRowSelection(row, selected) {
            this.$refs.table.toggleRowSelection(row, selected);
        },
        pageChangeHandler(index) {
            this.isPageChange = true;
            this.$emit('page-change', index);
        },
        selectionChangeHandler(selection) {
            if (!this.isPageChange) {
                this.selection[this.pageCurrent - 1] = selection;
                this.$emit('selection-change', _.compact(_.flatten(this.selection)));
            }
        },
        setSelection() {
            const selection = this.selection[this.pageCurrent - 1];
            if (selection && selection.length) {
                selection.forEach(row => {
                    const currentRow = this.data.find(v => _.isEqual(v, row));
                    this.$refs.table.toggleRowSelection(currentRow);
                });
            }
        },
        setCurrentRow(row) {
            this.$refs.table.setCurrentRow(row);
        },
        clearSelection() {
            this.selection = [];
            this.$emit('selection-change', []);
            this.$refs.table.clearSelection();
        },
        pageSizeChangeHandler(e) {
            this.clearSelection();
            this.$emit('size-change', e);
        },
        doLayout() {
            this.$refs.table.doLayout();
        }
    },
};
</script>

<style scoped lang="stylus">
    .table
        height 100%
        position relative

        &-pagination
            padding 10px 0
            position absolute
            bottom 0
            width 100%

            & >>> .el-pagination__sizes,
            & >>> .el-pagination__total
                float right

        &-list
            position absolute
            top 0
            bottom 48px
            width 100%

            & >>> th
                background-color #f5f5f5
</style>
