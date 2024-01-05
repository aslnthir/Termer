import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import dirtyChai from 'dirty-chai'
import authFactory, { statuses } from '@/store/auth.js'

chai.use(sinonChai)
chai.use(dirtyChai)
const expect = chai.expect

describe('auth', () => {
  it('is a vuex store module', () => {
    const auth = authFactory(sinon.fake())
    expect(auth).to.have.keys([
      'state', 'mutations', 'actions', 'getters', 'namespaced'
    ])
  })
})

describe('auth.actions', () => {
  it('login successfully when server says OK', async () => {
    const login = sinon.fake.resolves({ id: 0 })
    const mockAPI = () => { return { login } }
    const auth = authFactory(mockAPI)
    const commit = sinon.fake()
    const state = {}
    await auth.actions.login({ commit, state })

    // Confirm that mutations have been called
    expect(commit.args).to.deep.equal([
      ['auth_request'],
      ['auth_success']
    ])

    // Confirm that api function has been called
    expect(login).to.have.been.calledOnce()
  })
  it('login error when server says so', async () => {
    const login = sinon.fake.resolves({ error: 'error' })
    const mockAPI = () => { return { login } }
    const auth = authFactory(mockAPI)
    const commit = sinon.fake()
    const state = {}
    await auth.actions.login({ commit, state })

    // Confirm that mutations have been called
    expect(commit.args).to.deep.equal([
      ['auth_request'],
      ['auth_fail']
    ])

    // Confirm that api function has been called
    expect(login).to.have.been.calledOnce()
  })
  it('can logout', async () => {
    const logout = sinon.fake.resolves()
    const mockAPI = () => { return { logout } }
    const data = { foo: 1 }
    const auth = authFactory(mockAPI)
    const commit = sinon.fake()
    await auth.actions.logout({ commit }, data)

    // Confirm that mutations have been called
    expect(commit.args).to.deep.equal([
      ['logout']
    ])

    // Confirm that api function has been called
    expect(logout).to.have.been.calledOnce()
    expect(logout).to.have.been.calledWith(data)
  })
  it('checkLogin success', async () => {
    const getLoggedInUser = sinon.fake.resolves({ id: 0 })
    const mockAPI = () => { return { getLoggedInUser } }
    const auth = authFactory(mockAPI)
    const commit = sinon.fake()
    await auth.actions.checkLogin({ commit })
    // Confirm that mutations have been called
    expect(commit.args).to.deep.equal([
      ['auth_success']
    ])
  })
  it('checkLogin failure', async () => {
    const getLoggedInUser = sinon.fake.resolves({})
    const mockAPI = () => { return { getLoggedInUser } }
    const auth = authFactory(mockAPI)
    const commit = sinon.fake()
    await auth.actions.checkLogin({ commit })
    // Confirm that nothing has been done
    expect(commit.args).to.deep.equal([
      ['auth_fail']
    ])
  })
})

describe('auth.mutations', () => {
  it('auth_request sets status to loading', () => {
    const mockAPI = () => {}
    const auth = authFactory(mockAPI)
    const state = { status: null }
    auth.mutations.auth_request(state)
    expect(state.status).to.equal(statuses.LOADING)
  })
  it('auth_fail sets status to failure', () => {
    const mockAPI = () => {}
    const auth = authFactory(mockAPI)
    const state = { status: null }
    auth.mutations.auth_fail(state)
    expect(state.status).to.equal(statuses.FAIL)
  })
  it('auth_success sets status to success', () => {
    const mockAPI = () => {}
    const auth = authFactory(mockAPI)
    const state = { status: null }
    auth.mutations.auth_success(state)
    expect(state.status).to.equal(statuses.SUCCESS)
  })
  it('logout sets status to fail', () => {
    const mockAPI = () => {}
    const auth = authFactory(mockAPI)
    const state = { status: statuses.SUCCESS }
    auth.mutations.logout(state)
    expect(state.status).to.equal(statuses.FAIL)
  })
})

describe('auth.getters', () => {
  it('has a getter for logged in status', () => {
    const mockAPI = () => {}
    const auth = authFactory(mockAPI)
    let state = { status: statuses.SUCCESS }
    let status = auth.getters.loggedInStatus(state)
    expect(status).to.equal(statuses.SUCCESS)

    const loadingStatuses = [
      statuses.LOADING
    ]

    const notLoggedInStatuses = [
      statuses.FAIL
    ]

    for (const s of loadingStatuses) {
      state = { status: s }
      status = auth.getters.loggedInStatus(state)
      expect(status).to.equal(statuses.LOADING)
    }

    for (const s of notLoggedInStatuses) {
      state = { status: s }
      status = auth.getters.loggedInStatus(state)
      expect(status).to.equal(statuses.FAIL)
    }
  })
})

/*
  it('', () => {
  })
*/
