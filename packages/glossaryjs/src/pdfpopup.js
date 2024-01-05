/*
 * Vertraulich
 */

import { i18n, newURL } from 'glossarylib'
import waitForThenDo from './lib/wait-for-then-do'

import 'scanned-pdf-detector'

export function removePdfPopupLinks () {
  const pdfLinks = document.querySelectorAll('a[data-termer_node_type="termer-pdf-link"]')
  for (const a of pdfLinks) {
    a.previousElementSibling.classList.remove('display-none-termer')
    a.remove()
  }
}

export function addPdfPopupLinks (MutationDetector) {
  const pdfLinks = extractPdfLinks()
  for (const a of pdfLinks) {
    if (!isValidPdfUrl(a)) {
      if (a.host.replace('www.', '') === window.location.host.replace('www.', '')) {
        fixPdfDomain(a, MutationDetector)
      }
      continue
    }
    fixupPdfUrl(a)
    createNewPdfPopuplink(a, MutationDetector)
  }
}

function fixPdfDomain (url, MutationDetector) {
  let newPdfUrl
  if (url.host.includes('www.')) {
    newPdfUrl = url.host.replace('www.', '')
  } else {
    newPdfUrl = url('www.', '')
  }
  url.host = newPdfUrl
  headRequestTest(url, MutationDetector)
}

function headRequestTest (url, MutationDetector) {
  var http = new XMLHttpRequest()
  http.open('HEAD', url)
  http.onreadystatechange = function () {
    if (this.readyState === this.DONE) {
      callback(this.status === 200, url, MutationDetector)
    }
  }
  http.send()
}

function callback (status, url, MutationDetector) {
  if (status) {
    fixupPdfUrl(url)
    createNewPdfPopuplink(url, MutationDetector)
  }
}

function isValidPdfUrl (url) {
  // Ignore PDF not hosted on the same domain
  // This avoids cross-site origin issues, but limits the utility of the PDF
  // viewer.
  return url.host === window.location.host
}

function fixupPdfUrl (url) {
  if (url.protocol !== window.location.protocol) {
    url.protocol = window.location.protocol
  }
  return url
}

export function replacePdfIframes (MutationDetector) {
  const pdfFrames =
    Array.from(document.querySelectorAll('iframe[src$=".pdf"]'))
      .filter(frame => isValidPdfUrl(newURL(frame.src)))
  for (const frame of pdfFrames) {
    replacePdfIframe(MutationDetector, frame)
  }
}

export function removePdfIframes () {
  const pdfFrames = document.querySelectorAll('a[data-termer_node_type="termer-pdf-frame"]')
  for (const f of pdfFrames) {
    f.previousElementSibling.classList.remove('display-none-termer')
    f.remove()
  }
}

function createNewPdfPopuplink (link, MutationDetector) {
  const newNode = link.cloneNode(true)
  newNode.addEventListener('click', handleClickOnPdfLink(MutationDetector))
  newNode.removeAttribute('onclick')
  newNode.dataset.termer_node_type = 'termer-pdf-link'
  newNode.target = '_blank'
  link.classList.add('display-none-termer')
  link.parentNode.insertBefore(newNode, link.nextSibling)
}

function extractPdfLinks () {
  let pdfLinks = Array.from(document.querySelectorAll('a[href$=".pdf"]'))

  if (window.location.host === 'www.europarl.europa.eu') {
    const links = Array.from(document.querySelectorAll('a[href*="+DOC+PDF+"]'))
    pdfLinks = pdfLinks.concat(links)
  }

  if (window.location.host === 'eur-lex.europa.eu') {
    const links = Array.from(document.querySelectorAll('a[href*="/TXT/PDF/"]'))
    pdfLinks = pdfLinks.concat(links)
  }

  return pdfLinks
}

