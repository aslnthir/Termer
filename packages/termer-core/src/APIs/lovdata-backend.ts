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
import { subReferenceRegExp, lovDatoId } from 'lovdata-law-reference-regex'

export { API }

const lawsGlossary = {
  id: '1',
  url: 'https://lovdata.no',
  name: 'Norges lover',
  displayname: 'Norges lover',
  sourceLanguage: 'nb',
  targetLanguage: 'nb'
}

const intraLawGlossary = {
  id: '2',
  url: 'https://lovdata.no/register/lover',
  name: 'Definisjoner fra lovteksten',
  displayname: 'Definisjoner fra lovteksten',
  sourceLanguage: 'nb',
  targetLanguage: 'nb'
}

const regulationsGlossary = {
  id: '3',
  url: 'https://lovdata.no/register/forskrifter',
  name: 'Forskrifter',
  displayname: 'Forskrifter',
  sourceLanguage: 'nb',
  targetLanguage: 'nb'
}

const lovdataSource = {
  id: '1',
  url: 'https://lovdata.no',
  name: 'Lovdata',
  displayname: 'Lovdata',
  owner: null,
  terms: null,
  privateSource: false,
  description: 'Lovdata',
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
  glossaries: [lawsGlossary, regulationsGlossary]
}

class API implements Api {
  protected url: string
  protected intraLawDefinitions: null | Definitions = null
  public constructor(url: string) {
    this.url = url

    if (
      /https?:\/\/lovdata.no\/dokument\/NL\/lov\//.test(window.location.href)
    ) {
      const result = extractDefinitions()
      lovdataSource.glossaries.push(intraLawGlossary)
      this.intraLawDefinitions = result
    }
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
        switch (id.glossaryId) {
          case lawsGlossary.id: {
            result = await lawLookup(this.url, term)
            break
          }
          case intraLawGlossary.id: {
            if (this.intraLawDefinitions) {
              result = this.getLawDefinition(term)
            }
            break
          }
          case regulationsGlossary.id: {
            result = await regulationsLookup(this.url, term)
            break
          }
          default: {
            throw new Error(`Unknown or invalid ID '${id}'`)
          }
        }
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

  private getLawDefinition(term: string): LookupResult | null {
    if (!this.intraLawDefinitions) return null
    const { id, definition, hash } = this.intraLawDefinitions[term]
    if (!definition) return null
    return {
      definitions: [
        {
          id: id.toString(),
          gloss: definition,
          language: 'nb',
          url: hash
            ? window.location.origin + window.location.pathname + '#' + hash
            : undefined
        }
      ],
      lexeme: {
        id: id.toString(),
        lemmas: [term],
        language: 'nb',
        foundIn: lovdataSource.id,
        glossary: intraLawGlossary.id
      }
    }
  }

  public async getSource(): Promise<Source> {
    return lovdataSource
  }

  public async getWordlist(id: GlossaryCompoundId): Promise<WordlistResponse> {
    if (id.glossaryId === lawsGlossary.id) {
      let wordlist = await getLawList(this.url)
      if (wordlist) {
        const lovOmRe = /(lov) ([ou]m) /
        wordlist = wordlist.map(x => x.replace(/[()[\]]/g, '\\$&'))
        let [lovOm, rest] = groupBy(wordlist, x => lovOmRe.test(x))
        lovOm = lovOm.map(x => x.replace(lovOmRe, '')).sort()
        const lovOmPart = `(?:lov(?: ${lovDatoId})? [ou]m (?:${lovOm.join(
          '|'
        )}))`
        const titleRe = `(?:${rest.sort().join('|')}|${lovOmPart})`
        const re = titleRe + removeNamedGroups(subReferenceRegExp)
        return { regexes: [re], wordlist }
      } else return {}
    } else if (
      id.glossaryId === intraLawGlossary.id &&
      this.intraLawDefinitions
    ) {
      return { wordlist: Object.keys(this.intraLawDefinitions) }
    } else if (id.glossaryId === regulationsGlossary.id) {
      const wordlist = await getRegulationsList(this.url)
      if (wordlist) return { wordlist }
      else return {}
    } else {
      return {}
    }
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

async function getRegulationsList(url: string): Promise<string[] | null> {
  return getWordlist(url + '/regulations/list/')
}

async function getLawList(url: string): Promise<string[] | null> {
  return getWordlist(url + '/law/list/')
}
async function getWordlist(url: string): Promise<string[] | null> {
  const result = await fetch(url)
  if (result.ok) {
    return await result.json()
  } else return null
}

async function regulationsLookup(
  url: string,
  term: string
): Promise<LookupResult | null> {
  return lookup(
    url + '/regulations/lookup/',
    term,
    lovdataSource.id,
    regulationsGlossary.id
  )
}

async function lawLookup(
  url: string,
  term: string
): Promise<LookupResult | null> {
  return lookup(url + '/law/lookup/', term, lovdataSource.id, lawsGlossary.id)
}

async function lookup(
  url: string,
  term: string,
  sourceId: string,
  glossaryId: string
): Promise<LookupResult | null> {
  const result = await fetch(url + term)
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
        foundIn: sourceId,
        glossary: glossaryId
      }
    }
  } else {
    return null
  }
}

function getDefinitionParagraph(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll('.paragrafTittel'))
      .filter((x: Element) => /[Dd]efinisjoner/.test(x.textContent || ''))
      .map((x: Element) => x.parentElement)[0] || null
  )
}

function notNull<T>(x: T | null): x is T {
  return x !== null
}

type Definitions = {
  [key: string]: {
    id: number
    definition: string
    hash: string | null
  }
}
function extractDefinitions(): null | Definitions {
  const defs = getDefinitionParagraph()
  if (!defs) return null
  const anchor = defs.previousElementSibling
  let hash: string | null = null
  if (anchor) {
    const item = anchor.attributes.getNamedItem('name')
    if (item) hash = item.value
  }
  const elements = defs.querySelectorAll(
    'table.listeItem td:not(.listeitemNummer)'
  )
  if (!elements) return null
  const entries = Array.from(elements)
    .map(x => x.textContent)
    .filter(notNull)
  const result = entries.reduce((acc: Definitions, entry, id) => {
    // split on `:`, or else split on `,`, in order to get: `[term, definition]`
    let a = /(^[^:]+):\s(.+$)/.exec(entry)
    if (!a) {
      a = /(^[^,]+),\s(.+$)/.exec(entry)
    }
    if (a) {
      const term = a[1]
      const definition = a[2]
      acc[term] = {
        definition,
        id,
        hash
      }
    }
    return acc
  }, {})
  return result
}

function removeNamedGroups(re: string): string {
  return re.replace(/\?<[^>]+>/g, '?:')
}

function groupBy<T>(arr: T[], fn: (x: T) => boolean): [T[], T[]] {
  return arr.reduce(
    (acc, x) => {
      if (fn(x)) {
        acc[0].push(x)
      } else {
        acc[1].push(x)
      }
      return acc
    },
    [[], []] as [T[], T[]]
  )
}
