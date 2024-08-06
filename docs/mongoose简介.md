# mongoose简介

## 介绍

Mongoose 是一个在 Node.js 环境中操作 MongoDB 数据库的框架。它提供了一种模型驱动（Model-Driven）的方式来操作 MongoDB，使得在 Node.js 中进行数据库操作更加简单和直观。

Mongoose 的主要特点和功能包括：

1. 数据建模：Mongoose 允许开发者使用 Schema 来定义数据模型，包括字段类型、验证规则、默认值等。这样可以确保数据的结构和约束，避免不符合预期的数据进入数据库。
2. CRUD 操作：通过 Mongoose，可以定义 Model 对象，从而对数据库进行增删改查等操作，同时支持丰富的查询和更新方式。
3. 中间件支持：Mongoose 支持在保存、更新等操作前后插入中间件，方便进行数据的处理和额外的逻辑操作。
4. 数据验证：Mongoose 提供了灵活的数据验证机制，可以在模型层面定义数据的验证规则，确保数据的完整性和正确性。
5. 引用和嵌入：Mongoose 支持在 Schema 中定义引用（Reference）和嵌入（Embedding），使得多个文档之间可以建立关联，并且能够支持事务等特性。

## 用法

### 1. 导入及连接

- 安装：`npm i mongoose`

- 引入和连接：` const mongoose = require('mongoose')` ` mongodb://127.0.0.1:27017/myDB`

- 若设置密码，连接时携带密码：
` mongoose.connect('mongodb://youpassword@127.0.0.1:27017/myDB') `

### 2. 定义Schema

在mongoose中定义的schema就是定义数据的文档模型，规定了数据的字段和类型及其写入规则等。

```
const mongoose = require('mongoose')

// 定义user文档模型
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // 角色
  rolesId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Role'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 创建user数据模型
const userModel = mongoose.model('user', userSchema)

// 导出模型
module.exports = userModel
```



### 3. 创建数据模型

定义好了 Schema，接下就是生成 Model。生成的文档模型可以对数据库进行操作。`mongoose.model` 的参数，两个或者是三个。分别是：模型名称、Schema名称(在这里是userSchema)和该文档模型存入到数据库中的集合名称。

` const userModel = mongoose.model('user', userSchema, 'users')`



### 4. CURD

具体语法网上可查，这里给出几个示例展示。

```javascript
// 导入模型对象
const userModel = require("../models/user");

const data = await userModel.find();

const data = await userModel.create(ADD_DATA);

// { new: true }: 执行操作后返回更新后的文档，而不是默认返回更新前的文档。
const data = await userModel.findByIdAndUpdate(_id, userDoc, { new: true }); 

const data = await userModel.findByIdAndDelete(id);
```