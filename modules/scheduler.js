'use strict'

var isArr = Array.isArray
var isObj = function (o) { return o && typeof o === 'object' }
var EMPTY = {}

module.exports = function (polytone) {
  /**
   * Schedule a list of events to be started at specific time.
   *
   * It supports three formats of events for the events list:
   *
   * - An array with [time, note]
   * - An array with [time, { note: ..., option1: ... }]
   * - An object with { time: ..., [name|note|midi|key]: ..., option1: ... }
   *
   * @param {Float} time - an absolute time to start (or AudioContext's
   * currentTime if provided number is 0)
   * @param {Array} events - the events list.
   * @return {Array} an array of ids
   *
   * @example
   * // Event format: [time, note]
   * var piano = player(ac, ...).connect(ac.destination)
   * piano.schedule(0, [ [0, 'C2'], [0.5, 'C3'], [1, 'C4'] ])
   *
   * @example
   * // Event format: an object { time: ?, name: ? }
   * var drums = polytone(ac, ...).connect(ac.destination)
   * drums.schedule(0, [
   *   { name: 'kick', time: 0 },
   *   { name: 'snare', time: 0.5 },
   *   { name: 'kick', time: 1 },
   *   { name: 'snare', time: 1.5 }
   * ])
   * @function schedule
   * @memberof polytone
   */
  polytone.schedule = function (when, events) {
    when = Math.max(when || 0, polytone.ac.currentTime)
    polytone.emit('schedule', when, events)

    var t, o, note, opts
    return events.map(function (event) {
      if (!event) return null
      else if (isArr(event)) {
        t = event[0]; o = event[1]
      } else {
        t = event.time; o = event
      }

      if (isObj(o)) {
        note = o.name || o.key || o.note || o.midi || null
        opts = o
      } else {
        note = o
        opts = EMPTY
      }

      return polytone.start(note, when + (t || 0), opts)
    })
  }
  return polytone
}
