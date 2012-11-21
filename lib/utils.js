/*!
 * Railstyle Router v1.1.1
 * Copyright(c) 2012 wǒ_is神仙 <i@mrzhang.me>
 * MIT Licensed
 */

/**
 * Utilities
 */
var join = require('path').join
var capitalize = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

exports.intersection = require('underscore').intersection

exports.difference = require('underscore').difference

exports.isFunction = require('underscore').isFunction

exports.toArray = function(s) {
  if (Array.isArray(s)) {
    return s
  }
  return s.replace(/ /g, '').split(',')
}

exports.getMethod = function(action) {
  switch (action) {
    case 'create':
      return 'post'
    case 'update':
      return 'put'
    case 'destroy':
      return 'delete'
    default:
      return 'get'
  }
}

exports.setPath = function(action, onMember) {
  var id = onMember && ':id'
  var en = require('lingo').en
  var ns = (this.namespace || '') + '/'
  var parents = [].concat(this.app.routesMap[ns][this.name] || [])
    .map(function(i) {
      return i[1] + '/:' + en.singularize(i[0]) + '_id'
    })
    .join('/')
  var pathname = this.pathname
  var ret

  switch (action) {
    case 'index':
    case 'create':
      ret = pathname
      break

    case 'new':
      ret = join(pathname, 'new')
      break

    case 'show':
    case 'update':
    case 'destroy':
      ret = join(pathname, id)
      break

    case 'edit':
      ret = join(pathname, id, 'edit')
      break

    default:
      ret = join(pathname, onMember && id, action)
  }

  return join('/', this.namespace, parents, ret + '.:format?')
}

exports.setController = function(app, namespace, name) {
  return join(
    app.settings.controllers,
    namespace,
    name + (app.settings['controller suffix'] || '')
  )
}

exports.throwError = function(namespace, name, action) {
  namespace = namespace ?
    namespace.split('/').map(function(i) {
      return capitalize(i) + '::'
    }).join('') : ''
  name = capitalize(name)

  return function() {
    throw new Error(
      'Unknown action "' + action + '" for ' + namespace + name + 'Controller'
    )
  }
}

exports.combo = function(x, y) {
  return [].concat(x, y).filter(function(i) {
    return exports.isFunction(i)
  })
}
