var test = require('tape')

function Tracker (options) {
  var nextId = 0
  var tracked = {}

  return {
    track: function (node) {
      if (!node.id) node.id = nextId++
      tracked[node.id] = node
    },
    stopAll: function () {
      Object.keys(tracked).forEach(function (id) {
        tracked[id].stop()
      })
    }
  }
}

tape('Should stop all voicings', function () {
  var tracker = Tracker({})
  var node = tracker.track({})
})
