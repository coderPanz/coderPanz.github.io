## 词法作用域
作用域是一套js引擎查找变量的一套规则。js的作用域是词法作用域，也叫静态作用域。但是 js 中也存在着特殊情况形成的动态作用域也叫欺骗词法作用域，也就是通过词法静态分析后，在运行阶段可以动态修改作用域的特殊方法。  
  在函数，变量声明时他们的作用域和对应的变量查找规则就已经被确定了。
无论函数在哪里被调用（运行时），也无论它如何被调用（运行时），它的词法作用域都只由函数被声明时所处的位置决定（编译）。

### 欺骗词法作用域
就是在运行时动态修改先前已经确定的词法作用域。  
JavaScript 中有两种机制来实现这个目的。
- eval：
- with：

#### eval
JavaScript 中的 eval(..) 函数可以接受一个字符串为参数，并在运行时解析字符串为js代码。这使得如果传入的是声明，那么会影响到原本变量的查找规则，也就是会影响到作用域链。  
这里本来应该访问的是 var b = 2 这个 b 变量，这是编译时决定的，但是由于 eval 影响了这一规则，它影响到了作用域链。
```js
function foo(str, a) {
  eval(str) // 欺骗！
  console.log(a, b)
}
var b = 2
foo("var b = 3;", 1) // 1, 3
```

在看严格模式：在严格模式的程序中，eval(..) 在运行时有其自己的词法作用域，它会将生成的声明隐藏或者说是隔离，从而不会影响原本的作用域链已经变量查找规则。

```js
function foo(str) {
  "use strict"
  eval(str)
  console.log(a) // ReferenceError: a is not defined
}
foo("var a = 2")
```

#### with
JavaScript 中另一个难以掌握（并且现在也不推荐使用）的用来欺骗词法作用域的功能是with 关键字。with 一般用于避免重复的引用，**同一个对象的多个属性**的一个快捷方式。  
```js
var obj = {
  a: 1,
  b: 2,
  c: 3,
}
// 单调乏味的重复 "obj"
obj.a = 2
obj.b = 3
obj.c = 4
// 简单的快捷方式
with (obj) {
  a = 3
  b = 4
  c = 5
}
```
with 处理对象时会创建一个词法作用域，，例如上： a，b，c **被看作这个作用域中的标识符**同时他们也是obj对象的属性。  

**注意：**eval(..) 函数如果接受了含有一个或多个声明的代码，就会修改其所处的词法作用域，而
with 声明实际上是根据你传递给它的对象凭空创建了一个全新的词法作用域。






```js
function foo() {
  // lsh 查询，找到作用域顶层后任然无法知道改变量时，非严格模式下会在全局作用域中创建该变量。
  a = 2
}
foo()
console.log(globalThis.a)
```

无论函数在哪里被调用，也无论它如何被调用，它的词法作用域都只由函数被声明时所处的位置决定。
欺骗词法：如果词法作用域完全由写代码期间函数所声明的位置来定义，怎样才能在运行时来“修改”（也可以说欺骗）词法作用域呢？欺骗词法作用域会导致性能下降。

```js
function bar(str, a) {
  eval(str)
  console.log(a, b)
}
var b = 666
bar("const b = 777", 1)
```

改为 bar('var b = 777', 1)又会打印什么
为什么会有这种差异？
var 的作用域是函数作用域：
在 eval 中，var b = 777 会将 b 声明为函数作用域的局部变量，覆盖全局变量 b。
const 的作用域是块级作用域：
eval 中的 const b = 777 声明了一个块级作用域变量，仅在 eval 的块中生效，并且 eval 执行结束后无法被访问，不影响函数作用域或全局作用域。

```js
function process(data) {
  // 在这里做点有趣的事情
}
var someReallyBigData = {}
process(someReallyBigData)
var btn = document.getElementById("my_button")
btn.addEventListener(
  "click",
  function click(evt) {
    console.log("button clicked")
  },
  /*capturingPhase=*/ false
)
```

为什么 click 会形成闭包
闭包的本质在于回调函数绑定了定义时的作用域链。
事件监听器的生命周期管理导致作用域链被保存，click 函数始终可以访问它的外部作用域。
不需要实际访问外部变量：闭包的形成与函数是否使用了外部变量无关，只要函数被引用并保留，闭包就存在。

