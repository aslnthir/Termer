<license>
  Vertraulich
</license>

<template>
<div class="lexemeContainer">
  <div class="lexemeData">
    <div class="termContainer">
      <div class="termBox">
        <span v-for="term in this.lexemes[this.lexemeId].forms" :key="term + lexemeId">
          <term-view
            :term="term">
          </term-view>
        </span>
        {{$t('Glossary')}}: {{glossary.displayname}}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import termView from '@/components/manage_glossaries/termView'
import { mapState } from 'vuex'
// import levenshtein from 'js-levenshtein'
// Damerau–Levenshtein distance
export default {
  name: 'lexemeView',
  props: ['lexemeId', 'lexemeList', 'showAll'],
  data () {
    return {
    }
  },
  components: {
    termView
  },
  computed: {
    show () {
      return (this.lexemeId in this.lexemeList &&
         this.lexemeList[this.lexemeId].length > 0) || this.showAll
    },
    glossary () {
      const compId = this.lexemeId.split('/')
      return this.glossaries[compId[0] + '/' + compId[1] + '/' + this.lexemes[this.lexemeId].glossary]
    },
    matches () {
      return this.lexemeList[this.lexemeId].map(x => {
        const lexemes = x.lexemesMatch.filter(x => x !== this.lexemeId)
        const score = x.score
        return {
          lexemes,
          score
        }
      })
    },
    ...mapState('Termer', ['lexemes', 'glossaries'])
  },
  methods: {
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.lexemeContainer
  display: flex

.lexemeData
  margin-right: 1em
  display: flex

.termContainer
  margin-left: 1em

.matchesData
  max-height: 6em
  overflow: auto
  width: 50%
</style>
