/*
 * Vertraulich
 */

// This import statement for the url polyfill lets us import it and bind it to
// a name (“URL”). Otherwise it would modify the Window object, which causes
// issues for some reason.
//
// In this way, window.URL remains unchanged, but we can use URL here for a
// modern URL implementation.
//
// eslint-disable-next-line import/no-webpack-loader-syntax
import { URL } from 'imports-loader?self=>window.Symbol?{Symbol: window.Symbol}:{}!exports-loader?self!js-polyfills/url.js'

// Let’s cache the result of getReferrerURL() here
// (referrer cannot be changed)
let cachedReferrer = null
// Find a url we can use as referrer; it should be different from the
// glossary server URL.
export function getReferrerURL () {
  if (cachedReferrer) {
    return cachedReferrer
  }

  const glossaryServer = getGlossaryServerURL()
  const currentLocation = newURL(getWindowLocationHref(window))

  let referrer = null
  if (document.referrer) {
    referrer = newURL(document.referrer)
  }
  let referrerParam = currentLocation.searchParams.get('ref') || // &ref= parameter
    currentLocation.searchParams.get('url') // &url= param (used in glossary proxy)

  // Default non-empty return value.
  // In case we failed to find an actual referrer URL, fallback to
  // current location.
  let referrerURL = currentLocation

  if (currentLocation.host !== glossaryServer.host) {
    // use current location as referrer as it is different from glossary server
    referrerURL = newURL(currentLocation.href)
  } else if (referrer && referrer.host !== glossaryServer.host) {
    // document.referrer is defined & different from glossary server
    referrerURL = newURL(referrer)
  } else if (referrerParam) {
    // referrer is provided as a URL parameter; use it
    try {
      referrerParam = decodeURIComponent(referrerParam)
    } catch (e) { /* decoding can fail if the URL contains invalid % escapes. */ }
    if (!referrerParam.match(/^(?:[a-z0-9_-]+:)?\/\//)) {
      // scheme/protocol or leading // is required for the parser to work.
      referrerParam = '//' + referrerParam
    }
    referrerURL = newURL(referrerParam)
  }
  // If there is no host, set host to localhost
  // This is so that the localstorage will get a host
  // when saving glossaries. (Reading a local file needs this)
  if (!referrerURL.host || referrerURL.host === 'null') {
    const tempURL = referrerURL.href
    referrerURL = newURL('http://localhost/' + tempURL)
  }
  // referrerURL = referrerURL + ''
  cachedReferrer = referrerURL
  return referrerURL
}

function getWindowLocationHref (win) {
  if (win.location.href === 'about:blank' && win !== win.top) {
    return getWindowLocationHref(win.parent)
  } else {
    return win.location.href
  }
}

// Find the glossary server url
export function getGlossaryServerURL () {
  const el = getGlossaryScriptElement()
  let src = (el && el.src) ||
    'https://glossary.tingtun.no'

  const testingHosts = ['127.0.0.1', 'localhost']
  const testingPorts = ['3000', '3001', '8000', '8010']
  if (testingHosts.indexOf(window.location.hostname) > -1 &&
    testingPorts.indexOf(window.location.port) > -1) {
    // Running dev server or testing
    src = 'http://localhost:8000'
  } else {
    src = 'https://glossary.tingtun.no'
  }

  const url = newURL(src)
  url.pathname = ''
  return url
}

function getGlossaryScriptElement () {
  const el = document.querySelector(
    '#tingtunGlossary, script[src$="glossary.js"]'
  )
  return el
}

export function newURL (url) {
  // In IE11 + Edge we use the url polyfill for search params. But it fails on
  // invalid %-escapes. Check if we can decode the url without throwing an
  // exception; if not, replace the url with the unescaped() version.
  try {
    decodeURI(url)
  } catch (e) {
    url = encodeURI(unescape(url))
  }

  return new URL(url)
}
