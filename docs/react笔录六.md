# react 笔录六-React-HOC

## 高阶组件
高阶组件（HOC）是 React 中用于增强组件功能的一种技术。它是一个函数，接受一个组件作为参数，并返回一个新的组件。HOC 可以用于封装和复用组件逻辑，以及在多个组件之间共享功能。  

HOC 的产生根本作用就是解决大量的代码复用，逻辑复用问题。既然说到了逻辑复用，那么具体复用了哪些逻辑呢？  
**拦截问题**  
首先第一种就是拦截问题，本质上是对渲染的控制，对渲染的控制可不仅仅指是否渲染组件，还可以像 dva 中 dynamic 那样懒加载/动态加载组件。

**数据问题**  
比如项目中想让一个非 Route 组件，也能通过 props 获取路由实现跳转，但是不想通过父级路由组件层层绑定 props ，这个时候就需要一个 HOC 把改变路由的 history 对象混入 props 中，于是 withRoute 诞生了。所以 HOC 还有一个重要的作用就是让 props 中混入一些你需要的东西。  


**赋能问题**  
如果不想改变组件，只是监控组件的内部状态，对组件做一些赋能，HOC 也是一个不错的选择，比如对组件内的点击事件做一些监控，或者加一次额外的生命周期，开源项目 react-keepalive-router，可以缓存页面，项目中的 keepaliveLifeCycle 就是通过 HOC 方式，给业务组件增加了额外的生命周期。

高阶函数就是一个将函数作为参数并且返回值也是函数的函数。高阶组件是以组件作为参数，返回组件的函数。返回的组件就是把传进去的组件进行强化和赋能。  

## 属性代理
属性代理是一种常见的高阶组件，用组件包裹一层代理组件，在代理组件上，可以做一些对源组件的强化操作。  
特点：  
- 高阶组件向被包装组件传递所有原始的 props，并可以添加、修改或删除其中的部分 props。
- 不会修改原组件本身，而是通过 props 来动态修改组件的行为。
```jsx
function HOC(WrapComponent) {
  return class Advance extends React.Component {
    state = {
      name: "alien",
    }
    render() {
      return <WrapComponent {...this.props} {...this.state} />
    }
  }
}
```

**应用场景**  
```jsx
import React from 'react';

// 高阶组件：属性代理
function withLoading(Component) {
  return function WithLoading(props) {
    const { isLoading, ...restProps } = props;
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...restProps} />;
  };
}

// 被包装组件
function UserProfile({ name, age }) {
  return (
    <div>
      <h1>Name: {name}</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// 使用高阶组件
const UserProfileWithLoading = withLoading(UserProfile);

function App() {
  return (
    <div>
      <UserProfileWithLoading name="John Doe" age={30} isLoading={false} />
    </div>
  );
}
export default App;
```
优点：可以完全隔离业务组件的渲染，因为属性代理说白了是一个新的组件，相比反向继承，可以完全控制业务组件是否渲染。  
确定：一般无法直接获取原始组件的状态，如果想要获取，需要 ref 获取组件实例，如果是fn 式组件需要 forwardRef 来转发 ref。  

## 反向继承
反向继承和属性代理有一定的区别，在于包装后的组件继承了原始组件本身，所以此时无须再去挂载业务组件。
```jsx
class Index extends React.Component{
  render(){
    return <div> hello,world  </div>
  }
}
function HOC(Component){
    return class wrapComponent extends Component{ /* 这个新的组件直接继承包装的组件 */}
}
export default HOC(Index) 
```

**应用场景**  
```jsx
import React from 'react';

// 高阶组件：反向继承
function withLogger(Component) {
  return class WithLogger extends Component {
    componentDidMount() {
      console.log('Component did mount');
    }

    componentWillUnmount() {
      console.log('Component will unmount');
    }

    render() {
      // 渲染原组件，并传递所有的 props
      return <Component {...this.props} />;
    }
  };
}

// 被包装组件
class UserProfile extends React.Component {
  render() {
    const { name, age } = this.props;
    return (
      <div>
        <h1>Name: {name}</h1>
        <p>Age: {age}</p>
      </div>
    );
  }
}

// 使用高阶组件
const UserProfileWithLogger = withLogger(UserProfile);

function App() {
  return (
    <div>
      <UserProfileWithLogger name="John Doe" age={30} />
    </div>
  );
}

export default App;
```
优点：方便获取组件内部状态，比如 state ，props ，生命周期，绑定的事件函数等。  
缺点：函数组件无法使用。

## 高阶组件的功能
### 强化 props
强化 props 就是在原始组件的 props 基础上，加入一些其他的 props ，强化原始组件功能。  
  withRouter 是 React Router 中的一个高阶组件（HOC），它的作用是 为被包装组件注入路由相关的 props，如 history、location 和 match，让这些信息在组件中可以直接在原组件中使用。它是为了方便非路由组件（即没有直接在 `<Route>` 组件中使用的组件）获取路由上下文（context）而设计的。  


