import { Lexeme, Definition, Source, Glossary } from '../entry'

export class DatakatalogAPI {
  private source: Source

  private baseUrl: string = 'https://www.fellesdatakatalog.digdir.no/api/concepts'

  private loaded: boolean = false

  public constructor() {

  }

  public async termSearch(
    term: string,
    langauge: string
  ): Promise<
    null | { error: Error } | TermerResults[]
  > {

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
    let promise: Promise<string[]> = new Promise((resolve, reject) => {
      this._waitFor(() => this.loaded === true).then(x => {
        resolve([])
      })
    })
    return promise
  }

  private _refrenceUrl (termId: string): string {
    return ''
  }

  private _formatResponse (response: DatakatalogResponse, searchTerm: string): TermerResults[] {

  }

  private async _searchDatakatalog<T>(
    term: string
  ): Promise<T | null> {
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
      displayname: 'NA1V',
      url: 'https://www.na1v.no/',
      description: 'Begrepskatalogen til NA1V',
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
          url: 'https://data.na1v.no/',
          name: 'Arbeids- og velferdsforvaltningen',
          displayname: 'NA1V',
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        glossaryIdTracker += 1
      })
    })
    return returnList
  }

  _waitFor(conditionFunction: Function) {
    const poll = (resolve: Function) => {
      if (conditionFunction()) resolve()
      else setTimeout(_ => poll(resolve), 400)
    }
    return new Promise(poll)
  }
}


interface DatakatalogResponse {
  took: number // integer
  timed_out: boolean
  hits: DatakatalogResult
}

interface DatakatalogResult {
  hits: DatakatalogHit[]
  max_score: number
  total: number
}

interface DatakatalogHit {
  _id: string
  _inedx: string
  _score: number
  _source: DatakatalogSource
  _type: string
}

interface DatakatalogSource {
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
  license: DatakatalogLicense
  modified: string
  provenance: string
  publisher: DatakatalogPublisher
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
  content: DatakatalogContent
}

interface DatakatalogPublisher {
  name: string
  publisher_url: string
}

interface DatakatalogLicense {
  name: string
  url: string
}

interface DatakatalogContent {
  alternativ_Datakatalogn: string
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
