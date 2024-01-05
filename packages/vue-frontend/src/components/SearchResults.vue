<license>
  Vertraulich
</license>

<template>
<div id="search-results-wrapper">

  <!-- IE11: only the keydown event is triggered by the Enter key. -->
  <GlobalEvents
    @keydown.enter="handleEnter"
    @mousedown="clickStart"
    @mousemove="cancelClick"
    @mouseup="handleClick"
    @selectionchange="registerSelectionChange"
  />
{{ term }}
  <!-- {{ JSON.stringify(searchResults) }} -->
  <div v-if="term" :style="fontSizeElement">
    <section v-for="glossaryId in this.orderdGlossaries"
             :set="result = searchResult[glossaryId]"
             :key="glossaryId"
             :hidden="shouldHideResultSection(glossaryId)">

      <!-- {{ JSON.stringify(sourceId) }}<br> -->
      <!-- <div>{{ sources }}</div> -->
      <h2 class="source-reference-wrapper">
        <span class="flexpand bottom-border"></span>
        <source-reference
          :source="getSourceData(getSourceId(glossaryId))"
          :languages="getSourceLanguages(glossaryId)"
          :backend="backends[getBackendId(getSourceId(glossaryId))]"></source-reference>
        <!-- {{ sourceId }} -->
      </h2>
      <!-- {{ JSON.stringify(result) }} <br> -->
      <template v-if="result.type === 'success' && gotResult(result.data)">
        <ol v-if="result.data.length > 1" class="entry-list">
          <li v-for="lexemeId of result.data" :key="lexemeId">
            <entry :lexemeId="lexemeId"
              :wordlist="binaryWordlist"
              :regexes="wordlistRegexes"
              :sourceName="sources[getSourceId(glossaryId)].data.displayname"
            ></entry>
          </li>
        </ol>
        <entry v-else class="entry-list"
              :lexemeId="result.data[0]"
              :wordlist="binaryWordlist"
              :regexes="wordlistRegexes"
              :sourceName="sources[getSourceId(glossaryId)].data.displayname" />
        <div v-if="didYouMeanList[glossaryId] && didYouMeanList[glossaryId].length > 0">
          {{$t('Did you mean')}}: <span
            class="didyoumeanspan"
            v-for="term of didYouMeanList[glossaryId]"
            :key="term"
          >
          <span
            :title="$t('Description of concept')"
            class="tingtun_label"
            role="button"
            tabindex="0"
          >{{ term }}</span>
          </span>
        </div>
      </template>
      <pulse-loader v-else-if="sourceLoader"
        id="loading-indicator"
        :loading="result.type === 'loading'"
        size="0.5em"
        color="#2c3e50">
      </pulse-loader>
    </section>
    <div v-if="sourcesLoading">
      <pulse-loader
        id="loading-indicator"
        :loading="true"
        size="0.5em"
        color="#2c3e50">
      </pulse-loader>
    </div>
  </div>

  <div v-if="term && showNoResultMessage"
    id="no-result-listing"
    class="no-result">
    <no-search-result
      :term="term">
    </no-search-result>
  </div>

  <term-to-long
  v-else-if="termLength"
  :term="term">
  </term-to-long>

  <search-result-default-view
      v-else-if="!term">
  </search-result-default-view>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Entry from '@/components/Entry2'
import noSearchResult from '@/components/NoSearchResult'
import SourceReference from '@/components/SourceReference'
import TermToLong from '@/components/TermToLong'
import { helpers } from 'termer-core'
import PulseLoader from 'vue-spinner/src/PulseLoader'
import SearchResultDefaultView from './SearchResultDefaultView'
import GlobalEvents from 'vue-global-events'
import { Wordlist } from 'glossarylib'

// Max milliseconds for double click to register.
// Only used for IE11.
// TODO: put this in a IE11 mixin?
const doubleClickTimeout = 750

// Enable/disable debug logging.
const DEBUG = false