```js
function createClosure() {
  var x = 42 // 外部变量
  return function closureIns() {
    console.log("Closure exists!")
  }
}

var closure = createClosure()
```

在 js 中，上述代码会形成闭包吗？为什么，或者说为什么要在组件卸载前销毁事件监听器？
事件监听器的匿名函数部分会形成闭包：click 函数在上述代码中并没有主动使用或捕获外部作用域的变量，但闭包的形成并不仅仅取决于是否捕获了具体的外部变量，而是与闭包的定义和 JavaScript 的机制有关。

闭包的定义：

- 一个函数可以记住其**定义时**所在的词法作用域，并在之后的某个时间点访问这个作用域中的变量。（在这儿就是 click 函数能够一直记住全局作用域/createClosure 中的 closureIns 函数能够记住 createClosure 的函数作用域）
- 即使函数不主动访问外部作用域中的变量，只要该函数的执行环境（作用域）被保留，那么闭包就存在。

形成闭包的过程：词法作用域的捕获：closureIns 函数被创建时，JavaScript 引擎将它的词法作用域与它的定义环境绑定在一起，这里也就是将 closureIns 函数作用域绑定到 createClosure 函数作用域形成作用域链，虽然 closureIns 没有显式外部作用域变量，但作用域链仍然被保留，以确保它能在将来访问这些变量。

注意：没有使用外部变量 ≠ 没有闭包

简单类比
可以将闭包的形成过程类比为：
你保存了某个房间的钥匙（作用域链）。
即使目前你不打算进入那个房间（不访问外部变量），你仍然可以随时使用这把钥匙去访问它。

```js
function process(data) {
// 在这里做点有趣的事情
}
// 在这个块中定义的内容可以销毁了！
{
  let someReallyBigData = { .. };
  process( someReallyBigData );
}
var btn = document.getElementById( "my_button" );
  btn.addEventListener( "click", function click(evt){
  console.log("button clicked");
}, /*capturingPhase=*/false );
```

为什么加一个添加一个块，形成块作用域就可以被垃圾回收。
答：当 someReallyBigData 被声明在块级作用域中时，它的生命周期仅限于该块作用域。代码块一结束，someReallyBigData 的引用不再有效。对于垃圾回收器来说，它不再需要保留这个变量所占用的内存空间，因此会销毁它。
如果不使用块级作用域，而是将 someReallyBigData 声明为全局变量或函数作用域变量，那么 someReallyBigData 就会在整个作用域内存在，直到作用域结束或者显式地将其置为 null 或 undefined。

  事件监听器与垃圾回收：至于 btn.addEventListener 绑定的 click 函数，它并不会影响 someReallyBigData 的生命周期。click 函数只会作为事件回调存在，并且由于事件循环机制，它会保持引用，直到事件触发并执行。因此，即使 someReallyBigData 被销毁，click 函数仍然存在，并可以访问其自己的作用域，以及它对应的作业域链（所以如果不使用块级作用域包裹 someReallyBigData 的话，他会置于 click 的作用域链中，导致它也不会被垃圾回收 ）。

**总结**：通过包裹形成一个块级作用域，有效地限定了代码块的生命周期，并允许垃圾回收器及时清理不再需要的内存。


### 再看循环
  通过 let 声明的循环语句形成一个块作用域，每次迭代都会创建一个新的块作用域，而不是在外部作用域中创建一个变量并在每次迭代中更新它。
```js
for (let i=0; i<10; i++) {
  console.log( i );
}
```
i 属于 for 这个循环块，只在循环中存在，并且每次循环都会创建一个新的块作用域，当前循环结束后，当前 i 被销毁。

**注意**：let 、const 会形成块级作用域，var 不会。如果用 let 来替代 var 则需要在代码重构的过程中付出额外的精力，因为形成的块作用域会导致变量的作用域范围扩大且原本变量的访问和查找规则会受影响，需要特别注意⚠️。  


