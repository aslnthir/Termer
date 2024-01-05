<license>glossa
  Vertraulich
</license>

<template>
  <form class="search"
        v-on:submit.prevent="formSubmit"
        @mouseup="$event.altKey && searchSelectedText($event)"
        novalidate>
      <span id="search-field-wrapper">
        <span id="search-field" class="transition-hide-show-buttons">
          <input :placeholder="searchPrompt"
                 :title="$t('Search for concept')"
                 v-model="input"
                 v-on:keyup="inputKeyDown"
                 required
                 type="text"
                 list="wordlist"
                 autocomplete="off"
                 ref="inputField"
                 name="term"/>
          <t-button
            type="button"
            @click="clearSearch"
            :title="$t('Clear search')"
            class="clearSearchButton">
            <cancel-icon class="magnify-icon" aria-hidden="true" height="2em" width="2em" />
          </t-button>
          <t-button type="submit" :hidden="hideSubmitButton" :title="$t('Search')">
            <magnify-icon class="magnify-icon" aria-hidden="true" height="2em" width="2em" />
          </t-button>
        </span>
        <span id="search-field-button-container" class="transition-hide-show-buttons">
          <slot />
        </span>
      </span>
      <datalist id="wordlist">
        <option
          v-for="word in showClosestWord"
          :value="word"
          :key="word"
        >
        </option>
      </datalist>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import MagnifyIcon from 'mdi-vue/Magnify'
import CancelIcon from 'mdi-vue/CloseCircleOutline'
// import levenshtein from 'js-levenshtein'
import debounce from 'lodash/debounce'

const SUGGESTIONS_LIST_LENGTH = 7

export default {
  name: 'glossary-search',
  components: {
    MagnifyIcon,
    CancelIcon
  },
  data () {
    return {
      input: '',
      debouncedInput: '',
      exclusionList: [
        'jeg',
        'som',
        'det',
        'å',
        'så'
      ]
    }
  },
  props: {
    hideSubmitButton: {
      type: Boolean,
      default: true
    },
    term: String
  },
  computed: {
    showClosestWord () {
      // console.log(this.calculateLev().slice(0, SUGGESTIONS_LIST_LENGTH))
      return this.calculateLev().slice(0, SUGGESTIONS_LIST_LENGTH)
    },
    sortedWordlist () {
      if (!this.wordlist || !this.wordlist.wordlist) return []
      return this.wordlist.wordlist.slice(0).sort((a, b) => a.length - b.length)
    },
    ...mapState('Termer', ['wordlist']),
    ...mapState(['searchPrompt'])
  },
  methods: {
    clearSearch (e) {
      this.input = ''
      this.$emit('changed', this.input)
    },
    formSubmit () {
      if (this.input && this.input !== this.term) {
        this.input = this.input.trim()
        this.$emit('changed', this.input)
        if (this.$refs.inputField) {
          // Removes the focus from the input field in order to force the
          // datalist dropdown to close (which was a problem in Chromium).
          this.$refs.inputField.blur()
        }
      }
    },
    inputKeyDown (evt) {
      if (!('key' in evt) || evt.key.toLowerCase() === 'enter') {
        setTimeout(this.formSubmit, 100)
      }
    },

    calculateLev () {
      const input = this.debouncedInput
      if (input === '') return []
      if (!(this.sortedWordlist)) return []
      if (input.length <= 2) return []
      if (this.exclusionList.includes(input)) {
        // console.log('word exists in exclusionList')
        return []
      }

      // const hasUpperCaseRe = /\p{Lu}/gu

      // Chop off words that are too short to be close to the input.
      // console.log(this.sortedWordlist.findIndex(x => input.length - x.length <= 1))
      // console.log('wordlist', this.sortedWordlist)
      const wordlistArray = this.sortedWordlist.slice(
        this.sortedWordlist.findIndex(x => input.length - x.length <= 2)
      )
      // const wordlistArray = this.sortedWordlist

      /* const filtered = wordlistArray.reduce((acc, x, index, arr) => {
        const lowerInput = hasUpperCaseRe.test(input) ? input.toLowerCase() : input
        const lowerThis = hasUpperCaseRe.test(x) ? x.toLowerCase() : x
        const score = levenshtein(lowerInput, lowerThis)
        const scoreScaled = score / lowerThis.length
        const prefixMatch = lowerThis.startsWith(lowerInput)

        // if (x.length - lowerInput.length > 6) {
        //   Stop if the wordlist words are more than 3 chars longer than the input word.
        //   arr.slice(1) modifies the size of the array we are iterating over,
      //   effectively causing the reduce() call to finish early.
      //   arr.splice(1)
        // }
        if (scoreScaled <= 0.25 || prefixMatch) {
          if (acc.length > SUGGESTIONS_LIST_LENGTH) {
            arr.splice(1)
          }
          return [...acc, x]
        } else return acc
      }, [])

      return filtered */
      const regex = new RegExp(input, 'i')
      const matches = []

      for (let i = 0; i < wordlistArray.length; i++) {
        if (regex.test(wordlistArray[i])) {
          matches.push(wordlistArray[i])
        }
      }

      return matches
    },
    lowerCapitalLetter (word) {
      if (word.substr(1) === word.substr(1).toLowerCase()) {
        return word.toLowerCase()
      } else {
        return word
      }
    }
  },
  created () {
    // handler for when the component is first created.
    const termParam = (this.term || '').trim()
    if (termParam) {
      this.input = termParam
    }
  },
  watch: {
    input: debounce(function (value) {
      this.debouncedInput = value
    }, 250),

    term (value) {
      // when the prop is updated, set the value in the input field
      this.input = (value || '').trim()
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)
$submitHeight: 1.2em
$searchFieldBorderRadius: 3px

input:invalid
  box-shadow: none

#search-field-wrapper
  display: inline-flex
  flex-direction: row
  border-radius: $searchFieldBorderRadius
  width: 100%
  height: 3em
  overflow-x: auto

// Hide the submit button, while still allowing the form to be
// submitted with the <Enter> key.
// button[type=submit]
//   margin-left: -$submitButtonWidth
//   width: $submitButtonWidth
//   height: $submitHeight

#search-field
  display: inline-flex
  // flex props:
  // 0: (grow) not important
  // 1: (shrink) allows shrinking
  // 100% (basis) wants to take 100% of parent width
  flex: 0 1 100%

  &:focus-within
    // disable shrinking (take up 100% of parent width)
    flex-shrink: 0

  &:focus-within + #search-field-button-container
    // enable shrinking
    flex-shrink: 1

  input[type="text"]
    flex-grow: 1
    border: 1px solid var(--border-color)
    border-radius: $searchFieldBorderRadius
    padding-left: 6px
    font-size: inherit
    background-color: var(--text-box-background)
    color: var(--text-box-color)
    &:placeholder
      color: var(--text-box-color-placeholder)

.magnify-icon
  display: inline-block
  transform: scaleX(-1)
  color: var(--text-color)

#search-field-button-container
  display: inline-flex
  overflow: hidden
  // do not shrink, fit contents.
  flex: 0 0 auto

.transition-hide-show-buttons
  transition: flex-shrink 0.1s linear

.clearSearchButton
  opacity: 0.6
  position: relative
  right: 40px
  margin-right: -40px
  background: transparent
  border: transparent
</style>
