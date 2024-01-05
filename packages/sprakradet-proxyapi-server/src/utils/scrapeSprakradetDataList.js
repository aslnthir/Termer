import getHTMLDocument from './getHTMLDocument.js'
import logger from '../logger.js'
import {
  Glossary,
  Entry
} from '../model.js'

const re = /\/home\/glossary\/html\/act(\d*)a.en/i
const log = logger.log
let definitionIdTracler = 0

const MAX_FILE_AGE_SECONDS =
  60 * // seconds
  60 * // minutes
  24 * // hours
  30 // days

async function getGlossaries (pageUrl) {
  const document = await getHTMLDocument(pageUrl, MAX_FILE_AGE_SECONDS)
  const glossary = {
    url: pageUrl,
    name: 'Datatermar'
  }
  let db_glossaries = await Glossary.find({
    'url': pageUrl
  })

  if (db_glossaries.length === 0) {
    const languages = [
      {
        from: 'nb',
        to: 'nb'
      },
      {
        from: 'ny',
        to: 'nb'
      },
      {
        from: 'nb',
        to: 'ny'
      },
      {
        from: 'nb',
        to: 'en'
      },
      {
        from: 'en',
        to: 'nb'
      },
      {
        from: 'en',
        to: 'ny'
      },
      {
        from: 'ny',
        to: 'en'
      }
    ]
    for (var i = 0; i < languages.length; i++) {
      const item = languages[i]
      glossary.fromLanguage = item.from
      glossary.toLanguage = item.to
      await Glossary.create(glossary)
    }
    db_glossaries = await Glossary.find({
      'url': pageUrl
    })
  }

  return db_glossaries
}

// Yields: arrays of tuples [documentId, name], one for each page
export default async function * scrapeSorakradetDataList (url) {
  const glossaries = await getGlossaries(url)

  yield scrapeDefinitions(glossaries)
}

async function scrapeDefinitions (glossaries) {
  const document = await getHTMLDocument(glossaries[0].url, MAX_FILE_AGE_SECONDS)

  const newDefs = await getDefinitionsFromPage(document)
  const defNumber = saveDefinitions(newDefs, glossaries)

  return defNumber
}

function convertToDefinition (defData, glossary) {
  if (glossary.toLanguage === 'en') {
    return {
      gloss: defData.en.join(', ')
    }
  } else if (glossary.toLanguage === 'ny') {
    let termStr = defData.ny.terms.join(', ')

    if ('kortform' in defData.ny) {
      termStr += ', ' + defData.ny.kortform.join(', ')
    }
    if ('synonym' in defData.ny) {
      termStr += ', ' + defData.ny.synonym.join(', ')
    }
    return {
      gloss: termStr
    }
  } else {
    if (glossary.fromLanguage === 'nb') {
      return {
        gloss: defData.def
      }
    } else {
      let termStr = defData.nb.terms.join(', ')
      if ('kortform' in defData.nb) {
        termStr += ', ' + defData.nb.kortform.join(', ')
      }
      if ('synonym' in defData.nb) {
        termStr += ', ' + defData.nb.synonym.join(', ')
      }
      return {
        gloss: termStr + ': ' + defData.def
      }
    }
  }
}

function addForms (newDef, defData, glossary) {
  if (glossary.fromLanguage === 'en') {
    newDef.lemmas = defData.en
    newDef.forms = defData.en
  } else if (glossary.fromLanguage === 'ny') {
    newDef.lemmas = defData.ny.terms
    newDef.forms = defData.ny.terms
    if ('kortform' in defData.ny) {
      newDef.forms = newDef.forms.concat(defData.ny.kortform)
    }
    if ('synonym' in defData.ny) {
      newDef.forms = newDef.forms.concat(defData.ny.synonym)
    }
  } else {
    newDef.lemmas = defData.nb.terms
    newDef.forms = defData.nb.terms
    if ('kortform' in defData.nb) {
      newDef.forms = newDef.forms.concat(defData.nb.kortform)
    }
    if ('synonym' in defData.nb) {
      newDef.forms = newDef.forms.concat(defData.nb.synonym)
    }
  }
  return newDef
}

async function saveDefinitions (definitions, glossaries) {
  let newDefs = 0
  definitionIdTracler = 0
  for (const glossary of glossaries) {
    for (const defData of definitions) {
      let newDef = convertToDefinition(defData, glossary)
      newDef.id = definitionIdTracler.toString()
      const definition = {
        gloss: newDef.gloss,
        id: definitionIdTracler.toString()
      }
      const entry = await Entry.findOne({
        "id": defData.id,
        'foundIn': glossary._id,
        'definitions.gloss': newDef.gloss
      })
      if (entry) {
        let gotDef = false
        for (const _def of entry.definitions) {
          if (_def.gloss === definition.gloss) {
            gotDef = true
            if (_def.id !== newDef.id) {
              _def.id = newDef.id
              entry.save()
            }
            break
          }
        }
        if (!gotDef) {
          // log('add new def?', entry.lexeme)
          definition.id = newDef.id
          entry.definitions.push(definition)
          entry.save()
          definitionIdTracler += 1
        }
      } else {
        newDef = addForms(newDef, defData, glossary)
        definition.id = newDef.id
        const newEntry = {
          lexeme: {
            id: newDef.id,
            forms: newDef.forms,
            lemmas: newDef.lemmas
          },
          id: defData.id,
          definitions: [definition],
          langaugeLexeme: glossary.fromLanguage,
          langaugeDefinitions: glossary.toLanguage,
          foundIn: glossary._id,
        }
        Entry.create(newEntry)
        definitionIdTracler += 1
        newDefs += 1
      }
    }
  }
  console.log('newDefs', newDefs)
  return newDefs
}

