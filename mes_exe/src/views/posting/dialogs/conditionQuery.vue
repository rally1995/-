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
                    el-form-item(label="任务工单号")
                        el-input(v-model="form.taskNo")
                el-col(:span="12")
                    el-form-item(label="料号")
                        el-input(v-model="form.materialNo")
                el-col(:span="12")
                    el-form-item(label="物料名称")
                        el-input(v-model="form.materialName")
            el-row(:gutter="20")
                el-col(:span="12")
                    el-form-item(label="开始时间")
                        el-date-picker(v-model="form.planBeginTime" type="datetimerange" range-separator="到")
                el-col(:span="12")
                    el-form-item(label="结束时间")
                        el-date-picker(v-model="form.planCompleteTime" type="datetimerange" range-separator="到")
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
                taskNo: '',
                materialNo: '',
                materialName: '',
                planBeginTime: [],
                planCompleteTime: [],
            },
        };
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.form = {
                    taskNo: '',
                    materialNo: '',
                    materialName: '',
                    planBeginTime: [],
                    planCompleteTime: [],
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
