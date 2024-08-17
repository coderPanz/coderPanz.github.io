# 介绍
vite由vue团队开发的下一代前端构建工具，通过esbuild进行构建和转译工作在开发中HRM和打包编译提供疾速体验、并且完善vue及前端生态。在浏览器支持ES模块之前，我们需要使用合适的工具对将源码模块串联起来是的代码能够在浏览器中运行。  
webpack等构建工具：当冷启动开发服务器时，它需要将你的应用经过漫长的打包过程才能提供服务并将打包后的代码在浏览器中运行。  
vite解决方案：vite一开始将项目分为依赖和源码两大类，改进了开发服务器启动时间。  

vite项目的源代码必须采用 ESM形式编写；对于非 ESM 的依赖项，为了使其正常工作，需要[预先将其打包为ESM](https://cn.vitejs.dev/guide/dep-pre-bundling.html)。

**依赖**：在开发时一般不会变动的JavaScript代码。
**源码**：不是纯js的代码，模版语法、jSx、css、html等。  

Vite 以 [原生ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 方式提供源码给浏览器。这实际上是让浏览器接管了打包程序的部分工作：Vite 只需要在浏览器请求源码时进行转换并按需提供源码。
传统打包器：将项目整体打包发送给浏览器
vite：浏览器按需引入（无打包概念）

![vite无打包概念](/vite无打包概念.png)

## vite组成
**开发服务器**：基于esmodule，快速热更新。
**rollup打包机器**：生产环境打包。

创建一个vite项目

```js
npm create vite@latest
// vue模板
npm create vite@latest my-vue-app -- --template vue
```

## vite 特性
1. npm依赖解析和依赖与构建，浏览器对esmodule的 **直接导入** 是无法识别的。  

```js
// 直接导入
import { somePackage } from 'my-dep'
```
vite检测到直接导入后，需要对直接导入的包进行以下处理
- 依赖预构建：提高页面加载速度，并将 CommonJS/UMD转换为ESM格式。
- 重写导入路径：例如 `/node_modules/.vite/deps/my-dep.js?
v=f3sf2ebd` 以便浏览器能够正确导入它们。

2. HMR 热模块替换：支持ts开发，仅进行转译工作，不做类型检测。

## 插件
Vite 可以使用插件进行扩展，这得益于Rollup 优秀的插件接口设计使得vite可以利用Rollup 插件的强大生态系统。

```js
// vite.config.js
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```
按需调用：默认情况下插件在开发和生产环境中都会调用，vite提供了可以指定环境的调用方式
```js
// vite.config.js
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

vite官方插件：Vite 旨在为常见的web 开发工作提供开箱即用的支持。
- @vitejs/plugin-vue2：提供了对Vue2的单文件支持
- @vitejs/plugin-vue：提供 Vue 3单文件组件支持
- @vitejs/plugin-react ：提供了对react的支持。
- @vitejs/plugin-legacy.：为打包后的文件提供传统浏览器兼容性支持。


## 依赖预构建
首次启动 vite 时，Vite 在本地加载你的站点之前预构建了项目依
赖。默认情况下，它是自动且透明地完成的。
作用：
1.CommonJS 和UMD兼容性，在开发阶段中，Vite 的开发服务器将所有代码视为原生ES模块。因此，Vite 必须先将以CommonJS 或UMD形式提供的依赖项转换为ES模块。  
2.性能考量：提高页面加载性能，将多模块依赖转为单模块依赖。例如：A模块的实现依赖很多个子模块，浏览器为了完整的加载A模块需要发送很多个网络请求，导致网络堵塞拖慢页面加载速度。

**monorepo链接依赖**
在monorepo项目中，仓库中的某个包可能会成为另一个包的依赖，vite会检测没有从node_modules中导入的依赖，并且不会尝试打包这些依赖，需要对这些依赖进行单独处理。

## 缓存
Vite 将预构建的依赖项缓存到 node_modules/.vite 中。vite按照以下情况来是否决定重新运行预构建，以下项目其一发生改变者重新发起依赖预构建  
- package-lock.json, yarn.lock, pnpm-lock.yaml，或者bun.lockb;
- 补丁文件夹的修改时间
- vite.config.js 中的相关字段；
- NODE_ENV 的值。

已预构建的依赖请求使用 HTTP 头 max-age=31536000,immutable 进行强缓存，以提高开发期间页面重新加载的性能。一旦被缓存，这些请求将永远不会再次访问开发服务器。

## HMR
HMR(Hot Module Replacement)又称模块热替换，即当修改代码时，能够在不刷新页面的情况下，自动把页面中发生变化的模块，替换成新的模块，同时不影响其他模块的正常运作。  
vite 热更新主要分为三步
- vite dev server创建模块依赖图：建立模块间的依赖关系。
- 服务端收集更新模块：文件系统监视程序(如 chokidar)监听文件变化，确定需要更新的模块并包装在一个模块更新数组中。
- 服务端-客户端建立socket连接，客户端根据服务端的发来的
更新信息派发更新：客户端执行文件更新。  

import.meta 对象是现代浏览器原生的一个内置对象，Vite 在import.meta 对象中实现了hot热模块对象并暴露相关APl。本质上，HMR 是指在应用运行时动态替换模块，先来看下关于热模块替换的4个API。

**import.meta.hot.accept**
对发生变化的模块进行更新并重新渲染。
```js
if (import.meta.hot) {
  // HMR 代码
  import.meta.hot.accept((mod) => mod.render())
}
```

要接收模块自身，负责用新的模块替换旧模块，故使用此API的模块也称 '已接受' 模块。在vite中，模块指的是组成文件的代码类型，例如：css模块，js模块，html模块....  
模块更新后会创建“HMR边界”。  
HMR 边界：模块本身及其所有递归导入的模块。该更新的模块是HMR 边界的root。


**参数**
参数:  
1. import.meta.hot.accept(cb: Function)-模块自身发生更改  
2. import.meta.hot.accept(deps: string | string [], cb:Function)-导入模块的更改

模块自更新
```js
export let data = [1, 2, 3]
if(import.meta.hot) {
  import.meta.hot.accept((newModule)=>{
    // Replace the old value with the new one
    data = newModule.data
  })
}
```

导入模块的更新
```js
import { value } from './stuff.js'
document.querySelector('#value').textContent = value

if(import.meta.hot) {
  import.meta.hot.accept(['./stuff.js'], ([newModule]) => {
    // Re-render with the new value
    document.querySelector('#value').textContent = newModule.value
  })
}
```

**import.meta.hot.dispose**
在当前模块/导入的模块被替换清除时清理模块带来的副作用，删除事件侦听器、清除计时器、重置状态。

```js
if (import.meta.hot){
  import.meta.hot.dispose((data) => {
    //在模块被替换之前执行清理工作
    clearInterval(timer)；//停止计时器
    // 保存一些状态
    data.someState = app.state;
  });

  import.meta.hot.accept((newModule)=> {
    //从数据中恢复状态
    if (newModule && newModule.hot.data.someState) {
      app.setState(newModule.hot.data.someState)
    }
  })
}
```

**import.meta.hot.prune**
删除一个模块时需要调用的回调函数
```js
function setupOrReuseSideEffect() {}
  setupOrReuseSideEffect()
  if (import.meta.hot) {
    import.meta.hot.prune((data)=> {
      // 清理副作用
    })
  }
```

**import.meta.hot.invalidate**
退出热更新，使模块的HMR状态无效，从而触发整个页面刷新，强制刷新页面以确保一致性，特别是在做一些全局性的更改时，例如改变项目配置或一些关键依赖项。
```js
export let data = [1, 2, 3]
  if (import.meta.hot) {
    import.meta.hot.accept((newModule)=> {
      // if the 'data' export is deleted or renamed
      if (!(data in newModule)) {
        // Bail out and invalidate the module
        import.meta.hot.invalidate()
      }
   })
  }
```

**步骤过程**
1.文件更改：当文件开始发生编辑操作时vite启动HMR，文件系统监视程序（如chokidar）这个将发生更改的文件path转发到下个HMR流程。
```js
const chokidar = require('chokidar');
//监视项目目录中的文件变化
const watcher = chokidar.watch('src', {
  ignored: /node _modules/,
  persistent: true
});
watcher.on('change', filePath => {
  console.log(`File ${filepath} has been changed`);
  // 触发HMR 更新
  handleFileChange(filePath);
});
```

2.处理发生更改的文件模块（一个文件中包含多个子模块）:Vite dev Server获取上一步传过来的path。然后使用文件路径在模块图中查找其相关模块。需要注意的是，“文件”和“模块”是两个不同的概念，一个文件可能对应一个或多个模块。例如，Vue 文件可以编译为js、css、html模块并将这些模块加入到依赖图（模块图）使得文件路径能够在模块图中找到相关模块。根据path从模块图中找到模块后，将模块传递到Vite 插件的handleHotUpdate()钩子进行进一步处理。选择过滤或扩展模块数组，最终的模块将传递到下一步。

```js
// 过滤模块数组
function vuePlugin() {
  return {
    name:'vue',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.vue')) {
        // 从缓存中获取旧的文件
        const oldcontent = cache.get(ctx.file)
        // newfile
        const newcontent = await ctx.read()
        // 根据新旧文件内容对比，如果只是样式发生了变化，则过滤js模块，只对css模块触发HMR
        if (isOnlyStyleChanged(oldContent, newContent)) {
          return ctx.modules.filter(m => m.url.endsWith('.css'))
        }
      }
    }
  }
}

