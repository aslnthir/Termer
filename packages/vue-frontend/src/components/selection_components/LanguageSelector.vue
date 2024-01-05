<license>
  Vertraulich
</license>

<template>
<div class="languageOptions">
  <language-choice
    v-for="id of existingLanguages"
    v-on="$listeners"
    :key="id"
    :language="languageDescriptors[id]"
    :selected="selected"
    :unavailable="unavailableLanguages.has(id)"
    :changeValue="changeValue">
  </language-choice>
</div>
</template>

<script>
import { mapState } from 'vuex'
import languageChoice from '@/components/selection_components/LanguageChoice'
export default {
  name: 'langauge-selector',
  props: {
    existingLanguages: Array,
    unavailableLanguages: Set, // languages that cannot be selected
    languageDescriptors: Object, // all language names
    changeValue: String,
    selected: Array
  },
  components: {
    languageChoice
  },
  computed: {
    ...mapState('Termer', ['debug'])
  },
  created: function () {
    if (this.debug) {
      console.log('(debug) languages: ', this.existingLanguages)
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
input[type=checkbox]:checked + label
  background: blue

.languageOptions
  text-align: left
</style>
