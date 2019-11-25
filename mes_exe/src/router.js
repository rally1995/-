import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/login'),
    }, {
        path: '',
        name: 'Layout',
        component: () => import('@/pages/layout'),
        children: [{
            path: 'processcenter',
            component: () => import('@/views/processcenter'),
            meta: {
                title: '工序中心'
            },
        }, {
            path: 'jobpool',
            component: () => import('@/views/jobpool'),
            meta: {
                title: '任务工单列表'
            },
        }, {
            path: 'workcenter',
            component: () => import('@/views/workcenter'),
            meta: {
                title: '工作中心'
            },
        }, {
            path: 'panel',
            component: () => import('@/views/panel'),
            meta: {
                title: '【{pn}】{wn}'
            },
            children: [{
                path: 'operating',
                component: () => import('@/views/panel/operating'),
                meta: {
                    title: '【{pn}】{wn}'
                },
                children: [{
                    path: 'linePosition',
                    component: () => import('@/views/panel/table/linePosition'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'transportation',
                    component: () => import('@/views/panel/table/transportation'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'parameter',
                    component: () => import('@/views/panel/table/parameter'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'transportationhistory',
                    component: () => import('@/views/panel/table/transportationhistory'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'flightInfo',
                    component: () => import('@/views/panel/table/flightInfo'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'reportHistory',
                    component: () => import('@/views/panel/table/reportHistory'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'special',
                    component: () => import('@/views/panel/table/special'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'SOP',
                    component: () => import('@/views/panel/table/SOP'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'production',
                    component: () => import('@/views/panel/table/production'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }, {
                    path: 'FQC',
                    component: () => import('@/views/panel/table/FQC'),
                    meta: {
                        title: '【{pn}】{wn}'
                    },
                }]
            }, {
                path: 'maintain',
                component: () => import('@/views/panel/maintain'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }, {
                path: 'jobpool',
                component: () => import('@/views/panel/jobpool'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }, {
                path: 'report',
                component: () => import('@/views/panel/report'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }, {
                path: 'posting',
                component: () => import('@/views/panel/posting'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }, {
                path: 'postinglist',
                component: () => import('@/views/panel/postinglist'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }, {
                path: 'history',
                component: () => import('@/views/panel/history'),
                meta: {
                    title: '【{pn}】{wn}'
                },
            }],
        }]
    }]
});

export default router;
