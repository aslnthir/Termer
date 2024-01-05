/* global describe, it, chai */
import {
  tagIt,
  findIt,
  findAll,
  findBoundaries,
  findBoundariesMulti,
  MatchType as MT,
  getTextLength,
  getMaxTextLength,
  insertMarkup,
  findPossibleMatches,
  nodeWindowGenerator,
  Registry,
  NullRegistry,
  TextLengthTracker
} from '../../../src/tagger'
import createWordlist from '../../../src/Wordlist'
import loremIpsumText from './lorem-ipsum.txt'

chai.config.truncateThreshold = 0

describe('performance', async () => {
  it.skip('findAll benchmark', async () => {
    const words = Array.from(
      new Set(
        [].concat(
          ...Array.from(
            loremIpsumText.matchAll(/[a-z]+/ig)
          )
        ).map(x => x.toLowerCase())))
    const wordlist = createWordlist(words)
    const nullRegistry = new NullRegistry()
    async function t (i) {
      const el = createHTMLElement(
        '<span>' +
        loremIpsumText.replace(/\s/g, ' </span><span>') +
        '</span>'
      )
      // attempt to force recalculation of DOM before starting the benchmark.
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight
      const startMark = 'start' + i
      const endMark = 'end' + i
      const measureName = 'measure' + i
      performance.mark(startMark)
      const result = await findAll(wordlist, el, nullRegistry)
      // force the generator to run
      // eslint-disable-next-line no-unused-vars
      for await (const _ of result) { }
      performance.mark(endMark)
      performance.measure(measureName, startMark, endMark)
      const [measure] = performance.getEntriesByName(measureName, 'measure')
      el.parentElement.removeChild(el)
      return measure.duration
    }
    const measures = []
    for (let i = 0; i < 20; i++) {
      const measure = await t(i)
      measures.push(measure)
    }
    measures.sort((a, b) => a - b)
    console.log('median', median(measures))
  }).timeout(20000)
  // minimum: 161ms
})

function average (listOfNumbers) {
  const sum = listOfNumbers.reduce((s, a) => s + a, 0)
  return sum / listOfNumbers.length
}

function median (listOfNumbers) {
  const midpoint = (listOfNumbers.length - 1) / 2
  if (midpoint % 1 > 0) {
    const a = Math.floor(midpoint)
    return average(listOfNumbers.slice(a, a + 2))
  } else {
    return listOfNumbers[midpoint]
  }
}

