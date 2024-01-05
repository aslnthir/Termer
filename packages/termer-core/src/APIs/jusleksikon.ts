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

import Wiki, { PageTitle } from 'mediawikiapi'

export { API }

const glossaryIds = {
  jusleksikon: '1'
}

const jusleksikon = {
  id: glossaryIds.jusleksikon,
  url: 'https://jusleksikon.no/wiki/',
  name: 'Jusleksikon',
  displayname: 'Jusleksikon',
  sourceLanguage: 'nb',
  targetLanguage: 'nb'
}

const glossaries = {
  [glossaryIds.jusleksikon]: jusleksikon
}

const jusLeksikonSource = {
  id: '1',
  url: 'https://jusleksikon.no',
  name: 'Jusleksikon',
  displayname: 'Jusleksikon',
  owner: null,
  terms: null,
  privateSource: false,
  description: 'Jusleksikon',
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
  glossaries: Object.values(glossaries)
}

const juswiki = new Wiki({
  url: jusLeksikonSource.url + '/w/api.php'
})

class API implements Api {
  public async *search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[]
    // glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError> {
    for (const id of ids) {
      let result = null
      try {
        const glossary = glossaries[id.glossaryId]
        if (!glossary) {
          throw new Error(`Unknown or invalid ID '${id}'`)
        }
        // check for term in wordlist, then perform page fetch.
        result = await lookup(glossary, term)
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
    return jusLeksikonSource
  }

  public async getWordlist(/* id: GlossaryCompoundId */): Promise<
    WordlistResponse
  > {
    let allPageTitles: string[] = []
    for await (const p of juswiki.listAllPages()) {
      const titles = p.map(({ title }) => title)
      allPageTitles.push(...titles)
    }
    for await (const e of juswiki.listBrokenRedirects()) {
      const titles = new Set(e.map(({ title }) => title))
      allPageTitles = allPageTitles.filter(x => !titles.has(x))
    }
    if (!allPageTitles.length) return {}
    return { wordlist: allPageTitles }
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

async function lookup(
  { id: glossaryId }: { id: string },
  term: string
): Promise<LookupResult | null> {
  const result = await juswiki.getPageExtract(term)
  if (!result || !result.extract) return null
  return {
    definitions: [
      {
        id: result.pageid.toString(),
        gloss: await result.extract,
        language: 'nb',
        url: 'https://jusleksikon.no/wiki/' + result.title
      }
    ],
    lexeme: {
      id: result.pageid.toString(),
      lemmas: [result.title],
      language: 'nb',
      foundIn: jusLeksikonSource.id,
      glossary: glossaryId
    }
  }
}

type Definitions = {
  [key: string]: {
    id: number
    definition: string
    hash: string | null
  }
}
