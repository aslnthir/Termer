// Custom `login` command for logging in directly without using the login form.

module.exports.command = function login (user, callback) {
  var self = this
  this.waitForElementVisible('#app', 5000)
  this.executeAsync(
    function (user, done) {
      window.$vue.$store.dispatch('Auth/login', user)
        .then(function () { done(true) })
        .catch(function () { done(false) })
    },
    [user],
    function (result) {
      if (typeof callback === 'function') {
        callback.call(self, result)
      }
    }
  )
  return this
}
