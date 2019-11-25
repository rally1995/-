import Vue from 'vue';
import Router from 'vue-router';
import $store from '@/store';

Vue.use(Router);

const router = new Router({
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        name: 'login',
        component: () => import('@/pages/login'),
    }, {
        path: '/qrCode',
        name: 'qrCode',
        component: () => import('@/pages/qrcode'),
    }]
});

router.beforeEach(async (to, from, next) => {
    const { fullPath, hash, meta, name, params, path } = to;
    const isLogin = /\/login/.test(path);
    const isQrCode = /\/qrCode/.test(path);
    if (isLogin || isQrCode) {
        next();
    } else {
        const { tabs, isRouter } = $store.state;
        if (!isRouter) {
            await $store.dispatch('queryMenus');
            let { routes } = $store.getters;
            router.addRoutes(routes);
            next({ ...to, replace: true });
        }
        const hasTab = tabs.find(v => v.path === to.path);
        if (!hasTab) {
            to.meta.$keepAlive = false;
            tabs.push({ fullPath, hash, meta, name, params, path });
            $store.commit('SET_TABS', tabs);
        } else {
            to.meta.$keepAlive = true;
            $store.commit('SET_TABS', tabs);
        }
        next();
    }
});

export default router;