export default {
  name: 'search-results',
  props: ['term', 'user', 'appStyle'],
  components: {
    Entry,
    SourceReference,
    SearchResultDefaultView,
    PulseLoader,
    GlobalEvents,
    noSearchResult,
    TermToLong
  },
  data: function () {
    return {
      clicking: false,
      clickHandled: false,
      // TODO: put this in a IE11 mixin?
      previousClickTime: Date.now() - 1,
      clickTime: Date.now(),
      sourceLoader: false,
      selectionChange: {
        rect: null,
        text: ''
      }
    }
  },
  computed: {
    fontSizeElement () {
      return 'font-size: max(min(' + this.fontSize + ', 22px), 12px);'
    },
    termLength () {
      return this.term && this.term.length > 5001
    },
    searchResult () {
      const termResult = this.searchResults[this.term]
      const selectedResult = pickFromObject(termResult, this.selectedGlossaryIDs)
      return selectedResult
    },
    showNoResultMessage () {
      /*
        We’ve got a result if
        - all are notAsked, or
        - any are loading, or
        - any are Success with non-empty data
      */
      const result = Object.values(this.searchResult)
      const gotResult = result && (result.every(({ type }) => type === 'notasked') ||
        result.some(({ type }) => type === 'loading') ||
        result.some(({ type, data }) => type === 'success' && data.length > 0))
      return !gotResult
    },
    orderdGlossaries () {
      const sorted = Object.keys(this.searchResult).sort(this.sortGlossaryIds)
      return sorted
    },
    sourcesLoading () {
      let loading = false
      for (const result in this.searchResult) {
        if (this.searchResult[result].type === 'loading') {
          loading = true
          break
        }
      }
      return loading && !this.sourceLoader
    },
    binaryWordlist () {
      if (!this.wordlist.wordlist) return []
      return Wordlist.createWordlist(this.wordlist.wordlist)
    },
    wordlistRegexes () {
      return this.wordlist.regexes
    },
    didYouMeanList () {
      if (!this.searchDidYouMean[this.searchTerm]) return {}
      return this.searchDidYouMean[this.searchTerm]
    },
    ...mapState('Conf', ['fontSize']),
    ...mapState('Termer', ['searchResults', 'sources', 'backends',
      'glossaries', 'wordlist', 'selectedGlossaryIDs', 'glossaryOrderById',
      'searchDidYouMean', 'searchTerm'])
  },
  methods: {
    sortGlossaryNames (id1, id2) {
      const gloss1 = this.glossaries[id1]
      const gloss2 = this.glossaries[id2]
      return gloss1.displayname.localeCompare(gloss2.displayname)
    },
    sortGlossaryIds (id1, id2) {
      const index2 = this.glossaryOrderById.indexOf(
        id2
      )
      const index1 = this.glossaryOrderById.indexOf(
        id1
      )
      let reutnrVal = 0
      if (index2 === -1) reutnrVal = -1
      else if (index1 === -1) reutnrVal = 1
      else if (index1 < index2) reutnrVal = -1
      else if (index2 < index1) reutnrVal = 1
      return reutnrVal
    },
    debug () {
      if (DEBUG) {
        // eslint-disable-next-line
        console.log(...arguments)
      }
    },
    registerSelectionChange () {
      // We store the last selection because Chrome on Android
      // clears the selection before the click handler runs.
      this.debug('selectionchange', document.getSelection().toString())
      const { selectedRectangle, selectedText } = this.getSelectedText()
      this.selectionChange.rect = selectedRectangle
      this.selectionChange.text = selectedText
    },
    getBackendId (sourceId) {
      return helpers.toIdString(helpers.toBackendId(sourceId))
    },
    getSourceData (sourceId) {
      // const sourceId = this.getSourceId(sourceLanguageIdString)
      const source = this.sources[sourceId]
      if (source && source.data) return source.data
      else return null
    },
    shouldHideResultSection (glossaryId) {
      const result = this.searchResult[glossaryId]
      return (
        result.type === 'error' ||
        result.type === 'notasked' ||
        (result.type === 'loading' && !this.sourceLoader) ||
        (result.data && !this.gotResult(result.data))

      )
    },
    getSourceId (glossaryIdString) {
      const glossaryId = this.getSourceIdData(glossaryIdString)
      return glossaryId.backendId + '/' + glossaryId.sourceId
    },
    getSourceIdData (glossaryIdString) {
      return helpers.toGlossaryId(glossaryIdString)
    },
    getGlossaryData (glossaryId) {
      return this.glossaries[glossaryId]
    },
    getSourceLanguages (glossaryId) {
      const data = this.getGlossaryData(glossaryId)
      return {
        from: data.sourceLanguage,
        to: data.targetLanguage
      }
    },
    gotResult (resultObject) {
      if (!resultObject) return false
      if (resultObject instanceof Array) {
        return resultObject.length > 0
      } else {
        return Object.entries(resultObject).some(([key, results]) => {
          return this.gotResult(results)
        })
      }
    },
    clickStart (evt) {
      this.debug('mousedown', document.getSelection().toString(), evt.clientX, evt.clientY)
      for (let el = evt.target; el !== evt.currentTarget; el = el.parentNode) {
        if (this.isClickable(el) && !el.classList.contains('tingtun_label')) {
          this.debug('click on clickable element')
          return
        }
      }
      this.debug('click start')
      this.clicking = true
      this.clickHandled = false

      // TODO: put this in a IE11 mixin?
      this.previousClickTime = this.clickTime
      this.clickTime = Date.now()
    },
    getSelectedText () {
      let selectedText = ''
      let selectedRectangle = null
      const selection = document.getSelection()
      const text = selection.toString()
      this.debug('getselectedtext', text)
      if (text) {
        let rect
        try {
          rect = document.getSelection().getRangeAt(0).getBoundingClientRect()
          // Written this way to ensure that either both variables are set or
          // none of them.
          selectedText = text
          selectedRectangle = rect
        } catch {
          // getRangeAt() may throw an IndexSizeError. Which we simply ignore,
          // and return the initial empty values.
        }
      }
      return { selectedText, selectedRectangle }
    },
    isClickable (element) {
      const clickableElements = new Set(['A', 'BUTTON', 'INPUT', 'LABEL'])
      return clickableElements.has(element.nodeName)
    },
    cancelClick (evt) {
      if (!validMouseMoveEvent(evt)) return
      // TODO: put this in a IE11 mixin?
      const clickDelta = this.clickTime - this.previousClickTime
      if (clickDelta >= 0 && clickDelta < doubleClickTimeout) {
        // cancel double click by pushing the previous click back in time.
        this.debug('cancel double click', evt.clientX, evt.clientY, this.clickTime, this.previousClickTime, clickDelta)
        this.clickTime -= doubleClickTimeout
      }

      // Only cancel single click if button is being held
      // bitwise logic: 1 is left mouse button.
      if ((evt.buttons & 1) !== 1) return
      this.debug('cancel click', evt.button, evt.buttons)
      this.clicking = false
    },
    handleClick (evt) {
      this.debug('mouseup', document.getSelection().toString())
      if (!this.clicking) {
        this.debug('handle click: not clicking')
        return
      }
      this.clicking = false
      if (this.clickHandled) {
        this.debug('handle click: click already handled')
        this.clickHandled = false
        return
      }
      if (event.button !== 0) {
        // left click only
        this.debug('handle click: not clicking with left button')
        return
      }
      // This is the regular way to detect double clicks, but IE11, in my VM
      // tests, does not reset the `detail` counter.
      if (navigator.userAgent.indexOf('Trident') === -1) {
        if (evt.detail && evt.detail > 1) {
          // ignore double clicks
          this.debug('handle click: ignore double click', evt)
          return
        }
      } else {
        // So, we’ll have to detect double clicks manually instead.
        // TODO: put this in a IE11 mixin?
        const clickDelta = this.clickTime - this.previousClickTime
        this.debug('handle click: double click. clickTime', this.clickTime, 'previous clickTime', this.previousClickTime)
        if (clickDelta < doubleClickTimeout) {
          this.debug('handle click: ignore double click', evt)
          return
        }
      }
      this.debug('handle click', evt)
      this.searchForSelectedText(evt)
    },
    searchForSelectedText (evt) {
      if (evt.target.classList.contains('tingtun_label')) {
        this.handleClickOnHighlightedTerm(evt)
        return
      }

      this.debug('selectionChange data', this.selectionChange.text)
      const { rect: selectedRectangle, text: selectedText } = this.selectionChange
      if (!selectedRectangle) return

      if ('clientX' in evt && 'clientY' in evt) {
        // Check that click is within selection bounds.
        // Add a delta to expand the clickable region.
        // This is important for mobile browsers because the selected
        // region represents a too small clickable area.
        // Note that unlike other desktop browsers, IE11 does not always clear
        // the selection on mousedown above or below the selection.
        // And mousedown after the end of a line does also not clear the selection.
        const delta = 50
        const rect = selectedRectangle
        this.debug({ x: evt.clientX, y: evt.clientY }, rect)
        if (evt.clientX < (rect.left - delta) ||
            evt.clientX > (rect.right + delta) ||
            evt.clientY < (rect.top - delta) ||
            evt.clientY > (rect.bottom + delta)) {
          this.debug('handle click: not within selection bounds')
          return
        }
      }
      this.search(selectedText)
    },
    async handleEnter (evt) {
      this.debug('handle enter', evt)
      // IE11 workaround: double click to select text does not trigger
      // selectionchange event unless some text were already selected before.
      // So we’ll run the handler manually here.
      this.registerSelectionChange()
      this.searchForSelectedText(evt)
    },
    handleClickOnHighlightedTerm (evt) {
      this.debug('handle click on highlighted term')
      const phrase = evt.target.innerText
      evt.preventDefault()
      // This stops IE from performing a form submit
      evt.stopPropagation()
      this.search(phrase)
    },
    search (phrase) {
      this.debug(`search for ‘${phrase}’`)
      if (!phrase) return

      // Remove leading/trailing space.
      // Note: on Windows, double clicking on text also selects trailing space.
      // So .trim() is very much required.
      phrase = phrase.trim()

      const notChangeViews = ['search', 'showcase-search', 'config', 'config-search']
      const route = Object.assign({}, this.$route)
      route.params.term = phrase
      if (notChangeViews.indexOf(this.$route.name) === -1) {
        route.name = 'lookup'
      }
      this.$router.push(route)
      this.clearSelection()
    },
    clearSelection () {
      this.selectionChange.text = ''
      this.selectionChange.rect = null
      // This clears the selection and prevents IE from selecting
      // everything in the new results.
      document.getSelection().removeAllRanges()
    }
  }
}

