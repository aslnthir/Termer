import { FellesdatakatalogAPI } from 'fellesdatakatalog-api'
import { Backend, GlossaryCompoundId, GlossaryCollection, toIdString, GlossaryCompoundIdString } from '../model'
import {
  Api,
  SearchResult,
  SearchNoResult,
  SearchError,
  WordlistResponse,
  Languages
} from 'termer-core/src/APIs/api'
import { Source, ApikeySetting } from '../entry'
// import { BackendBrowserDefinition } from './api-browser-backend';
// import URL from 'url'  // explicit import to replace implicit global URL constructor.

export { API }

class API implements Api {
  // private fellesdatakatalogApi: FellesdatakatalogAPI
  private fellesdatakatalogAPI: FellesdatakatalogAPI
  public constructor() {
    this.fellesdatakatalogAPI = new FellesdatakatalogAPI()

  }

  getLoggedInUser?(): Promise<import("./api").User> {
    throw new Error("Method not implemented.")
  }
  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<import("./api").DefinitionResult> {
    throw new Error("Method not implemented.")
  }

  public async *search(
    term: string,
    backend: Backend,
    sourceIds: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    const response = await this.fellesdatakatalogAPI.search(term)
    const allIds: Record<GlossaryCompoundIdString, GlossaryCompoundId> = {}
    for (const id of sourceIds) {
      const idString = toIdString(id)
      allIds[idString] = id
    }
    const foundResultsFor = new Set<GlossaryCompoundIdString>()
    for (const { definitions, lexeme } of response) {
      const glossary: GlossaryCompoundId = {
        backendId: backend.id,
        sourceId: lexeme.foundIn,
        glossaryId: definitions[0].source_language_pair
      }
      foundResultsFor.add(toIdString(glossary))

      yield { glossary, definitions, lexeme }
      // { glossary, lexeme, definitions }
    }

    for (const [idString, glossary] of Object.entries(allIds)) {
      if (!foundResultsFor.has(idString)) {
        yield { glossary }
      }
    }
  }

  public async getSource(): Promise<Source> {
    throw new Error("Method not implemented.")
  }

  public async getWordlist(): Promise<WordlistResponse> {
    return { wordlist: [] }
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    for (const source of this.fellesdatakatalogAPI.getSources()) {
      yield source
    }
  }

  public async getLanguages(): Promise<Languages> {
    return [['nb', 'Norwegian Bokmål']]
  }

  public async *getApikeySettings(
    apikeys: string[]
  ): AsyncIterableIterator<ApikeySetting> {
    const emptyList: ApikeySetting[] = []
    for (const item of emptyList) {
      yield item
    }
  }
}
