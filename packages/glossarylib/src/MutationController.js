/*
 * Vertraulich
 */

import getParents from './getParents'
import * as iframeHandler from './glossary-iframe-handlers'
import EventEmitter from 'eventemitter3'
import Conf from './config'

function filterElems (elem) {
  // Skip these elements.
  return !elem ||
    !elem.isConnected ||
    elem.id === 'tingtun_move_handler_tooltip'
}

function removeContainedElements (elementSet) {
  const els = new Set()
  for (const elem of elementSet) {
    let addElementToSet = true
    for (const parent of getParents(elem)) {
      if (filterElems(parent) || elementSet.has(parent)) {
        addElementToSet = false
        break
      }
    }
    if (addElementToSet) {
      els.add(elem)
    }
  }
  return els
}

function * iterateAll (iterators) {
  for (const iter of iterators) {
    for (const value of iter) {
      yield value
    }
  }
}

const events = {
  markup_done: 'markup_done'
}

export default class MutationController extends EventEmitter {
  constructor (changeTimeoutDelay, replaceButtonPlaceholder) {
    super()
    this.replaceButtonPlaceholder = replaceButtonPlaceholder
    this.changeTimeoutDelay = changeTimeoutDelay
    this.changedElements = new Set()
    this.events = events
    this.taggerPromise = Promise.resolve()

    this.changeTimeout = window.setTimeout(
      () => this.markChanged(),
      this.changeTimeoutDelay)

    this.mutationObserver = new window.MutationObserver(mutationList => mutationList.forEach(mutation => {
      let elem = mutation.target
      while (elem && !(elem instanceof window.HTMLElement)) {
        elem = elem.parentElement || elem.parentNode
      }
      if (filterElems(elem)) return
      this.changedElements.add(elem)
      window.clearTimeout(this.changeTimeout)
      this.changeTimeout = window.setTimeout(
        () => this.markChanged(),
        this.changeTimeoutDelay)
    }))
  }

  markChanged () {
    const myChanges = removeContainedElements(this.changedElements)
    this.changedElements.clear()

    const glossaryScriptTag = document.querySelector('#tingtunGlossary')
    for (const elem of myChanges) {
      const buttonPlaceholder = elem.querySelector('#tingtun-termer-button')
      if (buttonPlaceholder) {
        this.replaceButtonPlaceholder(buttonPlaceholder)
      }
      // inject glossary in any descendant iframes
      const frames = elem.querySelectorAll(
        'iframe:not(#tingtun_tooltip):not(#pdf-popup-frame)' +
        ':not(#zoom-detector):not(#glossary_local_storage)')
      for (const frame of frames) {
        iframeHandler.injectGlossaryInFrame(glossaryScriptTag, frame)
      }
      if (elem instanceof window.HTMLIFrameElement) {
        iframeHandler.injectGlossaryInFrame(glossaryScriptTag, elem)
      } else if (elem instanceof window.HTMLStyleElement) {
        // skip <style> elements
      } else {
        this.taggerPromise = this.taggerPromise.then(async () => {
          this.stop()
          try {
            const elementQuery = '[name=tingtun_glossary_label]'
            const elems = [
              elem.querySelectorAll(elementQuery),
              elem.matches(elementQuery) ? [elem] : []
            ]
            for (const el of iterateAll(elems)) {
              const parent = el.parentElement
              el.outerHTML = el.innerHTML
              if (parent) {
                parent.normalize()
              }
            }
          } finally {
            await this.start()
            await this.tagIt(elem)
            this.emit(this.events.markup_done)
          }
        })
      }
    }
  }

  setTaggerFunction (fun) {
    this.tagIt = fun
  }

  start () {
    // console.log('mutationobserver.start + MutationController')
    // console.log(Conf.offline)
    if (Conf.offline) {
      return
    }
    return this.startMutationObserver()
  }

  stop () {
    // console.log('mutationobserver.stop + MutationController')
    this.stopMutationObserver()
  }

  async startMutationObserver () {
    // console.log('startMutationObserver')
    if (this.started) return
    const options = {
      childList: true,
      characterData: true,
      subtree: true,
      characterDataOldValue: true
    }
    const body = await getBody()
    this.mutationObserver.observe(body, options)
    this.started = true
  }

  stopMutationObserver () {
    // console.log('stopMutationObserver')
    this.mutationObserver.disconnect()
    this.started = false
  }
}

function getBody () {
  // console.log('getBody')
  return new Promise(resolve => {
    if (document.body) resolve(document.body)
    else {
      setTimeout(() => {
        resolve(getBody())
      }, 10)
    }
  })
}
