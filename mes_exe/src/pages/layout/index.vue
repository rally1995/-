<template lang="pug">
    .app.clearfix
        layout-header
        .contain
            router-view
</template>

<script>
import LayoutHeader from './header';
export default {
    name: 'Layout',
    components: { LayoutHeader },
};
</script>

<style scoped lang="stylus">
    .app
        height 100%
        display flex
        flex-flow column nowrap

    .contain
        flex auto
        padding 16px
        background-color $main-background
        box-sizing border-box
</style>
