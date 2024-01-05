import {
  Definition,
  DefinitionId,
  Lexeme,
  LexemeId,
  Wordlist,
  SourceId,
  Source,
  Glossary,
  GlossaryId,
  ApikeySetting,
  Apikey
} from './entry'
import { SearchError } from './APIs/api'
import { filterSourceObjects, assertNever, filterLanguages } from './util'
import { BackendProperties, ConfigValues } from './backends/config'
import { immutable as O, PatchRequest, D } from 'patchinko'
import flyd from 'flyd'
import flydLift from 'flyd/module/lift'
import { dropRepeatsWith as flydDropRepeatsWith } from 'flyd/module/droprepeats'
import { equals } from 'ramda'
import {
  RemoteData,
  constructors as remoteData,
  isNotAsked,
  merge as mergeRemoteData,
  mergeObject as mergeRemoteObjectData
} from './remotedata'
import * as statsModel from './statistics-model'
import { SiteConfiguration } from 'site-configurations'

export type BackendId = string
export type ApiKey = string
export type BackendCollection = Record<BackendId, Backend>

export enum BackendType {
  Termer = 'Termer',
  BrowserBackend = 'BrowserBackend',
  WikipediaBackend = 'WikipediaBackend',
  LexinBackend = 'LexinBackend',
  GemetBackend = 'GemetBackend',
  LovdataBackend = 'LovdataBackend',
  NavBackend = 'NavBackend',
  DomstolBackend = 'DomstolBackend',
  FellesdataKatalogBackend = 'FellesdataKatalogBackend',
  JusleksikonBackend = 'JusleksikonBackend',
  IcnpBackend = 'IcnpBackend',
  EcbBackend = 'EcbBackend',
  SprakradetBackend = 'SprakradetBackend',
  SnlBackend = 'SnlBackend',
  FofBackend = 'FofBackend',
  DsbBackend = 'DsbBackend',
  EctBackend = 'EctBackend',
  FelleskatalogenBackend = 'FelleskatalogenBackend',
  NaobBackend = 'NaobBackend',
}

export interface BackendDescriptor {
  type: BackendType
  url?: string // Not all backends must have an URL?
  loginUrl?: string
  config: ConfigValues
  properties: BackendProperties
}

export interface TermDomain {
  id: string
  code: string
  name: string
}

export interface Backend extends BackendDescriptor {
  id: BackendId
}

export interface Language {
  name: LanguageName
  code: LanguageName
}

export type SourceCollection = Record<
  SourceCompoundIdString,
  RemoteData<Source>
>

export type GlossaryCollection = Record<GlossaryCompoundIdString, Glossary>

export type WordlistCollection = Record<
  GlossaryCompoundIdString,
  RemoteData<Wordlist>
>

export type RegexCollection = Record<
  GlossaryCompoundIdString,
  RemoteData<string[]>
>

export type ApikeySettingCompoundIdString = string

export type SourceCompoundIdString = string

export type GlossaryCompoundIdString = string

export type SourceLanguageCompoundIdString = string

export type LanguagePairCompoundIdString = string

export type LanguageCode = string

export type LanguageName = string

export type LanguageDict = Record<LanguageCode, Language>

export type LexemeCompoundIdString = string

type DefinitionCompoundIdString = string

export interface BackendCompoundId {
  backendId: BackendId
}

export interface ApikeySettingCompoundId extends BackendCompoundId {
  apikey: string
}

export interface SourceCompoundId extends BackendCompoundId {
  sourceId: SourceId
}

export interface GlossaryCompoundId extends SourceCompoundId {
  glossaryId: GlossaryId
}

export interface SourceLanguageCompoundId extends SourceCompoundId {
  languageSelection: LanguageSelection
}

export interface LanguagePairCompoundId extends SourceCompoundId {
  fromLanguageId: string
  toLanguageId: string
}

export interface LexemeCompoundId extends SourceCompoundId {
  lexemeId: LexemeId
}

export interface DefinitionCompoundId extends SourceCompoundId {
  definitionId: DefinitionId
}

export type VueSetting = Record<string, string>

export type SearchTermCollection = Record<SearchTerm, GlossaryLexemes>

export type SearchTerm = string

export type LocationDomain = string

export type LanguageSelection = Record<LanguageCode, LanguageCode[]>

export type SourceLanguageSelection = Record<
  SourceCompoundIdString,
  LanguageSelection
>

export type SourceGlossarySelection = Record<SourceCompoundIdString, Glossary[]>

type LexemeCollection = Record<LexemeCompoundIdString, Lexeme>

type DefinitionCollection = Record<DefinitionCompoundIdString, Definition>

type SearchResultDefinitionLanguageData = Record<
  LanguageCode,
  LexemeCompoundIdString[]
>

export type SearchResultLanguagesData = Record<
  LanguageCode,
  SearchResultDefinitionLanguageData
>

export type GlossaryLexemes = Record<
  GlossaryCompoundIdString,
  RemoteData<LexemeCompoundIdString[]>
>

export type SearchDidYouMeanCollection = Record<
  SearchTerm,
  Record<GlossaryCompoundIdString, string[]>
>

export interface UserDefaultSetting {
  userGlossaryOrderById?: GlossaryCompoundIdString[]
  userDeselectedSources?: SourceCompoundIdString[]
  userSelectedSources?: SourceCompoundIdString[]
  userSelectedSourceLanguage?: LanguageCode[]
  userSelectedTargetLanguage?: LanguageCode[]
  userSelectedSourceGlossary?: GlossaryCompoundIdString[]
  userDeselectedSourceGlossary?: GlossaryCompoundIdString[]
  userSelectedTermDomains?: string[]
}

export type Model = MainModel & statsModel.Model

export type ExcludeMarkupList = string[]

export type BackendTermDomain = Record<
  BackendId,
  RemoteData<Record<string, TermDomain[]>>>

export type Domain = string

interface MainModel {
  appDomain: Domain

  sources: SourceCollection
  glossaries: GlossaryCollection
  backends: BackendCollection
  lexemes: LexemeCollection
  definitions: DefinitionCollection
  lexemeDefinitions: Record<
    LexemeCompoundIdString,
    DefinitionCompoundIdString[]
  >
  termDomains: BackendTermDomain
  searchResults: Record<SearchTerm, GlossaryLexemes>
  wordlists: WordlistCollection
  wordlistRegexes: RegexCollection
  excludeMarkups: ExcludeMarkupList
  locationDomain: LocationDomain
  glossaryLexemes: GlossaryLexemes
  initialGlossaryOrder: GlossaryCompoundIdString[]

  searchTerm: SearchTerm
  backendDefaultOn: BackendId[]
  selectedConfigSources: SourceCompoundIdString[]
  deselectedSources: SourceCompoundIdString[]
  selectedFromLanguages: LanguageCode[]
  userSelectedFromLanguage: LanguageCode[]
  selectedToLanguages: LanguageCode[]
  supportedLanguages: LanguageDict
  mandatorySourcesOn: SourceCompoundIdString[]
  searchDidYouMean: SearchDidYouMeanCollection,

  backendSources: Record<BackendId, RemoteData<SourceCompoundId[]>>
  backendApikeySettings: Record<
    BackendId,
    RemoteData<Record<Apikey, ApikeySetting>>
  >
  // sourceBackends: SourceBackends

  uniqueToken: string | null // uuid

  sourceRank: string[]

  userSelectedFromLanguages: LanguageCode[]
  userSelectedToLanguages: LanguageCode[]
  userGlossaryOrderById: GlossaryCompoundIdString[]
  userDeselectedSources: SourceCompoundIdString[]
  userSelectedSources: SourceCompoundIdString[]
  userSelectedSourceLanguage: LanguagePairCompoundIdString[]
  userSelectedSourceGlossary: GlossaryCompoundIdString[]
  userDeselectedSourceGlossary: GlossaryCompoundIdString[]
  userSelectedTermDomains: string[]

  userDefault: UserDefaultSetting

  vueSettings: VueSetting
  fullSiteConfig: SiteConfiguration | null

  siteSettingsReady: boolean
  debug: boolean
}

const initialMainModel: MainModel = {
  appDomain: '',

  sources: {},
  glossaries: {},
  backends: {},
  lexemes: {},
  definitions: {},
  lexemeDefinitions: {},
  termDomains: {},
  searchResults: {},
  wordlists: {},
  wordlistRegexes: {},
  excludeMarkups: [],
  locationDomain: '',
  glossaryLexemes: {},
  initialGlossaryOrder: [],

  searchTerm: '',
  backendDefaultOn: [],
  selectedConfigSources: [],
  deselectedSources: [],
  selectedFromLanguages: [],
  selectedToLanguages: [],
  supportedLanguages: {},
  mandatorySourcesOn: [],
  searchDidYouMean: {},

  backendSources: {},
  backendApikeySettings: {},
  // sourceBackends: {}
  uniqueToken: null,

  sourceRank: [],

  userSelectedFromLanguages: [],
  userSelectedToLanguages: [],
  userGlossaryOrderById: [],
  userDeselectedSources: [],
  userSelectedSources: [],
  userSelectedSourceLanguage: [],
  userSelectedSourceGlossary: [],
  userDeselectedSourceGlossary: [],
  userSelectedTermDomains: [],

  userDefault: {},

  vueSettings: {},
  fullSiteConfig: null,

  siteSettingsReady: false,
  debug: false
}

const initialModel: Model = {
  ...initialMainModel,
  ...statsModel.initialModel
}

const updateStream = flyd.stream<PatchRequest<Model>>()
const model = flyd.scan(
  (m, p) => {
    return O(m, p)
  },
  initialModel,
  updateStream
)

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function isMessage(x: MessageType | any): x is MessageType {
  return x in MessageType
}

export function update(message: Message): void {
  let patch: Partial<PatchRequest<Model>>
  if (isMessage(message.type)) {
    patch = handleMessage(message as MainMessage)
  } else if (statsModel.isMessage(message.type)) {
    patch = statsModel.handleMessage(message as statsModel.Message)
  } else {
    assertNever(message.type)
    patch = {}
  }
  updateStream(patch as PatchRequest<Model>)
}

