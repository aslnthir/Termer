import { getSiteName } from 'site-configurations'

const watchers = [
  // When the preferred application language is changed, apply the
  // change to the appliation.
  {
    expression: function (state, getters) {
      return getters['Language/getLanguage']
    },
    callback: async (store, newValue, oldValue) => {
      if (!newValue) return
      await store.dispatch('i18n/setLocale', { locale: newValue })
    },
    options: null
  }
]

// route change -> update ‘site’
watchers.push({
  expression: function (state, getters) {
    return state.route
  },
  callback: async (store, newValue, oldValue) => {
    // Using window.location directly instead of newValue, just for
    // simplicitys’s sake.
    const site = getSiteName(window.location.href)
    // look for site name in a) domain part of url, b) the site= url
    // parameter.
    if (site) {
      await store.dispatch('setSite', site)
    }
  },
  options: {
    immediate: true
  }
})

watchers.push({
  expression: function (state, getters) {
    return getters.site
  },
  callback: async (store, newValue, oldValue) => {
    if (!newValue) return
    const site = newValue
    let siteConf
    try {
      siteConf = (await import(`@/sites/${site}.js`)).default
    } catch (e) {
      if (window.location.href.substring('localhost')) {
        console.error(e)
      }
    }
    if (siteConf) {
      const language = store.getters['Language/getLanguage']
      const searchPrompt = siteConf.searchPrompt[language] || siteConf.searchPrompt.en
      if (searchPrompt) {
        store.dispatch('setSearchPrompt', searchPrompt)
      }
    }
  },
  options: {
    immediate: true
  }
})

export default {
  watch (store) {
    function cb (store, callback) {
      return (newValue, oldValue) => callback(store, newValue, oldValue)
    }
    for (var { expression, callback, options } of watchers) {
      store.watch(expression, cb(store, callback), options)
    }
  }
}
