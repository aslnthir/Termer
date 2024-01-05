<template>
<div :lang="definition.language">
  <div v-if="definition.images" class="entry-images">
    <async-img v-for="image in definition.images"
      :key="image.url"
      :url="image.url"></async-img>
  </div>
  <div>
    <div
      :class="{ rightAlignedLanguage: isRightAlignedLanguage }"
      style="inline-block"
      ref="definitionText"
      :lang="definition.language"
      v-html="definitionGloss">
    </div>
    <examples
      v-if="definition.examples && definition.examples.length"
      :examples="definition.examples"
      :language="definition.language">
    </examples>
    <div v-if="this.definitionNote">
      <em>
        {{this.definitionNote}}
      </em>
    </div>
    <references
    v-if="definition.references && definition.references.length > 0"
    :refrences="definition.references"
    :language="definition.language">
  </references>
    <div v-if="definition.url" class="goto-wrapper">&nbsp;<!--
   --><a :href="definition.url"
         :title="$t('Go to full definition')"
         target="_blank">
        {{ $t('Read more on') }} {{ this.source.displayname }}
        <img src="../views/assets/images/Icon_External_Link.png" />
      </a>
    </div>
  </div>
</div>
</template>

<script>
import AsyncImg from './AsyncImg'
import Examples from './Examples'
import References from './Reference'
import { mapState } from 'vuex'
import { Tagger } from 'glossarylib'

export default {
  props: {
    definitionId: { required: true },
    wordlist: { required: true },
    regexes: { required: true },
    lemmas: { required: true }
  },
  components: {
    AsyncImg,
    Examples,
    References
  },
  computed: {
    definition () {
      return this.definitions[this.definitionId]
    },
    source () {
      const defIdData = this.definitionId.split('/')
      return this.sources[defIdData[0] + '/' + defIdData[1]].data
    },
    emptyText () {
      return '<i name="tingtun_not_mark">' + this.$t('Not defined in ') +
      this.source.name + '</i>'
    },
    isRightAlignedLanguage () {
      return this.rightAlignedLanguages.includes(this.definition.language)
    },
    definitionNote () {
      if (this.definition.note) {
        return this.definition.note
      } else return null
    },
    definitionGloss () {
      // After the definition is inserted, make sure that any
      // links in there will open in a new window.
      this.$nextTick(() => {
        if (this.$refs.definitionText) {
          this.$refs.definitionText.querySelectorAll('a[href]')
            .forEach(el => el.setAttribute('target', '_blank'))
        }
      })
      if (this.definition.gloss === '') return this.emptyText
      return this.definition.gloss
    },
    exclude () {
      const excluded = new Set()
      for (const wordToRemove of this.lemmas) {
        excluded.add(wordToRemove)
        if (isLowerCase(wordToRemove)) {
          // If all lower case, capitalise and add it to the list.
          const capitalized = wordToRemove[0].toUpperCase() +
            wordToRemove.substr(1)
          excluded.add(capitalized)
        } else if (isUpperCaseFirstLetter(wordToRemove)) {
          // If capitalized, lowercase it and add it to the list
          const lowercased = wordToRemove.toLowerCase()
          excluded.add(lowercased)
        }
      }
      return excluded
    },
    ...mapState('Termer', ['rightAlignedLanguages',
      'fullSiteConfig', 'definitions', 'sources'])
  },
  mounted () {
    // Needed when loading in and wordlist is allready set
    this.tagIt()
  },
  updated () {
    // Needed when navigating back/forward in browser
    this.tagIt()
  },
  watch: {
    wordlist () { return this.handler() },
    regexes () { return this.handler() }
  },
  methods: {
    handler () {
      // This is needed for when wordlist is updated
      this.$refs.definitionText.innerHTML = this.definitionGloss
      this.tagIt()
    },
    tagIt () {
      const config = this.fullSiteConfig
      const highlightMode = config.highlightMode || null
      Tagger.tagIt(this.$refs.definitionText, this.wordlist, this.regexes, null, null, this.exclude, highlightMode)
    }
  }
}

function isUpperCase (c) {
  return !!c && c !== c.toLowerCase() && c === c.toUpperCase()
}

function isUpperCaseFirstLetter (c) {
  return isUpperCase(c[0]) &&
    c.substr(1) === c.substr(1).toLowerCase()
}

function isLowerCase (c) {
  return !!c && c === c.toLowerCase()
}
</script>

<style lang="sass" scoped>
// CKEditor inserts unsightly <p>’s
p
  display: inline
</style>
<style lang="sass">
// Cant be scoped as the elements are loaded in after
termer-tag.termer-hover,
termer-tag.termer-focus:not([data-temp])
  background-color: #fffde9
  box-shadow: inset 0 0 0 1px #18587b

termer-tag
  box-shadow: inset 0 -2.2px 0 #58b3c3
  cursor: pointer
  pointer-events: auto

.goto-wrapper
  margin-top: 0.4em

p
  margin-top: 0.4em
  margin-bottom: 0.4em

.rightAlignedLanguage
  text-align: right
</style>
