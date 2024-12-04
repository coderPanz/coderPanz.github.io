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
我们创建了函数 bar()，并在它的内部手动调用了 foo.call(obj)，因此强制把 foo 的 this 绑定到了 obj。无论之后如何调用函数 bar，它总会手动在 obj 上调用 foo。这种绑定是一种显式的强制绑定，因此我们称之为硬绑定。  

由于硬绑定是一种非常常用的模式，所以在 ES5 中提供了内置的方法 Function.prototype.
bind，它的用法如下：  
```js
function foo(something) {
  console.log(this.a, something)
  return this.a + something
}
var obj = {
  a: 2,
}
var bar = foo.bind(obj)
var b = bar(3) // 2 3
console.log(b) // 5
```
bind(..) 会返回一个硬编码的新函数，它会把参数设置为 this 的上下文并调用原始函数。  



##### new绑定
然而，JavaScript 中 new 的机制实际上和面向类的语言完全不同。 **JavaScript 中，构造函数只是一些使用 new 操作符时被调用的函数。**。它们并不会属于某个类，也不会实例化一个类。实际上，它们甚至都不能说是一种特殊的函数类型，它们只是被 new 操作符调用的普通函数而已。  
**包括内置对象函数（比如 Number(..)）在内的所有函数都可以用 new 来调用，这种函数调用被称为构造函数调用。**
**注意：** 实际上并不存在所谓的“构造函数”，只有对于函数的“构造调用”。  

使用 new 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作。
- 1. 创建（或者说构造）一个全新的对象。
- 2. 这个新对象会被执行 [[ 原型 ]] 连接。
- 3. 这个新对象会绑定到函数调用的 this。
- 4. 如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。  

例如：  
```js
function foo(a) {
  this.a = a;
}
var bar = new foo(2);
console.log( bar.a ); // 2
```
使用 new 来调用 foo(..) 时，我们会构造一个新对象并把它绑定到 foo(..) 调用中的 this上。new 是最后一种可以影响函数调用时 this 绑定行为的方法，我们称之为 new 绑定。  


#### this 绑定优先级
默认绑定的优先级是四条规则中最低的，显式绑定优先级更高，也就是说在判断时应当先考虑是否可以应用显式绑定。  
所以现在需要思考🤔的是： new 绑定和隐式绑定的优先级。
```js
function foo(something) {
  this.a = something
}
var obj1 = {
  foo: foo,
}
var obj2 = {}
obj1.foo(2)
console.log(obj1.a) // 2
obj1.foo.call(obj2, 3)
console.log(obj2.a) // 3
var bar = new obj1.foo(4)
console.log(obj1.a) // 2
console.log(bar.a) // 4
```
可以看到 new 绑定比隐式绑定优先级高。但是 new 绑定和显式绑定谁的优先级更高呢？  

```js
function foo(something) {
  this.a = something
}
var obj1 = {}
var bar = foo.bind(obj1)
bar(2) // bar 调用，实际上是调用 foo，此时 foo 永久指向 obj1
console.log(obj1.a) // 2
var baz = new bar(3) // 通过对永久this指向的 bar 进行 new 调用，this 指向创建的实例。
console.log(obj1.a) // 2
console.log(baz.a) // 3
```
再来看看我们之前介绍的“裸”辅助函数 bind：  
```js
function bind(fn, obj) {
  // 这儿 return 的函数就是 baz
  return function () {
    fn.apply(obj, arguments)
  }
}
```
非常令人惊讶，因为看起来在辅助函数中 new 操作符的调用无法修改 this 绑定，但是在刚才的代码中 new 确实修改了 this 绑定。  

#### 如何判断
- 1. 函数是否在 new 中调用（new 绑定）？如果是的话 this 绑定的是新创建的对象。var bar = new foo()
- 2. 函数是否通过 call、apply（显式绑定）或者硬绑定调用？如果是的话，this 绑定的是指定的对象。var bar = foo.call(obj2)
- 3. 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话，this 绑定的是那个上下文对象。var bar = obj1.foo()
- 4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到全局对象。var bar = foo()

不过……凡事总有例外。  

#### 绑定例外
在某些场景下 this 的绑定行为会出乎意料。
**被忽略的this**  
如果你把 null 或者 undefined 作为 this 的绑定对象传入 call、apply 或者 bind，这些值在调用时会被忽略，实际应用的是默认绑定规则：
```js
function foo() {
  console.log(this.a)
}
var a = 2
foo.call(null) // 2
```


**更安全的this绑定**  
一种“更安全”的做法是传入一个特殊的对象，把 this 绑定到这个对象不会对你的程序产生任何副作用。  
如果我们在忽略 this 绑定时总是传入一个 DMZ 对象，那就什么都不用担心了，因为任何对于 this 的使用都会被限制在这个空对象中，不会对全局对象产生任何影响。**在 JavaScript 中创建一个空对象最简单的方法都是 Object.create(null)**
```js
function safeFunction() {
  console.log(this.foo); // 访问 this.foo
}

const safeObject = Object.create(null);
safeObject.foo = "Safe binding";

safeFunction.call(safeObject); // 输出 "Safe binding"

// 即使没有 foo 属性，调用也不会影响全局对象
safeFunction.call(Object.create(null)); // 输出 undefined
```


```js
function test() {
  console.log(this) // 输出 this 的引用
}

// 默认情况下，传入 null 时 this 会指向全局对象
test.call(null) // 在浏览器中输出 window 对象，在 Node.js 中输出 global
```
如果程序不小心误用 this 来修改全局对象，会导致难以预料的副作用。


##### 间接引用
间接引用最容易在赋值时发生：  
```js
function foo() {
  console.log(this.a)
}
var a = 2
var o = { a: 3, foo: foo }
var p = { a: 4 }
o.foo(); // 3
// 赋值表达式加立即调用
(p.foo = o.foo)(); // 2
```
当使用赋值表达式（如 p.foo = o.foo）时，只是将函数的引用赋值给 p.foo，而并未保留 o 的隐式绑定关系。结果：this 将不再指向 o，而是根据调用方式重新决定。(p.foo = o.foo)() 是一个独立调用，因此 this 指向全局对象。


#### this 词法
我们之前介绍的四条规则已经可以包含所有正常的函数。但是 ES6 中介绍了一种无法使用这些规则的特殊函数类型：箭头函数。  

箭头函数并不是使用 function 关键字定义的，而是使用被称为“胖箭头”的操作符 => 定义的。箭头函数不使用 this 的四种标准规则，而是根据外层（函数或者全局）作用域来决定 this。  
```js
function foo() {
  // 返回一个箭头函数
  return a => {
    //this 继承自 foo()
    console.log(this.a)
  }
}
var obj1 = {
  a: 2,
}
var obj2 = {
  a: 3,
}
var bar = foo.call(obj1)
bar.call(obj2) // 2，箭头函数的绑定无法被修改。
```
foo() 的 this 绑定到 obj1，bar 是 foo return 的箭头函数，箭头函数没有自己的 this ，故而 bar 中的 this 实际上是 foo 的 this，箭头函数的绑定无法被修改，new 也不行（它的this是基于上层作用域的， 除非上层作用域this被修改）！所以箭头函数不能被 new 调用。  

