<license>
  Vertraulich
</license>

<template>
  <div class="">
    <source-language-config
      :visible="openConfig"
      @openSelecting="showSelection"
    >
    <button
      type="button"
      name="finish_button"
      @click="clickConfig">{{ $t('Done') }}</button>
    </source-language-config>
    <div @click="hideSearch">
      <search-results :user="user" :appStyle="appStyle" :term="term">
      </search-results>
    </div>
  </div>
</template>

<script>
import SearchResults from '@/components/SearchResults'
import SourceLanguageConfig from '@/components/SourceLanguageConfig'
import eventBus from '../eventbus'

export default {
  name: 'lookup',
  props: ['term', 'user', 'appStyle'],
  components: {
    SearchResults,
    SourceLanguageConfig
  },
  metaInfo () {
    return {
      title: this.term,
      meta: [{
        name: 'keywords',
        content: 'tingtunlookup'
      }]
    }
  },
  data () {
    return {
      openConfig: false
    }
  },
  created () {
    eventBus.$on('openSettings', () => {
      this.clickConfig()
    })
  },
  methods: {
    clickConfig () {
      this.openConfig = !this.openConfig
    },
    showSelection (val) {
      this.openConfig = val
    },
    hideSearch () {
      eventBus.$emit('hide-search-field')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)
$border: 1px solid black

#lookup-wrapper
  text-align: left
  padding: 0.2em
  max-height: 500px

.result-container
  overflow-y: auto
  max-height: 500px

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

ol
  margin-right: 2%

#loading-indicator
  text-align: center
</style>

<style lang="sass">
body.app-style-wien #lookup-wrapper
  padding: 0.7em
</style>
