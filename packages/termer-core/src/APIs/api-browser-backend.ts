import { DefinitionId, Definitions, Entry, Lexeme } from "src/entry";

export interface BackendBrowserDefinition {
  id: DefinitionId
  gloss: string // Specify with a union type: Text | HTML ?
  comments?: string
  seeAlso?: string[]
  examples?: string[]
  subDefinitions?: Definitions
  subArticles?: Entry[]
  last_edit_time?: string // date
  language?: string
  url?: string
  lexeme: Lexeme
  source: number
}
