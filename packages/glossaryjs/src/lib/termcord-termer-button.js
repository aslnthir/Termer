/*
 * Vertraulich
 */

import { i18n } from 'glossarylib'

import BaseTermerButton from './base-termer-button'

export default class TermerButton extends BaseTermerButton {
  constructor (state, replaceElement) {
    super()
    const tabindex = replaceElement.dataset.tabindex ? replaceElement.dataset.tabindex : 0
    const titleON = `${i18n.__('Configure Tingtun Termer. Status: ON')}`
    const titleOFF = `${i18n.__('Configure Tingtun Termer. Status: OFF')}`
    const titleText = state === 'on' ? titleON : titleOFF

    const extraClass = state === 'on' ? 'tingtun_config_button_active' : ''
    const buttonHTML = `
      <button class="tingtun_config_button ${extraClass}"
              id="tingtun_config_button"
              tabindex="${tabindex}"
              title="` + titleText + `">
        TERMER
      </button>
      <div id="TransOverlay" class="TransOverlay displayNone">
        <div id="TermerLoader" class="TermerLoader spinner displayNone">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <style>
        .tingtun_config_button {
          height: 32px;
          background-position: -46px -41px;
          background-size: 242% 442%;
          background-color: white;
          color: #18587b;
          border-radius: 0.4em;
          box-shadow: none;
          cursor: pointer;
          font-size: initial;
          font-weight: bold;
          font-family: Arial, "Sans Serif";
        }

        .tingtun_config_button_active {
          background-color: #18587b;
          color: white;
        }

        .TransOverlay {
          position: relative;
          top: -32px;
          margin-bottom: -31px;
          width: 82px;
          height: 26px;
          right: 0px;
          z-index: 30;
          background: white;
          border-radius: .4em;
          border: solid #18587b;
          box-sizing: content-box;
        }
        .TermerLoader {
          position: relative;
          top: 9px;
          width: 82px;
          height: 10px;
          overflow: hidden;
          z-index: 40;
        }
        .spinner div {
          width: 10px;
          height: 10px;
          position: absolute;
          background-color: #333;
          border-radius: 50%;
          animation: move 3s infinite cubic-bezier(.2,.64,.81,.23);
        }
        .spinner div:nth-child(2) {
          animation: move 3s infinite cubic-bezier(.2,.64,.81,.23);
          animation-delay: 400ms;
        }
        .spinner div:nth-child(3) {
          animation: move 3s infinite cubic-bezier(.2,.64,.81,.23);
          animation-delay: 800ms;
        }
        .spinner div:nth-child(4) {
          animation: move 3s infinite cubic-bezier(.2,.64,.81,.23);
          animation-delay: 1000ms;
        }
        @keyframes move {
          0% {left: 0%;}
          75% {left:100%;}
          100% {left:100%;}
        }
        .displayNone {
          display: none;
        }
      </style>
    `
    this.titleON =titleON
    this.titleOFF = titleOFF
    this.button = this.placeButtonOnPage(buttonHTML, replaceElement)
    this.setUpEventHandlers(this.button)
  }

  toggleOff() {
    super.toggleOff()
    this.button.title = this.titleOFF
    this.button.classList.remove('tingtun_config_button_active')
  }

  toggleOn() {
    super.toggleOn()
    this.button.title = this.titleON
    this.button.classList.add('tingtun_config_button_active')
  }

  setUpEventHandlers (button) {
    let singleClickTimeout = null
    button.addEventListener('click', () => {
      if (singleClickTimeout) {
        clearTimeout(singleClickTimeout)
        singleClickTimeout = null
      } else {
        singleClickTimeout = setTimeout(() => {
          singleClickTimeout = null
          this.emit('opendomainconfig')
        }, 300)
      }
    })

    button.addEventListener('dblclick', () => {
      if (this.button.classList.contains('tingtun_config_button_active')) {
        this.emit('off')
      } else {
        this.emit('on')
      }
    })
  }

  addLoader() {
    document.getElementById('TransOverlay').classList.remove('displayNone')
    document.getElementById('TermerLoader').classList.remove('displayNone')
  }

  removeLoader() {
    document.getElementById('TransOverlay').classList.add('displayNone')
    document.getElementById('TermerLoader').classList.add('displayNone')
  }
}
