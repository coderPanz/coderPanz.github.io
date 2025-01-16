# react笔录四-生命周期
## 生命周期
  React 类组件为开发者提供了一些生命周期钩子函数，能让开发者在 React 执行的重要阶段，在钩子函数里做一些该做的事。自从 React Hooks 问世以来，函数组件也能优雅地使用 Hooks ，弥补函数组件没有生命周期的缺陷。  


### class组件生命周期
  React 两个重要阶段，render 阶段和 commit 阶段，React 在调和( render )阶段会深度遍历 React fiber 树，目的就是发现不同( diff )，不同的地方就是接下来需要更新的地方，对于变化的组件，就会执行 render 函数。在一次调和过程完毕之后，就到了commit 阶段，commit 阶段会创建修改真实的 DOM 节点。  


#### 生命周期执行过程
  React 的大部分生命周期的执行，都在 mountClassInstance 和updateClassInstance 这两个方法中执行，把流程简化成 mount (初始化渲染) 和 update (更新)两个方向。从组件初始化，组件更新 ， 组件销毁 ，三大阶段分析。  

**初始化阶段**  
- constructor 执行：在 mount 阶段，首先执行的 constructClassInstance 函数，用来实例化 React 组件，组件中 constructor 就是在这里执行的。在实例化组件之后，会调用 mountClassInstance 组件初始化。  
- getDerivedStateFromProps 执行： 在初始化阶段，getDerivedStateFromProps 是第二个执行的生命周期，值得注意的是它是从 ctor 类上直接绑定的静态方法，传入 props ，state 。 返回值将和之前的 state 合并，作为新的 state ，传递给组件实例使用。  
- componentWillMount 执行：如果存在 getDerivedStateFromProps 和 getSnapshotBeforeUpdate 就不会执行生命周期componentWillMount。  
- render 函数执行：到此为止 mountClassInstancec 函数完成，但是上面 updateClassComponent 函数， 在执行完 mountClassInstancec 后，执行了 render 渲染函数，形成了 children ， 接下来 React 调用 reconcileChildren 方法深度调和 children 。  
- componentDidMount执行：一旦 React 调和完所有的 fiber 节点，就会到 commit 阶段，在组件初始化 commit 阶段，会调用 componentDidMount 生命周期。  

**更新阶段**  
- 执行生命周期 componentWillReceiveProps：传入该生命周期两个参数，分别是 newProps 和 nextContext 。
-  getDerivedStateFromProps：返回的值用于合并state，生成新的state。
- 接下来执行 shouldComponentUpdate ，传入新的 props ，新的 state ，和新的 context ，返回值决定是否继续执行 render 函数，调和子节点。
- 接下来执行 componentWillUpdate，updateClassInstance 方法到此执行完毕了。
- 执行 render 函数：得到最新的 React element 元素。然后继续调和子节点。
- getSnapshotBeforeUpdate，该函数发生在 commit 阶段，commit 阶段细分为 before Mutation( DOM 修改前)，Mutation ( DOM 修改)，Layout( DOM 修改后) 三个阶段，发生在 before Mutation 阶段
- componentDidUpdate：接下来执行生命周期 componentDidUpdate ，此时 DOM 已经修改完成。可以操作修改之后的 DOM 。到此为止更新阶段的生命周期执行完毕。

**销毁阶段**  
- 执行 componentWillUnmount 生命周期，销毁阶段的生命周期执行完毕。

### 函数组件
没有类组件的生命周期方法。然而，React 提供了一些 Hook（钩子）来代替类组件中的生命周期功能，最常用的钩子包括 useState、useEffect 和 useContext 等。这些钩子允许你在函数式组件中实现与类组件生命周期相同的行为。  
#### useEffect
useEffect 代替 componentDidMount、componentDidUpdate 和 componentWillUnmount 。  
**useEffect 代替 componentDidMount**  
```jsx
useEffect(() => {
  // 只有在组件挂载时执行
  console.log('Component mounted');
}, []); // 空依赖数组
```

**useEffect 代替 componentDidUpdate**  
```jsx
useEffect(() => {
  // 在组件更新时执行
  console.log('Component updated');
}, [count]); // 依赖于 count 的变化
```

**useEffect 代替 componentWillUnmount**  
```jsx
useEffect(() => {
  return () => {
    // 组件卸载时执行
    console.log('Component will unmount');
  };
}, []); // 空依赖数组
```
在函数式组件中，我们用 Hooks 来替代类组件中的生命周期方法：  
- useState：替代 this.state 和 this.setState()。
- useEffect：替代 componentDidMount、componentDidUpdate、componentWillUnmount。
- useReducer：替代 setState，适用于更复杂的状态管理。
- useContext：替代 contextType 和 Context.Consumer，使得获取和使用上下文更加简便。
- useRef：替代 createRef，用于引用 DOM 元素或组件实例。  

## QA
### Q1. useEffect/useLayoutEffect/useInsertionEffect 有什么区别？
useLayoutEffect 是 useEffect 的一个版本，在浏览器绘制屏幕之前触发，此 Hook 用于执行需要与 DOM 布局相关的副作用，它可以阻止浏览器绘制，直到副作用执行完成。  
适用场景：
- 需要测量 DOM 元素的尺寸或位置。
- 修改 DOM 元素的样式，确保样式更新在浏览器绘制之前完成。  


useInsertionEffect 在 DOM 元素插入之前执行，是为 CSS-in-JS 库的作者特意打造的。除非你正在使用 CSS-in-JS 库并且需要注入样式，否则你应该使用 useEffect 或者 useLayoutEffect。  
适用场景：
- 样式注入和 CSS 操作：如果你需要在元素被插入 DOM 之前执行副作用，useInsertionEffect 特别适用于样式和 CSS 操作，确保样式尽可能快地应用到 DOM 上。
- 主要用于与样式（CSS）相关的第三方库，或者与 CSS 变量、全局样式等操作相关的优化。  
```jsx
useInsertionEffect(() => {
  // 在 DOM 插入之前执行，适用于样式等操作
  const style = document.createElement('style');
  style.innerHTML = `#myElement { background-color: red; }`;
  document.head.appendChild(style);
}, [dependency]);
```

useEffect：在浏览器绘制完成后执行：useEffect 会在所有 DOM 更新（布局和绘制）之后执行，用于连接外部系统，例如异步请求，事件监听。  

  **总结**：在大多数情况下，推荐使用 useEffect，因为它不会阻塞渲染过程。而 useLayoutEffect 和 useInsertionEffect 应该仅在有特殊需求时使用，特别是当你需要直接操作 DOM 或样式时。  
