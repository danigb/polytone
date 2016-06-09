
var polytone = require('./polytone').use([
  require('./modules/emitter'),
  require('./modules/start-stop'),
  require('./modules/mapper'),
  require('./modules/midi-in'),
  require('./modules/scheduler')
])

if (typeof module === 'object' && module.exports) module.exports = polytone
if (typeof window !== 'undefined') window.polytone = polytone
