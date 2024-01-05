/* eslint-env mocha */
import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import dirtyChai from 'dirty-chai'
import userModuleFactory, { statuses } from '@/store/user'

chai.use(sinonChai)
chai.use(dirtyChai)
const expect = chai.expect

describe('user module factory', () => {
  it('takes an API module constructor', () => {
    const fakeAPI = sinon.fake()
    userModuleFactory(fakeAPI)
    expect(fakeAPI).to.have.been.calledOnce()
  })
})

describe('user module', () => {
  const userModule = userModuleFactory(sinon.fake())

  it('must be namespaced', () => {
    expect(userModule.namespaced).to.be.true()
  })

  it('is a vuex store module', () => {
    // const userModule = userModule()
    expect(userModule).to.have.keys([
      'state', 'mutations', 'actions', 'getters', 'namespaced'
    ])
  })
})

describe('user module.actions', () => {
  describe('fetches user data', async () => {
    const user = {
      username: 'user1',
      id: '1',
      email: 'user1@example.com',
      usersettings: {}
    }

    it('handles error on failed fetch', async () => {
      const errorMessage = 'error message'
      const fetchUser = sinon.fake.rejects(errorMessage)
      const fakeAPI = () => { return { fetchUser } }
      const userModule = userModuleFactory(fakeAPI)
      const state = {}
      const commit = sinon.fake()
      await userModule.actions.fetchUser({ commit, state })
      expect(fetchUser).to.have.been.calledOnce()
      expect(commit.args).to.deep.equal([
        ['fetchStatus', statuses.LOADING],
        ['fetchError', errorMessage],
        ['fetchStatus', statuses.FAIL]
      ])
    })

    it('saves data on successful fetch', async () => {
      const fetchUser = sinon.fake.resolves(user)
      const fakeAPI = () => { return { fetchUser } }
      const userModule = userModuleFactory(fakeAPI)

      const state = {}
      const commit = sinon.fake()
      await userModule.actions.fetchUser({ commit, state })
      expect(fetchUser).to.have.been.calledOnce()
      expect(commit.args).to.deep.equal([
        ['fetchStatus', statuses.LOADING],
        ['data', user],
        ['fetchStatus', statuses.SUCCESS]
      ])
    })
  })

  describe('pushes user data', () => {
    it('pushes user data', async () => {
      const pushData = sinon.fake.resolves()
      const fakeAPI = () => { return { pushData } }
      const userModule = userModuleFactory(fakeAPI)
      const usersettings = { foo: 1 }
      const user = { id: 1, usersettings }
      const state = { data: user, metadata: { modified: true } }
      const commit = sinon.fake()
      await userModule.actions.pushData({ commit, state })
      console.log(pushData.args)
      expect(pushData).to.have.been.called()
      expect(pushData).to.have.been.calledOnceWith(state.data)
      expect(commit.args).to.deep.equal([
        ['pushStatus', statuses.LOADING],
        ['pushStatus', statuses.SUCCESS],
        ['notModified']
      ])
    })

    it('logs an error', async () => {
      const errorMessage = 'error message'
      const pushData = sinon.fake.rejects(errorMessage)
      const fakeAPI = () => { return { pushData } }
      const userModule = userModuleFactory(fakeAPI)
      const usersettings = { foo: 1 }
      const user = { id: 1, usersettings }
      const state = { data: user, metadata: { modified: true } }
      const commit = sinon.fake()
      await userModule.actions.pushData({ commit, state })
      expect(pushData).to.have.been.calledOnceWith(state.data)
      expect(commit.args).to.deep.equal([
        ['pushStatus', statuses.LOADING],
        ['pushError', errorMessage],
        ['pushStatus', statuses.FAIL]
      ])
    })

    it('does not push settings without modifications', async () => {
      const pushData = sinon.fake.resolves()
      const fakeAPI = () => { return { pushData } }
      const userModule = userModuleFactory(fakeAPI)
      const state = { metadata: { modified: false } }
      const commit = sinon.fake()
      await userModule.actions.pushData({ commit, state })
      expect(pushData).to.not.have.been.called()
      expect(commit).to.not.have.been.called()
    })

    it('sets language preference', async () => {
      const fakeAPI = () => { return {} }
      const userModule = userModuleFactory(fakeAPI)
      const state = { data: { language: '' }, metadata: { modified: false } }
      const commit = sinon.fake()
      await userModule.actions.setLanguage({ commit, state }, 'en')
      expect(commit.args).to.deep.equal([
        ['setLanguage', 'en']
      ])
    })

    it('clears language preference', async () => {
      const fakeAPI = () => { return {} }
      const userModule = userModuleFactory(fakeAPI)
      const state = { data: { language: '' }, metadata: { modified: false } }
      const commit = sinon.fake()
      await userModule.actions.removeLanguagePreference({ commit, state }, 'en')
      expect(commit.args).to.deep.equal([
        ['setLanguage', '']
      ])
    })
  })
})

