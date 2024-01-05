<license>
  Vertraulich
</license>

<template>
<div class="entry">
  <h3 v-if="lexemeId in lexemes"
    tabindex="0"
    @keypress.enter.prevent="changeShowInflected"
    @keypress.space.prevent="changeShowInflected"
    @click="changeShowInflected">
    <!-- Lemmas for this entry -->
    <span v-if="hideShorthand">
      <span
        v-for="(lemma, index) in searchTermList"
        :key="index"
        :title="buttonText"
        :class="{lemmaSpan: !onlyOneTerm}">
        {{ lemma }}
        <span v-if="!onlyOneTerm">
          {{ showMoreSign }}
        </span><!--
   --></span>
    </span>
    <span v-if="showInflected">
      <span v-for="(lemma, index) in lexemeListRest" :key="index">
        <template v-if="index !== 0">, </template>{{ lemma }}<!--
   --></span>
      <span v-if="inflexions.length > 0">
          (<span v-for="(lemma, index) in inflexions" :key="index">
            <template v-if="index !== 0">, </template>{{ lemma }}<!--
          --></span>)<!--
    --></span>
      {{ showMoreSign }}
    </span>

  </h3>

  <template v-if="lexemeId in lexemeDefinitions">
    <ul v-if="Object.keys(lexemeDefinitions[lexemeId]).length > 1">
      <li v-for="definitionId in lexemeDefinitions[lexemeId]" :key="definitionId">
        <definition
          :definitionId="definitionId"
          :wordlist="wordlist"
          :regexes="regexes"
          :lemmas="lexemes[lexemeId].lemmas"
          />
      </li>
    </ul>
    <definition v-else
        :definitionId="lexemeDefinitions[lexemeId][0]"
        :wordlist="wordlist"
        :regexes="regexes"
        :lemmas="lexemes[lexemeId].lemmas"
        />
  </template>
</div>
</template>

<script>
import Definition from './Definition'
import { mapState } from 'vuex'

export default {
  name: 'entry',
  components: {
    Definition
  },
  data: function () {
    return {
      showInflected: false,
      underMaxLength: true
    }
  },
  props: {
    lexemeId: {
      required: true
    },
    wordlist: {
      required: true
    },
    regexes: {
      required: true
    },
    sourceName: {
      required: false
    }
  },
  computed: {
    hideShorthand () {
      if (this.showInflected) {
        return this.underMaxLength
      } else {
        return true
      }
    },
    showMoreSign () {
      if (!this.showInflected) {
        return '+'
      } else {
        return '-'
      }
    },
    inflexions () {
      const forms = this.lexemes[this.lexemeId].forms
      if (forms && this.lexemeList) {
        return forms.filter(x => !this.lexemes[this.lexemeId].lemmas.includes(x))
      } else {
        return []
      }
    },
    buttonText () {
      if (!this.onlyOneTerm) {
        if (this.showInflected) {
          return this.$t('Hide lexeme')
        } else {
          return this.$t('Show lexeme')
        }
      } else {
        return this.$t('Lexeme')
      }
    },
    onlyOneTerm () {
      let terms = this.lexemes[this.lexemeId].forms
      if (!terms) terms = this.lexemes[this.lexemeId].lemmas
      return terms.length === 1
    },
    otherForms () {
      const forms = this.lexemes[this.lexemeId].forms
      return forms.filter(x => x !== this.searchTerm).length > 0
    },
    searchTermList () {
      return this.lexemeList
    },
    lexemeList () {
      if (!(this.lexemeId in this.lexemes)) return []
      let lemmaList = this.lexemes[this.lexemeId].forms
      if (!lemmaList) lemmaList = this.lexemes[this.lexemeId].lemmas
      const filterd = lemmaList.filter(x => x === this.searchTerm)
      let returnList
      if (filterd && filterd.length > 0) {
        returnList = filterd
      } else {
        returnList = [this.lexemes[this.lexemeId].lemmas[0]]
      }
      return this.maxStringLength(returnList)
    },
    lexemeListRest () {
      return this.lexemes[this.lexemeId].lemmas
        .filter(x => !this.lexemeList.includes(x))
    },
    underLimit () {
      if (!(this.lexemeId in this.lexemes)) return []
      let lemmaList = this.lexemes[this.lexemeId].forms
      if (!lemmaList) lemmaList = this.lexemes[this.lexemeId].lemmas
      return lemmaList.join().length < 16 || lemmaList.length === 1
    },
    linkTitle () {
      return this.$t('Go to ') + this.sourceName + this.$t(' search results')
    },
    ...mapState('Termer', ['lexemes', 'lexemeDefinitions', 'searchTerm'])
  },
  methods: {
    changeShowInflected () {
      this.showInflected = !this.showInflected
    },
    maxStringLength (stringArray) {
      return stringArray.map(x => {
        if (x.length > 50) {
          this.underMaxLength = false
          return x.substring(0, 50) + '...'
        } else {
          return x
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.entry
  hyphens: auto
  text-align: left
h3
  font-size: 100%
  font-weight: bold
  margin: 0
.lexemeButton
  padding: 2px
.lemmaSpan
  cursor: pointer
</style>