箭头函数最常用于回调函数中，例如事件处理器或者定时器：  
```js
function foo() {
  setTimeout(() => {
    // 继承自 foo() 的this
    console.log(this.a)
  }, 100)
}
var obj = {
  a: 2,
}
foo.call(obj) // 2
```
es6之前模拟箭头函数的方案
```js
function foo() {
  var self = this // lexical capture of this
  setTimeout(function () {
    console.log(self.a)
  }, 100)
}
var obj = {
  a: 2,
}
foo.call(obj) // 2
```

## 对象
对象可以通过两种形式定义：字面量和构造函数声明。构造形式和文字形式生成的对象是一样的。唯一的区别是，在文字声明中你可以添加多个键 / 值对，但是在构造形式中你必须逐个添加属性。  

函数就是对象的一个子类型（从技术角度来说就是“可调用的对象”）。JavaScript 中的函数是“一等公民”，因为它们本质上和普通的对象一样（只是可以调用），所以可以像操作其他对象一样操作函数（比如当作另一个函数的参数）。  

数组也是对象的一种类型，具备一些额外的行为。数组中内容的组织方式比一般的对象要稍微复杂一些。  

**JavaScript 中的函数是“一等公民”**  
这意味着函数在语言中被视为与其他数据类型（如字符串、数字、对象等）同等重要的实体，可以像普通变量一样自由使用。  
1. 函数可以作为值赋给变量  
2. 函数可以作为参数传递  
3. 函数可以作为返回值  
4. 函数可以存储在数据结构中  
5. 支持匿名函数  

这些特性使得 JavaScript 函数非常灵活，能够支持函数式编程范式，增强代码的复用性和可扩展性。


### 内置对象
JavaScript 中还有一些对象子类型，通常被称为内置对象。  
• String
• Number
• Boolean
• Object
• Function
• Array
• Date
• RegExp
• Error

这些内置对象从表现形式来说很像其他语言中的类型（type）或者类（class），比如 Java中的 String 类。  
但是在 JavaScript 中，它们实际上只是一些内置函数。这些内置函数可以当作构造函数（由 new 产生的函数调用）来使用，从而可以构造一个对应子类型的新对象。  
```js
var strPrimitive = "I am a string"
console.log(typeof strPrimitive) // "string"
console.log(strPrimitive instanceof String) // false

var strObject = new String("I am a string")
console.log(typeof strObject) // "object"
console.log(strObject instanceof String) // true

// 检查 sub-type 对象
console.log(Object.prototype.toString.call(strObject)) // [object String]
```

原始值 "I am a string" 并不是一个对象，它只是一个字面量，并且是一个不可变的值。**如果要在这个字面量上执行一些操作，比如获取长度、访问其中某个字符等，那需要将其转换为 String 对象。**  当需要时 js 引擎会自动将字面量转化为对应的对象。  

null 和 undefined 不能通过构造的方式去声明，只能通过字面量的方式去声明。  

Error 对象很少在代码中显式创建，一般是在抛出异常时被自动创建。也可以使用 newError(..) 这种构造形式来创建，不过一般来说用不着。

##### 属性
属性其实就是对象的内容，在写法层面我们将一个对象的所有属性全部写在一起，用一个块进行包裹，在引擎内部，这些值的存储方式是多种多样的，一般并不会存在对象容器内部，存储在对象容器内部的是这些属性的引用，并指向他们真正存储的位置。  

**注意：**在对象中，属性名永远都是字符串。如果你使用 string（字面量）以外的其他值作为属性名，那它首先会被转换为一个字符串。即使是数组也不例外。  


##### 可计算属性名
ES6 增加了可计算属性名，可以在文字形式中使用 [] 包裹一个表达式来当作属性名：
```js
var prefix = "foo"
var myObject = {
  [prefix + "bar"]: "hello",
  [prefix + "baz"]: "world",
}
console.log(myObject["foobar"]) // hello
console.log(myObject["foobaz"]) // world
```

可计算属性名最常用的场景可能是 ES6 的符号（Symbol）,它们是一种新的基础数据类型，包含一个不透明且无法预测的值(从技术就是一个字符串)


##### 属性与方法
对象属性是一个函数，我们习惯称之为方法。  
ES6 增加了 super 引用，一般来说会被用在 class 中，super的行为似乎更有理由把 super 绑定的函数称为“方法”。


##### 数组
数组也是对象，数组下标就是对象的键，数组元素就是对象键对应的值。  
深入解析：数组下标的本质  
数组的索引是对象的字符串键，你访问 array[0] 时，0 会被隐式转换为字符串 '0'，然后用作对象的键。
```js
const arr = ['a', 'b', 'c'];
console.log(arr[0]);         // 'a'
console.log(arr['0']);       // 'a'
console.log(typeof '0');     // 'string'
console.log(typeof 0);       // 'number'
```


**数组非整数的键**  
数组也可以拥有非整数的键，但这些键不会被计入 length，它们会被视为对象的普通属性。
```js
const arr = []
arr[3] = "a" // 索引为 1 的元素
arr["foo"] = "bar" // 添加了一个普通属性
console.log(arr) // [ <1 empty item>, 'a', foo: 'bar' ]
console.log(arr.length) // 输出 2（只统计整数索引的最大值 + 1）
```

**数组和普通对象的主要区别**  
- 索引是整数值的字符串键：数组的索引通常是 0 到 length-1 的正整数（底层还是转化为字符串）。
- length 属性：数组自动维护一个 length 属性，表示数组的元素个数。**只要数组的索引是非负整数并且有更新时，length 属性会自动更新。**
- 原型链支持数组方法：数组继承了很多数组特定的方法（如 push、pop、map 等）。

##### 复制对象
js中的拷贝分为浅拷贝和深拷贝，浅拷贝多个对象共享相同属性，深拷贝相当于创建一个新的对象，和原对象间互不影响。

举个深拷贝的例子：
```js
var newObj = JSON.parse( JSON.stringify( someObj ) )
```
实现原理：  
1. JSON.stringify：将对象转换为 JSON 字符串。  
在这个过程中，所有可枚举的属性（包括嵌套对象）都会被转换为 JSON 格式，成为一个独立的字符串。
```js
const obj = { a: 1, b: { c: 2 } };
const jsonStr = JSON.stringify(obj);
console.log(jsonStr); // 输出 '{"a":1,"b":{"c":2}}'
```

2. JSON.parse：将 JSON 字符串解析为新对象，解析过程中会创建新的对象和子对象，形成一个完全独立的深拷贝。
```js
const newObj = JSON.parse('{"a":1,"b":{"c":2}}');
console.log(newObj); // 输出 { a: 1, b: { c: 2 } }
```

