<template lang="pug">
    .frame-toolbar
        h2 {{title}}
        el-form.firn(
            :rules="rules"
            label-width="110px"
            inline
            ref="form"
            :model="modelForm"
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
                                :placeholder="item.placeholder"
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
</template>

<script>
import EbrainSelectTree from '@/components/EbrainSelectTree';
export default {
    name: 'FrameForm',
    components: {
        EbrainSelectTree
    },
    props: {
        title: String,
        form: {
            type: Array,
            default: () => [],
        },
        disabled: Boolean,
    },
    computed: {
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
    methods: {
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

<style lang="stylus" scoped>
    .frame-toolbar
        padding 0 12px

        h2
            font-size 15px
            line-height 46px
            position relative
            padding-left 12px
            user-select none

            &:before
                content ''
                height 18px
                width 3px
                background-color $color-blue
                position absolute
                left 0
                top 14px
        // .firn
        //     padding-top 10px
</style>
