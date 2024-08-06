# babel插件开发基础

## babel插件开发基本介绍

## 介绍

Babel 是一个通用的多功能的 JavaScript 编译器（更确切地说是源码到源码的编译器）。此外它还拥有众多模块可用于不同形式的静态分析。

静态分析：代码没有执行是对代码进行分析和处理，一般静态分析可以用于语法检查，编译，代码高亮，代码转换，优化，压缩等等场景。

## 抽象语法树

在[计算机科学](https://zh.wikipedia.org/wiki/计算机科学)中，**抽象语法树**（**A**bstract **S**yntax **T**ree，AST），或简称**语法树**（Syntax tree），是[源代码](https://zh.wikipedia.org/wiki/源代码)[语法](https://zh.wikipedia.org/wiki/语法学)结构的一种抽象表示。它以[树状](https://zh.wikipedia.org/wiki/树_(图论))的形式表现[编程语言](https://zh.wikipedia.org/wiki/编程语言)的语法结构，树上的每个节点都表示源代码中的一种结构。—— 维基百科

和抽象语法树相对的是具体语法树（通常称作[分析树](https://zh.wikipedia.org/wiki/分析树)）。一般的，在源代码的翻译和[编译](https://zh.wikipedia.org/wiki/编译)过程中，[语法分析器](https://zh.wikipedia.org/wiki/語法分析器)创建出分析树，然后从分析树生成AST。

![AST](/抽象语法树.png)

转为JS对象

```js
{
    type: 'Program', // 一个程序
    "start": 0, // 开始位置
    "end": 17, // 结束位置
    "body": [ // 节点内容
        {
            type: 'VariableDeclaration', // 类型：变量声明
            "declarations": [ // 声明内容
                {
                    type: 'VariableDeclarator', // 类型：变量声明器
                    "id": { // 变量声明标识
                        type: 'Identifier', // 类型：标识符
                        name: 'name' // 具体变量名
                    },
                    "init": { // 初始化
                        type: 'Literal', // 类型：字面量
                        value: 'kobe', // 初始值
                        raw: ''kobe'' // 未处理的原始值
                    }
                }
            ],
            kind: 'let' // 类型
        }
    ],
    sourceType: 'module' // 源类型
}
```



Babel 还为每个节点额外生成了一些属性，用于描述该节点在原始代码中的位置。

```JS
{
  "type": "Program",
  "start": 0,
  "end": 17,
  "body": [
    {
      "start": 0,
      "end": 17,
      "declarations": [
        {
          "start": 4,
          "end": 17,
          "id": {
            "start": 4,
            "end": 8
          },
     ....
```



## Babel处理过程

Babel 的三个主要处理步骤分别是： **解析（parse）**，**转换（transform）**，**生成（generate）**。源码结果转换生成新的源码【表情包：狗头】。

### parse

接收源码生成AST的过程：包括**词法分析**和**语法分析**

**词法分析**

词法分析阶段把字符串形式的代码转换为  **token流**。

例如：

```json
let name = 'kobe'
```

```json
[
  { "type": {...}, "value": "let" },
  { "type": {...}, "value": "name" },
  { "type": {...}, "value": "=" },
  { "type": {...}, "value": "'kobe'" },
  { "type": {...}, "value": ";" }
]
```

每一个 `type` 有一组属性来描述该令牌：

```js
{
  type: {
    label: 'name',
    keyword: undefined,
    beforeExpr: false,
    startsExpr: true,
    rightAssociative: false,
    isLoop: false,
    isAssign: false,
    prefix: false,
    postfix: false,
    binop: null,
    updateContext: null
  },
  ...
}
```



**语法分析**

语法分析阶段会把一个token流转换成 AST 的形式。 这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。

### transform

转换过程需要对生成的 AST 进行深度优先遍历，在此过程中对节点进行添加、更新及移除等操作。 **这是 Babel 或是其他编译器中最复杂的过程 同时也是插件将要介入工作的部分**。

### generate

代码生成，将转换后 AST 转换成字符串形式的代码，同时还会创建源码映射 sourceMap

步骤：dfs整个ast构建字符串形式的code。



## Visitors

遍历到某个节点是其实就是访问到了该节点，访问者是一个用于 AST 遍历的跨语言的模式。其实就是一个访问器，访问器里面包含了一些方法，这些方法用于获取 AST 中具体的节点。

```js
const MyVisitor = {
  Identifier() {
    console.log("I met you Identifier!");
  }
};

// 可以先创建一个访问者对象，并在稍后给它添加方法。
let visitor = {};
visitor.MemberExpression = function() {}; // 在访问器中定义获取AST节点的方法
visitor.FunctionDeclaration = function() {}
```

遍历AST时，每当在树中遇见一个 `Identifier` 节点的时候会调用 `Identifier()` 方法。

**调用时机**

调用都发生在**进入**节点时，不过有时候我们也可以在**退出**时调用访问者方法。

当我们向下遍历这颗树的每一个分支时我们最终会走到尽头，于是我们需要往上遍历回去从而获取到下一个节点。 向下遍历这棵树我们**进入**每个节点，向上遍历回去时我们**退出**每个节点。例如：遍历AST，访问到**Identifier**节点进入**Identifier**节点继续遍历，遍历接收退出**Identifier**节点。

所以创建访问者时其实是有两次机会来访问一个节点的，可以这样定义访问器的方法来在合适的时机出发函数

```js
const MyVisitor = {
  Identifier: {
    enter() {
      console.log("I met you when I came in!");
    },
    exit() {
      console.log("I met you when I quit!");
    }
  }
};
```



**单个函数访问多节点**

```js
const MyVisitor = {
  "Identifier | MemberExpression"() {
    console.log("I met you Identifier!");
  }
};

let visitor = {};
visitor.MemberExpression = function() {}; 
visitor.FunctionDeclaration = function() {}
```



## 路径

AST 通常会有许多节点，那么节点直接如何相互关联呢？ **Path** 是表示两个节点之间连接的对象。每个节点都会有自己的路径对象，包含节点的上下文信息，包含当前节点的父、子、兄弟节点的信息以及添加、更新、移动、删除节点的相关方法。

```js
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  ...
}

// Identifier的路径对象
{
  "parent": {
    "type": "FunctionDeclaration",
    "id": {...},
    ....
  },
  "node": {
    "type": "Identifier",
    "name": "square"
  }
}
```

包括但不完全一下属性和方法

- node：当前节点信息
- parent：：父节点
- parentPath：父节点路径
- scope：当前节点作用域
- context：：当前节点上下文信息

- get：获取当前节点
- findParent：向父节点搜寻节点
- getSibling：获取兄弟节点
- replaceWith：替换节点
- insertBefore：在该节点前插入
- insertAfter：在该节点后插入
- remove：删除节点



节点和节点路径对象是映射关系，节点被修改后路径对象也会实时更新。 Babel 帮你管理这一切，从而使得节点操作简单，尽可能做到无状态。

当你有一个 `Identifier()` 成员方法的访问者时，你实际上是在访问路径而非节点。 通过这种方式，你操作的就是节点的响应式表示而非节点本身。

```js
const MyVisitor = {
  Identifier(path) {
    console.log("Visiting: " + path.node.name);
  }
};
```



## State

state时访问器方法中传入的第二个参数，包含当前的plugin信息和一些节点状态信息。

```js
module.exports = function(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      Identifier(path, state) {
        // 获取插件信息
        const pluginName = state.file.opts.filename; // 获取文件名作为插件信息的一部分
        const pluginVersion = '1.0.0'; // 假设插件版本是固定的

        console.log(`Plugin Name: ${pluginName}`);
        console.log(`Plugin Version: ${pluginVersion}`);

        // 可以进一步处理 Identifier 节点
      }
    }
  };
};
```



## Scopes

在 Babel 中进行代码转换时，特别是涉及到作用域的处理，是一个非常重要且复杂的问题。Babel 的转换过程涉及到遍历和修改 JavaScript 代码的抽象语法树（AST），因此正确处理作用域对于确保代码转换的准确性和一致性至关重要。

Babel 需要确保在修改代码时不会破坏词法作用域的规则，例如变量声明var/const/let作用域问题、函数作用域、箭头函数作用域查找规则等。

Babel 使用 `@babel/traverse` 模块来遍历 AST，并通过作用域管理器 `Scope` 来处理作用域相关的问题。

```js
{
  path: path,
  block: path.node,
  parentBlock: path.parent,
  parent: parentScope,
  bindings: [...]
}
```

当创建一个新的作用域时，需要给出它的路径和父作用域，之后在遍历过程中它会在该作用域内收集所有的引用(“绑定”)，一旦引用收集完毕，你就可以在作用域（Scopes）上使用各种方法。

绑定：就是收集该各个作用域内的声明的变量和函数。



