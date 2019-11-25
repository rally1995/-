<template lang="pug">
    el-dialog(
        :close-on-click-modal="false"
        :visible.sync="dialogVisible")
        el-transfer.transfer(
            v-loading="loading"
            :titles="['可选设备信息', '已选设备信息']"
            v-model="value"
            :data="data"
            filterable
            :filter-method="filterHandler")
            .item(slot-scope="{option}")
                .item-span {{option.equipNum}}
                .item-span {{option.equipName}}
        template(#footer)
            el-button(@click="close") 取消
            el-button(type="primary" @click="submitDialog") 添加
</template>

<script>
export default {
    name: 'meters',
    data() {
        return {
            dialogVisible: false,
            data: [],
            value: [],
            loading: false,
        };
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.queryDeviceLedge();
            }
        },
    },
    methods: {
        open(value) {
            this.value = value || [];
            this.dialogVisible = true;
        },
        // 获取设备台账
        queryDeviceLedge() {
            this.loading = true;
            this.$http.get('/basicdata/devicetype/page', {
                params: {
                    current: 1,
                    size: 9999,
                    conditionList: [{
                        fieldName: 'equipType',
                        operation: 'EQ',
                        value: 'DEV007'  // 设备类型：DEV007 计量仪表
                    }]
                }
            }).then(res => {
                const { data } = res;
                this.data = data.records.map(v => ({
                    ...v,
                    key: v.id,
                })) || [];
                this.loading = false;
            });
        },
        // 隐藏弹窗
        close() {
            this.dialogVisible = false;
            this.data = [];
            this.value = [];
        },
        submitDialog() {
            const vals = this.value.map(v => this.data.find(j => j.key === v));
            this.$emit('dialog-submit', vals);
        },
        filterHandler(query, row) {
            return row.equipNum.indexOf(query) > -1
                || row.equipName.indexOf(query) > -1;
        }
    },
};
</script>

<style scoped lang="stylus">
    .transfer
        display flex

        & >>> .el-transfer-panel
            flex auto

        & >>> .el-transfer-panel__item
                margin-top 1px
                margin-right 0

        & >>> .el-transfer__buttons
            flex none
            display flex
            flex-flow column
            justify-content center

        .item
            border-width 1px 0 0 1px
            border-color #EBEEF5
            border-style solid
            box-sizing border-box
            display block

            &-span
                border-width 0 1px 1px 0
                border-color #EBEEF5
                border-style solid
                box-sizing border-box
                overflow hidden
                float left
                padding 0 10px
                text-overflow ellipsis

                &:first-child
                    width 60%

                &:last-child
                    width 40%

            &:after
                content ''
                display table
                clear both

            & >>> .el-checkbox:last-child
                margin-right 30px


</style>
