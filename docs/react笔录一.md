# react 笔录一

## 关于 JSX
JSX 元素节点会被 react 编译成 React Element 形式。
```js
React.createElement(
  type, // 函数式/类组件、dom 元素
  [props], // 组件类型为 props、dom 类型为元素属性（href、class等）
  [...children] // 子元素/子组件
)
```

react 编译进入调和阶段：React element 对象的每一个子节点都会形成一个与之对应的 fiber 对象，然后通过 sibling、return、child 将每一个 fiber 对象联系起来。  

React 针对不同 React element 对象会产生不同的fiber 对象。
```js
export const FunctionComponent = 0;       // 函数组件
export const ClassComponent = 1;          // 类组件
export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件 
export const HostRoot = 3;                // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素
export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal 
export const HostComponent = 5;           // dom 元素 比如 <div>
export const HostText = 6;                // 文本节点
export const Fragment = 7;                // 对应 <React.Fragment> 
export const Mode = 8;                    // 对应 <React.StrictMode>   
export const ContextConsumer = 9;         // 对应 <Context.Consumer>
export const ContextProvider = 10;        // 对应 <Context.Provider>
export const ForwardRef = 11;             // 对应 React.ForwardRef
export const Profiler = 12;               // 对应 <Profiler/ >
export const SuspenseComponent = 13;      // 对应 <Suspense>
export const MemoComponent = 14;          // 对应 React.memo 返回的组件
```
fiber 对应关系：
- child： 一个由父级 fiber 指向子级 fiber 的指针。
- return：一个子级 fiber 指向父级 fiber 的指针。
- sibling: 一个 fiber 指向下一个兄弟 fiber 的指针。



## Babel 解析 JSX 流程
  JSX并不是只能被编译为 React.createElement 方法，你可以通过@babel/plugin-transform-react-jsx (opens new window) (opens new window)插件显式告诉 Babel 编译时需要将JSX编译为什么函数的调用（默认为React.createElement）。  

- @babel/plugin-syntax-jsx ： 使用这个插件，能够让 Babel 有效的解析 JSX 语法。
- @babel/plugin-transform-react-jsx ：这个插件内部调用了 @babel/plugin-syntax-jsx，可以把 React JSX 转化成 JS 能够识别的 createElement 格式。


### Automatic Runtime
新版本 React 已经不需要引入 createElement ，这种模式来源于 Automatic Runtime:  
```js
// 业务代码
function Index() {
  return (
    <div>
      <h1>hello,world</h1>
      <span>let us learn React</span>
    </div>
  )
}

// 编译结果
import { jsx as _jsx } from "react/jsx-runtime"
import { jsxs as _jsxs } from "react/jsx-runtime"
function Index() {
  return _jsxs("div", {
    children: [
      _jsx("h1", {
        children: "hello,world",
      }),
      _jsx("span", {
        children: "let us learn React",
      }),
    ],
  })
}
```
plugin-syntax-jsx 已经向文件中提前注入了 _jsxRuntime api。不过这种模式下需要我们在 .babelrc 设置 runtime: automatic 。  
```json
"presets": [    
    ["@babel/preset-react",{
    "runtime": "automatic"
    }]     
],
```

### Classic Runtime
在经典模式下，使用 JSX 的文件需要引入 React ，不然就会报错, 因为编译后会使用 React.createElement 方法，所以需要引入 React 。  
```js
// 业务代码
import React from "react"
function Index() {
  return (
    <div>
      <h1>hello,world</h1>
      <span>let us learn React</span>
    </div>
  )
}

// 编译后文件
import React from "react"
function Index() {
  return React.createElement(
    "div",
    null,
    React.createElement("h1", null, "hello,world"),
    React.createElement("span", null, "let us learn React")
  )
}
```

## QA
### Q1 老版本（React 17 之前）的 React 中，为什么写 jsx 的文件要默认引入 React? 
因为老版本的 React 中，JSX 编译为 React.createElement 的形式，所以需要引入 React ，@babel/plugin-syntax-jsx ,在编译的过程中注入 _jsxRuntime api ，使得新版本 React 已经不需要引入 createElement， babel 帮我们进行自动引入了。  

### Q2. React.createElement 和 React.cloneElement 到底有什么区别?  
React.createElement 是创建一个 React element 对象，React.cloneElement 它可以在克隆现有元素的同时，修改其属性（props）或添加子元素（children），然后返回一个新的 React element 对象。  

### Q3. React.createElement 做了什么事情？  
React.createElement 是 React 的核心方法之一，用于创建 React 元素，jsx 被编译为 React.createElement 并进行调用。  
```js
React.createElement(
  type, // 函数式/类组件、dom 元素
  [props], // 组件类型为 props、dom 类型为元素属性（href、class等）
  [...children] // 子元素/子组件
)
```
创建一个 js 对象，也称为虚拟 dom 对象或者 react element 对象。

