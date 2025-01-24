<!--
 * @Author: qs
 * @Date: 2025-01-16 16:20:59
 * @LastEditTime: 2025-01-16 16:51:10
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/react笔录五.md
 *
-->

# react 笔录五

## Ref 对象
所谓 ref 对象就是用 createRef 或者 useRef 创建出来的对象，它是一个对象，里面有一个 current 属性，这个属性就是用来存储 DOM 元素或者组件实例的。
```js
// 标准的 ref 对象
const ref = { current: null }

// 创建 ref 对象
const fn_ref = useRef(null)
const class_ref = React.createRef(null)
```

**注意**：不要在函数组件中使用 createRef，否则会造成 Ref 对象内容丢失等情况，也就是 ref.current 丢失现象。  
useRef 底层逻辑是和 createRef 差不多，**就是 ref 保存位置不相同**，类组件有一个实例 instance 能够维护像 ref 这种信息，函数式组件随着组件的更新，ref 也会被重置，无法保存更新前的 ref 信息。  

为了解决这个问题，hooks 和函数组件对应的 fiber 对象建立起关联，将 useRef 产生的 ref 对象挂到函数组件对应的 fiber 上，函数组件每次执行，只要组件不被销毁，函数组件对应的 fiber 对象一直存在，所以 ref 等信息就会被保存下来。  


### ref 高阶用法
除了获取 DOM 元素或者组件实例以外，ref 派生出一些其他的高级用法，能够解决一些特殊场景下的问题。  
- forwardRef 转发 Ref
- ref 实现组件通信
- 函数组件缓存数据

#### 跨层级获取数据-ref 转发-组件通信
下列例子中同时包含了 ref 几种高阶用法。  

```jsx
import React, { useRef } from 'react';

// Child 组件
const Child = React.forwardRef((props, ref) => {
  const inputRef = useRef();

  React.useImperativeHandle(ref, () => ({
    getValue: () => {
      return inputRef.current.value;
    }
  }));

  return <input ref={inputRef} />;
});

// Parent 组件
function Parent(props) {
  return <Child ref={props.childRef} />;
}

// GrandParent 组件
function GrandParent() {
  const childRef = useRef();

  const handleClick = () => {
    // 通过 `childRef` 获取 `Child` 组件的数据
    alert('Child input value: ' + childRef.current.getValue());
  };

  return (
    <div>
      <Parent childRef={childRef} />
      <button onClick={handleClick}>Get Child Input Value</button>
    </div>
  );
}

export default GrandParent;
```

#### 函数组件缓存数据
  函数组件每一次 render ，函数上下文会重新执行，那么有一种情况就是，在执行一些事件方法改变数据或者保存新数据的时候，有没有必要更新视图，有没有必要把数据放到 state 中。如果视图层更新不依赖想要改变的数据，那么 state 改变带来的更新效果就是多余的。这时候更新无疑是一种性能上的浪费。  
  这时候 ref 就派上用场了，ref 可以保存数据，如果是函数式组件，底层还有 fiber 挂钩保存数据，所以只要组件不销毁，ref 保存的数据就不会丢失。  

- 修改数据可以避免不必要的更新。
- 第二个 useRef 保存数据，底层使用 fiber 结构保存， useRef 始终指向一个内存空间，所以这样一点好处是可以随时访问到变化后的值。  

**应用场景**  
- 访问 DOM 元素（设置焦点、获取元素尺寸）
- 如计时器的 ID
- 控制表单元素








