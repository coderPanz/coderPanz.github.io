<!--
 * @Author: qs
 * @Date: 2025-01-15 18:02:14
 * @LastEditTime: 2025-01-16 14:52:08
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/react笔录三.md
 *
-->

# react 笔录三-组件状态管理-Props

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
函数式组件使用 useState 钩子函数来管理状态。
```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return <div>Count: {count}</div>;
}
```
`api: [ state , setState ] = useState(initData)`  
- state 是组件内部的状态数据。
- setState 是用于更新 state 的函数。
- initData 有两种情况，第一种情况是非函数，将作为 state 初始化的值。 第二种情况是函数，函数的返回值作为 useState 初始化的值。  

**如何监听 state 变化？**  
  类组件 setState 中，有第二个参数 callback 或者是生命周期 componentDidUpdate 可以检测监听到 state 改变或是组件更新。  
那么在函数组件中，如何怎么监听 state 变化呢？这个时候就需要 useEffect 出场了，通常可以把 state 作为依赖项传入 useEffect 第二个参数 deps ，但是注意 useEffect 初始化会默认执行一次。  
```jsx
useEffect(() => {
  // 组件初始化后默认执行一次后，当再次执行式代表 state 变化了
  console.log('state 变化了');
}, [state]);
```

**注意⚠️：** 在本次函数执行上下文中，是获取不到最新的 state 值的，由于 state 状态发生改变导致函数组件更新，函数组件的更新就是函数的执行，在函数一次执行过程中，函数内部所有变量重新声明，所以改变的 state ，只有在下一次函数组件执行时才会被更新。所以在如上同一个函数执行上下文中，number 一直为 0，无论怎么打印，都拿不到最新的 state 。  
可以这么理解，state 状态的更新导致函数组件的更新意味着函数重新执行，它会创建一个新的函数执行上下文，最新的状态只有在这个新的执行上下文中才能拿到，而你在当前函数执行上下文中尝试 console.log(state) ，肯定拿到的都是旧值。

**useState 的性能优化**  
useState 会对 state 进行浅比较，如果 state 的值没有发生变化（例如修改对象的属性 old: obj.a = 1，new: obj.a = 2），则不会重新渲染组件。  
原理：因为这次修改都指向了同一个内存空间，所以默认认为没有发生变化，就不会发生重新渲染；如果改为 `useState({...obj})` ，那么 obj 的内存空间发生变化，就会发生重新渲染。  


## QA
### 类组件中的 setState 和函数组件中的 useState 有什么异同？  
首先从原理角度出发，setState和 useState 更新视图，底层都调用了 scheduleUpdateOnFiber 方法，而且事件驱动情况下都有批量更新规则。  
- 在不是 pureComponent 组件模式下， setState 不会浅比较两次 state 的值，只要调用 setState，在没有其他优化手段的前提下，就会执行更新。但是 useState 中的 dispatchAction 会默认比较两次 state 是否相同，然后决定是否更新组件。
- setState 有专门监听 state 变化的回调函数 callback，可以获取最新state；但是在函数组件中，只能通过 useEffect 来执行 state 变化引起的副作用。
- setState 在底层处理逻辑上主要是和老 state 进行合并处理，而 useState 更倾向于重新赋值。

### 

### state 相关的代码输出题
```jsx
// 第一道
const [arr, setArr] = useState([]);
const test = () => {
  arr.push({});
};
console.log(arr); // 未打印（setArr 未执行且没有触发 render）
return <div onClick={test}>App</div>

// 第二道
const [arr, setArr] = useState([]);
const test = () => {
  arr.push({});
  setArr(arr);
};
console.log(arr); // 未打印（arr 内存地址没有改变，所以没有监听到变化，setArr 没有触发 render）
return <div onClick={test}>App</div>

// 第三道
const [arr, setArr] = useState([]);
const test = () => {
  setArr([]);
};
console.log(arr); // 打印（ [] !== []，内存地址变了，触发 render）
return <div onClick={test}>App</div>
```

