const MarkdownIt = require('markdown-it')
const md = new MarkdownIt({
  html: true
})

module.exports = function (source, map) {
  return `<div>${md.render(source)}</div>`
}
