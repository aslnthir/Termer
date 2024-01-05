const base = process.env.VUE_DEV_SERVER_URL
const { user } = require('../testdata')

module.exports = {
  'can log in': browser => {
    browser
      .url(base)
      .expect.element('#termer-login').to.be.visible.before(2000)
    browser.click('#termer-login')
    browser.userExists(user)
      .setValue('input[type=email]', user.username)
      .setValue('input[type=password]', user.password)
      .click('button')
      .expect.element('#menu').to.be.visible.before(2000)
    browser.end()
  }
}
