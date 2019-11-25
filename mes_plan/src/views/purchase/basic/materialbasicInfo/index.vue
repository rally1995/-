<template lang="pug">
    ebrain-main.basic
        template(#leftColumn)
            ebrain-frame(title="物料信息")
                template(#table)
                    el-scrollbar
                        el-tree(
                            ref="tree"
                            :expand-on-click-node="false"
                            highlight-current
                            :data="treeData"
                            :props="treeProps"
                            @current-change="treeChangeHandler"
                            default-expand-all)
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                //- ebrain-tools(
                //-     :add="newRow"
                //-     :edit="editRow"
                //-     :del="delRow"
                //-     :addDisabled="!addDisabled"
                //-     :editDisabled="editDisabled"
                //-     :delDisabled="deleteDisabled"
                //-     @changeCurrent="changeCurrent"
                //-     @changeSize='changeSize')
                //-     button(
                //-         @click="exportAll")
                //-         i.iconfont.iconstatus-Export_all
                //-         |全部导出
                //-     button(
                //-         @click="selectExport"
                //-         :disabled="deleteDisabled"
                //-         :class="{disabled: deleteDisabled}")
                //-         i.iconfont.iconstatus-export
                //-         |导出选中
                //-     button(@click="moduleDown")
                //-         i.iconfont.iconstatus-download
                //-         |下载模板
                //-     ebrain-upload.import(
                //-         action="/purchase/prmaterial/import"
                //-         :on-success="successFile"
                //-         :show-file-list="false")
                //-         button
                //-             i.iconfont.iconstatus-download
                //-             |导入
                //-     button.fr(
                //-         @click="searchVisible = !searchVisible")
                //-         i.iconfont.iconsearch
                //-         |搜索
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :tableLoading='tableLoading'
                    :page-sizes="[10, 20, 30, 40]"
                    @selection-change="handleSelectionChange"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
        ebrain-dialog(
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>
<script src="./script.js"></script>
<style lang="stylus" scoped>
.basic
    & >>> .fr
        float right

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
  .import
     display:inline-block;
</style>
