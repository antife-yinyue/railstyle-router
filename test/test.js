var express = require('express')
require('../')
require('should')

var methods = ['get', 'post', 'put', 'delete']
var mapRoutes = function(app) {
  var ret = {}
  methods.forEach(function(method) {
    ret[method] = [].concat(app.routes[method] || []).map(function(i) { return i.path })
  })
  return ret
}

describe('', function() {
  var app, routes

  beforeEach(function() {
    app = express()

    app.configure(function() {
      app.set('controllers', __dirname + '/controllers')
      app.set('controller suffix', '_controller')
    })
  })

  it('load the controller file correctly', function() {
    var users = app.resources('users')
    users.controller.should.equal(
      app.get('controllers') + '/users' + app.get('controller suffix')
    )
  })

  it('app.resources: index, show, new, edit, create, update, destroy', function() {
    app.resources('users')
    routes = mapRoutes(app)

    routes.get.should
      .have.length(4).and
      .include('/users.:format?').and
      .include('/users/:id.:format?').and
      .include('/users/new.:format?').and
      .include('/users/:id/edit.:format?')
    routes.post.should
      .have.length(1).and
      .include('/users.:format?')
    routes.put.should
      .have.length(1).and
      .include('/users/:id.:format?')
    routes.delete.should
      .have.length(1).and
      .include('/users/:id.:format?')
  })

  it('app.resource: show, new, edit, create, update, destroy', function() {
    app.resource('users')
    routes = mapRoutes(app)

    routes.get.should
      .have.length(3).and
      .include('/users.:format?').and
      .include('/users/new.:format?').and
      .include('/users/edit.:format?')
    routes.post.should
      .have.length(1).and
      .include('/users.:format?')
    routes.put.should
      .have.length(1).and
      .include('/users.:format?')
    routes.delete.should
      .have.length(1).and
      .include('/users.:format?')
  })

  it('allow options to be passed in', function() {
    app.resources('users', {
      path: 'person',
      only: ['show', 'new', 'create', 'x', 'y', 'z']
    })
    routes = mapRoutes(app)

    routes.get.should
      .have.length(2).and
      .include('/person/:id.:format?').and
      .include('/person/new.:format?')
    routes.post.should
      .have.length(1).and
      .include('/person.:format?')
    routes.put.should.be.empty
    routes.delete.should.be.empty
  })

  it('allow non-standard restfull routing', function() {
    app.resources('users', { only: [] }, function() {
      this.member({
        get: 'profile, avatar'
      })
      this.collection({
        get: ['profile', 'avatar']
      })
    })
    routes = mapRoutes(app)

    routes.get.should
      .include('/users/:id/profile.:format?').and
      .include('/users/:id/avatar.:format?').and
      .include('/users/profile.:format?').and
      .include('/users/avatar.:format?')
  })

  it('nested routes', function() {
    app.resources('users', { only: ['show'] }, function() {
      this.resources('tweets', function() {
        this.resource('comments', { only: ['show'] })
        this.member({ post: 'balabala' })
      })
    })
    routes = mapRoutes(app)

    routes.get.should.include('/users/:user_id/tweets/:tweet_id/comments.:format?')
    routes.post.should.include('/users/:user_id/tweets/:id/balabala.:format?')
  })

  it('chain', function() {
    app.resources('users', { only: ['show'] })
       .resources('tweets').member({ post: 'balabala' })
       .resource('comments', { only: ['show'] })
    routes = mapRoutes(app)

    routes.get.should.include('/users/:user_id/tweets/:tweet_id/comments.:format?')
    routes.post.should.include('/users/:user_id/tweets/:id/balabala.:format?')
  })

  it('app.match', function() {
    app.match('/login', 'sessions#new')
    routes = mapRoutes(app)

    routes.get.should.include('/login')
  })

  it('app.namespace', function() {
    var users = app.namespace('admin', function() {
      this.resources('users')
    })
    routes = mapRoutes(app)

    users.namespace.should.equal('admin')
    routes.get[0].should.match(/^\/admin\//)
  })

  it('chain for app.namespace', function() {
    var users = app.namespace('admin').resources('users')
    routes = mapRoutes(app)

    users.namespace.should.equal('admin')
    routes.get[0].should.match(/^\/admin\//)
  })

  it('nested namespace', function() {
    var users = app.namespace('admin/group').resources('users')
    routes = mapRoutes(app)

    users.namespace.should.equal('admin/group')
    routes.get[0].should.match(/^\/admin\/group\//)
  })
})
