/*
 * Vertraulich
 */

import { __ } from './i18n'
import {
  isHeading, isContainedIn, isExcludedElement, isBlockLevelElement
} from './TagAsync/helperFunctions'

import { isInWordlist, insertInWordlist } from './Wordlist'

// Add missing String.matchAll() method for IE11
import 'core-js/proposals/string-match-all'

export async function tagIt (
  element, wordlist, regexes, cssClass, MutationDetector, exclude = new Set(),
  highlightMode = 'sections'
) {
  if (regexes && regexes.length) {
    let text = ''
    if (Array.isArray(element)) {
      text = element.map(x => x.textContent.replace(/\s\s+/g, ' ')).join('')
    } else {
      text = element.textContent.replace(/\s\s+/g, ' ')
    }
    const joinedRegExps = regexes.map(x => x.source || x).join('|')
    const re = new RegExp(
      `(?:${joinedRegExps})`,
      'ig'
    )
    const regexMatches = text.matchAll(re)
    for (const [match] of regexMatches) {
      insertInWordlist(match, wordlist)
    }
  }

  let registry
  switch (highlightMode) {
    case 'all':
      registry = new NullRegistry(exclude)
      break
    case 'sections':
    default:
      registry = new Registry(exclude)
      break
  }
  const result = await replaceIt(
    wordlist, element, cssClass, MutationDetector, registry
  )
  return result

  // Missing functionality after replacing jQuery usaeg with a tree walker:
  // - Force highlighting in elements with class=tingtun-mark.
  // TODO: class=tingtun-{disable,enable}-highlighting
  // TODO: IE11 testing
}

export async function * findAll (wordlist, startNode, registry) {
  const wordLengths = wordlist.map((value, key) => value && key)
    .filter(key => key)
    .reverse()

  // Array of match start and end (exclusive) indices. Evens are starts and odds
  // are ends.
  if (!startNode) return

  function nodeAction (node) {
    if (isHeading(node)) {
      // <h*> headers: reset registry of marked-up words
      registry.reset()
    }
  }

  const maxWindowLength = wordLengths[0]
  const nodeWindows = nodeWindowGenerator(startNode, maxWindowLength, nodeAction)
  const filteredTextNodes = filterTextNodes(nodeWindows)

  // let skip = 0
  for await (const nodeWindow of filteredTextNodes) {
    /*
    if (skip > 0) {
      skip--
      continue
    }
    */
    const newMatches = findIt(wordlist, wordLengths, nodeWindow.strings, nodeWindow.wordBoundaries, registry)
    if (newMatches.length > 0) {
      yield [nodeWindow.textNodes, newMatches]
      /*
      skip = newMatches.reduce(
        (sum, { matchIndices }) => sum + matchIndices.length,
        0
      )
      skip -= 1
      */
    }
  }
}

// Filter generator for the text nodes. Drops text node lists which start with
// an empty node.
async function* filterTextNodes (generator) {
  for await (const nodeWindow of generator) {
    const text = nodeWindow.strings[0].data
    if (!isWhitespaceOrEmpty(text)) {
      yield nodeWindow
    }
  }
}

const isWhitespaceOrEmpty = str => /^\s*$/.test(str)

export function findIt (wordlist, wordLengths, strings, wordBoundaryIndices,
  matchRegistry
) {
  // This is the array we return. Collect the start & end indices here.
  const matches = []

  const maxLength = getMaxTextLength(wordBoundaryIndices)
  for (const wordLength of wordLengths) {
    if (wordLength > maxLength) {
      // Skip trying to search for words longer than the actual text.
      continue
    }
    const possibleMatches = findPossibleMatches(wordLength, wordBoundaryIndices)
    // eslint-disable-next-line no-labels
    checkPossibleMatches:
    for (const possibleMatch of possibleMatches) {
      for (const { matchIndices } of matches) {
        // Skip the possible match if it overlaps a previously found match.
        const isOverlapping = overlaps(possibleMatch, matchIndices)
        if (isOverlapping) {
          // This stops the inner for loop and `continue`s the outer for loop.
          // eslint-disable-next-line no-labels
          continue checkPossibleMatches
        }
      }
      const text = getSubstring(strings, possibleMatch)
      const foundMatch = checkForMatch(text, wordlist, matchRegistry)
      if (foundMatch) {
        matchRegistry.add(foundMatch)
        matches.push({ matchIndices: possibleMatch, matchText: foundMatch })
      }
    }
  }

  // Finally sort the indices in rising numerical order. Because there are no
  // overlaps we can do a simple sort on the start positions.
  return matches.sort((a, b) => a.matchIndices[0][0] - b.matchIndices[0][0])
}

