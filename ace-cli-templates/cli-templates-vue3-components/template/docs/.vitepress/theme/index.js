import DefaultTheme from 'vitepress/theme';
import LCComponents from '<%= projectName %>-core';

export default {
  ...DefaultTheme,
  enhanceApp: async ({app}) => {
    await app.use(LCComponents)
  }
}