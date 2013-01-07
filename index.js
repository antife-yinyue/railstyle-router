/*!
 * Railstyle Router v1.3.0
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

    // chain
    return router
  }
})

/**
 * Matches a url pattern to one or more routes.
 *
 * app.match('path', 'namespace/controller#action')
 */
app['match'] = function(path, to) {
  var i = to.lastIndexOf('#')
  if (i === -1) {
    return false
  }

  var j = to.lastIndexOf('/')
  var namespace = j !== -1 && to.slice(0, j)
  var controller = to.slice(j + 1, i)
  var action = to.slice(i + 1)

  var actions = require(util.setController(this, namespace, controller))
  var args = util.combo(actions['before_filter'], action)
  args.unshift(path)
  args.push(
    util.createCallback(actions[action], namespace, controller, action)
  )

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
  var router = new Router(this, null, {namespace: path})

  this.routesMap[path + '/'] = {}

  util.isFunction(callback) && callback.call(router)

  // chain
  return router
}

app['routesMap'] = {
  '/': {}
}
