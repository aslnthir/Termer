import * as Tagger from './tagger.js'
import createWordlist from './Wordlist.js'
import * as i18n from './i18n.js'
import * as IframeHandler from './glossary-iframe-handlers.js'
import MutationController from './MutationController'
import PDFJSWatcher from './pdfjs-watcher'
import { getGlossaryServerURL, getReferrerURL, newURL } from './utils/urls'
import Conf from './config'
import GlossaryAPI from './api'
import {
  compareLexemesDict, compareDefinitions,
  compareTwoDefinitionLists, compareTwoLexemeLists
} from './compare'

const Wordlist = {
  createWordlist
}

export {
  Conf,
  i18n,
  Tagger,
  newURL,
  Wordlist,
  IframeHandler,
  MutationController,
  getGlossaryServerURL,
  GlossaryAPI,
  getReferrerURL,
  compareLexemesDict,
  compareDefinitions,
  compareTwoDefinitionLists,
  compareTwoLexemeLists,
  PDFJSWatcher
}
