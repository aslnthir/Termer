<license>
  Vertraulich
</license>

<template>
  <a-button
    @click.prevent="closeWindow"
    :title="$t('Close window')"
    id="close-button">
      <span aria-hidden="true">
        <close height="2em" width="2em" aria-hidden="true" />
      </span>
  </a-button>
</template>

<script>
import AButton from './AButton'
import Close from 'mdi-vue/Close'
export default {
  name: 'close-button',
  components: {
    AButton,
    Close
  },
  methods: {
    closeWindow () {
      window.parent.postMessage({
        msg: 'iframe-blur',
        name: window.name
      }, '*')
      // parent.postMessage({ msg: 'closeConfig' }, '*')
    }
  }
}
</script>

<style lang="sass" scoped>
span
  // overflow: the default in IE is hidden, which causes line-height:0 to hide
  // the element.
  overflow: visible
</style>
