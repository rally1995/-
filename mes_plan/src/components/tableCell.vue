<template lang="pug">
    div.cell-edition(
        @dblclick="dblClickHandler")
        template(v-if="editable")
            el-select.cell-edition-item(
                ref="input"
                v-if="option"
                v-model="inputValue"
                placeholder="选择提交"
                @keyup.esc.native="cancelHandler"
                @blur="selectBlur"
                @change="submitRow")
                el-option(
                    @click.native.stop="optionClickHandler"
                    v-for="(value, key) in option"
                    :key="key"
                    :value="key"
                    :label="value")
            el-input.cell-edition-item(
                ref="input"
                v-else
                v-model="inputValue"
                placeholder="回车提交"
                @keyup.esc.native="cancelHandler"
                @blur="cancelHandler"
                @keyup.enter.native="submitRow")
        .cell-edition-txt(v-else)
            template(v-if="option")
                span(v-if="option[value]!==''&&option[value]!==undefined&&option[value]!==null") {{option[value]}}
                span.span(v-else) 双击编辑
            template(v-else)
                span(v-if="value!==''&&value!==undefined&&value!==null") {{value}}
                span.span(v-else) 双击编辑
</template>

<script>
export default {
    name: 'tableCell',
    props: {
        value: [String, Number],
        option: Object,
    },
    data() {
        return {
            editable: false,
            inputValue: '',
            selectClickDropDown: false,
        };
    },
    watch: {
        editable(val) {
            if (val) {
                this.inputValue = this.value;
            }
        }
    },
    methods: {
        dblClickHandler() {
            this.editable = true;
            this.$nextTick(() => {
                this.$refs.input.focus();
                this.$emit('edit', this);
            });
        },
        cancelHandler() {
            this.editable = false;
        },
        selectBlur(e) {
            setTimeout(() => {
                if (this.selectClickDropDown) this.selectClickDropDown = false;
                else this.cancelHandler();
            }, 100);
        },
        optionClickHandler() {
            this.selectClickDropDown = true;
            try {
                this.$refs.input.blur();
                this.$refs.input.focus();
            } catch {}
        },
        submitRow() {
            this.$emit('save', this.inputValue);
            this.editable = false;
        },
        setStatus(key, value) {
            this[key] = value;
        },
    },
};
</script>

<style scoped lang="stylus">
    .cell-edition
        width 100%
        height 100%

        &-txt
            min-height 23px
            width 100%
            overflow hidden
            text-overflow ellipsis
            white-space nowrap

        &-item
            line-height 24px

            & >>> input
                height 24px
                line-height 24px
                padding 0 10px

            & >>> .el-input--mini .el-input__icon
                line-height 24px
    .span
        color #cdcdcd
</style>
