## 类型
### 类型概述
js 中的类型分为原始（基本）数据类型和引用数据类型。  

JavaScript 有七种内置类型：
**原始数据类型**

- 字符串
- 数字（bigint也属于数字类型，只不过它可以表示任意大小的整数（不能表示小数））
- 布尔
- null
- undefined
- symbol

**引用数据类型**
js中的引用数据类型只有对象，对象又分为普通对象、数组、函数等。

**typeof类型检测问题**  

```js
console.log(typeof undefined) // "undefined"
console.log(typeof {}) // "object"
console.log(typeof []) // "object"
console.log(typeof Symbol()) // "symbol"
console.log(typeof 123) // "number"
console.log(typeof "123") // "string"
console.log(typeof true) // "boolean"
console.log(typeof function () { }) // "function"

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
正确的返回结果应该是 "null"，但这个 bug 由来已久，在 JavaScript 中已经存在了将近二十年，也许永远也不会修复，因为这牵涉到太多的 Web 系统，“修复”它会产生更多的bug，令许多系统无法正常工作。  
直接使用严格相等来判断 null 类型
```js
console.log(null === null) // true
```

这样看来，function（函数）也是 JavaScript 的一个内置类型。其实它实际上是 object 的一个“子类型”。具体来说，函数是“可调用对象”，它有一个**内部属性 [[Call]]**，该属性使其可以被调用。  

函数不仅是对象，还可以拥有属性。

```js
function foo(a, b) { }
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
JavaScript 中的变量是没有类型的，只有值才有。变量可以随时持有任何类型的值，因为js是一门动态语言。  
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
大多数开发者倾向于将 undefined 等同于 undeclared（未声明），但在 JavaScript 中它们完全是两回事。看上述代码，a 声明未赋值，而 b 未声明，但是它们的 typeof 判断都是 "undefined"，而访问b时会直接报错，并且报错信息为ReferenceError: b is not defined。这就很怪，但是js就是这样设计的。  
**tip：**typeof b 返回 "undefined" 是一种安全防范机制（阻止报错）来检查 undeclared 变量。  


## 值
下面来介绍 JavaScript 中的几个内置值类型。
### 数组
在 JavaScript 中，数组可以容纳任何类型的值，可以是字符串、数字、对象（object），甚至是其他数组。对数组声明后即可向其中加入值，**不需要预先设定大小，js数组是动态的，支持动态扩容**。  

**tip:** 在使用delete运算符删除数组元素时，数组长度不会改变。delete 删除元素后，数组变为一个稀疏数组（也就是存在空白单元）。
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

const a = [ ];
a["13"] = 42;
a.length; // 14
```

**类数组的转换**  
有时需要将类数组（一组通过数字索引的值）转换为真正的数组，这一般通过数组工具函数（如 indexOf(..)、concat(..)、forEach(..) 等）来实现。但最常见的是 es6 中的 Array.from() 方法。  


### 字符串
字符串经常被当成字符数组，JavaScript 中的字符串和字符数组并不是一回事，最多只是看上去相似而已。JavaScript 中字符串是不可变的，而数组是可变的，只是字符串能够通过索引访问字符，看上去和数组类似。  

许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数组的**非变更方法**来处理字符串。  
```js
var a = "foo"
var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
 return v.toUpperCase() + ".";
} ).join( "" );
c; // "f-o-o"
d; // "F.O.O."
```
**注意字符串反转**：。数组有一个字符串没有的可变，更成员函数 reverse() **可惜我们无法“借用”数组的可变更成员函数，因为字符串是不可变的**

### 数字
JavaScript 只有一种数值类型：number（数字），包括“整数”和带小数的十进制数。  
**tip:** JavaScript 没有真正意义上的整数，这也是它一直以来为人诟病的地方。这种情况在将来或许会有所改观，但目前只有数字类型。  
JavaScript 中的“整数”就是没有小数的十进制数。所以 42.0 即等同于“整数”42。  

与大部分现代编程语言（包括几乎所有的脚本语言）一样，JavaScript 中的数字类型是基于 IEEE 754 标准来实现的，该标准通常也被称为“浮点数”。JavaScript 使用的是“双精度”格式（即 64 位二进制），所以js中数字是基于双精度浮点数建立的。  


**数字语法**  
JavaScript 中的数字常量一般用十进制表示。
```js
var a = 42;
var b = 42.3;
```
数字前面的 0 可以省略：
```js
var a = 0.42;
var b = .42;
```
小数点后小数部分最后面的 0 也可以省略：
```js
var a = 42.0;
var b = 42.; // 42. 这种写法没问题，只是不常见，但从代码的可读性考虑，不建议这样写。
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
最常见的方法是设置一个误差范围值，通常称为“机器精度”,JavaScript 的数字来说，这个值通常是 2^-52，也就是 2 的52次方分之一。如果误差在这个范围内就认为他们相等。  
从 ES6 开始，该值定义在 Number.EPSILON 中，我们可以直接拿来用
```js
function numbersCloseEnoughToEqual(n1, n2) {
  // Math.abs() 返回一个数的绝对值
 return Math.abs( n1 - n2 ) < Number.EPSILON;
}
var a = 0.1 + 0.2;
var b = 0.3;
numbersCloseEnoughToEqual( a, b ); // true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 ); // false
```

