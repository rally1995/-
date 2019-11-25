<template lang="pug">
    el-dialog(
        :visible.sync="dialogVisible"
        title="搅拌启动"
        :close-on-click-modal="false")
        ebrain-table(
            v-if="dialogVisible"
            :column="materialColumn"
            :data="materialData"
            row-key="id"
            @current-change="materialChange")
        template(#footer)
            el-button(
                type="primary"
                :disabled="JSON.stringify(selection) === '{}'"
                @click="submitForm") 启动
</template>

<script>
import { listInmaterial, submitStirStart } from '@/utils/api';
import { mapState } from 'vuex';
import moment from 'moment/moment';

export default {
    name: 'RetreatMaterial',
    data() {
        return {
            dialogVisible: false,
            materialColumn: [{
                label: '料号',
                prop: 'subMaterielCode',
            }, {
                label: '物料名称',
                prop: 'subMaterielName',
            }, {
                label: '批次',
                prop: 'sn',
            }, {
                label: '投料数量',
                prop: 'amount',
            }, {
                label: '批次投料开始时间',
                prop: 'feedTimeBegin',
            }, {
                label: '批次投料结束时间',
                prop: 'feedTimeEnd',
            }],
            materialData: [],
            selection: {},
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderNo() {
            return this.$route.query.order;
        },
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.selection = {};
                this.queryMaterial();
            }
        },
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        queryMaterial() {
            listInmaterial().then(({ data, code }) => {
                if (code === 0) {
                    this.materialData = data.records;
                }
            });
        },
        materialChange(selection) {
            this.selection = selection;
        },
        submitForm() {
            const startTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            submitStirStart(
                this.workcenter.id,
                startTime,
                this.selection.subMaterielCode,
                this.selection.amount,
            ).then(({ code }) => {
                if (code === 0) {
                    this.dialogVisible = false;
                    this.$message.success(`搅拌启动成功`);
                }
            });
        },
    },
};
</script>
