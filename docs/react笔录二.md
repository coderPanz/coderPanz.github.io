<!--
 * @Author: qs
 * @Date: 2025-01-14 14:14:38
 * @LastEditTime: 2025-01-14 16:06:22
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/react笔录二.md
 *
-->

# react-笔录二
## react 组件
  组件本质上就是类和函数，但是与常规的类和函数不同的是，组件承载了渲染视图的 UI 和更新视图的 setState 、 useState 等方法，函数与类上的特性在 React 组件上同样具有，比如原型链，继承，静态属性等，所以不要把 React 组件和类与函数独立开来。  

### Q1. 类组件和函数组件的执行过程？
类组件的执行涉及到组件实例化；函数式组件涉及到函数调用。
```js
// 类组件的执行
function constructClassInstance(
    workInProgress, // 当前正在工作的 fiber 对象
    ctor,           // 我们的类组件
    props           // props 
){
     /* 实例化组件，得到组件实例 instance */
     const instance = new ctor(props, context)
}

//函数组件的执行
function renderWithHooks(
  current,          // 当前函数组件对应的 `fiber`， 初始化
  workInProgress,   // 当前正在工作的 fiber 对象
  Component,        // 我们函数组件
  props,            // 函数组件第一个参数 props
  secondArg,        // 函数组件其他参数
  nextRenderExpirationTime, //下次渲染过期时间
){
     /* 执行我们的函数组件，得到 return 返回的 React.element 对象 */
     let children = Component(props, secondArg);
}
```

### 类组件
**在 class 组件中，除了继承 React.Component** ，底层还加入了 updater 对象，组件中调用的 setState 和 forceUpdate 本质上是调用了 updater 对象上的 enqueueSetState 和 enqueueForceUpdate 方法。  

```js
function Component(props, context, updater) {
  this.props = props;      //绑定props
  this.context = context;  //绑定context
  this.refs = emptyObject; //绑定ref
  this.updater = updater || ReactNoopUpdateQueue; //上面所属的 updater 对象
}
Component.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
}
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
}
```

**注意：** 如果没有在 constructor 的 super 函数中传递 props，那么接下来 constructor 执行上下文中就获取不到 props。  
```js
constructor(){
  super()
  console.log(this.props) // 打印 undefined
}
/* 解决方案 */
constructor(props){ 
  super(props)
  console.log(this.props); // 打印 props，不会是 undefined
}
```

原因：this.props 的赋值是由 React.Component（父类） 的构造函数完成的，又因为 super() 是调用父类构造函数，所以必须要传入 props 才能在父类中初始化时进行正确的赋值。


### 函数组件
不要尝试给函数组件 prototype 绑定属性或方法， React 对函数组件的调用，是采用直接执行函数的方式，而不是通过 new 的方式。
与类组件的区别：
1. 执行方式：类组件你是通过实例化的方式，而函数式组件是函数调用的方式进行初始化。
2. 状态的保持方式：类组件的实例能够保持组件的状态，对于每一次更新只需要调用 render 方法以及对应的生命周期就可以了；而函数式组件的一次更新都是重新执行函数，所以它本身并不能持久化状态，而是通过 hook 来记录组件状态。

## 组件通信
react 有 5 种主流方式进行组件通信。
- props、callback（父子）
- event bus 事件总线（任意组件通信）
- ref（父直接访问子组件方法和 DOM等信息）
- 状态管理：redux、mobx（复杂数据通信）
- 全局上下文：context（跨组件通信）

### props 和 callback 方式
react 最基本的组件通信方式，父组件通过 props 传递数据给子组件，子组件通过 callback 传递数据给父组件。  

```js
import React, { useState } from 'react';

function ParentComponent() {
  const [message, setMessage] = useState('Hello from Parent');
  // 子组件触发的回调函数，更新父组件的状态
  const handleMessageChange = (newMessage) => {
    setMessage(newMessage);
  };
  return (
    <div>
      <h1>{message}</h1>
      <ChildComponent message={message} onMessageChange={handleMessageChange} />
    </div>
  );
}

function ChildComponent({ message, onMessageChange }) {
  const [inputMessage, setInputMessage] = useState('');
  const handleSubmit = () => {
    onMessageChange(inputMessage); // 调用父组件传递的回调函数
  };
  return (
    <button onClick={handleSubmit}>Update Message</button>
  );
}
export default ParentComponent;
```

### event bus 事件总线
eventBus 也可以实现组件通信，但是在 React 中并不提倡用这种方式，更提倡用 props 方式通信,它更适合用 React 做基础构建的小程序，比如 Taro。  
这样做不仅达到了和使用 props 同样的效果，还能跨层级，不会受到 React 父子组件层级的影响。但是为什么很多人都不推荐这种方式呢？因为它有一些致命缺点。

