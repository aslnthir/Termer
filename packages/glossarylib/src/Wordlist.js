/*
 * Vertraulich
 */

export default function createWordlist (words) {
  const wordsByLength = []
  for (let i = 0; i < words.length; i++) {
    const trimmed = words[i].trim()
    const ws = wordsByLength[trimmed.length]
    if (ws) {
      ws.push(trimmed)
    } else {
      wordsByLength[trimmed.length] = [trimmed]
    }
  }

  for (let j = 0; j < wordsByLength.length; j++) {
    if (wordsByLength[j]) {
      wordsByLength[j] = wordsByLength[j].sort().join('')
    }
  }
  return wordsByLength
}

export function isInWordlist (word, wordlist) {
  const [isPresent] = find(word, wordlist)
  return isPresent
}
// Binary search in string.
// Algorithm from http://ejohn.org/blog/revised-javascript-dictionary-search/#postcomment.
function find (word, wordlist) {
  const wordLength = word.length // l
  const xs = wordlist[wordLength] // dict[l]
  if (!xs) return [false, -1] // not in our wordlist

  const numWords = xs.length / wordLength
  let low = 0
  let high = numWords - 1

  while (true) {
    const mid = Math.floor((low + high) / 2)
    const found = xs.substr(wordLength * mid, wordLength)
    if (word === found) {
      return [true, mid]
    }

    if (word < found) {
      high = mid - 1
    } else {
      low = mid + 1
    }

    if (high < low) {
      // Nothing was found.
      // Low is the position where the word should have been.
      return [false, low]
    }
  }
}

export function insertInWordlist (word, wordlist) {
  const len = word.length
  let [isPresent, pos] = find(word, wordlist)
  if (isPresent) return

  if (pos === -1) {
    wordlist[len] = ''
    pos = 0
  }

  const offset = pos * len
  const words = wordlist[len]

  const start = words.slice(0, offset)
  const end = words.slice(offset, words.length)

  const newWords = start + word + end
  wordlist[len] = newWords
}
