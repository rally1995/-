<template lang="pug">
    ebrain-main
        order-info
        router-view.panel
        bottom-menus
</template>

<script>
import orderInfo from './orderInfo';
import bottomMenus from './bottomMenus';
import { mapState } from 'vuex';
import jobpool from './jobpool';
import posting from './posting';
export default {
    name: 'panel',
    components: {
        orderInfo,
        bottomMenus,
        jobpool,
        posting,
    },
    data() {
        return {
            jobpoolData: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            orderList: state => state.orderList,
        }),
        wc() {
            return this.$route.query.wc;
        },
    },
};
</script>

<style scoped lang="stylus">
.panel
    height auto
    flex auto
    display flex
    margin 16px 0
</style>
