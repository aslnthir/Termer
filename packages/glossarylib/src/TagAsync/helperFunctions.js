import getParents from '../getParents'

const excludedElementsSelector =
  'iframe,script,noscript,style,button,input,select,code,' +
  '.tingtun-not-mark,.tingtun_label,' +
  'a,' +
  '[name=tingtun_not_mark]'

const blockLevelElementSelector =
  'address, article, aside, blockquote, details, dialog, dd, div, dl, dt, ' +
  'fieldset, figcaption, figure, figcaption, footer, form, h1, h2, h3, h4, ' +
  'h5, h6, header, hgroup, hr, li, main, nav, ol, p, pre, section, table, ul'

export function isBlockLevelElement (node) {
  return elementMatches(node, blockLevelElementSelector)
}

export function isExcludedElement (node) {
  return elementMatches(node, excludedElementsSelector)
}

export function matchesExcludedElements (node) {
  return elementMatches(node, excludedElementsSelector)
}

export function matchesExcludedElementsIE (node) {
  return node.closest(excludedElementsSelector)
}

export function matchesExcludedTextElements (node) {
  return node.parentNode.closest(excludedElementsSelector)
}

export function matchesExcludedElementsIETextNode (node) {
  return matchesExcludedElementsIE(node.parentNode)
}

// Returns 'true' if all chars in 'this' are in the "whitespace" or "punctuation" Unicode categories.
export function allWhitespaceOrPunctuation (node) {
  var str = node.textContent
  str = str.replace(/[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\]/g, '')
  str = str.replace(/\s+/g, '')
  if (str.length > 0) return false
  else return true
}

// Element.matches(selector) checks if the element matches the given selector.
// Also check for prefixed versions with different names; in IE11 this is
// necessary.
const matchesName =
  'matches' in HTMLElement.prototype ? 'matches'
    : 'msMatchesSelector' in HTMLElement.prototype ? 'msMatchesSelector'
      : 'webkitMatchesSelector' in HTMLElement.prototype ? 'webkitMatchesSelector'
        : 'matches'

function elementMatches (el, selector) {
  return el instanceof HTMLElement &&
    el[matchesName](selector)
}

export function isHeading (el) {
  const b = el instanceof HTMLElement &&
    elementMatches(el, 'h1,h2,h3,h4,h5,h6')
  return b
}

export function isContainedIn (isContainer, node) {
  if (!node) return false
  return isContainer(node.parentNode) ||
    isContainedIn(isContainer, node.parentNode)
}

export function isHeadingOrContainedInHeading (el) {
  return isHeading(el) || isContainedIn(isHeading, el)
}

export function textNodeInPtag (el) {
  const b = el.nodeType === 3 &&
    elementMatches(el.parentNode, 'p')
  return b
}

function* includeValue (val, gen) {
  yield val
  yield * gen
}

export function filterNodes (e) {
  const isTempNode = tempNode(e)
  if (isTempNode) return false

  const el = e instanceof HTMLElement ? e : e.parentElement
  if (el) {
    /*
     * IE can not handle "const element of includeValue(el, getParents(el))"
     " so using while loop insteed.
     */
    const generator = includeValue(el, getParents(el))
    let element = generator.next()
    while (!element.done) {
      if (isLink(element.value) || isGlossaryLabel(element.value)) {
        return false
      }
      element = generator.next()
    }
  }
  return true
}

export function isLink (e) {
  if (e.nodeName === 'A' &&
      e.getAttribute('href')) {
    return true
  } else {
    return false
  }
}

export function isGlossaryLabel (e) {
  const isLabel = e.getAttribute('name') === 'tingtun_glossary_label' ||
               e.classList.contains('tingtun_posision_label')
  if (isLabel) {
    return true
  } else {
    return false
  }
}

function tempNode (e) {
  const nextSibling = e.nextElementSibling
  const tempMarked = nextSibling &&
    nextSibling.dataset &&
    nextSibling.dataset.temp
  if (tempMarked) {
    return true
  }
  return false
}
