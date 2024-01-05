/*
 * Vertraulich
 */

import { TermerAPI, SemanticMediaWikiAPI, QuickTermAPI, BrowserBackendAPI } from 'glossaryapi-client'
import Conf from './config'

let MyAPI
if (Conf.backend.type === 'termer') {
  MyAPI = new TermerAPI(Conf.backend.url)
} else if (Conf.backend.type === 'semanticmediawiki') {
  MyAPI = new SemanticMediaWikiAPI(Conf.backend)
} else if (Conf.backend.type === 'quickterm') {
  MyAPI = new QuickTermAPI(Conf.backend)
} else if (Conf.backend.type === 'browser-backend') {
  MyAPI = new BrowserBackendAPI(Conf.backend)
} else {
  console.warn('Invalid API backend type:', Conf.backend.type,
    'url:', Conf.backend.url,
    'using default backend instead')
  MyAPI = new TermerAPI()
}

export default MyAPI
