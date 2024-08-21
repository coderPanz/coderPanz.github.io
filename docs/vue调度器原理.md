# vue调度器原理
## 介绍
在vue中，视图的更新默认采用的是异步更新策略，当数据发生变化时会经过响应式系统流转到watcher，将watcher押入异步队列中，利用浏览器事件循环机制，在下一次事件循环开始前，对视图统一更新，有利于减少频繁操作dom带来的性能损耗！

- 计算属性watcher更新时对watcher进行脏标记
- 配置同步更新时后，立即触发视图更新
- 渲染watcher默认走的是异步更新策略，将render_watcher推入异步更新队列
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

## 源码分析
来看下queueWatcher内部是如何实现的，queueWatcher是在vue调度器中实现的
// vue-src-core-observer-scheduler

```js
import type Watcher from './watcher'
import config from '../config'
import Dep, { cleanupDeps } from './dep'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import { warn, nextTick, devtools, inBrowser, isIE } from '../util/index'
import type { Component } from 'types/component'

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
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
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
      callHook(vm, 'updated')
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
  if (!flushing) { // 若watcher队列没有刷新（执行视图更新流程），则将watcher推入队列。
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