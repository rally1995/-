<template lang="pug">
    .frame(:class="{collapse, flexNone: none}")
        .frame-toolbar
            h2 {{title}}
            .frame-toolbar-icon(v-if="isCollapse")
                a.frame-toolbar-icon-dropdown(@click="collapse = !collapse")
                    i.iconfont.icondown_arrow
        el-collapse-transition
            .frame-content(v-show="!collapse")
                .frame-tabs(v-if="$slots.tabs")
                    slot(name="tabs")
                .frame-tools(v-if="$slots.tools")
                    slot(name="tools")
                .frame-table(v-if="$slots.table")
                    slot(name="table")
</template>

<script>
export default {
    name: 'EbrainFrame',
    props: {
        title: String,
        none: Boolean,
        isCollapse: Boolean,
    },
    data() {
        return {
            collapse: false,
        };
    },
};
</script>

<style scoped lang="stylus">
.frame
    background-color #fff
    overflow hidden
    border-radius 4px
    border 1px solid #d1d1d1
    flex auto
    display flex
    flex-flow column nowrap

    & + .frame
        margin-top 8px

    &.flexNone
        flex none

    &:first-child
        margin-top 0

    &-table
        padding 10px
        flex auto
        box-sizing border-box
        position relative
        overflow hidden

    &-content
        flex auto
        display flex
        flex-flow column nowrap
        overflow hidden

    &-toolbar
        border-bottom 1px solid #f7f7f7
        padding 0 12px
        display flex
        justify-content space-between
        flex none

        h2
            font-size 15px
            line-height 46px
            position relative
            padding-left 12px
            user-select none

            &:before
                content ''
                height 18px
                width 3px
                background-color $color-blue
                position absolute
                left 0
                top 14px

        &-icon
            text-align right
            padding-top 8px

            &-dropdown
                display inline-block
                line-height 32px
                height 32px
                width 32px
                text-align center

                .iconfont
                    color $color-dark
                    transition transform .25s
                    display inline-block

    &.collapse
        .iconfont
            transform rotate(180deg)

</style>
