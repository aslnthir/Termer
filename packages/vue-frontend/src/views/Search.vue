<license>
  Vertraulich
</license>

<template>
  <div :class="{ emptySearchInput: !isSearching, marginTop: topFrame }"
      class="content spaced-out">
      <div class="">
        <glossary-search
          class="jumbo"
          :term="term"
          @changed="changed"
          :hideSubmitButton="false">
          <config-button />
          <pdf-button v-if="showPdfButton"
            @openPdfViewer="movePdfPage"
            :openPage="!$isInFrame()"
            :iconButton="true"></pdf-button>
        </glossary-search>
      </div>
      <div :class="{ relativeConfig: isSearching }">
        <source-language-config
          :class="{ absoluteConfig: isSearching }"
          :visible="openConfig"
          @openSelecting="showSelection">
          <t-button
            type="button"
            name="finish_button"
            :title="closeSettingsButtonTitle"
            @click="clickConfig">{{ $t('Done') }}</t-button>
        </source-language-config>
      </div>
    <search-results :term="term" :hidden="!isSearching" />
    <div v-if="extraInfoText && showInfoBox" class="extra_info_box">
      {{extraInfoText}}
    </div>
    <search-page-info-box v-if="showInfoBox" />
  </div>
</template>

<script>
import SearchResults from '@/components/SearchResults'
import SearchPageInfoBox from '@/components/SearchPageInfoBox'
import GlossarySearch from '@/components/GlossarySearch'
import SourceLanguageConfig from '@/components/SourceLanguageConfig'
import eventBus from '../eventbus'
import PdfButton from '@/components/PdfButton'
import { mapState } from 'vuex'
import { fetchSiteConfiguration } from 'site-configurations'

export default {
  name: 'search',
  props: {
    term: String
  },
  data () {
    return {
      pdfImageText: this.$t('PDF file image'),
      openConfig: false,
      closeSettingsButtonTitle: this.$t('Close settings. Changes are automatically stored.')
    }
  },
  computed: {
    showPdfButton () {
      try {
        var regex = new RegExp('[\\?&]' + 'pdfconfig' + '=([^&#]*)')
        var results = regex.exec(location.search)
        if (decodeURIComponent(results[1].replace(/\+/g, ' '))) return false
      } catch (e) {

      }
      return true
    },
    isSearching () {
      return !!this.term
    },
    showInfoBox () {
      return !this.isSearching
    },
    extraInfoText () {
      if ('optional-infobox-text' in this.vueSettings) {
        return this.vueSettings['optional-infobox-text']
      }
      return ''
    },
    topFrame () {
      return window.top === window.self
    },
    ...mapState('Termer', ['vueSettings'])
  },
  components: {
    SearchResults,
    SearchPageInfoBox,
    GlossarySearch,
    SourceLanguageConfig,
    PdfButton
  },
  methods: {
    changed (term) {
      this.$router.push({ name: 'search', params: { term } })
        .catch(e => {
          // redirections are okay
          if (!/Redirected.*via a navigation guard/.test(e.message)) throw e
        })
    },
    movePdfPage () {
      this.$router.push({ name: 'pdfreader', query: this.$route.query })
    },
    clickConfig () {
      this.openConfig = !this.openConfig
      eventBus.$emit('requestResize')
    },
    showSelection (val) {
      this.openConfig = val
      eventBus.$emit('requestResize')
    }
  },
  created: async function () {
    if (window.top === window.self) {
      const config = await fetchSiteConfiguration(window.location.href)
      if ('sourceRank' in config) {
        // console.log(3)
        // this.$store.dispatch('Termer/setUserGlossaryOrderById', config.sourceRank)
        // termerCore.setsourceViewOrderByName(customConfig['sourceNameViewOrder'])
      }
      if ('SourcesGeneralOn' in config) {
        this.$store.dispatch('Termer/selectConfigSource', config.SourcesGeneralOn)
        // termerCore.selectSource(customConfig['selectSources'])
      }
      if ('deselectSources' in config) {
        this.$store.dispatch('Termer/deselectSource', config.deselectSources)
        // termerCore.deselectSource(customConfig['deselectSources'])
      }
    }
    eventBus.$on('openSettings', () => {
      this.clickConfig()
    })
  },
  metaInfo () {
    return {
      title: (this.term ? this.term + ' – ' : '') + this.$t('Search'),
      meta: [{
        name: 'keywords',
        content: 'tingtunlookup'
      }],
      link: [
        {
          rel: 'search',
          type: 'application/opensearchdescription+xml',
          title: 'Tingtun Termer',
          href: `${process.env.VUE_APP_PUBLIC_PATH}opensearch.${window.location.hostname}.xml`
        }
      ]
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)

.jumbo, .jumbo *
  display: inline
  overflow: initial

.emptySearchInput
  // This centers the contents.
  margin-left: auto
  margin-right: auto

.content
  width: 100%
  max-width: 640px

.marginTop
  margin-top: 2em

.spaced-out > :not(:first-child)
  margin-top: .5em

@media only screen and (min-width: 1310px)
  .relativeConfig
    position: relative
    height: 0px
  .absoluteConfig
    position: absolute
    left: 670px
    top: -45px
    /* min-width: 500px; */
    /* max-width: 640px; */
    width: 640px

.extra_info_box
  background: var(--information-box-color)
  padding: 1em
  border: 1px solid #ddd
  border-radius: 0.5em
  text-align: initial

</style>
