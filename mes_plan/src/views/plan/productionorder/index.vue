<template lang="pug">
    ebrain-main.productionorder
        template(#leftColumn)
            ebrain-frame(title="生产订单")
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
        ebrain-frame(
            :title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                    //- button(
                    //-     @click="ascending"
                    //-     :disabled="!currentRowKey")
                    //-     i.iconfont.iconstatus-edit
                    //-     |升序
                    //- button(
                    //-     @click="descending"
                    //-     :disabled="!currentRowKey")
                    //-     i.iconfont.iconstatus-edit
                    //-     |降序
                    //- button(
                    //-     @click="overhead"
                    //-     :disabled="!currentRowKey")
                    //-     i.iconfont.iconstatus-edit
                    //-     |置顶
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editView"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm"
            :disabled="formDisabled")
            ebrain-frame(
                title="物料生产信息")
            el-form.clearfix(label-width="110px")
                el-row
                    el-col(:span="12")
                        el-form-item(label="物料编号" prop="materialCode")
                            el-input.block(v-model="materialCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="物料名称" prop="materialName")
                            el-input.block(v-model="materialName" disabled)
            el-form.clearfix(label-width="60px")
                .multi
                    el-form-item(label="长" prop="leng" label-width="110px")
                        el-input(v-model="leng" disabled)
                    el-form-item(label="宽" prop="width")
                        el-input(v-model="width" disabled)
                    el-form-item(label="高" prop="height")
                        el-input(v-model="height" disabled)
                    el-form-item(label="对角线" prop="diagonal")
                        el-input(v-model="diagonal" disabled)
                    el-form-item(label="厚度" prop="thickNess")
                        el-input.block(v-model="thickNess" disabled)
            el-form.clearfix(label-width="110px")
                el-row
                    el-col(:span="12")
                        el-form-item(label="产品工艺编号" prop="proProcessCode")
                            el-input.block(v-model="proProcessCode" disabled)
                    el-col(:span="12")
                        el-form-item(label="需生产数量" prop="needAmount")
                            el-input.block(v-model="needAmount" disabled)
                    el-col(:span="12")
                        el-form-item(label="生产中数量" prop="productionInQuantity")
                            el-input.block(v-model="productionInQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="已生产数量" prop="productionQuantity")
                            el-input.block(v-model="productionQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="待分配数量" prop="distributableQuantity")
                            el-input.block(v-model="distributableQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="已分配数量" prop="assignedQuantity")
                            el-input.block(v-model="assignedQuantity" disabled)
                    el-col(:span="12")
                        el-form-item(label="当前进度（%）" prop="progress")
                            el-input.block(v-model="progress" disabled)
</template>

<script>
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';

export default {
    name: 'index',
    data() {
        return {
            materialCode: '',
            materialName: '',
            leng: '',
            height: '',
            width: '',
            diagonal: '',
            thickNess: '',
            proProcessCode: '',
            needAmount: '',
            productionInQuantity: '',
            productionQuantity: '',
            distributableQuantity: '',
            assignedQuantity: '',
            progress: '',
            tableLoadingTop: false,
            submitLoading: false,
            tableData: [],
            treeData: [],
            treeProps: {
                label: 'processName',
            },
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '生产订单编号',
                prop: 'prodOrderCode',
                showOverflowTooltip: true,
            }, {
                label: '物料编号',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编号',
                prop: 'proProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '需生产数量',
                prop: 'needAmount',
                showOverflowTooltip: true,
            }, {
                label: '已分配数量',
                prop: 'assignedQuantity',
                showOverflowTooltip: true,
            }, {
                label: '可分配数量',
                prop: 'distributableQuantity',
                showOverflowTooltip: true,
            }, {
                label: '生产中数量',
                prop: 'productionInQuantity',
                showOverflowTooltip: true,
            }, {
                label: '已生产数量',
                prop: 'productionQuantity',
                showOverflowTooltip: true,
            }, {
                label: '当前进度(％)',
                prop: 'progress',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.documentStatus[cell];
                }
            }],
            dialogForm: [{
                label: '生产订单编号',
                prop: 'prodOrderCode',
                value: '',
                disabled: true,
            }, {
                label: '生产计划编号',
                prop: 'sourceCode',
                value: '',
                disabled: true,
            }, {
                label: '计划类型',
                prop: 'sourceType',
                value: '',
                disabled: true,
                type: 'select',
                option: dict.sourceType
            }, {
                label: '生产计划明细号',
                prop: 'sourceDeCode',
                value: '',
                disabled: true,
            }, {
                label: 'SAP销售编号',
                prop: 'docno',
                value: '',
                disabled: true,
            }, {
                label: '项目号',
                prop: 'projectCode',
                value: '',
                disabled: true,
            }, {
                label: '客户编号',
                prop: 'kunnr',
                value: '',
                disabled: true,
            }, {
                label: '客户名称',
                prop: 'name1',
                value: '',
                disabled: true,
            }, {
                label: '预计开始时间',
                prop: 'planStartTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        let startTime = value;
                        let endTime = this.dialogForm[8].value;
                        startTime = new Date(startTime).getTime();
                        endTime = new Date(endTime).getTime();
                        if (endTime < startTime) {
                            callback(new Error('计划结束时间应大于开始时间!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                disabled: true,
            }, {
                label: '预计结束时间',
                prop: 'planEndTime',
                value: '',
                type: 'datetime',
                rule: {
                    validator: (rule, value, callback) => {
                        let startTime = this.dialogForm[7].value;
                        let endTime = value;
                        startTime = new Date(startTime).getTime();
                        endTime = new Date(endTime).getTime();
                        if (endTime < startTime) {
                            callback(new Error('计划结束时间应大于开始时间!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                disabled: true,
            }, {
                label: '实际开始时间',
                prop: 'actualStartTime',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                label: '实际结束时间',
                prop: 'actualEndTime',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                label: '状态',
                prop: 'documentStatus',
                value: '',
                type: 'select',
                option: dict.documentStatus,
                disabled: true,
            }, {
                label: '预交货日',
                prop: 'dlvdt',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
                disabled: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialog: '',
            dialogVisible: false,
            formDisabled: false,
            treeSelection: '',
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '生产订单编号',
                prop: 'prodOrderCode',
                value: '',
            }],
            btnsTop: [{
                label: '指定结束',
                click: () => this.specifyTheEnd(),
                disabled: () => this.whetherSpecifyTheEnd,
                className: 'iconfont iconstatus-edit',
                permi: 'prodplan_prodorder_edit_end',
            }, {
                label: '编辑/查看',
                click: () => this.editView(),
                disabled: () => !this.currentRowKey,
                className: 'iconfont iconstatus-edit',
                permi: 'prodplan_prodorder_edit',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict
        }),
        whetherSpecifyTheEnd() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || item.documentStatus !== 0;
        },
    },
    watch: {
        treeSelection() {
            this.getData();
        },
    },
    created() {
        Promise.all([
            this.queryDict('product_type'),
            this.getTreeList(),
        ]).then(() => {
            this.getData();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 获取左边的列表
        reset() {
            this.searchForm.forEach(v => {
                v.value = '';
            });
        },
        search() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.currentPage = 1;
            this.getData();
        },
        getTreeList() {
            this.$http.get('/productionplan/ppprocess/getAll').then(res => {
                this.treeData = res.data;
            });
        },
        getData() {
            // debugger;
            this.tableLoadingTop = true;
            let conditionList = this.treeSelection
                ? [{
                    fieldName: 'processCode',
                    operation: 'EQ',
                    joinType: 'AND',
                    value: this.treeSelection,
                }] : [];
            this.$http.get('/productionplan/ppprodorder/getPagePriorityAscDesc', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: conditionList.concat(this.conditionList),
                },
            }).then(res => {
                this.tableLoadingTop = false;
                if (res.data && res.data.records && res.data.records.length) {
                    this.tableData = res.data.records;
                } else {
                    this.tableData = [];
                }
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        // 当树节点被点击
        treeChangeHandler(row, node) {
            this.treeSelection = row.processCode;
            this.processName = row.processName;
            this.addDisabled = true;
        },
        // 升序
        ascending() {
            this.$http.post(`/productionplan/ppprodorder/updatePriorityAsc`, null, {
                params: {
                    flag: 'ASC',
                    id: this.currentRowKey
                }
            }).then(() => {
                this.getData();
            });
        },
        // 降序
        descending() {
            this.$http.post(`/productionplan/ppprodorder/updatePriorityAsc`, null, {
                params: {
                    flag: 'DESC',
                    id: this.currentRowKey
                }
            }).then(() => {
                this.getData();
            });
        },
        // 置顶
        overhead() {
            this.$http.post(`/productionplan/ppprodorder/updateToTop/${this.currentRowKey}`).then(({ code }) => {
                if (code === 0) {
                    this.$message.success(`置顶成功!`);
                    this.getData();
                }
            });
        },
        // 指定结束
        specifyTheEnd() {
            this.$confirm('是否确认指定结束?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.post(`/productionplan/ppprodorder/updateOrderEnd/${this.currentRowKey}`).then(({ code }) => {
                    if (code === 0) {
                        this.$message.success(`指定结束!`);
                        this.getData();
                    }
                });
            });
        },
        // 编辑查看
        editView() {
            this.dialogVisible = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (item.documentStatus === 0 || item.documentStatus === 1) this.dialogForm[14].disabled = false;
            else this.dialogForm[14].disabled = true;
            this.dialogForm.forEach(v => {
                if (v.prop === 'documentStatus') v.value = String(item[v.prop]);
                else v.value = item[v.prop];
            });
            this.materialCode = item.materialCode;
            this.materialName = item.materialName;
            this.leng = item.leng;
            this.width = item.width;
            this.height = item.height;
            this.diagonal = item.diagonal;
            this.thickNess = item.thickNess;
            this.proProcessCode = item.proProcessCode;
            this.needAmount = item.needAmount;
            this.productionInQuantity = item.productionInQuantity;
            this.productionQuantity = item.productionQuantity;
            this.distributableQuantity = item.distributableQuantity;
            this.assignedQuantity = item.assignedQuantity;
            this.progress = item.progress;
        },
        submitForm() {
            const obj = {};
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            if (item.documentStatus === 0 || item.documentStatus === 1) {
                obj.id = this.currentRowKey;
                obj.remark = this.dialogForm[14].value;
                this.$http.put(`/productionplan/ppprodorder/updateById`, obj).then(() => {
                    this.dialogVisible = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            } else {
                this.dialogVisible = false;
            }
        }
    }
};
</script>

<style scoped lang="stylus">

.productionorder
    & >>> .el-dialog
        margin-top 4vh!important

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

.el-form-item
    display block

    & >>> .el-row
        margin-bottom -18px

    & >>> .el-date-editor
        width 100%

.block
    display block

.multi
    display flex

    &:before, &:after
        display table
        content ''

    & >>> .el-form-item

        &:first-child .el-form-item__content
            width calc(100% - 110px)!important

        & .el-form-item__content
            width calc(100% - 60px)!important

</style>
