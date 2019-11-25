import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/style/init.styl';
import $http from '@/utils/http';
import EbrainTable from '@/components/EbrainTable';
import EbrainMain from '@/components/EbrainMain';
import EbrainBox from '@/components/EbrainBox';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import EbrainSeniorSearch from '@/components/EbrainSeniorSearch';
import EbrainDialog from '@/components/EbrainDialog';
import tableCell from '@/components/tableCell';
import AlloyFinger from 'alloyfinger';
import AlloyFingerPlugin from 'alloyfinger/vue/alloy_finger_vue';
import '@/assets/font/iconfont.css';
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';

Vue.use(ElementUI);
Vue.use(Viewer);
Viewer.setDefaults({
    Options: {
        'inline': true,
        'button': true,
        'navbar': true,
        'title': true,
        'toolbar': true,
        'tooltip': true,
        'movable': true,
        'zoomable': true,
        'rotatable': true,
        'scalable': true,
        'transition': true,
        'fullscreen': true,
        'keyboard': true,
        'url': 'data-source'
    }
});
Vue.use(AlloyFingerPlugin, { AlloyFinger });
Object.defineProperty(Vue.prototype, '$http', { value: $http });
Vue.component('EbrainTable', EbrainTable);
Vue.component('EbrainMain', EbrainMain);
Vue.component('EbrainBox', EbrainBox);
Vue.component('EbrainDialogTable', EbrainDialogTable);
Vue.component('EbrainDialog', EbrainDialog);
Vue.component('EbrainSeniorSearch', EbrainSeniorSearch);
Vue.component('tableCell', tableCell);

Vue.config.productionTip = false;

export default new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
