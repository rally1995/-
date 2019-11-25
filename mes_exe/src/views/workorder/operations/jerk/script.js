import { mapMutations, mapActions, mapState } from 'vuex';
import Bom from '@/components/publicDialogs/Bom.vue';
import IntoThePlate from '@/components/publicDialogs/IntoThePlate';
import OutofThePlate from '@/components/publicDialogs/OutofThePlate';
// import wearTear from './dialogs/WearTear';
import Delivery from '@/components/publicDialogs/Delivery';
import Scrap from '@/components/publicDialogs/Scrap';
import Record from './dialogs/Record';
import Batch from '@/components/publicDialogs/Batch';
import Rundlet from './dialogs/Rundlet';
import Stir from './dialogs/Stir';
import StirOver from './dialogs/StirOver';
import DetailList from '@/components/feetList/DetailList';
import dict from '@/utils/dict';
import { activate, listOutboard, finishOrder } from '@/utils/api';

export default {
    name: 'Jerk',
    components: {
        Bom,
        IntoThePlate,
        OutofThePlate,
        Delivery,
        Scrap,
        Batch,
        Rundlet,
        Stir,
        StirOver,
        DetailList,
        Record,
    },
    data() {
        return {
            options: [{
                label: '手动启动',
                value: '1',
            }, {
                label: '自动启动',
                value: '2',
            }],
            dict,
            detailListType: 'inboard',
            column: [{
                label: '物料料号',
                prop: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
            }, {
                label: '工位编号',
                prop: 'targetStationNo',
            }, {
                label: '计划数量',
                prop: 'planAmount',
            }, {
                label: '实领数量',
                prop: 'realAmount',
            }, {
                label: '退料时间',
                prop: 'applyTime',
            }, {
                label: '操作员',
                prop: 'operator',
            }, {
                label: '备注',
                prop: 'remark',
            }],
            tableData: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        orderNo() {
            return this.$route.query.id;
        },
        order() {
            return this.$route.query.order;
        },
    },
    created() {
        this.INI_STATE({
            module: 'workcenter',
            params: {
                workcenter: {
                    beginTime: '',
                    completeTime: '',
                    createTime: '',
                    curAmount: '',
                    id: '',
                    materialAmount: '',
                    materialName: '',
                    materialNo: '',
                    materialUnit: '',
                    orderNo: '',
                    planBeginTime: '',
                    planCompleteTime: '',
                    postingStatus: '',
                    state: '',
                    updateBy: '',
                    updateTime: '',
                    workcenterNo: '',
                    detailList: [],
                },
            },
        });
        this.queryOrderInfo(this.orderNo);
        this.getPublish();
    },
    methods: {
        ...mapMutations(['INI_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        open(item) {
            this.$refs[item].open();
        },
        handleCommand(command) {
            this[command] && this[command]();
        },
        beginManaul() {
            activate(this.orderNo).then(({ code }) => {
                if (code === 0) {
                    this.$message.success('启动成功!');
                    this.queryOrderInfo(this.orderNo);
                }
            });
        },
        finish() {
            finishOrder(this.orderNo).then(({ code }) => {
                if (code === 0) {
                    this.getPublish();
                    this.queryOrderInfo(this.orderNo);
                }
            });
        },
        getPublish() {
            listOutboard(
                '2',
                this.orderNo,
            ).then(({ data }) => {
                this.tableData = data;
            });
        },
        listOpen(type) {
            this.detailListType = type;
            this.$refs.detailList.open();
        },
    }
};