// IE11 seems to consider an iframe with src="about:blank" as having a different
// origin than the parent window. This is contrary to standards.
// Instead of using about:blank, we set src to the origin of the parent, but
// nothing is loaded from there because we immediately replace all the content
// in the frame with the PDF.js viewer.
function getPdfWrapper (origin) {
  const closeButtonTitle = i18n.__('Close window')
  const wrapper = `
    <div id="tingtun-pdf-popup-wrapper" class="div-reset">
      <div class="pdf-popup-container div-reset">
        <div id="tingtun-hider" class="div-reset"></div>
        <a href="javascript:void(0);"
           class="pdf-popup-close-button"
           title="${closeButtonTitle}">
          <div id="tingtun-pdf-popup-button-icon" class="div-reset">&times;</div>
        </a>
        <iframe id="pdf-popup-frame" title="PDF"
                name="termer-pdf-popup"
                style="height:100%;width:100%"
                src="${origin}"></iframe>
      </div>
      <style>
      #tingtun-hider {
        background-color: rgb(70, 70, 70);
        position: absolute;
        visibility: visible;
        height: 100%;
        width: 100%;
      }
      #tingtun-pdf-popup-wrapper .pdf-popup-container {
        position: relative;
        left: 5%;
        top: 5%;
        width: 90%;
        height: 90%;
        border: 5px solid #464646;
        background-color: rgba(70, 70, 70, 0.3);
      }
      #tingtun-pdf-popup-wrapper {
        width: 100%;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999999999;
      }
      .div-reset {
        box-sizing: initial;
        margin: initial;
        padding: initial;
        border-radius: initial;
        background-color: initial;
        width: initial;
      }
      #tingtun-pdf-popup-wrapper iframe {
        border-width: 0px;
      }
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button,
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button:link,
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button:visited,
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button:hover,
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button:focus,
      #tingtun-pdf-popup-wrapper .pdf-popup-close-button:active {
        box-sizing: initial;
        position: absolute;
        right: -1.5em;
        top: -1.5em;
        background-color: lightgrey;
        color: black;
        border: 4px solid white;
        border-radius: 100em;
        width: 1.5em;
        height: 1.5em;
        text-align: center;
        padding: .2em;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #tingtun-pdf-popup-button-icon {
        font-size: 2em;
        display: flex;
        width: 0;
        height: 0;
        justify-content: center;
        align-items: center;
        line-height: initial;
        font-family: sans-serif;
      }
      </style>
    </div>
  `
  return wrapper
}

function handleClickOnPdfLink (MutationDetector) {
  return function a (evt) {
    evt.preventDefault()
    if (document.querySelector('#tingtun-pdf-popup-wrapper')) {
      // This stops us from spawning multiple PDF viewers.
      // There can be only one.
      return true
    }
    let target = evt.target
    while (target.tagName !== 'A') {
      target = target.parentNode
    }

    openPdfPopup(MutationDetector, target.href)

    return true
  }
}

function createPdfPopupWrapper (iframeSrc, MutationDetector, document) {
  const pdfWrapper = getPdfWrapper(iframeSrc)
  // console.log('********************************', 'createPdfPopupWrapper', 'stop')
  MutationDetector.stop()
  document.body.insertAdjacentHTML('beforeend', pdfWrapper)
  // console.log('********************************', 'createPdfPopupWrapper', 'start')
  MutationDetector.start()

  const wrapper = document.querySelector('#tingtun-pdf-popup-wrapper')

  // Close the popup when
  // a) the close button is clicked
  // b) a click is registered outside the popup
  const closeButton = wrapper.querySelector('.pdf-popup-close-button')
  closeButton.addEventListener('click', closePdfPopup)
  wrapper.addEventListener('click', closePdfPopup)

  const container = wrapper.querySelector('#pdf-popup-frame')
  container.show = function () {}
  container.showContents = showContents

  return container

  function closePdfPopup (event) {
    event.preventDefault()
    event.stopPropagation()

    // Stop loading of PDF/unload it, before removing the iframe.
    // This prevents IE11 from spewing errors about undefined things inside
    // the iframe.
    if (container.contentWindow.PDFViewerApplication) {
      container.contentWindow.PDFViewerApplication.close()
    }
    wrapper.parentNode.removeChild(wrapper)
    return true
  }
}

function showContents () {
  const outerHiderElement = window.document.querySelector('#tingtun-hider')
  if (outerHiderElement instanceof HTMLElement) {
    outerHiderElement.style.visibility = 'hidden'
  }
  const hider = this.contentDocument.querySelector('#hider')
  hider.classList.add('removeHider')
}

