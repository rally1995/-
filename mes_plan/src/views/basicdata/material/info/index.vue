<template lang="pug">
    ebrain-main.material
        template(#leftColumn)
            ebrain-frame(title="物料类型")
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
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchQueryMaterial"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoading'
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @selection-change="selectionChangeHandler")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#expirationTime="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="保质期" prop="expirationTime")
                        el-input(style="cursor:pointer" v-model="dialogForm[16].value")
                            el-button(slot="append" style="cursor:default") 天
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            accept="image/*"
                            :show-file-list="false"
                            :before-upload="beforeAvatarUpload"
                            action="/basicdata/dicbasicmaterial/upload"
                            :on-preview="uploadPreview"
                            :on-success="uploadSuccessHandler"
                            :on-remove="removeChangeHandler")
                            .image
                                img(:src="photo" v-if="photo")
                                i.el-icon-plus(v-else)
            template(#materialType="{label,value}")
                span.fl {{label}}
                span.fr {{value}}
        el-dialog(:visible.sync="dialogVisibleSon")
            template
                div.container
                    img(ref= "img")
                el-button(type="primary" ref="downfile" @click="downloadFile").footer 下载附件
</template>

<script src="./script.js"></script>
<style lang="stylus" scoped>
.upload
    & >>> .el-upload-list__item
        width 100px
        height 100px
.upload-file
    display inline-block
.container
    width 600px
    height 400px
    border-radius 10px
    margin 0 auto
    overflow hidden
    padding 0px
    img
        display block
        height 100%
        max-width 100%
        margin 0 auto
    .footer
        display block
        margin 20px auto

.material
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

.fr
    float right
.fl
    float left

.image
    width 98px
    height 98px
    display block
    border 1px dashed #d9d9d9
    border-radius 6px
    cursor pointer
    position relative
    overflow hidden

    .el-icon-plus
        font-size 24px
        margin-top 35px

</style>
