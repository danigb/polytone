var test = require('tape')
var startStop = require('../modules/start-stop')

function stub (value) {
  return function fn () {
    fn.last = Array.prototype.slice(arguments)
    fn.events = fn.events || []
    fn.events.push(fn.last)
    return typeof value === 'function' ? value() : value
  }
}

function stubPolytone () {
  return {
    ac: { currentTime: 10 },
    emit: stub(),
    createNode: stub(function () {
      return { connect: stub(), start: stub(), stop: stub() }
    })
  }
}

test(function (t) {
  var p = startStop(stubPolytone())
  var obj = p.start('C2', 10, { gain: 0.3 })
  t.equal(typeof obj.stop, 'function')
  t.end()
})