总结： 函数是 JavaScript 中最常见的作用域单元，es6 中引入了块级作用域，这使得 JavaScript 中的作用域更加灵活和可控。
为什么要引入块级作用域？  
- 块级作用域也是 js 的一个作用域单元，它可以让我们在代码中创建独立的作用域，从而避免变量名冲突和变量污染。
- 并且可以更好地控制变量的生命周期，块作用域的变量在块结束时会被销毁，从而减少内存泄漏的风险。
- 符合 最小授权 原则思想，只开放给需要的代码，其他代码不需要访问所以我们也无需给予访问权，避免变量相互污染。

- ES3 开始，try/catch 结构在 catch 分句中具有块作用域。


 ```js
 try {
  var a = 2; // 在 trycatch 会形成一个块作用域，但是 var 声明的变量会被提升到全局作用域中，所以在 try 块中 a 可以被访问到。
} catch (error) {
  console.log('error');
}
function test() {
  var b = 1; // 
}
test();
console.log(a); // 2
console.log(b); // ReferenceError: b is not defined
 ```
var 声明的变量不是会存在变量提示吗？那为什么这里会报错？  
var b = 1; 声明了一个局部变量 b，它只在 test 函数内有效。也就是说，b 只在 test 函数的作用域内存在。函数执行结束后，函数作用域内的变量会被销毁，因此在函数外部访问 b 会导致 ReferenceError。


## 关于提升
声明会在编译时被编译器提升到该作用域的顶部  
引擎会在解释 JavaScript 代码之前首先对其进行编译。**编译阶段中的一部分工作就是找到所有的声明，并用合适的作用域将它们关联起来。包括变量和函数在内的所有声明都会在任何代码被执行前首先被处理。**  

**注意**： 当你看到 var a = 2; 时，可能会认为这是一个声明。但 JavaScript 实际上会将其看成两个
声明：var a; 和 a = 2;。第一个定义声明是在编译阶段进行的。第二个赋值声明会被留在
原地等待运行阶段执行。  

这个过程就好像变量和函数声明从它们在代码中出现的位置被“移动”到了最上面。这个过程就叫作提升。  
**注意：**只有声明本身会被提升，而赋值或其他运行逻辑会留在原地。如果提升改变了代码执行的顺序，会造成非常严重的破坏。



```js
var a = 2;
console.log(a); // 2

// 以上代码会被引擎编译成以下代码：
var a;
console.log(a);
a = 2;

```
```js
console.log(a); // undefined
var a = 2;

// 以上代码会被引擎编译成以下代码：
var a;
console.log(a);
a = 2;
```

**函数提升**  
函数声明也是如此，只有函数的声明会被提升，但是函数表达式却不会被提升。
```js
foo()
function foo() {
  var a
  console.log(a) // undefined
  a = 2
}

// 以上代码会被引擎编译成以下代码：
function foo() {
  var a
  console.log(a) // undefined
  a = 2
}
foo()
```

接下来看一下函数表达式
```js
// 调用函数表达式会报错
bar();  // TypeError: bar is not a function

var bar = function() {
  console.log("Hello from function expression!");
};
```
这里 bar 其实只是一个变量，并且在用 var 进行声明且提前访问，所以 bar 是一个 undefined，调用一个 undefined 是一个非法操作。bar 在代码运行阶段才被赋值为一个函数。  
总结：
- 函数声明会被提升：你可以在函数定义之前调用它。
- 函数表达式不会被提升：你只能在函数表达式之后调用它。

**注意：**即使是具名的函数表达式，名称标识符在赋值之前也无法在所在作用域中使用。  
```js
foo(); // TypeError
bar(); // ReferenceError
var foo = function bar() {
// ...
};
```

可以这么理解：赋值操作是代码运行阶段才会执行，所以等号右边的代码其实已经不属于函数声明范畴了。

### 函数优先
var支持变量重复声明，但是重复的函数声明和变量声明都会被提升，需要注意的是，是函数会首先被提升，然后才是变量。  
**注意：**let、const 不允许在同一个作用域中重复声明。
```js
foo() // 1
var foo
function foo() {
  console.log(1)
}
foo = function () {
  console.log(2)
}
```
声明覆盖
```js
function foo() {
  console.log(1)
}
function foo() {
  console.log(3)
}
foo() // 3
```

