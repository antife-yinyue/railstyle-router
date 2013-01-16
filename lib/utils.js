/*!
 * Railstyle Router v1.3.0
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

var isFunction = exports.isFunction = function(val) {
  return Object.prototype.toString.call(val) === '[object Function]'
}

exports.intersection = function(arr1, arr2) {
  return arr1.filter(function(i) {
    return arr2.indexOf(i) !== -1
  })
}

exports.difference = function(ref, except) {
  return ref.filter(function(i) {
    return except.indexOf(i) === -1
  })
}

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

exports.createCallback = function(fn, namespace, name, action, skips) {
  if (isFunction(fn)) {
    return function(req, res) {
      req.namespace = namespace
      req.controller = name
      req.action = action
      req.skip_before_filter = skips && skips.indexOf(action) !== -1

      fn(req, res)
    }
  }
  else {
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
}

// combo middleware in before_filter for each http action
exports.combo = function(action, object, skips) {
  if (!object) {
    return []
  }

  var ret = {}
  var all = object['*']
  delete object['*']

  for (var key in object) {
    key.split(',').forEach(function(i) {
      i = i.trim()
      ret[i] = (ret[i] || []).concat(object[key])
    })
  }

  if (skips && skips.indexOf(action) !== -1) {
    delete ret[action]
  }

  return [].concat(all, ret[action]).filter(function(fn) {
    return isFunction(fn)
  })
}
