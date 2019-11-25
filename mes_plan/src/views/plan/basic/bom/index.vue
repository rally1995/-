<template lang="pug">
    ebrain-main.bom
        ebrain-frame(
            title="主件物料信息")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchParent"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataAll"
                    :current-row-key.sync="currentRowKeyParent")
        .twoSide
            ebrain-frame(
                title="子件信息")
                template(#table)
                    ebrain-table(
                        :tableLoading='tableLoadingDown'
                        :isShow='false'
                        :data="tableDataSon"
                        :column="tableColumnSon"
                        row-key="id"
                        :current-row-key.sync="currentRowKeySonLeft"
                        @row-click="rowClickHander"
                        highlight-current-row)
            ebrain-frame(
                :title="title")
                template(#tools)
                    ebrain-tools(:buttons="btnsBottom" v-if="!hfCode.routeCode")
                    .search(
                        :class="{hide:searchVisibleR}")
                        ebrain-search(
                            :form="searchFormSonRight"
                            @search="getDataSonRight"
                            @reset="resetSonRight")
                template(#table)
                    ebrain-table(
                        row-key="id"
                        :tableLoading='tableLoadingRight'
                        :isShow='false'
                        :key="Math.random()"
                        :data="tableDataSonRight"
                        :column="column"
                        :current-row-key.sync="currentRowKeySonRight"
                        @selection-change="selectionChange"
                        highlight-current-row)
        ebrain-dialog.dialog_form(
            :submitLoading="submitLoadingDialog"
            :visible.sync="dialogVisibleDialog"
            :form.sync="dialogFormDialog"
            @submit="submitFormDialog")
            template(#headline)
                h2 取替代件
            template(#materialCode)
                el-col(:span="12")
                    el-form-item(label="物料编码" prop="materialCode" required)
                        el-input(readonly=true v-model="dialogFormDialog[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterTableDetails")
            div.remark
                span 填写取替代件相对于1个被取替代件的数量
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :tableLoading="dialogTableLoading"
            :current-row-key.sync="currentRowKeyDialog"
            :height="550"
            :data="dialogData"
            :column="materialColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisible"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialogTable")
</template>

<script>
import dict from '@/utils/dict';
import _ from 'lodash';

export default {
    name: 'index',
    data() {
        return {
            column: [],
            hfCode: {
                routeCode: '',
                productProcessCode: '',
            },
            title: '替代子件',
            dialogSearchForm: {},
            row: {},
            currentRowKeySonRight: '',
            selection: [],
            currentRowKeySonLeft: '',
            objRowSub: {},
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            submitLoading: false,
            dialogVisible: false,
            dialogTableLoading: false,
            currentRowKeyDialog: '',
            dialogData: [],
            tableLoadingRight: false,
            tableDataSonRight: [],
            submitLoadingDialog: false,
            dialogVisibleDialog: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSon: [],
            materialColumn: [{
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '状态',
                prop: 'materialState',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.materialState[cell];
                }
            }],
            dialogFormDialog: [{
                label: '物料编码',
                prop: 'materialCode',
                value: '',
                slot: 'materialCode',
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '单位',
                prop: 'materialUnit',
                value: '',
                disabled: true,
            }, {
                label: '数量',
                prop: 'quantity',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        if (value <= 0 || value >= 10000000000000000) {
                            callback(new Error('数量值为0-10000000000000000之间'));
                        } else if (value === '') {
                            callback();
                        } else {
                            let reg =  /^\d+(\.?\d{0,4})$/;
                            if (!reg.test(value)) {
                                callback(new Error('数量最多四位小数'));
                            } else {
                                this.dialogFormDialog[3].value = Number(value).toFixed(4);
                                callback();
                            }
                        }
                    },
                    trigger: 'blur',
                },
            }],
            bomSubId: '',
            tableColumnSonRight: [{
                label: '产品工艺编码',
                prop: 'prodProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺主件物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '主件物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '工艺编码',
                prop: 'processCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺名称',
                prop: 'processName',
                showOverflowTooltip: true,
            }, {
                label: '工艺属性',
                prop: 'processType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.processType[cell];
                }
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '主件料号',
                prop: 'masterCode',
                showOverflowTooltip: true,
            }, {
                label: '料号名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: 'BOM单号',
                prop: 'bomCode',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编号',
                prop: 'productProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线编码',
                prop: 'routeCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线名称',
                prop: 'routeName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                }
            }, {
                label: '标准批量',
                prop: 'standardlotSize',
                showOverflowTooltip: true,
            }],
            tableColumnSon2: [{
                type: 'selection',
                width: 45,
                minWidth: 45,
            }, {
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return index + 1;
                },
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'materialUnit',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return index + 1;
                },
            }, {
                label: '子件料号',
                prop: 'masterCode',
                showOverflowTooltip: true,
            }, {
                label: '名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '组成用量',
                prop: 'composition',
                showOverflowTooltip: true,
            }, {
                label: '损耗率(%)',
                prop: 'lossRate',
                showOverflowTooltip: true,
            }, {
                label: '固定损耗',
                prop: 'fixedLoss',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            parentBomId: '',
            routeCode: '',
            searchVisible: true,
            searchVisibleR: true,
            searchForm: [{
                label: '主件料号',
                prop: 'masterCode',
                value: '',
            }, {
                label: '工艺路线名称',
                prop: 'routeName',
                value: '',
            }],
            searchFormSonRight: [{
                label: '物料编码',
                prop: 'materialCode',
                value: '',
            }],
            btnsTop: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch',
                permi: false,
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSonRight(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => !this.currentRowKeySonLeft,
                permi: 'productionplan_alternativematerial_add',
            }, {
                label: '修改',
                click: () => this.editRowSonRight(),
                className: 'iconfont iconstatus-edit',
                disabled: () => !this.currentRowKeySonLeft || this.selection.length !== 1,
                permi: 'productionplan_alternativematerial_edit',
            }, {
                label: '删除',
                click: () => this.delRowSonRight(),
                className: 'iconfont iconstatus-delete',
                disabled: () => !this.currentRowKeySonLeft || this.selection.length === 0,
                permi: 'productionplan_alternativematerial_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisibleR = !this.searchVisibleR },
                className: 'iconfont iconsearch fr',
                permi: false,
            }]
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
    },
    watch: {
        dialogVisibleDialog(val) {
            if (!val) {
                this.rowObj = {};
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.dialogSearchForm = {};
                // this.resetDialog({
                //     materialCode: '',
                //     materialName: '',
                // });
            }
        },
        row(val) {
            if (val) {
                this.hfCode.routeCode = val.routeCode;
                this.hfCode.productProcessCode = val.productProcessCode;
            }
        },
        currentRowKeyParent(val) {
            if (!val) {
                this.tableDataSonRight = [];
                this.tableDataSon = [];
                this.currentRowKeySonLeft = '';
            }
        }
    },
    created() {
        this.getDataParent();
        this.column = [...this.tableColumnSon2];
        // this.column = this.tableColumnSonRight;
    },
    methods: {
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchParent() {
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
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/productionplan/bom/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon() {
            this.currentRowKeySon = '';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.parentBomId = item.parentBomId;
            this.tableLoadingDown = true;
            this.$http.get('/productionplan/bom/bom/' + this.parentBomId).then(({ data }) => {
                this.tableLoadingDown = false;
                this.tableDataSon = data ? data : [];
                if (_.isEmpty(this.row.routeCode)) {
                    this.tableDataSonRight = [];
                }
            });
        },
        // 页码
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        // 页面数据数目
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        rowClickHander(row) {
            this.leftId = row.id;
            if (_.isEmpty(this.row.routeCode)) {
                this.getDataSonRight();
            }
        },
        getDataAll(row) {
            if (row) {
                this.row = row;
                this.getDataSon();
                this.currentRowKeySonLeft = '';
                if (!_.isEmpty(this.row.routeCode)) {
                    this.column = [...this.tableColumnSonRight];
                    this.title = '产品工艺';
                    this.getDataSonRight();
                } else {
                    this.column = [...this.tableColumnSon2];
                    this.title = '替代子件';
                }
                console.log(this.column);
            }

        },
        // 获取取替代件数据
        getDataSonRight() {
            this.tableLoadingRight = true;
            const params = {
                size: 9999,
                conditionList: []
            };
            let api = '';
            if (!_.isEmpty(this.row.routeCode)) {
                params.conditionList = [{
                    fieldName: 'routeCode',
                    operation: 'EQ',
                    value: this.row.routeCode,
                    joinType: 'AND',
                }];
                api = 'productionplan/procedure/page';
            } else {
                params.conditionList = [{
                    fieldName: 'bomSubId',
                    operation: 'EQ',
                    value: this.currentRowKeySonLeft,
                    joinType: 'AND',
                }];
                api = '/productionplan/alternativematerial/page';
            }
            this.searchFormSonRight.forEach(v => {
                if (v.value) {
                    params.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            // this.$http.get('/productionplan/alternativematerial/page', {
            //     params
            // }).then(res => {
            //     this.tableLoadingRight = false;
            //     this.tableDataSonRight = res.data.records;
            // });
            this.$http.get(api, {
                params
            }).then(res => {
                this.tableLoadingRight = false;
                this.tableDataSonRight = res.data.records;
            }).catch(() => {
                this.tableLoadingRight = false;
            });
        },
        // 获取物料的数据
        getMaterialInfo() {
            this.dialogTableLoading = true;
            const obj = {
                page: {
                    current: this.currentPage_1,
                    size: this.pageSize_1,
                },
                conditions: {
                    conditionList: [{
                        fieldName: 'materialState',
                        operation: 'EQ',
                        value: '1',
                        joinType: 'AND',
                    }]
                },
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj.conditions.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.post('/productionplan/alternativematerial/getBybomSubId', obj, {
                params: {
                    bomSubId: this.leftId,
                }
            }).then(res => {
                this.dialogTableLoading = false;
                this.dialogData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getMaterialInfo();
        },
        // 列表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        newRowSonRight() {
            this.dialogSonRight = 'new';
            this.dialogVisibleDialog = true;
        },
        editRowSonRight() {
            this.dialogSonRight = 'edit';
            this.dialogVisibleDialog = true;
            const item = this.selection[0];
            this.dialogFormDialog.forEach(v => {
                v.value = item[v.prop];
            });
        },
        delRowSonRight() {
            this.$confirm('你确定删除吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.dialogTableLoading = true;
                const ids = this.selection.map(v => v.id);
                this.$http.delete('/productionplan/alternativematerial/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.dialogTableLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.getDataSonRight();
                }).catch(() => {
                    this.dialogTableLoading = false;
                });
            });
        },
        enterTableDetails() {
            this.dialogVisible = true;
            this.currentPage_1 = 1;
            this.pageSize_1 = 20;
            this.getMaterialInfo();
        },
        currentChange(row) {
            this.rowObj = row;
        },
        changeCurrent_1(val) {
            this.currentPage_1 = val;
            this.getMaterialInfo();
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getMaterialInfo();
        },
        submitFormDialogTable() {
            this.dialogVisible = false;
            this.dialogFormDialog[0].value = this.rowObj.materialCode;
            this.dialogFormDialog[1].value = this.rowObj.materialName;
            this.dialogFormDialog[2].value = this.rowObj.stockUnit;
        },
        submitFormDialog() {
            let obj = {};
            this.dialogFormDialog.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.bomSubId = this.currentRowKeySonLeft;
            this.submitLoadingDialog = true;
            if (this.dialogSonRight === 'new') {
                this.$http.post('/productionplan/alternativematerial/save', obj).then(res => {
                    this.submitLoadingDialog = false;
                    this.dialogVisibleDialog = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success',
                    });
                    this.getDataSonRight();
                }).catch(() => {
                    this.submitLoadingDialog = false;
                });
            } else {
                obj.id = this.selection[0].id;
                this.$http.put('/productionplan/alternativematerial/updateById', obj).then(() => {
                    this.submitLoadingDialog = false;
                    this.dialogVisibleDialog = false;
                    this.getDataSonRight();
                    this.$message({
                        message: '修改成功!',
                        type: 'success',
                    });
                }).catch(() => {
                    this.submitLoadingDialog = false;
                });
            }
        },
        selectionChange(selection) {
            this.selection = selection;
        },
        resetSonRight() {
            this.searchFormSonRight.forEach(item => {
                item.value = '';
            });
        },
    }
};
</script>

<style scoped lang="stylus">
.bom
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
.twoSide
    height 50%
    width 100%
    display flex
    justify-content space-between
    flex-direction: row
    flex-wrap nowrap
    margin-top 5px
    .frame
        flex 1 !important
    // .frame:first-child
    //     .tableWrap
    //         height 90%
    //     .submitButton
    //         float right
    //         margin-top 10px
    // & > *
    //     width 100% // calc
    //     margin-left 5px
    //     margin-top 0

    //     &:first-child
    //         width 70%
    //         margin-left 0px
    //         heigth 90%
    .frame + .frame
        margin-top 0
.dialog_form
    h2
        font-size 15px
        line-height 46px
        position relative
        padding-left 12px
        user-select none

        &:before
            content ''
            height 18px
            width 3px
            background-color $color-blue
            position absolute
            left 0
            top 14px

    >>> .el-dialog__body
        .expand
            padding-bottom 0
            padding-top 0
    .remark
        padding-left 120px
        color #878787
        font-size 13px
</style>
