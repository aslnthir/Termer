/*
 * Vertraulich
 */

// This is so termer script can be hosted on any domain and fetch the packages
// from that domain.
const scriptUrl = new URL(document.currentScript.src)
let termerDomain = scriptUrl.origin + '/'

console.log('loading termer');
function debug(debugmessage){
  if(debugging){
    console.log(debugmessage)
  }
}
const debugging = true

//change path based on where termer is running
if (scriptUrl.href.indexOf('termer.x.tingtun') != -1 
  || scriptUrl.href.indexOf('termer.no') != -1){
  termerDomain += 'glossaryjs/'
}

__webpack_public_path__ = termerDomain

// author: Anand B Pillai and Daniel Aasen
// maintainer: Daniel Aasen
// lastmodified: Thursday Nov 26 2015

/* jshint browser: true       */
/* jshint devel: true         */
/* jshint globalstrict: true  */
/* jshint newcap: true */
/* global require: true */
'use strict'
/* XXX: Workaround for https://github.com/zloirock/core-js/issues/289.
 *
 * core-js (included by babel-polyfill & babel-runtime) changes the value
 * of toString([]) from [object Array] to [object Array Iterator]. This
 * causes XRegExp to throw the error “Must provide a nonempty array of
 * patterns to merge” (v3.2.0 line 4123).
 *
 * Workaround this problem by resetting the toString return value to the default.
 */
Object.defineProperty(Array.prototype, Symbol.toStringTag, { value: 'Array' })

import urlParser from './lib/URLParser'

import { px2em } from './lib/MathExtra'

import {
    getReferrerURL,
    getGlossaryPopupURL,
    getGlossaryConfigURL,
    getParents,
    getViewportDimensions
} from './lib/utils'

// these are jquery plugins
// require('jquery-ui')

import '../static/css/glossify.css'

if (document.querySelectorAll('base[href="resource://pdf.js/web/"]')[0]) {
  console.log('Detected pdf.js, using different markup style.')
  require('../static/css/highlightPDF.css')
} else {
  require('../static/css/highlight.css')
}

//import GlossaryPopupC from './glossary-popup'
import {GlossaryPopup} from './lib/glossary-popup'

import Events from './events'

import {
  removePdfPopupLinks, addPdfPopupLinks, openPdfPopup, replacePdfIframes,
  removePdfIframes
} from './pdfpopup'

import {
  Tagger, Wordlist, IframeHandler,
  MutationController, Conf,
  pollyfils, GlossaryAPI, PDFJSWatcher
} from 'glossarylib'
// import { Termer, defaultBackendDescriptors } from 'termer-core'

let MutationDetector

if (window.PDFViewerApplication) {
  MutationDetector = new PDFJSWatcher()
} else {
  MutationDetector = new MutationController(500, el => replaceTermerButtonPlaceholder(el, Conf))
  MutationDetector.setTaggerFunction(elem => {
    // console.warn('Termer: tagIt not yet set for MutationDetector')
    return
  })
}
const glossaryPopup = new GlossaryPopup('tingtun_move_handler_tooltip',
                                        Conf.appStyle, MutationDetector)

// Export our library
export {
  removeAllTingtunMarupTags,
  isUpperCase,
  removeWordsFromWordList,
  getParagraphStyles,
  startupGlossaryMarkingProsses,
  openUpConfig,
  changeShowLabels,
  getSelectedText,
  MutationDetector,
  Conf
}

// Apply workarounds for misconfigured glossary embedders.
function fixup () {
  // get our script tag
  let thisScriptTag = document.querySelector('#tingtunGlossary')
  if (!thisScriptTag) {
    // Workaround for when the ID is not set correctly:
    // find the script by matching on the src attribute,
    // and correct the ID.
    thisScriptTag = document.querySelector('script[src*="glossary"]')
    thisScriptTag.id = 'tingtunGlossary'
  }
}

fixup()

if (typeof console == "undefined") {
    window.console = {
        log: function () {},
        debug: function() {}
    };
}

if (typeof console.time === "undefined") {
    console.time = console.log;
    console.timeEnd = console.log;
}

// load scripts and stylesheet synchronously and then execute main().
var prevFocus = null;
// get the site domain and path
var siteDomain = document.location.host;
var sitePath = document.location.pathname;

// Set the domain i sessionStorage
if (document.referrer) {
  let referrerUrl = urlParser(document.referrer);
  let glossaryURL = document.querySelector('#tingtunGlossary').getAttribute('src');
  if (/^\/static/.test(glossaryURL)) {
      glossaryURL = location.href;
  }
  glossaryURL = urlParser(glossaryURL);
  if (referrerUrl.host != glossaryURL.host) {
      sessionStorage.setItem('domain', document.referrer);
  }
  else if (referrerUrl.pathname.toLowerCase().indexOf("render_gloxy") >= 0) {
      sessionStorage.setItem('domain', document.referrer);
  }
}

