/*
 * Vertraulich
 */

import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line import/no-webpack-loader-syntax
import { URL } from 'imports-loader?self=>{}!exports-loader?self!js-polyfills/url.js'
import watchers from '@/store/watchers'
import Language from '@/store/language'
import Termer from '@/store/Termer'

Vue.use(Vuex)

const Conf = {
  namespaced: true,
  state: {
    backend: {},
    appStyle: '',
    fontFamily: '',
    fontSize: '',
    referrer: '',
    urlSources: [],
    ready: false,
    active: false,
    domains: null,
    notMarkPopup: false,
    sourceType: 'glossary'
  },
  getters: {
    backend (state, getters, rootState) {
      const backend = state.backend || {}
      return backend
    },

    fontSize (state, getters, rootState) {
      const fontSize = state.fontSize || null
      return fontSize
    },

    fontFamily (state, getters, rootState) {
      const fontFamily = state.fontFamily || null
      return fontFamily
    },

    domains (state, getters, rootState) {
      const domains = state.domains || null
      return domains
    },

    notMarkPopup (state, getters, rootState) {
      const notMarkPopup = state.notMarkPopup || false
      return notMarkPopup
    },

    referrer (state, getters, rootState) {
      const referrer = state.referrer || ''
      return referrer
    },
    urlSources (state, getters, rootState) {
      return state.urlSources
    },

    sourceType (state, getters, rootState) {
      const sourceType = state.sourceType || 'glossary'
      return sourceType
    },

    active (state, getters, rootState) {
      return state.active
    }
  },
  mutations: {
    domains (state, value) {
      state.domains = value
    },
    updateRoute (state, route) {
      const url = new URL(window.location)
      const referrer = getQueryParam('ref', url)
      if (referrer.length) {
        state.referrer = referrer[0]
      }

      const fontSize = getQueryParam('fontSize', url)
      if (fontSize.length) {
        state.fontSize = fontSize[0]
      }

      const fontFamily = getQueryParam('fontFamily', url)
      if (fontFamily.length) {
        state.fontFamily = fontFamily[0]
      }
      const urlSources = getQueryParam('sources', url)
      if (urlSources.length) {
        state.urlSources = urlSources[0]
      }

      const cfg = getQueryParam('cfg', url)
      if (cfg.length) {
        const conf = JSON.parse(cfg[0])

        const backend = conf.backend
        if (backend) {
          state.backend = backend
        }

        const appStyle = conf.appStyle
        if (appStyle) {
          state.appStyle = appStyle
        }

        const domains = conf.domains
        if (domains && !state.domains) {
          state.domains = domains
        }

        const notMarkPopup = conf.notMarkPopup
        if (notMarkPopup != null) {
          state.notMarkPopup = notMarkPopup
        }

        const sourceType = conf.sourceType
        if (sourceType) {
          state.sourceType = sourceType
        }
      }

      state.ready = true
    },

    setActive (state, value) {
      state.active = value
    },
    setDomains (state, value) {
      state.domains = value
    }
  },
  actions: {
    updateRoute ({ commit, rootState }, route) {
      route = route || rootState.route
      commit('updateRoute', route)
    },
    deactivate ({ commit }, inhibitPostMessage) {
      if (!inhibitPostMessage) {
        const message = 'turnOff'
        parent.postMessage({ msg: message }, '*')
      }
      commit('setActive', false)
    },
    activate ({ commit }, inhibitPostMessage) {
      if (!inhibitPostMessage) {
        const message = 'turnOn'
        parent.postMessage({ msg: message }, '*')
      }
      commit('setActive', true)
    },
    updateDomains ({ commit, state, dispatch }, value) {
      if (value && state.domains !== value) {
        commit('setDomains', value)
        // state.domains = value
      }
    },
    resetDomain ({ commit, state, dispatch }) {
      commit('setDomains', null)
    },
    reloadMarkup ({ commit, state, rootState }, inhibitPostMessage) {
      if (!inhibitPostMessage) {
        const message = 'reloadMarkup'
        parent.postMessage({ msg: message, domains: state.domains, value: true }, '*')
      }
    }
  }
}

