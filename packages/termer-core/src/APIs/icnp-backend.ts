import { Backend, GlossaryCompoundId } from '../model'
import { supportedLanguages } from 'icnp-backend/src/supportedLanguages'
import {
  Api,
  SearchResult,
  SearchNoResult,
  SearchError,
  WordlistResponse,
  Languages,
  DefinitionResult
} from './api'
import { Glossary, Definition, Lexeme, Source, ApikeySetting } from '../entry'

export { API }

const supportedLanguageCodes = Object.keys(supportedLanguages)
const glossaries: Array<Glossary> = []
let glossaryId = 1
for (const sourceLanguage of supportedLanguageCodes) {
  for (const targetLanguage of supportedLanguageCodes) {
    glossaries.push({
      id: (glossaryId++).toString(),
      url: 'https://www.icn.ch/what-we-doprojectsehealth-icnptm/about-icnp',
      name: 'International Classification for Nursing Practice',
      displayname: 'ICNP',
      sourceLanguage,
      targetLanguage
    })
  }
}

const inputLanguages = supportedLanguageCodes.reduce((acc, item) => {
  acc[item] = supportedLanguageCodes
  return acc
}, {} as Source['inputLanguages'])

const source: Source = {
  id: '1',
  url: 'https://www.icn.ch/what-we-doprojectsehealth-icnptm/about-icnp',
  name: 'International Classification for Nursing Practice',
  displayname: 'International Classification of Nursing Practices (ICNP)',
  owner: null,
  terms: null,
  privateSource: false,
  description: 'Nursing terms',
  markupWords: true,
  contactEmail: 'contact@tingtun.no',
  inGarbage: false,
  permissions: null,
  defaultApikey: false,
  logoUrl: null,
  inputLanguages,
  externalData: false,
  inApikey: false,
  glossaries
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
        const glossary = glossaries.find(
          glossary => glossary.id === id.glossaryId
        )
        if (!glossary) throw new Error(`no glossary with id ${id}`)
        result = await lookup(this.url, term, glossary)
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
    const glossary = glossaries.find(glossary => glossary.id === id.glossaryId)
    if (!glossary) return {}
    const result = await fetch(
      this.url + '/wordlist/' + glossary.sourceLanguage
    )
    if (!result.ok) return {}
    const wordlist = (await result.json()) as WordlistResponse
    return wordlist
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    yield await this.getSource()
  }

  public async getLanguages(): Promise<Languages> {
    return Object.entries(supportedLanguages)
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
  meaning: string,
  examples: Example[]
  url: string
}

interface Example {
  id: string
  text: string
}

async function lookup(
  baseUrl: string,
  term: string,
  glossary: Glossary
): Promise<LookupResult | null> {
  const result = await fetch(
    `${baseUrl}/lookup/${glossary.sourceLanguage}/${term}/${glossary.targetLanguage}`
  )
  if (!result.ok) return null
  if (result.status === 204) return null
  const jsonResponse = await result.json() as FetchResponse
  let { meaning, url, lemmas, id, examples } = jsonResponse
  if (!meaning) return null
  if (!lemmas || lemmas.length === 0) {
    lemmas = [term]
  }
  return {
    definitions: [
      {
        id: `${glossary.id}/${id}`,
        gloss: meaning,
        examples: examples,
        language: glossary.targetLanguage,
        url: url
      }
    ],
    lexeme: {
      id: `${glossary.id}/${id}`,
      lemmas: lemmas,
      language: glossary.sourceLanguage,
      foundIn: source.id,
      glossary: glossary.id
    }
  }
}
