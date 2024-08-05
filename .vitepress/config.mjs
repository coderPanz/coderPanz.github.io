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
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "前言简叙",
        items: [
          { text: "手札", link: "/markdown-examples" },
          { text: "随笔一", link: "/essay1" },
          { text: "随笔二", link: "/essay2" },
          { text: "随笔三", link: "/essay3" },
        ],
      },
      {
        text: "JS",
        items: [{ text: "" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
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
