# Vue中的diff算法
## 背景
  今年秋招面试字节跳动的时候又被面试官问到，这是一个比较偏框架原理层面的知识，当时没有很好回答出来，后续就复盘了相关的知识。  

  1991 年，蒂姆・伯纳斯 - 李（Tim Berners - Lee）发布了 HTML（超文本标记语言），这是网页开发的基石。旧web时代，传统网页大多基于静态页面实现，网站可展示的内容有限，交互性较差。
![传统静态网页](/传统静态网页.png)      
  
  

**动态网页技术兴起**  
- JavaScript 在 1995 年诞生。它是一种脚本语言，可以直接嵌入 HTML 页面中，使网页具有交互性。
- PHP 在 1995 年发布，它是一种开源的服务器端脚本语言。由于其简单易学和强大的功能，被广泛应用于动态网页开发。  
  
**一个老梗**  
&emsp;&emsp;PHP是最好的语言这个梗不是出自别处，而就是出自PHP的官方文档！
直到2010年前后，PHP一直作为web开发中的统治力量而存在，得益于Wordpress等内容管理系统、Zend等开发框架以及Discuz!论坛等应用方案的出现，通过PHP进行web开发成为当时开发者的首选，同时php也是较早的服务端渲染方案，而Facebook等明星企业对PHP的成功运用更巩固了PHP在业界的地位。
![php是世界上最好的语言](/php是世界上最好的语言.png)  

**现代标准和框架时代**
- Web 标准运动：以 W3C（万维网联盟）为代表的组织大力推动 Web 标准的建立和普及。TML4.01 和 XHTML1.0 等标准在这个时期被广泛采用。这些标准强调网页的语义化，。这不仅有助于搜索引擎更好地理解网页内容，提高网站的搜索排名，也使得网页代码更易于维护和扩展。
- JavaScript 框架的涌现：jQuery 在 2006 年发布，它是一个快速、简洁的 JavaScript 库。它简化了 JavaScript 编程中的 DOM 操作和事件处理，几乎所有的网站都开始使用 jQuery 来增强交互性。

**单页应用（SPA）的兴起**  
&emsp;&emsp;以 AngularJS（2010 年发布）为代表的单页应用框架开始出现。单页应用改变了传统网页的加载模式（**前端路由**），它在一个页面内通过 JavaScript 动态加载和更新内容，而不是每次用户操作都重新加载整个页面。这种方式大大提高了用户体验的流畅性。  

**现代前端框架**  
- React.js 在 2013 由 FaceBook（现为 meta）发布，它以虚拟 DOM 的概念为核心，提供了高效的组件化开发方式，以非常灵活的写法广受欢迎。
- Vue.js 在 2014 年发布，以模板语法和响应式系统著称，在国内极为流行。

## 为什么 JQuery 会被淘汰
说实话，我在学前端的时候没接触过这么远古的框架，都是从 vue、react 开始学起的。  
![jquery为什么会被淘汰](/jquery为什么会被淘汰.jpeg)  
由于jquery 开发的应用可以接近原生的效果，但是会暴露出一些问题，比如大量的 DOM 操作与 DOM API 的频繁调用，操作繁琐，使得代码变得难以维护，页面渲染性能降低、速度变慢等。即便 jQuery 能简化 DOM 操作，但比不上 MVVM 架构直接跳过了 DOM 操作。  
**这导致Jquery日渐臃肿，存量项目难以维护，新项目体量越大开发成本直线升高。**

对于实现同一个功能：jquery对比react：**点击按钮后隐藏一个指定的元素**
```html
<!DOCTYPE html>
<html>

<head>
  <title>jQuery示例</title>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  <style>
    /* 为示例中的元素添加一些简单样式 */
    button {
      padding: 10px 20px;
      background-color: #007BFF;
      color: white;
      border: none;
      cursor: pointer;
    }

    div {
      margin-top: 20px;
      background-color: #f9f9f9;
      padding: 20px;
    }
  </style>
</head>

<body>
  <button id="hideButton">点击隐藏下方元素</button>
  <div id="targetDiv">这是一个将会被隐藏的元素。</div>

  <script>
    // 当页面加载完成后执行以下代码
    $(document).ready(function () {
      // 为id为hideButton的按钮绑定点击事件
      $('#hideButton').click(function () {
        // 隐藏id为targetDiv的元素
        $('#targetDiv').hide();
      });
    });
  </script>
</body>

</html>
```

```jsx
import React, { useState } from 'react';
const App = () => {
    // 使用useState钩子来创建一个状态变量isVisible，初始值为true，表示元素初始是可见的
    const [isVisible, setIsVisible] = useState(true);
    const handleClick = () => {
        // 点击按钮时，调用setIsVisible函数来更新isVisible的状态，取反当前的值
        setIsVisible(!isVisible);
    };
    return (
        <div>
            <button onClick={handleClick}>点击隐藏下方元素</button>
            {isVisible && (<div>这是一个将会被隐藏的元素。</div>)}
        </div>
    );
};
export default App;
```

由上述代码可见，jquery 是命令式的，react是声明式的，当逻辑更加复杂时，jquery 代码增量将会更加恐怖，这使得维护和开发变得更加困难。

## 虚拟 DOM 带来了生产力的蜕变

- 减少不必要的 DOM 更新：通过新旧 DOM 树的diff实现高效和准确的DOM 更新。
- 实现声明式的编程范式，开发者只需要调用指定api或实现特定写法，而无需直接操作DOM。
- 虚拟DOM结合声明式让代码更加简洁易懂，大大降低了维护成本和开发成本。

