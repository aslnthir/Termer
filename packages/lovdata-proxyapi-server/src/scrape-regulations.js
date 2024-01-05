import logger from './logger.js'
import scrapeLovdataList from './utils/scrapeLovdataList.js'

const log = logger.log

export async function * scrape (lastRegulationsId) {
  const lovdataUrl = 'https://lovdata.no/register/forskrifter'
  for await (const { documents, sourceUrl } of scrapeLovdataList(lovdataUrl, lastRegulationsId)) {
    yield { documentNames: handleDocumentList(documents), sourceUrl }
  }
}

function handleDocumentList (collection) {
  // - dropp urler med /DEL/ (forskrifter om delegering av myndighet)
  // - dropp endringsforskrifter
  // - dropp midlertidige forskrifter
  // - dropp navn som begynner på Ikrafttr (ikrafttrededelsesforskrift)
  // - dropp (opphevelsesforskrift)
  collection = collection.filter(x =>
    !(
      /^endr\./.test(x.name) ||
        /^forskrift om endring i forskrift/.test(x.name) ||
        /^(mellombels|midlertidig) forskrift/.test(x.name) ||
        /^ikrafttr/.test(x.name) ||
        /^\/DEL\//.test(x.documentId) ||
        /\(opphevelsesforskrift\)$/.test(x.name) ||
        /\(endringsforskrift\)$/.test(x.name)
    )
  )

  // - erstatt Forskr. med Forskrift
  // - hvis ikke inneholder Forskrift om eller forskriften/-a, legg til
  // forskrift om.
  collection = collection.map(x => {
    x.name = x.name.replace(/^forsksr\. /, 'forskrift ')
    if (!/(^forskrift om\b|forskrift(en|a)\b(?!\)))/.test(x.name)) {
      x.name = 'forskrift om ' + x.name
    }
    return x
  })

  // - hvis navn slutter med (xyz), legg også til en kopi uten (xyz).
  const parensRe = / \([^)]+\)$/
  collection = collection.reduce((acc, x) => {
    acc.push(x)
    if (parensRe.test(x.name)) {
      const y = Object.assign({}, x, { name: x.name.replace(parensRe, '') })
      acc.push(y)
    }
    return acc
  }, [])

  // hvis navn slutter med korttittelen (xyzforskriften), legg til en kopi med
  // korttittelen
  const shortTitleRe = / \(([^)]+forskriften)\)$/
  const shorts = []
  for (const { documentId, name } of collection) {
    const [, shortTitle] = name.match(shortTitleRe) || []
    if (shortTitle) shorts.push({ documentId, name: shortTitle })
  }
  collection.push(...shorts)

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

  return result
}
