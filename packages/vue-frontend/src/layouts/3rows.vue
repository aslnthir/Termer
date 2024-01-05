<template>
  <div id="layout">
    <header ref="header">
      <slot name="header"></slot>
    </header>
    <div id="scrollContainer">
      <main ref="main">
        <slot name="main"></slot>
      </main>
      <footer ref="footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script>
import eventBus from '@/eventbus'
import debounce from 'lodash/debounce'
export default {
  created () {
    eventBus.$on('requestResize', this.sendIframeSizeAsync)
  },
  methods: {
    sendIframeSizeAsync: debounce(function () {
      this.sendIframeSize()
    }, 24),
    sendIframeSize () {
      if (!this.$isInFrame()) {
        return
      }

      if (!this.$refs.main || !this.$refs.main.children ||
        this.$refs.main.children.length <= 0) {
        return
      }

      const children = Array.from(this.$refs.main.children)

      let mainHeight = 0
      children.forEach(x => { mainHeight += x.scrollHeight })
      const heightPx = this.$refs.header.scrollHeight +
        this.$refs.footer.scrollHeight +
        mainHeight +
        2 // A little extra, in order to hide the scrollbar.

      const message = {
        msg: 'iframe-size',
        heightPx,
        name: window.name
      }
      window.parent.postMessage(message, '*')
    }
  }
}
</script>

<style lang="sass" scoped>
main
  // IE11 requires flex-shrink (the middle value) to be 0,
  // otherwise the element won’t be tall enough and the footer floats
  // up, obscuring the contents.
  flex: 1 0 auto
  // Adds space between the content and the window/screen edge even when at max
  // width.
  padding-left: .8em
  padding-right: .8em
  display: flex
  flex-direction: column

#layout
  display: flex
  flex-direction: column
  height: 100%
  margin: 0 auto
  overflow: hidden
  background-color: var(--termer-main-background)

#scrollContainer
  display: flex
  flex-direction: column
  flex: 1 1 100%
  overflow-y: auto
</style>
