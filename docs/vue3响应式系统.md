# vue3响应式系统

## 介绍

Vue 最标志性的功能就是其低侵入性的响应式系统。组件状态都是由响应式的 JavaScript 对象组成的。当更改它们时，视图会随即自动更新。——vue3 官方文档


## Vue 中的响应式
Vue3 是通过 Proxy(代理) 对数据实现 getter/setter 代理，从而实现数据的响应式，然后在副作用函数中读取响应式数据的时候，就会触发这个数据或者说是对象的代理中的 getter，在 getter 里面把对当前的副作用函数保存起来，将来对应响应式数据发生更改的话，则把之前保存起来的副作用函数取出来执行。

setter和getter是用来定义对象属性的特殊方法。它们允许您以更严格的方式控制属性的读取和赋值。Setter用于设置属性的值，Getter用于获取属性的值。它们通常与属性一起使用，以提供对属性的更精细的控制。


在 JavaScript 中有两种劫持 property 访问的方式：[getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) / [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) 和 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)。Vue 2 使用 getter / setters **完全是出于支持旧版本浏览器的限制**。而在 Vue 3 中则使用了 Proxy 来创建响应式对象，仅将 getter / setter 用于 ref。

### vue3 响应式伪代码

```js
// 返回一个对象的响应式代理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      // 将副作用函数添加到存储副作用函数的全局变量 targetMap 中 
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      // 把之前存储的副作用函数取出来并执行
      trigger(target, key)
      target[key] = value
    },
  })
}

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, "value")
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, "value")
    },
  }
  return refObject
}

// 创建一个响应式对象
const obj = reactive({ count: 0 })
obj.count++
```

### 响应式注意事项

将一个响应式对象的属性赋值或解构到一个本地变量时，访问或赋值该变量是非响应式的，因为它将不再触发源对象上的 get / set 代理。

注意这种“断开”只影响变量绑定——如果变量指向一个对象之类的非原始值，那么对该对象的修改仍然是响应式的。为什么呢，因为引用类型的赋值在底层是共享内层地址的，它们都指向同一个内存地址，所以他们仍然是响应式的。

```js
const count = obj.count
const { count } = obj
```

## track 函数内部实现

上述伪代码中实现的响应式使用到了 `track` 这个函数，让我们来了解一下它内部的实现。

第一步：检查当前是否有正在运行的副作用，如果有则将这个副作用作为该依赖的订阅者存放到一个 Set 集合中(若该变量没用订阅者则这个集合也就不存在此时需要新建这个集合进行存放)，这个 Set 集合是存放所有该依赖的订阅者，因为在一个程序中会有多个地方用到同一个变量。官方伪代码如下，

```js
// 使用一个全局变量存储被注册的副作用函数
let activeEffect // 当前的副作用函数，用于更新依赖。

function track(target, key) {
  if (activeEffect) {
    // 获取该依赖对应的所有订阅者的集合
    const effects = getSubscribersForProperty(target, key)
    // 将这个正在运行订副作用作为订阅者加入到订阅者集合中
    effects.add(activeEffect)
  }
}
```

### 副作用订阅存储的结构
#### WeakMap 类型

在 JavaScript 中，`WeakMap` 是一种特殊的映射数据结构，用于存储键值对。首先，`WeakMap` 的键只能是对象，而值可以是任意类型。这是因为`WeakMap` 中的键是弱引用的，只有对象才能具有弱引用特性。而普通的 Map 对象允许任意类型的值作为键。

#### 弱引用类型和强引用类型

在 JavaScript 中，引用类型可以分为强引用类型和弱引用类型。这两种类型在内存管理和垃圾回收方面有所不同。

1. 强引用类型（Strong Reference）：
   - 强引用是最常见的引用类型。当我们创建一个对象并将其赋给一个变量时，这个变量持有该对象的引用，即强引用。
   - 只要存在强引用指向一个对象，该对象就不会被垃圾回收器回收，即使在程序的其他部分不再需要这个对象。
   - 强引用类型包括普通的对象引用、数组、函数等，它们都是强引用类型。
2. 弱引用类型（Weak Reference）：
   - 弱引用是一种不会阻止垃圾回收的引用类型。当一个对象只被弱引用所持有时，即使没有其他强引用指向它，垃圾回收器仍然可以回收这个对象。
   - 弱引用类型通常用于缓存、事件处理、防止内存泄漏等场景，其中需要引用对象但又不希望阻止对象被垃圾回收。
   - 在 JavaScript 中，`WeakMap` 和 `WeakSet` 是使用弱引用实现的数据结构，用来存储对象引用，并且不会阻止被引用对象被回收。

