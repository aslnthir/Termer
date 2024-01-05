<license>
  Vertraulich
</license>

<template>
  <div id="pbt_button"
    class="pbt_button">
    <input type="checkbox" id="pbtmodelwindow" v-model="pbtCheckboxValue">
    <div :class="{pbt_button: true, lookupBoxPosition: lookupWindow}">
      <label for="pbtmodelwindow"
        :title="labelTitle"
        id="feedbackLabel"
        :class="{pbtimgbutton: true, bottomHeight: cssUpFromBottom}">
          {{ $t('Feedback') }}
      </label>
    </div>
    <div class="pbtmodal">
      <label :title="closeLabel" for="pbtmodelwindow" class="closebtn"><div class="close_x">X</div></label>
      <div id="pbtFrameContainer" v-html="pbtIframe"></div>
    </div>
    <div :style="heightStyle">
    </div>
    <a class="pbthidden" target="_blank" href="https://tallgrafikk.tingtun.no/">{{ $t('Feedback') }}</a>
  </div>
</template>

<script>
import eventBus from '../eventbus'

export default {
  data () {
    return {
      baseUrl: 'https://feedback.termer.tingtun.no/',
      labelTitle: this.$t('Send feedback to help improve the service'),
      iframeTitle: this.$t('Feedback on accessibility problem - Public barrier tracker'),
      iframeID: 'iframeFeedbackID',
      closeLabel: this.$t('Close window'),
      pbtCheckboxValue: null,
      higth: 0,
      refUrl: window.location.href
    }
  },
  mounted () {
    window.addEventListener('message', e => {
      var FeedBackiFrame = document.getElementById(this.iframeID)
      if (e.data === 'sendiFrameHeightDecreaseMessage') {
        FeedBackiFrame.height = 0
      } else if (e.data === 'sendiFrameHeightIncreaseMessage') {
        FeedBackiFrame.height = '500'
      }
    })
  },
  computed: {
    cssUpFromBottom () {
      if (window.top === window.self) return true
      if (window.name === 'termer-pdf-popup') return true
      return false
    },
    pbtIframe () {
      // We’re dynamically recreating the iframe every time to avoid inserting
      // extra entries in the session history every time the iframe src url
      // changes.
      const iframeUrl = this.baseUrl + '?ref=' + encodeURI(this.refUrl)
      return `<iframe id="${this.iframeID}" title="${this.iframeTitle}"
        src="${iframeUrl}" scrolling="no">
      </iframe>`
    },
    heightStyle () {
      if (this.higth > 0) {
        return 'height: ' + this.higth + 'px;'
      } else {
        return ''
      }
    },
    lookupWindow () {
      return window.location.pathname.includes('/lookup/')
    }
  },
  components: {
  },
  watch: {
    pbtCheckboxValue: function (newVal, oldVal) {
      if (newVal) {
        const newHeight = 300 - window.innerHeight
        if (newHeight > 0) this.higth = newHeight
      } else {
        this.higth = 0
      }
      eventBus.$emit('requestResize')
    },
    $route: function (newV, oldV) {
      this.refUrl = window.location.href
    }
  }
  /*
  <img class="ma-logo" src="/static/images/mobile-age-logo.png"></img>
  */
}
</script>

<style lang="sass">
#pbtFrameContainer iframe
  width: 100%
  min-width: 30em
  border: none
  overflow: hidden

  @media only screen and (min-width: 501px)
    min-height: 16em

  @media only screen and (max-width: 500px)
    min-height: 16em
</style>

<style lang="sass" scoped>
.closebtn
  text-decoration: none
  font-size: 20px
  font-weight: bold
  color: #000
  position: absolute
  right: 0
  margin-right: 0.3em

.pbtmodal
  /* The modal's background */
  display: none
  z-index: 9001
  padding: 0.3em
  background: #fff
  border-radius: 1em
  border: solid var(--pbt-border)
  box-shadow: 5px 10px 5px var(--pbt-box-shadow)

  @media only screen and (max-width: 500px)
    min-width: 20em

  @media only screen and (min-width: 501px)
    min-width: 30em

/* Hide */
#pbtmodelwindow
  opacity: 0

  /* Display the modal when checked */
  &:checked ~ .pbtmodal
    display: block
    @media only screen and (max-width: 500px)
      right: 36px
      bottom: 70px

    @media only screen and (min-width: 501px)
      right: 25px
      bottom: 100px

  &:focus + .pbt_button .pbtimgbutton
    outline: solid thin var(--pbt-button-focus-outline)

  &:hover ~ .pbtimgbutton
    color: var(--pbt-button-hover)

.bottomHeight
  right: calc(50% - 60px) !important

.pbtimgbutton
  background-color: var(--pbt-button-background-color)
  border-radius: 4px
  border: 1px solid var(--pbt-button-border-color)
  overflow: auto
  padding: 0.2em
  display: inline-block
  &:hover
    color: var(--pbt-button-hover)

  @media only screen and (min-width: 501px)
    display: inline
    top: unset
    right: 25px
    margin: 4px
    padding: 0.5em

.lookupBoxPosition
  position: absolute
  bottom: 0px
  right: 20px

.return_link
  display: none

.closebtn
  text-decoration: none
  font-size: 20px
  font-weight: bold
  color: var(--pbt-close-color)
  position: absolute
  right: 0
  margin-right: 0.3em

.close_x
  border: solid thin
  border-radius: 3em
  padding-right: 0.3em
  padding-left: 0.3em
  display: inline

.close_x:hover
  background-color: var(--pbt-button-hover)

.pbthidden
  display: none

.pbttext
  color: var(--text-color)
  display: inline
  padding: 0.2em
  background: var(--information-box-color)
  font-size: 24.5px
  font-weight: bold
  border: solid
  border-radius: 0.4em
  border-color: var(--border-color)

.pbt_button
  display: inline-block

.button_margin
  margin: 15em

.tiny_button
  width: 25px

#feedbackLabel
  padding: 1px
  padding-top: 5px
</style>
