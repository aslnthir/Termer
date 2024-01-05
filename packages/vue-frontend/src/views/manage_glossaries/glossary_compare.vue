<license>
  Vertraulich
</license>

<template>
<div class="content">
  <div class="headlineBar">
    <h1>{{$t('Compare glossaries')}}</h1>
    <div class="glossaryConfigButton">
      <t-button :title="$t('Settings')" @click="openSettings">
        <settings-icon
          height="2em"
          width="2em"
          class="settings-icon"
          aria-hidden="true">
        </settings-icon>
      </t-button>
    </div>
  </div>
  <p class="introText">
    {{$t('This tool will compare the concepts and the definitions of a set of glossaries to one glossary, support harmonisation.')}}
  </p>
  <div class="glossarySelectionContainer" v-if="showGlossaryConfig">
    <div class="languageDiv">
      <div class="languageTitle">
        {{$t('Select languages for the comparison')}}
      </div>
      <div class="languageSelectors">
        <select-languages
          class="fromLanguageClass"
          :title="fromTitleText"
          :label="$t('Source language')"
          :selectedLanguages="fromSelectedLanguages"
          :languageDescriptors="supportedLanguages"
          :existingLanguages="sourcesConceptLanguages"
          changeValue="ConceptLanguage"
          :edit="editLanguages"
          @update-event="languageEventUpdate"
          @update:edit="$emit('update:edit')"
        ></select-languages>
        <div class="splitBorder"></div>
        <select-languages
          class="toLanguageClass"
          :title="toTitleText"
          :label="$t('Target language')"
          :selectedLanguages="toSelectedLanguages"
          :languageDescriptors="supportedLanguages"
          :existingLanguages="sourcesDescriptionLanguages"
          :unavailableLanguages="unavailableTargetLanguages"
          changeValue="DescriptionLanguage"
          :edit="editLanguages"
          @update-event="languageEventUpdate"
          @update:edit="$emit('update:edit')"
        ></select-languages>
      </div>
    </div>
    <div class="glossarySelectorBox">
      <div class="">
        {{$t('Select a set of glossaries')}}
      </div>
      <div class="glossaryBox">
        <glossary-selector
          :glossaries="glossariesLoadedFilterd"
          :sourceSelected="false"
          :selectedSources="[]"
          :userDeselectedSources="[]"
          :selectedToLanguages="toSelectedLanguages"
          :selectedFromLanguages="fromSelectedLanguages"
          extraIdString="source"
          :selectedGlossaries="sourceGlossary"
          :glossaryStatus="glossaryStatus"
          @update-event="eventUpdateFrom">
        </glossary-selector>
      </div>
    </div>
    <div :class="{hideSelector: !firstSelected, glossarySelectorBox: true}">
      <div class="">
        {{$t('Select one glossary to compare with')}}
      </div>
      <div class="glossaryBox">
        <glossary-selector
          :glossaries="glossariesLoadedFilterd"
          :sourceSelected="false"
          :selectedSources="[]"
          :userDeselectedSources="[]"
          :selectedToLanguages="toSelectedLanguages"
          :selectedFromLanguages="fromSelectedLanguages"
          extraIdString="target"
          :selectedGlossaries="[targetGlossary]"
          :glossaryStatus="glossaryStatus"
          @update-event="eventUpdateTo">
        </glossary-selector>
      </div>
    </div><br>
  </div>
  <div class="glossarySelectionContainer" v-if="!gotGlossaries">
    <pulse-loader
      id="loading-indicator"
      :loading="true"
      class="loadingBar"
      size="0.5em"
      color="#2c3e50">
    </pulse-loader>
  </div>
  <label>{{$t('Show full list of concepts')}}
    <input type="checkbox" v-model="showFullLexemeList" />
  </label>
  <table v-show="showTable">
    <colgroup span="2"></colgroup>
    <col>
    <tr>
      <td colspan="2" class="tableHeading">
        <h2>{{$t('Concepts')}}</h2>
      </td>
      <td colspan="2" class="tableHeading">
        <h2>{{$t('Definitions')}}</h2>
      </td>
    </tr>
    <tr>
      <td>
        <h3 class="lexemeHeader"
        @click="setSortByLexemeTerm"
        >{{$t('Concepts of selected glossaries')}}</h3>
      </td>
      <td>
        <h3 class="lexemeHeader"
        @click="setSortByLexemeScore"
        >{{$t('Concept matches to selected glossaries')}}</h3>
      </td>
      <td>
        <h3 class="definitionsContainer"
        @click="setSortByDefGloss"
        >{{$t('Descriptions of selected glossaries')}}</h3>
      </td>
      <td>
        <h3 class="definitionsContainer"
        @click="setSortByDefScore"
        >{{$t('Definition matches to selected glossaries')}}</h3>
      </td>
    </tr>
    <tr>
      <td>
        <input
          class="filterInput"
          v-model="filterLexeme"
          :placeholder="$t('Filter lexemes')"
        />
      </td>
      <td class="filterMessage">
        <div class="">
          <label class="labelFilter">
            <input type="checkbox" v-model="excludeLexemeFilter" />
            {{$t('Exclude')}}:
          </label>
          <div class="numberFilter">
            <input
              class="filterInput"
              :value="excludeFilterLexeme"
              @change="eventExcludeLexemeFilter"
              :placeholder="$t('Exclude score: -1,0,1...')"
            />
          </div>
        </div>
        <div class="">
          <label class="labelFilter secondLabel">
            <input type="checkbox" v-model="includeLexemeFilter" />
            {{$t('Include')}}:
          </label>
          <div class="numberFilter">
            <input
              class="filterInput"
              :value="includeFilterLexeme"
              @change="eventIncludeLexemeFilter"
              :placeholder="$t('Include score: -1,0,1...')"
            />
          </div>
        </div>
      </td>
      <td>
        <input
          class="filterInput"
          v-model="filterDefinition"
          :placeholder="$t('Filter definitions')"
        />
      </td>
      <td class="filterMessage">
      <label>{{$t('Filter on matches')}}
        <input type="checkbox" v-model="matchDefinitionFilter" />
      </label>
      </td>
    </tr>
    <tr v-for="[defId, lexid] in tableIdList" :key="lexid + defId" class="dataRows">
      <td class="lexemeData lexemeBox1">
        <lexeme-view
          :lexemeId="lexid"
          :lexemeList="lexemesCompared"
          :showAll="showAllDefinitions">
        </lexeme-view>
      </td>
      <td class="lexemeData lexemeBox2 tdBorderSplit1 tdThickBorderSplit1">
        <lexeme-compare-view
          :lexemeId="lexid"
          :lexemeList="lexemesCompared"
          :showAll="showAllDefinitions">
        </lexeme-compare-view>
      </td>
      <td class="lexemeData lexemeBox2 tdBorderSplit1">
          <definition-view
            :definitionId="defId"
            :lexemeId="lexid"
            :definitionsCompared="definitionsCompared[defId]"
            :showAll="showAllDefinitions">
          </definition-view>
      </td>
      <td class="lexemeData lexemeBox3 tdBorderSplit1">
        <definition-compare-view
          :definitionId="defId"
          :lexemeId="lexid"
          :definitionsCompared="definitionsCompared[defId]"
          :showAll="showAllDefinitions">
        </definition-compare-view>
      </td>
    </tr>
  </table>
  <div v-if="showLoader">
    <pulse-loader
      id="loading-indicator"
      :loading="true"
      size="0.5em"
      color="#2c3e50">
    </pulse-loader>
  </div>
  <button v-show="showPreviusButton" @click="previusLexemes" type="button" name="previusButton">{{$t('Previus')}}</button>
  <button v-show="showNextButton" @click="nextLexemes" type="button" name="nextButton">{{$t('Next')}}</button>

