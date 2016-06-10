/* global AudioBuffer */
'use strict'

function isFn (o) { return typeof o === 'function' }
function isAudioBuffer (o) { return o instanceof AudioBuffer }

function Polytone (ac, sources, options) {
  if (arguments.length === 1) return function (f, o) { return Polytone(ac, f, o) }
  if (!sources) throw Error('You need to specify a source(s)')

  /**
   * A polytone itself is an AudioNode (a GainNode)
   * You must connect to a destination before use it.
   * @example
   * var ac = new AudioContext()
   * var polysynth = polytone(ac, synth)
   * polysynth.connect(ac)
   * @type {GainNode}
   * @namespace polytone
   */
  var polytone = ac.createGain()
  polytone.ac = ac
  polytone.opts = options || {}
  polytone.gain.value = polytone.opts.gain || 1

  polytone.synth = createSynth(sources)

  /**
   * Creates an audio node for a given instrument or note name
   * @function
   * @memberof polytone
   */
  polytone.createNode = function (name, options) {
    return polytone.synth(polytone.ac, name, options)
  }

  /**
   * Returns a list of all instrument or note names, if available.
   * @function
   * @memberof polytone
   */
  polytone.names = function () {
    return polytone.synth.names ? polytone.synth.names.slice() : []
  }

  return polytone
}

function createSynth (sources) {
  if (typeof sources === 'function') return monoSynth(sources)
  else if (Array.isArray(sources)) return layeredSynth(sources)
  else return namedSynth(sources)
}

function monoSynth (synth) {
  return function (ac, name, opts) { return synth(ac)(name, opts) }
}

function layeredSynth (sources) {
  return function (name, when, opts) {

  }
}

function namedSynth (sources) {
  var names = Object.keys(sources)
  var synths = names.reduce(function (synths, key) {
    var source = sources[key]
    synths[key] = isFn(source) ? source
      : isAudioBuffer(source) ? audioBufferSynth(source)
      : null
    return synths
  }, {})

  var synth = function (ac, name, opts) {
    return synths[name] ? synths[name](ac)(opts) : null
  }
  synth.names = names
  return synth
}

function audioBufferSynth (buffer) {
  return function (ac) {
    return function (options) {
      var node = ac.createBufferSource()
      node.buffer = buffer
      return node
    }
  }
}

// Add a `use` function to `root`. It makes Polytone extensible by plugin modules
function extensible (root) {
  root.use = function (modules) {
    if (!Array.isArray(modules)) throw Error('Expected an array of modules, but got: ' + modules)
    var constructor = function (ac, sources, options) {
      return modules.reduce(function (p, module) {
        return module(p)
      }, Polytone(ac, sources, options))
    }
    return extensible(constructor)
  }
  return root
}

module.exports = extensible(Polytone)
