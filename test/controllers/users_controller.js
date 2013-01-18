/*!
 * UsersController
 */

var requireLogin = require('./application_controller').requireLogin

function superman(req, res, next) {
  // ...
  next()
}

exports.before_filter = {
  '*': superman,
  'create': requireLogin
}

exports.skip_before_filter = {
  'show': true,
  'new': ['-g', superman]
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
