const base = process.env.VUE_DEV_SERVER_URL
const { user, testingTerm } = require('../testdata')

let testApiKey; let defaultApiKey = null
const testAPI = 'testapikey'
const defaultAPI = 'bb063d2fe8cabcdc92ee'

module.exports.before = function (browser) {
  browser
    .url(base)
    .termExists(testingTerm, result => { sourceId = result.value })
    .apikeyExists(testAPI, result => { testApiKey = result.value })
    .apikeyExists(defaultAPI, result => { defaultApiKey = result.value })
}

// Test for popup
const searchApikeyCheck = [
  {
    name: '/search/ - apikey with result',
    urlPath: '#/search/test/?apikey=testapikey',
    expected: { elementId: '#termer-resullt-listing' },
    notVisible: {}
  },
  {
    name: '/search/ - got default apikey',
    urlPath: '#/search/',
    expected: {},
    notVisible: { elementId: '#storragecontainer' }
  }
]

const searchResultCheck = [
  {
    name: '/search/ - search for test',
    urlPath: '#/search/',
    expected: { elementId: '#termer-resullt-listing' }
  },
  {
    name: '/search/ - search for test with API--key',
    urlPath: '#/search/?apikey=testapikey',
    expected: { elementId: '#termer-resullt-listing' }
  }
]

const searchSelector = [
  {
    name: '/search/ - accapt localstorage',
    urlPath: '#/search/',
    expected: { elementId: '#selectcontainer > div > div[name=sources]' }
  }
]

for (const { name, expected, notVisible, urlPath } of searchApikeyCheck) {
  module.exports[name] = searchResultsShown(expected, notVisible, urlPath)
}

for (const { name, expected, urlPath } of searchResultCheck) {
  module.exports[name] = preformSearch(expected, urlPath)
}

for (const { name, expected, urlPath } of searchSelector) {
  module.exports[name] = getSourceList(expected, urlPath)
}

function gotApikey (browser) {
  browser.expect(testApiKey).to.be.equal('Got sources from apikey: ' + testAPI)
  browser.expect(defaultApiKey).to.be.equal('Got sources from apikey: ' + defaultAPI)
}

function searchResultsShown (expected, notVisible, urlPath) {
  function f (browser) {
    browser
      .url(base)
      .perform(() => {
        // `perform` is used here in order to evaluate the value of sourceId as
        // late as possible.
        gotApikey(browser)
        browser
          .url(`${base}${urlPath}`)
          .expect.element('#search-wrapper').to.be.present.before(2000)
        if (expected && Object.entries(expected).length !== 0) {
          browser.expect.element(expected.elementId).to.be.visible.before(2000)
        }
        if (notVisible && Object.entries(notVisible).length !== 0) {
          browser.expect.element(notVisible.elementId).to.be.present.before(2000)
          browser.expect.element(notVisible.elementId).to.not.be.visible.before(2000)
        }
        browser.end()
      })
  }
  return f
}

function preformSearch (expected, urlPath) {
  function f (browser) {
    browser
      .url(base)
      .perform(() => {
        gotApikey(browser)
        browser
          .url(`${base}${urlPath}`)
          .expect.element('#search-wrapper').to.be.present.before(2000)
        browser
          .setValue('input[type=text]', 'test')
          .click('button[type=submit]')
        browser.expect.element(expected.elementId).to.be.visible.before(2000)
        browser.end()
      })
  }
  return f
}

function getSourceList (expected, urlPath) {
  function f (browser) {
    browser
      .url(base)
      .perform(() => {
        gotApikey(browser)
        browser
          .url(`${base}${urlPath}`)
          .expect.element('#search-wrapper').to.be.present.before(2000)
        browser
          .click('div[class=select-text]')
          .click('#storragecontainer > button')
        browser.expect.element(expected.elementId).to.be.visible.before(20000)
        browser.end()
      })
  }
  return f
}