声明本身会被提升，而包括函数表达式的赋值在内的赋值操作并不会提升，因为他们都属于运行阶段才会去处理的操作。

# 作用域闭包
对于那些有一点 JavaScript 使用经验但从未真正理解闭包概念的人来说，理解闭包可以看作是某种意义上的重生，但是需要付出非常多的努力和牺牲才能理解这个概念。  
**闭包是基于词法作用域书写代码时所产生的自然结果，闭包的创建和使用在你的代码中随处可见。你缺少的是根据你自己的意愿来识别、拥抱和影响闭包的思维环境。**  

定义： 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。  
例如：bar 函数所在的词法作用域就是函数 foo 的函数作用域。
```js
function foo() {
  var a = 2
  function bar() {
    console.log(a)
  }
  return bar
}
var baz = foo()
baz() // 2 —— 朋友，这就是闭包的效果。
```
 foo() 执行后，通常会期待 foo() 的整个内部作用域都被销毁，这是由于垃圾回收机制。而闭包的“神奇”之处正是可以阻止 foo 函数作用域的销毁，bar() 本身在使用，bar 拥有覆盖 foo 函数作用域的闭包，使得该作用域能够一直存活，以供 bar() 在之后任何时间进行引用。**bar() 依然持有对该作用域的引用，而这个引用就叫作闭包。**

  继续深入理解：bar 函数在定义时的词法作用域以外的地方被调用（赋值给baz，在全局作用域中调用）。闭包使得函数可以继续访问定义时的词法作用域（bar定义时的作用域为 foo函数作用域）。  

  在函数作为值的情况下进行传递使得闭包观测起来显而易见。 baz 函数经过一系列值传递最终在 bar 函数作用域中被调用，**函数声明和函数调用所在的作用域发生变化，导致闭包。**
```js
var fn
function foo() {
  var a = 2
  function baz() {
    console.log(a)
  }
  fn = baz // 将 baz 分配给全局变量
}
function bar() {
  fn() // 妈妈快看呀，这就是闭包！
}
foo()
bar() // 2
```

**异步回调和闭包**  
可以继承上述对闭包的理解去理解异步回调，**bar 拥有覆盖 foo 函数作用域的闭包，使得该作用域能够一直存活，以供 bar() 在之后任何时间进行引用。**仔细观察这句话，以供 bar 在之后任何时间进行引用 foo （bar声明时所在的作用域）函数作用域。任何时候是不是也包括异步的情况，因为异步的本质就是延迟调用罢了，这符合闭包的规则，同时异步逻辑中的回调函数也确实会发生闭包。  
也就是说，我先声明这个函数，在x秒后我在进行调用，所以函数所在的作用域要给我保留，以便在定时结束后我进行调用。
```js
function wait(message) {
  setTimeout(function timer() {
    console.log(message)
  }, 1000)
}
wait("Hello, closure!")
```
timer 具有涵盖 wait(..) 作用域的闭包，因此还保有对变量 message 的引用。  
理解 setTimeout 内部原理：内置的工具函数 setTimeout(..) 持有对一个参数的引用，这个参数也就是传入的回调函数，引擎会保存这个过程中涉及到的词法作用域，并在定时结束后调用这个函数。  

**小小总结**： 在定时器、事件监听器、Ajax 请求、跨窗口通信、Web Workers 或者任何其他的异步（或者同步）任务中，只要使用了回调函数，实际上就是在使用闭包！

**IIFE和闭包**  
  通常认为 IIFE 是典型的闭包例子，但是严格按照定义来讲其实也不算是闭包，因为 IIFE 函数的调用是在其声明时所在的词法作用域, 并且变量的查找方式也只是普通的作用域链进行查找。  
  但是从效果上来说，它确实创建了闭包，所以IIFE给我的感觉比较矛盾。因为在 IIFE 创建了一个独立的函数作用域，该函数会在调用期间捕获声明时的词法作用域，以供函数执行使用。一般情况下，IIFE 的作用域被销毁后不会保留引用，故可以理解为**短暂的闭包**，忽然想到的一个词。