</div>
</template>

<script>
import eventBus from '../../eventbus'
import { mapState } from 'vuex'
import { helpers } from 'termer-core'
import definitionView from '@/components/manage_glossaries/definitionView'
import definitionCompareView from '@/components/manage_glossaries/definitionCompareView'
import lexemeView from '@/components/manage_glossaries/lexemeView'
import lexemeCompareView from '@/components/manage_glossaries/lexemeCompareView'
import { compareTwoLexemeLists, compareTwoDefinitionLists } from 'glossarylib'
import PulseLoader from 'vue-spinner/src/PulseLoader'
import SelectLanguages from '@/components/selection_components/SelectLanguages'
import GlossarySelector from '@/components/selection_components/GlossarySelector'
import SettingsIcon from 'mdi-vue/Cog'
export default {
  name: 'glossaryCompare',
  data () {
    return {
      showFullLexemeList: true,
      showGlossarySelection: true,
      showAllDefinitions: true,
      matchDefinitionFilter: false,
      excludeLexemeFilter: false,
      includeLexemeFilter: false,
      showConfig: true,
      listOffset: 0,
      listLimit: 50,
      sourceGlossary: [],
      targetGlossary: {},
      askedGlossaries: {},
      sortBy: 'lexemeTerm',
      excludeFilterLexeme: '',
      includeFilterLexeme: '',
      filterLexeme: '',
      filterDefinition: '',
      showPulseLoader: false,
      editLanguages: true,
      fromTitleText: this.$t('from'),
      toTitleText: this.$t('to'),
      fromSelectedLanguages: [],
      toSelectedLanguages: [],
      glossaryStatus: {}
    }
  },
  components: {
    definitionView,
    lexemeView,
    lexemeCompareView,
    definitionCompareView,
    PulseLoader,
    SelectLanguages,
    GlossarySelector,
    SettingsIcon
  },
  computed: {
    excludeFilterLexemeConverted () {
      if (this.excludeFilterLexeme === '' || !this.excludeLexemeFilter) return []
      return this.convertToNumberList(this.excludeFilterLexeme)
    },
    includeFilterLexemeConverted () {
      if (this.includeFilterLexeme === '' || !this.includeLexemeFilter) return []
      return this.convertToNumberList(this.includeFilterLexeme)
    },
    sourcesConceptLanguages () {
      const langaugesFilterd = this.glossariesLoaded
        .map(x => {
          return x.sourceLanguage
        })
      return [...new Set(langaugesFilterd)].sort()
    },
    sourcesDescriptionLanguages () {
      const langaugesFilterd = this.glossariesLoaded
        .map(x => x.targetLanguage)
      return [...new Set(langaugesFilterd)].sort()
    },
    unavailableTargetLanguages () {
      const sources = this.glossariesLoaded.filter(x => {
        return this.fromSelectedLanguages.includes(x.sourceLanguage)
      })
      const a = sources.map(x => x.targetLanguage)
      return new Set(this.sourcesDescriptionLanguages.filter(x => !a.includes(x)))
    },
    glossariesLoaded () {
      const glossLoaded = this.sourceData.map(([key, stuff]) => {
        for (const glossary of stuff.data.glossaries) {
          glossary.termerID = key + '/' + glossary.id
          if (!(glossary.termerID in this.glossaryStatus)) {
            this.$set(this.glossaryStatus, glossary.termerID, 'notasked')
          }
        }
        return stuff.data.glossaries
      }).flat()
      return glossLoaded
    },
    glossariesLoadedFilterd () {
      return this.glossariesLoaded.filter(x => {
        return this.fromSelectedLanguages.includes(x.sourceLanguage) &&
        this.toSelectedLanguages.includes(x.targetLanguage)
      })
    },
    showPreviusButton () {
      return this.listOffset > 0
    },
    showNextButton () {
      return this.lexemeListOffset < this.lexemesIdList.length
    },
    filterLexemeList () {
      return [...this.lexemesIdList].filter(
        x => {
          const defs = this.lexemeDefinitions[x]
          const defComps = []
          for (const [key, value] of Object.entries(this.definitionsCompared)) {
            if (defs.includes(key)) defComps.push(value)
          }

          // Filter on score based on filter strings
          let includeBool = true
          let excludeBool = false
          if (this.includeLexemeFilter) {
            includeBool = this.matchesGotValue(
              this.lexemesCompared[x],
              this.includeFilterLexemeConverted
            )
          }
          if (this.excludeLexemeFilter) {
            excludeBool = this.matchesGotValue(
              this.lexemesCompared[x],
              this.excludeFilterLexemeConverted
            )
          }
          // if both are used then put them togehter if not
          // then use the activated one
          let lexemeFilterBool = true
          if (this.includeLexemeFilter && this.excludeLexemeFilter) {
            lexemeFilterBool = includeBool && !excludeBool
          }
          if (this.includeLexemeFilter) lexemeFilterBool = includeBool
          if (this.excludeLexemeFilter) lexemeFilterBool = !excludeBool

          // if no filter strings theen, filter on definition
          if (lexemeFilterBool &&
            (defComps.length > 0 || !this.matchDefinitionFilter)) return true
          else return false
        })
    },
    orderdLexmeList () {
      if (this.sortBy === 'lexemeScore') {
        return [...this.filterLexemeList].sort(this.compareLexemeScores)
      } else if (this.sortBy === 'defScore') {
        return [...this.filterLexemeList].sort(this.compareDefinitionScores)
      } else if (this.sortBy === 'DefGloss') {
        return [...this.filterLexemeList].sort(this.compareDefinitionGloss)
      } else if (this.sortBy === 'lexemeTerm') {
        return [...this.filterLexemeList].sort(this.compareLexemeTerms)
      } else return [...this.filterLexemeList]
    },
    lexemeListOffset () {
      return this.listOffset + this.listLimit
    },
    lexemeList () {
      if (this.showFullLexemeList) return this.lexemeFullList
      else return this.lexemeLimitList
    },
    lexemeFullList () {
      return this.tableIdListFilterd
    },
    lexemeLimitList () {
      return this.tableIdListFilterd
        .slice(this.listOffset, this.lexemeListOffset)
    },
    lexemesCompared () {
      if (!this.lexemesIdList && !this.targetLexemesIdList) return {}
      return compareTwoLexemeLists(
        this.lexemesIdList,
        this.targetLexemesIdList,
        this.lexemes)
      // return compareLexemesDict(this.lexemesIdList, this.lexemes)
    },
    definitionsCompared () {
      return compareTwoDefinitionLists(
        this.sourceDefinitionsList,
        this.targetDefinitionsList,
        this.definitions)
    },
    tableIdListFilterd () {
      return this.orderdLexmeList.filter(lexId => {
        const lexeme = this.lexemes[lexId]
        if (!lexeme) return false
        const filtreLexemes = lexeme.forms.filter(x => {
          if (x.toLowerCase().includes(this.filterLexeme.toLowerCase())) {
            return true
          } else return false
        })
        const defIds = this.lexemeDefinitions[lexId]
        const newList = defIds.filter(defId => {
          return this.definitions[defId].gloss.toLowerCase()
            .includes(this.filterDefinition.toLowerCase())
        })
        if (filtreLexemes.length > 0 && newList.length > 0) return true
        else return false
      })
    },
    sourceData () {
      return Object.entries(this.sources).filter(([sourceId, sourceData]) => {
        if (sourceData.type === 'success') {
          return sourceData.data.inApikey && sourceData.data.markupWords
        } else {
          return false
        }
      })
    },
    lexemeLoading () {
      let lexemes = false
      for (const glossaryObj of this.sourceGlossary) {
        if (!glossaryObj.termerID || !(glossaryObj.termerID in this.glossaryLexemes)) {
          lexemes = true
          break
        } else if (!(this.glossaryLexemes[glossaryObj.termerID].type === 'success')) {
          lexemes = true
          break
        }
      }
      return lexemes
    },
    lexemesIdList () {
      let lexemes = []
      for (const glossaryObj of this.sourceGlossary) {
        if (!glossaryObj.termerID || !(glossaryObj.termerID in this.glossaryLexemes)) {
          continue
        } else if (this.glossaryLexemes[glossaryObj.termerID].type === 'success') {
          lexemes = lexemes.concat([...new Set(this.glossaryLexemes[glossaryObj.termerID].data)])
        }
      }
      return lexemes
    },
    targetLexemesIdList () {
      if (!this.targetGlossary.termerID || !(this.targetGlossary.termerID in this.glossaryLexemes)) return []
      else if (this.glossaryLexemes[this.targetGlossary.termerID].type === 'success') {
        return [...new Set(this.glossaryLexemes[this.targetGlossary.termerID].data)]
      } else return []
    },
    lexemesList () {
      return Object.keys(this.lexemeDefinitions)
    },
    sourceDefinitionsList () {
      return Object.entries(this.lexemeDefinitions).filter(([lexemeId, definitionIdList]) => {
        return this.lexemesIdList.includes(lexemeId)
      }).map(([lexemeId, definitionIdList]) => {
        return definitionIdList
      }).flat()
    },
    targetDefinitionsList () {
      return Object.entries(this.lexemeDefinitions).filter(([lexemeId, definitionIdList]) => {
        return this.targetLexemesIdList.includes(lexemeId)
      }).map(([lexemeId, definitionIdList]) => {
        return definitionIdList
      }).flat()
    },
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    showTable () {
      return this.sourceGlossary.length > 0
    },
    showLoader () {
      return !this.showTable && this.targetGlossary.length > 0 &&
      this.sourceGlossary.length > 0
    },
    gotGlossaries () {
      return this.glossariesLoaded.length > 0 || this.lexemeLoading
    },
    showGlossaryConfig () {
      return this.gotGlossaries && this.showConfig
    },
    firstSelected () {
      return this.sourceGlossary.length > 0
    },
    tableIdList () {
      // <tr v-for="lexid in lexemeLimitList" :key="lexid" class="dataRows">
      //  <span v-for="defId in lexemeDefinitions[lexid]" :key="defId + lexid">
      const list = this.lexemeList.map(lexId => {
        const defIds = this.lexemeDefinitions[lexId]
        const newList = defIds.map(defId => {
          return [defId, lexId]
        })
        return newList
      }).flat()
      return list
    },
    ...mapState('Termer', ['sources', 'glossaries', 'glossaryLexemes',
      'lexemeDefinitions', 'definitions', 'lexemes', 'supportedLanguages',
      'fullSiteConfig'])
  },
  methods: {
    convertToNumberList (string) {
      // Filter out all non numbers and empty strings.
      // Converts to list of numbers
      return string.split`,`
        .filter(x => x !== '')
        .map(x => parseInt(x))
        .filter(x => !isNaN(x))
    },
    eventExcludeLexemeFilter (event) {
      this.excludeFilterLexeme = event.target.value
    },
    eventIncludeLexemeFilter (event) {
      this.includeFilterLexeme = event.target.value
    },
    matchesGot0 (matchList) {
      return matchList.filter(x => x.score === 0)
    },
    matchesGotValue (matchList, valueList) {
      if (valueList.includes(-1) && matchList.length === 0) return true
      return matchList.filter(x => valueList.includes(x.score)).length > 0
    },
    openSettings () {
      this.showConfig = !this.showConfig
    },
    changeEdit () {
      this.editLanguages = !this.editLanguages
      eventBus.$emit('requestResize')
    },
    setSortByLexemeTerm () {
      this.sortBy = 'lexemeTerm'
    },
    setSortByLexemeScore () {
      this.sortBy = 'lexemeScore'
    },
    setSortByDefGloss () {
      this.sortBy = 'DefGloss'
    },
    setSortByDefScore () {
      this.sortBy = 'defScore'
    },
    compareLexemeScores (lexA, lexB) {
      if (!this.lexemesCompared) return 0
      const scoresA = this.lexemesCompared[lexA]
      const scoresB = this.lexemesCompared[lexB]
      if (scoresA.length === 0 && scoresB.length === 0) return 0
      if (scoresA.length === 0) return 1
      if (scoresB.length === 0) return -1
      let lowScoreA
      let lowScoreB
      scoresA.forEach(item => {
        if (!lowScoreA || lowScoreA > item.score) lowScoreA = item.score
      })
      scoresB.forEach(item => {
        if (!lowScoreB || lowScoreB > item.score) lowScoreB = item.score
      })
      if (lowScoreA > lowScoreB) return 1
      else if (lowScoreA < lowScoreB) return -1
      else return 0
    },
    compareLexemeTerms (lexA, lexB) {
      const lexemeA = this.lexemes[lexA]
      const lexemeB = this.lexemes[lexB]
      if (!lexemeA && !lexemeB) return 0
      if (!lexemeA || !lexemeA.lemmas.length > 0) return 1
      if (!lexemeB || !lexemeB.lemmas.length > 0) return -1
      const firstAlemma = [...lexemeA.lemmas].sort()[0]
      const firstBlemma = [...lexemeB.lemmas].sort()[0]
      return firstAlemma.localeCompare(firstBlemma)
    },
    compareDefinitionScores (lexA, lexB) {
      const defAs = [...this.lexemeDefinitions[lexA]]
      const defBs = [...this.lexemeDefinitions[lexB]]

      const scoresA = Object.entries(this.definitionsCompared).filter(([key, value]) => {
        return defAs.includes(key)
      }).map(([key, value]) => {
        return value
      }).flat().sort((itemA, itemB) => {
        if (itemA.score > itemB.score) return 1
        else if (itemA.score < itemB.score) return -1
        else return 0
      })[0]
      const scoresB = Object.entries(this.definitionsCompared).filter(([key, value]) => {
        return defBs.includes(key)
      }).map(([key, value]) => {
        return value
      }).flat().sort((itemA, itemB) => {
        if (itemA.score > itemB.score) return 1
        else if (itemA.score < itemB.score) return -1
        else return 0
      })[0]
      if (!scoresA && !scoresB) return 0
      if (!scoresA) return 1
      if (!scoresB) return -1
      if (scoresA.score > scoresB.score) return 1
      else if (scoresA.score < scoresB.score) return -1
      else return 0
    },
    compareDefinitionGloss (lexA, lexB) {
      let defAs = [...this.lexemeDefinitions[lexA]]
      let defBs = [...this.lexemeDefinitions[lexB]]
      defAs = defAs.sort((defA, defB) => {
        return defA.gloss.localeCompare(defB.gloss)
      })
      defBs = defBs.sort((defA, defB) => {
        return defA.gloss.localeCompare(defB.gloss)
      })
      const defA = this.definitions[defAs[0]]
      const defB = this.definitions[defBs[0]]
      if (!defA && !defB) return 0
      if (!defA) return 1
      if (!defB) return -1
      return defA.gloss.localeCompare(defB.gloss)
    },
    previusLexemes () {
      if (this.listOffset === 0) return
      this.listOffset -= this.listLimit
    },
    nextLexemes () {
      if (this.lexemeListOffset >= this.lexemesIdList.length) return
      this.listOffset += this.listLimit
    },
    toggleShowGlossaries () {
      this.showGlossarySelection = !this.showGlossarySelection
    },
    toggleShowDefinitions () {
      this.showAllDefinitions = !this.showAllDefinitions
    },
    updateTargetGlossary (evt) {
      const glossIdString = evt.target.value
      const glossaryCompId = helpers.toGlossaryId(glossIdString)
      if (!(glossIdString in this.glossaryLexemes)) {
        this.$store.dispatch('Termer/fetchDefintionList', glossaryCompId)
      }
      this.targetGlossary = glossIdString
    },
    languageEventUpdate (eventData) {
      const type = eventData.type
      if (type === 'Termer/selectFromLanguage') {
        this.fromSelectedLanguages.push(eventData.value)
      } else if (type === 'Termer/selectToLanguage' && !this.unavailableTargetLanguages.has(eventData.value)) {
        this.toSelectedLanguages.push(eventData.value)
      } else if (type === 'Termer/deselectFromLanguage') {
        this.fromSelectedLanguages = this.fromSelectedLanguages.filter(x => x !== eventData.value)
      } else if (type === 'Termer/deselectToLanguage' && !this.unavailableTargetLanguages.has(eventData.value)) {
        this.toSelectedLanguages = this.toSelectedLanguages.filter(x => x !== eventData.value)
      }
    },
    sourceIdFromGlossID (glossaryId) {
      const strings = glossaryId.split('/')
      return strings[1]
    },
    eventUpdateFrom (eventData) {
      if (eventData.type === 'Termer/addUserSelectedSourceGlossary') {
        for (const item of eventData.value) {
          const source = { ...this.glossaries[item] }
          source.termerID = item
          this.sourceGlossary.push(source)
        }
      } else if (eventData.type === 'Termer/removeUserSelectedSourceGlossary') {
        for (const item of eventData.value) {
          this.sourceGlossary = this.sourceGlossary.filter(x => {
            return x.termerID !== item
          })
        }
      }
    },
    eventUpdateTo (eventData) {
      if (eventData.type === 'Termer/addUserSelectedSourceGlossary') {
        const source = { ...this.glossaries[eventData.value] }
        source.termerID = eventData.value[0]
        this.targetGlossary = source
      } else if (eventData.type === 'Termer/removeUserSelectedSourceGlossary') {
        this.targetGlossary = {}
      }
    }
  },
  watch: {
    glossaryLexemes: function (newVal) {
      Object.entries(newVal).forEach((item, i) => {
        if (item[0] in this.glossaryStatus && item[1].type === 'success') {
          this.glossaryStatus[item[0]] = item[1].type
        }
      })
    },
    gotGlossaries: function (boolean) {
      if (boolean) {
        if (this.fullSiteConfig.sourceLanguages) {
          this.fromSelectedLanguages = this.fullSiteConfig.sourceLanguages
        }
        if (this.fullSiteConfig.targetLanguages) {
          this.toSelectedLanguages = this.fullSiteConfig.targetLanguages
        }
      }
    },
    sourceGlossary: function (glossaries) {
      for (const glossary of glossaries) {
        const glossIdString = glossary.termerID
        const glossaryCompId = helpers.toGlossaryId(glossIdString)
        if (!(glossIdString in this.glossaryLexemes)) {
          this.$set(this.glossaryStatus, glossIdString, 'loading')
          this.$store.dispatch('Termer/fetchDefintionList', glossaryCompId)
        }
      }
    },
    targetGlossary: function (glossary) {
      if (Object.keys(glossary).length === 0) return
      const glossIdString = glossary.termerID
      const glossaryCompId = helpers.toGlossaryId(glossIdString)
      if (!(glossIdString in this.glossaryLexemes)) {
        this.$set(this.glossaryStatus, glossIdString, 'loading')
        this.$store.dispatch('Termer/fetchDefintionList', glossaryCompId)
      }
    }
  },
  metaInfo () {
    return {
      title: this.$t('Compare definitions')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$searchFieldBorderRadius: 3px

input[type="radio"]:checked+label
  background-color: blue

.glossarySelectorBox
  display: inline-block
  text-align: left

.loadingBar
  display: inline

.listItem
  display: flex
  border: solid thin black

.defViewItem
  min-width: 30em

.definitionsContainer
  display: inline-block
  text-align: center
  width: 100%

.lexemeHeader
  display: inline-block
  text-align: center
  width: 100%

.compareListContainer
  width: 100%

.definitionData
  width: 50%
  border: 1px solid black

.lexemeData
  width: 25%

.lexemeBox1
  border-left: 1px solid black
  border-top: 1px solid black
  border-bottom: 1px solid black

.lexemeBox2
  border-top: 1px solid black
  border-bottom: 1px solid black

.lexemeBox3
  border-right: 1px solid black
  border-top: 1px solid black
  border-bottom: 1px solid black

.tdBorderSplit1
  border-left: 1px solid black

.tdThickBorderSplit1
  border-right: 1px solid black

.filterMessage
  text-align: center

.tableHeading
  text-align: center

.dataRows
  background: wheat

.glossaryConfigButton
  text-align: center
  margin-left: 1em
  display: inline

.glossarySelectionContainer
  text-align: center
  max-width: 103em
  margin: auto

.hideSelector
  visibility: hidden

.filterInput
  flex-grow: 1
  border: 1px solid #000
  border-radius: $searchFieldBorderRadius
  padding-left: 6px
  font-size: inherit
  background-color: #fff
  color: #222
  width: 100%
  &:placeholder
    color: #747474

.numberFilter
  display: flex

.labelFilter
  float: left

.secondLabel
  clear: left

.languageSelectors
  display: flex

.languageSelectors > div
  display: inline-block

.languageDiv
  text-align: center
  display: block

.fromLanguageClass
  height: 100%
  width: 50%
  padding-right: 0.2em
  border-right: 1px solid black

.toLanguageClass
  height: 100%
  width: 50%
  padding-left: 0.2em

.glossaryBox
  max-height: 33em
  overflow: auto
  border: solid thin black

.languageTitle
  text-decoration: underline
  padding-bottom: 1em

.headlineBar
  text-align: center

.introText
  text-align: center

table, th, td
  border: 1px solid black

table
  border-collapse: collapse
  width: 100%
  margin-top: 2em

td
  vertical-align: top
  width: 25%

th, td
  padding: 0

td:first-child
  border-top-left-radius: 10px
td:last-child
  border-top-right-radius: 10px
td:first-child
  border-bottom-left-radius: 10px
td:last-child
  border-bottom-right-radius: 10px
h1
  margin-top: 0
  text-align: center
  display: inline
h2, h3
  margin: 0
</style>
