# 类型和语法

## 类型

### 类型概述

js 中的类型分为原始（基本）数据类型和引用数据类型。

JavaScript 有七种内置类型：
**原始数据类型**

- 字符串
- 数字（bigint 也属于数字类型，只不过它可以表示任意大小的整数（不能表示小数））
- 布尔
- null
- undefined
- symbol

**引用数据类型**
js 中的引用数据类型只有对象，对象又分为普通对象、数组、函数等。

**typeof 类型检测问题**

```js
console.log(typeof undefined) // "undefined"
console.log(typeof {}) // "object"
console.log(typeof []) // "object"
console.log(typeof Symbol()) // "symbol"
console.log(typeof 123) // "number"
console.log(typeof "123") // "string"
console.log(typeof true) // "boolean"
console.log(typeof function () {}) // "function"

console.log(typeof new Date()) // "object"
console.log(typeof new Error()) // "object"
console.log(typeof new RegExp()) // "object"
console.log(typeof new Map()) // "object"
console.log(typeof new Set()) // "object"
```

你可能注意到 null 类型不在此列。它比较特殊，typeof 对它的处理有问题:

```js
console.log(typeof null) // "object"
```

正确的返回结果应该是 "null"，但这个 bug 由来已久，在 JavaScript 中已经存在了将近二十年，也许永远也不会修复，因为这牵涉到太多的 Web 系统，“修复”它会产生更多的 bug，令许多系统无法正常工作。  
直接使用严格相等来判断 null 类型

```js
console.log(null === null) // true
```

这样看来，function（函数）也是 JavaScript 的一个内置类型。其实它实际上是 object 的一个“子类型”。具体来说，函数是“可调用对象”，它有一个**内部属性 [[Call]]**，该属性使其可以被调用。

函数不仅是对象，还可以拥有属性。

```js
function foo(a, b) {}
foo.name = "foo"
console.log(foo.name) // "foo"
console.log(foo.length) // 2
```

再来看看数组。JavaScript 支持数组，那么它是否也是一个特殊类型？

```js
console.log(typeof []) // "object"
```

不，数组也是对象。确切地说，它也是 object 的一个“子类型”, 数组元素是按照索引进行访问的。

### 值与类型

JavaScript 中的变量是没有类型的，只有值才有。变量可以随时持有任何类型的值，因为 js 是一门动态语言。  
在对变量执行 typeof 操作时，得到的结果并**不是该变量的类型，而是该变量持有的值的类型**，因为 JavaScript 中的变量没有类型。

```js
var a = 42
typeof a // "number"
a = true
typeof a // "boolean"
```

typeof 运算符总是会返回一个字符串：

```js
typeof typeof 42 // "string"
```

### undefined 和 undeclared

变量声明为赋值时，默认值为 undefined，此时 typeof 返回 "undefined"：

```js
var a
typeof a // "undefined"
typeof b // "undefined"
```

```js
var a
console.log(a) // undefined
console.log(b) // ReferenceError: b is not defined
```

大多数开发者倾向于将 undefined 等同于 undeclared（未声明），但在 JavaScript 中它们完全是两回事。看上述代码，a 声明未赋值，而 b 未声明，但是它们的 typeof 判断都是 "undefined"，而访问 b 时会直接报错，并且报错信息为 ReferenceError: b is not defined。这就很怪，但是 js 就是这样设计的。  
**tip：**typeof b 返回 "undefined" 是一种安全防范机制（阻止报错）来检查 undeclared 变量。

## 值

下面来介绍 JavaScript 中的几个内置值类型。

### 数组

在 JavaScript 中，数组可以容纳任何类型的值，可以是字符串、数字、对象（object），甚至是其他数组。对数组声明后即可向其中加入值，**不需要预先设定大小，js 数组是动态的，支持动态扩容**。

**tip:** 在使用 delete 运算符删除数组元素时，数组长度不会改变。delete 删除元素后，数组变为一个稀疏数组（也就是存在空白单元）。

```js
const arr = [1, 2, 3]
console.log(arr.length) // 3
delete arr[2]
console.log(arr.length) // 3
console.log(arr) // [1, 2, empty]
```

数组通过数字进行索引，他们属于对象，所以可以像普通对象一样设置属性。  
**tip:** 设置字符串索引不会计入数组长度（length），但是会改变数组。  
**tip:** 这里有个问题需要特别注意，如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当作数字索引来处理。

```js
const arr = [1, 2, 3]
arr.name = "arr"
console.log(arr) // [1, 2, 3, name: "arr"]

const a = []
a["13"] = 42
a.length // 14
```

**类数组的转换**  
有时需要将类数组（一组通过数字索引的值）转换为真正的数组，这一般通过数组工具函数（如 indexOf(..)、concat(..)、forEach(..) 等）来实现。但最常见的是 es6 中的 Array.from() 方法。

### 字符串

字符串经常被当成字符数组，JavaScript 中的字符串和字符数组并不是一回事，最多只是看上去相似而已。JavaScript 中字符串是不可变的，而数组是可变的，只是字符串能够通过索引访问字符，看上去和数组类似。

许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数组的**非变更方法**来处理字符串。

```js
var a = "foo"
var c = Array.prototype.join.call(a, "-")
var d = Array.prototype.map
  .call(a, function (v) {
    return v.toUpperCase() + "."
  })
  .join("")
c // "f-o-o"
d // "F.O.O."
```

**注意字符串反转**：。数组有一个字符串没有的可变，更成员函数 reverse() **可惜我们无法“借用”数组的可变更成员函数，因为字符串是不可变的**

### 数字

JavaScript 只有一种数值类型：number（数字），包括“整数”和带小数的十进制数。  
**tip:** JavaScript 没有真正意义上的整数，这也是它一直以来为人诟病的地方。这种情况在将来或许会有所改观，但目前只有数字类型。  
JavaScript 中的“整数”就是没有小数的十进制数。所以 42.0 即等同于“整数”42。

与大部分现代编程语言（包括几乎所有的脚本语言）一样，JavaScript 中的数字类型是基于 IEEE 754 标准来实现的，该标准通常也被称为“浮点数”。JavaScript 使用的是“双精度”格式（即 64 位二进制），所以 js 中数字是基于双精度浮点数建立的。

**数字语法**  
JavaScript 中的数字常量一般用十进制表示。

```js
var a = 42
var b = 42.3
```

数字前面的 0 可以省略：

```js
var a = 0.42
var b = 0.42
```

小数点后小数部分最后面的 0 也可以省略：

```js
var a = 42.0
var b = 42 // 42. 这种写法没问题，只是不常见，但从代码的可读性考虑，不建议这样写。
```

tofixed(..) 方法可指定小数部分的显示位数

```js
var a = 42.59
a.toFixed(0) // "43"
a.toFixed(1) // "42.6"
a.toFixed(2) // "42.59"
a.toFixed(3) // "42.590"
a.toFixed(4) // "42.5900"
```

**较小的数值**  
二进制浮点数最大的问题（不仅 JavaScript，所有遵循 IEEE 754 规范的语言都是如此），是会出现如下情况：

```js
0.1 + 0.2 === 0.3 // false
```

二进制浮点数中的 0.1 和 0.2 并不是十分精确，它们相加的结果并非刚好等于 0.3，而是一个比较接近的数字 0.30000000000000004，所以条件判断结果为 false。

**那么应该怎样来判断 0.1 + 0.2 和 0.3 是否相等呢？**  
最常见的方法是设置一个误差范围值，通常称为“机器精度”,JavaScript 的数字来说，这个值通常是 2^-52，也就是 2 的 52 次方分之一。如果误差在这个范围内就认为他们相等。  
从 ES6 开始，该值定义在 Number.EPSILON 中，我们可以直接拿来用

```js
function numbersCloseEnoughToEqual(n1, n2) {
  // Math.abs() 返回一个数的绝对值
  return Math.abs(n1 - n2) < Number.EPSILON
}
var a = 0.1 + 0.2
var b = 0.3
numbersCloseEnoughToEqual(a, b) // true
numbersCloseEnoughToEqual(0.0000001, 0.0000002) // false
```

**整数的安全范围**  
数字的呈现方式决定了“整数”的安全值范围远远小于 Number.MAX_VALUE。

能够被“安全”呈现的最大整数是 2^53 - 1，即 9007199254740991，在 ES6 中被定义为 Number.MAX_SAFE_INTEGER。最小整数是 -9007199254740991，在 ES6 中被定义为 Number.
MIN_SAFE_INTEGER。

有时 JavaScript 程序需要处理一些比较大的数字, 由于 JavaScript 的数字类型无法精确呈现 64 位数值，所以必须将它们保存（转换）为字符串。

**整数检测**  
要检测一个值是否是整数，可以使用 ES6 中的 Number.isInteger(..) 方法：

```js
Number.isInteger(42.0) // true
Number.isInteger(42.3) // false
```

要检测一个值是否是安全的整数，可以使用 ES6 中的 Number.isSafeInteger(..) 方法：

```js
Number.isSafeInteger(9007199254740991) // true
Number.isSafeInteger(9007199254740992) // false
```

### 特殊数值

#### 不是值的值

undefined 类型只有一个值，即 undefined。null 类型也只有一个值，即 null。它们的名称既是类型也是值。  
null 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而 undefined 却是一个标识符，可以被当作变量来使用和赋值。

#### undefined

在非严格模式下，我们可以为全局标识符 undefined 赋值

```js
function foo() {
  undefined = 2 // 非常糟糕的做法！
}
foo()
function foo() {
  "use strict"
  undefined = 2 // TypeError!
}
foo()
```

