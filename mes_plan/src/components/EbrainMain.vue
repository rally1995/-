<template lang="pug">
    div.wrap
        .left(v-if="$slots.leftColumn")
            slot(name="leftColumn")
        .right
            slot
</template>

<script>
export default {
    name: 'EbrainMain',
};
</script>

<style scoped lang="stylus">
.wrap
    display flex

.right
    flex auto
    display flex
    flex-flow column nowrap
    width 100%

.left
    flex none
    width $left = 200px
    display flex

    & + .right
        width calc(100% - 200px)
        & >>> .frame
            border-top-left-radius 0
            border-bottom-left-radius 0

    & >>> .frame-table
        height 100%
</style>
