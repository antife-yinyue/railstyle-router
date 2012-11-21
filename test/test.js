var expect = require('chai').expect
var express = require('express')
require('../')

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
    expect(users.controller).to.be.equal(
      app.get('controllers') + '/users' + app.get('controller suffix')
    )
  })

  it('app.resources: index, show, new, edit, create, update, destroy', function() {
    app.resources('users')
    routes = mapRoutes(app)

    expect(routes.get)
      .to.have.length(4).and
      .to.include('/users.:format?').and
      .to.include('/users/:id.:format?').and
      .to.include('/users/new.:format?').and
      .to.include('/users/:id/edit.:format?')
    expect(routes.post)
      .to.have.length(1).and
      .to.include('/users.:format?')
    expect(routes.put)
      .to.have.length(1).and
      .to.include('/users/:id.:format?')
    expect(routes.delete)
      .to.have.length(1).and
      .to.include('/users/:id.:format?')
  })

  it('app.resource: show, new, edit, create, update, destroy', function() {
    app.resource('users')
    routes = mapRoutes(app)

    expect(routes.get)
      .to.have.length(3).and
      .to.include('/users.:format?').and
      .to.include('/users/new.:format?').and
      .to.include('/users/edit.:format?')
    expect(routes.post)
      .to.have.length(1).and
      .to.include('/users.:format?')
    expect(routes.put)
      .to.have.length(1).and
      .to.include('/users.:format?')
    expect(routes.delete)
      .to.have.length(1).and
      .to.include('/users.:format?')
  })

  it('allow options to be passed in', function() {
    app.resources('users', {
      path: 'person',
      only: ['show', 'new', 'create', 'x', 'y', 'z']
    })
    routes = mapRoutes(app)

    expect(routes.get)
      .to.have.length(2).and
      .to.include('/person/:id.:format?').and
      .to.include('/person/new.:format?')
    expect(routes.post)
      .to.have.length(1).and
      .to.include('/person.:format?')
    expect(routes.put).to.be.empty
    expect(routes.delete).to.be.empty
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

    expect(routes.get)
      .to.include('/users/:id/profile.:format?').and
      .to.include('/users/:id/avatar.:format?').and
      .to.include('/users/profile.:format?').and
      .to.include('/users/avatar.:format?')
  })

  it('nested routes', function() {
    app.resources('users', { only: ['show'] }, function() {
      this.resources('tweets', function() {
        this.resource('comments', { only: ['show'] })
        this.member({ post: 'balabala' })
      })
    })
    routes = mapRoutes(app)

    expect(routes.get).to.include('/users/:user_id/tweets/:tweet_id/comments.:format?')
    expect(routes.post).to.include('/users/:user_id/tweets/:id/balabala.:format?')
  })

  it('chain', function() {
    app.resources('users', { only: ['show'] })
       .resources('tweets').member({ post: 'balabala' })
       .resource('comments', { only: ['show'] })
    routes = mapRoutes(app)

    expect(routes.get).to.include('/users/:user_id/tweets/:tweet_id/comments.:format?')
    expect(routes.post).to.include('/users/:user_id/tweets/:id/balabala.:format?')
  })

  it('app.match', function() {
    app.match('/login', 'sessions#new')
    routes = mapRoutes(app)

    expect(routes.get).to.include('/login')
  })

  it('app.namespace', function() {
    var users = app.namespace('admin', function() {
      this.resources('users')
    })
    routes = mapRoutes(app)

    expect(users.namespace).to.be.equal('admin')
    expect(routes.get[0]).to.match(/^\/admin\//)
  })

  it('chain for app.namespace', function() {
    var users = app.namespace('admin').resources('users')
    routes = mapRoutes(app)

    expect(users.namespace).to.be.equal('admin')
    expect(routes.get[0]).to.match(/^\/admin\//)
  })

  it('nested namespace', function() {
    var users = app.namespace('admin/group').resources('users')
    routes = mapRoutes(app)

    expect(users.namespace).to.be.equal('admin/group')
    expect(routes.get[0]).to.match(/^\/admin\/group\//)
  })
})
