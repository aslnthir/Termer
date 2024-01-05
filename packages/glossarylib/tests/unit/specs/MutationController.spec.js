import MutationController from '../../../src/MutationController.js'
import createWordlist from '../../../src/Wordlist'
import { tagIt } from '../../../src/tagger'
describe('MutationObserver', function () {
  afterEach(() => {
    // clean up after each test.
    MutationDetector.stop()
    MutationDetector.off()

    const remove = document.getElementById('test-container') ||
      { childNodes: [] }
    for (const el of remove.childNodes) {
      el.parentElement.removeChild(el)
    }
  })

  const wordlist = createWordlist(['term'])
  const MutationDetector = new MutationController(5)
  MutationDetector.setTaggerFunction(elem => {
    return tagIt(elem, wordlist, null, null, MutationDetector)
  })

  describe('Markup when textNode change', () => {
    let el, match
    before(async () => {
      el = createHTMLElement('term numbertwo term')
      return MutationDetector.start()
    })

    it('Highlighted changed textNode', done => {
      MutationDetector.on(MutationDetector.events.markup_done, () => {
        match = el.querySelectorAll('[name=tingtun_glossary_label]')
        done(e2r(() => assert.equal(match.length, 1)))
      })
      el.childNodes[0].textContent = 'term term term'
    })
  })

  describe('Markup when elementNode added', () => {
    let el, match
    before(async () => {
      await MutationDetector.start()
      el = createHTMLElement('term numbertwo term')
    })

    it('Highlighted added elementNode', done => {
      MutationDetector.on(MutationDetector.events.markup_done, () => {
        match = el.querySelectorAll('[name=tingtun_glossary_label]')
        done(e2r(() => assert.equal(match.length, 1)))
      })
    })
  })

  describe('Cleanup nodes created from markup when characterData change', () => {
    let el, match
    before(async () => {
      el = createHTMLElement('term numbertwo term2')
      await tagIt(el, wordlist, null, null, MutationDetector)
      await MutationDetector.start()
      el.children[0].textContent = 'not this '
    })

    it('Cleanup created nodes', done => {
      MutationDetector.on(MutationDetector.events.markup_done, () => {
        match = el.querySelectorAll('[name=tingtun_glossary_label]')
        done(e2r(() => assert.equal(match.length, 0)))
      })
    })
  })

  describe('Cleanup nodes created from markup when textNode deleted', () => {
    let el, match
    before(async () => {
      el = createHTMLElement('term numbertwo term2')
      await tagIt(el, wordlist, null, null, MutationDetector)
      await MutationDetector.start()
      el.children[0].removeChild(el.children[0].childNodes[0])
    })

    it('Cleanup created nodes', done => {
      MutationDetector.on(MutationDetector.events.markup_done, () => {
        match = el.querySelectorAll('[name=tingtun_glossary_label]')
        done(e2r(() => assert.equal(match.length, 0)))
      })
    })
  })
})

function createHTMLElement (htmlText) {
  const el = document.createElement('div')
  el.insertAdjacentHTML('beforeend', htmlText)
  getOrCreateTestContainer().appendChild(el)
  return el
}

function getOrCreateTestContainer () {
  let el = document.getElementById('test-container')
  if (!el) {
    el = document.createElement('div')
    el.id = 'test-container'
    document.body.appendChild(el)
  }
  return el
}

// Turn a thrown exception into an Error() return value.
// (mnemonic: e2r == exception-to-return)
function e2r (f) {
  try {
    return f()
  } catch (e) {
    return e
  }
}
