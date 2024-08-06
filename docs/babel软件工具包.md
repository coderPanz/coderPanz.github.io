# babel软件工具包

## babel/parser

babel/parse 是 Babel 的解析器。babel/parse负责将 JavaScript 代码解析为抽象语法树（AST），这是 Babel 进行代码转换和分析的基础。

Babylon 和 @babel/parser 的关系：Babylon 的功能被整合到 @babel/parser 中，成为了 Babel 默认的 JavaScript 解析器。

```js
const parser = require("@babel/parser")

const code = `
function square(n) {
    return n * n;
}
`

// 使用 @babel/parser 解析代码，生成 AST
const ast = parser.parse(code, {
  sourceType: "module", // 指定源码类型为模块
  plugins: ["jsx"], // 可选的插件，用于支持特定的语法，比如 JSX
})

console.log(ast)
```



## babel/core

`@babel/core` 是 Babel 工具链中的核心模块，它负责管理整个编译过程，包括将代码解析成 AST、应用插件进行转换、生成目标代码等任务。

```js
var babel = require("@babel/core")

const name = 'kobe'
babel.transform(name, {}, function (err, result) {
  console.log(result)
  console.log(result.code)
  console.log(result.map)
  console.log(result.ast)
})
```



## babel-traverse

babel-traverse模块维护了整棵树的状态，负责遍历、替换、移除和添加AST节点。

- 遍历：dfs
- 访问与操作：CURD
- path对象：在遍历过程中，每个节点都包装在一个 `Path` 对象中，该对象提供了对节点的直接访问和操作。`Path` 对象不仅提供了节点本身的信息，还包含了关于节点在 AST 中位置、父节点、兄弟节点等上下文信息。

```js
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const code = `
function square(n) {
  return n * n;
}
`;

const ast = babel.parseSync(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

traverse(ast, {
  FunctionDeclaration(path) {
    // 遍历到函数声明节点
    const params = path.node.params;
    const body = path.node.body;

    // 在函数体前插入一条语句
    body.body.unshift(t.expressionStatement(
      t.stringLiteral('Hello from the beginning!')
    ));
  }
});

const { code: modifiedCode } = babel.transformFromAstSync(ast, code, {
  presets: ['@babel/preset-env']
});

console.log(modifiedCode);
```



## babel-generator

`babel-generator` 是 Babel 编译器的一个核心模块，用于将抽象语法树（Abstract Syntax Tree，AST）转换回 JavaScript 代码。

处理过程：

- 将经过处理的 AST 节点序列化为 JavaScript 代码字符串。
- 保留原始代码的格式（如缩进、空格等），使输出的代码在结构上与原始代码尽可能保持一致。

```js
const generator = require("@babel/generator")
const parse = require("@babel/parser")

const code = "class Example {}"
const ast = parse.parse(code)

const output = generator.default(
  ast,
  {
    /* options */
  },
  code
)

console.log(output.code) // 'class Example {}'
```



## babel/runtime

在使用新的语法和API都需要在对应的文件中重复引入helper和polyfill导致代码臃肿和项目体积变大，为了解决这个问题babel提供了一个运行时导入的概念。

它包含了一些帮助 Babel 转换后的代码能够正常运行所需的辅助函数和 polyfill，提供了以一个运行时统一导入以避免代码冗余并减小每个文件的大小。

通过安装 `babel-plugin-transform-runtime` 和 `babel-runtime` 来开始。

```js
import _classCallCheck from "babel-runtime/helpers/classCallCheck"; // 统一导入
import _createClass from "babel-runtime/helpers/createClass";

let Foo = function () {
  function Foo() {
    _classCallCheck(this, Foo);
  }

  _createClass(Foo, [{
    key: "method",
    value: function method() {}
  }]);

  return Foo;
}();
```



## babel-types

`@babel/types` 模块是一个用于创建、操作和检查 AST 节点类型的工具库。

- **AST 节点的创建**: 提供多种函数来创建各种类型的 AST 节点，如函数声明、变量声明、表达式等。这些函数通常以 `t.<NodeType>` 的形式来命名，例如 `t.identifier`、`t.functionDeclaration`、`t.assignmentExpression` 。

- **AST 节点的验证与判断**: 提供一些函数来检查 AST 节点的类型，如 `t.isIdentifier(node)`、`t.isFunctionDeclaration(node)` 等。这些函数帮助插件或工具在处理 AST 时可以准确地判断节点的类型。

- **AST 节点的修改与更新**: 提供一些函数和方法来修改和更新现有的 AST 节点，例如 `t.cloneNode(node)` 用于克隆节点、`t.isolateModuleVisitor(visitor)` 用于分离模块访问者等。

- **AST 节点的比较与操作**: 提供一些方法来比较和操作 AST 节点，如 `t.isNodesEquivalent(node1, node2)` 用于比较两个节点是否等效、`t.removeComments(node)` 用于移除节点中的注释。

```js
const t = require('@babel/types');

// 创建一个变量声明节点
const variableDeclaration = t.variableDeclaration('const', [
  t.variableDeclarator(
    t.identifier('myVar'), // 变量名节点
    t.numericLiteral(123)  // 变量值节点
  )
]);

// 判断节点类型
console.log(t.isVariableDeclaration(variableDeclaration)); // true

// 克隆节点
const clonedNode = t.cloneNode(variableDeclaration);

// 修改节点属性
clonedNode.kind = 'let'; // 修改为 let 声明

// 生成修改后的代码
const { code } = require('@babel/generator').default(clonedNode);
console.log(code); // 输出 let myVar = 123;
```



## Builders（构建器）

Builders 是一组用于创建 AST 节点的辅助函数集合。通过 Builders我们可以以编程的方式去创建AST

- **`identifier(name: string)`**: 创建一个标识符节点。
- **`functionDeclaration(id, params, body, generator, async)`**: 创建一个函数声明节点。
- **`returnStatement(argument)`**: 创建一个返回语句节点。
- **`binaryExpression(operator, left, right)`**: 创建一个二元表达式节点。

```js
const { identifier, blockStatement, functionDeclaration, returnTypeAnnotation, param } = require('@babel/types');

// 使用 Builders 创建一个函数声明的 AST 节点
const myFunction = functionDeclaration(
  identifier('myFunction'), // 函数名
  [param(identifier('param1')), param(identifier('param2'))], // 参数列表
  blockStatement([
    // 函数体
    returnStatement(
      binaryExpression('*', identifier('param1'), identifier('param2'))
    )
  ]),
  false, // 是否是生成器函数（Generator function）
  false, // 是否是异步函数（Async function）
);

console.log(myFunction);
```

构造器还会验证自身创建的节点，并在错误使用的情形下会抛出描述性错误



## Validators（验证器）

Validators 是用于验证和确保 AST 节点结构正确性的工具函数集合，在操作 AST 节点之前，确保节点的各种属性值符合预期的格式和类型。

- **`assertFunctionDeclaration(node)`**: 验证是否为函数声明节点。
- **`assertVariableDeclaration(node)`**: 验证是否为变量声明节点。
- **`assertIdentifier(node)`**: 验证是否为标识符节点。
- **`assertBlockStatement(node)`**: 验证是否为块语句节点等。

```js
const { assertFunctionDeclaration } = require('@babel/types');

const myFunction = {
  type: 'FunctionDeclaration',
  id: {
    type: 'Identifier',
    name: 'myFunction'
  },
  params: [],
  body: {
    type: 'BlockStatement',
    body: []
  },
  generator: false,
  async: false
};

assertFunctionDeclaration(myFunction);
console.log('Function declaration is valid.');
```