describe('tagger', function () {
  describe('matches term & regex', async () => {
    let el
    before(async () => {
      el = createHTMLElement('<p>a</p>\nte<i>rm</i> <i>1</i>, term <i>2a</i>, term 3a foo')
      const wordlist = createWordlist(['term 1'])
      const regexes = [/term \da/]
      await tagIt(el, wordlist, regexes)
    })
    after(() => document.body.removeChild(el))

    it('three highlighted terms', () => {
      const matches = el.querySelectorAll('[tabindex="0"]')
      assert.strictEqual(matches.length, 3)
      const textMatches = []
      for (const match of matches) {
        const matchId = match.dataset.termerTagId
        const textContent = [].slice.apply(
          el.querySelectorAll(`[data-termer-tag-id="${matchId}"]`)
        )
          .map(x => x.textContent)
          .join('')
        textMatches.push(textContent)
      }

      assert.strictEqual(textMatches[0], 'term 1')
      assert.strictEqual(textMatches[1], 'term 2a')
      assert.strictEqual(textMatches[2], 'term 3a')
    })
  })

  describe('matches the term only once', async () => {
    let el, match
    before(async () => {
      el = createHTMLElement('term term term')
      const wordlist = createWordlist(['term'])
      await tagIt(el, wordlist)
      match = el.querySelectorAll('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))

    it('One highlighted term', () => {
      assert.strictEqual(match.length, 1)
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
        term
        <h1>term</h1>
        term
      `
      el = createHTMLElement(html)
      const wordlist = createWordlist(['term'])
      await tagIt(el, wordlist)
      heading = el.querySelector('h1')
      matchTermInHeading = heading.querySelectorAll('[name=tingtun_glossary_label]')
      matchTerm = el.querySelectorAll('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))
    it('does not highlight anything in the heading', () =>
      assert.strictEqual(matchTermInHeading.length, 0))
    it('hightligts the term after the heading', () => {
      assert.strictEqual(heading.nextElementSibling, matchTerm[1])
    })
    it('hightligts the term before the heading', () => {
      assert.strictEqual(heading.previousElementSibling, matchTerm[0])
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
      await tagIt(el, wordlist)
      matchTerm = el.querySelector('[name=tingtun_glossary_label]')
    })
    after(() => document.body.removeChild(el))
    it('highligts a doubly-nested term immediately after a heading', () => {
      assert(matchTerm)
    })
  })
  it('handles “ and ”', async () => {
    const html = '<p>the “orange card” procedure'
    const el = createHTMLElement(html)
    const wordlist = createWordlist(['orange card procedure'])
    await tagIt(el, wordlist)
    const matchTerm = el.querySelector('[name=tingtun_glossary_label]')

    after(() => document.body.removeChild(el))
    assert(matchTerm)
  })
})

function createHTMLElement (htmlText) {
  const el = document.createElement('div')
  el.insertAdjacentHTML('beforeend', htmlText)
  document.body.appendChild(el)
  return el
}

describe('find possible matches', () => {
  const cases = [{
    t: {
      list: [findBoundaries('“xyz”')],
      length: 3
    },
    e: [[[1, 4]]]
  }, {
    t: {
      list: [findBoundaries('bbb b')],
      length: 5
    },
    e: [[[0, 5]]]
  }, {
    t: {
      list: [findBoundaries('b  b')],
      length: 3
    },
    e: [[[0, 4]]]
  }, {
    t: {
      list: [findBoundaries('aa bbb b aa')],
      length: 5
    },
    e: [[[3, 8]]]
  }, {
    t: {
      list: findBoundariesMulti([
        'aa bbb',
        'aa aaaaaaa'
      ]),
      length: 5
    },
    e: [[[3, 6], [0, 2]]]
  }, {
    t: {
      list: findBoundariesMulti([
        'a',
        'b',
        'c'
      ]),
      length: 2
    },
    e: [[[0, 1], [0, 1]]]
  }, {
    t: {
      list: findBoundariesMulti([
        'a',
        'b',
        'c'
      ]),
      length: 3
    },
    e: [[[0, 1], [0, 1], [0, 1]]]
  }, {
    t: {
      list: findBoundariesMulti([
        'aaaaa bbbbb'
      ]),
      length: 5
    },
    e: [[[0, 5]], [[6, 11]]]
  }, {
    t: {
      list: [[
        { type: MT.WORD, stringIndex: 0 },
        { type: MT.WORD, stringIndex: 5 }
      ]],
      length: 2
    },
    e: []
  }, {
    t: {
      list: [[
        { type: MT.WORD, stringIndex: 0 },
        { type: MT.END, stringIndex: 5 }
      ]],
      length: 5
    },
    e: [[[0, 5]]]
  }]

  for (const { t: test, e: expected, only } of cases) {
    const testFun = only ? it.only.bind(it) : it
    const tlt = new TextLengthTracker()
    test.list.map(x => x.map(obj => tlt.addTextLength(obj)))
    testFun(JSON.stringify(test), () => {
      const result = Array.from(
        findPossibleMatches(test.length, test.list)
      )
      assert.deepStrictEqual(result, expected)
    })
  }
})

describe('calculate span length', () => {
  it('works with multiple spans', () => {
    const text = [
      'Aa ',
      ' bb'
    ]
    const arr = findBoundariesMulti(text)
    const tlt = new TextLengthTracker()
    arr.map(x => x.map(obj => tlt.addTextLength(obj)))
    const result = getTextLength(arr, [0, 0], [1, 2])
    assert.strictEqual(result, 5)
  })
  it('works with a single span', () => {
    const text = 'There  is  a  HOUSE'
    const arr = [findBoundaries(text)]
    const tlt = new TextLengthTracker()
    arr.map(x => x.map(obj => tlt.addTextLength(obj)))
    const result = getMaxTextLength(arr)
    assert.strictEqual(result, 16)
  })
})

describe('Word boundary regex', function () {
  describe('Matches the words and boundaries between them', () => {
    const x = [
      {
        t: '“X”',
        e: [
          { type: MT.OTHER_OPTIONAL, stringIndex: 0 },
          { type: MT.WORD, stringIndex: 1 },
          { type: MT.OTHER_OPTIONAL, stringIndex: 2 },
          { type: MT.END, stringIndex: 3 }

        ]
      },
      {
        t: '17. mai',
        e: [
          { type: MT.WORD, stringIndex: 0 },
          { type: MT.SPACE, stringIndex: 3 },
          { type: MT.WORD, stringIndex: 4 },
          { type: MT.END, stringIndex: 7 }
        ]
      },
      {
        t: 'x',
        e: [
          { type: MT.WORD, stringIndex: 0 },
          { type: MT.END, stringIndex: 1 }
        ]
      },
      {
        t: ' x',
        e: [
          { type: MT.SPACE, stringIndex: 0 },
          { type: MT.WORD, stringIndex: 1 },
          { type: MT.END, stringIndex: 2 }
        ]
      },
      {
        t: 'the test',
        e: [
          { type: MT.WORD, stringIndex: 0 },
          { type: MT.SPACE, stringIndex: 3 },
          { type: MT.WORD, stringIndex: 4 },
          { type: MT.END, stringIndex: 8 }
        ]
      },
      {
        t: 'the  test',
        e: [
          { type: MT.WORD, stringIndex: 0 },
          { type: MT.SPACE, stringIndex: 3 },
          { type: MT.WORD, stringIndex: 5 },
          { type: MT.END, stringIndex: 9 }
        ]
      },
      {
        t: 'Jump up to: ',
        e: [
          { type: MT.WORD, stringIndex: 0 },
          { type: MT.SPACE, stringIndex: 4 },
          { type: MT.WORD, stringIndex: 5 },

          { type: MT.SPACE, stringIndex: 7 },
          { type: MT.WORD, stringIndex: 8 },
          { type: MT.OTHER, stringIndex: 10 },

          { type: MT.SPACE, stringIndex: 11 },
          { type: MT.END, stringIndex: 12 }

        ]
      },
      {
        t: ';\na b.  Cd e,, f ',
        e: [
          { type: MT.OTHER, stringIndex: 0 },
          { type: MT.SPACE, stringIndex: 1 },

          { type: MT.WORD, stringIndex: 2 },
          { type: MT.SPACE, stringIndex: 3 },
          { type: MT.WORD, stringIndex: 4 },

          { type: MT.OTHER, stringIndex: 5 },
          { type: MT.SPACE, stringIndex: 6 },
          { type: MT.WORD, stringIndex: 8 },
          { type: MT.SPACE, stringIndex: 10 },

          { type: MT.WORD, stringIndex: 11 },
          { type: MT.OTHER, stringIndex: 12 },
          { type: MT.SPACE, stringIndex: 14 },
          { type: MT.WORD, stringIndex: 15 },

          { type: MT.SPACE, stringIndex: 16 },
          { type: MT.END, stringIndex: 17 }
        ]
      },
      {
        t: 'a))',
        e: [{ type: MT.WORD, stringIndex: 0 },
          { type: MT.OTHER, stringIndex: 1 },
          { type: MT.OTHER, stringIndex: 2 },
          { type: MT.END, stringIndex: 3 }
        ]
      }
    ]

    for (const { t, e } of x) {
      it(t, function () {
        const r = Array.from(findBoundaries(t))
        assert.deepStrictEqual(r, e)
      })
    }
  })
})
// */
// /*
describe('Term tagger', () => {
  const tests = [
    {
      name: '0',
      terms: ['illustrative example'],
      html: '<p>illustrative example</p>',
      expected: [[
        ['illustrative example'],
        [
          {
            matchIndices: [[0, 20]],
            matchText: 'illustrative example'
          }
        ]
      ]]
    }, {
      name: '1',
      terms: ['illustrative example'],
      html: '<p>illustrative <i>example</i></p>',
      expected: [[
        ['illustrative ', 'example'],
        [
          {
            matchIndices: [[0, 13], [0, 7]],
            matchText: 'illustrative example'
          }
        ]
      ]]
    }, {
      name: '2',
      terms: ['illustrative example', 'foo', 'barz'],
      html: '<p>illustrative <i>example not included</i></p>foo, and barz',
      expected: [
        [ // block 1
          ['illustrative ', 'example not included'], // extracted text nodes
          [ // matches in block 1
            {
              matchIndices: [ // One term match
                [0, 13], [0, 7] // spans for each node
              ],
              matchText: 'illustrative example'
            }
          ]
        ], [ // block 2
          ['foo, and barz'], // extracted text nodes
          [ // matches in block 2
            {
              matchIndices: [ // match for ‘foo’
                [0, 3]
              ],
              matchText: 'foo'
            },
            {
              matchIndices: [ // match for ‘barz’
                [9, 13]
              ],
              matchText: 'barz'
            }
          ]
        ]
      ]
    }, {
      name: '3',
      terms: ['en to tre'],
      html: '<p>en to <i>tre</i>',
      expected: [[
        ['en to ', 'tre'],
        [{
          matchIndices: [[0, 6], [0, 3]],
          matchText: 'en to tre'
        }]
      ]]
    }, {
      name: '4',
      terms: ['a b', 'b c'],
      html: '<p>a <i>b c</i>',
      expected: [[
        ['a ', 'b c'],
        [{
          matchIndices: [[0, 2], [0, 1]],
          matchText: 'a b'
        }]
      ]]
    }, {
      name: '5',
      terms: ['testable', 'criteria'],
      html: '<span>into testable</span><span></span><span>success</span><span></span><span>criteria,</span>',
      expected: [[
        ['into testable'],
        [{
          matchIndices: [[5, 13]],
          matchText: 'testable'
        }]
      ], [
        ['criteria,'],
        [{
          matchIndices: [[0, 8]],
          matchText: 'criteria'
        }]
      ]]
    }
  ]
  for (const { name, terms, html, expected, only } of tests) {
    const _it = only ? it.only.bind(it) : it
    _it(name, async () => {
      const wordlist = createWordlist(terms)
      const el = document.createElement('div')
      el.innerHTML = html
      const findAllResult = findAll(wordlist, el, new Registry())
      // const result = await asyncIterableToArray(findAllResult)
      const results = []
      for await (const result of findAllResult) {
        result[0] = result[0].map(textNode => textNode.data)
        results.push(result)
      }
      assert.deepStrictEqual(results, expected,
        `${JSON.stringify(results)} != ${JSON.stringify(expected)}`)
    })
  }
})

describe('findIt', () => {
  const tests = [
    {
      description: 'Performs search only from the start element',
      wordlistTerms: ['illustrative example', 'example'],
      stringToTest: ['foo ', 'illustrative', ' example foo'],
      expected: []
    }
  ]

  for (const test of tests) {
    const {
      description, wordlistTerms, stringToTest,
      expected, only
    } = test
    const _it = only ? it.only.bind(it) : it
    _it(description, async () => {
      const wordlist = createWordlist(wordlistTerms)
      const wordLengths = wordlist.map((value, key) => value && key)
        .filter(key => key)
        .reverse()

      const registry = new Set()
      const wordBoundaries = stringToTest.map(findBoundaries)
      const result = findIt(wordlist, wordLengths, stringToTest, wordBoundaries, registry)
      assert.deepStrictEqual(result, expected, JSON.stringify(result))
    })
  }
})

describe('Term finder', () => {
  const tests = [
    {
      description: 'Finds only the longest match anemone',
      wordlistTerms: ['anemone virginiana', 'anemone'],
      stringToTest: ['\nAn', 'emo', 'ne ', 'virginiana ', '\n    '],
      expected: [{
        matchIndices: [[1, 3], [0, 3], [0, 3], [0, 10]],
        matchText: 'anemone virginiana'
      }]
    },
    {
      description: 'Finds only the longest match DSB 1',
      wordlistTerms: ['a a', 'a'],
      stringToTest: ['a  a'],
      expected: [{
        matchIndices: [[0, 4]],
        matchText: 'a a'
      }]
    },
    {
      description: 'Finds only the longest match DSB 2',
      wordlistTerms: ['Direktoratet for samfunnssikkerhet og beredskap', 'samfunnssikkerhet'],
      stringToTest: [
        'Direktoratet for samfunnssikkerhet og ',
        'beredskap (DSB)',
        '  -  Direktorat  som  skal  ha  '
      ],
      expected: [{
        matchIndices: [[0, 38], [0, 9]],
        matchText: 'Direktoratet for samfunnssikkerhet og beredskap'
      }]
    },
    {
      description: 'Finds only the longest match (overlapping)',
      wordlistTerms: ['a b b a', 'b b'],
      stringToTest: [
        'a b ',
        'b',
        ' a'
      ],
      expected: [{
        matchIndices: [[0, 4], [0, 1], [0, 2]],
        matchText: 'a b b a'
      }]
    },
    {
      description: 'Finds term ending in parenthesis, followed by a parenthesis',
      wordlistTerms: ['a)'],
      stringToTest: [
        'a))'
      ],
      expected: [{
        matchIndices: [[0, 2]],
        matchText: 'a)'
      }]
    }
  ]

  for (const { description, wordlistTerms, stringToTest, expected, only } of tests) {
    const _it = only ? it.only.bind(it) : it
    _it(description, async () => {
      const wordlist = createWordlist(wordlistTerms)
      const registry = new Set()
      const el = createHTMLElement('<i>' + stringToTest.join('</i><i>') + '</i>')
      const result = await asyncIterableToArray(findAll(wordlist, el, registry))
      assert.deepStrictEqual(result[0][1], expected, JSON.stringify(result))
    })
  }
})

describe('Insert markup', () => {
  it('1', () => {
    const p = document.createElement('p')
    p.innerHTML = 'superb!!'
    function tagCreator ({ content }) {
      const span = document.createElement('span')
      span.innerHTML = content
      return span
    }
    const matchIndices = {
      matchIndices: [[0, 6]]
    }
    insertMarkup(matchIndices, Array.from(p.childNodes), null, tagCreator)
    const expected = '<p><span>superb</span>!!</p>'
    assert.deepStrictEqual(p.outerHTML, expected)
  })
})

describe('node walker', () => {
  const tests = [
    {
      name: 'splits <p> blocks #1',
      html: '<p>en</p><p>to</p><p>tre</p>',
      expected: [['en'], ['to'], ['tre']],
      windowLength: 100
    },
    {
      name: 'splits <p> blocks, preserving space #2',
      html: '<p>en to</p><p>tre</p>',
      expected: [['en to'], ['tre']],
      windowLength: 100
    },
    {
      name: 'splits <p> blocks #3',
      html: '<p>en <i>to</i></p><p>tre</p>',
      expected: [
        ['en ', 'to'],
        ['to'],
        ['tre']
      ],
      windowLength: 100
    },
    {
      name: 'splits on <h1>, does not include header text',
      html: 'en.<h1><i>heading</i></h1>to',
      expected: [
        ['en.'],
        ['to']
      ],
      windowLength: 100
    },
    {
      html: 'An<b>emo</b>ne <i>virginiana </i>',
      expected: [
        ['An', 'emo', 'ne ', 'virginiana '],
        ['emo', 'ne ', 'virginiana '],
        ['ne ', 'virginiana '],
        ['virginiana ']
      ],
      windowLength: 100
    }
  ]
  for (const { name, html, expected, windowLength } of tests) {
    it(name || html, async () => {
      const el = document.createElement('div')
      el.innerHTML = html
      const nop = () => {}
      const result = await asyncIterableToArray(nodeWindowGenerator(el, windowLength, nop))
      const resultAsText = result.map(({ strings }) => strings)
      assert.deepStrictEqual(resultAsText, expected, JSON.stringify(resultAsText))
    })
  }
  it('applies the custom nodeActions AFTER visiting each node', async () => {
    const el = document.createElement('div')
    el.innerHTML = 'aaa<h1>XXX</h1>bbb'
    const result = []
    const action = () => result.push('action')
    for await (const value of nodeWindowGenerator(el, 100, action)) {
      result.push(value.textNodes.map(x => x.data))
    }
    const expected = ['action', ['aaa'], 'action', 'action', ['bbb']]
    assert.deepStrictEqual(result, expected)
  })
})

async function asyncIterableToArray (ai) {
  const arr = []
  for await (const x of ai) {
    arr.push(x)
  }
  return arr
}
