var ac = require('audio-context')
var load = require('audio-loader')
var polytone = require('..')
var examples = require('./support/examples')(document.body)

function logEvent (event, time, node) { console.log('logEvent', event, time, node.options, node.id) }

var snare = load(ac, 'examples/audio/snare.wav').then(polytone.with({ gain: 0.5 }))
var sine = load(ac, 'examples/audio/Sine440Hz.ogg').then(polytone.with({ gain: 0.2 }))
var maestro = load(ac, 'examples/audio/mrk2.json').then(polytone.with({ gain: 0.4 }))
var piano = load(ac, 'examples/audio/piano.js').then(polytone.with({}))
var marimba = load(ac, 'http://gleitz.github.io/midi-js-soundfonts/MusyngKite/marimba-mp3.js').then(polytone.with(null))

examples.title(1, 'Polytone examples')

examples.add('Oscillator', 'play sine with envelope', function () {
  var synth = polytone('sine', { gain: 0.6 })
  synth.start({ note: 'A4', attack: 1, release: 1, duration: 1 })
})

examples.add('Notes', 'play oscillator with notes', function () {
  var synth = polytone('sine', { gain: 0.5, attack: 0.01, release: 0.3, duration: 0.4 })
  'c4 d4 e4 f4 g4 a4 b4 c5'.split(' ').map(function (note, i) {
    synth.start({ delay: i * 0.25, note: note })
  })
})

examples.add('Buffer', 'play a buffer', function () {
  snare.then(function (snare) {
    snare.start()
  })
})

examples.add('Events', 'listen to events', function () {
  var synth = polytone('triangle', { gain: 0.5, duration: 0.5, release: 0.5 })
  synth.on('*', logEvent)
  synth.start('C4')
})

examples.add('Stop all', 'stop all notes', function () {
  var synth = polytone('square', { gain: 0.1, filter: { frequency: 2000 } })
  synth.on(logEvent)
  var notes = ['c4', 'g4', 'c5', 'e5']
  notes.map(function (note, i) {
    synth.start({ delay: i * 0.5, note: note })
  })
  synth.stop(null, 2.5)
})
examples.add('Monophonic', 'A synth with maxVoices = 1', function () {
  var synth = polytone('sine', { maxVoices: 1, gain: 0.1, release: 0.1, filter: { frequency: 2000 } })
  synth.schedule(['c4', 'g4', 'c5', 'e5', 'g5'].map((note, i) => ({ time: i * 0.5, note: note })))
  synth.stop(null, 3)
})
examples.add('Duophonic', 'A synth with maxVoices = 2', function () {
  var synth = polytone('sine', { maxVoices: 2, gain: 0.1, filter: { frequency: 2000 } })
  synth.schedule(['c4', 'g4', 'c5', 'e5', 'g5'].map((note, i) => ({ time: i * 0.5, note: note })))
  synth.stop(null, 5)
})

examples.add('Loop', 'play a buffered loop during 1+4 seconds', function () {
  sine.then(function (sine) {
    sine.start({ loop: true, release: 4, duration: 1 })
  })
})

examples.add('Filter', 'Play a buffer with a lowpass filter and different frequencies', function () {
  snare.then(function (snare) {
    snare.schedule([200, 500, 1000, 4000, 22000].map(function (freq, i) {
      return { time: i * 0.5, filter: { type: 'lowpass', frequency: freq } }
    }))
  })
})

examples.add('A microtonal scale', 'an oscillator playin float midi numbers', function () {
  var synth = polytone('sine', { attack: 0.01, release: 0.5, duration: 0.25 })
  synth.on('start', function (time, node) {
    console.log('Microtonal note', node.options.midi, node.options.detune)
  })
  synth.schedule('...................'.split('').map(function (_, i) {
    return { time: i * 0.5, midi: 60 + i * 0.25 }
  }))
})
examples.add('Microtonal scale with buffers', 'detuning a buffer to create a microtonal scale', function () {
  piano.then(function (piano) {
    piano.schedule('...................'.split('').map(function (_, i) {
      return { time: i * 0.5, midi: 60 + i * 0.25, maxVoices: 1 }
    }))
  })
})

var tiny808 = polytone({
  snare: require('snare'),
  kick: require('kick-eight'),
  clap: require('clappy'),
  cowbell: require('cow-bell'),
  hihat: require('hi-hat'),
  maracas: require('maracas'),
  tomtom: require('tom-tom'),
  rimshot: require('rim-shot'),
  claves: require('claves')
}, {
  gain: 0.8,
  initialize: function (source, options) {
    return source(options.context)()
  }
})

examples.add('Tiny808', 'A Synthetized drum machine', function () {
  tiny808.schedule(tiny808.keys.map(function (name, i) {
    return { time: i * 0.5, name: name, onEvent: function (event, time, options) {
      if (event === 'start') console.log(time, options.name)
    } }
  }), null)
})

examples.add('Tiny808 pattern', 'Simple drum pattern', function () {
  tiny808.schedule('x..,x..xx..,.x..'.split('').map(function (p, i) {
    return p === 'x' ? { time: i * 0.5, name: 'kick' } : null
  }))
  tiny808.schedule('|.x.|.x.|.x.|.xx.'.split('').map(function (p, i) {
    return p === 'x' ? { time: i * 0.5, name: 'snare' } : null
  }))
})

examples.add('Sampled drum machine', 'Play a buffer by name', function () {
  maestro.then(function (maestro) {
    maestro.schedule(maestro.keys.map(function (name, i) {
      return { time: i * 0.5, name: name }
    }))
    maestro.start('snare')
  })
})

examples.add('Marimba', 'A sampled marimba', function () {
  marimba.then(function (marimba) {
    marimba.schedule('c4 d4 e4 f4 g4 a4 b4 c5'.split(' ').map(function (note, i) {
      return { time: i * 0.5, note: note }
    }))
  })
})