**永远不要重新定义 undefined。**

**void 运算符**  
void 运算符对给定的表达式进行求值，然后返回 undefined。

```js
var a = 42
console.log(void a) // undefined
```

#### 特殊的数字

数字类型中有几个特殊的值：  
**1. 不是数字的数字**  
NaN 是“数字”类型中的一个特殊值，表示“非数字”, 或者说是无效的数字，其实无效数字的说法可能更准确一点。

```js
let a = 1
let b = a * "foo"
console.log(b)
console.log(typeof b)
```

NaN 是一个“警戒值”, 用于指出数字类型中的错误情况，即“执行数学运算没有成功，这是失败后返回的结果”。

**NaN 是唯一一个不等于自身的值**

```js
console.log(NaN === NaN) // false
console.log(NaN == NaN) // false
```

既然我们无法对 NaN 进行比较（结果永远为 false），那应该怎样来判断它呢？  
很简单，可以使用内建的全局工具函数 isNaN(..) 来判断一个值是否是 NaN。

```js
console.log(isNaN(NaN)) // true
```

isNaN(..) 有一个严重的缺陷，它的检查方式过于死板，就是**检查参数是否不是 NaN，也不是数字**。但是这样做的结果并不太准确：

```js
console.log(isNaN(undefined)) // true
console.log(isNaN({})) // true
console.log(isNaN("foo")) // true
console.log(isNaN(true)) // false
```

很明显 "foo" 不是一个数字，但是它也不是 NaN。这个 bug 自 JavaScript 问世以来就一直存在，至今已超过 19 年。  
更优雅的解决方案： **ES6 开始我们可以使用工具函数 Number.isNaN(..)**。

```js
console.log(Number.isNaN(undefined)) // false
console.log(Number.isNaN({})) // false
console.log(Number.isNaN("foo")) // false
console.log(Number.isNaN(true)) // false
```

**无穷数**  
JavaScript 中有一个特殊的值 Infinity，表示无穷大, 当 JavaScript 的运算结果溢出时，此时结果为 Infinity 或者 -Infinity。

```js
console.log(1 / 0) // Infinity
console.log(-1 / 0) // -Infinity
```

```js
let a = Number.MAX_VALUE
let b = a * 2
let c = a + 1
console.log(a)
console.log(b)
console.log(c)
```

规范规定，如果数学运算（如加法）的结果超出处理范围，则由 IEEE 754 规范中的“就近取整”模式来决定最后的结果。b 与 Number.MAX_VALUE 更加接近，所以取 Number.MAX_VALUE，c 与 Infinity 更加接近，所以取 Infinity。

```js
let a = Number.MAX_VALUE
let b = a + 1
let c = a + a
console.log(b) // Number.MAX_VALUE: 1.7976931348623157e+308
console.log(c) // Infinity

console.log(b === a) // true
console.log(c === Infinity) // true
```

**零值**  
JavaScript 中存在两个零值：+0 和 -0，在一些特殊场景会用到，比如：表示方向的正负。

```js
console.log(0 === -0) // true
console.log(1 / +0) // Infinity
console.log(1 / -0) // -Infinity

console.log(0 > -0) // false
console.log(0 < -0) // false
```

**特殊等式**  
ES6 中新加入了一个工具方法 Object.is(..) 来判断两个值是否绝对相等，可以用来处理上述所有的特殊情况：

```js
var a = 2 / "foo" // NaN
var b = -3 * 0 // -0

console.log(0 === -0) // true
console.log(NaN === NaN) // false

console.log(Object.is(a, NaN)) // true
console.log(Object.is(b, -0)) // true
console.log(Object.is(b, 0)) // false
```

**tip:** 能使用 == 和 === 时就尽量不要使用 Object.is(..)，因为前者效率更高、更为通用。Object.is(..) 主要用来处理那些特殊的相等比较。

### 值和引用

JavaScript 中没有指针，引用的工作机制也不尽相同。在 JavaScript 中变量不可能成为指向另一个变量的引用。  
JavaScript **引用指向的是值**。如果一个值有 10 个引用，这些引用指向的都是同一个值：10（它们相互之间没有引用）。

**tip:** JavaScript 对值和引用的赋值 / 传递在语法上没有区别，**完全根据值的类型来决定**。

```js
var a = 2
var b = a //  b是a的值的一个副本
a = 3
console.log(a) // 3
console.log(b) // 2
```

```js
var c = [1, 2, 3]
var d = c // d是[1,2,3]的一个引用, c也是。
d.push(4)
console.log(c) // [1,2,3,4]
console.log(d) // [1,2,3,4]
```

- 原始值（基本数据类型）总是通过值复制的方式来赋值 / 传递。
- 对象（普通对象、数组、函数），则总是通过引用复制的方式来赋值 / 传递。

看下这个例子：函数参数就经常让人产生困惑

```js
function foo(x) {
  x.push(4) // [1,2,3,4]
  // 然后
  x = [4, 5, 6] // 修改副本指向
  x.push(7) // [4,5,6,7]
}
var a = [1, 2, 3]
foo(a)
console.log(a) // 是[1,2,3,4]，不是[4,5,6,7]
```

**tip:** 我们向函数传递 a 的时候，实际是将引用 a 的一个副本赋值给 x，而 a 仍然指向 [1,2,3]，所以 `x = [4, 5, 6]` 并不会影响 a 的指向, 只是影响这个副本的指向。在函数中我们可以通过引用 x 来更改数组的值（push(4) 之后变为 [1,2,3,4]）。但 x =[4,5,6] 并不影响 a 的指向，所以 a 仍然指向 [1,2,3,4]。

同样对于基本数据类型，如果像通过传递参数的方式修改，需要将其封装到对象中。

```js
let x = 2
function foo(num) {
  num = 1
}
foo(x)
console.log(x) // 2

const obj = {
  x: 2,
}
function bar(obj) {
  obj.x = 1
}
bar(obj)
console.log(obj.x) // 1
```

**包装类型的参数传递**  
虽然参数指向包装对象，但我们并不能通过它来更改其中的基本类型值，原因是标量基本类型值是不可更改的。

```js
function foo(x) {
  x = x + 1
  x // 3
}

var b = new Number(2)
foo(b)
console.log(b) // 是2，不是3
```

## 原生函数

js 内建原生函数有：
String()
• Number()
• Boolean()
• Array()
• Object()
• Function()
• RegExp()
• Date()
• Error()
• Symbol()——ES6 中新加入的！

通过 new 调用的方式创建对应实例，但其构造出来的对象可能会和我们设想的有所出入：

```js
const a = new Number(2)
console.log(a) // Number { 2 }
console.log(typeof a) // object
console.log(a instanceof Number) // true
```

**tip**： 其中，a 是 Number 的包装对象。通过 new 调用的方式创建的类型，如果是基本数据类型，那么返回的是对应包装对象。

### 内部属性 [[Class]]

所有 typeof 返回值为 "object" 的对象（如数组）都包含一个内部属性 [[Class]]，这个属性无法直接访问，一般通过 Object.prototype.toString(..) 来查看。例如：

```js
console.log(Object.prototype.toString.call([1, 2, 3])) // "[object Array]"
console.log(Object.prototype.toString.call(/regex-literal/i)) // "[object RegExp]"
console.log(Object.prototype.toString.call({})) // "[object Object]"
```

对象的内部 [[Class]] 属性和创建该对象的内建原生构造函数相对应（如下），但并非总是如此。

```js
Object.prototype.toString.call(null)
// "[object Null]"
Object.prototype.toString.call(undefined)
// "[object Undefined]"

Object.prototype.toString.call("abc")
// "[object String]"
Object.prototype.toString.call(42)
// "[object Number]"
Object.prototype.toString.call(true)
// "[object Boolean]"
```

虽然 Null() 和 Undefined() 这样的原生构造函数并不存在，但是内部 [[Class]] 属性值仍然是 "Null" 和 "Undefined"。  
上例中基本类型值被各自的封装对象自动包装(也就是调用 Object.prototype.toString.call 这个方法时，基本数据类型会被 js 引擎转化为包装对象)，所以它们的内部 [[Class]] 属性值分别为"String"、"Number" 和 "Boolean"。

### 包装对象

基 本 类 型 值 没 有 .length 和 .toString() 这样的属性和方法，需要通过对应的包装对象（new Number、 new String、 new Boolean）来访问。  
js 引擎会自动处理。

```js
var a = "abc"
a.length // 3
a.toUpperCase() // "ABC"
```

**注意**：a 是一个包装对象，不是基本值。

```js
let a = new Boolean(false)
if (!a) {
  console.log("Oops") // 执行不到这里
}
```

### 原生函数作为构造函数

关于数组（array）、对象（object）、函数（function）和正则表达式，我们通常喜欢以常量的形式来创建它们。实际上，使用常量和使用构造函数的效果是一样的（创建的值都是通过封装对象来包装）。

**应该尽量避免使用构造函数 new 创建实例，除非十分必要，因为它们经常会产生意想不到的结果。**

```js
let a = new Boolean(false)
if (!a) {
  console.log("Oops") // 执行不到这里
}
```

#### Array

构造函数 Array(..) 不要求必须带 new 关键字。不带时，它会被自动补上。因此 Array(1,2,3) 和 new Array(1,2,3) 的效果是一样的。  
Array 构造函数只带一个数字参数的时候，该参数会被作为数组的预设长度（length），而非只充当数组中的一个元素。**这实非明智之举：一是容易忘记，二是容易出错。**

我们将包含至少一个“空单元”的数组称为“稀疏数组”。

