<template lang="pug">
    ebrain-dialog.dialog(
        :isShow="false"
        :isCancel="false"
        :visible.sync="v"
        title="导出")
        el-form(label-width="90px")
            el-row(:gutter="10")
                el-form-item(label="文件名")
                    el-col(:span="18")
                        el-input(:value="filename" @input="$emit('change', $event)")
                    el-col(:span="6")
                        el-select(v-model="fileFormat")
                            el-option(v-for="item in acceptFile" :value="item" :key="item")
                el-form-item(label="数据设定")
                    el-col(:span="24")
                        el-radio-group(v-model="dataSetting")
                            el-radio(:label="0") 全部
                            el-radio(:label="1") 选中数据
                            el-radio(:label="2") 当前页
        template(#isfooter)
            el-button(@click="v=false") 取消
            el-button(type="primary" @click="submitHandler") 导出
</template>

<script>
import EbrainDialog from './EbrainDialog';

export default {
    name: 'EbrainDialogImport',
    components: {
        EbrainDialog,
    },
    model: {
        prop: 'filename',
        event: 'change',
    },
    props: {
        visible: {
            type: Boolean,
            default: () => false,
        },
        filename: String,
        params: [String, Array, Object],
        beforeExport: Function,
        exportUrl: String,
        accept: String,
        query: [String, Array, Object]
    },
    data() {
        return {
            dataSetting: 0,
            fileFormat: '',
        };
    },
    computed: {
        v: {
            get() {
                return this.visible;
            },
            set(v) {
                this.$emit('update:visible', v);
            },
        },
        acceptFile() {
            const arr = this.accept ? this.accept.split(',') : [];
            return arr.map(v => {
                const item = v.trim();
                return `.${item}`;
            });
        }
    },
    watch: {
        v(val) {
            if (val) {
                this.dataSetting = 0;
            }
        }
    },
    mounted() {
        this.fileFormat = this.acceptFile[0];
    },
    methods: {
        submitHandler() {
            const before = this.beforeExport && this.beforeExport(this.dataSetting);
            if (before !== false) {
                this.$nextTick(() => {
                    if (this.exportUrl) {
                        this.$http.post(this.exportUrl, this.params, {
                            responseType: 'blob',
                            params: this.query,
                        }).then(res => {
                            if (res) {
                                const blob = new Blob([res]);
                                const href = window.URL.createObjectURL(blob);
                                const $a = document.createElement('a');
                                $a.href = href;
                                $a.download = (this.filename || '导出的文件') + this.fileFormat;
                                $a.click();
                                $a.remove();
                                this.v = false;
                            }
                        });
                    }
                });
            }
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

    & >>> .el-form-item__content
        width: calc(100% - 90px)
</style>
