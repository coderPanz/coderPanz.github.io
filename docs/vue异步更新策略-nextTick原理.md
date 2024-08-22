# vue 调度器原理

## 介绍

在 vue 中，视图的更新默认采用的是异步更新策略，当数据发生变化时会经过响应式系统流转到 watcher，将 watcher 押入异步队列中，利用浏览器事件循环机制，在下一次事件循环开始前，对视图统一更新，有利于减少频繁操作 dom 带来的性能损耗！

- 计算属性 watcher 更新时对 watcher 进行脏标记
- 配置同步更新时后，立即触发视图更新
- 渲染 watcher 默认走的是异步更新策略，将 render_watcher 推入异步更新队列

```js
update() {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

## Scheduler源码分析

来看下 queueWatcher 内部是如何实现的，queueWatcher 是在 vue 调度器中实现的
// vue-src-core-observer-scheduler

```js
import type Watcher from "./watcher"
import config from "../config"
import Dep, { cleanupDeps } from "./dep"
import { callHook, activateChildComponent } from "../instance/lifecycle"

import { warn, nextTick, devtools, inBrowser, isIE } from "../util/index"
import type { Component } from "types/component"

export const MAX_UPDATE_COUNT = 100 // 防止无限循环更新的最大更新次数。

const queue: Array<Watcher> = [] // 存储 watcher 对象的异步更新队列。
const activatedChildren: Array<Component> = [] // 存储激活的子组件。
let has: { [key: number]: true | undefined | null } = {} // watcher哈希表-用于去重
let circular: { [key: number]: number } = {} // 记录 watcher 的循环更新次数，用于检测无限循环。
let waiting = false // 是否等待队列刷新
let flushing = false // 队列是否正在刷新
let index = 0 // 标记当前更新的watcher在队列中的索引

// 重置调度器状态：包括队列长度、索引、标志位
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (__DEV__) circular = {}
  waiting = flushing = false
}

// 选择最佳的时间戳获取方法，用高分辨率时间戳可以避免一些微妙的时间差异问题，提升整体性能。
export let currentFlushTimestamp = 0
let getNow: () => number = Date.now
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === "function" &&
    getNow() > document.createEvent("Event").timeStamp
  ) {
    getNow = () => performance.now()
  }
}

// 对队列进行排序，确保：
// - 组件从父到子的更新顺序，因为组件的创建过程是父->子。
// - 侦听器 watcher 在渲染 watcher 之前运行
// - 如果组件在父组件的 watcher 运行期间被销毁，其 watcher 可以被跳过。
const sortCompareFn = (a: Watcher, b: Watcher): number => {
  if (a.post) {
    if (!b.post) return 1
  } else if (b.post) {
    return -1
  }
  return a.id - b.id
}

// 遍历watcher队列调用watcher.run方法更新视图。
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow()
  flushing = true // 标记异步更新队列正在做运行更新操作
  let watcher, id
  // 对watcher队列排序
  queue.sort(sortCompareFn)

  for (index = 0; index < queue.length; index++) {
    id = watcher.id
    has[id] = null
    watcher.run() // 更新视图操作->调用渲染函数->返回新的vnode->patch操作（diff算法）->更新真实dom
  }

  // 队列重置之前需要保存本次队列的一个副本，用于传入生命周期回调钩子
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  // 重置调度器-清空异步更新队列
  resetSchedulerState()

  // 在组件更新后调用相应的生命周期钩子，updated、activated
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)
  // 触发视图更新需要清理对应dep中的旧的watcher，新的数据渲染后响应式系统会对新的watcher依赖搜集。
  cleanupDeps()
}

// updated钩子
function callUpdatedHooks(queue: Watcher[]) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm && vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, "updated")
    }
  }
}

