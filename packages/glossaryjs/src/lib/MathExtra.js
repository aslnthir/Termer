/*
 * Vertraulich
 */


export function px2em (referenceElement, pixels) {
  let fontSizePx = parseInt(window.getComputedStyle(referenceElement).fontSize, 10)
  return 1 / fontSizePx * pixels
}
export function em2px (referenceElement, ems) {
  if (typeof ems === 'string') ems = parseFloat(ems)
  let fontSizePx = parseInt(window.getComputedStyle(referenceElement).fontSize, 10)
  return ems * fontSizePx
}

