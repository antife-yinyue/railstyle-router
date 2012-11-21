/*!
 * UsersController
 */

// Middlewares
function auth(req, res, next) {
  // ...
  next()
}
function admin(req, res, next) {
  // ...
  next()
}
function master(req, res, next) {
  // ...
  next()
}

exports.before_filter = {
  '*': auth,
  create: admin,
  destroy: [admin, master]
}

// GET /users
exports.index = function(req, res) {
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

// non-standard RESTfull
exports.profile = function(req, res) {
  res.send('profile')
}

exports.avatar = function(req, res) {
  res.send('profile')
}
