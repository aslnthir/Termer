import { FofAPI } from 'termer-core/src/Folkogforsvar-Backend/folkogforsvar-backend'
// import { ConfigValues } from 'src/backends/config'
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
  private FofBackendAPI: FofAPI

  public constructor() {
    this.FofBackendAPI = new FofAPI()
  }
  createSource(sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  updateDefinition(definitionId: string, definitionData: any): Promise<import("./api").DefinitionResult> {
    return Promise.resolve({})
  }
  updateSource(sourceId: string, sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  updateGlossary(sourceId: string, sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  getDomains(): Promise<import("./api").TermDomain[]> {
    return Promise.resolve([])
  }

  getLoggedInUser?(): Promise<import("./api").User> {
    return Promise.resolve({})
  }
  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<import("./api").DefinitionResult> {
    return Promise.resolve({})
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
        result = await this.FofBackendAPI.termSearch(
          term
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
        if (result.length === 0) {
          yield {
            glossary: id
          }
        }
        for (const resultObj of result) {
          yield {
            glossary: id,
            ...resultObj
          }
        }
      }
    }
  }

  public async getSource(): Promise<Source> {
    return this.FofBackendAPI.getSource()
  }

  public async getWordlist(): Promise<WordlistResponse> {
    const wordlist = await this.FofBackendAPI.getWordlist()
    return { wordlist }
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    const result = await this.FofBackendAPI.getSourceList()
    for (const r of result) {
      yield r
    }
  }

  public async getLanguages(): Promise<Languages> {
    const result = await this.FofBackendAPI.getLanguages()
    return result
  }

  public async *getApikeySettings(apikeys: string[]): AsyncIterableIterator<ApikeySetting> {
    const emptyList: ApikeySetting[] = []
    for (const item of emptyList) {
      yield item
    }
  }
}
