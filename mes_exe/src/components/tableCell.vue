<template lang="pug">
    div
        component.edit(
            :is="isComp"
            v-if="editRow._id===row._id && !disabled"
            v-model="editRow[column.property]"
            v-bind="compProp"
            @change="changeHandler")
            template(v-if="isComp==='elSelect'")
                el-option(
                    v-for="(opt, key) in format(option)"
                    :label="opt"
                    :value="key"
                    :key="key")
        span(v-else) {{cellValue}}
</template>

<script>
export default {
    name: 'tableCell',
    props: ['row', '$index', 'column', 'option', 'editRow', 'comp', 'compProp', 'change', 'disabled'],
    computed: {
        isComp() {
            if (this.option) return 'elSelect';
            else if (this.comp) return this.comp;
            else return 'elInput';
        },
        cellValue() {
            if (this.column.formatter) {
                return this.column.formatter(this.row, this.column, this.row[this.column.property]);
            } else {
                if (this.option) {
                    const option = this.format(this.option);
                    return option[this.row[this.column.property]];
                } else {
                    return this.row[this.column.property];
                }
            }
        }
    },
    methods: {
        changeHandler(e) {
            this.change && this.change(e, this.editRow);
        },
        format(op) {
            if (typeof op === 'function') return op();
            else return op;
        }
    }
};
</script>

<style scoped lang="stylus">
</style>
