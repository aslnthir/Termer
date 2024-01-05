<license>
  Vertraulich
</license>

<template>
  <nav>
    <span class="inline-menu-item" id="back-fwd-buttons">
      <a-button id="back-button"
         :title="$t('Go back')"
         tabindex="0"
         :class="{ hidden: hideBackButton }"
         class="a-button"
         @click.prevent="$router.back()">
        <strong aria-hidden="true"><arrow-left height="2em" width="2em" aria-hidden="true" /></strong>
      </a-button>
      <a-button id="forward-button"
         :title="$t('Go forward')"
         tabindex="0"
         :class="{ hidden: hideForwardButton }"
         class="a-button forword-button"
         @click.prevent="$router.forward()">
        <strong aria-hidden="true"><arrow-right height="2em" width="2em" aria-hidden="true" /></strong>
      </a-button>
    </span>
    <span class="inline-menu-item close-button-span">
      <close-button class="a-button"></close-button>
    </span>
  </nav>
</template>

<script>
import AButton from './AButton'
import CloseButton from './CloseButton'
import ArrowRight from 'mdi-vue/ArrowRight'
import ArrowLeft from 'mdi-vue/ArrowLeft'
export default {
  name: 'frame-controls',
  components: {
    AButton,
    CloseButton,
    ArrowRight,
    ArrowLeft
  },
  data () {
    return {
      history: [],
      historyPosition: 0
    }
  },
  watch: {
    '$route' (to, from) {
      // console.log('$route', from.path, '->', to.path)
      let historyNavigated = false
      if (!this.history.length) {
        // init history
        this.history.unshift(from.path)
      }

      if (this.history[this.historyPosition] === from.path &&
          this.history[this.historyPosition + 1] === to.path) {
        // back
        historyNavigated = true
        this.historyPosition += 1
      }

      if (this.history[this.historyPosition] === from.path &&
          this.history[this.historyPosition - 1] === to.path) {
        // fwd
        historyNavigated = true
        this.historyPosition -= 1
      }

      if (!historyNavigated) {
        // clear forward history
        this.history = this.history.slice(this.historyPosition, this.history.length)
        // add the new path to history
        this.history.unshift(to.path)
        // set position at last history item
        this.historyPosition = 0
      }
    }
  },
  computed: {
    hideBackButton () {
      // console.log('hide back button', this.history, this.historyPosition)
      return this.history.length < 1 || this.historyPosition === this.history.length - 1
    },
    hideForwardButton () {
      // console.log('hide fwd button', this.history, this.historyPosition)
      return this.history.length < 1 || this.historyPosition < 1
    }
  }
}
</script>

<style lang="sass" scoped>
.hidden
  visibility: hidden

nav
  display: inline
  white-space: nowrap

.a-button
  color: black

.close-button-span
  margin-left: 0.5em

.forword-button
  margin-left: 0.5em
</style>

<style lang="sass">
body.app-style-wien nav
  display: block
  text-align: right
  .a-button
    color: #878787
  #back-fwd-buttons
    display: none

</style>