**整数的安全范围**  
数字的呈现方式决定了“整数”的安全值范围远远小于 Number.MAX_VALUE。  

能够被“安全”呈现的最大整数是 2^53 - 1，即 9007199254740991，在 ES6 中被定义为Number.MAX_SAFE_INTEGER。最小整数是 -9007199254740991，在 ES6 中被定义为 Number.
MIN_SAFE_INTEGER。  

有时 JavaScript 程序需要处理一些比较大的数字, 由于JavaScript 的数字类型无法精确呈现 64 位数值，所以必须将它们保存（转换）为字符串。  

**整数检测**  
要检测一个值是否是整数，可以使用 ES6 中的 Number.isInteger(..) 方法：
```js
Number.isInteger( 42.0 ); // true
Number.isInteger( 42.3 ); // false
```

要检测一个值是否是安全的整数，可以使用 ES6 中的 Number.isSafeInteger(..) 方法：
```js
Number.isSafeInteger( 9007199254740991 ); // true
Number.isSafeInteger( 9007199254740992 ); // false
```


### 特殊数值
#### 不是值的值
undefined 类型只有一个值，即 undefined。null 类型也只有一个值，即 null。它们的名称既是类型也是值。  
null 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而undefined 却是一个标识符，可以被当作变量来使用和赋值。  

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
var a = 42;
console.log( void a ); // undefined
```

#### 特殊的数字
数字类型中有几个特殊的值：  
**1. 不是数字的数字**  
NaN 是“数字”类型中的一个特殊值，表示“非数字”, 或者说是无效的数字，其实无效数字的说法可能更准确一点。  
```js
let a = 1
let b = a * 'foo'
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
console.log(isNaN('foo')) // true
console.log(isNaN(true)) // false
```
很明显 "foo" 不是一个数字，但是它也不是 NaN。这个 bug 自 JavaScript 问世以来就一直存在，至今已超过 19 年。  
更优雅的解决方案： **ES6 开始我们可以使用工具函数 Number.isNaN(..)**。
```js
console.log(Number.isNaN(undefined)) // false
console.log(Number.isNaN({})) // false
console.log(Number.isNaN('foo')) // false
console.log(Number.isNaN(true)) // false
```

**无穷数**  
JavaScript 中有一个特殊的值 Infinity，表示无穷大, 当JavaScript 的运算结果溢出时，此时结果为Infinity 或者 -Infinity。
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

规范规定，如果数学运算（如加法）的结果超出处理范围，则由 IEEE 754 规范中的“就近取整”模式来决定最后的结果。b 与  Number.MAX_VALUE 更加接近，所以取  Number.MAX_VALUE，c与 Infinity 更加接近，所以取 Infinity。
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
  x: 2
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
js内建原生函数有：
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
Object.prototype.toString.call( null );
// "[object Null]"
Object.prototype.toString.call( undefined );
// "[object Undefined]"

Object.prototype.toString.call( "abc" );
// "[object String]"
Object.prototype.toString.call( 42 );
// "[object Number]"
Object.prototype.toString.call( true );
// "[object Boolean]"
```
虽然 Null() 和 Undefined() 这样的原生构造函数并不存在，但是内部 [[Class]] 属性值仍然是 "Null" 和 "Undefined"。  
上例中基本类型值被各自的封装对象自动包装(也就是调用 Object.prototype.toString.call 这个方法时，基本数据类型会被js引擎转化为包装对象)，所以它们的内部 [[Class]] 属性值分别为"String"、"Number" 和 "Boolean"。

### 包装对象
基 本 类 型 值 没 有 .length和 .toString() 这样的属性和方法，需要通过对应的包装对象（new Number、 new String、 new Boolean）来访问。  
js引擎会自动处理。
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

**应该尽量避免使用构造函数new创建实例，除非十分必要，因为它们经常会产生意想不到的结果。**
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


