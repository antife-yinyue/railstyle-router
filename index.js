/*!
 * Railstyle Router v1.4.0
 * Copyright(c) 2012 wǒ_is神仙 <i@mrzhang.me>
 * MIT Licensed
 */

var express = require('express').application
var Router = require('./lib/router')
var util = require('./lib/utils')
var METHODS = Router._methods
var ACTIONS = Router._actions

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
  express[api] = function(name, options, callback) {
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
 * app.match('path', 'namespace/controller#action', 'methods')
 */
express['match'] = function(path, to, via) {
  var i = to.lastIndexOf('#')
  if (i === -1) {
    return false
  }

  var j = to.lastIndexOf('/')
  var namespace = j !== -1 && to.slice(0, j)
  var controller = to.slice(j + 1, i)
  var action = to.slice(i + 1)

  var app = this
  var actions = require(util.setController(app, namespace, controller))
  var skips = util.toArray(actions['skip_before_filter'])
  var args = util.combo(action, actions['before_filter'], skips)

  args.unshift(path)
  args.push(
    util.createCallback(actions[action], namespace, controller, action, skips)
  )

  if (via = util.toArray(via)) {
    via.forEach(function(method) {
      app[method].apply(app, args)
    })
    return false
  }

  switch (i = ACTIONS.indexOf(action)) {
    case -1:
      METHODS.forEach(function(method) {
        app[method].apply(app, args)
      })
      break

    case 4:
    case 5:
    case 6:
      app[METHODS[i - 3]].apply(app, args)
      break

    default:
      app.get.apply(app, args)
  }
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
express['namespace'] = function(path, callback) {
  var router = new Router(this, null, {namespace: path})

  this.routesMap[path + '/'] = {}

  util.isFunction(callback) && callback.call(router)

  // chain
  return router
}

express['routesMap'] = {
  '/': {}
}
