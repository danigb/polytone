var scheduler = require('./scheduler')
var events = require('./events')
var track = require('./track')
// var midi = require('./midi')

var EMPTY = {}
var max = Math.max

function polytone (ac, sources, options) {
  if (arguments.length === 1) return function (f, o) { return polytone(ac, f, o) }
  if (!sources) throw Error('You need to specify a source(s)')

  var player = { ac: ac, opts: options || EMPTY, out: ac.createGain() }

  if (typeof sources === 'function') player.source = sources
  else player.sources = sources

  player.connect = function (dest) {
    player.out.connect(dest)
    return player
  }
  player.names = function () {
    return player.sources ? Object.keys(sources) : []
  }

  player.inst = function (name) {
    return function (options) {
      var source
      if (player.source) player.source(player.ac)(name, options)
      else if ((source = sources[name])) source(player.ac)(options)
      else null
    }
  }

  player.createNode = function (name, options) {
    if (player.sources) {
      var f = sources[name]
      return f ? f(player.ac)(options) : null
    } else if (player.source) {
      return player.source(player.ac)(name, options)
    }
  }

  player.start = function (name, when, options) {
    var opts = options || EMPTY
    var node = player.createNode(name, opts)
    if (!node) return null
    node.connect(player.out)

    when = max(when, ac.currentTime)
    player.emit('start', when, name, options)
    node.start(when)
    return node
  }

  player.emit = function (event, when, obj, opts) {
    if (player.onevent) player.onevent(event, when, obj, opts)
    var fn = player['on' + event]
    if (fn) fn(when, obj, opts)
  }

  return track(scheduler(events(player)))
}

module.exports = polytone
