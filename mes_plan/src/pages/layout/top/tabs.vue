<template lang="pug">
    .left
        el-tabs.abc(
            @tab-remove="tabRemoveHandle"
            :value="active"
            type="card"
            @tab-click="clickHandler")
            el-tab-pane(
                :key="item.fullPath"
                v-for="item in tabs"
                :label="item.name"
                :name="item.fullPath"
                :closable="tabs.length > 1")
                .tab(slot="label" @click="clickHandler(item.fullPath)" v-contextmenu:contextmenu @contextmenu="menuAssignment(item)")
                    span {{item.name}}
                    i.el-icon-close(@click="tabRemoveHandle(item.fullPath)")
        v-contextmenu(ref="contextmenu" :disabled="tabs.length < 2")
            v-contextmenu-item(@click="tabClickClose") 关闭标签页
            v-contextmenu-item(@click="tabClickCloseOther") 关闭其它标签页
            v-contextmenu-item(@click="tabClickCloseRight") 关闭右侧标签页
            v-contextmenu-item(@click="tabClickCloseLeft") 关闭左侧标签页
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
    name: 'tabs',
    data() {
        return {
            rightItem: {},
        };
    },
    computed: {
        ...mapState(['tabs']),
        active() {
            return this.$route.fullPath;
        }
    },
    methods: {
        ...mapMutations(['SET_TABS']),
        tabRemoveHandle(name) {
            let { tabs } = this;
            const index = tabs.findIndex(v => v.fullPath === name);
            let newPath = tabs[index ? index - 1 : index + 1].path;
            tabs.splice(index, 1);
            this.SET_TABS(tabs);
            this.$router.push(newPath);
        },
        clickHandler(name) {
            const item = this.tabs.find(v => v.fullPath === name);
            item && this.$router.push(item.path);
        },
        menuAssignment(item) {
            this.rightItem = item;
        },
        tabClickClose() {
            this.tabRemoveHandle(this.rightItem.fullPath);
            this.rightItem = {};
        },
        tabClickCloseOther() {
            const { tabs } = this;
            const tabItem = tabs.find(v => v.fullPath === this.rightItem.fullPath);
            this.SET_TABS([tabItem]);
            this.$router.push(tabItem.path);
            this.rightItem = {};
        },
        tabClickCloseRight() {
            const { tabs } = this;
            const index = tabs.findIndex(v => v.fullPath === this.rightItem.fullPath);
            const newTabs = tabs.slice(0, index + 1);
            let newPath = tabs[index].path;
            this.SET_TABS(newTabs);
            this.$router.push(newPath);
            this.rightItem = {};
        },
        tabClickCloseLeft() {
            const { tabs } = this;
            const index = tabs.findIndex(v => v.fullPath === this.rightItem.fullPath);
            const newTabs = tabs.slice(index);
            let newPath = tabs[index].path;
            this.SET_TABS(newTabs);
            this.$router.push(newPath);
            this.rightItem = {};
        }
    },
};
</script>
<style scoped lang="stylus">
.left
    flex auto
    overflow hidden

    & >>> .el-tabs__nav
        border none

    & >>> .el-tabs__header
        margin 0

    & >>> .el-tabs__item
        border-left none
        height 50px
        line-height 50px

    & >>> .el-tabs__item.is-active
        border-bottom 2px solid #409EFF

    & >>> .el-tabs__new-tab
        display none

    & >>> .el-icon-arrow-right
        font-size 18px
        line-height 50px

    & >>> .el-icon-arrow-left
        font-size 18px
        line-height 50px

    & >>> .tab  + .el-icon-close
        display none

    & >>> .is-focus,
    & >>> .is-focus *
        outline none

.tab
    margin 0 -20px
    padding 0 20px
    user-select none
</style>
