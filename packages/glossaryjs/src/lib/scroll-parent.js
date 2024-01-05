// based on https://stackoverflow.com/a/42543908

export default function scrollParent (element, options = {}) {
  const defaultOptions = { dimension: 'both', includeHidden: false }
  options = Object.assign(defaultOptions, options)
  let style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = options.includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/

  if (style.position === 'fixed') return document.scrollingElement

  for (let parent = element; (parent = parent.parentElement);) {
    style = getComputedStyle(parent)
    if (excludeStaticParent && style.position === 'static') {
      continue
    }
    let testString = ''
    if (/x|both/.test(options.dimension)) {
      testString += style.overflowX
    }
    if (/y|both/.test(options.dimension)) {
      testString += style.overflowY
    }
    if (overflowRegex.test(testString)) {
      return parent
    }
  }

  return document.scrollingElement
}
