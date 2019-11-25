<template lang="pug">
    universal(v-if="pageType==='workorder'")
    jobpool(
        v-else
        :data="jobpoolData"
        @pool-jump="jumpHandler")
</template>

<script>
// import jerk from './operations/jerk';
// import limina from './operations/limina';
// import coating from './operations/coating';
// import cuttingCopperFoil from './operations/cuttingCopperFoil';
// import combination from './operations/combination';
// import dispense from './operations/dispense';
// import cuttingPtef from './operations/cuttingPtef';
// import cuttingPp from './operations/cuttingPp';
// import manualFoldSystem from './operations/manualFoldSystem';
// import deburring from './operations/deburring';
import { mapActions } from 'vuex';
import { getjobpoolList } from '@/utils/api';
import jobpool from '@/views/jobpool';
import universal from './operations/universal';

export default {
    name: 'WorkOrder',
    components: {
        jobpool,
        universal,
    },
    data() {
        return {
            pageType: 'workorder',
            // opera: {
            //     '混胶': jerk,
            //     '层压': limina,
            //     '上胶': coating,
            //     '铜箔裁切': cuttingCopperFoil,
            //     '离线PTFE裁切': cuttingPtef,
            //     '离线PP裁切': cuttingPp,
            //     '手动组合': combination,
            //     '手动分发': dispense,
            //     '手动叠制': manualFoldSystem,
            //     '外观修边': deburring,
            // },
            jobpoolData: [],
        };
    },
    computed: {
        // pn() {
        //     const pn = this.$route.query.pn;
        //     return pn || '';
        // },
        // compType() {
        // console.log(this.pn);
        // const isCutting = this.pn.match(/(?<=裁切).+/);
        // return isCutting && String(isCutting);
        // },
        // comp() {
        //     let obj = {};
        //     for (let i in this.opera) {
        //         if (Object.prototype.hasOwnProperty.call(this.opera, i)) {
        //             const pnReg = new RegExp(i);
        //             if (pnReg.test(this.pn)) obj = this.opera[i];
        //         }
        //     }
        //     return obj;
        // },
        wc() {
            return this.$route.query.wc;
        },
    },
    mounted() {
        this.queryPool();
    },
    methods: {
        ...mapActions('workcenter', ['queryOrderInfo']),
        queryPool() {
            getjobpoolList(this.wc, '0,1,2').then(({ data, code }) => {
                const changeType = () => {
                    this.jobpoolData = data.sort((a, b) => {
                        let x = a.orderStats === '1' ? '3' : a.orderStats;
                        let y = b.orderStats === '1' ? '3' : b.orderStats;
                        x = x && Number(x);
                        y = y && Number(y);
                        return y - x;
                    });
                    this.pageType = 'jobpool';
                };
                if (data && data.length && data[0].state === '0') {
                    const [d] = data;
                    const noticeMessage = `<table><tr>
                        <td align="right">任务工单号</td><td>${d.orderNo || '无'}</td><td>&nbsp;</td>
                        <td align="right">料号</td><td>${d.materialNo || '无'}</td>
                        </tr><tr>
                        <td align="right">物料名称</td><td>${d.materialName || '无'}</td><td>&nbsp;</td>
                        <td align="right">明细编号</td><td>${d.taskDetailNo || '无'}</td>
                        </tr><tr>
                        <td align="right">数量</td><td>${(d.materialAmount || 0) + d.materialUnit}</td><td>&nbsp;</td>
                        <td align="right">开始时间</td><td>${d.planBeginTime || '无'}</td>
                        </tr><tr>
                        <td align="right">结束时间</td><td>${d.planCompleteTime || '无'}</td><td>&nbsp;</td>
                        <td align="right">状态</td><td>${d.state}</td>
                        </tr><table>
                        是否提交生产?`;
                    this.$confirm(noticeMessage, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '切换工单',
                        closeOnClickModal: false,
                        distinguishCancelAndClose: true,
                        dangerouslyUseHTMLString: true,
                    }).then(() => {
                        this.pageType = 'workorder';
                        this.queryOrderInfo(data[0].id);
                    }).catch(action => {
                        if (action === 'cancel') {
                            changeType();
                        }
                    });
                }
                //     changeType();
                // }
            });
        },
        jumpHandler(id) {
            this.pageType = 'workorder';
            this.queryOrderInfo(id);
        }
    },
};
</script>

<style scoped lang="stylus"></style>