优点：  
实现深拷贝：能够递归复制对象，包括嵌套的子对象。
简单易用：仅需一行代码，适用于大部分普通对象的场景。
去掉非 JSON 表示的属性：可以自动过滤掉 undefined、函数、Symbol 等无法表示的属性。

缺点：  
无法拷贝特殊对象类型
- 无法处理 Date 对象，会被序列化为字符串：  
```js
const obj = { date: new Date() };
const copy = JSON.parse(JSON.stringify(obj));
console.log(copy.date); // 输出字符串，例如 "2024-01-01T00:00:00.000Z"
```
- 无法处理 RegExp 对象，会丢失为普通对象。
- 无法处理 Map 和 Set，会丢失结构。
```js
const obj = { map: new Map([[1, 'one']]) };
const copy = JSON.parse(JSON.stringify(obj));
console.log(copy.map); // 输出 undefined
```
- 如果对象中存在循环引用，会导致 JSON.stringify 抛出错误
```js
const obj = {};
obj.self = obj; // 循环引用
JSON.stringify(obj); // 抛出 TypeError: Converting circular structure to JSON
```


##### 属性描述符
在 ES5 之前，JavaScript 语言本身并没有提供可以直接检测**属性特性**的方法，比如判断属性是否是只读。但是从 ES5 开始，所有的属性都具备了属性描述符。  
```js
var myObject = {
  a: 2,
}
console.log(Object.getOwnPropertyDescriptor(myObject, "a"))
// {
// value: 2,
// writable: true,
// enumerable: true,
// configurable: true
// }
```
这个普通的对象属性对应的属性描述符（也被称为“数据描述符”，因为它只保存一个数据值）可不仅仅只是一个 2。它还包含另外三个特性：writable（可写）、enumerable（可枚举）和 configurable（可配置）。

##### 不变性
很重要的一点是，**所有的方法创建的都是浅不变形，也就是说，它们只会影响目标对象和它的直接属性。**如果目标对象引用了其他对象（数组、对象、函数，等），其他对象的内容不受影响，仍然是可变的。  

- 常量属性：结合 writable:false 和 configurable:false 就可以创建一个真正的常量属性（不可修改、
重定义或者删除）。
```js
var myObject = {};
Object.defineProperty( myObject, "FAVORITE_NUMBER", {
  value: 42,
  writable: false,
  configurable: false
} );
```
- 禁止扩展: 禁 止 一 个 对 象 添 加 新 属 性 并 且 保 留 已 有 属 性， 可 以 使 用 Object.prevent.Extensions(..)
```js
var myObject = {
  a: 2,
}
Object.preventExtensions(myObject)
myObject.b = 3
console.log(myObject.b) // undefined
```

- 密封：Object.seal(..) 会创建一个“密封”的对象，这个方法实际上会在一个现有对象上调用 Object.preventExtensions(..) 并把所有现有属性标记为 configurable:false。 所以，密封之后不仅不能添加新属性，也不能重新配置或者删除任何现有属性（虽然可以修改属性的值）。

- 冻结：Object.freeze(..) 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用Object.seal(..) 并把所有“数据访问”属性标记为 writable:false，这样就无法修改它们的值。  

**这个方法是你可以应用在对象上的级别最高的不可变性，它会禁止对于对象本身及其任意直接属性的修改（不过就像我们之前说过的，这个对象引用的其他对象是不受影响的）**  


##### [[Get]] 和 [[Put]]
在 JavaScript 中，[[Get]] 和 [[Put]] 是对象的内部方法（internal methods），它们是 ECMAScript 规范中定义的抽象操作，用于描述对象如何获取和设置属性的行为,然这些内部方法是规范层面的概念，开发者无法直接访问它们，但它们是 . 操作符、[] 操作符以及一些内置方法背后的机制。  

[[Get]] 是对象用于获取属性值的内部操作，它描述了当尝试访问对象的属性时发生的事情（比如 obj.prop 或 obj['prop']）。
```js
var myObject = {
  a: 2
};
myObject.a; // 2
```
**myObject.a 能实现属性的访问，实际上是通过对象中实现的 [[Get]] 操作完成的**。对象默认的内置 [[Get]] 操作首先在对象中查找是否有名称相同的属性，如果找到就会返回这个属性的值。如果没有找到名称相同的属性，按照 [[Get]] 算法的定义会执行另外一种非常重要的行为，在后面会讲到（其实就是原型链查找），如果在原型链上还是没有找到 那 [[Get]] 操作会返回值 undefined。  

[[Get]] 是对象用于获取属性值的内部操作，它描述了当尝试访问对象的属性时发生的事情（比如 obj.prop 或 obj['prop']）。

工作流程
- 如果该属性存在并且是一个数据属性（data property），返回其值。
- 如果该属性存在并且是一个访问器属性（accessor property），调用该属性的 get 方法（如果有）。
- 如果该属性不存在：
  - 查找原型链上的属性。
  - 如果整个原型链中都找不到，返回 undefined。
```js
const obj = {
  a: 10,
  get b() {
    return this.a * 2;
  }
};

console.log(obj.a); // 10，直接返回值
console.log(obj.b); // 20，调用访问器属性的 getter
console.log(obj.c); // undefined，属性不存在
```

[[Put]] 是对象用于设置属性值的内部操作，它描述了当尝试给对象的属性赋值时发生的事情（比如 obj.prop = value 或 obj['prop'] = value）。  

工作流程
- 如果该属性存在并且是一个数据属性（data property），则更新其值（如果属性是可写的）。
- 如果该属性存在并且是一个访问器属性（accessor property），调用其 set 方法（如果有）。
- 如果该属性不存在：
  - 如果对象是可扩展的（extensible），创建一个新属性并赋值。
  - 如果对象不可扩展，则忽略赋值操作或抛出错误（在严格模式下）。

```js
const obj = {
  a: 10,
  set b(value) {
    this.a = value / 2;
  }
};

obj.a = 20; // 修改已有的属性
console.log(obj.a); // 20

obj.b = 40; // 调用访问器属性的 setter
console.log(obj.a); // 20，因为 b 的 setter 修改了 a

obj.c = 30; // 创建一个新属性
console.log(obj.c); // 30
```

总结：
- [[Get]] 和 [[Put]] 是规范中的抽象操作，用于定义对象如何读取和写入属性。
- 它们受制于属性描述符（Property Descriptor）系统，尤其是可写性（writable）、访问器（getter/setter）以及原型链等机制的影响。
- 开发者实际编写代码时，通过标准操作符（如 . 和 []）间接使用了这些内部方法。

##### Getter和Setter
对象默认的 [[Put]] 和 [[Get]] 操作分别可以控制属性值的设置和获取。  
在 ES5 中可以使用 getter 和 setter 部分改写默认操作，**但是只能应用在单个属性上，无法应用在整个对象上。** getter 是一个隐藏函数，会在获取属性值时调用。setter 也是一个隐藏函数，会在设置属性值时调用。  
**定义与作用**
Getter（取值器）
- 在读取属性值时执行逻辑。
- 通过关键字 get 定义。
- 无需调用，直接通过属性访问即可触发。

