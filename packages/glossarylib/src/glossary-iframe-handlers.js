/*
 * Vertraulich
 */

'use strict'

function isFrameAccessible (frame) {
  try {
    // Read access to location.href is disallowed if frame is on a
    // different domain (and port?), so accessing it may throw a
    // Permission Denied exception.
    // However, catching the cross-origin security exception on ios
    // safari doesn’t work.  Checking if href is undefined does.
    if (!frame.contentWindow.location.href) {
      return false
    }
    return true
  } catch (e) {
    return false
  }
}

/* Get all iframe elements that are accessible from the current
 * document.
 */
function getAccessibleIframes () {
  // Select all iframes with a src attribute
  var frames = document.querySelectorAll('iframe[src]')

  // turn it into a proper Array
  frames = [].slice.apply(frames)
    // remove inaccessible frames
    .filter(isFrameAccessible)

  return new Set(frames)
}

/* Inject glossary.js in embedded iframes, if allowed. */
export function injectGlossaryInFrames (glossaryScriptTag) {
  var frames = getAccessibleIframes()
  for (const frame of frames) {
    injectGlossaryInFrame(glossaryScriptTag, frame)
  }
}

export function injectGlossaryInFrame (glossaryScriptTag, frame) {
  if (!isFrameAccessible(frame)) return
  if (/complete|interactive/.test(frame.contentWindow.document.readyState)) {
    injectIt(...arguments)
  }

  // Use both load events, whichever actually fires for this frame.
  frame.addEventListener('DOMContentLoaded', l)
  frame.addEventListener('load', l)
  frame.contentWindow.addEventListener('DOMContentLoaded', l)
  frame.contentWindow.addEventListener('load', l)

  function l (evt) {
    injectIt(glossaryScriptTag, frame)
  }
}

function injectIt (glossaryScriptTag, frame) {
  let doc = null
  try {
    doc = frame.contentWindow.document
  } catch (e) {}
  if (doc && !doc.getElementById('tingtunGlossary')) {
    const script = doc.createElement('script')
    // Edge: attributes (NamedNodeMap) is not iterable.
    // Therefore, use an old-style for loop here instead of `for … of`.
    const attributes = glossaryScriptTag.attributes
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i]
      var key = attribute.name || attribute.nodeName
      var val = attribute.value || attribute.nodeValue
      if (key === 'src') continue
      script[key] = val
    }

    // handle src separately, in order to get the absolute URI.
    script.src = glossaryScriptTag.src

    // `data-` attributes must be handled separately.
    for (const key in glossaryScriptTag.dataset) {
      const val = glossaryScriptTag.dataset[key]
      script.dataset[key] = val
    }
    doc.body.appendChild(script)
  }
}

export function proxyMessageHandler (evt) {
  if (evt.data && evt.data.msg) {
    const frames = getAccessibleIframes()
    const source = evt.source

    for (const frame of frames) {
      if (frame.contentWindow === source) continue
      const sendObj = { msg: evt.data.msg }
      if (evt.data.domains) {
        sendObj.domains = evt.data.domains
      }
      frame.contentWindow.postMessage(sendObj, '*')
    }
  }
}