if (/complete|interactive/.test(document.readyState)) {
  main()
} else {
  // Wait for document to be ready before running main().
  // Use whichever event comes first.
  let hasBeenCalled = false
  const f = () => {
    if (hasBeenCalled) return
    hasBeenCalled = true
    main()
  }
  Events.addEventListener(window, 'DOMContentLoaded', f)
  Events.addEventListener(window, 'load', f)
}

function changeShowLabels () {
  Conf.showLabels = !Conf.showLabels
}

var termerButton
var termerCore
// Main entry point.
async function main () {
  // const { Termer, defaultBackendDescriptors } = process.env.TERMER_CORE_URL
  //   ? await import(/* webpackIgnore: true */ process.env.TERMER_CORE_URL)
  //   : await import('termer-core')
  const { Termer, defaultBackendDescriptors } = await import('termer-core')
  var thisScriptTag = document.querySelector('#tingtunGlossary')

  let backendNames
  if (window.self !== window.top) backendNames = []
  else backendNames = ['Termer']

  if (Conf.backends && Conf.backends.length > 0) {
    backendNames = Conf.backends
  }
  const backends = backendNames.map(x => defaultBackendDescriptors[x])
  const termerBackend = backends.find(b => b.type === 'Termer')
  if (termerBackend) {
    if (process.env.TERMER_BACKEND) {
      termerBackend.url = process.env.TERMER_BACKEND + '/glossary2/'
      termerBackend.loginUrl = process.env.TERMER_BACKEND + '/v/#/login/'
    }
    if (Conf.apikey) {
      termerBackend.config.apiKeys.push(Conf.apikey)
    }
  }

  window.termerCore = termerCore = new Termer(backends)
  window.termerCore.setLocationDomain(window.location.hostname)

  // Set the application domain
  let scriptUrl = new URL(document.currentScript.src)
  if (scriptUrl.port === '3001') scriptUrl.port = 3002
  let termerDomain = scriptUrl.origin + '/'
  window.termerCore.setAppDomain(termerDomain)

  if (window.termerCore.modelGetters.selectedFromLanguages().length === 0 &&
      Conf.siteLanguage !== '') {
    // console.log('***** glossary.js 217')
    window.termerCore.selectFromLanguage(Conf.siteLanguage)
  } else if (window.termerCore.modelGetters.selectedFromLanguages().length === 0 &&
      Conf.siteLanguage === '') {
    if (navigator.languages) {
      navigator.languages.forEach(language => {
        // console.log('***** glossary.js 223')
        // window.termerCore.selectFromLanguage(language)
      })
    } else if (navigator.language) {
      // console.log('***** glossary.js 225')
      window.termerCore.selectFromLanguage(navigator.language)
    }
  }
  window.termerMarkupStatus = {
    running: false, redo: false, data: {}, nextMarkup: undefined
  }

  IframeHandler.injectGlossaryInFrames(thisScriptTag)

  // apply styles supplied in URL, if any.
  let urlParams = urlParser(window.location.href).searchObject
  if (urlParams.fontSize) {
    document.body.style.fontSize = decodeURIComponent(urlParams.fontSize)
  }
  if (urlParams.fontFamily) {
    document.body.style.fontFamily = decodeURIComponent(urlParams.fontFamily)
  }

  // Do not start the glossary if it is set to offline.
  if (Conf.offline) {
    console.log("Glossary is offline");
  }

  createHandlers();

  const replaceElement = document.getElementById('tingtun-termer-button')
  if (replaceElement) {
    replaceTermerButtonPlaceholder(replaceElement, Conf)
  }
  handleCustomSiteConfig()
  start();
    /*
    // If we’re logged in, we could do this:
    // see if we have saved settings on the server. If we do, get them and use them.
    // otherwise, just use the settings that we already have.
    var settings_url = undefined
    $.ajax({
      url: settings_url,
      xhrFields: {withCredentials: true},
      dataType:'json'
      })
      .done(function(settings){
        start();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('failed to get updated user settings due to an error:',
                    textStatus, errorThrown
                    )
        console.log('continuing with preexisting settings.')
        start();
      })
    */
  var target = document.getElementById('viewer')
  if (target && target.parentElement.id === 'viewerContainer') {
    var observer = new MutationObserver(function(mutations) {
      for (const mutationRecord of mutations) {
        if (mutationRecord.addedNodes.length > 0) {
          if (mutationRecord.target.classList.contains('textLayer')) {
            const e = document.getElementById('scaleSelect')
            const value = e.options[e.selectedIndex].text
            window.termerCore.vueSettings( {'zoom-level': value } )
            const scale = (parseInt(value) || 100) / 100
            glossaryPopup.scaleWidth(scale)
          }
        }
      }
    })
    observer.observe(target, { attributes: false, childList: true, subtree: true })
  }
}