**问题来了，基于虚拟DOM的现代化框架比没有虚拟DOM的原生或者类原生（jQuery）写法性能高吗？**  
&emsp;&emsp;这个问题在今年的面试中也被面试官问到，自己也踩了一些坑，后面专门去看了一下才了解到其中的细节。  
&emsp;&emsp;当时我的回答是：虚拟 DOM 本身性能并不高，但通过虚拟 DOM + diff 算法实现尽量少的更新 DOM 实现性能提升。面试官认为我的解释可能不太准确，让我下去了解了解。

网上很多说法也存在误导性，说虚拟 DOM 能提升性能，其实不然，经过多方查证后总结：  
借用尤语溪的一句话：这儿很好的解释了原因。
![尤语溪语录](/尤语溪语录.png)

- 声明式代码(vue、react等)的更新性能消耗 = **找出差异的性能消耗** + **直接修改的性能性能消耗（简单且开发效率高）**
- 原生代码更新的性能消耗 = **直接修改的性能性能消耗（复杂且开发成本较高）**  

**本质上就是性能与可维护性的权衡与考量**  

在不需要手动优化的前提下，依然可以给你提供堪比原生性能体验。要实现这有点就需要 虚拟 DOM + diff 算法的配合，接下来我们来看看 vue 中diff算法的设计与实现。


## 双端 diff 算法
&emsp;&emsp;diff 算法是vue渲染器的核心, 简单来说就是节点复用，在两颗新旧 DOM 树上找最小差异, 然后将差异更新到真实 DOM 中的一种算法。  
&emsp;&emsp;首先要确定我们比较的依据是什么？**即节点类型和key**，节点类型很好理解，例如：`type: 'p'` `type: 'div'` 等就是节点类型，key属性就像是虚拟节点的 “身份证号”，只要两个虚拟节点的 type 属性和 key 属性值都相同，那么我们认为它们是相同的，**即 DOM 可以复用。**  

&emsp;&emsp;vue2中使用一种双端diff算法实现了 DOM 的高效更新，通过同时对新旧两组子节点的两个端点进行比较。在双端 diff 算法中，**需要创建四个索引节点：newStartIndex、newEndIndex、oldStartIndex、oldEndIndex。分别对于新旧节点的开始和末尾节点。** 
开始进行双端diff比较：每一轮比较都分为四个步骤。  
- 第一步：比较 P4(新) 和 P1(旧)，看是否相同，如果相同则复用并进行后续移动和更新索引步骤，否则跳过。
- 第二部：比较 P3(新) 和 P4(旧)，看是否相同，如果相同则复用并进行后续移动和更新索引步骤，否则跳过。
- 第三步：比较 P3(新) 和 P1(旧)，看是否相同，如果相同则复用并进行后续移动和更新索引步骤，否则跳过。
- 第四步：比较 P4(新) 和 P4(旧)，看是否相同，如果相同则复用并进行后续移动和更新索引步骤，否则跳过。

![双端diff算法1](/双端diff算法1.png)  

&emsp;&emsp;**对于可以复用的节点，我们只需要，我们只需要移动操作即可完成更新**，如上述图片分析可知，P4 节点原来在最后，而在新的顺序中它却跑到了第一个。这时我们之前定义的那4个索引节点就派上用场了，本来 oldStartIndex 对应的节点就是代表第一个节点，那现在我们将 oldEndIndex 对应节点移动到它的前面（这时我的位置比第一个还要靠前，那么我现在就是第一个）即可完成本次移动。  

**注意**：在移动之前需要对该元素进行 patch 操作打补丁。  
**原因**：虽然节点可复用，但并不代表它们更新前后完全一致，例如文本节点是否有更新，绑定的属性和事件处理程序是否发生改变等，这些都需要进行 patch 检查一遍确保元素更新前后的稳定。  
循环上述过程即可

![双端diff算法2](/双端diff算法2.png)  
![双端diff算法3](/双端diff算法3.png)  
![双端diff算法4](/双端diff算法4.png)  
![双端diff算法5](/双端diff算法5.png)  

**非理想状态的处理方式**  

我们知道双端 diff 算法的每一轮比较的过程都分为四个步骤，每轮比较都会命中一个，这是非常理想的情况，但实际上并非所有情况都这么理想。
![双端diff非理想情况1](/双端diff非理想情况1.png)  
上述节点排序情况，经过四轮比较都无法找到可复用的节点，只能看其他节点是否可复用。  
具体做法：用新头节点遍历旧节点，看能否在旧节点中找到可复用节点，若找到则用 idxInold 变量记录对应位置。  
怎样判断找到可复用节点，只要 idxInold > 0, 即可判断找到可复用节点。  
找到可复用节点后进行移动操作。
![双端diff非理想情况2](/双端diff非理想情况2.png)  
  

**添加和删除**  

如果无法在旧节点中匹配到可复用的节点，证明该节点是一个新增节点。  
![双端diff新增节点](/双端diff新增节点.png)  

若经过匹配后，`newStartIdx > newEndIdx && oldStartIdx <= oldEndIdx`，代表已经更新结束，但旧的子节点任有未处理的节点，此时从 **oldStartIdx** 到 **oldEndIdx** 的范围内的所以节点就是属于要删除的节点，开启一个循环删除即可。
```js
if(newStartIdx > newEndIdx && oldStartIdx <= oldEndIdx) {
  for(let i = oldStartIdx; i <= oldEndIdx; i++) {
    // 删除函数unmount
    unmount(oldNode[i])
  }
}
```
![双端diff删除节点](/双端diff删除节点.png)  

## 快速diff 算法
