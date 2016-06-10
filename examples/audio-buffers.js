/* global AudioContext */
var polytone = require('..')
var loader = require('audio-loader')

var URL = 'http://gleitz.github.io/midi-js-soundfonts/MusyngKite/marimba-mp3.js'

var ac = new AudioContext()
loader(ac, URL).then(function (buffers) {
  function synth (ac) {
    return function (name, opts) {
      var node = ac.createBufferSource()
      node.buffer = buffers[name]
      return node
    }
  }
  var marimba = polytone(ac, synth)
  marimba.connect(ac.destination)
  marimba.on(function (a, b, c, d) { console.log(a, b, c, d) })
  marimba.play('C5')
  marimba.schedule(ac.currentTime + 1, 'CDEFGAB'.split('').map(function (l, i) {
    return { time: i * 0.5, note: l + 4 }
  }))
})
