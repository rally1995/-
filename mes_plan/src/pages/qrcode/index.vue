<template lang="pug">
    div
        el-container(v-for="(v,index) in qrObj" :key="index")
            el-header
                h1
                    img(src='@/assets/sylogo.svg' height="70px" width="240px")
                h3 物料代码/Part No: {{v.materialCode}}
            .content
                el-main
                    ul
                        li 物料名称/NAME： {{ v.materialName }}
                        li 生产日期/MFG DATA： {{ v.productionTime }}
                        li 供应商编码/VendorID：{{v.supplierCode }}
                        li 批次号/LOT：{{ v.ntLot }}
                        li
                            div 净重/N.W：{{ v.netWeight }}
                            div 毛重/G.W: {{v.grossWeight}}
                        li 标签ID: {{v.tagId}}
                        li
                            div 包装数量/N.B：{{ v.actualQuantity }}
                            div 单位/UNIT： {{v.meins2}}
                el-aside
                    div.cimg
                        canvas(ref="canvas")
</template>
<script>
import QRCode from 'qrcode';
export default {
    name: 'qrCode',
    data() {
        return {
            qrObj: [],
            ty: {
                name: '1',
            }
        };
    },
    mounted() {
        this.getCanvans();
    },
    methods: {
        getCanvans() {
            this.qrObj = JSON.parse(this.$route.query.qrData);
            this.$nextTick(() => {
                let { canvas } = this.$refs;
                QRCode.toCanvas(canvas, '123');
                // this.qrObj.forEach(v => {
                //     QRCode.toCanvas(canvas, v.tagId);
                // });
            });
        }
    }
};
</script>

<style lang="stylus" scoped>
    .el-container
        background-color #fff
        border 2px solid #1b1810
        font-size 20px
        .el-header
            display flex
            height 140px !important
            display flex
            align-items center
            padding-left 20px
            h1
                width 440px
                img
                    vertical-align middle
            h3
                flex 1

        .content
            display flex
            border-top 1px solid #6c6c6c
            .el-main
                flex 1
                padding 0
                ul
                    margin 0
                    padding 0
                    li
                        list-style none;
                        padding-left 20px
                        border-bottom 1px solid #6c6c6c
                        border-right 1px solid #6c6c6c
                        box-sizing: border-box
                        height 95px
                        display flex
                        align-items center
                        &:not(:first-child)
                            float left
                            width 50%
                        &:nth-last-child(-n+2)
                            border-bottom none
                        &:nth-last-child(1)
                            flex-direction column
                            align-items stretch
                        &:nth-last-child(3)
                            flex-direction column
                            align-items stretch
                        div
                            line-height 46px
            .el-aside
                width 280px !important
                height 380px
                .cimg
                    width 200px
                    height 100%
                    margin 0 auto
                    line-height 580px
</style>

