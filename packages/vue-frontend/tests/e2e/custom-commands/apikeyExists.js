
module.exports.command = function apikeyExists (apikey, callback) {
  var self = this
  this.waitForElementVisible('#app', 5000)
  this.executeAsync(
    function (apikey, done) {
      function t () {
        // This is a workaround for IE11 hanging on Promise.resolve.
        // See https://github.com/axios/axios/issues/1862#issuecomment-457177602
        window.setTimeout(t, 100)
      }
      t()
      const params = { api: apikey }
      window.$vue.$store.getters.GlossaryAPI.getSourceList(params)
        .then(function (response) {
          const apiSources = response.results.filter((source) => {
            return source.in_apikey
          }).map(({ id }) => id)
          if (apiSources.length > 0) {
            done('Got sources from apikey: ' + apikey)
          }
          done('Did not get any sources')
        })
        .catch(function (response) {
          done('Error: An Error occurred when fetching apikey sources.')
        })
    },
    [apikey],
    function (result) {
      if (typeof callback === 'function') {
        callback.call(self, result)
      }
    }
  )
  return this
}
