<!--
 * @Author: qs
 * @Date: 2025-03-06 19:13:56
 * @LastEditTime: 2025-03-06 19:24:19
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/Rspack.md
 *
-->

# Rspack：字节跳动的高性能前端打包工具

作为一名程序员，我最近发现了一个非常有趣的工具——Rspack。它是字节跳动推出的高性能前端打包工具，旨在解决大型前端应用的构建性能瓶颈。今天，我就来和大家分享一下 Rspack 的特点和使用体验。
![rspack](/rspack.png)

### Rspack 的背景

在前端开发中，构建工具对于开发效率和性能优化起着至关重要的作用。Webpack 一直是业界的佼佼者，但随着项目规模的不断扩大，Webpack 的构建速度逐渐成为瓶颈。为了解决这个问题，字节跳动推出了 Rspack，它基于 Rust 语言开发，提供了比 Webpack 更快的构建速度和更好的性能优化。

### Rspack 的特点

1. **启动速度极快**：基于 Rust 实现，Rspack 提供快速的项目启动，让你能够更快地进入开发状态。
2. **闪电般的 HMR**：热模块替换（HMR）速度快，特别适合大型项目开发，能够显著提升开发效率。
3. **兼容 Webpack 生态**：Rspack 支持大多数 Webpack loader 和插件，无缝迁移现有项目，降低了学习和迁移成本。
4. **内置常见构建能力**：Rspack 默认支持 TypeScript、JSX、CSS、CSS Modules、Sass 等，满足了大多数项目的开发需求。
5. **默认生产优化**：内置多种优化策略，如 Tree Shaking、代码压缩等，让你的项目在生产环境中表现出色。
6. **框架无关**：Rspack 不绑定特定前端框架，保持灵活性，适用于各种前端技术栈。

### Rspack 的生态系统

Rspack 不仅仅是一个打包工具，它还拥有丰富的生态系统，包括 Rsbuild、Rspress、Rsdoctor 和 Rslib 等工具，形成了一个完整的高性能工具栈。这些工具分别面向不同的使用场景，为开发者提供了更多的选择和便利。

### 快速上手 Rspack

使用 Rspack 非常简单，你可以通过以下命令快速创建一个新项目：

```bash
npm create rsbuild@latest
```

或者使用 Rspack CLI：

```bash
npm create rspack@latest
```

然后按照提示操作即可。你也可以通过在线示例来体验 Rspack 的构建性能和开发体验，比如 Rsbuild CodeSandbox 示例。

### 从现有项目迁移

如果你已经有一个现有项目，并希望迁移到 Rspack，可以参考官方提供的迁移指南。Rspack 与 Webpack 的兼容性使得迁移过程非常顺畅，你可以在不改变现有项目结构的情况下，享受到 Rspack 的性能优势。

### 我的使用体验

我尝试将一个中型项目从 Webpack 迁移到 Rspack，整个过程非常顺利。Rspack 的配置方式与 Webpack 非常相似，但配置文件更加简洁，易于理解。在构建速度方面，Rspack 确实表现出色，项目的启动和构建时间都大幅缩短，尤其是在开发环境中，HMR 的速度让我印象深刻，极大地提升了开发效率。

### 如何迁移现有项目到 Rspack？
## 如何迁移现有项目到 Rspack？

将现有项目迁移到 Rspack 可以显著提升构建性能和开发效率。以下是详细的迁移步骤和注意事项：

### 1. 环境准备

确保你的项目环境满足以下要求：

- Node.js >= 16 版本，推荐使用 Node.js LTS 版本。
- 安装 Rust 编程语言，因为 Rspack 是基于 Rust 开发的。

### 2. 安装 Rspack 依赖

首先，移除项目中与 Webpack 相关的依赖：

```bash
npm remove webpack webpack-cli webpack-dev-server
```

然后，安装 Rspack 的相关依赖：

```bash
npm add @rspack/core @rspack/cli -D
```

### 3. 更新 `package.json` 脚本

更新 `package.json` 中的构建脚本，使用 Rspack 代替 Webpack：

```json
{
  "scripts": {
    "serve": "rspack serve -c rspack.config.js",
    "build": "rspack build -c rspack.config.js"
  }
}
```

### 4. 配置文件迁移

将 `webpack.config.js` 文件重命名为 `rspack.config.js`。Rspack 的配置文件格式与 Webpack 类似，但有一些差异。以下是一些常见的配置项迁移示例：

#### 4.1 修改配置文件

