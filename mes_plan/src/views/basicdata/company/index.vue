<template lang="pug">
    ebrain-main.company
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
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
                    row-key="id"
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
</template>

<script>
export default {
    name: 'index',
    data() {
        return {
            searchVisible: true,
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [{
                label: '公司代码',
                prop: 'companyCode',
                showOverflowTooltip: true,
            }, {
                label: '公司名称',
                prop: 'companyName',
                showOverflowTooltip: true,
            }, {
                label: '公司英文名称',
                prop: 'companyEnName',
                showOverflowTooltip: true,
            }, {
                label: '公司简称',
                prop: 'shortName',
                showOverflowTooltip: true,
            }, {
                label: '法人',
                prop: 'companyLegalPerson',
                showOverflowTooltip: true,
            }, {
                label: '电话',
                prop: 'companyContactInformation',
                showOverflowTooltip: true,
            }, {
                label: '传真',
                prop: 'companyFax',
                showOverflowTooltip: true,
            }, {
                label: '税号',
                prop: 'companyUnifiedSocialCredit',
                showOverflowTooltip: true,
            }, {
                label: '注册地址',
                prop: 'companyAddress',
                showOverflowTooltip: true,
            }, {
                label: '营业地址',
                prop: 'businessAddress',
                showOverflowTooltip: true,
            }, {
                label: '送货地址',
                prop: 'receiveAddress',
                showOverflowTooltip: true,
            }, {
                label: '开户银行',
                prop: 'accountBank',
                showOverflowTooltip: true,
            }, {
                label: '银行账号',
                prop: 'account',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '公司代码',
                prop: 'companyCode',
                value: '',
                required: true,
            }, {
                label: '公司名称',
                prop: 'companyName',
                value: '',
                required: true,
            }, {
                label: '公司英文名称',
                prop: 'companyEnName',
                value: ''
            }, {
                label: '公司简称',
                prop: 'shortName',
                value: ''
            }, {
                label: '法人',
                prop: 'companyLegalPerson',
                value: ''
            }, {
                label: '电话',
                prop: 'companyContactInformation',
                value: ''
            }, {
                label: '传真',
                prop: 'companyFax',
                value: ''
            }, {
                label: '税号',
                prop: 'companyUnifiedSocialCredit',
                value: ''
            }, {
                label: '注册地址',
                prop: 'companyAddress',
                value: ''
            }, {
                label: '营业地址',
                prop: 'businessAddress',
                value: ''
            }, {
                label: '送货地址',
                prop: 'receiveAddress',
                value: ''
            }, {
                label: '开户银行',
                prop: 'accountBank',
                value: ''
            }, {
                label: '银行账号',
                prop: 'account',
                value: ''
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea'
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            searchForm: [{
                label: '公司代码',
                prop: 'companyCode',
                value: '',
            }, {
                label: '公司名称',
                prop: 'companyName',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_company_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_company_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_company_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
    },
    created() {
        this.getData();
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
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
        getData() {
            this.tableLoading = true;
            this.$http.get('/basicdata/company/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
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
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete(`/basicdata/company/${this.currentRowKey}`).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/company', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/company', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.company
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

</style>
