<template lang="pug">
    el-form.bar(inline)
        el-form-item
            el-select(
                v-model="reason"
                clearable)
                el-option(
                    v-for="i in searchList"
                    :label="i.label"
                    :value="i.prop"
                    :key="i.prop")
        el-form-item
            el-select(
                v-if="item && item.option"
                v-model="result"
                placeholder="值"
                clearable)
                el-option(
                    v-for="(v, k) in item.option"
                    :key="v.k"
                    :label="v"
                    :value="k")
            el-input(
                v-else
                v-model="result"
                placeholder="值"
                clearable)
        el-form-item
            el-button(type="primary" @click="submitform") 搜索
            el-button(@click="resetform") 重置
</template>

<script>
export default {
    name: 'EbrainSeniorSearch',
    props: {
        searchList: Array,
    },
    data() {
        return {
            result: '',
            reason: '',
        };
    },
    computed: {
        item() {
            return this.searchList.find(v => v.prop === this.reason);
        },
    },
    watch: {
        reason() {
            this.result = '';
        }
    },
    methods: {
        submitform() {
            this.$emit('submit', this.reason ? { [this.reason]: this.result } : null);
        },
        resetform() {
            this.result = '';
            this.reason = '';
            this.$emit('reset');
        }
    },
};
</script>

<style scoped lang="stylus">
    .bar
        background-color #f5f5f5
        border-style solid
        border-color #dbdbdb
        border-width 1px 0
        padding 0 10px

        & >>> .el-form-item
            margin-bottom 2px
            margin-top 2px
</style>
