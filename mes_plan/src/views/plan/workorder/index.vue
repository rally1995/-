<template lang="pug">
    ebrain-main.workorder
        template(#leftColumn)
            ebrain-frame(title="生产工单")
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
        ebrain-frame.halfHeight(
            title="生产工单列表")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                    ebrain-box-table(
                        :loading="tableLoadingTop"
                        :pageSize="pageSize_top"
                        :pageCurrent="currentPage_top"
                        :pageTotal="pageTotal_top"
                        :data="tableDataParent"
                        :column="tableColumnParent"
                        :highlight-current-row="parentLight"
                        @page-change="changeCurrent_top"
                        @size-change="changeSize_top"
                        @current-change="CurrentChange"
                        row-key="id"
                        @selection-change="selectionParent")
        ebrain-frame.halfHeight(
            title="工单物料明细")
            // template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="分配工单任务" name="first")
                    el-tab-pane(label="物料BOM明细" name="second")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-box-table(
                    :loading="tableLoadingDownL"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    :pageSize="pageSize_left"
                    :pageCurrent="currentPage_left"
                    :pageTotal="pageTotal_left"
                    @row-dblclick="rowDblClickHandler"
                    @current-change="CurrentChangeSon"
                    @page-change="changeCurrent_left"
                    @size-change="changeSize_left"
                    row-key="id"
                    @selection-change="selection_change")
                // ebrain-table(
                    :tableLoading='tableLoadingDownR'
                    :isShow='false'
                    v-show="activeName === 'second'"
                    :data="tableDataBOM"
                    :column="tableColumnBOM"
                    row-key="id"
                    highlight-current-row)
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleAllotOrder"
            :form.sync="dialogFormAllotOrder"
            @submit="submitFormAllotOrder")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisbleParant"
            :form.sync="dialogFormWorkOrder"
            :isClick="editDisabledParent"
            @submit="submitWorkOrder")
        //- ebrain-dialog(
        //-     :submitLoading="submitLoading"
        //-     :visible.sync="dialogVisbleDetail"
        //-     :form.sync="dialogFormDatail")
        ebrain-dialog-table(
            height="50vh"
            row-key="id"
            :tableLoading="tabLoading"
            :data="tableDataWork"
            :column="tableColumnWork"
            :submitLoading="submitLoading"
            :pageSize="pageSize_form"
            :currentPage="currentPage_form"
            :pageTotal="pageTotal_form"
            @changeCurrent="changeCurrent_form"
            @changeSize="changeSize_form"
            :visible.sync="dialogVisibleWork"
            highlight-current-row
            @select="selectFormChange"
            :disabled="dialogFormSelect.length === 0"
            @submit="submitDialogFormWork"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            dialogTableSearch)
        el-dialog(
            :visible.sync="dialogTableVisible"
            :append-to-body ="true"
            :close-on-click-modal="false")
            template
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="工单详情", name="first")
                    el-tab-pane(label="BOM明细", name= "second")
            template
                ebrain-table.tabBOM(
                    :isShow = "false"
                    v-if="activeName === 'second'"
                    :data="BomTableData"
                    :column="BOMDetailColumn"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyFormSon")
            template
                el-form(
                    v-if="activeName === 'first'"
                    label-width="110px"
                    inline
                    :model="detailForm"
                    )
                    el-row
                        el-col(:span="12")
                            el-form-item(label="物料编号")
                                el-input(v-model="detailForm.materialCode" disabled)
                        el-col(:span="12")
                            el-form-item(label="物料名称")
                                el-input(v-model="detailForm.materialName" disabled)
                        el-col(:span="12")
                            el-form-item(label="长")
                                el-input.unitNo(v-model="detailForm.leng" disabled)
                        el-col(:span="12")
                            el-form-item(label="宽")
                                el-input(v-model="detailForm.width" disabled)
                        el-col(:span="12")
                            el-form-item(label="高")
                                el-input(v-model="detailForm.height" disabled)
                        el-col(:span="12")
                            el-form-item(label="对角线")
                                el-input(v-model="detailForm.diagonal" disabled)
                        el-col(:span="12")
                            el-form-item(label="厚度")
                                el-input(v-model="detailForm.thickNess" disabled)
                        el-col(:span="12")
                            el-form-item(label="产品工艺编号")
                                el-input(v-model="detailForm.prodProcessCode" disabled)
                        el-col(:span="12")
                            el-form-item(label="需生产的数量")
                                el-input(v-model="detailForm.needAmount" disabled)
                        el-col(:span="12")
                            el-form-item(label="生产中的数量")
                                el-input(v-model="detailForm.productionInQuantity" disabled)
                        el-col(:span="12")
                            el-form-item(label="已生产的数量")
                                el-input(v-model="detailForm.productionQuantity" disabled)
                        el-col(:span="12")
                            el-form-item(label="当前进度(%)")
                                el-input(v-model="detailForm.progress" disabled)
</template>
<script src="./script.js"></script>
<style scoped lang='stylus'>
.tabBOM >>> .table
        height 500px

.workorder
    & >>> .fr
        float right
// .right
//     .frame
//         height 50%

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
