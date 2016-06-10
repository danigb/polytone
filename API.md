## Modules

<dl>
<dt><a href="#module_mapper">mapper</a></dt>
<dd></dd>
<dt><a href="#module_start-stop">start-stop</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#polytone">polytone</a> : <code>object</code></dt>
<dd><p>A polytone itself is an AudioNode (a GainNode)
You must connect to a destination before use it.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Polytone">Polytone(ac, sources, (Optional))</a> ⇒ <code><a href="#polytone">polytone</a></code></dt>
<dd><p>Create a polytone</p>
</dd>
</dl>

<a name="module_mapper"></a>

## mapper
<a name="module_start-stop"></a>

## start-stop
<a name="polytone"></a>

## polytone : <code>object</code>
A polytone itself is an AudioNode (a GainNode)
You must connect to a destination before use it.

**Kind**: global namespace  
**Example**  
```js
var ac = new AudioContext()
var polysynth = polytone(ac, synth)
polysynth.connect(ac)
```

* [polytone](#polytone) : <code>object</code>
    * [.createNode()](#polytone.createNode)
    * [.names()](#polytone.names)
    * [.emit(name, when, obj, extra)](#polytone.emit)
    * [.on(name, cb)](#polytone.on) ⇒ <code>[polytone](#polytone)</code>
    * [.listenToMidi(input, options)](#polytone.listenToMidi) ⇒ <code>[polytone](#polytone)</code>
    * [.schedule(time, events)](#polytone.schedule) ⇒ <code>Array</code>

<a name="polytone.createNode"></a>

### polytone.createNode()
Creates an audio node for a given instrument or note name

**Kind**: static method of <code>[polytone](#polytone)</code>  
<a name="polytone.names"></a>

### polytone.names()
Returns a list of all instrument or note names, if available.

**Kind**: static method of <code>[polytone](#polytone)</code>  
<a name="polytone.emit"></a>

### polytone.emit(name, when, obj, extra)
Emits an event. Used mostly by modules.

**Kind**: static method of <code>[polytone](#polytone)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the name of the event |
| when | <code>Float</code> | the audio context time |
| obj | <code>Object</code> | the event object |
| extra | <code>Object</code> |  |

<a name="polytone.on"></a>

### polytone.on(name, cb) ⇒ <code>[polytone](#polytone)</code>
Adds an event listener

**Kind**: static method of <code>[polytone](#polytone)</code>  
**Chainable**  
**Returns**: <code>[polytone](#polytone)</code> - the polytone itself  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | (Optional) the name of the events to listen to. |
| cb | <code>function</code> | the event listener |

**Example**  
```js
polytone.on('start', function(time, note) {
  console.log(time, note)
})
```
<a name="polytone.listenToMidi"></a>

### polytone.listenToMidi(input, options) ⇒ <code>[polytone](#polytone)</code>
Connect a player to a midi input

The options accepts:

- channel: the channel to listen to. Listen to all channels by default.

**Kind**: static method of <code>[polytone](#polytone)</code>  
**Returns**: <code>[polytone](#polytone)</code> - chainable  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>MIDIInput</code> |  |
| options | <code>Object</code> | (Optional) |

**Example**  
```js
var piano = player(...)
window.navigator.requestMIDIAccess().then(function (midiAccess) {
  midiAccess.inputs.forEach(function (midiInput) {
    piano.listenToMidi(midiInput)
  })
})
```
<a name="polytone.schedule"></a>

### polytone.schedule(time, events) ⇒ <code>Array</code>
Schedule a list of events to be played at specific time.

It supports three formats of events for the events list:

- An array with [time, note]
- An array with [time, object]
- An object with { time: ?, [name|note|midi|key]: ? }

**Kind**: static method of <code>[polytone](#polytone)</code>  
**Returns**: <code>Array</code> - an array of ids  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Float</code> | an absolute time to start (or AudioContext's currentTime if provided number is 0) |
| events | <code>Array</code> | the events list. |

**Example**  
```js
// Event format: [time, note]
var piano = player(ac, ...).connect(ac.destination)
piano.schedule(0, [ [0, 'C2'], [0.5, 'C3'], [1, 'C4'] ])
```
**Example**  
```js
// Event format: an object { time: ?, name: ? }
var drums = player(ac, ...).connect(ac.destination)
drums.schedule(0, [
  { name: 'kick', time: 0 },
  { name: 'snare', time: 0.5 },
  { name: 'kick', time: 1 },
  { name: 'snare', time: 1.5 }
])
```
<a name="Polytone"></a>

## Polytone(ac, sources, (Optional)) ⇒ <code>[polytone](#polytone)</code>
Create a polytone

**Kind**: global function  
**Returns**: <code>[polytone](#polytone)</code> - A polytone instance  

| Param | Type | Description |
| --- | --- | --- |
| ac | <code>AudioContext</code> |  |
| sources | <code>function</code> &#124; <code>Array</code> &#124; <code>Object</code> |  |
| (Optional) | <code>Object</code> | options |

