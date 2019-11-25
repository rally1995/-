<template lang="pug">
    .main
        slot
</template>

<script>
export default {
    name: 'EbrainMain',
};
</script>

<style scoped lang="stylus">
    .main
        display flex
        width 100%
        height 100%
        flex-flow column nowrap
</style>
