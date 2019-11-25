import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/style/init.styl';
import $http from '@/utils/http';
import EbrainTable from '@/components/EbrainTable';
import EbrainFrame from '@/components/EbrainFrame';
import EbrainTools from '@/components/EbrainTools';
import EbrainDialog from '@/components/EbrainDialog';
import EbrainSearch from '@/components/EbrainSearch';
import EbrainMain from '@/components/EbrainMain';
import EbrainBox from '@/components/EbrainBox';
import EbrainBoxTable from '@/components/EbrainBoxTable';
import EbrainUpload from '@/components/EbrainUpload';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import EbrainDialogImport from '@/components/EbrainDialogImport';
import EbrainDialogExport from '@/components/EbrainDialogExport';
import ElDialogSelect from '@/components/ElDialogSelect';
import Contextmenu from 'v-contextmenu';
import 'v-contextmenu/dist/index.css';
import '@/assets/font/iconfont.css';

Vue.use(ElementUI, { size: 'mini' });
Vue.use(Contextmenu);
Object.defineProperty(Vue.prototype, '$http', { value: $http });
Vue.component('EbrainTable', EbrainTable);
Vue.component('EbrainFrame', EbrainFrame);
Vue.component('EbrainTools', EbrainTools);
Vue.component('EbrainDialog', EbrainDialog);
Vue.component('EbrainSearch', EbrainSearch);
Vue.component('EbrainMain', EbrainMain);
Vue.component('EbrainBox', EbrainBox);
Vue.component('EbrainBoxTable', EbrainBoxTable);
Vue.component('EbrainUpload', EbrainUpload);
Vue.component('EbrainDialogTable', EbrainDialogTable);
Vue.component('EbrainDialogImport', EbrainDialogImport);
Vue.component('EbrainDialogExport', EbrainDialogExport);
Vue.component('ElDialogSelect', ElDialogSelect);

Vue.config.productionTip = false;

export default new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
