/*
 * Vertraulich
 */

export default class BaseTermerButton {
  constructor () {
    this.eventHandlers = {}
  }

  toggleOff() {
  }

  toggleOn() {
  }

  addLoader() {
  }

  removeLoader() {
  }

  emit (what) {
    const handlers = this.eventHandlers[what]
    if (!handlers) return
    for (const l of handlers) {
      l()
    }
  }

  // what: one of on, off, openconfig
  on (what, fun) {
    const l = this.eventHandlers[what]
      ? this.eventHandlers[what]
      : this.eventHandlers[what] = []
    l.push(fun)
  }

  // This creates termer button and places it in the correct div element
  placeButtonOnPage (buttonHTML, replaceElement) {
    replaceElement.innerHTML = buttonHTML
    return replaceElement.children[0]
  }
}
