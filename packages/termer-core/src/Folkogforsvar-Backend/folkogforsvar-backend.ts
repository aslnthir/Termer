import { Lexeme, Definition, Source, Glossary } from '../entry'

type WordlistResponse = {
  hits: {
    hits: { _source: { title: string } }[
    ]
  }
}


export class FofAPI {
  private source: Source

  private baseUrl: string = 'https://lmqx7c0rpg-dsn.algolia.net/1/indexes/*/queries'


  public constructor() {
    this.source = this._generateSource()
    // this.fetchAllData()
  }

  public async termSearch(
    term: string
  ): Promise<
    null | { error: Error } | TermerResults[]
  > {
    const results = await this._searchFof(term)
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
    /*
    if (!this.wordlist) {
      this.wordlist = new Promise(async (resolve) => {
        const jsonData = await this.fetchData()
        const wordlist = jsonData.hits.hits.map(({ _source }) => _source.title.toLowerCase())
        resolve(wordlist)
      })
    }
    return this.wordlist
    */
    return []
  }

  private _handleLanguage (language: string): string {
    if (language === 'Norsk') return 'nb'
    else return language
  }

  private _refrenceUrl (termId: string): string {
    const url = "https://data.nav.no/begrep/"
    return url + termId
  }

  private _formatResponse (response: FofResponse, searchTerm: string): TermerResults[] {
    const results: TermerResults[] = []
    let glossaryId = ''
    for (const glossary of this.source.glossaries) {
      if ('nb' === glossary.sourceLanguage) {
        glossaryId = glossary.id
        break
      }
    }
    response.results.forEach(r => {
      r.hits.forEach(hit => {
        if (hit.post_title.toLowerCase() === searchTerm.toLowerCase() &&
        hit.post_type_label.toLowerCase() === 'leksikon') {

          const definition: Definition = {
            id: 'd-' + hit.objectID,
            gloss: hit.post_excerpt,
            lastEditTime: hit.post_modified.toString(),
            language: 'nb',
            url: hit.permalink,
            references: []
          }

          const lexeme: Lexeme = {
            id: 'l-' + hit.objectID,
            foundIn: this.source.id,
            language: 'nb',
            lemmas: [searchTerm],
            forms: [searchTerm],
            glossary: glossaryId
          }

          const definitions = [definition]
          results.push({
            lexeme,
            definitions
          })
        }
      })
    })
    return results
  }

  private async _searchFof<T>(
    term: string
  ): Promise<FofResponse | null> {
    const queryString = "hitsPerPage=5&maxValuesPerFacet=10&page=0" +
    "&highlightPreTag=%3Cspan%20class%3D%22highlight%22%3E" +
    "&highlightPostTag=%3C%2Fspan%3E&facetingAfterDistinct=true" +
    "&facets=%5B%22post_type_label%22%5D&query=" + term
    const bodyData = {
      "requests": [
        {
            "indexName":"forsvar_live_searchable_posts",
            "params": queryString
        }
      ]
    }

    const urlParams = {
      'x-algolia-agent': 'Algolia%20for%20vanilla%20JavaScript%20(lite)' +
      '%203.27.1%3Binstantsearch.js%201.12.1%3BJS%20Helper%202.26.0',
      'x-algolia-application-id': 'LMQX7C0RPG',
      'x-algolia-api-key': '31c2e8bef575671179fee98ee953ef6b'
    }

    const lookupURL = this.baseUrl + '?' + new URLSearchParams(urlParams)
    const body = JSON.stringify(bodyData)
    const result = await fetch(lookupURL, {
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
      name: 'Folk og Forsvar Leksikon',
      displayname: 'FoF',
      url: 'https://folkogforsvar.no/leksikon/',
      description: 'Begrepskatalogen til Folk og Forsvar',
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      inApikey: false,
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
          url: 'https://folkogforsvar.no/leksikon/',
          name: 'Folk og Forsvar Leksikon',
          displayname: 'FoF',
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        glossaryIdTracker += 1
      })
    })
    return returnList
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


interface FofResponse {
  took: number // integer
  timed_out: boolean
  results: FofResult[]
}

interface FofResult {
  hits: FofHit[]
  max_score: number
  total: number
}

interface FofHit {
  comment_count: number
  content: string
  images: string[]
  is_sticky: number
  menu_order: number
  objectID: string
  permalink: string
  post_date: number
  post_date_formatted: string
  post_excerpt: string
  post_id: number
  post_mime_type: string
  post_modified: number
  post_title: string
  post_type: string
  post_type_label: string
}

interface FofSource {
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
  license: FofLicense
  modified: string
  provenance: string
  publisher: FofPublisher
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
  content: FofContent
}

interface FofPublisher {
  name: string
  publisher_url: string
}

interface FofLicense {
  name: string
  url: string
}

interface FofContent {
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
