/*!
 * Railstyle Router v1.2.0
 * Copyright(c) 2012 wǒ_is神仙 <i@mrzhang.me>
 * MIT Licensed
 */

var util = require('./utils')

var METHODS = ['get', 'post', 'put', 'delete']
var ACTIONS = ['index', 'show', 'new', 'edit', 'create', 'update', 'destroy']
var EXPORTS = ['member', 'collection', 'resources', 'resource']


var Router = module.exports = function(app, name, options, onMember) {
  var namespace = this.namespace = options['namespace']
  this.app = app

  // break, for app.namespace()
  if (name == null) {
    return this
  }

  var controller = this.controller = util.setController(app, namespace, name)
  var actions = [].concat(ACTIONS)
  var _this = this
  var before, args

  this.name = name
  this.pathname = options['path'] || name

  // exclude the `index` action, for app.resource()
  onMember || actions.shift()
  // filter
  actions = options['only'] ? util.intersection(options['only'], actions) :
    options['except'] ? util.difference(actions, options['except']) : actions

  actions.forEach(function(action) {
    // Maybe options['only'] == [], don't need to load controller file
    // so use require() in forEach
    before = require(controller)['before_filter']
    args = before ? util.combo(before['*'], before[action]) : []
    args.unshift(util.setPath.call(_this, action, onMember))
    args.push(
      util.createCallback(require(controller)[action], namespace, name, action)
    )

    app[util.getMethod(action)].apply(app, args)
  })

  return this
}

/**
 * To add a member/collection route into the resource block.
 *
 * this.member({
 *   get: 'search, profile',
 *   post: ['save', 'apply']
 * })
 */
EXPORTS.slice(0, 2).forEach(function(api) {
  Router.prototype[api] = function(routes) {
    var name = this.name
    if (!name) {
      return false
    }

    var app = this.app
    var namespace = this.namespace
    // In any case, controller file will be loaded
    // so use require() out of forEach
    var controller = require(this.controller)
    var before = controller['before_filter']
    var methods = util.intersection(Object.keys(routes), METHODS)
    var _this = this
    var args

    methods.forEach(function(method) {
      util.toArray(routes[method]).forEach(function(action) {
        args = before ? util.combo(before['*'], before[action]) : []
        args.unshift(util.setPath.call(_this, action, api === 'member'))
        args.push(
          util.createCallback(controller[action], namespace, name, action)
        )

        app[method].apply(app, args)
      })
    })

    // chain
    return this
  }
})

/**
 * Alias for app.resource[s]
 */
EXPORTS.slice(2).forEach(function(api) {
  Router.prototype[api] = function(name, options, callback) {
    var app = this.app
    var parentName = this.name

    if (util.isFunction(options)) {
      callback = options
      options = {}
    }

    options || (options = {})
    options['namespace'] = this.namespace

    // nested
    if (parentName) {
      var ns = (this.namespace || '') + '/'
      var parents = [].concat(app.routesMap[ns][parentName] || [])
      parents.push([parentName, this.pathname])
      app.routesMap[ns][name] = parents
    }

    return app[api](name, options, callback)
  }
})
