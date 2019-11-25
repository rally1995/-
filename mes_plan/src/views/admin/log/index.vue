<template lang="pug">
    ebrain-main.log
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
                    :data="list"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
</template>

<script>
export default {
    name: 'Log',
    data() {
        return {
            searchVisible: true,
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
                label: '类型',
                prop: 'type'
            }, {
                label: '标题',
                prop: 'title',
                showOverflowTooltip: true,
            }, {
                label: 'IP地址',
                prop: 'remoteAddr',
            }, {
                label: '请求方式',
                prop: 'method',
            }, {
                label: '客户端',
                prop: 'serviceId'
            }, {
                label: '请求时间',
                prop: 'time',
            }, {
                label: '创建时间',
                prop: 'createTime',
                minWidth: 110,
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            searchForm: [{
                label: '类型',
                prop: 'type',
                value: '',
            }],
            tableSearch: '',
            abc: [],
            searchCondition: {},
            btns: [{
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }]
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(v => {
                v.value = '';
            });
            this.searchCondition = {};
        },
        search() {
            this.searchForm.forEach(v => {
                if (v.value) this.searchCondition[v.prop] = v.value;
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            let params = {
                current: this.currentPage,
                size: this.pageSize,
                ...this.searchCondition,
            };
            this.tableLoading = true;
            this.$http.get('/admin/log/page', {
                params
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
        }
    },
};
</script>

<style scoped lang="stylus">
.log
    & >>> .fr
        float left

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
