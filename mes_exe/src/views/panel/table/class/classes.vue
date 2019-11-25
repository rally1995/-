<template lang="pug">
    ebrain-table(
        :loading="tableLoading"
        :column="columnClasses"
        :data="tableDataClasses"
        @current-change="currentChange"
        highlight-current-row)
</template>

<script>
import dict from '@/utils/dict';
export default {
    name: 'classes',
    props: ['rowObj'],
    data() {
        return {
            conditionList: [],
            tableLoading: false,
            tableDataClasses: [],
            columnClasses: [{
                label: '班次编号',
                prop: 'shiftNumber',
            }, {
                label: '班次名称',
                prop: 'shiftName',
                formatter(row, column, cell) {
                    return dict.shiftName[cell];
                },
            }, {
                label: '开始时间',
                prop: 'startingTime',
            }, {
                label: '结束时间',
                prop: 'endTime',
            }],
        };
    },
    mounted() {
        this.getData();
    },
    methods: {
        getData() {
            this.tableLoading = true;
            this.$http.get('/basicdata/bizbasicshiftinformation/page', {
                params: {
                    size: 9999,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableDataClasses = res.data.records;
            });
        },
        currentChange(row) {
            this.$emit('update:row-obj', row);
        }
    },
};
</script>

<style scoped lang="stylus">
.table
    & >>> th
        background-color #f5f5f5
</style>
