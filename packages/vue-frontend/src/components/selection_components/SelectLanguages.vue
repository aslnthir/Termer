<license>
  Vertraulich
</license>

<template>
<div>
  <div
    class="open-close-button focusHighlight">
    {{ this.label }}
  </div>
  <language-selector
    v-if="!edit"
    v-on="$listeners"
    :existingLanguages="existingLanguages"
    :unavailableLanguages="unavailableLanguages"
    :languageDescriptors="languageDescriptors"
    :selected="selectedLanguages"
    :changeValue="changeValue"
  ></language-selector>
  <show-languages
    v-else
    @click="changeEdit"
    :selectedLanguages="selectedLanguages"
    :languageDescriptors="languageDescriptors"
  ></show-languages>
</div>
</template>

<script>
import LanguageSelector from '@/components/selection_components/LanguageSelector'
import ShowLanguages from '@/components/selection_components/ShowLanguages'

export default {
  props: {
    label: String,
    selectedLanguages: Array,
    languageDescriptors: Object,
    existingLanguages: Array,
    unavailableLanguages: {
      default: () => new Set()
    },
    changeValue: String,
    edit: Boolean
  },
  components: {
    LanguageSelector,
    ShowLanguages
  },
  methods: {
    changeEdit () {
      this.$emit('update:edit')
    }
  }
}
</script>

<style scoped lang="sass">
.open-close-button
  border-bottom: thin solid var(--border-color)
  padding-bottom: 0.3em
  margin-bottom: 0.3em
  user-select: none

.menu-arrow
  display: inline-block
  width: 14px
  height: 14px
  transition: transform 0.1s

.menu-arrow-down
  transform: rotate(90deg)
</style>
