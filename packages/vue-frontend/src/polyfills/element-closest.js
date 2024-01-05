/* Polyfill for Element.closest(), which is missing in IE11.
 * Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 */

const matchesFunction =
  Element.prototype.matches ||
  Element.prototype.msMatchesSelector ||
  Element.prototype.webkitMatchesSelector

function matches (el, s) {
  return matchesFunction.call(el, s)
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this
    if (!document.documentElement.contains(el)) return null
    do {
      if (matches(el, s)) return el
      el = el.parentElement || el.parentNode
    } while (el !== null && el.nodeType === 1)
    return null
  }
}