**Setter（赋值器）**
- 在设置属性值时执行逻辑。
- 通过关键字 set 定义。
- 接收一个参数，该参数表示要赋的值。  


当你给一个属性定义 getter、setter 或者两者都有时，这个属性会被定义为“访问描述符”（和“数据描述符”相对）。对于访问描述符来说，JavaScript 会忽略它们的 value 和 writable 特性，取而代之的是关心 set 和 get（还有 configurable 和 enumerable）特性。  

```js
var myObject = {
  // 给 a 定义一个 getter
  get a() {
    return 2
  },
}
Object.defineProperty(
  myObject, // 目标对象
  "b", // 属性名{
  // 描述符
  // 给 b 设置一个 getter
  {
    get: function () {
      return this.a * 2
    },
    // 确保 b 会出现在对象的属性列表中
    enumerable: true,
  }
)
myObject.a // 2
myObject.b // 4
```

**不管是对象文字语法中的 get a() { .. }，还是 defineProperty(..) 中的显式定义，二者都会在对象中创建一个不包含值的属性，对于这个属性的访问会自动调用一个隐藏函数，它的返回值会被当作属性访问的返回值**  所以定对象的属性可以用键值对或者getter的方式。  

```js
var myObject = {
  // 给 a 定义一个 getter
  get a() {
    return 2
  },
}
myObject.a = 3
console.log(myObject.a) // 2
```
上述代码定义了 a 的 getter，没有定义 setter ，所以对 a 的值进行设置时 set 操作会忽略赋值操作。**而且即便有合法的 setter，由于我们自定义的 getter 只会返回 2，所以 set 操作是没有意义的。**  

为了让属性更合理，还应当定义 setter，和你期望的一样，**setter 会覆盖单个属性默认的[[Put]]（也被称为赋值）操作**。通常来说 getter 和 setter 是成对出现的（只定义一个的话通常会产生意料之外的行为）  
**改进**  
```js
const myObject = {
  // 内部存储的属性
  _a: 2,

  // 定义 getter
  get a() {
    return this._a // 从内部存储中获取值
  },

  // 定义 setter
  set a(value) {
    this._a = value // 更新内部存储的值
  },
}

myObject.a = 3 // 使用 setter 设置值
console.log(myObject.a) // 3，使用 getter 获取值
```

##### 存在性
前面我们介绍过，如 myObject.a 的属性访问返回值可能是 undefined，但是这个值有可能是属性中存储的 undefined，也可能是因为属性不存在所以返回 undefined。那么如何区分这两种情况呢？  

我们可以在不访问属性值的情况下判断对象中是否存在这个属性：  
```js
var myObject = {
  a: 2,
}
"a" in myObject // true
"b" in myObject // false
console.log(myObject.hasOwnProperty("a")) // true
console.log(myObject.hasOwnProperty("b")) // false
```
**in 操作符会检查属性是否在对象及其 [[Prototype]] 原型链中。相比之下，hasOwnProperty(..) 只会检查属性是否在 myObject 对象中，不会检查[[Prototype]] 链。**

怎么判断对象中是否存在某属性。  
1. in 操作符检查属性是否存在于对象及其原型链中。  
```js
const obj = { a: 1 };
console.log('a' in obj); // true
console.log('b' in obj); // false

// 原型链上的属性
console.log('toString' in obj); // true
```
优点：
- 能检查对象自身的属性，也能检查继承的属性。
- 适合需要判断包括原型链属性在内的场景。
缺点：
- 如果只需要判断对象自身属性（不包括原型链），需搭配其他方法。

2. 使用 hasOwnProperty 方法
hasOwnProperty 只检查对象自身的属性，不检查原型链上的属性。
```js
const obj = { a: 1 };
console.log(obj.hasOwnProperty('a')); // true
console.log(obj.hasOwnProperty('b')); // false

// 原型链上的属性
console.log(obj.hasOwnProperty('toString')); // false
```
优点：
- 精确检查对象自身的属性。
- 避免误判原型链上的属性。
缺点：
- 是对象的方法，不能直接用于可能是 null 或非对象的变量。
- 如果对象被覆盖了自定义的 hasOwnProperty 方法，需要使用 Object.prototype.hasOwnProperty.call。


3. 使用 Object.prototype.hasOwnProperty.call  
相当于在原型链顶层调用 hasOwnProperty 避免自定义属性覆盖，是 hasOwnProperty 安全调用方法。
```js
const obj = { a: 1, hasOwnProperty: 'custom' };
console.log(Object.prototype.hasOwnProperty.call(obj, 'a')); // true
console.log(Object.prototype.hasOwnProperty.call(obj, 'b')); // false
console.log(Object.prototype.hasOwnProperty.call(obj, 'hasOwnProperty')); // true
```

4. 使用 Object.keys 或 Object.getOwnPropertyNames  
```js
const obj = { a: 1, b: undefined };
console.log(Object.keys(obj).includes('a')); // true
console.log(Object.keys(obj).includes('b')); // true
console.log(Object.keys(obj).includes('c')); // false
```

优点：精确判断对象自身的属性。
缺点：
- 需要遍历对象，性能相对较低。
- 不检查原型链上的属性。


##### 迭代
ES5 中增加了一些数组的辅助迭代器，包括 forEach(..)、every(..) 和 some(..)。
1. forEach: forEach() 是一个用于数组遍历的常用方法，它对数组的每个元素执行一个提供的回调函数。  
- 返回值：forEach() 没有返回值，返回 undefined。
- 遍历：遍历数组中的每个元素。
- 可中止性：无法通过 break 或 return 中途退出迭代。
- 适用场景：适合用于执行副作用操作（例如打印、修改外部变量等），不适合用于需要获取布尔结果的场景。

2. every: every() 用于测试数组中的所有元素是否都满足指定的条件。如果数组中的所有元素都通过测试，则返回 true，否则返回 false。  
- 返回值：返回一个布尔值，表示是否所有元素都满足条件。
- 遍历：遍历数组元素，直到发现第一个不符合条件的元素时停止。
- 可中止性：every() 在遇到第一个返回 false 的元素时停止遍历，剩余元素不再遍历。
- 适用场景：用于判断是否所有元素满足某个条件，例如检查数组中的所有数字是否都大于零。

3. some: some() 用于测试数组中是否至少有一个元素满足指定的条件。如果数组中有一个元素通过了测试，some() 返回 true，否则返回 false。  
- 返回值：返回一个布尔值，表示是否有任意一个元素满足条件。
- 遍历：遍历数组元素，直到发现第一个符合条件的元素时停止。
- 可中止性：some() 在遇到第一个返回 true 的元素时停止遍历，剩余元素不再遍历。
- 适用场景：用于检查是否有元素满足某个条件，例如判断数组中是否有负数。


