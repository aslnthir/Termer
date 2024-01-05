import NamedRegExp from 'named-regexp-groups'

let C = RegExp
try {
  // eslint-disable-next-line
  new RegExp('(?<a>)')
} catch {
  // Firefox and IE11 do not support named capture groups in regexes.
  C = NamedRegExp
}

export default C
