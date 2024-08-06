# CSS预处理器-Less

## 介绍	

​	Less（Leaner Style Sheets 的缩写） 是一门向后兼容的 **CSS** **扩展语言**。，它扩展了CSS（层叠样式表）的功能并提供了更灵活、更强大的样式定义和管理机制。

​	

## 变量

用`@`声明变量并使用，支持数值运算。

```less
@width: 10px;
@height: @width + 10px;

#header {
  width: @width;
  height: @height;
}
```



## 混合（Mixins）

Mixin 是一种将一个规则集中的属性**混合**到另一个规则集中的方法，类选择器和id选择器都支持混入。

我们希望在其他规则集中使用这些属性。好吧，我们只需要输入我们想要属性的类的名称，如下所示：

```less
.bordered {
  border-top: dotted 1px black;
  border-bottom: solid 2px black;
}

#menu a {
  color: #111;
  .bordered();
}

.post a {
  color: red;
  .bordered();
}
```



如果要创建 mixins，但不希望该 mixins 出现在 CSS 输出中，请在 mixins 定义后加上括号。

```less
.my-mixins {
  color: black;
}
.my-other-mixin() {
  background: white;
}
.class {
  .my-mixin();
  .my-other-mixin();
}
```

输出

```less
.my-mixins {
  color: black;
}
.class {
  color: black;
  background: white;
}
```



## 嵌套

Less 让你能够使用嵌套或者与级联结合使用。

```less
// css 代码
#header {
  color: black;
}
#header .navigation {
  font-size: 12px;
}
#header .logo {
  width: 300px;
}

// less嵌套
#header {
  color: black;
  .navigation {
    font-size: 12px;
  }
  .logo {
    width: 300px;
  }
}
```



嵌套、伪类、混合的结合用法（ clearfix hack ）-  清除浮动技巧。（`&` 表示当前选择器的父选择器）

```less
.clearfix {
  display: block;
  zoom: 1;

  &:after {
    content: " ";
    display: block;
    font-size: 0;
    height: 0;
    clear: both;
    visibility: hidden;
  }
}
```



### 嵌套规则和冒泡

​		可以像选择器一样嵌套 `@media` 或 `@supports` 等 `@ 规则（at-rule）`。At-rule 放在顶部，相对于同一`规则集`中的其它元素的相对顺序保持不变，这称为冒泡（bubbling）。

```less
.component {
  width: 300px;
  @media (min-width: 768px) {
    width: 600px;
    @media (min-resolution: 192dpi) {
      background-image: url(/img/retina2x.png);
    }
  }
  @media (min-width: 1280px) {
    width: 800px;
  }
}
```

输出：

```less
.component {
  width: 300px;
}
@media (min-width: 768px) {
  .component {
    width: 600px;
  }
}
@media (min-width: 768px) and (min-resolution: 192dpi) {
  .component {
    background-image: url(/img/retina2x.png);
  }
}
@media (min-width: 1280px) {
  .component {
    width: 800px;
  }
}
```



​		 `@ 规则（at-rule）`：在 CSS 中，@ 规则（at-rule）是一种特殊的语法结构，用于引入一些特定的功能或者对某些条件进行判断。常见的 @ 规则包括 @media（媒体查询）和 @supports（特性查询）。

1. @media：@media 规则允许在不同的媒体设备和条件下应用不同的样式。通过 @media 规则，可以根据设备的不同特性（如屏幕宽度、高度、颜色等）来应用相应的样式，以实现响应式设计和布局。

示例：

```css
css
/* 当视口宽度小于 768px 时应用以下样式 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
```

1. @supports：@supports 规则用于检测浏览器是否支持特定的 CSS 属性和值。通过 @supports 规则，可以根据浏览器的能力应用不同的样式，从而实现渐进增强或优雅降级。

示例：

```css
css
/* 如果浏览器支持 flex 布局，则应用以下样式 */
@supports (display: flex) {
  .container {
    display: flex;
  }
}
```

除了 @media 和 @supports 外，还有其他一些 @ 规则，例如 @font-face（定义 web 字体）、@keyframes（定义动画关键帧）等，它们都为 CSS 提供了更多灵活和强大的功能。



## 运算

在 LESS 中，你可以进行各种数学运算，包括加法、减法、乘法和除法。这些运算可以应用于数字、颜色和变量等数据类型。

1. 加法：

