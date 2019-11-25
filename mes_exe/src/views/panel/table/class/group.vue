<template lang="pug">
    .div
        .height
            ebrain-table.table(
                ref="table1"
                height="100%"
                :loading="tableLoadingTop"
                :column="columnGroup"
                :data="tableDataGroup"
                @current-change="currentChange"
                highlight-current-row)
        .height
            span.personal 班组人员
            ebrain-table.table(
                ref="table2"
                height="100%"
                :loading="tableLoadingDown"
                :column="columnPersonal"
                :data="tableDataPersonal"
                :highlight-current-row="false")
</template>

<script>
export default {
    name: 'group',
    props: ['rowObj', 'arrList'],
    data() {
        return {
            row: {},
            tableLoadingTop: false,
            tableLoadingDown: false,
            tableDataGroup: [],
            columnGroup: [{
                label: '班组编号',
                prop: 'teamNumber',
            }, {
                label: '班组名称',
                prop: 'teamName',
            }, {
                label: '备注',
                prop: 'remark',
            }],
            tableDataPersonal: [],
            columnPersonal: [{
                label: '员工编号',
                prop: 'personnelNumber',
            }, {
                label: '员工名称',
                prop: 'personnelFullName',
            }, {
                label: '部门编码',
                prop: 'deptCode',
            }, {
                label: '部门名称',
                prop: 'deptName',
            }],
        };
    },
    mounted() {
        this.getDataParent();
    },
    methods: {
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/basicdata/basicteam/page', {
                params: {
                    size: 9999,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataGroup = res.data.records;
            });
        },
        currentChange(row) {
            this.row = row;
            this.$emit('update:row-obj', row);
            this.getDataSon();
        },
        getDataSon() {
            this.tableLoadingDown = true;
            this.$http.get('/basicdata/basicteammembers/page', {
                params: {
                    size: 9999,
                    conditionList: [{
                        fieldName: 'teamId',
                        operation: 'EQ',
                        value: this.row.id,
                        joinType: 'AND',
                    }],
                },
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataPersonal = res.data.records;
                this.$emit('update:arr-list', this.tableDataPersonal);
            });
        },
    },
};
</script>

<style scoped lang="stylus">
.table
    & >>> th
        background-color #f5f5f5
.height
    height 46%
    .personal
        height 60px
        line-height 60px
        font-size: 16px
        color: #303133;
.div
    height 100%
</style>
