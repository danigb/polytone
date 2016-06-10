'use strict'

function time (ac, when) { return Math.max(when || 0, ac.currentTime) }

module.exports = function (polytone) {
  if (!polytone.emit) throw Error('StartStop module requires Emitter')
  var tracked = {}
  var nextId = 0

  /**
   * Start a sound
   * @function start
   * @memberof polytone
   */
  polytone.start = function (name, when, options) {
    var opts = options || {}
    var node = polytone.createNode(name, opts)
    if (!node) return null
    node.connect(polytone)

    when = time(polytone.ac, when)
    polytone.emit('start', when, name, node)
    node.start(when)
    tracked[node.id] = node
    return node
  }

  polytone.play = polytone.start

  // Overrides createNode
  var create = polytone.createNode
  polytone.createNode = function (name, opts) {
    var node = create(name, opts)
    node.id = nextId++
    node.onended = function () {
      polytone.emit('ended', polytone.ac.currentTime, node.id, node)
      node.disconnect()
    }
    var stop = node.stop
    node.stop = function (when) {
      console.log('MIERDA', when, polytone.ac.currentTime, node.id)
      when = time(polytone.ac, when)
      polytone.emit('stop', when, node.id, node)
      if (stop) stop.call(node, when)
    }
    return node
  }

  /**
   * Stops some or all sounds
   * @function stop
   * @memberof polytone
   */
  polytone.stop = function (when, ids) {
    ids = ids || Object.keys(tracked)
    when = time(polytone.ac, when)

    return ids.map(function (id) {
      var node = tracked[id]
      if (!node) return null
      console.log('stopping...', node, when)
      node.stop(when)
      delete tracked[id]
      return id
    }).filter(function (x) { return x })
  }

  return polytone
}
