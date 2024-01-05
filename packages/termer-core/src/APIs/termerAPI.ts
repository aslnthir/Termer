import * as TermerAPI from 'glossaryapi-client/src/api/termer'
import { ConfigValues } from 'src/backends/config'
import {
  Source,
  SourceId,
  Definition,
  Lexeme,
  ApikeySetting,
  Glossary,
  GlossaryData
} from 'src/entry'
import {
  Api,
  SearchResult,
  SearchNoResult,
  SearchError,
  User,
  WordlistResponse,
  Languages,
  DefinitionResult,
  LoginDetails
} from './api'
import {
  toIdString,
  Backend,
  GlossaryCompoundId,
  GlossaryCompoundIdString,
  GlossaryCollection
} from '../model'

// import URL from 'url'  // explicit import to replace implicit global URL constructor.

export { API }
class API implements Api {
  private termerAPI: TermerAPI.TermerAPI
  private languageRequestOngoing: boolean
  private languages: Languages | null
  private url: string

  public constructor(url = 'https://glossary.tingtun.no/glossary2/') {
    this.url = url
    this.termerAPI = new TermerAPI.TermerAPI(url)
    this.languageRequestOngoing = false
    this.languages = null
  }

  public async getLoggedInUser(): Promise<User | null> {
    const result = await this.termerAPI.getLoggedInUser()
    if (result instanceof Error) {
      return null
    } else if (!('id' in result)) {
      return null
    } else {
      return {
        id: result.id.toString()
      }
    }
  }

  public async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    const params = toParams(backend.config, [])
    const sourceIdSet = new Set(ids.map(x => x.sourceId))
    const allIds: Record<GlossaryCompoundIdString, GlossaryCompoundId> = {}
    for (const id of ids) {
      const idString = toIdString(id)
      allIds[idString] = id
    }
    const inputLanguages = []
    const targetLanguages = []
    for (const stringId of Object.keys(allIds)) {
      inputLanguages.push(glossaries[stringId].sourceLanguage)
      targetLanguages.push(glossaries[stringId].targetLanguage)
    }
    params.inputLanguages = [...new Set(inputLanguages)].sort().join(',')
    params.targetLanguages = [...new Set(targetLanguages)].sort().join(',')

