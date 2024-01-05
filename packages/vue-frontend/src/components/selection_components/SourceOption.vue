<license>
  Vertraulich
</license>

<template>
  <div
  :class="{sourceOptionSpanContainer: true,
      selectedSource: isSelected && !disabled,
      mandatorySource: disabled,
      displayNone: showAllSources && !isSelected && !disabled}">
    <div class="topClass">
      <div class="flexClass">
        <span
          :title="selectTitle"
          :class="{dataElm: true,
          whiteFocus: isSelected,
          blackFocus: !isSelected}"
          @click="change(source)"
          @keyup.enter="change(source)">
          <input
          :class="{whiteFocus: isSelected,
          blackFocus: !isSelected}"
          type="checkbox" :checked="1 ? isSelected : false"
          :disabled="mandatoryOn">
          <span :class="{selectedColor: isSelected && !mandatoryOn}">
              {{source.displayname}}
          </span>
        </span>
        <span
          :title="wordlistTitle"
          v-if="source.markupWords"
          :class="{wordlistMarkingWhite: isSelected && !mandatoryOn}">
          <format-list-bulleted />
        </span>
        <span class="sourceButtons">
          <button
            type="button"
            name="button"
            :class="{whiteFocus: isSelected,
            blackFocus: !isSelected}"
            :title="detailsText"
            @click="changeShowDetails">
            <span class="menu-arrow" :class="{ 'menu-arrow-down': false }">
              <chevron-down width="14" height="14" viewBox="5 5 14 14" aria-hidden="true" />
            </span>
          </button>
          <span :class="{
            handle: !disabled,
            whiteText: isSelected && !disabled
          }">
            <button @click="moveUp(source)"
              class="moveHandler"
              :class="{ moveHandlerSelected: isSelected }"
              :title="moveUpOrderTitle"
              :id="source.id + '_up'"
              :disabled="disabled">
              <chevron-double-up width="14" height="14" viewBox="5 5 14 14" aria-hidden="true" />
            </button>
            <button @click="moveDown(source)"
              class="moveHandler"
              :class="{ moveHandlerSelected: isSelected }"
              :title="moveDownOrderTitle"
              :id="source.id + '_down'"
              :disabled="disabled">
              <chevron-double-down width="14" height="14" viewBox="5 5 14 14" aria-hidden="true" />
            </button>
          </span>
        </span>
      </div>
      <div class="sourceDetails" v-if="loadDetails" v-show="showDetails">
        <div class="">
          {{source.description}}<br>
          {{ $t('Source') }}: <a :href="sourceFixedUrl">{{sourceFixedUrl}}</a>
          <hr>
          <div class="showLang" :class="{showLang: true}">
            <div class="headingLanguages">
              <div class="dataElm">
                {{ $t('Glossaries') }}
              </div>
              <label>
                {{ $t('Hide unselected glossaries') }}:
                <input type="checkbox" v-model="checkedStatus">
              </label>
            </div>
            <div class="selectGlossaryWarrning" v-show="showGlossarySelectText">
              <alert-outline width="14" height="14" viewBox="5 3 14 23" aria-hidden="true" />
              {{ selectGlossaryText }}
              <alert-outline width="14" height="14" viewBox="5 3 14 23" aria-hidden="true" />
            </div>
              <div class="languageListing">
                <glossary-selector
                  v-on="$listeners"
                  :sourceId="source.termerId"
                  :glossaries="this.source.glossaries"
                  :sourceSelected="isSelected"
                  :selectedSources="selectedSources"
                  :userDeselectedSources="userDeselectedSources"
                  :selectedToLanguages="selectedToLanguages"
                  :selectedFromLanguages="selectedFromLanguages"
                  :mandatoryOn="mandatoryOn"
                  :showUnselected="showUnselected">
                </glossary-selector>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import eventBus from '../../eventbus'
import glossarySelector from '@/components/selection_components/GlossarySelector'
import FormatListBulleted from 'mdi-vue/FormatListBulleted'
import ChevronDown from 'mdi-vue/ChevronDown'
import AlertOutline from 'mdi-vue/AlertOutline'
import ChevronDoubleDown from 'mdi-vue/ChevronDoubleDown'
import ChevronDoubleUp from 'mdi-vue/ChevronDoubleUp'

