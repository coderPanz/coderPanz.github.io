# this指向

在 JS 中，this 的指向是在函数调用时才被确定的。<br>

- 默认绑定
- 隐私绑定
- 显示绑定
- new 绑定<br>
- DOM 事件处理函数绑定

## 默认绑定

独立函数调用，this 指向到全局对象中。严格模式下，指向 undefined。

```js
const foo = () => console.log(this);
foo(); // 输出: window

("use strict");
const bar = () => console.log(this);
bar(); // undefined
```

## 隐式绑定

函数作为对象的方法被调用时，this 指向该对象。

```js
const obj = {
  name: "Alice",
  sayName() {
    console.log(this.name);
  },
};
obj.sayName(); // 输出: Alice
```

### 隐式绑定丢失

1、**参数传递丢失**：将**一个对象方法传入另一个函数进行调回**，这里相当于在一个函数中进行独立函数调用

```js
const obj = {
  baz: function () {
    console.log(this); // window
  },
};

function lose(fn) {
  fn();
}

lose(obj.baz);
```

2、**变量赋值丢失**：对象中的函数赋值给一个变量再调用这个变量，这里相当于独立函数调用，指向 window 全局对象。

```js
const obj = {
  baz: function () {
    console.log(this); // window
  },
};

let fn = obj.baz;
fn();
```

## 显式绑定

通过调用特定函数来改变 this 指向。在 JS 中有三个方法能够实现。`bind、call、apply` 方法都有可以有目的的改变函数 this 指向。简单说一下它们之间的区别。使用语法参考[MDN 文档。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)

- bind：返回一个永久指向目标的函数，传入的参数形式为**参数列表**。
- apply：**立即调用**，传入的参数形式为**数组**，临时的改变一次 this 指向。
- call：**立即调用**，传入的参数形式为**参数列表**，临时的改变一次 this 指向。

```js
const foo = function.bind(targetObj, arg1, arg2, ...)
function.call(targetObj, arg1, arg2, ...)
function.apply(targetObj, [argsArray])
```

## new 绑定

当使用 new 操作符创建一个构造实例时，this 会指向该实例对象。

```js
function Person(name) {
  this.name = name;
}
const person = new Person("Alice");
console.log(person.name); // 输出: Alice
```

- 在内存中创建一个空对象
- this 指向空对象
- 将**构造函数中的显式原型**赋值给这个**对象作为对象的隐式原型**(该构造函数的所有构造实例的原型指向该构造函数的原型)
- 执行函数体
- 如果函数没有返回其他对象，返回这个新对象

## DOM 事件处理函数绑定

在 DOM 事件处理函数中，this 指向触发事件的 DOM 元素。这个例子中 this 指向 ul 元素！

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

## this 绑定优先级

**new绑定 > 显式绑定 > 隐式绑定 > 默认绑定**

## 箭头函数绑定规则

由于箭头函数没有自己的 this。当在箭头函数中使用 this 并调用函数时，this 会自动往上层作用域的非箭头函数进行相应的绑定。
