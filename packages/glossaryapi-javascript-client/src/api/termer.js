/*
 * Vertraulich
 */

import GlossaryAPIBase from './api-base'
export class TermerAPI extends GlossaryAPIBase {
  constructor (url) {
    super()
    this.endpointURL = '/glossary2/'
    this.oldendpointURL = '/glossary/v2/'
    this.defaultOptions = {}

    const logins = localStorage.getItem('logins')
    if (logins) {
      const jsonLogins = JSON.parse(logins)
      if (jsonLogins.Termer) {
        this.defaultOptions.headers = {
          'Authorization': 'Token ' + jsonLogins.Termer
        }
      }
    }
    // this.defaultOptions.withCredentials = true
    if (url) {
      this.endpointURL = url
      if (this.endpointURL.charAt(this.endpointURL.length - 1) !== '/') {
        this.endpointURL += '/'
      }
    }
  }

  termSearch (term, params) {
    for (let key of Object.keys(params)) {
      let val = params[key]
      if (typeof val === 'string') {
        // Don’t do anything about Strings
        continue
      } else if (val instanceof window.Array) {
        // Convert arrays to CSV strings
        params[key] = val.join(',')
      } else {
        // Convert other stuff to stringified JSON
        params[key] = JSON.stringify(val)
      }
    }
    let promise = new Promise((resolve, reject) => {
      this.termLexemeSearch(term, params).then(response => {
        let return_list = []
        let translations = {}
        let definitions = {}
        for (let item of response.results) {
          let from_lexeme = item.lexeme
          for (let definition of item.definitions) {
            if (definition.id in definitions) {
              definitions[definition.id].lexemes.push(from_lexeme)
            } else {
              definition.lexemes = [from_lexeme]
              definitions[definition.id] = definition
            }
          }
          for (let translation of item.translations) {
            translation.id = translation.id * -1
            let translation_id = translation.meaning + translation.source.toString()
            if (translation_id in translations) {
              for (let domain of translation.domains) {
                if (!(translations[translation_id].domain_ids.includes(domain.id))) {
                  translations[translation_id].domain_ids.push(domain.id)
                  translations[translation_id].domains.push(domain)
                }
              }
              translations[translation_id].lexemes.push(from_lexeme)
            } else {
              let domain_ids = []
              for (let domain of translation.domains) {
                domain_ids.push(domain.id)
              }
              translation.domain_ids = domain_ids
              translation.lexemes = [from_lexeme]
              translations[translation_id] = translation
            }
          }
        }
        return_list = return_list.concat(Object.values(definitions))
        return_list = return_list.concat(Object.values(translations))
        response.results = return_list
        resolve(response)
      })
    })
    return promise
  }

  termSearchOld (term, params) {
    for (let key of Object.keys(params)) {
      let val = params[key]
      if (typeof val === 'string') {
        // Don’t do anything about Strings
        continue
      } else if (val instanceof window.Array) {
        // Convert arrays to CSV strings
        params[key] = val.join(',')
      } else {
        // Convert other stuff to stringified JSON
        params[key] = JSON.stringify(val)
      }
    }
    let promise = new Promise((resolve, reject) => {
      let translationSeach = this.termTranslationSearch(term, params)
      let definitionSearch = this.termDefinitionSearch(term, params)

      Promise.all([translationSeach, definitionSearch]).then(response => {
        let termList = {}
        for (let result of response[0].results) {
          for (let term of result.to_lexeme.terms) {
            if (term.lemma && !(term.term + result.source.toString() in termList)) {
              let newObj = {}
              newObj.meaning = term.term
              newObj.lexemes = result.from_lexeme
              newObj.id = -1 * term.id
              newObj.source = result.source_language_pair
              newObj.source_language_pair = result.source_language_pair
              newObj.domains = result.domains
              newObj.comments = null
              newObj.permissions = { 'write': false, 'read': false }
              termList[term.term.toLowerCase() + result.source.toString()] = newObj
            } else if (term.lemma && term.term + result.source.toString() in termList) {
              let theObj = termList[term.term + result.source.toString()]
              theObj.domains = [...new Set([...theObj.domains, ...result.domains])]
            }
          }
        }
        let newResponse = response[1]
        newResponse.results = newResponse.results.concat(Object.values(termList))
        resolve(newResponse)
      })
    })
    return promise
  }

