/* global AudioContext */
var polytone = require('..')

function synth (ac) {
  return function (fq, opts) {
    var osc = ac.createOscillator()
    osc.frequency.value = fq
    return osc
  }
}

var ac = new AudioContext()
var microtone = polytone(ac, synth)
microtone.connect(ac.destination)
microtone.on(function (a, b, c, d) { console.log(a, b, c, d) })

window.onclick = function () {
  microtone.stop()
}

microtone.schedule(0, [200, 300, 400, 500].map(function (fq, i) {
  return { time: i, note: fq }
}))
