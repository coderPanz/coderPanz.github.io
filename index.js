const homeRouteConfig = [
  {
    name: "首页",
    path: "/",
    component: App,
  },
  {
    name: "小程序管理",
    path: "/project",
    children: [
      {
        name: "项目列表",
        path: "/project/list",
        component: lazy(() => import("@/page/project/index")),
      },
      {
        name: "任务列表",
        path: "/project/task",
        component: lazy(() => import("@/page/task/index")),
      },
      {
        name: "渠道列表",
        path: "/project/channel",
        component: lazy(() => import("@/page/channel/index")),
      },
      {
        name: "小程序成员",
        path: "/project/member",
        component: lazy(() => import("@/page/member/index")),
      },
      {
        name: "自动化测试",
        path: "/project/test",
        component: lazy(() => import("@/page/tools/wait")),
      },
      {
        name: "微信公告",
        path: "/tools/notice",
        component: lazy(() => import("@/page/tools/notice")),
      },
    ],
  },
  {
    name: "短链与图形",
    path: "/tools",
    children: [
      {
        name: "短链生成",
        path: "/tools/short",
        component: lazy(() => import("@/page/tools/short")),
      },
      {
        name: "二维码生成",
        path: "/tools/qr",
        component: lazy(() => import("@/page/tools/qrcode/index")),
      },
      {
        name: "海报sdk",
        path: "/tools/poster",
        component: lazy(() => import("@/page/tools/poster/index")),
      },
      {
        name: "图片编辑",
        path: "/tools/editer",
        component: lazy(() => import("@/page/pc/editer/index")),
      },
      {
        name: "站外唤起app",
        path: "/tools/open",
        component: lazy(() => import("@/page/tools/wait/index")),
      },
    ],
  },
  {
    name: "加密解密",
    path: "/encryption",
    children: [
      {
        name: "AES加密/解密",
        path: "/encryption/aes",
        component: lazy(() => import("@/page/tools/encryption/aes/index")),
      },
    ],
  },
  {
    name: "基础工具",
    path: "/pc",
    children: [
      {
        name: "代码对比",
        path: "/pc/contrast",
        component: lazy(() => import("@/page/pc/contrast/index")),
      },
      {
        name: "JSON格式化",
        path: "/pc/json",
        component: lazy(() => import("@/page/pc/aes/index")),
      },
      {
        name: "base64编码",
        path: "/pc/base64",
        component: lazy(() => import("@/page/pc/base64/index")),
      },
      {
        name: "主题抽奖",
        path: "/pc/lottery",
        component: lazy(() => import("@/page/pc/lottery/index")),
      },
      {
        name: "知音楼机器人",
        path: "/pc/robot",
        component: lazy(() => import("@/page/pc/robot/index")),
      },
      {
        name: "历史分享",
        path: "/pc/share",
        component: lazy(() => import("@/page/pc/share/index")),
      },
    ],
  },
  {
    name: "系统管理",
    path: "/system",
    children: [
      {
        name: "用户列表",
        path: "/system/user",
        component: lazy(() => import("@/page/user/index")),
      },
      {
        name: "角色列表",
        path: "/system/role",
        component: lazy(() => import("@/page/role/index")),
      },
      {
        name: "菜单列表",
        path: "/system/menu",
        component: lazy(() => import("@/page/menu/index")),
      },
      {
        name: "权限列表",
        path: "/system/permission",
        component: lazy(() => import("@/page/permission/index")),
      },
    ],
  },
]

const convertRoutesToOptions = routes => {
  return routes.map(route => {
    const { name, path, children } = route
    return {
      label: name,
      value: path,
      children: children ? convertRoutesToOptions(children) : undefined,
    }
  })
}

// const options = convertRoutesToOptions(homeRouteConfig)
console.log(convertRoutesToOptions(homeRouteConfig))
