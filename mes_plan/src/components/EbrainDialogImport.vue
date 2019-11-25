<template lang="pug">
    ebrain-dialog.dialog(
        :isShow="false"
        :isCancel="false"
        :visible.sync="v"
        title="导入")
        ol
            li(v-if="downloadPermission?permissions.includes(downloadPermission):true")
                p 请先下载模板，并按照模板填写后上传。
                el-button(
                    type="primary"
                    @click="downTemplate") 下载模版
            li(v-if="importPermission?permissions.includes(importPermission):true")
                p 导入文件
                ul
                    li 支持文件类型：{{acceptStr}}
                    li 导入字段不符合规则，整个任务不予以导入。
                ebrain-upload.upload(
                    ref="upload"
                    :auto-upload="false"
                    :accept="accept"
                    :limit="1"
                    :action="importUrl"
                    :on-success="successHandler"
                    success-text="导入成功")
                    template(#trigger)
                        el-button(type="primary") 选择文件
        template(#isfooter)
            el-button(@click="v=false") 取消
            el-button(type="primary" @click="submitHandler") 导入
</template>

<script>
import EbrainDialog from './EbrainDialog';
import { mapState } from 'vuex';

export default {
    name: 'EbrainDialogExport',
    components: {
        EbrainDialog,
    },
    props: {
        visible: {
            type: Boolean,
            default: () => false,
        },
        importSuccess: Function,
        accept: String,
        downloadUrl: String,
        importUrl: String,
        downloadFilename: String,
        downloadPermission: String,
        importPermission: String,
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapState(['permissions']),
        v: {
            get() {
                return this.visible;
            },
            set(v) {
                this.$emit('update:visible', v);
            },
        },
        acceptStr() {
            return this.accept && this.accept.replace(/\./g, '');
        }
    },
    watch: {
        visible(val) {
            if (!val) {
                this.$refs.upload.clearFiles();
            }
        }
    },
    methods: {
        downTemplate() {
            if (this.downloadUrl) {
                return this.$http.get(this.downloadUrl, {
                    responseType: 'blob',
                }).then(res => {
                    if (res) {
                        const blob = new Blob([res]);
                        const href = window.URL.createObjectURL(blob);
                        const $a = document.createElement('a');
                        $a.href = href;
                        $a.download = this.downloadFilename || '模版.xls';
                        $a.click();
                        $a.remove();
                    }
                });
            }
        },
        submitHandler() {
            this.$refs.upload.submit();
        },
        successHandler(res, file) {
            this.v = false;
            this.importSuccess && this.importSuccess(res, file);
        },
    }
};
</script>

<style scoped lang="stylus">
.dialog
    & >>> .el-dialog:not(.is-fullscreen)
        width 500px

    & >>> .el-dialog__body
        padding-top 15px
        padding-bottom 15px

    p
        margin-top 0
        margin-bottom 1em
    ol
        margin 0
        padding-left 20px

        & > li
            margin-bottom 1.5em

    ul
        margin-bottom 1em
        padding-left 0

        & > li
            list-style disc
</style>
