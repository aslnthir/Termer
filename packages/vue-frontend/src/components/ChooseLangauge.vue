<template>
<div>
  <h3>{{ $t('Select user interface language') }}</h3>
  <div class="languageSelector">
    <VueSelect
      name="languages"
      label="name"
      :options="languages"
      :value="value"
      @input="input"
      ref="select">
    </VueSelect>
  </div>
</div>
</template>

<script>
import VueSelect from './VueSelect'

export default {
  name: 'chooseLangauge',
  computed: {
    languages () {
      const languageNames = {
        en: 'English',
        de: 'Deutsch',
        nb: 'Norsk (Bokmål)'
      }
      const locales = this.$i18n.locales()
      locales.push('en')
      const x = []
      for (const code of locales) {
        const name = languageNames[code] || code
        x.push({ value: code, name })
      }
      return x
    },
    value () {
      const code = this.$store.getters['User/language'] || this.$i18n.locale()
      return this.languages.find(x => x.value === code)
    }
  },
  components: {
    VueSelect
  },
  methods: {
    input (selected) {
      if (selected === null) {
        this.$store.dispatch('User/removeLanguagePreference')
        return
      }
      const languageCode = selected.value
      if (!this.value || this.value.value === languageCode) {
        return
      }
      this.$store.dispatch('User/setLanguage', languageCode)
    }
  }
}
</script>

<style lang="sass" scoped>
h3
  margin-bottom: 0em
.languageSelector
  background: lightgray
</style>
