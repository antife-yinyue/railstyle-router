# Rails-like routing for Express 3.x

高仿 Rails 路由的几个常用方法，支持 namespace，支持（链式）多级嵌套，支持 before_filter 和 skip_before_filter。欢迎 Pull Requests。

## Installation

```bash
$ npm install railstyle-router
```

## Usage

```js
require('railstyle-router')
var express = require('express')
var app = express()

app.configure(function() {
  // 设置 controller 目录的路径
  app.set('controllers', __dirname + '/controllers')
  // 设置 controller 文件名后缀，默认为空
  app.set('controller suffix', '_controller')
})

app.resources('users')
app.match('/login', 'sessions#new')
```

`./controllers/users_controller.js`:

```js
// GET /users
exports.index = function(req, res) {
  console.log(req.namespace)
  console.log(req.controller)
  console.log(req.action)

  res.send('index')
}

// GET /users/new
exports.new = function(req, res) {
  res.send('new')
}

// POST /users
exports.create = function(req, res) {
  res.send('create')
}

// GET  /users/:id
exports.show = function(req, res) {
  res.send('show')
}

// GET  /users/:id/edit
exports.edit = function(req, res) {
  res.send('edit')
}

// PUT  /users/:id
exports.update = function(req, res) {
  res.send('update')
}

// DELETE  /users/:id
exports.destroy = function(req, res) {
  res.send('destroy')
}
```

## APIs

### .resources(name, [options])

默认绑定 `index`, `show`, `new`, `edit`, `create`, `update`, `destroy` 七个 actions。

`options` 支持：
- `path`: 重写 URL 路径，不设置则默认同 `name` 一致
- `only`: 指定需要保留的 actions，可以传入数组，亦可传入以逗号分隔的字符串。如果想排除所有的 actions，请传入空数组 `[]`，而非空字符串或其他
- `except`: 排除指定的 actions，可以传入数组，亦可传入以逗号分隔的字符串

举个栗子:chestnut:：

```bash
app.resources('users')

GET    /users.:format?            users#index
GET    /users/:id.:format?        users#show
GET    /users/new.:format?        users#new
GET    /users/:id/edit.:format?   users#edit
POST   /users.:format?            users#create
PUT    /users/:id.:format?        users#update
DELETE /users/:id.:format?        users#destroy
```
```bash
app.resources('users', {
  path: 'person',
  only: ['show', 'new', 'create']
})

GET  /person/:id.:format?   users#show
GET  /person/new.:format?   users#new
POST /person.:format?       users#create
```

### .resource(name, [options])

默认绑定 `show`, `new`, `edit`, `create`, `update`, `destroy` 六个 actions。
`options` 同 `resources`。

举个:chestnut:：

```bash
app.resource('users')

GET    /users.:format?        users#show
GET    /users/new.:format?    users#new
GET    /users/edit.:format?   users#edit
POST   /users.:format?        users#create
PUT    /users.:format?        users#update
DELETE /users.:format?        users#destroy
```

### .member(routes)  /  .collection(routes)

这两个方法用于创建非 RESTful 的路由，配合 `resources` 和 `resource` 使用：

```bash
app.resources('users', { only: [] }, function() {
  this.member({
    get: 'profile, avatar'
  })
})

GET  /users/:id/profile.:format?   users#profile
GET  /users/:id/avatar.:format?    users#avatar
```
```bash
app.resources('users', { only: [] }, function() {
  this.collection({
    get: ['profile', 'avatar']
  })
})

GET  /users/profile.:format?   users#profile
GET  /users/avatar.:format?    users#avatar
```

回调君还能协助实现嵌套路由，上:chestnut:：

```bash
app.resources('users', { only: 'show' }, function() {
  this.resources('tweets', function() {
    this.resource('comments', { only: 'show' })
    this.member({ post: 'balabala' })
  })
})

GET    /users/:id.:format?                                  users#show

GET    /users/:user_id/tweets.:format?                      tweets#index
GET    /users/:user_id/tweets/:id.:format?                  tweets#show
GET    /users/:user_id/tweets/new.:format?                  tweets#new
GET    /users/:user_id/tweets/:id/edit.:format?             tweets#edit
POST   /users/:user_id/tweets.:format?                      tweets#create
PUT    /users/:user_id/tweets/:id.:format?                  tweets#update
DELETE /users/:user_id/tweets/:id.:format?                  tweets#destroy
POST   /users/:user_id/tweets/:id/balabala.:format?         tweets#balabala

GET    /users/:user_id/tweets/:tweet_id/comments.:format?   comments#show
```

