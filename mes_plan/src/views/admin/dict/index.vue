<template lang="pug">
    ebrain-main.dict
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
</template>

<script>
export default {
    name: 'dict',
    data() {
        return {
            searchVisible: true,
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
                label: '数据值',
                prop: 'value'
            }, {
                label: '标签名',
                prop: 'label',
                showOverflowTooltip: true,
            }, {
                label: '类型',
                prop: 'type',
                showOverflowTooltip: true,
            }, {
                label: '描述',
                prop: 'description',
                showOverflowTooltip: true,
            }, {
                label: '排序',
                prop: 'sort'
            }, {
                label: '备注信息',
                prop: 'remarks',
                showOverflowTooltip: true,
            }],
            dialogVisible: false,
            dialogForm: [{
                label: '数据值',
                prop: 'value',
                required: true,
                value: '',
                maxLength: false
            }, {
                label: '标签名',
                prop: 'label',
                required: true,
                value: '',
                maxLength: false
            }, {
                label: '类型',
                prop: 'type',
                value: '',
                required: true,
                maxLength: false
            }, {
                label: '排序',
                prop: 'sort',
                value: '',
                required: true,
                type: 'sort',
            }, {
                label: '描述',
                prop: 'description',
                type: 'textarea',
                value: '',
                required: true,
            }, {
                label: '备注信息',
                prop: 'remarks',
                type: 'textarea',
                value: '',
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            type: '',
            searchForm: [{
                label: '类型',
                prop: 'type',
                value: '',
            }, {
                label: '标签名',
                prop: 'label',
                value: '',
            }],
            btns: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'dict_details',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'sys_dict_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'sys_dict_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchObj: {},
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
            this.searchObj = {};
            this.searchForm.forEach(v => {
                if (v.value) this.searchObj[v.prop] = v.value;
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get('/admin/dict/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchObj,
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
            this.dialogForm.forEach(v => {
                if (v.prop === 'type') this.type = v.prop;
            });
            this.$confirm('是否继续删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete(`/admin/dict/${this.currentRowKey}/${this.type}`).then(() => {
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
                this.$http.post('/admin/dict', obj).then(() => {
                    this.submitLoading = false;
                    this.dialogVisible = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getData();
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/admin/dict', obj).then(() => {
                    this.submitLoading = false;
                    this.dialogVisible = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.dict
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
