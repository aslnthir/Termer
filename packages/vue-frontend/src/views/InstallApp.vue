<license>
  Vertraulich
</license>

<template>
  <div class="content">
    <a id="app-installation" />
    <div>
      <p>{{ $t('With this app you can use your smartphone to search for terms in selected sources.') }}</p>
      <vue-tabs :defaultIndex="defaultTabIndex" class="tablist">
        <v-tab v-for="tab in tabs"
          :title="tab.title"
          :name="tab.name"
          class="tab"
          v-bind:key="tab.name">
            <MarkdownTextI18n :document="tab.documentName" />
        </v-tab>
      </vue-tabs>
    </div>
    <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
  </div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { VueTabs, VTab } from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'

export default {
  name: 'install_App',
  data () {
    return {
      tabs: [
        { name: 'chrome', title: 'Chrome', documentName: 'InstallAppChrome' },
        { name: 'edge', title: 'Edge', documentName: 'InstallAppEdge' },
        { name: 'safari', title: 'Safari', documentName: 'InstallAppSafari' },
        { name: 'firefox', title: 'Firefox', documentName: 'InstallAppFirefox' },
        { name: 'ie', title: 'Internet Explorer', documentName: 'InstallAppIE' }
      ].sort((x, y) => x.title > y.title)
    }
  },
  components: {
    MarkdownTextI18n,
    VueTabs,
    VTab
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    defaultTabIndex () {
      const browserGuess = this.guessBrowser()
      if (!browserGuess) {
        return -1
      }
      const index = this.findTabIndex(browserGuess)
      return index
    }
  },
  methods: {
    findTabIndex (tabName) {
      return this.tabs.findIndex(({ name }) => name === tabName)
    },
    guessBrowser () {
      if (/Trident/.test(navigator.userAgent)) return 'ie'
      if (/Edge/.test(navigator.userAgent)) return 'edge'
      if (/Firefox/.test(navigator.userAgent)) return 'firefox'
      if (/Chrome/.test(navigator.userAgent)) return 'chrome'
      if (/Safari/.test(navigator.userAgent)) return 'safari'
      return null
    }
  },
  metaInfo () {
    return {
      title: this.$t('App installation')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin: 2em 1em 2em 1em

.tablist ::v-deep
  .vue-tablist
    overflow-x: auto
    overflow-y: hidden

.tab ::v-deep
  ol
    padding-left: 0
    display: flex
    flex-wrap: wrap
    flex-direction: row
    list-style: none
    counter-reset: step-counter

  ol > li
    flex: 1 0 42%
    list-style-type: none
    display: inline-flex
    flex-direction: column
    max-width: 400px
    min-width: 250px
    margin: 1.0em
    background-color: var(--termer-tab-list-background)
    border-radius: 4px
    padding: 2em 3em
    counter-increment: step-counter
    position: relative

    &::before
      content: counter(step-counter) "."
      position: absolute
      top: 0.9em
      left: 0.4em
      font-size: 213%

  ol > li img
    display: block
    align-self: center
    border: solid thin
    border-radius: 1em
    width: 100%
    margin-top: 1em
    @media only screen and (max-width: 600px)
      max-width: 66vw
</style>
