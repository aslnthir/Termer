/*
 * Vertraulich
 */

import GlossaryAPIBase from './api-base'

export class SemanticMediaWikiAPI extends GlossaryAPIBase {
  constructor ({smwProps, url, defaultSources}) {
    super()
    this.endpointURL = '/api.php'
    this.smwProps = {}
    this.defaultSources = []

    // We’ll keep a cache of the source urls here instead of making separate
    // requests for the source info.
    this.sourceUrlCache = {}

    if (url) this.endpointURL = url
    if (smwProps) this.smwProps = smwProps
    if (defaultSources) this.defaultSources = defaultSources
  }

  termSearchURL ({categories, term}) {
    // SMW quirk: OR works on the whole query, so categories must be repeated.
    const askQuery = categories +
      `[[${term}]]` +
      (this.smwProps.otherForms ? ` OR ${categories}[[${this.smwProps.otherForms}::${term}]]` : '') +
      (this.smwProps.definition ? `|?${this.smwProps.definition}` : '') +
      (this.smwProps.source ? `|?${this.smwProps.source}` : '') +
      (this.smwProps.image ? `|?${this.smwProps.image}` : '')
    return this.askQueryURL(askQuery)
  }

  wordlistURL ({categories}) {
    const askQuery = `${categories}|limit=999999|?${this.smwProps.otherForms}`
    return this.askQueryURL(askQuery)
  }

  askQueryURL (askQuery) {
    askQuery = encodeURIComponent(askQuery)
    const url = this.endpointURL +
      '?action=ask&maxage=600&format=json' +
      '&origin=' + window.location.origin +
      '&query=' + askQuery
    return url
  }

  getSource (sourceId, params) {
    let source = {
      name: sourceId,
      url: this.sourceUrlCache[sourceId]
    }
    return new Promise((resolve, reject) => resolve(source))
  }

  getSourceList (params) {
    let sourceList = []
    for (let sourceId of Object.keys(this.sourceUrlCache)) {
      sourceList.push({id: sourceId, name: sourceId})
    }
    return new Promise((resolve, reject) => resolve({results: sourceList}))
  }

  termSearch (term, params) {
    let categories = ''
    if (params.sources && params.sources.length) {
      categories = `[[${this.smwProps.source}:${params.sources.join('||')}]]`
    }

    let url = this.termSearchURL({categories, term})

    return this._ajaxGET(url).then(response => {
      if (Array.isArray(response.query.results)) {
        return this._getResultsFromArrayResponse(response.query.results, params.sources)
      } else {
        // assume results is an Object
        return this._getResultsFromObjectResponse(response.query.results, params.sources)
      }
    })
  }

  getWordlist () {
    if (!this.defaultSources || !this.defaultSources.length) {
      return new Promise(resolve => resolve([]))
    }
    const categories = `[[${this.smwProps.source}:${this.defaultSources.join('||')}]]`
    const url = this.wordlistURL({categories})
    return this._ajaxGET(url)
      .then(result => {
        return this._getWordlist(result.query.results)
      })
      .catch(reason => {
        console.warn('Couln’t get wordlist:', reason)
        return []
      })
  }

  /* Override ajaxGET, adding additional preprocessing of the response. */
  _ajaxGET (url, args) {
    return super._ajaxGET(url, args).then(response => {
      if (!response.query ||
          Object.keys(response.query).length === 0) {
        let err = 'Invalid response from server: missing or empty “query” entry'
        throw err
      } else if (!response.query.results) {
        // replace missing results list with an empty list
        response.query.results = []
      }
      return response
    })
  }

  /* Handle the case where query.results is an Object
   * (for instance www.wien.gv.at/wiki/)
   */
  _getResultsFromObjectResponse (results, sources) {
    let result = {results: []}
    for (let key of Object.keys(results)) {
      let x = results[key]
      let meanings = this._getDefinitions(x.printouts)
      if (!meanings || meanings.length === 0) {
        meanings = [key]
      }
      let source = this._getSourceId(x.printouts, sources)
      let images = this._getImages(x.printouts)
      for (let meaning of meanings) {
        let y = {
          lexemes: [{
            source: source,
            id: x.fullurl, // XXX: get real id
            terms: [{
              term: x.fulltext,
              id: x.fullurl // XXX: see above
            }]
          }],
          source,
          meaning,
          images,
          url: x.fullurl,
          id: x.fullurl // XXX: see above
        }
        result.results.push(y)
      }
    }
    return result
  }

  /* Handle the case where query.results is an Array
   * (for instance termwiki.sprakradet.no)
   */
  _getResultsFromArrayResponse (results, sources) {
    let result = {results: []}
    for (let x of results) {
      let meanings = this._getDefinitions(x.printouts)
      for (let meaning of meanings) {
        result.results.push({
          term: x.fulltext,
          source: this._getSourceId(x.printouts, sources),
          meaning
        })
      }
    }
    return result
  }

  _getDefinitions (printouts) {
    // Finds the definitions in the printout set.
    const definitions = this._getPrintoutPropertyValue(printouts, this.smwProps.definition)
    return definitions.map(wikimarkup2html)
  }

