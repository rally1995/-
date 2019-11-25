import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import $http from '@/utils/http';
// import vm from '@/main';

Vue.use(Vuex);

const getTabs = () => {
    let tabs = window.sessionStorage.getItem('tabs');
    return (tabs && JSON.parse(tabs)) || [];
};

const state = {
    menus: [],
    isRouter: false,
    menuCollapse: false,
    permissions: [],
    sysUser: {},
    tabs: getTabs(),
    dict: {},
    pageObject: {},
};

const mutations = {
    /**
     * 设置state的方法，例：
     * this.$store.commit('SET_STATE', {
     *     menus: menus
     * })
     * menus为需要设置的state
     * @param state
     * @param payload
     */
    SET_STATE(state, payload) {
        if (payload && typeof payload === 'object') {
            _.forEach(payload, (v, k) => {
                state[k] = v;
            });
        }
    },
    SET_TABS(state, payload) {
        state.tabs = payload;
        const tabs = JSON.stringify(payload);
        window.sessionStorage.setItem('tabs', tabs);
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
    INI_STATE(state) {
        state.menus = [];
        state.permissions = [];
        state.sysUser = [];
        state.tabs = [];
        state.isRouter = false;
        window.sessionStorage.removeItem('access_token');
        window.sessionStorage.removeItem('refresh_token');
        window.sessionStorage.removeItem('tabs');
    }
};

const getters = {
    routes(state) {
        const menus = state.menus;
        const formatRoutes = (arr) => {
            return arr.map(v => {
                let { path, redirect, children, component, name, label, icon, keepAlive, id } = v;
                const comp = () => {
                    const compPath = component === 'Layout' ? 'pages/layout/index' : component;
                    return import(`@/${compPath}.vue`);
                };
                redirect = redirect || '';
                keepAlive = keepAlive === '0';
                if (children && children.length) children = formatRoutes(children);
                return {
                    path: path || '',
                    redirect,
                    children,
                    component: component ? comp : null,
                    name,
                    label,
                    icon,
                    meta: {
                        keepAlive,
                        menuId: id,
                    },
                };
            });
        };
        return formatRoutes(menus);
    },
};

const actions = {
    /**
     * 获取菜单
     */
    queryMenus({ commit }) {
        return $http
            .get('/admin/menu')
            .then(({ data = [] }) => {
                commit('SET_STATE', {
                    menus: data,
                    isRouter: true
                });
            });
    },
    queryUserInfo({ commit }) {
        return $http
            .get('/admin/user/info')
            .then(({ data = {}}) => {
                const { permissions = [], sysUser = {}} = data;
                commit('SET_STATE', { permissions, sysUser });
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

export default new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
});
