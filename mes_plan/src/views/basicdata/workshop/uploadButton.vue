<template lang="pug">
    ebrain-upload.upload(
        :show-file-list="false"
        accept="image/*"
        action="/basicdata/equipmentscrapped/upload"
        :on-success="uploadChangeHandler"
        list-type="text"
        :on-preview="previewChangeHandler"
        :before-upload="beforeHandler")
        el-button(
            :loading="uploadLoading"
            type="primary") 上传附件
</template>

<script>
export default {
    name: 'uploadButton',
    props: [
        'rowKey',
    ],
    data() {
        return {
            uploadLoading: false,
        };
    },
    methods: {
        uploadChangeHandler(response, file) {
            const url = file.response
                && file.response.data
                && `/basicdata/equipmentscrapped/getfile/${file.response.data.bucketName}-${file.response.data.fileName}`;
            const name = file.name;
            let obj = {};
            obj.id = this.rowKey;
            obj.fileAddress = url;
            obj.fileName = name;
            this.uploadLoading = true;
            this.$http.put('/basicdata/basicsop/updateById', obj).then(() => {
                this.$emit('finish');
                this.$message({
                    message: '上传成功!',
                    type: 'success'
                });
                this.uploadLoading = false;
            }).catch(() => {
                this.uploadLoading = false;
            });
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
        },
        beforeHandler(file) {
            this.uploadLoading = true;
            let isJPG = /^image\//.test(file.type);
            if (!isJPG) {
                this.$message.error('只能上传图片！');
                this.uploadLoading = false;
            }
            return isJPG;
        },
    }
};
</script>

<style scoped lang="stylus">

</style>