```js
var a = new Array(3)
console.log(a) // [ <3 empty items> ]
```

#### Object(..)、Function(..) 和 RegExp(..)

同样，除非万不得已，否则尽量不要使用 Object(..)/Function(..)/RegExp(..)，在实际情况中没有必要使用 new Object() 来创建对象，因为这样就无法像常量形式那样一次设定多个属性，而必须逐一设定。

#### Date(..) 和 Error(..)

相较于其他原生构造函数，Date(..) 和 Error(..) 的用处要大很多，因为没有对应的常量形式来作为它们的替代。创建日期对象必须使用 new Date()。Date(..) 可以带参数，用来指定日期和时间，而不带参数的话则使用当前的日期和时间。

Date(..) 主要用来获得当前的 Unix 时间戳（从 1970 年 1 月 1 日开始计算，以秒为单位）。该值可以通过日期对象中的 getTime() 来获得。从 ES5 开始引入了一个更简单的方法，即静态函数 Date.now()。

#### Symbol(..)

ES6 中新加入了一个基本数据类型 ——符号（Symbol）。符号是具有唯一性的特殊值，用它来命名对象属性不容易导致重名。符号可以用作属性名，但无论是在代码还是开发控制台中都无法查看和访问它的值。

## 强制类型转换

### 值类型转换

将值从一种类型转换为另一种类型通常称为类型转换, 这是显式的情况；隐式的情况称为**强制类型转换**。更简明的说法是用“隐式强制类型转换”和“显式强制类型转换”来区分。  
**tip:** JavaScript 中的强制类型转换总是返回基本数据类型，而不会返回对象。

```js
var a = 42
var b = a + "" // 隐式强制类型转换
var c = String(a) // 显式强制类型转换
```

- 由于 + 运算符的其中一个操作数是字符串，所以是字符串拼接操作，结果是数字 42 被强制类型转换为相应的字符串 "42"。
- 而 String(..) 则是将 a 显式强制类型转换为字符串。

### 抽象值操作

介绍显式和隐式强制类型转换之前，我们需要掌握字符串、数字和布尔值之间类型转换的基本规则。

#### ToString

抽象操作 ToString，它负责处理非字符串到字符串的强制类型转换。  
基本规则为：

- null 转换为 "null"，undefined 转换为 "undefined"，true 转换为 "true"。
- 对象有自己的 toString() 方法，字符串化时就会调用该方法并使用其返回值。

**tip:** 对象强制类型转换为 string 是通过 ToPrimitive 抽象操作来完成的，在后续介绍。

数组的默认 toString() 方法经过了重新定义，将所有单元字符串化以后再用 "," 连接起来：

```js
var a = [1, 2, 3]
a.toString() // "1,2,3"
```

**JSON 字符串化**  
工具函数 JSON.stringify(..) 在将 JSON 对象序列化为字符串时也用到了 ToString。所有安全的 JSON 值（JSON-safe）都可以使用 JSON.stringify(..) 字符串化。安全的
JSON 值是指能够呈现为有效 JSON 格式的值。  
什么是不安全的 JSON 值呢？undefined、function、symbolES6+）和包含循环引用的对象都不符合 JSON 结构标准，支持 JSON 的语言无法处理它们。  
**tip**：如果对象中定义了 toJSON() 方法，JSON 字符串化时会首先调用该方法，然后用它的返回值来进行序列化。

**JSON.stringify(value, replacer, space)**

- value: 要序列化的值。
- replacer (可选): 这是一个函数或数组。如果是函数，它会在序列化每个键值对时被调用，返回的值将被序列化。如果是数组，它应该包含要包含在结果中的属性名。
- space (可选): 用于控制输出的格式化。

#### ToNumber

有时我们需要将非数字值当作数字来使用，比如数学运算。为此规范定义了抽象操作 ToNumber。  
基本规则：

- 其中 true 转换为 1，false 转换为 0。undefined 转换为 NaN，null 转换为 0。
- 对象（包括数组）会首先被转换为相应的基本类型值，如果返回的是非数字的基本类型值，则再遵循以上规则将其强制转换为数字。

为了将值转换为相应的基本类型值，抽象操作 ToPrimitive 会首先检查该值是否有 valueOf() 方法。如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 toString()的返回值（如果存在）来进行强制类型转换。  
如果 valueOf() 和 toString() 均不返回基本类型值，会产生 TypeError 错误。使用 Object.create(null) 创建的对象 [[Prototype]] 属性为 null，并且没有 valueOf() 和 toString() 方法，因此无法进行强制类型转换。

#### ToBoolean

**下面介绍布尔值，关于这个主题存在许多误解和困惑，需要我们特别注意。**  
js 中的 true/false 和 0/1 并不是一回事，它们是不同的类型。有这种困扰是因为 js 中存在隐式强制类型转换。

**假值与假值对象**  
假值是指在条件判断中表现为 false 的值。假值列表：undefined、null、false、+0、-0、NaN、""（空字符串）。  
假值对象强制类型转换为布尔值时结果为 false。  
值得注意的是，虽然 JavaScript 代码中会出现假值对象，但它实际上并不属于 JavaScript 语言的范畴。浏览器在某些特定情况下，在常规 JavaScript 语法基础上自己创建了一些外来值，这些就是“假值对象”。  
假值对象看起来和普通对象并无二致，但将它们强制类型转换为布尔值时结果为 false。最常见的例子是 document.all，它是一个类数组对象，包含了页面上的所有元素，由
DOM（而不是 JavaScript 引擎）提供给 JavaScript 程序使用。document.all 并不是一个标准用法，早就被废止了。

```js
var a = new Boolean(false) // true
var b = new Number(0) // true
var c = new String("") // true
```

**真值**  
真值就是假值列表之外的值。

### 显式强制类型转换

显式强制类型转换是那些显而易见的类型转换，我们在编码时应尽可能地将类型转换表达清楚，以免给别人留坑。

#### 字符串和数字之间的显式转换

字符串和数字之间的转换是通过 String(..) 和 Number(..) 这两个内建函数来实现的，请注意它们前面没有 new 关键字，并不创建封装对象。

```js
var a = 42
var b = String(a)
var c = "3.14"
var d = Number(c)
```

String(..) 遵循前面讲过的 ToString 规则，将值转换为字符串基本类型。Number(..) 遵循前面讲过的 ToNumber 规则，将值转换为数字基本类型。

除了 String(..) 和 Number(..) 以外，还有其他方法可以实现字符串和数字之间的显式转换：

```js
let a = 42
let b = a.toString()
let c = "3.14"
let d = +c // 这是一个一元加法运算符，用于将其后面的操作数转换为数字。
b // "42"
d // 3.14
```

#### 显式解析数字字符串

解析**字符串中的数字**和将字符串强制类型转换为数字的返回结果都是数字。但解析和转换两者之间还是有明显的差别。

```js
var a = "42"
var b = "42px"

Number(a) // 42
parseInt(a) // 42
Number(b) // NaN
parseInt(b) // 42
```

解析含有数字的字符串时，解析按从左到右的顺序，如果遇到非数字字符就停止。而转换不允许出现非数字字符，否则会失败并返回 NaN。  
**tip:** parseInt(..) 针对的是字符串。向 parseInt(..) 传递数字和其他类型的参数是没有用的。非字符串参数会首先被强制类型转换为字符串，依赖这样的隐式强制类型转换并非上策隐式转换有些时候会出乎你的意料，**应该避免向 parseInt(..) 传递非字符串参数。**  
**解析非字符串**

```js
console.log(parseInt(1 / 0, 19)) // 18
```

很多人想当然地以为（实际上大错特错）“如果第一个参数值为 Infinity，解析结果也应该是 Infinity”，返回 18 也太无厘头了。我们还是来看看 JavaScript 是否真的这样无厘头。  
其中第一个错误是向 parseInt(..) 传递非字符串，这完全是在自找麻烦。此时 JavaScript 会将参数强制类型转换为它能够处理的字符串。怎么来处理 Infinity（1/0 的结果）最合理呢？有两个选择："Infinity" 和 "∞"，JavaScript 选择的是 "Infinity"。

再回到基数 19，这显然是个玩笑话，在实际的 JavaScript 代码中不会用到基数 19。它的有效数字字符范围是 0-9 和 a-i。

parseInt(1/0, 19) 实际上是 parseInt("Infinity", 19)。第一个字符是 "I"，以 19 为基数时值为 18。第二个字符 "n" 不是一个有效的数字字符，解析到此为止，和 "42px" 中的 "p"一样。最后的结果是 18，而非 Infinity 或者报错。所以理解其中的工作原理对于我们学习 JavaScript 是非常重要的。

其实 parseInt(..) 函数是十分靠谱的，只要使用得当就不会有问题。因为使用不当而导致一些莫名其妙的结果，并不能归咎于 JavaScript 本身。

#### 显式转换为布尔值

现在我们来看看从非布尔值强制类型转换为布尔值的情况。ToBoolean 强制类型转换：

```js
var a = "0"
var b = []
var c = {}
var d = ""
var e = 0
var f = null
var g
Boolean(a) // true
Boolean(b) // true
Boolean(c) // true
Boolean(d) // false
Boolean(e) // false
Boolean(f) // false
Boolean(g) // false
```

虽然 Boolean(..) 是显式的，但并不常用。显式强制类型转换为布尔值最常用的方法是 !!，因为第二个 ! 会将结果反转回原值。  
在 if(..).. 这样的布尔值上下文中，如果没有使用 Boolean(..) 和 !!，就会自动隐式地进行 ToBoolean 转换。**建议使用 Boolean(..) 和 !! 来进行显式转换以便让代码更清晰易读。**

