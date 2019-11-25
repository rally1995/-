import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Wl from '@/components/wl'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path:'/wl',
      name:'wl',
      component:wl
    },
    {
      path:'/material',
      name:'material',
      component:material
    }
  ]
})
