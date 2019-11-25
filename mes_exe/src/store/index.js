import Vue from 'vue';
import Vuex from 'vuex';
import sys from './modules/sys';
import workcenter from './modules/workcenter';
import * as _ from 'lodash';

Vue.use(Vuex);

const mutations = {
    SET_STATE(state, payload) {
        const { module, params } = payload;
        const item = state[module];
        if (item && typeof item === 'object' && item instanceof Object) {
            _.forEach(params, (v, k) => {
                item[k] = v;
            });
        }
    },
    INI_STATE(state, payload) {
        const { module, name } = payload;
        const item = state[module][name];
        for (let i in item) {
            if (Object.prototype.hasOwnProperty.call(item, i)) {
                item[i] = '';
            }
        }
    },
};

export default new Vuex.Store({
    namespaced: true,
    mutations,
    modules: {
        sys,
        workcenter
    }
});