```js
var a = "0"
var b = []
var c = {}
var d = ""
var e = 0
var f = null
var g
!!a // true
!!b // true
!!c // true
!!d // false
!!e // false
!!f // false
!!g // false
```

### 隐式强制类型转换

隐式强制类型转换指的是那些隐蔽的强制类型转换。

#### 字符串和数字之间的隐式强制类型转换

```js
var a = "42"
var b = "0"
var c = 42
var d = 0
a + b // "420"
c + d // 42
```

c 和 d 都是数字，所以他们会进行数学运算，a 和 b 都是字符串，所以他们会进行拼接。**这样解释只对了一半，实际情况要复杂得多。**

```js
var a = [1, 2]
var b = [3, 4]
a + b // "1,23,4"
```

a 和 b 都不是字符串，但是它们都被强制转换为字符串然后进行拼接。原因何在？  
根据 ES5 规范如果某个操作数是字符串或者能够通过以下步骤转换为字符串的话，+ 将进行拼接操作。  
如果其中一个操作数是对象（包括数组），则首先对其调用 ToPrimitive 抽象操作（规范 9.1 节），该抽象操作再调用 [[DefaultValue]]，以数字作为上下文。

你或许注意到这与 ToNumber 抽象操作处理对象的方式一样。因为数组的 valueOf() 操作无法得到简单基本类型值，于是它转而调用 toString()。因此上例中的两个数组变成了 "1,2" 和 "3,4"。+ 将它们拼接后返回 "1,23,4"。

简单来说就是，如果 + 的其中一个操作数是字符串（或者通过以上步骤可以得到字符串），则执行字符串拼接；否则执行数字加法。

对隐式强制类型转换来说，这意味着什么？我们可以将数字和空字符串 "" 相 + 来将其转换为字符串：

```js
var a = 42
var b = a + ""
b // "42"
```

a + ""（隐式）和前面的 String(a)（显式）之间有一个细微的差别需要注意。根据 ToPrimitive 抽象操作规则，a + "" 会对 a 调用 valueOf() 方法，然后通过 ToString 抽象操作将返回值转换为字符串。而 String(a) 则是直接调用 ToString()。

**再来看看从字符串强制类型转换为数字的情况**

```js
var a = "3.14"
var b = a - 0
b // 3.14
```

是数字减法运算符，因此 a - 0 会将 a 强制类型转换为数字。也可以使用 a \* 1 和 a / 1，因为这两个运算符也只适用于数字，只不过这样的用法不太常见。

对象的 - 操作与 + 类似：

```js
var a = [3]
var b = [1]
a - b // 2
```

为了执行减法运算，a 和 b 都需要被转换为数字，它们首先被转换为字符串（通过 toString()），然后再转换为数字。

#### 隐式强制类型转换为布尔值

来看看到布尔值的隐式强制类型转换，它最为常见也最容易搞错。下面的情况会发生布尔值隐式强制类型转换。

- if (..) 语句中的条件判断表达式。
- for ( .. ; .. ; .. ) 语句中的条件判断表达式（第二个）。
- while (..) 和 do..while(..) 循环中的条件判断表达式。
- ? : 中的条件判断表达式。
- 逻辑运算符 ||（逻辑或）和 &&（逻辑与）左边的操作数（作为条件判断表达式）。

以上情况中，非布尔值会被隐式强制类型转换为布尔值，遵循前面介绍过的 ToBoolean 抽象操作规则。

#### || 和 &&

逻辑运算符，它们的返回值是两个操作数中的一个（且仅一个）。

```js
var a = 42
var b = "abc"
var c = null
a || b // 42
a && b // "abc"
c || b // "abc"
c && b // null
```

|| 和 && 首先会对第一个操作数（a 和 c）执行条件判断，如果其不是布尔值（如上例）就先进行 ToBoolean 强制类型转换，然后再执行条件判断。

- 对于 || 来说，如果条件判断结果为 true 就返回第一个操作数（a 和 c）的值，如果为 false 就返回第二个操作数（b）的值。
- && 则相反，如果条件判断结果为 true 就返回第二个操作数（b）的值，如果为 false 就返回第一个操作数（a 和 c）的值。

#### 符号的强制类型转换

ES6 中引入了符号类型，它的强制类型转换有一个坑，在这里有必要提一下。ES6 允许从符号到字符串的显式强制类型转换，然而隐式强制类型转换会产生错误

```js
var s1 = Symbol("cool")
String(s1) // "Symbol(cool)"
var s2 = Symbol("not cool")
s2 + "" // TypeError
```

符号不能够被强制类型转换为数字（显式和隐式都会产生错误），但可以被强制类型转换为布尔值（显式和隐式结果都是 true）。由于规则缺乏一致性，我们要对 ES6 中符号的强制类型转换多加小心。

### 宽松相等和严格相等

常见的误区是“== 检查值是否相等，=== 检查值和类型是否相等”。听起来蛮有道理，然而还不够准确。很多 JavaScript 的书籍和博客也是这样来解释的，但是很遗憾他们都错了。  
正确的解释是：“== 允许在相等比较中进行强制类型转换，而 === 不允许。”

#### 相等比较操作的性能

有人觉得 == 会比 === 慢，实际上虽然强制类型转换确实要多花点时间，但仅仅是微秒级（百万分之一秒）的差别而已。  
如果进行比较的两个值类型相同，则 == 和 === 使用相同的算法，所以除了 JavaScript 引擎实现上的细微差别之外，它们之间并没有什么不同。  
如果两个值的类型不同，我们就需要考虑有没有强制类型转换的必要，有就用 ==，没有就用 ===，不用在乎性能。

#### 抽象相等

ES5 规范的“抽象相等比较算法”定义了 == 运算符的行为。该算法简单而又全面，涵盖了所有可能出现的类型组合，以及它们进行强制类型转换的方式。  
规定如果两个值的类型相同，就仅比较它们是否相等。例如，42 等于 42，"abc" 等于 "abc"。

**特殊情况**

- NaN 不等于 NaN
- +0 等于 -0

规范最后定义了对象（包括函数和数组）的宽松相等 ==。两个对象指向同一个值时即视为相等，不发生强制类型转换。  
规范额外补充 == 在比较两个不同类型的值时会发生隐式强制类型转换，会将其中之一或两者都转换为相同的类型后再进行比较。

**1. 字符串和数字之间的相等比较**
因为没有强制类型转换，所以 a === b 为 false，42 和 "42" 不相等。  
而 a == b 是宽松相等，即如果两个值的类型不同，则对其中之一或两者都进行强制类型转换。具体要怎么定义呢？  
ES5 规范中定义到：

- 如果 Type(x) 是数字，Type(y) 是字符串，则返回 x == ToNumber(y) 的结果。
- 如果 Type(x) 是字符串，Type(y) 是数字，则返回 ToNumber(x) == y 的结果。

```js
var a = 42
var b = "42"
a == b // true
a === b // false
```

**其他类型和布尔类型之间的相等比较**  
== 最容易出错的一个地方是 true 和 false 与其他类型之间的相等比较。

```js
var a = "42"
var b = true
a == b // false
```

我们都知道 "42" 是一个真值，为什么 == 的结果不是 true 呢？原因既简单又复杂，让人很容易掉坑里，很多 JavaScript 开发人员对这个地方并未引起足够的重视。  
看如下规范：

- 如果 Type(x) 是布尔值，则返回 ToNumber(x) == y 的结果。
- 如果 Type(y) 是布尔值，则返回 x == ToNumber(y) 的结果。

Type(x) 是布尔值，所以 ToNumber(x) 将 true 强制类型转换为 1，变成 1 == "42"，二者的类型仍然不同，"42" 根据规则被强制类型转换为 42，最后变成 1 == 42，结果为 false。

重点是我们要搞清楚 == 对不同的类型组合怎样处理。== 两边的布尔值会被强制类型转换为数字，很奇怪吧？无论什么情况下都尽量不要使用 == true 和 == false。

```js
var a = "42"
// 不要这样用，条件判断不成立：
if (a == true) {
  // ..
}
// 也不要这样用，条件判断不成立：
if (a === true) {
  // ..
}
// 这样的显式用法没问题：
if (a) {
  // ..
}
// 这样的显式用法更好：
if (!!a) {
  // ..
}
// 这样的显式用法也很好：
if (Boolean(a)) {
  // ..
}
```

避免了 == true 和 == false（也叫作布尔值的宽松相等）之后我们就不用担心这些坑了。

**null 和 undefined 之间的相等比较**  
null 和 undefined 之间的 == 也涉及隐式强制类型转换。ES5 规范规定：

- 如果 x 为 null，y 为 undefined，则结果为 true。
- 如果 x 为 undefined，y 为 null，则结果为 true。

```js
var a = null
var b
a == b // true
a == null // true
b == null // true
a == false // false
b == false // false
a == "" // false
b == "" // false
a == 0 // false
b == 0 // false
```

这也就是说在 == 中 null 和 undefined 是一回事，可以相互进行隐式强制类型转换，null 和 undefined 之间的强制类型转换是安全可靠的，**在 == 中 null 和 undefined 相等（它们也与其自身相等），除此之外其他值都不存在这种情况。**

**对象和非对象之间的相等比较**  
关于对象（对象 / 函数 / 数组）和基本类型（字符串 / 数字 / 布尔值）之间的相等比较，ES5 规范做如下规定：

