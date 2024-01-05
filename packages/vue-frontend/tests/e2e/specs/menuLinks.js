const base = process.env.VUE_DEV_SERVER_URL
const { user } = require('../testdata')

module.exports.before = function (browser) {
  browser
    .url(base)
    .userExists(user)
}

// tests for logged in menu
const dropDownLinks = [
  {
    name: '/ - contact',
    linkId: '#menu-contact-link',
    expected: { pageUrl: 'http://tingtun.no/contact' }
  },
  {
    name: '/ - install addon',
    linkId: '#menu-addon-link',
    expected: { elementId: '#install-addon-view' }
  },
  {
    name: '/ - manage glossaries',
    linkId: '#menu-manage-link',
    expected: { elementId: '#manage-glossaries-view' }
  },
  {
    name: '/ - settings',
    linkId: '#menu-settings-link',
    expected: { elementId: '#user-config-view' }
  },
  {
    name: '/ - log out',
    linkId: '#menu-logout-link',
    expected: { elementId: '#logout-view' }
  },
  {
    name: '/ - about',
    linkId: '#menu-about-link',
    expected: { elementId: '#about-view' }
  },
  {
    name: '/ - help',
    linkId: '#menu-help-link',
    expected: { elementId: '#help-view' }
  },
  {
    name: '/ - privacy',
    linkId: '#menu-privacy-link',
    expected: { elementId: '#privacy-statement-view' }
  }
]

for (const { name, linkId, expected } of dropDownLinks) {
  module.exports[name] = dropDownLinkTest(linkId, expected)
}

function dropDownLinkTest (linkId, expected) {
  function f (browser) {
    browser
      .url(base)
      .login(user)
      .expect.element('#termerMenuButton').to.be.present.before(2000)
    browser.click('#termerMenuButton')
      .expect.element(linkId).to.be.present.before(2000)

    // Edge has issues with browser.click(linkId). Seems like it does not think
    // that the link is visible, and therefore will not click it.
    browser.click(linkId, result => {
      if (result.status === -1) {
        console.warn('click() failed, trying fallback click() method instead.')
        browser.execute(`document.querySelector("${linkId}").click()`)
      }
    })

    if (expected.elementId) {
      browser.expect.element(expected.elementId).to.be.visible.before(2000)
    } else if (expected.pageUrl) {
      browser.expect.element('#termerMenuButton').to.not.be.present.before(2000)
      browser.expect.element('html').to.be.visible.before(2000)
      browser.assert.urlEquals(expected.pageUrl)
    }
    browser.end()
  }
  return f
}

// Test for logged out menu
const dropDownLinksLoggedout = [
  {
    name: '/ - login',
    linkId: '#menu-login-link',
    expected: { elementId: '#termer-login' }
  }
]

for (const { name, linkId, expected } of dropDownLinksLoggedout) {
  module.exports[name] = dropDownLinkTestLoggedout(linkId, expected)
}

function dropDownLinkTestLoggedout (linkId, expected) {
  function f (browser) {
    browser
      .url(base + 'v/#/search/')
      .expect.element('#termerMenuButton').to.be.present.before(2000)
    browser.click('#termerMenuButton')
      .expect.element(linkId).to.be.present.before(20000)

    // Edge has issues with browser.click(linkId). Seems like it does not think
    // that the link is visible, and therefore will not click it.
    browser.click(linkId, result => {
      if (result.status === -1) {
        console.warn('click() failed, trying fallback click() method instead.')
        browser.execute(`document.querySelector("${linkId}").click()`)
      }
    })

    if (expected.elementId) {
      browser.expect.element(expected.elementId).to.be.visible.before(2000)
    } else if (expected.pageUrl) {
      browser.expect.element('#termerMenuButton').to.not.be.present.before(2000)
      browser.expect.element('html').to.be.visible.before(2000)
      browser.assert.urlEquals(expected.pageUrl)
    }
    browser.end()
  }
  return f
}
