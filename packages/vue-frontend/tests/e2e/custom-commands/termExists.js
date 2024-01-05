// Ensure that user exists.

let hasCreatedTerm = false

module.exports.command = function termExists (term, callback) {
  if (hasCreatedTerm) return this
  var self = this
  this.waitForElementVisible('#app', 5000)
  this.executeAsync(
    function (term, done) {
      function t () {
        // This is a workaround for IE11 hanging on Promise.resolve.
        // See https://github.com/axios/axios/issues/1862#issuecomment-457177602
        window.setTimeout(t, 100)
      }
      t()
      window.$vue.$store.getters.GlossaryAPI.getSourceList()
        .then(function (response) {
          if (response.hasOwnProperty('results') && response.results.length > 0) {
            var sourceId = response.results.filter(function (x) {
              return x.permissions.write
            })[0].id
            term.source = sourceId
            term.lexemes[0].source = sourceId
            window.$vue.$store.getters.GlossaryAPI.createTerm(term)
              .then(function (responseTerm) {
                hasCreatedTerm = true
                done(sourceId)
              })
              .catch(function (error) {
                if (error.info && error.info.hasOwnProperty('non_field_errors') &&
                  error.info.non_field_errors[0] === 'This entry already exists.') {
                  hasCreatedTerm = true
                  done(sourceId)
                } else {
                  console.log('Uhandled error: ', error)
                  done(null)
                }
              })
          } else {
            done(null)
          }
        })
        .catch(function (response) {
          done(null)
        })
    },
    [term],
    function (result) {
      if (typeof callback === 'function') {
        callback.call(self, result)
      }
    }
  )
  return this
}
