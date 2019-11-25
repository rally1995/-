import $http from '@/utils/http';
import _ from 'lodash';

const state = {
    menus: [],
    permissions: [],
    sysUser: {},
    dict: {},
};

const mutations = {
    INI_SYS(state) {
        state.menus = [];
        state.permissions = [];
        state.sysUser = [];
        window.sessionStorage.removeItem('access_token');
        window.sessionStorage.removeItem('refresh_token');
    },
    SET_DICTIONARY(state, payload) {
        if (payload) {
            _.forEach(payload, (v, k) => {
                state['dict'][k] = state['dict'][k] || {};
                _.forEach(v, i => {
                    state['dict'][k][i.value] = i.label;
                });
            });
        }
    },
};

const actions = {
    /**
     * 获取菜单
     */
    queryUserInfo({ commit }) {
        return $http
            .get('/admin/user/info')
            .then(({ data = {}}) => {
                const { permissions = [], sysUser = {}} = data;
                commit('SET_STATE', {
                    module: 'sys',
                    params: { permissions, sysUser },
                }, { root: true });
            });
    },
    signout({ commit }) {
        return $http
            .delete('/auth/token/logout')
            .then(() => {
                window.location.href = '';
                // vm.$router.push('/login');
            });
    },
    queryDict({ commit }, type) {
        return $http
            .get(`/admin/dict/type/${type}`)
            .then(({ data = [] }) => {
                commit('SET_DICTIONARY', {
                    [type]: data
                });
            });
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
