export const sites = [
  'insitu',
  'iate',
  'hovedredningssentralen',
  'kbt',
  'kbt1',
  'helse',
  'termer',
  'jus',
  'wcag',
  'titi',
  'english',
  'up',
  'mfa',
  'br22',
  'ukrainian',
  'kildebruk',
  'kristiantest'
]

export function getAvalebleSites () {
  return sites
}

function urlSiteName (url = window.location.href) {
  const _url = new URL(url)
  const urlParams = new URLSearchParams(_url.search)
  const domainList = _url.host.split('.')
  let domain = domainList[domainList.length - 2]
  if (domain === 'termer' && domainList.length > 2 && domainList[0] !== 'www') {
    domain = domainList[0]
  }
  const myParam = urlParams.get('site')
  return myParam || domain
}

function scriptSiteName () {
  const glossaryScript = document.getElementById('tingtunGlossary')
  if (glossaryScript && glossaryScript.dataset.site) {
    return glossaryScript.dataset.site
  }
  const jsonScriptTag = document.getElementById('termer-custom-settings')
  let jsonConfig
  if (jsonScriptTag) jsonConfig = JSON.parse(jsonScriptTag.innerHTML)
  if (jsonConfig && 'site' in jsonConfig) return jsonConfig['site']
  return null
}

export function getSiteName (url = window.location.href) {
  let site
  const siteName = urlSiteName(url)
  const scriptSite = scriptSiteName()
  if (siteName && sites.includes(siteName)) {
    site = siteName
  } else if (scriptSite && sites.includes(scriptSite)) {
    site = scriptSite
  }
  return site
}

export async function fetchSiteConfiguration (url) {
  // look for site name in a) domain part of url, b) the site= url
  // parameter.
  let site
  const siteName = getSiteName(url)
  if (siteName) {
    const imported = await import('./sites/' + siteName + '.js')
    site = imported.default
  } else {
    site = (await import('./sites/default.js')).default
  }
  return site
}

function isSite (siteName, url = window.location.href) {
  url = new URL(url)
  const host = url.host
  const query = url.search
  const hostRegex = new RegExp(`\\b${siteName}\\b`)
  const queryRegex = new RegExp(`site=${siteName}\\b`)
  return hostRegex.test(host) || queryRegex.test(query)
}
