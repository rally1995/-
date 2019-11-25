<template lang="pug">
    div.cell-edition(
        @dblclick="dblClickHandler")
        template(v-if="editable")
            el-select.cell-edition-item(
                ref="input"
                v-if="options.option"
                v-model="inputValue"
                placeholder="选择提交"
                @keyup.esc.native="cancelHandler"
                @blur="selectBlur"
                @change="submitRow")
                el-option(
                    @click.native.stop="optionClickHandler"
                    v-for="(value, key) in options.option"
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
            template(v-if="options.option")
                span(v-if="options.option[row[options.prop]]!==''&&options.option[row[options.prop]]!==undefined&&options.option[row[options.prop]]!==null") {{options.option[row[options.prop]]}}
                span.span(v-else) 双击编辑
            template(v-else)
                span(v-if="row[options.prop]!==''&&row[options.prop]!==undefined&&row[options.prop]!==null") {{row[options.prop]}}
                span.span(v-else) 双击编辑
</template>

<script>
export default {
    name: 'tableCell',
    props: {
        row: Object,
        options: Object,
        change: [Function, String],
        disabled: Boolean,
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
                this.inputValue = this.row[this.options.prop];
            }
        }
    },
    methods: {
        dblClickHandler() {
            if (this.disabled) return;
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
            const change = this.options.change && this.options.change(this.inputValue, this.options.prop, this.row);
            if (change !== false) this.editable = false;
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
