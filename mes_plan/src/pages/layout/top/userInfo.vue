<template lang="pug">
    .right
            //- i.iconfont.iconnews
            //- span.number 99
            el-dropdown(trigger="hover" @command="commandHandle")
                span.el-dropdown-link {{sysUser.username}}
                i.el-icon-caret-bottom.el-icon--right
                el-dropdown-menu(slot="dropdown")
                    //- el-dropdown-item 个人信息
                    el-dropdown-item(command="logout") 退出系统
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
    name: 'UserInfo',
    computed: {
        ...mapState(['sysUser']),
    },
    methods: {
        ...mapActions(['signout']),
        /**
         * 登出
         */
        logout() {
            this.$confirm('是否退出系统？', '提示', {
                type: 'warning'
            }).then(() => {
                this.signout();
            });
        },
        commandHandle(command) {
            if (this[command]) this[command]();
        }
    },
};
</script>
<style scoped lang="stylus">
.right
    position relative
    flex none
    line-height 50px
    color #888888
    max-width 120px
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    & >>> .el-dropdown
        width 100%
        padding-right 18px
        padding-left 10px
        box-sizing border-box

    .el-dropdown-link
        font-size 14px
        cursor pointer
        padding-right 15px
        display block
        width 100%
        overflow hidden
        text-overflow ellipsis
    .number
        min-width 18px
        max-width 18px
        text-align center
        line-height 18px
        display inline-block
        position absolute
        left 6px
        top 6px
        background red
        color #fff
        border-radius 50%
        padding 2px
        font-size 14px
        transform scale(.7)
        font-family Tahoma!important
    .iconfont.iconnews
        font-size 19px

.el-icon--right
    position absolute
    top 18px
    right 7px
</style>