**使用 for..in 遍历对象是无法直接获取属性值的，因为它实际上遍历的是对象中的所有可枚举属性，你需要手动获取属性值。**  
**直接遍历值而不是数组下标（或者对象属性）呢？幸好，ES6 增加了一种用来遍历数组的 for..of 循环语法。**  
**for..of 循环首先会向被访问对象请求一个迭代器对象，然后通过调用迭代器对象的next() 方法来遍历所有返回值。数组有内置的 @@iterator，因此 for..of 可以直接应用在数组上。**  
调用迭代器的 next() 方法会返回形式为 { value: .. , done: .. } 的值，value 是当前的遍历值，done 是一个布尔值，表示是否还有值可以遍历。  

普通的对象没有内置的 @@iterator，所以无法自动完成 for..of 遍历。所以 for..of 一般用于遍历数组，for..in 一般用于遍历对象。
```js
for (const key in object) {
  if (Object.prototype.hasOwnProperty.call(object, key)) {
    const element = object[key];
    
  }
}

for (const element of object) {
  
}
```

**迭代器**  
在 JavaScript 中，迭代器（Iterator） 是一种允许我们遍历数据集合（如数组、对象、字符串等）的对象。迭代器遵循一种统一的协议，通过 next() 方法返回序列中的每一项，直到序列的末尾。  

**1. 迭代器（Iterator）协议**  
迭代器是一种对象，它实现了一个特定的协议。这个协议要求对象必须具有一个 next() 方法，该方法返回一个对象，这个对象必须包含两个属性：
value：表示当前项的值。
done：表示是否已经迭代到集合的末尾。如果迭代器已经遍历完所有元素，done 的值是 true，否则是 false。
```js
const iterator = {
  next: function() {
    return {
      value: '当前值',
      done: false // 或 true，表示是否已完成迭代
    };
  }
};
```

**2. 对象的迭代：如何迭代对象的属性**  
**JavaScript 中的对象并没有内建的迭代器，但是通过一些内建的方法，我们可以实现对对象属性的迭代。**  
对象本身并不是可迭代的（不像数组那样直接支持 for...of 循环），但是可以通过对象的一些方法（如 Object.keys(), Object.values(), Object.entries()）来实现属性的迭代。  

常见的迭代方法：
- Object.keys()：返回一个包含对象所有属性名（键）的数组。
- Object.values()：返回一个包含对象所有属性值的数组。
- Object.entries()：返回一个包含对象所有键值对的数组，每个元素是一个二元数组，格式为 [key, value]。
**这些方法本质上会将对象的属性转换成一个数组，然后我们可以使用数组的迭代器来遍历这些属性。**

**3. 对象的属性迭代**
for...in 循环是 JavaScript 中专门用于遍历对象属性的方法，它会遍历对象的所有可枚举属性，包括原型链上的属性（如果不想遍历原型链的属性，可以使用 hasOwnProperty()）。


**4. 自定义对象的迭代**  
如果你希望你的对象可以像数组一样使用 for...of 进行迭代，可以通过定义迭代器（Symbol.iterator）来实现。Symbol.iterator 是一个特殊的方法，定义了如何遍历对象。
```js
const myObject = {
  a: 1,
  b: 2,
  c: 3,

  // 定义 Symbol.iterator 方法
  [Symbol.iterator]: function() {
    const keys = Object.keys(this);
    let index = 0;
    const self = this;

    return {
      next: function() {
        if (index < keys.length) {
          const key = keys[index++];
          return { value: [key, self[key]], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (let [key, value] of myObject) {
  console.log(key, value);
}
// Output:
// a 1
// b 2
// c 3
```

## 混合对象“类”
在相当长的一段时间里，JavaScript 只有一些近似类的语法元素（比如 new 和 instanceof），不过在后来的 ES6 中新增了一些元素，比如 class 关键字。
这是不是意味着 JavaScript 中实际上有类呢？简单来说：不是。  

什么是类？  
一个类就是一张蓝图。为了获得真正可以交互的对象，我们必须按照类来建造（也可以说实例化）一个东西，这个东西通常被称为实例，有需要的话，我们可以直接在实例上调用方法并访问其所有公有数据属性。这个对象就是类中描述的所有特性的一份副本。  


### 面向对象编程（OOP）
面向对象编程是一种编程范式，它使用“对象”来表示数据和操作这些数据的行为。OOP 的核心概念围绕着封装、继承、多态和抽象展开，这些概念使得程序设计更加模块化、可扩展和易维护。  

OOP 的四大核心概念  
**1. 封装**
封装是面向对象编程的基础，它指的是将数据（属性）和操作数据的方法（行为）封装成一个单一的单元，即对象。
- 数据隐藏：对象内部的实现细节对外界隐藏，确保数据的一致性和完整性，避免外部程序直接修改对象的内部状态。  
- 接口：提供给外界使用的公共方法，用来访问和修改对象的内部数据。
```js
class BankAccount {
  constructor(balance) {
    let _balance = balance;  // 私有属性

    // 公共方法，提供访问和修改余额的接口
    this.getBalance = function() {
      return _balance;
    };

    this.deposit = function(amount) {
      if (amount > 0) {
        _balance += amount;
      }
    };

    this.withdraw = function(amount) {
      if (amount > 0 && _balance >= amount) {
        _balance -= amount;
      }
    };
  }
}

const account = new BankAccount(1000);
console.log(account.getBalance()); // 1000
account.deposit(500);
console.log(account.getBalance()); // 1500
account.withdraw(200);
console.log(account.getBalance()); // 1300
// 直接访问 _balance 会导致错误，因为 _balance 是私有的
// console.log(account._balance); // undefined
```
在上面的例子中，_balance 是私有的，外部不能直接访问，所有对余额的操作都必须通过提供的 deposit 和 withdraw 方法。  

