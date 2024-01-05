<license>
  Vertraulich
</license>

<template>
  <div class="header-container">
    <span id="frame-controls-container">
      <span v-if="false">{{ this.user.username }}</span>
      <frame-controls v-if="$isInFrame()"></frame-controls>
    </span>
    <h1 v-show="!showSearchField">
      <span v-if="edit">
        <input type="text"
               @input="x => $emit('input', x.target.value)"
               :value="header" />
        <span v-if="showWarning"
          title="Warrning: With uppercase letters the word/phrase needs to match exact to be able to mark up">
          &#x26a0;
        </span>
      </span>
      <span v-else
        v-show="!showSearchField"
        @click="changeSearchField"
        class="term-heading">
        {{ headerShortend }} x
        <double-chevron height="2em" width="2em" size="23" aria-hidden="true" class="chevron" />
      </span>
    </h1>
    <span v-show="showSearchField" class="search-span">
      <glossary-search
        :term="header"
        @changed="term => $router.push({name: 'lookup', params: { term } })"
        :hideSubmitButton="false">
        <config-button />
      </glossary-search>
    </span>
  </div>
</template>

<script>
import FrameControls from './FrameControls'
import GlossarySearch from '@/components/GlossarySearch'
import DoubleChevron from 'mdi-vue/ChevronDoubleRight'
import eventBus from '../eventbus'

export default {
  name: 'heading',
  props: ['header', 'edit', 'user'],
  components: {
    FrameControls,
    GlossarySearch,
    DoubleChevron
  },
  data () {
    return {
      showSearchField: false
    }
  },
  created () {
    eventBus.$on('hide-search-field', () => {
      this.showSearchField = false
    })
  },
  computed: {
    headerShortend () {
      if (this.header.length > 50) {
        return this.header.substring(0, 50) + '...'
      } else {
        return this.header
      }
    },
    showWarning () {
      return this.header.toLowerCase().substr(1) !== this.header.substr(1)
    }
  },
  methods: {
    changeSearchField () {
      this.showSearchField = !this.showSearchField
    }
  }
}
</script>

<style lang="sass" scoped>
.header-container
  display: flex
  justify-content: space-between

h1
  font-weight: bold
  font-size: 133%
  color: black
  margin: 0
  padding-bottom: 0.1em
  &:first-letter
    text-transform: capitalize

#frame-controls-container
  order: 2

input
  font-weight: inherit
  font-size: inherit
  color: inherit

.search-span
  width: 100%
</style>

<style lang="sass">
body.app-style-wien .header-container
  display: block
  > span
    text-align: right
    display: block
  h1
    font-size: 100%

.chevron
  position: relative

.term-heading:hover, .term-heading:hover > .chevron
  cursor: pointer
  border-bottom: solid thin black

</style>
