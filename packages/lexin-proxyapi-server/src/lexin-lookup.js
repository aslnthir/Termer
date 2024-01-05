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
  headers: { origin: 'https://lexin.oslomet.no' },
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

export class LexinAPI {

  constructor() {
    this.baseUrl = 'editorportal.oslomet.no/api/v1/findwords'
    this.baseProtocol = 'https://'
    this.nextUrl = 'editorportal.oslomet.no/api/v1/nextPrevResult'
    this.searchOptions = {}
    this.termIdTracker = 1
    this.lexemeIdTracker = 1
    this.definitionIdTracker = 1
    this.urlParams = {}
    this.nextStringSearchRegex = '^se\\s(.+)'
    // this.log = logger.log

    this.languageStrings = {
      nb: 'bokmål',
      ar: 'arabisk',
      my: 'burmesisk',
      prs: 'dari',
      kmr: 'kurdisk+(kurmanji)',
      ckb: 'kurdisk+(sorani)',
      lt: 'litauisk',
      fa: 'persisk',
      pl: 'polsk',
      ru: 'russisk',
      so: 'somali',
      tl: 'tagalog',
      ta: 'tamil',
      th: 'thai',
      ti: 'tigrinja',
      tr: 'tyrkisk',
      ur: 'urdu',
      vi: 'vietnamesisk',
      en: 'engelsk',
      nn: 'nynorsk'
    }

    this.lexinShortLangCode = {
      ar: 'ara',
      en: 'b',
      fa: 'per',
      lt: 'lit',
      nb: 'n',
      nn: 'nny',
      pl: 'pol',
      ru: 'ru',
      ta: 't',
      th: 'th',
      tr: 'tur',
      ur: 'ur',
      vi: 'vie',
      kmr: 'kku',
      ti: 'tir',
      prs: 'prs',
      ckb: 'kso',
      tl: 'tgl',
      so: 'som',
      my: 'bur'
    }
  }

  async *termSearch(
    term,
    optionsParams
  ) {
    try {
      yield* this._handleTermSearch(term, optionsParams)
    } catch (error) {
      // console.log(error)
      try {
        await this._ajaxGET('https://lexin.oslomet.no', {})
      } catch (er) {
        // console.log(er)
        // intentionally ignored
      } finally {
        try {
          // this.log(error)
          // yield* this._handleTermSearch(term, optionsParams)
        } catch (e) {
          // console.log(e)
          yield { error: e }
        }
      }
    }
  }

  async *_handleTermSearch(
    term,
    optionsParams
  ) {
    const url = this.baseProtocol + this.baseUrl
    const params = this._generateLexinParams(term, optionsParams)
    const urlParams = addQueryParams(url, params)
    const result = await client(urlParams)
    const responseJSON = JSON.parse(result.body)
    if (!('result' in responseJSON)) return result
    const [
      results,
      foundResults,
      seeOtherTerm,
      didyoumean
    ] = this._formatResponse(term, optionsParams, responseJSON.result)
    yield { results, didyoumean }

    const nextResult = Object.values(responseJSON.resArray)
      .map((x) => x.id)
      .slice(0, 80)
      .filter(x => !foundResults.includes(x.toString()))

    if (seeOtherTerm.length > 0) {
      yield* this._handleRefererSearch(seeOtherTerm, optionsParams)
    }
    if (nextResult.length > 0) {
      yield* this._fetchNext(nextResult, optionsParams, term, responseJSON.lang)
    }
  }

  async *_handleRefererSearch(
    termList,
    optionsParams
  ) {
    const url = this.baseProtocol + this.baseUrl
    for (const term of termList) {
      try {
        const params = this._generateLexinParams(term, optionsParams)
        const response = await this._ajaxGET(url, { params })
        const [results, fetchedElements, seeOtherTerm, didyoumean] = this._formatResponse(
          term,
          optionsParams,
          response.result
        )
        yield { results, didyoumean }
      } catch (e) {
        // console.log('error', e)
      }
    }
  }

  _generateLexinParams(searchPhrase, params) {
    const lexinLanguage = this._generate_url_language_string(
      params.fromLanguage,
      params.toLanguage
    )
    if (searchPhrase.includes(', ')) {
      searchPhrase = searchPhrase.replace(', ', '++')
    }
    return {
      searchWord: searchPhrase,
      lang: lexinLanguage,
      page: 1,
      selectLang: lexinLanguage
    }
  }

