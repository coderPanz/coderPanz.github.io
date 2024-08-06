# node事件循环

## 介绍

​		Node.js 事件循环（Event Loop）是 Node.js 实现异步 I/O 操作的核心机制，它负责处理事件和执行回调函数，以实现非阻塞 I/O 操作和异步编程。Node.js 事件循环的实现基于 libuv 库，它是一个跨平台的异步 I/O  库，用于处理事件循环、文件系统操作、网络请求等。

​	NodeJS 中包含的异步机制在和浏览器中的类似。除此之外，Node.js中还有一些其他的异步形式需要依靠nodejs特有的事件循环机制了。

- 文件读取的I/O操作：通过fs模块可实现异步IO操作。
- process.nextTick()：在某些同步任务完成后立马执行。
- server.close、httpServer等一些服务的关闭：关闭回调。
- setImmediate()：与 setTimeout 在某些同步任务完成后立马执行。

## node环境中代码运行流程

1. V8引解析JavaScript代码；
2. 解析后的代码，调用Node API；
3. libuv库负责Node API的执行。将不同的任务分配给不同的线程，形成一个Event Loop（事件循环），以异步的方式将任务的执行结果返回给V8引擎；底层由C++实现所以不能在这里说JS单线程的问题。
4. V8引擎将结果返回给用户；

## node事件循环流程

node事件循环在libuv的调控下分为6个过程，并循环执行这个过程。

- `timers` ：setTimeout、setInterval的回调，并且该是在poll 阶段回调来执行的；

- `I/O `操作的回调：主要执行系统级别的回调函数，文件读取回调、服务端口的监听回调；

- `idle, prepare` 阶段：仅Node.js内部执行过程；

- `poll` 阶段：轮询等待新的链接和请求等事件，执行 I/O 回调等；

- `check` 阶段：执行 setImmediate() 回调；

- `close 回调` 阶段：执行关闭请求的回调函数，比如socket.on('close', ...)

​        上述每个阶段都会去执行完当前阶段对应的任务队列，然后继续执行当前阶段的微任务队列，只有当前阶段所有微任务都执行完了，才会进入下个阶段。这与浏览器事件循环不同。其中poll阶段会回到timeers阶段执行回调和I/O回调。

### process.nextTick() 

​		上面提到了process.nextTick()，它是node中新引入的一个任务队列，它会在上述各个阶段结束时，在进入下一个阶段之前立即执行。在 Node.js 中，`process.nextTick()` 方法允许你在当前执行栈完成后立即执行一个回调函数。这个回调函数会在当前事件循环的末尾执行，在任何 I/O 操作之前，即使这个 I/O 操作是异步的。这使得 `process.nextTick()` 的执行优先级高于 `setTimeout()` 和 `setImmediate()`。



### 宏任务和微任务

Node.js事件循环的异步队列也分为两种：宏任务队列和微任务队列。

- 常见的宏任务：I/O 操作、setTimeout、setInterval、 setImmediate等。
- 常见的微任务：process.nextTick、promise().then()等。



### setImmediate 和 setTimeout

setImmediate 和 setTimeout，这两者很相似，主要区别在于调用时机的不同：

- **setImmediate**：在poll阶段完成时执行，即check阶段；

- **setTimeout**：在poll阶段为空闲时，且设定时间到达后执行，但它在timer阶段执行；

  

### **Node与浏览器Event Loop差异**

Node.js与浏览器的 Event Loop 差异如下：

- Node.js：microtask 在事件循环的各个阶段之间执行；
- 浏览器：microtask 在事件循环的 macrotask 执行完之后执行；