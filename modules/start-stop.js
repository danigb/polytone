/**
 * Start-stop module
 *
 * @module start-stop
 */
module.exports = function (polytone) {
  var tracked = {}
  var nextId = 0

  polytone.start = function (name, when, options) {
    var opts = options || {}
    var node = polytone.createNode(name, opts)
    if (!node) return null
    node.connect(polytone)

    when = Math.max(when, polytone.ac.currentTime)
    polytone.emit('start', when, name, options)
    node.start(when)
    tracked[node.id] = node
  }

  // super
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
      polytone.emit('stop', when, node.id, node)
      stop.call(node, when)
    }
    return node
  }

  polytone.stop = function (when, ids) {
    ids = ids || Object.keys(tracked)
    var now = polytone.ac.currentTime
    when = when > now ? when : now
    return ids.map(function (id) {
      var node = tracked[id]
      if (!node) return null
      node.stop(when)
      delete tracked[id]
      return id
    }).filter(function (x) { return x })
  }

  return polytone
}
