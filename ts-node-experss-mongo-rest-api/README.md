# 描述

A REST API With Node, Express, TypeScript & MongoDB + Authentication
使用 Node.js、Express 和 TypeScript 构建 REST API。使用 MongoDB 作为我们的数据库。从头到尾创建一个有效的 REST API。

## 安装请求相关包和@types

1. pnpm add express body-parser cookie-parser compression cors mongoose lodash
2. pnpm add -D @types/express @types/body-parser @types/cookie-parser @types/compression @types/cors @types/mongoose @types/lodash
3. 注意教程中 typescript "^4.9.5"

---

# nodemon

启动 node 服务，可以监听文件变动，并执行

---

# MongoDB atlas 使用配置

使用 Connect to your application 连接，注意去掉< >

### Schema [http://www.mongoosejs.net/docs/guide.html]

Mongoose 的一切始于 Schema。每个 schema 都会映射到一个 MongoDB collection ，并定义这个 collection 里的文档的构成。

### Models

Models 是从 Schema 编译来的构造函数。 它们的实例就代表着可以从数据库保存和读取的 documents。 从数据库创建和读取 document 的所有操作都是通过 model 进行的。

---

# REST API 它是一个整体概念 13 Best Practices for Building RESTful APIs

## db 目录

1. 定义，数据表 UserSchema
2. 根据 Schema 定义 UserModel 构造函数，上面有很多方法可使用
3. 使用 Model 上的方法，定义与数据库交互的方法，并暴露出去
4. 最后 生成 Model 实例，保存到表里

## helpers 目录

1. 生成随机串
2. 生成 token

## controllers 目录

1. 定义接口，用于接口的功能实现
2. 处理 路由 的请求，会调用 db 暴露的 Modal 的方法，即与 db 交互。
3. 会在 路由器 里使用
4. 一些校验可以放到 middlewares 通过 router 调用。

## router

1. 路由是后端服务的入口。
2. 定义路径，并调用接口。
3. 会调用 controllers middlewares 等处理方法。
4. 如果鉴权通过 isAuthenticated 返回 next 继续进栈，如果没通过直接 return 开始出栈  
   router.get("/users", isAuthenticated, getAllUsers);

## middleware

1. 辅助接口校验等
2. 可放到 router，做校验，如上。

## 中间件

1. 可以起到串联作用
2. 中间件，很像堆栈，先进后出
   - 如果 在某个中间件 return，那后续就开始出栈了，如果执行 next() 那会继续进栈。
3. 那是不是 express 里所有的 function，都能作为中间件呢，包括 controllers middlewares 等
4. 中间件里，还能继续进栈。
5. 中间件 需要 app.use 来使用，一定要注意，中间件顺序。

---

# express

它 与 database 交互。

## req

1. 可存放中间件处理的数据，因为...
2. req 不论什么方法都是一样的，有 body params query 等等，所以 get post delete put patch 的使用都是约定俗成。。

res.status(200).json({}).end()
res.status(200).json({})
res.json({})
user.save() // 感觉 save 是 user 原型上的方法，应该是 db 的

---

# Nodejs 洋葱模型

### [浅谈 Nodejs 框架里的“洋葱模型”](https://juejin.cn/post/6957258059022499854)

#### 1. 洋葱模型

洋葱我们都知道，一层包裹着一层，层层递进，但是现在不是看其立体的结构，而是需要将洋葱切开来，从切开的平面来看，如图 所示：
可以看到要从洋葱中心点穿过去，就必须先一层层向内穿入洋葱表皮进入中心点，然后再从中心点一层层向外穿出表皮，这里有个特点：进入时穿入了多少层表皮，出去时就必须穿出多少层表皮。先穿入表皮，后穿出表皮，符合我们所说的栈列表，先进后出的原则。

#### 2. 洋葱模型与 Node 的关系

目前比较流行的 Node.js 框架有 Express、KOA 和 Egg.js，无论是哪个 Node.js 框架，都是基于中间件来实现的。中间件主要用于请求拦截和修改请求或响应结果的。而中间件（可以理解为一个类或者函数模块）的执行方式就需要依据洋葱模型
洋葱的表皮我们可以思考为中间件：

从外向内的过程是一个关键词 next()；如果没有调用 next()，则不会调用下一个中间件
而从内向外则是每个中间件执行完毕后，进入原来的上一层中间件，一直到最外一层。

#### 3. 中间件的执行

以 express 为例，以下就是中间件的一个基本执行过程：

Koa 是基于 Express 的同一班人马开发的下一代 node 框架，二者的主要区别：

Express 封装、内置了很多中间件，比如 connect 和 router ，而 KOA 则比较轻量，开发者可以根据自身需求定制框架；
Express 是基于 callback 来处理中间件的，而 KOA 则是基于 await/async；
在异步执行中间件时，Express 并非严格按照洋葱模型执行中间件，而 KOA 则是严格遵循的（体现再两者在中间件为异步函数的时候处理会有不同）。

Express 和 KOA 之间关于洋葱模型的执行方式的区别介绍：
我们保留上述示例代码的原来三个中间件，同时在 2 和 3 之间插入一个新的异步中间件，代码如下：
（1）express

```
**
 * 异步中间件
 */
app.use(async (req, res, next) => {
    console.log('async');
    await next();
    await new Promise(
        (resolve) =>
            setTimeout(
                () => {
                    console.log(`wait 1000 ms end`);
                    resolve()
                },
            1000
        )
    );
    console.log('async end');
});
```

然后将其他中间件修改为 await next() 方式，如下中间件 1 的方式：

```
**
 * 中间件 1
 */
app.use(async (req, res, next) => {
    console.log('first');
    await next();
    console.log('first end');
});
```

重新运行，最终输出结果为：

可以看出，从外向内的是正常的，一层层往里进行调用，从内向外时则发生了一些变化，最主要的原因是异步中间件并没有按照顺序输出执行结果。

（2）Koa 保持上面的代码顺序，只将对应的 express 语法改成 koa 语法，其中中间件 1 和异步中间件代码部分如下示例：

```
const Koa = require('koa');
const app = new Koa();
/**
 * 中间件 1
 */
app.use(async (ctx, next) => {
    console.log('first');
    await next();
    console.log('first end');
});
/**
 * 异步中间件
 */
app.use(async (ctx, next) => {
    console.log('async');
    await next();
    await new Promise(
        (resolve) =>
            setTimeout(
                () => {
                    console.log(`wait 1000 ms end`);
                    resolve()
                },
            1000
        )
    );
    console.log('async end');
});

```

重新运行，最终输出结果为：
你会发现，KOA 严格按照了洋葱模型的执行，从上到下，也就是从洋葱的内部向外部，输出 first、second、async、third；接下来从内向外输出 third end、async end、second end、first end。

---
