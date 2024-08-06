# axios封装

在JavaScript中，对Axios进行二次封装可以提高代码的复用性和维护性，同时也能更好地适应多样化的网络请求需求。封装`axios`可以带来许多好处，包括但不限于统一配置、简化请求和响应处理、集中错误处理、提高代码的可维护性和可读性等。在实际项目开发中，根据项目的具体需求对`axios`进行适当的二次封装，可以显著提高开发效率和项目的质量。

## 步骤

- **创建Axios实例**：通过`axios.create`方法，我们可以创建一个自定义配置的axios实例。它允许我们预设一些axios请求的默认行为，如API的基础URL和超时设置。
- **请求和响应拦截器**：拦截器使得我们能够在请求发送或响应返回之前执行一些操作。这对于添加通用的请求头、处理全局的错误响应等场景非常有用。
- **封装请求方法**：通过封装GET、POST、PUT、DELETE等HTTP方法，我们提供了一个简洁的API接口给开发者，使得发送网络请求更加直观和便捷。
- **使用封装的API服务**：最后，通过导出并使用`ApiService`类，我们可以很容易地在项目中进行网络请求，同时保持代码的整洁和一致性。



## 代码展示

```js
import axios from "axios"
import { BASE_URL, TIME_OUT } from "./config"
class ApiService {
  constructor(BASE_URL, TIME_OUT) {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: TIME_OUT,
    })

    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        // 请求发送前的拦截处理: 设置token等
        const token = localStorage.getItem("token")
        if (token) config.headers["Authorization"] = `Bearer ${token}`
        return config
      },
      (error) => {
        // 异常处理
        return Promise.reject(error)
      }
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      (response) => {
        // 对响应数据处理或者直接返回
        return response
      },
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // 处理401错误，可能是未认证或认证失效
              console.error("Authentication failed, please log in again")
              // 重定向到登录页等操作
              break
            case 403:
              console.error("You do not have permission to perform this action")
              break
            // 其他状态码处理
            default:
              console.error(`Request failed: ${error.message}`)
          }
        } else {
          // 处理网络或其他问题
          console.error(`Network error: ${error.message}`)
        }
        return Promise.reject(error)
      }
    )
  }

  // GET请求
  get(url, params) {
    return this.instance.get(url, { params })
  }

  // POST请求
  post(url, data) {
    return this.instance.post(url, data)
  }

  // PUT请求
  put(url, data) {
    return this.instance.put(url, data)
  }

  // DELETE请求
  static delete(url) {
    return this.instance.delete(url)
  }
}

const ApiServiceInstance = new ApiService(BASE_URL, TIME_OUT)
export default ApiServiceInstance
```

```js
export const BASE_URL = "http://localhost:3000/"
export const TIME_OUT = 5000
```