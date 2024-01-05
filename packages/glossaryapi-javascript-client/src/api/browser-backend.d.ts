declare module 'glossaryapi-client/src/api/browser-backend' {
  export class BrowserBackendAPI {
    constructor ()
    // getLoggedInUser (): Promise<User | {} | Error>
    // termLexemeSearch (term: string, params: Params): Promise<Response<SearchResult>>
    termSearch (term: string, params: Params): Promise<Response<SearchResult>>
    getSource (sourceId: string, params: Params): Promise<GetSourceResult>
    getWordlist (params: Params): Promise<WordlistResponse>
    getSourceList (params: Params): Promise<Response<GetSourceResult>>
    // _ajaxGET<T>(url: string, options: {params?: Params, options?: { headers?: object, withCredentials: boolean}}): Promise<T>
    // endpointURL: string
    getDefinitionsList (params: Record<string, string>): Promise<[]>
  }

  export interface Response<T> {
    count: number
    next: string
    previous: string
    results: Array<T>
  }

  export interface SearchResult {
    id: number
    lexemes: Lexeme
    source: number
    meaning: string
    last_edit_time?: string
    comments?: string
  }


    // lexeme: Lexeme
    // translations: null
    // definitions: SearchResultEntry[]

  export interface Lexeme {
    id: number
    source_id: number
    terms: Array<Term>
    language: string
    glossary: number
  }

  export interface Term {
    id: number
    term: string
    lemma: boolean
  }

  export interface SearchResultEntry {
    source: number
    source_language_pair?: string
    comments?: string
    domains?: Array<string>
    id: number
    url?: string
    source_concept_language: string
    source_meaning_language: string
    images?: Array<string>
    meaning: string
    last_edit_time: string
  }

  export interface WordlistResponse {
    wordlist?: Array<string>
  }

  export interface Params {
    sources?: string // comma separated source IDs
    domains?: string // Just a guess
    api?: string  // api key, are multiples allowed?
    ref?: string // URL/hostname of the current page
    inputLanguages?: string  // Comma-separated list of language codes, names or ids
    targetLanguages?: string  // Comma-separated list of language codes, names or ids
    sourceType?: string // enum of types
    limit?: string
    offset?: string
    sourcetype?: string
  }

  export interface Glossary {
    id: string
    displayname: string
    name: string
    sourceLanguage: string
    targetLanguage: string
    url: string
  }

  export interface GetSourceResult {
    id: number
    url: string
    name: string
    owner: string  // username
    terms: string  // url link
    logo_url: string
    in_apikey: boolean
    description: string
    displayname: string
    in_garbedge: boolean
    permissions: {
        write: boolean
        read: boolean
    },
    lang_concept: string  // language code
    markup_words: boolean
    contact_email: string
    external_data: boolean
    glossaries: Glossary[]
    private_source: boolean
    sharePremission: false
    lang_description: string  // language code
    sharedIdentifier: string  // what is this
    source_description: {
      input_languages: Record<string, string[]>
      external_data: boolean
    }
  }
}
