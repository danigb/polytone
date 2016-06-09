
/**
 * @module emitter
 * Emitter module. Adds `emit` and `on` functions
 */
module.exports = function (polytone) {
  /**
   * Emits an event. Used mostly by modules.
   * @param {String} name - the name of the event
   * @param {Float} when - the audio context time
   * @param {Object} obj - the event object
   * @param {Object} extra
   */
  polytone.emit = function (event, when, obj, opts) {
    if (polytone.onevent) polytone.onevent(event, when, obj, opts)
    var fn = polytone['on' + event]
    if (fn) fn(when, obj, opts)
  }

  /**
   * Adds an event listener
   * @chainable
   * @param {String} name - (Optional) the name of the events to listen to.
   * @param {Function} cb - the event listener
   * @return {polytone} the polytone itself
   * @example
   * polytone.on('start', function(time, note) {
   *   console.log(time, note)
   * })
   */
  polytone.on = function (event, cb) {
    if (arguments.length === 1 && typeof event === 'function') return polytone.on('event', event)
    var prop = 'on' + event
    var old = polytone[prop]
    polytone[prop] = old ? chain(old, cb) : cb
    return polytone
  }
  return polytone
}

function chain (fn1, fn2) {
  return function (a, b, c, d) { fn1(a, b, c, d); fn2(a, b, c, d) }
}
