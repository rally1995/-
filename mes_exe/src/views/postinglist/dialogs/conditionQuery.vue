<template lang="pug">
    el-dialog.conditionQuery(
        style="height:500px;top:12vh;"
        :visible.sync="dialogVisible"
        title="查询条件"
        :close-on-click-modal="false")
        el-form.dialogForm(
            :model="form"
            inline)
            el-row(:gutter="20")
                el-col(:span="12")
                    el-form-item(label="生产批次号")
                        el-input(v-model="form.prodBatchNo")
            el-row(:gutter="20")
                el-col(:gutter="20")
                    el-form-item(label="过账状态")
                        el-checkbox-group.checkbox(v-model="form.checkList")
                            el-checkbox(label="0") 待过账
                            el-checkbox(label="2") 已过账
                            el-checkbox(label="3") 已冲销
                            el-checkbox(label="1") 待发送
            //- el-row(:gutter="20")
            //-     el-col(:span="12")
            //-         el-form-item(label="过账时间")
            //-             el-date-picker(v-model="form.glueProportion" type="datetimerange" range-separator="到")
        template(#footer)
            el-button(
                type="primary"
                @click="submitForm") 查询
</template>

<script>

export default {
    name: 'Batch',
    data() {
        return {
            dialogVisible: false,
            form: {
                prodBatchNo: '',
                checkList: ['0', '2']
            },
        };
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.form = {
                    prodBatchNo: '',
                    checkList: ['0', '2'],
                };
            }
        },
    },
    methods: {
        open() {
            this.dialogVisible = true;
        },
        submitForm() {
            this.$emit('submit-dialog', this.form);
            this.dialogVisible = false;
        },
    },
};
</script>
<style lang="stylus" scoped>
.dialogForm

    & >>> .el-date-editor--datetimerange.el-input, .el-date-editor--datetimerange.el-input__inner
        width 100%

    & >>> .el-form-item__content
        line-height 0

    & >>> .checkbox
        position absolute
        top 10px
        left 0px

        & .el-checkbox__label
            font-size 14px

        & >>> .el-checkbox__inner
            height 20px
            width 20px

            &::after
                height 10px
                left 7px
                border-width 2px

.conditionQuery

    & >>> .el-dialog__header
        border-bottom 1px solid #dedede
        font-weight bold
        padding 20px 30px 10px

        &:before
            content ''
            height 18px
            width 3px
            background-color #2d8cf0
            position absolute
            left 20px
            top 22px
</style>