function handleCustomSiteConfig () {
  const customConfigElement = document.getElementById('termer-custom-settings')
  if (customConfigElement) {
    const customConfig = JSON.parse(customConfigElement.innerHTML)
    if ('sourceRank' in customConfig) {
      termerCore.setSourceRank(customConfig['sourceRank'])
    }
    if ('SourcesGeneralOn' in customConfig) {
      termerCore.selectConfigSource(customConfig['SourcesGeneralOn'])
    }
    if ('deselectSources' in customConfig) {
      termerCore.deselectSource(customConfig['deselectSources'])
    }
  }
}

function replaceTermerButtonPlaceholder (replaceElement, Conf) {
  let TermerButton
  if (Conf.appStyle === 'wien') {
    TermerButton = require('./lib/wien-termer-button').default
  } else if (Conf.appStyle === 'termcord') {
    TermerButton = require('./lib/termcord-termer-button').default
  } else {
    TermerButton = require('./lib/termer-button').default
  }
  /*   const TermerButton = Conf.appStyle === 'termcord'
       ? require('lib/termcord-termer-button').default
       : require('lib/termer-button').default */

  const state = Conf.offline ? 'off' : 'on'
  termerButton = new TermerButton (state, replaceElement)
  termerButton.on('openconfig', () => {
    openUpConfig(termerButton.button)
  })
  termerButton.on('on', () => {
    toggleGlossaryOnOff(true)
  })
  termerButton.on('off', () => {
    toggleGlossaryOnOff(false)
  })
  termerButton.on('opendomainconfig', () => {
    openUpConfig(termerButton.button, {domainConfig: true})
  })
  termerButton.on('removeDomain', () => {
    removeDomainChoice()
  })

  const loadingData = termerCore.loadingData
  loadingData.map(loading => {
    if (loading) {
      termerButton.addLoader()
    } else {
      termerButton.removeLoader()
    }
  })
}

function start(){
  // popIntoFrame();
  Events.addEventListener(window, 'message', messageHandler)
  if (!Conf.offline) {
    turnOnGlossary()
  }
  getGlossaryPopupURL('', {}).then(popupurl => {
    glossaryPopup.openHidden(popupurl)
  })
}

function messageHandler (evt) {
  const relevantSource = (
    evt.source !== window ||
    (evt.data && evt.data.source === 'termer-content-script')
  )
  if (relevantSource && evt.data && evt.data.msg) {
    IframeHandler.proxyMessageHandler(evt)
    var msgType = evt.data.msg;
    if (msgType == 'deactivate'){
      glossaryjs_reset();
    }
    else if (msgType === 'iframe-blur') {
      let closed = glossaryPopup.close()
      if (closed) {
        if (prevFocus) prevFocus.focus()
        evt.preventDefault()
      }
    }
    else if (msgType == 'turnOff'){
      if (evt.data.source === 'termer-content-script') {
        glossaryPopup.postMessage({msg: 'turnOff'}, '*')
      }
      turnOffGlossary()
    }
    else if (msgType == 'turnOn'){
      if (evt.data.source === 'termer-content-script') {
        glossaryPopup.postMessage({msg: 'turnOn'}, '*')
      }
      turnOnGlossary()
    }
    else if (msgType == 'reloadMarkup') {
      Conf.domains = evt.data.domains
      removeAllTingtunMarupTags()
      startupGlossaryMarkingProsses()
    }
    else if (msgType == 'reload'){
      document.location.reload();
    }
    else if (msgType === 'closeConfig') {
      // Only close config, not all popups
      // This closes all popups:
      glossaryPopup.close()

      //$('#tingtun_glossary_config').remove()
    } else if (msgType === 'markupProgress') {
      let loader = document.getElementById("tingtun-termer-loader");
      if (loader) {
        if (evt.data.value) {
          loader.classList.remove('hidden')
        } else {
          loader.classList.add('hidden')
        }
      }
      if (top !== self) {
        top.postMessage(evt.data, '*')
      }
    } else if (msgType === 'openPdfViewer') {
      openPdfPopup(MutationDetector)
    } else if (msgType === 'launch-titi') {
      lauchTiti()
    } else {
      // console.warn('Unhandled message', `"${msgType}"`, 'from', evt.source,
      //              'with payload', evt.data)
    }
  }
}

// remove everything
function glossaryjs_reset () {
  removeAllTingtunMarupTags();
  glossaryPopup.close()
  Events.removeAllListeners()
  const glossaryjsElement = document.querySelector('.glossaryjs')
  if (glossaryjsElement) {
    glossaryjsElement.parentElement.removeChild(glossaryjsElement)
  }
  delete window.iFrameResize;
  Conf.offline = true
}

function isHttpUrl(str){
  return !!str.match(/^(https?|\/|[^:\/]+\/)/);
}

