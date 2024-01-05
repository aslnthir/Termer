import Vue from 'vue'

const defaultLanguage = 'en'

export default function (store) {
  addLanguageChangeListener(store)
  return Language
}

const Language = {
  namespaced: true,
  state: {
    navigatorLanguages: getNavigatorLanguages()
  },
  mutations: {
    navigatorLanguages (state, value) {
      Vue.set(state, 'navigatorLanguages', value)
    }
  },
  getters: {
    getLanguage (state, getters, rootState, rootGetters) {
      const languages = state.navigatorLanguages.slice()
      const userPreferredLanguage = rootGetters['User/language']
      if (userPreferredLanguage) {
        // unshift = prepend to start of list
        languages.unshift(userPreferredLanguage)
      }
      const siteSetLanguage = localStorage.getItem('siteUiLanguage')
      if (siteSetLanguage) {
        // unshift = prepend to start of list
        languages.unshift(siteSetLanguage)
      }
      // push = append to end of list
      languages.push(defaultLanguage)
      for (const locale of languages) {
        // Short circuit this for loop: return as soon as we find a suitable
        // match in the list.
        if ((Vue.i18n && Vue.i18n.localeExists(locale)) || locale === 'en') {
          return locale
        }
      }
    }
  }
}

let languageChangeListenerAdded = false
function addLanguageChangeListener (store) {
  if (languageChangeListenerAdded) return
  languageChangeListenerAdded = true
  window.addEventListener('languagechange', () => {
    const languages = getNavigatorLanguages()
    store.commit('Language/navigatorLanguages', languages)
  })
}

function getNavigatorLanguages () {
  return getNavigatorIETFLanguageTags()
    .map(ietfLanguageTag2Language)
}

function getNavigatorIETFLanguageTags () {
  let languages = []
  if (!navigator) return languages
  if (navigator.languages && navigator.languages.length) {
    languages = navigator.languages
  } else if (navigator.language) {
    languages = [navigator.language]
  } else if (navigator.userLanguage) {
    languages = [navigator.userLanguage]
  }
  return languages
}

// Takes an IETF language tag such as en, en_US or nb-no;
// Returns just the language, such as en, en or nb.
function ietfLanguageTag2Language (ietfTag) {
  return ietfTag.split('-')[0].split('_')[0]
}
