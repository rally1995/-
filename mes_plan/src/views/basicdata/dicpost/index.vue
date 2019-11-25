<template lang="pug">
    ebrain-main.dicpost
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
// import dict from '@/utils/dict';

export default {
    name: 'index',
    data() {
        return {
            searchVisible: true,
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [{
                label: '岗位编号',
                prop: 'postCode',
                showOverflowTooltip: true,
            }, {
                label: '岗位名称',
                prop: 'postName',
                showOverflowTooltip: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                showOverflowTooltip: true,
            }, {
                label: '修改时间',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '岗位编号',
                prop: 'postCode',
                required: true,
                value: '',
            }, {
                label: '岗位名称',
                prop: 'postName',
                required: true,
                value: '',
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            searchForm: [{
                label: '岗位编码',
                prop: 'postCode',
                value: '',
            }, {
                label: '岗位名称',
                prop: 'postName',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicpost_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicpost_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicpost_dels',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            conditionList: [],
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
            this.$http.get('/basicdata/dicpost/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                // this.tableData = this.tableData.filter(item => item.delFlag !== '1');
                this.pageTotal = this.tableData.length;
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
                this.$http.delete('/basicdata/dicpost/removeByIds', {
                    data: [this.currentRowKey]
                }).then(() => {
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
                this.$http.post('/basicdata/dicpost/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/dicpost/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.dicpost
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
