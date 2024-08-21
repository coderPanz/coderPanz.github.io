# vue中的watcher
vue中的watcher是观察者实例，用于观察数据变化并作出相关响应的核心机制，做出的响应包括视图更新、计算属性重新计算、侦听器执行回调等。
watcher分类：

- 渲染watcher：数据变化->使用数据的视图更新
- 计算属性watcher：数据变化->依赖数据的计算属性更新->使用计算属性的视图更新
- 侦听器watcher：数据变化->携带新值和旧值的回调函数执行副作用



**小小总结-tips！**
渲染watcher：数据驱动视图更新
计算属性watcher：响应式依赖的计算结果，优化复杂计算，减少模版冗余
侦听器watcher：watchAPI，携带新值、旧值并执行回调函数执行副作用

## 侦听器Watcer原理
vue初始化时,如果存在侦听器则初始化侦听器watcher，user=true标记侦听器watcher。

- new Vue() 时如果存在侦听器则遍历侦听器属性，为每个属性创建侦听器watcher，在这个过程中的&watch函数判断immediate属性是否为true，若为true则立即执行一遍回调函数。

/vue/src/core/instance/state: 在 initState 中执行 initWatch
```js
export function initState(vm: Component) {
  // ......
  const opts = vm.$options
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(
  vm: Component,
  expOrFn: string | (() => any),
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

// $watch为侦听器每个属性调用 new Watcher 构造侦听器watcher
Vue.prototype.$watch = function (
    expOrFn: string | (() => any),
    cb: any,
    options?: Record<string, any>
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      const info = `callback for immediate watcher "${watcher.expression}"`
      pushTarget()
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
      popTarget()
    }
    return function unwatchFn() {
      watcher.teardown()
    }
  }
```
- new Watcher(..., key, cb, options): 忽略其他细节，只关注传进来的key-属性, cb-回调函数, user-侦听器watcher标识。
- Watcher构造函数: `this.value = this.lazy ? undefined : this.get()` 由于不是计算属性watcher，所以lazy为false，走的是get()
  - 获取当前属性的值
  - 触发属性getter由dep进行依赖收集
  - 判断是否存在deep，若存在则调用traverse(value)函数对watch属性进行深层监听。

- 当watch监听的数据（data中的数据，watch只能对data中的数据监听）发生变化时，走响应式系统那个流程，最终找到侦听器watcher，执行update -> run 获取调用get获取最新的value和this.value（上一次的值）对比，若不一样则触发回调函数cb。

/vue/src/core/observer/watcher

```js
export default class Watcher implements DepTarget {
  constructor(
    vm: Component | null,
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.dirty = this.lazy // for lazy watchers
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e: any) {
      // ......
    } finally {
      if (this.deep) {
        traverse(value)
      }
    }
    return value
  }

  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  run() {
    const value = this.get()
    if (
      value !== this.value || isObject(value) || this.deep
    ) {
      const oldValue = this.value
      this.value = value
      if (this.user) {
        const info = `callback for watcher "${this.expression}"`
        // invokeWithErrorHandling(......)
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
    
  }
}
```


## 计算属性Watcher原理
vue初始化时，如果存在计算属性则初始化计算属性watcher，用lazy=true标记计算属性watcher。

/vue/src/core/instance/state: 在 initState 中执行 `initComputed`, 为每一个计算属性创建计算属性watcher。
```js
export function initState(vm: Component) {
    const opts = vm.$options
    if (opts.computed) initComputed(vm, opts.computed)
}

function initComputed(vm: Component, computed: Obje·ct) {
  const watchers = (vm._computedWatchers = Object.create(null))
  const isSSR = isServerRendering()
  for (const key in computed) {
    const userDef = computed[key]
    if (!isSSR) {
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions)
    }
    if (!(key in vm)) defineComputed(vm, key, userDef)
  }
}
```

- 如果该计算属性不在data中定义（也就是说非响应式的，需要劫持）`if (!(key in vm))`，这一步就解释了为什么计算属性可以监听非data中的属性，而watch不行。
```js
export function defineComputed(target, key, userDef) {
  // ......
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  })}
```