function handleMessage(message: MainMessage): Partial<PatchRequest<Model>> {
  switch (message.type) {
    case MessageType.SET_APPDOMAIN:
      return handleSetAppDomain(message)
      break
    case MessageType.ADD_UNIQUE_TOKEN:
      return handleAddUniqueToken(message)
      break
    case MessageType.BACKEND_LOGGED_IN:
      return handleBackendLoggedIn(message)
      break
    case MessageType.ADD_BACKEND:
      return handleAddBackendMessage(message)
      break
    case MessageType.SET_APIKEYSETTING:
      return handleSetApikeySettings(message)
      break
    case MessageType.ADD_GLOSSARY_LEXEME_LIST:
      return handleAddGlossaryLexemeList(message)
      break
    case MessageType.ADD_SOURCE_LIST_FOR_BACKEND:
      return handleAddSourceListForBackend(message)
      break
    case MessageType.SEARCH_TERM:
      return handleSearchTermMessage(message)
      break
    case MessageType.REQUEST_SEARCH:
      return handleRequestSearchMessage(message)
      break
    case MessageType.START_SEARCH:
      return handleStartSearchMessage(message)
      break
    case MessageType.ADD_EMPTY_SEARCH_RESULT:
      return handleAddEmptySearchResult(message)
      break
    case MessageType.ADD_SEARCH_RESULT_ERROR:
      return handleAddSearchResultError(message)
      break
    case MessageType.ADD_SEARCH_RESULT:
      return handleAddSearchResult(message)
      break
    case MessageType.ADD_SOURCE:
      return handleAddSourceMessage(message)
      break
    case MessageType.ADD_SOURCES:
      return handleAddSourcesMessage(message)
      break
    case MessageType.ADD_GLOSSARY:
      return handleAddGlossaryMessage(message)
      break
    case MessageType.ADD_GLOSSARIES:
      return handleAddGlossariesMessage(message)
      break
    case MessageType.UPDATE_GLOSSARY:
      return handleUpdateGlossaryMessage(message)
      break
    case MessageType.ADD_WORDLIST:
      return handleAddWordlistMessage(message)
      break
    case MessageType.ADD_MULTIPLE_WORDLISTS:
      return handleAddMultipleWordlistMessage(message)
      break
    case MessageType.ADD_REGEXES:
      return handleAddWordlistRegexesMessage(message)
      break
    case MessageType.ADD_MULTIPLE_REGEXES:
      return handleAddMultipleWordlistRegexesMessage(message)
      break
    case MessageType.ADD_APIKEY:
      return handleAddApikeyMessage(message)
      break
    case MessageType.SELECT_CONFIG_SOURCE:
      return handleSelectConfigSourceMessage(message)
      break
    case MessageType.DESELECT_SOURCE:
      return handleDeselectSourceMessage(message)
      break
    case MessageType.USER_SELECT_SOURCE:
      return handleUserSelectSourceMessage(message)
      break
    case MessageType.SET_USER_SELECT_SOURCE:
      return handleSetUserSelectSourceMessage(message)
      break
    case MessageType.USER_DESELECT_SOURCE:
      return handleUserDeselectSourceMessage(message)
      break
    case MessageType.SET_USER_DESELECT_SOURCE:
      return handleSetUserDeselectSourceMessage(message)
      break
    case MessageType.SELECT_USER_FROM_LANGUAGE:
      return handleSelectUserFromLanguageMessage(message)
      break
    case MessageType.DESELECT_USER_FROM_LANGUAGE:
      return handleDeselectUserFromLanguageMessage(message)
      break
    case MessageType.SELECT_USER_TO_LANGUAGE:
      return handleSelectUserToLanguageMessage(message)
      break
    case MessageType.DESELECT_USER_TO_LANGUAGE:
      return handleDeselectUserToLanguageMessage(message)
      break
    case MessageType.SET_USER_TO_LANGUAGES:
      return handleSetUserToLanguagesMessage(message)
      break
    case MessageType.SET_USER_FROM_LANGUAGES:
      return handleSetUserFromLanguagesMessage(message)
      break
    case MessageType.SELECT_FROM_LANGUAGE:
      return handleSelectFromLanguageMessage(message)
      break
    case MessageType.DESELECT_FROM_LANGUAGE:
      return handleDeselectFromLanguageMessage(message)
      break
    case MessageType.SELECT_TO_LANGUAGE:
      return handleSelectToLanguageMessage(message)
      break
    case MessageType.DESELECT_TO_LANGUAGE:
      return handleDeselectToLanguageMessage(message)
      break
    case MessageType.SET_TO_LANGUAGES:
      return handleSetToLanguagesMessage(message)
      break
    case MessageType.SET_FROM_LANGUAGES:
      return handleSetFromLanguagesMessage(message)
      break
    case MessageType.REPLACE_MODEL:
      return handleReplaceModel(message)
      break
    case MessageType.REPLACE_MODEL_FIELD:
      return handleReplaceModelField(message)
      break
    case MessageType.PATCH_MODEL_OBJECT:
      return handlePatchModelObject(message)
      break
    case MessageType.SET_LOCATION_DOMAIN:
      return handleSetLocationDomainMessage(message)
      break
    case MessageType.SELECT_USER_SELECTED_SOURCE_LANGUAGE:
      return handleSelectUserSelectedSourcesLanguageMessage(message)
      break
    case MessageType.DESELECT_USER_SELECTED_SOURCE_LANGUAGE:
      return handleDeselectUserSelectedSourcesLanguageMessage(message)
      break
    case MessageType.SET_USER_GLOSSARY_ORDER_BY_ID:
      return handleSetUserGlossaryOrderByIdMessage(message)
      break
    case MessageType.SET_INITIAL_GLOSSARY_ORDER_BY_ID:
      return handleSetInitialGlossaryOrderByIdMessage(message)
      break
    case MessageType.SET_USER_SELECTED_SOURCE_LANGUAGES:
      return handleSetUserSelectedSourcesLanguagesMessage(message)
      break
    case MessageType.ADD_USER_SELECTED_SOURCE_GLOSSARY:
      return handleAddUserSelectedSourcesGlossaryMessage(message)
      break
    case MessageType.SET_USER_SELECTED_SOURCE_GLOSSARY:
      return handleSetUserSelectedSourcesGlossaryMessage(message)
      break
    case MessageType.REMOVE_USER_SELECTED_SOURCE_GLOSSARY:
      return handleRemoveUserSelectedSourcesGlossaryMessage(message)
      break
    case MessageType.ADD_USER_DESELECTED_SOURCE_GLOSSARY:
      return handleAddUserDeselectedSourcesGlossaryMessage(message)
      break
    case MessageType.SET_USER_DESELECTED_SOURCE_GLOSSARY:
      return handleSetUserDeselectedSourcesGlossaryMessage(message)
      break
    case MessageType.REMOVE_USER_DESELECTED_SOURCE_GLOSSARY:
      return handleRemoveUserDeselectedSourcesGlossaryMessage(message)
      break
    case MessageType.ADD_LEXEME:
      return handleAddLexeme(message)
      break
    case MessageType.ADD_DEFINITION:
      return handleAddDefinition(message)
      break
    case MessageType.UPDATE_DEFINITION:
      return handleUpdateDefinition(message)
      break
    case MessageType.ADD_MULTIPLE_LEXEMES:
      return handleAddMultipleLexemes(message)
      break
    case MessageType.ADD_MULTIPLE_DEFINITIONS:
      return handleAddMultipleDefinitions(message)
      break
    case MessageType.ADD_LEXEME_DEFINITIONS:
      return handleAddLexemeDefinitions(message)
      break
    case MessageType.ADD_MULTIPLE_LEXEME_DEFINITIONS:
      return handleAddMultipleLexemeDefinitions(message)
      break
    case MessageType.ADD_SUPPORTED_LANGUAGE:
      return handleAddSupportedLanguages(message)
      break
    case MessageType.SET_SOURCE_RANK:
      return handleSetSourceRank(message)
      break
    case MessageType.SET_BACKEND_DEFAULT_ON:
      return handleSetBackendDefaultOn(message)
      break
    case MessageType.VUE_SETTINGS:
      return handleVueSettings(message)
      break
    case MessageType.SITE_SETTING_STATE:
      return handleSiteSettingState(message)
      break
    case MessageType.MANDATORY_SOURCES_ON:
      return handleMandatorySourcesOn(message)
      break
    case MessageType.SITE_SETTINGS:
      return handleSetSiteConfig(message)
      break
    case MessageType.ADD_SEARCH_DID_YOU_MEAN:
      return handleSearchDidYouMean(message)
      break
    case MessageType.SET_DEBUG:
      return handleSetDebug(message)
      break
    case MessageType.SET_EXCLUDE_MARKUP:
      return handleSetExcludeMarkup(message)
      break
    case MessageType.ADD_EXCLUDE_MARKUP:
      return handleAddExcludeMarkup(message)
      break
    case MessageType.ADD_TERM_DOMAIN:
      return handleAddTermDomainMessage(message)
      break
    case MessageType.SET_USER_SELECTED_TERM_DOMAINS:
      return handleSetUserSelectedTermDomainsMessage(message)
      break
    case MessageType.SET_USER_DEFAULT_SELECTION:
      return handleSetUserDefaultSelectionMessage(message)
      break
    default:
      return assertNever(message)
  }
}

