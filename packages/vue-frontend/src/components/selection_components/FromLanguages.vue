<license>
  Vertraulich
</license>

<template>
<div class="language-selector-container">
  <select-languages
    v-on="$listeners"
    :title="titleText"
    :label="$t('Source language')"
    :selectedLanguages="selectedLanguages"
    :languageDescriptors="supportedLanguages"
    :existingLanguages="existingSourceLanguages"
    changeValue="ConceptLanguage"
    :edit="edit"
  ></select-languages>
</div>
</template>

<script>
import SelectLanguages from './SelectLanguages'
import { mapState } from 'vuex'

export default {
  name: 'from-language',
  props: [
    'edit'
  ],
  data () {
    return {
      titleText: this.$t('Set source language for search concept. Note that language settings will filter the available sources.')
    }
  },
  components: {
    SelectLanguages
  },
  computed: {
    existingSourceLanguages () {
      // set of all language codes that exist on one or more source.
      const sources = Object.values(this.sources)
      // console.log('sources', sources)
      let langs = sources.reduce((acc, x) => {
        for (const code of Object.keys(x.data.inputLanguages)) acc.add(code)
        if (this.debug) {
          console.log('FromLanguages: ', x.data, Object.values(x.data.inputLanguages))
        }
        return acc
      }, new Set())
      langs = [...langs].sort()
      // console.log('langs', langs)
      return langs
    },
    selectedLanguages () {
      // sorted list of language codes that are selected and exist on one or more source.
      return this.selectedFromLanguages.filter(
        x => this.existingSourceLanguages.includes(x)
      ).sort()
    },
    ...mapState('Termer', ['sources', 'selectedFromLanguages',
      'supportedLanguages', 'debug'])
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.language-selector-container
  height: 100%
  width: 50%
</style>
