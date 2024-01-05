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

async function getGlossaryListFromPage (pageUrl) {
  const document = await getHTMLDocument(pageUrl, MAX_FILE_AGE_SECONDS)
  const links = document.querySelectorAll('#ecb-content-col > main > div.ecb-boxPadding > a')
  const glossaries = []
  for (const link of links) {
    // log('new link?', link.href, link.text)
    // regex: https://www.ecb.europa.eu/home/glossary/html/act(\d*)a.en.html
    let number = null
    const regexResult = await re.exec(link.href)
    if (regexResult) {
      number = regexResult[1]
    }
    const glossary = {
      url: link.href,
      name: link.text.trim(),
      id: number
    }
    const db_glossary = await Glossary.findOne({
      'id': parseInt(number)
    })
    if (db_glossary) {
      db_glossary.url = link.href
      db_glossary.name = link.text.trim()
      db_glossary.save()
    } else {
      Glossary.create(glossary)
    }
    glossaries.push(glossary)
  }

  return { glossaries }
}

// Yields: arrays of tuples [documentId, name], one for each page
export default async function * scrapeECBdataList (listUrl) {
  const { glossaries } = await getGlossaryListFromPage(listUrl)
  // yield scrapeGlossries(glossaries[0])
  for (const glossary of glossaries) {
    // log('glossary to scrape', glossary)
    yield scrapeGlossries(glossary)
  }
}

async function scrapeGlossries (glossary) {
  let document = await getHTMLDocument(glossary.url, MAX_FILE_AGE_SECONDS)
  const links = document.querySelectorAll('#ecb-content-col > main > div.ecb-box > div > div > a')
  let newDefs = await getDefinitionsFromPage(document)
  let defNumber = saveDefinitions(newDefs, glossary)
  for (const nextLetterLink of links) {
    document = await getHTMLDocument(nextLetterLink.href, MAX_FILE_AGE_SECONDS)
    newDefs = await getDefinitionsFromPage(document)
    defNumber += saveDefinitions(newDefs, glossary)
  }
  return defNumber
}

async function saveDefinitions (definitions, glossary) {
  let newDefs = 0
  for (const newDef of definitions) {
    const definition = {
      gloss: newDef.gloss
    }
    const entry = await Entry.findOne({
      "lexeme.id": newDef.id,
      'foundIn': glossary.id
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
      definition.id = newDef.id
      const newEntry = {
        lexeme: {
          id: newDef.id,
          forms: [newDef.lemma],
          lemmas: [newDef.lemma]
        },
        definitions: [definition],
        langaugeLexeme: 'en',
        langaugeDefinitions: 'en',
        foundIn: glossary.id,
      }
      Entry.create(newEntry)
      definitionIdTracler += 1
      newDefs += 1
    }
  }
  return newDefs
}

async function getDefinitionsFromPage (document) {
  const definitions = document.querySelector('#ecb-content-col > main > div.ecb-faytdd > dl')
  const nodes = definitions.children
  const allDefs = []
  let newDefinition = {}
  for (const node of nodes) {
    if (node.nodeName === 'DD') {
      newDefinition.gloss = node.textContent.trim()
      allDefs.push(newDefinition)
      newDefinition = {}
    } else if (node.nodeName === 'DT') {
      newDefinition.id = node.querySelector('div').id
      newDefinition.lemma = node.textContent.trim()
    }
  }
  return allDefs
}
