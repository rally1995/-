<template lang="pug">
    div
        div.left
            ebrain-box
                .wrap
                    .wrap-title.middle
                        h3
                            i.iconMaterial-directive.iconfont
                            |物料指令
                    .wrap-functions
                        dl
                            dt.middle 投入
                            dd
                                el-button(
                                    @click="board('IntoThePlate')")
                                    i.iconfont.icondata
                                    |进板
                                el-button(
                                    :disabled="workcenter.state==='4'"
                                    @click="openDialog('InputRecord')")
                                    i.iconfont.icondata
                                    |投入记录
                        dl
                            dt.middle 过程
                            dd
                                el-button(
                                    @click="openDialog('Records')"
                                    :disabled="!(processTable && processTable.columnRecords && processTable.columnRecords.length) || workcenter.state==='4'")
                                    i.iconfont.icondata
                                    |过程记录
                                el-button(
                                    @click="openDialog('Parameter')"
                                    :disabled="!(processTable && processTable.columnParams && processTable.columnParams.length) || workcenter.state==='4'")
                                    i.iconfont.icondata
                                    |生产参数
                        dl
                            dt.middle 产出
                            dd
                                el-button(
                                    :disabled="workcenter.state==='4'"
                                    @click="openDialog('batch')")
                                    i.iconfont.icondata
                                    |生产批次
                                el-button(
                                    @click="board('OutofThePlate')")
                                    i.iconfont.icondata
                                    |出板
            ebrain-box
                .wrap
                    .wrap-title.middle
                        h3
                            i.iconDevice-instructions.iconfont
                            |设备指令
                    .wrap-functions
                        dl
                            dt.middle 操作
                            dd
                                el-button(disabled)
                                    i.iconfont.icondata
                                    |启动
                                el-button(disabled)
                                    i.iconfont.icondata
                                    |暂停
                                el-button(disabled)
                                    i.iconfont.icondata
                                    |复位
                                el-button(disabled)
                                    i.iconfont.icondata
                                    |停止
        ebrain-box.right
            router-view.wrap
        component(
            :is="IntoThePlate"
            ref="IntoThePlate"
            :visible.sync="intoThePlateVisible"
            :key="IntoThePlate"
            @detail-list="listOpen('inboard')"
            @switch="IntoThePlate=$event")
        component(
            :is="OutofThePlate"
            ref="OutofThePlate"
            :visible.sync="outofThePlateVisible"
            :key="OutofThePlate"
            @detail-list="listOpen('inboard')"
            @switch="OutofThePlate=$event")
        //- outof-the-plate(ref="OutofThePlate")
        delivery(ref="delivery")
        scrap(ref="scrap" title="scrap")
        scrap(ref="wearTear" title="loss")
        batch(ref="batch")
        input-record(ref="InputRecord")
        records(ref="Records")
        parameter(ref="Parameter")
</template>

<script>
import IntoThePlateManual from '@/components/publicDialogs/IntoThePlateManual';
import IntoThePlateAuto from '@/components/publicDialogs/IntoThePlateAuto';
import OutofThePlateManual from '@/components/publicDialogs/OutofThePlateManual';
import OutofThePlateAuto from '@/components/publicDialogs/OutofThePlateAuto';
import Delivery from '@/components/publicDialogs/Delivery';
import Scrap from '@/components/publicDialogs/Scrap';
import Batch from '@/components/publicDialogs/Batch';
import Records from '@/components/publicDialogs/Records';
import Parameter from '@/components/publicDialogs/Parameter';
import InputRecord from '@/components/publicDialogs/InputRecord';
import tableColumn from '@/components/publicDialogs/tableColumn';
import { mapState } from 'vuex';
export default {
    name: 'workcenter',
    components: {
        IntoThePlateManual,
        IntoThePlateAuto,
        OutofThePlateManual,
        OutofThePlateAuto,
        Delivery,
        Scrap,
        Batch,
        InputRecord,
        Records,
        Parameter,
    },
    data() {
        return {
            IntoThePlate: 'IntoThePlateManual',
            intoThePlateVisible: false,
            OutofThePlate: 'OutofThePlateManual',
            outofThePlateVisible: false,
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
            orderSelect: state => state.orderSelect,
            orderList: state => state.orderList,
        }),
        wc() {
            return this.$route.query.wc;
        },
        pn() {
            return this.$route.query.pn;
        },
        processTable() {
            let obj = {};
            for (let i in tableColumn) {
                if (Object.prototype.hasOwnProperty.call(tableColumn, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.pn)) obj = tableColumn[i];
                }
            }
            return obj;
        },
    },
    methods: {
        open(item) {
            this.$refs[item].open();
        },
        board(type) {
            switch (type) {
                case 'IntoThePlate':
                    this.intoThePlateVisible = true;
                    break;
                case 'OutofThePlate':
                    this.outofThePlateVisible = true;
                    break;
                default:
                    break;
            }
        },
        openDialog(type) {
            if (!this.workcenter.state) {
                this.$alert('请先领工单', {
                    type: 'warning'
                });
            } else if (this.workcenter.state === '0') {
                this.$alert('请先启动工单生产', {
                    type: 'warning'
                });
            } else {
                switch (type) {
                    case 'InputRecord':
                        this.open('InputRecord');
                        break;
                    case 'Records':
                        this.open('Records');
                        break;
                    case 'batch':
                        this.open('batch');
                        break;
                    case 'Parameter':
                        this.$router.push({
                            path: `/panel/operating/production`,
                            query: {
                                ...this.$route.query,
                            }
                        });
                        break;
                    default:
                        break;
                }
            }
        },
    },
};
</script>

<style scoped lang="stylus">
.wrap
    display flex
    justify-content space-between
    height 100%

    &-h3
        padding 10px 16px
        font-size 18px
        font-weight bold
        border-bottom 1px solid #dedede
        box-sizing border-box
        flex none

    &-body
        flex auto
        display flex
        flex-flow column nowrap

        h3
            $font-title()
            border-bottom 1px solid $color-decoration
            margin 0 16px
            flex auto
            height 50%

        &-contain
            flex auto
            padding 0 16px
            height 50%

            & > * + *
                margin-left 48px

    &-buttons
        padding 16px

        & >>> .el-button
            height 100%
            max-height 10vh

        & >>> .el-dropdown
            height 100%
            max-height 10vh
            margin-left 10px

    &-title
        width 20%
        border-right 1px solid $color-decoration
        text-align center
        flex none

        h3
            text-align center
            vertical-align middle
            display inline-block
            $font-title()

            .iconfont
                color $color-blue
                font-size 35px
                display block
                margin-bottom 2px

    &-functions
        align-items stretch
        flex auto
        display flex
        flex-flow column nowrap

        dl
            flex auto
            margin 0
            display flex
            border-top 1px solid $color-decoration

            &:first-child
                border-top none

            dt
                text-align center
                width 16%
                flex none

            dd
                margin 0
                flex auto
                margin-left ml = -3%
                padding-bottom 2%
                display flex
                flex-flow row wrap
                align-content center

                & >>> .el-button
                    width 45%
                    margin-left ml * -1
                    margin-top 2%
                    height 50px
.left
    width 35%
    margin-right 8px
    display flex
    flex-flow column nowrap

    .box > .wrap
        position absolute
        top 0
        bottom 0
        right 0
        left 0

.right
    width 65%
    margin-left 8px

    & > .wrap
        position absolute
        top 0
        bottom 0
        right 0
        left 0
</style>
