<license>
  Vertraulich
</license>

<template>
  <div>
    <div class="flexClass">
      <div class="flexElem">
        <t-button
        class="custom-button"
        :title="sortButtonTitle"
        @click="sortSourcesAlphabetic()">{{ $t('Sort') }}</t-button>
        <span :class="{elementToFadeInAndOut: clicked, hidden: !clicked}">
            {{ $t('Sorted') }}
          </span>
      </div>
      <label>
        {{ $t('Hide unselected sources') }}:
        <input type="checkbox" id="showSources" class="focusHighlight" v-model="checkedStatus">
      </label>
    </div>
    <input class="sourceFilterInput focusHighlight"
      v-model="searchString"
      :placeholder="placeholderText" />
    <div class="sourceSelectorContainer">
      <div>
        <draggable v-model="sortedAvalebilityList" handle=".handle">
          <source-option
            v-on="$listeners"
            v-for="item in sortedAvalebilityList"
            :key="item.termerId"
            :source="item"
            :glossariesSelected="selectedSources[item.termerId]"
            :selected="isSelected(item)"
            :disabled="isDisabled(item)"
            :showAllSources="showAllSources"
            :selectedToLanguages="selectedToLanguages"
            :selectedFromLanguages="selectedFromLanguages"
            :userDeselectedSources="userDeselectedSources"
            :selectedSources="selectedSources"
            :mandatoryOn="mandatoryOn(item)"
            @moveUp="moveUp"
            @moveDown="moveDown">
          </source-option>
        </draggable>
      </div>
      <div>
        <draggable v-model="sortedAvalebilityList" handle=".handle">
          <source-option
            v-on="$listeners"
            v-for="item in sortedAvalebilityList"
            :key="item.termerId"
            :source="item"
            :glossariesSelected="selectedSources[item.termerId]"
            :selected="isSelected(item)"
            :disabled="isDisabled(item)"
            :showAllSources="showAllSources"
            :selectedToLanguages="selectedToLanguages"
            :selectedFromLanguages="selectedFromLanguages"
            :userDeselectedSources="userDeselectedSources"
            :selectedSources="selectedSources"
            :mandatoryOn="mandatoryOn(item)"
            @moveUp="moveUp"
            @moveDown="moveDown">
          </source-option>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
import sourceOption from '@/components/selection_components/SourceOption'
import eventBus from '@/eventbus'
import draggable from 'vuedraggable'

