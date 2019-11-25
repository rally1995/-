<template lang="pug">
    div
        ebrain-box.bottom
            el-dropdown(
                placement="top"
                trigger="click"
                @command="changeComponent"
                @visible-change="proVisibleHandler")
                el-button(
                    ref="proInfo"
                    style="width:100%;height:100%")
                    i.iconfont.iconproduction_planning
                    |信息预览
                el-dropdown-menu.proInfoDrop(
                    :visible-arrow="false"
                    :style="{width:proInfoWidth}"
                    offset="5"
                    slot="dropdown")
                    el-dropdown-item.dropDownTop(command="linePosition") 线边仓信息
                    el-dropdown-item.dropDownTop(command="transportation") 运输信息
                    el-dropdown-item.dropDownTop 设备信息
                    //- el-dropdown-item.dropDownTop(
                    //-     v-if="processTable && processTable.columnParams && processTable.columnParams.length"
                    //-     command="parameter") 生产参数
                    el-dropdown-item.dropDownTop(command="SOP") SOP
                    el-dropdown-item.dropDownTop(command="flightInfo") 班次信息
                    el-dropdown-item.dropDownTop(
                        command="FQC"
                        v-if="isReport") FQC
                    el-dropdown-item.dropDownTop(command="special") 客户特殊需求
            el-button(@click="listOpen('inboard')")
                i.iconfont.iconproduction_planning
                |进板明细
            el-button(@click="listOpen('output')")
                i.iconfont.iconproduction_planning
                |产出明细
            el-button(@click="listOpen('inmaterial')")
                i.iconfont.iconproduction_planning
                |投料
            el-button(@click="listOpen('outboard')")
                i.iconfont.iconproduction_planning
                |出板明细
            el-dropdown(
                placement="top"
                trigger="click"
                @command="changeComponent"
                @visible-change="funVisibleHandler")
                el-button(
                    ref="functionMenu"
                    style="width:100%;height:100%")
                    i.iconfont.iconproduction_planning
                    |功能菜单
                el-dropdown-menu.proInfoDrop(
                    :visible-arrow="false"
                    :style="{width:functionMenuWidth}"
                    slot="dropdown")
                    el-dropdown-item.dropDownTop(command="building") 人工建单
                    //- el-dropdown-item.dropDownTop(command="posting") 人工过账
                    el-dropdown-item.dropDownTop(command="reportHistory") 报工历史
        detail-list(
            ref="detailList"
            :type="detailListType")
        building(ref="building")
</template>

<script>
import linePosition from './table/linePosition';
import transportation from './table/transportation';
import flightInfo from './table/flightInfo';
import DetailList from '@/components/feetList/DetailList';
import posting from './posting';
import maintain from './maintain';
import SOP from './table/SOP';
import FQC from './table/FQC';
import tableColumn from '@/components/publicDialogs/tableColumn';
import building from '@/components/jobpoolDialog/building';
import * as _ from 'lodash';

export default {
    name: 'bottomMenus',
    components: {
        linePosition,
        transportation,
        DetailList,
        flightInfo,
        maintain,
        posting,
        building,
        SOP,
        FQC,
    },
    data() {
        return {
            detailListType: 'inboard',
            proInfoWidth: 0,
            functionMenuWidth: 0,
        };
    },
    computed: {
        pn() {
            return this.$route.query.pn;
        },
        processTable() {
            let obj = [];
            for (let i in tableColumn) {
                if (Object.prototype.hasOwnProperty.call(tableColumn, i)) {
                    const pnReg = new RegExp(i);
                    if (pnReg.test(this.pn)) obj = tableColumn[i];
                }
            }
            return obj;
        },
        isReport() {
            const reg = new RegExp('修边', 'g');
            const isMatch = reg.test(this.pn);
            return isMatch;
        },
    },
    methods: {
        open(item) {
            this.$refs[item].open();
        },
        changeComponent(command) {
            if (command === 'posting') {
                this.$router.push({
                    path: `/panel/${command}`,
                    query: {
                        ...this.$route.query,
                    }
                });
            } else if (command === 'building') {
                this.open('building');
            } else if (_.isUndefined(command)) {
                this.$router.push({
                    path: `/panel/operating/linePosition`,
                    query: {
                        ...this.$route.query,
                    }
                });
            } else {
                this.$router.push({
                    path: `/panel/operating/${command}`,
                    query: {
                        ...this.$route.query,
                    }
                });
            }
        },
        listOpen(type) {
            this.detailListType = type;
            this.$refs.detailList.open();
        },
        proVisibleHandler(v) {
            if (v) {
                const styl = window.getComputedStyle(this.$refs.proInfo.$el);
                this.proInfoWidth = styl.width;
            }
        },
        funVisibleHandler(v) {
            if (v) {
                const styl = window.getComputedStyle(this.$refs.functionMenu.$el);
                this.functionMenuWidth = styl.width;
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.bottom
    margin-bottom -16px
    margin-left -16px
    margin-right -16px
    height 60px
    border none
    flex none
    display flex

    & >>> .el-dropdown .el-button
        background-color transparent
        color #fff
        border none
        border-radius 0

    & > *
          flex auto
          margin 0
          border-radius 0
          border none
          color #fff
          background-color #363e4e

          &:nth-child(2n+2)
              background-color #3d509f

.proInfoDrop
    margin 0 -5px
    border-radius 0
    border 1px solid #3d509f
    background-color #3d509f

.dropDownTop
    line-height 60px
    text-align center
    color #fff
    font-weight 500
    &:hover
        background #363e4e
</style>