```js
var a = 2
(function IIFE() {
  console.log(a)
})()
```
为什么 IIFE 本身不是“观察闭包的恰当例子”？  
IIFE 本身通常被用作一个 “一次性执行工具”，其作用域在执行完毕后就会被销毁，里面的变量无法被外部访问，所以没有“长久保存状态”的场景。  
**观察闭包的典型例子是 通过函数返回值或者引用，将内部作用域变量的访问权传递到外部。**
```js
function outer() {
  var hidden = 42 // 被闭包“捕获”的变量
  return function inner() {
    return hidden
  }
}

var closure = outer()
console.log(closure()) // 42
```
这里通过返回 inner 函数，将 outer 的作用域持久化，能更清晰地观察闭包的行为。

相比之下，IIFE 本身在大多数场景下不会保留任何“长久状态”，只是一次性创建和销毁作用域，所以它不适合作为观察闭包行为的最佳例子。  


### 循环和闭包
要说明闭包，for 循环是最常见的例子。  
```js
for (var i=1; i<=5; i++) {
  setTimeout( function timer() {
    console.log( i );
  }, i*1000 );
}
```
  var 的特性：在 JavaScript 中，var 不会在块中形成作用域（var声明通常形成函数作用域或者全局作用域），不会为每次循环创建一个新的作用域。换句话说，**循环中的所有回调函数共享同一个 i。**  
  setTimeout 是一个异步任务，for 循环本身为同步代码，setTimeout 会等到循环结束后调用 setTimeout 的回调函数，i 经过循环后已经变为了 6，此时去访问 i 即为 6。  

  如何通过闭包解决这个问题：思路其实就是让每个回调函数去访问独立的变量，而不是共享同一个相同的变量。我们根据这个思路展开，利用闭包为每个循环创建一个单独的作用域。两个解决方案
1. IIFE 立即执行函数  
原理：利用 IIFE 去创建一个函数作用域，并传入 i 给 j 来保持这个函数作用域的变量或者说是上下文，闭包可以持续对引用这个上下文，这样即使是异步的函数也能正确的访问这个变量。
```js
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

2. 使用 let 替代 var
let 声明在块中会形成块级作用域，每次循环都会创建一个新的作用域，并将当前的 i 绑定到作用域中，因此每个回调函数都持有独立的 i。  
```js
for (let i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(j);
  }, j * 1000);
}
```
3. 通过 bind 传递参数: 通过 bind 方法，将当前的 i 作为参数绑定给 timer 函数。
```js
for (var i = 1; i <= 5; i++) {
  setTimeout(
    function timer(j) {
      console.log(j);
    }.bind(null, i),
    i * 1000
  );
}
```


## 模块
js中的模块也是闭包的典型。  
```js
function CoolModule() {
  var something = "cool"
  var another = [1, 2, 3]
  function doSomething() {
    console.log(something)
  }
  function doAnother() {
    console.log(another.join(" ! "))
  }
  return {
    doSomething: doSomething,
    doAnother: doAnother,
  }
}

var foo = CoolModule();
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```
这个模式在 JavaScript 中被称为模块，foo 被称为模块实例，如果不执行 CoolModule，内部作用域和闭包都无法被创建。  
模块模式需要具备两个必要条件  
- 该函数必须至少被调用一次（每次调用都会创建一个新的模块实例）。
- 函数必须返回至少一个内部函数，这样内部函数才能在私有作用域中形成闭包，并且可以访问或者修改私有的状态。

**改进为单例模式**  
当只需要一个实例时，可以对这个模式进行简单的改进来实现单例模式。
```js
var foo = (function CoolModule() {
var something = "cool";
var another = [1, 2, 3];
function doSomething() {
  console.log( something );
}
function doAnother() {
  console.log( another.join( " ! " ) );
}
return {
  doSomething: doSomething,
  doAnother: doAnother
};
})();
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

#### 小结
闭包就好像从 JavaScript 中分离出来的一个充满神秘色彩的未开化世界，只有最勇敢的人才能够到达那里。但实际上它只是一个标准，显然就是关于如何在函数作为值按需传递的词法环境中书写代码的。当函数可以记住并访问所在的词法作用域，即使函数是在当前词法作用域之外执行，这时就产生了闭包。

