<template lang="pug">
    el-dialog.dialog(
        :close-on-click-modal="false"
        :visible.sync="v"
        :show-close="false"
        :title="title"
        center)
        .content
            slot
        template(#footer)
            el-button(@click="v = false" v-if="isChancel") 取消
            el-button(:loading='submitLoading'  type="primary" @click="submitForm" v-if="isOk") 确定
            slot(name="footer2")
</template>

<script>
export default {
    name: 'EbrainTagDialog',
    props: {
        title: String,
        isChancel: {
            type: Boolean,
            default: () => true,
        },
        isOk: {
            type: Boolean,
            default: () => true,
        },
        submitLoading: {
            type: Boolean,
            default: () => false,
        },
        visible: {
            type: Boolean,
            default: () => false,
        },
    },
    computed: {
        v: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            },
        }
    },
    methods: {
        submitForm() {
            this.$emit('submit');
        }
    },
};
</script>

<style scoped lang="stylus">
     * >>> .el-dialog
        width 360px
    * >>> .el-dialog__body
        padding 10px 20px
    * >>> .el-dialog__header
       text-align left
       border-bottom: 1px solid #0094ff
       padding 0
       padding-top 20px
       margin: 0 20px
</style>
