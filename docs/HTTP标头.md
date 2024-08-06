# HTTP标头


## What

**HTTP 标头** 允许客户端和服务器通过 HTTP 请求/响应传递的附加信息。

根据不同的消息上下文，标头可以分为：

- [请求标头](https://developer.mozilla.org/zh-CN/docs/Glossary/Request_header)包含有关要获取的资源或客户端或请求资源的客户端的更多信息。
- [响应标头](https://developer.mozilla.org/zh-CN/docs/Glossary/Response_header)包含有关响应的额外信息，例如响应的位置或者提供响应的服务器。
- [表示标头](https://developer.mozilla.org/zh-CN/docs/Glossary/Representation_header)包含资源主体的信息，例如主体的 [MIME 类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)或者应用的编码/压缩方案。
- [有效负荷标头](https://developer.mozilla.org/zh-CN/docs/Glossary/Payload_header)包含有关有效载荷数据表示的单独信息，包括内容长度和用于传输的编码。



## 请求标头

**请求标头**是一种 [HTTP 标头](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTP_header)，它可在 HTTP 请求中使用，其提供有关请求上下文的信息，以便服务器可以定制响应。

1. **Host**：指定要请求的主机名和端口号。
2. **User-Agent**：包含发起请求的用户代理（浏览器、操作系统等）信息。
3. **Accept**：指定客户端能够接受的内容类型。
4. **Accept-Language**：指定客户端偏好的语言。
5. **Accept-Encoding**：指定客户端支持的内容编码方式。
6. **Referer**：包含了当前页面的来源页面的 URL。
7. **Cookie**：包含了之前由服务器发送的 Cookie 信息，以便服务器识别客户端状态。
8. **Authorization**：包含了客户端认证信息，用于访问受保护的资源。
9. **Connection**：指示客户端与服务器之间连接的状态。
10. **Content-Type**：指定请求或响应中的实体的媒体类型。
11. **Content-Length**：指定请求或响应中的实体主体的长度。

## 响应标头

1. **Status**：指定响应的状态码和对应的文本描述。
2. **Content-Type**：指定响应中实体的媒体类型。
3. **Content-Length**：指定响应中实体主体的长度。
4. **Location**：在重定向响应中，指定新的资源位置。
5. **Cache-Control**：指示缓存如何处理响应内容。
6. **ETag**：指定实体的唯一标识符，用于验证缓存的新鲜度。
7. **Last-Modified**：指定实体最后修改的时间。
8. **Set-Cookie**：在响应中设置新的 Cookie 信息，用于客户端保存状态。
9. **Server**：指明服务器软件的名称和版本。
10. **Access-Control-Allow-Origin**：指定允许访问资源的域名，用于跨域请求。
11. **Expires**：指定响应的过期时间，用于缓存控制。
12. **Age**：消息头里包含对象在缓存代理中存贮的时长，以秒为单位。

