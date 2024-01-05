<license>
  Vertraulich
</license>

<template>
  <div class="infoBox">
    <div class="infoText">
      <p>{{ $t('Enter a phrase in the search window to look up definitions or translations from the selected sources. You can change the sources under the «Selected lookup sources».') }}</p><br><br>
      <p>{{ $t('To lookup words from the lookup result you can select a piece of text like you do to copy it, and press the enter-key.') }}</p><br><br>
      <div class="text-align: center"><lookup-help-text></lookup-help-text></div><br>
      <p>{{ $t('To use the lookup from a PDF document, click «PDF Viewer» on the bottom of the page.') }}</p><br><br>
      <br>
    </div>
  </div>
</template>

<script>
import lookupHelpText from './LookupHelpText'
export default {
  name: 'search-template-text',
  components: {
    lookupHelpText
  },
  computed: {
  },
  watch: {
  },
  methods: {
  }
}
</script>

<style lang="sass" scoped>
img
  width: 50em

.image
  text-align: center

.infoBox
  text-align: center
  margin-top: 2em

.infoText
  border: thin solid
  padding: 2em
  border-radius: 2em
  background-color: white
  display: inline-block
  max-width: 55em
  text-align: left

.leftAlign
  text-align: left

.imageBox
  margin-bottom: 3em
  border: thin solid
  display: inline-block
</style>
