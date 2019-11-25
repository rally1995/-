<template lang="pug">
    el-form.search(
        inline
        ref="search")
        el-form-item
            el-select(
                v-model="prop"
                @change="result=''")
                el-option(
                    v-for="item in form"
                    :label="item.label"
                    :value="item.prop"
                    :key="item.prop")
        el-form-item
            component(
                v-bind="isComponent()"
                clearable
                v-model="result"
                @change="submitForm")
                el-option(
                    v-if="item.option"
                    v-for="(op, opKey) in item.option"
                    :label="op"
                    :value="String(opKey)"
                    :key="op")
        el-form-item
            el-button(
                type="primary"
                type.native="submit"
                @click="submitForm") 查询
            el-button(@click="clearForm") 重置
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
    data() {
        return {
            result: '',
            prop: ''
        };
    },
    computed: {
        item() {
            return this.form.find(v => v.prop === this.prop) || {};
        },
    },
    created() {
        if (this.form) this.prop = this.form[0].prop;
    },
    methods: {
        submitForm() {
            this.$emit('search', {
                [this.prop]: this.result
            });
        },
        clearForm() {
            this.result = '';
            this.$emit('reset');
        },
        modelForm() {
            this.form.forEach(v => {
                this.row[v.prop] = '';
            });
        },
        isComponent() {
            if (!this.item) {
                return { is: 'elInput' };
            }
            if (this.item.option) {
                return { is: 'elSelect' };
            }
            switch (this.item.formType) {
                case 'datetime':
                    return { is: 'elDatePicker', type: 'datetime', valueFormat: 'yyyy-MM-dd HH:mm:ss' };
                case 'date':
                    return { is: 'elDatePicker', type: 'date', valueFormat: 'yyyy-MM-dd' };
                case 'time':
                    return { is: 'elTimePicker', valueFormat: 'HH:mm:ss' };
                default:
                    return { is: 'elInput' };
            }
        }
    },
};
</script>

<style scoped lang="stylus">
    .search
        & >>> .el-form-item
            margin-bottom 0
</style>
