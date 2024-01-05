/*
 * Vertraulich
 */

import { newURL, getReferrerURL } from './utils/urls'

const el = document.querySelector('#tingtunGlossary') ||
  document.querySelector('script[src$="glossary.js"]')

const knownBackends = {
  termer: {
    url: 'https://glossary.tingtun.no/glossary2/',
    type: 'termer'
  },
  'https://glossary.tingtun.no': {
    url: 'https://glossary.tingtun.no/glossary2/',
    type: 'termer'
  },
  'http://termwiki.sprakradet.no': {
    url: 'http://termwiki.sprakradet.no/w/api.php',
    type: 'semanticmediawiki',
    smwProps: {
      source: 'Kategori',
      definition: 'definisjon'
    }
  },
  'https://www.geschichtewiki.wien.gv.at/': {
    url: 'https://www.geschichtewiki.wien.gv.at/api.php',
    type: 'semanticmediawiki',
    smwProps: {
      source: 'Kategorie',
      definition: ''
    },
    defaultSources: ['*']
  },
  'http://lexikon.kdz.eu': {
    url: 'http://lexikon.kdz.eu/api.php',
    type: 'semanticmediawiki',
    smwProps: {
      source: 'Kategorie',
      definition: 'Definition',
      image: 'Bildname',
      otherForms: 'Andere Form'
    },
    defaultSources: ['Begriffe']
  },
  'http://trial.kaleidoscope.at/kalcium610/': {
    url: 'http://trial.kaleidoscope.at/kalcium610/',
    type: 'quickterm',
    smwProps: {
      definition: 'Definition'
    }
  },
  'browser-backend': {
    url: 'browser-backend',
    type: 'browser-backend'
  }

}

function getApiKey () {
  let apikey = el.dataset.apikey || el.dataset.glossary_id || ''

  // workaround for missing api key at reisekjeden.no
  if (!apikey && window.location.host.search(/(?:www.)?reisekjeden\.no/, 'g') !== -1) {
    apikey = 'reisekjeden'
    el.dataset.apikey = apikey
  }

  if (!apikey) {
    apikey = getUrlAPIkey()
  }

  return apikey
}

function getOffline () {
  if (!el || !el.dataset) return false
  const offlineProperty = el.dataset.offline
  if (!offlineProperty) return false
  else {
    if (['false', '', '0'].indexOf(offlineProperty) === -1) return true
    else return false
  }
}

function setOffline (status) {
  el.dataset.offline = status
}

function getDefaultSources () {
  let defaultSources = el.dataset.defaultSources || ''
  defaultSources = defaultSources.split(',').filter(x => x)
  if (!defaultSources.length) defaultSources = null
  return defaultSources
}

function getSmwPropDefinition () {
  return el.dataset.smwPropDefinition || 'Definition'
}

function getSmwPropSource () {
  return el.dataset.smwPropSource || 'Category'
}

function getBackend () {
  const configuredBackend = el.dataset.backend
  let backendConfig = {}

  if (configuredBackend) {
    const a = configuredBackend.split('!')
    if (a.length > 2 || a.length === 0) {
      console.error('Invalid configured backend:', configuredBackend)
    } else if (a.length === 2) {
      backendConfig.url = newURL(a[1]).toString()
      backendConfig.type = a[0]
      if (backendConfig.type === 'semanticmediawiki') {
        backendConfig.smwProps = {
          source: getSmwPropSource(),
          definition: getSmwPropDefinition(),
          defaultSources: getDefaultSources()
        }
      }
    } else { // a.length == 1
      const knownBackend = knownBackends[a[0]]
      if (knownBackend) {
        backendConfig = knownBackend
      } else {
        // assume 'termer' backend at given url
        backendConfig.url = newURL(a[0]).toString()
        backendConfig.type = 'termer'
      }
    }
  } else { // default backend
    const url = newURL(
      el.src ||
      'https://glossary.tingtun.no'
    )
    url.pathname = '/glossary2/'

    backendConfig.url = url.toString()
    backendConfig.type = 'termer'
  }
  return backendConfig
}

function getFrontendUrl () {
  const url = newURL(
    el.dataset.frontendUrl ||
    newURL(el.src).origin ||
    'https://glossary.tingtun.no'
  )

  url.pathname = 'v/'

  return url.toString()
}

function getAppStyle (backend) {
  if (el && el.dataset.style) {
    return el.dataset.style
  } else if (/wien\.gv\.at/.test(backend.url)) {
    return 'wien'
  } else {
    return 'default'
  }
}

function getMarkupStype (backend) {
  if (el && el.dataset.markupstyle) {
    return el.dataset.markupstyle
  } else if (el && el.dataset.markupStype) {
    return el.dataset.markupStype
  } else {
    return 'termer_default_markup'
  }
}

function getDomains () {
  if (el && el.dataset.domains) {
    return el.dataset.domains
  } else {
    return null
  }
}

function getNotMarkPopup () {
  if (el && el.dataset.notmarkpopup) {
    return el.dataset.notmarkpopup
  } else {
    return false
  }
}

function getBackends () {
  if (el && el.dataset.backends) {
    return el.dataset.backends.split(',').map(x => x.trim())
  } else {
    return []
  }
}

