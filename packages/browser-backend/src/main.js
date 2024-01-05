/*
 * Vertraulich
 */

import EurLexDefinitions from './EurLexDefinitions'

export class BrowserBackend {
  constructor () {
    const self = this
    self.loadedGlossary = false
    self.promiseResolves = []
    self.backends = []
    self._start()
  }

  termSearch (term, params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.loadedGlossary === true)
      .then(_ => {
        const backendList = []
        for (const backend of self.backends) {
          backendList.push(backend.termSearch(term, params))
        }
        Promise.all(backendList).then(function(values) {
          const response = {'results': []}
          for (const value of values) {
            response['results'] = response['results'].concat(value)
          }
          resolve(response)
        })
      })
    })
    return promise
  }

  getWordlist (params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.loadedGlossary === true)
      .then(_ => {
        const backendList = []
        for (const backend of self.backends) {
          backendList.push(backend.getWordlist(params))
        }
        Promise.all(backendList).then(function(values) {
          const response = { 'wordlist': [], 'regexs': [] }
          for (const value of values) {
            response['wordlist'] = response['wordlist'].concat(value['wordlist'])
            response['regexs'] = response['regexs'].concat(value['regexs'])
          }
          resolve(response)
        })
      })
    })
    return promise
  }

  getSourceList (params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.loadedGlossary === true)
      .then(_ => {
        const backendList = []
        for (const backend of self.backends) {
          backendList.push(backend.getSourceList(params))
        }
        Promise.all(backendList).then(function(values) {
          const response = {'results': []}
          for (const value of values) {
            response['results'] = response['results'].concat(value['results'])
          }
          resolve(response)
        })
      })
    })
    return promise
  }

  _start() {
    this._eventHandler()
    this._addBackends()
    this.loadedGlossary = true
  }

  _fixGlossaries () {
    // NOT USED
    let sourceID = 1
    for (const backend of this.backends) {
      for (const source of backend.sources) {
        source.id = sourceID
        source.source_description['id'] = sourceID
        sourceID += 1
      }
    }
  }

  _eventHandler () {
    window.addEventListener("message", evt => {
      let msgType
      if ('msg' in event.data) msgType = event.data['msg']
      if (msgType == 'is-browser-backend-ready') {
        const msg = {
          msg: 'browser-backend-ready'
        }
        event.source.postMessage(msg, '*')
      } else if (msgType === 'lookup-term') {
        const term = event.data.term
        const params = event.data.params
        this.termSearch(term, params).then(value => {
          const msg = {
            msg: 'resolve-browser-backend',
            value,
            resolveKey: evt.data.resolveKey,
            original: evt.data
          }
          event.source.postMessage(msg, '*')
        })
      } else if (msgType === 'get-wordlist') {
        const params = event.data.params
        this.getWordlist(params).then(value => {
          const msg = {
            msg: 'resolve-browser-backend',
            value,
            resolveKey: evt.data.resolveKey,
            original: evt.data
          }
          event.source.postMessage(msg, '*')
        })
      } else if (msgType === 'get-sources') {
        const params = event.data.params
        this.getSourceList(params).then(value => {
          const msg = {
            msg: 'resolve-browser-backend',
            value,
            resolveKey: evt.data.resolveKey,
            original: evt.data
          }
          event.source.postMessage(msg, '*')
        })
      }
    }, false)
  }

  _addBackends () {
    const eurLexDefinitions = new EurLexDefinitions()
    this.backends.push(eurLexDefinitions)
  }

  _waitFor(conditionFunction) {
    const poll = resolve => {
      if (conditionFunction()) resolve()
      else setTimeout(_ => poll(resolve), 400)
    }
    return new Promise(poll)
  }
}
