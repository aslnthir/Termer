import { Lexeme, Definition, Source, Glossary } from '../entry'

export class WikipediaAPI {
  private source: Source

  private baseUrl: string = ''

  private disambiguationURL: string = ''

  private searchApiUrl: string = ''

  private baseProtocol: string = ''

  private urlParams: Record<string, string> = {}

  private searchOptions: Record<string, string> = {}

  private termIdTracker: number

  private lexemeIdTracker: number

  private definitionIdTracker: number

  private glossaryIdTracker: number

  public constructor() {
    this.source = this._generateSource()
    this.baseUrl = '.wikipedia.org/api/rest_v1/page/summary/'
    this.disambiguationURL = '.wikipedia.org/api/rest_v1/page/mobile-sections/'
    this.searchApiUrl = '.wikipedia.org/w/api.php'
    this.baseProtocol = 'https://'
    this.termIdTracker = 1
    this.lexemeIdTracker = 1
    this.definitionIdTracker = 1
    this.glossaryIdTracker = 1
    this.urlParams = {
      format: 'json',
      redirects: 'resolve',
      action: 'opensearch'
    }
  }

  public async termSearch(
    term: string,
    wikiLanguage: string
  ): Promise<
    null | { error: Error } | { lexeme: Lexeme; definitions: Definition[] }
  > {
    const params = {
      search: term,
      language: this._toWikiLanguageCode(wikiLanguage),
      ...this.urlParams
    }
    try {
      const response: WikiSummary | null = await this._searchWiki(
        this.baseUrl,
        params
      )
      if (!response) {
        return null
      }
      let gloss
      if (this.isDisambiguationPage(response)) {
        const response2: WikiMobileSections | null = await this._searchWiki(
          this.disambiguationURL,
          params
        )
        if (response2) {
          gloss = this._handleWikiMobileSections(response2)
        }
      }
      return this._handleWikiSummary(response, gloss)
    } catch (error) {
      return {
        error
      }
    }
  }