  _generate_url_language_string(
    fromLanguage,
    toLanguage
  ) {
    const langList = ['nb', 'nn', 'en']
    if (!langList.includes(fromLanguage)) {
      // fromLanguage = 'nb'
      if (toLanguage === 'nn') {
        toLanguage = fromLanguage
        fromLanguage = 'nn'
      } else {
        toLanguage = fromLanguage
        fromLanguage = 'nb'
      }
    } else if (fromLanguage === 'en') {
      if (toLanguage === 'nn') {
        toLanguage = fromLanguage
        fromLanguage = 'nn'
      } else {
        fromLanguage = 'nb'
        if (toLanguage === 'nb') toLanguage = 'en'
      }
    }
    if (fromLanguage === toLanguage) return this.languageStrings[toLanguage]
    else {
      return (
        this.languageStrings[fromLanguage] +
        '-' +
        this.languageStrings[toLanguage]
      )
    }
  }

/*
* Loop trought all the different objects from the response
* read the readme file for more information about the lexin data
*/
  _formatResponse(
    searchPhrase,
    params,
    response
  ) {
    // Setup constants to store during loop
    const definitions = {}
    const examples = {}
    const lexemes = {}
    const seeOtherTerm = []
    const returnOtherTerm = []
    const termExtension = {}
    const lexemes_alt = {}
    const termExtension_alt = {}
    const extraDefinitionInfo = {}
    const englishTranslation = {}
    const smsLexemeForms = {}
    const smsFromTerms = {}
    const smsToTerms = {}
    let didyoumean = []
    let smsTermCounter = 0
    // const langs = response.lang.split('|')
    const toLangCode = this.lexinShortLangCode[params.toLanguage]
    const fromLangCode = this.lexinShortLangCode[params.fromLanguage]
    const translation = params.fromLanguage !== params.toLanguage
    // .slice(0, -1)

    // loop items in the lexeme response
    response[0].forEach((item) => {
      if (!(item.id in definitions)) definitions[item.id] = {}
      let glossaryId = 'not set'
      if (!(item.id in examples)) {
        examples[item.id] = {}
      }
      if (this._testType(item.type, fromLangCode, '-lem')) {
        // Looks at from lemma items
        didyoumean.push(item.text)
        this._addToLexeme(
          item,
          lexemes,
          termExtension,
          searchPhrase,
          params
        )
      } else if (this._testType(item.type, fromLangCode, '-alt')) {
        this._addToLexeme(
          item,
          lexemes_alt,
          termExtension_alt,
          searchPhrase,
          params
        )
      } else if (this._testType(item.type, fromLangCode, '-mor')) {
        // looks at all inflections items for from language
        const termObjects = this._handleinflexionstring(item.text) // .map(x => x.term)
        Object.entries(termObjects).forEach(([key, terms]) => {
          const stringTerms = terms.map(x => x.term)
          const intKey = parseInt(key)
          if (item.id in lexemes && intKey in lexemes[item.id]) {
            lexemes[item.id][intKey].forms = [
              ...lexemes[item.id][intKey].forms,
              ...stringTerms
            ]
          }
          if (item.id in lexemes_alt && intKey in lexemes_alt[item.id]) {
            lexemes_alt[item.id][intKey].forms = [
              ...lexemes_alt[item.id][intKey].forms,
              ...stringTerms
            ]
          }
        })
        // lexemes[item.id]['forms'] = [...lexemes[item.id]['forms'], ...terms]
        // lexemes_alt[item.id]['forms'] = [...lexemes_alt[item.id]['forms'], ...terms]
      } else if (this._testType(item.type, fromLangCode, '-kat')) {
        // For laiter use when categorzing the lexeme
        const searchWord = this._testIfSearchNewTerm(item.text)
        if (searchWord) {
          if (!(item.id in seeOtherTerm)) seeOtherTerm[item.id] = []
          seeOtherTerm[item.id].push(searchWord)
        }
      } else if (this._testType(item.type, toLangCode, '-lem') && translation) {
        // Looks at all to language lemmas if its a translation search
        const entryObjs = this._handleEntryString(item.text, params)
        Object.entries(entryObjs).forEach(([key, entry]) => {
          const number = parseInt(key)
          if (!(number in definitions[item.id]))
            definitions[item.id][number] = {}
          definitions[item.id][number].definitions = [entry]
        })
      } else if (
        this._testType(item.type, toLangCode, '-def') &&
        !translation
      ) {
        // Looks at all to language definitions when not a translation search
        const entryObjs = this._handleEntryString(item.text, params)
        Object.entries(entryObjs).forEach(([key, entry]) => {
          const number = parseInt(key)
          if (!(number in definitions[item.id]))
            definitions[item.id][number] = {}
          definitions[item.id][parseInt(key)].definitions = [entry]
        })
      } else if (this._testType(item.type, toLangCode, '-def') && translation) {
        // Looks at to language definitions when it is a translation search
        if (!(item.id in extraDefinitionInfo)) extraDefinitionInfo[item.id] = {}
        // Remove ^ which surrounds words that can be looked up in Lexin.
        item.text = item.text.replace(/\^/g, '')
        if (item.text.includes(' && ')) {
          const splited = item.text.split(' && ')
          let number = 0
          for (const text of splited) {
            number += 1
            extraDefinitionInfo[item.id][number] = text
          }
        } else {
          extraDefinitionInfo[item.id][1] = item.text
        }
      } else if (
        this._testType(item.type, this.lexinShortLangCode.en, '-lem')
      ) {
        // English sometimes is mixed with norwegian
        /*
        if (item.text.includes(' && ')) {
          const splited = item.text.split(' && ')
          let number = 0
          for (const text of splited) {
            number += 1
            // englishTranslation[item.id][number] = text.split(',').map(x => x.trim())
          }
        } else {
          /// englishTranslation[item.id][1] = item.text.split(',').map(x => x.trim())
        }
        */
      } else if (this._testType(item.type, toLangCode, '-eks')) {
        // Looks at example text for to languages
        this._addExample(examples, item)
      } else if (this._testType(item.type, fromLangCode, '-sms')) {
        // Looks at synonyms for the from language items
        if (!(item.id in smsFromTerms)) {
          smsFromTerms[item.id] = {}
        }
        if (!(item.id in smsLexemeForms)) {
          smsLexemeForms[item.id] = []
        }
        smsTermCounter += 1
        const lexemeData = this._createLexeme(
          item.text,
          searchPhrase,
          params,
          glossaryId
        )
        /*
        didyoumean = didyoumean.concat(
          this._formatTerm(item.text, searchPhrase)[0].split(', ')
        )
        */
        smsLexemeForms[item.id] = smsLexemeForms[item.id].concat(item.text.split(', '))
        smsFromTerms[item.id][smsTermCounter] = lexemeData.lexeme
      } else if (this._testType(item.type, toLangCode, '-sms')) {
        //  Looks at the synonyms for the to language tiems
        if (!(item.id in smsToTerms)) {
          smsToTerms[item.id] = {}
        }
        smsToTerms[item.id][smsTermCounter] = item.text.replace(/~/g, '')
      }
    })
    /*
    * End of loop of items from lexin API
    */
    didyoumean = [...new Set(didyoumean.filter(x => {
      return !(x == searchPhrase || x.split(', ').includes(searchPhrase))
    }))]

    didyoumean =  didyoumean.map(x => {
      if (x.includes('~')) {
        x = x.split('~').join('')
      }
      return x
    })

    Object.entries(definitions).forEach(([key, object]) => {
      Object.entries(object).forEach(([number, x]) => {
        if ('definitions' in x && x.definitions) {
          x.definitions.forEach(def => {
            def.examples = examples[parseInt(key)][parseInt(number)] || []
          })
        }
      })
    })
    const smsResults = this._fixSmsLexemeResults(
      smsFromTerms,
      extraDefinitionInfo,
      smsToTerms,
      params
    )

    this._fixDefinitionText(definitions, extraDefinitionInfo)
    const newResults_main = this._fixLexemeResults(
      lexemes,
      definitions,
      termExtension,
      smsLexemeForms
    )
    const newResults_alt = this._fixLexemeResults(
      lexemes_alt,
      definitions,
      termExtension_alt,
      smsLexemeForms
    )
    const allResults = newResults_main.concat(newResults_alt)

    //  Get hit for 'Skal' and not mismatch on 'Skuldersmerter'
    Object.entries(lexemes)
      .concat(Object.entries(lexemes_alt))
      .forEach(([key, item]) => {
        if (key in seeOtherTerm) {
          Object.entries(item).forEach(([number, lexeme]) => {
            const matches = lexeme.forms.filter(z => {
              return z.toLowerCase() === searchPhrase.toLowerCase()
            })
            if (matches.length > 0) {
              seeOtherTerm[parseInt(key)].forEach(x => returnOtherTerm.push(x))
            }
          })
        }
      })
    const newResults = allResults.filter(x => {
      if (x.lexeme && x.definitions && x.definitions.length > 0) {
        const matches = x.lexeme.forms.filter(z => {
          return z.toLowerCase() === searchPhrase.toLowerCase()
        })
        return matches.length > 0
      }
      return false
    })

    // now that all the data has been handled and filterd into items
    // Filter away definitions that do not have an lexeme with the search word
    const gotLexemeMatch = Object.entries(lexemes)
      .concat(Object.entries(lexemes_alt))
      .filter(([key, item]) => {
        if (item) {
          const matches = Object.entries(item).filter(([number, lexeme]) => {
            if (lexeme) {
              const matches = lexeme.forms.filter(x => {
                return x.toLowerCase() === searchPhrase.toLowerCase()
              })
              return matches.length > 0
            }
            return false
          })
          return matches.length > 0
        }
        return false
      })
    return [newResults, Object.keys(lexemes), returnOtherTerm, didyoumean]
  }


/*
* Add examples to example list data
*/
  _addExample(
    examples,
    item
  ) {
    if (item.text.includes(' && ')) {
      const splited = item.text.split(' && ')
      let number = 0
      for (const text of splited) {
        number += 1
        if (text === '-') continue
        const example = {
          id: item.sub_id.toString(),
          text: text
        }
        if (!(number in examples[item.id])) examples[item.id][number] = []
        examples[item.id][number].push(example)
      }
    } else {
      const example = {
        id: item.sub_id.toString(),
        text: item.text
      }
      if (!(1 in examples[item.id])) examples[item.id][1] = []
      examples[item.id][1].push(example)
    }
  }

/*
* Fix up the defintion text to remove unwanted code
*/
  _fixDefinitionText(
    definitions,
    extraDefinitionInfo
  ) {
    Object.entries(definitions).forEach(([id, object]) => {
      Object.entries(object).forEach(([number, definitionResponse]) => {
        if (definitionResponse.definitions) {
          let text = definitionResponse.definitions[0].gloss
          if (
            parseInt(id) in extraDefinitionInfo &&
            parseInt(number) in extraDefinitionInfo[parseInt(id)]
          ) {
            if (text !== extraDefinitionInfo[parseInt(id)][parseInt(number)]) {
              text += ': ' + extraDefinitionInfo[parseInt(id)][parseInt(number)]
            }
          }
          definitionResponse.definitions[0].gloss = text
            .replace(/~/g, '')
            .split(' &&')
            .join(';')
        }
      })
    })
  }

/*
* Add synonyms to lexemes
*/
  _fixSmsLexemeResults(
    lexemes,
    data,
    fromLexemes,
    params
  ) {
    return Object.entries(lexemes).map(([id, subObject]) => {
      return Object.entries(subObject).map(([key, lexeme]) => {
        const returnObj = {}
        const numberKey = parseInt(key)
        const numberId = parseInt(id)
        let definition = ''
        if (numberId in fromLexemes && numberKey in fromLexemes[numberId]) {
          definition = fromLexemes[numberId][numberKey]
          if (numberId in data) definition += ': ' + data[numberId][1]
        } else if (numberId in data) definition = data[numberId][1]
        const entry = {
          source: parseInt(lexeme.glossary),
          language: params.toLanguage,
          id: this.definitionIdTracker,
          url: '',
          gloss: definition,
          lastEditTime: Date.now().toString()
        }
        this.definitionIdTracker += 1
        if (definition !== '') returnObj.definitions = [entry]
        returnObj.lexeme = lexeme
        return returnObj
      })
    }).flat()
  }

/*
* Handle lexeme item and put into lexeme list
* Also adds inflections
*/
  _fixLexemeResults(
    lexemes,
    data,
    termExtension,
    smsTerms
  ) {
    return Object.entries(lexemes)
      .map(([key, subObject]) => {
        return Object.entries(subObject)
          .map(([id, object]) => {
            const returnObj = {}
            const numberKey = parseInt(key)
            const numberId = parseInt(id)
            if (!(numberId in data[numberKey])) {
              if (1 in data[numberKey]) {
                returnObj.definitions = data[numberKey][1].definitions
              } else {
                returnObj.definitions = []
              }
            } else {
              returnObj.definitions = data[numberKey][numberId].definitions
            }

            if (numberId in termExtension) {
              this._fixTerms(termExtension[numberKey][numberId], object)
            }
            /*
            if (key in smsTerms) {
              const extraForms = smsTerms[key]
              object.forms = object.forms.concat(extraForms)
            }
            */

            const forms = object.forms

            // const inflexions = forms.filter(x => !x.lemma).map(x => x.term)
            const lemmas = object.lemmas
            const lexeme = {
              id: object.id,
              foundIn: object.foundIn,
              language: object.language,
              forms,
              lemmas,
              glossary: object.glossary
            }

            returnObj.lexeme = lexeme
            return returnObj
          })
          .filter(x => {
            return x.lexeme && x.lexeme.lemmas.length > 0
          })
      })
      .flat()
  }