export enum MessageType {
  SET_APPDOMAIN = 'SET_APPDOMAIN',
  ADD_UNIQUE_TOKEN = 'ADD_UNIQUE_TOKEN',
  BACKEND_LOGGED_IN = 'BACKEND_LOGGED_IN',
  SEARCH_TERM = 'SEARCH_TERM',
  ADD_BACKEND = 'ADD_BACKEND',
  SET_APIKEYSETTING = 'SET_APIKEYSETTING',
  ADD_GLOSSARY_LEXEME_LIST = 'ADD_GLOSSARY_LEXEME_LIST',
  ADD_SOURCE_LIST_FOR_BACKEND = 'ADD_SOURCE_LIST_FOR_BACKEND',
  ADD_EMPTY_SEARCH_RESULT = 'ADD_EMPTY_SEARCH_RESULT',
  ADD_SEARCH_RESULT_ERROR = 'ADD_SEARCH_RESULT_ERROR',
  ADD_SEARCH_RESULT = 'ADD_SEARCH_RESULT',
  ADD_WORDLIST = 'ADD_WORDLIST',
  ADD_MULTIPLE_WORDLISTS = 'ADD_MULTIPLE_WORDLISTS',
  ADD_REGEXES = 'ADD_REGEXES',
  ADD_MULTIPLE_REGEXES = 'ADD_MULTIPLE_REGEXES',
  ADD_APIKEY = 'ADD_APIKEY',
  SELECT_CONFIG_SOURCE = 'SELECT_CONFIG_SOURCE',
  USER_SELECT_SOURCE = 'USER_SELECT_SOURCE',
  SET_USER_SELECT_SOURCE = 'SET_USER_SELECT_SOURCE',
  DESELECT_SOURCE = 'DESELECT_SOURCE',
  USER_DESELECT_SOURCE = 'USER_DESELECT_SOURCE',
  SET_USER_DESELECT_SOURCE = 'SET_USER_DESELECT_SOURCE',
  ADD_SOURCE = 'ADD_SOURCE',
  ADD_SOURCES = 'ADD_SOURCES',
  ADD_GLOSSARY = 'ADD_GLOSSARY',
  UPDATE_GLOSSARY = 'UPDATE_GLOSSARY',
  ADD_GLOSSARIES = 'ADD_GLOSSARIES',
  REPLACE_MODEL = 'REPLACE_MODEL',
  REPLACE_MODEL_FIELD = 'REPLACE_MODEL_FIELD',
  PATCH_MODEL_OBJECT = 'PATCH_MODEL_OBJECT',
  REQUEST_SEARCH = 'REQUEST_SEARCH',
  START_SEARCH = 'START_SEARCH',
  SET_LOCATION_DOMAIN = 'SET_LOCATION_DOMAIN',
  SET_FROM_LANGUAGES = 'SET_FROM_LANGUAGES',
  SELECT_FROM_LANGUAGE = 'SELECT_FROM_LANGUAGE',
  DESELECT_FROM_LANGUAGE = 'DESELECT_FROM_LANGUAGE',
  SELECT_TO_LANGUAGE = 'SELECT_TO_LANGUAGE',
  DESELECT_TO_LANGUAGE = 'DESELECT_TO_LANGUAGE',
  SET_TO_LANGUAGES = 'SET_TO_LANGUAGES',
  SET_USER_FROM_LANGUAGES = 'SET_USER_FROM_LANGUAGES',
  SELECT_USER_FROM_LANGUAGE = 'SELECT_USER_FROM_LANGUAGE',
  DESELECT_USER_FROM_LANGUAGE = 'DESELECT_USER_FROM_LANGUAGE',
  SELECT_USER_TO_LANGUAGE = 'SELECT_USER_TO_LANGUAGE',
  DESELECT_USER_TO_LANGUAGE = 'DESELECT_USER_TO_LANGUAGE',
  SET_USER_TO_LANGUAGES = 'SET_USER_TO_LANGUAGES',
  SELECT_USER_SELECTED_SOURCE_LANGUAGE = 'SELECT_USER_SELECTED_SOURCE_LANGUAGE',
  DESELECT_USER_SELECTED_SOURCE_LANGUAGE = 'DESELECT_USER_SELECTED_SOURCE_LANGUAGE',
  SET_USER_GLOSSARY_ORDER_BY_ID = 'SET_USER_GLOSSARY_ORDER_BY_ID',
  SET_INITIAL_GLOSSARY_ORDER_BY_ID = 'SET_INITIAL_GLOSSARY_ORDER_BY_ID',
  SET_USER_SELECTED_SOURCE_LANGUAGES = 'SET_USER_SELECTED_SOURCE_LANGUAGES',
  ADD_USER_SELECTED_SOURCE_GLOSSARY = 'ADD_USER_SELECTED_SOURCE_GLOSSARY',
  SET_USER_SELECTED_SOURCE_GLOSSARY = 'SET_USER_SELECTED_SOURCE_GLOSSARY',
  REMOVE_USER_SELECTED_SOURCE_GLOSSARY = 'REMOVE_USER_SELECTED_SOURCE_GLOSSARY',
  REMOVE_USER_DESELECTED_SOURCE_GLOSSARY = 'REMOVE_USER_DESELECTED_SOURCE_GLOSSARY',
  ADD_USER_DESELECTED_SOURCE_GLOSSARY = 'ADD_USER_DESELECTED_SOURCE_GLOSSARY',
  SET_USER_DESELECTED_SOURCE_GLOSSARY = 'SET_USER_DESELECTED_SOURCE_GLOSSARY',
  ADD_LEXEME = 'ADD_LEXEME',
  ADD_MULTIPLE_LEXEMES = 'ADD_MULTIPLE_LEXEMES',
  ADD_DEFINITION = 'ADD_DEFINITION',
  UPDATE_DEFINITION = 'UPDATE_DEFINITION',
  ADD_MULTIPLE_DEFINITIONS = 'ADD_MULTIPLE_DEFINITIONS',
  ADD_LEXEME_DEFINITIONS = 'ADD_LEXEME_DEFINITIONS',
  ADD_MULTIPLE_LEXEME_DEFINITIONS = 'ADD_MULTIPLE_LEXEME_DEFINITIONS',
  ADD_SUPPORTED_LANGUAGE = 'ADD_SUPPORTED_LANGUAGE',
  SET_SOURCE_RANK = 'SET_SOURCE_RANK',
  SET_BACKEND_DEFAULT_ON = 'SET_BACKEND_DEFAULT_ON',
  VUE_SETTINGS = 'VUE_SETTINGS',
  SITE_SETTING_STATE = 'SITE_SETTING_STATE',
  MANDATORY_SOURCES_ON = 'MANDATORY_SOURCES_ON',
  SITE_SETTINGS = 'SITE_SETTINGS',
  ADD_SEARCH_DID_YOU_MEAN = 'ADD_SEARCH_DID_YOU_MEAN',
  SET_DEBUG = 'SET_DEBUG',
  SET_EXCLUDE_MARKUP = 'SET_EXCLUDE_MARKUP',
  ADD_EXCLUDE_MARKUP = 'ADD_EXCLUDE_MARKUP',
  ADD_TERM_DOMAIN = 'ADD_TERM_DOMAIN',
  SET_USER_SELECTED_TERM_DOMAINS = 'SET_USER_SELECTED_TERM_DOMAINS',
  SET_USER_DEFAULT_SELECTION = 'SET_USER_DEFAULT_SELECTION'
}

interface MessageSetAppDomain {
  type: MessageType.SET_APPDOMAIN
  domain: string
}

interface MessageSetDebug {
  type: MessageType.SET_DEBUG
  value: boolean
}

interface MessageAddSearchDidYouMean {
  type: MessageType.ADD_SEARCH_DID_YOU_MEAN
  searchTerm: string
  data: Record<GlossaryCompoundIdString, string[]>
}

interface MessageMandatorySourcesOn {
  type: MessageType.MANDATORY_SOURCES_ON
  sources: SourceCompoundIdString[]
}

interface MessageSiteSettingState {
  type: MessageType.SITE_SETTING_STATE
  state: boolean
}

interface MessageVueSettings {
  type: MessageType.VUE_SETTINGS
  settings: VueSetting
}

interface MessageSetSourceRank {
  type: MessageType.SET_SOURCE_RANK
  sources: string[]
}

interface MessageAddUniqueToken {
  type: MessageType.ADD_UNIQUE_TOKEN
  token: string // uuid
}

interface MessageBackendLoggedIn {
  type: MessageType.BACKEND_LOGGED_IN
  backendId: BackendId
  loggedIn: RemoteData<boolean>
}

interface MessageAddBackend {
  type: MessageType.ADD_BACKEND
  backend: Backend
}
interface MessageSetApikeySetting {
  type: MessageType.SET_APIKEYSETTING
  id: BackendId
  setting: RemoteData<Record<Apikey, ApikeySetting>>
}
interface MessageAddGlossaryLexemeList {
  type: MessageType.ADD_GLOSSARY_LEXEME_LIST
  id: GlossaryCompoundId
  list: RemoteData<LexemeCompoundIdString[]>
}
interface MessageAddSource {
  type: MessageType.ADD_SOURCE
  id: SourceCompoundId
  source: RemoteData<Source>
}
interface MessageAddSources {
  type: MessageType.ADD_SOURCES
  list: MessageAddSource[]
}
interface MessageAddGlossary {
  type: MessageType.ADD_GLOSSARY
  id: GlossaryCompoundId
  glossary: Glossary
}
interface MessageAddGlossaries {
  type: MessageType.ADD_GLOSSARIES
  glossaries: GlossaryCollection
}
interface MessageSearchTerm {
  type: MessageType.SEARCH_TERM
  term: SearchTerm
}
interface MessageRequestSearch {
  type: MessageType.REQUEST_SEARCH
  id: GlossaryCompoundId
  term: SearchTerm
}
interface MessageStartSearch {
  type: MessageType.START_SEARCH
  id: GlossaryCompoundId
  term: SearchTerm
}
interface MessageAddEmptySearchResult {
  type: MessageType.ADD_EMPTY_SEARCH_RESULT
  id: GlossaryCompoundId
  term: SearchTerm
}
interface MessageAddSearchResultError {
  type: MessageType.ADD_SEARCH_RESULT_ERROR
  term: SearchTerm
  id: GlossaryCompoundId
  error: SearchError
}
interface MessageAddSearchResult {
  type: MessageType.ADD_SEARCH_RESULT
  lexemeCompoundId: LexemeCompoundId
  id: GlossaryCompoundId
  term: SearchTerm
}
interface MessageAddLexeme {
  type: MessageType.ADD_LEXEME
  id: LexemeCompoundId
  lexeme: Lexeme
}
interface MessageAddMultipleLexemes {
  type: MessageType.ADD_MULTIPLE_LEXEMES
  list: MessageAddLexeme[]
}
interface MessageAddDefinition {
  type: MessageType.ADD_DEFINITION
  definitionCompoundId: DefinitionCompoundId
  definition: Definition
}
interface MessageAddMultipleDefinitions {
  type: MessageType.ADD_MULTIPLE_DEFINITIONS
  list: MessageAddDefinition[]
}
interface MessageUpdateDefinition {
  type: MessageType.UPDATE_DEFINITION
  definitionCompoundId: DefinitionCompoundId
  definition: Definition
}
interface MessageAddWordlist {
  type: MessageType.ADD_WORDLIST
  id: GlossaryCompoundId
  wordlist: RemoteData<Wordlist>
}
interface MessageAddMultipleWordlist {
  type: MessageType.ADD_MULTIPLE_WORDLISTS
  wordlists: WordlistCollection
}
interface MessageAddWordlistRegexes {
  type: MessageType.ADD_REGEXES
  id: GlossaryCompoundId
  regexes: RemoteData<string[]>
}
interface MessageAddMultipleWordlistRegexes {
  type: MessageType.ADD_MULTIPLE_REGEXES
  regexes: RegexCollection
}
interface MessageAddApiKey {
  type: MessageType.ADD_APIKEY
  id: BackendId
  apiKey: ApiKey
}
interface MessageSelectConfigSource {
  type: MessageType.SELECT_CONFIG_SOURCE
  id: SourceCompoundIdString[]
}
interface MessageUserSelectSource {
  type: MessageType.USER_SELECT_SOURCE
  id: SourceCompoundId
}
interface MessageSetUserSelectSource {
  type: MessageType.SET_USER_SELECT_SOURCE
  ids: SourceCompoundIdString[]
}
interface MessageDeselectSource {
  type: MessageType.DESELECT_SOURCE
  id: SourceCompoundId[]
}
interface MessageUserDeselectSource {
  type: MessageType.USER_DESELECT_SOURCE
  id: SourceCompoundId
}
interface MessageSetUserDeselectSource {
  type: MessageType.SET_USER_DESELECT_SOURCE
  ids: SourceCompoundIdString[]
}
interface MessageSelectFromLanguage {
  type: MessageType.SELECT_FROM_LANGUAGE
  languageCode: LanguageCode
}
interface MessageDeselectFromLanguage {
  type: MessageType.DESELECT_FROM_LANGUAGE
  languageCode: LanguageCode
}
interface MessageSelectToLanguage {
  type: MessageType.SELECT_TO_LANGUAGE
  languageCode: LanguageCode
}
interface MessageDeselectToLanguage {
  type: MessageType.DESELECT_TO_LANGUAGE
  languageCode: LanguageCode
}
interface MessageSetFromLanguages {
  type: MessageType.SET_FROM_LANGUAGES
  languageCode: LanguageCode[]
}
interface MessageSetToLanguages {
  type: MessageType.SET_TO_LANGUAGES
  languageCode: LanguageCode[]
}
interface MessageSelectUserFromLanguage {
  type: MessageType.SELECT_USER_FROM_LANGUAGE
  languageCode: LanguageCode
}
interface MessageDeselectUserFromLanguage {
  type: MessageType.DESELECT_USER_FROM_LANGUAGE
  languageCode: LanguageCode
}
interface MessageSelectUserToLanguage {
  type: MessageType.SELECT_USER_TO_LANGUAGE
  languageCode: LanguageCode
}
interface MessageDeselectUserToLanguage {
  type: MessageType.DESELECT_USER_TO_LANGUAGE
  languageCode: LanguageCode
}
interface MessageSetUserFromLanguages {
  type: MessageType.SET_USER_FROM_LANGUAGES
  languageCode: LanguageCode[]
}
interface MessageSetUserToLanguages {
  type: MessageType.SET_USER_TO_LANGUAGES
  languageCode: LanguageCode[]
}
interface MessageReplaceModel {
  type: MessageType.REPLACE_MODEL
  model: Model
}
interface MessageSetBackendDefaultOn {
  type: MessageType.SET_BACKEND_DEFAULT_ON
  backends: BackendId[]
}
interface MessageAddTermDomain {
  type: MessageType.ADD_TERM_DOMAIN
  backendId: BackendId
  domains: RemoteData<Record<string, TermDomain>>
}
interface MessageSetUserSelectedTermDomains {
  type: MessageType.SET_USER_SELECTED_TERM_DOMAINS
  domains: string[]
}
interface MessageSetUserDefaultSelection {
  type: MessageType.SET_USER_DEFAULT_SELECTION
  selection: UserDefaultSetting
}

