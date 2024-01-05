/* eslint-disable no-unused-expressions */
const base = process.env.VUE_DEV_SERVER_URL
const { user } = require('../testdata')

module.exports.before = function (browser) {
  browser
    .url(base)
    .userExists(user)
}

module.exports['/login/ - termer login'] = browser => {
  browser
    .url(base + '#/login/')
    .expect.element('#termer-login').to.be.visible.before(2000)
  browser.click('#termer-login')
    .expect.element('#termer-login-form').to.be.visible.before(2000)
  browser.end()
}

const homeLinks = [
  {
    name: '/ - manage glossaries',
    linkId: '#manage-link',
    expectedElementId: '#manage-glossaries-view'
  },
  {
    name: '/ - user settings',
    linkId: '#settings-link',
    expectedElementId: '#user-config-view'
  },
  {
    name: '/ - about termer',
    linkId: '#about-link',
    expectedElementId: '#about-view'
  },
  {
    name: '/ - help',
    linkId: '#help-link',
    expectedElementId: '#help-view'
  }
]

for (const { name, linkId, expectedElementId } of homeLinks) {
  module.exports[name] = homeLinkTest(linkId, expectedElementId)
}

function homeLinkTest (linkId, expectedElementId) {
  function f (browser) {
    browser
      .url(base)
      .login(user)
      .expect.element(linkId).to.be.visible.before(2000)
    browser.click(linkId)
      .expect.element(expectedElementId).to.be.present
    browser.end()
  }
  return f
}