    const foundResultsFor = new Set<GlossaryCompoundIdString>()
    for (let index = 0; index < ids.length; index += 5) {
      const myIds = ids.slice(index, index + 5)
      const sources = Array.from(new Set(myIds.map(x => x.sourceId)))
        .sort()
        .join(',')
      if (params.sources === sources) continue
      try {
        params.sources = sources
        const result = await search(this.url, term, params)
        for await (const item of result) {
          for await (const x of processItem(backend, sourceIdSet, item)) {
            foundResultsFor.add(toIdString(x.glossary))
            yield x
          }
        }
      } catch (error) {
        for (const glossary of myIds) {
          yield {
            glossary,
            error: error.message
          }
          foundResultsFor.add(toIdString(glossary))
        }
      }
    }
    // Go through the list and return NoResult for those without a result.
    for (const [idString, glossary] of Object.entries(allIds)) {
      if (!foundResultsFor.has(idString)) {
        yield { glossary }
      }
    }
  }

  public async getSource(
    sourceId: SourceId,
    config: ConfigValues
  ): Promise<Source> {
    const params = toParams(config)
    const result = await this.termerAPI.getSource(sourceId, params)
    const source = convertToSource(result)
    return source
  }

  public async getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse> {
    const params = toParams(config, [id])
    const url = `${this.termerAPI.endpointURL}glossaries/${id.glossaryId}/wordlist/`
    const result = await fetch(addQueryParams(url, params), {
      credentials: 'include'
    })
    if (!result.ok) return {}

    const responseJSON: TermerAPI.WordlistResponse = await result.json()

    const returnObject: WordlistResponse = {}
    if (responseJSON.wordlist) {
      returnObject.wordlist = responseJSON.wordlist
        // Remove words less that 2 chars long.
        .filter(x => x.length > 1)
    }
    if (responseJSON.page && responseJSON.max_page) {
      const currentPage = parseInt(responseJSON.page)
      const maxPage = parseInt(responseJSON.max_page)
      if (currentPage < maxPage) {
        config.page = (currentPage + 1).toString()
        const nextWordlist = await this.getWordlist(id, config)
        if (returnObject.wordlist && nextWordlist.wordlist) {
          returnObject.wordlist = returnObject.wordlist.concat(nextWordlist.wordlist)
        } else if (nextWordlist.wordlist) {
          returnObject.wordlist = nextWordlist.wordlist
        }
      }
    }
    if (responseJSON.regexs) {
      returnObject.regexes = responseJSON.regexs
    }
    return returnObject
  }

  public async *getSourceList(
    config: ConfigValues
  ): AsyncIterableIterator<Source> {
    const params = toParams(config)
    const result = await this.termerAPI.getSourceList(params)

    for (const r of result.results) {
      yield convertToSource(r)
    }
  }

  public async getLanguages(): Promise<Languages> {
    await this._finishedGetLanguages()
    if (!this.languages) {
      const result = await this.termerAPI.getLanguages()
      this.languages = result
    }
    return this.languages
  }

  private async _finishedGetLanguages(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.languages || !this.languageRequestOngoing) {
        this.languageRequestOngoing = true
        resolve(true)
      } else {
        setTimeout(() => {
          this._finishedGetLanguages().then(result => {
            resolve(result)
          })
        }, 2000)
      }
    })
  }

  public async *getApikeySettings(
    apikeys: string[]
  ): AsyncIterableIterator<ApikeySetting> {
    if (apikeys.length > 0) {
      const params = { apikeys }
      const url = `${this.termerAPI.endpointURL}apikeySettings/`
      const result = await fetch(addQueryParams(url, params), {
        credentials: 'include'
      })
      if (!result.ok) return

      const response: TermerAPI.Response<ApikeySetting> = await result.json()
      for (const setting of response.results) {
        yield setting
      }
    }
  }

  public async *getGlossaryDefinitionList(
    glossaryId: GlossaryCompoundId
  ): AsyncIterableIterator<DefinitionResult> {
    const url =
      `${this.termerAPI.endpointURL}definitions/?glossary=` +
      glossaryId.glossaryId

    // const result = await this.termerAPI.getDefinitionsList(params)
    const response = await this.fetchDefintionList(url)
    for await (const item of await response) {
      const firstLex = item.lexemes[0]
      const lexeme: Lexeme = convertToLexeme(
        firstLex,
        firstLex.source_description_id.toString()
      )
      const definition: Definition = convertToDefinition(item)
      yield {
        lexeme,
        definition
      }
    }
  }

  public async createSource(
    sourceData: GlossaryData
  ): Promise<Source> {
    const result = await this.termerAPI.createSource(sourceData)
    return result
  }

  public async createTerm(
    termData: TermerAPI.TermCreation
  ): Promise<DefinitionResult> {
    const result = await this.termerAPI.createTerm(termData)

    const firstLex = result.lexemes[0]
    const lexeme: Lexeme = convertToLexeme(
      firstLex,
      firstLex.source_description_id.toString()
    )
    const definition: Definition = convertToDefinition(result)
    return {
      lexeme,
      definition
    }
  }

  public async updateDefinition(
    definitionId: string,
    definitionData: any
  ): Promise<any> {
    // Promise<DefinitionResult>
    return await this.termerAPI.updateTerm(definitionId, definitionData)
  }

  public async updateSource(
    sourceId: string,
    sourceData: any
  ): Promise<any> {
    // Promise<DefinitionResult>
    return await this.termerAPI.updateSource(sourceId, sourceData)
  }

  public async updateGlossary(
    glossaryId: string,
    glossaryData: GlossaryData
  ): Promise<GlossaryData> {
    // Promise<DefinitionResult>
    return await this.termerAPI.updateSource(glossaryId, glossaryData)
  }

  public async getDomains(): Promise<any> {
    const result = await this.termerAPI.getDomains()
    return result
  }

  private async *fetchDefintionList(
    url: string
  ): AsyncIterableIterator<TermerAPI.DefinitionResults> {
    const params: Record<string, string> = {}
    const urlParams = new URLSearchParams(new URL(url).search)

    // .entries() do exsist, just an TS error.
    // eslint-disable-next-line
    // @ts-ignore
    for (const list of urlParams.entries()) {
      params[list[0]] = list[1]
    }
    const response = await this.termerAPI.getDefinitionsList(params)
    /*
    const result = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
    */
    if (response.results) {
      const data = response.results
      if (response.next) {
        const x = await this.fetchDefintionList(response.next)
        for await (const item of await x) {
          yield item
        }
      }
      for (const definition of data) {
        yield definition
      }
    }
  }

  public async login(
    username: string,
    password: string
  ): Promise<LoginDetails> {
    const loginData = {
      username,
      password
    }
    const result = await this.termerAPI.loginUser(loginData)
    return result
  }

  public async logout(
  ): Promise<LoginDetails> {
    const result = await this.termerAPI.logoutUser()
    return result
  }

}

