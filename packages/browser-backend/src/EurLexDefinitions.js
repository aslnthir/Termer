/*
 * Vertraulich
 */

export default class EurLexDefinitions {
  constructor () {
    const self = this
    self.terms = {}
    self.sourcesReady = false
    self.sources = []
    self.glossaryIdTracker = 1
    self.regex = new RegExp('^‘(.+)’(.+)')
    self._start()
  }

  termSearch (term, params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.sourcesReady === true)
      .then(_ => {
        if (self.sources.length > 0 && this._correctParams(params)) {
          resolve(self._findDefenition(term))
        } else {
          resolve([])
        }
      })
    })
    return promise
  }

  getWordlist (params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.sourcesReady === true)
      .then(_ => {
        let list = []
        if (this._correctParams(params)) {
          list = Object.keys(self.terms)
        }
        resolve({ 'wordlist': list, 'regexs': [] })
      })
    })
    return promise
  }

  getSourceList (params) {
    const self = this
    let promise = new Promise((resolve, reject) => {
      self._waitFor(_ => self.sourcesReady === true)
      .then(_ => {
        self._sourceInAPIKey(params, this.sources)
        resolve({'results': this.sources})
      })
    })
    return promise
  }

  _start () {
    this.sources = this._generateSources()
    if (this._testSourceAvaleble()) this._scrapeSite()
  }

  _correctParams (params) {
    if (params && params.sources && params.sources.includes("1")) {
      return true
    }
    return false
  }

  _testSourceAvaleble () {
    const domain = window.location.host
    if (domain === 'eur-lex.europa.eu'
      || domain === '127.0.0.1:8000'
      || domain === 'glossary.tingtun.no') {
      return true
    }
    return false
  }

  _generateSources () {
    const sources = []
    if (this._testSourceAvaleble()) {
      const languages = {
          "en": [
              "en"
          ]
      }
      const glossaries = []
      for (const [sourceLang, targetLanguages] of Object.entries(languages)) {
        targetLanguages.forEach(targetLanguage => {
          const glossary = {
            id: this.glossaryIdTracker,
            displayname: "Document Definition",
            name: "EurLex Definition",
            sourceLanguage: sourceLang,
            targetLanguage: targetLanguages,
            url: ""
          }
          glossaries.push(glossary)
          this.glossaryIdTracker += 1
        })
      }

      let eurlex = {
        "url": "",
        "id": 1,
        "name": "EurLex Definition",
        "displayname": "Document Definition",
        "lang_concept": "en",
        "lang_description": "en",
        "terms": "",
        "owner": "",
        "private_source": false,
        "sharePremission": false,
        "description": "Definitions from the document",
        "markup_words": true,
        "contact_email": "contact@tingtun.no",
        "permissions": {
            "write": false,
            "read": false
        },
        glossaries,
        "sharedIdentifier": null,
        "in_apikey": false,
        "logo_url": null,
        "source_description": {
            "id": 1,
            "input_languages": languages,
            "name": "EurLex Definition",
            "displayname": "Document Definition",
            "url": "",
            "logo_url": null,
            "description": "Definitions from the document",
            "contact_email": "contact@tingtun.no",
            "private_source": false,
            "markup_words": true,
            "external_data": false,
            "external_api_id": null,
            "show_notes": false,
            "hide_source_url": false,
            "in_development": false,
            "is_shared": false,
            "imagename": null,
            "owner": null,
            "groups": []
        }
      }
      sources.push(eurlex)
    }
    return sources
  }

  _sourceInAPIKey (params, sources) {
    for (const source of sources) {
      if (params && 'api' in params && 'demo_eur_lex' === params.api) {
        source.in_apikey = true
      } else {
        source.in_apikey = false
      }
    }
  }

  _scrapeSite () {
    const elements = document.getElementsByClassName('sti-art')
    let defElem
    for (let elem of elements) {
      if (elem.textContent === 'Definitions') {
        defElem = elem
        break
      }
    }
    if (defElem) {
      let loopElem = defElem.nextSibling
      let id = 1
      while (loopElem.className !== 'ti-art') {
        if (loopElem.nodeName === 'TABLE') {
          const someElem = loopElem.querySelectorAll('p')[1]

          let myArray = this.regex.exec(someElem.textContent.trim())
          let result = this._generateDefinition(myArray[1].trim(), myArray[2].trim(), id)
          this.terms[myArray[1].trim()] = result
          if (myArray[1].trim()[myArray[1].trim().length - 1] != 's'){
            this.terms[myArray[1].trim() + 's'] = result
          }
          id += 1
        }
        loopElem = loopElem.nextSibling
      }
      const sourceUrl = window.location['href'] + '#' + defElem.id
      for (const source of this.sources) {
        source.url = sourceUrl
      }
    }
    this.sourcesReady = true
  }

  _findDefenition(term) {
    const elements = document.getElementsByClassName('sti-art')
    let defElem
    for (let elem of elements) {
      if (elem.textContent === 'Definitions') {
        defElem = elem
        break
      }
    }
    if (defElem) {
      let loopElem = defElem.nextSibling
      while (loopElem.className !== 'ti-art') {
        if (loopElem.nodeName === 'TABLE') {
          const someElem = loopElem.querySelectorAll('p')[1]

          let myArray = this.regex.exec(someElem.textContent.trim())
          const match = myArray[1].trim()
          if (match === term) {
            return [this._generateDefinition(match, myArray[2].trim(), 1)]
          }
        }
        loopElem = loopElem.nextSibling
      }
      if (term in this.terms) {
        return this.terms[term]
      }
    }
    return []
  }

  _generateDefinition(term, meaning, id) {
    const sourceID = this.sources[0].id
    const lexemeObj = {
        "id": id,
        "source_id": sourceID,
        'language': "en",
        "terms": [
            {
                "id": id,
                "term": term,
                "lemma": true
            }
        ]
    }
    // const translationObjs = []
    // const definitionObjs = []
    const defObj = {
      "id": id,
      "meaning": meaning,
      "source": sourceID,
      "last_edit_time": null,
      "source_language_pair": sourceID,
      "comments": null,
      "domains": [],
      "url": null,
      "source_concept_language": "en",
      "source_meaning_language": "en",
      "lexemes": lexemeObj
    }
    // definitionObjs.push(defObj)
    // return {'lexeme': lexemeObj, 'translations': translationObjs, 'definitions': definitionObjs}
    return defObj

  }

  _waitFor(conditionFunction) {
    const poll = resolve => {
      if (conditionFunction()) resolve()
      else setTimeout(_ => poll(resolve), 400)
    }
    return new Promise(poll)
  }
}
