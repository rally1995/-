<template lang="pug">
    .tools
        template(
            v-if="buttons && buttons.length")
            component.button(
                v-if="btn.permi === false ? true : permissions.includes(btn.permi)"
                v-for="btn in buttons"
                :is="btn.comp||'button'"
                :key="nanoid()"
                :disabled="isDisabled(btn)"
                :class="[btn.className, isDisabled(btn) ? 'disabled' : '']"
                v-bind="bindProp(btn)"
                @click="typeof btn.click === 'function' && btn.click()")
                    i(:class="btn.icon")
                    |{{btn.label}}
                    i.el-icon-loading(v-if="btn.loading")
        template(v-else)
            button(
                :class="{disabled: addDisabled}"
                :disabled="addDisabled"
                v-if="add"
                @click="add")
                i.iconfont.iconstatus-Preserve-and-add
                |新增
            button(
                :class="{disabled: editDisabled}"
                :disabled="editDisabled"
                v-if="edit"
                @click="edit")
                i.iconfont.iconstatus-edit
                |修改
            button(
                :class="{disabled: delDisabled}"
                :disabled="delDisabled"
                v-if="del"
                @click="del")
                i.iconfont.iconstatus-delete
                |删除
            button(
                :class="{disabled: permiDisabled}"
                :disabled="permiDisabled"
                v-if="permi"
                @click="permi")
                i.iconfont.iconstate-determination
                |权限
        slot
</template>

<script>
import { mapState } from 'vuex';
import nanoid from 'nanoid';
export default {
    name: 'EbrainTools',
    props: {
        add: Function,
        edit: Function,
        del: Function,
        permi: Function,
        addDisabled: Boolean,
        editDisabled: Boolean,
        delDisabled: Boolean,
        permiDisabled: Boolean,
        buttons: Array,
    },
    data() {
        return {
            nanoid,
        };
    },
    computed: {
        ...mapState(['permissions']),
    },
    methods: {
        bindProp(btn) {
            const { permi, comp, disabled, className, click, ...other } = btn;
            return other;
        },
        isDisabled(btn) {
            if (btn.loading) {
                return true;
            } else {
                return typeof btn.disabled === 'function' ? btn.disabled() : btn.disabled;
            }
        },
    }
};
</script>

<style scoped lang="stylus">
.tools
    background-color #f5f5f5
    border-style solid
    border-color #dbdbdb
    border-width 1px 0
    height 32px

    & >>> button,
    & >>> .button
        border-style solid
        border-color #dbdbdb
        border-width 0 1px
        background-color #f5f5f5
        display inline-block
        color $color-dark
        line-height 32px
        /*padding 0 15px*/
        font-size 12px
        user-select none
        cursor pointer
        outline none
        height 32px
        user-select none
        vertical-align top

        &:hover,
        & .el-upload:focus
            background-color $color-blue
            color #fff

        .iconfont,
        &:before
            vertical-align -1px
            margin-right 5px
            font-size 16px

        &:first-child
            border-left-width 0

        &[disabled="disabled"],
        &.disabled
            cursor not-allowed
            color lighten($color-dark, 50)
            background-color #f5f5f5
            user-select none

            & > *
                pointer-events none

        & + &
            margin-left -1px
.el-icon-loading
    margin-left 5px
</style>
