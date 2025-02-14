<!--
 * @Author: qs
 * @Date: 2025-02-07 17:38:30
 * @LastEditTime: 2025-02-08 17:38:48
 * @LastEditors: qs
 * @Description:
 * @FilePath: /coderPanz.github.io/docs/js 精度问题.md
 *
-->

# JS 精度问题
## JS 存储数字类型的方式
### 1. Number（64 位双精度浮点数）
JavaScript 的 Number 类型基于 IEEE 754 双精度浮点数（64-bit） 进行存储，这意味着它既可以表示整数，也可以表示小数。存储结构如下：  
- 1 bit：符号位（0 表示正数，1 表示负数）
- 11 bits：指数部分（用于存储指数）
- 52 bits：尾数（存储有效数字）
```js
let num1 = 42;       // 整数
let num2 = 3.14;     // 小数
let num3 = 1.5e6;    // 科学计数法表示的数值
```

- 整数范围受限：由于 JavaScript 采用 64 位浮点数存储，所以整数的 精确表示范围 仅为 -(2^53 - 1) 到 2^53 - 1（即 -9007199254740991 到 9007199254740991），超出此范围可能会导致精度丢失。
- 浮点数精度问题：由于 IEEE 754 采用二进制存储，部分十进制小数无法精确表示，例如：
```js
console.log(0.1 + 0.2); // 0.30000000000000004
```

### BigInt（任意精度整数）
ES11（ES2020）引入了 BigInt 类型，用于存储大整数，不受 Number 的 2^53 - 1 限制。  
```js
let bigNumber = 9007199254740992n; // 使用 "n" 表示 BigInt
let bigSum = bigNumber + 2n;       // BigInt 运算
console.log(bigSum);               // 9007199254740994n
```
特点：BigInt 不能与 Number 直接混合运算,适用于需要高精度计算的大数场景，如加密、金融计算等。  
```js
let result = bigNumber + 10; // TypeError: Cannot mix BigInt and other types
```

###  TypedArray（定长数值存储）
TypedArray 提供了一组存储二进制数据的视图，如 Int8Array、Uint8Array、Float32Array 等，这些类型可以用于高效存储和操作数值数据。  
```js
let intArray = new Int32Array([10, 20, 30]);
console.log(intArray[1]); // 20
```
特点：
- 可精确控制存储类型（8 位、16 位、32 位、64 位）。
- 适用于 WebGL、音频处理、大规模数值计算等场景。

## Buffer（Node.js 环境）
在 Node.js 中，Buffer 是处理二进制数据的方式之一，可以用于存储和操作字节数据。主要用于二进制文件处理，如网络传输、文件读写等。  
```js
const buf = Buffer.alloc(4); // 创建 4 字节的 Buffer
buf.writeInt32BE(12345678);  // 写入 32 位整数
console.log(buf);            // <Buffer 00 bc 61 4e>
```

### 字符串存储数字
虽然字符串不是专门的数值存储方式，但在某些情况下，数字可能会以字符串形式存储，如 JSON 数据传输时。  
场景：避免精度丢失（特别是超出 Number 范围的情况），适用于数据库 ID、信用卡号等无需数学计算的数字。  
```js
let numStr = "12345678901234567890"; // 大数值存储
let bigNumber = BigInt(numStr);      // 转换为 BigInt
```

## 为什么会出现精度丢失
&emsp;&emsp; JavaScript 采用 IEEE 754 双精度浮点数（64-bit） 来存储 Number 类型的值，由于其存储格式和二进制运算特性，某些十进制小数在二进制中无法被精确表示，从而导致 精度丢失。  

### 两大原因
**一、十进制无法用二进制精确表示**  
某些十进制小数 无法用有限的二进制精确表示，就像 1/3 在十进制中是无限循环小数 0.33333... 一样，某些十进制数在二进制中会变成 无限循环，只能**近似存储**。  
例如：0.1 在二进制中表示为无限循环：`0.0001100110011001100110011001100110011... (无限循环)`。但是 JavaScript 只能存储 有限位数（最多 53 位有效位），所以 0.1 被 截断近似存储，这导致了精度损失。  

示例：0.1 + 0.2 !== 0.3，结果为：  
```js
console.log(0.1 + 0.2); // 0.30000000000000004`
```
0.1 和 0.2 在二进制中都是 无法精确存储 的近似值,由于浮点数运算使用 有限精度，计算结果稍微偏差，导致 0.30000000000000004。  


**(2) 超过 53 位有效位时的精度丢失**  
IEEE 754 最多只能存储 53 位有效数字，超过 2^53 - 1 = 9007199254740991（Number.MAX_SAFE_INTEGER）的整数会导致精度丢失。这里 9007199254740991 + 2 仍然等于 9007199254740992，因为 9007199254740993 无法被精确存储。  
```js
console.log(9007199254740991 + 1); // 9007199254740992 ✅
console.log(9007199254740991 + 2); // 9007199254740992 ❌（错误！）
```

**（3）如何避免精度丢失**  
- 使用 BigInt
- 使用 toFixed() 或 toPrecision() 进行格式化，注意他们也会进行四舍五入，可能会出现精度丢失问题
- 乘以 10^n 后再除回去（适用于货币计算）
- Math.fround()：可以将任意的数字转换为离它最近的单精度浮点数形式的数字（Math.fround() 使用 32 位浮点数存储数据，可以在某些情况下减少精度误差）。
- 数字格式转化时可以先转化为字符串，使用字符串操作，避免进行 js 计算从而避免精度问题。

### 实战案例
后端返回整数金额，单位为分，前端需要转换为元。  
```js
  if (!amount) return '0.00';
  const str = amount.toString();
  let integerPart: string // 整数部分
  let decimalPart: string; // 小数部分

  if (str.length <= 2) {
    // 当不足三位数时，例如 5、50；转化后，整数部分为零，所以需要 padStart 处理小数部分（5->0.05;50->0.50）
    integerPart = '0';
    // padStart 补齐小数部分
    decimalPart = str.padStart(2, '0');
  } else {
    // 分割出整数部分和小数部分
    integerPart = str.slice(0, -2);
    decimalPart = str.slice(-2);
  }

  // 给整数部分添加千分位分隔符
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${integerPart}.${decimalPart}`;
```



