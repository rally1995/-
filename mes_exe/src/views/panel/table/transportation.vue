<template lang="pug">
    div.box
        h3.title 进板信息
        h3.status 进板流程: 申请 → 运输 → 完成
        ebrain-table.tables(
            :column="columnTop"
            :data="dataTop"
            :highlight-current-row="false")
        h3.title 出板信息
        h3.status 出板流程: 申请 → 运输 → 完成
        ebrain-table.tables(
            :column="columnBottom"
            :data="dataBottom"
            :highlight-current-row="false")
        el-button.submit(
            type="primary"
            style="width:100px;"
            @click="submitForm") 查看历史
</template>
<script>
import { mapState } from 'vuex';
import dict from '@/utils/dict';
export default {
    name: 'linePosition',
    data() {
        return {
            dict,
            columnTop: [{
                label: '运输单号',
                prop: 'transportNo',
            }, {
                label: '货物类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.goodsType[cell];
                },
            }, {
                label: '料号',
                prop: 'materialNo',
            }, {
                label: '数量',
                prop: 'planAmount',
            }, {
                label: '运输状态',
                prop: 'boardOutStats',
                formatter(row, column, cell) {
                    return dict.transportationStats[cell];
                },
            }],
            columnBottom: [{
                label: '运输单号',
                prop: 'transportNo',
            }, {
                label: '货物类型',
                prop: 'materialType',
                formatter(row, column, cell) {
                    return dict.goodsType[cell];
                },
            }, {
                label: '料号',
                prop: 'materialNo',
            }, {
                label: '数量',
                prop: 'realAmount',
            }, {
                label: '运输状态',
                prop: 'boardOutStats',
                formatter(row, column, cell) {
                    return dict.transportationStats[cell];
                },
            }],
            dataTop: [],
            dataBottom: []
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    watch: {
        workcenter(val) {
            if (val.id) {
                this.getDataTop();
                this.getDataBottom();
            }
        }
    },
    mounted() {
        if (this.workcenter.id) {
            this.getDataTop();
            this.getDataBottom();
        }
    },
    methods: {
        getDataTop() {
            this.$http.get(`/productionexe/boardio/list`, {
                params: {
                    boardType: '1',
                    orderId: this.workcenter.id,
                }
            }).then(({ data }) => {
                this.dataTop = data;
            });
        },
        getDataBottom() {
            this.$http.get(`/productionexe/boardio/list`, {
                params: {
                    boardType: '2',
                    orderId: this.workcenter.id,
                }
            }).then(({ data }) => {
                this.dataBottom = data;
            });
        },
        submitForm() {
            this.$router.push({
                path: `/panel/operating/transportationhistory`,
                query: {
                    ...this.$route.query,
                }
            });
        }
    },
};
</script>
<style scoped lang="stylus">
.box
    height 100%
    flex-flow column nowrap
    position absolute
    top 0
    bottom 0
    left 0
    right 0

    .tables
        height 100%

.title,.status
    margin 5px 10px
    padding 5px 10px

.submit
    margin 5px
    margin-left auto
</style>
