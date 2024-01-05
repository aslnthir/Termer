  <license>
  Vertraulich
</license>

<template>
  <div id="selectcontainer">
    <div class="rightAligned">
      <label>
        {{ $t('Hide unselected languages') }}:
        <input type="checkbox"
          id="showSources"
          class="focusHighlight"
          v-model="editLanguages">
      </label>
    </div>
    <div class="languageSelectors" v-if="selectedSelection.includes('language')">
      <from-language
        :edit="editLanguages"
        :languages="sourcesConceptLanguages"
        @update:edit="changeEdit"
        @update-event="eventUpdate"></from-language>
      <div class="splitBorder"></div>
      <to-language
        :edit="editLanguages"
        :languages="sourcesDescriptionLanguages"
        @update:edit="changeEdit"
        @update-event="eventUpdate"></to-language>
    </div>
    <div v-if="selectedSelection.includes('domain')">
      <hr>
      <domain-select
        @update-event="eventUpdate"
      >
      </domain-select>
    </div>
    <div v-if="selectedSelection.includes('source')">
      <hr>
      <div v-if="showSourceSelection">
        <source-selector
          :selectedSources="this.selectedSources"
          :allSources="sources"
          :selectedFromLanguages="selectedFromLanguages"
          :selectedToLanguages="selectedToLanguages"
          :userDeselectedSources="userDeselectedSources"
          :glossaryOrderById="glossaryOrderById"
          :mandatoryOnSources="mandatorySourcesOn"
          @update-event="eventUpdate">
        </source-selector>
      </div>
      <div v-else-if="!showSourceSelection">
        <button type="button" name="button" @click="toggleShowSources">{{ $t('Show Sources') }}</button>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
import eventBus from '../eventbus'
import { mapState } from 'vuex'
import fromLanguage from '@/components/selection_components/FromLanguages'
import toLanguage from '@/components/selection_components/ToLanguages'
import sourceSelector from '@/components/selection_components/SourceSelector'
import domainSelect from '@/components/selection_components/DomainSelect'
export default {
  name: 'glossary-select',
  props: ['config', 'openSourceSelection'],
  components: {
    fromLanguage,
    toLanguage,
    sourceSelector,
    domainSelect
  },
  data () {
    return {
      editLanguages: false,
      showSources: false,
      hideButtonPressed: false,
      hideUnslectedLanguages: false
    }
  },
  computed: {
    showSourceSelection () {
      if (!this.hideButtonPressed && this.openSourceSelection) {
        return true
      } else {
        return this.showSources
      }
    },
    selectedSelection () {
      if (this.fullSiteConfig && 'selectionParts' in this.fullSiteConfig) {
        return this.fullSiteConfig.selectionParts
      } else {
        return [
          'language',
          'source'
        ]
      }
    },
    options () {
      const options = this.sources/* .filter(x => {
        console.log(this.sourcesFilterd)
        return this.sourcesFilterd.includes('' + x.id)
      }) */
      return options
    },
    sourcesConceptLanguages () {
      const langs = new Set([].concat.apply([],
        Object.values(this.sources).map(x => {
          return Object.keys(x.data.inputLanguages)
        })
      ))
      const langaugesFilterd = Object.values(this.supportedLanguages).filter(x => langs.has(x.code))
      return langaugesFilterd
    },
    sourcesDescriptionLanguages () {
      const selectedSourceLangauges = this.selectedFromLanguages
      const langs = new Set([].concat.apply([], Object.values(this.sources).map(x => {
        let list = []
        for (const lang of selectedSourceLangauges) {
          if (lang in x.data.inputLanguages) {
            list = list.concat(x.data.inputLanguages[lang])
          }
        }
        return list
      })))
      const langaugesFilterd = Object.values(this.supportedLanguages).filter(x => langs.has(x.code))
      return langaugesFilterd
    },
    ...mapState([
      'supportedLanguages']),
    ...mapState('Termer', ['selectedSources', 'sources', 'selectedFromLanguages',
      'selectedToLanguages', 'glossaryOrderById', 'userDeselectedSources',
      'mandatorySourcesOn', 'fullSiteConfig'])
  },
  methods: {
    changeEdit () {
      this.editLanguages = !this.editLanguages
      eventBus.$emit('requestResize')
    },
    toggleShowSources () {
      this.showSources = !this.showSourceSelection
      this.hideButtonPressed = true
      eventBus.$emit('requestResize')
    },
    eventUpdate (eventData) {
      this.$store.dispatch('Termer/updateTermerCoreModel', eventData)
    }
  }
}
</script>

<style lang="sass" scoped>
#selectcontainer
  margin: 0 auto
  user-select: none

.languageSelectors
  display: flex

.splitBorder
  margin-right: 0.2em
  margin-left: 0.2em
  width: 0
  border-right: 1px solid

.hideButton
  float: left

.rightAligned
  text-align: right
</style>
