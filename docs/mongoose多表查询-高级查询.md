# mongoose多表查询-高级查询
## 设计阶段

mongoose多表联查地时候需要在定义文档模型的时候声明一个字段去引用其他文档，例如：

```javascript
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  power: {
    type: String,
    required: true
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

const roleModel = mongoose.model('Role', roleSchema)
module.exports = roleModel
```

```javascript
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
  roleIds: {
    type: [mongoose.Schema.Types.ObjectId], // 表示指向Role集合中的多个文档_id
    ref: 'Role' // 模型名称
  },
  departmentIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Department'
  },
})

const userModel = mongoose.model('User', userSchema)
module.exports = userModel
```

这样user模型和role模型就建立了关系，我通过user模型就可以去查询role集合中的数据了。



## Populate填充 

当使用ref与其他表建立联系的时候，就可以使用populate了。填充是将文档中的指定ref关联字段自动替换为其他集合中的文档的过程。我们可以填充单个文档、多个文档、一个普通对象、多个普通对象或从查询返回的所有对象。例如：

### 保存引用

让对应的表保存ref使得这个两个集合之间真正的建立连接，或者你手动分配_id也可以。

```javascript
const role = new roleModel({ name: 'admin' });

await role.save(); // 入库保存
const roleIds = []

const story1 = new userModel({
  name: 'coderPanz',
  password: 'coder123'
  roleIds: roleIds.push(role._id) // 分配_id
});

await story1.save();
```

现在就可以通过populate去关联填充了。



### 开始填充

表示填充user集合中的roleIds字段，因为roleIds字段指向Role集合，所以会填充Role集合中对应的文档。

```javascript
const story = await userModel.
  findOne({ name: 'coderPanz' }).
  populate('roleIds').
  exec();
```



### 填充关联文档中的指定字段

```javascript
// 单个填充写法
const story = await userModel.
  findOne({ name: 'coderPanz' }).
  populate('roleIds', 'name'). // 表示填充的Role集合文档中的name字段即可，其他字段不需要填充返回
  exec();

// 多个填充写法
const story = await userModel.
  findOne({ name: 'coderPanz' }).
  populate('roleIds', 'name power'). // 表示填充的Role集合文档中的name和power字段，其他字段不需要填充返回
  exec();
```



### 填充多个关联文档

```javascript
await userModel.
  find({ /* ... */ }).
  populate('roleIds', 'name updatedAt').
  populate('departmentIds', 'name updatedAt').
  exec();

// 对象写法： path: 引用字段，用于填充关联文档。select：填充关联文档中的指定字段。match：在关联文档中匹配指定字段值的文档。
await userModel.
  find({ /* ... */ }).
  populate({ path: 'roleIds', select: 'name updatedAt', match: { name: 'admin'}).
  populate({ path: 'departmentIds', select: 'name updatedAt', match: { name: '开发部门'} }).
  exec();
```



### 多级嵌套填充

在mongoose中存引用的时候如果是**嵌套的**，查询的时候填充引用字段会使用populate多级嵌套填充。例如：

User文档模型

```javascript
roleIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Role' // 模型名称
  },
```

Role文档模型

```javascript
menus: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'Menu'
},
```

菜单树(权限树模型)

```javascript
const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: Number
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
```



我们需要根据用户文档模型来查询权限树，中间是存在一个Role文档模型给我们进行关联的。所以我们可以使用populate多级嵌套进行填充。

```javascript
await userModel.
  find({ /* ... */ }).
  populate({ 
    path: 'roleIds',
    select: 'menus',
    populate: {
      path: 'menus',
      select: 'name'
    }).
  exec();
```



## 聚合管道

Mongoose 聚合管道（Aggregation Pipeline）是 Mongoose 提供的一种强大的数据聚合工具，用于对 MongoDB 中的文档进行复杂的数据处理和计算操作。

aggregate()有两个参数其中参数二可选，分别为聚合管道作为对象数组、要与此聚合一起使用的模型。

一般用于表关联查询和数据统计，**这里的表关联查询和populate填充查询会有不同。**例如这个场景：User文档模型中的roleId字段指向Role文档模型，我们需要使用User模型查找用户对应的指定角色，非指定角色的用户会被过滤掉。也就是说通过查询模型A关联的模型B的数据去过滤掉模型A的数据并返回的过程。

```javascript
//  $lookup 阶段将 User 模型的 roleId 字段与 Role 模型的 _id 字段进行关联，并将结果存储在 roleItems 字段中。并匹配到roleItems中的name值为admin，返回的数据会过滤掉name不为admin的数据。
userModel.aggregate([
  {
    $lookup: {
      from: 'roles', // 要聚合的集合名称，该名称是存到数据库中的集合名称
      localField: 'roleId', // 发起聚合操作的模型的ref字段
      foreignField: '_id', // 关联集合的字段，也就是localField指向的foreignField
      as: 'roleItems' // 聚合操作后数据存储的字段(该字段为数组)
    }
  },
  {
      
    $match: { // $match为匹配字段，和populate中的match类型，它可以匹配原文档的字段，也可以匹配聚合后的字段（这里是roleItems）。注意：匹配聚合后的字段中的内容需要通过引号标注，例子如下。
      'roleItems.name': 'admin',
      field1: value1,  // 根据字段 field1 进行过滤
      field2: value2   // 根据字段 field2 进行过滤
      // 添加其他需要的过滤条件
    }
  }
])
```



### 常用聚合管道操作符和表达式

![](/Snipaste_2024-01-28_20-59-09.png)

`$match`和`$lookup`已经在上面案例中讲解过了，接下来讲一下`$project`管道操作符。

`$project` 是 Mongoose 聚合管道中的一个聚合阶段，主要用于将输入文档的字段进行投影（Projection），即选择性地包含或排除字段，并可以对字段进行重命名、计算和转换。**注意：该操作可以将字段进行排除，一般将该操作放在$match和$lookup后面。**

```javascript
{
    $project: { 
      userId: { $toObjectId: "$roleId" }, // 在聚合阶段将roleId转换为ObjectId, 某些情况下id会被看作字符串，所以需要强制转换确保通过该字段去聚合关联的集合。
      // 指定需要返回的字段，设为1或者true都可以。
      fieldName1: 1, 
      fieldName2: 1
    }
  },
 
 // 类型转换为字符串： 使用 $toString 运算符将字段转换为字符串类型。
 {
  $project: {
    fieldName: { $toString: "$fieldName" }
  }
}

// 类型转换为数字： 使用 $toInt、$toDouble 或 $toDecimal 运算符将字段转换为整数、双精度浮点数或十进制数。
{
  $project: {
    fieldName: { $toInt: "$fieldName" }
  }
}

// 类型转换为日期： 使用 $toDate 运算符将字段转换为日期类型。
{
  $project: {
    fieldName: { $toDate: "$fieldName" }
  }
}

// 类型转换为布尔值： 使用 $toBool 运算符将字段转换为布尔值类型。
{
  $project: {
    fieldName: { $toBool: "$fieldName" }
  }
}
```



### 聚合多个集合

可通过 $lookup操作符聚合多个集合，然后使用$match操作符统一对多个表中的数据进行过滤。

```javascript
const data = await userModel.aggregate([
  {
    $lookup: {
      from: 'roles',
      localField: 'rolesId',
      foreignField: '_id',
      as: 'roleItems'
    }
  },
  {
    $lookup: {
      from: 'departments',
      localField: 'departmentId',
      foreignField: '_id',
      as: 'departItems'
    }
  },
      
  {
    $match: {
      'departItems.name': '设计部',
      'roleItems.name': '中级管理员'
    }
  }
])
```

