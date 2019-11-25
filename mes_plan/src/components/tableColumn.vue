<template lang="pug">
    el-table-column(
        v-if="option.children && option.children.length"
        v-bind="option")
        table-column(
            v-for="(child, index) in option.children"
            :option="child"
            :key="index")
    el-table-column(
        v-else
        v-bind="option")
        template(#header="{column, $index}" v-if="option.editable")
            span
                |{{column.label}}
                i.iconstatus-edit.iconfont
        template(v-slot="{row}" v-if="option.editable")
            table-cell(
                :options="option"
                :row="row"
                :disabled="typeof option.cellDisabled === 'function' ? option.cellDisabled() : option.cellDisabled")
</template>

<script>
import tableColumn from '@/components/tableColumn';
import tableCell from '@/components/tableBoxCell';

export default {
    name: 'tableColumn',
    components: {
        tableColumn,
        tableCell,
    },
    props: ['option']
};
</script>

<style scoped lang="stylus">
.iconfont
    font-size 12px
    margin-left 5px
</style>
