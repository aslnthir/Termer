/*
 * Vertraulich
 */

import BaseTermerButton from './base-termer-button'

export default class TermerButton extends BaseTermerButton {
  constructor (state, replaceElement) {
    super()
    const tabindex = replaceElement.dataset.tabindex ? replaceElement.dataset.tabindex : 0
    const checked = state === 'on'
    const buttonHTML = `
      <span id="tingtun-config-button"
            class="inline-block"
            title="Wörterbuch Schalter. Das Wörterbuch kann Worterklärungen zu markierte Fachwörter an diese Seite liefern."
            tabindex="${tabindex}"
            role="checkbox"
            aria-checked="${checked}">
        <span id="tingtun-button-text"
              class="inline-block tingtun-has-before-after-text"
              data-text-on="AUS" data-text-off="EIN"><!--
       --><span id="tingtun-button-text-label"
                class="tingtun-button-rounded-borders inline-block"><!--
         -->Wörterbuch<!--
       --></span><!--
     --></span>
      </span>
      <style>
        #tingtun-config-button {
          cursor: pointer;
        }
        #tingtun-button-text {
          white-space: nowrap;
        }
        #tingtun-button-text-label {
          background-color: white;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .tingtun-button-rounded-borders {
          border-radius: .4em;
          border: .1em solid gray;
          padding-top: .5em;
          padding-bottom: .54em;
          padding-left: .5em;
          padding-right: .5em;
        }
        .tingtun-has-before-after-text::before, .tingtun-has-before-after-text::after {
          width: 2.8em; /* em width to fit “AUS” + surrounding space */
          display: inline-block;
          overflow: hidden;
          vertical-align: middle;
          text-align: center;
          padding-top: .5em;
          padding-bottom: .5em;
          transition-property: max-width, padding-left, padding-right;
          transition-duration: .15s;
          transition-timing-function: linear;
        }
        .tingtun-has-before-after-text::before {
          direction: rtl;
          max-width: 2.8em;
          content: attr(data-text-on);
        }
        .tingtun-has-before-after-text::after {
          max-width: 0;
          content: attr(data-text-off);
        }
        .tingtun-has-before-after-text {
          border-radius: .4em;
          background: linear-gradient(to right, #c5f5f4, #c5f5f4 50%, #ededed 50%, #ededed);
        }
        .tingtun-off::after {
          max-width: 2.8em;
        }
        .tingtun-off::before {
          max-width: 0;
        }
        .inline-block {
          display: inline-block;
        }
      </style>
    `
    this.button = this.placeButtonOnPage(buttonHTML, replaceElement)
    this.button.addEventListener ('click', () => toggle())
    this.button.addEventListener ('keydown', event => {
      // 32 is <Space>
      if((event.key === ' ' || event.keyCode === 32 ||
          event.key === 'Enter' || event.keyCode === 13) &&
         event.target === this.button) {
        event.preventDefault()
        toggle()
      }
    })

    const toggle = () => {
      if (this.button.attributes['aria-checked'].value === 'true') {
        this.toggleOff()
        this.emit('off')
      } else {
        this.toggleOn()
        this.emit('on')
      }
    }
  }

  toggleOff() {
    super.toggleOff()
    this.button.attributes['aria-checked'].value = false
    this.button.querySelector('#tingtun-button-text').classList.add('tingtun-off')
  }

  toggleOn() {
    super.toggleOn()
    this.button.attributes['aria-checked'].value = true
    this.button.querySelector('#tingtun-button-text').classList.remove('tingtun-off')
  }
}
