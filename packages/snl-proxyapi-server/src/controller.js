import {
  Entry,
  Didyoumean,
  Glossary,
  Source
} from './model.js'
import logger from './logger.js'

import { SNLAPI } from './snl-lookup.js'

const log = logger.log

const SNLLookupAPI = new SNLAPI()

export async function lookup(searchTerm, glossaryId) {
  const results = await getEntries(searchTerm, glossaryId)
  if (!results.results) {
    return await getSNLData(searchTerm, glossaryId)
  } else {
    return await checkEnteries(results, searchTerm, glossaryId)
  }
}

async function checkEnteries (results, searchTerm, source) {
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
    return await getSNLData(searchTerm, source)
  } else return results
}

async function getSNLData (searchTerm, glossaryId) {
  // let glossary
  let source
  try {
    // glossary = await Glossary.findOne({ _id: glossaryId })
    source = await Source.findOne({
      glossaries: [glossaryId]
    })
  } catch (e) {
    return
  }
  if (!source) return
  const params = {
    'url': source.url,
    'glossary': glossaryId
  }
  const search = await SNLLookupAPI.termSearch(searchTerm, params)

  const didyoumean = search.didyoumean

  if (didyoumean.length) {
    await makeDidyoumean(searchTerm, source, didyoumean)
  }
  await Entry.insertMany(search.results)

  const results = await getEntries(searchTerm, glossaryId)
  if (!results.results || !results.results.length) return { didyoumean }
  return results

}

async function makeDidyoumean (term, source, array) {
  const object = await Didyoumean.findOne({
    "searchTerm": term
  })
  if (object) {
    object.didyoumean = array
    await object.save()
  } else {
    await Didyoumean.insertMany([{
      "searchTerm": term,
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

async function getEntries (term, glossaryId) {
  const array = [term]
  const didyoumean = await getDidyoumean(term, glossaryId)

  const entries = await Entry.find({
    "lexeme.searchForms": { $all: array },
    "glossary": glossaryId
  })
  if (entries.length === 0) {
    log('term not defined', term)
    return { didyoumean }
  }
  return { 'results': entries, didyoumean }
}

async function getDidyoumean (term, source) {
  const didyoumean = await Didyoumean.findOne({
    "searchTerm": term
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
  const sources = await Source.find({})
  for (const source of sources) {

    const glossaries = await Glossary.find()
      .where('_id')
      .in(source.glossaries)
      .exec()

    source.glossaries = glossaries
  }
  return sources
}

export async function createSources () {
  const snlSource = await Source.findOne({
    name: 'Store Norske Leksikon'
  })
  if (!snlSource) {
    createSNLSource()
  }
  const smlSource = await Source.findOne({
    name: "Store Medisinske Leksikon"
  })
  if (!smlSource) {
    createSMLSource()
  }
  const nblSource = await Source.findOne({
    name: "Norsk Biografisk Leksikon"
  })
  if (!nblSource) {
    createNBLSource()
  }
}

async function createSNLSource () {
  const snlGlossaryObject = {
    name: "Store Norske Leksikon",
    displayname: "SNL",
    sourceLanguage: "nb",
    targetLanguage: "nb",
  }
  const snlSourceObject = {
    url: "https://snl.no/",
    name: "Store Norske Leksikon",
    displayname: "Store norske leksikon (SNL)",
    contactEmail: "contact@tingtun.no",
    inputLanguages: {'nb': ['nb']}
  }

  const snlGlossry = new Glossary(snlGlossaryObject)
  snlGlossry.save()
  const snlSource = new Source(snlSourceObject)
  snlSource.glossaries.push(snlGlossry._id)
  snlSource.save()
}

async function createSMLSource () {
  const smlGlossaryObject = {
    name: "Store Medisinske Leksikon",
    displayname: "SML",
    sourceLanguage: "nb",
    targetLanguage: "nb",
  }
  const smlSourceObject = {
    url: "https://sml.snl.no/",
    name: "Store Medisinske Leksikon",
    displayname: "Store medisinske leksikon (SML)",
    contactEmail: "contact@tingtun.no",
    inputLanguages: {'nb': ['nb']}
  }
  const smlGlossry = new Glossary(smlGlossaryObject)
  smlGlossry.save()
  const smlSource = new Source(smlSourceObject)
  smlSource.glossaries.push(smlGlossry._id)
  smlSource.save()
}

async function createNBLSource () {
  const smlGlossaryObject = {
    name: "Norsk Biografisk Leksikon",
    displayname: "NBL",
    sourceLanguage: "nb",
    targetLanguage: "nb",
  }
  const smlSourceObject = {
    url: "https://nbl.snl.no/",
    name: "Norsk Biografisk Leksikon",
    displayname: "Norsk biografisk leksikon (NBL)",
    contactEmail: "contact@tingtun.no",
    inputLanguages: {'nb': ['nb']}
  }
  const smlGlossry = new Glossary(smlGlossaryObject)
  smlGlossry.save()
  const smlSource = new Source(smlSourceObject)
  smlSource.glossaries.push(smlGlossry._id)
  smlSource.save()
}