不喜欢回调回调再回调？试试链式的：

```bash
app.resources('users', { only: 'show' })
   .resources('tweets').member({ post: 'balabala' })
   .resource('comments', { only: 'show' })

GET    /users/:id.:format?                                  users#show

GET    /users/:user_id/tweets.:format?                      tweets#index
GET    /users/:user_id/tweets/:id.:format?                  tweets#show
GET    /users/:user_id/tweets/new.:format?                  tweets#new
GET    /users/:user_id/tweets/:id/edit.:format?             tweets#edit
POST   /users/:user_id/tweets.:format?                      tweets#create
PUT    /users/:user_id/tweets/:id.:format?                  tweets#update
DELETE /users/:user_id/tweets/:id.:format?                  tweets#destroy
POST   /users/:user_id/tweets/:id/balabala.:format?         tweets#balabala

GET    /users/:user_id/tweets/:tweet_id/comments.:format?   comments#show
```

### .match(path, [namespace/]controller#action)

使某个 controller 下的 action 与指定的路径匹配，同时兼容 `get`, `post`, `put`, `delete` 四个 HTTP verbs。如果这个 action 属于 `.resources()` 默认 actions 的其中之一，则只会匹配相对应的路由。

```bash
app.match('/login', 'sessions#new')

GET  /login.:format?   sessions#new
```

```bash
app.match('/login', 'sessions#create')

POST  /login.:format?   sessions#create
```

```bash
app.match('/login', 'sessions#ooxx')

GET|POST|PUT|DELETE  /login.:format?   sessions#ooxx
```

### .namespace(path, callback)

```bash
app.namespace('admin', function() {
  // load `./controllers/admin/users_controller.js`
  this.resources('users', { except: ['index', 'destroy'] })
})

GET  /admin/users/:id.:format?        admin/users#show
GET  /admin/users/new.:format?        admin/users#new
GET  /admin/users/:id/edit.:format?   admin/users#edit
POST /admin/users.:format?            admin/users#create
PUT  /admin/users/:id.:format?        admin/users#update
```

同样支持链式：

```bash
app.namespace('admin').resources('users', { except: ['index', 'destroy'] })

GET  /admin/users/:id.:format?        admin/users#show
GET  /admin/users/new.:format?        admin/users#new
GET  /admin/users/:id/edit.:format?   admin/users#edit
POST /admin/users.:format?            admin/users#create
PUT  /admin/users/:id.:format?        admin/users#update
```

## before_filter

在 controller 文件中加上如下代码即可。action 跟 middleware 可以一对一、一对多、多对一、多对多。星号 `*` 匹配所有 actions，且优先级最高。

```js
exports.before_filter = {
  '*': fn1,
  'create, update': fn2,
  'create': [fn3, fn4],
  'destroy': fn4
}

function fn1(req, res, next) {
  // ...
  next()
}
function fn2(req, res, next) {
  // ...
  next()
}
function fn3(req, res, next) {
  // ...
  next()
}
function fn4(req, res, next) {
  // ...
  next()
}
```

如果一个项目所有页面都需要登录后才能访问，你会想到什么？在所有 controller 文件里写 `exports.before_filter = { '*': checkLogin }`。没错，可是不是太麻烦呢？然后你肯定会想到使用 Express 的 `app.use()`，哈哈，非常正确！这时PM邪恶的说，把其中N个页面排除在外，不登录也能访问。此时你内心独白会不会是：靠！

呵呵~ 别怕，往下看！

## skip_before_filter

在需要 skip 的 controller 里：

```js
exports.skip_before_filter = ['new', 'show']
// 等价
// exports.skip_before_filter = 'new, show'
```

然后你的 `app.use()` 可以这样：

```js
app.use(function(req, res, next) {
  if (req.skip_before_filter) {
    return next()
  }
  // ...
})
```

借助 `app.use()` 可以解决全局问题，当然如果单个 controller 是下面这样，skip_before_filter 自动生效：

```js
exports.before_filter = {
  'create, update': fn
}

exports.skip_before_filter = 'create'
```

等价于：

```js
exports.before_filter = {
  'update': fn
}
```

## License

Licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
