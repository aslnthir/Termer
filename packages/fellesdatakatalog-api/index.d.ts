export class FellesdatakatalogAPI {
  constructor ()
  search(term: string): Promise<SearchResult[]>
  getSources(): Source[]
}

interface SearchResult {
  definitions: DefinitionObject[],
  lexeme: LexemeObject
}

interface DefinitionObject {
  id: string
  gloss: string
  source: string,
  last_edit_time: string | undefined,
  source_language_pair: string,
  comments: string | undefined,
  domains: string[],
  url: string | undefined,
  language: string
}

interface LexemeObject {
  id: string,
  foundIn: string,
  glossary: string,
  language: string,
  terms: TermObject[],
  lemmas: string[],
  forms: string[]
}

interface TermObject {
  id: string,
  term: string,
  lemma: boolean
}

interface Source {
  id: string
  permissions: Permission,
  inApikey: boolean,
  logoUrl: string,
  inputLanguages: {'nb': ['nb']},
  name: string,
  displayname: string,
  url: string,
  description: string,
  contactEmail: string,
  privateSource: boolean,
  markupWords: boolean,
  externalData: boolean,
  inGarbage: boolean,
  owner: null,
  terms: null,
  glossaries: Glossary[]
}

interface Permission {
  write: boolean,
  read: boolean
}

interface Glossary {
  id: string,
  url: string,
  name: string,
  displayname: string,
  sourceLanguage: string,
  targetLanguage: string,
}