**2. 继承（Inheritance）**  
继承是指子类可以继承父类的属性和方法，从而实现代码的重用, 继承关系使得子类不仅能访问父类的方法和属性，还能覆盖（重写）父类的方法，以实现定制化的行为。
- 单继承：大多数语言（如 JavaScript、Java）只支持单继承，即一个类只能继承一个父类。
- 多继承：一些语言（如 Python）支持多继承，允许一个类继承多个父类。

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal { // Dog 继承 Animal
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Buddy');
dog.speak();  // 输出：Buddy barks
```
在上面的代码中，Dog 继承了 Animal 类，Dog 类重写了 speak 方法。


**3. 多态（Polymorphism）**
多态指的是同一操作在不同对象上的表现不同。通过继承和方法重写（或重载），子类可以有自己的实现，从而实现多态。多态使得相同的方法能够作用于不同的对象，不同对象根据其自身的类型表现出不同的行为。  
- 方法重写（Override）：子类可以重写父类的方法，以便为该方法提供不同的实现。
- 接口多态：不同的类实现相同的接口，但每个类的实现方式可以不同。

```js
class Animal {
  speak() {
    console.log("Animal makes a sound");
  }
}

class Dog extends Animal {
  speak() {
    console.log("Dog barks");
  }
}

class Cat extends Animal {
  speak() {
    console.log("Cat meows");
  }
}

const animals = [new Dog(), new Cat(), new Animal()];
animals.forEach(animal => animal.speak());
// 输出：
// Dog barks
// Cat meows
// Animal makes a sound
```
在这个例子中，Dog 和 Cat 类都继承了 Animal 类，并重写了 speak 方法。尽管 animals 数组中存储的是不同类型的对象，但它们都通过调用 speak() 方法展示了各自的行为，这就是多态的体现。  


**4. 抽象（Abstraction）**
抽象是指从复杂的现实世界中提取出关键的特征，将不重要的细节忽略。它通过将对象的具体实现和外部的使用区分开，帮助开发者关注问题的高层次解决方案。抽象可以通过抽象类、接口等实现，旨在简化复杂的系统设计。
```js
class Shape {
  // 抽象方法（没有实现）
  area() {
    throw new Error("Method 'area()' must be implemented.");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  // 实现抽象方法
  area() {
    return Math.PI * this.radius * this.radius;
  }
}

const circle = new Circle(5);
console.log(circle.area());  // 输出：78.53981633974483
```
在这个例子中，Shape 类是一个抽象类，它定义了一个抽象方法 area()，但没有提供具体的实现，子类 Circle 必须实现 area() 方法。

面向对象编程（OOP）的四大核心概念：

封装：将数据和操作数据的行为封装在一起，并隐藏实现细节，暴露必要的接口。
继承：通过继承使得子类能够重用父类的属性和方法，并根据需要进行扩展或修改。
多态：允许不同对象响应相同方法调用，根据对象的实际类型做出不同的行为。
抽象：通过抽象类或接口定义对象的基本行为规范，而不关心具体的实现细节，简化系统设计。


### 混入
在继承或者实例化时，JavaScript 的对象机制并不会自动执行复制行为。简单来说，JavaScript 中只有对象，并不存在可以被实例化的“类”。一个对象并不会被复制到其他对象，它们会被关联起来由于在其他语言中类表现出来的都是复制行为，因此 JavaScript 开发者也想出了一个方法来模拟类的复制行为，这个方法就是入。  

混入（Mixin） 是一种通过将功能性代码块从一个对象或类“混入”到另一个对象或类中的技术。这种方法并不涉及继承，而是通过将一组功能性的方法或属性直接添加到一个类或对象中来增强它的能力，混入并不是 JavaScript 语言本身的一部分，而是一种模式。  

基本概念：核心思想是将一些独立的功能模块（可以是对象或类）合并到其他对象或类中，从而避免使用继承机制过多地依赖父类。

优点：
 -代码复用：可以把常用的功能提取到混入对象中，避免代码重复。
- 灵活性：相比于单一的继承结构，混入可以让对象获得多个功能，避免了单继承的限制。
- 增强对象功能：可以在不修改原有类或对象的情况下，增强其功能。
缺点：
- 命名冲突：不同混入对象可能会有相同名称的属性或方法，导致冲突。
- 可读性：混入会使得对象的来源和责任变得不那么清晰，可能会影响代码的可维护性。

#### 实现方式
1. 使用 Object.assign() 实现混入  
Object.assign() 方法可以将源对象的属性复制到目标对象中，这样就实现了将一个对象的属性和方法“混入”到另一个对象中。
```js
const CanEat = {
  eat() {
    console.log("Eating...");
  }
};

const CanSleep = {
  sleep() {
    console.log("Sleeping...");
  }
};

class Person {
  constructor(name) {
    this.name = name;
  }
}

// 将 CanEat 和 CanSleep 的方法混入 Person 类
Object.assign(Person.prototype, CanEat, CanSleep);

const person = new Person("John");
person.eat();  // "Eating..."
person.sleep();  // "Sleeping..."
```
Person 类没有直接继承 CanEat 或 CanSleep，而是通过 Object.assign() 方法将它们的功能混入到 Person 类的原型中，使得 Person 实例能够调用这些方法。


2. 混入类（使用 ES6 类）  
除了使用 Object.assign()，你也可以通过在类中直接混入多个类或对象的功能。
```js
class CanFly {
  fly() {
    console.log("Flying...");
  }
}

class CanDive {
  dive() {
    console.log("Diving...");
  }
}

class Bird {
  constructor(name) {
    this.name = name;
  }
}

// 使用 mixin 函数将功能混入类
Object.assign(Bird.prototype, CanFly.prototype, CanDive.prototype);

const bird = new Bird("Eagle");
bird.fly();  // "Flying..."
bird.dive();  // "Diving..."
```

3. 混入函数  
你也可以通过定义一个混入函数来将功能动态地添加到目标对象或类中。  
```js
function CanSpeak(target) {
  target.prototype.speak = function() {
    console.log("Speaking...");
  };
}

function CanWalk(target) {
  target.prototype.walk = function() {
    console.log("Walking...");
  };
}

class Human {}

CanSpeak(Human); // 混入 CanSpeak 的功能
CanWalk(Human);  // 混入 CanWalk 的功能

const human = new Human();
human.speak();  // "Speaking..."
human.walk();   // "Walking..."
```

总结： 
- 混入（Mixin） 是一种将多个独立的功能组合到一个对象或类中的方式，通常用于代码复用。
- 混入并不涉及继承，它通过将方法和属性直接添加到对象的原型或类的原型中来增强对象的功能。
- 使用混入时要注意命名冲突的问题，可以通过重命名方法或使用命名空间来避免。
- 混入可以通过 Object.assign()、类混入、混入函数等方式实现。
- 混入的灵活性和复用性使得它在现代 JavaScript 开发中非常常见，尤其是在实现模块化和组合模式时。

可以把一个对象的属性复制到另一个对象中，但是这其实并不能带来太多的好处，无非就是少几条定义语句，而且还会带来函数对象引用问题（相当于浅层拷贝， 属性还是共享引用）。


## 原型
JavaScript 中的对象有一个特殊的 [[Prototype]] 内置属性，其实就是对于其他对象的引用。几乎所有的对象在创建时 [[Prototype]] 属性都会被赋予一个非空的值。

```js
var myObject = {
  a: 2,
}
myObject.a // 2
```

当我们访问对象的时候会触发 [[Get]] 操作。
1. 触发后第一步是检查对象本身是否有这个属性，如果有的话就使用它。  

2. 如果无法在对象本身找到需要的属性，就会继续访问对象的 [[Prototype]] 链。  
```js
var anotherObject = {
  a: 2,
}
var myObject = Object.create(anotherObject)
console.log(myObject.a) // 2
```
通过 Object.create() , myObject 对象的 [[Prototype]] 关联到了 anotherObject, myObject.a 无法找到 a，所以去 myObject 的 [[Prototype]] 中去找，此时 [[Prototype]] 关联到了 anotherObject 对象，所以在 anotherObject 上找到了 a 并返回。  

如果 anotherObject 中也找不到 a 并且 [[Prototype]] 链不为空的话，就会继续查找下去。这个过程会持续到找到匹配的属性名或者查找完整[[Prototype]] 链。如果是后者的话，[[Get]] 操作的返回值是 undefined。  

**for..in 遍历 和 in 判断属性是否存在也会访问原型链。**  

### Object.prototype
但是到哪里是 [[Prototype]] 的“尽头”呢？  
所有普通的 [[Prototype]] 链最终都会指向内置的 Object.prototype，因为几乎所有对象都来自于这个 Object.prototype 对象，所以它包含 JavaScript 中许多通用的功能。  



### 属性设置和屏蔽
先看一下对象属性的赋值行为。它会分为一下几种情况：  
- 如果对象本身存在这个属性，则直接进行赋值更新。
- 如果对象本身不存在，则会遍历原型链，如果原型链上找不到 foo，foo 就会被直接添加到 myObject 上。

如果遍历原型链找到 foo 的话那会怎么办？我们后续道来。  
还有一种情况是属性存在于对象本身和原型链，那么原型链的同名属性将会被屏蔽。
```js
myObject.foo = "bar";
```
下面我们分析一下如果 foo 不直接存在于 myObject 中而是存在于原型链上层时 myObject.foo = "bar" 会出现的三种情况。
1. 如果在原型链上层存在名为 foo 属性并且是可写的（writable:true），那就会直接在 myObject 中添加一个名为 foo 的新属性，它是屏蔽属性。
```js
const parent = {
  foo: "foo in parent",
}

const myObject = Object.create(parent)

console.log(myObject.foo) // foo in parent, myObject 本身没有 foo，继承自 parent

Object.defineProperty(parent, "foo", {
  writable: true, // 可写的
  enumerable: true,
  configurable: true,
})

myObject.foo = "bar" // 在 myObject 上创建 foo，并赋值为 "bar"

console.log(myObject.foo) // "bar", 现在 myObject 上有了 foo 属性，且值为 "bar"
console.log(parent.foo) // "foo in parent", parent 的 foo 不受影响
```

这里，parent 对象上的 foo 是可写的（writable: true），因此当执行 myObject.foo = "bar" 时，myObject 上会创建一个新的 foo 属性，值为 "bar"，并且会覆盖掉原型链上的 foo 属性。  


2. 如果在原型链上层存在 foo，但它被标记为只读（writable:false），那么无法修改已有属性或者在 myObject 上创建屏蔽属性。如果运行在严格模式下，代码会
抛出一个错误。否则，这条赋值语句会被忽略。总之，不会发生屏蔽。

**非严格模式**
```js
const parent = {}

const myObject = Object.create(parent)

Object.defineProperty(parent, "foo", {
  value: "foo in parent",
  writable: false, // 不可写的
  enumerable: true,
  configurable: true,
})

myObject.foo = "bar" // 在 myObject 上赋值 foo，但是不会改变

console.log(myObject) // {}, 因为没有在 myObject 上创建 foo
console.log(parent.foo) // "foo in parent", parent 的 foo 属性仍然是原来的值
```
这里，parent 对象上的 foo 被标记为只读（writable: false），所以 myObject.foo = "bar" 这个赋值操作不会改变原型链上的 foo，也不会在 myObject 上创建 foo 属性，直接忽略了赋值。  


**严格模式下会报错**
```js
"use strict"

const parent = {}

const myObject = Object.create(parent)

Object.defineProperty(parent, "foo", {
  value: "foo in parent",
  writable: false, // 不可写的
  enumerable: true,
  configurable: true,
})

try {
  myObject.foo = "bar" // 在严格模式下，会抛出 TypeError
} catch (e) {
  console.log(e) // TypeError: Cannot assign to read only property 'foo' of object '#<Object>'
}

console.log(myObject) // {}
console.log(parent.foo) // "foo in parent"
```
在严格模式下，尝试给 myObject 的 foo 属性赋值会抛出一个 TypeError，因为 foo 是只读的，不能修改。


3. 如果在原型链上层存在 foo 并且它是一个 setter，那就一定会调用这个 setter。foo 不会被添加到myObject。
```js
const parent = {
  _foo: 2,
  set foo(value) {
    this._foo = value * 3 // 设置器，将值乘以 2
  },
  get foo() {
    return this._foo
  },
}

const myObject = Object.create(parent)

console.log(myObject) // {}
myObject.foo = 10 // 调用父类中的 setter，父类setter中的this指向myObject所以创建 _foo 属性并赋值
console.log(myObject) // { _foo 30 } 
console.log(parent._foo) // 2, 
```

**注意**  
- JavaScript 和面向类的语言不同，它并没有类来作为对象的抽象模式或者说蓝图。JavaScript 中只有对象，JavaScript 才是真正应该被称为“面向对象”的语言，因为它是少有的可以不通过类，直接创建对象的语言。  

多年以来，JavaScript 中有一种奇怪的行为一直在被无耻地滥用，那就是模仿类。这种行为利用了函数的一种特殊特性：所有的函数默认都会拥有一个
名为 prototype 的公有并且不可枚举的属性，它会指向另一个对象: 这个对象通常被称为 Foo 的原型，因为我们通过名为 Foo.prototype 的属性引用来访问它。
```js
function Foo() {
// ...
}
Foo.prototype; // { } 
```
我们通过名为 Foo.prototype 的属性引用来访问它（注意：我们只是通过Foo.prototype来访问它，它并不真正是函数的原型）,这个对象是在调用 new Foo()时创建的，最后会被关联到这个 “Foo.prototype” 对象上。
```js
function Foo() {
  // ...
}
var a = new Foo()
// getPrototypeOf 获取对象的原型
console.log(Object.getPrototypeOf(a) === Foo.prototype) // true
```
调用 new Foo() 时会创建 a，其中的一步就是给 a 一个内部的原型对象，关联到 Foo.prototype 指向的那个对象， 使得让 a 与构造出它的函数进行关联。  

**设计哲学：**  
在面向类的语言中，类可以被实例化多次，就像用模具制作东西一样，之所以会这样是因为实例化（或者继承）一个类就意味着“把类的
行为复制到物理对象中”，对于每一个新实例来说都会重复这个过程。  

但是在 JavaScript 中，并没有类似的复制机制。你不能创建一个类的多个实例，只能创建多个对象，**它们通过 [[Prototype]]（原型） 关联的是同一个对象，因此这些对象之间并不会完全失去联系，它们是互相关联的。**new Foo() 会生成一个新对象 a，这个新对象的原型关联的是 Foo.prototype 对象，就这样我们得到了两个对象，它们之间互相关联。

**实例对象的原型指向构造函数的原型都有哪些方法？**  
- new可以实现将新对象的 __proto__ 属性（即 [[Prototype]]）指向构造函数的 prototype 属性。
- Object.create(proto) 方法可以创建一个新对象，并将其原型指向指定的对象(**这就是原型链继承思想**)。
```js
const proto = {
  a: 1,
}
const obj = Object.create(proto)
console.log(obj.a) // 1
```

**总结：**  
在“继承”前面加上“原型”这个容易混淆的组合术语“原型继承”，严重影响了大家对于 JavaScript 机制真实原理的理解。继承意味着复制操作，JavaScript（默认）并不会复制对象属性。相反，JavaScript 会在两个对象之间创建一个关联，这样一个对象就可以通过委托访问另一个对象的属性和函数。**委托这个术语可以更加准确地描述 JavaScript 中对象的关联机制。**


#### 关于函数的调用
```js
function Foo() {
  // ...
}
var a = new Foo();
```
到底是什么让我们认为 Foo 是一个“类”呢？因为他被 new 调用了，看起来和其他面向对象语言一样。


```js
function Foo() {
  // ...
}
Foo.prototype.constructor === Foo; // true
var a = new Foo();
a.constructor === Foo; // true
```
Foo.prototype 默认有一个公有并且不可枚举的属性 .constructor，这个属性指向函数自己。通过 new 调用出来的实例对象 a 也有一个 constructor 属性，这个属性也指向函数 Foo。  

**注意：** 实际上 a 本身并没有 .constructor 属性。而且，虽然 a.constructor 确实指向 Foo 函数，但是这个属性并不是表示 a 由 Foo“构造”，后面会解释。  

上述函数由于使用 new 来调用并且创建了一个实例对象，这很容易让人们认为 Foo 是一个构造函数。实际上，Foo 和你程序中的其他函数没有任何区别。函数本身并不是构造函数，然而，当你在普通的函数调用前面加上 new 关键字之后，就会把这个函数调用变成一个 **“构造函数调用”**。实际上，new 会劫持所有普通函数并使用构造调用的形式来调用函数返回一个对象。  

**在 JavaScript 中对于“构造函数”最准确的解释是，所有带 new 的函数调用。函数不是构造函数，但是当且仅当使用 new 时，函数调用会变成“构造函数调用”。**

### 回顾“构造函数”
之前讨论 .constructor 属性时我们说过，看起来 a.constructor === Foo 为真意味着 a 确实有一个指向 Foo 的 .constructor 属性，但是事实不是这样。因为 a 本身没有 constructor 属性，该属性只是通过查找 a 的 [[Prototype]] 链中找到的，并不是在 a 本身上找到的，又因为 a 的 [[Prototype]] 链关联到了 Foo.prototype，所以 a.constructor === Foo 为真。  

Foo.prototype 的 .constructor 属性只是 Foo 函数在声明时的默认属性。如果你创建了一个新对象并替换了函数默认的 .prototype 对象引用，那么新对象就不会自动创建 .constructor 属性。

思考下面的代码：
```js
function Foo() {
  /* .. */
}
Foo.prototype = {
  /* .. */
} // 创建一个新原型对象
var a1 = new Foo()
console.log(a1.constructor === Foo)// false!
console.log(a1.constructor === Object) // true!
```
Object(..) 并没有“构造”a1，对吧？看起来应该是 Foo()“构造”了它。大部分开发者都认为是 Foo() 执行了构造工作，但是问题在于，如果你认为“constructor”表示“由……构造”的话，a1.constructor 应该是 Foo，但是它并不是 Foo ！  

由于 Foo.prototype = {} 操作后丢失了 .constructor 属性，所以 a 会遍历这个 Foo.prototype 原型链，找到Object.prototype 上的 .constructor 属性， Object.prototype.constructor === Object， 所以 a.constructor === Object 为真。  

**把“constructor”错误地理解为“由……构造”是一个错误观点**，记住这一点“constructor 并不表示被构造”。  

constructor 并不是一个不可变属性。它是不可枚举的，但是它的值是可写的（可以被修改）。  

结论？一些随意的对象属性引用，比如 a1.constructor，实际上是不被信任的，它们不一定会指向默认的函数引用。此外，很快我们就会看到，稍不留神 a1.constructor 就可能会指向你意想不到的地方。a1.constructor 是一个非常不可靠并且不安全的引用。通常来说要尽量避免使用这些引用。  

### 关系判断
```js
function Foo() {
// ...
}
Foo.prototype.blah = ...;
var a = new Foo();

a instanceof Foo; // true
```
instanceof 操作符的左操作数是一个普通的对象，右操作数是一个函数。instanceof 回答的问题是：在 a 的整条 [[Prototype]] 链中是否有指向 Foo.prototype 的对象？  
可惜，这个方法只能处理对象（a）和函数之间的关系。如果你想判断两个对象（比如 a 和 b）之间是否通过 [[Prototype]] 链关联，只用 instanceof无法实现。  

可以直接获取一个对象的 [[Prototype]] 链。在 ES5 中，标准的方法是：`Object.getPrototypeOf( a )`   验证一下。
```js
Object.getPrototypeOf( a ) === Foo.prototype; // true
```

绝大多数（不是所有！）浏览器也支持一种非标准的方法来访问内部 [[Prototype]] 属性：
```js
a.__proto__ === Foo.prototype; // true
```

和我们之前说过的 .constructor 一样，.__proto__ 实际上并不存在于你正在使用的对象中（本例中是 a）。实际上，它和其他的常用函数（.toString()、.isPrototypeOf(..)，等等）一样，存在于内置的 Object.prototype 中。


### 对象关联
[[Prototype]] 机制就是存在于对象中的一个内部引用，指向其他对象。
通常来说，这个链接的作用是：如果在对象上没有找到需要的属性或者方法引用，引擎就会继续在 [[Prototype]] 关联的对象上进行查找。同理，如果在后者中也没有找到需要的引用就会继续查找它的 [[Prototype]]，以此类推。这一系列对象的链接被称为“原型链”。  

#### 创建关联
**Object.create(..) 是创建关联的推荐方法。**
```js
var foo = {
  something: function () {
    console.log("Tell me something good...")
  },
}
var bar = Object.create(foo)
bar.something() // Tell me something good...
```
Object.create(..) 会创建一个新对象（bar）并把它关联到我们指定的对象（foo），这样我们就可以充分发挥 [[Prototype]] 机制的威力（委托）并且避免不必要的麻烦（比如使用 new 的构造函数调用会生成 .prototype 和 .constructor 引用）。  

**注意**
Object.create(null) 会创建一个空 [[Prototype]]链接的对象，这个对象无法进行委托, 也就是说这个对象没有原型链，所以instanceof 操作符无法进行判断，因此总是会返回 false。**这些特殊的空 [[Prototype]] 对象通常被称作“字典”，它们完全不会受到原型链的干扰，因此非常适合用来存储数据。**  


## 行为委托





















