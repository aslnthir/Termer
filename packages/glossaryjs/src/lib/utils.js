/*
 * Vertraulich
 */

import {
  getGlossaryServerURL, getReferrerURL, newURL, Conf
} from 'glossarylib'

function getGlossaryApikey () {
  return Conf.apikey
}

const scriptTag = document.getElementById('tingtunGlossary') || null
const jsonScriptTag = document.getElementById('termer-custom-settings') || null
let jsonConfig
if (jsonScriptTag) jsonConfig = JSON.parse(jsonScriptTag.innerHTML)

let scriptDomain = new URL(scriptTag.src).origin
if (scriptDomain === 'http://localhost:3001') scriptDomain= 'http://localhost:3002'

const popupurl = newURL(
  (
    scriptDomain +
    (process.env.VUE_APP_PUBLIC_PATH || '')
  ) || '/'
)
if (popupurl.pathname.slice(-1) !== '/') {
  // ensure trailing slash
  popupurl.pathname += '/'
}

async function getGlossaryConfigURL (params) {
  params['site'] = getSite()
  const appDomain = new URL(popupurl)
  const url = addQueryParams(newURL(appDomain), params)
  url.pathname += 'search/'
  if (window.name === 'termer-pdf-popup') url.searchParams.append('pdfconfig', '1')
  return url
}

async function getGlossaryPopupURL (term, params) {
  params['site'] = getSite()
  const appDomain = new URL(popupurl)
  const url = addQueryParams(newURL(appDomain), params)
  term = encodeURIComponent(term.replace(/&nbsp;/gi, ' '))
  if (term) {
    url.pathname += `lookup/${term}/`
  } else {
    url.pathname += 'empty/'
  }
  return url
}

function addQueryParams (url, params) {
  for (let key in params) {
    let value = params[key]
    if (value) {
      url.searchParams.append(key, value)
    }
  }
  return url
}

function getSite () {
  const sites = {
    hovedredningssentralen: [
      'hovedredningssentralen.demo.hcweb.no',
      'www.hovedredningssentralen.no',
      'hovedredningssentralen.no'
    ]
  }
  let site = 'default'
  const urlParams = new URLSearchParams(window.location.search)
  if (scriptTag && scriptTag.dataset.site) site = scriptTag.dataset.site
  else if (jsonConfig && 'site' in jsonConfig) site = jsonConfig['site']
  if (urlParams.has('site')) site = urlParams.get('site')
  else if (window.top === window.self || window.name === 'termer-pdf-popup') {
    for (let [key, list] of Object.entries(sites)) {
      if (list.includes(window.location.host)) {
        site = key
        break
      }
    }
  }
  return site
}

function* getParents (el) {
  for (;;) {
    let p = el.parentElement
    if (p) {
      yield p
      el = p
    } else {
      break
    }
  }
}

function getViewportDimensions () {
  let width, height
  if (document.compatMode === 'BackCompat') {
    width = document.body.clientWidth
    height = document.body.clientHeight
  } else {
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
  }
  return {width, height}
}


// No .‘s are allowed in the export statement.
const x = getReferrerURL
const y = getGlossaryServerURL

export {
  getGlossaryPopupURL,
  getGlossaryConfigURL,
  getGlossaryApikey,
  x as getReferrerURL,
  y as getGlossaryServerURL,
  getParents,
  getViewportDimensions,
  getSite
}
