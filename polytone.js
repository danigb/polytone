'use strict'

function polytone (ac, sources, options) {
  if (arguments.length === 1) return function (f, o) { return polytone(ac, f, o) }
  if (!sources) throw Error('You need to specify a source(s)')

  // create the nodeput node
  var node = ac.createGain()
  node.ac = ac
  node.opts = options || {}
  node.gain.value = node.opts.gain || 1

  var isSingle = typeof sources === 'function'

  node.createNode = function (name, options) {
    return isSingle ? sources(ac)(name, options)
      : sources[name] ? sources[name](ac)(options)
      : null
  }

  node.names = function () {
    return isSingle ? [] : Object.keys(sources)
  }
  node.instrument = function (name) {
    return function (options) { return node.creataeNode(name, options) }
  }

  return node
}

polytone.use = function (modules) {
  if (!Array.isArray(modules)) throw Error('Expected an array of modules, but got: ' + modules)

  return function (ac, sources, options) {
    var p = polytone(ac, sources, options)
    modules.forEach(function (init) {
      init(p)
    })
    return p
  }
}

module.exports = polytone
