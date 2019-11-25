<template lang="pug">
    el-select(
        ref="select"
        popper-class="tree"
        v-model="value"
        :disabled="disabled")
        el-option(
            :value="value"
            :label="label")
            el-tree.treenode(
                :data="option"
                :node-key="nodeKey"
                :props="{label:nodeLabel}"
                :expand-on-click-node="false"
                @node-click="treeClickHandler")
                template(#default="{node, data}" v-if="hasSlots")
                    slot(:node="node" :data="data")
</template>

<script>
export default {
    name: 'EbrainSelectTree',
    model: {
        prop: 'value',
        event: 'update',
    },
    props: {
        value: String,
        option: Array,
        nodeKey: {
            type: String,
            default: () => 'id',
        },
        nodeLabel: {
            type: String,
            default: () => 'label',
        },
        disabled: Boolean,
        hasSlots: {
            type: Boolean,
            default: () => false,
        },
    },
    computed: {
        label() {
            const enumer = (target) => {
                let str = '';
                for (let v of target) {
                    if (v[this.nodeKey] === this.value) {
                        str = v[this.nodeLabel];
                        // v.disabled = true;
                        break;
                    } else {
                        // v.disabled = true;
                        if (v.children && v.children.length) {
                            str = enumer(v.children);
                            if (str) break;
                        }
                    }
                }
                return str;
            };
            return enumer(this.option);
        },
    },
    methods: {
        treeClickHandler(data) {
            this.$emit('update', data[this.nodeKey]);
            this.$emit('change', data);
            this.$refs.select.blur();
        },
    }
};
</script>

<style scoped lang="stylus">
.tree
    .el-select-dropdown__item
        height auto
        padding 0

    .el-select-dropdown__item.selected
        font-weight 400

.treenode
    & >>> .el-tree-node__content
        height 34px
        line-height 34px

    // & >>> .el-tree-node[aria-disabled="true"]
    //     background-color #f3f3f3
    //     color #bfbfbf
    //     pointer-events none

    //     .el-tree-node__content
    //         pointer-events none
    //         cursor not-allowed
</style>
