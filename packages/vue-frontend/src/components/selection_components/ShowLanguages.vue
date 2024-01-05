<license>
  Vertraulich
</license>

<template>
  <div class="">
    <span
      v-if="selectedLanguages.length === 0"
      class="textAllSelected"
      >{{ $t('No languages selected') }}</span>
    <label v-for="(lang,index) in selectedLanguages" :key="index">
      <span :title="titleText(lang)">
        {{lang}}<template v-if="index+1 < selectedLanguages.length">, </template>
      </span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'show-language',
  props: [
    'selectedLanguages',
    'languageDescriptors'
  ],
  methods: {
    titleText (lang) {
      return this.languageDescriptors[lang].name +
      (
        this.languageDescriptors[lang].nativeName
          ? ' (' + this.languageDescriptors[lang].nativeName + ')'
          : ''
      )
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.shonLanguages
  columns: 3

.textAllSelected
  display: block
  min-width: max-content

.defaultClass
  background-color: #18587b
  color: white
  padding-left: 0.3em
  padding-right: 0.3em
  border-radius: 0.2em
  margin-left: 0.3em
  margin-right: 0.3em
  display: table
  word-break: break-word
  min-width: 3.5em
  min-height: 21px

input
  width: auto
  margin-left: 0
  display: table-cell

.text
  text-align: center
  display: table-cell
  width: 100%

.size
  margin-right: 0.2em
  min-width: 2.4em
  display: inline-block
</style>
