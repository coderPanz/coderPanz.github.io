# HTTPCookie

## What

HTTP Cookie（也叫 Web Cookie 或浏览器 Cookie）是**服务器发送到用户浏览器**并保存在本地的一小块数据。浏览器会存储 cookie 并在下次向同一服务器再发起请求时**携带并发送到服务器上。**

通常，它用于告知服务端两个请求是否来自同一浏览器，**以便于保持用户的登录状态**。Cookie 使基于[无状态](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview#http_是无状态，有会话的)的 HTTP 协议记录稳定的状态信息成为了可能。

## Cookie的作用

- 会话状态的管理：用户登录状态，用户的数据的记录信息。
- 个性化设置：用户的自定义设置、主题设置
- 浏览器行为跟踪：跟踪分析用户行为等，例如用户平均驻留时间，用户浏览内容偏好等。



## 创建Cookie

服务器收到 HTTP 请求后，服务器可以在响应标头里面添加一个或多个 [`Set-Cookie`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie) 选项。浏览器收到响应后通常会保存下 Cookie，并将其放在 HTTP [`Cookie`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cookie) 标头内，向同一服务器发出请求时一起发送。

### Set-Cookie 和 Cookie 标头

服务器使用 [`Set-Cookie`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie) 响应头部向用户代理（一般是浏览器）发送 Cookie 信息。

```http
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: yummy_cookie=choco
Set-Cookie: tasty_cookie=strawberry

[页面内容]
```

接下来对于该服务器发起的每一次新请求，浏览器都会将之前保存的 Cookie 信息通过 [`Cookie`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cookie) 请求头部再发送给服务器。

```http
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```



### Cookie生命周期

可以通过以下两种方式定义

- *会话期* Cookie 会在当前的会话结束之后删除。浏览器定义了“当前会话”结束的时间，一些浏览器重启时会使用*会话恢复*。这可能导致会话 cookie 无限延长。
- *持久性* Cookie 在过期时间（`Expires`）指定的日期或有效期（`Max-Age`）指定的一段时间后被删除。

```http
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```



### 限制Cookie的访问

有两种方法可以确保 `Cookie` 被安全发送，并且不会被意外的参与者或脚本访问：`Secure` 属性和 `HttpOnly` 属性。

标记为 `Secure` 的 Cookie 只应通过被 HTTPS 协议加密过的请求发送给服务端。它永远不会使用不安全的 HTTP 发送（本地主机除外），这意味着[中间人](https://developer.mozilla.org/zh-CN/docs/Glossary/MitM)攻击者无法轻松访问它。

JavaScript [`Document.cookie`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie) API 无法访问带有 `HttpOnly` 属性的 cookie；此类 Cookie 仅作用于服务器。例如，持久化服务器端会话的 Cookie 不需要对 JavaScript 可用，而应具有 `HttpOnly` 属性。此预防措施有助于缓解[跨站点脚本（XSS） (en-US)](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks)攻击。

```http
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```



## Cookie安全

缓解涉及 Cookie 的攻击的方法：

- 使用 `HttpOnly` 属性可防止通过 JavaScript 访问 cookie 值。
- 用于敏感信息（例如指示身份验证）的 Cookie 的生存期应较短，并且 `SameSite` 属性设置为 `Strict` 或 `Lax`。



## 跟踪和隐私

第一方 Cookie是由用户直接访问的网站设置并存储在用户设备上的小型文本文件。这些 Cookie 主要用于存储用户在当前网站上的个人偏好、登录状态和其他相关信息，以提供更好的用户体验。

第三方 Cookie是由不同于用户正在访问的网站的第三方域设置的。它们通常用于跟踪用户的浏览行为和兴趣，以向用户提供定制化的广告内容。例如，广告商可以在多个网站上放置相同的广告，并使用第三方 Cookie 跟踪用户的点击和购买习惯，以便为用户提供个性化的广告推荐。

