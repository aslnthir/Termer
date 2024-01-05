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
  Languages,
  DefinitionResult,
  LoginDetails,
  TermDomain,
  User
} from 'termer-core/src/APIs/api'
import { Source, ApikeySetting, TermCreation } from '../entry'
import { ConfigValues } from 'src/backends/config'
// import { BackendBrowserDefinition } from './api-browser-backend';
// import URL from 'url'  // explicit import to replace implicit global URL constructor.

export { API }

class API implements Api {

  url: String

  public constructor(url: string) {
    this.url = url
  }
  createTerm(termData: TermCreation): Promise<DefinitionResult> {
    throw new Error("Method not implemented.")
  }
  login(username: string, password: string): Promise<LoginDetails> {
    throw new Error("Method not implemented.")
  }
  logout(): Promise<null> {
    throw new Error("Method not implemented.")
  }
  createSource(sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  updateDefinition(definitionId: string, definitionData: any): Promise<DefinitionResult> {
    return Promise.resolve({})
  }
  updateSource(sourceId: string, sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  updateGlossary(sourceId: string, sourceData: any): Promise<any> {
    return Promise.resolve([])
  }
  getDomains(): Promise<TermDomain[]> {
    return Promise.resolve([])
  }

  getLoggedInUser?(): Promise<User> {
    return Promise.resolve({})
  }
  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<DefinitionResult> {
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
      const glossary = glossaries[toIdString(id)]
      try {
        const result = await fetch(this.url + '/lookup/' +
        glossary.sourceLanguage + '/' + term + '/' + glossary.targetLanguage)
        if (result.ok) {
          const jsonData = await result.json()
          if (!jsonData) {
            return {
              glossary: id
            }
          }
          for (const data of jsonData.results) {
            data.glossary = id
            yield data
          }
        } else {
          return {
            glossary: id
          }
        }
      } catch (error) {
        yield {
          glossary: id,
          error
        }
      }
    }
  }

  public async getSource(): Promise<Source> {
    const result = await fetch(this.url + '/source/')
    return result.json()
  }

  public async getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse> {
    try {
      const result = await fetch(this.url + '/wordlist/')
      if (result.ok) {
        const jsonData = await result.json()
        return jsonData
      } else {
        return {}
      }
    } catch (error) {
      return {}
    }
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    const result = await fetch(this.url + '/source/')
    yield result.json()
    /*
    const result = await this.FofBackendAPI.getSourceList()
    for (const r of result) {
      yield r
    }
    */
  }

  public async getLanguages(): Promise<Languages> {
    // const result = await this.FofBackendAPI.getLanguages()
    return []
  }

  public async *getApikeySettings(apikeys: string[]): AsyncIterableIterator<ApikeySetting> {
    const emptyList: ApikeySetting[] = []
    for (const item of emptyList) {
      yield item
    }
  }
}
