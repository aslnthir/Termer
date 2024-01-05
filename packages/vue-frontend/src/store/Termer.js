import Vue from 'vue'

const state = {
  appDomain: '',

  searchTerm: '',
  sources: {},
  glossaries: {},
  backends: {},
  availableBackends: [],
  searchResults: {},
  definitions: {},
  lexemes: {},
  lexemeDefinitions: {},
  wordlist: {},
  backendSources: {},
  termDomains: {},

  selectedSources: {},
  selectedGlossaryIDs: [],
  selectedFromLanguages: [],
  selectedToLanguages: [],
  supportedLanguages: {},
  glossaryLexemes: {},
  mandatorySourcesOn: [],
  searchDidYouMean: {},

  sourceRank: [],
  glossaryOrderById: [],

  userGlossaryOrderById: [],
  userDeselectedSources: [],
  userSelectedSourceLanguage: [],
  selectedSourceGlossaries: [],
  userSelectedTermDomains: [],

  rightAlignedLanguages: ['ar', 'ur', 'fa', 'ckb', 'prs'],

  vueSettings: {},
  fullSiteConfig: {},

  debug: false
}

const termerUpdateList = []
let timer = null

let termerPromise = null

function termer (commit, state) {
  if (!termerPromise) {
    termerPromise = createTermerPromise(commit, state)
  }
  return termerPromise
}

/*
function backendApikey (domain, backendConfig) {
  if (/^insitu\./.test(domain)) {
    backendConfig.config.apiKeys.push('sourceNotSelected')
  } else if (/^iate\./.test(domain)) {
  } else {
  }
}
*/

async function importTermerCoreModule () {
  let module
  /*
  if (process.env.VUE_APP_TERMER_CORE_URL) {
    let moduleUrl = process.env.VUE_APP_TERMER_CORE_URL
    const domain = window.location.origin
    const newModuleUrl = new URL(moduleUrl)
    console.log('test stuff', moduleUrl, domain, newModuleUrl)
    newModuleUrl.origin = domain
    moduleUrl = newModuleUrl.href

    try {
      // This Function evaluation throws if async import is not supported.
      /* eslint-disable-next-line no-new-func *//*
      module = new Function(`return import('${moduleUrl}')`)()
      return module
    } catch {}
  }
  */

  if (!module) {
    // IE11, Edge: does not support async import().
    // Use webpack’s async chunk instead.
    return import(/* webpackChunkName: "termer-core" */ 'termer-core')
  }
}

async function createTermerPromise (commit, state) {
  const { Termer, defaultBackendDescriptors } = await importTermerCoreModule()
  commit('availableBackends', Object.keys(defaultBackendDescriptors))
  const backendTermer = defaultBackendDescriptors.Termer
  if (process.env.VUE_APP_TERMER_BACKEND) {
    backendTermer.url = process.env.VUE_APP_TERMER_BACKEND + '/glossary2/'
    backendTermer.loginUrl = process.env.VUE_APP_TERMER_BACKEND + '/v/#/login/'
  }

  let termer
  try {
    termer = new Termer([])
    // eslint-disable-next-line
    // console.log('***** creating new termer *****')
    if (window.self === window.top) {
      // backendApikey(window.location.hostname, backendLexin)
      if (termer.modelGetters.selectedFromLanguages().length === 0) {
        if (navigator.languages) {
          // navigator.languages.forEach(language => {
          // termer.selectFromLanguage(language)
          // })
        } else if (navigator.language) {
          // termer.selectFromLanguage(navigator.language)
        }
      }
    }
  } catch (e) {
    termer = new Termer([])
  }
  const getters = Object.getOwnPropertyDescriptors(termer.modelGetters)
  Object.entries(getters).forEach(([key, { get: stream }]) => {
    if (!Object.hasOwnProperty.call(state, key)) return
    else if (key === 'wordlist') return
    else if (key === 'availableBackends') return
    else if (key === 'rightAlignedLanguages') return
    stream().map(value => {
      commit('updateFromTermer', { key, value: objectClone(value) })
    })
  })

  termer.wordlist.map(value => {
    commit('updateFromTermer', { key: 'wordlist', value })
  })

  window.termer = termer
  if (window.top === window.self) {
    termer.setAppDomain(window.location.origin)
    termer.setLocationDomain(window.location.hostname)
  }
  return termer
}

function objectClone (value) {
  return JSON.parse(JSON.stringify(value))
}