type MessageReplaceModelField<T extends keyof Model = keyof Model> = {
  type: MessageType.REPLACE_MODEL_FIELD
  field: T
  data: Model[T]
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ObjectFields<T> = Extract<T[keyof T], Record<string, any>>

type OnlyObjectFields<T> = {
  [P in keyof T]: T[P] extends ObjectFields<T> ? T[P] : never
}

type ObjectModel = OnlyObjectFields<Model>

type ObjectModelKeys = keyof ObjectModel

type MessagePatchModelObject<T extends ObjectModelKeys = ObjectModelKeys> = {
  type: MessageType.PATCH_MODEL_OBJECT
  field: T
  data: ObjectModelWithDeleteKey[T]
}

export const DELETE: typeof D = O

type AddDeleteKey<T> = {
  [P in keyof T]: T[P] | typeof DELETE
}

type ObjectModelWithDeleteKey = {
  [P in ObjectModelKeys]: AddDeleteKey<ObjectModel[P]>
}

interface MessageAddSourceListForBackend {
  type: MessageType.ADD_SOURCE_LIST_FOR_BACKEND
  id: BackendId
  list: RemoteData<SourceCompoundIdString[]>
}
interface MessageSetLocationDomain {
  type: MessageType.SET_LOCATION_DOMAIN
  locationDomain: LocationDomain
}
interface MessageSelectuserSelectedSourceLanguage {
  type: MessageType.SELECT_USER_SELECTED_SOURCE_LANGUAGE
  key: LanguagePairCompoundIdString
}
interface MessageDeselectuserSelectedSourceLanguage {
  type: MessageType.DESELECT_USER_SELECTED_SOURCE_LANGUAGE
  key: LanguagePairCompoundIdString
}
interface MessageSetuserSelectedSourceLanguages {
  type: MessageType.SET_USER_SELECTED_SOURCE_LANGUAGES
  key: LanguagePairCompoundIdString[]
}
interface MessageAddUserSelectedSourceGlossary {
  type: MessageType.ADD_USER_SELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageSetUserSelectedSourceGlossary {
  type: MessageType.SET_USER_SELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageRemoveuserSelectedSourceGlossary {
  type: MessageType.REMOVE_USER_SELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageAddUserDeselectedSourceGlossary {
  type: MessageType.ADD_USER_DESELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageSetUserGlossaryOrderById {
  type: MessageType.SET_USER_GLOSSARY_ORDER_BY_ID
  ids: GlossaryCompoundIdString[]
}
interface MessageSetInitialGlossaryOrderById {
  type: MessageType.SET_INITIAL_GLOSSARY_ORDER_BY_ID
  ids: GlossaryCompoundIdString[]
}
interface MessageSetUserDeselectedSourceGlossary {
  type: MessageType.SET_USER_DESELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageRemoveUserDeselectedSourceGlossary {
  type: MessageType.REMOVE_USER_DESELECTED_SOURCE_GLOSSARY
  key: GlossaryCompoundIdString[]
}
interface MessageAddLexemeDefinitions {
  type: MessageType.ADD_LEXEME_DEFINITIONS
  lexemeId: LexemeCompoundId
  definitionIds: DefinitionCompoundId[]
}
interface MessageAddMultipleLexemeDefinitions {
  type: MessageType.ADD_MULTIPLE_LEXEME_DEFINITIONS
  list: MessageAddLexemeDefinitions[]
}
interface MessageAddSupportedLanguages {
  type: MessageType.ADD_SUPPORTED_LANGUAGE
  languages: LanguageDict
}
interface MessageSetSiteConfig {
  type: MessageType.SITE_SETTINGS
  config: SiteConfiguration
}
interface MessageSetExcludeMarkup {
  type: MessageType.SET_EXCLUDE_MARKUP
  list: ExcludeMarkupList
}
interface MessageAddExcludeMarkup {
  type: MessageType.ADD_EXCLUDE_MARKUP
  list: ExcludeMarkupList
}
interface MessageUpdateGlossary {
  type: MessageType.UPDATE_GLOSSARY
  id: GlossaryCompoundId
  glossary: Glossary
}


export type Message = MainMessage | statsModel.Message

type MainMessage =
  | MessageSearchTerm
  | MessageAddUniqueToken
  | MessageAddBackend
  | MessageSetApikeySetting
  | MessageAddGlossaryLexemeList
  | MessageAddSourceListForBackend
  | MessageRequestSearch
  | MessageStartSearch
  | MessageAddEmptySearchResult
  | MessageAddSearchResultError
  | MessageAddSearchResult
  | MessageAddSource
  | MessageAddSources
  | MessageAddGlossary
  | MessageAddGlossaries
  | MessageAddWordlist
  | MessageAddMultipleWordlist
  | MessageAddWordlistRegexes
  | MessageAddMultipleWordlistRegexes
  | MessageAddApiKey
  | MessageSelectConfigSource
  | MessageUserSelectSource
  | MessageSetUserSelectSource
  | MessageDeselectSource
  | MessageUserDeselectSource
  | MessageSetUserDeselectSource
  | MessageReplaceModel
  | MessageReplaceModelField
  | MessagePatchModelObject
  | MessageBackendLoggedIn
  | MessageSetLocationDomain
  | MessageSelectFromLanguage
  | MessageDeselectFromLanguage
  | MessageSelectToLanguage
  | MessageDeselectToLanguage
  | MessageSetToLanguages
  | MessageSetFromLanguages
  | MessageSelectUserFromLanguage
  | MessageDeselectUserFromLanguage
  | MessageSelectUserToLanguage
  | MessageDeselectUserToLanguage
  | MessageSetUserToLanguages
  | MessageSetUserFromLanguages
  | MessageSelectuserSelectedSourceLanguage
  | MessageDeselectuserSelectedSourceLanguage
  | MessageSetuserSelectedSourceLanguages
  | MessageAddUserSelectedSourceGlossary
  | MessageSetUserSelectedSourceGlossary
  | MessageRemoveuserSelectedSourceGlossary
  | MessageAddUserDeselectedSourceGlossary
  | MessageSetUserDeselectedSourceGlossary
  | MessageRemoveUserDeselectedSourceGlossary
  | MessageSetUserGlossaryOrderById
  | MessageSetInitialGlossaryOrderById
  | MessageAddLexeme
  | MessageAddMultipleLexemes
  | MessageAddDefinition
  | MessageAddMultipleDefinitions
  | MessageUpdateDefinition
  | MessageAddLexemeDefinitions
  | MessageAddMultipleLexemeDefinitions
  | MessageAddSupportedLanguages
  | MessageSetSourceRank
  | MessageSetBackendDefaultOn
  | MessageVueSettings
  | MessageSiteSettingState
  | MessageMandatorySourcesOn
  | MessageSetSiteConfig
  | MessageAddSearchDidYouMean
  | MessageSetDebug
  | MessageSetExcludeMarkup
  | MessageAddExcludeMarkup
  | MessageAddTermDomain
  | MessageSetUserSelectedTermDomains
  | MessageUpdateGlossary
  | MessageSetUserDefaultSelection
  | MessageSetAppDomain

const message = {
  ...statsModel.message,

  setAppDomain(
    domain: string
  ) {
    return {
      type: MessageType.SET_APPDOMAIN,
      domain
    }
  },

  setDebug(
    value: boolean
  ) {
    return {
      type: message.setDebug,
      value
    }
  },

  setUserSelectedTermDomains(
    domains: string[]
  ) {
    return {
      type: MessageType.SET_USER_SELECTED_TERM_DOMAINS,
      domains
    }
  },

  addSearchDidYouMean(
    searchTerm: SearchTerm,
    data: Record<GlossaryCompoundIdString, string[]>
  ) {
    return {
      type: MessageType.ADD_SEARCH_DID_YOU_MEAN,
      searchTerm,
      data
    }
  },

  mandatorySourcesOn(sources: SourceCompoundIdString[]) {
    return {
      type: MessageType.MANDATORY_SOURCES_ON,
      sources
    }
  },

  siteSettingState(state: boolean) {
    return {
      type: MessageType.SITE_SETTING_STATE,
      state
    }
  },

  vueSettings(settings: VueSetting): Message {
    return {
      type: MessageType.VUE_SETTINGS,
      settings
    }
  },

  setSourceRank(sources: string[]): Message {
    return {
      type: MessageType.SET_SOURCE_RANK,
      sources
    }
  },

  addUniqueToken(token: string): Message {
    return {
      type: MessageType.ADD_UNIQUE_TOKEN,
      token
    }
  },

  setBackendLoggedIn(
    backendId: BackendId,
    loggedIn: RemoteData<boolean>
  ): Message {
    return {
      type: MessageType.BACKEND_LOGGED_IN,
      backendId,
      loggedIn
    }
  },
  searchTerm(term: SearchTerm): Message {
    return {
      type: MessageType.SEARCH_TERM,
      term
    }
  },
  addBackend(backend: Backend): Message {
    return {
      type: MessageType.ADD_BACKEND,
      backend
    }
  },
  setApikeySetting(
    id: BackendId,
    setting: RemoteData<Record<Apikey, ApikeySetting>>
  ): Message {
    return {
      type: MessageType.SET_APIKEYSETTING,
      id,
      setting
    }
  },
  addGlossaryLexemeList(
    id: GlossaryCompoundId,
    list: RemoteData<LexemeCompoundIdString[]>
  ): Message {
    return {
      type: MessageType.ADD_GLOSSARY_LEXEME_LIST,
      id,
      list
    }
  },
  addSourceListForBackend(
    id: BackendId,
    list: RemoteData<SourceCompoundIdString[]>
  ): Message {
    return {
      type: MessageType.ADD_SOURCE_LIST_FOR_BACKEND,
      id,
      list
    }
  },
  requestSearch(id: GlossaryCompoundId, term: SearchTerm): Message {
    return {
      type: MessageType.REQUEST_SEARCH,
      id,
      term
    }
  },
  startSearch(id: GlossaryCompoundId, term: SearchTerm): Message {
    return {
      type: MessageType.START_SEARCH,
      id,
      term
    }
  },
  addEmptySearchResult(id: GlossaryCompoundId, term: SearchTerm): Message {
    return {
      type: MessageType.ADD_EMPTY_SEARCH_RESULT,
      id,
      term
    }
  },
  addSearchResultError(
    id: GlossaryCompoundId,
    term: SearchTerm,
    error: SearchError
  ): Message {
    return {
      type: MessageType.ADD_SEARCH_RESULT_ERROR,
      term,
      id,
      error
    }
  },
  addSearchResult(
    term: SearchTerm,
    id: GlossaryCompoundId,
    lexemeCompoundId: LexemeCompoundId
  ): Message {
    return {
      type: MessageType.ADD_SEARCH_RESULT,
      term,
      id,
      lexemeCompoundId
    }
  },
  addLexeme(id: LexemeCompoundId, lexeme: Lexeme): MessageAddLexeme {
    return {
      type: MessageType.ADD_LEXEME,
      id,
      lexeme
    }
  },
  addDefinition(
    definitionCompoundId: DefinitionCompoundId,
    definition: Definition
  ): MessageAddDefinition {
    return {
      type: MessageType.ADD_DEFINITION,
      definitionCompoundId,
      definition
    }
  },
  addMultipleLexemes(list: MessageAddLexeme[]): Message {
    return {
      type: MessageType.ADD_MULTIPLE_LEXEMES,
      list
    }
  },
  addMultipleDefinitiona(
    list: MessageAddDefinition[]
  ): Message {
    return {
      type: MessageType.ADD_MULTIPLE_DEFINITIONS,
      list
    }
  },
  updateDefinition(
    definitionCompoundId: DefinitionCompoundId,
    definition: Definition
  ): MessageUpdateDefinition {
    return {
      type: MessageType.UPDATE_DEFINITION,
      definitionCompoundId,
      definition
    }
  },
  addLexemeDefinitions(
    lexemeId: LexemeCompoundId,
    definitionIds: DefinitionCompoundId[]
  ): MessageAddLexemeDefinitions {
    return {
      type: MessageType.ADD_LEXEME_DEFINITIONS,
      lexemeId,
      definitionIds
    }
  },
  addMultipleLexemeDefinitions(
    list: MessageAddLexemeDefinitions[]
  ): Message {
    return {
      type: MessageType.ADD_MULTIPLE_LEXEME_DEFINITIONS,
      list
    }
  },
  addWordlistRegexes(
    id: GlossaryCompoundId,
    regexes: RemoteData<string[]>
  ): Message {
    return {
      type: MessageType.ADD_REGEXES,
      id,
      regexes
    }
  },
  addMultipleWordlistRegexes(regexes: RegexCollection): Message {
    return {
      type: MessageType.ADD_MULTIPLE_REGEXES,
      regexes
    }
  },
  addWordlist(id: GlossaryCompoundId, wordlist: RemoteData<Wordlist>): Message {
    return {
      type: MessageType.ADD_WORDLIST,
      id,
      wordlist
    }
  },
  addMultipleWordlist(wordlists: WordlistCollection): Message {
    return {
      type: MessageType.ADD_MULTIPLE_WORDLISTS,
      wordlists
    }
  },
  addSource(
    id: SourceCompoundId,
    source: RemoteData<Source>
  ): MessageAddSource {
    return {
      type: MessageType.ADD_SOURCE,
      id,
      source
    }
  },
  addSources(list: MessageAddSource[]): MessageAddSources {
    return {
      type: MessageType.ADD_SOURCES,
      list
    }
  },
  updateGlossary(
    id: GlossaryCompoundId,
    glossary: Glossary
  ) {
    return {
      type: MessageType.UPDATE_GLOSSARY,
      id,
      glossary
    }
  },
  addGlossary(id: GlossaryCompoundId, glossary: Glossary): Message {
    return {
      type: MessageType.ADD_GLOSSARY,
      id,
      glossary
    }
  },
  addGlossaries(glossaries: GlossaryCollection): Message {
    return {
      type: MessageType.ADD_GLOSSARIES,
      glossaries
    }
  },
  addApiKey(id: BackendId, apiKey: ApiKey): Message {
    return {
      type: MessageType.ADD_APIKEY,
      id,
      apiKey
    }
  },
  selectConfigSource(id: SourceCompoundIdString[]): Message {
    return {
      type: MessageType.SELECT_CONFIG_SOURCE,
      id
    }
  },
  userSelectSource(id: SourceCompoundId): Message {
    return {
      type: MessageType.USER_SELECT_SOURCE,
      id
    }
  },
  setUserSelectSource(ids: SourceCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_SELECT_SOURCE,
      ids
    }
  },
  deselectSource(id: SourceCompoundId[]): MessageDeselectSource {
    return {
      type: MessageType.DESELECT_SOURCE,
      id
    }
  },
  userDeselectSource(id: SourceCompoundId): Message {
    return {
      type: MessageType.USER_DESELECT_SOURCE,
      id
    }
  },
  setUserDeselectSource(ids: SourceCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_DESELECT_SOURCE,
      ids
    }
  },
  setFromLanguages(languageCode: LanguageCode[]): Message {
    return {
      type: MessageType.SET_FROM_LANGUAGES,
      languageCode
    }
  },
  selectFromLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.SELECT_FROM_LANGUAGE,
      languageCode
    }
  },
  deselectFromLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.DESELECT_FROM_LANGUAGE,
      languageCode
    }
  },
  selectToLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.SELECT_TO_LANGUAGE,
      languageCode
    }
  },
  setToLanguages(languageCode: LanguageCode[]): Message {
    return {
      type: MessageType.SET_TO_LANGUAGES,
      languageCode
    }
  },
  deselectToLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.DESELECT_TO_LANGUAGE,
      languageCode
    }
  },
  setUserFromLanguages(languageCode: LanguageCode[]): Message {
    return {
      type: MessageType.SET_USER_FROM_LANGUAGES,
      languageCode
    }
  },
  selectUserFromLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.SELECT_USER_FROM_LANGUAGE,
      languageCode
    }
  },
  deselectUserFromLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.DESELECT_USER_FROM_LANGUAGE,
      languageCode
    }
  },
  selectUserToLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.SELECT_USER_TO_LANGUAGE,
      languageCode
    }
  },
  setUserToLanguages(languageCode: LanguageCode[]): Message {
    return {
      type: MessageType.SET_USER_TO_LANGUAGES,
      languageCode
    }
  },
  deselectUserToLanguage(languageCode: LanguageCode): Message {
    return {
      type: MessageType.DESELECT_USER_TO_LANGUAGE,
      languageCode
    }
  },
  replaceModel(model: Model): Message {
    return {
      type: MessageType.REPLACE_MODEL,
      model
    }
  },
  replaceModelField<T extends keyof Model>(
    field: T,
    data: Model[T]
  ): MessageReplaceModelField {
    return {
      type: MessageType.REPLACE_MODEL_FIELD,
      field,
      data
    }
  },
  patchModelObject<T extends ObjectModelKeys>(
    field: T,
    data: ObjectModelWithDeleteKey[T]
  ): MessagePatchModelObject {
    return {
      type: MessageType.PATCH_MODEL_OBJECT,
      field,
      data
    }
  },
  setLocationDomain(locationDomain: LocationDomain): Message {
    return {
      type: MessageType.SET_LOCATION_DOMAIN,
      locationDomain
    }
  },
  selectUserSelectedSourceLanguage(key: LanguagePairCompoundIdString): Message {
    return {
      type: MessageType.SELECT_USER_SELECTED_SOURCE_LANGUAGE,
      key
    }
  },
  setUserSelectedSourceLanguages(key: LanguagePairCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_SELECTED_SOURCE_LANGUAGES,
      key
    }
  },
  deselectUserSelectedSourceLanguage(
    key: LanguagePairCompoundIdString
  ): Message {
    return {
      type: MessageType.DESELECT_USER_SELECTED_SOURCE_LANGUAGE,
      key
    }
  },
  addUserSelectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.ADD_USER_SELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  setUserSelectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_SELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  removeUserSelectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.REMOVE_USER_SELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  addUserDeselectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.ADD_USER_DESELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  setUserDeselectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_DESELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  removeUserDeselectedSourceGlossary(key: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.REMOVE_USER_DESELECTED_SOURCE_GLOSSARY,
      key
    }
  },
  addSuportedLanguages(languages: LanguageDict): Message {
    return {
      type: MessageType.ADD_SUPPORTED_LANGUAGE,
      languages
    }
  },
  setBackendDefaultOn(backends: BackendId[]): Message {
    return {
      type: MessageType.SET_BACKEND_DEFAULT_ON,
      backends
    }
  },
  setUserGlossaryOrderById(ids: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.SET_USER_GLOSSARY_ORDER_BY_ID,
      ids
    }
  },
  setInitialGlossaryOrderById(ids: GlossaryCompoundIdString[]): Message {
    return {
      type: MessageType.SET_INITIAL_GLOSSARY_ORDER_BY_ID,
      ids
    }
  },
  setSiteConfig(config: SiteConfiguration): Message {
    return {
      type: MessageType.SITE_SETTINGS,
      config
    }
  },
  setExcludeMarkups(list: ExcludeMarkupList): Message {
    return {
      type: MessageType.SET_EXCLUDE_MARKUP,
      list
    }
  },
  addExcludeMarkups(list: ExcludeMarkupList): Message {
    return {
      type: MessageType.ADD_EXCLUDE_MARKUP,
      list
    }
  },
  addTermDomain(
    backendId: BackendId,
    domains: RemoteData<Record<string, TermDomain>>): Message {
    return {
      type: MessageType.ADD_TERM_DOMAIN,
      backendId,
      domains
    }
  },
  setUserDefaultSelection(selection: UserDefaultSetting): Message {
    return {
      type: MessageType.SET_USER_DEFAULT_SELECTION,
      selection
    }
  }
}