- 如果 Type(x) 是字符串或数字，Type(y) 是对象，则返回 x == ToPrimitive(y) 的结果；
- 如果 Type(x) 是对象，Type(y) 是字符串或数字，则返回 ToPromitive(x) == y 的结果。

**tip**： 这里只提到了字符串和数字，没有布尔值。原因是之前介绍过规定了布尔值会先被强制类型转换为数字。

```js
var a = 42
var b = [42]
a == b // true
```

[ 42 ] 首先调用 ToPromitive 抽象操作，返回 "42"，变成 "42" == 42，然后又变成 42 == 42，最后二者相等。  
“拆封”，即“打开”封装对象（如 new String("abc")），返回其中的基本数据类型值（"abc"）。== 中的 ToPromitive 强制类型转换也会发生这样的情况。

```js
var a = "abc"
var b = Object(a) // 和new String( a )一样
a === b // false
a == b // true
```

a == b 结果为 true，因为 b 通过 ToPromitive 进行强制类型转换（也称为“拆封”），并返回基本类型值 "abc"，与 a 相等。  
**但有一些值不这样，原因是 == 算法中有优先级更高的规则。例如：**

```js
var a = null
var b = Object(a) // {}
console.log(a == b) // false
var c = undefined
var d = Object(c) // {}
console.log(c == d) // false
var e = NaN
var f = Object(e) // 包装对象：{ NaN }
console.log(e == f) // false
```

因为没有对应的封装对象，所以 null 和 undefined 不能够被封装（boxed），Object(null)和 Object() 均返回一个常规对象:{}。NaN 能够被封装为数字封装对象，但拆封之后 NaN == NaN 返回 false，因为 NaN 不等于 NaN。

**特殊情况**  
只有 undefined == null 成立, 在看其他的情况。

```js
"0" == null // false
"0" == undefined // false
"0" == false // true -- 晕！
"0" == NaN // false
"0" == 0 // true
"0" == "" // false
false == null // false
false == undefined // false
false == NaN // false
false == 0 // true -- 晕！
false == "" // true -- 晕！
false == [] // true -- 晕！
false == {} // false
"" == null // false
"" == undefined // false
"" == NaN // false
"" == 0 // true -- 晕！
"" == [] // true -- 晕！
"" == {} // false
0 == null // false
0 == undefined // false
0 == NaN // false
0 == [] // true -- 晕！
0 == {} // false
```

**极端情况一**

```js
;[] == ![] // true
```

**this is crazy!**  
事实并非如此。让我们看看 ! 运算符都做了些什么？根据 ToBoolean 规则，它会进行布尔值的显式强制类型转换（同时反转奇偶校验位）。所以 [] == ![] 变成了 [] == false。前面我们讲过 false == []。

**极端情况二**

```js
2 == [2] // true
"" == [null] // true
```

== 右边的值 [2] 和 [null] 会进行 ToPrimitive 强制类型转换，以便能够和左边的基本类型值（2 和 ""）进行比较。因为数组的 valueOf() 返回数组本身，所以强制类型转换过程中数组会进行字符串化。  
第一行中的 [2] 会转换为 "2"，然后通过 ToNumber 转换为 2。第二行中的 [null] 会直接转换为 ""。  
**所以最后的结果就是 2 == 2 和 "" == ""。**

valueOf(): JavaScript 调用 valueOf 方法来将对象转换成基本类型值。你很少需要自己调用 valueOf 方法；当遇到需要基本类型值的对象时，JavaScript 会自动的调用该方法。

**前面列举了相等比较中的强制类型转换的 7 个坑**

```js
"0" == false // true -- 晕！
false == 0 // true -- 晕！
false == "" // true -- 晕！
false == [] // true -- 晕！
"" == 0 // true -- 晕！
"" == [] // true -- 晕！
0 == [] // true -- 晕！
```

其中有 4 种情况涉及 == false，之前我们说过应该避免。  
现在剩下 3 种：

```js
"" == 0 // true 根据规则，"" 会调用Number("")变为 0，然后 0 == 0 结果为 true
"" == [] // true 根据规则，数组会ToPrimitive进行强制类型转换变为“”，“” == “”结果为true
0 == [] // true 根据规则，数组会ToPrimitive进行强制类型转换变为“”，“” 在调用Number("")变为0，0 == 0 结果为true
```

**安全运用隐式强制类型转换**  
我们要对 == 两边的值认真推敲，以下两个原则可以让我们有效地避免出错。

- 如果两边的值中有 true 或者 false，千万不要使用 ==。
- 如果两边的值中有 []、"" 或者 0，尽量不要使用 ==。

这时最好用 === 来避免不经意的强制类型转换。这两个原则可以让我们避开几乎所有强制类型转换的坑。

## 语法特性

### 表达式的副作用

```js
var a = 42
var b = a++
```

a++ 首先返回变量 a 的当前值 42（将该值赋给 b），然后将 a 的值加 1。递增运算符 ++ 和递减运算符 -- 都是一元运算符。

- ++a：先递增在返回
- a++：先返回在递增

常有人误以为可以用括号 ( ) 将 a++ 的副作用封装起来，例如：

```js
var a = 42
var b = a++
console.log(a) // 43
console.log(b) // 42
```

**然-并-卵**

如 delete 运算符, ，delete 用来删除对象中的属性和数组中的单元。它通常以单独一个语句的形式出现：

```js
var obj = {
  a: 42,
}
obj.a // 42
delete obj.a // true
obj.a // undefined
```

如果操作成功，delete 返回 true，否则返回 false。其副作用是属性被从对象中删除（或者单元从 array 中删除）。

**链式赋值**:

```js
var a, b, c
a = b = c = 42
```

这里 c = 42 的结果值为 42（副作用是将 c 赋值 42），然后 b = 42 的结果值为 42（副作用是将 b 赋值 42），最后是 a = 42（副作用是将 a 赋值 42）。  
一下案例在严格模式中会报错, 因为 b 没用经过声明就试图赋值。

```js
"use strict"
var a = (b = 42)
console.log(a, b)
```

### 运算符优先级

JavaScript 中的 && 和 || 运算符返回它们其中一个操作数的值，而非 true 或 false。  
在一个运算符两个操作数的情况下这比较好理解，**那么两个运算符三个操作数呢？**

```js
var a = 42
var b = "foo"
var c = [1, 2, 3]
;(a && b) || c // ???
a || (b && c) // ???
```

想知道结果就需要了解超过一个运算符时表达式的执行顺序, 这些规则被称为“运算符优先级”。  
首先我们要搞清楚 (a && b || c) 执行的是 (a && b) || c 还是 a && (b || c) ？它们之间有什么区别？

```js
;(false && true) || true // true
false && (true || true) // false
```

事实证明它们是有区别的，false && true || true 的执行顺序如下：

```js
;(false && true) || true // true
;(false && true) || true // true
```

&& 先执行，然后是 ||  
那执行顺序是否就一定是从左到右呢？不妨将运算符颠倒一下看看：

```js
true || (false && false) // true
;(true || false) && false // false
true || (false && false) // true
```

和显然，他们不看执行顺序，而是注重优先级来执行的。

运算符优先级基本分类

- 括号运算符 ()：最优先，括号内的内容会先执行。
- 单目运算符：如 ++、--、+、-、!、typeof、void、delete 等。
- 算术运算符：如 \*、/、% 等。
- 加法和减法运算符：如 +、-。
- 比较运算符：如 ==、!=、<、<=、>、>= 等。
- 逻辑运算符：如 &&、||。
- 赋值运算符：如 =、+=、-=、\*= 等。
- 逗号运算符 ,：最低优先级。

**运算符优先级**  
**注意**：对于自增自减，括号无法限制。

1. () - 圆括号
2. ++, --, + (一元运算符), - (一元运算符), ~, !, typeof, void, delete - 一元操作符
3. \*, /, % - 乘除模运算
4. +, - - 加减运算
5. <<, >>, >>> - 位移运算
6. <, <=, >, >=, in, instanceof - 比较运算符
7. ==, !=, ===, !== - 相等运算符
8. && - 逻辑与
9. || - 逻辑或
10. =, +=, -=, \*=, /=, %=, <<=, >>=, >>>=, &=, ^=, |= - 赋值运算符
11. , - 逗号运算符

### 短路

**对 && 和 || 来说，如果从左边的操作数能够得出结果，就可以忽略右边的操作数**。我们将这种现象称为“短路”（即执行最短路径）。  
以 a && b 为例，如果 a 是一个假值，足以决定 && 的结果，就没有必要再判断 b 的值。同样对于 a || b，如果 a 是一个真值，也足以决定 || 的结果，也就没有必要再判断 b 的值。

### 自动分号

有时 JavaScript 会自动为代码行补上缺失的分号，即自动分号插入（ASI），请注意，ASI 只在换行符处起作用，而不会在代码行的中间插入分号。  
如果 JavaScript 解析器发现代码行可能因为缺失分号而导致错误，那么它就会自动补上分号。并且，只有在代码行末尾与换行符之间除了空格和注释之外没有别的内容时，它才会这样做。

### 错误机制

1. SyntaxError（语法错误）：SyntaxError 表示代码的语法不符合 JavaScript 的语法规则。当代码无法被 JavaScript 引擎解析时，就会抛出这个错误。

```js
// 示例 1：缺少括号
if (true {  // 应该是 if (true) {
  console.log('Hello');
}
// 抛出 SyntaxError: Unexpected token {

// 示例 2：字符串没有闭合引号
let str = "Hello;  // 应该是 let str = "Hello";
```

