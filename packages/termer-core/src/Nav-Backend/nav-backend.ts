import { Lexeme, Definition, Source, Glossary } from '../entry'

type WordlistResponse = {
  hits: {
    hits: { _source: { title: string } }[
    ]
  }
}


export class NavAPI {
  private source: Source

  private baseUrl: string = 'https://data.nav.no/api/dcat'

  private lexemeIdTracker: number = 1

  private navLookups: Record<string, TermerResults[]> = {}

  private scrapeIndex: number = 0

  private requestSize: number = 300

  private wordlist?: Promise<string[]>


  public constructor() {
    this.source = this._generateSource()
    // this.fetchAllData()
  }

  public async termSearch(
    term: string,
    langauge: string
  ): Promise<
    null | { error: Error } | TermerResults[]
  > {
    const results = await this._searchNav(term)
    let formatResult = null
    if (results) {
      formatResult = this._formatResponse(results, term)
    }
    return formatResult
  }

  public async getSource(): Promise<Source> {
    return this.source
  }

  public async getSourceList(): Promise<Source[]> {
    return [this.source]
  }

  public async getLanguages(): Promise<[string, string][]> {
    return [['nb', 'Norwegian Bokmål']]
  }

  public async getWordlist(): Promise<string[]> {
    if (!this.wordlist) {
      this.wordlist = new Promise(async (resolve) => {
        const jsonData = await this.fetchData()
        const wordlist = jsonData.hits.hits.map(({ _source }) => _source.title.toLowerCase())
        resolve(wordlist)
      })
    }
    return this.wordlist
  }

  private _handleLanguage (language: string): string {
    if (language === 'Norsk') return 'nb'
    else return language
  }

  private _refrenceUrl (termId: string): string {
    const url = "https://data.nav.no/begrep/"
    return url + termId
  }

  private _formatResponse (response: NavResponse, searchTerm: string): TermerResults[] {
    const results: TermerResults[] = []
    response.hits.hits.forEach(x => {
      if (!this._matchSearch(searchTerm, x._source)) return
      const term = this._cleanTerm(x._source.term)
      const lemmas = [term]
      const forms = [term, ]
      let altTerm
      if (x._source.content.alternativ_navn) {
        altTerm = this._cleanTerm(x._source.content.alternativ_navn)
        forms.push(altTerm)
      }
      const repsonseLangauge = this._handleLanguage(x._source.language)
      let glossaryId = ''
      for (const glossary of this.source.glossaries) {
        if (repsonseLangauge === glossary.sourceLanguage) {
          glossaryId = glossary.id
          break
        }
      }
      const lexeme: Lexeme = {
        id: this.lexemeIdTracker.toString(),
        foundIn: this.source.id,
        language: repsonseLangauge,
        lemmas: lemmas,
        forms: forms,
        glossary: glossaryId
      }
      this.lexemeIdTracker += 1
      const definition: Definition = {
        id: x._source.id,
        gloss: this._handleDescription(x._source),
        lastEditTime: x._source.modified,
        language: repsonseLangauge,
        url: this._refrenceUrl(x._source.id)
      }
      const definitions = [definition]
      results.push({
        lexeme,
        definitions
      })
    })
    return results
  }

  private _handleDescription (sourceData: NavSource): string {
    let startDescription = sourceData.description
    if (sourceData.content.clean_begrepsforklaring) {
      let re = /_/gi
      startDescription += '<br><br>Begrepsforklaring:<br>' +
      sourceData.content.clean_begrepsforklaring.replace(re, '')
    }
    return startDescription
  }

  private _matchSearch (searchTerm: string, navResponse: NavSource) {
    let alt_names: string[] = []
    if (navResponse.content.alternativ_navn) {
      alt_names = navResponse.content.alternativ_navn.split(', ').map(x => x.toLowerCase())
    }
    return navResponse.type === 'godkjent_begrep' && (
      this._cleanTerm(navResponse.term).toLowerCase() === searchTerm.toLowerCase() ||
        alt_names.includes(searchTerm.toLowerCase())
      )
  }

  private async _searchNav<T>(
    term: string
  ): Promise<NavResponse | null> {
    const bodyData = {
      "query":{
        "bool":{
          "must":[
            {
              "multi_match":{
                "query":term,
                "fields":[
                  "title^18",
                  "content.alternativ_navn^6"
                ]
              }
            }
          ]
        }
      }
    }

    const body = JSON.stringify(bodyData)
    const result = await fetch(this.baseUrl, {
      "body": body,
      "method": "POST",
      "mode": "cors",
    })
    if (result.ok) {
      return result.json()
    } else {
      return null
    }
  }

