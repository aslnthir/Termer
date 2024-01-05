// Download page from ECB glossary

import logger from './logger.js'
import scrapeECBdataList from './utils/scrapeECBdataList.js'

const log = logger.log

export async function * scrape (lastGlossId) {
  const ECBdataUrl = 'https://www.ecb.europa.eu/home/glossary/html/glossa.en.html'
  for await (const documents of scrapeECBdataList(ECBdataUrl, lastGlossId)) {
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
