<license>
  Vertraulich
</license>

<template>
  <div class="wrapper-v vertically-spaced">
    <glossary-search
      :term="term"
      @changed="term => $router.push({name: 'config-search', params: { term } })"
      :hideSubmitButton="false">
      <config-button />
      <pdf-button v-if="showPdfButton" :iconButton="true"></pdf-button>
    </glossary-search>
    <div v-if="showSources">
      <glossary-select
        v-if="!domainsConfig"
        config="true"
        @open-config="viewSources"
      ></glossary-select>
    </div>
    <domain-single-select v-if="domainsConfig" v-model="active"></domain-single-select>
    <router-view name="search-results"></router-view>
    <div id="tingtunGlossary" data-backend=""></div>
    <search-page-info-box v-if="isSearching" />
  </div>
</template>

<script>
import GlossarySearch from '@/components/GlossarySearch'
import GlossarySelect from '@/components/GlossarySelect'
import SearchPageInfoBox from '@/components/SearchPageInfoBox'
import DomainSingleSelect from '@/components/DomainSingleSelect'
import PdfButton from '@/components/PdfButton'
import { mapState } from 'vuex'
import eventBus from '../eventbus'

export default {
  name: 'config',
  components: {
    GlossarySearch,
    GlossarySelect,
    DomainSingleSelect,
    PdfButton,
    SearchPageInfoBox
  },
  data () {
    return {
      showSources: false
    }
  },
  props: ['term'],
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
      return !this.term
    },
    active: {
      get () {
        return this.$store.getters['Conf/active']
      },
      set (value) {
        const action = 'Conf/' + (value ? 'activate' : 'deactivate')
        this.$store.dispatch(action)
      }
    },
    generateNextURL () {
      const VuePath = this.$router.resolve({ name: 'loginOptions' })
      const origin = window.location.origin
      const path = window.location.pathname
      const query = '?next=' + encodeURIComponent(decodeURIComponent(window.location.href.replace(window.location.origin, '')))
      const hash = VuePath.href
      return origin + path + query + hash
    },
    domainsConfig () {
      const url = window.location.href
      const name = 'domainConfig'
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
      const results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    },
    hasApikey () {
      for (const backend in this.backends) {
        if (
          this.backends[backend].config.apikeys &&
          this.backends[backend].config.apikeys.length > 0
        ) return true
      }
      return false
    },
    ...mapState('Termer', ['backends']),
    ...mapState(['user', 'Conf'])
  },
  methods: {
    viewSources (msg) {
      this.showSources = !this.showSources
    }
  },
  created () {
    eventBus.$on('openSettings', () => {
      this.viewSources('')
    })
  },
  metaInfo () {
    return {
      title: this.$t('Config')
    }
  }
}
</script>

<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)
header
  background-color: $tingtunBlue
  color: var(--invert-text-color)
  display: flex

h1
  font-size: 118%
  font-weight: 700
  margin: 0
  padding: 0
  display: inline
  white-space: nowrap
  flex: 1

#config-menu
  flex: 2

.sourceButton
  width: 100%
  min-height: 2em

.wrapper-v
  padding-left: 0.5em
  padding-right: 0.5em
  padding-bottom: 0.5em

.vertically-spaced > :not(:first-child)
  margin-top: 0.5em

.topButtons
  display: flex
  flex-direction: row

.pdfButton
  display: flex
  flex: 3
  justify-content: flex-end
</style>
