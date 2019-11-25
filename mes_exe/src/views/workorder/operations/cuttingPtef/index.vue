<template lang="pug">
    ebrain-main
        ebrain-box(style="height:18vh;flex:none")
            .wrap
                .wrap-body
                    h3.middle 工单信息（{{workcenter.orderNo}}）
                    .wrap-body-contain.middle
                        span 料号：{{workcenter.materialNo}}
                        span 物料名称：{{workcenter.materialName}}
                        span 数量：{{workcenter.materialAmount}}{{workcenter.materialUnit}}
                        span 状态：{{dict['orderStatus'][workcenter.state]}}
                .wrap-buttons.middle
                    el-button(
                        type="primary"
                        @click="open('bom')") BOM信息
                    el-dropdown(
                        trigger="click"
                        @command="handleCommand"
                        v-if="workcenter.state==='0'")
                        el-button(type="primary")
                            |启动
                            i.el-icon-arrow-down.el-icon--right
                        el-dropdown-menu(slot="dropdown")
                            el-dropdown-item.dropDown(command="beginManaul") 手动模式
                            el-dropdown-item.dropDown(command="beginAuto") 自动模式
                    el-button(type="primary" @click="finish" v-if="workcenter.state==='1'")
                        i.iconfont.iconEnd
                        |完成
        ebrain-box(v-if="workcenter.state!=='4'")
            .wrap
                .wrap-title.middle
                    h3
                        i.iconMaterial-directive.iconfont
                        |物料指令
                .wrap-functions
                    dl
                        dt.middle 投入
                        dd
                            el-button(@click="open('Parameter')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |参数设置
                            el-button(@click="open('IntoThePlate')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |进板
                            el-button(@click="open('delivery')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |投料
                            el-button(@click="open('scrap')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |报废
                            el-button(@click="open('wearTear')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |损耗
                    dl
                        dt.middle 产出
                        dd
                            el-button(@click="open('batch')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |生产批次
                            el-button(@click="open('Record')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |过程记录
                            el-button(@click="open('OutofThePlate')" :disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |出板
        ebrain-box(v-if="workcenter.state==='4'")
            h3.wrap-h3 出板明细
            .tableList
                ebrain-table(
                    :column="column"
                    :data="tableData"
                    :highlight-current-row="false")
        ebrain-box(v-if="workcenter.state!=='4'")
            .wrap
                .wrap-title.middle
                    h3
                        i.iconDevice-instructions.iconfont
                        |设备指令
                .wrap-functions
                    dl
                        dt.middle 操作
                        dd
                            el-button(:disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |启动
                            el-button(:disabled="workcenter.state!=='1'")
                                i.iconfont.icondata
                                |完成
        ebrain-box.bottom
            el-button(@click="listOpen('inboard')")
                i.iconfont.iconDetailed
                |进板
            el-button(@click="listOpen('outboard')")
                i.iconfont.iconDetailed
                |出板
            el-button(@click="listOpen('inmaterial')")
                i.iconfont.iconDetailed
                |投料
            el-button(@click="listOpen('usematerial')")
                i.iconfont.iconDetailed
                |耗料
            el-button(@click="listOpen('output')")
                i.iconfont.iconDetailed
                |产出
            //- el-button(@click="listOpen('inventory')")
            //-     i.iconfont.iconDetailed
            //-     |当前工作中心库存
        bom(
            ref="bom"
            :datas="workcenter"
            :dict="dict")
        into-the-plate(ref="IntoThePlate" @detail-list="listOpen('inboard')")
        outof-the-plate(ref="OutofThePlate")
        delivery(ref="delivery")
        scrap(ref="scrap" title="scrap")
        scrap(ref="wearTear" title="loss")
        batch(ref="batch")
        record(ref="Record")
        parameter(ref="Parameter")
        detail-list(ref="detailList" :type="detailListType")
</template>

<script src="./script.js"/>
<style scoped lang="stylus" src="./style.styl"/>
