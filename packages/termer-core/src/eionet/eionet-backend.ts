import { Lexeme, Definition, Source, Glossary } from '../entry'
import { GlossaryCompoundId } from 'src/model'

export class EionetAPI {
  private source: Source | null

  private languages: Record<string, string[]> | null

  private languageRequestOngoing: boolean

  private baseUrl: string = ''

  private disambiguationURL: string = ''

  private baseProtocol: string = ''

  private urlParams: Record<string, string> = {}

  private searchOptions: Record<string, string> = {}

  private termIdTracker: number

  private lexemeIdTracker: number

  private definitionIdTracker: number

  private glossaryIdTracker: number

  public constructor() {
    this.baseUrl = 'https://www.eionet.europa.eu'
    this.termIdTracker = 1
    this.lexemeIdTracker = 1
    this.definitionIdTracker = 1
    this.glossaryIdTracker = 1
    this.source = null
    this.languages = null
    this.languageRequestOngoing = false
    this.urlParams = {
    }
  }

  public async termSearch(
    term: string,
    glossary: Glossary,
    sourceId: string
  ): Promise<
    null | { error: Error } | { lexeme: Lexeme; definitions: Definition[] }
  > {
    const sourceLanguage = this._fixLookupLanguage(glossary.sourceLanguage)
    const targetLanguage = this._fixLookupLanguage(glossary.targetLanguage)
    const urlPath = this.baseUrl + '/gemet/getConceptsMatchingKeyword'
    const urlParams = '?thesaurus_uri=http://www.eionet.europa.eu/gemet/concept/' +
    '&search_mode=0&language=' + sourceLanguage +
    '&keyword=' + term
    const url = urlPath + urlParams
    const result = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    })
    if (result.ok) {
      const jsonResult = await result.json()
      const lexeme: Lexeme = {
        'id': this.lexemeIdTracker.toString(),
        'glossary': glossary.id,
        'foundIn': sourceId,
        'language': sourceLanguage,
        'lemmas': [term],
        'forms': []
      }
      this.lexemeIdTracker += 1
      const definitions: Definition[] = []
      for (const concept of jsonResult) {
        if (sourceLanguage === targetLanguage) {
          if ('definition' in concept) {
            const glossString = concept['definition']['string']
            const definition: Definition = {
              'id': this.definitionIdTracker.toString(),
              'gloss': glossString,
              'language': targetLanguage,
              'url': concept.uri
            }
            this.definitionIdTracker += 1
            definitions.push(definition)
          }
        } else {
          const conceptUri: string = concept['uri']
          const trasnlationResult = await this._extraLookupStep(
            conceptUri,
            targetLanguage
          )
          if (trasnlationResult.ok) {
            const translationConcept = await trasnlationResult.json()
            let glossString = translationConcept['preferredLabel']['string']
            if ('definition' in translationConcept) {
              glossString += ': ' + translationConcept['definition']['string']
            }
            const definition: Definition = {
              'id': this.definitionIdTracker.toString(),
              'gloss': glossString,
              'language': targetLanguage
            }
            this.definitionIdTracker += 1
            definitions.push(definition)
          }
        }
      }
      if (definitions.length > 0) {
        return {
          lexeme,
          definitions
        }
      } else {
        return null
      }

    } else {
      return {
        'error': Error('Failed to fetch data')
      }
    }
  }

  public async getSource(): Promise<Source> {
    if (!this.source) {
      this.source = await this._generateSource()
    }
    return this.source
  }

  public async getSourceList(): Promise<Source[]> {
    if (!this.source) {
      this.source = await this._generateSource()
    }
    return [this.source]
  }

  public async getLanguages(): Promise<[string, string][]> {
    const langs = await this._getFixedLanguages()
    const returnArray: [string, string][] = []
    Object.entries(langs).forEach(([lang1, [lang2]]) => {
      const ar: [string, string] = [lang1, lang2]
      returnArray.push(ar)
    })
    return returnArray
  }

  private async _extraLookupStep(
    conceptUri: string,
    langauge: string
  ) {
    // https://www.eionet.europa.eu/gemet/getConcept?concept_uri=http://www.eionet.europa.eu/gemet/concept/245&language=no
    const urlPath = this.baseUrl + '/gemet/getConcept'
    const urlParams = '?concept_uri=' + conceptUri +
    '&language=' + langauge
    const url = urlPath + urlParams
    const result = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    })
    return result
  }

  private async _getLanguages(): Promise<string[] | null> {
    const languageUrl = this.baseUrl + '/gemet/getSupportedLanguages?thesaurus_uri=http://www.eionet.europa.eu/gemet/concept/'
    const result = await fetch(languageUrl.toString(), {
      method: 'GET',
      mode: 'cors',
    })
    if (result.ok) {
      return result.json()
    } else {
      return null
    }
  }

  private _fixLanguage(language: string): string {
    if (language.includes('-')) {
      language = language.split('-')[0]
    }
    if (language === 'no') {
      language = 'nb'
    }
    return language
  }

  private _fixLookupLanguage(language: string): string {
    if (language === 'nb') {
      language = 'no'
    }
    return language
  }

  private async _getFixedLanguages(): Promise<Record<string, string[]>> {
    const response = await this._finishedGetLanguages()
    if (!this.languages) {
      const fetchedLangs = await this._getLanguages()
      if (fetchedLangs) {
        const returnObj: Record<string, string[]> = {}
        const fixedLangs = [...new Set(fetchedLangs.map(x => this._fixLanguage(x)))]
        fixedLangs.forEach(x => {
          returnObj[x] = fixedLangs
        })
        this.languages = returnObj
        return returnObj
      } else {
        this.languages = {}
        return {}
      }
    } else {
      return this.languages
    }
  }

  private async _finishedGetLanguages(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.languages || !this.languageRequestOngoing) {
        this.languageRequestOngoing = true
        resolve(true)
      } else {
        const self = this
        setTimeout(function () {
          self._finishedGetLanguages().then(result => {
            resolve(result)
          })
        }
        , 2000)
      }
    })
  }

  private async _generateSource(): Promise<Source> {
    const languages = await this._getFixedLanguages()
    const source: Source = {
      id: '1',
      permissions: {
        write: false,
        read: false
      },
      defaultApikey: false,
      logoUrl: '',
      inputLanguages: languages,
      name: 'GEMET',
      displayname: 'GEMET',
      url: 'https://www.eionet.europa.eu/',
      description: 'The European Environment Information and Observation Network'
      + ' (Eionet) is a partnership network of the European Environment Agency '
      + '(EEA) and its 39 member and cooperating countries. The EEA is '
      + 'responsible for developing Eionet and coordinating its activities '
      + 'together with National Focal Points (NFPs) in the countries.',
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      markupWords: false,
      externalData: false,
      inGarbage: false,
      owner: null,
      terms: null,
      glossaries: this._generateGlossaries(languages)
    }
    return source
  }

  private _generateGlossaries(languages: Record<string, string[]>): Glossary[] {
    const returnList: Glossary[] = []
    let glossaryIdTracker = 1
    Object.entries(languages).forEach(([sourceLanguage, targetLanguages]) => {
      targetLanguages.forEach(targetLangauge => {
        returnList.push({
          id: glossaryIdTracker.toString(),
          url: 'https://www.eionet.europa.eu/',
          name: 'GEMET',
          displayname: 'European Environment Information and Observation Network',
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        glossaryIdTracker += 1
      })
    })
    return returnList
  }

  private _languages(): [string, string][] {
    return []
  }

}
