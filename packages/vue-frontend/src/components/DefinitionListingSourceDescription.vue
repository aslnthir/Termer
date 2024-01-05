<license>
  Vertraulich
</license>

<template>
  <div>
    <div class="source-reference-wrapper">
      <span class="flexpand bottom-border"></span>
      <source-reference
        :source=source
        :canEdit="canEdit(source.id)"
        @edit="toggleEdit" />
    </div>
    <div class="entries-wrapper">
      <p v-if="edit">
        {{ $t('All changes are saved automatically.') }}
      </p>
      <ul class="entry" v-for="(lemmas, lang_pair) in definitionsSorted" :key="lang_pair">
        <li class="languageItem">{{ languageName(lemmas.source_lang) }} => {{ languageName(lemmas.target_lang) }}</li>
        <li v-for="(definitionsLimited, lemmaWord) in lemmas.lemmas" v-bind:key="lemmaWord"
            class="leftAligned">
          <b v-if="lemmaWord.toLowerCase() !== searchTerm.toLowerCase()">{{lemmaWord}}</b>
          <ul aria-labelledby="source-reference"
              :class="[{'tingtun-not-mark': notMarkPopup}, {editing: edit}, 'entry']">
            <li v-for="(definition, key) in definitionsLimited" v-bind:key="definition.id" :name="key">
              <div class="li-container">
                <entry
                     :entry="definition"
                     :entryLanguage="source.lang_description"
                     :entrySourceName="source.displayname"
                     @save="value => updateMeaning(definition, value)"
                     @input="x => setModified(definition, x)"
                     :edit="edit ? (editDefinition[definition.id] ? 'expanded' : 'inline' ): ''"
                     :inlineCKEditor="true"
                     class="definition"></entry>
                <span v-if="edit" class="state-indicators">
                  <a-button v-if="editDefinition[definition.id]"
                            @click="closeEditor(definition)"
                            title="Close editor">←</a-button>
                  <a-button v-if="!editDefinition[definition.id]"
                            @click="startEditor(definition)"
                            title="Expand editor">→</a-button>
                  <editing-state :state="state[definition.id]" />
                </span>
              </div>
            </li>
            <li v-if="edit">
              <div class="li-container" v-for="(def, index) in newDefinitions" :key="index">
                <entry :entry="def"
                       :entryLanguage="source.lang_description"
                       :entrySourceName="source.displayname"
                       :edit="edit ? (editDefinition[def.id] ? 'expanded' : 'inline' ): ''"
                       @save="value => createNewDefinition(def, value, index)"
                       @input="x => setModified(def, x)"
                       :inlineCKEditor="true"
                       class="definition">
                </entry>
                <span v-if="edit" class="state-indicators">
                  <a-button v-if="editDefinition[def.id]"
                            @click="closeEditor(def)"
                            title="Close editor">←</a-button>
                  <a-button v-if="!editDefinition[def.id]"
                            @click="startEditor(def)"
                            title="Expand editor">→</a-button>
                  <editing-state :state="state[def.id]" />
                </span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
      <span v-if="edit">
        <a-button @click="addNewDefinition">
          Add another definition
        </a-button>
      </span>
    </div>
  </div>
</template>