function validMouseMoveEvent (evt) {
  // Chrome on Windows 10 sometimes emits mousemove event on clicks even though
  // the mouse didn’t move.

  // Filter which checks if the mouse actually moved.
  return evt.movementX !== 0 || evt.movementY !== 0
}

function pickFromObject (obj, ids) {
  if (!obj) return {}
  return ids.reduce((acc, id) => {
    if (id in obj) {
      acc[id] = obj[id]
    }
    return acc
  }, {})
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)
$border: 1px solid var(--border-color)

#help-links
  margin-top: 1.2em
  font-size: 8pt

#search-results-wrapper
  text-align: left
  padding: 0.2em

.shadow-borders
  box-shadow: inset -0.5em 0em 0.5em #dbd8b8

.source-reference-wrapper
  text-align: right
  display: flex
  margin-bottom: 1em
  font-size: 100%
  font-weight: normal

.flexpand
  flex: 1

.bottom-border
  border-bottom: $border

.entry-list
  padding-inline-start: 0
  padding-left: 6%
  margin-right: 2%

#loading-indicator
  text-align: center

.tingtun_label
  box-shadow: inset 0 -2.2px 0 #58b3c3
  cursor: pointer
  pointer-events: auto
  margin-right: 1em
  &:hover
    background-color: #fffde9
    box-shadow: inset 0 0 0 1px #18587b

.didyoumeanspan
  display: inline-block

</style>

<style lang="sass">
body.app-style-wien #search-results-wrapper
  padding: 0.7em
</style>
