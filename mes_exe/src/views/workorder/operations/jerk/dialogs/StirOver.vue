<template lang="pug">
    el-dialog(
        :visible.sync="dialogVisible"
        title="搅拌完成"
        :close-on-click-modal="false")
        ebrain-table(
            v-if="dialogVisible"
            :column="materialColumn"
            :data="materialData"
            row-key="id"
            @current-change="materialChange")
        el-form.dialogForm(
            :model="form"
            inline)
            el-row(:gutter="20")
                el-col(:span="24")
                    el-form-item(label="完成时间")
                        el-date-picker(
                            v-model="form.overTime"
                            type="datetime")
        template(#footer)
            el-button(
                type="primary"
                :disabled="!form.overTime"
                @click="submitForm") 完成
</template>

<script>
import { submitStirEnd, listInmaterial } from '@/utils/api';
import moment from 'moment/moment';
import { mapState } from 'vuex';

export default {
    name: 'RetreatMaterial',
    data() {
        return {
            dialogVisible: false,
            step: 0,
            form: {
                overTime: ''
            },
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
            }, {
                label: '搅拌开始时间',
                prop: 'stirTimeBegin',
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
                const startTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                this.form.overTime = startTime;
            } else {
                this.form.overTime = '';
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
            submitStirEnd(
                [this.workcenter.id],
                this.form.overTime,
                '1',
            ).then(({ code }) => {
                if (code === 0) {
                    this.dialogVisible = false;
                    this.$message.success(`搅拌完成成功`);
                }
            });
        },
    },
};
</script>
