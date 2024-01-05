/*
 * Vertraulich
 */

import scrollParent from './scroll-parent'
import 'custom-event-polyfill'
import { getViewportDimensions } from './utils'
let eqcssWatch = false

import EQCSS from 'eqcss'

// Make changes in page zoom trigger the popup:resize event
import ZoomDetector from './zoom-detector'
ZoomDetector.onZoom(() => {
  // Recalculate popup position on zoom change
  EQCSS.apply()
  document.dispatchEvent(new CustomEvent('popup:resize', {detail: {geometrics: {}}}))
})

document.addEventListener('scroll', evt => {
  // Recalculate popup position when scrolling inside elements.
  EQCSS.apply()
}, true) //useCapture, in order to register scroll event on all elements in doc


// windowNameId is used for 2 things:
// - the name attribute of the iframe element
// - the ID of the popup container element
export class GlossaryPopup {
  constructor(windowNameId, appStyle, MutationDetector) {

    // Need to use self and not this in event functions,
    // since 'this' is window in events functions
    var self = this

    // iframe window name
    self.name = windowNameId

    // supported appStyles are default (termer style) & wien
    // falls back to default.
    self.appStyle = appStyle

    // id of the popup element
    self.popupId = windowNameId

    //  reference to the jQuery element holding the iframe
    self.popup = null

    // reference to the element the popup hangs on to
    self.positionElement = null

    self.previousExpandedDimensions = {}

    self.popupClosed = true

    self.popupLoaded = false

    self.messageQueue = []

    self.MutationDetector = MutationDetector

    this.initEQCSS()

    window.addEventListener('message', evt => this.iframeSizeMessageHandler(evt))

    document.addEventListener('popup:resize', event => {
      // There’s nothing to do if there is no popup showing
      if (!self.popup || self.popupClosed) return
      const popup = self.popup.children[0]
      // ensure the popup is not hidden
      popup.parentElement.style.visibility = 'visible'
      self.setSize(event.detail.geometrics)
    })
  }