  private _generateSource(): Source {
    const languages = {
      nb: ['nb']
    }
    const source: Source = {
      id: '1',
      permissions: {
        write: false,
        read: false
      },
      defaultApikey: false,
      logoUrl: '',
      inputLanguages: languages,
      name: 'Arbeids- og velferdsforvaltningen',
      displayname: 'NAV',
      url: 'https://www.nav.no/',
      description: 'Begrepskatalogen til NAV',
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      markupWords: true,
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
          url: 'https://data.nav.no/',
          name: 'Arbeids- og velferdsforvaltningen',
          displayname: 'NAV',
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        glossaryIdTracker += 1
      })
    })
    return returnList
  }

  private _cleanTerm (term: string): string {
    return term.replace(/"/, '').trim()
  }

  private async fetchData(): Promise<WordlistResponse> {
    const bodyData = {
      "query": {
        "bool": {
          "must": [
            {
              "match":{
                "type":"godkjent_begrep"
              }
            }
          ]
        }
      },
      "size":1000,
      "_source": "title"
    }
    const body = JSON.stringify(bodyData)
    const result = await fetch(this.baseUrl, {
      "body": body,
      "method": "POST",
      "mode": "cors",
    })
    return result.json()
  }

  _waitFor(conditionFunction: Function) {
    const poll = (resolve: Function) => {
      if (conditionFunction()) resolve()
      else setTimeout(_ => poll(resolve), 400)
    }
    return new Promise(poll)
  }
}


interface NavResponse {
  took: number // integer
  timed_out: boolean
  hits: NavResult
}

interface NavResult {
  hits: NavHit[]
  max_score: number
  total: number
}

interface NavHit {
  _id: string
  _inedx: string
  _score: number
  _source: NavSource
  _type: string
}

interface NavSource {
  accessRights: string[]
  accessRightsComment: string
  accrualPeriodicity: string
  byteSize: number[]
  category: string
  description: string
  distribution: string[]
  format: string
  id: string
  issued: string
  keyword: string[]
  language: string
  license: NavLicense
  modified: string
  provenance: string
  publisher: NavPublisher
  rights: string[]
  spatial: string[]
  status: string
  suggest: string
  temporal: string[]
  term: string
  theme: string[]
  title: string
  type: string
  versionInfo: string
  versionNotes: string[]
  content: NavContent
}

interface NavPublisher {
  name: string
  publisher_url: string
}

interface NavLicense {
  name: string
  url: string
}

interface NavContent {
  alternativ_navn: string
  begrepsforklaring: string
  clean_begrepsforklaring: string
  clean_definisjon: string
  clean_eksempel: string
  clean_kilde: string
  definisjon: string
  eksempel: string
  fagomrade: string
  id: string
  kilde: string
  offentlig_tilgjengelig: string
  oppdatert: string
  status: string
  term: string
  type: string
}

interface TermerResults {
  lexeme: Lexeme
  definitions: Definition[]
}
/*
fetch("https://data.nav.no/api/odata", {
 "body": "{\"highlight\":{\"boundary_scanner_locale\":\"no-NO\",\"fragment_size\":200,\"number_of_fragments\":1,\"fields\":{\"title\":{},\"description\":{}}},\"aggs\":{\"type\":{\"terms\":{\"field\":\"type.keyword\",\"size\":30}},\"format\":{\"terms\":{\"field\":\"format.keyword\",\"size\":30}},\"theme\":{\"terms\":{\"field\":\"theme.keyword\",\"size\":30}}},\"query\":{\"bool\":{\"must\":[{\"match_all\":{}}],\"filter\":[{\"bool\":{\"filter\":[[{\"term\":{\"format.keyword\":\"godkjent_begrep\"}}]]}}]}},\"size\":30}",
});

fetch("https://data.nav.no/api/odata", {
 "body": "{\"highlight\":{\"boundary_scanner_locale\":\"no-NO\",\"fragment_size\":200,\"number_of_fragments\":1,\"fields\":{\"title\":{},\"description\":{}}},\"aggs\":{\"type\":{\"terms\":{\"field\":\"type.keyword\",\"size\":30}},\"format\":{\"terms\":{\"field\":\"format.keyword\",\"size\":30}},\"theme\":{\"terms\":{\"field\":\"theme.keyword\",\"size\":30}}},\"query\":{\"bool\":{\"must\":[{\"match_all\":{}}],\"filter\":[{\"bool\":{\"filter\":[[{\"term\":{\"format.keyword\":\"godkjent_begrep\"}}]]}}]}},\"size\":30,\"from\":30}",
});

fetch("https://data.nav.no/api/odata", {
  "body": "{\"highlight\":{\"boundary_scanner_locale\":\"no-NO\",\"fragment_size\":200,\"number_of_fragments\":1,\"fields\":{\"title\":{},\"description\":{}}},\"aggs\":{\"type\":{\"terms\":{\"field\":\"type.keyword\",\"size\":30}},\"format\":{\"terms\":{\"field\":\"format.keyword\",\"size\":30}},\"theme\":{\"terms\":{\"field\":\"theme.keyword\",\"size\":30}}},\"query\":{\"bool\":{\"must\":[{\"multi_match\":{\"query\":\"sivil\",\"type\":\"best_fields\",\"fields\":[\"title^20\",\"decription^6\",\"title.search^2\",\"description.search\"]}}]}},\"size\":30}",
});
*/
