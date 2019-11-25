<template lang="pug">
    div
        h3.title 运输历史
        ebrain-table(
            :column="column"
            :data="data"
            :highlight-current-row="false")
        el-button.submit(
            type="primary"
            style="width:100px;"
            @click="submitForm") 确认
</template>
<script>
import dict from '@/utils/dict';
import { mapState } from 'vuex';
export default {
    name: 'transportationhistory',
    data() {
        return {
            column: [{
                label: '运输单号',
                prop: 'transportNo',
            }, {
                label: '运输类型',
                prop: 'boardType',
                formatter(row, column, cell) {
                    return dict.boardType[cell];
                },
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
            data: [],
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
                this.getData();
            }
        }
    },
    mounted() {
        if (this.workcenter.id) {
            this.getData();
        }
    },
    methods: {
        getData() {
            this.$http.get(`/productionexe/boardio/list`, {
                params: {
                    boardType: '',
                    workcenterNo: this.workcenter.workcenterNo,
                }
            }).then(({ data }) => {
                this.data = data;
            });
        },
        submitForm() {
            this.$router.push({
                path: `/panel/operating/transportation`,
                query: {
                    ...this.$route.query,
                }
            });
        }
    },
};
</script>
<style scoped lang="stylus">
div
    height 100%
    flex-flow column nowrap
.title
    margin 5px 10px
    padding 5px 10px
.submit
    margin 5px
    margin-left auto
</style>
