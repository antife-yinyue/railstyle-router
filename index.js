/*!
 * Railstyle Router v1.0.0
 * Copyright(c) 2012 wǒ_is神仙 <i@mrzhang.me>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var app = require('express').application
var Router = require('./lib/router')
var util = require('./lib/utils')


/**
 * Resource routing allows you to quickly declare all of the common routes for
 * a given resourceful controller.
 *
 * app.resource[s](name, [options], [callback])
 *
 * options:
 *   path -> Allows you to change the path prefix for the resource.
 *   only -> Only generate routes for the given actions.
 *   except -> Generate all routes except for the given actions.
 */
Array.prototype.concat('resources', 'resource').forEach(function(api) {
  app[api] = function(name, options, callback) {
    if (util.isFunction(options)) {
      callback = options
      options = {}
    }
    options || (options = {})

    var router = new Router(this, name, options, api === 'resources')
    util.isFunction(callback) && callback.call(router)
  }
})

/**
 * Matches a url pattern to one or more routes.
 *
 * app.match('path', 'namespace/controller#action')
 */
app['match'] = function(path, to) {
  var i = to.lastIndexOf('/')
  var j = to.lastIndexOf('#')
  var namespace = to.slice(0, i)
  var controller = to.slice(i + 1, j)
  var action = to.slice(j + 1)
  var actions = require(util.setController(this, namespace, controller))

  var cb = actions[action]
  util.isFunction(cb) || (cb = util.throwError(namespace, controller, action))

  var before = actions['before_filter']
  var args = before ? util.combo(before['*'], before[action]) : []
  args.unshift(path)
  args.push(cb)

  this.all.apply(this, args)
}

/**
 * Scopes routes to a specific namespace.
 *
 * app.namespace('path', function() {
 *   this.resources()
 *   this.resource()
 *   ...
 * })
 */
app['namespace'] = function(path, callback) {
  this.routesMap[path + '/'] = {}
  callback.call(new Router(this, null, {namespace: path}))
}

app['routesMap'] = {
  '/': {}
}
