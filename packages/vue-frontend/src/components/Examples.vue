<license>
  Vertraulich
</license>

<template>
<div>
  <span
  @click="toggleShowExamples"
  @keypress.enter.prevent="toggleShowExamples"
  @keypress.space.prevent="toggleShowExamples"
  :title="titleText">
    <strong>
      {{$t('Examples')}} {{ showMoreSign }}
    </strong>
  </span>
  <ul v-if="showExamples">
    <li
      v-for="(example, index) in examples"
      :key="index"
      :lang="language"
      v-html="exampleText(example.text)">
    </li>
  </ul>
</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Examples',
  components: {
  },
  data: function () {
    return {
      showExamples: false
    }
  },
  props: {
    examples: {
      required: true
    },
    language: {
      required: true
    }
  },
  computed: {
    titleText () {
      if (!this.showExamples) {
        return this.$t('Show examples')
      } else {
        return this.$t('Hide examples')
      }
    },
    showMoreSign () {
      if (!this.showExamples) {
        return '+'
      } else {
        return '-'
      }
    },
    ...mapState('Termer', ['rightAlignedLanguages'])
  },
  methods: {
    toggleShowExamples () {
      this.showExamples = !this.showExamples
    },
    exampleText (text) {
      if (this.rightAlignedLanguages.includes(this.language)) {
        return '<div style="text-align: right;">' + text + '</div>'
      } else {
        return text
      }
    }
  }
}
</script>

<style lang="sass" scoped>
ul
  margin: 0

span
  cursor: pointer
</style>
