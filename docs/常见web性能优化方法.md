# 常见web性能优化方法

## 介绍

​		构建一个网站需要 HTML、CSS 和 JavaScript。为了构建人们需要的、能吸引和留住用户的网站和应用，我们需要创建一个良好的用户体验的web应用。良好用户体验的是确保**内容快速加载**并**响应用户交互**。这就是所谓的 **web 性能**。很多因素影响着web程序的性能，包括延迟(包括网络延迟、交互延迟、渲染延迟)、应用程序大小(大型应用用于代码量和复杂性很容易出现性能问题)、DOM 节点数量、资源请求数量、JavaScript 性能、CPU 负载等等。

当我开发项目到预生产环境时，需要对项目的代码和资源进行优化才能保证网站有良好的用户体验。现在从以下方面来讨论常见的web性能优化方案。

## 图片

现代网站浏览界面包含非常多的图片信息，媒体均网站下载字节的 70% 以上。所以图片的大小处理、图像质量优化、图片加载方式对web性能有很大的影响。

### 懒加载

延迟加载即懒加载：当内容出现在用户可视区域的时候才进行图片的加载而不是一开始就加载，实现方案有JS原始实现或者第三方库实现，例如 [lazysizes](https://github.com/aFarkas/lazysizes)，浏览器供应商目前正在开发一种原生的 `lazyload` 属性，目前处于实验阶段。

流程：

1. 将图片的`src`属性设置为一个占位符，如空白图或者一个小的loading图。
2. 给需要懒加载的图片添加一个特定的class，比如"lazy-load"。
3. 使用JavaScript监听页面滚动事件，检查每张图片是否进入了可见区域。
4. 如果图片进入了可见区域，将占位符的`src`属性替换为真实的图片地址。

```js
document.addEventListener("DOMContentLoaded", function() {
    let lazyImages = document.querySelectorAll(".lazy-load");

    function lazyLoad() {
        lazyImages.forEach(function(image) {
            if (image.getBoundingClientRect().top < window.innerHeight && image.getBoundingClientRect().bottom >= 0 && window.getComputedStyle(image).display !== "none") {
                image.src = image.dataset.src;
                image.classList.remove("lazy-load");
            }
        });
    }

    // 初始加载
    lazyLoad();

    // 监听滚动事件
    window.addEventListener("scroll", lazyLoad);
});
```



### 格式调优

可以根据展示方式和内容使用适合的图片类型，这对与性能优化也是有帮助的。

- JPEG：一种有损压缩格式，适合存储照片和复杂的图像。它可以压缩图像文件的大小，同时保持较高的图像质量。

- PNG：PNG 支持无损压缩，可以保留图像的高质量，但文件体积较大。

- GIF：特点：GIF 是一种支持动画的格式，可以存储多帧图像并播放成动画，同时支持透明度。

- SVG：是基于 XML 的矢量图形格式，支持放大而不失真，文件大小较小且可编辑。不同尺寸的设备上保持清晰度。



### 定制渲染策略

​		当在 <img> 元素上包含图像的 `width` 和 `height` 属性时，浏览器可以在图像加载之前计算图像的宽高比，并预留占位空间，从而减少或甚至防止布局变化。减少布局变化是良好用户体验和 web 性能的重要组成部分。没有 `width` 和 `height` 属性，将不会创建占位空间，导致页面在渲染后加载图片时出现明显的[卡顿](https://developer.mozilla.org/zh-CN/docs/Glossary/Jank)或布局移动。页面的重新布局和重绘是性能和可用性问题。

**注意**：在CSS中设置图片宽高和直接在元素上设置宽高属性使用区别的，直接设置属性会使得浏览器在加载页面时预留空间，而通过css控制宽高会在页面加载完毕后才计算和应用这些样式，因此可能会导致页面在加载时出现布局的变化。

在响应式设计中，当容器比图片更窄时，通常使用以下 CSS 代码来防止图片溢出容器：

```css
img {
  max-width: 100%;
  height: auto;
}
```



## 视频

### 视频压缩

用视频压缩技术（如 H.264、H.265 等）减小视频文件的大小，以减少带宽占用和加载时间。

### 视频格式优化

选择适合 Web 的视频格式，如 MP4、WebM 等。不同的浏览器对视频格式的支持有所不同，因此可以提供多种格式的视频以兼容不同的浏览器。

### 移除音频

对于一些网站置顶轮播或者宣传方面的视频是不需要声音的，而这些视频我们可以移除它们的音频达到可以节省带宽的目的。



## JS性能优化

考虑如何在你的网站上使用 JavaScript 以及如何减少它可能造成的性能问题是非常重要的。JavaScript 对性能的负面影响更大——它会显著影响下载时间、渲染性能、CPU 和电池使用。

### TreeShaking

​		在打包过程中移除未被使用的代码，以减少最终生成的代码体积。这对于减少应用程序的加载时间和提高性能至关重要。其原理使用到抽象语法树，根据当前代码生成抽象语法树，插件对抽象语法树进行处理后生成新的代码。

### 代码压缩

利用打包工具对代码进行压缩，减少文件中的字符数，从而减小 JavaScript 的字节数或大小。

### 脚本预加载和延迟加载

在html文档的头部`<head>`中使用`<link>`并使用 [`rel="preload"`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/rel/preload) 来为关键 JavaScript 创建一个预加载器并且**不会阻塞渲染**：

```html
<head>
  ...
  <!-- 预加载 JavaScript 文件 -->
  <link rel="preload" href="important-js.js" as="script" />
  <!-- 预加载 JavaScript 模块 -->
  <link rel="modulepreload" href="important-module.js" />
  ...
</head>
```



另一方面，你应该尽量推迟解析和执行非关键 JavaScript 的时间，直到它真正需要时再加载。

给 `<script>` 元素添加 `async` 属性，这会导致脚本获取与 DOM 解析并行进行，因此它将在同一时间准备好，不会阻塞渲染。

```html
<head>
  ...
  <script async src="main.js"></script>
  ...
</head>
```



async和defer的区别

- async：遇到脚本立即下载并执行

- defer：遇到脚本后立即下但会在文档解析完毕后再执行。

  

### 分解长任务

当浏览器运行 JavaScript 时，它会将脚本组织成按顺序运行的任务，例如进行 fetch 请求、通过事件处理程序驱动用户交互和输入、运行 JavaScript 驱动的动画等等。大部分任务都在主线程上运行，其中主线程一次只能运行一个任务。

当单个任务的执行时间超过 50 毫秒时，它被归类为长任务。如果用户在长任务正在运行时尝试与页面交互或请求重要的 UI 更新，他们的体验将受到影响。预期的响应或视觉更新将被延迟，导致 UI 看起来迟钝或无响应。

- 通过promise异步方案来解决此类长任务，当长任务完成后会将结果回调。
- 计算任务移到主线程之外，[Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers) 是一种机制，允许你打开一个单独的线程来运行一段 JavaScript 代码，以便不会阻塞主线程。



### 优化事件性能

跟踪及处理事件对于浏览器来说是很耗资源的，特别是当你持续运行一个事件时。

- 避免在高频率事件（如滚动事件、鼠标移动事件）上绑定过多的事件监听器，
- 使用节流和防抖等技术来优化。使用事件委托减少事件监听器的数量。
- 及时删除不需要的监听器。



### 编写高效代码

- 减少对DOM的操作(减少重排重绘)：访问和更新 DOM 的计算成本很高，因此你应该尽量减少 JavaScript 这种操作方面的操作量
- 简化HTML代码：DOM 树越简单，使用 JavaScript 进行访问和操作的速度就越快。
- 减少循环代码的数量：循环很消耗资源，减少代码中的循环使用量。不必要时避免运行完整的循环，适时使用 [`break`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/break) 或 [`continue`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/continue) 语句。考虑使用 `map()`、`filter()`、`reduce()` 等数组方法替代传统的 `for` 循环，因为它们内部用的可能是更加高效的时间复杂度比f `for` 循环更小的算法。
- 避免无限递归：无限递归可导致函数调用栈的堆积导致内存泄漏。



## HTML性能优化

### 优化dom树结构

编写html时要注意结构的复杂度，生成的dom树结果过于复杂通常会影响页面性能。因为此时如果引起回流或者需要操作dom时页面将大概率出现卡顿的情况。

### 语义化标签

尽量使用语义化标签，特定的标签做特定的事，提高页面的访问性和SEO优化。



## CSS性能优化

### CSS模块化

CSS 模块化可以延迟加载在页面加载阶段非必要的 CSS，缩短初始 CSS 的阻塞和加载时间。最简单的方法是将 CSS 拆分为独立的文件。

```html
<!-- 加载和解析 styles.css 会阻塞渲染 -->
<link rel="stylesheet" href="styles.css" />

<!-- 加载和解析 print.css 不会阻塞渲染 -->
<link rel="stylesheet" href="print.css" media="print" />

<!-- 在大屏幕上，加载和解析 mobile.css 不会阻塞渲染 -->
<link
  rel="stylesheet"
  href="mobile.css"
  media="screen and (max-width: 480px)" />
```



### CSS精灵图

将多个图标放入单张图片文件中，通过 `background-position` 背景定位显示正确的图标，减少http请求。

### 简化选择器

复杂的选择器会增加匹配时间导致样式应用会出现延迟，同时也利于开发者的编写和维护。