function eventPositionRelativeToTarget (event, target) {
  // Decided against using event.layerX/Y because these attrs are non-standard
  // and ill-defined.
  // We’re calculating the coordinates manually instead.
  const targetRect = target.getBoundingClientRect()
  const x = event.pageX - window.pageXOffset - targetRect.left
  const y = event.pageY - window.pageYOffset - targetRect.top
  return { x, y }
}

function lauchTiti(){
  var d = document
  var hasScript = d.querySelector('#titiFeedbackScript') !== null
  if (hasScript) {
    var popup = d.querySelector('#popupElement')
    popup.style.display = 'block'
    const feedbackFrame = document.getElementById('feedbackiframeID')
    const message = { datatype: 'Reload-TiTi' }
    feedbackFrame.contentWindow.postMessage(JSON.stringify(message), '*')
  } else {
    var script = d.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://feedback.termer.tingtun.no/api/script/feedback.js'
    script.charset = 'utf-8'
    script.className = 'feedbackjs'
    script.id = 'titiFeedbackScript'
    d.body.appendChild(script)
  }
}

function getValidTarget(element) {
  // Inline elements have clientWidth/Height = 0, so find first ancestor with
  // a width/height.
  let width = element.clientWidth
  let height = element.clientHeight
  while ((!width || !height) && element.parentElement) {
    element = element.parentElement
    width = element.clientWidth
    height = element.clientHeight
  }
  return element
}

// Detects if the mouse event happened on a scrollbar
function isClickOnScrollbar (e) {
  // width and height do not include the scrollbar
  const target = getValidTarget(e.target)
  const width = target.clientWidth
  const height = target.clientHeight
  // Get the event position with reference to the event target
  const { x, y } = eventPositionRelativeToTarget(e, target)
  // Now we can check if the event happened within the target bounds.
  // The additional clientLeft check is for left-sided scroll bars, because
  // clientLeft includes the scrollbar width if it is on the left side.
  const clickOnVerticalScrollbar = x < e.target.clientLeft || x >= width
  const clickOnHorizontalScrollbar = y >= height
  return (clickOnVerticalScrollbar || clickOnHorizontalScrollbar)
}

// set up click & selection handlers
function createHandlers () {
  // keep track of where the mousedown event happened
  var mouseDownOnScollbar = false
  let registerClick = true
  let touchStarted = false
  const ieClicker = /Trident/i.test(navigator.userAgent)
    ? new IEClicker()
    : null

  Events.addEventListener(document.documentElement, 'mousedown', e => {
    if (!touchStarted) {
      registerClick = true
    }
    mouseDownOnScollbar = isClickOnScrollbar(e)
  })

  Events.addEventListener(document.documentElement, 'mouseup', e => {
    ieClicker && ieClicker.registerClickIE()
    if (!registerClick) {
      registerClick = true
      return
    }

    // detect double clicks
    if (ieClicker) {
      if (ieClicker.clickCount > 1) {
        return
      }
    } else {
      if (event.detail > 1) {
        return
      }
    }

    // left click only
    if (event.button !== 0) return

    // we regard clicks on scrollbars as if they happen "outside"
    // the window, so we ignore them.
    if (mouseDownOnScollbar) return

    const position = {
      x: event.pageX,
      y: event.pageY
    }
    handleClick(event, position)
  })

  Events.addEventListener(document.documentElement, 'touchstart', (e) => {
    touchStarted = true
    registerClick = true
  })

  Events.addEventListener(document.documentElement, 'touchmove', e => {
    if (registerClick) {
      registerClick = false
    }
  }, { passive: true })

  // handle touch event, because touchend may clear text selection before the
  // click event fires.
  Events.addEventListener(document.documentElement, 'touchend', e => {
    if (registerClick) {
      registerClick = false
      const t = event.changedTouches[0]
      const position = {
        x: t.pageX,
        y: t.pageY
      }
      handleClick(e, position)
    }
  })

  Events.addEventListener(document.documentElement, 'touchcancel', e => {
    registerClick = false
    touchStarted = false
  })

  Events.addEventListener(document, 'selectionchange', e => {
    const selection = getSelection()
    if (selection.type === 'Range' && selection.rangeCount > 0) {
      // actually selected text, so cancel our click
      registerClick = false
    }
  })

  function handleClick (event, position) {
    // if 'closePopup' is true, no lookup was performed.
    // then we should instead close the popup if it is open.
    var closePopup = tingtun_glossary(event, position)
    if (closePopup) {
      const closed = glossaryPopup.close()
      if (closed) {
        if (prevFocus) prevFocus.focus()
        event.preventDefault()
        // Stop the click from triggering the Termer button and reopening the
        // popup.
        event.stopPropagation()
      }
    }
  }
  // Remarks the words when there are changes in the dom element
  //document.documentElement.addEventListener('DOMNodeInserted', event => {
    //checkIfStartMarkupAgain(event)
  //})


  const ENTER_KEY = 13
  const TAB_KEY = 9
  const ESC_KEY = 27

  // When enter is pressed, open up popup if word is in focus
  // IE11 won’t trigger the keypress event, so we use keydown instead.
  Events.addEventListener(document.documentElement, 'keydown', e => {
    if (e.keyCode === ENTER_KEY && Conf.showLabels) {
      var retval = tingtun_glossary(e, null)
      if (!retval) e.preventDefault()
    }
  })

  // Tab out of popup, or Esc: close it
  Events.addEventListener(document.documentElement, 'keyup', e => {
    if (e.keyCode === TAB_KEY || e.keyCode === ESC_KEY) {
      let closed = glossaryPopup.close()
      if (closed) {
        prevFocus.focus()
        e.preventDefault()
      }
    }
  })
}

