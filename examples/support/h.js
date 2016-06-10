module.exports = function h (tag, children) {
  if (arguments.length === 1) return function (c) { return h(tag, c) }
  var text = Array.isArray(children) ? children.join('') : children
  if (!tag.innerHTML) return '<' + tag + '>' + text + '</' + tag + '>'
  tag.innerHTML = tag.innerHTML + text
  return h(tag)
}
