/*!
 * Railstyle Router v1.5.0
 * Copyright(c) 2012 wǒ_is神仙 <i@mrzhang.me>
 * MIT Licensed
 */

var join = require('path').join

/**
 * Utilities
 */
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
  return s && s.replace(/ /g, '').split(',')
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
    name + (app.settings['controller suffix'] || '') + '.js'
  )
}

exports.createCallback = function(fn, namespace, name, action) {
  if (isFunction(fn)) {
    return function(req, res) {
      req.namespace = namespace
      req.controller = name
      req.action = action

      fn(req, res)
    }
  }

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

// combo middlewares in `before_filter` for each HTTP method,
// but except what's in `skip_before_filter`
exports.combo = function(app, action, filters, skips) {
  skips = _filter(skips, action)
  // skip everything
  if (skips.indexOf(true) !== -1) {
    return []
  }

  filters = _filter(filters, action)
  // unshift the global middleware for `before_filter`
  if (skips.indexOf('-g') === -1) {
    if (!app.hasOwnProperty('_globalFilter')) {
      var g = exports.setController(app, null, 'application')

      app._globalFilter = require('fs').existsSync(g) &&
        isFunction(require(g)) &&
        require(g)
    }

    filters.unshift(app._globalFilter)
  }

  return exports.difference(filters, skips).filter(function(fn) {
    return isFunction(fn)
  })
}

// helper
function _filter(obj, action) {
  var ret = []
  obj || (obj = {})
  ret.push(obj['*'])

  for (var key in obj) {
    key.split(',').forEach(function(m) {
      if ((m = m.trim()) === action) {
        ret = ret.concat(obj[key])
      }
    })
  }

  return ret
}