### Q4. JSX 的安全性
React 的安全性主要通过 自动转义、显式标记危险操作、事件系统 和 工具提示 等机制实现，减少了开发过程中常见的安全漏洞。
1. 自动转义  
React 默认会对 JSX 中的所有插值内容（如 {} 中插入的变量）进行 HTML 实体转义，以避免注入恶意代码。
```js
const userInput = '<script>alert("XSS")</script>';
const element = <div>{userInput}</div>;
// 输出：<div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
```

2. 禁止使用危险的 HTML  
React 提供了一个 dangerouslySetInnerHTML 属性，用于直接插入 HTML, 避免 react 进行自动转义，但明确标记为“危险”。使用时需要开发者显式声明，并承担潜在的安全风险。  
```js
const dangerousHtml = { __html: '<img src="x" onerror="alert(1)" />' };
const element = <div dangerouslySetInnerHTML={dangerousHtml}></div>;
```

3. 事件系统
React 在事件处理上使用了 合成事件 系统，而非直接操作 DOM。这种机制可以降低攻击者通过事件注入的风险。
例如： 如果攻击者尝试在 onClick 中插入脚本：
```jsx
const handleClick = 'alert("XSS")';
<button onClick={handleClick}>Click Me</button>
```
React 不会执行字符串形式的代码，只接受一个函数作为事件处理器。

4. 严格模式
React 的 严格模式（Strict Mode）会提示开发者不安全的用法，如：
- 使用未转义的 HTML。
- 滥用 dangerouslySetInnerHTML。
- 存在潜在的漏洞代码。

通过这些机制，React 在开发过程中提供了多层次的安全保护，确保了应用程序的安全性。

### Q5. JSX 与 Fiber 节点间的关系  
JSX 的角色：静态描述 ui 的结构。
- 描述了组件树的结构。
- 包含组件的类型和 props 信息。
- **没有运行时状态信息**，比如组件的状态 state、优先级、或用于标记的渲染标志。

Fiber 节点是 React 的运行时数据结构  
React 在运行时使用 Fiber 节点 来表示每个组件或 DOM 元素的状态。Fiber 节点记录了 JSX 所不具备的信息，允许 React 高效地协调和更新组件。  
运行时状态：  
- 当前组件的 state。
- pendingProps：等待生效的属性。
- memoizedProps：上一次渲染的属性。
- memoizedState：上一次渲染的状态。

调度信息：  
- 优先级：当前节点更新的优先级。
- 时间戳：调度时的时间点。

树形结构：  
- child：指向子 Fiber 节点。
- sibling：指向兄弟 Fiber 节点。
- return：指向父 Fiber 节点。
这些信息形成了一个高效的链表结构，便于遍历和操作。

标志位（Flags）：  
- 用于标记当前节点是否需要更新（例如 Placement、Update 或 Deletion 等）。

JSX 与 Fiber 节点的交互：Mount 和 Update  
(1) 组件挂载时 (Mount)  
当组件首次渲染时：  
Reconciler 根据 JSX 创建 Fiber 节点。Fiber 节点初始化时，填充了 JSX 描述的信息以及调度、状态、标记等运行时信息。  
1. 创建 React Element：
```js
{
  type: 'div',
  props: { children: 'Hello, React!' }
}
```

2. 初始化 Fiber 节点：
```js
{
  type: 'div',
  props: { children: 'Hello, React!' },
  memoizedProps: null,
  memoizedState: null,
  child: null,
  sibling: null,
  return: null,
  flags: Placement,
}
```

(2) 组件更新时 (Update)
当组件的 props 或 state 发生变化时：  
- React 会生成新的 React Element（通过 JSX 描述的）。
- Reconciler 比较新旧 JSX 对应的 Fiber 节点（Diff 算法），标记需要更新的部分。
- 生成新的 Fiber 节点（或复用现有节点），更新状态和标志。

Fiber 节点的标记 (Flags)  
在更新过程中，Fiber 节点会根据比较结果打上不同的标记，这些标记决定了如何更新真实的 DOM：
- Placement：表示需要将新节点插入到 DOM 中。
- Update：表示需要更新现有节点。
- Deletion：表示需要删除节点。


总结：
- JSX 描述的是“静态结构”，Fiber 节点描述的是“运行时状态”。
- JSX 描述组件的结构和属性。
- Fiber 节点扩展了 JSX 的内容，增加了状态、优先级和标记。
- Fiber 节点通过链表的形式构建了一棵树，用于高效更新和渲染 DOM。
- React 在组件的每次更新时都会基于 JSX 和 Fiber 节点进行对比，并通过标记决定如何更新 DOM。

### Q6. 为什么 React 要用 JSX？  
  JSX 是一个 JavaScript 的语法扩展，结构类似 XML。JSX 主要用于声明 React 元素，但 React 中并不强制使用 JSX。即使使用了 JSX，也会在构建过程中，通过 Babel 插件编译为 React.createElement。所以 JSX 更像是 React.createElement 的一种语法糖。  
  也可以直接写 React.createElement ，但是 JSX 更直观，更符合直觉，就类似于 vue 中的 template 语法。