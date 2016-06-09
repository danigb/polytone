/* global AudioContext */
var Tiny808 = require('./tiny808')
var ac = new AudioContext()

var tiny808 = Tiny808(ac).connect(ac.destination)
tiny808.on(function (a, b, c, d) {
  console.log(a, b, c, d)
})

console.log(tiny808.names())

var events = concat([
  pattern('x...x...x...x..x', 'kick', 3),
  pattern('..x...xx..x...xx', 'snare', 3, { gain: 0.2 }),
  pattern('x...x..xx...xx..', 'hihat', 3, { duration: 0.2 }),
  pattern('..x...x..x.x.x..', 'claves', 3)
])
tiny808.schedule(0, events)

window.onclick = function () {
  console.log('stop!')
  console.log(tiny808.stop())
}

function concat (arr) {
  return arr.reduce(function (r, a) {
    return r.concat(a)
  }, [])
}
function pattern (pattern, name, size, opts) {
  return pattern.split('').reduce(function (events, step, i, arr) {
    if (step === '.') return events
    events.push(Object.assign({ name: name, time: i * (size / arr.length) }, opts))
    return events
  }, [])
}
