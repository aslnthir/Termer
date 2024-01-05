/*
 * Vertraulich
 */

// possible comment out
const lang = getDetectedLanguage()

let messages = {}

try {
  if (lang === 'nb') {
    messages = require('../static/locale/nb/messages.json')
  } else if (lang === 'de') {
    messages = require('../static/locale/de/messages.json')
  }
} catch (err) {
  // This may throw an exception if <lang>/messages.json does not exist.
}

export function __ (t) {
  return messages[t] || t
}

function getDetectedLanguage () {
  const detectedLanguage = (
    (
      navigator.languages &&
      navigator.languages.length &&
      navigator.languages[0]
    ) ||
    navigator.language ||
    navigator.userLanguage ||
    'en'
  ).split('-')[0].split('_')[0]
  return detectedLanguage
}
