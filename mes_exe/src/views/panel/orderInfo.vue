<template lang="pug">
    ebrain-box(style="height:150px;flex:none")
        .wrap
            .wrap-body
                h3.middle 计划工单号（{{workcenter.taskNo}}） 生产工单号（{{workcenter.orderNo}}）
                .wrap-body-contain.middle
                    span 料号：{{workcenter.materialNo}}
                    span 物料名称：{{workcenter.materialName}}
                    span 数量：{{workcenter.materialAmount}}{{workcenter.materialUnit}}
                    span 状态：{{dict['orderStatus'][workcenter.state]}}
            .wrap-buttons.middle
                el-button(
                    type="primary"
                    @click="getOrder")
                    i.iconfont.iconDetailed
                    |领工单
                el-button(
                    type="primary"
                    @click="openBom") BOM信息
                el-button(
                    v-if="!workcenter.state || (workcenter.state!=='1' && workcenter.state!=='4')"
                    type="primary"
                    @click="beginManaul")
                    i.iconfont.iconstart
                    |启动
                el-button(type="primary" @click="finish" v-if="workcenter.state==='1'")
                    i.iconfont.iconEnd
                    |完成
        bom(
            ref="bom"
            :datas="workcenter"
            :dict="dict"
            @update-data="queryOrderInfo")
        el-dialog.dialogBox(:visible.sync="dialogVisible")
            el-form
                h3 工单信息
                .dialog-msg
                    span 生产工单号：{{this.orderSelect.orderNo}}
                    span 料号：{{this.orderSelect.materialNo}}
                    span 开始时间: {{this.orderSelect.beginTime}}
                    span 明细编号: {{this.orderSelect.taskDetailNo}}
                    span 物料名称：{{this.orderSelect.materialName}}
                    span 数量：{{this.orderSelect.materialAmount}} {{this.orderSelect.materialUnit}}
                    span 结束时间: {{this.orderSelect.completeTime}}
                    span 状态：{{dict['orderStatus'][this.orderSelect.state]}}
            template(#footer)
                el-button(
                    type="primary"
                    @click="accept") 接单
                el-button(
                    type="primary"
                    @click="cut") 切单
                el-button(
                    type="primary"
                    @click="cancel") 取消
</template>

<script>
import dict from '@/utils/dict';
import bom from '@/components/publicDialogs/Bom';
import { mapState, mapMutations, mapActions } from 'vuex';
import { getjobpoolList } from '@/utils/api';
import * as _ from 'lodash';
export default {
    name: 'orderInfo',
    components: {
        bom,
    },
    data() {
        return {
            dialogVisible: false,
            dict,
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
            orderSelect: state => state.orderSelect,
        }),
        order() {
            return this.$route.query.order;
        },
        wc() {
            return this.$route.query.wc;
        },
    },
    created() {
        this.INI_STATE({
            module: 'workcenter',
            name: 'workcenter',
        });
        this.queryPool();
    },
    methods: {
        ...mapMutations(['INI_STATE', 'SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        open(item) {
            this.$refs[item].open();
        },
        async queryPool() {
            if (_.isEmpty(this.orderSelect)) {
                const { data } = await getjobpoolList(this.wc, '0,1,2');
                if (data && data.length) {
                    const datas = data.sort((a, b) => {
                        let x = a.state === '1' ? '3' : a.state;
                        let y = b.state === '1' ? '3' : b.state;
                        x = x && Number(x);
                        y = y && Number(y);
                        return y - x;
                    });
                    this.SET_STATE({
                        module: 'workcenter',
                        params: {
                            orderList: datas,
                            orderSelect: datas[0],
                        },
                    });
                    if (this.orderSelect.state === '1') {
                        this.queryOrderInfo(this.orderSelect.id);
                    } else if (this.orderSelect.state === '0') {
                        this.dialogVisible = true;
                    } else {
                        this.queryOrderInfo(this.orderSelect.id);
                    }
                } else {
                    this.$alert('此工作中心无工单!', {
                        type: 'error'
                    });
                }
            } else {
                this.queryOrderInfo(this.orderSelect.id);
            }
        },
        async accept() {
            await this.queryOrderInfo(this.orderSelect.id);
            this.dialogVisible = false;
        },
        async cut() {
            await this.$router.push({
                path: '/panel/jobpool',
                query: {
                    ...this.$route.query,
                },
            });
            this.dialogVisible = false;
        },
        cancel() {
            this.dialogVisible = false;
        },
        beginManaul() {
            if (!this.workcenter.state) {
                this.$alert('请先领工单', {
                    type: 'warning'
                });
            } else {
                this.open('bom');
            }
        },
        finish() {
            this.$router.push({
                path: '/panel/maintain',
                query: {
                    ...this.$route.query,
                },
            });
        },
        getOrder() {
            if (this.workcenter.state === '1') {
                this.$alert('请先结束当前工单', {
                    type: 'warning'
                });
            } else {
                getjobpoolList(this.wc, '0,1,2').then(({ data }) => {
                    const datas = data.sort((a, b) => {
                        let x = a.state === '1' ? '3' : a.state;
                        let y = b.state === '1' ? '3' : b.state;
                        x = x && Number(x);
                        y = y && Number(y);
                        return y - x;
                    });
                    this.SET_STATE({
                        module: 'workcenter',
                        params: {
                            orderList: datas,
                            orderSelect: datas[0],
                        },
                    });
                    this.$router.push({
                        path: '/panel/jobpool',
                        query: {
                            ...this.$route.query,
                        },
                    });
                });
            }
        },
        openBom() {
            if (!this.workcenter.state) {
                this.$alert('请先领工单', {
                    type: 'warning'
                });
            } else {
                this.open('bom');
            }
        }
    }
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

.dialog-msg
    display flex
    flex-wrap wrap
    flex 1
    margin-left 30px

    span
        display block
        width 25%
        padding-top 5px
        font-size 14px
        padding-top 10px

.dialogBox >>> .el-dialog
    height 300px
    margin-top 18%!important
</style>