```less
// less
@width: 100px;
@padding: 20px;
.total-width {
  width: @width + @padding; // 结果为 120px
}
```

1. 减法：

```less
// less
@base-font-size: 16px;
@font-size: 14px;
.small-font {
  font-size: @base-font-size - @font-size; // 结果为 2px
}
```

1. 乘法：

```less
// less
@base-font-size: 16px;
@line-height-multiplier: 1.5;
.line-height {
  line-height: @base-font-size * @line-height-multiplier; // 结果为 24px
}
```

1. 除法：

```less
// less
@container-width: 960px;
@columns: 12;
.column-width {
  width: @container-width / @columns; // 结果为 80px
}
```



### calc() 

calc() 此 [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS) 函数允许在声明 CSS 属性值时执行一些计算。此 calc() 函数用一个表达式作为它的参数，用这个表达式的结果作为值。

```css
/* property: calc(expression) */
/* 这段 CSS 代码中的 width: calc(100% - 80px); 的作用是将元素的宽度设置为其父元素宽度减去 80px 的值。因为100%的宽度相当于父元素的宽度 */
width: calc(100% - 80px);
```



为了与 CSS 兼容 ，less中 `calc()` 不会计算 Math 表达式，但会计算变量和嵌套函数中的 Math 表达式。

```less
@var: 50vh/2;
width: calc(50% + (@var - 20px)); // 结果是 calc(50% + (25vh - 20px))
```



## 转义

​		转义（Escaping）允许你将任何任意字符串用作css属性或less变量值。

```less
@min768: ~"(min-width: 768px)";
.element {
  @media @min768 {
    font-size: 1.2rem;
  }
}
```

输出

```less
@min768: (min-width: 768px);
.element {
  @media @min768 {
    font-size: 1.2rem;
  }
}
```

请注意，从 Less 3.5 开始，您可以简单地编写：

```less
/* 当视口宽度大于等于 768px 时，.element 元素的字体大小会被设置为 1.2rem。 */
@min768: (min-width: 768px);
.element {
  @media @min768 {
    font-size: 1.2rem;
  }
}
```



## 导入

你可以导入 `.less` 文件，并且其中的所有变量都将可用。对于 `.less` 文件，扩展名是可选的。

```less
@import "library"; // library.less
@import "typo.css";
```



## 作用域

​		Less 中的作用域与 CSS 非常相似。变量和混合（mixins） 首先在本地查找，如果找不到，则从“父”作用域继承。这也和JS的查询逻辑基本相同。

```less
@var: red;

#page {
  @var: white;
  #header {
    color: @var; // white
  }
}
```

注意：与 CSS 自定义属性一样，混合（mixin）和变量定义不必放置在引用它们的行之前。因此，以下 Less 代码与前面的示例相同：这里它是本层作用域中找不到变量，然后就会跳到上一层查找，只要该层存在该变量即可，不论位置。

```less
@var: red;

#page {
  #header {
    color: @var; // white
  }
  @var: white;
}
```



## 函数

Less 提供了各种函数，可以转换颜色、操作字符串和进行 Math 计算。

### Logical函数

### String函数

### List函数

### Math函数

### Type函数

## 命名空间和访问器

有时，出于组织结构或仅仅是为了提供一些封装的目的，你希望对混合（mixins）进行分组。你可以用 Less 更直观地实现这一需求。假设你想要在 `#bundle` 下捆绑一些混合（mixins） 和变量，以供以后重用或分发：

```less
#bundle() {
  .button {
    display: block;
    border: 1px solid black;
    background-color: grey;
    &:hover {
      background-color: white;
    }
  }
  .tab {
    ...;
  }
  .citation {
    ...;
  }
}
```

在 `#header a` 中混入 `.button` 类，我们可以这样做：

```less
#header a {
  color: orange;
  #bundle.button(); // 也可以写成 #bundle > .button
}
```

注意：如果你不希望命名空间（例如 `#bundle()`）出现在 CSS 输出中，可以将 `()` 添加到命名空间末尾，即 `#bundle .tab`。

## 映射

从 Less 3.5 开始，你还可以使用混合（mixins） 和规则集（rulesets） 作为值映射。

```less
#colors() {
  primary: blue;
  secondary: green;
}

.button {
  color: #colors[primary];
  border: 1px solid #colors[secondary];
}
```

输出

```less
.button {
  color: blue;
  border: 1px solid green;
}
```