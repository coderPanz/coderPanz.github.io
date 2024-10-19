# JS 常见手写题
## 1. apply、call、bind

```js
function call(context = globalThis) {
  if (typeof this !== "function") throw Error("this is not function")
  context.fn = this
  const parms = [...arguments].slice(1)
  const res = context.fn(...parms)
  // 临时绑定，so delete 该绑定到 context 上的属性。
  delete context.fn
  return res
}
```

```js
function apply(context = globalThis) {
  if (typeof this !== "function") throw Error("this is not function")
  context.fn = this
  const params = [...arguments][1]
  const res = context.fn(...params)
  delete context.fn
  return res
}
```

```js
function bind(context = globalThis) {
  let fn = this
  let args = [...arguments].slice(1)
  return function () {
    // 闭包机制，函数可多次调用外部作用域的变量。
    fn.apply(context, args.concat([...arguments]))
  }
}
```

## 2. 快排- 冒泡

```js
function quickSort(arr, left, right) {
  function partition(arr, left, right) {
    while (left < right) {
      while (left < right && arr[right] >= arr[left]) {
        right--
      }
      while (left < right && arr[left] <= arr[right]) {
        left++
      }
      // 找到一个符合的值后进行交换
      let temp = arr[right]
      arr[right] = arr[left]
      arr[left] = temp
    }
    // 直到 left = right 时找到了中点，并且中点左边的是都是小于右边的数
    return left
  }
  if (left > right) return
  const m = partition(arr, left, right)
  quickSort(arr, left, m - 1)
  quickSort(arr, m + 1, right)
}
```

```js
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j] < arr[j + 1]) {
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
  }
}
```

## 4. 二分查找

```js
function middleFind(arr, target) {
  let left = 0
  let right = arr.length - 1
  while (left < right) {
    let m = Math.floor((left + right) / 2)
    if (arr[m] === target) return m
    if (arr[m] < target) left = m + 1
    if (arr[m] > target) right = m - 1
  }
  return -1
}
```



## 5. 手写三角形

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <style>
    .box {
      height: 0;
      width: 0;
      border-top: 50px solid transparent;
      border-left: 50px solid transparent;
      border-bottom: 50px solid red;
      border-right: 50px solid transparent;
    }
  </style>
  <body>
    <div class="box"></div>
  </body>
</html>
```



## 6. 手写Promise

```js
class MyPromise {
  constructor(ex) {
    this.status = "pending"
    this.value = null
    this.resolveCbs = []
    this.rejectCbs = []
    // 由于 resove，reject 在外部作用域执行，所以在这里需要进行this绑定到对应的实例上才行。
    ex(this.resolve.bind(this), this.reject.bind(this))
  }

  resolve(res) {
    if (this.status !== "pending") return
    this.value = res
    this.status = "fulfilled"
    // 解决定时器等异步的resolve调用
    while (this.resolveCbs.length) {
      this.resolveCbs.shift()()
    }
  }

  reject(res) {
    if (this.status !== "pending") return
    this.value = res
    this.status = "rejected"
    while (this.rejectCbs.length) {
      this.rejectCbs.shift()()
    }
  }

  then(resolveCb, rejectCb) {
    return new MyPromise((resolve, reject) => {
      // 确保传进来的是函数
      typeof resolveCb === "function" ? resolveCb : function () {}
      typeof rejectCb === "function" ? rejectCb : function () {}
      const handleCb = cb => {
        const res = cb(this.value)
        if (res instanceof MyPromise) {
          res.then(resolve, reject)
        }
        resolve(res)
      }
      if (this.status === "fulfilled") {
        // 模拟微任务的情况
        setTimeout(() => handleCb(resolveCb), 0)
      }
      if (this.status === "rejected") {
        setTimeout(() => handleCb(rejectCb), 0)
      }
      // 定时器的情况，导致在then中时还没有改变状态，回调时只能在对应的resolve，reject中执行，由于调用上下文发生改变，所以需要进行this绑定
      if (this.status === "pending") {
        this.resolveCbs.push(handleCb.bind(this, resolveCb))
        this.rejectCbs.push(handleCb.bind(this, rejectCb))
      }
    })
  }
}
```



## 7. Promise.all

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    // 将可迭代对象转化为数组
    const arr = Array.from(iterable)
    let count = 0
    const resArr = []
    for (let i = 0; i < arr.length; i++) {
      Promise.resolve(arr[i]).then(
        res => {
          count++
          resArr.push(res)
          if (resArr.length === count) resolve(resArr)
        },
        err => {
          reject(err)
        }
      )
    }
  })
}
```