```jsx
function withRouter(Component) {
  // 计算包裹组件的名字
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  // 返回一个新的组件 C
  const C = props => {
    // 提取 props 中的 wrappedComponentRef 和其他剩余的 props
    const { wrappedComponentRef, ...remainingProps } = props;
    return (
      <RouterContext.Consumer>
        {context => {
          // 通过 RouterContext.Consumer 获取路由的上下文（context）
          return (
            <Component
              {...remainingProps} // 传递原组件的 props
              {...context}        // 将路由的上下文信息（history, location, match）传递给原组件
              ref={wrappedComponentRef} // 转发 ref
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };

  // 设置新组件的 displayName
  C.displayName = displayName;
  // 记录被包装组件，方便调试
  C.WrappedComponent = Component;
  // 继承原组件的静态方法
  return hoistStatics(C, Component);
}
export default withRouter
```

withRouter 使用场景:假设我们有一个 Profile 组件，展示用户的资料，且需要获取路由中的参数（例如 id）来加载不同用户的数据。可以使用 withRouter 来增强这个组件，注入路由信息。  
```jsx
import React from 'react';
import { withRouter } from '@/utils/withRouter';

function Profile({ match, location, history }) {
  const { id } = match.params;  // 获取路由参数 id
  return (
    <div>
      <h1>Profile of User {id}</h1>
      <p>Current Path: {location.pathname}</p>
      <button onClick={() => history.push('/')}>Go Home</button>
    </div>
  );
}

// 使用 withRouter 包装 Profile 组件
export default withRouter(Profile);
```


### 渲染控制
#### 渲染劫持
HOC 反向继承模式，可以通过 super.render() 得到 render 之后的内容，利用这一点，可以做渲染劫持 ，更有甚者可以修改 render 之后的 React element 对象。
```jsx
const HOC = (WrapComponent) =>
  class Index  extends WrapComponent {
    render() {
      if (this.props.visible) {
        return super.render()
      } else {
        return <div>暂无数据</div>
      }
    }
  }
```

#### 修改渲染树
```jsx
class Index extends React.Component{
  render(){
    return <div>
       <ul>
         <li>react</li>
         <li>vue</li>
         <li>Angular</li>
       </ul>
    </div>
  }
}
function HOC (Component){
  return class Advance extends Component {
    render() {
      const element = super.render()
      const otherProps = {
        name:'alien'
      }
      /* 替换 Angular 元素节点 */
      const appendElement = React.createElement('li' ,{} , `hello ,world , my name  is ${ otherProps.name }` )
      const newchild =  React.Children.map(element.props.children.props.children,(child,index)=>{
           if(index === 2) return appendElement
           return  child
      }) 
      return  React.cloneElement(element, element.props, newchild)
    }
  }
}
export  default HOC(Index)
```

#### 动态加载
dva 中 dynamic 就是配合 import ，实现组件的动态加载的，而且每次切换路由，都会有 Loading 效果，接下来看看大致的实现思路。  
Index 组件中，在 componentDidMount 生命周期动态加载上述的路由组件 Component，如果在切换路由或者没有加载完毕时，显示的是 Loading 效果。
```jsx
export default function dynamicHoc(loadRouter) {
  return class Content extends React.Component {
    state = {Component: null}
    componentDidMount() {
      if (this.state.Component) return
      loadRouter()
        .then(module => module.default) // 动态加载 component 组件
        .then(Component => this.setState({Component},
         ))
    }
    render() {
      const {Component} = this.state
      return Component ? <Component {
      ...this.props
      }
      /> : <Loading />
    }
  }
}

const Index = AsyncRouter(()=>import('../pages/index'))
```

### 组件赋能
#### 事件监控
HOC 不一定非要对组件本身做些什么？也可以单纯增加一些事件监听，错误监控。  
```jsx
function ClickHoc (Component){
  return  function Wrap(props){
    const dom = useRef(null)
    useEffect(()=>{
       const handerClick = () => console.log('发生点击事件') 
       dom.current.addEventListener('click',handerClick)
     return () => dom.current.removeEventListener('click',handerClick)
    },[])
    return  <div ref={dom}  ><Component  {...props} /></div>
  }
}

@ClickHoc
class Index extends React.Component{
   render(){
     return <div className='index'  >
       <p>hello，world</p>
       <button>组件内部点击</button>
    </div>
   }
}
export default ()=>{
  return <div className='box'  >
     <Index />
     <button>组件外部点击</button>
  </div>
}
```

### Minix
Mixin（混入）是一种通过扩展收集功能的方式，它本质上是将一个对象的属性拷贝到另一个对象上面去，不过你可以拷贝任意多个对象的任意个方法到一个新对象上去，这是继承所不能实现的。它的出现主要就是为了解决代码复用问题。  
```jsx
var LogMixin = {
  log: function() {
    console.log('log');
  },
  componentDidMount: function() {
    console.log('in');
  },
  componentWillUnmount: function() {
    console.log('out');
  }
};

var User = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});

var Goods = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});
```

### 总结
HOC 具体能实现以下几个功能：
- 强化 props ，可以通过 HOC ，向原始组件混入一些状态。
- 渲染劫持，可以利用 HOC ，动态挂载原始组件，还可以先获取原始组件的渲染树，进行可控性修改。
- 可以配合 import 等 api ，实现动态加载组件，实现代码分割，加入 loading 效果。
- 可以通过 ref 来获取原始组件实例，操作实例下的属性和方法。
- 可以对原始组件做一些事件监听，错误监控等。

**react 组件复用的方式**  
Mixin、HOC、Render Props、Hooks



