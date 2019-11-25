<template lang="pug">
    div
        table-row(
            :column="tableColumn[pn].columnParams"
            :data="data")
</template>
<script>
import tableRow from '@/components/tableRow';
import tableColumn from '@/components/publicDialogs/tableColumn';
import { mapState } from 'vuex';
export default {
    components: {
        tableRow
    },
    data() {
        return {
            tableColumn,
            data: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        pn() {
            return this.$route.query.pn;
        },
        processTable() {
            let obj = [];
            for (let i in tableColumn) {
                if (Object.prototype.hasOwnProperty.call(tableColumn, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.pn)) obj = tableColumn[i];
                }
            }
            return obj;
        },
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
            const params = {
                size: 999,
            };
            let api = this.processTable.apiParams;
            params.conditionList = [{
                fieldName: 'orderId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.id,
            }];
            this.$http.get(api, {
                params
            }).then(res => {
                this.data = res.data.records;
            });
        }
    }
};
</script>

<style lang="stylus" scoped>

</style>