export function replacePdfIframe (MutationDetector, frame) {
  const fileURL = frame.src
  return loadPdf(fileURL, createPdfContainer)

  function createPdfContainer () {
    const newFrame = frame.cloneNode(true)
    newFrame.src = window.location.href
    newFrame.classList.add('display-none-termer')
    frame.dataset.termer_node_type = 'termer-pdf-frame'
    frame.parentNode.insertBefore(newFrame, frame.nextSibling)

    newFrame.show = function () {
      frame.classList.add('display-none-termer')
      newFrame.classList.remove('display-none-termer')
    }

    newFrame.showContents = showContents

    return newFrame
  }
}

export async function openPdfPopup (MutationDetector, fileURL) {
  const popupWrapper = () => createPdfPopupWrapper(window.location.href, MutationDetector, document)
  const pdfDocument = await loadPdf(fileURL, popupWrapper)
  addTermerButtonPlaceholder(pdfDocument)
  return pdfDocument
}

const pdfViewerUrl = process.env.PDF_VIEWER_URL +
  (/trident/i.test(navigator.userAgent)
    ? 'generic-es5/'
    : 'generic/'
  )

function loadPdf (fileURL, createContainer) {
  const viewerURL = pdfViewerUrl + 'web/viewer.html'
  let container
  return getPdfJS(viewerURL)
    .then(viewerDocument => {
      container = createContainer()
      addHider(viewerDocument)
      return injectPdfViewer(container.contentDocument, viewerDocument)
    })
    .then(() => {
      container.show()
      return waitForPdfJs(container.contentWindow)
    })
    .then(() =>
      loadPdfFile(container.contentWindow, fileURL))
    .then(() => {
      if (!fileURL) addBigOpenFileButton(container.contentDocument)
      container.showContents()
      return container.contentDocument
    })
}

function injectPdfViewer (containerDocument, viewerDocument) {
  return new Promise(resolve => {
    const doctype = viewerDocument.doctype

    containerDocument.open()
    containerDocument.write(viewerDocument.head.outerHTML)
    containerDocument.write(viewerDocument.body.outerHTML)
    containerDocument.close()
    containerDocument.insertBefore(doctype, containerDocument.documentElement)
    containerDocument.addEventListener('DOMContentLoaded', () => resolve(containerDocument))
  })
}

function waitForPdfJs (pdfJsWindow) {
  return new Promise(resolve => {
    const doc = pdfJsWindow.document

    // Save the path to pdf.worker.js, while <base> is still present.
    const baseURI = doc.baseURI || doc.querySelector('base').href
    pdfJsWindow.PdfJsWorkerSrc = baseURI + '../build/pdf.worker.js'

    // Wait for PDFViewerApplication to appear.
    waitForThenDo(
      () => typeof pdfJsWindow.PDFViewerApplication !== 'undefined' && !!doc.documentElement.dir,
      resolve,
      pdfJsWindow
    )
  })
}

function loadPdfFile (pdfJsWindow, fileURL) {
  return new Promise(resolve => {
    // Remove <base> in order to allow for opening PDF file from
    // cross-origin protocol/domain in IE11.
    const doc = pdfJsWindow.document
    const base = doc.querySelector('base')
    base.parentNode.removeChild(base)
    if (fileURL) pdfJsWindow.PDFViewerApplication.open(fileURL)
    resolve()
  })
}

// Wait for test() to return true, then execute act().
function addHider (document) {
  const el = `
  <div id="hider" class=""></div>
  <style>
    #hider {
      position: absolute;
      height: 100%;
      width: 100%;
      background-color: rgba(70, 70, 70, 1);
      visibility: visible;
      z-index: 9999999;
      transition-property: visibility, background-color;
      transition-duration: 250ms;
    }
    #hider.removeHider {
      background-color: rgba(70, 70, 70, 0);
      visibility: hidden;
    }
  </style>
  `
  document.body.insertAdjacentHTML('afterbegin', el)
}

