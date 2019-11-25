import { orderInfo } from '@/utils/api';


const thenFunc = (commit, { data }) => {
    commit('SET_STATE', {
        module: 'workcenter',
        params: {
            workcenter: data || {},
        },
    }, { root: true });
};


const state = {
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
        taskDetailNo: '',
        detailList: [],
    },
    orderList: [],
    orderSelect: {},
};

const mutations = {};

const actions = {
    queryOrderInfo({ commit }, orderId) {
        return orderInfo(orderId).then(res => { thenFunc(commit, res) });
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