  initEQCSS () {
    const styleId = 'tingtun-popup-eqcss'
    if (document.querySelector('#' + styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.type = 'text/css'
    /*
      Try catch here is because some sites crashes when running
      getComputedStyle. (Issue 2308)
      Example: https://portalcomunicacion.uah.es/diario-digital/actualidad/la-universidad-de-alcala-presente-en-la-feria-del-libro-de-madrid-a-traves-de-la-union-de-editoriales-universitarias-espanolas?n=6
      When this occurs just set the widt to 450px
    */
    style.innerHTML = `
      @element #tingtun_popup_inner_wrapper {
        #tingtun_move_handler_tooltip {
          width: eval('
            let width;
            let padding;
            try {
              let style = getComputedStyle(
                document.querySelector("#tingtun_move_handler_tooltip")
              );
              padding =
                parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
              style = getComputedStyle(
                document.querySelector("#tingtun_popup_inner_wrapper")
              );
              width = parseFloat(style.width);
            } catch (e) {
              width = 450;
              padding = 0;
            }
            width + padding
          ')px;
        }
      }

      @element '.tingtun_posision_label' {
        #tingtun_move_handler_tooltip {
          position: absolute;
          top: eval('
            /* https://github.com/timoxley/offset/blob/master/index.js */
            const top = getBoundingClientRect().top;
            const docEl = document.documentElement;
            const clientTop = docEl.clientTop || document.body.clientTop || 0;
            const offset = top + window.pageYOffset - clientTop;
            let el = document.querySelector(".tingtun_posision_label");
            let value = offset;
            if (!el.classList.contains("tingtun_config_button")) {
              value += offsetHeight;
            }
            value
            ')px;
          z-index: eval('
            /* get first CSS positioned ancestor of position element and ensure
             * that our z-index is larger.
             * (It may be better to find the *last* positioned ancestor. Or out of
             * all positioned ancestors, find the highest z-index and use that +
             * 1.) */
             let z = 100003;
             let el = document.querySelector(".tingtun_posision_label");
             do {
               if (el.classList.contains("termer-focus")) continue;
               let position = window.getComputedStyle(el).position;
               if (position !== "static") break;
             } while (el = el.parentElement);

             if (el) {
               z = Math.max(z, (window.parseInt(window.getComputedStyle(el).zIndex) || 0) + 1);
             }
             z.toString()
          ');

          left: eval('
            /* p is the popup container element */
            const p = document.querySelector("#tingtun_move_handler_tooltip");
            const docWidth = document.documentElement.offsetWidth;
            /* midpoint of label (x axis), measured in document px from the left
             * (offsetWidth, getBoundingClientRect() & style refers to the element
             * in the element query, which has been loaded into the context using
             * the JS with() statement)
             *
             * Offsetwidth is a rounded integer. If more precision is needed, use
             * instead element.getBoundingClientRect().
             */
            let labelWidth;
            if (offsetWidth) {
              labelWidth = offsetWidth;
            } else {
              const fontSizePx = parseInt(window.getComputedStyle(p).fontSize, 10);
              const ems = parseFloat(style.marginLeft);
              labelWidth = Math.abs(ems) * fontSizePx;
            }

            /* Find the offset, even when absolute positioning has been used.
             * From https://github.com/timoxley/offset/blob/master/index.js.
             */
            const left = getBoundingClientRect().left;
            const docEl = document.documentElement;
            const clientLeft = docEl.clientLeft || document.body.clientLeft || 0;
            const offsetLeft = left + docEl.scrollLeft - clientLeft;

            const pWidth = p.getBoundingClientRect().width;
            const labelMidpoint = offsetLeft + labelWidth/2;
            const rightPoint = labelMidpoint + pWidth/2 + 1;

            var m;
            if (rightPoint < docWidth) {
              m = Math.max(window.pageXOffset, labelMidpoint - pWidth/2);
            } else {
              /* calculate offset from the right edge */
              m = Math.max(window.pageXOffset, docWidth - pWidth);
            }
            m
            ')px;
        }
      }

      // Adds semi-transparent white overlay to the left, right and below the
      // popup
      @element '.iframe-container-outer.wien' {
        .iframe-container-outer::after {
          width: eval('document.documentElement.offsetWidth;')px;
          left: -eval('offsetLeft;')px;
        }
      }
    `
    this.MutationDetector.start()
    document.head.appendChild(style)
    this.MutationDetector.stop()
    // ensure that the inserted EQCSS style is loaded by EQCSS.
    // EQCSS.load()
    let parsedStyle = EQCSS.parse(style.innerHTML)
    EQCSS.register(parsedStyle)
  }

  postMessage () {
    if (this.popupLoaded) {
      this.sendMessage(arguments)
    } else {
      this.enqueueMessage(arguments)
    }
  }

  enqueueMessage (message) {
    this.messageQueue.push(message)
  }

  sendQueuedMessages () {
    let message
    while (message = this.messageQueue.shift()) {
      this.sendMessage(message)
    }
  }

  sendMessage (message) {
    const iframe = this.popup.querySelector('iframe')
    iframe.contentWindow.postMessage(...message)
  }

  open (url, positionElement) {
    this.init()
    this.load(url)
    this.show(positionElement)
  }

  // This is just for the vue page to be running on the site
  openHidden(url) {
    this.init()
    this.load(url)
  }

  // returns false if the popup was not closed
  // returns true if the popup was closed
  close () {
    if (!this.popup || this.popupClosed) {
      return false
    }

    // hide our popup
    this.hide()
    this.popupClosed = true
    return true
  }

  cleanUpPositionElement() {
    if (this.positionElement) {
      const el = this.positionElement
      // clear the focus from the old position element
      el.classList.remove('tingtun_posision_label')
      if (el.dataset.temp && el.parentElement) {
        this.MutationDetector.stop()
        const parent = el.parentElement
        el.parentElement.removeChild(el)
        parent.normalize()
        this.MutationDetector.start()
      }
    }
  }

  hide () {
    const popup = this.popup
    const innerPopup = popup.children[0]
    const positionElement = this.positionElement
    // Return focus to the position element if our iframe is currently active.
    if (document.activeElement === popup.querySelector('iframe')) {
      positionElement.focus()
    }

    // Because CSS transitions are enabled, this causes a transition
    // from the current size to 0.

    // save the current dimensions, in order to know what size to use when
    // the popup is displayed again
    const height = parseInt(innerPopup.style.height)
    if (height) {
      this.previousExpandedDimensions.height = height
    }
    popup.style.width = '0px'
    this.setSize({height: 0})
  }

  init () {
    if (this.popup) {
      return null
    }

    // Creates an container div to hold the iframe. At first it is hidden. Later
    // it is revealed.
    // The initial values for width/height must be set for transitions to work.
    const html = `
    <div id="tingtun_popup_inner_wrapper"
         class="iframe-container-inner popup-transition"
         style="height:0px">
      <iframe id="tingtun_tooltip"
              title="Termer Definition Iframe"
              name="${this.name}"
              scrolling="yes"
              frameborder="0"
              src="about:blank">
      </iframe>
    </div>
    `

    const popup = document.createElement('div')
    popup.id = this.name
    popup.classList.add('iframe-container-outer')
    popup.classList.add('popup-transition')

    /*
     * The display-none class is added because of an visual bug
     * that can be seen on: https://co-creation.mobile-age.eu/
     * You have to remove the class and use chrome.
     */
    popup.classList.add('display-none')
    popup.style.visibility = 'hidden'
    popup.innerHTML = html
    this.MutationDetector.stop()
    document.body.appendChild(popup)
    this.MutationDetector.start()
    this.popup = popup

    if (this.appStyle === 'wien') {
      popup.classList.add('wien')
    }

    popup.querySelector('iframe').addEventListener('load', () => {
      this.popupLoaded = true
      this.sendQueuedMessages()
    })

    popup.addEventListener('transitionend', event => {
      // Always stop tracking transitions.
      // We used to do this only when propertyName was width or height, but
      // sometimes that failed because the only transitionend event was for
      // opacity.
      this.eqcssStopTrackingTransition()
      if (event.propertyName === 'height') {
        const height = parseInt(getComputedStyle(event.target).height)
        if (height === 0) {
          popup.style.visibility = 'hidden'
          this.cleanUpPositionElement()
        } else {
          const scrollingElement = scrollParent(
            this.positionElement,
            { dimension: 'x' }
          )
          const bottom = popup.getBoundingClientRect().bottom
          const { height: viewportHeight } = getViewportDimensions()
          if (bottom > viewportHeight) {
            const amount = bottom - viewportHeight
            try {
              scrollingElement.scrollBy({ top: amount, behavior: 'smooth' })
            } catch (e) {
              // Safari/IE11
              scrollingElement.scrollBy(0, amount)
            }
          }
        }
      }
    })
  }

  load (url) {
    let iframe = this.popup.querySelector('iframe')
    if (iframe.src === 'about:blank') {
      iframe.src = url
    } else {
      iframe.contentWindow.postMessage({
        msg: 'location',
        location: '' + url
      }, '*')
    }
  }

  show (positionElement) {
    this.cleanUpPositionElement()
    this.positionElement = positionElement
    // Place the popup
    this.positionPopup(positionElement)

    // Show the popup
    this.revealIFrame()
    this.popupClosed = false
  }

  positionPopup (positionElement) {
    positionElement.classList.add('tingtun_posision_label')
  }

  scaleWidth (scale) {
    const popupInner = this.popup.children[0]
    if (!popupInner) return
    const currentValue = getComputedStyle(popupInner)['--my-scale']
    if (currentValue !== scale) {
      this.eqcssTrackTransition()
      popupInner.style.setProperty('--my-scale', scale)
    }
  }

  setSize (geometrics) {
    const popup = this.popup.children[0]
    const height = geometrics.height
    let changed = false

    if (typeof height === 'number') {
      const currentHeight = parseInt(popup.style.height)
      const changedHeight = currentHeight !== height
      changed = changed || changedHeight
      if (changedHeight) {
        popup.style.height = height + 'px'
      }
    }

    if (changed) {
      this.eqcssTrackTransition()
    }

    return changed
  }

  revealIFrame () {
    this.popup.style.width = ''
    const popup = this.popup.children[0]
    // popup.offsetHeight // force recalculation of style
    popup.parentElement.classList.remove('display-none')
    // Reveal the popup only if size has been changed.
    // We mustn’t start the transition before there is something to show.
    const changed = this.setSize(this.previousExpandedDimensions)
    if (changed) {
      popup.parentElement.style.visibility = 'visible'
    }
    // move focus to the iframe
    setTimeout(() => {
      // In Firefox 74, focus wouldn’t move unless this statement was wrapped in
      // setTimeout.
      popup.querySelector('iframe').focus({ preventScroll: true })
    }, 0)
  }

  eqcssTrackTransition () {
    // We need to run EQCSS.apply() manually to recalculate the popups position
    if (!eqcssWatch) {
      eqcssWatch = true
      window.requestAnimationFrame(function f () {
        EQCSS.apply()
        if (eqcssWatch) {
          window.requestAnimationFrame(f)
        }
      })
    }
  }

  eqcssStopTrackingTransition () {
    // Perform a final EQCSS calculation before stopping (a Safari browser in a
    // slow VM had issues with getting the final position correct.)
    EQCSS.apply()
    eqcssWatch = false
  }

  // Handler for the ‘iframe-size’ message
  // Triggers the popup:resize event
  iframeSizeMessageHandler (evt) {
    if (evt.data && evt.data.msg && evt.data.msg === 'iframe-size' &&
        evt.data.name === this.name) {
      let geometrics = {
        height: evt.data.heightPx
      }
      document.dispatchEvent(new CustomEvent('popup:resize', {detail: {geometrics}}))
    }
  }
}