export default {
  name: 'source-option',
  props: [
    'selected',
    'disabled',
    'showAllSources',
    'glossariesSelected',
    'source',
    'selectedToLanguages',
    'selectedFromLanguages',
    'selectedSources',
    'userDeselectedSources',
    'mandatoryOn'
  ],
  data () {
    return {
      componentSelected: false,
      showDetails: false,
      loadDetails: false,
      showUnselected: false,
      showSelectGlossaryWarrning: false,
      toChhangeValue: 'DescriptionLanguage',
      fromChangeValue: 'ConceptLanguage',
      wordlistTitle: this.$t('Source used for autocomplete and concepts highlight.'),
      detailsText: this.$t('Details'),
      selectGlossaryText: this.$t('Need to select one glossary to activate this source'),
      selectTitle: this.$t('Click to select or deselect the source'),
      moveDownOrderTitle: this.$t('Drag and drop to change the ranking of the glossary. Or click the double arrows to move one position up or down in the ranking.'),
      moveUpOrderTitle: this.$t('Drag and drop to change the ranking of the glossary. Or click the double arrows to move one position up or down in the ranking.')
    }
  },
  components: {
    glossarySelector,
    FormatListBulleted,
    ChevronDown,
    AlertOutline,
    ChevronDoubleDown,
    ChevronDoubleUp
  },
  created () {
    this.componentSelected = this.selected
  },
  computed: {
    sourceFixedUrl () {
      if (this.source.url.includes('{{searchTerm}}')) {
        return this.source.url.replace('{{searchTerm}}', '')
      } else return this.source.url
    },
    checkedStatus: {
      get: function () {
        return this.showUnselected
      },
      set: function (checked) {
        this.showUnselected = checked
        eventBus.$emit('requestResize')
      }
    },
    selectedGlossaries () {
      if (!this.isSelected) return []
      return this.source.glossaries.filter(x => {
        for (var glossary of this.selectedSources[this.source.termerId]) {
          if (glossary.id === x.id) return true
        }
        return false
      })
    },
    isSelected () {
      return this.componentSelected
      // .includes(this.source.id)
    },
    selectedParent () {
      return this.selected
    },
    fromLanguages () {
      return Object.keys(this.source.inputLanguages)
    },
    toLanguages () {
      return [].concat.apply([], Object.values(this.source.inputLanguages))
    },
    selectedTolangauges () {
      if (this.langsSelected) {
        return Object.values(this.langsSelected).map(x => Array.from(x)).flat()
      } else if (Object.keys(this.selectedSources).includes(this.source.termerId.toString())) {
        return this.selectedToLanguages
      } else {
        return []
      }
    },
    selectedFromlanguages () {
      if (this.langsSelected) {
        return Object.keys(this.langsSelected)
      } else if (Object.keys(this.selectedSources).includes(this.source.termerId.toString())) {
        return this.selectedFromLanguages
      } else {
        return []
      }
    },
    showGlossarySelectText () {
      const gotGlossary = this.source.glossaries.some(x => {
        return this.selectedToLanguages.includes(x.sourceLanguage) &&
          this.selectedFromLanguages.includes(x.targetLanguage)
      })
      return !gotGlossary && !this.isSelected &&
        this.source.glossaries.length > 1 && this.showSelectGlossaryWarrning
    },
    ...mapState('Termer', ['supportedLanguages'])
  },
  methods: {
    change (source) {
      if (this.mandatoryOn) return
      if (this.isSelected) {
        this.componentSelected = false
        this.$emit('update-event', {
          type: 'Termer/userDeselectSource',
          value: this.source.termerId
        })
        // this.$store.dispatch('Termer/userDeselectSource', this.source.termerId)
        const glossIds = []
        this.source.glossaries.forEach((glossary) => {
          const glossaryId = this.source.termerId + '/' + glossary.id
          glossIds.push(glossaryId)
        })
        this.$emit('update-event', {
          type: 'Termer/removeUserSelectedSourceGlossary',
          value: glossIds
        })
        // this.$store.dispatch('Termer/removeUserSelectedSourceGlossary', glossIds)
        this.$emit('update-event', {
          type: 'Termer/removeUserDeselectedSourceGlossary',
          value: glossIds
        })
        // this.$store.dispatch('Termer/removeUserDeselectedSourceGlossary', glossIds)
      } else if (!source.available) {
        if (source.glossaries.length > 1) {
          this.showSelectGlossaryWarrning = true
          this.changeShowDetails()
        } else {
          const glossaryId = this.source.termerId + '/' + source.glossaries[0].id
          this.$emit('update-event', {
            type: 'Termer/addUserSelectedSourceGlossary',
            value: [glossaryId]
          })
          this.componentSelected = true
          // this.$store.dispatch('Termer/addUserSelectedSourceGlossary', [glossaryId])
        }
      } else {
        this.componentSelected = true
        const glossIds = []
        this.source.glossaries.forEach((glossary) => {
          const glossaryId = this.source.termerId + '/' + glossary.id
          glossIds.push(glossaryId)
        })
        this.$emit('update-event', {
          type: 'Termer/userSelectSource',
          value: this.source.termerId
        })
        this.$emit('update-event', {
          type: 'Termer/removeUserSelectedSourceGlossary',
          value: glossIds
        })
        this.$emit('update-event', {
          type: 'Termer/removeUserDeselectedSourceGlossary',
          value: glossIds
        })
      }
    },
    changeShowDetails () {
      this.showDetails = !this.showDetails
      if (!this.showDetails) this.showSelectGlossaryWarrning = false
      this.loadDetails = true
      eventBus.$emit('requestResize')
    },
    toLanguagesDict (fromLanguage) {
      return Object.values(this.supportedLanguages).filter(x => this.source.inputLanguages[fromLanguage].includes(x.code))
    },
    orderArray (array) {
      const newArray = [...new Set(array)]
      return newArray.sort()
    },
    moveUp (element) {
      this.$emit('moveUp', element)
    },
    moveDown (element) {
      this.$emit('moveDown', element)
    }
  },
  watch: {
    selectedParent (newVal, oldVal) {
      if (this.componentSelected !== newVal) {
        this.componentSelected = newVal
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>

.sourceDetails
  background: var(--termer-main-background)
  padding: 0.2em
  margin: 0.2em
  border-radius: 0.2em
  border: solid thin

.showLang
  margin-top: 0.2em
  padding: 0.2em
  border-radius: 0.2em

.headFromLangView
  padding: 0.2em
  min-width: 44px

.subLang31
  flex: 1
  column-gap: 0.5em
  background: var(--termer-main-background)
  padding: 0.2em
  border-radius: 0.2em

.subLang3
  display: flex
  flex-wrap: wrap

.toLangViewHead
  margin-bottom: 0.2em

.toLangView
  padding-left: 0.2em
  padding-right: 0.2em
  background: var(--termer-choice-background-disabled)
  white-space: nowrap
  width: fit-content
  border-radius: 0.2em

.dataElm
  flex: 1

.whiteFocus:focus
  outline: solid thin var(--button-outline-focus-invert)

.blackFocus:focus
  outline: thin solid var(--button-outline-focus)

.selectedColor
  color: var(--invert-text-color)
  background: var(--termer-choice-background-selected)

.flexClass
  display: flex

.languageListing
  background: var(--termer-main-background)
  display: flex
  color: var(--text-color)

.splitBorder
  margin-right: 0.2em
  margin-left: 0.2em
  width: 0
  border-right: 1px solid var(--termer-choice-background-disabled)

.selectedBorder
  border-color: var(--termer-choice-background-selected)

.headingLanguages
  display: flex
  background: var(--termer-main-background)
  margin-bottom: 3px
  color: var(--text-color)

.fromHeading
  padding: 0.2em

.toHeading
  padding: 0.2em

.languageHorizontalDivider
  height: 3px

.wordlistMarkingWhite
  color: var(--invert-text-color)

.menu-arrow
  display: inline-block
  width: 14px
  height: 14px
  transition: transform 0.1s

.menu-arrow-down
  transform: rotate(90deg)

.mdi-format-list-bulleted
  position: relative
  top: 2px

.selectGlossaryWarrning
  text-align: center
  background: var(--information-box-color)
  border: solid var(--termer-disable-boder)
  border-radius: 0.5em
  color: var(--text-warrning)

.sourceButtons
  display: contents

.sourceOptionSpanContainer
  background: var(--information-box-color)
  padding: 0.1em
  border-radius: 0.2em
  border: solid thin
  padding-right: 0em
  &:not(:last-child)
    margin-bottom: 0.5em

.selectedSource
  background: var(--termer-choice-background-selected)

.mandatorySource
  background: var(--termer-choice-background-disabled)

.displayNone
  display: none

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

.whiteText
  color: var(--invert-text-color)
</style>