**dispatch 注意事项 - 非函数和函数情况**  
```jsx
// 非函数
// 非函数情况，此时将作为新的值，赋予给 state，作为下一次渲染使用
// 例1：直接传递对象的 setState 会被合并成一次
componentDidMount() {
  this.setState({ index: this.state.index + 1 }, () => {
    console.log(this.state.index);  // 1
  })
  this.setState({ index: this.state.index + 1 }, () => {
    console.log(this.state.index); // 1
  })
}
// 例2：
const [ number , setNumber ] = React.useState(0)
const handleClick = () => {
  setNumber(2) // => number = 2
  setNumber(number + 1) // => number = 0 + 1 = 1
  setNumber(number + 1) // => number = 0 + 1 = 1
};
// 例3：
const [count, setCount] = useState(0);
const test = () => {
  setTimeout(() => {
    setCount(count + 1);
  }, 3000);
  console.log(count);
};
return <div onClick={test}>App</div>;
// 输出：0->0->0->...->1
// 原因：闭包旧值，每次 setCount 的 count为 0+1

// 函数
// 函数的情况，如果 dispatch 的参数为一个函数，这里可以称它为 reducer 参数，是上一次返回最新的 state，返回值作为新的 state。
// 例1：使用函数传递 state 不会被合并
componentDidMount() {
  this.setState((preState) => ({ index: preState.index + 1 }), () => {
    console.log(this.state.index); // 2
  })
  this.setState(preState => ({ index: preState.index + 1 }), () => {
    console.log(this.state.index); // 2
  })
}
// 例2：
const [ number , setNumber ] = React.useState(0)
const handleClick = () => {
  setNumber((state) => state + 1) // => number = 0 + 1 = 1
  setNumber((state) => state + 1) // => number = 1 + 1 = 2
  setNumber(8)  // state - > 8
  setNumber((state)=> state + 1)  // number - > 8 + 1 = 9
};
// 例3：
const [count, setCount] = useState(0);
const test = () => {
  setTimeout(() => {
    setCount(count => count + 1);
  }, 3000);
  console.log(count);
};
return <div onClick={test}>App</div>;
// 输出：0->1->1->...->1
```
**结论：**  
- 非函数情况下：setNumber 将参数作为新的值赋予 state，下一次渲染时使用。直接传递对象的 setstate 会被合并成一次。
- 函数情况下：传入函数的入参是上一次返回的最新 state，而函数的返回值作为新的值赋予 state，下一次渲染使用。使用函数传递 state 不会被合并。  


**setState 批量更新？同步异步？**  
```jsx
// class 组件 - setState
// 情况1：react 17及之前且在非 setTimeout、事件监听器等异步操作中
// 钩子函数和 React 合成事件中
class App extends Component {
    constructor() {
        super();
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        this.setState({
            count: 1
        });
        console.log(this.state.count);
        this.setState({
            count: 2
        });
        console.log(this.state.count);
    }
    render() {
        console.log('render', this.state.count); // 最终是 2
        return <div>{this.state.count}</div>;
    }
}
// 输出：render 0 -> 0 0 -> render 2
// 结论：setState 是异步的，批量的，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。两次打印都是 0，而且两次 setState 只触发了一次 render，加上最开始的 render，一共两次，打印 0、2。说明此情况下 setState 是异步的。

// 情况2：react 17及之前且在 setTimeout、事件监听器等异步操作中
class App extends Component {
    constructor() {
        super();
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
setTimeout(() => {
            this.setState({
                count: 1
            });
            console.log(this.state.count);
            this.setState({
                count: 2
            });
            console.log(this.state.count);  
        });
    }
    render() {
        console.log('render', this.state.count); // 最终是 2
        return <div>{this.state.count}</div>;
    }
}
// 输出：render 0 -> render 1 -> 1 -> render 2 -> 2
// 结论：异步操作里面的批量更新规则会被打破。setState 在 setTimeout 异步函数中同步修改了 state，且然后每次都触发了渲染，一共 render 3 次，分别是 0、1、2。说明 react 17及之前且在 setTimeout、事件监听器等异步操作中 setState 是同步的，非批量的，每次 setState 后 state 马上变，每次修改 state 都会 render。
// 手动批量更新：React-Dom 中提供了批量更新方法 `unstable_batchedUpdates`，可以去手动批量更新，使其在异步操作中 setState 批量更新。

// function 函数组件 - useState
// 情况1：react 17及之前且在非 setTimeout、事件监听器等异步函数或原生事件中
function App(){
    const [count, setCount] = useState(0);
    useEffect(() => {
        setCount(1);
        setCount(2);
        setCount(3);
    }, [])
    console.log('render:', count); // 最终是 3
    return <div>{count}</div>;
}
// 输出：render 0 ->  render 3
// 结论：react 17及之前，与 setState 一样，三次 setState 只触发了一次 render，此条件下 useState 是异步的，批量的，合并 state，然后触发 render 函数，得到新的 UI 视图层，完成 render 阶段。

// 情况2：react 17及之前且在 setTimeout、事件监听器等异步函数或原生事件中
function App(){
    const [count, setCount] = useState(0);
     useEffect(() => {
      setTimeout(() => {
        setCount(1);
        setCount(2);
        setCount(3);
      });
    }, [])
    console.log('render:', count);// 最终是 3
    return <div>{count}</div>;
}
// 输出：render 0 -> render 1 -> render 2 -> render 3
// 结论：react 17及之前，异步操作里面的批量更新规则会被打破。与 setState 一样，在 setTimeout 里，useState 是同步的，非批量的，每次 setState 后 state 马上变，每次修改 state 都会 render。
```


