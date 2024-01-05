/*
 * Vertraulich
 */

export default function* getParents (el) {
  for (;;) {
    const p = el.parentElement
    if (p) {
      yield p
      el = p
    } else {
      break
    }
  }
}