- 在计算属性的getter，当计算属性xxx被访问时，Vue 会调用xxx的 getter 函数即createComputedGetter，getter函数执行后返回响应式依赖的计算结果，这个过程会触发响应式数据的getter函数，并将当前的计算属性watcher收集到他们的dep中，这样每次响应式依赖发生变化的时候，会触发dep执行对应watcher，这其中就会包括计算属性watcher。
```js
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 如果是脏的（计算属性初始化时，dirty为false，当响应式依赖（计算属性中的get函数中的data数据）/ 计算属性本身被修改后，dirty会变为true）
      // 所以，如果是脏的者重新出发计算，获取最新的值，并设置dirty为false，下次没有修改直接用缓存值，无需重新计算。
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // 收集当前计算属性watcher依赖，因为这儿是计算属性的getter操作。
      // 计算属性触发getter调用时，进行响应式数据计算的时候，响应式数据的getter也被调用触发依赖收集，收集的就是执行他们的计算属性watcher
      if (Dep.target) {
        if (__DEV__ && Dep.target.onTrack) {
          Dep.target.onTrack({
            effect: Dep.target,
            target: this,
            type: TrackOpTypes.GET,
            key
          })
        }
        watcher.depend()
      }
      // 若dirty为false，者出发计算将最新的值更新到watcher.value中，否则直接返回watcher.value缓存值。
      return watcher.value
    }
  }
}
```

- 来看下计算属性对应的watcher, 当计算属性或者依赖的数据发生setter，根据响应式系统流水线最终会调用到update函数，update会将dirty标识为 true 代表这个计算属性是脏的。
- 修改计算属性并不会触发重新计算和视图更新，只是对属性进行 **脏标识** 当下一次需要渲染或者调用计算属性时触发计算属性getter函数，getter函数判断是否为脏，若为脏者调用 evaluate（evaluate调用get函数）去获取新的计算结果，并将脏标识改为false；若不为脏者使用缓存（上一次保存的数据）。

```js
export default class Watcher implements DepTarget {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.dirty = this.lazy // for lazy watchers
    this.value = this.lazy ? undefined : this.get()
  }
  get() {
    let value
    const vm = this.vm
    value = this.getter.call(vm, vm)
    return value
  }
  update() { if (this.lazy) this.dirty = true }
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
}
```



## 渲染Watcher
- 在组件挂载的时候创建渲染watcher，在这个函数中实现 `mountComponent` ，它负责将一个 Vue 组件实例挂载到 DOM 元素上。
```js
export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 调用 beforeMount 生命周期钩子, 标识挂载中。
  callHook(vm, 'beforeMount')

  let updateComponent // 是组件更新时需要调用的函数。它会调用组件的 _render 函数生成 VNode，然后调用 _update 函数将 VNode 渲染成实际的 DOM。
  updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }

  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }

  // 创建渲染watcher，watcher会调用 updateComponent 进行渲染更新。
  new Watcher(vm, updateComponent, noop, watcherOptions, true /* isRenderWatcher */)
  hydrating = false

  // 返回vue实例
  return vm
}
```

- 响应式系统对watcher进行依赖收集，当响应式数据变化后触发响应式系统流水线，dep遍历watcher调用update，将响应式数据对应的渲染watcher放入异步更新队列，vue视图更新默认是异步的。
```js
 update() {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 异步更新调度器
      queueWatcher(this)
    }
  }

  export function queueWatcher(watcher: Watcher) {
  const id = watcher.id
  // 利用哈希去重
  if (has[id] != null) return
  // 标记watcher
  has[id] = true
  // 如果队列没有在刷新则将watcher加入队列
  if (!flushing) {
    queue.push(watcher)
  } else {
    // 如果队列刷新，则将watcher插入到合适的位置，保证队列watcher的执行顺序
    let i = queue.length - 1
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
  // 如果 waiting 标志为 false，设置 waiting 为 true，表示已开始等待刷新。
  if (!waiting) {
    waiting = true
    // 开发环境并且配置watcher配置为同步执行，则立即刷新队列
    if (__DEV__ && !config.async) {
      flushSchedulerQueue()
      return
    }
    // 否则通过nextTick异步调度  `flushSchedulerQueue` 刷新队列
    // 其实就是在下一轮事件循环开始前统一刷新。
    nextTick(flushSchedulerQueue)
  }
}
```
