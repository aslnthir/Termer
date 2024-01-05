<license>
  Vertraulich
</license>

<template>
  <t-button
    :title="$t('Open PDF')"
    @click="click"
    style="margin-left: 1em"
    type="button">
    <span v-if="!iconButton">PDF Viewer</span>
    <img style="height: 1.7em; vertical-align: bottom"
    v-else src="../views/assets/images/PDF-icon.png"
    :alt="$t('Open PDF')" />
  </t-button>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PdfButton',
  props: ['iconButton', 'openPage'],
  methods: {
    click () {
      if (this.openPage) {
        this.$emit('openPdfViewer')
      } else {
        const message = {
          msg: 'openPdfViewer'
        }
        parent.postMessage(message, '*')
        parent.postMessage({ msg: 'closeConfig' }, '*')
      }
    }
  },
  ...mapState(['Conf'])
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.imageButton
  padding: 0
  display: inline-flex
  align-items: center
  margin-left: 1em

.button
  height: 100%
  padding-left: 1em
  padding-right: 1em
  display: inline-flex
  align-items: center

.image
  width: 21.5px
  margin-left: 0.3em

.imageIconOnly
  width: 40px

</style>
