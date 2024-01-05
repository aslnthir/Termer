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
  protected glossaryIdTracker: number
  protected sources: Source[] = []
  constructor(url: string) {
    this.url = url
    this.glossaryIdTracker = 1
    this.sources = this._generateSources()
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
      allIds[idString] = id
      const fetchUrl: string = this.url + '/lookup/' + term + '?' + new URLSearchParams({
              fromLanguage: glossaries[idString].sourceLanguage,
              toLanguage: glossaries[idString].targetLanguage,
            })
      try {
        const response = await fetch(fetchUrl)
        if (!response.ok) continue
        const responseJSON = await response.json()
        if (responseJSON.results) {
          for (const result of responseJSON.results) {
            result.lexeme.foundIn = id.sourceId
            result.lexeme.glossary = id.glossaryId
            result.lexeme.id = result._id
            for (const definition of result.definitions) {
              definition.foundIn = id.sourceId
              definition.id = definition._id
            }
            result.glossary = id
            result.didyoumean = responseJSON.didyoumean
            yield result
          }
        } else {
          yield { "glossary": id,
            "didyoumean": responseJSON.didyoumean }
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
    return this.sources[0]
  }

  async getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse> {
    // const params = toParams(config)
    // const result = await this.LexinBackendAPI.getWordlist(params)
    const wordlist: string[] = []
    return { wordlist }
  }

  async *getSourceList(config: ConfigValues): AsyncIterableIterator<Source> {
    for (const r of this.sources) {
      yield r
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
      ['ar', 'Arabic'],
      ['en', 'English'],
      ['fa', 'Persian'],
      ['lt', 'Lithuanian'],
      ['my', 'Burmese'],
      ['nb', 'Norwegian Bokmål'],
      ['nn', 'Norwegian Nynorsk'],
      ['pl', 'Polish'],
      ['ru', 'Russian'],
      ['ta', 'Tamil'],
      ['th', 'Thai'],
      ['tr', 'Turkish'],
      ['ur', 'Urdu'],
      ['vi', 'Vietnamese'],
      ['kmr', 'Kurmanji'],
      ['ti', 'Tigrinya'],
      ['prs', 'Dari'],
      ['ckb', 'Sorani'],
      ['tl', 'Tagalog'],
      ['so', 'Somali']
    ]
  }

  _generateSources(): Source[] {
    const languages = {
      nb: [
        'ar',
        'en',
        'fa',
        'lt',
        'my',
        'nb',
        'nn',
        'pl',
        'ru',
        'ta',
        'th',
        'tr',
        'ur',
        'vi',
        'kmr',
        'ti',
        'prs',
        'ckb',
        'tl',
        'so'
      ],
      nn: [
        'ar',
        'en',
        'fa',
        'lt',
        'my',
        'nb',
        'nn',
        'pl',
        'ru',
        'ta',
        'th',
        'tr',
        'ur',
        'vi',
        'kmr',
        'ti',
        'prs',
        'ckb',
        'tl',
        'so'
      ],
      en: [
        'ar',
        'en',
        'fa',
        'lt',
        'my',
        'nb',
        'nn',
        'pl',
        'ru',
        'ta',
        'th',
        'tr',
        'ur',
        'vi',
        'kmr',
        'ti',
        'prs',
        'ckb',
        'tl',
        'so'
      ],
      ar: ['nb', 'nn', 'en', 'ar'],
      fa: ['nb', 'nn', 'en', 'fa'],
      lt: ['nb', 'nn', 'en', 'lt'],
      my: ['nb', 'nn', 'en', 'my'],
      pl: ['nb', 'nn', 'en', 'pl'],
      ru: ['nb', 'nn', 'en', 'ru'],
      ta: ['nb', 'nn', 'en', 'ta'],
      th: ['nb', 'nn', 'en', 'th'],
      tr: ['nb', 'nn', 'en', 'tr'],
      vi: ['nb', 'nn', 'en', 'vi'],
      kmr: ['nb', 'nn', 'en', 'kmr'],
      ti: ['nb', 'nn', 'en', 'ti'],
      prs: ['nb', 'nn', 'en', 'prs'],
      ckb: ['nb', 'nn', 'en', 'ckb'],
      so: ['nb', 'nn', 'en', 'so'],
      ur: ['nb', 'nn', 'en', 'ur']
    }

    const soruce = {
      id: '1',
      permissions: {
        write: false,
        read: false
      },
      defaultApikey: false,
      logoUrl: '',
      inputLanguages: languages,
      name: 'Lexin',
      displayname: 'LEXIN-ordbøker',
      url: 'http://lexin.udir.no/',
      description: 'Lexin-ordbøker direkte i nettleseren',
      contactEmail: 'contact@tingtun.no',
      privateSource: false,
      markupWords: false,
      externalData: false,
      inGarbage: false,
      owner: null,
      terms: null,
      inApikey: false,
      glossaries: this._generateGlossaries(languages)
    }
    return [soruce]
  }

  _generateGlossaries(languages: Record<string, string[]>): Glossary[] {
    const returnList: Glossary[] = []
    const enteries = Object.entries(languages)
    for (const [sourceLanguage, targetLanguages] of enteries) {
      for (const targetLangauge of targetLanguages) {
        returnList.push({
          id: this.glossaryIdTracker.toString(),
          url: 'http://lexin.udir.no/',
          name: 'Lexin',
          displayname: 'Lexin ' + sourceLanguage + '->' + targetLangauge,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLangauge
        })
        this.glossaryIdTracker += 1
      }
    }
    return returnList
  }
}