2. TypeError（类型错误）: TypeError 通常发生在尝试对不符合预期的数据类型进行操作时。例如，试图访问 null 或 undefined 上的属性，或调用一个不是函数的值。

```js
// 示例 1：访问 null 或 undefined 的属性
let obj = null
console.log(obj.name) // TypeError: Cannot read properties of null (reading 'name')

// 示例 2：调用非函数对象
let notAFunction = 123
notAFunction() // TypeError: notAFunction is not a function
```

3. ReferenceError（引用错误）: ReferenceError 表示代码中引用了一个未声明或未定义的变量。这通常发生在变量未被正确声明或初始化时。

```js
// 示例 1：使用未声明的变量
console.log(x) // ReferenceError: x is not defined

// 示例 2：在块作用域外访问 let 或 const 声明的变量
if (true) {
  let y = 10
}
console.log(y) // ReferenceError: y is not defined
```

4. RangeError（范围错误）: RangeError 在给定值超出有效范围时抛出。通常出现在数学运算或数据范围处理时。

```js
// 示例 1：数组索引超出范围
let arr = [1, 2, 3]
console.log(arr[10]) // 不会抛出 RangeError，但返回 undefined

// 示例 2：调用无效的数字范围 (es6新增了Infinity， 所以es6环境下不会报错)
let result = Math.pow(10, 1000) // RangeError: Result too large
```

6. URIError（URI 错误）： URIError 是当 encodeURI() 或 decodeURI() 等函数传入无效的 URI 时抛出的错误。

```js
// 示例 1：URI 解码无效字符
decodeURIComponent("%") // URIError: URI malformed
```

**JavaScript 提供了异常处理机制 try...catch...finally，它可以帮助捕获并处理运行时的错误。**  
try..catch 对我们来说可能已经非常熟悉了。但你是否知道 try 可以和 catch 或者 finally 配对使用，并且必要时两者可同时出现？finally 中的代码总是会在 try 之后执行，如果有 catch 的话则在 catch 之后执行。也可以将 finally 中的代码看作一个回调函数，即无论出现什么情况最后一定会被调用。

如果 try 中有 return 语句会出现什么情况呢？ return 会返回一个值，那么调用该函数并得到返回值的代码是在 finally 之前还是之后执行呢？

```js
function foo() {
  try {
    return 42 // 这里会执行，返回 42,throw Error() 抛出异常以不会影响 finally 执行。
  } finally {
    console.log("Hello") // 这里的代码总是会执行
  }
  console.log("never runs") // 这行代码永远不会执行
}

console.log(foo())
```

try...finally 语句有一个特殊的行为：finally 代码块中的内容总是会执行，无论 try 代码块中是否抛出了异常或者返回了值。即使 try 中执行了 return 语句，finally 中的代码仍然会被执行，且 finally 执行后会返回 try 中的值。

**执行步骤**：

- try 代码块执行：try 代码块中的 return 42; 被执行。此时，函数的返回值 42 会被记录，但并不会立即返回，因为 finally 代码块还没有执行。
- finally 代码块执行：无论 try 中是否有 return 或者其他异常，finally 中的代码会始终执行。在这里，console.log("Hello") 会被执行，打印出 "Hello"。
- 函数的返回值：finally 代码块执行后，JavaScript 引擎会继续执行 return 语句，并返回 try 中的值（即 42）。因此，foo() 函数最终返回的是 42。
- console.log("never runs")：finally 中的代码执行完成后，函数会返回，所以 finally 后面的代码不会被执行。console.log("never runs") 永远不会运行，因为它位于 finally 之后，return 语句的执行会中断该函数的进一步执行。

**continue 和 break 等控制语句也是如此:**

```js
for (var i = 0; i < 10; i++) {
  try {
    continue
  } finally {
    console.log(i)
  }
}
// 0 1 2 3 4 5 6 7 8 9
```

**注意**

- "break" 语句只能在封闭迭代或 switch 语句内使用。（一般情况）
- "continue" 语句只能在封闭迭代语句内使用。  
  特殊情况：但尽量不要这么写，这会使代码变得晦涩难懂。

```js
function foo() {
  bar: {
    try {
      return 42
    } finally {
      // 跳出标签为bar的代码块
      break bar
    }
  }
  console.log("Crazy")
  return "Hello"
}
console.log(foo())
```

**注意：** finally 中的 return 会覆盖 try 和 catch 中 return 的返回值

```js
function foo() {
  try {
    return 1
  } finally {
  }
}
console.log(foo()) // 1

function foo() {
  try {
    return 1
  } finally {
    return
  }
}
console.log(foo()) // undefined
```

## 补充

### shim/polyfill

通常来说，在老版本的（不符合规范的）运行环境中扩展原生方法是唯一安全的，因为环境不太可能发生变化——支持新规范的新版本浏览器会完全替代老版本浏览器，而非在老版本上做扩展。

如果能够预见哪些方法会在将来成为新的标准，如 Array.prototype.foobar，那么就可以完全放心地使用当前的扩展版本，不是吗？

```js
if (!Array.prototype.foobar) {
  // 幼稚
  Array.prototype.foobar = function () {
    this.push("foo", "bar")
  }
}
```

如果规范中已经定义了 Array.prototype.foobar，并且其功能和上面的代码类似，那就没有什么问题。这种情况一般称为 polyfill（或者 shim）。  
polyfill 能有效地为不符合最新规范的老版本浏览器填补缺失的功能，让你能够通过可靠的代码来支持所有你想要支持的运行环境。

# 异步和性能

毫无疑问，从一开始，JavaScript 就涉及异步编程。但是，多数 JavaScript 开发者从来没有认真思考过自己程序中的异步到底是如何出现的，以及其为什么会出现，也没有探索过处理异步的其他方法。一直以来，低调的回调函数就算足够好的方法了。目前为止，还有很多人坚持认为**回调函数完全够用。**

## 初入异步

### 切片的程序

可以把 JavaScript 程序写在单个 .js 文件中，但是这个程序几乎一定是由多个块构成的。这些块中只有一个是现在执行，其余的则会在将来执行。最常见的块单位是函数。

大多数 JavaScript 新手程序员都会遇到的问题是：程序中**将来执行的部分**并不一定在**现在运行的部分**执行完之后就立即执行。换句话说，现在无法完成的任务将会异步完成，因此并不会出现人们本能地认为会出现的或希望出现的阻塞行为。

```js
// 网络请求
let data = ajax("http://some.url.1")
console.log(data)
// 啊哦！data通常不会包含Ajax结果
```

可以看出 ajax 并不是立即返回 data 所以 console.log( data ) 不会获取到 data 的结果，如果 ajax 能够阻塞程序的执行，那么 console.log( data ) 将拿到准确的答案。  
**我们发出一个异步 Ajax 请求，然后在将来才能得到返回的结果，我们可以利用回调函数来解决。**

```js
ajax("http://some.url.1", function myCallbackFunction(data) {
  console.log(data) // 耶！这里得到了一些数据！
})
```

下面程序有两个块：现在执行的部分，以及将来执行的部分。

```js
// 现在
function now() {
 return 21;
}
function later() { .. }
var answer = now();
setTimeout( later, 1000 );
// 将来：
answer = answer * 2;
console.log( "Meaning of life:", answer );
```

**现在**块 在程序运行之后就会立即执行。但是，setTimeout(..) 还设置了一个事件（定时）在将来执行，所以函数 later() 的内容会在之后的某个时间（从现在起 1000 毫秒之后）执行。

**小结**： 任何时候，只要把一段代码包装成一个函数，并指定它在响应某个事件（定时器、鼠标点击、Ajax 响应等）时执行，**你就是在代码中创建了一个将来执行的块**，也由此在这个程序中引入了异步机制。

#### 异步的控制台

并没有什么规范指定 console.\* 系列如何工作——它们并不是 JavaScript 正式的一部分，**而是由宿主环境（不同浏览器环境、node.js 环境）添加到 JavaScript 中的，不同的浏览器和 JavaScript 环境可以按照自己的意愿来实现**，有时候这会引起混淆。

在某些条件下，某些浏览器的 console.log(..) 并不会把传入的内容立即输出。一些浏览器在进行性能优化时，可能会延迟输出日志，特别是在高频率的 console.log(..) 调用中。这种延迟是为了减少控制台输出对性能的影响，尤其是在开发者工具处于打开状态时。

看看以下例子：**在浏览器控制台和编译器中运行结果可能大相径庭**

```js
var a = {
  index: 1,
}
// 然后
console.log(a) // ??
// 再然后
a.index++
```

编译器打印的一般是我们期望的结果: `{ index: 1 }`，而在浏览器控制台中打印可能会是 `{ index: 2 }`, 浏览器可能会认为需要把控制台的 I/O 延迟到后台，所以当浏览起控制台开始执行 `consle.log(a)` 时，`a.index` 已经被修改为 2 了。

到底什么时候控制台 I/O 会延迟，甚至是否能够被观察到，这取决于不同的浏览器和 JavaScript 引擎。但你要意识到这是 i/o 异步化造成的。

### 事件循环

JavaScript 引擎并不是独立运行的，它运行在宿主环境中，对多数开发者来说通常就是 Web 浏览器。经过最近几年（不仅于此）的发展，JavaScript 已经超出了浏览器的范围，进入了其他环境，比如通过像 Node.js 这样的工具进入服务器领域。实际上，JavaScript 现如今已经嵌入到了从机器人到电灯泡等各种各样的设备中。