  private async _tryApiSearch (params: Params, baseUrl: string) {
    const language = params.language
    const searchUrl = new URL(
      this.baseProtocol + language + this.searchApiUrl
    )
    const fetchParams: any = {
      action: 'opensearch',
      limit: 1,
      format: 'json',
      search: params.search,
      origin: '*'
    }
    searchUrl.search = new URLSearchParams(fetchParams).toString()
    const search = await fetch(searchUrl.toString(), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    })
    if (search.ok) {
      const jsonData = await search.json()
      let newSearchString
      if (jsonData[1][0]) newSearchString = jsonData[1][0]
      else return null
      if (newSearchString &&
        params.search &&
        newSearchString.toLowerCase() != params.search.toLowerCase()) return null
      const searchUrl = new URL(
        this.baseProtocol + language + baseUrl + jsonData[1][0]
      )
      const result = await fetch(searchUrl.toString())
      if (result.ok) {
        return result.json()
      } else {
        return null
      }
    } else {
      return null
    }
  }

  private isDisambiguationPage(wikiPage: WikiSummary): boolean {
    return wikiPage.type === 'disambiguation'
  }

  public async getSource(): Promise<Source> {
    return this.source
  }

  public async getSourceList(): Promise<Source[]> {
    return [this.source]
  }

  public async getLanguages(): Promise<[string, string][]> {
    return this._languages()
  }

  private _generateSource(): Source {
    const languages = {
      en: ['en'],
      de: ['de'],
      nb: ['nb'],
      sv: ['sv'],
      fr: ['fr'],
      es: ['es']
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
      name: 'Wikipedia',
      displayname: 'Wikipedia',
      url: 'https://www.wikipedia.org/',
      description: 'Results from wikipedia',
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      markupWords: false,
      externalData: false,
      inGarbage: false,
      inApikey: false,
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
          url: 'https://www.wikipedia.org/',
          name: 'Wikipedia ' + sourceLanguage  + '->' + targetLangauge,
          displayname: 'Wikipedia ' + sourceLanguage  + '->' + targetLangauge,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        glossaryIdTracker += 1
      })
    })
    return returnList
  }

  private _languages(): [string, string][] {
    return [['en', 'English'], ['nb', 'Norwegian Bokmål'], ['sv', 'Swedish']]
  }

  private async _searchWiki<T>(
    baseUrl: string,
    params: Params
  ): Promise<T | null> {
    const language = params.language
    const searchUrl = new URL(
      this.baseProtocol + language + baseUrl + params.search
    )
    const result = await fetch(searchUrl.toString())
    if (result.ok) {
      return result.json()
    } else if (result.status === 404) {
      return await this._tryApiSearch(params, baseUrl)
    } else {
      return null
    }
  }

  private _toWikiLanguageCode(language: string): string {
    if (language === 'nb') return 'no'
    else return language
  }

  private _handleWikiSummary(
    response: WikiSummary,
    gloss?: string
  ): null | { lexeme: Lexeme; definitions: Definition[] } {
    if (response.title === 'Not found.') {
      return null
    }
    let glossaryId = ''
    for (const glossary of this.source.glossaries) {
      if (response.lang === glossary.sourceLanguage) {
        glossaryId = glossary.id
        break
      }
    }

    const lexeme: Lexeme = {
      id: this.lexemeIdTracker.toString(),
      foundIn: this.source.id,
      language: response.lang,
      lemmas: [response.title],
      forms: [response.title],
      glossary: glossaryId
    }
    this.lexemeIdTracker += 1

    const definition: Definition = {
      id: response.pageid.toString(),
      gloss: gloss || response.extract_html,
      lastEditTime: response.timestamp,
      language: response.lang,
      url: response.content_urls.desktop.page
    }
    const definitions = [definition]
    return {
      lexeme,
      definitions
    }
  }

  private _handleWikiMobileSections({
    lead,
    remaining
  }: WikiMobileSections): string {
    const div = document.createElement('div')
    if (lead.sections[0] && lead.sections[0].text) {
      const div2 = document.createElement('div')
      div2.innerHTML = this._formatHtmlString(lead.sections[0].text)
      div.appendChild(div2)
    }
    const ul = document.createElement('ul')
    ul.setAttribute('style', 'padding-left: 1em;')
    div.appendChild(ul)
    for (const section of remaining.sections) {
      const li = document.createElement('li')
      const bold = document.createElement('b')
      const span = document.createElement('span')
      const title = section.line
      const text = this._formatHtmlString(section.text) || ''
      span.innerHTML = text
      bold.innerHTML = title + ': '
      li.appendChild(bold)
      li.appendChild(span)
      ul.appendChild(li)
    }
    return div.innerHTML
  }

  private _formatHtmlString(text: string): string {
    const div = document.createElement('div')
    div.innerHTML = text
    const tableElements = div.getElementsByTagName('table')
    const styleElements = div.getElementsByTagName('style')

    try {
      const ulElements = div.getElementsByTagName('ul')
      for (const i in ulElements) {
        if (ulElements[i].setAttribute) {
          ulElements[i].setAttribute('style', 'padding-left: 1em')
        }
      }
    } catch (e) {
      console.error(e)
    }

    while (tableElements[0]) {
      tableElements[0].outerHTML = ''
    }

    while (styleElements[0]) {
      styleElements[0].outerHTML = ''
    }
    // get div's innerHTML into a new variable
    return this._removeLinks(div.innerHTML)
  }

  private _removeLinks(text: string): string {
    const div = document.createElement('div')
    div.innerHTML = text
    const aElements = div.getElementsByTagName('a')
    // remove all <a> elements
    while (aElements[0]) {
      aElements[0].outerHTML = aElements[0].innerHTML
      // get div's innerHTML into a new variable
    }
    return div.innerHTML
  }
}

interface WikiSummary {
  pageid: number // integer
  title: string
  timestamp: string
  extract_html: string
  extract: string
  lang: string // wiki language code
  content_urls: WikiContentUrls
  type: 'standard' | 'disambiguation'
}
interface WikiContentUrls {
  desktop: {
    page: string
  }
}

interface WikiMobileSections {
  lead: WikiLeadSection
  remaining: WikiRemainingSections
}

interface WikiLeadSection {
  lastmodified: string // UTC timestamp
  sections: WikiSection[]
}

interface WikiRemainingSections {
  sections: WikiSection[]
}

interface WikiSection {
  id: number // unsigned integer
  text: string // html
  line: string // section header
}

interface Params {
  format?: string
  redirects?: string
  action?: string
  search?: string
  language: string
  origin?: string
}
