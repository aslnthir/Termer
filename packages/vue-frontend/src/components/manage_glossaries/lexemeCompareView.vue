<license>
  Vertraulich
</license>

<template>
<div class="lexemeContainer">
  <div class="matchesData">
    <div v-show="show">
      <span v-for="(match, index) in matches" :key="lexemeId+index" class="">
        <div class="lexemeMatch">
          <div v-for="lexeme in match.lexemes" :key="lexemeId+lexeme"
          class="termsContainer">
            <div class="termData">
              <div class="lexemeForms">
                <span v-for="form in lexemes[lexeme].forms" :key="lexeme+form">
                  {{form}}
                </span>
              </div>
              {{$t('Score')}}: {{match.score}}<br>
              {{$t('Glossary')}}: {{glossary.displayname}}
            </div>
          </div>
        </div>
      </span>
    </div>
  </div>
</div>
</template>

<script>
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
      }).sort((a, b) => {
        if (a.score < b.score) return -1
        if (a.score > b.score) return 1
        return 0
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
.termsContainer
  display: flex

.lexemeContainer
  display: flex

.termData
  flex: 3

.lexemeTermData
  flex: 1

.lexemeMatch
  margin-bottom: 0em
  border-top: solid thin black
  border-bottom: solid thin black

.lexemeMatch:last-child
  border-bottom: none

.lexemeData
  margin-right: 1em
  width: 50%

.matchesData
  max-height: 6em
  overflow: auto
  width: 100%

h4
  margin: 0
  text-align: center
</style>
