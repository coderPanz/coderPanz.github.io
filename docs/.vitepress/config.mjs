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
        text: "行业前端技术动态",
        collapsed: true,
        items: [{ text: "哈啰跨端组件库", link: "/哈啰跨端组件库" }],
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
          { text: "字符串常用方法", link: "/字符串常用方法" },
          { text: "作用域和作用域链", link: "/作用域和作用域链" },
          { text: "JS错误处理方案", link: "/JS错误处理方案" },
          { text: "js基础知识", link: "/js基础知识" },
          { text: "JS垃圾回收机制", link: "/JS垃圾回收机制" },
          { text: "JS深拷贝实现方法", link: "/JS深拷贝实现方法" },
          { text: "JS常见手写题", link: "/JS常见手写题" },
          { text: "promise并发", link: "/promise并发" },
          { text: "promise状态机封装", link: "/promise状态机封装" },
          { text: "this指向", link: "/this指向" },
          { text: "开发小tips", link: "/开发小tips" },
        ],
      },
      {
        text: "leetcode-hot",
        collapsed: true,
        items: [
          { text: "常见的排序算法", link: "/常见的排序算法" },
          { text: "常见搜索算法", link: "/常见搜索算法" },
          { text: "算法-哈希", link: "/算法-哈希" },
          { text: "算法-滑动窗口", link: "/算法-滑动窗口" },
          { text: "算法-普通数组", link: "/算法-普通数组" },
          { text: "算法-双指针", link: "/算法-双指针" },
          { text: "算法-子串", link: "/算法-子串" },
        ],
      },
      {
        text: "Vue",
        collapsed: true,
        items: [
          {
            text: "vue中的调度方案Scheduler",
            link: "/vue中的调度方案Scheduler",
          },
          { text: "vue3响应式系统", link: "/vue3响应式系统" },
          { text: "vue2响应式系统", link: "/vue2响应式系统" },
          { text: "响应式流程解析", link: "/响应式流程解析" },
          { text: "vue中的Watcher", link: "/vue中的watcher" },
          {
            text: "vue异步更新策略-nextTick原理",
            link: "/vue异步更新策略-nextTick原理",
          },
          { text: "vue中的diff算法", link: "/vue中的diff算法" },
          ,
        ],
      },
      {
        text: "工程化",
        collapsed: true,
        items: [
          { text: "webpack介绍", link: "/webpack介绍" },
          { text: "webpack-loader", link: "/webpack-loader" },
          { text: "算法-哈希", link: "/算法-哈希" },
          { text: "babel插件开发基础", link: "/babel插件开发基础" },
          { text: "babel概述", link: "/babel概述" },
          { text: "babel软件工具包", link: "/babel软件工具包" },
          { text: "CSS预处理器-Less", link: "/CSS预处理器-Less" },
          { text: "CSS预处理器-Sass", link: "/CSS预处理器-Sass" },
          { text: "vite", link: "/vite" },
        ],
      },
      {
        text: "网络",
        collapsed: true,
        items: [
          { text: "浏览器本地缓存", link: "/浏览器本地缓存" },
          { text: "axios封装", link: "/axios封装" },
          { text: "HTTPCookie", link: "/HTTPCookie" },
          { text: "HTTP标头", link: "/HTTP标头" },
          { text: "HTTP常见状态码", link: "/HTTP常见状态码" },
          { text: "HTTP缓存", link: "/HTTP缓存" },
          { text: "TCP-传输控制协议", link: "/TCP-传输控制协议" },
          { text: "UDP-用户数据报协议", link: "/UDP-用户数据报协议" },
          ,
        ],
      },
      {
        text: "浏览器",
        collapsed: true,
        items: [
          { text: "常见web性能优化方法", link: "/常见web性能优化方法" },
          { text: "服务端路由和客户端路由", link: "/服务端路由和客户端路由" },
          { text: "工作者线程", link: "/工作者线程" },
          { text: "浏览器存储方案", link: "/浏览器存储方案" },
          { text: "浏览器的进程架构", link: "/浏览器的进程架构" },
          {
            text: "网站性能指标",
            link: "/网站性能指标",
          },
        ],
      },
      {
        text: "服务端基础知识",
        collapsed: true,
        items: [
          {
            text: "mongoose多表查询-高级查询",
            link: "/mongoose多表查询-高级查询",
          },
          { text: "mongoose简介", link: "/mongoose简介" },
          { text: "node事件循环", link: "/node事件循环" },
          { text: "SQL和NoSQL", link: "/SQL和NoSQL" },
        ],
      },
      {
        text: "面试宝典",
        collapsed: true,
        items: [
          { text: "JS手撕", link: "/JS常见手写题" },
          { text: "计算机网络", link: "/计算机网络" },
          { text: "看代码说结果", link: "/看代码说结果" },
          { text: "css动画", link: "/css动画" },
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
