/*
 * Vertraulich
 */

import GlossaryAPIBase from './api-base'
import {BrowserBackend} from 'browser-backend'

export class BrowserBackendAPI extends GlossaryAPIBase {
  constructor (url) {
    super()
    this.backendLoaded = false
    this.promiseResolves = []
    const self = this

    if (/complete|interactive/.test(document.readyState)) {
      init()
    } else {
      window.addEventListener('load', init, false)
    }
    function init () {
      if (!(self._inIframe())) {
        const browserBackend = new BrowserBackend()
      }
      self._start()
    }
  }

  termSearch (term, params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.backendLoaded === true)
      .then(_ => {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'lookup-term',
          'term': term,
          params: params,
          resolveKey
        }
        this._postMessage(msg)
      })
    })
    return promise
  }

  getSource (sourceId, params) {
    let promise = new Promise((resolve, reject) => {
      resolve([])
    })
    return promise
  }

  getSourceList (params, nextResult = []) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.backendLoaded === true)
      .then(_ => {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'get-sources',
          params: params,
          resolveKey
        }
        this._postMessage(msg)
      })
    })
    return promise
  }

  async getWordlist (params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.backendLoaded === true)
      .then(_ => {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'get-wordlist',
          params: params,
          resolveKey
        }
        this._postMessage(msg)
      })
    })
    return promise
  }

  // USER
  getLoggedInUser () {
    let promise = new Promise((resolve, reject) => {
      resolve([])
    })
    return promise
  }

  getDefinitionsList (glossary) {
    let promise = new Promise((resolve, reject) => {
      resolve([])
    })
    return promise
  }

  getLanguages () {
    let promise = new Promise((resolve, reject) => {
      resolve([])
    })
    return promise
  }

  _inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }

  _start () {
    this._eventHandler()
  }

  _backendLoadedRequest () {
    const msg = {
      msg: 'is-browser-backend-ready'
    }
    this._postMessage(msg)
  }

  _postMessage(message) {
    if (this._inIframe()) {
      window.parent.postMessage(message, '*')
    } else {
      window.postMessage(message, '*')
    }
  }

  _eventHandler () {
    window.addEventListener("message", evt => {
      let msgType
      if ('msg' in event.data) msgType = event.data['msg']
      if (msgType == 'browser-backend-ready') {
        this.backendLoaded = true
      } else if (msgType === 'resolve-browser-backend') {
        const resolve = this.promiseResolves[evt.data.resolveKey]
        if (resolve) {
          resolve(evt.data.value)
        } else {
          console.log('error: no resolve method for event', evt)
        }
      }
    }, false)
  }

  _waitFor(conditionFunction) {
    const poll = resolve => {
      if (conditionFunction()) resolve()
      else {
        this._backendLoadedRequest()
        setTimeout(_ => poll(resolve), 400)
      }
    }
    return new Promise(poll)
  }

}
