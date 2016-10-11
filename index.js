var Note = require('note-parser')
var context = require('audio-context')
var isAudioBuffer = require('is-audio-buffer')
var midimessage = require('midimessage')

// utility
function isFn (x) { return typeof x === 'function' }
function isStr (x) { return typeof x === 'string' }
function isNum (x) { return typeof x === 'number' }
function isObj (x) { return typeof x === 'object' }
function isDef (x) { return typeof x !== 'undefined' }
var assign = Object.assign
function getTime (context, when, delay) {
  return Math.max(context.currentTime, when || 0) + (delay || 0)
}

function Polytone (src, defaults) {
  defaults = defaults ? assign({}, defaults) : {}
  if (!defaults.context) defaults.context = context

  var initialize = defaults.initialize
  if (initialize) delete defaults['initialize']
  var Source = AsSource(src, initialize)
  if (!Source) throw Error('Not valid source: ' + src)
  var Player = SourcePlayer(Source)

  var maxVoices = defaults.maxVoices || 0
  if (isDef(defaults.maxVoices)) delete defaults.maxVoices
  var tracker = Tracker(maxVoices)

  var destination = defaults.destination || defaults.context.destination

  var polytone = {
    context: defaults.context,
    keys: Source.keys,
    start: function (options, when, delay, dur) {
      var opts = prepareOptions(options, defaults)
      var node = Player(opts)
      if (destination) node.connect(destination)
      var time = getTime(opts.context, when, delay || opts.delay)
      tracker.track(time, node)
      node.start(time)
      dur = +dur || +opts.duration || 0
      if (dur) node.stop(time + dur)
      return node
    },
    connect: function (dest) {
      destination = dest
      return polytone
    },
    stop: function (when, delay, ids) {
      var time = getTime(defaults.context, when, delay)
      ids = !ids ? tracker.current()
        : !Array.isArray(ids) ? [ ids ]
        : ids
      tracker.stop(time, ids)
      return polytone
    },
    on: function (name, cb) {
      isFn(name) ? tracker.addListener('*', name) : tracker.addListener(name, cb)
      return polytone
    },
    schedule: function (events, when, delay) {
      var time = getTime(polytone.context, when, delay)
      events.forEach(function (event) {
        if (event) polytone.start(event, time + event.time)
      })
    },
    listenToMidi: listenToMidi(polytone)
  }
  return polytone
}

Polytone.with = function (options) {
  return function (source) { return Polytone(source, options) }
}

function prepareOptions (options, defaults) {
  var opts = !options ? defaults
    : isStr(options) ? assign({ name: options }, defaults)
    : isNum(options) ? assign({ midi: options }, defaults)
    : assign({}, options, defaults)

  var note = Note.parse(opts.name || opts.note)
  if (!opts.note && note) opts.note = Note.build(note)
  if (!opts.midi && note) opts.midi = note.midi
  if (!opts.frequency && opts.midi) opts.frequency = Math.pow(2, (opts.midi - 69) / 12) * 440
  if (!opts.detune) {
    opts.detune = Math.floor((opts.midi % 1) * 100)
    if (opts.detune) opts.midi = Math.floor(opts.midi)
  }

  return opts
}

function velToGain (vel) { return vel / 127 }

function listenToMidi (polytone) {
  return function (input, channel) {
    var started = {}

    input.onmidimessage = function (msg) {
      var mm = msg.messageType ? msg : midimessage(msg)
      if (isNum(channel) && channel !== mm.channel) return

      if (mm.messageType === 'noteon' && mm.velocity === 0) {
        mm.messageType = 'noteoff'
      }

      if (mm.messageType === 'noteon') {
        started[mm.key] = polytone.start(mm.key, 0, { gain: velToGain(mm.velocity) })
      } else if (mm.messageType === 'noteoff' && started[mm.key]) {
        started[mm.key].stop()
        delete started[mm.key]
      }
    }
    return polytone
  }
}

function Tracker (maxVoices) {
  var nextId = 0
  var emit = null
  var tracked = {}
  var currentVoice = 0
  var voices = Array(maxVoices)
  return {
    addListener: function (name, cb) {
      var prev = emit
      emit = function (event, time, node) {
        if (prev) prev(event, time, node)
        if (name === '*' || name === 'event') cb(event, time, node)
      }
    },
    track: function (time, node) {
      node.id = node.id || nextId++
      tracked[node.id] = node
      controlLifecycle(node, emit)
      if (maxVoices) {
        if (voices[currentVoice]) {
          voices[currentVoice].stop(time)
        }
        voices[currentVoice] = node
        currentVoice = (currentVoice + 1) % maxVoices
      }
      return node
    },
    stop: function (time, ids) {
      ids.forEach(function (id) {
        tracked[id].stop(time)
      })
    },
    current: function () {
      return Object.keys(tracked)
    }
  }
}

