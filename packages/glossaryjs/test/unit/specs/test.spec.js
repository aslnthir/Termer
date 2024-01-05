/* global describe, it */
import assert from 'assert'

import {tagIt, findIt, findBoundaries} from 'glossarylib/src/tagger'
import createWordlist from 'glossarylib/src/Wordlist'
import MutationController from 'glossarylib/src/MutationController'
import {removeAllTingtunMarupTags,
        isUpperCase,
        removeWordsFromWordList,
        getUrlParameterByName,
        getParagraphStyles} from '@/glossary'

import {GlossaryPopup} from '@/lib/glossary-popup'

describe('tagger', function () {
  describe('matches the term only once', async () => {
    let el, match
    before(async () => {
      el = createHTMLElement('term term term')
      const wordlist = createWordlist(['term'])
      const result = await tagIt(el, wordlist)
      match = el.querySelectorAll('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))

    it('One highlighted term', () => {
      assert.equal(match.length, 1)
    })
    it('The second child node is the highligted term.', () => {
      // The first node is ether empty textNode or the start of the
      // text node. Thats why it will allways be the second child.
      assert(match[0] === el.childNodes[1])
    })
    it('The rest of the text content is left unmodified.', () => {
      assert(el.childNodes[0].nodeType === Node.TEXT_NODE)
      assert(el.childNodes[2].nodeType === Node.TEXT_NODE)
    })
  })
  describe('Skips the content of headings', async () => {
    let el, heading, matchTermInHeading, matchTerm
    before(async () => {
      const html = `
        <h1>term</h1>
        term
      `
      el = createHTMLElement(html)
      const wordlist = createWordlist(['term'])
      const result = await tagIt(el, wordlist)
      heading = el.querySelector('h1')
      matchTermInHeading = heading.querySelectorAll('[name=tingtun_glossary_label]')
      matchTerm = el.querySelector('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))
    it('does not highlight anything in the heading', () =>
      assert.equal(matchTermInHeading.length, 0))
    it('hightligts the term after the heading', () => {
      assert.equal(heading.nextElementSibling, matchTerm)
    })
  })
  describe('handles a known problem in IE11 & Edge', async () => {
    let el, matchTerm
    before(async () => {
      const html = `
        <h1>heading</h1>
        <div><div>term</div></div>
        trailing text
        `
      el = createHTMLElement(html)
      const wordlist = createWordlist(['term'])
      const result = await tagIt(el, wordlist)
      matchTerm = el.querySelector('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))
    it('highligts a doubly-nested term immediately after a heading', () => {
      assert(matchTerm)
    })
  })
})

function createHTMLElement (htmlText) {
  const el = document.createElement('div')
  el.insertAdjacentHTML('beforeend', htmlText)
  document.body.appendChild(el)
  return el
}

describe('Term finder', function () {
  it('Finds only the longest match', function () {
    const wordlist = createWordlist(['illustrative example', 'example'])
    const str = 'foo illustrative example foo'
    const term = 'illustrative example'
    const start = new RegExp(term).exec(str).index // startpos of term
    const end = start + term.length  // endpos of term
    const wordLengths = wordlist.map((value, key) => value && key)
      .filter(key => key)
      .reverse()
    const list = new Set()
    const ret = findIt(wordlist, wordLengths, str, list)
    assert.deepEqual(ret, [start, end])
  })
})

describe('Word boundary regex', function () {
  describe('Matches the words and boundaries between them', function () {
    let x = [
      { t: 'x', e: [0, 1] },
      { t: ' x', e: [0, 0, 1, 2] },
      { t: 'the test', e: [0, 3, 4, 8] },
      { t: 'the  test', e: [0, 3, 5, 9] },
      { t: 'Jump up to: ', e: [0, 4, 5, 7, 8, 10] },
      { t: ';\na b.  Cd e, f ', e: [0, 0, 2, 3, 4, 5, 8, 10, 11, 12, 14, 15] }

    ]

    for (let {t, e} of x) {
      it(t, function () {
        assert.deepEqual(findBoundaries(t), e)
      })
    }
  })
})

describe('GlossaryPopup.cleanUpPositionElement()', function () {
  const markupCleanupList = {}
  const wordlist = createWordlist(['term'])
  const MutationDetector = new MutationController(500, markupCleanupList)
  MutationDetector.setWordlist(wordlist)

  describe('Do not remove markups after temp node cleanup', function () {
    let el, match, el2
    const gp = new GlossaryPopup('test', null, MutationDetector)
    before(async () => {
      el2 = document.createElement('div')
      el2.insertAdjacentHTML('beforeend', 'htmlText')
      el2.className = 'tingtun_label_focus'
      el2.dataset.temp = 'true'
      gp.positionElement = el2
      document.body.appendChild(el2)
      el = createHTMLElement('term term2')
      const result = await tagIt(el, wordlist, null, MutationDetector)
      MutationDetector.start()
      gp.cleanUpPositionElement()
    })
    after(() => {
      document.body.removeChild(el)
      MutationDetector.stop()
    })

    it('Markups are still present', () => {
      match = el.querySelectorAll('[name=tingtun_glossary_label]')
      assert.equal(match.length, 1)
    })
  })

})
/*
 * taken from: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
 */
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

/*
 * from: http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
 */
function isObjectEquivalent(a, b) {

    if (!(a || b)) {
      return false
    }
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

describe('Glossary.js functions', function () {
  const wordlist = ['term', 'third', 'that']
  const binary_wordlist = createWordlist(wordlist)
  describe('Remove markups', function () {
    let el, match
    before(async () => {
      el = createHTMLElement('term term term')
      await tagIt(el, binary_wordlist)
      removeAllTingtunMarupTags()
      match = el.querySelectorAll('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))

    it('removeAllTingtunMarupTags', () => {
      assert.equal(match.length, 0)
    })
  })

  describe('WordList functions', function () {
    it('Remove words from wordList', () => {
      let newList = removeWordsFromWordList(['third', 'that'], wordlist)
      assert.ok(newList.equals(['term']))
    })

    it('Binary wordList', () => {
      let expected = [, , , , 'termthat', 'third']
      assert.ok(binary_wordlist.equals(expected))
    })
  })

  it('isUpperCase predict correct', () => {
    assert.ok(isUpperCase('A'))
    assert.ok(!isUpperCase('b'))
  })

  it('getParagraphStyles get document style', () => {
    assert.ok(isObjectEquivalent(
      getParagraphStyles(['fontFamily']),
      {fontFamily: '"Times New Roman"'}
    ))
  })


})