  _addToLexeme(
    item,
    lexemes,
    termExtension,
    searchString,
    params
  ) {
    if (!(item.id in lexemes)) lexemes[item.id] = {}
    if (!(item.id in termExtension)) termExtension[item.id] = {}
    if (item.text.includes(' && ')) {
      const splited = item.text.split(' && ')
      let number = 0
      for (const text of splited) {
        number += 1
        const result = this._createLexeme(
          text,
          searchString,
          params
        )
        termExtension[item.id][number] = result.base
        lexemes[item.id][number] = result.lexeme
      }
    } else {
      const number = 1
      const result = this._createLexeme(
        item.text,
        searchString,
        params
      )
      termExtension[item.id][number] = result.base
      lexemes[item.id][number] = result.lexeme
    }
  }

/*
* Create lexeme object
*/
  _createLexeme(
    text,
    searchString,
    params
  ) {
    const lexeme = {
      id: this.lexemeIdTracker.toString(),
      language: params.fromLanguage,
      forms: [],
      lemmas: []
    }
    const [term, base] = this._formatTerm(text, searchString)
    lexeme.lemmas.push(term)
    lexeme.forms.push(term)
    this.lexemeIdTracker += 1
    return {
      lexeme,
      base
    }
  }

/*
* Fix term form
*/
  _formatTerm(text, searchString) {
    if (text.indexOf(', ') !== -1) {
      const newText = text
        .split(',')
        .map(x => x.trim())
        .filter(x => x === searchString)[0]
      if (newText) text = newText
    }
    const [lemma, base] = this._formatLemma(text)
    this.termIdTracker += 1
    return [lemma, base]
  }

