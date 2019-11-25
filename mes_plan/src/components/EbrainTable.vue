<template lang="pug">
    .tableWrap
        .table
            el-table(
                v-loading='tableLoading'
                ref="table"
                :data="data"
                :row-key="rowKey"
                height="100%"
                border
                tooltip-effect="light"
                :highlight-current-row="highlightCurrentRow"
                :span-method="spanMethod"
                :row-class-name= "rowClassName"
                default-expand-all
                :current-row-key="cr"
                @current-change="currentChange"
                @row-dblclick="dblclickHandler"
                @cell-dblclick="cellDblclickHandler"
                @selection-change="handleSelectionChange"
                @select="selectChange"
                @select-all="selectAll"
                @toggleRowSelection = "toggleRowSelection"
                @row-click="handlerRow")
                template(v-for="col in column")
                    slot(v-if="col.slot" :name="col.slot")
                    component(
                        v-else-if="col.component"
                        :is="col.component"
                        :config="col")
                    el-table-column(
                        v-else
                        v-bind="col"
                        :render-header="h => headerCellClass(h, col)")
                        template(v-slot="{row}" v-if="col.editable")
                            table-cell(
                                v-model="row[col.prop]"
                                :option="typeof col.option === 'function' ? col.option() : col.option"
                                :disabled="typeof col.cellDisabled === 'function' ? col.cellDisabled(row) : col.cellDisabled"
                                @save="$emit('cell-change', $event, row, col.prop)"
                                @edit="$emit('cell-edit', $event, row, col.prop)")
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
import tableCell from '@/components/tableCell';
export default {
    name: 'EbrainTable',
    components: {
        tableCell,
    },
    props: {
        tableLoading: {
            type: Boolean,
            default: () => false,
        },
        isShow: {
            type: Boolean,
            default: () => true,
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
        pageTotal: {
            type: Number,
            default: () => 0,
        },
        pageSize: {
            type: Number,
            default: () => 20,
        },
        currentPage: {
            type: Number,
            default: () => 1,
        },
        selection: {
            type: Array,
            default: () => []
        },
        expand: {
            type: String,
            default: () => 'expand'
        },
        highlightCurrentRow: Boolean,
        currentRowKey: [String, Number],
        spanMethod: Function,
        rowClassName: Function,
    },
    data() {
        return {
            checked: 'false',
        };
    },
    computed: {
        cr() {
            return this.currentRowKey;
        },
    },
    updated() {
        const icons = this.$refs.table.$el.querySelectorAll('.el-table__expand-icon');
        if (icons && icons.length) {
            icons.forEach(v => {
                v.onclick = e => {
                    this.$refs.table.doLayout();
                };
            });
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.table.doLayout();
        });
    },
    methods: {
        changeCurrent(val) {
            // this.currentRowKey = '';
            this.$emit('update:current-row-key', '');
            this.$emit('changeCurrent', val);
        },
        changeSize(val) {
            this.$emit('changeSize', val);
        },
        currentChange(row) {
            if (row) {
                this.$emit('update:current-row-key', row[this.rowKey]);
                this.$emit('current-change', row);
            }
        },
        dblclickHandler(row, column, event) {
            this.$emit('row-dblclick', row, column, event);
        },
        cellDblclickHandler(row, column, cell, event) {
            this.$emit('cell-dblclick', row, column, cell, event);
        },
        handlerRow(row) {
            this.$emit('row-click', row);
        },
        doLayout() {
            this.$refs.table.doLayout();
        },
        clearSelection() {
            this.$refs.table.clearSelection();
        },
        handleSelectionChange(val) {
            this.$emit('selection-change', val);
        },
        toggleRowSelection(row, selected) {
            this.$refs.table.toggleRowSelection(row, selected);
        },
        selectChange(selection, row) {
            this.$emit('select', selection, row);
        },
        selectAll(selection) {
            this.$emit('select-all', selection);
        },
        headerCellClass(h, col) {
            if (col.editable) {
                return h('span', [
                    h('i', {
                        class: 'iconfont iconstatus-edit',
                    }),
                    h('span', col.label),
                ]);
            } else {
                return h('span', col.label);
            }
        },
    },
};
</script>

<style scoped lang="stylus">
.tableWrap
    height 100%
    display flex
    flex-flow column nowrap

    & >>> th
        background-color #f5f5f5

    & >>> a + a
        margin-left 5px

    .table
        flex auto
        height 0

        & >>> .el-table
            width 100%
            height 100%!important

            .warning-row
                background oldlace

            .cell .iconfont
                font-size 14px
                margin-right 3px

    .pagination
        flex none
        background-color #ffffff
        padding 15px 14px 5px

        & >>> .el-pagination__total,
        & >>> .el-input__inner
            font-size 14px

</style>
