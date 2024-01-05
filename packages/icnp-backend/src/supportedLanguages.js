export const supportedLanguages = {
  'en': 'English',
  'nb': 'Norwegian Bokmål',
  'sv': 'Swedish'
}

// mapping for poorly specified codes
const codeMapping = {
  nb: 'no'
}

export function getIcnpLanguageCode (code) {
  if (code in supportedLanguages) {
    const mappedCode = codeMapping[code] || code
    if (mappedCode in icnpAvailableLanguages) {
      return mappedCode
    }
  }
  return null
}

const icnpAvailableLanguages = {
  'pt-br': 'Brazilian Portuguese',
  'fr-ca': 'Canadian French',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'is': 'Icelandic',
  'ko': 'Korean',
  'no': 'Norwegian',
  'fa': 'Persian (Farsi)',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'zh-cn': 'Simple Chinese (Mandarin)',
  'es': 'Spanish',
  'sv': 'Swedish',
  'zh-tw': 'Traditional Chinese'
}