const actions = {

  async search ({ commit, state }, term) {
    (await termer(commit, state)).search(term)
    commit('searchTerm', term)
  },

  async checkLogin ({ commit, state }, backendId) {
    return (await termer(commit, state)).checkLogin(backendId)
  },

  async addApiKeys ({ commit, state }, keys) {
    function getTermerBackendId (backends) {
      for (const [id, backend] of Object.entries(backends)) {
        if (backend.type === 'Termer') {
          return id
        }
      }
    }
    const t = await termer(commit, state)
    const backendId = getTermerBackendId(t.backends())
    if (!backendId) return
    keys.forEach(key => t.addApiKey(backendId, key))
  },

  async setLocationDomain ({ commit, state }, domain) {
    const t = await termer(commit, state)
    t.setLocationDomain(domain)
  },

  async deselectUserFromLanguage ({ commit, state }, data) {
    (await termer(commit, state)).deselectUserFromLanguage(data)
    // eslint-disable-next-line
    // console.log('***** deselectUserFromLanguage *****')
  },
  async selectUserFromLanguage ({ commit, state }, data) {
    (await termer(commit, state)).selectUserFromLanguage(data)
    // eslint-disable-next-line
    // console.log('***** selectUserFromLanguage *****')
  },
  async deselectUserToLanguage ({ commit, state }, data) {
    (await termer(commit, state)).deselectUserToLanguage(data, true)
    // eslint-disable-next-line
    // console.log('***** deselectUserToLanguage *****')
  },
  async selectUserToLanguage ({ commit, state }, data) {
    (await termer(commit, state)).selectUserToLanguage(data, true)
    // eslint-disable-next-line
    // console.log('***** selectUserToLanguage *****')
  },
  async deselectFromLanguage ({ commit, state }, data) {
    (await termer(commit, state)).deselectFromLanguage(data)
    // eslint-disable-next-line
    // console.log('***** deselectFromLanguage *****')
  },
  async selectFromLanguage ({ commit, state }, data) {
    (await termer(commit, state)).selectFromLanguage(data)
    // eslint-disable-next-line
    // console.log('***** selectFromLanguage *****')
  },
  async deselectToLanguage ({ commit, state }, data) {
    (await termer(commit, state)).deselectToLanguage(data, true)
    // eslint-disable-next-line
    // console.log('***** deselectToLanguage *****')
  },
  async selectToLanguage ({ commit, state }, data) {
    (await termer(commit, state)).selectToLanguage(data, true)
    // eslint-disable-next-line
    // console.log('***** selectToLanguage *****')
  },
  async deselectSource ({ commit, state }, data) {
    (await termer(commit, state)).deselectSource(data)
  },
  async userDeselectSource ({ commit, state }, data) {
    (await termer(commit, state)).userDeselectSource(data)
  },
  async selectConfigSource ({ commit, state }, data) {
    (await termer(commit, state)).selectConfigSource(data)
  },
  async userSelectSource ({ commit, state }, data) {
    (await termer(commit, state)).userSelectSource(data)
  },
  async selectUserSelectedSourceLanguage ({ commit, state }, value) {
    (await termer(commit, state)).selectUserSelectedSourceLanguage(value)
    // eslint-disable-next-line
    // console.log('***** selectUserSelectedSourceLanguage *****')
  },
  async deselectUserSelectedSourceLanguage ({ commit, state }, value) {
    (await termer(commit, state)).deselectUserSelectedSourceLanguage(value)
    // eslint-disable-next-line
    // console.log('***** deselectUserSelectedSourceLanguage *****')
  },
  async addUserSelectedSourceGlossary ({ commit, state }, value) {
    (await termer(commit, state)).addUserSelectedSourceGlossary(value)
  },
  async removeUserSelectedSourceGlossary ({ commit, state }, value) {
    (await termer(commit, state)).removeUserSelectedSourceGlossary(value)
  },
  async addUserDeselectedSourceGlossary ({ commit, state }, value) {
    (await termer(commit, state)).addUserDeselectedSourceGlossary(value)
  },
  async removeUserDeselectedSourceGlossary ({ commit, state }, value) {
    (await termer(commit, state)).removeUserDeselectedSourceGlossary(value)
  },
  async initializeTermerCore ({ commit, state }) {
    termer(commit, state)
  },
  async fetchDefintionList ({ commit, state }, glossary) {
    (await termer(commit, state)).fetchGlossaryDefinitions(glossary)
  },
  async addBackend ({ commit, state }, backend) {
    (await termer(commit, state)).addBackend(backend)
  },
  async setSourceRank ({ commit, state }, value) {
    (await termer(commit, state)).setSourceRank(value)
  },
  async setUserGlossaryOrderById ({ commit, state }, ids) {
    (await termer(commit, state)).setUserGlossaryOrderById(ids)
  },
  async addSearchDidYouMean ({ commit, state }, searchTerm, data) {
    (await termer(commit, state)).addSearchDidYouMean(searchTerm, data)
  },
  async createSource ({ commit, state }, data) {
    (await termer(commit, state)).createSource(data.source, data.backend)
  },
  async createTerm ({ commit, state }, data) {
    (await termer(commit, state)).createTerm(data.term, data.backend)
  },
  async updateDefinition ({ commit, state }, data) {
    (await termer(commit, state)).updateDefinition(data.definition, data.backend)
  },
  async updateSource ({ commit, state }, data) {
    (await termer(commit, state)).updateSource(data.source, data.backend)
  },
  async updateGlossary ({ commit, state }, data) {
    (await termer(commit, state)).updateGlossary(data.glossary, data.backend)
  },
  async updateUserSelectedTermDomains ({ commit, state }, data) {
    (await termer(commit, state)).setUserSelectedTermDomains(data)
  },
  async login ({ commit, state }, data) {
    (await termer(commit, state)).login('Termer', data.username, data.password)
  },
  async logout ({ commit, state }, data) {
    (await termer(commit, state)).logout('Termer')
  },
  async saveUserDefault ({ commit, state }) {
    (await termer(commit, state)).saveUserDefault()
  },
  async updateUserFromLanguage ({ commit, state }, language) {
    // eslint-disable-next-line
    // console.log('***** updateUserFromLanguage *****')
    // let langs = [...state.selectedFromLanguages]
    if (language.add) {
      (await termer(commit, state)).selectUserFromLanguage(language.lang)
      // langs = langs.filter(x => x !== language.lang)
    } else {
      // langs.push(language.lang)
      (await termer(commit, state)).deselectUserFromLanguage(language.lang)
    }
  },
  async updateUserToLanguage ({ commit, state }, language) {
    // eslint-disable-next-line
    // console.log('***** updateUserToLanguage *****')
    // et langs = [...state.selectedToLanguages]
    if (language.add) {
      (await termer(commit, state)).selectUserToLanguage(language.lang)
      // langs = langs.filter(x => x !== language.lang)
    } else {
      // langs.push(language.lang)
      (await termer(commit, state)).deselectUserToLanguage(language.lang)
    }
  },
  updateTermerCoreModel ({ dispatch }, data) {
    // eslint-disable-next-line
    // console.log('update', data)
    // remove when testing is done
    // eslint-disable-next-line
    //console.log('***** updating termer core model *****')
    termerUpdateList.push(data)
    // clear timeout if already applied
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    // set new timeout
    timer = setTimeout(function () {
      // call wait-function and clear timeout
      dispatch('sendUpdatesToTermer')
      clearTimeout(timer)
      timer = null
    }, 400)
  },
  sendUpdatesToTermer ({ dispatch }) {
    const copyUpdateList = [...termerUpdateList]
    // resetUpdatelist
    termerUpdateList.length = 0
    for (const update of copyUpdateList) {
      const newType = update.type.replace('Termer/', '')
      dispatch(newType, update.value)
    }
  }
  // loginTermer

  // updateEntry({commit}, entryId, text) {
  //   termer.updateEntry(entryId, text)
  //   commit('updateEntry', entryId, text)
  // }
}

const mutations = {
  searchTerm (store, value) {
    store.searchTerm = value
  },
  availableBackends (store, value) {
    store.availableBackends = value
  },
  updateFromTermer (store, { key, value }) {
    Vue.set(store, key, value)
  }
  // updateEntry (store, entryId, text) {
  //   store.entries[entryId].definition = text
  // }
}

/*
const getters = {
  searchTerm (state) {
    return state.searchTerm
  },
  sources (state) {
    return state.sources
  },
  entries (state) {
    return state.entries
  },
  searchResults2 (state) {
    return state.searchResults
  },
  searchResults (state) {
    if (!state.searchResults[state.searchTerm]) return {}
    const searchResults = state.searchResults[state.searchTerm]

    if (!searchResults) return {}
    const filteredResults = Object.entries(searchResults)
      .filter(([sourceId, obj]) =>
        obj.type && (
          obj.type === 'loading' || (
            obj.type === 'success' && obj.data.length > 0)))
    return filteredResults
  }
}
*/

export default {
  namespaced: true,
  state,
  actions,
  mutations
//   getters
}
