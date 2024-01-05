import {
  Entry,
  Didyoumean
} from './model.js'
import logger from './logger.js'

import { LookupAPIClass } from './lookup.js'

const log = logger.log

const LookupAPI = new LookupAPIClass()

export async function storeEntries() {
  await Entry.deleteMany({})
  const items = await LookupAPI.getEntries()
  for (const [key, value] of Object.entries(items)) {
    for (const entryItem of value) {
      const entry = {
        lexeme: {
          id: entryItem.id,
          foundIn: "1",
          glossaryId: "1",
          language: 'nb',
          forms: [entryItem.name.toLowerCase().trim()],
          lemmas: [entryItem.name.toLowerCase().trim()]
        },
        definitions: [],
        id: entryItem.id,
        sourceId: "1",
        glossaryId: "1"
      }
      for (const defObj of entryItem.definitions) {
        const definition = {
          id: defObj.definitionId,
          gloss: defObj.description,
          language: 'nb',
          sourceId: "1",
          glossaryId: "1"
        }
        entry.definitions.push(definition)
      }
      Entry.insertMany(entry)
    }
  }
}

export async function lookup(searchTerm, fromLanguage, toLanguage) {
  const results = await getEntries(searchTerm, fromLanguage, toLanguage)
  if (!results.results) {
    return []
  }
  return results
}

async function makeDidyoumean (term, fromLang, toLang, array) {
  const object = await Didyoumean.findOne({
    "searchTerm": term,
    "fromLanguage": fromLang,
    "toLanguage": toLang
  })
  if (object) {
    object.didyoumean = array
    await object.save()
  } else {
    await Didyoumean.insertMany([{
      "searchTerm": term,
      "fromLanguage": fromLang,
      "toLanguage": toLang,
      "didyoumean": array
    }])
  }
}

async function deleteEntry (entry) {
  await Entry.deleteOne(
    { _id: entry._id }
  )
}

async function deleteDidyoumean (object) {
  await Didyoumean.deleteOne(
    { _id: object._id }
  )
}

async function getEntries (term, lexemeLanguage, definitionLanguage) {
  const array = [term]
  const didyoumean = await getDidyoumean(term, lexemeLanguage, definitionLanguage)
  const entries = await Entry.find({
    "lexeme.forms": { $all: array },
    "lexeme.language": lexemeLanguage,
    "definitions.language": definitionLanguage
  })
  if (entries.length === 0) {
    log('term not defined', term)
    return { didyoumean }
  }
  return { 'results': entries, didyoumean }
}

async function getDidyoumean (term, fromLangCode, toLangCode) {
  const didyoumean = await Didyoumean.findOne({
    "searchTerm": term,
    "fromLanguage": fromLangCode,
    "toLanguage": toLangCode
  })
  if (!didyoumean) {
    return null
  }
  return didyoumean.didyoumean
}

export async function getWordlist () {
  const words = await Entry.aggregate([{
    $group: {
      _id:1,
      wordlist: { '$addToSet': '$lexeme.forms' }
  }}])
  const wordlist = [ ...new Set(words[0].wordlist.flat()) ]
  return {wordlist}
}

export async function getSourcelist () {
  const sources = await LookupAPI.getSourceList()
  return sources
}
