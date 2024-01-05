import * as BrowserBackendAPI from 'glossaryapi-client/src/api/browser-backend'
import { ConfigValues } from 'src/backends/config'
import {
  Backend,
  LanguagePairCompoundId,
  GlossaryCompoundId,
  GlossaryCollection
} from '../model'
import {
  Api,
  SearchResult,
  SearchError,
  SearchNoResult,
  WordlistResponse
} from './api'
import { SourceId, Source, Wordlist, Definition, Lexeme, ApikeySetting } from 'src/entry'
// import { BackendBrowserDefinition } from './api-browser-backend';
// import URL from 'url'  // explicit import to replace implicit global URL constructor.

export { API }

class API implements Api {
  private browserBackendAPI: BrowserBackendAPI.BrowserBackendAPI

  public constructor() {
    this.browserBackendAPI = new BrowserBackendAPI.BrowserBackendAPI()
  }

  public async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchError | SearchNoResult> {
    const params = toParams(backend.config, ids)
    const result = await this.browserBackendAPI.termSearch(term, params)
    for (const searchResult of result.results) {
      const lexeme = convertToLexeme(searchResult.lexemes)
      const definitions: Definition[] = [convertToDefinition(searchResult)]
      const glossary: GlossaryCompoundId = {
        backendId: backend.id,
        sourceId: lexeme.foundIn,
        glossaryId: lexeme.glossary
      }
      yield {
        lexeme,
        definitions,
        glossary
      }
    }
  }

  public async getSource(
    sourceId: SourceId,
    config: ConfigValues
  ): Promise<Source> {
    const params = toParams(config)
    const result = await this.browserBackendAPI.getSource(sourceId, params)
    const source = convertToSource(result)
    return source
  }

  public async getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse> {
    const params = toParams(config)
    params.sources = id.sourceId
    const result = await this.browserBackendAPI.getWordlist(params)
    const wordlist = convertToWordlist(result)
    return { wordlist }
  }

  public async *getSourceList(
    config: ConfigValues
  ): AsyncIterableIterator<Source> {
    const params = toParams(config)
    const result = await this.browserBackendAPI.getSourceList(params)
    for (const r of result.results) {
      const s = convertToSource(r)
      yield s
    }
  }

  public async *getApikeySettings(apikeys: string[]): AsyncIterableIterator<ApikeySetting> {
    const emptyList: ApikeySetting[] = []
    for (const item of emptyList) {
      yield item
    }
  }

  public getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<import("./api").DefinitionResult> {
    throw new Error("Method not implemented.")
  }
}

function convertToLexeme(
  browserBackendLexeme: BrowserBackendAPI.Lexeme
): Lexeme {
  const lemmas = []
  const forms = []
  for (const { term, lemma } of browserBackendLexeme.terms) {
    if (lemma) lemmas.push(term)
    forms.push(term)
  }
  const result = {
    id: browserBackendLexeme.id.toString(),
    language: browserBackendLexeme.language,
    foundIn: browserBackendLexeme.source_id.toString(),
    forms,
    lemmas,
    glossary: browserBackendLexeme.source_id.toString()
  }
  return result
}

function convertToDefinition(
  browserBackendResult: BrowserBackendAPI.SearchResult
): Definition {
  const def: Definition = {
    gloss: browserBackendResult.meaning,
    id: browserBackendResult.id.toString(),
    language: browserBackendResult.lexemes.language
  }
  if (browserBackendResult.last_edit_time)
    def.lastEditTime = browserBackendResult.last_edit_time
  if (browserBackendResult.comments)
    def.comments = browserBackendResult.comments
  return def
}

function convertToSource(source: BrowserBackendAPI.GetSourceResult): Source {
  const s = source
  const sd = source.source_description
  return {
    id: s.id.toString(),
    url: s.url,
    name: s.name,
    owner: s.owner,
    terms: s.terms,
    logoUrl: s.logo_url,
    defaultApikey: s.in_apikey,
    description: s.description,
    displayname: s.displayname,
    inGarbage: s.in_garbedge,
    permissions: s.permissions,
    // lang_concept: s.lang_concept,
    markupWords: s.markup_words,
    contactEmail: s.contact_email,
    privateSource: s.private_source,
    // sharePremission: s.sharePremission,
    // lang_description: s.lang_description,
    // sharedIdentifier: s.sharedIdentifier,
    inputLanguages: sd.input_languages,
    glossaries: s.glossaries,
    externalData: sd.external_data,
    inApikey: s.in_apikey
  }
}

function convertToWordlist(
  wordlist: BrowserBackendAPI.WordlistResponse
): Wordlist {
  if (wordlist.wordlist && wordlist.wordlist.length > 0) {
    return wordlist.wordlist
  } else {
    return []
  }
}

function toParams(
  config?: ConfigValues,
  sources?: GlossaryCompoundId[]
): BrowserBackendAPI.Params {
  const params: BrowserBackendAPI.Params = {
    sourcetype: 'sourcedescription'
  }
  if (sources && sources.length > 0)
    params.sources = sources.map(x => x.sourceId).join(',')
  if (!config) return params
  if (config.apiKeys && config.apiKeys.length > 0) {
    params.api = config.apiKeys.join(',')
  }
  if (config.selectedSources && config.selectedSources.length > 0) {
    params.sources = config.selectedSources.join(',')
  }
  return params
}
