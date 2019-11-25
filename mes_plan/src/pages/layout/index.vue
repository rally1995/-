<template lang="pug">
    el-container.wrap
        el-aside.aside(:style="{width:menuCollapse?'78px':'278px'}")
            div(:class="menuCollapse?'uncollapse':'collapse'" @click="collapse")
            main-menu(
                :menu="menus"
                :active-path="activePath"
                @item-click="hoverHandler")
            sub-menu(
                v-if="!menuCollapse"
                :menu="subMenu"
                :active-path="activeSub")
        el-container.container
            el-header
                top
            el-main.container-item
                keep-alive
                    router-view(v-if="$route.meta.$keepAlive")
                router-view(v-if="!$route.meta.$keepAlive")
</template>
<script src="./script.js"></script>
<style src="./style.styl" scoped lang="stylus"></style>
