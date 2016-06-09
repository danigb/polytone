
function track (player) {
  var tracked = {}
  var nextId = 0
  var create = player.createNode
  var start = player.start

  player.start = function (name, when, opts) {
    var node = start(name, when, opts)
    tracked[node.id] = node
  }

  player.createNode = function (name, opts) {
    var node = create(name, opts)
    node.id = nextId++
    node.onended = function () {
      player.emit('ended', player.ac.currentTime, node.id, node)
      node.disconnect()
    }
    var stop = node.stop
    node.stop = function (when) {
      player.emit('stop', when, node.id, node)
      stop.call(node, when)
    }
    return node
  }

  player.stop = function (when, ids) {
    ids = ids || Object.keys(tracked)
    var now = player.ac.currentTime
    when = when > now ? when : now
    return ids.map(function (id) {
      var node = tracked[id]
      if (!node) return null
      node.stop(when)
      delete track[id]
      return id
    }).filter(function (x) { return x })
  }

  return player
}

module.exports = track
