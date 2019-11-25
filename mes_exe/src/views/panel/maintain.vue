<template lang="pug">
    div.box
        ebrain-box(v-if="workcenter.state!=='4'")
            el-tabs.tabs(v-model="activeName" type="card")
                el-tab-pane(name="first" label="物料信息")
                el-tab-pane(name="second" label="生产参数")
                el-tab-pane(name="third" label="过程记录")
            .wrap
                div(v-show="activeName==='first'")
                    h3.title 产出明细
                    ebrain-table.tables(
                        :column="column4"
                        :data="data4"
                        :highlight-current-row="false")
                    h3.title 投入明细
                    ebrain-table.tables(
                        :column="column1"
                        :data="data1"
                        :highlight-current-row="false")
                div(v-show="activeName==='second'")
                    h3.title 参数列表
                    ebrain-table.tables(
                        :column="column3"
                        :data="data3"
                        :highlight-current-row="false")
                div(v-show="activeName==='third'")
                    h3.title 过程记录
                    ebrain-table.tables(
                        :column="processTable.columnRecords"
                        :data="data2"
                        table-row-edit
                        :highlight-current-row="false"
                        @cell-save="(row, finish, killLoading) => cellSave(row, finish, killLoading, 'records')")
            div.buttons
                el-button.submit(
                    v-if="isReport"
                    type="primary"
                    style="width:100px;"
                    @click="report") 报工
                el-button.submit(
                    v-if="!isReport"
                    type="primary"
                    style="width:100px;"
                    @click="finish") 完成
                el-button.submit(
                    type="primary"
                    style="width:100px;"
                    @click="submitForm") 取消
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import tableColumn from '@/components/publicDialogs/tableColumn';
import { finishOrder } from '@/utils/api';
import moment from 'moment';
import { strip }  from '@/utils';
import * as _ from 'lodash';
export default {
    name: 'workcenter',
    data() {
        return {
            activeName: 'first',
            column1: [{
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
            }, {
                label: '总数量',
                prop: 'amount',
            }, {
                label: '投料数量',
                prop: 'feedingAmount',
            }, {
                label: '报废数量',
                prop: 'lossAmount',
            }, {
                label: '损耗数量',
                prop: 'scrapAmount',
            }, {
                label: '单位',
                prop: 'materialUnit',
            }],
            column4: [{
                label: '物料编码',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '批次',
                prop: 'prodBatchNo',
            }, {
                label: '数量',
                prop: 'realAmount',
            }],
            data1: [],
            data2: [],
            data3: [],
            data4: [],
            apiProperty: [],
            column3: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
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
            const matchTxt = [/手动叠制/, /自动叠制/, /自动叠制/, /手动组合/, /自动组合/, /层压/, /分发/];
            let count = 0;
            matchTxt.forEach(v => {
                const isMatch = v.test(this.pn);
                if (isMatch) count++;
            });
            return !count;
        }
    },
    watch: {
        workcenter(val) {
            if (val.id) {
                this.getData1();
                this.getData2();
                this.getData3();
                this.getData4();
            }
        }
    },
    mounted() {
        if (this.workcenter.id) {
            this.getData1();
            this.getData2();
            this.getData3();
            this.getData4();
        }
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        getData1() {
            this.$http.get(`/productionexe/orderprodbatch/listMaterialDetail`, {
                params: {
                    orderId: this.workcenter.id,
                }
            }).then(({ data }) => {
                this.data1 = data.map(v => ({
                    ...v,
                    amount: String(strip(v.feedingAmount + v.scrapAmount + v.lossAmount)),
                    feedingAmount: String(v.feedingAmount),
                    scrapAmount: String(v.scrapAmount),
                    lossAmount: String(v.lossAmount),
                }));
            });
        },
        getData2() {
            const params = {};
            const api = this.processTable.apiRecords;
            params.conditionList = [{
                fieldName: 'orderId',
                joinType: 'AND',
                operation: 'EQ',
                value: this.workcenter.id,
            }];
            this.$http.get(api, {
                params
            }).then(res => {
                this.data2 = res.data.records;
            });
        },
        getData3() {
            this.$http.post(`/productionexe/orderprogramparam/listByOrderId`, null, {
                params: {
                    orderId: this.workcenter.id
                }
            }).then(({ data }) => {
                this.column3 = data.map(v => ({
                    label: v.paramName,
                    prop: v.paramNo,
                    id: v.id,
                }));
                this.column3.reverse();
                this.column3.push({
                    label: '时间',
                    prop: 'createTime',
                    disabled: true,
                }, {
                    label: '记录员',
                    prop: 'updateBy',
                    disabled: true,
                });
                this.data3 = [];
                const findItem = value => this.data3.find(k => k.createTime === value);
                data.forEach(v => {
                    v.details.forEach(j => {
                        let paramter = findItem(j.createTime);
                        if (paramter) {
                            paramter[v.paramNo] = j.actualValue;
                            paramter['id_' + v.paramNo] = j.id;
                        } else {
                            paramter = {};
                            paramter.createTime = j.createTime;
                            paramter.recordingTime = j.recordingTime;
                            paramter.updateBy = j.updateBy;
                            paramter['id_' + v.paramNo] = j.id;
                            paramter[v.paramNo] = j.actualValue;
                            this.data3.push(paramter);
                        }
                    });
                });
                this.bottomLoading = false;
            }).catch(() => {
                this.bottomLoading = false;
            });
        },
        getData4() {
            const params = {
                state: '2',
                orderId: this.workcenter.id
            };
            this.$http.post(`/productionexe/orderprodbatch/list?size=9999`, null, {
                params
            }).then(({ data }) => {
                this.data4 = data;
            });
        },
        // 报工
        report() {
            this.$http.get(`/productionexe/autoposting/checkEnablePosting/${this.workcenter.id}`).then(({ code }) => {
                if (code === 0) {
                    this.$router.push({
                        path: '/panel/report',
                        query: {
                            ...this.$route.query,
                        },
                    });
                }
            });
        },
        // 取消
        submitForm() {
            this.$router.push({
                path: '/panel/operating/linePosition',
                query: {
                    ...this.$route.query,
                },
            });
        },
        cellSave(row, finish, killLoading, type) {
            const enume = (arr, result = []) => {
                arr.forEach(v => {
                    if (v.prop) result.push(v.prop);
                    if (v.children && v.children.length) enume(v.children, result);
                });
                return result;
            };
            if (type === 'records') this.apiProperty = enume(this.processTable.columnRecords);
            else this.apiProperty = enume(this.processTable.columnParams);
            let api;
            let obj = _.pick(row, this.apiProperty);
            const isEmpty = _.every(_.omit(obj, ['operator']), _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            obj.orderId = this.workcenter.id;
            if (row.id) obj.id = row.id;
            if (!row.ovenWorkDate) obj.ovenWorkDate = '';
            else obj.ovenWorkDate = moment(new Date(row.ovenWorkDate)).format('YYYY-MM-DD HH:mm:ss');
            if (type === 'records') {
                api = this.processTable.updateRecords;
                this.$http.put(api, obj).then(() => {
                    this.$message.success('修改成功');
                    this.getData2();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            } else {
                api = this.processTable.updateParams;
                this.$http.put(api, obj).then(() => {
                    this.$message.success('修改成功');
                    this.getData3();
                    finish();
                }).catch(() => {
                    killLoading();
                });
            }
        },
        finish() {
            finishOrder(this.workcenter.id).then(({ code }) => {
                if (code === 0) {
                    this.SET_STATE({
                        module: 'workcenter',
                        params: {
                            orderSelect: {},
                        },
                    });
                    this.$message.success('工单已完成!');
                    this.queryOrderInfo(this.workcenter.id);
                    this.$router.push({
                        path: '/panel/operating/linePosition',
                        query: {
                            ...this.$route.query,
                        },
                    });
                }
            });
        }
    }
};
</script>

<style scoped lang="stylus">
.box
    position relative

.wrap
    position absolute
    top 45px
    left 0
    right 0
    bottom 80px
    overflow-y auto
    overflow-x hidden

    & >>> .el-table
        height auto!important

    & >>> .el-table__body-wrapper
        height auto!important

    .tables
        height auto

    .tabs
        position absolute
        top 0
        left 0
        right 0

.title
    margin 5px 10px
    padding 5px 10px
.submit
    margin 5px
    float right

.buttons
    position absolute
    bottom 10px
    right 10px
</style>
