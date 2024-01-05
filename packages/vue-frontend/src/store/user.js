import { getField, updateField, createHelpers } from 'vuex-map-fields'
import Vue from 'vue'

export default function factory (apifactory) {
  const api = apifactory()
  return store(api)
}

function store (api) {
  return {
    namespaced: true,
    state,
    getters,
    actions: actions(api),
    mutations
  }
}

function state () {
  return {
    data: {
      usersettings: {
        language: '',
        stored_selected_glossaries: {
          tingtunDefault: []
        }
      }
    },
    metadata: {
      fetchStatus: statuses.INITIAL,
      fetchErrors: {},
      pushStatus: statuses.INITIAL,
      pushErrors: {},
      modified: false
    }
  }
}

const getters = {
  name (state) {
    if (state.data.username) {
      return state.data.username
    }
  },
  emailField (state) {
    return getField(state.data.email)
  },
  emailVerified (state) {
    return getField(state.data.email)
  },
  language (state) {
    return state.data.usersettings.language
  },
  settings (state) {
    if (state.data.usersettings) {
      return state.data.usersettings
    }
  },
  userFields (state) {
    return getField(state.data)
  }
}

function actions (api) {
  return {
    async fetchUser () { return fetchUser(api, ...arguments) },
    async pushData () { return pushData(api, ...arguments) },
    removeLanguagePreference ({ commit }) {
      commit('setLanguage', '')
    },
    setLanguage ({ commit }, value) {
      commit('setLanguage', value)
    }
  }
}

const mutations = {
  data (state, value) {
    state.data = value
  },
  settings (state, value) {
    state.data.usersettings = value
    setModified(state, true)
  },
  fetchStatus (state, value) {
    state.metadata.fetchStatus = value
  },
  pushStatus (state, value) {
    state.metadata.pushStatus = value
  },
  notModified (state) {
    setModified(state, false)
  },
  pushError (state, error) {
    state.metadata.pushErrors[Date.now()] = error
  },
  fetchError (state, error) {
    state.metadata.fetchErrors[Date.now()] = error
  },
  setLanguage (state, value) {
    Vue.set(state.data.usersettings, 'language', value)
    setModified(state, true)
  },
  userFields (state, value) {
    updateField(state.data, value)
    setModified(state, true)
  }
}

function setModified (state, value) {
  if (state.metadata.modified !== value) {
    state.metadata.modified = value
  }
}

export const statuses = {
  INITIAL: 'init',
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail'
}

export const { mapFields: mapUserFields } = createHelpers({
  getterType: 'User/userFields',
  mutationType: 'User/userFields'
})

async function fetchUser (api, { commit, state }) {
  try {
    commit('fetchStatus', statuses.LOADING)
    const user = await api.fetchUser()
    if (user.usersettings &&
      typeof user.usersettings.stored_selected_glossaries === 'string') {
      try {
        const parsed = JSON.parse(user.usersettings.stored_selected_glossaries)
        user.usersettings.stored_selected_glossaries = parsed
      } catch (e) {
        if (!e.name === 'SyntaxError') {
          throw e
        }
      }
    }
    user.emailcheck = user.email
    commit('data', user)
    commit('fetchStatus', statuses.SUCCESS)
  } catch (e) {
    commit('fetchError', e.message)
    commit('fetchStatus', statuses.FAIL)
  }
}

async function pushData (api, { commit, state, dispatch }) {
  if (!state.metadata.modified) return
  try {
    commit('pushStatus', statuses.LOADING)
    await api.pushData(state.data)
    commit('pushStatus', statuses.SUCCESS)
    commit('notModified')
  } catch (e) {
    commit('pushError', e.info || e.message)
    commit('pushStatus', statuses.FAIL)
  }
}