总结: 强引用类型会阻止垃圾回收器回收对象，直到所有强引用都释放；而弱引用类型不会阻止对象被回收，垃圾回收器可以自由地回收只有弱引用的对象。这种区别对于内存管理和避免内存泄漏非常重要，开发者可以根据具体情况选择合适的引用类型。

副作用订阅将被存储在一个全局的 `WeakMap<target, Map<key, Set<effect>>>` 数据结构中。因为其是一个弱引用类型的数据结构，可以被垃圾回收。

所以当 WeakMap 的 key 是一个对象的时候，上下文一旦执行完毕，WeakMap 中 key 对象没有被其他代码引用的时候，**垃圾回收器** 就会把该对象从内存移除，我们就无法该对象从 WeakMap 中获取内容了。

**注意**: 副作用函数使用 Set 类型，Set类型存储时不会出现重复数据。

上述方案只是实现了对引用类型的响应式处理，because Proxy 的代理目标必须是非原始值。Vue3 中是通过对原始值做了一层包裹的方式来实现对原始值变成响应式数据的。Vue3 实现方式是通过属性访问器 getter/setter 来实现的。也就是ref的实现，使用ref时内部会构建一个键为value，值为传入的原始类型数据构成的对象。然后将这个对象的key进行getter/setter转化实现数据响应式。


## trigger 函数内部实现

在 `trigger()` 之中，我们会再查找到该属性的所有订阅副作用。但这一次我们需要执行它们：

```js
function trigger(target, key) {
  const effects = getSubscribersForProperty(target, key)
  // 当依赖发生改变，则需要在对应订阅者集合中遍历更新
  effects.forEach(effect => effect())
}
```

## 监听函数

它将原本的 `update` 函数包装在了一个副作用函数中。在运行实际的更新之前( `update()` )，这个外部函数会将自己设为当前活跃的副作用。这使得在更新期间的 `track()` 调用都能定位到这个当前活跃的副作用。结合 `track` 函数如下

```js
// 这会在一个副作用就要运行之前被设置
let activeEffect // 当前活跃的副作用

function whenDepsChange(update) {
  const effect = () => {
    activeEffect = effect
    update()
    activeEffect = null
  }
  effect()
}

function track(target, key) {
  if (activeEffect) {
    // 获取该依赖对应的所有订阅者的集合
    const effects = getSubscribersForProperty(target, key)
    // 将这个正在运行订副作用作为订阅者加入到订阅者集合中
    effects.add(activeEffect)
  }
}
```

此时，我们已经创建了一个能**自动跟踪其依赖的副作用**( `whenDepsChange` 函数)，它会在任意依赖被改动时重新运行。我们称其为**响应式副作用**。

Vue 提供了一个 API 来让你创建响应式副作用 [`watchEffect()`](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)。

更改一个 ref 的最优解是计算属性，这会使得更改更加直观，但内部也是使用了响应式副作用来进行依赖管理的。而响应式副作用也就是 vue 中的 `watchEffect` 常用于更新 DOM 从而进行响应式渲染。

```js
import { ref, computed } from "vue"

const A0 = ref(0)
const A1 = ref(1)
const A2 = computed(() => A0.value + A1.value)
```
 ### Vue2 数据响应式的问题：

-   实例初始化后动态新增，删除对象属性无法监听到，需要通过额外的api去支持，例如vm.$set
-   递归遍历对象的key，若对象嵌套层级过深会导致递归性能问题。
-   无法监听数组元素的变化，只能通过劫持重写了几个数组方法
-   通知更新过程需要维护大量 dep 实例和 watcher 实例，占用内存太多多

### Vue3 中是监测数组变化
Vue3 中也需要对数组进行特殊的处理，都是通过重写数组原型链上的方法实现的。但是，在 Vue2 是不可以通过数组下标对响应式数组进行设置和读取的，但在vue3是可以的。

js数组规定如果设置的索引值大于数组当前长度，那么要更新数组的length属性。所以通过索引设置并对length产生影响时还需要触发length的相关副作用函数。例如基于这个数组的遍历操作，当length发生改变时需要触发重新遍历。

同样的，当我们修改数组的length属性时也有可能隐式地影响数组元素。这时候也需要重新触发数组元素依赖的副作用。
  

 
## 编译时响应和运行时响应

Vue 的响应式系统基本是基于**运行时**的。**追踪和触发都是在浏览器中运行时进行的。**运行时响应性的优点是，它可以在没有构建步骤的情况下工作，而且边界情况较少。另一方面，这使得它受到了 JavaScript 语法的制约，导致需要使用一些例如 Vue ref 这样的值的容器。
