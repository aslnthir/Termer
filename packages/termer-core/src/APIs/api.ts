import { ConfigValues } from '../backends/config'
import { Backend, GlossaryCollection, GlossaryCompoundId } from '../model'
import {
  GlossaryId,
  Source,
  SourceId,
  Definition,
  Wordlist,
  Lexeme,
  ApikeySetting,
  GlossaryData,
  Entry,
  TermCreation
} from 'src/entry'

export interface SearchResult {
  glossary: GlossaryCompoundId
  definitions: Definition[]
  lexeme: Lexeme
  didyoumean?: string[]
}

export interface SearchNoResult {
  glossary: GlossaryCompoundId
  didyoumean?: string[]
}

export interface SearchError {
  glossary: GlossaryCompoundId
  // `error` is not an instance of Error because Errors can’t be serialized.
  error: string
}

export interface WordlistResponse {
  wordlist?: Wordlist
  regexes?: string[]
}

export interface User {
  id: string
}

export interface DefinitionResult {
  definition: Definition
  lexeme: Lexeme
  lexemes?: Lexeme[]
}

export type Languages = string[][]

export interface TermDomain {
  id: number
  domain_name: string
  domain_number: string
  domain_code: string | null
  last_update: string
  glossaries: string[]
  source_descriptions: string[]
}

export interface LoginDetails {
  key: string
  id: number
  hide_public_glossaries: boolean
  hide_private_glossaries: boolean
  hide_group_glossaries: boolean
  hide_shared_glossaries: boolean
  selected_glossaries_loaded_into_session: boolean
  user: number
}

interface Api {
  search(
    term: string,
    backend: Backend,
    ids: GlossaryCompoundId[],
    glossaries: GlossaryCollection
  ): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError>
  getSourceList(config: ConfigValues): AsyncIterableIterator<Source>
  getSource(sourceId: SourceId, config: ConfigValues): Promise<Source>
  getWordlist(
    id: GlossaryCompoundId,
    config: ConfigValues
  ): Promise<WordlistResponse>
  getLoggedInUser?(): Promise<User | null>
  getLanguages?(): Promise<Languages>
  getApikeySettings(apikeys: string[]): AsyncIterableIterator<ApikeySetting>
  getGlossaryDefinitionList(glossary: GlossaryCompoundId): AsyncIterableIterator<DefinitionResult>
  createSource(sourceData: GlossaryData): Promise<Source>
  createTerm (termData: TermCreation): Promise<DefinitionResult>
  updateDefinition(definitionId: string, definitionData: any): Promise<DefinitionResult>
  updateSource(sourceId: string, sourceData: any): Promise<Source>
  updateGlossary(sourceId: string, sourceData: any): Promise<GlossaryData>
  getDomains(): Promise<TermDomain[]>
  login(username: string, password: string): Promise<LoginDetails>
  logout(): Promise<null>
}

export { Api }
