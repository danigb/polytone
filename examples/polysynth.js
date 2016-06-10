/* global AudioContext */
var polytone = require('..')
var h = require('./support/h')

h(document.body, [
  h('h1', 'Polysynth'),
  h('h3', 'A polytone example'),
  h('p', 'Click to stop (Open the dev console to see more results)')
])

function synth (ac) {
  return function (fq, opts) {
    var osc = ac.createOscillator()
    osc.frequency.value = fq
    return osc
  }
}

var ac = new AudioContext()
var polysynth = polytone(ac, synth)
polysynth.connect(ac.destination)
polysynth.on(function (a, b, c, d) { console.log(a, b, c, d) })

window.onclick = function () {
  polysynth.stop()
}

polysynth.schedule(0, [200, 300, 400, 500].map(function (fq, i) {
  return { time: i, note: fq }
}))
