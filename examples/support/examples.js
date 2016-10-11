module.exports = function (parent) {
  return {
    add: function (name, desc, cb) {
      var a = document.createElement('a')
      a.innerHTML = name
      a.href = '#'
      a.onclick = function (e) {
        e.preventDefault()
        cb()
      }
      parent.appendChild(a)
      var sep = document.createElement('span')
      sep.innerHTML = '&nbsp;|&nbsp;' + desc + '<br/>'
      parent.appendChild(sep)
    },

    title: function (num, text) {
      var title = document.createElement('h' + num)
      title.innerHTML = text
      parent.appendChild(title)
    }
  }
}
