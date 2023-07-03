export default {
  title: "LowCodeComponents",
  description: 'Just playing around.',
  themeConfig: {
    siteTitle: "LowCodeComponents",
    // nav: [
    //   { text: "指南", link: "/guide/installlation" },
    //   { text: "组件", link: "/components/LButton/index" },
    // ],
    socialLinks: [
      { icon: "github", link: "https://github.com" },
    ],
    sidebar: [
      {
        text: '基础',
        items: [
          { text: '安装', link: '/guide/installlation' },
        ]
      },
      {
        text: '低代码组件',
        items: [
          { text: '按钮', link: '/components/LButton/index' },
        ]
      }
    ],
  },
  
};