// This function starts the markup process as long as the even target is not a marked word
// also, it removes itself when it have triggered and added back laiter.
function checkIfStartMarkupAgain(event) {

  if (event.target.parentNode.getAttribute("name") == 'tingtun_glossary_label') {
    // console.log('Nothing done');
    return
  }
  else {
    console.log('******* startGlossaryMarkingprosesss')
    startupGlossaryMarkingProsses();
  }
}

// Fetches the glossary words to be marked
function withGlossaryWords(continuation_function, wordsNotToMark=[]) {
  let referrer = getReferrerURL()
  const wl = termerCore.wordlist
  // separate termer core streams for wordlist & regexes, or
  // handle regexes and wordlist generation within termer core, or
  // termer core emits wordlist as an object = {wordlist:[], regexes: []}
  wl.map(wordlist => {
    const siteConf = termerCore.modelGetters.fullSiteConfig()
    let highlightMode = null
    if (siteConf) {
      highlightMode = siteConf.highlightMode
    }
    // If markup is in progress, start up an markup process that starts up after
    // console.log('******* mutation detector started @ line 1036')
    // the first one. Also add the laitest settings to the new markup process
    if (window.termerMarkupStatus.running || window.termerMarkupStatus.redo) {
      // Currently unused variables
      window.termerMarkupStatus.data = { wordsNotToMark }
      if (!window.termerMarkupStatus.redo) {
        window.termerMarkupStatus.redo = true
        wordlistMarkupStart(continuation_function, highlightMode)
      }
    } else {
      window.termerMarkupStatus.running = true
      try {
        removeAllTingtunMarupTags()
        continuation_function(wordlist, wordsNotToMark, highlightMode)
      } catch (e) {
        window.termerMarkupStatus.running = false
        console.error(e)
      }
    }
  })
}
// Setup markup after tagIt has run
function wordlistMarkupStart (continuation_function, highlightMode) {
  _waitForTagit().then(() => {
    window.termerMarkupStatus.running = true
    window.termerMarkupStatus.redo = false
    try {
      removeAllTingtunMarupTags()
      const wordlist = termerCore.wordlist()
      continuation_function(
        wordlist,
        window.termerMarkupStatus.data.wordsNotToMark,
        highlightMode
      )
    } catch (e) {
      window.termerMarkupStatus.running = false
      console.error(e)
    }
  })
}

// Waits for tagIt to be finished before resolving
function _waitForTagit() {
  const poll = resolve => {
    window.termerMarkupStatus.nextMarkup = resolve
  }
  return new Promise(poll)
}

