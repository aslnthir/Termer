<template>
  <div id="defaultcontainer">
    <div>
      <select @change="onChange" v-model="selectedLanguage" :title="title">
        <option v-for="languageName, language in languageStrings" :value="language" :key="language">
          {{ languageName }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'changeWebsiteLanguage',
  props: [],
  data () {
    return {
      languageStrings: {
        en: this.$t('English'),
        nb: this.$t('Norwegian'),
        es: this.$t('Spanish')
      },
      title: this.$t('Change language for Termer')
    }
  },
  computed: {
    ...mapGetters('Language', ['getLanguage']),
    selectedLanguage () {
      const selected = localStorage.getItem('siteUiLanguage')
      if (selected !== null) {
        return selected
      }
      const browserLanguage = this.$i18n.locale()
      const isLanguageSelectable = this.languageStrings[this.$i18n.locales()] !== undefined
      if (!isLanguageSelectable) {
        console.log('test')
        this.onChange({ target: { value: 'en' } })
        return 'en'
      }
      console.log(browserLanguage, selected, isLanguageSelectable)
      return browserLanguage
    }
  },
  methods: {
    onChange (event) {
      localStorage.setItem('siteUiLanguage', event.target.value)
      location.reload()
    }
  }
}
</script>

<style lang="sass" scoped>
select
  margin-top: 0.4em
</style>
