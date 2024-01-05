/*
 * Vertraulich
 */

import GlossaryAPIBase from './api-base'

export class QuickTermAPI extends GlossaryAPIBase {
  constructor (object) {
    super()
    this.endpointURL = 'https://trial.kaleidoscope.at/kalcium610/kalcrest/'

    // Get source list when you login to the API.
    this.termbaseCache = {}
    this.sourceCache = {}
    this.langauges = {}

    this.authToken = ''
    this.loginDone = false
    this.fetchedSourceList = false

    this.headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }

    this.apiLoginData = {}
    let element = window.document.getElementById('tingtunGlossary')
    if (element) {
      let user = element.dataset.loginuser
      let pw = element.dataset.loginpw
      let tenant = element.dataset.logintenant
      this.apiLoginData = {'UserName':user,'Password':pw,'TenantId':tenant}
    }



    this.object = object

    this.storrage = window.localStorage

    this.authToken = this.storrage.getItem('token')

    this.startUp()
  }

  startUp () {
    this._apiLogin().then(loginData => {
      if (loginData) {
        this.authToken = loginData.token
        this.storrage.setItem('token', loginData.token)
        let new_termbases = {}
        for (let group of loginData.groups) {
          for (let termbase of group.termbases) {
            new_termbases[termbase.termbaseId] = {
              id: termbase.termbaseId
            }
          }
        }
        let set1, set2
        set1 = Object.keys(new_termbases)
        set2 = Object.keys(this.termbaseCache)
        if (set1.length === set2.length) {
          for (let key of set1) {
            if (!set2.has(key)) {
              this.storrage.removeItem('QTsources')
            }
          }
        } else {
          this.storrage.removeItem('QTsources')
        }
        this.termbaseCache = new_termbases
        this.storrage.setItem('termbases', JSON.stringify(this.termbaseCache))
        this.headers['Authorization'] = 'bearer ' + this.storrage.getItem('token')
      }


      this._getLanguages().then(langauges => {
        for (let lang of langauges) {
          this.langauges[lang.id] = lang
        }
        this.loginDone = true
        // this._apiLogout()
      })
    })
  }

  getTermbaseURL () {
    const url = this.endpointURL +
      '/terminology/termbases'
    return url
  }

  getSource (sourceId) {
    return new Promise((resolve, reject) => {
      this._waitForLogin().then(() => {
        resolve(this.sourceCache[sourceId])
      })
    })
  }

  _getTermbase (termbaseID) {
    let params = {'params':
      {
        'termbaseIds': termbaseID
      },
      'headers': this.headers
    }
    let url = this.getTermbaseURL()
    return this._ajaxGET(url, params)
  }

  getSourceList (params) {
    let promise = new Promise((resolve, reject) => {
      this._waitForLogin().then(() => {
        let promiseList = []
        let sourceList = []
        let storrage_QTsources = this.storrage.getItem('QTsources')
        if (storrage_QTsources && storrage_QTsources.length > 0) {
          storrage_QTsources = JSON.parse(storrage_QTsources)
          this.sourceCache = storrage_QTsources
          this.fetchedSourceList = true
          resolve({ results: Object.values(this.sourceCache) })
        } else {
          for (let termbaseId of Object.keys(this.termbaseCache)) {
            promiseList.push(this._getTermbase(termbaseId))
          }
          Promise.all(promiseList).then(response => {
            let id = 0
            for (let result of response) {
              for (let termbase of result) {
                for (let from_lang of termbase.languageIds) {
                  for (let to_lang of termbase.languageIds) {
                    id += 1
                    let language_name
                    if (from_lang === to_lang) {
                      language_name = this.langauges[from_lang].name
                    } else {
                      language_name = this.langauges[from_lang].name + ' => ' + this.langauges[to_lang].name
                    }
                    let name = termbase.name + ' ' + language_name

                    this.sourceCache[id] = {
                      'id': id,
                      'url': '#',
                      'name': name,
                      'displayname': name,
                      'lang_concept': from_lang,
                      'lang_description': to_lang,
                      'extra_termbase': termbase.id
                    }
                  }
                }
              }
            }
            this.fetchedSourceList = true
            this.storrage.setItem('QTsources', JSON.stringify(this.sourceCache))
            resolve({ results: Object.values(this.sourceCache) })
          })
        }
      })
    })
    return promise
  }

