var polytone = require('../..')

function tiny808 (ac) {
  return polytone(ac, {
    snare: require('snare'),
    kick: require('kick-eight'),
    clap: require('clappy'),
    cowbell: require('cow-bell'),
    hihat: require('hi-hat'),
    maracas: require('maracas'),
    tomtom: require('tom-tom'),
    rimshot: require('rim-shot'),
    claves: require('claves')
  })
}

module.exports = tiny808
