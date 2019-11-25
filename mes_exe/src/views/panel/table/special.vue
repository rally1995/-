<template lang="pug">
    div
        h3.title 客户特殊需求
        .row
            p(v-for="sen in content") {{sen.zfield}}

</template>
<script>
import { mapState } from 'vuex';
export default {
    name: 'special',
    data() {
        return {
            content: [],
        };
    },
    computed: {
        ...mapState({
            orderId: state => state.workcenter.workcenter.id
        })
    },
    watch: {
        orderId(id) {
            if (this.orderId) this.getData(this.orderId);
        }
    },
    mounted() {
        if (this.orderId) this.getData(this.orderId);
    },
    methods: {
        getData(orderId) {
            this.$http.get(`/productionexe/order/sapCustomer/getDemand/${orderId}`).then(({ data }) => {
                this.content = data;
            });
        }
    },
};
</script>
<style scoped lang="stylus">
div
    height 100%
    flex-flow column nowrap
    position relative
.title
    margin 5px 10px
    padding 5px 10px

.row
    position absolute
    top 34px
    left 0
    width 100%
    bottom 0
    overflow-x hidden
    overflow-y scroll
    height auto
    padding 20px
    box-sizing border-box

    p
        margin-top 0
</style>
