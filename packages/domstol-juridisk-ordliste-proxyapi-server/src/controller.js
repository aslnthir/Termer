import {
  Entry
} from './model.js'
import logger from './logger.js'

const log = logger.log

export async function addScrapingResult (map) {
  const operations = []
  for (const [term, { id, definition } ] of Object.entries(map)) {
    const obj = {
      term,
      id,
      definition
    }
    operations.push({
      updateOne: {
        filter: obj,
        update: obj,
        upsert: true
      }
    })
  }
  const result = await Entry.bulkWrite(operations)
  log('new/changed entries:', result.upsertedCount)
}

export async function lookup(searchTerm) {
  const entry = await getEntry(searchTerm)
  if (!entry) return null
  const { definition, term, id } = entry
  const url = 'https://www.domstol.no/verktoy/juridisk-ordliste/'

  const result = {
    meaning: definition,
    lemmas: [term],
    id,
    url
  }

  return result
}


async function getEntry (term) {
  const entry = await Entry.findOne({ term: new RegExp(`^${term}$`, 'i')})
  if (!entry) {
    log('term not defined', term)
    return null
  }
  return entry
}

export async function getWordlist () {
  const words = await Entry.aggregate([{
    $group: {
      _id:1,
      wordlist: { '$addToSet': '$term' }
  }}])
  return words[0]
}