// 将激活的组件加入队列，并调用 activated 钩子。
export function queueActivatedComponent(vm: Component) {
  vm._inactive = false
  activatedChildren.push(vm)
}
function callActivatedHooks(queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

// 将watcher推入队列并去重
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id
  if (has[id] != null) return
  has[id] = true // 标记存在
  if (!flushing) {
    // 若watcher队列没有刷新（执行视图更新流程），则将watcher推入队列。
    queue.push(watcher)
  } else {
    // 若队列正在刷新，根据 watcher 的 id 将其插入到合适的位置，以保证队列中的 watcher 按 id 顺序执行。
    // 重点分析这个逻辑：
    // 1. i > index：index为当前正在处理的watcher对应的索引，让 i 在当前处理的索引 index 之后，确保新进来的watcher得到调用。
    // 2. queue[i].id > watcher.id:
    //    - 确保父子组件的更新顺序： 因为vue中的渲染顺序是从父到子的，又因为创建watcher时的id是递增的，这意味着父组件的watcher.id总是小于子组件的watcher.id。
    //    - 保证侦听器watcher在渲染watcher之前被执行：vue实例初始化的过程会先检测是否有侦听器和计算属性，如果有则创建对应的watcher（具体是创建计算属性watcher再创建侦听器watcher），之后在挂载阶段才会创建渲染watcher，因为挂载涉及到渲染工作，所以需要创建对应的渲染watcher，所以对应的watcher应该是：计算属性watcher.id < 侦听器watcher.id < 渲染watcher.id。
    let i = queue.length - 1 // i取最大值
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
  // 调用flushSchedulerQueue函数，刷新队列
  // 等待标志：waiting 标志用于确保 flushSchedulerQueue 只被调度一次，否则每次调用watcher.update时队列都被重复执行。
  if (!waiting) {
    waiting = true
    // 开发模式下的同步更新者立即调用 flushSchedulerQueue 更新视图
    if (__DEV__ && !config.async) {
      flushSchedulerQueue()
      return
    }
    // 默认策略：使用nextTick，将 flushSchedulerQueue 调度到下一个事件循环中，以异步的方式批量执行。
    nextTick(flushSchedulerQueue)
  }
}
```  
接下来看一下 nextTick，常说 vue 的视图更新是批量且异步的，底层通过 scheduler 调度器实现，其实调度器中是引入了 nextTick，将 watcher 队列传入 nextTick 中才实现的异步更新。  
而 nextTick 利用的是浏览器事件循环 ♻️ 机制实现异步操作。

## 回顾浏览器事件循环
js 任务分为同步任务和异步任务，异步任务又分为宏任务和微任务。
- 宏任务：script 标签中整体代码、setTimeout 定时任务、setInterval 轮询任务、setImmediate、I/O 线程的工作任务、渲染线程的渲染任务。
- 微任务：promise.then、promise.catch、promise.finally、MutationObserver。

**执行时机**

- 同步任务直接放入到主线程执行，异步任务（点击事件，定时器，网络请求）挂在后台相关线程执行，等待处理完毕后触发回调，在主线程中执行回调操作。
- 浏览器相关线程后台执行异步任务，如果某个异步任务事件，则将该任务添加到任务队列，并且每个任务会对应一个回调函数进行处理。
- 异步任务分为宏任务、微任务，宏任务进入宏任务队列，微任务进入微任务队列。
- 执行任务队列中的任务具体是在执行栈中完成的，当主线程中的任务全部执行完毕后，去读取微任务队列，如果有微任务就会全部执行，然后再去读取宏任务队列
- 上述过程不断重复执行，也就是我们所说的事件循环 ♻️。

tips：在如果在本次事件循环过程中又触发了新的异步任务，如果是宏任务，则会被放到宏任务队列尾部，等到下一次循环在执行；如果是微任务，则会被放到微任务队列尾部，在本次事件循环中执行。


接下来看下 nextTick 源码实现

```js
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id
  if (has[id] != null) return
  has[id] = true
  if (!flushing) {
    queue.push(watcher)
  } else {
    let i = queue.length - 1
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
  if (!waiting) {
    waiting = true
    // 将watcher队列传入nextTick实现异步更新
    nextTick(flushSchedulerQueue)
  }
}
```


```js
/* globals MutationObserver */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks: Array<Function> = []
let pending = false

//用于执行所有回调函数的函数，也就是scheduler中传入的flushSchedulerQueue函数用于遍历watcher队列中的watcher更新视图。
function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// 在vue2.5及其以前nextTick是使用宏任务结合微任务的方式实现，但由于宏任务优先级低于微任务，在更新视图时会导致一些问题（渲染混乱）
// 之后的版本统一优先使用微任务实现nextTick，并用宏任务作为兜底或降级方案
let timerFunc
// 如果支持原生的 Promise，则使用 Promise.then 来执行回调函数。
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  // 如果不支持 Promise，但支持 MutationObserver，则使用 MutationObserver。
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // 如果不支持前两者，但支持 setImmediate，则使用 setImmediate。
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 如果都不支持，则使用 setTimeout 作为兜底方案
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 函数重载声明：nextTick 方法有多种调用方式，可以不带参数、带回调函数参数、带回调函数和上下文参数。
export function nextTick(): Promise<void>
export function nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void
export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void
/**
 * @internal
 */
// 主函数实现
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 如果当前没有安排异步任务（pending 为 false），则设置 pending 为 true 并调用 timerFunc 安排异步任务。
  if (!pending) {
    pending = true
    timerFunc()
  }
  // 如果没有提供回调函数且支持 Promise，则返回一个 Promise，并在 Promise 的 resolve 函数中处理上下文，所以next
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

总结：
nextTick 优先使用 promise.then 实现异步更新，若环境不支持，依次判断并调用 MutationObserver 和 setImmediate，若都不支持，最后使用 setTimeOut 作为兜底。

nextTick 会在本次事件循环末尾，下轮事件循环开始前统一渲染页面。vue 中批量更新基于 nextTick 实现，而 nextTick 利用事件循环来实现异步操作。nextTick 默认优先使用微任务对视图进行批量更新，因为在主线程中执行完同步任务待主线程空闲后会优先执行微任务，目的是在数据修改后尽快的对视图进行异步的批量更新，并且更新结束后会触发回调函数，这也就是为什么在 nextTick 中能立即拿到 dom 更新后的数据的原因。

⚠️ 注意：DOM 视图的渲染时异步的，但修改 dom 是同步的，也就是所修改 dom 后视图立即更新。


## 有趣的现象

来看一个有趣的现象，代码如下，看看会打印什么呢？

```vue
<template>
  <div id="app">
    <h1 id="name">{{ message }}</h1>
    <button @click="changeName">changeName</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "kobe",
    }
  },
  methods: {
    changeName() {
      this.message = "james"
      console.log(document.getElementById("name"))
      console.log(document.getElementById("name").innerText)
    },
  },
}
</script>
<style></style>
```

揭晓答案：

- `document.getElementById("name")` 打印 `<h1 id="name">james</h1>`
- `document.getElementById("name").innerText` 打印 `kobe`

第二个打印 'kobe' 无可厚非，vue 异步更新机制。但第一个为什么输出的是更新后的元素呢？这是由于 `document.getElementById()` 的实时性，通过 document.getElementById 获取一个 DOM 元素时，你得到的是该元素的引用。这个引用是实时的，意味着它会反映出元素的最新状态，虽然 DOM 更新是异步的，但元素的引用会立即反映出即将更新的状态。

验证：执行 changeName 时，获取代码执行时的时间戳，发现 nextTick 和 updated 都是在视图更新后回调的，所以同时触发。 document.getElementById("name") 和 document.getElementById("name").innerText 同时执行，但由于 document.getElementById 引用的实时性，所以打印 `<h1 id="name">james</h1>`

```js
methods: {
    changeName() {
      this.message = "james"
      console.log(document.getElementById("name"), Date.now()) // 1724315557387
      console.log(document.getElementById("name").innerText, Date.now()) // 1724315557387
      this.$nextTick(() => {
        console.log('nextTick', document.getElementById("name").innerText, Date.now()) // 1724315557388
      })
    },
  },
  updated() {
    console.log('update', Date.now()) // 1724315557388
  }
```

总结：

- 元素引用的实时性：当你获取 DOM 元素的引用时，这个引用是实时的，指向的是当前 DOM 树中的那个元素。
  因此，元素的引用会反映出即将更新的状态。

- 内容更新的延迟性：虽然元素的引用是实时的，但元素的内容（如 innerText）只有在 Vue 完成 DOM 更新后才会变化。
  Vue 的异步更新机制会在下一个事件循环中批量更新 DOM。在此之前，元素的内容保持不变。