describe('user module.mutations', () => {
  it('not modified', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const state = { metadata: { modified: true } }
    userModule.mutations.notModified(state)
    expect(state.metadata.modified).to.be.false()
  })

  it('saves user data', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const state = { data: null }
    const newData = { foo: 1 }
    userModule.mutations.data(state, newData)
    expect(state.data).to.deep.equal(newData)
  })

  it('updates push status', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const state = { metadata: { pushStatus: statuses.INITIAL } }
    for (const fetchStatus of Object.values(statuses)) {
      userModule.mutations.pushStatus(state, fetchStatus)
      expect(state.metadata.pushStatus).to.deep.equal(fetchStatus)
    }
  })

  it('updates fetch status', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const state = { metadata: { fetchStatus: statuses.INITIAL } }
    for (const fetchStatus of Object.values(statuses)) {
      userModule.mutations.fetchStatus(state, fetchStatus)
      expect(state.metadata.fetchStatus).to.deep.equal(fetchStatus)
    }
  })

  it('logs fetch errors', () => {
    const userModule = userModuleFactory(sinon.fake())
    const state = { metadata: { fetchErrors: {} } }
    const errorMessage = 'error message'
    userModule.mutations.fetchError(state, errorMessage)
    expect(Object.keys(state.metadata.fetchErrors).length).to.equal(1)
    expect(Object.values(state.metadata.fetchErrors)[0]).to.equal(errorMessage)
  })

  it('logs push errors', () => {
    const userModule = userModuleFactory(sinon.fake())
    const state = { metadata: { pushErrors: {} } }
    const errorMessage = 'error message'
    userModule.mutations.pushError(state, errorMessage)
    expect(Object.keys(state.metadata.pushErrors).length).to.equal(1)
    expect(Object.values(state.metadata.pushErrors)[0]).to.equal(errorMessage)
  })

  it('updates user settings', async () => {
    const userModule = userModuleFactory(sinon.fake())
    const usersettings = { foo: 1 }
    const state = { data: { usersettings }, metadata: { modified: false } }
    const newSettings = { foo: 2 }
    await userModule.mutations.settings(state, newSettings)
    expect(state.data.usersettings).to.deep.equal(newSettings)
    expect(state.metadata.modified).to.be.true()
  })

  it('sets language preference', async () => {
    const userModule = userModuleFactory(sinon.fake())
    const usersettings = { language: 'en' }
    const state = { data: { usersettings }, metadata: { modified: false } }
    await userModule.mutations.setLanguage(state, 'de')
    expect(state.data.usersettings.language).to.equal('de')
  })

  it('updates user settings (fields)', async () => {
    const userModule = userModuleFactory(sinon.fake())
    const usersettings = { foo: 1 }
    const state = { data: { usersettings }, metadata: { modified: false } }
    const newSettings = { path: 'usersettings.foo', value: 2 }
    await userModule.mutations.userFields(state, newSettings)
    expect(state.data.usersettings).to.deep.equal({ foo: 2 })
    expect(state.metadata.modified).to.be.true()
  })
})

describe('user module.getters', () => {
  it('name', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const data = { username: 'user1' }
    const state = { data }
    const name = userModule.getters.name(state)
    expect(name).to.deep.equal(data.username)
  })

  it('language', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const data = { usersettings: { language: 'en' } }
    const state = { data }
    const language = userModule.getters.language(state)
    expect(language).to.deep.equal(data.usersettings.language)
  })

  it('settings', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const data = { usersettings: { foo: '1' } }
    const state = { data }
    const settings = userModule.getters.settings(state)
    expect(settings).to.deep.equal(data.usersettings)
  })

  it('userFields', () => {
    const fakeAPI = () => { }
    const userModule = userModuleFactory(fakeAPI)
    const data = { usersettings: { foo: '1' } }
    const state = { data }
    const userFields = userModule.getters.userFields(state)
    expect(userFields).to.be.a('function')
    expect(userFields('usersettings.foo')).to.equal('1')
  })
})
