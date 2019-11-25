<template lang="pug">
    .dialogtable
        el-dialog(
            :title="title"
            :visible.sync="s")
            .t(:style="{height:height}")
                el-form.searchDialog(inline v-if="dialogTableSearch")
                    el-form-item(
                        v-for="col in column"
                        v-if="col.searchBy"
                        :label="col.label"
                        :key="col.prop"
                        :prop="col.prop")
                        el-input(v-model="searchForm[col.prop]")
                    el-form-item
                        el-button(
                            @click="$emit('search', searchForm)") 搜索
                        el-button(
                            @click="$emit('resetDialog', searchForm)") 清空
                slot(name="tools")
                el-table(
                    v-loading="tableLoading"
                    @current-change="currentChange"
                    height="100%"
                    ref="EldialogTable"
                    :data="data"
                    border
                    :row-style="rowStyle"
                    tooltip-effect="light"
                    @row-click="handlerRow"
                    :row-key="rowKey"
                    :current-row-key="Crk"
                    :show-header="isHeader"
                    :highlight-current-row="highlightCurrentRow"
                    @row-dblclick="dblclickHandler"
                    @selection-change="selectionHandler")
                        template(v-for="col in column")
                            slot(v-if="col.slot" :name="col.slot")
                            el-table-column(v-else v-bind="col")
            template(#footer)
                el-button(@click="s = false") 取消
                el-button(type="primary" v-if="isHide" :disabled="disabled" @click="submitForm" :loading="subLoading") 确定
            el-pagination.pagination(@size-change="changeSize"
                v-if="isShow"
                @current-change="changeCurrent"
                :current-page="currentPageSon"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next"
                :total="pageTotal"
                background)
</template>
<script>
export default {
    name: 'ebraindialogtable',
    props: {
        title: String,
        disabled: {
            type: Boolean,
            default: () => false,
        },
        rowKey: String,
        tableLoading: {
            type: Boolean,
            default: () => false,
        },
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
            default: () => 1,
        },
        pageSize: {
            type: Number,
            default: () => 20,
        },
        currentPageSon: {
            type: Number,
            default: () => 1,
        },
        isShow: {
            type: Boolean,
            default: () => false,
        },
        isHide: {
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
        height: [String, Number],
        dialogTableSearch: {
            type: Boolean,
            default: () => false
        },
        isHeader: {
            type: Boolean,
            default: () => true,
        },
        subLoading: {
            type: Boolean,
            default: () => false
        },
        rowStyle: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            selection: [],
            searchForm: {},
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
                this.$refs.EldialogTable.setCurrentRow();
                this.searchForm = {};
            }
        }
    },
    methods: {
        handlerRow(row) {
            this.$emit('row-click', row);
        },
        submitForm() {
            this.$emit('submit', this.selection);
        },
        selectionHandler(selection) {
            this.selection = selection;
            this.$emit('select', selection);
        },
        changeSize(val) {
            this.$emit('changeSize', val);
        },
        changeCurrent(val) {
            this.$emit('changeCurrent', val);
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
        setCurrentRow(row) {
            this.$refs.EldialogTable.setCurrentRow(row);
        },
    }
};
</script>

<style scoped lang="stylus">
.dialogtable >>> .el-dialog
    width 1000px

.dialogtable
    & >>> .el-dialog .el-dialog__body
        position relative

    & >>> .el-dialog__header
        padding 40px 20px 10px
.t
    position absolute
    top 0
    right 0
    bottom 70px
    left 0
    padding 10px 10px 10px 20px
</style>