function getSelectionPosition () {
  const selection = window.getSelection()
  if (selection.rangeCount < 1) return null
  const range = selection.getRangeAt(0).cloneRange()
  trimRange(range)
  // ^ clone the range in order to not mess up the original selection later

  // selection.removeRange(range)
  // ^ This command clears the selection.
  // We don’t do that here because we want to keep a visual reference to the
  // selected text, and the temporary element created in this function is
  // invisible.

  /*
   * this creates issues when the selected text goes across element
   * boundaries, such as `|this <b>bold|</b> text. It messes up the
   * HTML, creating duplicates of block elements for instance.
   *
   * A better approach (a la Rangy): the highlightig itself can
   * consist of several spans, and they have a common data attribute to
   * represent the fact that they are to be treated as one unit.
   *
  // Put the selected text in a new, higlighted element.
  var tempHilight = document.createElement('span')
  tempHilight.className = 'tingtun_label'
  tempHilight.name = 'tingtun_glossary_label'
  tempHilight.dataset.temp = 'true'

  var contents = range.extractContents()
  tempHilight.appendChild(contents)
  range.insertNode(tempHilight)
  */

  // add an empty span tag for us to hang the popup on.
  // XXX: A bug in the browser will make Firefox wrap lines on this
  // empty <span> with absolute position. That is, selecting the last
  // part of a word at the start of a line may cause the first part of
  // the word to skip up to the previous line.
  //
  // For example: selecting 'califragalistic' in the following text:
  //
  //     This is one long word:
  //     supercalifragalisticexpialidocius
  //
  // will turn it into this:
  //
  //     This is one long word: super
  //     califragalisticexpialidocius
  //
  var tempHilight = document.createElement('span')
  tempHilight.dataset.temp = 'true'
  tempHilight.style.position = 'relative'
  tempHilight.style.zIndex = -999999
  tempHilight.style.color = 'transparent'

  // Calculate the pixel width of the temp element. If the selection spans
  // multiple lines, use only width of the selection in the last line.
  let rects = range.getClientRects() || []
  let widthPx = 0
  let top = 0
  for (let i = 0; i < rects.length; ++i) {
    const r = rects[i]
    if (r.top === top) {
      widthPx += r.width
    } else {
      top = r.top
      widthPx = r.width
    }
  }

  // Find the element to use for em width calculation.
  let elem = range.endContainer
  while (!(elem instanceof HTMLElement)) {
    elem = elem.parentElement || elem.parentNode
  }

  // Set the width of the reference node using em units, so it will scale
  // correctly if the text size is changed.
  const widthEm = px2em(elem, widthPx)

  // Position the temporary node at the end (to the right) of the selected word.
  // and provide a negative left margin. This ensures that if the width of the
  // text changes, the temporary node will wrap down to the next line along with
  // the selected word.
  tempHilight.style.marginLeft = -widthEm + 'em'
  tempHilight.style.width = widthEm + 'em'
  if (widthPx) {
    // inline-block allows the width to have an effect on the element.
    tempHilight.style.display = 'inline-block'
  } else {
    // width = 0, so we don’t need inline-block
    // This allows us to put the element exactly where the user clicked without
    // disrupting the surrounding text.
    tempHilight.style.display = 'inline'
  }
  tempHilight.style.verticalAlign = 'baseline'
  tempHilight.style.top = '7px'

  range.collapse(false) // Include only end point of original range
  range.insertNode(tempHilight)

  return tempHilight
}

function trimRange (range) {
  /* This corrects the selected range in IE11 (maybe all browsers on windows?),
   * where double-clicking selects the word under the cursor + trailing
   * whitespace.
   */

  // This is the selected text as a string
  const text = range.toString()

  // setStart/End works with character offsets only if the container node is
  // one of Text, Comment or CDATASection. So we’ll check the node type and
  // ignore the other node types.
  if (range.startContainer instanceof Text ||
      range.startContainer instanceof Comment ||
      range.startContainer instanceof CDATASection) {
    const whitespaceBefore = text.match(/^\s+/)
    if (whitespaceBefore) {
      const newStartPos = whitespaceBefore[0].length
      range.setStart(range.startContainer, newStartPos)
    }
  }

  if (range.endContainer instanceof Text ||
      range.endContainer instanceof Comment ||
      range.endContainer instanceof CDATASection) {
    const whitespaceAfter = text.match(/\s+$/)
    if (whitespaceAfter) {
      const endContainer = range.endOffset === 0 ?
        findPreviousSibling(range.endContainer) :
        range.endContainer
      const offset = range.endOffset ||
        endContainer.length ||
        endContainer.innerText.length
      const newEndPos = offset - whitespaceAfter[0].length
      range.setEnd(endContainer, newEndPos)
    }
  }
  return range
}

function findPreviousSibling (node) {
  while (!node.previousSibling) {
    node = node.parentNode
  }
  return node.previousSibling
}

function getSelectedText()
{
    var selection;

    if (window.getSelection) {
        // Firefox etc
        selection = window.getSelection().toString();
         // if (window.getSelection().empty) {  // Chrome
         //     window.getSelection().empty();
         // } else if (window.getSelection().removeAllRanges) {  // Firefox
         //     window.getSelection().removeAllRanges();
         // }
    }
    else if (document.selection) {
        // IE 9 etc.
//        selection = document.selection.createRange().toString();
        selection = document.selection.createRange().text;
    }
    selection = selection.trim();
    return selection;
}

function getParagraphStyles (properties, element=null) {
  let cssProperties = {}
  let p = element
  if (!element) {
    p = document.createElement('p')
    p.style.display = 'none'
    document.body.appendChild(p)
  }
  let computedStyle = window.getComputedStyle(p)
  for (let property of properties) {
    let computed = computedStyle[property]
    if (computed) {
      cssProperties[property] = computed
    }
  }
  if (!element) {
    document.body.removeChild(p)
  }
  return cssProperties
}

