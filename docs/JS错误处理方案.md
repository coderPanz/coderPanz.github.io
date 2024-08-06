# JS错误处理方案

当运行时错误产生时，`Error` 对象会被抛出。`Error` 对象也可用于用户自定义的异常的基础对象。

```js
const err = new Error("Error");
console.log(err)

// Error: Error
//    at Object.<anonymous> (d:\Code\Study\Hexo\coderpanz\blog\demo.js:1:13)
//    at Module._compile (node:internal/modules/cjs/loader:1226:14)
//    at Module._extensions..js (node:internal/modules/cjs/loader:1280:10)
//    at Module.load (node:internal/modules/cjs/loader:1089:32)
//    at Module._load (node:internal/modules/cjs/loader:930:12)
//    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
//    at node:internal/main/run_main_module:23:47
```

Error 属性：

- `name`: 错误的类型；
- `message`：带有错误消息的字符串；
- `stack`：函数执行的堆栈跟踪。

## 错误类型

### EvalError

创建一个 error 实例，表示错误的原因：与 [`eval()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval) 有关。

**eval**：`eval()` 函数会将传入的字符串当做 JavaScript 代码进行执行。例如：

```js
console.log(eval('true ? 1: 0')); // 1
```



### RangeError

创建一个 error 实例，表示错误的原因：数值变量或参数超出其有效范围。当数值超过范围我们可以抛出这个错误。

```js
function check(n) {
  if (!(n >= -500 && n <= 500)) {
    throw new RangeError("The argument must be between -500 and 500.");
  }
}

try {
  check(2000);
} catch (error) {
  if (error instanceof RangeError) {
    // 处理错误
  }
}
```



### ReferenceError

创建一个 error 实例，表示错误的原因：无效引用。或者可能试图在代码中使用一个不可访问的变量。

### SyntaxError

表示错误的原因：语法错误。创建一个 error 实例，SyntaxError 发生的一些常见原因是：

- 缺少引号
- 缺少右括号
- 大括号或其他字符对齐不当

### TypeError

创建一个 error 实例，表示错误的原因：变量或参数不属于有效类型。

### URIError

表示 URI错误。当 URI 的编码和解码出现问题时，会抛出 URIError。例如 传递的参数无效。

### InternalError

创建一个代表 Javascript 引擎内部错误的异常抛出的实例。如：递归太多。



## 抛出

使用 [`throw`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/throw) 关键字来抛出你创建的 `Error` 对象。异常一旦抛出，就会在程序中冒泡，除非在某个地方被捕获，否则会导致程序报错。可以使用 [`try...catch`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch) 结构来处理异常:

```js
try {
  throw new Error("Whoops!");
} catch (e) {
  console.error(e.name + ": " + e.message);
}
```



### 处理特定的错误

通过判断异常的类型来特定处理某一类的异常，使用  `instanceof`  关键字

```js
try {
  foo.bar();
} catch (e) {
  if (e instanceof EvalError) {
    console.error(e.name + ": " + e.message);
  } else if (e instanceof RangeError) {
    console.error(e.name + ": " + e.message);
  }
  // ... etc
  else {
    // If none of our cases matched leave the Error unhandled
    throw e;
  }
}
```



### 创建自定义错误类型

JavaScript 提供了足够的错误类型类列表来涵盖大多数情况，如果这些错误类型不能满足要求，还可以创建新的错误类型。封装一个自定义错误类型

```js
class customError extends Error {
    constructor(message) {
        // 调用了父类 Error 的构造函数，将错误消息传递给父类处理。
        super(message);
        this.name = "customError";
    }
}
```



## 错误处理(异常捕获)

异常一旦抛出，就会在程序中冒泡，除非在某个地方被捕获，否则会导致程序报错。所以需要进行异常捕获才能够保证程序的健壮性。常用的异常捕获有：try...catch，promise.catch。cattry/catch是同步的，所以没办法这样来处理异步中的错误，promise的catch回调一般用于处理异步错误。

```js
try {
    const data = await productCountModel.find();
    if (!data) return res.status(404).json({ msg: "查询失败!" });
    res.status(200).json({
      msg: "查询成功!",
      data: data,
    });
  } catch (error) {
    res.json({
      msg: "查询失败!",
      err: error,
    });
  }
```



定时器等异步等异步操作不能使用 `cattry/catch` 来处理，例如

```js
function timerError() {
  setTimeout(() => {
    throw Error("Error");
  }, 2000);
}

// 不生效
try {
  timerError();
} catch (error) {
  console.error(error.message);
}
```

使用promise来包装定时器

```js
function timerError() {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(Error("Error"));
    }, 1000);
  });
}

```