## Props
  父组件绑定在它们标签里的属性/方法，最终会变成 props 传递给它们。但是这也不是绝对的，对于一些特殊的属性，比如说 ref 或者 key ，React 会在底层做一些额外的处理。首先来看一下 React 中 props 可以是些什么东西？  
  说白了就是父组件传递给子组件的数据，或者是说是组件通信的一种方式。  
PropsComponent 如果是一个类组件，那么可以直接通过 this.props 访问到它。在标签内部的属性和方法会直接绑定在 props 对象的属性上，对于组件的插槽会被绑定在 props 的 Children 属性中。  

**监听 props 改变**  
- 在类组件中使用 getDerivedStateFromProps 生命周期函数，可以监听到 props 的改变。  
- 在函数组件中使用 useEffect 钩子函数，可以监听到 props 的改变。  

### props 模式  
在 React 中，props 是组件间传递数据的方式。props 可以通过不同的模式来进行传递和处理，以下是一些常见的模式：  

**1. 基本传值模式**  
这是 React 中最基础的 props 使用模式。父组件通过 props 将数据传递给子组件，子组件通过 props 接收这些数据。  
```jsx
function Parent() {
  const message = "Hello from Parent!";
  return <Child message={message} />;
}

function Child(props) {
  return <p>{props.message}</p>;
}
```

**2. 默认 Props 模式**  
React 允许为组件的 props 设置默认值。当父组件没有传递某个 prop 时，组件将使用默认值。
```jsx
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}

Greeting.defaultProps = {
  name: 'Guest',
};

export default Greeting;
```
在上面的例子中，Greeting 组件的 name 如果没有传递，则会使用 'Guest' 作为默认值。  

**3. 函数作为 Props**  
在 React 中，函数可以作为 props 传递给子组件，子组件可以通过调用该函数来与父组件进行通信。  
```jsx
function Parent() {
  const handleClick = () => {
    alert('Button clicked in Parent');
  };
  return <Child onClick={handleClick} />;
}

function Child(props) {
  return <button onClick={props.onClick}>Click Me</button>;
}
```
在这个例子中，Parent 将一个函数 handleClick 作为 onClick 传递给 Child，当按钮被点击时，Child 调用父组件传递的函数。  


**4. 组件作为 Prop**  
这个模式也叫做 render props，它通过将一个组件或函数作为 prop 传递给子组件，使子组件能够渲染由父组件定义的内容。  
```jsx
function Container({ render }) {
  const ContainerProps = {
    name: 'React',
    message: 'Render Props Example'
  };
  return render(ContainerProps);
}

function Parent() {
  return (
    <Container render={(props) => <Child {...props} />} />
  );
}

function Child({ name, message }) {
  return (
    <div>
      <h1>{name}</h1>
      <p>{message}</p>
    </div>
  );
}
```
在这个例子中，Container 组件接收一个 render 函数作为 prop，并将数据传递给该函数。在 Parent 组件中，render 函数定义了 Child 组件的渲染方式。  

