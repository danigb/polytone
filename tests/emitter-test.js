var test = require('tape')
var emitter = require('../modules/emitter')

function eventHandler () {
  function handler () {
    handler.last = Array.prototype.slice.call(arguments)
    handler.events.push(handler.last)
  }
  handler.last = null
  handler.events = []
  return handler
}

test('emits events', function (t) {
  var p = emitter({})
  p.onevent = eventHandler()
  p.emit('eventType', 0.5, 'object')
  t.deepEqual(p.onevent.last, [ 'eventType', 0.5, 'object', undefined ])
  t.end()
})

test('`on` without name receives all events', function (t) {
  var handler = eventHandler()
  var p = emitter({}).on(handler)
  p.emit('start', 0, 'a')
  p.emit('stop', 0, 'b')
  t.equal(handler.events.length, 2)
  t.end()
})

test('`on` with name filter event types', function (t) {
  var handler = eventHandler()
  var p = emitter({}).on('start', handler)
  p.emit('start', 0, 'A')
  p.emit('stop', 0, 'A')
  t.equal(handler.events.length, 1)
  t.end()
})
