// Ensure that user exists.

let hasCreatedUser = false

module.exports.command = function userExists (user, callback) {
  if (hasCreatedUser) {
    return this
  }
  var self = this
  this.waitForElementVisible('#app', 5000)
  this.executeAsync(
    function (user, done) {
      user.password1 = user.password2 = user.password
      user.email = user.username
      user.accesscode = 'testuser_accesscode'
      user.privacyAccept = true
      window.$vue.$store.getters.GlossaryAPI.createUser(user)
        .then(function (response) {
          if (response.hasOwnProperty('key')) {
            window.$vue.$store.getters.GlossaryAPI.testuserAccess()
              .then(function (responseTestuser) {
                if (responseTestuser.testuser) {
                  hasCreatedUser = true
                  done(true)
                } else {
                  done(false)
                }
              })
              .catch(function (responseTestuser) {
                done(false)
              })
          } else {
            done(false)
          }
        })
        .catch(function (error) {
          // Actually OK, if the next test is true.
          if (error && error.info && error.info.email[0] ===
             'A user is already registered with this e-mail address.') {
            window.$vue.$store.getters.GlossaryAPI.testuserAccess()
              .then(function (responseTestuser) {
                if (responseTestuser.testuser) {
                  hasCreatedUser = true
                  done(true)
                } else {
                  done(false)
                }
              })
              .catch(function (responseTestuser) {
                done(false)
              })
          } else {
            done(false)
          }
        })
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
