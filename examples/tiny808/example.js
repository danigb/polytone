/* global AudioContext */
var polytone = require('../..')
var sources = {
  snare: require('snare'),
  kick: require('kick-eight'),
  clap: require('clappy'),
  cowbell: require('cow-bell'),
  hihat: require('hi-hat'),
  maracas: require('maracas'),
  tomtom: require('tom-tom'),
  rimshot: require('rim-shot'),
  claves: require('claves')
}

var ac = new AudioContext()
var tiny808 = polytone(ac, sources)
tiny808.connect(ac.destination)

tiny808.on(function (a, b, c, d) { console.log(a, b, c, d) })

window.onclick = function () {
  console.log('stop!')
  console.log(tiny808.stop())
}

console.log(tiny808.names())

var events = concat([
  pattern('x...x...x...x..x', 'kick', 3),
  pattern('..x...xx..x...xx', 'snare', 3, { gain: 0.2 }),
  pattern('x...x..xx...xx..', 'hihat', 3, { duration: 0.2 }),
  pattern('..x...x..x.x.x..', 'claves', 3)
])
tiny808.schedule(0, events)

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
