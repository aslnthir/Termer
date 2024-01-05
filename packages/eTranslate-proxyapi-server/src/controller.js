import {
  Entry,
  Glossary,
  Source
} from './model.js'
import logger from './logger.js'

import { API } from './eTranslate-lookup.js'

const log = logger.log

/*
let requestNumber = 0
const requestMax = 20
setInterval(() => {
  log('reset requestNumber', requestNumber)
  requestNumber = 0
}, 3600000)
*/

const LookupAPI = new API()

export async function lookup(searchTerm, glossaryId) {
  const results = await getEntries(searchTerm, glossaryId)
  if (!results.results.length) {
    return await getData(searchTerm, glossaryId)
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
    return await getData(searchTerm, source)
  } else return removeDupilcates(results)
}

/*
* Remove duplucates of result list
*/
function removeDupilcates (results) {
  const checkList = [...results['results']]
  const newList = []
  for (const entry of results['results']) {
    let gotEntry = false
    for (const newEntry of newList) {
      if (arraysEqual(newEntry['lexeme']['forms'], entry['lexeme']['forms'])) {
        if (allDefsCheck(newEntry['definitions'], entry['definitions'])) {
          gotEntry = true
        }
      }
    }
    if (!gotEntry) {
      newList.push(entry)
    }
  }
  results['results'] = newList
  return results
}

/*
* Checks if two definiton list are the same list
*/
function allDefsCheck (defListA, defListB) {
  return defListA.filter(x => {
    return defListB.filter(y => {
      return y['gloss'] === x['gloss']
    }).length === 0
  })
}

/*
* Checks if two definitoons are the same
*/
function duplucateDefinitions (definitionA, definitionB) {
  return definitionA['gloss'] === definitionB['gloss']
}

/*
* Checks if two arrsys are the same
*/
function arraysEqual(array1, array2) {
  const set1 = new Set(array1)
  const set2 = new Set(array2)
  return symmetricDifference(set1, set2)
}

/*
* Finds what two sets are diffrent from each other and makes a new set of
* those elements.
*/
function symmetricDifference(setA, setB) {
    let _difference = new Set(setA)
    for (let elem of setB) {
        if (_difference.has(elem)) {
            _difference.delete(elem)
        } else {
            _difference.add(elem)
        }
    }
    return _difference
}

async function getData (searchTerm, glossaryId) {
  /*
  if (requestNumber > requestMax){
    return {
      'results': [],
      'message': 'Max hour request to eTranslate filled'
    }
  }
  */
  // let glossary
  let source
  let glossary
  try {
    // glossary = await Glossary.findOne({ _id: glossaryId })
    glossary = await Glossary.findOne({
      _id: glossaryId
    })
  } catch (e) {
    return []
  }

  if (!glossary) return []
  const params = {
    'glossary': glossary
  }
  // requestNumber += 1
  const search = await LookupAPI.termSearch(searchTerm, params)
  return search

  // await Entry.insertMany(search.results)

  // const results = await getEntries(searchTerm, glossaryId)
  // return results
}

export async function storeEntry(data) {
  const reqData = LookupAPI.getRequestData(data['request-id'])
  if (!reqData) {
    return
  }
  const glossary = await Glossary.findOne({
    _id: reqData.glossary
  })
  /*
  lexeme: {
    language: String,
    forms: [String],
    lemmas: [String],
    searchForms: [String]
  },
  definitions: [{
    gloss: String,
    language: String,
    lastEditTime: String
  }],
  glossary: {type: mongoose.Schema.Types.ObjectId, ref: 'Glossary'},
  id: Number,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
  */
  const _def = {
    gloss: data['translated-text'].trim(),
    language: glossary.targetLanguage
  }
  if (reqData.term.split(' ').length < 2) {
    _def.note = 'Please note that machine translation of just one word can ' +
    'be misleading, since the translation returns just one result and one ' +
    'word can have many meanings'
  }
  const newEntry = {
    lexeme: {
      language: glossary.sourceLanguage,
      forms: [reqData.term],
      lemmas: [reqData.term]
    },
    definitions: [_def],
    glossary: reqData.glossary
  }

  const entryValue = await Entry.insertMany([newEntry])
  const entry = await getEntries(reqData.term, glossary._id)
  LookupAPI.resolvePromise(data['request-id'], entry)
}

async function deleteEntry (entry) {
  await Entry.deleteOne(
    { _id: entry._id }
  )
}

async function getEntries (term, glossaryId) {
  const array = [term]

  const entries = await Entry.find({
    "lexeme.forms": { $all: array },
    "glossary": glossaryId
  })
  if (entries.length === 0) {
    log('term not defined', term)
  }
  return { 'results': entries }
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
  let sources = await Source.find({})
  if (sources.length === 0) {
    await createSources()
  }

  while (sources.length === 0) {
    sources = await Source.find({})
  }

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
  const SourceObject = await Source.findOne({
    name: 'eTranslation'
  })
  if (!SourceObject) {
    createSource()
  }
}

async function createSource () {
  const response = await createGlossaries()
  const SourceObject = {
    url: "https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eTranslation",
    name: "eTranslation",
    displayname: "eTranslation - Machine translations",
    description: 'This translation is generated by eTranslation, a machine ' +
    'translation tool provided by the European Commission. Machine ' +
    'translation can give you a basic idea of the content in a language you ' +
    'understand. It is fully automated and involves no human intervention. ' +
    'The quality and accuracy of machine translation can vary significantly ' +
    'from one text to another and between different language pairs. The ' +
    'European Commission does not guarantee the accuracy and accepts no ' +
    'liability for possible errors. Some content (such as images, videos, ' +
    'files, etc.) may not be translated due to the technical limitations of ' +
    'the system. \n' +
    'Don’t use eTranslation to translate EU legislation. Authentic versions ' +
    'in the 24 official languages are available on Eur-Lex. See also the ' +
    'Europa language policy and legal notice (includes privacy policy and ' +
    'copyright notice). \n' +
    'Currently we cannot link to this text since it is provided only behind ' +
    'a login. https://webgate.ec.europa.eu/etranslation/statement.html',
    contactEmail: "contact@tingtun.no",
    inputLanguages: response.langCombos
  }


  const SourceObj = new Source(SourceObject)
  SourceObj.glossaries.push(...response.glossaries)
  SourceObj.save()
}

async function createGlossaries () {
  const languages = await LookupAPI.getLanguages()
  const glossaries = []
  const langCombos = {}
  for (const language of languages.GEN.languagePairs) {
    // 'AR-BG'
    const langPair = language.toLowerCase().split('-')
    if (!(langPair[0] in langCombos)) langCombos[langPair[0]] = []
    langCombos[langPair[0]].push(langPair[1])
    const GlossaryObject = {
      name: "eTranslation",
      displayname: "eTranslation",
      sourceLanguage: langPair[0],
      targetLanguage: langPair[1],
    }
    const GlossryObj = new Glossary(GlossaryObject)
    GlossryObj.save()
    glossaries.push(GlossryObj)
  }
  return { glossaries, langCombos }
}
