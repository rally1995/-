<template lang="pug">
    el-autocomplete(
        v-model.lazy.trim="val"
        @select="item => $emit('change', item)"
        v-bind="$attrs"
        :trigger-on-focus="false"
        hide-loading
        highlight-first-item)
        i.el-icon-search.el-input__icon(
            slot="suffix"
            @click="clickHandler")
</template>

<script>
export default {
    name: 'ElDialogSelect',
    model: {
        prop: 'value',
        event: 'select',
    },
    props: ['value'],
    data() {
        return {
            val: this.value,
        };
    },
    watch: {
        value(val) {
            this.val = val;
        }
    },
    methods: {
        clickHandler() {
            this.$emit('dialog');
        },
    },
};
</script>
<style scoped lang="stylus">
    .el-icon-search
        cursor pointer
</style>
