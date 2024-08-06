# JS常见手写题

## 一、深度优先搜索

该方法是在一个树型结构中从**纵向维度**进行遍历，从一个某个节点开始，一直遍历其子节点，直到它的所有子节点都被遍历完毕之后在遍历它的兄弟节点，依次循环直到完成遍历。

```js
function DFS(node, nodeList = []) {
  if (node) {
    nodeList.push(node);
    const children = node.children;
    for (let i = 0; i < children.length; i++)
      //每次递归的时候将 需要遍历的节点 和 节点所存储的数组传下去
      DFS(children[i], nodeList);
  }
  return nodeList;
}
```
<br>

## 二、广度优先搜索

该方法是在一个树型结构中从**横向维度**进行遍历，假设左侧优先级最高，对每层节点依次从左右进行遍历。

```js
function BFS(node) {
  let nodes = [];
  if (node != null) {
    let queue = [];
    queue.unshift(node);
    while (queue.length != 0) {
      let item = queue.shift();
      nodes.push(item);
      let children = item.children;
      for (let i = 0; i < children.length; i++) queue.push(children[i]);
    }
  }
  return nodes;
}
```
<br>

## 三、bind

```JS
Function.prototype.myBind = function (context) {
    if (typeof this !== "function") throw new TypeError("Error")

    // 获取参数(bind方法第一个参数为目标对象，第二个参数往后才是参数列表，所以需要截取掉!)
    const args = [...arguments].slice(1)
    const fn = this;

    return function Fn() {
        return fn.apply(this instanceof Fn ? new Fn(...arguments) : context, args.concat([...arguments]));
    }
}
```
<br>

## 四、call

```js
Function.prototype.myCall = function (context = window) {
  // 函数默认参数，解决调用myCall时不传值的情况
  if (typeof this !== "function") throw new TypeError("Error")

  context.fn = this; // 因为myCall函数是函数的原型方法，this指向调用myCall的函数对象，现在把这个函数对象添加到目标对象中
  const args = [...arguments].slice(1); // 获取调用函数myCall除了目标对象外的参数列表
  const res = context.fn(...args); // 把参数传入添加到对象中的目标函数并调用目标函数
  delete context.fn; // 因为call函数的this是临时指向目标对象的，所以需要删除添加到对象中的目标函数
  return res; // 返回目标函数中处理的结果
};
```
<br>

## 五、apply

```js
Function.prototype.myApply = function (context = window) {
  if (typeof this !== "function") throw new TypeError("Error")

  context.fn = this;
  const args = arguments[1] || [];
  const res = context.fn(...args);
  delete context.fn;
  return res;
};
```
<br>

## 六、节流

```js
function throttled(fn, delay) {
  let timeID = null; // 记录定时器ID
  let startTime = Date.now(); // 调用初始化节流函数时先设置开始时间
  
  return function () {
    let curTime = Date.now(); // 每次调用节流函数时获取一遍当前时间
    let awaitTime = delay - (curTime - startTime); // 从上一次到现在，还剩下多少多余时间

    if (timeID) clearTimeout(timeID); // 清除定时器
    if (awaitTime <= 0) {
      // 执行函数
      // 事件处理函数中，this 默认指向注册事件监听器的元素
      fn.apply(this, arguments); // 将函数的this绑定到到监听的元素上面，这样可以确保在fn中使用this操作元素
      startTime = Date.now(); // 重置开始时间
    } else {
      // 返回值 timeoutID 是一个正整数，表示由 setTimeout() 调用创建的定时器的编号。
      // 这个值可以传递给 clearTimeout() 来取消该定时器。
      timeID = setTimeout(fn, awaitTime);
    }
  };
}
```
<br>

## 七、防抖

```js
function debounce(fn, wait) {
  let timeID;

  return function () {
    if (timeID) clearTimeout(timeID);
    timeID = setTimeout(function () {
      // 执行函数
      fn.apply(this, arguments);
    }, wait);
  };
}
```
<br>

## 八、浅拷贝

1. 遍历

   ```js
   function clone(obj) {
     const cloneObj = {}; // 创建一个新的对象
     for (const key in obj) {
       // 遍历需克隆的对象
       cloneObj[key] = obj[key]; // 将需要克隆对象的属性依次添加到新对象上
     }
     return cloneObj;
   }
   ```

2. assign 方法

   ```js
   const obj = {
     name: "messi",
     age: 35,
   };

   const newObj = Object.assign({}, obj);

   obj.name = "james";

   console.log(newObj);

   console.log(obj == newObj);
   ```

3. Array.from 方法

   ```js
   const arr = ["my", "name", "is", "tom"];
   const newArr = Array.from(arr);

   arr[3] = "lisa";

   console.log(newArr);

   console.log(arr == newArr);
   ```

4. 扩展运算符

   ```js
   const arr = ["my", "name", "is", "tom"];
   const newArr = [...arr];

   arr[3] = "lisa";

   console.log(newArr);

   console.log(arr == newArr);
   ```
<br>

## 九、深拷贝

```js
function deepClone(target, hash = {}) {
  // 额外开辟一个存储空间来存储当前对象和拷贝对象的对应关系
  if (target === null) return target;
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target);

  if (typeof target !== "object") return target;

  if (hash[target]) return hash[target]; // 当需要拷贝当前对象时，先去存储空间中找，如果有的话直接返回
  const cloneTarget = new target.constructor();
  hash[target] = cloneTarget; // 如果存储空间中没有就存进存储空间 hash 里

  for (const key in target) {
    // 递归拷贝每一层
    cloneTarget[key] = deepClone(target[key]);
  }
  return cloneTarget;
}
```
<br>

## 十、事件代理

```html
<ul>
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li><div>4</div></li>
  <span>5</span>
  <div>6</div>
</ul>
```

```js
const ul = document.querySelector("ul");
ul.addEventListener("click", function (event) {
  let target = event.target;
  // 获取到被点击节点的祖先节点，直到其父节点为ul
  while (target && target.parentNode !== this) {
    target = target.parentNode;
  }
  if (target.tagName === "LI" && target.parentNode === this) {
    alert(`${target.innerText}被点击了`);
  }
});
```
