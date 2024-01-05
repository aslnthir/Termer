/*
 * Vertraulich
 */

import { getGlossaryServerURL, getReferrerURL } from './utils/urls'
import './pollyfils'
import Conf from './config'

class GlossaryStorage {
  constructor () {
    this.glossaryDomain = getGlossaryServerURL()
    this.iframeURL = this.glossaryDomain.protocol + '//' +
        this.glossaryDomain.host + '/localstorage/'

    if (location.host === this.glossaryDomain.host) {
      this.iframe = null
      if (window.name === 'glossary_local_storage') {
        if (/complete|interactive/.test(document.readyState)) {
          this.addSelectedGlossariesChangeListener(this.iframeChangeListener)
        } else {
          document.addEventListener('DOMContentLoaded', () => this.addSelectedGlossariesChangeListener(this.iframeChangeListener))
        }
      }
    } else {
      // XXX: I don’t know why/if we need to wait with creating the iframe here.
      if (/complete|interactive/.test(document.readyState)) {
        this.createIframe()
      } else {
        document.addEventListener('DOMContentLoaded', () => this.createIframe())
      }
      this.iframeLoaded = false
      this.promiseResolves = []
      this.messageQueue = []
    }
    this.callbacks = {}
    this.handleMessages()
    this.handleStorageEvents()

    if (location.origin + location.pathname === this.iframeURL) {
      window.parent.postMessage({ msg: 'storage-iframe-ready' }, '*')
    }
  }

  createIframe () {
    if (!document.getElementById('glossary_local_storage')) {
      const iframe = this.iframe = document.createElement('iframe')
      iframe.id = 'glossary_local_storage'
      iframe.name = 'glossary_local_storage'
      iframe.className = 'glossaryjs'
      iframe.style.top = '-1000px'
      iframe.style.left = '-1000px'
      iframe.style.position = 'absolute'
      iframe.title = 'Termer Local Storage Iframe'
      document.body.appendChild(iframe)
      // Cache busting URL is a workaround for a cache bug in safari 10 on ipad
      // where the cached page seems to be corrupted.
      // src += '?rv=' + Date.now()
      iframe.src = this.iframeURL +
      '?cfg=' + encodeURI(JSON.stringify(Conf))
    }
  }

  onIframeLoad () {
    this.iframeLoaded = true
    this.sendQueuedMessages()
  }

