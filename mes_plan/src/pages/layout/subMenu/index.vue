<template lang="pug">
      transition(name="fade")
        el-scrollbar(style="height:calc(100% + 15px)")
            el-aside.second-item
                el-menu(
                    router
                    :default-active="activePath")
                    menu-item(
                        v-for="v in menu"
                        :key="v.name"
                        :item="v")
</template>
<script src="./script.js"></script>
<style src="./style.styl" scoped lang="stylus"></style>
