# webpack介绍

## 简介

Webpack是一个现代的静态模块打包工具。它主要用于将多个模块（包括 JavaScript、CSS、图片等）打包成一个或多个静态资源文件，以便在浏览器中加载。Webpack的核心功能是**模块打包**和**依赖管理**。它可以识别模块之间的依赖关系，并按照指定的配置将它们打包成可执行的静态资源。

## webpack.config.js文件

### **entry**

打包入口文件，指示webpack使用指定的模块来作为构建依赖图的开始。

```js
module.exports = {
  entry: './path/to/my/entry/file.js',
};
```

### **output**

告诉webpack将打包后的文件存放到指定的位置。以及指定打包文件的名字。也可以不指定进而使用默认值

```js
const path = require('path');

module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js',
  },
};
```

### **loader**

webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。**loader** 让 webpack 能够去处理其他类型的文件，以供应用程序使用，以及被添加到依赖图中。

在 webpack 的配置中，**loader** 有两个属性：

1. `test` 属性，识别出哪些文件会被转换。
2. `use` 属性，定义出在进行转换时，应该使用哪个 loader。

在module对象中定义了rules属性，里面包含两个必须属性：`test` 和 `use`。这告诉 webpack 编译器(compiler)：当遇见.txt文件时使用raw-loader进行转换。

```js
const path = require('path');

module.exports = {
  output: {
    filename: 'my-first-webpack.bundle.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
```



### plugin

loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。

想要使用一个插件，你只需要 `require()` 它，然后把它添加到 `plugins` 数组中。多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 `new` 操作符来创建一个插件实例。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // 用于访问内置插件

module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
```



### mode

通过选择 `development`, `production` 或 `none` 之中的一个，来设置 `mode` 参数以启用 webpack 内置在相应环境下的优化。，其默认值为 `production`。

```js
module.exports = {
  mode: 'production',
};
```

