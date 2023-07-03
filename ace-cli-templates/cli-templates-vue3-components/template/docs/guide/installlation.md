# 安装

## 全局引入

```ts
// main.ts
import { Plugin, createApp } from "vue";
import App from './app.vue';

import LComponents from '<%= projectName %>-core';

const app = createApp(App);

app.use(LComponents as Plugin);

app.mount('#app');

```

## 组件使用

```javascript
// app.vue
<template>
  <div>
    <div>active test</div>
    <div>
      <LButton type="">测试按钮</LButton>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

```