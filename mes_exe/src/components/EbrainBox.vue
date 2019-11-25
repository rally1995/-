<template lang="pug">
    .box
        slot
</template>

<script>
export default {
    name: 'EbrainBox',
    props: {
        label: String,
    }
};
</script>

<style scoped lang="stylus">
    .box
        background-color #fff
        border-radius $box-radius
        // border 1px solid $color-decoration
        box-sizing border-box
        flex auto
        position relative

        & + &
            margin-top 16px
</style>
