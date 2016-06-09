var scheduler = require('./scheduler')
var events = require('./events')
var track = require('./track')
// var midi = require('./midi')

var EMPTY = {}

function Polytone (ac, sources, options) {
  if (arguments.length === 1) return function (f, o) { return Polytone(ac, f, o) }
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

  player.createNode = function (name, options) {
    var f = sources[name]
    return f ? f(player.ac)(options) : null
  }

  player.start = function (name, when, options) {
    player.emit('start', when, name, options)
    var opts = options || EMPTY
    var node = player.createNode(name, opts)
    if (!node) return null
    node.connect(player.out)

    var now = player.ac.currentTime
    node.start(when > now ? when : now)
    return node
  }

  player.emit = function (event, when, obj, opts) {
    if (player.onevent) player.onevent(event, when, obj, opts)
    var fn = player['on' + event]
    if (fn) fn(when, obj, opts)
  }

  return track(scheduler(events(player)))
}

module.exports = Polytone