/*
 params: url query parameters
 options: HTTP headers
    return this._ajaxGET(`${this.endpointURL}translations/search/${term}/`, { params, options })
*/

/* TODO: create test case (at least one ...):

Termer api response for https://glossary.tingtun.no/glossary2/search/astma/?sources=18,13,14,12,11,19&api=reisekjeden&ref=http://reisekjeden.no/Stille-krav-til-losninger/:
   {"count":1,"next":null,"previous":null,"results":[{"id":170445,"meaning":"kronisk luftveissykdom som gir pustebesvær.","source":12,"last_edit_time":"2017-05-04T15:21:40.320070Z","comments":"Astma er en multifaktoriell sykdom der mange faktorer virker inn.","lexemes":[{"id":209419,"source":12,"terms":[{"id":209419,"term":"astma","lemma":true}]}],"domains":[]}]}
*/
function convertToLexeme(
  termerAPILexeme: TermerAPI.Lexeme,
  sourceId: SourceId
): Lexeme {
  const id = termerAPILexeme.id.toString()
  const foundIn = sourceId
  // const foundIn = termerAPILexeme.source_id.toString()
  const forms = []
  const inflexions = []
  const lemmas = []
  const glossary = termerAPILexeme.glossary_id.toString()
  const language = termerAPILexeme.language
  for (const { term, lemma } of termerAPILexeme.terms) {
    if (lemma) lemmas.push(term)
    else inflexions.push(term)
    forms.push(term)
  }

  return { id, foundIn, forms, lemmas, language, inflexions, glossary }
}

function convertToDefinition(
  termerAPIDefinition: TermerAPI.SearchResultEntry | TermerAPI.DefinitionResults
): Definition {
  const def: Definition = {
    gloss: termerAPIDefinition.meaning,
    id: termerAPIDefinition.id.toString(),
    language: termerAPIDefinition.source_meaning_language,
    url: termerAPIDefinition.url
  }
  if (termerAPIDefinition.last_edit_time)
    def.lastEditTime = termerAPIDefinition.last_edit_time
  if (termerAPIDefinition.comments) def.comments = termerAPIDefinition.comments
  if (termerAPIDefinition.examples) def.examples = termerAPIDefinition.examples
  if (termerAPIDefinition.references) def.references = termerAPIDefinition.references
  if (termerAPIDefinition.source_description_id) def.foundIn = termerAPIDefinition.source_description_id.toString()
  if (termerAPIDefinition.source) def.glossaryId = termerAPIDefinition.source.toString()
  return def
}

function convertToSource(termerSource: TermerAPI.Source): Source {
  const s = termerSource
  return {
    id: s.id.toString(),
    url: s.url,
    name: s.name,
    owner: s.owner.toString(),
    terms: null,
    logoUrl: s.logo_url,
    inApikey: s.in_apikey,
    defaultApikey: s.default_apikey,
    description: s.description,
    displayname: s.displayname,
    inGarbage: s.in_garbedge,
    inputLanguages: s.input_languages,
    permissions: s.permissions,
    markupWords: s.markup_words,
    externalData: s.external_data,
    contactEmail: s.contact_email,
    privateSource: s.private_source,
    glossaries: convertToGlossaries(s.glossaries)
  }
}

function convertToGlossaries(glossaries: TermerAPI.Glossary[]): Glossary[] {
  const returnList = []
  for (const glossary of glossaries) {
    returnList.push({
      id: glossary.id,
      url: glossary.url,
      name: glossary.name,
      displayname: glossary.displayname,
      sourceLanguage: glossary.lang_concept,
      targetLanguage: glossary.lang_description
    })
  }
  return returnList
}

