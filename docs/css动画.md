# css 动画
CSS 动画是一种在网页上创建动态视觉效果的技术，它允许你在不使用 JavaScript（也可以结合 js）的情况下，通过定义关键帧和动画属性来改变元素的样式。基本原理是**在一段时间内，通过过渡（transition）或关键帧动画（@keyframes）来改变 CSS 属性的值，实现动画效果**

## 过渡-transition
用于在元素的两个状态之间创建平滑的过渡效果。  
它主要涉及到四个属性：
- transition-property：指定要过渡的 CSS 属性
- transition - duration：设置过渡动画的持续时间
- transition - timing - function：定义动画的速度曲线，如线性、缓入缓出等
- transition - delay：定义动画开始的延迟时间

```css
.box {
  width: 100px;
  height: 100px;
  background-color: blue;
  transition: background-color 0.5s ease;
}
.box:hover {
  background-color: red;
}
```
这个例子中，当.box元素被悬停时，背景色会在0.5秒内从蓝色平滑变为红色。


## 关键帧动画
当需要更复杂的动画效果时，可以使用@keyframes来定义动画的每一个步骤。主要属性包括：
- @keyframes：定义动画的每个关键帧（使用百分比或from和to）。
- animation-name：指定@keyframes的名称。
- animation-duration：定义动画持续时间。
- animation-timing-function：同样用于设置速度曲线。
- animation-delay：动画延迟时间。
- animation-iteration-count：定义动画重复次数（infinite为无限次）。
- animation-direction：定义动画播放方向（normal、reverse、alternate、alternate-reverse）。
- animation-fill-mode：定义动画在播放前后状态（forwards、backwards、both）。


```css
@keyframes move {
  0% { transform: translateX(0); }
  50% { transform: translateX(100px); }
  100% { transform: translateX(0); }
}

.box {
  width: 100px;
  height: 100px;
  background-color: green;
  animation: move 2s ease-in-out infinite;
}
```
在这个例子中，.box元素会左右移动，动画每2秒循环一次。

## 常见考点
- 过渡与动画的区别：过渡用于状态切换，需要触发事件（如hover）；动画则更适合复杂动画，使用@keyframes定义多个状态。

- animation属性简写顺序：需要牢记animation的简写属性顺序（name duration timing-function delay iteration-count direction），尤其在面试中有时会被问及。

- 速度曲线的理解：面试中可能会问到ease、linear、ease-in、ease-out、ease-in-out等曲线的区别。这些曲线影响动画的速度变化，如ease-in表示动画开始时慢，逐渐加速。

- 性能优化：CSS动画尽量只改变transform和opacity，因为它们不会引起布局和重绘。避免使用top、left等属性，因它们会导致重排和性能损耗。

- 硬件加速：面试中可能会提到CSS动画的硬件加速。使用will-change: transform;可以提示浏览器优化相关渲染。