export function generateLexemeId(
  backend: Backend | BackendId,
  sourceId: SourceId,
  lexemeId: LexemeId
): LexemeCompoundId {
  return {
    lexemeId,
    ...generateSourceId(backend, sourceId)
  }
}

export function generateSourceLanguageId(
  backend: Backend | BackendId,
  sourceId: SourceId,
  languageSelection: LanguageSelection
): SourceLanguageCompoundId {
  const sourceCompId = generateSourceId(backend, sourceId)
  return { languageSelection, ...sourceCompId }
}

export function generateDefinitionId(
  backend: Backend | BackendId,
  sourceId: SourceId,
  definitionId: DefinitionId
): DefinitionCompoundId {
  return { definitionId, ...generateSourceId(backend, sourceId) }
}

export function generateLanguagePairCompundId(
  sourceCompoundId: SourceCompoundId,
  fromLanguageId: LanguageCode,
  toLanguageId: LanguageCode
): LanguagePairCompoundId {
  return {
    fromLanguageId,
    toLanguageId,
    ...sourceCompoundId
  }
}

export function generateGlossaryId(
  sourceCompoundId: SourceCompoundId,
  glossaryId: GlossaryId
): GlossaryCompoundId {
  return {
    glossaryId,
    ...sourceCompoundId
  }
}

export function generateSourceId(
  backend: Backend | BackendId,
  source: SourceId | Source
): SourceCompoundId {
  let sourceId: SourceId
  let backendId: BackendId
  // XXX: Below: an assumption that SourceId === string, which is not neccessarily true.
  if (typeof source === 'string') sourceId = source
  else sourceId = source.id.toString()
  if (typeof backend === 'string') backendId = backend
  else backendId = backend.id.toString()
  return { backendId, sourceId }
}

