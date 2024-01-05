<license>
  Vertraulich
</license>

<template>
<div class="language-selector-container">
  <select-languages
    v-on="$listeners"
    :title="titleText"
    :label="$t('Target language')"
    :selectedLanguages="selectedLanguages"
    :languageDescriptors="supportedLanguages"
    :existingLanguages="existingTargetLanguages"
    :unavailableLanguages="unavailableTargetLanguages"
    changeValue="DescriptionLanguage"
    :edit="edit"
  ></select-languages>
</div>
</template>

<script>
import SelectLanguages from './SelectLanguages'
import { mapState } from 'vuex'

export default {
  name: 'to-language',
  props: [
    'edit'
  ],
  data () {
    return {
      titleText: this.$t('Set target language for search results. Note that language settings will filter the available sources.')
    }
  },
  components: {
    SelectLanguages
  },
  computed: {
    unavailableTargetLanguages () {
      const sources = Object.values(this.sources)
      const targetLanguages = new Set(this.existingTargetLanguages)

      // Starting with all target languages, remove those where there exists a
      // (source, target) language code pair where the source language is selected.
      // The result is a set of target languages which cannot be selected.
      sources.forEach(source => {
        Object.entries(source.data.inputLanguages)
          .forEach(([sourceLanguageCode, targetLanguageCodes]) => {
            if (this.selectedFromLanguages.includes(sourceLanguageCode)) {
              targetLanguageCodes.forEach(code =>
                targetLanguages.delete(code)
              )
            }
          })
      })
      return targetLanguages
    },
    existingTargetLanguages () {
      const sources = Object.values(this.sources)

      let langs = sources.reduce((acc, x) => {
        const targetLanguages = Object.values(x.data.inputLanguages).flat()
        if (this.debug) {
          console.log('ToLanguages: ', x.data, Object.values(x.data.inputLanguages))
        }
        for (const langCode of targetLanguages) acc.add(langCode)
        return acc
      }, new Set())
      langs = [...langs]
      langs.sort()
      return langs
    },
    selectedLanguages () {
      return this.selectedToLanguages.filter(x =>
        this.existingTargetLanguages.includes(x) &&
        !this.unavailableTargetLanguages.has(x)
      ).sort()
    },
    ...mapState('Termer', ['sources', 'selectedFromLanguages',
      'selectedToLanguages', 'supportedLanguages', 'debug'])
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.language-selector-container
  height: 100%
  width: 50%
</style>
