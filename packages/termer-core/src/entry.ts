/*

- for å støtte både lovverk, ordbøker, leksika og oversettelser
- et generelt api for alt: slå opp definisjon av et begrep/en lovtittel.
- spesifikke apier for forskjellige typer oppslagsverk:
  - for ordbøker: bøyningsformer og ordklasser
  - for lovverk: eksempler på bruk av loven, relaterte forskrifter

ex fra oda.uio.no
søkeord (det) -> 4 artikler med oppslagsord “det” (romertall-nummererte homografer)
hver artikkel beskriver ett leksem:
- oppslagsord (lemma)
- (homografnr)
- ordklasse (ex: pronomen, enkel)
- (bøyningsformer. finnes ikke for alle. )
  - ex for verb: (tidsaspekt, kjønn, ubestemt eller bestemt, entall eller flertall, formen)
  - ex for substantiv: (ubestemt/bestemt, entall/flertall, formen)
  - ex for pronomen: (subjektsform/objektsform, formen)
- etymologi, opprinnelse, avledning (med henvisninger)
- definisjon(er) (hvis flere så er de nummerert):
  - tekstlig definisjon
  - kryssreferanser, med/uten jamfør [hva er forskjellen?]
  - eksempler (sitater)
  - underdefinisjoner (punktmerket):
    - tittel/type (ex: refleksivt, durativt, “pleie å, bruke” [for oppslag “gå”]
    - eksempler (sitater)
  - relaterte underartikler: (dette er enkle artikler (oppslagsord -> definisjon) som også har
    egne sider, men som er inkludert for visning her.)


  Translations:
  - the entry may have a language property. otherwise, assume the “from”
    language from the source description if available.
  - the definition may have a language property. If not, assume the language is
    either the “to” language from the source description, or the same as the
    entry language.

// XXX type: simple is not required. Instead, create a lexeme with one
// unspecified form (the lemma), and add to it one or more definitions.
type: simple (generic term -> {id: definition, id2:...})
  {type: 'simple', term: 'foo', definitions: {}}

type: reference to another entry
  {type: 'reference', see: [pointer to another entry]}

type: lexical entry:
 *lexeme*
 - each lexeme has a set of forms.
 ex: lexeme RUN (verb) has forms run, runs, ran, running etc.
 (I think form corresponds to term in the API.)

 - each lexeme has one (or more) lemma. Lemmas are particular forms.
 ex: the infinitive form of RUN, which is run.
 (Lemma is used as headword in dictionaries.)

 - each lexeme has one or more definitions. Plain text or HTML.
 ex: to move swiftly | To flow

 - optional simple word class (ex: verb, noun)
   (“word class” is the same as “part of speech”

 - optional, pointer: word class description, such as type of verb, transitivity,



 *form*
 each form is an inflectional variant of the lexeme, or an alternative spelling.
 as a string: the form as text (ex: 'ran')
 as an object:
 - text: (as above),
 - form info (ex: 1st person present tense, language variant (for alt. spelling)

 *images*
 Zero, one or more images accompanying the textual definition. Must be URL.

    // XXX: use pointers instead of explicit IDs?
    lexemes: {
      [id]: {
        id: id,
        lemma: [formId],
        language: langCode,
        wordClass: 'verb'
      },
    },
    definitions: {},
    forms: {
      [lemmaId]: [ // list of strings OR list of objects
        'run',  // formid 0
        // or
        {        // formid 1
          text: 'ran',
          info: {

          }
        }
      ]
    }, // or keep forms as a property of lexeme?
    images: {},
  }
}
    // XXX: pointers
    terms: {
      [entryId]: {
        type: 'lexeme'
        id: id, // is this needed???
        lemma: [<same object as formid #0>],
        ?language: langCode,
        ?wordClass: 'verb',
        forms: forms#0,
        // I moved forms out b/c I thought it would facilitate searching among
        // all the forms and getting the related entry. I must check if this is
        // the case.
        definitions: {
          [definitionId]: {
            ?language: langCode
            definition: ''
            ?seeAlso: []
            ?examples: []
            ?subDefinitions: {
              [subDefId]: {
                <<subdefdatafields>>
                *maybe:*
                title: '',
                examples: []
              }
              ...
            },
            ?subArticles: {
              [idForOrdering]: entry-pointer#0,
              ...
            }
          },
          ...
        },
      },
    },
    forms: {
      // forms#0
      [entryId]: [ // list of strings OR list of objects
          'run',  // formid 0
          // or
          {        // formid 1
            text: 'ran',
            info: {
              // aspect, plurality etc.
            }
          }
      ],
    },
    images: {},
    searchTerms: {
      // mapping from searchTerm string to ordered list of lexemes.
      'ost': [lexeme#0, lexeme#1]
      'noresultforthisterm': []
    }
  }



*/
export interface Entry {
  // A lexeme, or a generic “entry” in a dictionary
  id: EntryId
  lemmas?: (Form | string)[]
  forms?: (Form | string)[]
  definitions: Definitions
  language?: Language
  wordClass?: string
  domain?: string
  // foundIn: Dictionary | Source
  foundIn: Source | SourceId
}

