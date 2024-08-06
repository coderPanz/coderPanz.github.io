# vue2响应式系统

## 介绍

数据响应式是建立数据和依赖之间的关系，当数据发生变化的时候，通知数据的依赖进行相关操作，vue2响应式是基于JS中的Object.defineProperty这个 api 实现的。先来介绍下这个api。

**`Object.defineProperty()`**  静态方法会直接在一个对象上定义一个新属性，或修改其现有属性，并返回此对象。

`Object.defineProperty(obj: object, prop: string, descriptor: object)
`
- 参数一：目标对象
- 参数二：定义或修改的key
- 参数三：属性描述符，控制该key的行为。

**Tips**：对象中存在的属性描述符有两种主要类型：数据描述符和访问器描述符。**数据描述符**是一个具有可写或不可写值的属性(`writable`)。**访问器描述符**是由 getter/setter 函数对描述的属性。

### 追踪变化
vue实例初始化时, 将递归 `data` 选项中的对象，并使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 把这些 `property` 全部转为 [getter/setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects#定义_getters_与_setters)。(getter 和 setter 是属性访问器（accessors）也就是能够捕捉 property 访问或者更新时记录访问和更新源。

### Watcher
每个vue实例都有一个对应的 **watcher** 观察者实例，用于建立数据与视图之间的联系，实现响应式更新。

**watcher创建的时机**：Vue共三处地方会创建Watcher对象，vue实例化阶段、computed和watch属性, mount周期中创建的Watcher用于观测data选项中的数据，watch和computed创建的Watcher都用于监听用户自定义的属性变化。

![](/Snipaste_2024-04-13_14-25-25.png)

### 依赖收集和依赖触发
这里简单写一下大致过程。vue实例初始化-递归**data**选项中的数据对象使用 `Object.defineProperty` 将这些属性转化为 getter/setter，并进行**依赖收集**和**依赖触发**的相关操作。

```js
Object.defineProperty(data, key, {
   enumerable: true,
   configurable: true,
   get: function () {
       // 在 getter 中收集依赖
       dep.addSub()
       return val
   },
   set: function(newVal) {
       val = newVal
       // 在 setter 中触发依赖
       dep.notify()
   }
}) 
```
```js
class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm // vue实例
        this.getter = exp // 表达式-用户获取实例中对应数据
        this.cb = cb // 回调函数-一般用于更新视图
        this.value = this.get() // 获取表达式初始值并保存到watcher实例的value中
    }

    get() {
        // 当发生访问行为的时候将watcher实例放入dep容器全局容器中建立依赖关系
        Dep.target = this 
        // 调用getter获取表达式的值，并且其中的this指向vue实例并将vue实例作为上下文传入，表达式可以正确访问到 Vue 实例的数据。
        // 获取值后，将全局变量 `Dep.target` 设置为 `undefined`，以清除依赖关系，避免影响后续的数据访问。因为这个这个依赖已经被保存到dep中了，这个过程发生在依赖收集阶段。
        let value = this.getter.call(this.vm, this.vm) 
        Dep.target = undefined 
        return value
    }

    update() {
        const oldValue = this.value
        // 调用get方法获取最新的值，并将其保存在 Watcher 实例的 `value` 属性中。
        this.value = this.get()
        // 调用回调函数，对新旧值进行对比，以便执行相应的更新操作。
        this.cb.call(this.vm, this.value, oldValue)
    }
}

```
#### 依赖收集
dep是Dep类的实例。Dep是vue2封装的一个负责管理依赖，包括依赖的收集、删除、通知依赖更新的类。

```js
class Dep {
  constructor() {
    // 创建subscribers保存watcher
    this.subscribers = [];
  }
  // 添加watcher
  addSub() {
    if (Dep.target) {
      this.subscribers.push(Dep.target);
    }
  }
  // 移除watcher
  removeSub(sub) {
    const index = this.subscribers.indexOf(sub);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  // 通知所有watcher更新
  notify() {
    this.subscribers.forEach(sub => {
      sub.update();
    });
  }
}
```

### 缺陷及解决方法

#### 对象

Vue 无法检测 property 的添加或移除。由于 Vue 会在初始化实例时通过`Object.defineProperty`对 property 递归进行 getter/setter 转化，而这个api只能监测对象属性的访问的更新不能监测添加和移除。

对于已经创建的实例，Vue 不允许添加响应式的property属性。在Vue中提供了类方法 `Vue.set(object, key, value)` 方法向对象中添加响应式 property。或者使用Vue实例的实例方法  `vm.$set(object, propertyName, value)`。

vue2中管理对象的响应式api：`Vue.observable(object)`，让一个对象可响应。Vue 内部会用它来处理 `data` 函数返回的对象,同时也会递归侦测对象中子数据的变化，本质上还是使用 `Object.defineProperty`。

```js
// 已经创建的Vue实例
var vm = new Vue({
  data:{
    name: 'kobe',
    age: 33
  }
})
// vm.name/vm.age = 43: 响应式的
// delete vm.name/vm.adress = 'china': 非响应式
```

#### 数组

Vue2不能检测以下情况的操作(即使已经对数组进行响应式处理)

- 利用索引进行赋值操作：`vm.arr[index] = newValue`
- 修改数组长度：` item.arr[indexOf] = newValue`，数组修改长度后会自动截取对应个数的项。

`Object.defineProperty` 真的不能监听数组的变化吗？

答案是否定的，在js中数组可以被看做是对象，就像函数一样也可以看做特殊的对象。数组的索引就是key。但是这样着是没有意义的。

Object.defineProperty还可以监听数组原型方法，但也仅仅只是监听到该方法被调用了，例如，使用Object.defineProperty 劫持push方法, 但是这样做是没有意义的, 只是监听到数组调用了 push 方法但是具体调用 push 是做什么的，使得数组发生了什么变化？这个是没办法追踪的。


```js
let arr = [1, 2, 3, 4, 5]
Object.defineProperty(arr, 'push', {
  get() {
    console.log('getter') // 'getter'被打印
    return Array.prototype.push
  },
  set() {
    console.log('setter')
  }
})
arr.push(6)
```

所以 Object.defineProperty 也能监听数组变化，那么为什么 Vue2 弃用了这个方案呢？
有几个点
- 按索引访问数组的情况极少
- `Object.defineProperty` 不能监听原型链上的方法，例如数组的push、pop、shift 等。
- 数组数据量过大时会引起性能问题

Vue2 中是怎么监测数组的变化的？

重写数组原型链上的方法进行监听，其原理是使用拦截器拦截原始的 Array.prototype，当数组访问原型链方法时先进入预先设置的拦截器中进行**依赖收集和触发依赖**然后在访问真正的原生 Array 原型上的方法去操作数组。

**索引赋值操作响应式更新方法**

```js
// Vue的类方法及其实例方法
Vue.set(vm.items, indexOfItem, newValue)
vm.$set(vm.items, indexOfItem, newValue)

// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```



### 声明响应式  property

Vue 不允许动态添加根级响应式 property，必须在初始化实例前声明所有根级响应式 property。

```js
var vm = new Vue({
  data: {
    name: 'kobe',
    age； 33
  }
})
```