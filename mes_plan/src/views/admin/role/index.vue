<template lang="pug">
    ebrain-main.role
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btns")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoading'
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="roleId"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
        el-dialog(
            :visible.sync="treeVisible"
            title="权限配置（权限修改后需要重新登录!）")
            el-tree(
                v-loading="treeLoading"
                ref="tree"
                show-checkbox
                node-key="id"
                :data="treeData")
            template(#footer)
                el-button(@click="treeVisible = false") 取消
                el-button(type="primary" @click="permissionSubmit") 确定
</template>
<script src="./script.js"/>
<style scoped lang="stylus">
.role
    & >>> .fr
        float right

    & >>> .tools
        height 34px

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0

</style>
