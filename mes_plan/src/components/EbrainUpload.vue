<template lang="pug">
    .ebrain-upload
        el-upload(
            v-bind="newProp"
            :headers="headers"
            :show-file-list="listType==='picture-card'"
            :on-success="successHandler"
            :on-error="errorHandler"
            :on-change="onChangeHandler"
            :before-upload="thisBeforeUpload"
            :on-progress="onProgress"
            ref="upload")
            slot
            template(#trigger)
                slot(name="trigger")
        ul.ebrain-upload-filelist(v-if="listType!=='picture-card'&&(showFileList===true||showFileList===undefined)")
            li.ebrain-upload-filelist-item(v-for="file in list")
                i.el-icon-close(@click="listRemove(file)")
                i(
                    style="margin-right:5px;"
                    :class="fileIcon(file.name)")
                span(@click="downloadFile(file)") {{file.name}}
                .process(
                    v-if="file.status==='uploading'"
                    :style="{width:file.percentage+'%'}")
</template>

<script>
import mv from '@/main';
import * as _ from 'lodash';

export default {
    name: 'EbrainUpload',
    props: [
        'action',
        'showFileList',
        'onSuccess',
        'onError',
        'onExceed',
        'onChange',
        'onPreview',
        'onRemove',
        'data',
        'accept',
        'listType',
        'fileList',
        'limit',
        'name',
        'autoUpload',
        'beforeUpload',
        'beforeRemove',
        'multiple',
        'disabled',
        'drag',
        'successText',
    ],
    data() {
        return {
            headers: {
                Authorization: `Bearer ${window.sessionStorage.getItem('access_token')}`
            },
            list: [],
        };
    },
    computed: {
        newProp() {
            return _.omit(this.$props, ['showFileList', 'onSuccess', 'onError', 'onChange']);
        },
    },
    watch: {
        fileList(list) {
            this.list = list;
        }
    },
    mounted() {
        this.list = this.fileList;
    },
    methods: {
        successHandler(res, file, fileList) {
            const { msg, code } = res;
            if (code === 1) {
                mv.$alert(msg, {
                    type: 'error',
                });
            } else if (code === 0) {
                this.$message.success(this.successText || '上传成功，请点修改或保存。');
            }
            this.onSuccess && this.onSuccess(res, file, fileList);
        },
        errorHandler(res, file, fileList) {
            const { message } = res;
            const err = JSON.parse(message);
            this.$alert(err.msg, {
                type: 'error',
            });
            this.onError && this.onError(res, file, fileList);
        },
        thisBeforeUpload(file) {
            const ltSize = file.size / 1024 / 1024 < 100;
            const nameReg = new RegExp('[@|#|\$|%|*|&|~]', 'g');
            const nameError = nameReg.test(file.name);
            if (!ltSize) {
                this.$alert('文件大小不能超过 100MB!', {
                    type: 'error',
                });
                return false;
            } else if (nameError) {
                this.$alert('文件名不能有非法字符!', {
                    type: 'error',
                });
                return false;
            } else {
                if (this.beforeUpload) {
                    return this.beforeUpload(file);
                } else {
                    return true;
                }
            }
        },
        onProgress(event, file, fileList) {
            // console.log(event, file, fileList);
        },
        onChangeHandler(file, fileList) {
            this.list = fileList;
            this.onChange && this.onChange(file, fileList);
        },
        submit() {
            this.$refs.upload.submit();
        },
        clearFiles() {
            this.list = [];
            this.$refs.upload.clearFiles();
        },
        fileIcon(name) {
            if (!name) return;
            const suf = name.match(/(?<=\.).+/).toString();
            switch (suf) {
                case 'gif':
                case 'jpg':
                case 'png':
                    return 'iconfont iconfilepicture';
                case 'doc':
                case 'docx':
                    return 'iconfont iconword';
                case 'xls':
                case 'xlsx':
                    return 'iconfont iconexcel';
                case 'pdf':
                    return 'iconfont iconPDF';
                case 'zip':
                case 'rar':
                case '7zip':
                    return 'iconfont icondecompression-package';
                default:
                    return 'el-icon-document';
            }
        },
        downloadFile(file) {
            this.$http.get(file.url, {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = file.name;
                    $a.click();
                    $a.remove();
                }
            });
        },
        async listRemove(file) {
            await this.$refs.upload.handleRemove(file);
            const index = this.list.findIndex(v => _.isEqual(v, file));
            this.$delete(this.list, index);
        },
    }
};
</script>
<style lang="stylus" scoped>
.ebrain-upload
    div
        display inline-block

    & >>> .el-upload
        padding 0 10px
    &-filelist
        padding 0
        margin 5px 0
        &-item
            list-style none
            position relative
            padding 0 5px

            &:hover
                background #f9f9f9

                .el-icon-close
                    display inline-block

            .el-icon-close
                display none
                cursor pointer
                position absolute
                right 5px
                top calc(50% - 7px)

            span
                cursor pointer

                &:hover
                    color $color-blue

            .process
                position absolute
                height 1px
                background-color $color-blue
                bottom 0
                left 0

                &:before
                    content ''
                    //clip-path ellipse(50% 50% at 50% 50%)
                    position absolute
                    right 0
                    height 1px
                    width 3px
                    border-radius 50%
                    //background-color $color-blue
                    box-shadow 0 0 6px 2px $color-blue+50%
</style>