function controlLifecycle (node, emit) {
  var raw = {
    connect: node.connect, disconnect: node.disconnect,
    start: node.start, stop: node.stop
  }
  node.connect = function (dest) {
    if (emit) emit('connect', node.context.currentTime, node)
    raw.connect(dest)
    return node
  }
  node.start = function (time) {
    if (emit) emit('start', time, node)
    raw.start(time)
    return node
  }
  node.stop = function (time) {
    if (emit) emit('stop', time, node)
    raw.stop(time)
  }
  node.disconnect = function (dest) {
    if (emit) emit('disconnect', node.context.currentTime, node)
    raw.disconnect()
  }
  node.onended = function () {
    if (emit) emit('ended', node.context.currentTime, node)
    setTimeout(node.disconnect, 200)
  }
}

// PLAY A SOURCE
// =============

function SourcePlayer (Source) {
  if (!Source) return null
  return function (opts) {
    var node = { context: opts.context, source: Source(opts) }
    if (!node.source) return
    node.output = node.source
    var state = 'init'

    // add envelope support via `options.release` and/or `options.attack`
    if (opts.attack || opts.release) {
      node.env = opts.context.createGain()
      node.output.connect(node.env)
      node.output = node.env
    }
    // add filter support via `options.filter`
    if (opts.filter) {
      node.filter = opts.context.createBiquadFilter()
      if (opts.filter.type) node.filter.type = opts.filter.type
      if (opts.filter.frequency) node.filter.frequency.value = opts.filter.frequency
      if (opts.filter.Q) node.filter.Q.value = opts.filter.Q
      node.output.connect(node.filter)
      node.output = node.filter
    }

    // add gain support via `options.gain`
    if (isNum(opts.gain)) {
      node.gain = opts.context.createGain()
      node.gain.gain.value = opts.gain
      node.output.connect(node.gain)
      node.output = node.gain
    }

    node.start = function (time) {
      if (state !== 'init') return
      state = 'started'
      node.source.start(time)
      if (opts.attack) {
        node.env.gain.setValueAtTime(0, time)
        node.env.gain.linearRampToValueAtTime(1, time + opts.attack)
      } else if (node.env) {
        node.env.gain.setValueAtTime(1, time)
      }
      return node
    }
    node.stop = function (time) {
      if (state !== 'started') return
      state = 'stoped'
      time = time || node.conect.currentTime
      var release = opts.release || 0
      if (release) {
        node.env.gain.linearRampToValueAtTime(0, time + release)
      }
      node.source.stop(time + release)
    }

    // override connect (and make it chainable)
    node.connect = function (dest) {
      node.output.connect(dest)
      return node
    }
    node.disconnect = function () {
      node.source.disconnect()
      if (node.env) node.env.disconnect()
      if (node.filter) node.filter.disconnect()
      if (node.gain) node.gain.disconnect()
    }
    return node
  }
}

// SOURCE FUNCTION
// ===============

// Create a source function from a source
function AsSource (src, init) {
  return isFn(src) ? src
    : isAudioBuffer(src) ? BufferSource(src)
    : isStr(src) ? OscillatorSource(src)
    : isObj(src) ? ObjectSource(src, init)
    : null
}

function BufferSource (buffer) {
  return function (options) {
    var source = options.context.createBufferSource()
    source.buffer = buffer
    if (options.detune) source.detune.value = options.detune
    if (options.loop === true) source.loop = true
    return source
  }
}

function OscillatorSource (oscType) {
  return function (options) {
    var osc = options.context.createOscillator()
    osc.type = options.type || options.oscType || oscType
    if (options.frequency) osc.frequency.value = options.frequency
    if (options.detune) osc.detune = options.detune
    return osc
  }
}

function ObjectSource (object, init) {
  var keys = Object.keys(object)
  var midified = keys.reduce(function (midified, name) {
    var raw = object[name]
    var value = init ? function (options) { return init(raw, options) }
      : isAudioBuffer(raw) ? BufferSource(raw)
      : isStr(raw) ? OscillatorSource(raw)
      : raw

    var note = Note.parse(name)
    if (note) midified[note.midi] = value
    else midified[name] = value
    return midified
  }, {})
  function select (options) {
    var source = midified[options.midi] || midified[options.note] || midified[options.name]
    return source ? source(options) : null
  }
  select.keys = keys
  return select
}

module.exports = Polytone