function render(word, positionElement) {
    let glossaryOrder = ''//getGlossaryOrder();

    var urlParams = {
      gorder: glossaryOrder,
    }

    let cssProperties2 = getParagraphStyles(['fontSize'], positionElement.parentElement)
    Object.assign(urlParams, cssProperties2)

    let cssProperties = getParagraphStyles(['fontFamily'])
    Object.assign(urlParams, cssProperties)

    getGlossaryPopupURL(word, urlParams).then(popupurl => {
      /*
      * If the function got no glossaries, ask the user to
      * select glossaries.
      */
      if (!popupurl) {
        forceOpenConfig(positionElement)
        return
      }

      // if we're running in the iframe, just update window.location.
      // window.name happens to be a property/attribute on the <iframe>
      // element which we are allowed to access
      if (window.name === glossaryPopup.name) {
        window.location = popupurl;
        return;
      }
      else if (window.name === glossaryPopup.name) {
        parent.postMessage({msg:'configLookup', term: word}, '*');
        return;
      }
      else {
        let thisScriptTag = document.getElementById("tingtunGlossary");
        let glossaryDomain = urlParser(thisScriptTag.src);
        glossaryPopup.open(popupurl, positionElement)
      }
    }).catch(function(error) {
      console.log('Render Error: ', error);
    })
}

function tingtun_glossary (event, clickPosition) {
  if (Conf.offline) return true
  const eventTargetElement = event.target

  let text
  let positionElement
  if (eventTargetElement.localName === 'termer-tag' &&
      eventTargetElement.classList.contains('tingtun_label')
  ) {
    if (!eventTargetElement.getAttribute('tabindex')) {
      const id = eventTargetElement.getAttribute('data-termer-tag-id')
      const mainElement = document.querySelector(`termer-tag[tabindex][data-termer-tag-id="${id}"]`)
      if (!mainElement) return
      eventTargetElement = mainElement
    }
    positionElement = eventTargetElement
    text = eventTargetElement.getAttribute('aria-label')
  } else if (event.type === 'mouseup') {
  } else {
    const selection = window.getSelection()
    let selectionPos
    if (selection.rangeCount > 0) {
      selectionPos = selection.getRangeAt(0).getBoundingClientRect()
    }
    const keyEvent = !clickPosition
    if (keyEvent || (selectionPos &&
      clickPosition.x > selectionPos.left &&
      clickPosition.x < selectionPos.right &&
      clickPosition.y > selectionPos.top &&
      clickPosition.y < selectionPos.bottom
    )) {
      text = getSelectedText()
      if (text) positionElement = getSelectionPosition()
    }
  }

  if (!text || !positionElement) return true

  // Don't try to get glossary if number of words is > 20
  // const words = text.split(' ')
  /*
  if (words.length > 20) {
    return true
  }
  */

  // clean up search term
  text = text.replace(/[“”]/g, '')

  // Inhibit MutationDetector while we potentially make changes to the DOM.
  MutationDetector.stop()
  // console.log('******* mutation detector stopped @line 1004')
  try {
    termerCore.search(text)
    render(text, positionElement)
  } finally {
    // console.log('mutation detector started @ line 1011')
    MutationDetector.start()
  }

  let inTingtunMessage = false
  for (const p of getParents(eventTargetElement)) {
    if (p.classList.contains('tingtun_message')) {
      inTingtunMessage = true
      break
    }
  }
  if (inTingtunMessage) {
    prevFocus = eventTargetElement
  }
  return false
}

// Removes all the tageds on marked up words on the document.
function removeAllTingtunMarupTags() {
  // console.log('******* mutation detector stopped @line 1074')
  MutationDetector.stop()
  for (const el of document.querySelectorAll('[name=tingtun_glossary_label]')) {
    const parent = el.parentElement
    el.outerHTML = el.innerHTML
    if (parent) {
      parent.normalize()
    }
  }
  // console.log('******* mutation detector started @ line 1036')
  MutationDetector.start()
}

function startupGlossaryMarkingProsses (wordsNotToMark = []) {
  if (Conf.showLabels && !Conf.offline) {
    // Start up loading from the button if it has any
    if (termerButton) {
      termerButton.addLoader()
      if (top !== self) {
        const m = { msg: 'markupProgress', value: true }
        top.postMessage(m, '*')
      }
    }
    withGlossaryWords(({ regexes, wordlist }, wordsNotToMark, highlightMode) => {
      wordlist = removeHeadword(wordlist)
      wordlist = removeWordsFromWordList(wordsNotToMark, wordlist)

      const binarySearchWordlist = Wordlist.createWordlist(wordlist)
      MutationDetector.setTaggerFunction(elem => {
        return Tagger.tagIt(elem, binarySearchWordlist, regexes,
          null, MutationDetector, null, highlightMode)
      })
      // console.log('******* mutation detector stopped @line 1058')
      MutationDetector.stop()
      let elem
      if (window.PDFViewerApplication) {
        const renderedPagesTextDivs = window.PDFViewerApplication
          .pdfViewer._pages
          .map(({ textLayer }) => textLayer ? textLayer.textDivs : null)
          .filter(x => x)
        elem = [].concat(...renderedPagesTextDivs)
      } else {
        elem = document.body
      }
      Tagger.tagIt(elem, binarySearchWordlist, regexes, null, MutationDetector,
        null, highlightMode)
        .then(() => {
          // console.log('wl tagger finished', wordlist.length)
          if (window.termerMarkupStatus.nextMarkup) {
            window.termerMarkupStatus.nextMarkup()
            window.termerMarkupStatus.nextMarkup = undefined
          }
          window.termerMarkupStatus.running = false
          // console.log('******* mutation detector started @ line 1080')
          MutationDetector.start()
        })
      // End loading from the button if it has anywhere
      if (termerButton && !termerCore.loadingData()) {
        termerButton.removeLoader()
        if (top !== self) {
          const m = { msg: 'markupProgress', value: false }
          top.postMessage(m, '*')
        }
      }
    }, wordsNotToMark)
  }
}

