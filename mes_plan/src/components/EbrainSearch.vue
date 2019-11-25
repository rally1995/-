<template lang="pug">
    el-form.form(
        inline
        ref="form"
        @submit.prevent.native="submitForm"
        :model="modelForm")
        el-form-item(
            v-for="item in form"
            :label="item.label"
            :key="item.prop"
            :prop="item.prop")
            el-input(
                clearable
                v-if="item.type === 'input' || item.type === undefined"
                v-model="item.value"
                @keyup.enter.native="submitForm")
            el-date-picker(
                clearable
                v-if="item.type === 'picker'"
                v-model="item.value"
                type="daterange",
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @keyup.enter.native="submitForm")
            el-date-picker(
                clearable
                v-if="item.type === 'pickertime'"
                v-model="item.value"
                type="datetimerange",
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @keyup.enter.native="submitForm")
            el-select(
                clearable
                v-if="item.type === 'select'"
                v-model="item.value"
                :multiple="item.multiple"
                :collapse-tags="item.multiple")
                el-option(
                    v-for="(op, opKey) in item.option"
                    :label="op"
                    :value="opKey"
                    :key="op")
        el-form-item
            el-button(@click="clearForm") 清空
            el-button(
                type="primary"
                @click="submitForm") 查询
</template>

<script>
export default {
    name: 'EbrainSearch',
    props: {
        form: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        modelForm() {
            let obj = {};
            this.form.forEach(v => {
                obj[v.prop] = v.value;
            });
            return obj;
        },
    },
    methods: {
        submitForm() {
            this.$emit('search');
        },
        clearForm() {
            this.$emit('reset');
        },
    },
};
</script>

<style scoped lang="stylus">


</style>
