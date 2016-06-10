# polytone [![npm](https://img.shields.io/npm/v/polytone.svg?style=flat-square)](https://www.npmjs.com/package/polytone)

[![Build Status](https://img.shields.io/travis/danigb/polytone/master.svg?style=flat-square)](https://travis-ci.org/danigb/polytone)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/polytone.svg?style=flat-square)](https://www.npmjs.com/package/polytone)

Convert a mono audio node into a polyphonic instrument:

```js
var polytone = require('polytone')

function synth (ac) {
  return function (fq) {
    var osc = ac.createOscillator()
    osc.frequency.value = fq
    return osc
  }
}

var ac = new AudioContext()
var polysynth = polytone(ac, synth)
polysynth.connect(ac.destination)
polysynth.start(440, { gain: 0.4 })
```

## Features

#### Layers

```js
var layered = polytone(ac, [synth1, synth2])
layered.connect(ac.destination)
layered.start(440)
```

### Events

```js
var polysynth = polytone(ac, synth)
polysynth.connect(ac.destination)
polysynth.on('start', function (name, id, node) {
  console.log('start', name, id, node)
})
polysynth.start(440) // => CONSOLE: 'start' 440 1 <AudioNode ...>
```


### Note names and midi note numbers

```js
var polysynth = polytone(ac, synth, { notesTo: 'freq' })
polysynth.play('C4')
polysynth.play(60)
```

### Multiple sources

```js
var instruments = {
  snare: require('snare'),
  kick: require('kick-eight'),
  hihat: require('hi-hat')
}
var drums = polysynth(ac, instruments)
drums.start('snare', ac.currentTime)
drums.start('kick', ac.currentTime + 1)
drum.names() // => ['snare', 'kick', 'hihat']
```

### Amplitude Envelope

### Connect to midi inputs via Web Midi API

### Schedule events

## Documentation, tests and examples

[API]()

## License

MIT License
