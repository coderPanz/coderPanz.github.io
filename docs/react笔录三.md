<!--
 * @Author: qs
 * @Date: 2025-01-15 18:02:14
 * @LastEditTime: 2025-01-15 20:24:24
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/react笔录三.md
 *
-->

# react 笔录三-组件状态管理

## React 状态
  State 在组件内部初始化，可以被组件自身修改，而外部不能访问也不能修改。你可以认为 State 是一个局部的、只能被组件自身控制的数据源，State 中状态可以通过 setState 方法进行更新，数据的更新会导致组件的重新渲染。  
  state 很“玄”，不同的执行环境下，或者不同的 React 模式下，State 更新流程都是不同的。React 是有多种模式的，基本平时用的都是 legacy 模式下的 React，除了 legacy 模式，还有 blocking 模式和 concurrent 模式， blocking 可以视为 concurrent 的优雅降级版本和过渡版本，React 最终目的是以 concurrent 模式作为默认版本，这个模式下会开启一些新功能。对于 concurrent 模式会采用不同的 State 更新逻辑。  

## 类组件中的 state
```js
setState(obj, callback) // obj 可以是 function 类型 或 object 对象类型

/* 第一个参数为 object 类型 */
this.setState({ number: 1 }, () => {
  console.log(this.state.number) //获取最新的 number
})

/* 第一个参数为 function 类型 */
this.setState((state, props) => {
  return { number: 1 }
})
```
- 第一个参数 obj：当 obj 为一个对象，则为即将合并的 state。当 obj 是一个函数，那么当前组件的 state 和 props 将作为参数，返回值用于合并新的 state。

- 第二个参数 callback ：callback 为一个函数，函数执行上下文中可以获取当前 setState 更新后的最新 state 的值，可以作为依赖 state 变化的副作用函数，可以用来做一些基于 DOM 的操作。

**setState 的执行流程：**render 阶段 render 函数执行 -> commit 阶段真实 DOM 替换 -> setState 回调函数执行 callback。
- setState 会产生当前更新的优先级（老版本：expirationTime；新版本：lane）。
- 接下来 React 会从 fiber树 根部 向下调和子节点，**调和阶段将对比发生更新的地方**，更新对比 expirationTime/lane ，找到发生更新的组件也就是状态发生改变的组件，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。
- 接下来到 commit 阶段，commit 阶段，替换真实 DOM ，完成此次更新流程。  


类组件如何限制 state 更新视图？
- 使用 PureComponent 或 React.memo 包裹组件，PureComponent 会自动进行浅比较，React.memo 需要手动进行浅比较。
- 使用 shouldComponentUpdate 生命周期函数，手动进行浅比较。

### setState 原理
对于类组件，类组件初始化过程中绑定了负责更新的 Updater 对象。调用 setState 方法，实际上是 React 底层调用 Updater 对象上的 enqueueSetState 方法。  
```js
// react-reconciler\src\ReactFiberClassComponent.js
enqueueSetState(inst: any, payload: any, callback) {
    // 获取当前组件的 fiber 对象
    const fiber = getInstance(inst);
    // 获取调用 setState 的时间
    const eventTime = requestEventTime();
    // 获取当前组件的更新优先级
    const lane = requestUpdateLane(fiber);
    // 创建当前组件的更新对象，这个对象包含更新时间、更新优先级、本次更新的状态变化
    const update = createUpdate(eventTime, lane);
    update.payload = payload;

    // 如果 setState 提供了回调函数（setState(updater, callback)），会将其保存到 update.callback 中。
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }

    // 将更新任务加入 fiber 节点更新队列，返回值 root 表示更新任务所属的 Fiber 树根节点（即 React 应用的根）。
    const root = enqueueUpdate(fiber, update, lane);
    // 如果关联的根节点不为空，则开始调度更新
    if (root !== null) {
      // 更新加入调度器中，触发渲染流程。
      scheduleUpdateOnFiber(root, fiber, lane, eventTime);
      // 处理优先级的关联：entangleTransitions 确保该更新的优先级与其他任务正确关联，避免中断关键任务。
      entangleTransitions(root, fiber, lane);
    }
  }
```

