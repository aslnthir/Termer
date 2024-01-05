// Download page from Lovdata and extract law names

import logger from './logger.js'
import re from 'lovdata-law-reference-regex/src/regexHelper.js'
import {
  hyphens as hyphensRegex,
  lovPostfix as lawPostfixRegex
} from 'lovdata-law-reference-regex/src/regexes.js'
import scrapeLovdataList from './utils/scrapeLovdataList.js'

const log = logger.log

export async function * scrape (lastLawId) {
  const lovdataUrl = 'https://lovdata.no/register/lover'
  for await (const { documents, sourceUrl } of scrapeLovdataList(lovdataUrl, lastLawId)) {
    yield { documentNames: handleDocumentList(documents), sourceUrl }
  }
}

export function fixupDocumentList (collection) {
  collection = removeUnneeded(collection)
  collection = splitShortAndLongNamesParens(collection)
  collection = stripAcronymMV(collection)
  collection = removeTrailingDot(collection)
  collection = removeTrailingDashText(collection)
  addLovOm(collection)
  addCopiesLovaToLovenAndLovenToLova(collection)
  return collection
}

export function handleDocumentList (collection) {
  collection = fixupDocumentList(collection)
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

export function splitShortAndLongNamesParens (collection) {
  // If name contains both long and short names, split them into separate
  // entries.
  const regex = re`(.+)\s[[(]([^\])]+${lawPostfixRegex})[\])]$`
  const add = []
  collection = collection.map(x => {
    const result = x.name.match(regex)
    if (result) {
      x.name = result[1]
      add.push(Object.assign({}, x, { name: result[2] }))
    }
    return x
  })
  collection = collection.concat(add)
  return collection
}

function removeTrailingDashText (collection) {
  const regex = re`^(.+)\s${hyphensRegex}\s.+$`
  collection = collection.map(x => {
    const result = x.name.match(regex)
    if (result) {
      x.name = result[1]
    }
    return x
  })
  return collection
}

const lovenLovablacklist = new Set(['grunnlova', 'grunnloven'])

export function addCopiesLovaToLovenAndLovenToLova (collection) {
  // lova -> loven, loven -> lova
  const lovenRe = /lov(en|a)$/

  const toAdd = collection.filter(x => lovenRe.test(x.name) && !lovenLovablacklist.has(x.name))
    .map(x => {
      const copy = Object.assign({}, x)
      copy.name = copy.name.replace(lovenRe, (_, group1) =>
        'lov' + (group1 === 'a' ? 'en' : 'a')
      )
      return copy
    })
  collection.push(...toAdd)
}

const blacklist = new Set([
  // ~ Duplicate entries for Grunnloven
  //   https://lovdata.no/register/lover?sort=alpha&offset=0&dir=asc&year=1814
  //   LOV-1814-05-17
  'grunnlova - grl. - nynorsk',
  'grunnloven - grl. - bokmål',
  // ~ Invalid law name
  //   https://lovdata.no/register/lover?year=2005&sort=alpha&dir=asc&offset=40
  //   LOV-2005-04-01-14
  'rådsforordning (ef'
])

function removeUnneeded (collection) {
  return collection.filter(x =>
    !(
      /^endr\./.test(x.name) ||
      /^lov om (?:mellombels |midlertidige )?endring(?:[ae]r)? i /.test(x.name) ||
      /^(mellombels|midlertidig) lov/.test(x.name) ||
      /ikrafttr/.test(x.name) ||
      /(?:opphevelse|oppheving)$/.test(x.name) ||
      /\(opphevelseslov\)$/.test(x.name) ||
      /\bendringslov\b/.test(x.name) ||
      blacklist.has(x.name)
    )
  )
}

const lovOmBlacklist = new Set([
  'cancelli-promemoria',
  'kong christian den femtis norske lov',
  'norske lov'
])

function addLovOm (collection) {
  // - hvis ikke inneholder lov om eller loven/-a, legg til
  // lov om.

  // Don’t modify items in blacklist.
  const lovOmRegex = new RegExp(re`(^(?:lov [ou]m|traktat)\b|${lawPostfixRegex}\b(?!\)))`)
  collection = collection.map(x => {
    if (!lovOmRegex.test(x.name) && !lovOmBlacklist.has(x.name)) {
      x.name = 'lov om ' + x.name
    }
    return x
  })
}

// Remove trailing m.v., m.m. and variants.
function stripAcronymMV (collection) {
  const regex = /(.+)(?:\sm\.?[mv]\.?)$/
  collection = collection.map(x => {
    const result = x.name.match(regex)
    if (result) {
      x.name = result[1]
    }
    return x
  })
  return collection
}

// Remove trailing dot
function removeTrailingDot (collection) {
  const regex = /\.$/
  collection = collection.map(x => {
    if (regex.test(x.name)) {
      x.name = x.name.slice(0, -1)
    }
    return x
  })
  return collection
}
