declare module 'glossaryapi-client/src/api/termer' {
  export class TermerAPI {
    constructor (url?: string)
    getLoggedInUser (): Promise<User | {} | Error>
    termLexemeSearch (term: string, params: Params): Promise<Response<SearchResult>>
    termSearch (term: string, params: Params): Promise<Response<Entry>>
    getSource (sourceId: string, params: Params): Promise<Source>
    getLanguages (): Promise<Languages>
    getDefinitionsList (params: Record<string, string>): Promise<Reponse>
    createSource (sourceData: CreateGlssary): Promise<Source>
    createTerm (termData: TermCreation): Promise<DefinitionResults>
    getDomains(): Promise<TermDomain[]>
    updateTerm(id: string, modifications: any): Promise<any>
    updateSource(id: string, modifications: any): Promise<any>
    updateGlossary(id: string, modifcations: any): Promise<any>
    loginUser(loginCredentials: LoginCredentials): Promise<any>
    logoutUser(): Promise<any>
    getSourceList(params: Params): Promise<Response<Source>>
    // getWordlist (params: Params)
    _ajaxGET<T>(url: string, options: {params?: Params, options?: { headers?: object, withCredentials: boolean}}): Promise<T>
    endpointURL: string
  }

  export interface LoginCredentials {
    username: string
    password: string
  }

  export interface TermDomain {
    id: number
    domain_name: string
    domain_number: string
    domain_code: string | null
    last_update: string
    glossaries: string[]
    source_descriptions: string[]
  }

  export interface User {
    id: number
    username: string
  }

  export interface Reponse {
    count: number
    next: string | null
    previous: string | null
    results: DefinitionResults[]
  }

  export interface DefinitionResults {
    id: number
    meaning: string
    source: number
    last_edit_time: string
    comments: string | undefined
    lexemes: Lexeme[]
    url: string
    examples: undefined
    source_meaning_language: string
    permissions: Permissions
    source_description_id?: number
    glossary_id: number
    references?: Refrence[]
  }

  export interface Response<T> {
    count: number
    next: string
    previous: string
    next_external_lookups: Record<string, Record<string, string>>
    results: Array<T>
  }

  export interface SearchResult {
    lexeme: Lexeme
    translations: null
    definitions: SearchResultEntry[]
  }

  export interface SearchResultEntry {
    source: number
    source_language_pair: string
    comments?: string
    domains?: Array<string>
    id: number
    url?: string
    source_concept_language: string
    source_meaning_language: string
    images?: Array<string>
    meaning: string
    last_edit_time: string
    examples: Example[]
    references?: Refrence[]
    source_description_id?: number
    glossary_id?: number
  }

  interface Example {
    id?: string
    text: string
  }

  export interface WordlistResponse {
    wordlist?: Array<string>
    regexs?: Array<string>
    page?: string
    max_page?: string
  }

  export interface Source {
    input_languages: Record<string, string[]>
    id: string
    in_apikey: boolean
    default_apikey: boolean
    name: string
    displayname: string
    url: string
    logo_url: string
    description: string
    contact_email: string
    private_source: boolean
    markup_words: boolean
    last_modification_time: string
    creation_time: string
    external_data: boolean
    external_api_id: string
    in_garbedge: boolean
    show_notes: boolean
    hide_source_url: boolean
    in_development: boolean
    is_shared: boolean
    imagename: string
    owner: number
    groups: number[]
    glossaries: Glossary[]
    permissions: Permissions
  }

  interface  Permissions {
      read: boolean
      write: boolean
    }

  export interface Glossary {
    id: string
    name: string
    displayname: string
    url: string
    lang_concept: string
    lang_description: string
  }

  export interface TermCreation {
    meaning: string
    source: string
    comments: string
    lexemes: string
  }

  export interface Entry {
    source: number
    source_language_pair?: string
    comments?: string
    domains?: Array<string>
    id: number
    url?: string
    source_concept_language: string
    source_meaning_language: string
    images?: Array<string>
    lexemes: Array<Lexeme>
    meaning: string
    last_edit_time: string
    references?: Array<Refrence>
  }

  export interface Lexeme {
    id: number
    glossary_id: number
    terms: Array<Term>
    language: string
    source_description_id: number
  }
  export interface Term {
    id: number
    term: string
    lemma: boolean
  }
  export interface Refrence {
    id: string
    definition: string
    refrence: string
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
    apikeys?: string[]
    glossary?: string
    page?: string
  }

  export interface CreateSource {
    name: string
    displayname: string
    url: string
    markup_words: boolean
    private_source: boolean
    contact_email: string
    description: string
  }

  export interface CreateGlssary {
    name: string
    displayname: string
    url: string
    markup_words: boolean
    private_source: boolean
    contact_email: string
    description: string
    lang_concept: string
    lang_description: string
    source_description: CreateSource
  }

  type LanguageString = string

  export type Languages = LanguageString[][]
}
