import { Plugin, createApp } from "vue";
import App from './app.vue';

import LComponents from '<%= projectName %>-core';

const app = createApp(App);

app.use(LComponents as Plugin);

app.mount('#app');