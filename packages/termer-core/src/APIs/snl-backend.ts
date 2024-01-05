import { ConfigValues } from 'termer-core/src/backends/config'
import {
  Backend,
  SourceLanguageSelection,
  LanguageSelection,
  LanguageCode,
  LanguagePairCompoundId,
  GlossaryCompoundId,
  GlossaryCollection,
  toIdString,
  GlossaryCompoundIdString
} from '../model'
import {
  Api,
  SearchResult,
  WordlistResponse,
  Languages,
  SearchNoResult,
  SearchError
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

  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<import("./api").DefinitionResult> {
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
      const fetchUrl: string = this.url + '/lookup/' + glossaryId + '/' + term
      const results = await fetch(fetchUrl)
      if (!results.ok) continue
      try {
        const jsonResults = await results.json()
        if (jsonResults.results) {
          for (const result of jsonResults.results) {
            result.lexeme.foundIn = id.sourceId
            result.lexeme.glossary = id.glossaryId
            result.lexeme.id = result.id.toString()
            result.glossary = id
            result.definitions = result.definitions.map((x: any) => {
              x.id = x._id
              return x
            })
            result.didyoumean = jsonResults.didyoumean
            yield result
          }
        } else {
          yield { "glossary": id,
            "didyoumean": jsonResults.didyoumean }
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
    const fetchUrl: string = this.url + '/list/' + id.glossaryId
    const results = await fetch(fetchUrl)
    const wordlistResponse: WordlistResponse = {
      wordlist: []
    }
    if (!results.ok) return wordlistResponse
    wordlistResponse.wordlist = await results.json()
    return wordlistResponse
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