  async termLexemeSearch (term, params) {
    if (!term) return { results: [] }
    let options = this.defaultOptions
    options.params = params
    return new Promise((resolve, reject) => {
      this._ajaxGET(`${this.endpointURL}searchLexeme/${term}/`, { params, options })
      .then(response => {
        if (response.next_external_lookups && Object.keys(response.next_external_lookups).length > 0) {
          const promList = []
          Object.entries(response.next_external_lookups).forEach(([sourceId, languages]) => {
            if (sourceId) {
              params.sources = sourceId
              params.inputLanguages = languages.inputLanguages
              params.targetLanguages = languages.targetLanguages
              promList.push(this.termLexemeSearch(term, params))
            }
          })
          if (promList.length > 0) {
            Promise.all(promList).then(nextResponse => {
              const addResults = nextResponse.filter(x => x.results).map(x => x.results).flat()
              if (!response.results) {
                resolve({ results: [] })
              } else {
                if (addResults) response.results = response.results.concat(addResults)
                resolve(response)
              }
            })
          }
        } else {
          if (!response.results) {
            resolve({ results: [] })
            // return { results: [] }
          } else {
            resolve(response)
            // return response
          }
        }
      })
      .catch(e => {
        reject(e)
      })
    })
  }

  async termTranslationSearch (term, params) {
    if (!term) return { results: [] }
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}translations/search/${term}/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          return response
        }
      })
  }

  async termDefinitionSearch (term, params) {
    if (!term) return { results: [] }
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}search/${term}/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          return response
        }
      })
  }

  getSource (sourceId, params) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}sources/${sourceId}/`, { params, options })
  }

  getSourceList (params={}) {
    let self = this
    let options = this.defaultOptions
    // if (!('limit' in params)) params['limit'] = 500
    options.params = params
    return this._ajaxGET(`${this.endpointURL}sources/`, { options })
      .then(function getSourceListNext (response) {
        if (!response.results) {
          return { results: [] }
        } else {
          if (response.next) {
            if (!('offset' in params)) {
              params.offset = 0
              response.offset = response.results.length
            }
            params.offset = params.offset + response.offset
            options.params = params
            return self._ajaxGET(`${self.endpointURL}sources/`, { options })
              .then(
                function (nextResponse) {
                  nextResponse.offset = nextResponse.results.length
                  nextResponse.results = response.results.concat(nextResponse.results)
                  return getSourceListNext(nextResponse)
                }
              )
          } else {
            return response
          }
        }
      })
  }

  getWordlist (params) {
    if (!params.source && !(params.sources && params.sources.length)) {
      const emptyPromise = new Promise(resolve => resolve([]))
      return emptyPromise
    }

    let sources
    if (params.source) {
      sources = [params.source]
      delete params.source
    } else {
      sources = params.sources
      delete params.sources
    }
    let options = this.defaultOptions
    options.params = params
    const promises = []
    for (const source of sources) {
      const promise = this._ajaxGET(`${this.endpointURL}glossaries/${source}/wordlist/`, { params, options })
        .catch(e => {
          console.warn(e)
          return []
        })
      promises.push(promise)
    }
    return Promise.all(promises).then(results => {
      let wordlistResponse = []
      let regexResponse = []
      for (let result of results) {
        if ('wordlist' in result) {
          wordlistResponse = wordlistResponse.concat(result.wordlist)
        }
        if ('regexs' in result) {
          regexResponse = regexResponse.concat(result.regexs)
        }
      }
      wordlistResponse = getUnique(wordlistResponse)
      regexResponse = getUnique(regexResponse)
      let respons_Object = { 'wordlist': wordlistResponse, 'regexs': regexResponse }
      return respons_Object
    })
  }

  // TERMS
  deleteTerm (id) {
    let params = { options: this.defaultOptions }
    return this._ajaxDELETE(`${this.endpointURL}concepts/${id}/`,
      params,
      null
    )
  }

  // LEXEME
  deleteLexeme (id) {
    let params = { options: this.defaultOptions }
    return this._ajaxDELETE(`${this.endpointURL}lexemes/${id}/`,
      params,
      null
    )
  }

  // USER
  getLoggedInUser () {
    let params = { options: this.defaultOptions }
    return this._ajaxGET(`${this.endpointURL}user/me/`,
      params
    )
      .catch(e => {
        let statusCode
        try {
          statusCode = parseInt(e.message)
        } catch {}
        if (statusCode && (statusCode >= 400 || statusCode <= 500)) {
          if (this.defaultOptions.headers) {
            delete this.defaultOptions.headers.Authorization
          }
          let localLogin = localStorage.getItem('logins')
          if (localLogin) {
            localLogin = JSON.parse(localLogin)
            delete localLogin.Termer
            localStorage.setItem('logins', JSON.stringify(localLogin))
          }
          return e
        } else {
          console.warn(e)
          return {}
        }
      })
  }

  updateTerm (id, modifications) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPATCH(`${this.endpointURL}definitions/${id}/`,
      params,
      modifications
    )
  }

  createTerm (term) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}definitions/`,
      params,
      term
    )
  }

  addDefinition (lexemeId, definition) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}lexemes/${lexemeId}/definitions/`,
      params,
      definition
    )
  }

  getDefinitionsList (params) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}definitions/`, { params, options })
      .then(response => {
        if (!response.results) {
          return {}
        } else {
          return response
        }
      })
  }

  definitionSearchStart (searchText, params) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}definitions/startwith/${searchText}/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          return response
        }
      })
  }

  deleteDefinition (id) {
    let params = { options: this.defaultOptions }
    return this._ajaxDELETE(`${this.endpointURL}definitions/${id}/`,
      params,
      null
    )
  }

  // LOGIN PASSWORD LOGOUT
  async loginUser (loginCredentials) {
    let params = { options: this.defaultOptions }
    console.log('login?', params)
    params.options.headers = {}
    params.options.headers['Content-Type'] = 'application/json'
    const value = await this._ajaxPOST(`${this.endpointURL}login/`,
      params,
      loginCredentials
    )
    this.defaultOptions.headers = {
      'Authorization': 'Token ' + value.key
    }
    return value
  }

  createUser (userInfo) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}registration/`,
      params,
      userInfo
    )
  }

  logoutUser (storeSelectedGlossaries) {
    let params = { options: this.defaultOptions }
    delete this.defaultOptions.headers.Authorization
    /*
    return this._ajaxPOST(`${this.endpointURL}logout/`,
      params,
      storeSelectedGlossaries
    )
    */
  }

  changePassword (passwords) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}password/change/`,
      params,
      passwords
    )
  }

  recoverPassword (email) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}password/reset/`,
      params,
      email
    )
  }

  recoverPasswordConfirm (passwords) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}password/reset/confirm/`,
      params,
      passwords
    )
  }

  confirmEmail (key) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}registration/verify-email/`,
      params,
      key
    )
  }
  // SHARED glossary
  getSharedAccessList (params) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}sharesource/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          return response
        }
      })
  }

  addSharedAccess (userData) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}sharesource/`,
      params,
      userData
    )
  }

  updateSharedAccess (id, modifications) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPATCH(`${this.endpointURL}sharesource/${id}/`,
      params,
      modifications
    )
  }

  deleteSharedAccess (id) {
    let params = { options: this.defaultOptions }
    return this._ajaxDELETE(`${this.endpointURL}sharesource/${id}/`,
      params,
      null
    )
  }
  // SOURCE / GLOSSARY
  updateSource (sourceId, modifications) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPATCH(`${this.endpointURL}sources/${sourceId}/`,
      params,
      modifications)
  }

  updateGlossary (glossaryId, modifications) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPATCH(`${this.endpointURL}glossaries/${glossaryId}/`,
      params,
      modifications)
  }

  deleteSource (sourceId) {
    let params = { options: this.defaultOptions }
    return this._ajaxDELETE(`${this.endpointURL}sources/${sourceId}/`,
      params,
      null
    )
  }

  createSource (sourceData, params = {}) {
    params = { options: this.defaultOptions, ...params }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}sources/`,
      params,
      sourceData
    )
  }
  // USER
  getUserList (params) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}user/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          return response
        }
      })
  }

  getDomains (params = {}, nextResult = []) {
    let options = this.defaultOptions
    options.params = params
    return this._ajaxGET(`${this.endpointURL}domains/`, { params, options })
      .then(response => {
        if (!response.results) {
          return { results: [] }
        } else {
          if (response.next) {
            let params2 = this.getUrlParams(response.next)
            if (!params2) {
              // console.warn('Did not get parameters for next call')
              // console.warn(params2)
              return response.results.concat(nextResult)
            }
            return this.getDomains(params2, response.results.concat(nextResult))
          }
          return response.results.concat(nextResult)
        }
      })
  }

  getLanguages () {
    let params = { options: this.defaultOptions }
    return this._ajaxGET(`${this.endpointURL}supportedlanguages/`, params)
  }

  setLanguage (data) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.oldendpointURL}set-language/`,
      params,
      data)
  }

  updateUserSettings (id, data) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPATCH(`${this.endpointURL}usersettings/${id}/`,
      params,
      data)
  }

  updateEmail (data) {
    let params = { options: this.defaultOptions }
    params.options.headers['Content-Type'] = 'application/json'
    return this._ajaxPOST(`${this.endpointURL}usersettings/updateemail/`,
      params,
      data)
  }

  // This path is only avaieble in debug mode.
  // On live server it is not reachable.
  testuserAccess () {
    let params = { options: this.defaultOptions }
    return this._ajaxGET(`${this.oldendpointURL}testuseraccess/`, params)
  }
}

function getUnique (arr) {
  // Removes duplicates from the given array.
  // The simple solution, [...new Set()],  is too slow in IE11.
  // Replacing the Object u with a Set gives better performance in Chrome and
  // Firefox, but is worse in IE11.

  // From stackoverflow/jsperf.
  // https://jsperf.com/unique-in-array/36/
  // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates/
  const u = {}
  const a = []
  const l = arr.length
  for (let i = 0; i < l; ++i) {
    if (u.hasOwnProperty(arr[i])) {
      continue
    }
    a.push(arr[i])
    u[arr[i]] = 1
  }
  return a
}