const backendIdRegex = new RegExp('^([^/]+)')
export function toBackendId(str: string): BackendCompoundId {
  const result = backendIdRegex.exec(str)
  if (!result) throw new Error('invalid backend ID: ' + str)
  const [, backendId] = result
  if (!backendId) throw new Error('invalid backend ID: ' + str)
  return { backendId }
}

const sourceIdRegex = new RegExp('^([^/]+)/([^/]+)$')
export function toSourceId(
  input:
    | string
    | DefinitionCompoundId
    | LexemeCompoundId
    | GlossaryCompoundId
    | LanguagePairCompoundId
): SourceCompoundId {
  if (typeof input === 'string') {
    const result = sourceIdRegex.exec(input)
    if (!result) throw new Error('invalid source ID: ' + input)
    const [, backendId, sourceId] = result
    if (!backendId || !sourceId) throw new Error('invalid source ID: ' + input)
    const id = { backendId, sourceId }
    return id
  } else {
    const { sourceId, backendId } = input
    return { sourceId, backendId }
  }
}

export function toApikeySettingCompoundId(
  input: string
): ApikeySettingCompoundId {
  if (typeof input === 'string') {
    const result = sourceIdRegex.exec(input)
    if (!result) throw new Error('invalid apikey-ID: ' + input)
    const [, backendId, apikey] = result
    if (!backendId || !apikey) throw new Error('invalid apikey-ID: ' + input)
    const id = { backendId, apikey }
    return id
  } else {
    const { apikey, backendId } = input
    return { apikey, backendId }
  }
}

const languagePairIdRegex = new RegExp('^([^/]+)/([^/]+)/([^/]+)/([^/]+)$')
export function toLanguagePairId(str: string): LanguagePairCompoundId {
  const result = languagePairIdRegex.exec(str)
  if (!result) throw new Error('invalid language pair ID: ' + str)
  const [, backendId, sourceId, fromLanguageId, toLanguageId] = result
  if (!backendId || !sourceId || !fromLanguageId || !toLanguageId)
    throw new Error('invalid language pair ID: ' + str)
  return {
    backendId,
    sourceId,
    fromLanguageId,
    toLanguageId
  }
}

const glossaryIdRegex = new RegExp('^([^/]+)/([^/]+)/([^/]+)$')
export function toGlossaryId(str: string): GlossaryCompoundId {
  const result = glossaryIdRegex.exec(str)
  if (!result) throw new Error('invalid glossary ID: ' + str)
  const [, backendId, sourceId, glossaryId] = result
  if (!backendId || !sourceId || !glossaryId)
    throw new Error('invalid glossary ID: ' + str)
  return {
    backendId,
    sourceId,
    glossaryId
  }
}

const SourceLanguageIdRegex = new RegExp('^([^/]+)/([^/]+)/([^/]+)/([^/]+)$')
export function getSourceLanguageStringData(
  str: SourceLanguageCompoundIdString
): SourceLanguageCompoundId {
  if (typeof str === 'string') {
    const result = SourceLanguageIdRegex.exec(str)
    if (!result) throw new Error('invalid source ID: ' + str)
    const [, backendId, sourceId, fromLangauge, toLanguage] = result
    const languageSelection: LanguageSelection = {}
    languageSelection[fromLangauge] = [toLanguage]
    return { backendId, sourceId, languageSelection }
  } else {
    throw new Error('invalid source ID: ' + str)
  }
}

export function toIdString(
  idObject:
    | DefinitionCompoundId
    | LexemeCompoundId
    | SourceCompoundId
    | GlossaryCompoundId
    | BackendCompoundId
    | BackendId
    | LanguageCode
    | ApikeySettingCompoundId
): string {
  let str = ''
  if (typeof idObject === 'string') {
    str += idObject
    return str
  }

  str += idObject.backendId
  if ('sourceId' in idObject) {
    str += '/' + idObject.sourceId

    if ('definitionId' in idObject) str += '/' + idObject.definitionId
    else if ('lexemeId' in idObject) str += '/' + idObject.lexemeId
    else if ('glossaryId' in idObject) str += '/' + idObject.glossaryId
  } else if ('apikey' in idObject) {
    str += '/' + idObject.apikey
  }

  return str
}

export function generateSourceLanguageCompundIdString(
  idString: SourceCompoundIdString,
  fromLanguage: LanguageCode,
  toLangauge: LanguageCode
): SourceLanguageCompoundIdString {
  return idString + '/' + fromLanguage + '/' + toLangauge
}

export function listSourceLanguageCompoundIdString(
  sourceLanguageCompoundId: SourceLanguageCompoundId
): SourceLanguageCompoundIdString[] {
  const sourceLangCompStringList: SourceLanguageCompoundIdString[] = []
  Object.entries(sourceLanguageCompoundId.languageSelection).forEach(
    ([fromLanguag, toLanguages]) => {
      toLanguages.forEach(toLanguage => {
        const sourceLangCompIdString =
          toIdString(sourceLanguageCompoundId) +
          '/' +
          fromLanguag +
          '/' +
          toLanguage
        sourceLangCompStringList.push(sourceLangCompIdString)
      })
    }
  )
  return sourceLangCompStringList
}

export function getBackendId({ backendId }: SourceCompoundId): BackendId {
  return backendId
}

function handleSetAppDomain(
  message: MessageSetAppDomain
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    appDomain: message.domain
  }
  return patch
}

function handleSetDebug(
  message: MessageSetDebug
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    debug: message.value
  }
  return patch
}

function handleSetSiteConfig(
  message: MessageSetSiteConfig
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    fullSiteConfig: message.config
  }
  return patch
}

function handleMandatorySourcesOn(
  message: MessageMandatorySourcesOn
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    mandatorySourcesOn: message.sources
  }
  return patch
}

function handleSiteSettingState(
  message: MessageSiteSettingState
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    siteSettingsReady: message.state
  }
  return patch
}

function handleVueSettings(
  message: MessageVueSettings
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    vueSettings: O((s: VueSetting) => {
      return { ...s, ...message.settings }
    })
  }
  return patch
}

function handleSetSourceRank(
  message: MessageSetSourceRank
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    sourceRank: message.sources
  }
  return patch
}

function handleSetBackendDefaultOn(
  message: MessageSetBackendDefaultOn
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    backendDefaultOn: message.backends
  }
  return patch
}

function handleAddSearchResultError(
  message: MessageAddSearchResultError
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchResults: O({
      [message.term]: O({
        [toIdString(message.id)]: O(
          (x: RemoteData<LexemeCompoundIdString[]>) => {
            return mergeRemoteData(
              x,
              remoteData.error(new Error(message.error.error))
            )
          }
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ) as any // typechecking hack
      })
    })
  }
  return patch
}

function handleAddUniqueToken(
  message: MessageAddUniqueToken
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    uniqueToken: message.token
  }
  return patch
}

function handleAddEmptySearchResult(
  message: MessageAddEmptySearchResult
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchResults: O({
      [message.term]: O({
        [toIdString(message.id)]: O(
          (x: RemoteData<LexemeCompoundIdString[]>) => {
            return mergeRemoteData(x, remoteData.success([]))
          }
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ) as any // typechecking hack
      })
    })
  }
  return patch
}

function handleAddSearchResult(
  msg: MessageAddSearchResult
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchResults: O({
      [msg.term]: O({
        [toIdString(msg.id)]: O((x: RemoteData<LexemeCompoundIdString[]>) => {
          return mergeRemoteData(
            x,
            remoteData.success([toIdString(msg.lexemeCompoundId)])
          )
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        }) as any // typechecking hack
      })
    })
  }
  return patch
}

function handleBackendLoggedIn(
  msg: MessageBackendLoggedIn
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    backends: O({
      [msg.backendId]: O({
        config: O({
          authenticated: msg.loggedIn
        })
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any
    })
  }
  return patch
}

function handleAddBackendMessage(
  msg: MessageAddBackend
): Partial<PatchRequest<Model>> {
  if (
    !(
      msg.backend.id in get.backends() &&
      get.backends()[msg.backend.id].id === msg.backend.id
    )
  ) {
    update(
      message.addSourceListForBackend(msg.backend.id, remoteData.notAsked())
    )
    update(message.setApikeySetting(msg.backend.id, remoteData.notAsked()))
    const patch: Partial<PatchRequest<Model>> = {
      backends: O({
        [msg.backend.id]: msg.backend
      })
    }
    return patch
  } else {
    return {}
  }
}

function handleSetApikeySettings(
  message: MessageSetApikeySetting
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    backendApikeySettings: O({
      [message.id]: O((l: RemoteData<Record<Apikey, ApikeySetting>>) => {
        return mergeRemoteObjectData(l, message.setting)
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any // typechecking hack
    })
  }
  return patch
}

function handleAddGlossaryLexemeList(
  message: MessageAddGlossaryLexemeList
): Partial<PatchRequest<Model>> {
  const glossaryId = toIdString(message.id)
  const patch: Partial<PatchRequest<Model>> = {
    glossaryLexemes: O({
      [glossaryId]: O((l: RemoteData<LexemeCompoundIdString[]>) => {
        return mergeRemoteData(l, message.list)
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any // typechecking hack
    })
  }
  return patch
}

function handleAddSourceListForBackend(
  message: MessageAddSourceListForBackend
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    backendSources: O({
      [message.id]: O((l: RemoteData<SourceCompoundIdString[]>) => {
        return mergeRemoteData(l, message.list)
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any // typechecking hack
    })
  }
  return patch
}

function handleSearchTermMessage(
  msg: MessageSearchTerm
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchTerm: msg.term
  }
  return patch
}

function handleAddTermDomainMessage(
  message: MessageAddTermDomain
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    termDomains: O({
      [message.backendId]: message.domains
    })
  }
  return patch
}

export function toSourceLanguageCompoundId(
  sourceCompoundId: SourceCompoundId,
  languageSelection: LanguageSelection
): SourceLanguageCompoundId {
  return {
    backendId: sourceCompoundId.backendId,
    sourceId: sourceCompoundId.sourceId,
    languageSelection
  }
}

function handleRequestSearchMessage(
  message: MessageRequestSearch
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchResults: O({
      [message.term]: O({
        [toIdString(message.id)]: O(
          (s: RemoteData<LexemeCompoundIdString[]>) => {
            return mergeRemoteData(s, null)
          }
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ) as any
      })
    })
  }
  return patch
}

function handleStartSearchMessage(
  message: MessageStartSearch
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchResults: O({
      [message.term]: O({
        [toIdString(message.id)]: remoteData.loading()
      })
    })
  }
  return patch
}

function handleAddSourceMessage(
  msg: MessageAddSource
): Partial<PatchRequest<Model>> {
  const sourceId = toIdString(msg.id)
  const patch: Partial<PatchRequest<Model>> = {
    sources: O(addSourceHelper(sourceId, msg.source))
  }
  return patch
}

function handleAddSourcesMessage(
  msg: MessageAddSources
): Partial<PatchRequest<Model>> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const patch = {} as any
  for (const { id, source } of msg.list) {
    const sourceId = toIdString(id)
    Object.assign(patch, addSourceHelper(sourceId, source))
  }
  return { sources: O(patch) } as Partial<PatchRequest<Model>>
}