  _testIfSearchNewTerm(text) {
    const result = text.match(this.nextStringSearchRegex)
    if (result) return result[1]
    return null
  }

  _handleEntryString(string, params) {
    const returnObj = {}
    // Remove ^ which surrounds words that can be looked up in Lexin.
    string = string.replace(/\^/g, '')
    if (string.includes(' && ')) {
      const splited = string.split(' && ')
      let number = 0
      for (const text of splited) {
        number += 1
        const entry = {
          language: params.toLanguage,
          id: this.definitionIdTracker,
          url: '',
          gloss: text,
          lastEditTime: Date.now().toString()
        }
        this.definitionIdTracker += 1
        returnObj[number] = entry
      }
    } else {
      const number = 1
      const entry = {
        language: params.toLanguage,
        id: this.definitionIdTracker,
        url: '',
        gloss: string,
        lastEditTime: Date.now().toString()
      }
      this.definitionIdTracker += 1
      returnObj[number] = entry
    }
    return returnObj
  }

  /*
  * Fix lemma text
  */
  _formatLemma(lemma) {
    let base = lemma
    if (lemma.includes('~')) {
      const splitArray = lemma.split('~')
      lemma = splitArray.join('')
      splitArray.pop()
      base = splitArray.join('')
    }
    return [lemma, base]
  }

