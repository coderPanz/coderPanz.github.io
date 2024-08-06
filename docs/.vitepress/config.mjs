import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ["link", { rel: "icon", href: "/a2a7641a26b367608c6ef28ce9b7e983.png" }],
  ],
  title: "學吳紫荆",
  description: "technology、life",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "开篇", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "前言简叙",
        collapsed: true,
        items: [
          { text: "手札", link: "/markdown-examples" },
          { text: "随笔一", link: "/随笔一" },
          { text: "随笔二", link: "/随笔二" },
          { text: "随笔三", link: "/随笔三" },
        ],
      },
      {
        text: "JS",
        collapsed: true,
        items: [
          { text: "闭包", link: "/闭包" },
          { text: "代理-反射", link: "/代理-反射" },
          { text: "迭代器-生成器", link: "/迭代器-生成器" },
          { text: "对象-函数常用方法", link: "/对象-函数常用方法" },
          { text: "防抖-节流", link: "/防抖-节流" },
          { text: "关于全局变量和变量提升", link: "/关于全局变量和变量提升" },
          { text: "浏览器事件循环", link: "/浏览器事件循环" },
          { text: "前端常见设计模式", link: "/前端常见设计模式" },
          { text: "数组常用方法", link: "/数组常用方法" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    search: {
      provider: "local",
    },
    outline: [2, 3],
  },
  // 自定义字体配置
  // transformHead({ assets }) {
  //   // 相应地调整正则表达式以匹配字体
  //   const myFontFile = assets.find(file => /font-name\.\w+\.woff2/)
  //   if (myFontFile) {
  //     return [
  //       [
  //         "link",
  //         {
  //           rel: "preload",
  //           href: myFontFile,
  //           as: "font",
  //           type: "font/woff2",
  //           crossorigin: "",
  //         },
  //       ],
  //     ]
  //   }
  // },
})
