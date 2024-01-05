<license>
  Vertraulich
</license>

<template>
  <label class="labelClass" :for="glossaryId + extraIdString" v-if="hideGlossary">
    <div
      :class="{checkedElm: checkedStatus && !mandatoryOn,
        defaultClass: true,
        mandatoryGlossary: mandatoryOn
      }">
      <div class="flexClass">
        <div class="flex"
        @keyup.enter="update"
        tabindex="0">
          <input type="checkbox"
            :id="glossaryId + extraIdString"
            :disabled="mandatoryOn"
            v-model="checkedStatus">
          {{glossary.name}}
          <language-choice
            :key="glossary.sourceLanguage + 's'"
            :language="supportedLanguages[glossary.sourceLanguage]"
            :unavailable="false"
            :selected="selectedFromLanguages"
            changeValue="ConceptLanguage">
          </language-choice>
          <span class="languageDevider">/</span>
          <language-choice
            :key="glossary.targetLanguage + 't'"
            :language="supportedLanguages[glossary.targetLanguage]"
            :unavailable="false"
            :selected="selectedToLanguages"
            changeValue="DescriptionLanguage">
          </language-choice>
          <status-icon
          v-if="glossSatus"
          :status="glossSatus">
          </status-icon>
          <span class="rankHandle">
            <button
              @click="moveUp(glossary)"
              class="moveHandler"
              :class="{ moveHandlerSelected: isSelected }"
              :id="glossaryId + '_up'">
              <chevron-double-up width="14" height="14" viewBox="5 5 14 14" aria-hidden="true" />
            </button>
            <button
              @click="moveDown(glossary)"
              class="moveHandler"
              :class="{ moveHandlerSelected: isSelected }"
              :id="glossaryId + '_down'">
              <chevron-double-down width="14" height="14" viewBox="5 5 14 14" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>
    </div>
  </label>
</template>

<script>
import languageChoice from '@/components/selection_components/LanguageChoice'
import StatusIcon from '@/components/StatusIcon'
import ChevronDoubleDown from 'mdi-vue/ChevronDoubleDown'
import ChevronDoubleUp from 'mdi-vue/ChevronDoubleUp'
import { mapState } from 'vuex'

