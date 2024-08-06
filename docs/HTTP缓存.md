# HTTP缓存

## 是什么

​ **超文本传输协议**（HTTP）是一个用于传输超媒体文档（例如 HTML）的[应用层](https://zh.wikipedia.org/wiki/应用层)协议。它是为 Web 浏览器与 Web 服务器之间的通信而设计的，但也可以用于其他目的。HTTP 遵循经典的[客户端—服务端模型](https://zh.wikipedia.org/wiki/主從式架構)，客户端打开一个连接以发出请求，然后等待直到收到服务器端响应。HTTP 是[无状态协议](http://zh.wikipedia.org/wiki/无状态协议)，这意味着服务器不会在两个请求之间保留任何数据（状态）。

## HTTP 缓存

​ HTTP 缓存会存储与请求关联的响应，并将存储的响应复用于后续请求。

### 优点

- 快速响应页面：不需要将请求传递到源服务器，因此客户端和缓存越近，响应速度就越快。最典型的例子是浏览器本身为浏览器请求存储缓存。
- 减少服务器负载：当响应可复用时，源服务器不需要处理请求——因为它**不需要解析和路由请求**、根据 **cookie 恢复会话**、**查询数据库**。

### 缓存类型

​ 在 [HTTP Caching](https://httpwg.org/specs/rfc9111.html) 标准中，有两种不同类型的缓存：**私有缓存**和**共享缓存**。

- 私有缓存：私有缓存是绑定到特定客户端的缓存——通常是浏览器缓存。**注意**：如果响应具有 `Authorization` 标头，则不能将其存储在私有缓存（或共享缓存，除非 Cache-Control 指定的是 `public`）中。

- 共享缓存：共享缓存位于客户端和服务器之间，可以存储能在用户之间共享的响应。共享缓存可以进一步细分为**代理缓存**和**托管缓存**。
  - 代理缓存：除了访问控制的功能外，一些代理还实现了缓存以减少网络流量。**这通常不由服务开发人员管理**，因此必须由恰当的 HTTP 标头等控制。
  - 托管缓存：托管缓存由服务开发人员明确部署，以**降低源服务器负载**并有效地交付内容。示例包括**反向代理、CDN 和 service worker 与缓存 API 的组合**。在大多数情况下，你可以通过 `Cache-Control` 标头和你自己的配置文件来控制缓存的行为。

## age 缓存策略

​ 存储的 HTTP 响应有两种状态：**fresh** 和 **stale**。_fresh_ 状态通常表示响应仍然有效，**响应的数据**可以重复使用，而 _stale_ 状态表示**缓存的响应已经过期**。

确定响应何时是 fresh 的和何时是 stale 的标准是 **age**。在 HTTP 中，**age 是自响应生成以来经过的时间。**

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
Cache-Control: max-age=604800
```

- 如果响应的 age *小于*一周，则响应为 _fresh_。
- 如果响应的 age *超过*一周，则响应为 _stale_。

当响应存储在共享缓存中时，有必要通知客户端响应的 age。继续看示例，如果共享缓存将响应存储了一天，则共享缓存将向后续客户端请求发送以下响应。

收到该响应的客户端会发现它在剩余的 518400 秒内是有效的，这是响应的 `max-age` 和 `Age` 之间的差异。

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
Cache-Control: max-age=604800 // 响应生成的时间若大于这个max-age则响应的状态码状态变为stale，表示缓存过期。否则状态码状态为fresh，表示缓存可用
Age: 86400 // 表示在共享存储中存储响应数据的时间
```

## Expires 和 max-age

​ 在 HTTP/1.0 中，有效期是通过 `Expires` 标头来指定的。`Expires` 标头**使用明确的时间来指定缓存的生命周期。**但是时间格式难以解析，也发现了很多实现的错误，有可能通过故意偏移系统时钟来诱发问题；因此，在 HTTP/1.1 中，`Cache-Control` 采用了 `max-age`——用于指定经过的时间。

由于 HTTP/1.1 已被广泛使用，无需特地提供 `Expires`。

```http
Expires: Tue, 28 Feb 2022 22:22:22 GMT
```

## 响应验证

​ 过时的**响应不会立即被丢弃。**HTTP 有一种机制，可以通过询问源服务器将陈旧的响应转换为新的响应。这称为**验证**，有时也称为**重新验证**。

验证是通过使用包含 `If-Modified-Since` 或 `If-None-Match` 请求标头的**条件请求**完成的。

### If-Modified-Since

以下响应在 22:22:22 生成，`max-age` 为 1 小时，它在 23:22:22 之前是有效的。

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
Last-Modified: Tue, 22 Feb 2022 22:00:00 GMT
Cache-Control: max-age=3600

<!doctype html>
…
```

到 23:22:22 时，响应会过时并且不能重用缓存。因此，下面的请求显示客户端发送带有 `If-Modified-Since` 请求标头的请求，以询问服务器自指定时间以来是否有任何的改变。如果内容自指定时间以来没有更改，服务器将响应 `304 Not Modified`。

```http
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html
If-Modified-Since: Tue, 22 Feb 2022 22:00:00 GMT
```

由于此响应仅表示“没有变化”，因此没有响应主体——只有一个状态码——因此传输的数据量就会非常小。收到该响应后，客户端将存储的过期响应恢复为有效的，并可以在剩余的 1 小时内重复使用它。

```http
HTTP/1.1 304 Not Modified
Content-Type: text/html
Date: Tue, 22 Feb 2022 23:22:22 GMT
Last-Modified: Tue, 22 Feb 2022 22:00:00 GMT
Cache-Control: max-age=3600
```

### ETag/If-None-Match

​ **服务器可以从操作系统的文件系统中获取文件数据的修改时间**，这对于提供静态文件的情况来说是比较容易做到的。但是，也存在一些问题；例如，时间格式复杂且难以解析**，分布式服务器难以同步文件更新时间**。为了解决这些问题，`ETag` 响应标头被标准化作为替代方案。

​ `ETag` 响应标头的值是服务器生成的任意值。服务器对于生成值没有任何限制，因此服务器可以根据他们选择的任何方式自由设置值——例如主体内容的哈希或版本号。

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
ETag: "deadbeef"
Cache-Control: max-age=3600

<!doctype html>
…
```

若该响应过时了，客户端获取缓存响应头中的 `ETag` 标头的值放入 `If-None-Match` 请求标头中，以询问服务器资源是否已被修改：

```http
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html
If-None-Match: "deadbeef"
```

如果服务器为请求的资源确定的 `ETag` 标头的值与请求中的 `If-None-Match` 值相同，则服务器将返回 `304 Not Modified`。这里容易混淆，这个请求发送给服务器后，服务器是会生成一个新的 `ETag` 标头数据，然后服务器会用这个新的 `ETag` 和本次请求中 `If-None-Match` 携带的 `ETag` 进行对比，若相同则返回 `304 Not Modified`。若不相同者服务器会返会最新的数据并此时响应状态码变为 `200 OK`

### 强制重新验证

若不希望重复使用响应，而是希望始终从服务器获取最新内容，则可以使用 `no-cache` 指令强制验证。

通过在响应中添加 `Cache-Control: no-cache` 以及 `Last-Modified` 和 `ETag`——如下所示——如果请求的资源已更新，客户端将收到 `200 OK` 响应，否则，如果请求的资源尚未更新，则会收到 `304 Not Modified` 响应。

## 不使用缓存

### no-store

**注意**：`no-cache` **指令不会阻止响应的存储，而是阻止在没有重新验证的情况下重用响应。**如果你不希望将响应存储在任何缓存中，请使用 `no-store`。

```http
Cache-Control: no-store
```

但是，一般来说，实践中“不缓存”的原因满足以下情况：

- 出于隐私原因，不希望特定客户以外的任何人存储响应。
- 希望始终提供最新信息。
- 不知道在过时的实现中会发生什么。

### 私有的

当响应中存在用户的一些隐私数据时，你可能不希望它被缓存。在这种情况下，使用 `private` 指令将导致**带有隐私数据的响应仅与特定客户端一起存储**，而不会泄露给缓存的任何其他用户。在这种情况下，即使设置了 `no-store`，也必须设置 `private`。

```http
Cache-Control: private
```
