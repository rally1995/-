<template lang="pug">
    header
        .left
            i.iconfont.iconlogo(@click="$router.replace('/processcenter')")
            i.iconfont.iconreturn(
                v-if="$route.path !== '/processcenter'"
                @click="routerJump")
        h2 {{title}}
        .right
            span {{sysUser.nickname}}
            span {{date}}
            span {{time}}
</template>

<script>
import { mapActions, mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'LayoutHeader',
    data() {
        return {
            date: '',
            time: '',
        };
    },
    computed: {
        ...mapState('sys', {
            sysUser: state => state.sysUser,
        }),
        title() {
            return this.$route.meta.title.replace(/\{(\w+?)\}/g, (o, $1) => {
                return this.$route.query[$1];
            });
        }
    },
    created() {
        this.queryUserInfo();
    },
    mounted() {
        this.clock();
    },
    methods: {
        ...mapActions('sys', ['queryUserInfo']),

        /**
         * 时钟
         */
        clock() {
            this.date = moment().format('YY/MM/DD');
            this.time = moment().format('HH:mm');
            const seconds = moment().seconds();
            setTimeout(this.clock, 60000 - seconds * 1000);
        },
        routerJump() {
            switch (true) {
                case this.$route.path === '/workcenter':
                    this.$router.push('/processcenter');
                    break;
                case /^\/panel/.test(this.$route.path):
                    this.$router.push({
                        path: '/workcenter',
                        query: {
                            pc: this.$route.query.pc,
                            pn: this.$route.query.pn,
                        }
                    });
                    break;
            }
        },
    },
};
</script>

<style scoped lang="stylus">
    header
        background-color #363e4f
        color #fff
        height $header-height
        width 100%
        position relative

        h2
            text-align center
            line-height $header-height
            font-size $font-head
            font-weight 500

        .left
            position absolute
            left 16px
            top 0

            & > *
                margin-right 15px

            .iconfont
                vertical-align middle
                line-height $header-height
                cursor pointer

                & + .iconfont
                    padding 0 15px
                    position relative

                    &:after
                        content ''
                        position absolute
                        width 1px
                        height 80%
                        background-color #fff
                        top 10%
                        left 0

                &.iconlogo
                    font-size 100px

                &.iconreturn
                    font-size 24px

        .right
            position absolute
            right 16px
            top 0
            line-height $header-height
            font-size $font-mark

            & > *
                margin-left 8px
</style>
