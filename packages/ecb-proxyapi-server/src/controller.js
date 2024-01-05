import {
  HtmlDocument,
  Entry,
  Glossary
} from './model.js'
import logger from './logger.js'
import got from 'got'
import { documentTTL } from './constants.js'
import documentIdToInteger from './utils/documentIdToInteger.js'

const log = logger.log

export function temp () {
  return 'hello'
}

export async function lookup (term, glossaryId) {
  const entry = await Entry.find({
    "lexeme.forms": { $all: [term] },
    'foundIn': glossaryId
  })
  return entry
}

export async function getWordlist (glossaryId) {
  const enteries = await Entry.find({
    'foundIn': glossaryId
  })
  const formsList = [...new Set(enteries.map(x => x.lexeme.forms).flat())]
  return formsList
}

export async function getSource () {
  const glossaries = await Glossary.find({})
  const glossList = []
  for (const glossary of glossaries) {
    glossList.push({
      id: glossary.id,
      url: glossary.url,
      name: glossary.name,
      displayname: glossary.name,
      sourceLanguage: 'en',
      targetLanguage: 'en'
    })
  }
  const soruce = {
    id: '1',
    permissions: {
      write: false,
      read: false
    },
    inApikey: false,
    logoUrl: '',
    inputLanguages: {'en': ['en']},
    name: 'ECB Source',
    displayname: 'ECB Source',
    url: 'https://www.ecb.europa.eu/home/glossary/html/glossa.en.html',
    description: 'Glossaries on European Central Bank',
    contactEmail: 'contact@tingtun.no',
    privateSource: false,
    markupWords: true,
    externalData: true,
    inGarbage: false,
    owner: null,
    terms: null,
    glossaries: glossList
  }
  return soruce
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