export default {
  name: 'source-selector',
  props: [
    'selectedSources',
    'allSources',
    'selectedFromLanguages',
    'selectedToLanguages',
    'glossaryOrderById',
    'userDeselectedSources',
    'setShowAll',
    'mandatoryOnSources'
  ],
  data () {
    return {
      searchString: '',
      showAllSources: false,
      loadAllSources: false,
      listChangeFocus: '',
      sortButtonTitle: this.$t('Sort the the list of sources in an alphabetical order.'),
      clicked: false,
      sortButtonCalled: false
    }
  },
  components: {
    sourceOption,
    draggable
  },
  mounted () {
    if (!localStorage.getItem('sortButtonCalled')) {
      this.sortSourcesAlphabetic()
      localStorage.setItem('sortButtonCalled', 'true')
    }
  },
  computed: {
    checkedStatus: {
      get: function () {
        return this.showAllSources
      },
      set: function (checked) {
        this.showAllSources = checked
        this.loadAllSources = true
        eventBus.$emit('requestResize')
      }
    },
    placeholderText () {
      return this.$t('Search for source')
    },
    sortedAvalebilityList: {
      get: function () {
        return this.sortedAvalebility
      },
      set: function (newList) {
        const ids = newList.filter(x =>
          !this.mandatoryOnSources.includes(x.termerId)
        ).map(source => {
          return [...source.glossaries].sort(this.propComparator(source.termerId)).map(gloss => {
            return source.termerId + '/' + gloss.id
          })
        }).flat()
        this.$emit('update-event', {
          type: 'Termer/setUserGlossaryOrderById',
          value: ids
        })
      }
    },
    sortedAvalebility () {
      let newArray = Object.entries(this.allSources).map(([id, { data }]) => {
        const obj = data
        obj.termerId = id
        return obj
      })
      newArray.forEach(item => {
        item.available = this.sourceAvaleble(item)
      })
      if (this.searchString.length > 0) {
        newArray = newArray.filter(x => {
          const a = x.displayname.toLowerCase()
          const b = this.searchString.toLowerCase()
          return a.includes(b)
        })
      }
      return newArray.sort(this.sortGlossaryIds)
    },
    mandatoryGlossOrder () {
      const newOrder = this.glossaryOrderById.filter(x => {
        const parts = x.split('/')
        const sourceId = parts[0] + '/' + parts[1]
        return !this.mandatoryOnSources.includes(sourceId)
      })
      const mandatoryOrder = []
      this.mandatoryOnSources.forEach((source, i) => {
        if (!(source in this.allSources)) return
        this.allSources[source].data.glossaries.forEach((item, i) => {
          mandatoryOrder.push(
            this.allSources[source].data.termerId + '/' + item.id
          )
        })
      })
      // Object lookup is faster that Array.indexOf
      const hashMap = mandatoryOrder
        .concat(newOrder)
        .reduce((acc, item, index) => {
          acc[item] = index
          return acc
        }, {})
      return hashMap
    }
  },
  methods: {
    compare (a, b) {
      const glossaryAId = a.sourceName + '/' + a.id
      const glossaryBId = b.sourceName + '/' + b.id
      const indexA = this.glossaryOrderById.indexOf(glossaryAId)
      const indexB = this.glossaryOrderById.indexOf(glossaryBId)
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
    },
    propComparator (prop) {
      const _this = this
      return function (a, b) {
        a.sourceName = prop
        b.sourceName = prop
        return _this.compare(a, b)
      }
    },
    sortSourcesAlphabetic () {
      const sortedArray = this.sortedAvalebility.slice().sort((a, b) => {
        const aKey = a.displayname
        const bKey = b.displayname
        return aKey.localeCompare(bKey)
      })
      this.sortedAvalebilityList = sortedArray
      this.clicked = true
      setTimeout(() => { this.clicked = false }, 10000)
    },
    moveUp (element) {
      const index = this.sortedAvalebility.indexOf(element)
      if (index > 0) {
        const newIndex = index - 1
        const otherElement = this.sortedAvalebility[newIndex]
        const startArray = this.sortedAvalebility.slice(0, newIndex)
        const endArray = this.sortedAvalebility.slice(newIndex)
        const newArray = startArray.concat([element, otherElement]).concat(endArray)
        this.sortedAvalebilityList = newArray
      }
    },
    moveDown (element) {
      const index = this.sortedAvalebility.indexOf(element)
      this.listChangeFocus = element.termerId + '_down'
      if (index < this.sortedAvalebility.length - 1) {
        const newIndex = index + 1
        const otherElement = this.sortedAvalebility[newIndex]
        const startArray = this.sortedAvalebility.slice(0, index)
        const endArray = this.sortedAvalebility.slice(index)
        const newArray = startArray.concat([otherElement, element]).concat(endArray)
        this.sortedAvalebilityList = newArray
      }
      window.setTimeout(() => {
        // Losses focus because of list change, need to set it back
        document.getElementById(this.listChangeFocus).focus()
      }, 1)
    },
    sortGlossaryIds (object1, object2) {
      const index2 = this.sortedSourceIndex(
        object2
      )
      const index1 = this.sortedSourceIndex(
        object1
      )
      let reutnrVal = 0
      if (index2 === -1) reutnrVal = -1
      else if (index1 === -1) reutnrVal = 1
      else if (index1 < index2) reutnrVal = -1
      else if (index2 < index1) reutnrVal = 1
      return reutnrVal
    },
    sortedSourceIndex (sourceObject) {
      let lowestIndex = Infinity
      sourceObject.glossaries.forEach(item => {
        const glossaryId = sourceObject.termerId + '/' + item.id
        const index1 = this.mandatoryGlossOrder[glossaryId]
        if (index1 < lowestIndex) {
          lowestIndex = index1
        }
      })
      return lowestIndex
    },
    change (source) {
      const newSelected = this.selectedSources.filter(x => x).map(x => x.id + '')
      if (newSelected.includes(source.id + '')) {
        const index = newSelected.indexOf(source.id + '')
        newSelected.splice(index, 1)
      } else {
        newSelected.push(source.id + '')
      }
      if (newSelected.length && source.available) {
        this.$emit('update-event', {
          type: 'selectSources',
          value: newSelected
        })
        // this.$store.dispatch('selectSources', newSelected)
      }
    },
    sourceAvaleble (source) {
      if (this.selectedFromLanguages.length === 0 && this.selectedToLanguages.length === 0) return true
      let tl = Object.keys(source.inputLanguages)
      let fl = [].concat.apply([], Object.values(source.inputLanguages))
      tl = this.selectedFromLanguages.filter(x => tl.includes(x))
      fl = this.selectedToLanguages.filter(x => fl.includes(x))
      let avaleble = false
      if (tl.length > 0 && fl.length > 0) {
        for (const y of tl) {
          if (y in source.inputLanguages &&
              this.selectedToLanguages.filter(x => source.inputLanguages[y].includes(x)).length > 0) {
            avaleble = true
            break
          }
        }
      } else if ((tl.length > 0 || fl.length > 0) && !(this.selectedFromLanguages.length > 0 && this.selectedToLanguages.length > 0)) {
        avaleble = true
      }
      return avaleble
    },
    isSelected (source) {
      return Object.keys(this.selectedSources).includes(source.termerId)
    },
    isDisabled (source) {
      if (this.mandatoryOnSources) {
        return this.mandatoryOnSources.includes(source.termerId)
      } else {
        return false
      }
    },
    mandatoryOn (source) {
      if (this.mandatoryOnSources) {
        return this.mandatoryOnSources.includes(source.termerId)
      } else {
        return false
      }
    },
    changeshowAllSources () {
      this.showAllSources = !this.showAllSources
    }
  },
  created () {
    if (this.setShowAll) {
      this.checkedStatus = true
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$searchFieldBorderRadius: 3px

.sourceSelectorContainer
  max-height: 20em
  overflow-y: auto
  border-radius: 0.2em
  border: solid thin var(--border-color)

.flexElem
  flex: 1

.flexClass
  display: flex

.sourceListHeadline
  text-align: center
  font-weight: bold
  text-decoration: underline
  margin: 0

.unavailableSource
  border: 1px solid var(--termer-disable-boder)

.hidden
  display: none

.elementToFadeInAndOut
  opacity: 0
  animation: fade 10s linear 1 forwards

@keyframes fade
  0%
    opacity: 0
  5%
    opacity: 1
  95%
    opacity: 1
  100%
    opacity: 0
.sourceFilterInput
  width: 100%
  margin-top: 0.5em
  margin-bottom: 0.2em
  height: 3em
  border: 1px solid var(--select-border-color)
  border-radius: $searchFieldBorderRadius
  font-size: inherit
  padding-left: 6px
  background-color: var(--text-box-background)
  color: var(--text-box-color)
  &:placeholder
    color: var(--text-box-color-placeholder)

</style>