function overlaps (possibleMatch, previousMatch) {
  const upperLimit = Math.min(possibleMatch.length, previousMatch.length)
  for (let j = 0; j < upperLimit; j++) {
    const startPositionA = possibleMatch[j][0]
    const o = possibleMatch[j].length - 1
    const endPositionA = possibleMatch[j][o]

    const startPositionB = previousMatch[j][0]
    const o1 = previousMatch[j].length - 1
    const endPositionB = previousMatch[j][o1]

    const overlaps = overlap2D(
      startPositionA, endPositionA,
      startPositionB, endPositionB
    )
    if (overlaps) return true
  }
  return false
}

export async function replaceIt (
  wordlist, startNode, cssClass, MutationDetector, registry
) {
  const result = findAll(wordlist, startNode, registry)
  for await (const [textNodes, matches] of result) {
    MutationDetector && MutationDetector.stop()
    try {
      const f = (match) => insertMarkup(match, textNodes, cssClass, createMarkup)
      tagAllMatches(matches, f)
    } finally {
      MutationDetector && await MutationDetector.start()
    }
  }
}

export function tagAllMatches (matches, insertMarkup) {
  // We go backwards in order to not mess up the Text node we’re working on as
  // we go along using `.splitText()` in `insertMarkup`.
  for (let i = matches.length - 1; i > -1; --i) {
    const match = matches[i]
    try {
      insertMarkup(match)
    } catch (e) {
      console.error(e)
    }
  }
}

// To create random generated unique ID for cleanup task.
function uniqueId () {
  return 'id-' + Math.random().toString(36).substr(2, 16)
};

/*
 * Modifed code from: https://stackoverflow.com/questions/16662393/insert-html-into-text-node-with-javascript
 * Gets an textNode, then splits text node at the start of term to be marked up.
 * Then splits at the end of the marked up area. Create the span to replace the term.
 * Insert span and remove term textNode.
 * Also save all new created nodes to be deleted for cleanup if mutation for original
 * textnode is seculad for deltetion.
 */

function extractText (indices, nodes) {
  const arr = []
  for (let i = 0; i < indices.length; i++) {
    arr.push(nodes[i].data.slice(indices[i][0], indices[i][indices[i].length - 1]))
  }
  return arr.join('').replace(/(\s)\s+/g, '$1')
}

// tag one term
export function insertMarkup (
  { matchIndices, matchText }, textNodes, cssClass, tagCreator
) {
  // window.MutationDetectorTingtun.stopRemove()
  const concept = matchText || extractText(matchIndices, textNodes)
  // Unique random id to keep track of which nodes are connected
  const tagID = uniqueId()
  for (let j = 0; j < matchIndices.length; j++) {
    const indices = matchIndices[j]
    const textNode = textNodes[j]
    if (!textNode.parentNode) {
      // We can’t do anything with a node that has no parent.
      continue
    }
    let nextNode = textNode
    for (let i = 0; i < indices.length; i += 2) {
      // Every even index contains the starting point of a word.
      // Split textnode up at beginning of term
      const match = nextNode.splitText(indices[i])
      // Now make "match" only the term phrase by splitting again at end of
      // phrase
      const newTextNode = match.splitText(indices[i + 1] - indices[i])
      // create span to insert
      const location = []
      if (j === 0) location.push('first')
      if (j > 0 && j < matchIndices.length - 1) location.push('middle')
      if (j === matchIndices.length - 1) location.push('last')
      var span = tagCreator({
        content: match.textContent,
        cssClass,
        tagID,
        concept,
        location
      })
      // remove old term phrase
      textNode.parentNode.removeChild(match)
      // insert new marked up phrase
      textNode.parentNode.insertBefore(span, newTextNode)

      // in case of sevral terms to be inserted
      // Store new start location for next term.
      nextNode = newTextNode
    }
  }
}

