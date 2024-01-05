import chai from 'chai'
import dirtyChai from 'dirty-chai'
import store from '@/store'

chai.use(dirtyChai)
const expect = chai.expect

describe('store', () => {
  it('has getter for `Auth.loggedInStatus`', () => {
    expect(store.getters['Auth/loggedInStatus']).to.be.a('string')
  })
})