/*
  _addToSet (value, index, array) {
    let source = this.sourceCache[value]
    this.termbaseIds.add(source.extra_termbase)
    this.from_langs.add(source.from_language)
    this.to_langs.add(source.to_language)
  } */

  _getSearchParamsFrom (sources) {
    let return_obj = {
      termbaseIds: new Set(),
      from_langs: new Set(),
      to_langs: new Set(),
    }
    for (let source_id of sources) {
      let source = this.sourceCache[source_id]
      return_obj.termbaseIds.add(source.extra_termbase)
      return_obj.from_langs.add(source.lang_concept)
      return_obj.to_langs.add(source.lang_description)
    }
    // sources.forEach(this._addToSet, return_obj)
    return return_obj
  }

  termSearch (term, params) {
    let url = this.termSearchURL()
    let sources = params['sources']
    let promise = new Promise((resolve, reject) => {
      this._waitForLogin().then(() => {
        let options = {
          'headers': this.headers
        }
        let data_obj = this._getSearchParamsFrom(sources)
        let url_params = this._searchParams(term, [...data_obj.from_langs], [...data_obj.to_langs])
        options.params = url_params
        let promiseList = []
        let temp_array = [...data_obj.termbaseIds]
        for (let index in temp_array) {
          promiseList.push(this._singleTermbaseSearch(temp_array[index], options, url))
        }
        Promise.all(promiseList).then(response => {
          let return_result = {results: []}
          let sources_obj = this._sortedSources(sources)
          for (let result of response) {
            let termList = []
            for (let hit of result.hits) {
              if (
                hit.termbaseId in sources_obj &&
                hit.languageId in sources_obj[hit.termbaseId]
              ) {
                let entry_id = hit.entryId.id
                for (let entry of result.entries) {
                  if (entry.id.id === entry_id) {
                    for (let language_entry of entry.languages) {
                      if (language_entry.fields && language_entry.languageId in sources_obj[hit.termbaseId][hit.languageId]) {
                        let newObj = {}
                        let created = false
                        for (let field of language_entry.fields) {
                          if (field.name === 'Definition') {
                            for (let source_hit_id of sources_obj[hit.termbaseId][hit.languageId][language_entry.languageId]) {
                              newObj.meaning = field.value
                              newObj.lexemes = []
                              newObj.id = entry.id.id.toString() + '_' + source_hit_id.toString()
                              newObj.source = source_hit_id
                              newObj.domains = []
                              newObj.comments = null
                              newObj.permissions = { 'write': false, 'read': false }
                              created = true
                            }
                          } else if (field.name === 'Note') {
                            newObj.comments = field.value
                          }
                        }
                        if (created) {
                          termList.push(newObj)
                        }
                      }
                    }
                  }
                }
              }
            }
            return_result.results = return_result.results.concat(termList)
          }
          resolve(return_result)
        })
      })
    })
    return promise
  }

  _sortedSources (sourceIds) {
    let sorted_obj = {}
    for (let i of sourceIds) {
      let from_lang = this.sourceCache[i].lang_concept
      let to_lang = this.sourceCache[i].lang_description
      let tb_id = this.sourceCache[i].extra_termbase
      if (sorted_obj[tb_id]) {
        if (sorted_obj[tb_id][from_lang]) {
          if (sorted_obj[tb_id][from_lang][to_lang]) {
            orted_obj[tb_id][from_lang][to_lang].push(i)
          } else {
            sorted_obj[tb_id][from_lang][to_lang] = [i]
          }
        } else {
          sorted_obj[tb_id][from_lang] = {}
          sorted_obj[tb_id][from_lang][to_lang] = [i]
        }
      } else {
        sorted_obj[tb_id] = {}
        sorted_obj[tb_id][from_lang] = {}
        sorted_obj[tb_id][from_lang][to_lang] = [i]
      }
    }
    return sorted_obj
  }

  _singleTermbaseSearch (termbaseId, options, url) {
    const data = [{"termbaseId":termbaseId,"filterId":-1,"termFilterId":-1}]
    return this._ajaxPOST(url,
      options,
      data
    )
  }

  getWordlist (params) {
    if (!params.source && !(params.sources && params.sources.length)) {
      const emptyPromise = new Promise(resolve => resolve([]))
      return emptyPromise
    } else {
      const promise = new Promise(resolve => {
        let return_list = []
        let object = {test: this.sourceCache}
        this._waitForSources().then(() => {
          let german_word = ['Schnellwahl', 'Zielwahl']
          let english_word = ['triangle of meaning']
          for (let source of params.sources) {
            if (this.sourceCache[source].lang_concept === 2) {
              return_list = return_list.concat(english_word)
            } else if (this.sourceCache[source].lang_concept === 1) {
              return_list = return_list.concat(german_word)
            }
          }
          resolve(return_list)
        })
      })
      return promise
    }
    /* const url = this.wordlistURL({})
    return this._ajaxGET(url)
      .then(result => {
        return this._getWordlist(result.query.results)
      })
      .catch(reason => {
        console.warn('Couln’t get wordlist:', reason)
        return []
      }) */
  }

  _searchParams (search, from_langs, to_langs) {
    let params = {}
    search = encodeURIComponent(search)
    params.term = search
    params.mode = 'Keyword'
    params.maxCount = 100
    params.sourceLanguageIds = this._searchLanguageParam(from_langs, 'sourceLanguageIds')
    params.targetLanguageIds = this._searchLanguageParam(to_langs, 'targetLanguageIds')
    return params
  }

  _searchLanguageParam (ids, string) {
    let return_str = ''
    let first = true
    for (let i of ids) {
      if (first) {
        first = false
        return_str += i
      } else {
        return_str += '&' + string + '=' + i
      }
    }
    return return_str
  }

  wordlistURL () {
    return this.askQueryURL
  }

  termSearchURL () {
    const url = this.endpointURL +
      'terminology/search'
    return url
  }

  apiLoginURL () {
    const url = this.endpointURL +
      'authentication/token'
    return url
  }

  apiLogoutURL () {
    const url = this.endpointURL +
      'authentication/logout'
    return url
  }

  _apiLogin () {
    if (!this.authToken || this.authToken === '') {
      let url = this.apiLoginURL()
      let options = {'headers': this.headers}
      return this._ajaxPOST(url,
        options,
        this.apiLoginData
      )
    } else {
      return new Promise(resolve => {
        this.headers['Authorization'] = 'bearer ' + this.storrage.getItem('token')
        this.termbaseCache = JSON.parse(this.storrage.getItem('termbases'))
        resolve()
      })
    }
  }

  _apiLogout () {
    this._waitForLogin().then(() => {
      let url = this.apiLogoutURL()
      let options = {'headers': this.headers}
      return this._ajaxPOST(url,
        options
      ).then(response => {
        // this.storrage.setItem('token', '')
        this.storrage.clear()
      })
    })
  }

  _waitForLogin () {
    const poll = resolve => {
    if(this.loginDone) resolve()
    else setTimeout(_ => poll(resolve), 400)
    }

    return new Promise(poll)
  }

  _waitForSources () {
    const poll = resolve => {
      let gotSources = this.storrage.getItem('QTsources')
      if(gotSources && gotSources !== '') {
        this.sourceCache = JSON.parse(gotSources)
        resolve()
      }
      else {
        setTimeout(_ => poll(resolve), 400)
      }
    }

    return new Promise(poll)
  }

  _getLanguagesURL () {
    const url = this.endpointURL +
      'terminology/languages'
    return url
  }

  _getLanguages () {
    let url  = this._getLanguagesURL()
    let params = {
      'headers': this.headers
    }
    return this._ajaxGET(
      url,
      params
    )
  }

  /*
   * TODO
   * Add endpoints:
   * getLoggedInUser, loginUser, logoutUser
   */
}
