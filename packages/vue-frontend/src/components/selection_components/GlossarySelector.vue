<license>
  Vertraulich
</license>

<template>
<div class="glossaryOptions">
  <glossary-choice
    v-for="(glossary, index) in glossariesSorted.slice(sliceStart, sliceEnd)"
    v-on="$listeners"
    :ref="index + sliceStart + '-glossarychoice'"
    :data-index="index + sliceStart"
    @hook:mounted="observe(index + sliceStart + '-glossarychoice')"
    :glossary="glossary"
    :sourceId="sourceId"
    :sourceSelected="sourceSelected"
    :selectedSources="selectedSources"
    :selectedToLanguages="selectedToLanguages"
    :selectedFromLanguages="selectedFromLanguages"
    :userDeselectedSources="userDeselectedSources"
    :mandatoryOn="mandatoryOn"
    :extraIdString="extraIdString"
    :selectedGlossaries="selectedGlossaries"
    :glossaryStatus="glossaryStatus"
    :key="glossary.id"
    :showUnselected="showUnselected">
  </glossary-choice>
</div>
</template>

<script>
import glossaryChoice from '@/components/selection_components/GlossaryChoice'
import { mapState } from 'vuex'

const sliceOffset = 100
export default {
  name: 'glossary-selector',
  props: [
    'glossaries',
    'sourceId',
    'sourceSelected',
    'selectedSources',
    'selectedToLanguages',
    'selectedFromLanguages',
    'userDeselectedSources',
    'mandatoryOn',
    'extraIdString',
    'selectedGlossaries',
    'glossaryStatus',
    'showUnselected'
  ],
  data () {
    return {
      sliceStart: 0,
      sliceEnd: sliceOffset,
      observer: null
    }
  },
  components: {
    glossaryChoice
  },
  created () {
    // In order to reduce lagging when the list is very long, instead of
    // loading it all at once we dynamically extend it as the user scrolls
    // down.
    const options = {
      root: this.$el,
      threshold: 1.0
    }
    const self = this
    function callback (entries, observer) {
      const intersecting = entries.filter(x => x.isIntersecting)
      if (!intersecting.length) return
      const max = intersecting.reduce((acc, entry) => {
        const index = parseInt(entry.target.dataset.index)
        return Math.max(acc, index)
      }, 0)
      self.sliceEnd = max + sliceOffset
    }

    if (window.IntersectionObserver) {
      this.observer = new IntersectionObserver(callback, options)
    } else {
      // IE11 does not support IntersectionObserver
      this.sliceEnd = 99999999
    }
  },
  computed: {
    glossariesHidden () {
      if (this.showUnselected) {
        return this.glossaries.filter(glossary => {
          if (this.sourceId in this.selectedSources) {
            return this.selectedSources[this.sourceId].some(x => {
              return x.id === glossary.id
            })
          } else if (this.selectedGlossaries) {
            const glossaryId = this.sourceId + '/' + glossary.id.toString()
            return this.selectedGlossaries.map(x => x.termerID)
              .includes(glossaryId)
          }
          return false
        })
      } else {
        return this.glossaries
      }
    },
    glossariesSorted () {
      return this.glossariesHidden.map(x => {
        x.selected = false
        if (this.sourceId in this.selectedSources) {
          for (const glossary of this.selectedSources[this.sourceId]) {
            if (glossary.id === x.id) {
              x.selected = true
              break
            }
          }
        }
        return x
      }).sort(this.compare)
    },
    ...mapState('Termer', ['glossaryOrderById'])
  },
  methods: {
    observe (a, b) {
      if (this.observer) {
        this.observer.observe(this.$refs[a][0].$el)
      }
    },
    compare (a, b) {
      const glossaryAId = this.sourceId + '/' + a.id
      const glossaryBId = this.sourceId + '/' + b.id
      const indexA = this.glossaryOrderById.indexOf(glossaryAId)
      const indexB = this.glossaryOrderById.indexOf(glossaryBId)
      // console.log('sorted?', glossaryAId, indexA, a.name, glossaryBId, indexB, b.name)
      if (indexA === -1 && indexB === -1) {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
      } else if (indexA === -1) {
        return 1
      } else if (indexB === -1) {
        return -1
      } else if (indexA > indexB) {
        return 1
      } else if (indexA < indexB) {
        return -1
      }
      return 0
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.glossaryOptions
  width: 100%
</style>
