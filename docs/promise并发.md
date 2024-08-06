# promise并发

## 介绍

​		Promise提供了四个静态方法提供异步任务的并发。分别是 `Promise.all`、 `Promise.allSettled`、 `Promise.any`、 `Promise.race`。通过将多个 promise 放入函数执行避免分别单独多次执行 promise 出现的一些问题。

注意：promise 并发并不是说同时执行多个 异步任务，而是将多个异步任务集中起来依次执行，并且针对出现不同的执行结果使用不同的方案。

## Promise.all

### 介绍

​		`promise.all` 等待所有兑现（或第一个拒绝）的结果。所有 `promise` 都被兑现时，`promise.all` 返回的 `promise` 才兑现。任意一个 `promise` 拒绝时 `promise.all` 返回的 `promise` 拒绝。使用 `promise.all`  时可以确保执行所有的异步任务都成功，而不存在某个失败的情况。

- 参数: 是一个数组，若数组中存在 `promise`，`promise.all`  兑现时可以确保数组中所有 `promise` 已经兑现。如果数组中包含非 promise 值，这些值将被忽略，但仍包含在返回的  `promise`  数组值中，当 `promise`  兑现时。
- 返回值:  返回 `promise` , 当所有输入的 `promise` 兑现时返回的 Promise 也将被兑现。如果输入的任何 Promise 被拒绝，则返回的 Promise 将被拒绝，并带有第一个被拒绝的原因。

```js
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
// [3, 42, "foo"]
```



### 同步和异步性

​		**接收非空数组时**，`promise.all`  为需要等待所有传入的异步任务完成，所以立即打印 `promise.all` 返回的 `promise` 很显然此时状态时 `pending` 。所以需要在主线程任务队列为空时打印才是最终结果。

```js
const resolvedPromisesArray = [Promise.resolve(33), Promise.resolve(44)];
const p = Promise.all(resolvedPromisesArray);
// 立即打印 p 的值: Promise { <state>: "pending" }
console.log(p);
// 使用 setTimeout，主线程任务队列为空时再次打印：Promise { <state>: "fulfilled", <value>: Array[2] }
setTimeout(() => {
  console.log("队列现在为空");
  console.log(p);
});
```



​		**接收空数组时**，`promise.all` 立即执行，无需进入异步任务队列。

```js
const p = Promise.all([]); // 将会立即解决
const p2 = Promise.all([1337, "hi"]); // 非 promise 值将被忽略，但求值是异步进行的
console.log(p); //  Promise { <state>: "fulfilled", <value>: Array[0] }
console.log(p2);// Promise { <state>: "pending" }
setTimeout(() => {
  console.log("队列现在为空");
  console.log(p2); //  Promise { <state>: "fulfilled", <value>: Array[2] }
});
```



### 结合异步函数

以下代码显得不够合理。商品A的价格不依赖商品B的价格，但是使用await会暂停对商品B的价格获取，当商品A获取价格出现意外，那么商品B价格会无法获取。我们可以使用 `Promise.all` 并发地运行它们

```js
async function getPrice() {
  const choice = await productA();
  const prices = await productB();
  return [choice, prices]
}

async function getPrice() {
  const [choice, prices] = await Promise.all([
    productA(),
    productB(),
  ]);
  return [choice, prices];
}
```



## Promise.allSettled

​		传入一个 Promise 可迭代空对象作为输入，返回一个 Promise。它会等待所有输入的 Promise 的结果 ，也是时从 pending 状态转为 fulfilled 或者 rejected 状态时，返回的 Promise 也将被兑现，兑现结果是由每个输入的 Promise 结果的组成的数组。

```js
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) =>
  setTimeout(reject, 100, 'foo'),
);
const promises = [promise1, promise2];

Promise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result)),
);

// Object { status: "fulfilled", value: 3 }
// Object { status: "rejected", reason: "foo" }
```



## Promise.any

​		将一个 Promise 可迭代对象作为输入，并返回一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)。当**输入的任何一个 Promise 兑现时**，这个返回的 Promise 将会兑现，并返回第一个兑现的值。当**所有输入 Promise 都被拒绝时**(包括传递了空的可迭代对象)，返回的 Promise 将拒绝并返回一个包含拒绝原因的数组。

```js
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.any(promises).then((value) => console.log(value));  // "quick"

// -----------------------------------------------------------
const promise1 = Promise.reject(0);
const promise2 = Promise.reject(1);
const promise3 = Promise.reject(2);

const promises = [promise1, promise2, promise3];

Promise.any(promises).then((value) => console.log(value)); 
// [AggregateError: All promises were rejected] { [errors]: [ 0, 1, 2 ] }

```



## Promise.race

​		接受一个 promise 可迭代对象作为输入，并返回一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)。返回的 Promise 的结果取决于传入的第一个 Promise 的结果。

```js
const promise1 = new Promise((resolve, reject) => {
    reject('rejected')
  });
  
  const promise2 = new Promise((resolve, reject) => {
    resolve('fulfilled')
  });
  
  Promise.race([promise1, promise2]).then(res => {
    console.log(res)
  }, err => {
    console.log(err)
  });
  // rejected
```