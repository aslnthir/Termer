import { WikipediaAPI } from 'termer-core/src/Wikipedia-Backend/wikipedia-backend'
import { ConfigValues } from 'src/backends/config'
import {
  Backend, LanguagePairCompoundId, GlossaryCompoundId,
  GlossaryCollection,
  toIdString
} from '../model'
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
  private wikipediaBackendAPI: WikipediaAPI

  public constructor() {
    this.wikipediaBackendAPI = new WikipediaAPI()
  }

  public async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    for (const id of ids) {
      let result = null
      try {
        result = await this.wikipediaBackendAPI.termSearch(
          term,
          glossaries[toIdString(id)].sourceLanguage
        )
      } catch (error) {
        yield {
          glossary: id,
          error
        }
      }
      if (!result) {
        yield {
          glossary: id
        }
      } else if ('error' in result) {
        yield {
          glossary: id,
          error: result.error.message
        }
      } else {
        yield {
          glossary: id,
          ...result
        }
      }
    }
  }

  public async getSource(): Promise<Source> {
    return this.wikipediaBackendAPI.getSource()
  }

  public async getWordlist(): Promise<WordlistResponse> {
    return { wordlist: [] }
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    const result = await this.wikipediaBackendAPI.getSourceList()
    for (const r of result) {
      yield r
    }
  }

  public async getLanguages(): Promise<Languages> {
    const result = await this.wikipediaBackendAPI.getLanguages()
    return result
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