export type LexemeId = string
export interface Lexeme {
  // lexeme: an entry in a dictionary.
  id: LexemeId
  lemmas?: (Form | string)[]
  forms?: (Form | string)[]
  inflexions?: (Form | string)[]
  language: string
  wordClass?: string
  domain?: string
  foundIn: SourceId
  glossary: GlossaryId
}

export interface Glossary {
  id: GlossaryId
  url: string
  name: string
  displayname: string
  sourceLanguage: string
  targetLanguage: string
}

export interface Source {
  id: SourceId
  // XXX add source info
  url: string
  name: string // e.g. anskaffelser
  displayname: string // e.g. anskaffelser
  // lang_concept: string // language code // XXX not in use?
  // lang_description: string // XXX not in use?
  terms: string | null // api url to terms, e.g. https://glossary.tingtun.no/glossary2/definitions/?sources=18
  owner: string | null // username, e.g eglossaryadmin
  privateSource: boolean
  // sharePremission: boolean // XXX not in use?
  description: string // e.g. www.anskaffelser.no
  markupWords: boolean
  contactEmail: string // email address, e.g. RBr@standard.no
  inGarbage: boolean
  permissions: Permissions | null
  // sharedIdentifier?: string // ? // XXX not in use?
  inApikey: boolean
  defaultApikey: boolean
  logoUrl: string | null // url to a logo image
  inputLanguages: Record<string, string[]>
  externalData: boolean
  glossaries: Glossary[]
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

export interface GlossaryData {
  id?: string
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

export interface TermCreation {
  meaning: string
  source: string
  comments: string
  lexemes: string
}

interface Permissions {
  read: boolean
  write: boolean
}

export type GlossaryId = string
export type SourceId = string
export type EntryId = string

/*
interface Dictionary {
  id: DictionaryId
  source: Source
}
type DictionaryId = string
*/

interface Translation {
  // lexeme to lexeme.
  from: Entry
  to: Entry
}

interface Form {
  text: string
  info: object // Specify
}

interface Language {
  from: string
  to: string
}

export type DefinitionId = string
export interface Definitions {
  [definitionId: string]: Definition
}

export interface Definition {
  id: DefinitionId
  gloss: string // Specify with a union type: Text | HTML ?
  comments?: string
  seeAlso?: string[]
  subDefinitions?: Definitions
  subArticles?: Entry[]
  lastEditTime?: string // date
  language: string
  url?: string
  examples?: Example[]
  references: Reference[]
  glossaryId?: string
  foundIn?: string
}

export interface Reference {
  id: string
  definition: string
  refrence: string
}

export interface Example {
  id?: string
  text: string
}

export type Wordlist = string[]

export type ApikeySettingId = string

export interface ApikeySetting {
  id: ApikeySettingId
  api_key: Apikey
  hide_references?: Boolean
  created: string
  sources: SourceApikeySetting[]
  glossaries?: GlossaryApikeySetting[]
  domain_filter?: any
}

interface SourceApikeySetting {
  source: string
  default: Boolean
}

interface GlossaryApikeySetting {
  glossary: string
  default: Boolean
}

export type Apikey = string
