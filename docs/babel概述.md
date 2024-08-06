# babel概述


what is babel？Babel 是一个工具链，主要用于将采用 ES6+ 语法编写的代码转换为向后兼容的语法，以便能够运行在当前和旧版本的浏览器或其他环境中——[babel官网](https://babeljs.io/docs/)。

### babel的功能

- 语法转换：例如箭头函数转化为普通函数
- 通过 Polyfill 方式在目标环境中添加缺失的功能
- API转换：array.includes()方法、Object.values()等

关于typescript的转换问题：浏览器是不认识ts代码的所以需要将ts进行一些删除类型注解/类型声明的工作转化为js，需要注意的是babel不做类型检测工作，需要安装ts相关类型检测插件。

- 插件化：babel提供语法转化和源码转化的基础能力，但是其本身不会提供众多插件，所以需要开发者基于babel的代码转译能力去编写具有转换代码的工具函数，这个工具函数我们称为插件。

- 可调式：**babel** 支持 `sourceMap`（源码映射），编译后的代码和源码具有映射关系可以直观的了解代码转译后的效果，方便调试。

- 配置文件：babel的配置文件在项目的根目录中，旧版的文件名为：`babel.config.js` ，新版文件名为：`babel.config.json` ，配置文件是配置babel api，babel编译时就是根据配置文件进行编译工作的。

- 预设：预先设定的插件组合，可进行完整的转译链路。



### 语法转译

babel 对 js 进行语法转译时会用到辅助函数转译。例如class语法转译需要使用 `_classCallCheck`  辅助函数，我们把这些辅助函数叫helper。在编译后是引入了 `_classCallCheck`  辅助函数对class处理是的class能够转为普通的构造函数。

```js
function _classCallCheck(a, n) { if (!_instanceof(a, n)) throw new TypeError("Cannot call a class as a function"); }
```

![class转译](/babel.png)



**问题**

在项目中可能会有多个文件涉及到到class，那么转译后每个定义了class的文件都会引入`_classCallCheck`的话就会比较重复，增加代码体积，最后的方法就是复用`_classCallCheck`，多个class转译复用一个`_classCallCheck`，项目中只需要提供一个helper函数即可，大大优化了项目体积和打包速度。

### Polyfill

🚨 从 Babel 7.4.0 版本开始，这个软件包已经不建议使用了，建议直接包含 `core-js/stable` （用于模拟 ECMAScript 的功能）

需要将其放在应用程序**入口点**的顶部，确保在使用新语法API前加载能够使用ES6+的运行时环境。

Polyfill 是用来为旧浏览器提供它没有原生支持的新功能。例如：旧版浏览器不支持 `array.includes` 方法，babel可以用`polyfill`实现一个`includes`方法

```js
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var o = Object(this);
    var len = o.length >>> 0;
    if (len === 0) {
      return false;
    }
    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    function sameValueZero(x, y) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    while (k < len) {
      if (sameValueZero(o[k], searchElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// 使用 polyfill 后的 includes 方法示例
var array = [1, 2, 3];

console.log(array.includes(2)); // true
console.log(array.includes(4)); // false
```



**@babel/polyfill**模块包含 `core-js` 和 `regenerator runtime` 来模拟完整的 ES2015+ 环境。这意味这我们可以使用ES6及其往后的一些功能和语法，polyfill看作一个整体，使用babel-polyfill后会将所有的方法添加到原型链上（导致打包体积巨大），但是我们项目中并不是需要使用的所有的新特性或者新的API（可能只用到一两个），因此将**polyfill**添加到全局环境会增加项目负担，打包臃肿。

**polyfill机制**：对于没有支持的新api直接在对于的全局变量和原型上添加，例如检测到不支持 Object.assign，polyfill会直接在**Object**上添加 `assign` 方法的补丁(用js模拟assign的机制)，但同时也会加上Array.from方法等等。如果是`array.includes` 这种实例方法的话直接在原型上添加（同时会在所有原型上添加它们对应的方法）。直接修改了全局变量的原型，有可能会带来意想不到的问题，这也是官方不提倡的方法。

**例如**：引入的a包和b包同时修改了数据类型中的原型。



### @babel/plugin-transform-runtime 

`@babel/plugin-transform-runtime` 插件是用来解决polyfill机制直接修改全局变量、全局变量原型，helper辅助函数重复定义的问题。该插件通过引入一个运行时来解决，**helper**和**polyfill补丁**进行统一和按需引入**polyfill**解决了变量不然和重复定义**helper**的问题。

### 总结

利用 `@babel/polyfill` 来模拟所有新的 JavaScript 功能，而 `env` preset 只对我们所使用的并且目标浏览器中缺失的功能进行代码转换和加载 **polyfill**。



### 配置

```json
// 数组
{
  "plugins": ["babel-plugin-myPlugin", "@babel/plugin-transform-runtime"]
}
{
  "presets": ["babel-preset-myPreset", "@babel/preset-env"]
}

// 路径
{
  "plugins": ["./node_modules/asdf/plugin"]
}
{
  "presets": ["./myProject/myPreset"]
}
```



### 执行顺序

- 插件在 Presets （预设）前运行。
- 插件执行顺序：从前往后。
- Preset（预设）执行顺序从后往前。

```json
// 先执行 transform-decorators-legacy ，在执行 transform-class-properties。
{
  "plugins": ["transform-decorators-legacy", "transform-class-properties"]
}

// 将按如下顺序执行： 首先是 @babel/preset-react，然后是 @babel/preset-env。
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```



### 参数

插件 和 预设 都可以接受参数，参数由**插件名**和**参数对象**组成一个数组，可以在配置文件中设置。

```json
// 无参数写法
{
  "plugins": ["pluginA"],
  "plugins": [["pluginA"]],
  "plugins": [["pluginA", {}]],
}

{
  "plugins": [
    [
      "transform-async-to-module-method",
      // 插件参数
      {
        "module": "bluebird",
        "method": "coroutine"
      }
    ]
  ]
}


// 无参数写法
{
  "presets": ["presetA"]
  "presets": [["presetA"]]
  "presets": [["presetA", {}]]
}

{
  "presets": [
    [
      "env",
      // 预设参数
      {
        "loose": true,
        "modules": false
      }
    ]
  ]
}
```



### 插件

**转译插件**

这些插件用于转换你的代码，代码string——AST——newCodeString。

**语法插件**

大多数语法都可以由 Babel 转换，是的babel能够解析更多的语法，例如函数调用最后一个参数能不能加逗号`foo(a,b,)`babel结果静态分析时时就会提示语法报错，但最新的js提案已经允许这种新的写法了。所以我们可以通过添加对应的语法插件来解决。

**注意**：转换插件/语法插件将启用相应的语法插件/转译插件，因此你不必同时指定这两种插件。

[babel插件开发](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

babel官网小案例：一个简单的用于反转名称顺序的插件

```js
export default function() {
  return {
    visitor: {
      Identifier(path) {
        const name = path.node.name;
        // reverse the name: JavaScript -> tpircSavaJ
        path.node.name = name
          .split("")
          .reverse()
          .join("");
      },
    },
  };
}
```



### 预设

Babel 的预设（preset）可以被看作是一组 Babel 插件

官方预设：针对开发常用环境编写了一些预设

- [@babel/preset-env](https://www.babeljs.cn/docs/babel-preset-env)用于编译 ES2015+ 语法
- [@babel/preset-typescript](https://www.babeljs.cn/docs/babel-preset-typescript)用于[TypeScript](https://www.typescriptlang.org/)
- [@babel/preset-react](https://www.babeljs.cn/docs/babel-preset-react)用于[React](https://reactjs.org/)
- [@babel/preset-flow](https://www.babeljs.cn/docs/babel-preset-flow)用于[Flow](https://flow.org/)

配置：和插件配置方法一样，数组或者路径(相对或者绝对)。

创建预设：如需创建一个自己的预设（无论是为了本地使用还是发布到 npm），需要导出（export）一个配置对象。

返回一个插件数组：

```json
module.exports = function() {
  return {
    plugins: ["pluginA", "pluginB", "pluginC"],
  };
};
```