<template lang="pug">
    .dialogtable
        el-dialog(:visible.sync="s"
                :title="title")
            el-form(inline v-if="dialogTableSearch" ref="form")
                el-form-item(
                    v-for="col in column"
                    v-if="col.searchBy"
                    :label="col.label"
                    :key="col.prop"
                    :prop="col.prop")
                    component(
                        v-if="col.comp"
                        :is="col.comp"
                        v-bind="col.compProp"
                        v-model="searchForm[col.prop]")
                    el-input(
                        v-else
                        v-model="searchForm[col.prop]")
                el-form-item
                    el-button(
                        @click="$emit('search', searchForm)") 搜索
                    el-button(
                        @click="$emit('resetDialog', searchForm)") 清空
            slot(name="tools")
            el-table(
                :fixed="fixed"
                v-loading="tableLoading"
                @current-change="currentChange"
                :row-class-name= "rowClassName"
                :show-summary="showSummary"
                :height="height"
                ref="table"
                :data="data"
                border
                tooltip-effect="light"
                @row-click="handlerRow"
                :row-key="rowKey"
                :current-row-key="Crk"
                :show-header="isHeader"
                :highlight-current-row="highlightCurrentRow"
                :key="tableKey"
                :lazy="lazy"
                :load="nodeLoad"
                @selection-change="selectionChangeHandler")
                template(v-for="col in column")
                    el-table-column(
                        v-bind="col")
                        el-table-column(
                            v-for="(child, index) in col.children"
                            :key="index"
                            v-if="col.children && col.children.length"
                            v-bind="child")
                template(v-for="(col, index) in column")
                    slot(v-if="col.slot" :name="col.slot")
            el-pagination.pagination(
                @size-change="changeSize"
                v-if="isShow"
                @current-change="changeCurrent"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="pageTotal"
                :page-sizes="[20, 50, 100, 200]"
                layout="total, sizes, prev, pager, next"
                :disabled="tableLoading"
                background)
            template(#footer)
                el-button(@click="s = false" v-if="isCancel") 取消
                el-button(type="primary" v-if="isHide" :disabled="disabled" @click="submitForm" :loading='submitLoading') 确定
                slot
</template>
<script>
import * as _ from 'lodash';

export default {
    name: 'ebraindialogtable',
    props: {
        tableLoading: {
            type: Boolean,
            default: () => false,
        },
        submitLoading: {
            type: Boolean,
            default: () => false,
        },
        showSummary: {
            type: Boolean,
            default: () => false,
        },
        rowKey: String,
        title: String,
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
        isShow: {
            type: Boolean,
            default: () => true,
        },
        disabled: {
            type: Boolean,
            default: () => false,
        },
        isHide: {
            type: Boolean,
            default: () => true,
        },
        isCancel: {
            type: Boolean,
            default: () => true,
        },
        currentRowKey: [String, Number],
        highlightCurrentRow: {
            type: Boolean,
            default: () => true,
        },
        visible: {
            type: Boolean,
            default: () => false,
        },
        isHeader: {
            type: Boolean,
            default: () => true,
        },
        height: [String, Number],
        rowClassName: Function,
        lazy: Boolean,
        nodeLoad: Function,
        dialogTableSearch: {
            type: Boolean,
            default: () => false
        },
        fixed: {
            type: String,
        },
        tableKey: String,
    },
    data() {
        return {
            selection: [],
            searchForm: {},
            isPageChange: false,
        };
    },
    computed: {
        Crk() {
            return this.currentRowKey;
        },
        s: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            },
        },
    },
    watch: {
        visible(val) {
            if (!val) {
                this.$refs.table.setCurrentRow();
                this.searchForm = {};
                this.$refs.form && this.$refs.form.resetFields();
                this.clearSelection();
            }
        },
        data() {
            this.$nextTick(() => {
                if (this.isPageChange) {
                    this.setSelection();
                    this.isPageChange = false;
                }
            });
        },
    },
    updated() {
        const icons = this.$refs.table && this.$refs.table.$el.querySelectorAll('.el-table__expand-icon');
        if (icons && icons.length) {
            icons.forEach(v => {
                v.onclick = e => {
                    this.$refs.table.doLayout();
                };
            });
        }
    },
    methods: {
        toggleAllSelection() {
            this.$refs.table.toggleAllSelection();
        },
        handlerRow(row) {
            this.$emit('row-click', row);
        },
        submitForm() {
            this.$emit('submit', _.compact(_.flatten(this.selection)));
        },
        // selectionHandler(selection) {
        //     this.selection = selection;
        //     this.$emit('select', selection);
        // },
        changeSize(val) {
            this.clearSelection();
            this.$emit('changeSize', val);
        },
        changeCurrent(val) {
            this.isPageChange = true;
            this.$emit('changeCurrent', val);
        },
        currentChange(row) {
            if (row) {
                this.$emit('update:current-row-key', row[this.rowKey]);
                this.$emit('current-change', row);
            }
        },
        doLayout() {
            this.$refs.table.doLayout();
        },
        pageChangeHandler(index) {
            this.$emit('page-change', index);
        },
        selectionChangeHandler(selection) {
            if (!this.isPageChange) {
                this.selection[this.currentPage - 1] = selection;
                this.$emit('select', _.compact(_.flatten(this.selection)));
            }
        },
        setSelection() {
            const selection = this.selection[this.currentPage - 1];
            if (selection && selection.length) {
                selection.forEach(row => {
                    const currentRow = this.data.find(v => _.isEqual(v, row));
                    this.$refs.table.toggleRowSelection(currentRow);
                });
            }
        },
        toggleRowSelection(row, selected) {
            this.$refs.table.toggleRowSelection(row, selected);
        },
        clearSelection() {
            this.selection = [];
            this.$emit('select', []);
            this.$refs.table.clearSelection();
        },
    }
};
</script>

<style scoped lang="stylus">
.dialogtable
    & >>> .el-dialog
        width 1000px

.pagination
    padding-top 15px
</style>