// Removes the searched word in the popup.
function removeHeadword(wordList) {
    var l = window.location;
    if (l.pathname == '/glossary/v2') {
        var wordToRemove = getUrlParameterByName('term');
        wordList = removeWordsFromWordList([wordToRemove], wordList);
    }
    return wordList
}

// Removes the provided words from the word list
function removeWordsFromWordList (wordsToRemove, wordList) {
  for (let wordToRemove of wordsToRemove) {
    // If only the first letter is uppercase, lowercase it and add this
    // new variant to the list of words to remove.
    if (isUpperCase(wordToRemove[0]) &&
      wordToRemove.substr(1) === wordToRemove.substr(1).toLowerCase()) {
      wordsToRemove.push(wordToRemove.toLowerCase())
    }

    // Remove all occurences of the word
    let indexOf = -1
    while ((indexOf = wordList.indexOf(wordToRemove)) > -1) {
      wordList.splice(indexOf, 1)
    }
  }
  return wordList
}

function isUpperCase (c) {
  return !!c && c !== c.toLowerCase() && c === c.toUpperCase()
}

// Read a page's GET URL variables and return the one asked for.
function getUrlParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function openUpConfig (placeElement, params = {}) {
  getGlossaryConfigURL(params).then(url => {
    glossaryPopup.open(url, placeElement)
    const message = {
      msg: Conf.offline ? 'turnOff' : 'turnOn'
    }
    glossaryPopup.postMessage(message, '*')
  })
}

function removeDomainChoice () {
  Conf.domains = null
  getGlossaryConfigURL({domainConfig: true, time: Date.now()}).then(url => {
    document.getElementById('tingtun_tooltip').src= url
  })
}

function toggleGlossaryOnOff( on ) {
  if (on) {
    debug('toggleGlossaryOnOff')
    turnOnGlossary()
    glossaryPopup.postMessage({ msg: 'turnOn' }, '*')
  } else {
    debug('toggleGlossaryOnOff')
    glossaryPopup.postMessage({ msg: 'turnOff' }, '*')
    console.log('turn off')
    turnOffGlossary()
  }
}

function turnOnGlossary () {
  debug('turnOnGlossary')
  // Add class if turning on termer
  Conf.offline = false
  termerButton && termerButton.toggleOn()
  if(Conf.showLabels) {
    // console.log('******* mutation detector started @ line 1171')
    MutationDetector.start()
    startupGlossaryMarkingProsses()
    addPdfPopupLinks(MutationDetector)
    replacePdfIframes(MutationDetector)
  }
}

function turnOffGlossary () {
  debug('turnOffGlossary')
  Conf.offline = true
  // Remove class if turning off termer
  termerButton && termerButton.toggleOff()
  // XXX: move focus away from popup, to prevent focus from automatically moving
  // to <body>?
  // console.log('******* mutation detector stopped @line 1182')
  MutationDetector.stop()
  removeAllTingtunMarupTags()
  glossaryPopup.close()
  removePdfPopupLinks()
  removePdfIframes()
}

function forceOpenConfig(positionElement) {
  if (window.name === glossaryPopup.name || window.name === glossaryPopup.name) {
    return
  }
  openUpConfig(positionElement)
}

// IE11 does not support UIEvent.details, which normally is used to count the
// number of clicks coming in in rapid succession (i.e. double clicks etc.)
// This class provides a workaround for the missing functionality.
class IEClicker {
  constructor () {
    this.ie11ClickCount = 0
    this.ie11ClickTimeout = 450
    this.ie11ClickTimeoutHandle = null
    Events.addEventListener(document.documentElement, 'mousemove', () => {
      if (this.ie11ClickCount > 0) {
        this.ie11ClickCount = 0
        clearTimeout(this.ie11ClickTimeoutHandle)
      }
    })
  }

  registerClickIE () {
    this.ie11ClickCount++
    clearTimeout(this.ie11ClickTimeoutHandle)
    this.ie11ClickTimeoutHandle = setTimeout(
      () => { this.ie11ClickCount = 0 },
      this.ie11ClickTimeout
    )
  }

  resetClickCount () {
    this.ie11ClickCount = 0
  }

  get clickCount () { return this.ie11ClickCount }
}
