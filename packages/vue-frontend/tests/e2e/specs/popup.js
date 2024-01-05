const base = process.env.VUE_DEV_SERVER_URL
const { user, testingTerm } = require('../testdata')

let sourceId = null

module.exports.before = function (browser) {
  browser
    .url(base)
    .userExists(user)
    .login(user)
    .termExists(testingTerm, result => { sourceId = result.value })
}

// Test for popup
const popupResults = [
  {
    name: '/lookup/ - login, no result',
    urlPath: '#/lookup/testing/',
    expected: { elementId: '#no-result-listing' }
  },
  {
    name: '/lookup/ - login, one result',
    urlPath: '#/lookup/test/',
    expected: { elementId: '#termer-resullt-listing' }
  }
]

for (const { name, expected, urlPath } of popupResults) {
  module.exports[name] = popupResultsShown(expected, urlPath)
}

function popupResultsShown (expected, urlPath) {
  function f (browser) {
    browser
      .url(base)
      .login(user)
      .perform(() => {
        // `perform` is used here in order to evaluate the value of sourceId as
        // late as possible.
        browser
          .url(`${base}?sources=${sourceId}${urlPath}`)
          .expect.element('#lookup-wrapper').to.be.present.before(2000)
        browser.expect.element(expected.elementId).to.be.visible.before(2000)
        browser.end()
      })
  }
  return f
}
