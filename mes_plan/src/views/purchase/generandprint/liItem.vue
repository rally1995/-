<template lang="pug">
    li(@dblclick="clickHandler")
        el-input(
            v-if="isVak"
            v-model="v"
            ref="quantitys"
            @blur="getQuantity"
            @keyup.enter.native="changeHandler")
        span(v-else) {{quantity.tagQuantity}}
</template>
<script>
export default {
    name: 'LiItem',
    props: {
        quantity: Object,
        index: Number,
    },
    data() {
        return {
            v: 0,
            isVak: false,
        };
    },
    methods: {
        clickHandler() {
            this.isVak = true;
            this.$nextTick(() => {
                this.$refs.quantitys.focus();
            });
        },
        getQuantity(v, index) {
            this.isVak = false;
            if (Number(this.v) < 0 || Number(this.v).toString() === 'NaN') {
                this.$message.error('请输入正确的值!');
                this.v = 0;
            }
            this.$emit('lossblur', this.v, this.index);
        },
        changeHandler(v, index) {
            this.isVak = false;
            if (Number(this.v) < 0 || Number(this.v).toString() === 'NaN') {
                this.$message.error('请输入正确的值!');
                this.v = 0;
            }
            this.$emit('change', this.v, this.index);
        }
    },
};
</script>