// 扩展模块数组
// 扩展模块块数组
function globalCssPlugin() {
  return {
    name:'global-css',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.css')) {
      // 如果CSS文件发生更新，需要对css文件触发HMR
      // 需要重新改造的`virtual·global-css 模块
      const mod = ctx.server.moduleGraph.getModuleById('virtual:global-css')
        if (mod) {
          return ctx.modules.concat(mod)
        }
      }
    }
  }
}
```


3.处理模块失效  
在HMR传播之前，会先检测失效模块并删除，之后会对失效模块附加一个失效时间戳，该时间戳将用于在下一个请求中在客户端获取新模块。

4.HMR传播  
最终需要更新的数组模块需要进行HMR传播。  
从根本上讲，HMR传播就是以更新的模块为起点，找到HMR边界。如果所有更新的模块都在边界内，Vite dev 服务器将通知HMR客户端通知 已接受的模块 执行HMR。如果有些模块不在边界内，则会触发整个页面重新加载。  
在需要重新加载的情况下，dev Server将向HMR客户端发送一条消息以重新加载页面。如果有可以热更新的模块，则HMR传播期间需要更新的模块数组将发送到HMR客户端触发HMR。

## 客户端HMR
客户端HMR在html中导入/@vite/client脚本用于加载客户端
HMR，作用如下  
- 与Vite 开发服务器建立 WebSocket连接。
- 监听来自devServer的HMR的更新信息。
- 触发HMR API对模块更新。
- 将HMR事件发送给Vite 开发服务器。

![客户端HMR](/hmr通信结构.jpg)

**HMR客户端初始化**
```js
const ws = new WebSocket('ws://localhost:5173')
ws.addEventListener('message'，({ data }) => { 
  const payload = JSON.parse(data)
  switch (payload.type) {
    case '......'
  }
})
//发送事件给dev Server
ws.send('...')
```
createHotContext 主要用于创建一个HMR上下文对象，该对象包含了与 HMR相关的一些方法和属性，例如accept、dispose、prune 和invalidate。这些方法允许你在模块更新时执行特定的逻辑，从而实现模块的热替换而无需刷新整个页面。

**在模块中注入HMR客户端**
```js
// app.jsx
import{ createHotContext }from'/@vite/client'
//传入的路径 /src/app.jsx是当前模块的路径，用于唯一标识和管理该模块的热更新状态。
import.meta.hot = createHotContext('/src/app.jsx')

