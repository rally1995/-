<template lang="pug">
    .buttons
        button(
            type="button"
            v-for="btn in buttons"
            :disabled="btn.disabled"
            :class="btn.icon"
            @click="btn.click") {{btn.text}}
</template>

<script>
export default {
    name: 'EbrainBoxTools',
    props: {
        buttons: {
            type: Array,
            default: () => [],
        }
    },
};
</script>

<style scoped lang="stylus">
    .buttons
        background-color #f5f5f5
        border-color #dbdbdb
        border-width 1px 0
        border-style solid
        height 35px

        button
            border-width 0 1px 0 0
            border-color #dbdbdb
            border-style solid
            height 35px
            line-height 35px
            font-size 12px
            background-color #f5f5f5
            padding 0 20px
            color #363e4f
            cursor pointer
            outline none

            &:before
                margin-right 5px
                font-size 15px
                vertical-align -1px

        .right
            float right
            border-width 0 0 0 1px
</style>
