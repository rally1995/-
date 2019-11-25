<template lang="pug">
    .box
        h2.box-title {{title}}
        .box-tool
            ebrain-box-tools(:buttons="buttons")
            .box-search(:class="{hide:searchVisible}")
                ebrain-box-search(
                    :form="column"
                    @search="tableSearch"
                    @reset="tableReset")
        .box-table
            ebrain-box-table(
                ref="table"
                v-bind="{column,loading}"
                :data="tableData"
                :page-current="page.current"
                :page-size="page.size"
                :page-total="page.total"
                @size-change="sizeChangerHandler"
                @current-change="currentChangeHandler"
                @row-dblclick="btnEdit"
                @row-click="rowClickHandler"
                @selection-change="selectionChangeHandler")
        ebrain-box-dialog(
            ref="dialog"
            :form="column"
            :title="dialogTitle")

</template>

<script>
import * as _ from 'lodash';
import EbrainBoxTable from '@/components/EbrainBoxTable';
import EbrainBoxTools from '@/components/EbrainBoxTools';
import EbrainBoxDialog from '@/components/EbrainBoxDialog';
import EbrainBoxSearch from '@/components/EbrainBoxSearch';

export default {
    name: 'EbrainBox',
    components: {
        EbrainBoxTable,
        EbrainBoxTools,
        EbrainBoxDialog,
        EbrainBoxSearch,
    },
    props: {
        title: String,
        column: Array,
        config: Object,
        interceptorsRequest: Function,
        interceptorsResponse: Function,
        multiple: {
            type: Boolean,
            default: () => false,
        },
    },
    data() {
        return {
            tableData: [],
            page: {
                current: 1,
                size: 20,
                total: 1,
            },
            loading: false,
            tablePage: {
                current: 1,
                size: 20,
            },
            tableSelection: [],
            buttons: [{
                text: '新增',
                icon: ['iconfont', 'iconstatus-Preserve-and-add'],
                disabled: false,
                click: this.btnNew,
            }, {
                text: '修改',
                icon: ['iconfont', 'iconstatus-edit'],
                disabled: false,
                click: this.btnEdit,
            }, {
                text: '删除',
                icon: ['iconfont', 'iconstatus-delete'],
                disabled: false,
                click: this.btnDel,
            }, {
                text: '搜索',
                icon: ['iconfont', 'iconsearch', 'right'],
                disabled: false,
                click: this.btnSearch,
            }],
            dialogTitle: '',
            isChangePage: false,
            searchForm: {},
            searchVisible: true,
        };
    },
    created() {
        this.queryC();
    },
    methods: {
        // 查询表格
        async queryC() {
            if (this.config && this.config.api && this.config.api.c) {
                this.loading = true;
                try {
                    let conditionList = [];
                    for (let i in this.searchForm) {
                        if (Object.prototype.hasOwnProperty.call(this.searchForm, i)) {
                            let item = {};
                            item.fieldName = i;
                            item.value = this.searchForm[i];
                            item.operation = 'LIKE';
                            conditionList.push(item);
                        }
                    }
                    const { data } = await this.$http.get(this.config.api.c, {
                        params: {
                            current: this.tablePage.current,
                            size: this.tablePage.size,
                            conditionList,
                        },
                    });
                    const { records, total, current, size } = data;
                    this.tableData = records && records.length ? records : [];
                    this.page.total = total;
                    this.page.current = current;
                    this.page.size = size;
                } catch {}
                this.loading = false;
            }
        },
        // 编辑表格
        async putG(row, message) {
            if (this.config && this.config.api && this.config.api.g) {
                try {
                    await this.$http.put(this.config.api.g, row);
                    await this.queryC();
                    this.$message({
                        message,
                        type: 'success'
                    });
                } catch {}
            }
        },

        // 新增表格
        async postZ(row, message) {
            if (this.config && this.config.api && this.config.api.z) {
                try {
                    await this.$http.post(this.config.api.z, row);
                    this.$message({
                        message,
                        type: 'success'
                    });
                } catch {}
            }
        },

        // 删除表格
        async deleteS(ids) {
            if (this.config && this.config.api && this.config.api.s) {
                try {
                    await this.$http.delete(this.config.api.s, {
                        data: ids
                    });
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    });
                } catch {}
            }
        },

        // 切换页码
        async currentChangeHandler(p) {
            this.tablePage.current = p;
            this.isChangePage = true;
            await this.queryC();
            this.changeSelection();
            this.isChangePage = false;
        },
        // 切换每页条数
        sizeChangerHandler(s) {
            this.tablePage.size = s;
            this.queryC();
        },
        rowDblclick(row) {
            this.btnEdit(row);
        },
        rowClickHandler(row, column, event) {
            this.$refs.table.toggleRowSelection(row);
        },
        // 切换选中状态
        changeSelection() {
            this.isChangePage = true;
            const cs = this.tableSelection[this.page.current - 1];
            if (cs) {
                cs.forEach(v => {
                    const item = this.tableData.find(j => j.id === v.id);
                    this.$refs.table.toggleRowSelection(item, true);
                });
            }
            this.isChangePage = false;
        },
        // 选择行
        selectionChangeHandler(selection) {
            if (!this.isChangePage) {
                this.tableSelection[this.page.current - 1] = selection;
                this.selection = _.flatten(this.tableSelection);
            }
        },
        btnNew() {
            this.dialogTitle = '新增';
            this.$refs.dialog.open({}, async form => {
                await this.postZ(form, '新增成功');
                this.queryC();
                this.$refs.dialog.close();
                this.dialogTitle = '';
            });
        },
        btnEdit(row) {
            let data = {};
            if (row instanceof Event) {
                if (!this.selection || this.selection.length !== 1) {
                    this.$alert('只能勾选一条信息');
                    return false;
                } else {
                    data = this.selection[0];
                }
            } else {
                data = row;
            }
            this.dialogTitle = '修改';
            this.$refs.dialog.open({ ...data }, async form => {
                await this.putG(form, '修改成功');
                this.queryC();
                this.$refs.dialog.close();
                this.dialogTitle = '';
            });
        },
        btnDel() {
            this.$confirm('确认删除?', '删除').then(async () => {
                const ids = this.selection.map(v => v.id);
                await this.deleteS(ids);
                this.queryC();
            });
        },
        btnSearch() {
            this.searchVisible = !this.searchVisible;
        },
        tableSearch(row) {
            this.searchForm = row;
            this.queryC();
        },
        tableReset() {
            this.searchForm = {};
            this.queryC();
        },
        dblClickHandler(row) {
            this.$refs.table.toggleRowSelection(row);
        },
    }
};
</script>

<style scoped lang="stylus">
    .box
        height 100%
        background #fff
        border-radius 4px
        overflow hidden
        border 1px solid #d1d1d1
        box-sizing border-box
        display flex
        flex-flow column nowrap

        & + &
            margin-top 8px

        &-tool,
        &-title
            flex none

        &-table
            flex auto
            padding 10px

        &-search
            padding 5px 10px
            background #f5f5f5
            overflow hidden
            box-sizing border-box
            transition-duration .2s

            &.hide
                padding-top 0
                padding-bottom 0
                height 0
</style>