function _termStringFix (string) {
  const removeList = [
    'verb',
    'substantiv'
  ]
  const splitTerms = string.split(',').filter(x => x !== '')
    .map(x => {
      if (x.includes(' (')) {
        const _s = x.split(' (')
        return _s.map(y => y.replace(')', ''))
      } else if (x.includes('(')) {
        const _s = x.split('(')
        const base = _s[0]
        const end = _s[1].replace(')', '')
        return [base, base + end]
      } else {
        return x
      }
    })
    .flat()
    .filter(x => !removeList.includes(x))
    .map(x => x.trim())
    .map(x => x.toLowerCase())
  return splitTerms
}

async function getDefinitionsFromPage (document) {
  const definitionNodes = document.querySelectorAll('td')
  const allDefs = []
  const specialCases = []
  let defId = 0
  for (const node of definitionNodes) {
    let newDefinition = {}
    const pNodes = node.querySelectorAll('p')
    if (pNodes.length < 1) continue
    if (pNodes.length === 1) {
      specialCases.push(pNodes)
      continue
    }
    if (pNodes.length === 2) {
      specialCases.push(pNodes)
      continue
    }
    const string = node.textContent
    let split = string.trim().split('\n').join()
    if (split.includes('Nynorsk:')) {
      split = split.replace('Nynorsk', 'nynorsk').replace('Engelsk', 'engelsk')
    }

    const noLemmas = split.split('engelsk:')[0].split('nynorsk:')
    const nbLemmas = noLemmas[0].split('frarådet term:')[0].replace('Bokmål:', '').replace('bokmål:', '').trim()
    const nyLemmas = noLemmas[1].split('frårådd term:')[0].trim()
    const enLemmas = _termStringFix(split.split('Definisjon/forklaring')[0].split('engelsk:')[1].trim())
    const noDef = split.split(',Kommentar')[0].split('Definisjon/forklaring')[1].trim()
    let noKomentar
    if (split.includes(',Kommentar')) {
      noKomentar = split.split(',Kommentar')[1].trim()
    }

    const nbTerms = {}
    const nyTerms = {}

    try {
      if (nbLemmas.includes('kortform:')) {
        const kortSplit_nb = nbLemmas.split('kortform:')
        nbTerms.terms = _termStringFix(kortSplit_nb[0])
        nbTerms.kortform = _termStringFix(kortSplit_nb[1])
        if (kortSplit_nb[1].includes('synonym:')) {
          const _splitData = kortSplit_nb[1].split('synonym:')
          nbTerms.kortform = _termStringFix(_splitData[0])
          nbTerms.synonym = _termStringFix(_splitData[1])

        }
      } else if (nbLemmas.includes('synonym:')) {
        const synSplit_nb = nbLemmas.split('synonym:')
        nbTerms.terms = _termStringFix(synSplit_nb[0])
        nbTerms.synonym = _termStringFix(synSplit_nb[1])
      } else if (nbLemmas.includes('forkortelse:')) {
        const kortSplit_nb = nbLemmas.split('forkortelse:')
        nbTerms.terms = _termStringFix(kortSplit_nb[0])
        nbTerms.kortform = _termStringFix(kortSplit_nb[1])
      } else {
        nbTerms.terms = _termStringFix(nbLemmas)
      }

      if (nyLemmas.includes('kortform:')) {
        const synSplit_ny = nyLemmas.split('kortform:')
        nyTerms.terms = _termStringFix(synSplit_ny[0])
        nyTerms.kortform = _termStringFix(synSplit_ny[1])
        if (synSplit_ny[1].includes('synonym:')) {
          const _splitData = synSplit_ny[1].split('synonym:')
          nyTerms.kortform = _termStringFix(_splitData[0])
          nyTerms.synonym = _termStringFix(_splitData[1])
        }
      } else if (nbLemmas.includes('synonym:')) {
        const synSplit_ny = nyLemmas.split('synonym:')
        nyTerms.terms = _termStringFix(synSplit_ny[0])
        nyTerms.kortform = _termStringFix(synSplit_ny[1])
      } else if (nyLemmas.includes('forkorting:')) {
        const synSplit_ny = nyLemmas.split('forkorting:')
        nyTerms.terms = _termStringFix(synSplit_ny[0])
        nyTerms.synonym = _termStringFix(synSplit_ny[1])
      } else {
        nyTerms.terms = _termStringFix(nyLemmas)
      }

    } catch (e) {
      console.log(e, nyLemmas, noLemmas)
    }
    if (nbTerms.terms[0] === 'bærbar datamaskin') {
      enLemmas.push('portable computer')
    }
    newDefinition.nb = nbTerms
    newDefinition.ny = nyTerms
    newDefinition.en = enLemmas //.split(',')
    newDefinition.def = noDef
    newDefinition.id = defId.toString()
    if (noKomentar) newDefinition.kommentar = noKomentar
    /*
    if (node.nodeName === 'DD') {
      newDefinition.gloss = node.textContent.trim()
      allDefs.push(newDefinition)
      newDefinition = {}
    } else if (node.nodeName === 'DT') {
      newDefinition.id = node.querySelector('div').id
      newDefinition.lemma = node.textContent.trim()
    }
    */
    defId += 1
    allDefs.push(newDefinition)
  }
  return allDefs
}
