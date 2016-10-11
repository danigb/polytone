# polytone [![npm](https://img.shields.io/npm/v/polytone.svg?style=flat-square)](https://www.npmjs.com/package/polytone)

[![Build Status](https://img.shields.io/travis/danigb/polytone/master.svg?style=flat-square)](https://travis-ci.org/danigb/polytone)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/polytone.svg?style=flat-square)](https://www.npmjs.com/package/polytone)

> Create polyphonic instruments from audio sources

`polytone` provides a clean API to work with web audio source nodes. It handles common tasks like converting from note names to frequency, add gain, envelope and filter support, events, scheduling or even handling audio context and node lifecycles.

The gist:

```js
var polytone = require('polytone')

// Create a function that returns an audio source node
function synth (options) {
  var osc = options.context.createOscillator()
  osc.frequency.value = options.frequency
  return osc
}

// specify the default options and the synth function
var inst = polytone(synth, { gain: 0.5, attack: 0.01, release: 0.2 })
// pass the note name and receive the frequency and midi note number
inst.start({ note: 'C4' })
// works when passing just the note
inst.start('C4')
// override any option
inst.start({ gain: 0.8, release: 0.4, duration: 1 })
// stop all sounds after 3 seconds
inst.stop(null, 3)
```

## Examples

#### Create a audio buffer player

```js
var snare = polytone(<AudioBuffer>)
snare.start() // play the buffer
snare.start({ gain: 0.5 }, null, 1) // => play after 1 second
```

#### Create an oscillator voice

```js
var sine = polytone('sine')
sine.start({ note: 'C4' })
sine.start({ note: 'G4' })
sine.stop(null, 1) // => stop all after 1 second
```

#### Create a sampled instrument

You can combine multiple AudioBuffers in one polytone instrument:

```js
var drumMachine = polytone({ snare: <AudioBuffer>, kick: <AudioBuffer>, ... })
drumMachine.start('kick') // => play the kick
drumMachine.start('snare', null, 1) // => play the snare after 1 second
drumMachine.start({ name: 'conga', gain: 0.5 }) // => play the conga with options
```

If the sample names are notes, some conversions are performed:

```js
var piano = polytone({ 'C4': <AudioBuffer>, 'C#4': <AudioBuffer>, 'D4': ... })
piano.start('Db4') // => handles enharmonic notes
piano.start(70) // => can use midi numbers
piano.start(70.5) // => if midi is float, the buffer is detuned
piano.start({ note: 'C4', duration: 1 })
```

#### Create a synthetized drum machine

```js
var dm = polytone(null, {
  snare: function(options) { /* returns an AudioNode or similar object */ },
  kick: function(options) { /* returns an AudioNode or similar object */ },
  hihat: function(options) { /* returns an AudioNode or similar object */ },
  ...
})
dm.start('snare')
dm.start({ name: 'kick', gain: 1.2 })
```

See my [Tiny808]() gist for a complete example.

## Usage

#### Note names midi note numbers, frequency and detune

Note names or midi numbers are converted to frequencies:

```js
var instrument = polytone(synth)
instrument.start('A4') // => Options are { note: 'A4', midi: 69, frequency: 440 }
instrument.start(60.2) // => options are { midi: 60, detune: 20, frequency: ... }
instrument.start({ note: 'C4 '}) // the same as passing the note directly
instrument.start({ name: 'C4 '}) // the same as before
```

### Gain, Envelope and Filter

You can set the gain:

```js
instrument.start({ note: 'C4', gain: 0.2 })
```

Use a simple envelope with `attack` and `release`:

```js
instrument.start({ note: 'C4', attack: 0.2, release: 0.5, duration: 1 })
// (the real duration of the note will be 1 + 0.5 secs of the release envelope)
```

Or a filter:

```js
instrument.start({ note: 'Db3', filter: { type: 'lowpass', frequency: 500 }})
```

#### Events

You can listen all events:
```js
var instrument = polytone(synth).on('*', function (event, time, node) {
  console.log('EVENT: ', event, time, node)
})
instrument.play('C4') // => all events to the console
```

Or to single events (`start`, `stop`, `ended`, `disconnect` are accepted):

```js
var instrument = polytone(synth)
instrument.on('start', function (event, time, node) {
  console.log('EVENT: ', event, time, node)
})
instrument.start(440) // => only 'start' events are displayed
```


#### Audio Context

By default, polytone uses [audio-context](https://www.npmjs.com/package/audio-context) module to get the audio context, so no initialization is required. Anyway, you can pass your own context if you prefer:

```js
var context = new AudioContext()
var instrument = polytone({ context: context }, synth)
```

You can provide any option either to the polytone constructor or the `start` function:

```js
function synth (options) { console.log(options) }
var instrument = polytone({ one: 1, two: 2 }, synth)
instrument.start({ two: 22, three: 333 })
// => { context: <AudioContext>, one: 1, two: 22, three: 333 }
```

#### Connect and disconnect

By default, all sources are automatically connected to the audio context destination, but you can override this option:

```js
var reverb = /* <AudioNode> */
var instrument = polytone(synth, { connect: reverb })
instrument.start('d4')
```

Or for each instance individually:

```js
var instrument = polytone(synth)
instrument.start({ note: 'C4', gain: 0.2, connect: reverb })
```

Are nodes are disconnected automatically after they stop.

### Connect to midi inputs via Web Midi API

```js
var piano = polytone({ 'c2': <AudioBuffer>, 'c#2': <AudioBuffer>, ... })
window.navigator.requestMIDIAccess().then(function (midiAccess) {
  midiAccess.inputs.forEach(function (midiInput) {
    piano.listenToMidi(midiInput)
  })
})
```

### Schedule events

A simple convenient function is provide to schedule a group of events:

```js
var piano = polytone(...)
piano.schedule([
  { time: 0, note: 'C4' },
  { time: 0.5, note: 'G4' }
], null, 3) // => shedule it after 3 second
```

Or more compact:

```js
piano.schedule('C4 G4 C5'.split(' ').map(function (note, i) {
  return { time: 0.5 * i, note: note }
}))
```


## Documentation, tests and examples

To run the examples, install [budo](https://github.com/mattdesl/budo): `npm i -g budo` and then:

```bash
budo examples/index
```

## License

MIT License
