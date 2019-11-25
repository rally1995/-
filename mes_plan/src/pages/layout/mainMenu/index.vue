<template lang="pug">
    .sider
        el-aside(:class="!menuCollapse?'aside-if':'aside-else'")
            .first-item-logo
                img(src='@/assets/abzh-logo.svg')
            el-scrollbar(style="height:calc(100vh - 72px)")
                .menu
                    .menu-item(v-for="item in menu"
                        :class="{'is-active':item.path === activePath}"
                        :key='item.name'
                        @click="$emit('item-click', item)")
                        i.icon-font(:class="item.icon")
                        .title(v-if="!menuCollapse") {{ item.label }}
</template>
<script src="./script.js"></script>
<style src="./style.styl" scoped lang="stylus"></style>