这些宿主环境提供线程让 js 能够运行，具体代码执行时调用 js 引擎。js 事件的调度都是通过其**宿主环境**来进行的。  
**伪代码**：
```js
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = []
var event
// “永远”执行
while (true) {
  // 一次tick/一轮
  if (eventLoop.length > 0) {
    // 拿到队列中的下一个事件
    event = eventLoop.shift()
    // 现在，执行下一个事件
    try {
      event()
    } catch (err) {
      reportError(err)
    }
  }
}
```
用 while 循环实现的持续运行的循环，循环的每一轮称为一个 tick。对每个 tick 而言，如果在队列中有等待事件，那么就会从队列中摘下一个事件并执行，这些事件就是你的回调函数。  
**定时器setTimeout(..)**： 并没有把你的回调函数挂在事件循环队列中。它所做的是设定一个定时器。当定时器到时后，环境会把你的回调函数放在事件循环中，这样，在未来某个时刻的 tick 会摘下并执行这个回调。  
**定时器时间一到就一定会执行吗？**：不一定，因为存在精度丢失问题，因为定时器也会被放入事件循环进行排队，如果它前面有很多回调事件在等待执行，那么它可能会被延迟执行，**只能确保它不会在设定的时间前执行，它可能是准时的或者是延迟的。**  

**注意：**ES6 精确指定了事件循环的工作细节，而不是只由宿主环境来管理，这个改变的一个主要原因是 ES6 中 Promise 的引入，能够更加精确的控制事件循环。  


### 并行线程
“异步”和“并行”常常被混为一谈，但实际上它们的意义完全不同。异步存在回调思想，**即使某个代码执行有延迟也不会阻塞程序**。而**并行则是真正的同时执行多个任务。**  

并行计算最常见的工具就是进程和线程。进程和线程独立运行，并可能同时运行，多个线程能够共享属于他们进程的资源。  
与之相对的是，事件循环通过任务拆分并顺序执行，它通过分立线程让每个线程各自分工（js线程、i/o 线程、网络线程、定时器线程等）来实现顺序执行和并行的共存来实现事件循环。  

多线程编程是非常复杂，主要是因为它涉及到多个线程同时执行，并且**线程之间的交互和同步可能会引发许多潜在的问题。**  
- 线程同步与竞态条件：多个线程修改共享变量可能会遇到同步问题。
- 死锁：两个或多个线程互相等待对方释放资源，从而导致整个系统停滞不前。
- 线程调度问题
- 线程安全问题

JavaScript 从不跨线程共享数据，这意味着不需要考虑这一层次的不确定性。但是这并不意味着 JavaScript 总是确定性的（定时器🌰）。  

### 并发
现在让我们来设想一个瀑布流（某音，某红薯）向下滑动场景，其随着用户向下滚动列表而逐渐加载更多内容。要正确地实现这一特性，需要（至少）两个独立的“进程”同时运行（**也就是说，是在同一段时间内，并不需要在同一时刻**）。  

第一个“进程”在用户向下滚动页面触发 onscroll 事件时响应这些事件（发起 Ajax 请求要求新的内容）。第二个“进程”接收 Ajax 响应（把内容展示到页面）。  

“进程”1（onscroll 事件）：  
onscroll, 请求1
onscroll, 请求2
onscroll, 请求3
onscroll, 请求4   

“进程”2（Ajax 响应事件）：  
- 响应1
- 响应2
- 响应3
- 响应4  

可能某个 onscroll 事件和某个 Ajax 响应事件恰好同时可以处理。举例来说，假设这些事件的时间线是这样的：  
- onscroll, 请求1
- onscroll, 请求2 响应1
- onscroll, 请求3 响应2
- 响应3
- onscroll, 请求4 响应4  

由于JavaScript 一次只能处理一个事件，所以要么是onscroll，请求 2 先发生，要么是响应 1 先发生，**但是不会严格地同时发生。**  
下面列出了事件循环队列中所有这些交替的事件：  
- onscroll, 请求1 <--- 进程1启动
- onscroll, 请求2
- 响应1 <--- 进程2启动
- onscroll, 请求3
- 响应2
- 响应3
- onscroll, 请求4
- 响应4

“进程”1 和“进程”2 并发执行，但是它们的各个事件是在事件循环队列中依次运行的。**这是js单线程事件循环处理并发事件的一种方式。**  

### 任务
  在 ES6 中，有一个新的概念建立在事件循环队列之上，叫作**任务队列（job queue）**。这个概念给大家带来的最大影响可能是 Promise 的异步特性。  

  因此，我认为对于任务队列最好的理解方式就是，它是挂在事件循环队列的每个 tick 之后
的一个队列。这就像是在说：“哦，这里还有一件事**将来要做**，但要**确保在其他任何事情发生之前就完成它。” **  
  **事件循环队列类似于一个游乐园游戏：玩过了一个游戏之后，你需要重新到队尾排队才能再玩一次。而任务队列类似于玩过了游戏之后，插队接着继续玩。**  

### 语句顺序
代码中语句的顺序和 JavaScript 引擎执行语句的顺序并不一定要一致。  
```js
var a, b;
a = 10;
b = 30;
a = a + 1;
b = b + 1;
console.log( a + b ); // 42
```
但是，JavaScript 引擎在编译这段代码之后可能会发现通过, 重新安排这些语句的顺序有可能提高执行速度。(**编译优化**)  
比如，引擎可能会发现，其实这样执行会更快：
```js
var a, b;
a = 10;
a++;
b = 30;
b++;
console.log( a + b ); // 42
```

### 小结
  尽管 JavaScript 语义让我们不会见到编译器语句重排序可能导致的噩梦，这是一种幸运，但是代码编写的方式（从上到下的模式）和编译后执行的方式之间的联系非常脆弱，编译器语句重排序几乎就是并发和交互的微型隐喻。作为一个一般性的概念，清楚这一点能够使你更好地理解异步JavaScript 代码流问题。  

## 回调
  在函数内部，语句以可预测的顺序执行（在编译器以上的层级！），但是在函数顺序这一层级，事件（也就是异步函数调用）的运行顺序可以有多种可能。  

  在事件循环模型中，函数都是作为回调（callback）使用的，回调是这门语言中最基础的异步模式，。回调函数是 JavaScript 的异步主力军，并且它们不辱使命地完成了自己的任务。  

### 难以维护的回调
```js
fs.readFile('file1.txt', 'utf8', function (err, data1) {
  if (err) {
    console.error(err);
  } else {
    fs.readFile('file2.txt', 'utf8', function (err, data2) {
      if (err) {
        console.error(err);
      } else {
        fs.readFile('file3.txt', 'utf8', function (err, data3) {
          if (err) {
            console.error(err);
          } else {
            console.log(data1, data2, data3);
          }
        });
      }
    });
  }
});
```
- 代码可读性差：代码层级深，每增加一层异步操作，就需要进一步嵌套回调，导致代码块嵌套得越来越深，阅读时很难一眼看清楚程序逻辑。
- 错误处理复杂：每一层的回调都需要处理错误（如上例中每个回调内都有 if (err) 的判断）。
- 调试困难：程序出现问题时，嵌套的回调函数使得堆栈追踪变得更困难，尤其是当出现多个嵌套时，定位问题源头需要深入每一层回调。

// 示例：
```js
listen("click", function handler(evt) {
  setTimeout(function request() {
    ajax("http://some.url.1", function response(text) {
      if (text == "hello") {
        handler()
      } else if (text == "world") {
        request()
      }
    })
  }, 500)
})
```
一开始我们在等待 click 事件，然后等待定时器启动，然后等待 Ajax 响应返回，之后可能再重头开始。  

让我们不用嵌套再把前面的嵌套事件 / 超时 /Ajax 的例子重写一遍  
```js
listen( "click", handler );
function handler() {
 setTimeout( request, 500 );
}
function request(){
 ajax( "http://some.url.1", response );
}
function response(text){
 if (text == "hello") {
 handler();
 }
 else if (text == "world") {
 request();
 }
} 
```
  这种组织形式的代码不像前面以嵌套 / 缩进的形式组织的代码那么容易识别了，但是它和回调地狱一样脆弱，易受影响，他们之间的依赖性将不复存在， 执行顺也将不受控。  

### 信任问题
```js
// A
ajax( "..", function(..){
 // C
} );
// B
```
  A 和 B 现在执行，在 JS 引擎直接控制。而 C 会延迟到将来发生，并且受第三方控制：ajax()。从根本上来说，这种控制的转移通常不会给程序带来很多问题。  

  但是有些时候这种控制权的转换会带来问题，这是回调驱动设计最严重（也是最微妙）的问题，ajax（异步逻辑/第三方控制的代码）它是某个第三方提供的工具，我们把这种情况称为**控制反转**（inversion of control），把程序的某个部分控制权交给第三方。  

#### 五个回调的故事
  这是一个关于 回调地狱 和 外部工具依赖带来的信任风险 的故事，讲述了在开发过程中如何因为回调函数的复杂性和不可预测性，导致了严重的问题。  

故事概要：  
你作为开发人员，为一个销售昂贵电视的网站实现结账系统。在最后的购买页面，你需要使用第三方分析工具来追踪交易。这个分析工具要求传入一个回调函数，回调函数负责处理结账（收费）和显示感谢页面。  
```js
analytics.trackPurchase( purchaseData, function(){
  chargeCreditCard(); // 收费
  displayThankyouPage(); // 显示感谢页面
});
```
问题爆发：  
  六个月后，你突然接到老板的电话，得知一位高级客户的信用卡被错误地刷了五次，导致客户非常生气。通过调查，**你发现回调函数被分析工具错误地调用了多次（五次），导致了多次扣款。**  

