import type { RouteRecordRaw } from 'vue-router';
import RouterView from '@/layout/routerView/index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'https://www.baidu.com',
    name: 'https://www.baidu.com',
    component: RouterView,
    meta: {
      title: '外链测试',
      icon: 'icon-externa-link',
      isExt: true,
    },
  },
];

export default routes;
