<template lang="pug">
    el-dialog.dialog(
        :close-on-click-modal="false"
        :visible.sync="v"
        :fullscreen="fullScreen"
        :top="top")
        template(#title)
            h3 {{title}}
            .tools
                a(@click="fullScreen = !fullScreen")
                    i.iconfont(:class="fullScreen ? 'iconretract' : 'iconenlarge'")
        slot(name="button")
        el-form.expand(
            :rules="rules"
            label-width="110px"
            inline
            ref="form"
            :model="modelForm"
            :class="{hide: expandVisible}"
            @submit.native.prevent="submitForm"
            :disabled="disabled")
            el-row
                template(v-for="item in form" v-if="typeof item.show === 'function' ? (item.show()!==false) : (item.show!==false)")
                    slot(v-if="item.slot" :name="item.slot" :value="item.value")
                    el-col(
                        :span="24"
                        :key="item.prop"
                        v-else-if="item.type === 'textarea' || item.type === 'datetimerange'")
                        el-form-item(
                            :label="item.label"
                            :required="item.required"
                            :prop="item.prop")
                            el-input(
                                v-if="item.type === 'textarea'"
                                type="textarea"
                                maxlength="120"
                                show-word-limit
                                :rows="5"
                                v-model="item.value"
                                :disabled="item.disabled")
                            el-date-picker.block(
                                v-if="item.type === 'datetimerange'"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                v-model="item.value"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :editable="false"
                                :disabled="item.disabled"
                                :picker-options="item.pickerOption"
                                @change="selectChangeHandler(item.change, item.value)")
                    el-col(
                        :span="12"
                        :key="item.prop"
                        v-else)
                        el-form-item(
                            :label="item.label"
                            :required="item.required"
                            :prop="item.prop")
                            el-input-number.block(
                                v-if="item.type === 'sort'"
                                v-model="item.value"
                                controls-position="right")
                            el-input.block(
                                v-if="item.type === 'input' || item.type === undefined"
                                v-model="item.value"
                                :readonly="item.readonly"
                                :disabled="item.disabled"
                                :placeholder="item.placeholder"
                                :maxlength="maxLengthComputed(item.maxLength)"
                                @change="selectChangeHandler(item.change, item.value)")
                            el-select(
                                v-if="item.type === 'select' || item.type === 'multiple'"
                                v-model="item.value"
                                :multiple="item.type === 'multiple'"
                                :disabled="item.disabled"
                                :readonly="item.readonly"
                                filterable
                                @change="selectChangeHandler(item.change, item.value)")
                                el-option(
                                    v-for="(op, opKey) in optionFormat(item.option)"
                                    :label="op"
                                    :value="opKey"
                                    :key="op+'_'+opKey")
                                    slot(:name="item.selectSlot" :label="op" :value="opKey")
                            el-date-picker.block(
                                v-if="item.type === 'datetime'"
                                type="datetime"
                                v-model="item.value"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :editable="false"
                                :disabled="item.disabled"
                                :picker-options="item.pickerOption"
                                @change="selectChangeHandler(item.change, item.value)")
                            el-time-picker.block(
                                v-if="item.type === 'time'"
                                type="time"
                                v-model="item.value"
                                value-format="HH:mm"
                                @change="selectChangeHandler(item.change, item.value)")
                            el-date-picker.block(
                                v-if="item.type === 'date'"
                                type="date"
                                v-model="item.value"
                                value-format="yyyy-MM-dd")
                            ebrain-select-tree(
                                v-if="item.type === 'selecttree'"
                                v-model="item.value"
                                :option="item.option"
                                :node-key="item.nodeKey"
                                :node-label="item.nodeLabel"
                                :disabled="item.disabled"
                                :readonly="item.readonly"
                                :hasSlots="Boolean(item.treeSlot)"
                                @change="selectChangeHandler(item.change, $event)")
                                    template(#default="{node, data}" v-if="item.treeSlot")
                                        slot(:node="node" :data="data" :name="item.treeSlot")
        template(#footer)
            el-button(@click="v = false" v-if="isCancel") 取消
            el-button(:loading='submitLoading' :disabled='isClick' type="primary" @click="submitForm" v-if="isShow") 确定
        slot
</template>

<script>
import EbrainSelectTree from '@/components/EbrainSelectTree';
// todo: 此组件要基于事件触发，不应该修改原始数据
export default {
    name: 'EbrainDialog',
    components: {
        EbrainSelectTree,
    },
    props: {
        title: String,
        isShow: {
            type: Boolean,
            default: () => true,
        },
        isClick: {
            type: Boolean,
            default: () => false,
        },
        isCancel: {
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
        form: {
            type: Array,
            default: () => [],
        },
        expandVisible: {
            type: Boolean,
            default: () => false,
        },
        disabled: Boolean,
        top: String,
    },
    data() {
        return {
            labelWidth: 80,
            fullScreen: false,
        };
    },
    computed: {
        v: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            },
        },
        modelForm() {
            let obj = {};
            this.form.forEach(v => {
                obj[v.prop] = v.value;
            });
            return obj;
        },
        rules() {
            let obj = {};
            this.form.forEach(v => {
                if (v.rule) obj[v.prop] = v.rule;
            });
            return obj;
        },
    },
    watch: {
        v(val) {
            if (!val) {
                this.form.forEach(v => {
                    switch (v.type) {
                        case 'multiple':
                            v.value = [];
                            break;
                        default:
                            v.value = '';
                    }
                });
                this.$refs.form.resetFields();
            }
        }
    },
    methods: {
        submitForm() {
            this.$refs.form.validate(res => {
                if (res) this.$emit('submit');
            });
        },
        optionFormat(option) {
            const isFun = typeof option === 'function';
            return isFun ? option() : option;
        },
        selectChangeHandler(event, value) {
            if (event && typeof event === 'function') event(value);
        },
        maxLengthComputed(len) {
            if (typeof len === 'boolean') {
                if (len) return true;
                else return 9999;
            } else if (typeof len === 'undefined') {
                return 20;
            } else if (typeof len === 'number') {
                return len;
            }
        },
    }
};
</script>

<style scoped lang="stylus">
.dialog
    & >>> .expand
        padding 14px 10px
        overflow hidden
        box-sizing border-box
        transition-duration .2s
        height auto

        &.hide
            padding-top 0
            padding-bottom 0
            height 0
    & >>> .el-form-item
        display block

        &__content
            width calc(100% - 110px)
            font-size 0

            .el-select
                display block

            .el-upload--picture-card
                width 100px
                height 100px
                line-height 100px

            .el-input__inner
                height 28px
                line-height 28px

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

.block
    display block

.tools
    position absolute
    right 45px
    top 20px
    a
        color #909399
        line-height 1
        font-size 16px

        &:hover
            color #409eff
</style>
