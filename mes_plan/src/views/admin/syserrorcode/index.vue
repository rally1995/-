<template lang="pug">
    ebrain-main.syserrorcode
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
                    row-key="id"
                    :data="list"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRow")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#footer)
                el-button(@click="treeVisible = false") 取消
                el-button(type="primary" @click="permissionSubmit") 确定
</template>

<script>
export default {
    name: 'Syserrorcode',
    data() {
        return {
            searchVisible: true,
            searchCondition: {},
            submitLoading: false,
            tableLoading: false,
            list: [],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '异常编码',
                prop: 'code',
                showOverflowTooltip: true,
            }, {
                label: '异常信息',
                prop: 'message',
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
            dialogVisible: false,
            dialogForm: [{
                label: '异常编码',
                prop: 'code',
                required: true,
                value: '',
                maxLength: false
            }, {
                label: '异常信息',
                prop: 'message',
                required: true,
                value: '',
                maxLength: false
            }],
            currentRowKey: '',
            dialogType: '',
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            searchForm: [{
                label: '异常编码',
                prop: 'code',
                value: '',
            }, {
                label: '异常信息',
                prop: 'message',
                value: '',
            }],
            btns: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'admin_syserrorcode_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'admin_syserrorcode_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'admin_syserrorcode_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }]
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
            this.searchForm.forEach(v => {
                if (v.value) this.searchCondition[v.prop] = v.value;
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get('/admin/syserrorcode/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchCondition,
                },
            }).then(res => {
                this.tableLoading = false;
                this.list = res.data.records;
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
            const item = this.list.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否继续删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/admin/syserrorcode/' + this.currentRowKey).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.currentRowKey = '';
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
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
                this.$http.post('/admin/syserrorcode', obj).then(() => {
                    this.submitLoading = false;
                    this.dialogVisible = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/admin/syserrorcode', obj).then(() => {
                    this.submitLoading = false;
                    this.dialogVisible = false;
                    this.getData();
                    this.currentRowKey = '';
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.syserrorcode
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
