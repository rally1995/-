<template lang="pug">
    div.history
        h3.title 报工历史
        el-button.button(
            :disabled="checkDisabled"
            type="primary"
            @click="check") 查看
        ebrain-table(
            row-key="id"
            :isShow="true"
            :column="column"
            :data="data"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :pageTotal="pageTotal"
            @change-current="changeCurrent"
            @change-size="changeSize"
            @current-change="showMeTable"
            highlight-current-row)
        el-dialog(:visible.sync="dialogVisible")
            ebrain-box
                .wrap
                    h3.title 工单信息
                    div.contain
                        span 工单号: {{row.orderNo}}
                        span 工序: {{pn}}
                        span 工作中心: {{wn}}
                        span 成本中心: {{orderSelect.costCenterName}}
                    h3.title 产出明细
                    .div
                        ebrain-table.table(
                            :column="columnOutput"
                            :data="dataOutput"
                            :highlight-current-row="false")
                    h3.title 投入明细
                    .div
                        ebrain-table.table(
                            :column="columnInto"
                            :data="dataInto"
                            :highlight-current-row="false")
            template(#footer)
                el-button(
                    type="primary"
                    style="width:100px"
                    @click="cancel") 取消
</template>
<script>
import { mapState } from 'vuex';
export default {
    name: 'linePosition',
    data() {
        return {
            dialogVisible: false,
            column: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '工单号',
                prop: 'orderNo',
            }, {
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
            }, {
                label: '数量',
                prop: 'materialAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }],
            data: [],
            columnOutput: [{
                type: 'selection',
            }, {
                label: '工单号',
                prop: 'orderNo',
            }, {
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
            }, {
                label: '数量',
                prop: 'materialAmount',
            }],
            columnInto: [{
                type: 'selection',
            }, {
                label: '序号',
                type: 'index',
                width: 50
            }, {
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
            }, {
                label: '总数量',
                prop: 'materialAmount',
            }, {
                label: '投料数量',
                prop: 'feedAmount',
            }, {
                label: '报废数量',
                prop: 'scrapAmount',
            }, {
                label: '损耗数量',
                prop: 'lossAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }],
            prodBatchId: '',
            dataOutput: [],
            dataInto: [],
            row: {},
            currentPage: 1,
            pageSize: 20,
            pageTotal: 0,
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
            orderSelect: state => state.orderSelect,
        }),
        pn() {
            return this.$route.query.pn;
        },
        wn() {
            return this.$route.query.wn;
        },
        checkDisabled() {
            return this.row.id ? false : true;
        },
        wc() {
            return this.$route.query.wc;
        }
    },
    // watch: {
    //     workcenter(val) {
    //         if (val.id) {
    //             this.getData();
    //         }
    //     }
    // },
    mounted() {
        this.getData();
    },
    methods: {
        getData() {
            let obj = {};
            let params = {
                current: this.currentPage,
                size: this.pageSize,
            };
            obj.workcenterNo = this.wc;
            this.$http.post(`/productionexe/autoposting/listByOrder`, obj, {
                params
            }).then(({ data }) => {
                this.pageTotal = data.total;
                this.data = data.records;
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.row = {};
            this.getData();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        check() {
            this.dialogVisible = true;
            this.getDataOutput();
            this.getDataInto();
        },
        cancel() {
            this.dialogVisible = false;
        },
        showMeTable(row) {
            this.row = row;
        },
        getDataOutput() {
            this.$http.get(`/productionexe/autopostingdetail/listByAutoPostingId/${this.row.id}`, {
                params: {
                    actionType: 'S',
                }
            }).then(({ data }) => {
                this.dataOutput = data;
            });
        },
        getDataInto() {
            this.$http.get(`/productionexe/autopostingdetail/listByAutoPostingId/${this.row.id}`, {
                params: {
                    actionType: 'H',
                }
            }).then(({ data }) => {
                this.dataInto = data;
            });
        },
    },
};
</script>
<style scoped lang="stylus">
.history
    position absolute
    // height 100%
    top 0
    left 0
    bottom 0
    right 0
    flex-flow column nowrap
    border none

    .title
        margin 5px 10px
        padding 5px 10px

    .button
        margin 10px 0 15px 10px
        width 100px

.wrap
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow-y auto
    overflow-x hidden

    // & >>> .el-table
    //     height auto!important

    // & >>> .el-table__body-wrapper
    //     height auto!important

    .contain
        flex auto
        padding 0 16px
        height 60px
        border-bottom 1px solid #dedede
        box-sizing border-box

        & > * + *
            margin-left 48px
            line-height 60px

    .table
        margin-bottom 10px

    .title
        margin 5px 10px
        padding 5px 10px

    .submit
        position absolute
        bottom 0
        right 0
        margin 10px
        float right

    .div
        height calc((100% - 193px)/2)

.report >>> .box
    height 100%

</style>
