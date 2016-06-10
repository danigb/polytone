'use strict'

/**
 * Create a polytone
 * @param {AudioContext} ac
 * @param {Function|Array|Object} sources
 * @param {Object} (Optional) options
 * @return {polytone} A polytone instance
 */
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
   * @namespace polytone
   */
  var polytone = ac.createGain()
  polytone.ac = ac
  polytone.opts = options || {}
  polytone.gain.value = polytone.opts.gain || 1

  var isSingle = typeof sources === 'function'

  /**
   * Creates an audio node for a given instrument or note name
   * @function
   * @memberof polytone
   */
  polytone.createNode = function (name, options) {
    return isSingle ? sources(ac)(name, options)
      : sources[name] ? sources[name](ac)(options)
      : null
  }

  /**
   * Returns a list of all instrument or note names, if available.
   * @function
   * @memberof polytone
   */
  polytone.names = function () {
    return isSingle ? [] : Object.keys(sources)
  }

  return polytone
}

Polytone.use = function (modules) {
  if (!Array.isArray(modules)) throw Error('Expected an array of modules, but got: ' + modules)

  return function (ac, sources, options) {
    var p = Polytone(ac, sources, options)
    modules.forEach(function (init) {
      init(p)
    })
    return p
  }
}

module.exports = Polytone
