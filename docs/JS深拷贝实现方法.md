# JS深拷贝实现方法

​		深拷贝是指将一个对象完整地复制到另一个对象中，包括对象的所有属性和嵌套对象的属性。并且是一个新对象和原对象底层不共享引用。

​		在JS中实现深拷贝的方式有很多，下面就来列举一下常用的几个方法。

1. ### 封装一个递归函数实现

   ```js
   function deepClone (target, hash = {}) { // 额外开辟一个存储空间来存储当前对象和拷贝对象的对应关系
     if (target === null) return target
     if (target instanceof Date) return new Date(target)
     if (target instanceof RegExp) return new RegExp(target)
   
     if (typeof target !== 'object') return target
   
     if (hash[target]) return hash[target] // 当需要拷贝当前对象时，先去存储空间中找，如果有的话直接返回
     const cloneTarget = new target.constructor()
     hash[target] = cloneTarget // 如果存储空间中没有就存进存储空间 hash 里
   
     for (const key in target) { // 递归拷贝每一层
       cloneTarget[key] = deepClone(target[key]) 
     }
     return cloneTarget
   }
   ```

   

2. ###  JSON.parse(JSON.stringify(obj))

   ```js
   let ingredients_list = ["noodles", { list: ["eggs", "flour", "water"] }];
   let ingredients_list_deepcopy = JSON.parse(JSON.stringify(ingredients_list));
   
   console.log(ingredients_list === ingredients_list_deepcopy) // false
   ```

   ​		先介绍一下序列化：序列化是指将数据结构或对象转换为可存储或传输的格式的过程，以便在需要时可以重新创建原始对象。常见的序列化格式包括 JSON（JavaScript Object Notation）、XML（eXtensible Markup Language）、Protocol Buffers、MessagePack 等。

   ​		该方法会返回一个基于原对象的深拷贝副本，前提是如果一个 JavaScript 对象可以被[序列化](https://developer.mozilla.org/zh-CN/docs/Glossary/Serialization)。这个方法的弊端就是许多 JavaScript 对象根本不能序列化，例如，带有闭包的函数、、[Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)、在 [HTML DOM API](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API) 中表示 HTML 元素的对象、递归数据等。

   ​		另外，带有循环引用的对象(因为这些结构不是还存在对外部作用域的关联，该方法无法处理这种情况的数据)、Data类型，Set，Map类型，JSON.parse(JSON.stringify(obj))也无法对这些类型进行深拷贝处理。

   

3. ### structuredClone()

   全局的 **`structuredClone()`** 方法使用[结构化克隆算法（用于复制复杂 JavaScript 对象的算法。它通过递归输入对象来构建克隆，同时保持先前访问过的引用的映射，以避免无限遍历循环。）](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)将给定的值进行[深拷贝](https://developer.mozilla.org/zh-CN/docs/Glossary/Deep_copy)。

   

   该方法还支持把原值中的[可转移对象](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Transferable_objects)*转移*（而不是拷贝）到新对象上。可转移对象与原始对象分离并附加到新对象；它们将无法在原始对象中被访问。

   

   可转移对象：**可转移的对象**（Transferable object）是拥有属于自己的资源的对象，这些资源可以从一个上下文*转移*到另一个，确保资源一次仅在一个上下文可用。传输后，原始对象不再可用；它不再指向转移后的资源，并且任何读取或者写入该对象的尝试都将抛出异常。

   

   ```js
   structuredClone(value) // 被克隆的对象。
   structuredClone(value, { transfer }) // 是一个可转移对象的数组，里面的 值 并没有被克隆，而是被转移到被拷贝对象上。
   ```

   

   缺点：调用 `structuredClone()` 来克隆一个不可序列化的对象也会失败。