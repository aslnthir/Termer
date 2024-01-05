<license>
  Vertraulich
</license>

<template>
<div class="content">
  <span class="defItem">
    <div class="defData">
      <div class="definitionGloss" v-html="definition.gloss">
      </div>
      {{$t('Glossary')}}: {{glossary.displayname}}
    </div>
  </span>
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

.defItem
  display: flex

.definitionMeta
  flex: 1

.defData
  flex: 3

.leftBorder
  border-left: 1px solid black

.definitionMatchContent
  border: thin solid black

h4
  margin: 0
  text-align: center
</style>