## 8. Promise.any

```js
function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable)
    const resArr = []
    let count = 0
    for (let i = 0; i < arr.length; i++) {
      Promise.resolve(arr[i]).then(
        res => {
          resolve(res)
        },
        err => {
          count++
          resArr.push(err)
          if (resArr.length === count) reject(resArr)
        }
      )
    }
  })
}
```



## 9. Promise.allsettled

```js
function allsettled(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable)
    let count = 0
    const resArr = []
    for (let i = 0; i < arr.length; i++) {
      Promise.resolve(arr[i]).then(
        res => {
          count++
          resArr.push(res)
          if (resArr.length === count) resolve(resArr)
        },
        err => {
          count++
          resArr.push(err)
          if (resArr.length === count) resolve(resArr)
        }
      )
    }
  })
}
```



## 10. Promsie.race

```js
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(iterable)
    for (let i = 0; i < arr.length; i++) {
      Promise.resolve(arr[i]).then(
        res => {
          resolve(res)
        },
        err => {
          reject(err)
        }
      )
    }
  })
}
```



## 11. 深拷贝

```js
function deepCopy(obj, hash = new WeakMap()) {
  // 1. 先将核心逻辑写好，之后再补充细枝末节
  if (obj === null || obj === undefined || typeof obj !== "object") return obj
  // 2. 处理循环引用：map
  if (hash.has(obj)) return hash.get(obj)
  // 3. 处理日期
  if (obj instanceof Date) return new Date(obj)
  // 4. 处理数组
  if (Array.isArray(obj)) {
    const newArr = []
    hash.set(obj, newArr)
    for (const item of obj) {
      newArr.push(deepCopy(item, hash))
    }
    return newArr
  }

  const deepCopyObj = {}
  hash.set(obj, deepCopyObj)
  for (const key in obj) {
    // 直接从原型中调用 hasOwnProperty，确保检查的是 object 的自有属性，不受对象本身的改变影响。
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      deepCopyObj[key] = deepCopy(obj[key], hash)
    }
  }
  return deepCopyObj
}
```



## 12. 柯里化

```js
function curriedAdd(...args) {
  const sum = args.reduce((acc, curr) => acc + curr)
  const fn = (...next) => {
    if (next.length === 0) return sum
    return curriedAdd(...args, ...next)
  }
  return fn
}

// 示例
console.log(curriedAdd(1)(2)()) // 输出 3
console.log(curriedAdd(1)(2)(3)(4)()) // 输出 10
```



## 13. 路径合并

```js
function combine(paths) {
  if (paths.length === 0) return []
  // 1. 按照起点排序路径
  paths.sort((a, b) => a[0] - b[0])
  // 2. 初始化合并结果
  const result = []
  let currentPath = paths[0] // 用来存储当前正在合并的路径
  // 3. 遍历所有路径，检查是否需要合并
  for (let i = 1; i < paths.length; i++) {
    const [start, end] = paths[i]
    // 如果当前路径和下一个路径有重叠或相邻（即下一个路径的起点 <= 当前路径的终点）
    if (start <= currentPath[1]) {
      // 合并路径，更新当前路径的终点为更大的终点
      currentPath[1] = end
    } else {
      // 如果没有重叠或相邻，将当前路径存入结果，并开始处理新路径
      result.push(currentPath)
      currentPath = paths[i]
    }
  }
  // 将最后一个合并的路径加入结果
  result.push(currentPath)
  return result
}

let paths = [[1, 3], [2, 6], [15, 18], [8, 10], [10, 11], [7, 8]]
console.log(combine(paths))
```



## 14. 控制并发队列

```js
class ExecuteQueue {
  constructor(maxQuestCount = 3) {
    // 最大并发请求数量
    this.maxQuestCount = maxQuestCount
    // 当前正在并发执行的请求数量
    this.currentQuestCount = 0
    // 并发队列
    this.queue = []
  }

  // return promise
  add(task) {
    return new Promise(resolve => {
      const questTask = () => {
        task()
          .then(resolve)
          .finally(() => {
            this.currentQuestCount--
            this.next()
          })
      }
      if (this.currentQuestCount < this.maxQuestCount) {
        this.currentQuestCount++
        questTask()
      } else {
        this.queue.push(questTask)
      }
    })
  }

  next() {
    if (this.currentQuestCount < this.maxQuestCount && this.queue.length) {
      this.currentQuestCount++
      const nextTask = this.queue.shift()
      nextTask()
    }
  }
}

const mockRequest = id => {
  return new Promise((resolve, reject) => {
    console.log(`请求 ${id} 正在发起...`)
    // 两秒后请求完成
    setTimeout(() => {
      resolve(`请求 ${id} 结束`)
    }, Math.random() * 1000)
  })
}

const executeQueue = new ExecuteQueue(3)

// 添加请求任务
for (let i = 1; i <= 10; i++) {
  executeQueue.add(() => mockRequest(i)).then(res => console.log(res))
}
```



