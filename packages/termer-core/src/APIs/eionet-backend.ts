import { EionetAPI } from 'termer-core/src/eionet/eionet-backend'
import { Backend, GlossaryCompoundId, GlossaryCollection, toIdString } from '../model'
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
  private eionetAPI: EionetAPI

  public constructor() {
    this.eionetAPI = new EionetAPI()
  }

  public getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<import("./api").DefinitionResult> {
    throw new Error("Method not implemented.")
  }

  public async *search(
    term: string,
    backend: Backend,
    sourceIds: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    for (const id of sourceIds) {
      let result = null
      try {
        const glossary = glossaries[toIdString(id)]
        result = await this.eionetAPI.termSearch(
          term,
          glossary,
          id.sourceId.toString()
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
    return this.eionetAPI.getSource()
  }

  public async getWordlist(): Promise<WordlistResponse> {
    return { wordlist: [] }
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    const result = await this.eionetAPI.getSourceList()
    for (const r of result) {
      yield r
    }
  }

  public async getLanguages(): Promise<Languages> {
    const result = await this.eionetAPI.getLanguages()
    return result
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
