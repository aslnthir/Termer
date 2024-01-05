// Download page from sprakradet glossary

import logger from './logger.js'
import scrapeSorakradetDataList from './utils/scrapeSprakradetDataList.js'

const log = logger.log

export async function * scrape (lastGlossId) {
  const SprakradetdataUrl = 'https://www.sprakradet.no/Sprakarbeid/Terminologi/datatermliste/'
  for await (const documents of scrapeSorakradetDataList(SprakradetdataUrl, lastGlossId)) {
    // log('documents', documents)
    yield documents //handleDocumentList(documents)
  }
}

export function handleDocumentList (collection) {

  /*
  const result = {}
  for (const { documentId, name } of collection) {
    if (!(documentId in result)) {
      result[documentId] = new Set()
    }
    result[documentId].add(name)
  }

  const uniqueNames = Object.values(result).map(x => x.size).reduce(
    (total, x) => total + x,
    0
  )
  const uniqueIdCount = Object.keys(result).length

  log('found entries:', collection.length)
  log('found unique names:', uniqueNames)
  log('found unique IDs:', uniqueIdCount)
  */
  return result
}