## 动态作用域
JavaScript 中的作用域就是词法作用域（事实上大部分语言都是基于词法作用域的）。词法作用域是一套关于引擎如何寻找变量以及会在何处找到变量的规则。词法作用域最重要的特征是它的定义过程发生在代码的书写阶段。  

如果 JavaScript 具有动态作用域，理论上，下面代码中的 foo() 在执行时将会输出 3。因为当 foo() 无法找到 a 的变量引用时，会顺着调用栈在调用 foo() 的地
方查找 a，而不是在嵌套的词法作用域链中向上查找。由于 foo() 是在 bar() 中调用的，引擎会检查 bar() 的作用域，并在其中找到值为 3 的变量 a。
```js
function foo() {
  console.log( a );
}
function bar() {
var a = 3;
  foo();
}
var a = 2;
bar();
```
但是 this 机制某种程度上很像动态作用域。主要区别：词法作用域是在写代码或者说定义时确定的，而动态作用域是在运行时确定的。（this 也是！）词法作用域关注函数在何处声明，而动态作用域关注函数从何处调用,this 关注函数如何调用。  

## this
this 关键字是 JavaScript 中最复杂的机制之一。它是一个很特别的关键字，被自动定义在所有函数的作用域中。  
为什么要用this?  
```js
function identify() {
  return this.name.toUpperCase()
}
function speak() {
  var greeting = "Hello, I'm " + identify.call(this)
  console.log(greeting)
}
var me = {
  name: "Kyle",
}
var you = {
  name: "Reader",
}
identify.call(me) // KYLE
identify.call(you) // READER
speak.call(me) // Hello, 我是 KYLE
speak.call(you) // Hello, 我是 READER
```
这段代码可以在不同的上下文对象（me 和 you）中重复使用函数 identify() 和 speak()，不用针对每个对象编写不同版本的函数。如果不使用 this，那就需要给 identify() 和 speak() 显式传入一个上下文对象。
```js
function identify(context) {
  return context.name.toUpperCase()
}
function speak(context) {
  var greeting = "Hello, I'm " + identify(context)
  console.log(greeting)
}
identify(you) // READER
speak(me) //hello, 我是 KYLE
```
  this 提供了一种更优雅的方式来隐式“传递”一个对象引用，因此可以将 API 设计得更加简洁并且易于复用。  
随着你的使用模式越来越复杂，显式传递上下文对象会让代码变得越来越混乱，使用 this则不会这样。当我们介绍对象和原型时，你就会明白函数可以自动引用合适的上下文对象有多重要。  
  **this 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式。**  
  当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。**this 就是记录的其中一个属性**，会在函数执行的过程中用到。

结论： 学习 this 的第一步是明白 this 既不指向函数自身也不指向函数的词法作用域，你也许被这样的解释误导过，但其实它们都是错误的。this 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。

### 解析 this
先来看下函数的调用位置，在理解 this 的绑定过程之前，首先要理解调用位置：调用位置就是函数在代码中被调用的位置。  
最重要的是要分析调用栈。我们关心的**调用位置**就在当前正在执行的函数的前一个调用中（这句话会在下面示例让你真正了解是什么意思）。  
```js
function baz() {
  // 当前调用栈是：baz
  // 因此，当前调用位置是全局作用域, baz 在全局作用域中被调用。
  console.log("baz")
  bar() // <-- bar 的调用位置
}
function bar() {
  // 当前调用栈是 baz -> bar
  // 因此，当前调用位置在 baz 中
  console.log("bar")
  foo() // <-- foo 的调用位置
}
function foo() {
  // 当前调用栈是 baz -> bar -> foo
  // 因此，当前调用位置在 bar 中
  console.log("foo")
}
baz(); // <-- baz 的调用位置
```
**从调用栈中分析出真正的调用位置的，因为它决定了 this 的绑定。**  


#### 绑定规则
函数的执行过程中调用位置如何决定 this 的绑定对象。你必须找到调用位置，然后判断需要应用下面四条规则中的哪一条。我们首先会分别解释这四条规则，然后解释多条规则都可用时它们的优先级如何排列。  

