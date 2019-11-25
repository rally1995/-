<template lang="pug">
    ebrain-main.roof
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                //- ebrain-tools(
                //-     :add="newRowParent"
                //-     :edit="editRowParent"
                //-     :del="delRowParent"
                //-     :editDisabled="editDisabledParent"
                //-     :delDisabled="delDisabledParent")
                //-     button(
                //-         :disabled="!currentRowKeyParent"
                //-         :class="{disabled: !currentRowKeyParent}"
                //-         @click="exportAll")
                //-         i.iconfont.iconstatus-Export_all
                //-         |列表导出
                //-     button(
                //-         :disabled="allSubmit"
                //-         :class="{disabled:allSubmit}"
                //-         @click="submitValit")
                //-         |提交检验
                //-     button.fr(
                //-         @click="searchVisible = !searchVisible")
                //-         i.iconfont.iconsearch
                //-         |搜索
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchData"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoadingTop"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    @row-dblclick="editRowParent"
                    @selection-change= "changeHanleder"
                    row-key="id"
                    highlight-current-row
                    @row-click="ProSend"
                    :current-row-key.sync="currentRowKeyParent")
                    template(#enclosure)
                        el-table-column(
                            prop="enclosure"
                            label="附件")
                                template(v-slot="{row}")
                                    a(v-for="(item, index) in row.enclosure" :href="item.url" target="_blank") {{item.fileName}}
        ebrain-frame.tabs
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="收料汇总" name="first")
                    el-tab-pane(label="收料明细" name="second")
            template(#tools)
                ebrain-tools(
                    :buttons="bthDownL"
                    v-show="activeName === 'first'")
                ebrain-tools(
                    :buttons="btnsDownR"
                    v-show="activeName === 'second'")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoadingDownL"
                    :isShow="false"
                    v-if="activeName === 'first'"
                    key="table1"
                    :data="tableDataSonL"
                    :column="tableColumnSonL"
                    row-key="id"
                    highlight-current-row
                    @selection-change="selectChangeDownL"
                    :current-row-key.sync="currentRowKeySonL")
                    template(#enclosure)
                        el-table-column(
                            prop="enclosure"
                            label="附件")
                                template(v-slot="{row}")
                                    a(:href="row.attachment" ) {{row.fileName}}
                ebrain-table(
                    :tableLoading="tableLoadingDownR"
                    :data="tableDataSonR"
                    :column="tableColumnSonR"
                    :isShow="false"
                    key="table2"
                    v-if="activeName === 'second'"
                    row-key="id"
                    @selection-change="selectChangeDownR"
                    :current-row-key.sync="currentRowKeySonR"
                    highlight-current-row)
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#search="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="采购订单号" :required="true" prop="ebeln")
                        el-input(style="cursor:pointer" :value="value")
                            el-button(slot="append" @click="showParentFrom()"  icon="iconfont iconsearch" :disabled="tableDataSonL.length !== 0")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="5"
                            multiple
                            action="/purchase/prcertificate/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler")
                            el-button(type="primary") 上传附件
        ebrain-dialog-table(
            height="50vh"
            :data="tableDataDialog"
            :column="tableColumnDialog"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleDialog"
            :pageSize="pageSizeSonDialog"
            :currentPage="currentPageDialog"
            :pageTotal="pageTotalSonDialog"
            @changeCurrent="changeCurrentDialog"
            @changeSize="changeSizeSonDialog"
            @select="selectionHandler"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            dialogTableSearch
            row-key="id"
            :current-row-key.sync="currentRowKeyDialog"
            @submit="submitFormSonDialog")
        ebrain-dialog-table(
            row-key="id"
            height="550px"
            :data="tableDataDialogDown"
            :column="tableColumnDialogDown"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleSonDown"
            :pageSize="pageSizeSonDown"
            :currentPage="currentPageSonDown"
            :pageTotal="pageTotalSonDowm"
            :current-row-key.sync="currentRowKeyPaly"
            :disabled="!currentRowKeyPaly"
            @search="searchFormPlay"
            @resetDialog="resetPlay"
            dialogTableSearch
            @changeCurrent="changeCurrentSonDown"
            @changeSize="changeSizeSonDown"
            @select="selectionHandlerDown"
            @submit="submitPurchasePlay")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleDetailed"
            :form.sync="dialogFormDetailed"
            @submit="submitFormDetailed")
            template(#detail="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="收货计划号" :required="true")
                        el-input(style="cursor:pointer" :value="value")
                            el-button(slot="append" @click="dialogSearchForm={};choosePlayCode()"  icon="iconfont iconsearch")
        //- ebrain-dialog-table(
        //-     title="数据导入情况分析"
        //-     height="550px"
        //-     :isShow="false"
        //-     :data="tableDataError"
        //-     :column="tableColumnError"
        //-     :show-summary="showSummary"
        //-     :visible.sync="dialogVisibleError"
        //-     @submit="dialogVisibleError=false")
        el-dialog(
            title="数据导入情况分析"
            height="50vh"
            :visible.sync="dialogVisibleError"
            @submit="dialogVisibleError=false")
            template(#error)
            div.error
                ul.cell
                    ul.title
                        li(v-for="col in title") {{col.name}}
                    ul.amount
                        li {{tableDataError.sum}}
                        li {{tableDataError.success}}
                        li {{tableDataError.fail}}
                    ul.message
                        li 导入失败的原因
                        li(v-for="vol in tableDataError.messages") {{vol.message}}

</template>

<script src="./script.js"></script>
<style scoped lang="stylus">
.roof
    & >>> .fr
        float right

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px
    // & >>>
    //     .el-form-item:last-child
    //         margin-left 35px !important
    //     .el-form-item__label
    //         width 110px
    &.hide
        padding-top 0
        padding-bottom 0
        height 0
.import
    display inline-block
.upload
        & >>> .el-upload-list__item
            width 100%
            height 100%
.tabs
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF
.disabled
    cursor not-allowed
    color lighten($color-dark, 50)
    background-color #f5f5f5
.error
    overflow  auto
    ul
        margin 0
        padding 0
        li
            list-style none
            line-height 35px
.cell
    border 1px solid #EBEEF5
    height 50vh
    .title
        display flex
        background #e3e1df
        li
            flex 1
            text-align center
    .amount
        display flex
        li
            flex 1
            text-align center
            border-bottom 1px solid #EBEEF5
            border-right 1px solid #EBEEF5
    .message
        li
            list-style none
            line-height 35px
            border-bottom 1px solid #EBEEF5
            padding-left 15px
</style>