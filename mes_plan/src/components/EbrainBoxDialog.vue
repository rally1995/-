<template lang="pug">
    el-dialog.dialog(
        :close-on-click-modal="false"
        :visible.sync="visible"
        :fullscreen="fullScreen")
        template(#title)
            h3 {{title}}
            button.full(
                type="button"
                :class="['iconfont', fullScreen ? 'iconretract' : 'iconenlarge']"
                @click="fullScreen = !fullScreen")
        el-form(
            ref="form"
            inline
            label-width="110px"
            :model="model"
            :disabled="disabled"
            :rules="rules")
            el-row
                template(v-for="item in form")
                    el-col(
                        :span="item.formType === 'textarea' ? 24 : 12"
                        :key="item.prop")
                        el-form-item(
                            :label="item.label"
                            :prop="item.prop")
                            component(
                                v-bind="isComponent(item)"
                                v-model="model[item.prop]"
                                :disabled="isDisabled(item, model)")
                                el-option(
                                    v-if="item.option"
                                    v-for="(value, key) in item.option"
                                    :key="key"
                                    :label="value"
                                    :value="key")
                                template(#append v-if="item.formType==='table'")
                                    el-button(
                                        icon="el-icon-search"
                                        @click="tableFormClickHandler")
        template(#footer)
            el-button(@click="visible = false") 取消
            el-button(
                :loading="loading"
                type="primary"
                @click="dialogSubmit") 确定
</template>

<script>
export default {
    name: 'EbrainBoxDialog',
    props: {
        title: String,
        form: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            loading: false,
            visible: false,
            fullScreen: false,
            disabled: false,
            model: {},
            dialogSubmit: () => {},
        };
    },
    computed: {
        rules() {
            const newObj = {};
            this.form.forEach(v => {
                if (v.rule) {
                    newObj[v.prop] = v.rule;
                }
                if (typeof v.required === 'boolean') {
                    if (newObj[v.prop]) {
                        newObj[v.prop].push({
                            required: true,
                            message: `${v.label}必填`
                        });
                    } else {
                        newObj[v.prop] = [{
                            required: true,
                            message: `${v.label}必填`
                        }];
                    }
                }
            });
            return newObj;
        },
    },
    methods: {
        open(value = {}, dialogSubmit) {
            this.model = value;
            this.visible = true;
            this.dialogSubmit = () => {
                this.$refs.form.validate(async valid => {
                    if (valid) {
                        this.loading = true;
                        try {
                            await dialogSubmit(this.model);
                        } catch {}
                    } else {
                        return false;
                    }
                });
            };
        },
        close() {
            this.model = {};
            this.dialogSubmit = () => {};
            this.loading = false;
            this.visible = false;
        },
        isComponent(item) {
            if (item.option) {
                return { is: 'elSelect' };
            }
            switch (item.formType) {
                case 'textarea':
                    return { is: 'elInput', type: 'textarea', rows: 4, span: 24 };
                case 'datetime':
                    return { is: 'elDatePicker', type: 'datetime', valueFormat: 'yyyy-MM-dd HH:mm:ss' };
                case 'date':
                    return { is: 'elDatePicker', type: 'date', valueFormat: 'yyyy-MM-dd' };
                case 'time':
                    return { is: 'elTimePicker', valueFormat: 'HH:mm:ss' };
                default:
                    return { is: 'elInput' };
            }
        },
        isDisabled(item, model) {
            if (item.disabled) {
                if (item.disabled instanceof Function) {
                    return item.disabled(model);
                } else {
                    return item.disabled;
                }
            }
        },
        tableFormClickHandler() {
            this.$emit('tableFormClickHandler');
        },
    },
};
</script>

<style scoped lang="stylus">
    .full
        position absolute
        top 20px
        right 45px
        color #909399
        line-height 1
        font-size 16px
        border none
        cursor pointer
        outline none

        &:hover
            color #409eff

    h3
        font-size 18px
        margin-top -4px

    .dialog
        & >>> .el-form-item
            display block

            &__content
                width calc(100% - 110px)

                .el-select
                    display block

                .el-upload--picture-card
                    width 100px
                    height 100px
                    line-height 100px

        & >>> .el-row
            margin-bottom -18px

        & >>> .el-date-editor
            width 100%

        & >>> .frame
            background-color transparent
            border-radius inherit
            border none
            overflow inherit
            display block
</style>
