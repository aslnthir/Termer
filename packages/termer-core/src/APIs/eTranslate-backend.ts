import { ConfigValues } from 'termer-core/src/backends/config'
import {
  Backend,
  GlossaryCompoundId,
  GlossaryCollection,
  toIdString,
  GlossaryCompoundIdString
} from '../model'
import {
  Api,
  User,
  SearchResult,
  WordlistResponse,
  Languages,
  SearchNoResult,
  SearchError,
  DefinitionResult,
  LoginDetails
} from 'termer-core/src/APIs/api'
import {
  SourceId,
  Source,
  Definition,
  Glossary,
  ApikeySetting
} from 'termer-core/src/entry'

// import { BackendBrowserDefinition } from './api-browser-backend';
// import URL from 'url'  // explicit import to replace implicit global URL constructor.

export { API }

class API implements Api {
  protected url: string
  constructor(url: string) {
    this.url = url
  }
  getLoggedInUser?(): Promise<User> {
    throw new Error("Method not implemented.")
  }
  createSource(sourceData: any): Promise<any> {
    throw new Error("Method not implemented.")
  }
  createTerm(termData: any): Promise<DefinitionResult> {
    throw new Error("Method not implemented.")
  }
  updateDefinition(definitionId: string, definitionData: any): Promise<DefinitionResult> {
    throw new Error("Method not implemented.")
  }
  updateSource(sourceId: string, sourceData: any): Promise<any> {
    throw new Error("Method not implemented.")
  }
  updateGlossary(sourceId: string, sourceData: any): Promise<any> {
    throw new Error("Method not implemented.")
  }
  getDomains(): Promise<import("./api").TermDomain[]> {
    return Promise.resolve([])
  }
  login(username: string, password: string): Promise<LoginDetails> {
    throw new Error("Method not implemented.")
  }
  logout(): Promise<null> {
    throw new Error("Method not implemented.")
  }

  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<DefinitionResult> {
    throw new Error("Method not implemented.")
  }

  async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    const allIds: Record<GlossaryCompoundIdString, GlossaryCompoundId> = {}
    const foundResultsFor = new Set<GlossaryCompoundIdString>()
    for (const id of ids) {
      const idString = toIdString(id)
      const glossaryId = id.glossaryId
      allIds[idString] = id
      const searchTerm = encodeURIComponent(term)
      const fetchUrl: string = this.url + '/lookup/' + glossaryId + '/' + searchTerm
      const results = await fetch(fetchUrl)
      if (!results.ok) continue
      try {
        const jsonResults = await results.json()
        if (jsonResults.results) {
          for (const result of jsonResults.results) {
            result.lexeme.foundIn = id.sourceId
            result.lexeme.glossary = id.glossaryId
            result.lexeme.id = result._id.toString()
            result.glossary = id
            result.definitions = result.definitions.map((x: any) => {
              x.id = x._id
              return x
            })
            yield result
          }
        } else {
          yield { "glossary": id }
        }
      } catch (error) {
        foundResultsFor.add(toIdString(id))
        yield {
          glossary: id,
          error
        }
      }
    }
    for (const [idString, glossary] of Object.entries(allIds)) {
      if (!foundResultsFor.has(idString)) {
        yield { glossary }
      }
    }
  }

  async getSource(sourceId: SourceId, config: ConfigValues): Promise<Source> {
    const fetchUrl: string = this.url + '/source/'
    const results = await fetch(fetchUrl)
    return await results.json()
  }

  async getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse> {
    return {}
  }

  async *getSourceList(config: ConfigValues): AsyncIterableIterator<Source> {
    const fetchUrl: string = this.url + '/source/'
    const results = await fetch(fetchUrl)
    if (!results.ok) return
    for (const source of await results.json()) {
      for (const glossary of source.glossaries) {
        glossary.id = glossary._id
      }
      source.id = source._id
      yield source
    }
  }

  public async getLanguages(): Promise<Languages> {
    return this._languages()
  }

  public async *getApikeySettings(
    apikeys: string[]
  ): AsyncIterableIterator<ApikeySetting> {
    const emptyList: ApikeySetting[] = []
    for (const item of emptyList) {
      yield item
    }
  }

  _languages() {
    return [
      ['nb', 'Norwegian Bokmål']
    ]
  }

}