## 15. 大数相加

```js
function addBigNumbers(num1, num2) {
  let result = "" // 存储结果
  let carry = 0 // 进位
  let i = num1.length - 1
  let j = num2.length - 1

  // 从最低位开始相加，直到两个数字都处理完
  while (i >= 0 || j >= 0 || carry > 0) {
    // i >= 0 || j >= 0: 若num1或num2不存在更高的位数则使用0代替，例如：00123 12345。
    // carry > 0 当只有进位剩余时需要将进位取余后加入最高位，例：4 % 10 = 4，将4拼接到最高位。
    const digit1 = i >= 0 ? parseInt(num1[i]) : 0
    const digit2 = j >= 0 ? parseInt(num2[j]) : 0

    const sum = digit1 + digit2 + carry // 当前位相加再加上进位
    carry = Math.floor(sum / 10) // 计算新的进位
    result = (sum % 10) + result // 将当前位的结果加到最终结果的前面。注意: 相加的位置不能乱。
    i--
    j--
  }
  return result
}
const num1 = "123456789012345678901234567890"
const num2 = "987654321098765432109876543210"

console.log(addBigNumbers(num1, num2)) // 输出: 1111111110111111111011111111100
```



## 16. 数组转化为二叉树

```js
class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}

function arrToTree(arr) {
  const root = new TreeNode(arr[0])
  const queue = [root]
  let i = 1
  while (i < arr.length) {
    const curNode = queue.shift()
    if (arr[i]) curNode.left = new TreeNode(arr[i])
    if (arr[i + 1]) curNode.right = new TreeNode(arr[i + 1])
    queue.push(curNode.left)
    queue.push(curNode.right)
    // 跳过右节点值，防止用同一个数建立节点
    i = i + 2
  }
  return root
}
```



## 17. URL 查询字符串

```js
function parseUrlQuery(url) {
  const res = {}
  // ? 号分割数组，获取查询参数
  const queryString = url.split("?")[1]
  // & 号分割每个查询参数
  const queryParams = queryString.split("&")
  // 遍历每个元素并用 = 分割，分割后的第一个元素为key，第二个元素为value
  for (let i = 0; i < queryParams.length; i++) {
    const [key, value] = queryParams[i].split("=")
    // decodeURIComponent 解码
    res[key] = decodeURIComponent(value)
  }
  return res
}

// 示例
const url = "https://example.com/?name=John&age=30&city=New%20York"

const queryParams = parseUrlQuery(url)
console.log(queryParams) // { name: "John", age: "30", city: "New York" }
```



## 18. 防抖节流

```js
// 防抖
function stabilization(fn, waitTime) {
  // 闭包
  let timeId = null
  return function () {
    // 若再次指向，则重新计时
    if (timeId) clearTimeout(timeId)
    timeId = setTimeout(() => {
      fn.apply(this, [...arguments])
    }, waitTime)
  }
}

// 节流
function throttling(fn, dealTime) {
  // 闭包
  let startTime = Date.now()
  return function () {
    // 计算等待时间，若等待时间小于0则立即执行。
    let nowTime = Date.now()
    // (nowTime - startTime):开始到现在过了5秒
    // dealTime：4 秒后执行
    // waitTime：超过了 4 秒，立即执行
    let waitTime = dealTime - (nowTime - startTime)
    if (waitTime < 0) {
      fn.apply(this, [...arguments])
      // 更新开始时间
      startTime = Date.now()
    }
  }
}
```



## 19. DFS-BFS

```js
function dfs(node, res) {
  // 二叉树模型
  if (!node) return
  res.push(node.val)
  const subs = node.child
  for (let i = 0; i < subs.length; i++) {
    dfs(subs[i], res)
  }
  return res
}


function BFS(node) {
  // 二叉树模型，层序遍历。
  const queue = [node]
  const res = []
  while (queue.length) {
    const item = queue.shift()
    res.push(item.val)
    const subs = item.child
    for (let i = 0; i < subs.length; i++) {
      queue.push(subs[i])
    }
  }
}
```