#### 事件系统与批量更新
为什么 react 合成事件需要批量更新？  
因为在 react 事件系统在会涉及到很多场景的 state 更新，例如点击事件、表单输入等。如果如果每次事件触发都立即更新 state，那么每次更新都会导致重新渲染，这会导致性能问题。  
```js
/* 在`legacy`模式下，所有的事件都将经过此函数同一处理 */
function dispatchEventForLegacyPluginEventSystem(){
    batchedEventUpdates(handleTopLevel, bookKeeping);
}

function batchedEventUpdates(fn,a){
    /* 开启批量更新  */
   isBatchingEventUpdates = true;
  try {
    /* 这里执行了的事件处理函数， 比如在一次点击事件中触发setState,那么它将在这个函数内执行 */
    return batchedEventUpdatesImpl(fn, a, b);
  } finally {
    /* try 里面 return 不会影响 finally 执行  */
    /* 完成一次事件，批量更新  */
    isBatchingEventUpdates = false;
  }
}
```
`dispatchEventForLegacyPluginEventSystem` 在 React 的 legacy 模式下，所有 DOM 事件都会通过这个函数进行统一处理。  
- handleTopLevel 是 React 对应事件的处理函数，它负责处理顶层事件（如点击、输入等）。
- bookKeeping 是事件相关的数据对象，用于传递事件上下文信息。  

isBatchingEventUpdates 是一个标志变量，用来指示当前是否处于批量更新模式  
- 设置为 true 表示接下来的状态更新会被收集起来，等批量处理时统一计算。

执行事件处理函数：`batchedEventUpdatesImpl(fn, a, b)`, 执行事件处理逻辑，确保在执行事件时，所有状态更新能被批量处理。  
- fn 是事件处理函数，例如 handleTopLevel。
- 参数 a 是事件处理函数的参数（这里是 bookKeeping）。


恢复批量更新：`isBatchingEventUpdates = false;`  
- 表示当前事件处理完成，恢复批量更新模式。  


setState 并不是单纯同步/异步的，它的表现会因调用场景的不同而不同：在 React 钩子函数及合成事件中，它表现为异步（**批量更新**）；而在 setTimeout、setInterval 等函数中，包括在 DOM 原生事件中，它都表现为同步。这种差异，本质上是由 React 事务机制和批量更新机制的工作方式来决定的。  

原因：  
而当 setTimeout,Promise等异步函数以及原生事件中（非 React 的合成事件，不属于 React 的事件机制）时，isBatchingUpdates 对其没有约束力，批量更新规则被打破。因为 isBatchingUpdates 是在同步代码中变化的，而 setTimeout 的逻辑是异步执行的。当 this.setState 调用真正发生的时候，isBatchingUpdates 早已经被重置为了 false （起不到批量更新的作用），这就使得当前场景下的 setState 具备了立刻发起同步更新的能力。所以咱们前面说的没错—— setState 并不是具备同步这种特性，只是在特定的情境下，它会从 React 的异步管控中“逃脱”掉。  

说白了就是 setState 底层有一个 isBatchingUpdates 来控制 state 是否进行批量更新，并且它属于同步代码，所以当 setTimeout、promise 等异步逻辑中调用 setState 时，isBatchingUpdates 早已变为 false，批量更新规则被打破。  
```jsx
import React, { Component } from 'react';

class SetStateExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      text: '',
    };
  }

  // 合成事件中的批量更新
  handleBatchUpdate = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    console.log('Batch Update:', this.state.count); // 批量更新中，状态不会立即更新
  };

  // 非 React 合成事件中的立即更新
  handleImmediateUpdate = () => {
    setTimeout(() => {
      this.setState({ count: this.state.count + 1 });
      console.log('Immediate Update:', this.state.count); // 立即更新中，状态会同步更新
    }, 0);
  };

  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.handleBatchUpdate}>
          批量更新（React 合成事件）
        </button>
        <button onClick={this.handleImmediateUpdate}>
          立即更新（非合成事件）
        </button>
      </div>
    );
  }
}

export default SetStateExample;
```
**那么，如何在如上异步环境下，继续开启批量更新模式呢？**  
React-Dom 中提供了批量更新方法 unstable_batchedUpdates，可以去手动批量更新。
```jsx
mport ReactDOM from 'react-dom'
const { unstable_batchedUpdates } = ReactDOM

 handleClick = () => {
    setTimeout(() => {
      unstable_batchedUpdates(() => {
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback1', this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback2', this.state.number);
        });
        console.log(this.state.number);
        this.setState({ number: this.state.number + 1 }, () => {
          console.log('callback3', this.state.number);
        });
        console.log(this.state.number);
      });   
    });
  };
```

## 函数组件中的 state
