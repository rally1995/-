<template lang="pug">
    el-table-column(
        v-if="options.type"
        v-bind="options")
    el-table-column(
        v-else-if="options.children && options.children.length"
        v-bind="options")
        table-column(
            v-for="(child, index) in options.children"
            :key="index"
            :options="child"
            :edit-row="editRow")
    el-table-column(
        v-else
        v-bind="options"
        v-slot="slotOption")
        table-cell(
            v-bind="{...slotOption,...options,editRow}")
</template>

<script>
import tableCell from '@/components/tableCell';
import tableColumn from '@/components/tableColumn';

export default {
    name: 'tableColumn',
    components: {
        tableCell,
        tableColumn,
    },
    props: {
        options: Object,
        editRow: Object,
    },
};
</script>

<style scoped lang="stylus"></style>
