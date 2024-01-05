/*
 * Vertraulich
 */

/* Detects page zoom changes and runs callback methods.
 *
 **/

import elementResizeEvent from 'element-resize-event'

// This hidden element, sized in em’s, allows us to detect page zoom
// changes. It works even when ‘Zoom Text only’ is selected in Firefox.
const zoomDetectorId = 'zoom-detector'
let detector = document.querySelector('#' + zoomDetectorId)
if (!detector) {
  detector = document.createElement('div')
  detector.id = zoomDetectorId
  detector.setAttribute('aria-hidden', 'true')
  detector.style.width = '1em'
  detector.style.height = '1em'
  detector.style.position = 'absolute'
  detector.style.top = '-9999px'

  if (document.body) {
    document.body.appendChild(detector)
  } else {
    document.addEventListener('DOMContentLoaded', () =>
      document.body.appendChild(detector)
    )
  }
}


function remove () {
  detector.parentElement.removeChild(detector)
}

function onZoom (fn) {
  // Usually, the window.resize event fires on zoom.
  window.addEventListener('resize', () => fn())
  // "Text only zoom" in Firefox requires this approach, as it does not fire
  // the window.resize event.
  elementResizeEvent(detector, fn)
}

let ZoomDetector = {onZoom: onZoom, remove: remove}

export default ZoomDetector
