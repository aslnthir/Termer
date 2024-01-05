<license>
  Vertraulich
</license>

<template>
<div class="content">
  <div class="matchResults">
    <div v-show="show">
      <span v-for="(item, index) in sortedDefinitionsCompared" :key="definitionId+index">
        <div class="definitionMatchContent">
          <div class="content">
            <div class="defData">
              <div class="definitionGloss" v-html="item.text">
              </div>
              {{$t('Score')}}: {{item.score}}<br>
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
  name: 'definitionView',
  props: ['definitionId', 'definitionsCompared', 'showAll', 'lexemeId'],
  data () {
    return {
    }
  },
  components: {
  },
  computed: {
    show () {
      return this.showAll || this.definitionScore.length > 0
    },
    glossary () {
      const compId = this.lexemeId.split('/')
      return this.glossaries[compId[0] + '/' + compId[1] + '/' + this.lexemes[this.lexemeId].glossary]
    },
    definition () {
      return this.definitions[this.definitionId]
    },
    sortedDefinitionsCompared () {
      if (!this.definitionsCompared) return []
      return this.definitionsCompared.map(x => x).sort((a, b) => {
        if (a.score < b.score) return -1
        if (a.score > b.score) return 1
        return 0
      })
    },
    definitionScore () {
      // if (this.definitionsCompared)
      return []
    },
    ...mapState('Termer', ['definitions', 'lexemes', 'glossaries'])
  },
  methods: {
    getDefinitionId (idString) {
      return idString.split('/')[2]
    },
    getSourceid (idString) {
      return idString.split('/')[1]
    },
    getBackendId (idString) {
      return idString.split('/')[0]
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  display: flex

.matchResults
  width: 100%
  max-height: 6em
  overflow: auto

.definitionMeta
  flex: 1

.defData
  flex: 3

.leftBorder
  border-left: 1px solid black

.definitionMatchContent
  border-top: thin solid black
  border-bottom: thin solid black

h4
  margin: 0
  text-align: center
</style>