const termerTagAttributeName = 'data-termer-tag-id'
const termerTagName = 'termer-tag'
// Create an event handler which adds or removes a class from the event target.
function modifyClass ({ classListMethod, cssClass }) {
  return function (evt) {
    const id = evt.target.attributes[termerTagAttributeName].value
    const tagSet = document.querySelectorAll(
      `${termerTagName}[${termerTagAttributeName}="${id}"]`
    )
    tagSet.forEach(el => {
      el.classList[classListMethod](cssClass)
    })
  }
}

const blurHandler = modifyClass({ classListMethod: 'remove', cssClass: 'termer-focus' })
const focusHandler = modifyClass({ classListMethod: 'add', cssClass: 'termer-focus' })
const hoverHandler = modifyClass({ classListMethod: 'add', cssClass: 'termer-hover' })
const unhoverHandler = modifyClass({ classListMethod: 'remove', cssClass: 'termer-hover' })

function moveFocus (evt) {
  // move focus to the main element in the tag.
  const id = evt.target.attributes[termerTagAttributeName].value
  const mainElement = document.querySelector(
    `${termerTagName}[tabindex][${termerTagAttributeName}="${id}"]`
  )
  if (!mainElement || mainElement === evt.target) return
  // stops focus from being moved again due to the original event.
  evt.preventDefault()
  mainElement.focus()
}

// Function to create tingtun markup span element
const template = document.createElement('div')
function createMarkup (
  { content, cssClass, tagID, concept, location }
) {
  // content: text to wrap
  // cssClass: additional CSS class to apply
  // tagID: ID for a set of elements that form a tag
  // concept: full text of the concept
  // location: list of one or more of 'first', 'middle', 'last'; indicates
  // position of this element among the tags that form one highlight.
  const classes = ['tingtun_label'].concat(cssClass || [])
  for (const loc of location) {
    classes.push(`termer-${loc}`)
  }

  const name = 'tingtun_glossary_label'
  const title = __('Description of concept')
  // ID for aria-describedby (seems to not be in use).
  // const describedbyId = 'tingtun_hidden_defenition'

  // TODO is <template> not supported in IE11??
  const first = location.indexOf('first') > -1
  if (first) {
    template.innerHTML = `<${termerTagName}
      aria-label="${concept}"
      class="${classes.join(' ')}"
      ${termerTagAttributeName}="${tagID}"
      name="${name}"
      role="link"
      tabindex="0"
      title="${title}">${content}</${termerTagName}>`
  } else {
    template.innerHTML = `<${termerTagName}
      aria-hidden="true"
      class="${classes.join(' ')}"
      ${termerTagAttributeName}="${tagID}"
      name="${name}"
      title="${title}">${content}</${termerTagName}>`
  }
  const el = template.firstChild
  el.addEventListener('focus', focusHandler)
  el.addEventListener('blur', blurHandler)
  // 'mouse{over,out}' events are supposedly better performance-wise than
  // mouseenter.
  el.addEventListener('mouseover', hoverHandler)
  el.addEventListener('mouseout', unhoverHandler)
  if (!first) {
    el.addEventListener('mousedown', moveFocus)
  }
  return el
}

/*
 * @return an array where even indices (0, 2, 4, …) indicate start of word
 *   strings, while odd indices indicate start of word separators (spaces,
 *   punctuation).

Example:
string:  aa  bb ...
representation:
[[WORD, 0]
,[SPACE, 2]
,[WORD, 4]
,[SPACE, 6]
,[OTHER, 7],
,[END, 10]
]
 */
export const MatchType = makeEnum([
  'WORD',
  'OTHER',
  'OTHER_OPTIONAL',
  'SPACE',
  'END'
])

function makeEnum (arr) {
  return Object.freeze(
    arr.reduce((acc, key) => {
      acc[key] = Symbol.for(key)
      return acc
    }, {})
  )
}

