# webpack-loader


## 简介

loader 用于对模块的源代码进行转换。loader 可以使你在 `import` 或 "load(加载)" 模块时预处理文件。

## 示例

例如，你可以使用 loader 告诉 webpack 加载 CSS 文件，或者将 TypeScript 转为 JavaScript。为此，首先安装相对应的 loader

```js
npm install --save-dev css-loader ts-loader
```

然后指示 webpack 对每个 `.css` 使用 `css-loader`，以及对所有 `.ts` 文件使用 `ts-loader`。

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' },
      { test: /\.ts$/, use: 'ts-loader' },
    ],
  },
};
```



## 使用方式

在你的应用程序中，有两种使用 loader 的方式：

- [配置方式](https://webpack.docschina.org/concepts/loaders/#configuration)（推荐）：在 **webpack.config.js** 文件中指定 loader。
- [内联方式](https://webpack.docschina.org/concepts/loaders/#inline)：在每个 `import` 语句中显式指定 loader。

**配置方式**：`module.rules` 允许你在 webpack 配置中指定多个 loader。 这种方式是展示 loader 的一种简明方式，并且有助于使代码变得简洁和易于维护。loader 从右到左（或从下到上）执行。

**内联方式**：可以在 `import` 语句中指定 loader。使用 `!` 将资源中的 loader 分开。每个部分都会相对于当前目录解析。通过为内联 `import` 语句添加前缀，可以覆盖 [配置](https://webpack.docschina.org/configuration) 中的所有 loader。

```js
import Styles from 'style-loader!css-loader?modules!./styles.css';
```



## 特性

- loader 支持链式调用。链中的第一个 loader 将其结果（也就是应用过转换后的资源）传递给下一个 loader，依此类推。

- loader 可以是同步的，也可以是异步的。
- loader 运行在 Node.js 中，并且能够执行任何操作。
- loader 可以通过 `options` 对象配置

