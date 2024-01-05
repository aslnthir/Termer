import {
  Entry,
  Didyoumean
} from './model.js'
import logger from './logger.js'

import { LexinAPI } from './lexin-lookup.js'

const log = logger.log

const LexinLookupAPI = new LexinAPI()

export async function lookup(searchTerm, fromLanguage, toLanguage) {
  const results = await getEntries(searchTerm, fromLanguage, toLanguage)
  if (!results.results) {
    return await getLexinData(searchTerm, fromLanguage, toLanguage)
  } else {
    return await checkEnteries(results, searchTerm, fromLanguage, toLanguage)
  }
}

async function checkEnteries (results, searchTerm, fromLanguage, toLanguage) {
  const dateNow = new Date()
  let entries = []
  if ('results' in results) entries = results['results']
  let deleteItems = false
  for (const entry of entries) {
    const dateEntry = Date.parse(entry.createdAt)
    // If its older then 30 days, then delete entry and fetch new
    if (dateNow - dateEntry > 2592000000) {
      deleteItems = true
      break
    }
  }
  if (deleteItems) {
    for (const entry of entries) {
      await deleteEntry(entry)
    }
    return await getLexinData(searchTerm, fromLanguage, toLanguage)
  } else return results
}

async function getLexinData (searchTerm, fromLanguage, toLanguage) {
  const params = {
    fromLanguage: fromLanguage,
    toLanguage: toLanguage
  }
  const search = LexinLookupAPI.termSearch(searchTerm, params)
  let didyoumean = []
  for await (const result of search) {
    for (const item of result.results) {
      await Entry.insertMany(item)
    }
    didyoumean = didyoumean.concat(result.didyoumean)
      .filter(x => x.toLowerCase() !== searchTerm.toLowerCase())
  }

  await makeDidyoumean(searchTerm, fromLanguage, toLanguage, didyoumean)

  const results = await getEntries(searchTerm, fromLanguage, toLanguage)
  if (!results.results || !results.results.length) return { didyoumean }
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
      wordlist: { '$addToSet': '$term' }
  }}])
  return words[0]
}

export async function getSourcelist () {
  const sources = await LexinLookupAPI.getSourceList()
  return sources
}