function getSourceType () {
  if (el && el.dataset.sourceType) {
    return el.dataset.sourceType
  } else {
    return 'glossary'
  }
}

function getUrlSources () {
  const urlSources = getQueryParam('sources', newURL(window.location.href))[0]
  if (urlSources) {
    return urlSources.split(',').filter(x => x)
  } else {
    return []
  }
}

function getUrlAPIkey () {
  const apikey = getQueryParam('apikey', newURL(window.location.href))[0]
  if (apikey) {
    return apikey
  } else {
    return ''
  }
}

function getQueryParam (paramName, url) {
  let params = url.searchParams
  if (!params) {
    url = newURL(url)
    params = url.searchParams
  }
  return params.getAll(paramName)
}

function getConfigFile () {
  return new Promise((resolve, reject) => {
    if (el && el.dataset.confFile) {
      var url = el.dataset.confFile
    } else {
      resolve(null)
    }
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', url)
    xhr.onload = () => {
      if (xhr.status === 204) {
        resolve(null)
      } else if (xhr.status >= 200 && xhr.status < 400) {
        try {
          const response = JSON.parse(xhr.response)
          resolve(response)
        } catch (e) {
          console.error(e)
          reject(e)
        }
      } else {
        if (xhr.status >= 400 && xhr.status < 500) {
          try {
          // resolve({error: JSON.parse(xhr.response), status: xhr.status})
            resolve(null)
          } catch (e) {
          // resolve({error: xhr.response, status: xhr.status})
            reject(e)
          }
        } else {
          console.error('Unknown response from server:',
            { status: xhr.status, response: xhr.response }
          )
          // reject(new Error('Unknown response from server'))
          resolve(null)
        }
      }
    }
    xhr.send()
  })
}

function languageConversions (lang) {
  const languageName = {
    'nb-no': 'nb'
  }
  if (lang in languageName) {
    lang = languageName[lang]
  }
  return lang
}

function getSiteLanguage () {
  return languageConversions(document.documentElement.lang)
}

let Conf = {}
let offlineValue = null

const confParam = newURL(window.location.href).searchParams.get('cfg')
if (el && el.dataset.confFile) {
  offlineValue = getOffline()
  Conf = createConfigFromElement(el)
  Conf.offline = true
  getConfigFile().then(newConf => {
    updateConfig(newConf)
  }).catch(error => {
    console.error('An error occured while trying to fetch the config file')
    console.error(error)
  })
} else if (el) {
  Conf = createConfigFromElement(el)
} else if (confParam) {
  Object.assign(Conf, JSON.parse(confParam))
} else {
  Conf = createDefaultConfig()
}

function updateConfig (newConf) {
  for (const property in newConf) {
    if (Object.hasOwnProperty.call(newConf, property)) {
      Conf[property] = newConf[property]
    }
  }
  if (!('offline' in newConf) && !offlineValue) {
    Conf.offline = false
  }
  if (!Conf.offline) {
    window.postMessage({ msg: 'turnOn', source: 'termer-content-script' }, '*')
  }
}

function getReferrer () {
  const ref = getReferrerURL().origin
  return ref
}

function createConfigFromElement (el) {
  const apikey = getApiKey() // String; data-glossary_id
  const backend = getBackend()
  const backends = getBackends()
  const frontendUrl = getFrontendUrl()
  const appStyle = getAppStyle(backend)
  const markupStype = getMarkupStype(backend)
  const domains = getDomains()
  const notMarkPopup = getNotMarkPopup()
  const siteLanguage = getSiteLanguage()
  const sourceType = getSourceType()
  const urlSources = getUrlSources()
  const referrer = getReferrer()

  return {
    // Boolean; data-offline
    get offline () {
      return getOffline()
    },
    set offline (status) {
      setOffline(status)
    },

    showLabels: true,

    apikey,
    backend,
    frontendUrl,
    appStyle,
    markupStype,
    domains,
    notMarkPopup,
    siteLanguage,
    sourceType,
    urlSources,
    referrer,
    backends
  }
}

function createDefaultConfig () {
  let url
  if (window.location.origin === 'http://glossary.tingtun.no') {
    url = newURL('https://glossary.tingtun.no')
  } else {
    url = newURL(window.location.origin)
  }
  const backendConfig = {}

  url.pathname = '/glossary2/'
  backendConfig.url = url.toString()
  backendConfig.type = 'termer'
  const backend = backendConfig

  url.pathname = 'v/'
  const backends = getBackends()
  const frontendUrl = url.toString()
  const appStyle = getAppStyle(backend)
  const markupStype = getMarkupStype(backend)
  const apikey = getUrlAPIkey()
  const defaultConf = 'This is was made because no config element is pressent'
  const wordListParamsCheck = {}
  const siteLanguage = getSiteLanguage()
  const sourceType = getSourceType()
  const urlSources = getUrlSources()
  const referrer = getReferrer()

  return {
    // Boolean; data-offline
    get offline () {
      return getOffline()
    },
    set offline (status) {
      setOffline(status)
    },

    showLabels: true,

    apikey,
    backend,
    frontendUrl,
    appStyle,
    markupStype,
    defaultConf,
    wordListParamsCheck,
    siteLanguage,
    sourceType,
    urlSources,
    referrer,
    backends
  }
}

export default Conf