export default function App() {
  return <div>Hello World</div>
}

//注入_`@vitejs/plugin-react`插件提供了对react热更新的支持
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console. log('Module updated:', newModule);
    // 在模块更新时重新渲染
    render()
  })

import.meta.hot.dispose((data) => {
  console.log('Module is about to be replaced');
  // 在模块被替换之前进行清理工作
  clearInterval(timer)
  data.someState = 'some state to preserve'
})
}
```

**处理服务器传入的更新信息**
```js
ws.addEventListener('message'，({ data })=> {
  const payload = JSON.parse(data)
  switch (payload.type) {
    case 'full-reload': {
      location.reload()
      break
    }
    case 'update': {
      const updates = payload.updates
        // => { type: string, path: string, acceptedPath: string, timestamp: number }[]
        for (const update of updates) {
          handleUpdate(update)
        }
      break
    }
    case 'prune': {
      handlePrune(payload.paths)
      break
    }
    // Handle other payload types...
  }
})
```

**真正的更新逻辑**
对于每次HMR更新，都会存在**更新对象**。对于CSS更新只需要替换link标签，对于JS更新，需要找到对应的模块来调用 `import.meta.hot.accept()` 进行更新，因为我在**模块中注入HMR客户端的时候 导入** ` createHotContext` 时进行了路径注册，所以我们可以根据更新对象中的 `path` 快速匹配我们要找的模块。
```js
interface Update {
  // 更新模块类型
  type: 'js-update' | 'css-update'
  // 自身路径
  path: string
  // HMR更新边界
  acceptedpath: string
  // 更新时间戳
  timestamp: number
}

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
  console.log('Module updated:', newModule);
  // 执行模块替换逻辑，例如重新渲染组件
  render();
});