function addSourceHelper(
  sourceId: SourceCompoundIdString,
  source: RemoteData<Source>
): Record<SourceCompoundIdString, RemoteData<Source>> {
  return {
    [sourceId]: O((s: RemoteData<Source>) => {
      if (s && isNotAsked(source)) {
        // Don’t add new ‘NotAsked’ source if that source is already present.
        return s
      }
      return source
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    }) as any // typechecking hack
  }
}

function handleAddGlossaryMessage(
  msg: MessageAddGlossary
): Partial<PatchRequest<Model>> {
  const glossaryId = toIdString(msg.id)
  const patch: Partial<PatchRequest<Model>> = {
    glossaries: O({
      [glossaryId]: O((s: Glossary) => {
        return msg.glossary
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any // typechecking hack
    })
  }
  update(message.addWordlist(msg.id, remoteData.notAsked()))
  return patch
}

function handleUpdateGlossaryMessage(
  msg: MessageUpdateGlossary
): Partial<PatchRequest<Model>> {
  const glossaryId = toIdString(msg.id)
  const sourceCompid = {
    backendId: msg.id.backendId,
    sourceId: msg.id.sourceId
  }
  const sourceId = toIdString(sourceCompid)
  const patch: Partial<PatchRequest<Model>> = {
    glossaries: O({
      [glossaryId]: O((g: Glossary) => {
        return {...g, ...msg.glossary}
      })
    }),
    sources: O({
      [sourceId]: O((s: Source) => {
        const item = s.glossaries.find(x => x.id === msg.id.glossaryId)
        const list = s.glossaries.filter(x => x.id !== msg.id.glossaryId)
        list.push({...item, ...msg.glossary})
        s.glossaries = list
        return s
      })
    })
  }
  return patch
}

function handleAddGlossariesMessage(
  msg: MessageAddGlossaries
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    glossaries: O({
      ...msg.glossaries
    })
  }

  const wordlists: WordlistCollection = {}
  Object.keys(msg.glossaries).forEach(x => {
    wordlists[x] = remoteData.notAsked()
  })

  update(message.addMultipleWordlist(wordlists))
  return patch
}

function requestWordlist(sourceId: SourceCompoundId, source: Source): void {
  /* eslint-disable-next-line */
  function *ids () {
    for (const glossary of source.glossaries) {
      yield generateGlossaryId(sourceId, glossary.id)
    }
  }

  for (const id of ids()) {
    if (!source.markupWords) continue
    update(message.addWordlist(id, remoteData.notAsked()))
    update(message.addWordlistRegexes(id, remoteData.notAsked()))
  }
}

function handleAddWordlistMessage(
  message: MessageAddWordlist
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    wordlists: O({
      [toIdString(message.id)]: message.wordlist
    })
  }
  return patch
}

function handleAddMultipleWordlistMessage(
  message: MessageAddMultipleWordlist
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    wordlists: O({
      ...message.wordlists
    })
  }
  return patch
}

function handleAddWordlistRegexesMessage(
  message: MessageAddWordlistRegexes
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    wordlistRegexes: O({
      [toIdString(message.id)]: message.regexes
    })
  }
  return patch
}

function handleAddMultipleWordlistRegexesMessage(
  message: MessageAddMultipleWordlistRegexes
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    wordlistRegexes: O({
      ...message.regexes
    })
  }
  return patch
}

function handleAddApikeyMessage(
  msg: MessageAddApiKey
): Partial<PatchRequest<Model>> {
  update(message.setApikeySetting(msg.id, remoteData.notAsked()))
  const patch: Partial<PatchRequest<Model>> = {
    backends: O({
      [msg.id]: O({
        config: O({
          apiKeys: O((x: ApiKey[]) => {
            x = [...x, msg.apiKey]
            return x
          })
        })
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      }) as any // typechecking hack
    })
  }
  return patch
}

function handleSelectConfigSourceMessage(
  message: MessageSelectConfigSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedConfigSources: O((s: SourceCompoundIdString[]) => {
      return [
        ...new Set([...s, ...message.id])
      ]
    })
  }
  return patch
}

function handleUserSelectSourceMessage(
  message: MessageUserSelectSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSources: O((s: SourceCompoundIdString[]) => {
      return s.filter(x => x !== toIdString(message.id))
    }),
    userSelectedSources: O((s: SourceCompoundIdString[]) => [
      ...new Set([...s, toIdString(message.id)])
    ])
  }
  return patch
}

function handleSetUserSelectSourceMessage(
  message: MessageSetUserSelectSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSources: O(() => [...new Set(message.ids)])
  }
  return patch
}

function handleDeselectSourceMessage(
  message: MessageDeselectSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    deselectedSources: O((s: SourceCompoundIdString[]) => [
      ...new Set([...s, ...message.id.map(toIdString)])
    ])
  }
  return patch
}

function handleUserDeselectSourceMessage(
  message: MessageUserDeselectSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSources: O((s: SourceCompoundIdString[]) => [
      ...new Set([...s, toIdString(message.id)])
    ]),
    userSelectedSources: O((s: SourceCompoundIdString[]) => {
      return s.filter(x => x !== toIdString(message.id))
    })
  }
  return patch
}

function handleSetUserDeselectSourceMessage(
  message: MessageSetUserDeselectSource
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSources: O((s: SourceCompoundIdString[]) => [
      ...new Set(message.ids)
    ])
  }
  return patch
}

function handleSelectFromLanguageMessage(
  message: MessageSelectFromLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedFromLanguages: O((s: LanguageCode[]) => [
      ...new Set([...s, ...filterLanguages([message.languageCode])])
    ])
  }
  return patch
}

function handleSetFromLanguagesMessage(
  message: MessageSetFromLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedFromLanguages: O(() => filterLanguages(message.languageCode))
  }
  return patch
}

function handleDeselectFromLanguageMessage(
  message: MessageDeselectFromLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedFromLanguages: O((s: LanguageCode[]) => {
      return s.filter(x => x !== message.languageCode)
    })
  }
  return patch
}

function handleSelectUserFromLanguageMessage(
  message: MessageSelectFromLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedFromLanguages: O((s: LanguageCode[]) => [
      ...new Set([...s, ...filterLanguages([message.languageCode])])
    ])
  }
  return patch
}

function handleSetUserFromLanguagesMessage(
  message: MessageSetFromLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedFromLanguages: O(() => filterLanguages(message.languageCode))
  }
  return patch
}

function handleDeselectUserFromLanguageMessage(
  message: MessageDeselectFromLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedFromLanguages: O((s: LanguageCode[]) => {
      return s.filter(x => x !== message.languageCode)
    })
  }
  return patch
}

function handleSelectToLanguageMessage(
  message: MessageSelectToLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedToLanguages: O((s: LanguageCode[]) => [
      ...new Set([...s, ...filterLanguages([message.languageCode])])
    ])
  }
  return patch
}

function handleSetToLanguagesMessage(
  message: MessageSetToLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedToLanguages: O(() => filterLanguages(message.languageCode))
  }
  return patch
}

function handleDeselectToLanguageMessage(
  message: MessageDeselectToLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    selectedToLanguages: O((s: LanguageCode[]) => {
      return s.filter(x => x !== message.languageCode)
    })
  }
  return patch
}

function handleSelectUserToLanguageMessage(
  message: MessageSelectToLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedToLanguages: O((s: LanguageCode[]) => [
      ...new Set([...s, ...filterLanguages([message.languageCode])])
    ])
  }
  return patch
}

function handleSetUserToLanguagesMessage(
  message: MessageSetToLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedToLanguages: O(() => filterLanguages(message.languageCode))
  }
  return patch
}

function handleDeselectUserToLanguageMessage(
  message: MessageDeselectToLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedToLanguages: O((s: LanguageCode[]) => {
      return s.filter(x => x !== message.languageCode)
    })
  }
  return patch
}

function handleReplaceModel(
  message: MessageReplaceModel
): Partial<PatchRequest<Model>> {
  const patch: PatchRequest<Model> = message.model
  return patch
}

function handleReplaceModelField(
  message: MessageReplaceModelField
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    [message.field]: message.data
  }
  return patch
}

// Helper types for patching specific Model fields.
export type PatchStatistics = ObjectModelWithDeleteKey['statistics']

function handlePatchModelObject(
  message: MessagePatchModelObject
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [message.field]: O(message.data as any)
  }
  return patch
}

function handleSetLocationDomainMessage(
  message: MessageSetLocationDomain
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    locationDomain: message.locationDomain
  }
  return patch
}

function handleAddMultipleLexemes(
  message: MessageAddMultipleLexemes
): Partial<PatchRequest<Model>> {

  const patch = {} as any
  for (const { id, lexeme } of message.list) {
    const lexemeId = toIdString(id)
    patch[lexemeId] = lexeme
  }
  return { lexemes: O(patch) } as Partial<PatchRequest<Model>>
  /*
  const patch: Partial<PatchRequest<Model>> = {
    lexemes: O({
      [toIdString(message.id)]: message.lexeme
    })
  }
  return patch
  */
}

function handleAddMultipleDefinitions(
  message: MessageAddMultipleDefinitions
): Partial<PatchRequest<Model>> {

  const patch = {} as any
  for (const { definitionCompoundId, definition } of message.list) {
    const defId = toIdString(definitionCompoundId)
    patch[defId] = definition
  }
  return { definitions: O(patch) } as Partial<PatchRequest<Model>>
  /*
  const patch: Partial<PatchRequest<Model>> = {
    lexemes: O({
      [toIdString(message.id)]: message.lexeme
    })
  }
  return patch
  */
}

function handleAddLexeme(
  message: MessageAddLexeme
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    lexemes: O({
      [toIdString(message.id)]: message.lexeme
    })
  }
  return patch
}

function handleSetUserGlossaryOrderByIdMessage(
  message: MessageSetUserGlossaryOrderById
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userGlossaryOrderById: O((s: GlossaryCompoundIdString[]) => [
      ...new Set(message.ids)
    ])
  }
  return patch
}

function handleSetInitialGlossaryOrderByIdMessage(
  message: MessageSetInitialGlossaryOrderById
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    initialGlossaryOrder: O((s: GlossaryCompoundIdString[]) => [
      ...new Set(message.ids)
    ])
  }
  return patch
}

function handleSelectUserSelectedSourcesLanguageMessage(
  message: MessageSelectuserSelectedSourceLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceLanguage: O((s: LanguagePairCompoundIdString[]) => [
      ...new Set([...s, message.key])
    ])
  }
  return patch
}

function handleSetUserSelectedSourcesLanguagesMessage(
  message: MessageSetuserSelectedSourceLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceLanguage: O(() => [...new Set(message.key)])
  }
  return patch
}

function handleDeselectUserSelectedSourcesLanguageMessage(
  message: MessageDeselectuserSelectedSourceLanguage
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceLanguage: O((s: LanguageCode[]) => {
      return s.filter(x => x !== message.key)
    })
  }
  return patch
}

function handleAddUserSelectedSourcesGlossaryMessage(
  message: MessageAddUserSelectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceGlossary: O((s: GlossaryCompoundIdString[]) => [
      ...new Set([...s, ...message.key])
    ])
  }
  return patch
}

function handleSetUserSelectedSourcesGlossaryMessage(
  message: MessageSetUserSelectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceGlossary: O(() => [...new Set(message.key)])
  }
  return patch
}