假设你的 `webpack.config.js` 文件内容如下：

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
```

迁移到 `rspack.config.js` 后的内容如下：

```javascript
const path = require('path');
const { rspack } = require('@rspack/core');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'builtin:swc-loader'
      },
      {
        test: /\.css$/,
        type: 'css'
      }
    ]
  },
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
```

### 5. 迁移 Loader 和插件

#### 5.1 Loader 迁移

Rspack 支持绝大多数 Webpack loader，但为了获得最佳性能，建议进行以下迁移：

- **babel-loader / swc-loader → builtin:swc-loader**

  ```javascript
  module.exports = {
    module: {
      rules: [
        {
          test: /\.(j|t)s$/,
          exclude: [/[\\/]node_modules[\\/]/],
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              externalHelpers: true,
              transform: {
                react: {
                  runtime: 'automatic',
                  development: !prod,
                  refresh: !prod,
                },
              },
            },
            env: {
              targets: 'Chrome >= 48',
            },
          },
        },
        {
          test: /\.(j|t)sx$/,
          loader: 'builtin:swc-loader',
          exclude: [/[\\/]node_modules[\\/]/],
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: !prod,
                  refresh: !prod,
                },
              },
              externalHelpers: true,
            },
            env: {
              targets: 'Chrome >= 48', // browser compatibility
            },
          },
        },
      ],
    },
  };
  ```

- **file-loader / url-loader / raw-loader → 资源模块**

  ```javascript
  module.exports = {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/inline",
        },
        {
          test: /^BUILD_ID$/,
          type: "asset/source",
        },
      ],
    },
  };
  ```

#### 5.2 插件迁移

Rspack 实现了大部分 Webpack 内置插件，其命名和参数配置与 Webpack 保持一致。例如：

```javascript
const { rspack } = require('@rspack/core');