  /*
  * Fix term text with extensions
  */
  _fixTerms(termExtension, lexeme) {
    lexeme.forms = lexeme.forms.map(term => {
      if (term.includes('-')) {
        return term.replace('-', termExtension)
      } else {
        return term
      }
    })
  }

  /*
  * Fix up inflextion string
  */
  _handleinflexionstring(string) {
    const responseDict = {}
    if (string.includes('|')) {
      string = string.split('|').pop() || ''
    }
    if (string.includes(' && ')) {
      const splited = string.split(' && ')
      let number = 0
      for (const text of splited) {
        number += 1
        const terms = this._getTermsOutOfstring(text)
        responseDict[number] = terms
      }
    } else {
      const number = 1
      const terms = this._getTermsOutOfstring(string)
      responseDict[number] = terms
    }
    return responseDict
  }

  /*
  * Get a term out of a inflextion string
  */
  _getTermsOutOfstring(string) {
    const words = [...new Set(string.split(' '))]
    const terms = []
    words.forEach(word => {
      if (this._includeWord(word)) {
        if (word.endsWith(')')) {
          word = word.slice(0, -1)
        }
        const term = {
          id: this.termIdTracker,
          term: word,
          lemma: false
        }
        this.termIdTracker += 1
        terms.push(term)
      }
    })
    return terms
  }