  _getImages (printouts) {
    let images = this._getPrintoutPropertyValue(printouts, this.smwProps.image)
    if (!images || !images.length) return null
    images = images.map(x => {
      let url = x.fullurl
      // Fix image url with regex replace.
      // Add the “File:” prefix to the image file name if neither “Datei:”
      // (German) or “File:” (English) prefix is present.
      //
      // Explanation of the regex:
      // - (.+?\/) -- non-greedy match any character, then a /.
      // - (?!(?:Datei|File):) -- negative lookahead for the prefixes. I.e,
      //   this generates a match only if the prefixes are not present.
      // - [^\/]+ -- match any character that is not a slash. this is the file
      //   name.
      url = url.replace(/(.+?\/)((?!(?:Datei|File):)[^/]+)$/, '$1File:$2')
      return { url }
    })
    return images
  }

  getImageURL (url) {
    const filename = url.replace(/.+?\/([^/]+)$/, '$1')
    url = this.endpointURL +
      '?action=query&prop=imageinfo&iiprop=url&iiurlwidth=120&format=json' +
      '&maxage=600&origin=' + window.location.origin +
      '&titles=' + filename
    return this._ajaxGET(url)
    .then(response => {
      let query, pages, pageId, page, imageinfos, imageinfo, imageurl
      const hasImageUrl = (
        (query = response.query) &&
        (pages = query.pages) &&
        (pageId = Object.keys(pages)[0]) &&
        (page = pages[pageId]) &&
        (imageinfos = page.imageinfo) &&
        (imageinfo = imageinfos[0]) &&
        (imageurl = imageinfo.url)
      )
      if (hasImageUrl) {
        return {url: imageurl, thumbnail: imageinfo.thumburl}
      } else {
        return null
      }
    })
  }

  _getPrintoutPropertyValue (printouts, property) {
    // Finds the value of property in the printout set.
    if (Array.isArray(printouts)) {
      return this._getValueFromPrintoutArray(printouts, property)
    } else {
      // assume printouts is an Object.
      return this._getValuesFromPrintoutObject(printouts, property)
    }
  }

  _getValueFromPrintoutArray (printouts, property) {
    let valuePrintout = printouts.find(x => x.label === property)
    if (!valuePrintout) return []

    let values = []
    for (let key of Object.keys(valuePrintout).filter(x => x !== 'label')) {
      values.push(valuePrintout[key])
    }
    return values.filter(x => x)
  }

  _getValuesFromPrintoutObject (printouts, property) {
    let valuePrintout = printouts[property]
    if (!valuePrintout) return []
    return valuePrintout.filter(x => x)
  }

  _getSourceId (printouts, sources) {
    // Finds the definitions in the printout set.
    if (Array.isArray(printouts)) {
      return this._getSourceIdFromPrintoutArray(printouts, sources)
    } else {
      // assume printouts is an Object.
      return this._getSourceIdFromPrintoutObject(printouts, sources)
    }
  }

  _getSourceIdFromPrintoutArray (printouts, sources) {
    // Find the first category that is not “Termpost” and return it
    // (this category should be equivalent to the terms source)
    let sourcePrintout = printouts.find(x => x.label === this.smwProps.source)
    if (!(sourcePrintout instanceof Object)) return
    for (let key of Object.keys(sourcePrintout)) {
      let val = sourcePrintout[key]
      if (val.fulltext !== `${this.smwProps.source}:Termpost`) {
        let sourceId = val.fulltext.split(`${this.smwProps.source}:`)
        sourceId = sourceId[1]
        // cache the returned URL
        this.sourceUrlCache[sourceId] = val.fullurl
        return sourceId
      }
    }
  }

  _getSourceIdFromPrintoutObject (printouts, sources) {
    if (!sources) sources = []
    let sourcePrintout = printouts[this.smwProps.source]
    for (let val of sourcePrintout) {
      let thisSource = val.fulltext.split(`${this.smwProps.source}:`)[1]
      let isEnabledSource = sources.findIndex(source => source === thisSource) > -1
      if (isEnabledSource) {
        this.sourceUrlCache[thisSource] = val.fullurl
        // We don’t know how to handle multiple sources; just return the first found.
        return thisSource
      }
    }
    return '*'
  }

  _getWordlist (results) {
    let wordlist = []
    for (let key of Object.keys(results)) {
      let x = results[key]
      let term = x.fulltext
      term = this._processTerm(term)
      wordlist.push(term)

      if (x.printouts && x.printouts[this.smwProps.otherForms]) {
        for (const t of x.printouts[this.smwProps.otherForms]) {
          wordlist.push(this._processTerm(t))
        }
      }
    }
    return wordlist
  }

  _processTerm (term) {
    const r = term.slice(1)
    if (r.toLowerCase() === r) {
      // terms with a leading capital letter are case insensitive
      term = term.toLowerCase()
    }
    return term
  }
}

function wikimarkup2html (markup) {
  // replace '''bold text''' with <b>bold text</b>
  markup = markup.replace(/'''([^(?:''')]+)'''/g, '<b>$1</b>')
  // replace [[link text]] with link text.
  markup = markup.replace(/\[\[([^(?:\]\])]+)\]\]/g, '$1')
  return markup
}