module.exports = {
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new rspack.HtmlPlugin({
      template: 'index.html'
    })
  ]
};
```

### 6. 迁移 Vue CLI 项目

如果你的项目是基于 Vue CLI 的，可以参考以下步骤进行迁移：

1. **安装依赖**

   ```bash
   npm remove @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint core-js
   npm add @rsbuild/core @rsbuild/plugin-vue -D
   ```

2. **创建 `rsbuild.config.ts` 文件**

   ```typescript
   import { defineConfig, loadEnv } from '@rsbuild/core';
   import { pluginVue2 } from '@rsbuild/plugin-vue2';
   import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
   import { pluginSass } from '@rsbuild/plugin-sass';

   export default defineConfig({
     plugins: [
       pluginVue2(),
       pluginNodePolyfill(),
       pluginSass({
         sassLoaderOptions: {
           additionalData: (content, loaderContext) => {
             const { resourcePath } = loaderContext;
             if (resourcePath.includes('_mixin.scss') || resourcePath.includes('wukong.scss')) return "";
             return `
               @import '@/assets/styles/common/_mixin.scss';
               @import '@/assets/styles/common/wukong.scss';
               ${content}
             `;
           },
           implementation: require.resolve('sass'),
         },
       }),
     ],
     dev: {
       assetPrefix: '/',
       progressBar: true
     },
     output: {
       assetPrefix: '/',
       injectStyles: true,
       minify: true,
       sourceMap: {
         js: false,
         css: false
       }
     },
     server: {
       port: 9100,
       headers: {
         'Access-Control-Allow-Origin': '*'
       },
       proxy: (() => {
         // if (!proxy) return
         // const entries = Object.keys(proxy).map(key => {
         //   const value = {
         //     changeOrigin: true,
         //     pathRewrite: { [`^${key}`]: '' },
         //     target: proxy[key]
         //   }
         //   return [key, value]
         // })
         // return Object.fromEntries(entries)
       })()
     },
     source: {
       define: {
         ...appenv,
         'process.env': {
           ...appenv.parsed,
         }
       },
       entry: {
         index: './src/main.js'
       },
       alias: {
         '@': './src',
         '@views': './src/views',
         '@api': './src/api',
         '@utils': './src/utils',
         '@styles': './src/styles',
       },
     },
     html: {
       template: './public/index.html',
       inject: 'body',
       templateParameters: {
         cdn: assetsCDN,
         title: name,
       }
     },
     tools: {
       htmlPlugin: true,
       rspack: (config) => {
         config.mode = appenv.parsed.VUE_APP_ENV === 'development' ? 'development' : 'production';
         config.externals = {
           ...config.externals,
           ...allExternals
         };
         config.module.rules[4].exclude = /[\\/]src[\\/]icons[\\/]/;
         config.module.rules.push({
           test: /\.svg$/i,
           include: /[\\/]src[\\/]icons[\\/]/,
           use: [{
             loader: require.resolve("./svg-loader"),
             options: { symbolId: "icon-[name]" }
           }, "svgo-loader"]
         });
         return config;
       },
       styleLoader: {
         insert: 'head',
       },
       sass: {
         sourceMap: true,
       },
     },
   });
   ```

### 7. 迁移 Create React App 项目

如果你的项目是基于 Create React App 的，可以参考以下步骤进行迁移：

1. **安装依赖**

   ```bash
   npm remove @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint core-js
   npm add @rsbuild/core @rsbuild/plugin-react -D
   ```

2. **创建 `rsbuild.config.ts` 文件**

   ```typescript
   import { defineConfig, loadEnv } from '@rsbuild/core';
   import { pluginReact } from '@rsbuild/plugin-react';

   export default defineConfig({
     plugins: [
       pluginReact(),
     ],
     dev: {
       assetPrefix: '/',
       progressBar: true
     },
     output: {
       assetPrefix: '/',
       injectStyles: true,
       minify: true,
       sourceMap: {
         js: false,
         css: false
       }
     },
     server: {
       port: 9100,
       headers: {
         'Access-Control-Allow-Origin': '*'
       }
     },
     source: {
       define: {
         ...appenv,
         'process.env': {
           ...appenv.parsed,
         }
       },
       entry: {
         index: './src/index.js'
       },
       alias: {
         '@': './src',
       },
     },
     html: {
       template: './public/index.html',
       inject: 'body',
       templateParameters: {
         title: name,
       }
     },
   });
   ```

### 8. 迁移 Vite 项目

如果你的项目是基于 Vite 的，可以参考以下步骤进行迁移：

1. **安装依赖**

   ```bash
   npm remove vite
   npm add @rspack/core @rspack/cli -D
   ```

2. **创建 `rspack.config.js` 文件**

   ```javascript
   const { rspack } = require('@rspack/core');

   module.exports = {
     entry: './src/index.js',
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: 'bundle.js'
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           loader: 'builtin:swc-loader'
         },
         {
           test: /\.css$/,
           type: 'css'
         }
       ]
     },
     plugins: [
       new rspack.DefinePlugin({
         'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
       })
     ]
   };
   ```

### 9. 迁移 Storybook 项目

如果你的项目是基于 Storybook 的，可以参考以下步骤进行迁移：

1. **安装依赖**

   ```bash
   npm add @rspack/core @rspack/cli -D
   ```

2. **创建 `rspack.config.js` 文件**

   ```javascript
   const { rspack } = require('@rspack/core');

   module.exports = {
     entry: './src/index.js',
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: 'bundle.js'
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           loader: 'builtin:swc-loader'
         },
         {
           test: /\.css$/,
           type: 'css'
         }
       ]
     },
     plugins: [
       new rspack.DefinePlugin({
         'process.env NODE_ENV': JSON.stringify(process.env.NODE_ENV)
       })
     ]
   };
   ```

### 10. 迁移 Nuxt 项目

如果你的项目是基于 Nuxt 的，可以参考以下步骤进行迁移：

1. **安装依赖**

   ```bash
   npm add @rspack/core @rspack/cli -D
   ```

2. **创建 `rspack.config.js` 文件**

   ```javascript
   const { rspack } = require('@rspack/core');

   module.exports = {
     entry: './src/index.js',
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: 'bundle.js'
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           loader: 'builtin:swc-loader'
         },
         {
           test: /\.css$/,
           type: 'css'
         }
       ]
     },
     plugins: [
       new rspack.DefinePlugin({
         'process.env NODE_ENV': JSON.stringify(process.env.NODE_ENV)
       })
     ]
   };
   ```

### 11. 迁移注意事项

- **Node.js 版本**：Rspack 支持的 Node.js 版本为 >= 16，如果你还在使用旧版本的 Node.js，请先升级版本。
- **配置验证**：Rspack 默认开启了对配置的严格校验。如果遇到配置错误，可以通过设置 `RSPACK_CONFIG_VALIDATE` 环境变量来开启宽松模式：

  ```bash
  # 开启宽松校验模式，会打印错误的配置但不会抛出错误
  RSPACK_CONFIG_VALIDATE=loose rspack build
  # 开启宽松校验模式，不打印错误也不抛出错误
  RSPACK_CONFIG_VALIDATE=loose-silent rspack build
  ```

- **性能优化**：Rspack 在某些功能上有性能更好的实现方式，如果你采用 Rspack 推荐的方式，会获得更显著的性能提升。

## Rspack 对项目性能提升有多大？

Rspack 作为一款基于 Rust 语言开发的高性能前端打包工具，相比传统的 Webpack，在多个方面都展现出了显著的性能提升。以下是具体的性能提升数据和案例：

### 1. 构建速度提升

- **冷启动和热启动性能**：Rspack v1.2 引入了持久化缓存功能，显著提升了冷启动和热启动性能。在真实项目中，持久化缓存可以让冷启动速度提升高达 250%。

  |项目类型|模块数量|Normal dev|Cold dev|Hot dev|
  |-|-|-|-|-|
  |初始项目|26|146 ms|149 ms (+2%)|134 ms (-8%)|
  |包含 10000 个模块的项目|10040|2.43 s|2.43 s (+0%)|1.16 s (-52%)|
  |包含 Less 文件的中型项目|1898|3.47 s|3.55 s (+2%)|0.92 s (-73%)|
  |大型真实项目|45968|93.3 s|91.9 s (-1%)|26 s (-72%)|

- **开发构建速度**：Rspack 的增量构建策略和高效的任务调度，使得开发构建速度大幅提升。根据实际项目测试，Rspack 的开发构建速度相比 Webpack 提升了约 5-10 倍。

### 2. HMR 性能提升

- **热模块替换（HMR）**：Rspack 的 HMR 性能相比 Webpack 提升显著。在 Rspack v1.1 中，新的增量构建功能使 HMR 性能提升高达 38%。

  在一个有 10000 个 React 组件的案例中，HMR 速度提升了 **38%**。

### 3. 生产构建速度提升

- **生产构建速度**：Rspack 的生产构建速度相比 Webpack 也有了显著提升。根据实际项目测试，Rspack 的生产构建速度相比 Webpack 提升了约 5-10 倍。

  **Webpack**
  - 开发服务器热构建时间：约 300 毫秒
  - 生产构建：42 秒

  **Rspack**
  - 开发服务器热构建时间：约 170 毫秒
  - 生产构建：15 秒

### 4. 内存使用优化

- **减少内存占用**：Rspack 通过优化内存管理，减少了构建过程中的内存占用。例如，Rspack v1.2 的 Watch 范围变化功能减少了对 `node_modules` 和 `.git` 目录的监听，从而减少了内存占用。

  通过 benchmark 仓库中的数据，这项调整将：
  - 减少内存占用 **120MB**
  - 提升 Dev 启动速度 **40%**
  - 提升 HMR 速度 **20-30%**

### 5. 代码压缩和体积优化

- **更小的压缩体积**：Rspack 通过 SWC 压缩器的优化，使得打包体积更小。例如，Rspack v1.2 将 SWC 压缩器的默认 `passes` 设置为 `2`，以减少 1%-7% 的打包体积。

### 6. 实际项目案例

- **大型后台系统项目**：使用 Rspack 替代 Webpack 后，构建时间显著减少：

  |构建阶段|Webpack|RSploit|
  |-|-|-|
  |DEV构建|3分钟以上|20秒|
  |自动化部署|10分钟以上|3分钟|
  |生产打包|2分钟|20秒|

- **中型 Vue 项目**：使用 Rspack 后，构建时间大幅缩短：

  |构建阶段|Webpack|RSploit|
  |-|-|-|
  |开发服务器启动|35秒|15秒|
  |生产构建|42秒|15秒|
  |开发服务器热构建时间|约300毫秒|约170毫秒|

### 总结

Rspack 在多个方面显著提升了项目性能，包括构建速度、HMR 性能、内存使用和代码压缩体积等。对于大型和中型项目，Rspack 的性能提升尤为明显，能够显著提高开发效率和构建速度。如果你正在寻找一个高性能的前端构建工具，Rspack 值得一试！

希望这篇博客能够帮助你更好地了解 Rspack 的性能提升，如果你有任何问题或建议，欢迎在评论区留言！
### 总结

Rspack 是一个非常有潜力的前端打包工具，它不仅解决了大型项目的构建性能问题，还通过兼容 Webpack 生态和丰富的生态系统，为开发者提供了更多的选择和便利。如果你正在寻找一个高性能的前端构建工具，Rspack 值得一试！

希望这篇博客能够帮助你更好地了解 Rspack，如果你有任何问题或建议，欢迎在评论区留言！