function toParams(
  config?: ConfigValues,
  glossaries?: GlossaryCompoundId[]
): TermerAPI.Params {
  const params: TermerAPI.Params = {
    sourcetype: 'sourcedescription',
    sources: ''
  }
  if (glossaries && glossaries.length > 0) {
    const glossaryList = new Set()
    for (const { sourceId } of glossaries) {
      glossaryList.add(sourceId)
    }
    params.sources = [...glossaryList].join(',')
  }
  if (!config) return params
  if (config.apiKeys && config.apiKeys.length > 0) {
    params.api = config.apiKeys.join(',')
  }
  if (config.selectedSources && config.selectedSources.length > 0) {
    params.sources = config.selectedSources.join(',')
  }
  if (config.domains && config.domains.length > 0) {
    params.domains = config.domains.join(',')
  }
  if (config.page) {
    params.page = config.page
  }
  return params
}

function addQueryParams(url: string, paramsObject: object): string {
  const stringParams = Object.entries(paramsObject)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return `${url}?${stringParams}`
}

async function* search(
  url: string,
  term: string,
  params: TermerAPI.Params
): AsyncIterableIterator<TermerAPI.Response<TermerAPI.SearchResult>> {
  const myUrl = `${url}searchLexeme/${term}/`
  const response = await fetch(addQueryParams(myUrl, params), {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('empty or no response from server')
  const result: TermerAPI.Response<TermerAPI.SearchResult> = await response.json()
  yield result
  if (
    'next_external_lookups' in result &&
    Object.keys(result.next_external_lookups).length > 0
  ) {
    const entries = Object.entries(result.next_external_lookups)
    for (const [sourceId, languages] of entries) {
      if (sourceId) {
        const sources = sourceId
          .split(',')
          .sort()
          .join(',')
        const inputLanguages = languages.inputLanguages
          .split(',')
          .sort()
          .join(',')
        const targetLanguages = languages.targetLanguages
          .split(',')
          .sort()
          .join(',')
        if (
          params.sources === sources &&
          params.inputLanguages === inputLanguages &&
          params.targetLanguages === targetLanguages
        ) {
          // This is just so we don’t submit the same parameters over and over
          // again.
          continue
        }
        params.sources = sources
        params.inputLanguages = inputLanguages
        params.targetLanguages = targetLanguages
        yield* search(url, term, params)
      }
    }
  }
}

async function* processItem(backend, sourceIdSet, result): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
  for (const {
    lexeme: termerAPILexeme,
    definitions: termerAPIDefinitions,
    translations: termerAPITranslations
  } of result.results) {
    // XXX: workaround for bug in backend: results for other sources are also
    // returned, so we filter them out.
    const termerAPIDefinitionsFiltered = termerAPIDefinitions.filter(
      definition => sourceIdSet.has(definition.source.toString())
    )

    if (termerAPIDefinitionsFiltered.length !== 0) {
      const lexeme = convertToLexeme(
        termerAPILexeme,
        termerAPIDefinitionsFiltered[0].source.toString()
      )
      const definitions = termerAPIDefinitionsFiltered.map(convertToDefinition)

      const glossary: GlossaryCompoundId = {
        backendId: backend.id,
        sourceId: lexeme.foundIn,
        glossaryId: termerAPIDefinitionsFiltered[0].source_language_pair
      }
      yield { glossary, lexeme, definitions }
    }

    const termerAPITranslationsFiltered = termerAPITranslations.filter(
      translation => sourceIdSet.has(translation.source.toString())
    )

    if (termerAPITranslationsFiltered.length !== 0) {
      for (const trans of termerAPITranslationsFiltered) {
        const definitions = [trans].map(convertToDefinition)
        const lexeme = convertToLexeme(
          termerAPILexeme,
          termerAPITranslationsFiltered[0].source.toString()
        )
        lexeme.id = 't' + trans.id.toString()
        const glossary: GlossaryCompoundId = {
          backendId: backend.id,
          sourceId: lexeme.foundIn,
          glossaryId: trans.source_language_pair
        }
        yield { glossary, lexeme, definitions }
      }
    }
  }
}