import.meta.hot.dispose((data) => {
  console.log('Module is about to be replaced');
  // 在模块被替换之前进行清理工作
  clearInterval(timer)
  data.someState = 'some state to preserve'
})
}
```

**理论总结**
其实就是vite中的HMR就是vite开发服务器和HMR客户端进行通信处理开发环境中局部更新和全局更新的问题，dev Server构建模块图，监听模块变化将更新信息发送给HMR客户端，HMR客户端更新更新信息调用HMRAPI进行局部更新或者全局更新。


## 实操
1. 创建一个vite的vue项目  
2. 项目初始化会创建一个hello world组件，在创建一个 `test.vue` 组件和一个 `test.js` 工具函数（做一个打印操作即可），并在test中导入并调用。
![viteHMR项目实操](/vite项目实操.jpg)

**vite管理项目HMR过程解析**
启动vite开发服务器后，devServer会对在项目中的 `index.html` 文件中注入 `<script type="module"
src="/@vite/client"></script>` 脚本，导入vite客户端HMR。并打包项目处理为浏览器能够识别和运行的代码发送给浏览器，这个过程devServer会与浏览器建立一个web Socket连接用于客户端HMR通信。
![viteHMR注入](/hmr客户端注入.jpg)
![viteHMR客户端](/HMR客户端.jpg)

来看一下客户端HMR的真面目，里面包含了HMR所需的API，这些api决定了如何对代码进行更新处理。其中就
包含了accept、dispose、prune、invalidate这4个主要的api。
![viteHMR客户端api](/HMR客户端API.jpg)

**HMR过程**
现在试着更新一下vue组件的代码，看看来更加深入理解这个过程。首先devServer监听到代码的改变，会通过websocket发送更新信息给HMR客户端，客户端HMR通过更新信息发起http请求来获取发生变化的模块，之后会调用HMRAPI对代码进行局部或者全局更新。为什么不使用websocket来传输数据，而是通过http/https来传输数据？google上提供了优质内容。  
修改 `test.vue` 后devServer检测到组件的更新
![vite检测组件更新](/vite检测到组件更新.jpg)

发送一个websocket Message给HMR客户端，这个对象包含模块路径、最后更新时间戳、更新类型、模块类型。
![vite发送socket信息](/vite发送socket.jpg)

HMR客户端会根据这个message更新对象中的acceptedPath作为url路径并用**timestamp**作为请求参数拼接url
向dev Server发起http请求获取更新模块的模块调用HMRAPI进行热更新。
![vite发送hmr请求](/发送请求获取hmr内容.jpg)
![vite获取hmr内容](/获取请求hmr内容.jpg)


将代码格式格式化分析热更新模块
```js
//导入客户端HMR并注入更新模块路径注册到import.meta.hot对象上。其他的就正常执行vue相关逻辑代码（这里的代码是经过vite处理后的代码，不是真正的源码）。
import{ createHotContext as _vite_createHotContext } from "/@vite/client"
import.meta.hot = _vite_createHotContext("/src/components/Test.vue")
import { onMounted } from "/node_modules/.vite/deps/vue.js?v=a8bde403"
import test from "/src/until/test.js"

const _sfc_main = {
  _name:"Test",
  setup(__props, { expose: __expose }) {
    __expose()
    onMounted(()=> {
      test()
    })
  
    const __returned__ = {
      onMounted,
      get test() {
        return test
      },
    }

  Object.defineproperty(__returned__， "__isScriptsetup"，{
    enumerable: false,
    value: true,
  })
  return __returned__
  },
},

import {
  openBlock as _openBlock,
  createElementBlock as _createElementBlock,
} from "/node_modules/.vite/deps/vue.js?v=a8bde403"
//创建渲染函数，这里就是需要渲染更新后的具体的值，也就是test变为test01
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock("h1"，null, "testo1")
}

// HMR操作
_sfc_main._hmrId="0904fc8e" //为组件分配一个唯一的 HMR ID。

// 在 HMR 运行时注册组件。
typeof __VUE_HMR_RUNTIME__ !== "undefined" &&

__VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)
export const _rerender_only = true
// accept为设置 HMR 更新的处理逻辑。
import.meta.hot.accept(mod => {
  if (!mod) return
  const { default: updated, _rerender_only } = mod
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated._hmrId, updated.render)//使用新值触发局部渲染
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)
  }
})
import _export_sfc from "/@id/_x00_plugin-vue:export-helper"
export default /*#_PURE_*/ _export_sfc(_sfc_main, [
  ["render", _sfc_render],
  [
    "_file",
    "/Users/panqizhong/project/vite/vite-project/src/components/Test.vue",
  ],
]),
```

**关于全局刷新**
vite全局刷新有两种情况
- reload:更改index.html、main.js或者更改这两个文件的依赖都会触发页面全局加载
- server restarted：更改viteconfig配置文件后vite开发服务器会自动重启也会导致页面全局加载
![vite更新情况1](/vite更新情况1.jpg)
![vite更新情况2](/vite更新情况2.jpg)