const store = new Vuex.Store({
  state: {
    site: 'default',
    searchPrompt: '',
    serviceWorkerNeedsUpdate: false,
    removedSources: [],
    searchInProgress: false,
    searchResult: {},
    sources: {},
    sourcesFilterd: [],
    hasPerformedSearch: false,
    definitions: {},
    lexemes: {},
    terms: {},
    images: {},
    supportedLanguages: {},
    selectedConceptLanguages: [],
    selectedDescriptionLanguages: [],
    hasFetechedSelected: false,
    theme: 'default'
  },
  modules: {
    Conf
  },
  mutations: {
    updateTheme (state, value) {
      state.theme = value
    },
    setSite (state, site) {
      state.site = site
    },
    setSearchPrompt (state, searchPrompt) {
      state.searchPrompt = searchPrompt
    },
    serviceWorkerUpdated (state) {
      state.serviceWorkerNeedsUpdate = true
    },
    startNewSearch (state) {
      state.searchResult = {}
      state.searchInProgress = true
    },
    noSearchResult (state, sourceIds) {
      state.searchInProgress = false
      for (const sourceId of sourceIds) {
        Vue.set(state.searchResult, sourceId, [])
      }
    },
    addEmptyResult (state, sourceId) {
      Vue.set(state.searchResult, sourceId, [])
    },

    finishSearch (state) {
      state.searchInProgress = false
      state.hasPerformedSearch = true
    },
    hasFetechedSelected (state, value) {
      state.hasFetechedSelected = value
    },
    sourceDescription (state, { sourceId, description }) {
      Vue.set(state.sources, sourceId, description)
    },
    updateDefinition (state, definition) {
      Vue.set(state.definitions, definition.id, definition)
    },
    setSupportedLanguages (state, newValue) {
      state.supportedLanguages = newValue
    },
    updateDescriptionLanguages (state, languages) {
      if (languages) {
        state.selectedDescriptionLanguages = languages
      }
    },
    updateConceptLanguages (state, languages) {
      if (languages) {
        state.selectedConceptLanguages = languages
      }
    }
  },
  actions: {
    updateTheme ({ commit, rootState }, theme) {
      commit('updateTheme', theme)
    },
    setSite ({ commit }, site) {
      commit('setSite', site)
    },
    setSearchPrompt ({ commit }, searchPrompt) {
      commit('setSearchPrompt', searchPrompt)
    },
    serviceWorkerUpdated ({ commit }) {
      commit('serviceWorkerUpdated')
    },
    updateDefinition ({ commit }, params) {
      commit('updateDefinition', params)
    },
    addDefinition ({ commit }, params) {
      commit('addSearchResult', params)
    },
    updateSource ({ commit }, source) {
      commit('sourceDescription', { sourceId: source.id, description: source })
    },
    deleteSource ({ commit }, source) {
      // stub used in manageGarbageGlossaries.vue
    },
    initialize ({ commit, dispatch }) {
      commit('hasFetechedSelected', false)
      dispatch('Conf/updateRoute')
      dispatch('Termer/initializeTermerCore')
    }
  },
  getters: {
    site ({ site }) {
      return site
    },
    serviceWorkerNeedsUpdate ({ serviceWorkerNeedsUpdate }) {
      return serviceWorkerNeedsUpdate
    },
    domains (state, getters) {
      return getters['Conf/domains']
    },
    notMarkPopup (state, getters) {
      return getters['Conf/notMarkPopup']
    },
    sources (state) {
      return state.sources
    }
  },
  plugins: [watchers.watch],
  // strict mode: on in dev, off in production
  strict: process.env.NODE_ENV !== 'production'
})

store.registerModule('Language', Language(store))
store.registerModule('Termer', Termer)

export default store

function getQueryParam (paramName, url) {
  let params = url.searchParams
  if (!params) {
    url = new URL(url)
    params = url.searchParams
  }
  return params.getAll(paramName)
}

/*
function outsideEventHandler (evt) {
  const relevantSource = (
  evt.source !== window ||
    (evt.data && evt.data.source === 'termer-content-script')
  )
  if (relevantSource && evt.data && evt.data.msg) {
    if (evt.data.msg === 'markupProgress') {
      store.commit('markupInProgress', evt.data.value)
    }
  }
}

window.addEventListener('message', outsideEventHandler)
*/
