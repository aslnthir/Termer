
export class FellesdatakatalogAPI {
  constructor () {
    this.lexemeidTracker = 1
    this.sourceIdTracker = 1
    this.searchUrl = 'https://www.fellesdatakatalog.digdir.no/api/concepts?aggregations=orgPath&q='
    this.sources = this.generateSources()
    this.conceptUrl = 'https://data.norge.no/concepts/'
  }
  async search (term) {
    const url = this.searchUrl + term
    const result = await fetch(url)
    if (result.ok) {
      const r2 = await result.json()
      return this.formatSearchRespose(r2, term)
    } else {
      return null
    }
  }

  getSources () {
    return this.sources
  }

  formatSearchRespose (response, searchTerm) {
    const concepts = (response._embedded || {}).concepts
    if (!concepts) return []
    const searchResult = []
    concepts.forEach((item, i) => {
      if (item.prefLabel.nb.toLowerCase().trim() !== searchTerm.toLowerCase()) return
      const glossaryId = this.getGlossaryId(item)
      const sourceID = glossaryId
      const id = this.lexemeidTracker.toString()
      const lexeme = {
          "id": id,
          "foundIn": sourceID,
          "glossary": glossaryId,
          "language": "nb",
          "terms": [
              {
                  "id": id,
                  "term": item.prefLabel.nb,
                  "lemma": true
              }
          ],
          "lemmas": [item.prefLabel.nb],
          "forms": [item.prefLabel.nb]
      }
      // const translationObjs = []
      // const definitionObjs = []
      const definitionObject = {
        "id": item.id,
        "gloss": item.definition.text.nb.trim(),
        "source": sourceID,
        "last_edit_time": undefined,
        "source_language_pair": glossaryId,
        "comments": undefined,
        "domains": [],
        "url": this.conceptUrl + item.id,
        "language": "nb"
      }
      this.lexemeidTracker += 1
      // definitionObjs.push(defObj)
      // return {'lexeme': lexemeObj, 'translations': translationObjs, 'definitions': definitionObjs}
      searchResult.push({
        lexeme,
        definitions: [definitionObject]
      })
    })
    return searchResult
  }

  getGlossaryId (data) {
    let label = data.publisher.prefLabel
    if (!label) label = data.publisher.name
    if (label === 'SKATTEETATEN') return '1'
    else if (label === 'REGISTERENHETEN I BRØNNØYSUND') return '2'
    else if (label === 'DIGITALISERINGSDIREKTORATET') return '3'
    else if (label === 'ARKIVVERKET') return '4'
    else if (label === 'POLITI- OG LENSMANNSETATEN') return '5'
    else if (label === 'BERGEN KOMMUNE') return '6'
    else return '7'
  }

  generateSources () {
    const sources = []
    sources.push(this.generateSource('Skatteetaten'))
    sources.push(this.generateSource('Registerenheten i brønnøysund'))
    sources.push(this.generateSource('Digitaliseringsdirektoratet'))
    sources.push(this.generateSource('Arkivverket'))
    sources.push(this.generateSource('Politi- og lensmannsetaten'))
    sources.push(this.generateSource('Bergen kommune'))
    sources.push(this.generateSource('Felles Datakatalogen'))
    return sources
  }

  generateSource (name) {
    const source = {
      id: this.sourceIdTracker.toString(),
      permissions: {
        write: false,
        read: true
      },
      inApikey: false,
      logoUrl: '',
      inputLanguages: {'nb': ['nb']},
      name: name,
      displayname: name,
      url: 'https://data.norge.no/concepts',
      description: 'Results from ' + name,
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      markupWords: false,
      externalData: false,
      inGarbage: false,
      owner: null,
      terms: null,
      glossaries: this.generateGlossaries(name)
    }
    this.sourceIdTracker += 1
    return source
  }

  generateGlossaries (name) {
    const skatt = {
      id: this.sourceIdTracker.toString(),
      url: 'https://data.norge.no/concepts',
      name: name,
      displayname: name,
      sourceLanguage: 'nb',
      targetLanguage: 'nb'
    }
    return [
      skatt
    ]
  }
}
