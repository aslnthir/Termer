import {
  HtmlDocument,
  LawExtract,
  LawName
} from './model.js'
import logger from './logger.js'
import got from 'got'
import { getLawReference, getRegulationsReference } from 'lovdata-law-reference-regex'
import { documentTTL } from './constants.js'
import { extract as extractor } from './lawExtractor.js'
import documentIdToInteger from './utils/documentIdToInteger.js'

const log = logger.log

export async function getMostRecentLawId () {
  return getMostRecentId({ $regex: /^\/NL\// })
}

export async function getMostRecentRegulationsId () {
  return getMostRecentId({ $regex: /^\/SF\// })
}

async function getMostRecentId (query) {
  const model = LawName
  const modelIds = await model.find({ lawId: query })
  const mostRecentLawName = findBy(
    x => documentIdToInteger(x.lawId),
    (a, b) => a > b,
    modelIds
  )
  return (mostRecentLawName || { lawId: null }).lawId
}

// Find an element in an array, by first applying transform() to each element,
// pairwise comparing the elements using compare(), and returing the item which
// comes out on top.
function findBy (transform, compare, arr) {
  const result = arr.reduce((accumulator, item) => {
    const value = transform(item)
    if (compare(value, accumulator.value)) {
      accumulator = { item, value }
    }
    return accumulator
  }, { item: null, value: -1 })
  return result.item
}

export async function addLawIds (map, sourceUrl = null) {
  function makeInstance (id, name) {
    return {
      lawName: name,
      lawId: id,
      source: sourceUrl
    }
  }
  await addModelInstances(LawName, map, makeInstance)
}

export async function addRegulationsIds (map, sourceUrl = null) {
  return addLawIds(map, sourceUrl)
}

export async function addModelInstances (model, map, makeInstance) {
  const operations = []
  for (const [key, values] of Object.entries(map)) {
    for (const value of values) {
      const obj = makeInstance(key, value)
      operations.push({
        updateOne: {
          filter: obj,
          update: obj,
          upsert: true
        }
      })
    }
  }
  const result = await model.bulkWrite(operations)
  log(`modified ${model.collection.collectionName}:`, result.upsertedCount)
}

export function getLawList () {
  const query = {
    lawId: { $regex: /^\/NL\// },
    status: { $ne: 404 }
  }
  return getList(query)
}

export function getRegulationsList () {
  const query = {
    lawId: { $regex: /^\/SF\// },
    status: { $ne: 404 }
  }
  return getList(query)
}

async function getList (query) {
  const result = (await LawName.find(query)).map(x => x.lawName)
  return result
}

export async function regulationsLookup (term) {
  const regulationsReference = getRegulationsReference(term)
  if (!regulationsReference) {
    log('invalid regulations reference', term)
    return null
  }

  const regulationsId = await getRegulationsId(regulationsReference, term)
  if (!regulationsId) {
    log('nonexistent regulations id', regulationsId)
    return null
  }
  return getExtractAsEntry(regulationsId, regulationsReference)
}

export async function lawLookup (term) {
  const lawReference = getLawReference(term)
  if (!lawReference) {
    log('invalid law reference', term)
    return null
  }
  const lawId = await getLawId(lawReference, term)
  if (!lawId) {
    log('nonexistent law id', lawId)
    return null
  }
  return getExtractAsEntry(lawId, lawReference, term)
}

async function getExtractAsEntry (lawId, lawReference, term) {
  const lawExtract = await getExtract(lawId, lawReference)
  if (!lawExtract) return null
  if (lawExtract.status === 404) {
    await LawName.updateMany({ lawId }, { status: 404 })
    log('missing extract:', term)
    return null
  }

  return generateLookupResult(lawExtract)
}

function generateLookupResult (extract) {
  log('generate result', extract)
  // const lemmas = new Set([search, title, shortTitle].filter(x => x))
  //   // set(filter(None, [search, title, short_title]))
  //   return {
  //       'meaning': meaning,
  //       'termurl': url,
  //       'lemmas': lemmas,
  //       'lexeme_external_id': law_id,
  //       'external_id': law_id
  //   }
  const id = generateId(extract)
  const url = generateUrl(extract)
  const result = {
    meaning: extract.extract,
    lemmas: [],
    id,
    url
  }
  if (extract.title) {
    result.lemmas.push(extract.title)
  }
  return result
}

function generateId ({ id, kapittel, paragraf, bokstav }) {
  return id + '-' +
    (kapittel || '') + '-' +
    (paragraf || '') + '-' +
    (bokstav || '')
}

function generateUrl ({ id, kapittel, paragraf, bokstav }) {
  let url = 'https://lovdata.no/dokument' + id
  if (paragraf) {
    url += '/§' + paragraf
  } else if (kapittel) {
    url += '/kap' + kapittel
  }
  return url
}

async function getRegulationsId (regulationsReference, searchString) {
  return getId(regulationsReference, /^\/SF\//, searchString)
}

async function getLawId (lawReference, searchString) {
  return getId(lawReference, /^\/NL\//, searchString)
}

async function getId (reference, lawIdRegex, searchString) {
  const name = reference.korttittel || reference.tittel
  const query = {
    lawName: [name, searchString],
    lawId: { $regex: lawIdRegex }
  }
  const lawName = await LawName.findOne(query)
  if (!lawName) {
    log('nonexistent or missing:', name)
    if (reference.korttittel) {
      return getIdByTitle(reference, lawIdRegex, searchString)
    } else {
      return null
    }

  }
  return lawName.lawId
}

async function getIdByTitle (reference, lawIdRegex, searchString) {
  const name = reference.tittel
  const query = {
    lawName: [name, searchString],
    lawId: { $regex: lawIdRegex }
  }
  const lawName = await LawName.findOne(query)
  if (!lawName) {
    log('nonexistent or missing:', name)
    return null
  }
  return lawName.lawId
}

async function getExtract (lawId, lawReference) {
  const query = { id: lawId }
  query.kapittel = lawReference.kapittel
  query.paragraf = lawReference.paragraf
  query.bokstav = lawReference.bokstav
  let extract = await LawExtract.findOne(query)
  if (!extract) {
    const { documentExtract, documentTitle } = await createExtract(lawId, lawReference)
    extract = documentExtract
    if (documentTitle) {
      const obj = {
        lawId,
        lawName: documentTitle,
        source: '[document]'
      }
      await LawName.updateOne(
        obj,
        obj,
        { upsert: true }
      )
    }
  } else {
    log('using extract from cache')
  }
  return extract
}

async function createExtract (id, reference) {
  // get the HtmlDocument for given id

  // XXX adding `/*` to the end ensures that we get the full law text. However,
  // this exludes the “kort om loven” preface that’s available for some laws,
  // e.g. straffeloven.
  const url = 'https://lovdata.no/dokument' + id + '/*'
  const document = await getHtmlDocument(url)
  if (!document) return {}
  if (document.status === 404) return { status: 404 }
  log('extract text for', id, reference)
  // extract the relevant portion
  const extracted = extractor(reference, document.html)
  if (!extracted) return {}
  const { extract, title, documentTitle } = extracted

  let result

  // save as new extract
  if (extract) {
    const documentExtract = {
      id,
      extract
    }
    if (title) documentExtract.title = title
    if (reference.kapittel) documentExtract.kapittel = reference.kapittel
    if (reference.paragraf) documentExtract.paragraf = reference.paragraf
    if (reference.bokstav) documentExtract.bokstav = reference.bokstav

    try {
      result = await LawExtract.create(documentExtract)
    } catch (e) {
      log('error creating entry', documentExtract, e)
    }
  }

  return { documentExtract: result, documentTitle }
}

function getDocumentAge (document) {
  return Date.now() / 1000 - document.createdAt
}

function documentTooOld (document) {
  const age = getDocumentAge(document)
  return age > documentTTL
}

async function getHtmlDocument (url) {
  let document = await HtmlDocument.findOne({ url })
  if (!document || documentTooOld(document)) {
    try {
      document = await createHtmlDocument(url)
    } catch (e) {
      log('failed to get document', e)
      if (e instanceof got.HTTPError && e.response.statusCode === 404) {
        return { status: 404 }
      }
    }
  }
  return document
}
async function createHtmlDocument (url) {
  // download url
  log('fetch page', url)
  const response = await got(url)
  return HtmlDocument.create({
    url,
    html: response.body
  })
}