##### 默认绑定
独立函数调用。可以把这条规则看作是无法应用其他规则时的默认规则。
```js
// 浏览器环境
function foo() {
  console.log(this.a)
}
var a = 2
foo()
```
在本例🀄️，函数调用时应用了 this 的默认绑定，因此 this 指向全局对象。  
我们怎么知道这里应用了默认绑定呢？可以通过分析调用位置来看看 foo() 是如何调用的。  
在代码中，foo() 是直接使用不带任何修饰的函数引用进行调用的，因此只能使用默认绑定，无法应用其他规则。

在代码中，foo() 是直接使用不带任何修饰的函数引用进行调用的，因此只能使用默认绑定，无法应用其他规则。
```js
function foo() {
  "use strict";
  console.log( this.a );
}
var a = 2;
foo(); // TypeError: Cannot read properties of undefined (reading 'a')
```
这里有一个微妙但是非常重要的细节, 严格模式下与 foo() 的调用位置无关：




##### 隐式绑定
当函数引用有上下文对象时，隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象。以后看到 this 指向的题目时可以用动态作用域的思维，去顺着它被调用的位置进行变量的查找。
```js
function foo() {
  console.log(this.a)
}
var obj2 = {
  a: 42,
  foo: foo,
}
var obj1 = {
  a: 2,
  obj2: obj2,
}
obj1.obj2.foo() // 42
```

**隐式丢失问题：**一个最常见的 this 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把 this 绑定到全局对象或者 undefined 上，取决于是否是严格模式。
```js
function foo() {
  console.log(this.a)
}
var obj = {
  a: 2,
  foo: foo,
}
var bar = obj.foo // 函数别名！
var a = "oops, global" // a 是全局对象的属性
bar() // "oops, global"
```
虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。  

一种更微妙、更常见并且更出乎意料的情况发生在传入回调函数时：  
```js
// 浏览器环境
function foo() {
  console.log(this.a)
}
function doFoo(fn) {
  // fn 其实引用的是 foo
  fn() // <-- 调用位置！
}
var obj = {
  a: 2,
  foo: foo,
}
var a = "oops, global" // a 是全局对象的属性
doFoo(obj.foo) // "oops, global"
```
参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样。  
如果把函数传入语言内置的函数而不是传入你自己声明的函数，会发生什么呢？结果是一样的，没有区别：  
```js
function foo() {
  console.log(this.a)
}
var obj = {
  a: 2,
  foo: foo,
}
var a = "oops, global" // a 是全局对象的属性
setTimeout(obj.foo, 100) // "oops, global"
```
JavaScript 环境中内置的 setTimeout() 函数实现和下面的伪代码类似：
```js
function setTimeout(fn, delay) {
  // 等待 delay 毫秒
  fn() // <-- 调用位置！
}
```
回调函数丢失 this 绑定是非常常见的。除此之外，还有一种情况 this 的行为会出乎我们意料：调用回调函数的函数可能会修改 this。  
  无论是哪种情况，this 的改变都是意想不到的，实际上你无法控制回调函数的执行方式，因此就没有办法控制会影响绑定的调用位置。之后我们会介绍如何通过固定 this 来修复。  


##### 显式绑定
通过 bind、call、apply 对this进行强制绑定到指定上下文中。  
```js
function foo() {
  console.log(this.a)
}
var obj = {
  a: 2,
}
foo.call(obj) // 2
```
通过 foo.call(..)，在调用 foo 时强制把它的 this 绑定到 obj 上。  

**注意：**如果你传入了一个原始值（字符串类型、布尔类型或者数字类型）来当作 this 的绑定对象，这个原始值会被转换成它的对象形式（也就是 new String(..)、new Boolean(..) 或者new Number(..)）。这通常被称为“装箱”。

**可惜，显式绑定仍然无法解决我们之前提出的丢失绑定问题。**  

**硬绑定：**  
但是显式绑定的一个变种可以解决这个问题。  
```js
function foo() {
  console.log(this.a)
}
var obj = {
  a: 2,
}
var bar = function () {
  foo.call(obj)
}
bar() // 2
setTimeout(bar, 100) // 2
// 硬绑定的 bar 不可能再修改它的 this
bar.call(window) // 2
```

硬绑定的典型应用场景就是创建一个包裹函数，传入所有的参数并返回接收到的所有值：  