  handleMessages () {
    window.addEventListener('message', evt => {
      // Ignore messages from same window and those that don’t have the
      // expected data.
      if (evt.source === window || !evt.data || !evt.data.msg) return
      // console.log(window, 'received message', evt.data, 'from', evt.source)

      const msgType = evt.data.msg
      if (msgType === 'getSelectedGlossaries') {
        this.getSelectedGlossaries(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'setSelectedGlossaries') {
        this.setSelectedGlossaries(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'getRemovedGlossaries') {
        this.getRemovedGlossaries(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'setRemovedGlossaries') {
        this.setRemovedGlossaries(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'getConceptLanguages') {
        this.getConceptLanguages(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'setConceptLanguages') {
        this.setConceptLanguages(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'getLocalStoragePremission') {
        this.getLocalStoragePremission(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'setLocalStoragePremission') {
        this.setLocalStoragePremission(evt.data.params)
          .then(value => {
            const msg = {
              msg: 'resolve',
              value,
              resolveKey: evt.data.resolveKey,
              original: evt.data
            }
            window.parent.postMessage(msg, '*')
          })
      } else if (msgType === 'resolve') {
        if (evt.data.original && evt.data.original.msg === 'setSelectedGlossaries') {
          this.runCallbacks('SelectedGlossaries', evt.data.original.domain,
            evt.data.original.glossaries)
        }
        const resolve = this.promiseResolves[evt.data.resolveKey]
        if (resolve) {
          resolve(evt.data.value)
        } else {
          console.log('error: no resolve method for event', evt)
        }
      } else if (msgType === 'selectedGlossariesChanged') {
        this.runCallbacks('SelectedGlossaries', evt.data.domain,
          evt.data.glossaries)
      } else if (msgType === 'storage-iframe-ready') {
        this.onIframeLoad()
      } else if (msgType === 'removeStorageKey') {
        this.removeStorageKey(evt.data.params)
      } else if (msgType === 'setStorageKeyValue') {
        this.setStorageKeyValue(evt.data.params)
      } else if (msgType === 'setDescriptionLanguages') {
        this.setDescriptionLanguages(evt.data.params.value).then(value => {
          const msg = {
            msg: 'resolve',
            value,
            resolveKey: evt.data.resolveKey,
            original: evt.data
          }
          window.parent.postMessage(msg, '*')
        })
      } else if (msgType === 'getDescriptionLanguages') {
        this.getDescriptionLanguages().then(value => {
          const msg = {
            msg: 'resolve',
            value,
            resolveKey: evt.data.resolveKey,
            original: evt.data
          }
          window.parent.postMessage(msg, '*')
        })
      }
    })
  }

  handleStorageEvents () {
    const key = getReferrerURL().host
    window.addEventListener('storage', evt => {
      if (evt.key === 'SelectedGlossaries') {
        if (Conf.backend && Conf.backend.url) {
          const values = this.converStorageValue(evt.newValue, key, Conf.backend.url)
          this.runCallbacks(evt.key, key, values)
        }
      }
    })
  }

  setStorageKeyValue (params) {
    return new Promise(resolve => {
      const { key, value } = params || {}
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setStorageKeyValue',
          params: {
            key,
            value
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        if (localStorage.getItem('LocalStoragePremission')) {
          window.localStorage.setItem(key, value)
        }
        resolve(true)
      }
    })
  }

  removeStorageKey (params) {
    return new Promise(resolve => {
      const { key } = params || {}
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'removeStorageKey',
          params: {
            key
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        if (localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key)
        }
        resolve(true)
      }
    })
  }

  getSessionLanguage (params) {
    return new Promise(resolve => {
      let { domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || (Conf.backend && Conf.backend.url)
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getSessionLanguage',
          params: {
            domain,
            backendUri
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        resolve(window.localStorage.getItem('SessionLanguage') || '')
      }
    })
  }

  setSessionLanguage (params) {
    return new Promise(resolve => {
      // const origDomain = domain
      let { value, domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || Conf.backend.url
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setSessionLanguage',
          params: {
            domain,
            backendUri,
            value
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        this.getLocalStoragePremission({}).then(storragePremission => {
          if (storragePremission) {
            window.localStorage.setItem('SessionLanguage', value)
            resolve(value)
          } else {
            resolve('')
          }
        })
      }
    })
  }

  getLocalStoragePremission (params) {
    return new Promise(resolve => {
      let { domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || (Conf.backend && Conf.backend.url)
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getLocalStoragePremission',
          params: {
            domain,
            backendUri
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        resolve(window.localStorage.getItem('LocalStoragePremission') || false)
      }
    })
  }

  setLocalStoragePremission (params) {
    return new Promise(resolve => {
      // const origDomain = domain
      let { value, domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || Conf.backend.url
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setLocalStoragePremission',
          params: {
            domain,
            backendUri,
            value
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        window.localStorage.setItem('LocalStoragePremission', value)
        resolve(value)
      }
    })
  }

  getSelectedGlossaries (params) {
    return new Promise(resolve => {
      let { domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || (Conf.backend && Conf.backend.url)
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getSelectedGlossaries',
          params: {
            domain,
            backendUri
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        resolve(this.getValue('SelectedGlossaries', domain, backendUri))
      }
    })
  }

  setSelectedGlossaries (params) {
    return new Promise(resolve => {
      // const origDomain = domain
      let { glossaries, domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || Conf.backend.url
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setSelectedGlossaries',
          params: {
            domain,
            backendUri,
            glossaries
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        const changed = this.setValue('SelectedGlossaries', domain, backendUri, glossaries)
        if (changed) {
          this.runCallbacks('SelectedGlossaries', domain, glossaries)
          if (window !== window.parent) {
            const msg = {
              msg: 'selectedGlossariesChanged',
              domain,
              glossaries
            }
            window.parent.postMessage(msg, '*')
          }
        }
        resolve(changed)
      }
    })
  }

  getRemovedGlossaries (params) {
    return new Promise(resolve => {
      let { domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || (Conf.backend && Conf.backend.url)
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getRemovedGlossaries',
          params: {
            domain,
            backendUri
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        resolve(this.getValue('RemovedGlossaries', domain, backendUri))
      }
    })
  }

  setRemovedGlossaries (params) {
    return new Promise(resolve => {
      // const origDomain = domain
      let { glossaries, domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || Conf.backend.url
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setRemovedGlossaries',
          params: {
            domain,
            backendUri,
            glossaries
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        const changed = this.setValue('RemovedGlossaries', domain, backendUri, glossaries)
        if (changed) {
          this.runCallbacks('RemovedGlossaries', domain, glossaries)
          if (window !== window.parent) {
            const msg = {
              msg: 'removedGlossariesChanged',
              domain,
              glossaries
            }
            window.parent.postMessage(msg, '*')
          }
        }
        resolve(changed)
      }
    })
  }

  getConceptLanguages (params) {
    return new Promise(resolve => {
      let { domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || (Conf.backend && Conf.backend.url)
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getConceptLanguages',
          params: {
            domain,
            backendUri
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        resolve(this.getValue('ConceptLanguages', domain, backendUri))
      }
    })
  }

  setConceptLanguages (params) {
    return new Promise(resolve => {
      // const origDomain = domain
      let { langauges, domain, backendUri } = params || {}
      domain = domain || getReferrerURL().host
      backendUri = backendUri || Conf.backend.url
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setConceptLanguages',
          params: {
            domain,
            backendUri,
            langauges
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        const changed = this.setValue('ConceptLanguages', domain, backendUri, langauges)
        if (changed) {
          this.runCallbacks('ConceptLanguages', domain, langauges)
          if (window !== window.parent) {
            const msg = {
              msg: 'conceptLanguagesChanged',
              domain,
              langauges
            }
            window.parent.postMessage(msg, '*')
          }
        }
        resolve(changed)
      }
    })
  }

  setDescriptionLanguages (value) {
    return new Promise(resolve => {
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'setDescriptionLanguages',
          params: {
            value
          },
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        // Store value and check if changed?
        window.localStorage.setItem('descriptionLanguages', JSON.stringify(value))
        resolve(value)
      }
    })
  }

  getDescriptionLanguages () {
    return new Promise(resolve => {
      if (this.iframe) {
        this.promiseResolves.push(resolve)
        const resolveKey = this.promiseResolves.length - 1
        const msg = {
          msg: 'getDescriptionLanguages',
          resolveKey
        }
        this.postMessage(msg, this.iframe.src)
      } else {
        try {
          const value = JSON.parse(window.localStorage.getItem('descriptionLanguages'))
          resolve(value)
        } catch (e) {
          console.warn(e)
          resolve([])
        }
      }
    })
  }

  getGlossaryOrder () {
    console.warn('getGlossaryOrder not implemented')
    return new Promise(resolve => resolve([]))
  }

  setGlossaryOrder () {
    console.warn('setGlossaryOrder not implemented')
  }

  addSelectedGlossariesChangeListener (fun) {
    const key = getReferrerURL().host
    this.addChangeListener('SelectedGlossaries', key, fun)
  }

  addChangeListener (storageKey, key, fun) {
    // console.log('addChangeListener', ...arguments, window)
    // Initialize the listener collections if they do not exist.
    let storageKeyCallbacks = this.callbacks[storageKey]
    if (!storageKeyCallbacks) {
      storageKeyCallbacks = this.callbacks[storageKey] = {}
    }

    let keyCallbacks = storageKeyCallbacks[key]
    if (!keyCallbacks) {
      keyCallbacks = storageKeyCallbacks[key] = []
    }

    // Add the callback
    keyCallbacks.push(fun)
  }

  iframeChangeListener (selected) {
    parent.postMessage({ msg: 'reloadMarkup' }, '*')
  }

  runCallbacks (storageKey, key, value) {
    // console.log('runCallbacks', ...arguments, window)
    const storageKeyCallbacks = this.callbacks[storageKey] || {}
    const keyCallbacks = storageKeyCallbacks[key] || []
    // console.log('found callbacks for', storageKey, key, keyCallbacks)
    for (const cb of keyCallbacks) cb(value)
  }

  setValue (storageKey, key, subKey, value) {
    this.getLocalStoragePremission({}).then(storragePremission => {
      if (!storragePremission) {
        return false
      }
      let jsonData = window.localStorage.getItem(storageKey) || '{}'
      try {
        jsonData = JSON.parse(jsonData)
      } catch (e) {
        console.warn(e) // error in the above string (in this case, yes)!
        console.warn('Json data given:')
        console.warn(jsonData)
        jsonData = {}
      }
      const allData = jsonData
      const data = this.convertOldFormat(allData[key],
        'https://glossary.tingtun.no/glossary2/') || {}

      const oldValue = data[subKey]
      if (!isEqual(value, oldValue)) {
        data[subKey] = value
        allData[key] = data
        window.localStorage.setItem(storageKey, JSON.stringify(allData))
        return true
      } else {
        return false
      }
    })
  }

  getValue (storageKey, key, subKey) {
    const jsonData = window.localStorage.getItem(storageKey) || '{}'
    if (!subKey) subKey = window.location.origin + '/glossary2/'
    return this.converStorageValue(jsonData, key, subKey)
    // XXX: tingtunDefault probably doesn’t work yet.
  }

  converStorageValue (jsonData, key, subKey) {
    if (!jsonData) return []
    try {
      jsonData = JSON.parse(jsonData)
    } catch (e) {
      console.warn(e) // error in the above string (in this case, yes)!
      console.warn('Json data given:')
      console.warn(jsonData)
      jsonData = {}
    }
    const defaultSubKey = window.location.origin + '/glossary2/'
    const data = this.convertOldFormat(jsonData[key],
      // 'https://glossary.tingtun.no/glossary2/')
      defaultSubKey) || []
    // || jsonData['tingtunDefault']
    if (!data) return null
    if (!Object.keys(data).length > 0 && 'tingtunDefault' in jsonData && jsonData.tingtunDefault.length) return { default: jsonData.tingtunDefault }
    let value = []
    if (subKey in data) value = data[subKey]
    else value = data
    if (value && value.length) {
      // ensure that list values are strings
      value = value.map(x => '' + x)
    }
    return { selected: value }
    // XXX: tingtunDefault probably doesn’t work yet.
  }

  convertOldFormat (data, defaultSubKey) {
    if (Array.isArray(data)) {
      data = data.map(x => '' + x)
      const newData = {}
      newData[defaultSubKey] = data
      data = newData
    }
    return data
  }

  postMessage () {
    if (this.iframeLoaded) {
      this.sendMessage(arguments)
    } else {
      this.enqueueMessage(arguments)
    }
  }

  enqueueMessage (message) {
    this.messageQueue.push(message)
  }

  sendQueuedMessages () {
    if (!this.messageQueue) {
      return
    }
    let message = this.messageQueue.shift()
    while (message) {
      this.sendMessage(message)
      message = this.messageQueue.shift()
    }
  }

  sendMessage (message) {
    this.iframe.contentWindow.postMessage(...message)
  }
}

function isEqual (a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return arraysAreEqual(a, b)
  } else {
    return a === b
  }
}

function arraysAreEqual (arrayA, arrayB) {
  return arrayA && arrayB && arrayA.length === arrayB.length &&
    arrayA.every((item, index) => item === arrayB[index])
}

let glossaryStorage

if (!glossaryStorage) {
  glossaryStorage = new GlossaryStorage()
}

export default glossaryStorage
