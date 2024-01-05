import waitForThenDo from './lib/wait-for-then-do'
import { i18n } from 'glossarylib'

if (window.name === 'termer-pdf-popup') {
  waitForThenDo(
    () => typeof window.PDFViewerApplication !== 'undefined' && !!document.dir,
    checkForScannedPDF
  )
}

// timeout for showing the scanned PDF warning
let timeout
// the warning message HTMLElement
let noTextMessage

function checkForScannedPDF () {
  setUpObserver()
  const target = document.getElementById('viewerContainer')
  noTextMessage = addNoTextMessage(target)
  // 'pagesinit' fires when a new document’s first page is ready.
  window.PDFViewerApplication.eventBus.on('pagesinit', checkForText)
}

function checkForText () {
  // reset manual message dismissal.
  noTextMessage.classList.remove('permNoText')
  // hide the message, then, after a delay, show it unless the timeout’s
  // cancelled.
  noTextMessage.classList.add('noText')
  timeout = window.setTimeout(
    () => noTextMessage.classList.remove('noText'),
    1000
  )
}

function setUpObserver () {
  const observerOptions = {
    subtree: true,
    characterData: true, // detect text changes
    childList: true // detect added child nodes
  }
  const observer = new MutationObserver(observerCallback)
  const target = document.getElementById('viewer')
  observer.observe(target, observerOptions)
}

function observerCallback () {
  // this just checks if there is any text in the `.textLayer` elements.
  // If yes, the warning message is hidden.
  for (const el of document.querySelectorAll('.textLayer')) {
    if (el.textContent.trim()) {
      window.clearTimeout(timeout)
      noTextMessage.classList.add('noText')
      return
    }
  }
}

function addNoTextMessage (element) {
  const innerText = i18n.__('Click the TERMER-button to use the search field. This document may be scanned.')
  const el = `
  <div class="noTextStyle noText" id="noTextDiv" name="tingtun_not_mark">
  ${innerText}
  <button
  onclick="document.getElementById('noTextDiv').classList.add('permNoText')">
  OK
  </button>
  <style>
  .noTextStyle {
    position: fixed;
    z-index: 99;
    width: 100%;
    text-align: center;
    background: lightcoral;
    top: 2em;
  }
  .noText {
    display: none;
  }
  .permNoText {
    display: none;
  }
  </style>
  </div>
  `
  element.insertAdjacentHTML('beforeend', el)
  return element.lastElementChild
}
