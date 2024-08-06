# CSS预处理器-Sass

**CSS 预处理器**是一个能让你通过预处理器自己独有的语法来生成[CSS](https://developer.mozilla.org/zh-CN/docs/Glossary/CSS)的程序。市面上有很多 CSS 预处理器可供选择，且绝大多数 CSS 预处理器会增加一些原生 CSS 不具备的特性，例如代码混合，嵌套选择器，继承选择器等。这些特性让 CSS 的结构更加具有可读性且易于维护。



## 介绍

​	[Sass](https://link.juejin.cn/?target=https%3A%2F%2Fsass-lang.com%2Fguide): 诞生于2007年，最早也是最成熟的一款CSS预处理器语言。可以使用常量、变量、函数、混入、函数等功能，最后会编译成合法的CSS让浏览器使用。

​	Sass 有两种语法！SCSS语法( `.scss`) 最常用。它是CSS的超集，这意味着所有有效的CSS也是有效的SCSS。缩进语法 ( `.sass`) 更不寻常：它使用缩进而不是花括号来嵌套语句，并使用换行符而不是分号来分隔它们。

## 变量

​		可以通过变量的方式来表示CSS样式。可以存储颜色、字体大小、布局或你认为想要重用的任何CSS样式。 Sass 使用`$`符号使的css样式成为变量。

![image-20240324223051631](D:\other-tool\Typora\img\image-20240324223051631.png)

![image-20240324223101849](D:\other-tool\Typora\img\image-20240324223101849.png)



## 嵌套

在编写HTML时，它具有清晰的嵌套和视觉层次结构。但是CSS样式的编写是扁平化的不支持类似的嵌套结构。

Sass 允许您以遵循HTML相同视觉层次结构的方式嵌套CSS选择器。请注意，过度嵌套会导致CSS样式会导致难以维护，并且通常被认为是不好的做法。 

![image-20240324223126884](D:\other-tool\Typora\img\image-20240324223126884.png)

![image-20240324223136796](D:\other-tool\Typora\img\image-20240324223136796.png)



## 模块化

​		不必将所有 Sass 写入一个文件中。您可以根据`@use`规则将其拆分。此规则将另一个 Sass 文件加载为 *module*，这意味着你可以使用基于文件名来引用 Sass 文件中的变量、 [mixins](https://sass-lang.com/guide/#mixins)和 [函数](https://sass-lang.com/documentation/at-rules/function)。使用文件还将在编译输出中包含它生成的CSS 。使用@use 相当于导入scss文件，之后可以使用  **导入文件名.的方式**  使用scss文件中定义的css变量。这很像你在使用JS在编程。

![image-20240324224131732](D:\other-tool\Typora\img\image-20240324224131732.png)

![image-20240324224139120](D:\other-tool\Typora\img\image-20240324224139120.png)



## Mixins混入

​		为了有效的维护和开发项目，代码的重复利用就显得尤为重要。这对于css样式开发同样重要。@mixin 指令能提高你代码的重复使用率并简化你的代码。

​		@mixin指令允许定义可以在整个样式表中重复使用的样式，而避免了使用无语意的类（class），混入(@mixin)还可以包含所有的 CSS 规则，以及任何其他在 Sass 文档中被允许使用的东西，您甚至可以传递值以使您的 mixin 更加灵活。这就意味着只需**少量的混入(@mixin)代码就能输出多样化且不重复的样式。**	

​		定义混入后通过 `@include` 调用混入

![image-20240324225558690](D:\other-tool\Typora\img\image-20240324225558690.png)

​		

## 继承

​	使用`@extend`可让您将一组CSS属性从一个选择器共享到另一个选择器。这可以减少css样式代码量并提高样式复用。

但是你不需要该样式某一个属性，例如你不需要继承过来的 `font-size` 属性。但是继承的话就是继承全部属性，所以需要单独重新设置你不想继承的属性。

![image-20240324230019282](D:\other-tool\Typora\img\image-20240324230019282.png)



