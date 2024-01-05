import logger from './logger.js'
import request from 'request'

const waitPromises = {}
const username = 'TINGTUN_TERMER_20210719'
const password = 'ddMmAbxgZnCKCCvN'

import { domain } from './constants.js'

const log = logger.log

export class API {

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
    const url = 'https://webgate.ec.europa.eu/etranslation/si/translate'
    const sourceLanguage = optionsParams.glossary.sourceLanguage
    const targetLanguages = [optionsParams.glossary.targetLanguage]
    const requestData = {
      externalReference: 'Termer-Lookup',
      callerInformation: {
        application: username,
        username: 'Tingtun'
      },
      textToTranslate: term,
      sourceLanguage: sourceLanguage,
      targetLanguages: targetLanguages,
      domain: 'GEN',
      requesterCallback: domain + '/eTranslate/Callback/',
      destinations: {
        emailDestinations: []
      }
    }


    var options = {
      uri: url,
      auth: {
        user: username,
        pass: password,
        sendImmediately: false
      },
      method: 'POST',
      json: requestData
    };

    log('Pre-flight:', options)
    let resolveFunc
    const waitForPostResponse = new Promise((resolve, reject) => {
      resolveFunc = resolve
    })

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolveFunc(body)
      } else {
        resolveFunc(null)
      }
    })
    // log('Wait for 1 response')
    const requestId = await waitForPostResponse
    if (requestId === null) return []
    else if (requestId < 0) return { 'error': 'Server error from eTranslation' }
    const waitPromise = new Promise((resolve, reject) => {
      waitPromises[requestId] = {
        resolve,
        glossary: optionsParams.glossary,
        term: term
      }
    })
    setTimeout(() => this._waitToLongResolve(requestId), 60000)
    // log('wait for 2 response')
    const continueVal = await waitPromise
    // log('Wait finished')
    return continueVal
  }

  _waitToLongResolve (code) {
    if (code in waitPromises) {
      waitPromises[code]['resolve']({'error': 'Wait to long for eTranslation'})
      delete waitPromises[code]
    }
  }

  getRequestData (
    code
  ) {
    return waitPromises[code]
  }

  resolvePromise(
    code,
    entry
  ) {
    if (code in waitPromises) {
      waitPromises[code]['resolve'](entry)
      delete waitPromises[code]
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

  async getLanguages () {
    const url = 'https://webgate.ec.europa.eu/etranslation/si/get-domains'
    const requestData = {
      externalReference: 'Termer-Languages',
      callerInformation: {
        application: username,
        username: 'Tingtun'
      }
    }

    var options = {
      uri: url,
      auth: {
        user: username,
        pass: password,
        sendImmediately: false
      },
      method: "POST",
      json: requestData
    }
    let resolveFunc
    const waitPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve
    })

    const response = await request(options, function(error, response, body) {
      if (!error && response.statusCode == 200){
          resolveFunc(body)
      }
      else{
        resolveFunc(null)
      }
    })
    const continueVal = await waitPromise

    if (continueVal) return continueVal
    else return []
  }
}
