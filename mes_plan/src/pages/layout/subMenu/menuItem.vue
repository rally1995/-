<template lang="pug">
    el-submenu(
        v-if="item.children && item.children.length"
        :index="item.id")
        template(#title) {{item.name}}
        menu-item(
            v-for="v in item.children"
            :key="v.name"
            :item="v")
    el-menu-item(
        v-else
        :index="item.path") {{item.name}}
</template>

<script>
export default {
    name: 'MenuItem',
    props: {
        item: Object,
    },
};
</script>