原因调查：
  分析工具的开发者发现，原来他们的实验代码导致了回调函数被重复调用。尽管这不是预期的行为，但他们没有及时发现并修复这段代码。
虽然问题是外部工具的错误，但由于**你没有对回调函数进行充分的保护（例如防止重复调用）**，导致了这个问题。  

临时修复：  
为了防止回调函数被多次调用，你在回调函数中添加了一个 tracked 标志，确保回调只执行一次。
```js
var tracked = false;
analytics.trackPurchase(purchaseData, function(){
  if (!tracked) {
    tracked = true;
    chargeCreditCard();
    displayThankyouPage();
  }
});
```
新问题的出现：  
QA 工程师提出，如果分析工具根本没有调用回调函数怎么办？
你意识到，除了重复调用，回调还可能出现其他错误（例如调用太早、太晚，或没有传递参数等）。这引发了你对所有可能错误的深度思考和复杂的错误处理逻辑。  

进一步反思：
随着对问题的深入研究，你意识到，**对外部工具的依赖（尤其是异步回调的依赖）带来了巨大的信任风险。**每次使用外部回调函数时，都必须考虑其所有可能出错的情况，这增加了维护的复杂性，并且容易出现不可预见的问题。  

  这个故事强调了 回调函数 在处理异步操作时可能带来的麻烦，特别是在对外部工具的信任过于依赖时，如何提高代码的健壮性和可维护性变得至关重要。  

**小结**：
  对于异步回调，我们需要确保回调函数安全的执行，并构建防御机制，当出现回调地狱时，我们会重复这些工作（这就真tm没必要），**回调最大的问题是控制反转，它会导致信任链的完全断裂。**  
  如果你的代码中使用了回调，而且你还没有应用某种逻辑来解决所有这些控制反转导致的信任问题，那你的代码现在已经有了 bug，即使它们还没有给你造成损害，隐藏的 bug 也是 bug。**确实是地狱。**

### 咱还是别回调了吧！
为了更优雅地处理错误，有些 API 设计提供了分离回调（一个用于成功通知，一个用于出错通知）：  
```js
function success(data) {
 console.log( data );
}
function failure(err) {
 console.error( err );
}
ajax( "http://some.url.1", success, failure );
```
还有一种常见的回调模式叫作“error-first 风格”（有时候也称为“Node 风格”，因为几乎所有 Node.js API 都采用这种风格）。  
```js
function response(err,data) {
 // 出错？
 if (err) {
 console.error( err );
 }
 // 否则认为成功
 else {
 console.log( data );
 }
}
ajax( "http://some.url.1", response );
```
  这并没有真正解决主要的信任问题,没有涉及阻止或过滤不想要的重复调用回调的问题，你可能同时得到成功或者失败的结果，或者都没有，并且你还是不得不编码处理所有这些情况。  

### 小结
  回调函数是 JavaScript 异步的基本单元。但是随着 JavaScript 越来越成熟，对于异步编程领，域的发展，回调已经不够用了。  
  是回调表达异步流程的方式是非线性的、非顺序的，这使得正确推导这样的代码难度很大。难于理解的代码是坏代码，会导致坏 bug。  
  我们需要一种更同步、更顺序、更阻塞的的方式来表达异步，**更重要的是，回调会受到控制反转的影响，因为回调暗中把控制权交给第三方**， 导致的信任问题你不得不在回调做安全处理，导致代码臃肿。  
  我们需要一个通用的方案来解决这些信任问题。不管我们创建多少回调，这一方案都应可以复用，且没有重复代码的开销，接下来会介绍更高级、功能更强大的异步模式。  


## Promise
  在上一章，介绍了回调缺乏顺序性和可信任性，首先想要解决的是**信任问题，即控制反转**。  
  如果我们能够把控制反转再反转回来，**希望第三方给我们提供了解其任务何时结束的能力，然后由我们自己的代码来决定下一步做什么，这种范式就称为 Promise。**  

### what is promise 
  只了解 API 会丢失很多抽象的细节。Promise 属于这样一类工具：通过某人使用它的方式，很容易分辨他是真正理解了这门技术，还是仅仅学习和使用 API而已。  

#### 未来的结果
1. 请求与交易：顾客通过下订单并付款，发出了对某个值（芝士汉堡）的请求，启动了一次交易。
2. 承诺：顾客不能立即得到汉堡，而是收到一张带有订单号的收据。订单号是一个承诺，保证最终会得到汉堡。  
3. 等待的过程中去做其他事情：**订单号作为汉堡的占位符**，使得顾客可以在等待过程中做其他事情，例如打把王者。  
4. 终于，我听到服务员在喊“订单 666”，然后愉快地拿着收据走到柜台，把收据交给收银
员，换来了我的芝士汉堡。  


  换句话说，一旦我需要的值准备好了，我就用我的承诺值（value-promise）换取这个值本身。但是，还可能有另一种结果。他们叫到了我的订单号，但当我过去拿芝士汉堡的时候，收银员满是歉意地告诉我：“不好意思，芝士汉堡卖完了。”除了作为顾客对这种情况感到愤怒之外，我们还可以看到未来值的一个重要特性：它可能成功，也可能失败。  

**现在值与将来值**  
- 现在值：指的是在执行代码时，变量已经有了明确的值（例如已经从计算中得出）。
- 将来值：指的是值在未来某个时刻才会确定，可能是由于异步操作的原因，暂时无法获得。

回调函数处理“将来值”：  
- 假设你需要做一个加法运算，运算的两个数 x 和 y 可能是来自异步操作的结果（例如网络请求或数据库查询）。然而，这两个数并不一定在当前时刻都已经准备好。
- 如果直接进行加法运算（x + y），会因为 x 可能未定义而报错（NaN）。

如何处理：  
你需要一种方法来处理“将来值”。即在 x 和 y 都准备好之前，不执行加法运算，而是等它们都准备好了之后再执行。  
```js
function add(getX, getY, cb) {
  var x, y;
  getX(function(xVal) {
    x = xVal;
    // 两个都准备好了？
    if (y != undefined) {
      cb(x + y); // 发送和
    }
  });
  
  getY(function(yVal) {
    y = yVal;
    // 两个都准备好了？
    if (x != undefined) {
      cb(x + y); // 发送和
    }
  });
}

// fetchX 和 fetchY 是获取 x 和 y 的异步函数
add(fetchX, fetchY, function(sum) {
  console.log(sum); // 输出加法结果
});
```
  丑陋的代码结构：虽然这个方法解决了问题，但代码结构不够优雅，特别是在存在多层回调时，可能变得非常难以维护（回调地狱）。  
  **解决方法**：异步处理的思维方式：统一“现在”与“将来”的操作，使得异步行为变得更可预测和易于管理。  


**Promise的引入**  
- Promise 是一种用于处理异步操作的机制，它让我们能够优雅地处理“将来值”（future values）而不需要陷入复杂的回调地狱。
- Promise 封装了依赖时间的状态，通过 .then() 方法处理成功（完成）和失败（拒绝）两种情况。  

Q：假设你有两个异步操作，fetchX() 和 fetchY()，它们返回两个未来值（Promise），你需要等它们都完成后再执行加法运算。  
A：使用 Promise.all([xPromise, yPromise]) 来等待两个 Promise 的完成。Promise.all 接收一个 Promise 数组，并返回一个新的 Promise，这个新的 Promise 会在数组中的所有 Promise 完成后执行。  
```js
function add(xPromise, yPromise) {
  return Promise.all([xPromise, yPromise]) // 等待两个 promise 完成
    .then(function(values) {
      return values[0] + values[1]; // 对结果进行加法运算
    });
}
add(fetchX(), fetchY()) // 调用异步函数，返回 Promise
  .then(function(sum) {
    console.log(sum); // 输出结果
  });
```
统一处理异步值：即使 fetchX() 和 fetchY() 返回的 Promise 可能是立即完成的，或者将来完成的，Promise 通过 .then() 方法确保最终结果在所有依赖的 Promise 完成后可预测地返回。  

Promise 的强大特性：  
- 时间无关性：从外部来看，Promise 本身与时间无关，它封装了等待的完成或拒绝的状态。**无论底层值是在现在还是将来，Promise 都能在适当的时候做出响应。** 
- 不变性: 一旦一个 Promise 完成或被拒绝，它的状态就不会改变, 方便调试。
**通过 Promise，异步操作不再是一个令人困惑和难以管理的问题，开发者能够以更为简洁和可预测的方式处理将来值。**  

#### 具有 then 方法的鸭子类型
在 Promise 领域，一个重要的细节是如何确定某个值是不是真正的 Promise。  
  既然 Promise 是通过 new Promise(..) 语法创建的，那你可能就认为可以通过 p instanceof Promise 来检查。但遗憾的是，这并不足以作为检查方法。

  Promise 值可能是从其他浏览器窗口（iframe 等）接收到的。这个浏览器窗口自己的 Promise 可能和当前窗口 /frame 的不同，因此这样的检查无法识别 Promise实例。  
  还有，库或框架可能会选择实现自己的 Promise，而不是使用原生 ES6 Promise 实现。实际上，很有可能你是在早期根本没有 Promise 实现的浏览器中使用由库提供的 Promise。  

  鸭子类型（Duck Typing）是一种动态类型的编程理念，主要用于判断一个对象的行为方法（或属性），而不是其实际类型。这种理念的核心思想是：“如果一只鸟走起来”在 JavaScript 中，由于其动态语言的特性，鸭子类型常被用来判断对象是否具备某种功能，而不关心对象的具体类型或继承关系。  


### Promise 信任问题