  _includeWord(word) {
    return word && word.trim().length > 0 && !word.startsWith('(')
  }

  /*
  * Test what type of item an item from lexin result is.
  */
  _testType(type, target_langauge, target_type) {
    if (type.toLowerCase() == target_langauge + target_type) return true
    else if (target_langauge == 'n' && type.toLowerCase() == 'e' + target_type)
      return true
    else return false
  }

  /*
  * If there are more items in the lexeme respoonse fetch them
  * As there might a match on page 2 or later.
  */
  async *_fetchNext(
    fetchArray,
    params,
    searchPhrase,
    language
  ) {
    while (fetchArray.length > 0) {
      const fetching = fetchArray.slice(0, 20).map(x => x.toString())
      const payload = {
        'searchResArray[]': fetching.join(','),
        language: language
      }
      const compUrl = this.baseProtocol + this.nextUrl
      const newUrl = addQueryParams(compUrl, payload)
      const response = await client(newUrl)
      const responseJSON = JSON.parse(response.body)
     //  const response = await this._ajaxGET(compUrl, { params: payload })
      const [results, fetchedElements, seeOtherTerm, didyoumean] = this._formatResponse(
        searchPhrase,
        params,
        responseJSON
      )
      if (results.length > 0) yield { results, didyoumean }
      fetchArray = fetchArray.slice(20)
      /*
      if (fetchArray.length === 0) {
        yield {finish: true}
      }
      */
    }
  }

  /*
  * Special case when getting from english translations
  * as lexin do not have english need to use bokmål search
  */
  async _fetchFromEnglishTranslation(
    items,
    optionsParams
  ) {
    const wordsLink = items
      .map(([words, lexeme]) => {
        return words.map((word) => {
          return [word, lexeme]
        })
      })
      .flat()
    let returnObj = []
    for (const [term, lexeme] of wordsLink) {
      const url = this.baseProtocol + this.baseUrl
      const params = this._generateLexinParams(term, optionsParams)
      const response = await this._ajaxGET(url, { params })
      optionsParams.fromLanguage = 'en'
      const [
        en_Result,
        foundResults,
        seeOtherTerm,
        didyoumean
      ] = this._formatResponse(term, optionsParams, response.result)
      const newResult = en_Result.map(x => {
        if (x.definitions) {
          x.definitions = x.definitions.map(def => {
            def.gloss =
              'Funnet via engelske ordet "' + term + '":<br>' + def.gloss
            return def
          })
        }
        x.lexeme = lexeme
        return x
      })
      returnObj = returnObj.concat(newResult.flat())
    }
    return returnObj
  }
}

function addQueryParams(url, paramsObject) {
  const stringParams = Object.entries(paramsObject)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join('&')
  return `${url}?${stringParams}`
}
