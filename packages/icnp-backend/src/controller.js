import {
  Concept,
  Description,
  RequestLog
} from './model.js'
import logger from './logger.js'
import got from 'got'
import { supportedLanguages, getIcnpLanguageCode } from './supportedLanguages.js'

const log = logger.log

export async function updateConceptCollection () {
  for (const language of Object.keys(supportedLanguages)) {
    const icnpLanguageCode = getIcnpLanguageCode(language)
    const url = `https://neuronsong.com/_/_sites/icnp-browser/releases/2019/concept-list-${icnpLanguageCode}.json`
    const count = await RequestLog.countDocuments({ url })
    if (!count) {
      try {
        const document = await got(url).json()
        await RequestLog.create({ url })
        await addConceptList(document, icnpLanguageCode)
      } catch (error) {
        log('Error in getting concept list', error, url)
      }
    }
  }
}

async function addConceptList (list, language) {
  const operations = []
  for (const { c: conceptId, p: term, k: conceptName } of list) {
    const obj = {
      conceptId,
      conceptName,
      term,
      language
    }
    operations.push({
      updateOne: {
        filter: obj,
        update: obj,
        upsert: true
      }
    })
  }
  const result = await Concept.bulkWrite(operations)
  log('new/changed concepts:', result.upsertedCount)
}

export async function lookup(searchTerm, fromLanguage, toLanguage) {
  let entry
  if (toLanguage && fromLanguage !== toLanguage) {
    entry = await translate(...arguments)
  } else {
    entry = await getDescriptionByTerm(searchTerm, fromLanguage)
  }

  if (!entry) return null
  const { description, conceptId, term, examples } = entry
  const url = null // Linking to the JSON source is not user friendly.

  const result = {
    meaning: description,
    lemmas: [term],
    examples: examples,
    id: conceptId,
    url
  }
  return result
}

async function translate(term, fromLanguage, toLanguage) {
  const { conceptId } = (await getConcept(term, fromLanguage)) || {}
  if (!conceptId) return null
  const description = await getDescriptionById(conceptId, toLanguage)
  if (!description) return null
  return description
}

async function getConcept(term, language) {
  const query = { language, term: new RegExp(`^${term}$`, 'i')}
  const result = await Concept.findOne(query)
  return result
}

async function getDescriptionById (conceptId, language) {
  const query = { language, conceptId }
  let description = await Description.findOne(query)
  if (!description) {
    description = await getDescription(conceptId, language)
  }
  return description
}

async function getDescriptionByTerm (term, language) {
  const query = { language, term: new RegExp(`^${term}$`, 'i')}
  let description = await Description.findOne(query)
  if (!description) {
    const { conceptId } = await getConcept(term, language) || {}
    if (!conceptId) return null
    description = await getDescription(conceptId, language)
  }
  return description
}

async function getDescription(conceptId, language) {
  const url = `https://neuronsong.com/_/_sites/icnp-browser/releases/2019/concepts/${language}/${conceptId}.json`
  try {
    const r = await got(url).json()
    const examples = childerenText(r.children)
    let meaning = r.description
    if (!meaning && examples.length > 0) meaning = ' '
    const description = await Description.create({
      conceptId: r.code,
      language: language,
      description: meaning,
      examples: examples,
      term: r.preferred_term
    })
    return description
  } catch (error) {
    return null
  }
}

function childerenText (childeren) {
  const examples = []
  childeren.forEach((item, i) => {
    examples.push({
      id: item.code,
      text: item.term
    })
  })
  return examples
}

export async function getWordlist (language) {
  const words = await Concept
    .aggregate([{
      $match: { language },
    }, {
      $group: {
        _id: null,
        wordlist: { '$addToSet': '$term' }
      }
    }])
  return words[0]
}