const wordBoundaryRegex = /((?:(?:[0-9]+)|[\p{Letter}0-9'’´])+)|(\s+)|([“”])|($)|(\(|\)|[^0-9\p{Letter}'’´\s$]+)/igu
export function findBoundaries (str) {
  const boundaryIndices = []
  for (const result of str.matchAll(wordBoundaryRegex)) {
    const index = result.index
    let type
    if (typeof result[1] !== 'undefined') {
      // Group 1
      // Matches a word
      type = MatchType.WORD
    } else if (typeof result[2] !== 'undefined') {
      // Group 2
      // Matches whitespace
      type = MatchType.SPACE
    } else if (typeof result[3] !== 'undefined') {
      // Group 3
      // Matches optional characters
      type = MatchType.OTHER_OPTIONAL
    } else if (typeof result[4] !== 'undefined') {
      // Group 4
      // Matches end of string
      type = MatchType.END
    } else {
      // Group 5
      // Matches anything not in the other groups.
      type = MatchType.OTHER
    }
    boundaryIndices.push({ type, stringIndex: index })
  }
  return boundaryIndices
}

export function findBoundariesMulti (strings) {
  return strings.map(findBoundaries)
}

export class TextLengthTracker {
  constructor () {
    this.previousType = null
    this.previousIndex = 0
    this.previousStringIndex = null
  }

  addTextLength (wordBoundary) {
    const { type, stringIndex } = wordBoundary
    let index
    if (this.previousType === MatchType.SPACE) {
      // spaces collapse to length = 1
      if (type === MatchType.SPACE) {
        // space followed by space -- add no length
        index = this.previousIndex
      } else {
        // space followed by something else -- add 1 length for all the space
        index = this.previousIndex + 1
      }
    } else if (this.previousType === MatchType.OTHER_OPTIONAL) {
      // optional has 0 length
      index = this.previousIndex
    } else if (this.previousType === MatchType.END) {
      // end has 0 length
      index = this.previousIndex
    } else {
      index = this.previousIndex + stringIndex - this.previousStringIndex
    }

    // skip END after SPACE
    if (!(this.previousType === MatchType.SPACE && type === MatchType.END)) {
      this.previousType = type
      this.previousStringIndex = stringIndex
      this.previousIndex = index
    }
    wordBoundary.textIndex = index
    return wordBoundary
  }
}

export function getMaxTextLength (boundaryWindow) {
  const endIndex1 = boundaryWindow.length - 1
  const endIndex2 = boundaryWindow[endIndex1].length - 1
  return getTextLength(boundaryWindow, [0, 0], [endIndex1, endIndex2])
}

export function getTextLength (boundaryWindow, startIdx, endIdx) {
  const start = boundaryWindow[startIdx[0]][startIdx[1]].textIndex
  const end = boundaryWindow[endIdx[0]][endIdx[1]].textIndex
  return end - start
}

function getSubstring (strings, possibleMatch) {
  return possibleMatch.map((span, i) => {
    const string = strings[i]
    const start = span[0]
    const end = span[span.length - 1]
    const substring = string.substring(start, end)
    return substring
  }).join('')
}

/*
 * Returns true if line segment A overlaps line segment B.
 *  A     B
 * ←——→ x——x   false
 * x——←—x——→   true (A right of B)
 * ←———x—→—x   true (A left of B)
 * x——←—→——x   true (A inside B)
 * ←——x—x——→   false  (A contains B) (N.B.)
 */
function overlap2D (startA, endA, startB, endB) {
  return (
    // inside
    startA >= startB &&
    endA <= endB
  ) || (
    // left
    startA < startB &&
    endA > startB &&
    endA <= endB
  ) || (
    // right
    endA > endB &&
    startA < endB &&
    startA >= startB
  )
}

export function* findPossibleMatches (
  wordLength, wordBoundaryIndices
) {
  let startIndex = 0
  const startIndexMax = wordBoundaryIndices[0].length - 1
  const endIndex = [0, startIndex + 1]
  const endIndexMax = [
    wordBoundaryIndices.length - 1,
    wordBoundaryIndices[wordBoundaryIndices.length - 1].length - 1
  ]
  // eslint-disable-next-line no-labels
  loop1:
  while (
    (
      endIndex[0] < endIndexMax[0] || (
        endIndex[0] === endIndexMax[0] &&
        endIndex[1] <= endIndexMax[1]
      )
    ) &&
    startIndex < startIndexMax
  ) {
    // loop 1: move endPositionIndex forward until total length oversteps or
    // equals wordlength.
    while (true) {
      const minTextLength = getTextLength(wordBoundaryIndices, [0, startIndex], endIndex)
      if (!(
        (
          endIndex[0] < endIndexMax[0] ||
          endIndex[1] <= endIndexMax[1]
        ) &&
        minTextLength < wordLength
      )) {
        break
      }

      endIndex[1] += 1
      while (true) {
        const wordBoundary = wordBoundaryIndices[endIndex[0]][endIndex[1]]
        if (!wordBoundary) {
          endIndex[0] += 1
          endIndex[1] = 1
          if (endIndex[0] > endIndexMax[0]) return
        } else if (wordBoundary.type === MatchType.END) {
          const penultimateIndex = [endIndex[0], endIndex[1] - 1]
          if (penultimateIndex[1] === -1) {
            penultimateIndex[0]--
            penultimateIndex[1] =
              wordBoundaryIndices[penultimateIndex[0]].length - 1
          }
          const penultimateMatchType =
            wordBoundaryIndices[penultimateIndex[0]][penultimateIndex[1]].type
          if (penultimateMatchType === MatchType.SPACE) {
            // do not end at SPACE+END
            endIndex[1] += 1
          } else {
            break
          }
        } else if (wordBoundary.type === MatchType.WORD) {
          // do not end at WORD
          endIndex[1] += 1
        } else {
          break
        }
      }
    }

    // loop 2: move startPositionIndex forward until total length is less than
    // or equal to wordlength.
    while (true) {
      const maxTextLength = getTextLength(
        wordBoundaryIndices, [0, startIndex], endIndex
      )
      let wordBoundary = wordBoundaryIndices[0][startIndex]
      const validLength = maxTextLength <= wordLength
      const validStartType = wordBoundary.type === MatchType.WORD
      const notSameTypeTwice =
        wordBoundary !== wordBoundaryIndices[0][startIndex + 1]

      if (
        validLength &&
        validStartType &&
        notSameTypeTwice
      ) break

      startIndex += 1
      while (true) {
        if (endIndex[0] === 0 && startIndex >= endIndex[1]) {
          // startIndex >= endIndex, so continue moving endIndex forward
          // eslint-disable-next-line no-labels
          continue loop1
        }
        if (startIndex > startIndexMax) {
          // Reached maximum value, give up.
          return
        }
        wordBoundary = wordBoundaryIndices[0][startIndex]
        if (wordBoundary.type !== MatchType.WORD) {
          // move forward until we find a WORD
          startIndex += 1
        } else {
          break
        }
      }
    }

    // if total length === word length: yield list of tuples delineating the
    // spans.
    const length = getTextLength(wordBoundaryIndices, [0, startIndex], endIndex)
    if (length === wordLength) {
      let myWindow = wordBoundaryIndices
        .slice(0, endIndex[0] + 1)
      myWindow = myWindow.map((span, index) => {
        let myStartIndex = 0
        let myEndIndex = span.length - 1
        if (index === 0) {
          myStartIndex = startIndex
        }
        if (index === myWindow.length - 1) {
          myEndIndex = endIndex[1]
        }
        return [span[myStartIndex].stringIndex, span[myEndIndex].stringIndex]
      })
      yield myWindow
      // since we found a match, nudge end position a step forward
      endIndex[1] += 2
      const span = wordBoundaryIndices[endIndex[0]]
      if (!span || endIndex[1] >= span.length) {
        endIndex[0] += 1
        endIndex[1] = 1
      }
    }
  }
}

function checkForMatch (text, wordlist, matchRegistry) {
  const collapsedWhitespace = text
    .replace(/(\s)\s+/g, '$1')
    .replace(/\s“|”\s/g, ' ')
  const match = doTheCheck(collapsedWhitespace, wordlist, matchRegistry)
  if (match) return match
  const lowerCaseText = lowercaseFirstLetter(collapsedWhitespace)
  if (lowerCaseText !== text) {
    return doTheCheck(lowerCaseText, wordlist, matchRegistry)
  }
}

function doTheCheck (text, wordlist, matchRegistry) {
  if (!matchRegistry.has(text) && isInWordlist(text, wordlist)) {
    return text
  }
}

// Lowercase the first letter; does nothing if `s` is a falsy value.
// XXX need to make each letter of each word in stence lowercase.
function lowercaseFirstLetter (s) {
  if (!s) return s
  const splitSentence = s.split(' ')
  let rebuiltSentence = ''
  const lastIndex = splitSentence.length - 1
  for (var i = 0; i <= lastIndex; i++) {
    if (splitSentence[i]) {
      // For some locales, such as Turkish, we may want to use toLocaleLowerCase
      // in place of toLowerCase.
      rebuiltSentence += splitSentence[i][0].toLowerCase() + splitSentence[i].slice(1)
      if (i < lastIndex) rebuiltSentence += ' '
    } else {
      rebuiltSentence += ' '
    }
  }
  return rebuiltSentence
}

export class Registry {
  constructor (excluded) {
    this.set = new Set()
    this.excluded = new Set(excluded || [])
  }

  reset () {
    this.set = new Set()
  }

  has (x) {
    return this.set.has(x) || this.excluded.has(x)
  }

  add (x) {
    return this.set.add(x)
  }
}

export class NullRegistry extends Registry {
  reset () {}
  add () {}
}

export async function * nodeWindowGenerator (startNode, maxWindowLength, nodeAction) {
  let walker
  if (Array.isArray(startNode)) {
    walker = treeWalkerPDF(startNode, nodeAction)
  } else {
    walker = treeWalker(startNode, nodeAction)
  }
  const allNodes = laxIterable(walker, 16)

  const textNodes = []
  const strings = []
  const wordBoundaries = []
  let windowLength = 0
  const textLengthTracker = new TextLengthTracker()
  for await (const node of allNodes) {
    // rolling window of Nodes
    // when node is null, run window to its end and start a new one from the
    // value after null.
    if (!node) {
      while (textNodes.length) {
        yield {
          textNodes: textNodes.slice(),
          strings: strings.slice(),
          wordBoundaries: wordBoundaries.slice()
        }
        textNodes.shift()
        strings.shift()
        wordBoundaries.shift()
      }
      windowLength = 0
    } else {
      textNodes.push(node)
      strings.push(node.data)
      const boundaries = findBoundaries(node.data)
      wordBoundaries.push(boundaries.map(x => textLengthTracker.addTextLength(x)))
      windowLength += node.length
      if (windowLength >= maxWindowLength) {
        yield {
          textNodes: textNodes.slice(),
          strings: strings.slice(),
          wordBoundaries: wordBoundaries.slice()
        }
        const removedNode = textNodes.shift()
        strings.shift()
        wordBoundaries.shift()
        // XXX Use real text length here now that wordBoundaries is available?
        windowLength -= removedNode.length
      }
    }
  }
}

function * treeWalkerPDF (nodes) {
  for (const node of nodes) {
    let textNodes
    if (node.childNodes.length === 0) {
      // special case: an empty <span></span> is a space between words.
      textNodes = [document.createTextNode(' ')]
    } else {
      textNodes = Array.from(node.childNodes).filter(x => x.nodeType === Node.TEXT_NODE)
    }
    for (const textNode of textNodes) yield textNode
  }
  // Final `null` to indicate end of contents.
  yield null
}

// yield all text nodes, in order.
// when encountering stop conditions, like the end of a block element such as <p>,
// emit a null value so we can know to not try matching across the boundary.
function treeWalker (startNode, nodeAction) {
  function acceptNode (node) {
    if (!node) return NodeFilter.FILTER_REJECT
    // accept h*, but reject contents of h*
    // accept excluded nodes, but reject contents
    const selector = node =>
      isHeading(node) || isExcludedElement(node)
    if (isContainedIn(selector, node)) {
      return NodeFilter.FILTER_REJECT
    }
    return NodeFilter.FILTER_ACCEPT
  }

  function * filter (node) {
    // nodeAction(node)
    if (node.nodeType === 1) { // HTMLElement
      if (isExcludedElement(node)) {
        // End of block because of start of excluded element
        yield null
      } else if (isBlockLevelElement(node)) {
        // New block-level element starting
        yield null
      }
      // Return here; do not yield elements.
    } else {
      yield node
    }
    // perform custom action after having visited the node.
    nodeAction(node)
  }

  return getTextNodes(startNode, acceptNode, filter)
}

function * getTextNodes (startNode, acceptNode, filter) {
  const treeWalker = document.createTreeWalker(
    startNode,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    acceptNode,
    false
  )
  while (treeWalker.nextNode()) {
    yield * filter(treeWalker.currentNode)
  }
  // Final `null` for the end of the last block
  yield null
}

async function * laxIterable (iterable, interval) {
  let then = window.performance.now()
  for (const item of iterable) {
    yield item
    const now = window.performance.now()
    if (now - then >= interval) {
      // wait until after next animation frame
      then = await animationFramePromise()
    }
  }
}

function animationFramePromise () {
  return new Promise(window.requestAnimationFrame)
}
