<license>
  Vertraulich
</license>

<template>
  <div class="">
    {{ $t('No results found for ') }} <q>{{ term }}</q>.
    <div class="" v-show="showDidYouMean">
      <br><br>
      {{ $t('Did you mean') }}:
      <span
        v-for="item in didYouMeanList"
        :key="item"
        >
        <span
          :title="$t('Description of concept')"
          class="tingtun_label"
          role="button"
          tabindex="0"
        >{{ item }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import levenshtein from 'js-levenshtein'

export default {
  name: 'noSearchResult',
  props: ['term'],
  data () {
    return {
    }
  },
  computed: {
    didYouMeanList () {
      return this.glossaryDidYouMean.concat(this.showClosestWord)
    },
    showClosestWord () {
      return this.calculateLev()
    },
    wordlistsLoaded () {
      return this.wordlist.loaded
    },
    showDidYouMean () {
      return this.wordlistsLoaded && this.didYouMeanList && this.didYouMeanList.length > 0
    },
    glossaryDidYouMean () {
      if (!this.searchDidYouMean[this.searchTerm]) return []
      return Object.entries(this.searchDidYouMean[this.searchTerm]).map(
        ([key, value]) => {
          if (this.selectedSourcesCompIds.includes(key)) {
            return value
          } else return []
        }
      ).flat()
    },
    selectedSourcesCompIds () {
      return Object.entries(this.selectedSources).map(([key, value]) => {
        return value.map(x => key + '/' + x.id)
      }).flat()
    },
    ...mapState('Termer', ['wordlist', 'searchDidYouMean', 'searchTerm', 'selectedSources'])
  },
  methods: {
    calculateLev () {
      let topScore = 5
      const scoreObj = {}
      if (!this.wordlist.wordlist) return []
      this.wordlist.wordlist.forEach(word => {
        const score = levenshtein(this.term.toLowerCase(), word.toLowerCase())
        const score2 = score / word.length
        if (score2 <= 0.25 && word && this.term.toLowerCase() !== word.toLowerCase()) {
          if (!(score in scoreObj)) scoreObj[score] = []
          scoreObj[score].push(word)
          if (topScore > score) topScore = score
        }
      })
      if (topScore in scoreObj) {
        return [...new Set(scoreObj[topScore])].slice(0, 4)
      }
      return []
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.tingtun_label
  box-shadow: inset 0 -2.2px 0 #58b3c3
  cursor: pointer
  pointer-events: auto
  margin-right: 1em
  &:hover
    background-color: #fffde9
    box-shadow: inset 0 0 0 1px #18587b
</style>