function addBigOpenFileButton (document) {
  const innerText = i18n.__('Click here in order to open a PDF document.')
  const el = `
  <button id="big-open-file-button" onclick="document.querySelector('#openFile').click()">
    ${innerText}
  </button>
  <style>
  #big-open-file-button:hover {
    background-color: #777777;
    border-color: #055e90;
  }
  #big-open-file-button:focus {
    background-color: #777777;
    border-color: #055e90;
    outline-color: white;
    outline-style: dashed;
    outline-width: 2px;
    outline-offset: -12px;
  }
  #big-open-file-button {
    text-align: center;
    padding: 2%;
    margin: 2% auto 0 auto;
    background-color: #474747;
    color: rgb(217, 217, 217);
    border: 0.5em solid #18587b;
    border-radius: 5px;
    font-size: 133%;
    cursor: pointer;
    position: fixed;
    width: 56%;
    left: 22%;
  }
  #big-open-file-button::before {
    content: url(images/toolbarButton-openFile.png);
  }
  </style>
  `
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.text = `
     const button = document.querySelector('#big-open-file-button')
     button.focus()
     document.querySelector('#fileInput')
       .addEventListener('change', function () { button.style.display = 'none' })
  `
  document.querySelector('#viewer').insertAdjacentHTML('beforeend', el)
  document.body.appendChild(script)
}

function addTermerButtonPlaceholder (document) {
  const el = `
    <tingtun-termer-button-container
      id="tingtun-termer-button"
      data-tabindex="30">
    </tingtun-termer-button-container>
  `
  document
    .querySelector('#toolbarViewerMiddle')
    .insertAdjacentHTML('beforeend', el)
}

// Copy script into document, or ownerDocument if doc is not passed.
// The script is not inserted into the document.
function copyScript (script, doc) {
  doc = doc || script.ownerDocument
  const scriptCopy = doc.createElement('script')

  // Edge: attributes (NamedNodeMap) is not iterable.
  // Therefore, use an old-style for loop here instead of `for … of`.
  const attributes = script.attributes
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    const key = attribute.name || attribute.nodeName
    const val = attribute.value || attribute.nodeValue
    if (key === 'src') continue
    scriptCopy[key] = val
  }

  // handle src separately, in order to get the absolute URI.
  scriptCopy.src = script.src

  // `data-` attributes must be handled separately.
  for (const key in script.dataset) {
    const val = script.dataset[key]
    scriptCopy.dataset[key] = val
  }

  // Setting src directly like this will automatically prepend the base.href
  // URL to the src (Firefox and Chrome, not IE11).
  // This is safer, as it ensures that the browser uses the correct URL.
  // As long as base.href is set, however, this is not needed, and we can use
  // copyAttr instead.
  //
  // if (script.src) s.src = script.src

  if (script.text) {
    scriptCopy.appendChild(doc.createTextNode(script.text))
  }

  // We can also tag each replaced script with a data-replaced="true" attribute,
  // to keep track of them.
  //
  // s.dataset.replaced = 'true'

  return scriptCopy
}

function getPdfJS (url) {
  const promise = new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'document'
    xhr.addEventListener('load', response => {
      const responseDoc = response.target.responseXML
      const base = responseDoc.createElement('base')
      base.href = pdfViewerUrl + 'web/'
      responseDoc.head.insertBefore(base, responseDoc.head.firstChild)

      // Convert relative URIs to absolute URIs.
      // This is necessary because Firefox 55 (at least) does not consistently
      // calculate the correct baseURI for URIs occuring in an iframe with
      // src="about:blank".
      for (const el of responseDoc.querySelectorAll('[href]')) {
        updateUrl(el, 'href', base.href)
      }
      for (const el of responseDoc.querySelectorAll('[src]')) {
        updateUrl(el, 'src', base.href)
      }

      const glossaryScriptTag = document.querySelector('#tingtunGlossary')
      if (glossaryScriptTag) {
        const script = copyScript(glossaryScriptTag, responseDoc)
        responseDoc.body.appendChild(script)
      }

      resolve(responseDoc)
    })
    xhr.send()
  })
  return promise
}

function updateUrl (element, attributeName, url) {
  if (!(url instanceof URL)) {
    url = newURL(url)
  }

  const attrVal = element.attributes[attributeName].value
  const original = newURL(element[attributeName])
  original.protocol = url.protocol
  original.host = url.host
  if (original.pathname.indexOf(url.pathname) === -1) {
    // IE11 difference: Other browsers automatically sets the correct path.
    original.pathname = url.pathname + attrVal
  }
  element[attributeName] = original.toString()
}
