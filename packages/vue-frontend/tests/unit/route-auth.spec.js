import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import dirtyChai from 'dirty-chai'
import guardFactory from '@/router/auth-guard'

chai.use(sinonChai)
chai.use(dirtyChai)
const expect = chai.expect

function isLoggedIn () {
  return 'success'
}

describe('auth-guard', () => {
  it('always calls next() on unprotected routes', () => {
    const next = sinon.spy()
    const guard = guardFactory(isLoggedIn)
    guard({ matched: [] }, null, next)
    expect(next.args).to.deep.equal([[]])
  })
  it('accepts navigation when logged in', () => {
    const next = sinon.spy()
    const to = {
      matched: [{ meta: { requiresAuth: true } }]
    }
    const guard = guardFactory(isLoggedIn)
    guard(to, null, next)
    expect(next.args).to.deep.equal([[]])
  })
  it('redirects to login if navigation isn’t allowed', () => {
    const next = sinon.spy()
    const to = {
      matched: [{ meta: { requiresAuth: true } }],
      fullPath: '/foo/'
    }
    const guard = guardFactory(() => false)
    guard(to, null, next)
    expect(next.args).to.deep.equal([
      [{ name: 'loginOptions', query: { next: '/foo/' } }]
    ])
  })
})
