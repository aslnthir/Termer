export const statuses = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail'
}

export default function factory (apifactory) {
  const api = apifactory()
  return store(api)
}

function store (api) {
  return {
    namespaced: true,
    actions: {
      async login ({ commit }, user) {
        return tryLogin(api, commit, user)
      },
      async logout ({ commit }, data) {
        return tryLogout(api, commit, data)
      },
      async checkLogin ({ commit }) {
        return checkLogin(api, commit)
      },
      async changePassword ({ commit }, data) {
        return api.changePassword(data)
      }
    },
    state: {
      status: statuses.LOADING
    },
    mutations: {
      // setting state.statues something other then FAIL or SUCCESS will
      // trigger the loadingpage.
      auth_request (state) {
        state.status = statuses.LOADING
      },
      auth_fail (state) {
        state.status = statuses.FAIL
      },
      auth_success (state) {
        state.status = statuses.SUCCESS
      },
      logout (state) {
        state.status = statuses.FAIL
      }
    },
    getters: {
      loggedInStatus (state) {
        if (state.status === statuses.SUCCESS) {
          return statuses.SUCCESS
        } else if (state.status === statuses.FAIL) {
          return statuses.FAIL
        } else {
          return statuses.LOADING
        }
        // return state.status === statuses.SUCCESS
      }
    }
  }
}

async function tryLogin (api, commit, user) {
  commit('auth_request')
  try {
    const response = await api.login(user)
    if (response && response.hasOwnProperty('id')) {
      // credentials not handled here because they are stored in cookie
      commit('auth_success')
    } else {
      commit('auth_fail')
    }
    return response
  } catch (error) {
    commit('auth_fail')
    throw error
  }
}

async function tryLogout (api, commit, data) {
  await api.logout(data)
  commit('logout')
}

async function checkLogin (api, commit) {
  const response = await api.getLoggedInUser()
  if (response && response.hasOwnProperty('id')) {
    commit('auth_success')
    return true
  } else {
    commit('auth_fail')
    return false
  }
}