function handleRemoveUserSelectedSourcesGlossaryMessage(
  message: MessageRemoveuserSelectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedSourceGlossary: O((s: GlossaryCompoundIdString[]) => {
      return s.filter(x => !message.key.includes(x))
    })
  }
  return patch
}

function handleAddUserDeselectedSourcesGlossaryMessage(
  message: MessageAddUserDeselectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSourceGlossary: O((s: GlossaryCompoundIdString[]) => [
      ...new Set([...s, ...message.key])
    ])
  }
  return patch
}

function handleSetUserDeselectedSourcesGlossaryMessage(
  message: MessageSetUserDeselectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSourceGlossary: O(() => [...new Set(message.key)])
  }
  return patch
}

function handleRemoveUserDeselectedSourcesGlossaryMessage(
  message: MessageRemoveUserDeselectedSourceGlossary
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDeselectedSourceGlossary: O((s: GlossaryCompoundIdString[]) => {
      return s.filter(x => !message.key.includes(x))
    })
  }
  return patch
}

function handleAddDefinition(
  message: MessageAddDefinition
): Partial<PatchRequest<Model>> {
  const definitionCompoundId = message.definitionCompoundId
  const patch: Partial<PatchRequest<Model>> = {
    definitions: O({
      [toIdString(definitionCompoundId)]: message.definition
    })
  }
  return patch
}

function handleUpdateDefinition(
  message: MessageUpdateDefinition
): Partial<PatchRequest<Model>> {
  const definitionCompoundId = message.definitionCompoundId
  const patch: Partial<PatchRequest<Model>> = {
    definitions: O({
      [toIdString(definitionCompoundId)]: O(definition => {
        return {...definition, ...message.definition}
      })
    })
  }
  return patch
}

function handleAddLexemeDefinitions(
  message: MessageAddLexemeDefinitions
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    lexemeDefinitions: O({
      [toIdString(message.lexemeId)]: O((ds: DefinitionCompoundIdString[]) => {
        return [
          ...new Set([...(ds || []), ...message.definitionIds.map(toIdString)])
        ]
      })
    })
  }
  return patch
}

function handleAddMultipleLexemeDefinitions(
  message: MessageAddMultipleLexemeDefinitions
): Partial<PatchRequest<Model>> {

  const patch = {} as any
  for (const { lexemeId, definitionIds } of message.list) {
    const lexemeIdString = toIdString(lexemeId)
    patch[lexemeIdString] = definitionIds.map(toIdString)
    // Object.assign(patch, lexemeIdString, definitionIds)
  }
  return { lexemeDefinitions: O(patch) } as Partial<PatchRequest<Model>>
  /*
  const patch: Partial<PatchRequest<Model>> = {
    lexemes: O({
      [toIdString(message.id)]: message.lexeme
    })
  }
  return patch
  */
}

function handleAddSupportedLanguages(
  message: MessageAddSupportedLanguages
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    supportedLanguages: O(message.languages)
  }
  return patch
}

function handleSearchDidYouMean(
  message: MessageAddSearchDidYouMean
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    searchDidYouMean: O({
      [message.searchTerm]: O({
        ...message.data
      })
    })
  }
  return patch
}

function handleSetExcludeMarkup(
  message: MessageSetExcludeMarkup
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    excludeMarkups: message.list
  }
  return patch
}

function handleSetUserSelectedTermDomainsMessage(
  message: MessageSetUserSelectedTermDomains
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userSelectedTermDomains: message.domains
  }
  return patch
}

function handleAddExcludeMarkup(
  message: MessageAddExcludeMarkup
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    excludeMarkups: O((x: ExcludeMarkupList) => x.concat(message.list))
  }
  return patch
}

function handleSetUserDefaultSelectionMessage(
  message: MessageSetUserDefaultSelection
): Partial<PatchRequest<Model>> {
  const patch: Partial<PatchRequest<Model>> = {
    userDefault: O((x: UserDefaultSetting) => {
      return { ...x, ...message.selection }
    })
  }
  return patch
}

function dropRepeats<T>(x: flyd.Stream<T>): flyd.Stream<T> {
  return flydDropRepeatsWith(equals, x)
}

// Type which turns the types of object properties into flyd Streams.
type StreamObject<T> = {
  [K in keyof T]: flyd.Stream<T[K]>
}

export interface ModelGetters extends StreamObject<Model> {
  readonly selectedSources: flyd.Stream<SourceGlossarySelection>
  readonly selectedGlossaryIDs: flyd.Stream<GlossaryCompoundIdString[]>
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const _cachedGetters: Record<string, flyd.Stream<any>> = {}

const getters = {}

Object.keys(model()).forEach(prop => {
  Object.defineProperty(getters, prop, {
    get: function() {
      if (!_cachedGetters[prop]) {
        _cachedGetters[prop] = model
          .map(m => m[prop as keyof Model])
          .pipe(dropRepeats)
      }
      return _cachedGetters[prop]
    }
  })
})

Object.defineProperty(getters, 'glossaryOrderById', {
  get: function(): flyd.Stream<GlossaryCompoundIdString[]> {
    if (!_cachedGetters.glossarySortedById) {
      _cachedGetters.glossarySortedById = flydLift(
        (
          userGlossaryOrder,
          sourceRank,
          glossaries,
          sources,
          mandatorySources
        ): GlossaryCompoundIdString[] => {
          const glossaryIds = Object.keys(glossaries).sort((id1, id2) => {
            const splitId1 = id1.split('/')
            const splitId2 = id2.split('/')
            const source1 = sources[splitId1[0] + '/' + splitId1[1]]
            const source2 = sources[splitId2[0] + '/' + splitId2[1]]
            const sourceId1 = splitId1[0] + '/' + splitId1[1]
            const sourceId2 = splitId2[0] + '/' + splitId2[1]
            let index1
            let index2
            let name1
            let name2
            if (userGlossaryOrder.length === 0) {
              if (source2.type === 'success') {
                index2 = sourceRank.indexOf(sourceId2)
                name2 = source2.data.name
              } else return -1
              if (source1.type === 'success') {
                index1 = sourceRank.indexOf(sourceId1)
                name1 = source1.data.name
              } else return 1
            } else {
              index1 = userGlossaryOrder.indexOf(id1)
              index2 = userGlossaryOrder.indexOf(id2)
              if (source2.type === 'success') {
                name2 = source2.data.name
              }
              if (source1.type === 'success') {
                name1 = source1.data.name
              }
            }
            let reutnrVal = 0
            if (index2 === -1 && index1 === -1 && name1 && name2)
              name1.localeCompare(name2)
            else if (index2 === -1) reutnrVal = -1
            else if (index1 === -1) reutnrVal = 1
            else if (index1 < index2) reutnrVal = -1
            else if (index2 < index1) reutnrVal = 1
            return reutnrVal
          })
          return glossaryIds
        },
        mandatoryUserGlossaryOrder,
        sourceOrder,
        get.glossaries,
        get.sources,
        get.mandatorySourcesOn
      ).pipe(dropRepeats)
    }
    return _cachedGetters.glossarySortedById
  }
})

Object.defineProperty(getters, 'selectedGlossaryIDs', {
  get: function(): flyd.Stream<GlossaryCompoundIdString[]> {
    if (!_cachedGetters.selectedGlossaryIDs) {
      _cachedGetters.selectedGlossaryIDs = flydLift(
        (
          selectedSourceDict: SourceGlossarySelection
        ): SourceLanguageCompoundIdString[] => {
          const sourceLangCompIdStrings = Object.entries(
            selectedSourceDict
          ).map(([sourceIdString, glossaries]) => {
            const returnList: string[] = []
            glossaries.forEach(glossary => {
              returnList.push(sourceIdString + '/' + glossary.id)
            })
            return returnList
          })
          return [...new Set(sourceLangCompIdStrings.flat())]
        },
        get.selectedSources
      ).pipe(dropRepeats)
    }
    return _cachedGetters.selectedGlossaryIDs
  }
})

Object.defineProperty(getters, 'selectedSources', {
  get: function(): flyd.Stream<SourceGlossarySelection> {
    if (!_cachedGetters.selectedSources) {
      _cachedGetters.selectedSources = flydLift(
        (
          deselectedSources: SourceCompoundIdString[],
          glossaries: GlossaryCollection,
          fromLangauges: LanguageCode[],
          toLangauges: LanguageCode[],
          selectedSourceGlossaries: GlossaryCompoundIdString[],
          deselectedSourceGlossaries: GlossaryCompoundIdString[],
          mandatorySourcesOn: SourceCompoundIdString[]
        ) => {
          return filterSourceObjects(
            fromLangauges,
            toLangauges,
            deselectedSources,
            selectedSourceGlossaries,
            glossaries,
            deselectedSourceGlossaries,
            mandatorySourcesOn
          )
        },
        computedDeselectedSources,
        get.glossaries,
        get.selectedFromLanguages,
        get.selectedToLanguages,
        get.userSelectedSourceGlossary,
        get.userDeselectedSourceGlossary,
        get.mandatorySourcesOn
      ).pipe(dropRepeats)
    }
    return _cachedGetters.selectedSources
  }
})

const get: ModelGetters = getters as ModelGetters

const mandatoryUserGlossaryOrder = flydLift(
  (
    sources,
    userGlossaryOrderById,
    initialGlossaryOrder,
    mandatorySourcesOn
  ) => {
    let glossaryOrder = userGlossaryOrderById
    if (glossaryOrder.length < 1) {
      glossaryOrder = initialGlossaryOrder
    }
    const mandatoryGlossariesOn = mandatorySourcesOn.map(x => {
      if (sources[x] && sources[x].type === 'success') {
        // @ts-ignore The error is tested by the line above
        return sources[x].data.glossaries.map(z => {
          return x + '/' + z.id
        })
      } else return []
    }).flat()
    return [... new Set(mandatoryGlossariesOn.concat(glossaryOrder))]
  },
  get.sources,
  get.userGlossaryOrderById,
  get.initialGlossaryOrder,
  get.mandatorySourcesOn
).pipe(dropRepeats)

const sourceOrder = flydLift(
  (
    sourceRank,
    mandatorySourcesOn
  ) => {
    return [... new Set(mandatorySourcesOn.concat(sourceRank))]
  },
  get.sourceRank,
  get.mandatorySourcesOn
).pipe(dropRepeats)

const defaultDeselectedSources = flydLift(
  (deselectedSources, backendDefaultOn, backendSources, selectedConfigSources) => {
    backendDefaultOn.forEach(backendId => {
      if (!(backendId in backendSources)) {
        if (backendSources[backendId].type === 'success') {
          // @ts-ignore The error is tested by the line above
          const data = backendSources[backendId].data
          deselectedSources = deselectedSources.concat(data)
        }
      }
    })
    deselectedSources = deselectedSources.filter(x => !selectedConfigSources.includes(x))
    return deselectedSources
  },
  get.deselectedSources,
  get.backendDefaultOn,
  get.backendSources,
  get.selectedConfigSources
).pipe(dropRepeats)

const computedDeselectedSources = flydLift(
  (deselectedSources, userDeselectedSources, userSelectedSources) => {
    const list = deselectedSources.filter(x => !userSelectedSources.includes(x))
    const returnVal: string[] = [
      ...new Set([...list, ...userDeselectedSources])
    ]
    return returnVal
  },
  defaultDeselectedSources,
  get.userDeselectedSources,
  get.userSelectedSources
)

export { model, message, get }
