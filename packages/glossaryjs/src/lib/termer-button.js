/*
 * Vertraulich
 */

import { i18n } from 'glossarylib'
import { getSite } from './utils'
import '../../static/css/termerButtonStyle.css'

import BaseTermerButton from './base-termer-button'

export default class TermerButton extends BaseTermerButton {
  constructor (state, replaceElement) {
    super()
    const tabindex = replaceElement.dataset.tabindex ? replaceElement.dataset.tabindex : 0
    const titleText = this.getTitleText(state)
    const extraClass = state === 'on' ? 'tingtun_config_button_active' : ''
    const buttonHTML = `
      <button class="tingtun_config_button ${extraClass}"
              id="tingtun_config_button"
              tabindex="${tabindex}"
              title="${titleText}">
        TERMER
      </button>
      <div id="TransOverlay" class="TransOverlay displayNone">
        Fetching data
        <div id="TermerLoader" class="TermerLoader spinner displayNone">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    `
    this.button = this.placeButtonOnPage(buttonHTML, replaceElement)
    this.setUpEventHandlers(this.button)
  }

  toggleOff() {
    super.toggleOff()
    this.button.title = this.getTitleText('off')
    this.button.classList.remove('tingtun_config_button_active')
  }

  toggleOn() {
    super.toggleOn()
    this.button.title = this.getTitleText('on')
    this.button.classList.add('tingtun_config_button_active')
  }

  getTitleText (state) {
    const titleTexts = {
      default: {
        on: `${i18n.__('Configure Tingtun Termer. Status: ON ' +
        '\nDouble-click the button to toggle ON/OFF')}`,
        off: `${i18n.__('Configure Tingtun Termer. Status: OFF ' +
        '\nDouble-click the button to toggle ON/OFF')}`
      },
      hovedredningssentralen: {
        on: `${i18n.__('Search concepts from rescue and preparedness. ' +
        '\nDouble-click the button to toggle ON/OFF')}`,
        off: `${i18n.__('Search concepts from rescue and preparedness. ' +
        '\nDouble-click the button to toggle ON/OFF')}`
      },
      insitu: {
        on: `${i18n.__('Search concepts from rescue and preparedness. ' +
        '\nDouble-click the button to toggle ON/OFF')}`,
        off: `${i18n.__('Search concepts from rescue and preparedness. ' +
        '\nDouble-click the button to toggle ON/OFF')}`
      }
    }
    let site = getSite()
    if (!(site in titleTexts)) site = 'default'
    return titleTexts[site][state]
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
          this.emit('openconfig')
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
