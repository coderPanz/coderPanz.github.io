# promise状态机封装

## 介绍
promise是js控制代码的一种手段主要是用来负责进行异步编程，是一个状态机, 并且状态不可逆。
promise有三种状态, 三种回调形式，两种函数触发状态发生改变。
状态
- pending: 初始状态
- fulfilled: 兑现状态
- rejected: 拒绝状态

回调
- then: 接收两个回调函数, 第一个为成功回调, 第二个为失败回调。返回promise实例
- catch: 接收失败回调函数, 返回promise实例
- finally: 无论初始状态是否被兑现或者拒绝追后都会执行finally中的代码，并返回promise。

触发函数
- resolve：成功兑现函数
- rejecte：失败兑现函数

## 代码实现
封装一个promise类，在构造函数中初始化 `pending` 状态, 初始化保存成功回调和失败回调的数组用于解决异步代码的回调。定义resolve、reject、then、catch、finally实例方法, 其中then、catch、finally方法定义在promise类的原型上由所有promise实例共享。
```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // 初始化状态
    this.value = null // 终值
    // 保存fulfilled回调函数和rejected回调函数解决异步情况
    this.onFulfilledCallback = []
    this.onRejectedCallback = []

    try {
      // undefined: 因为将方法传递给一个函数并且在函数内部调用时该方法会失去原本的上下文即this绑定丢失, 所以需要bind
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      // 发生异常直接rejected
      this.reject(error)
    }
  }

  // 实例方法，所以可以直接this.来访问，static 开头为类方法不能通过this.来访问
  resolve(res) {
    if(this.status !== 'pending') return
    this.status = 'fulfilled'
    this.value = res

    // 执行异步回调并将执行的回调函数从数组中删除
    while(this.onFulfilledCallback.length) {
      this.onFulfilledCallback.shift()(this.value)
    }
  }

  reject(err) {
    if(this.status !== 'pending') return
    this.status = 'rejected'
    this.value = err

    // 执行异步回调并将执行的回调函数从数组中删除
    while(this.onRejectedCallback.length) {
      this.onRejectedCallback.shift()(this.value)
    }
  }

  then(onFulfilledCb, onRejectedCb) {

    // 确保 onFulfilledCb 和 onRejectedCb 是函数
    onFulfilledCb = typeof onFulfilledCb === 'function' ? onFulfilledCb : value => value;
    onRejectedCb = typeof onRejectedCb === 'function' ? onRejectedCb : reason => { throw reason; };

    // 返回一个新的 promise 实例
    return new MyPromise((resolve, reject) => {
      // 定义 fulfilled 和 rejected 回调
      const handleFulfilled = (value) => {
        try {
          console.log('first', resolve, reject)
          const result = onFulfilledCb(value); // 执行传进来的回调函数, 接下来的代码是then支持链式调用的核心代码
          if (result instanceof MyPromise) {
            result.then(resolve, reject); // 把resovle传入then最后会在 const result = onFulfilledCb(value) 调用, 这里的onFulfilledCb相当于resolve
          } else {
            // 返回值不是promise则直接执行reslove
            resolve(result)
          }
        } catch (error) {
          // 异常直接reject
          reject(error)
        }
      };

      const handleRejected = (reason) => {
        try {
          const result = onRejectedCb(reason);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.status === 'fulfilled') {
        // 如果当前 promise 已经是 fulfilled 状态，立即执行 handleFulfilled
        setTimeout(() => handleFulfilled(this.value), 0); // 确保then是微任务
      } else if (this.status === 'rejected') {
        // 如果当前 promise 已经是 rejected 状态，立即执行 handleRejected
        setTimeout(() => handleRejected(this.value), 0); // 确保then是微任务
      } else {
        // 否则，将回调推入相应的队列中
        this.onFulfilledCallback.push(handleFulfilled);
        this.onRejectedCallback.push(handleRejected);
      }
    })
}
}

// 链式调用 输出 200
const p3 = new Promise((resolve, reject) => {
  resolve(100)
}).then(res => 2 * res, err => console.log(err))
  .then(res => console.log(res), err => console.log(err))

// 链式调用 输出300
const p4 = new Promise((resolve, reject) => {
  resolve(100)
}).then(res => new Promise((resolve, reject) => resolve(3 * res)), err => console.log(err))
  .then(res => console.log(res), err => console.log(err))
  
```