<script>
import Entry from './Entry'
import AButton from './AButton'
import SourceReference from './SourceReference'
import EditingState from './EditingState'
import { mapState, mapGetters } from 'vuex'
import eventBus from '../eventbus'
export default {
  name: 'definition-listing',
  props: {
    definitions: {
      default: () => {},
      required: true
    },
    lexemes: {
      required: true
    },
    terms: {
      required: true
    },
    source: {
      required: true
    }
  },
  data () {
    return {
      edit: false,
      state: {},
      newDefinitions: [],
      editDefinition: {}
    }
  },
  computed: {
    lexeme () {
      const lexemes = this.definitions[Object.keys(this.definitions)[0]].lexemes
      const lexeme = lexemes[0]
      return lexeme
    },
    definitionsSorted () {
      const returnDict = {}
      for (const value in this.definitions) {
        let lemmaTerm = null
        const definition = this.definitions[value]
        for (const lexeme in definition.lexemes) {
          for (const term in this.terms) {
            if (this.terms[term].lexeme === definition.lexemes[lexeme] &&
                this.terms[term].lemma) {
              lemmaTerm = this.terms[term].term
            }
          }
        }
        if (!lemmaTerm) lemmaTerm = this.searchTerm
        if (!(definition.source_language_pair in returnDict)) {
          returnDict[definition.source_language_pair] = {
            lemmas: {},
            source_lang: definition.source_concept_language,
            target_lang: definition.source_meaning_language
          }
          returnDict[definition.source_language_pair].lemmas[lemmaTerm] = []
        } else if (!(lemmaTerm in returnDict[definition.source_language_pair].lemmas)) {
          returnDict[definition.source_language_pair].lemmas[lemmaTerm] = []
        }
        returnDict[definition.source_language_pair].lemmas[lemmaTerm].push(definition)
      }
      return returnDict
    },
    ...mapGetters(['GlossaryAPI', 'notMarkPopup']),
    ...mapState(['searchTerm', 'supportedLanguages'])
  },
  components: {
    Entry,
    SourceReference,
    AButton,
    EditingState
  },
  methods: {
    languageName (langCode) {
      return this.supportedLanguages[langCode].name
    },
    startEditor (definition) {
      this.$set(this.editDefinition, definition.id, true)
      eventBus.$emit('requestResize')
    },
    closeEditor (definition) {
      this.$delete(this.editDefinition, definition.id)
      eventBus.$emit('requestResize')
    },
    addNewDefinition () {
      const invalidId = -1 - this.newDefinitions.length
      const def = { id: invalidId, source: this.source.id, meaning: '' }
      this.newDefinitions.push(def)
    },
    canEdit () {
      // The write permission is actually granted for each entry, not each
      // source.
      // We ignore this finer granularity, and just return the write permission
      // on the source.
      if (!this.source.permissions) {
        return false
      }

      // update permission is more specific than write.
      const update = this.source.permissions.update
      const write = this.source.permissions.write
      if (typeof update !== 'undefined') {
        return update
      } else if (typeof write !== 'undefined') {
        return write
      } else {
        return false
      }
    },
    toggleEdit (editing) {
      this.edit = editing
      if (!editing) this.editDefinition = {}
      if (editing) {
        this.state = {}
      }
      eventBus.$emit('requestResize')
    },
    sourceHasResults (entries) {
      return entries && entries.length
    },
    setModified (definition, modifiedValue) {
      const entryId = definition.id
      if (modifiedValue !== definition.meaning) {
        this.$set(this.state, entryId, 'modified')
      } else {
        this.$delete(this.state, entryId)
      }
    },
    updateMeaning (definition, value) {
      const entryId = definition.id
      if (this.state[entryId] === 'processing') return

      this.$set(this.state, entryId, 'processing')

      const trimmed = value.replace(/&nbsp;/g, ' ').trim()
      this.GlossaryAPI.updateTerm(entryId, { meaning: trimmed })
        .then(response => {
          this.$store.dispatch('updateDefinition', response)
          this.$set(this.state, entryId, 'updated')
        })
        .catch(err => {
          // Maybe TODO: be more informative?
          this.$set(this.state, entryId, 'failed: ' + err)
        })
    },
    createNewDefinition (def, meaning, index) {
      this.$set(this.state, def.id, 'processing')
      const definition = {
        meaning,
        source: def.source
      }
      const lexemeId = typeof this.lexeme === 'number' ? this.lexeme : this.lexeme.id
      this.GlossaryAPI.addDefinition(lexemeId, definition)
        .then(response => {
          this.$store.dispatch('addDefinition', response)
          this.$set(this.state, response.id, 'updated') // new, real ID
          this.$delete(this.state, def.id) // old, fake ID
          this.$delete(this.newDefinitions, index)
        })
        .catch(err => {
          // Maybe TODO: be more informative?
          this.$set(this.state, def.id, 'failed: ' + err)
        })
    }
  }
}
</script>

<style lang="sass" scoped>
$border: 1px solid var(--border-color)

.entry
  padding: 0
  margin: 0em 0.5em 0em 0em

.entries + .entries
  margin-top: 0.6em

li
  list-style: circle outside
  margin-left: 1em
  &:only-child
    list-style: none
    margin-left: 0.5em

.li-container
  display: inline-flex
  width: 100%
  // ensure that the bullet is at the top
  vertical-align: top

.definition
  flex: 1

.state-indicators
  text-align: left
  -margin-left: .6em
  white-space: nowrap
  width: 5em

.source-reference-wrapper
  text-align: right
  display: flex
  margin-bottom: 1em

.leftAligned
  list-style-type: none
  text-align: left

.flexpand
  flex: 1

.bottom-border
  border-bottom: $border

.concept-editor
  margin-bottom: 0.3em
  margin-top: 0.3em
  flex: 1

ul.editing
  border: 1px solid lightgray
  border-radius: 5px
  background: white

.languageItem
  list-style-type: none
  text-align: left
  font-weight: bold

</style>

<style lang="sass">
body.app-style-wien .source-reference-wrapper
  display: none
</style>