export default {
  name: 'glossary-choice',
  props: [
    'glossary',
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
      selected: false,
      showDetails: false,
      markedUp: this.glossary.selected,
      detailsText: this.$t('Details'),
      newOrderList: []
    }
  },
  components: {
    languageChoice,
    StatusIcon,
    ChevronDoubleDown,
    ChevronDoubleUp
  },
  created () {
    this.selected = this.isSelected
  },
  computed: {
    hideGlossary () {
      return this.isSelected || !this.showUnselected
    },
    compSourceId () {
      if (this.sourceId) return this.sourceId
      else if (this.glossary.termerID) {
        const x = this.glossary.termerID.split('/')
        return x[0] + '/' + x[1]
      } else return undefined
    },
    checkedStatus: {
      get: function () {
        return this.selected
      },
      set: function (checked) {
        if (!this.mandatoryOn) {
          this.selected = checked
          this.update(checked)
        }
      }
    },
    isSelected () {
      if (this.sourceId in this.selectedSources) {
        return this.selectedSources[this.sourceId].some(x => {
          return x.id === this.glossary.id
        })
      } else if (this.selectedGlossaries) {
        return this.selectedGlossaries.map(x => x.termerID)
          .includes(this.glossaryId)
      }
      return false
    },
    glossaryId () {
      return this.compSourceId + '/' + this.glossary.id.toString()
    },
    sourceRemoved () {
      return this.userDeselectedSources.includes(this.compSourceId)
    },
    glossSatus () {
      if (!this.glossaryStatus) return undefined
      return this.glossaryStatus[this.glossary.termerID]
    },
    ...mapState('Termer', ['sources', 'mandatorySourcesOn',
      'supportedLanguages', 'glossaryOrderById'])
  },
  methods: {
    moveUp (glossary) {
      const list = this.getGlossaryOrderList()
      const index = list.indexOf(this.glossaryId)
      const nextIndex = index - 1
      const withinRange = this.checkIfInsideRange(list[nextIndex])
      if (withinRange) {
        this.newOrderList = this.moveItem(index, nextIndex)
        this.$emit('update-event', {
          type: 'Termer/setUserGlossaryOrderById',
          value: this.newOrderList
        })
      }
    },
    moveDown (glossary) {
      const list = this.getGlossaryOrderList()
      const index = list.indexOf(this.glossaryId)
      const nextIndex = index + 1
      const withinRange = this.checkIfInsideRange(list[nextIndex])
      if (withinRange) {
        this.newOrderList = this.moveItem(index, nextIndex)
        this.$emit('update-event', {
          type: 'Termer/setUserGlossaryOrderById',
          value: this.newOrderList
        })
      }
    },
    checkIfInsideRange (item) {
      return item && item.startsWith(this.sourceId)
    },
    getGlossaryOrderList () {
      return this.glossaryOrderById
    },
    moveItem (from, to) {
      const data = [...this.getGlossaryOrderList()]
      // remove `from` item and store it
      var f = data.splice(from, 1)[0]
      // insert stored item into position `to`
      data.splice(to, 0, f)
      return data
    },
    setOrder () {
      let newArray = Object.entries(this.sources).map(([id, { data }]) => {
        const obj = data
        obj.termerId = id
        return obj
      })
      newArray = newArray.sort(this.sortGlossaryIds)
      const ids = newArray.filter(x =>
        !this.mandatorySourcesOn.includes(x.termerId)
      ).map(source => {
        return [...source.glossaries].sort(this.compare).map(gloss => {
          return source.termerId + '/' + gloss.id
        })
      }).flat()
      return ids
    },
    fromLanguageStyle (language) {
      let style = ''
      if (this.selectedFromLanguages.includes(language)) {
        style += ' background: white; color: black;'
      } else {
        style += ' background: lightgrey; color: black; border-color: red;'
      }
      return style
    },
    toLanguageStyle (language) {
      let style = ''
      if (this.selectedToLanguages.includes(language)) {
        style += ' background: white; color: black;'
      } else {
        style += ' background: lightgrey; color: black; border-color: red;'
      }
      return style
    },
    detailsView () {
      this.showDetails = !this.showDetails
    },
    update (status) {
      if (this.mandatoryOn) return
      if (!status) {
        if (!this.sourceRemoved) {
          this.$emit('update-event', {
            type: 'Termer/addUserDeselectedSourceGlossary',
            value: [this.glossaryId]
          })
          // this.$store.dispatch('Termer/addUserDeselectedSourceGlossary',
          // [this.glossaryId])
        }
        this.$emit('update-event', {
          type: 'Termer/removeUserSelectedSourceGlossary',
          value: [this.glossaryId]
        })
        // this.$store.dispatch('Termer/removeUserSelectedSourceGlossary',
        // [this.glossaryId])
      } else {
        this.$emit('update-event', {
          type: 'Termer/addUserSelectedSourceGlossary',
          value: [this.glossaryId]
        })
        this.$emit('update-event', {
          type: 'Termer/removeUserDeselectedSourceGlossary',
          value: [this.glossaryId]
        })
        // if (this.sourceRemoved) {
        // this.$store.dispatch('Termer/addUserSelectedSourceGlossary',
        // [this.glossaryId])
        // }
        // this.$store.dispatch('Termer/removeUserDeselectedSourceGlossary',
        // [this.glossaryId])
      }
    }
  },
  watch: {
    isSelected (newVal, oldVal) {
      if (this.selected !== newVal) {
        this.selected = newVal
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.defaultClass
  background-color: var(--information-box-color)
  padding: 0.2em
  border-radius: 0.2em
  margin: 0.5em
  border: solid thin

.checkedElm
  background-color: var(--termer-choice-background-selected)
  color: var(--invert-text-color)

.mandatoryGlossary
  background: var(--termer-choice-background-disabled)

.flexClass
  display: flex
  padding-bottom: 0.2em

.flex
  flex: 1

.menu-arrow
  display: inline-block
  width: 14px
  height: 14px
  transition: transform 0.1s

.languageDevider
  font-size: 23px
  margin-right: 2px
  vertical-align: bottom

.menu-arrow-down
  transform: rotate(90deg)

.moveHandler
  width: 1.5em
  padding: 0
  text-align: center
  border: none
  background: inherit
  color: inherit
  display: block

.moveHandler:focus
  background: var(--termer-choice-background-selected)
  color: var(--invert-text-color)

.moveHandlerSelected:focus
  background: var(--information-box-color)
  color: var(--termer-choice-background-selected)

.rankHandle
  display: inline-block
  float: right
</style>
