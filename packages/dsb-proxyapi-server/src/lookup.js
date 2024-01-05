import got from 'got'
import logger from './logger.js'

const requestTimeoutWarning = 6000
let requestTimeout = null
function warnAboutSlowRequest (gotOptions) {
  const url = ((gotOptions.url) || {}).href || ''
  logger.warn('Warning: this request is taking a long time to complete', url)
}

const client = got.extend({
  https: { rejectUnauthorized: false },
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

export class LookupAPIClass {

  constructor() {
    this.baseUrl = 'kunnskapsbanken.dsb.no/api/definitions'
    this.baseProtocol = 'https://'
    this.searchOptions = {}
    this.termIdTracker = 1
    this.lexemeIdTracker = 1
    this.definitionIdTracker = 1
    this.urlParams = {}

    this.languageStrings = {
      nb: 'bokmål'
    }
    logger.log('created')
  }

  async getEntries() {
    const url = this.baseProtocol + this.baseUrl
    const result = await client(url)
    const jsonData = JSON.parse(result.body)
    return jsonData
  }

  async getSourceList() {
    return {
      id: "1",
      url: 'https://kunnskapsbanken.dsb.no/definisjoner',
      name: 'Kunnskapsbanken Definisjoner',
      displayname: 'Kunnskapsbanken',
      contactEmail: 'contact@tingtun.no',
      markupWords: true,
      privateSource: false,
      inputLanguages: {
        'nb': ['nb']
      },
      glossaries: [
        {
          id: "1",
          name: 'Kunnskapsbanken Definisjoner',
          displayname: 'Kunnskapsbanken',
          sourceLanguage: 'nb',
          targetLanguage: 'nb'
        }
      ]
    }
  }
}
