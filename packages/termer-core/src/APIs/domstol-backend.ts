import { Backend, GlossaryCompoundId } from '../model'
import {
  Api,
  SearchResult,
  SearchNoResult,
  SearchError,
  WordlistResponse,
  Languages,
  DefinitionResult
} from './api'
import { Definition, Lexeme, Source, ApikeySetting } from '../entry'

export { API }

const glossary = {
  id: '1',
  url: 'https://www.domstol.no/verktoy/juridisk-ordliste/',
  name: 'Juridisk ordliste fra Norges domstoler',
  displayname: 'Juridisk ordliste',
  sourceLanguage: 'nb',
  targetLanguage: 'nb'
}

const source = {
  id: '1',
  url: 'https://www.domstol.no/verktoy/juridisk-ordliste/',
  name: 'Juridisk ordliste',
  displayname: 'Juridisk ordliste',
  owner: null,
  terms: null,
  privateSource: false,
  description: 'Juridisk ordliste',
  markupWords: true,
  contactEmail: 'contact@tingtun.no',
  inGarbage: false,
  permissions: null,
  defaultApikey: false,
  logoUrl: null,
  inputLanguages: {
    nb: ['nb']
  },
  externalData: false,
  glossaries: [glossary]
}

class API implements Api {
  protected url: string
  public constructor(url: string) {
    this.url = url
  }

  public async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[]
    // glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    for (const id of ids) {
      let result = null
      try {
        result = await lookup(this.url, term)
      } catch (error) {
        const errorMessage = (error as Error).message
        yield {
          glossary: id,
          error: errorMessage
        }
      }
      if (!result) {
        yield {
          glossary: id
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
    return source
  }

  public async getWordlist(id: GlossaryCompoundId): Promise<WordlistResponse> {
    if (id.glossaryId === glossary.id) {
      const result = await fetch(this.url + '/wordlist/')
      if (result.ok) {
        const wordlist = (await result.json()) as WordlistResponse
        return wordlist
      }
    }
    return {}
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    yield await this.getSource()
  }

  public async getLanguages(): Promise<Languages> {
    return [['nb', 'Norwegian Bokmål']]
  }

  public async *getApikeySettings(): AsyncIterableIterator<ApikeySetting> {
    for (const _ of []) {
      yield _
    }
  }

  public async *getGlossaryDefinitionList(): AsyncIterableIterator<
    DefinitionResult
  > {
    for (const _ of []) {
      yield _
    }
  }
}

interface LookupResult {
  lexeme: Lexeme
  definitions: Definition[]
}

interface FetchResponse {
  id: string
  lemmas: string[]
  meaning: string
  url: string
}

async function lookup(url: string, term: string): Promise<LookupResult | null> {
  const result = await fetch(url + '/lookup/' + term)
  if (result.ok) {
    let { meaning, url, lemmas, id } = (await result.json()) as FetchResponse
    if (!lemmas || lemmas.length === 0) {
      lemmas = [term]
    }
    return {
      definitions: [
        {
          id: id,
          gloss: meaning,
          language: 'nb',
          url: url
        }
      ],
      lexeme: {
        id: id,
        lemmas: lemmas,
        language: 'nb',
        foundIn: source.id,
        glossary: glossary.id
      }
    }
  } else {
    return null
  }
}