- 需要手动绑定和解绑。
- 对于小型项目还好，但是对于中大型项目，这种方式的组件通信，会造成牵一发动全身的影响，而且后期难以维护，组件之间的状态也是未知的。
- 一定程度上违背了 React 数据流向原则。

### ref 实现组件通信
  有的时候不需要向子组件传递数据，而是需要直接访问子组件的方法，那么就可以使用 ref 来实现组件通信，父组件可以通过 ref 模式标记子组件实例，从而操纵子组件方法。  

场景一： 父组件调用子组件方法，父组件存在一个按钮可以控制子组件弹窗的显示和隐藏，或者是触发子组件的动画逻辑。
场景二： 父组件控制子组件 DOM 元素，父组件在基于某个操作之后让子组件的输入框设置焦点。

类组件：父组件使用 ref 标记子组件实例  
函数式组件：由于函数组件没有实例，所以需要 forwardRef 进行 ref 转发 + useImperativeHandle 进行子组件方法暴露  

#### forwardRef 原理
forwardRef 是一个高阶函数，允许你将 ref 转发到子组件内部的某个元素。  
它接受一个函数组件或类组件，并返回一个新的组件。这个新的组件在渲染时会接收一个额外的 ref 参数，子组件可以使用这个 ref 放到 DOM 元素或组件上，父组件就可以通过 ref 访问到子组件的 DOM 元素或组件。

```js
const ChildComponent = React.forwardRef((props, ref) => {
  return <div ref={ref}>Child Component</div>;
});

const ParentComponent = () => {
  const childRef = useRef(null);
  return <ChildComponent ref={childRef} />;
};
```

#### useImperativeHandle 原理
useImperativeHandle 是 React 的一个 Hook，用于在使用 forwardRef 包裹的子组件中自定义暴露给父组件的 ref内容，也就是父组件通过 ref 访问子组件时，只能访问到 useImperativeHandle 暴露的内容，其实它的目的就是限制父组件对子组件的访问权。
```js
useImperativeHandle(ref, createHandle, [deps])
```

ref: 父组件传递过来的 ref
createHandle: 返回一个对象，父元素可访问其中的 ref 内容
deps: 依赖项，当父组件传递的 ref 发生变化时，会重新执行 useImperativeHandle 函数，并返回新的 ref 内容
```js
const ChildComponent = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
  }));
  return <input ref={inputRef} />;
});

// 父组件
const ParentComponent = () => {
  const childRef = useRef(null);
  useEffect(() => {
    if (childRef.current) {
      childRef.current.focus(); // 调用子组件暴露的 focus 方法
    }
  }, [childRef]);
  return <ChildComponent ref={childRef} />;
};
```


### context 实现组件通信
context 是 React 提供的一种全局上下文，可以跨组件通信，但是它也有一些缺点。  
- 数据流向不明确，难以追踪数据变化。
- 数据更新时，所有使用该 context 的组件都会重新渲染，性能较差。
- 容易造成组件滥用，导致难以维护。  

使用流程：  
1. createContext 创建 context 对象
2. 使用 Provider 组件包裹需要使用 context 的组件
3. 在需要使用 context 的组件中，使用 useContext 钩子获取 context 对象
```js
const MyContext = React.createContext(null);
function ParentComponent() {
  return <MyContext.Provider value="Hello from Parent">
    <ChildComponent />
  </MyContext.Provider>;
}

// 子组件
function ChildComponent() {
  const context = React.useContext(MyContext);
  return <div>{context}</div>;
}
``` 

## 受控组件和非控组件
它们之间的主要区别在于组件的状态是如何管理的。
**受控组件**  
受控组件是指 React 中的表单元素（如 `<input>`、`<textarea>`、`<select>` 等）通过 React 的 state 来管理其值。这意味着表单元素的当前值始终由 React 组件的状态来控制，任何对表单的修改都会通过 React 组件的状态更新，并且 React 负责更新 UI。  
关键特征：  
- 表单元素的值完全由组件的 state 控制的。
- 当用户输入时，onChange 事件处理函数会被触发，更新 state，然后 React 会重新渲染组件。

缺点：  
对于复杂表单或大量的表单控件，可能会增加额外的代码和开销，因为每次输入变化都需要通过 state 更新并重新渲染。  


**非受控组件**  
非受控组件是指表单元素的值由 DOM 自身管理，而不是通过 React 的状态管理。在这种情况下，React 只在需要时访问 DOM 元素的值，而不直接控制其状态。  
关键特征：  
- 表单元素的值是由 DOM 自身管理的，React 不干涉。
- 使用 ref 获取 DOM 进行访问

优点：  
- 比受控组件更简洁，尤其是对于简单的表单和少量的输入字段。
- 性能更好，避免每次输入变化都重新渲染组件。



