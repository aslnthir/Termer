import got from 'got'
import logger from './logger.js'

const requestTimeoutWarning = 6000
let requestTimeout = null
function warnAboutSlowRequest (gotOptions) {
  const url = ((gotOptions.url) || {}).href || ''
  logger.warn('Warning: this request is taking a long time to complete', url)
}

const client = got.extend({
  hooks: {
    beforeRequest: [
      options => {
        requestTimeout = setTimeout(
          () => warnAboutSlowRequest(options),
          requestTimeoutWarning
        )
      }
    ],
    afterResponse: [
      response => {
        clearTimeout(requestTimeout)
        return response
      }
    ],
    beforeError: [
      error => {
        clearTimeout(requestTimeout)
        return error
      }
    ]
  }
})

export class SNLAPI {

  constructor() {
    const test = []
    // API doc:
    // https://meta.snl.no/API-dokumentasjon
  }

  async termSearch(
    term,
    optionsParams
  ) {
    try {
      return await this._handleTermSearch(term, optionsParams)
    } catch (error) {
      return { error }
    }
  }

  async _handleTermSearch(
    term,
    optionsParams
  ) {
    const url = optionsParams.url + 'api/v1/search'
    const params = this._generateLexinParams(term, optionsParams)
    const urlParams = addQueryParams(url, params)

    const result = await client(urlParams)
    const responseJSON = JSON.parse(result.body)
    const [
      results,
      didyoumean
    ] = this._formatResponse(term, responseJSON, optionsParams.glossary)
    return { results, didyoumean }
  }

  _generateLexinParams(searchPhrase, params) {
    return {
      query: searchPhrase
    }
  }

/*
* Loop trought all the different objects from the response
*/
  _formatResponse(
    searchPhrase,
    response,
    glossary
  ) {
    // Setup constants to store during loop
    const resultsObj = {}
    const didyoumean = []

    // loop items in the SNL response
    response.forEach((item) => {
      const term = item.headword.toLowerCase()
      if (item.first_two_sentences == "") return
      if (term === searchPhrase.toLowerCase()) {
        if (term in resultsObj) {
          const defObject = {
            gloss: item.first_two_sentences,
            language: 'nb'
          }
          resultsObj[term].definitions.push(defObject)
        } else {
          const defObject = {
            gloss: item.first_two_sentences,
            language: 'nb'
          }
          const lexObject = {
            language: 'nb',
            forms: [item.headword],
            lemmas: [item.headword],
            searchForms: [term]
          }

          const entryObj = {
            glossary: glossary,
            definitions: [defObject],
            lexeme: lexObject,
            id: item.article_id,
            url: item.article_url
          }
          resultsObj[term] = entryObj
          // results.push(entryObj)
        }
      } else {
        didyoumean.push(item.headword)
      }
    })
    return [Object.values(resultsObj), didyoumean]
  }
}

function addQueryParams(url, paramsObject) {
  const stringParams = Object.entries(paramsObject)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join('&')
  return `${url}?${stringParams}`
}
