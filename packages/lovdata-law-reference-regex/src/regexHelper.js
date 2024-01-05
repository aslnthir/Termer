// Regex writing helper from https://stackoverflow.com/a/60027277
function clean (piece) {
  return piece
    .replace(
      /((^|\n)(?:[^/\\]|\/[^*/]|\\.)*?)\s*\/\*(?:[^*]|\*[^/])*(\*\/|)/g,
      '$1'
    )
    .replace(/((^|\n)(?:[^/\\]|\/[^/]|\\.)*?)\s*\/\/[^\n]*/g, '$1')
    .replace(/\n\s*/g, '')
}

export default function re ({ raw }, ...interpolations) {
  return interpolations.reduce(
    (regex, insert, index) => (regex + insert + clean(raw[index + 1])),
    clean(raw[0])
  )
}
