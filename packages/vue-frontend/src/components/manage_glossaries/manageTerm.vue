<license>
  Vertraulich
</license>

<template>
<div class="fullWidth">
  <div class="flexStyle1">
    <div v-if="!showEditDefinition">
      <span v-for="x in termData.lemmas" :key="x">
        <strong>{{ x }}</strong>
        <br>
      </span>
      <span v-if="termData.inflexions.length > 0">
        <span v-for="x in termData.inflexions" :key="x">{{x}}</span>
      </span>
    </div>
    <div v-else>
      <div v-for="term in terms" :key="term.value">
        <span>
          <input v-model="term.value" />
          <label>{{ $t('Lemma') }}: <input type="checkbox" v-model="term.lemma"/></label>
        </span>
      </div>
      <span title="Warrning: With uppercase letters the word/phrase needs to match exact to be able to mark up">&#x26a0;</span>
    </div>
  </div>
  <div class="flexStyle2">
    <div v-if="!showEditDefinition">
      <div v-for="definitionId in lexemeDefinitions[this.lexeme]" :key="definitionId">
        <div class="fullWidth">
            {{definitionMeaning(definitionId)}}
        </div>
      </div>
    </div>
    <div v-else>
      <div v-for="definitionCopy in definitionsEdit" :key="definitionCopy.id">
        <div class="flexStyle1 editLabel">
          <label>{{ $t('Meaning') }}:
          <editor v-model="definitionCopy.gloss"
                :inline="inline"
                class="whiteBG"
          ></editor></label>
        </div>
        <div class="flexStyle1 editLabel">
          <label>{{ $t('Comments') }}:
          <editor v-model="definitionCopy.comments"
                :inline="inline"
                class="whiteBG"
          ></editor></label>
        </div>
      </div>
    </div>
  </div>
  <div class="flexStyle1">
    <div v-if="showEditDefinition">
      <button @click="updateDefinition">{{ $t('Save') }}</button>
      <button @click="changeInline">{{ $t('Advanced') }}</button>
      <button @click="changeShowEdit">{{ $t('Cancel') }}</button>
    </div>
    <div v-else>
      <button @click="changeShowEdit">{{ $t('Edit') }}</button>
      <button @click="deleteTerm">{{ $t('Delete') }}</button>
    </div>
  </div>
</div>
</template>

<script>
import editor from './../Editor'
// import { TermerAPI } from 'glossaryapi-client'
import { mapState } from 'vuex'
// const API = new TermerAPI(process.env.VUE_APP_TERMER_BACKEND + '/glossary2/')

export default {
  name: 'manageTerm',
  props: ['lexeme'],
  data () {
    return {
      showEditDefinition: false,
      saveErrorMsg: '',
      inline: true,
      showError: false,
      terms: [],
      definitionsEdit: []
    }
  },
  components: {
    editor
  },
  computed: {
    termData () {
      return this.lexemes[this.lexeme]
    },
    meaningHTML () {
      const htmlObject = document.createElement('div')
      const htmlObject2 = document.createElement('div')
      htmlObject2.innerHTML = this.term.meaning
      htmlObject.appendChild(htmlObject2)
      return htmlObject.innerHTML
    },
    ...mapState('Termer', ['lexemes', 'lexemeDefinitions', 'definitions'])
  },
  created: function () {
    this.termData.forms.forEach((item, i) => {
      const termObj = {
        value: item,
        lemma: this.termData.lemmas.includes(item)
      }
      this.terms.push(termObj)
    })
    this.lexemeDefinitions[this.lexeme].forEach((item, i) => {
      const defObj = this.definition(item)
      const defCopyObj = {
        id: defObj.id,
        gloss: defObj.gloss,
        source: defObj.foundIn,
        glossary: defObj.glossaryId
      }
      if (defObj.comments) defCopyObj.comments = defObj.comments
      this.definitionsEdit.push(defCopyObj)
    })
  },
  methods: {
    updateDefinition () {
      const lexeme = {
        id: this.lexeme.split('/')[2],
        terms: this.terms
      }
      this.definitionsEdit.forEach((item, i) => {
        const lexemes = [lexeme]
        const definitionDataDict = {
          meaning: item.gloss,
          source: item.source,
          id: item.id,
          glossary: item.glossary,
          lexemes
        }
        if (item.comments) definitionDataDict.comments = item.comments
        const data = {
          backend: this.lexeme.split('/')[0],
          definition: definitionDataDict
        }
        this.$store.dispatch('Termer/updateDefinition', data)
      })

      this.showEditDefinition = !this.showEditDefinition
    },
    definition (definitionId) {
      const definition = this.definitions[definitionId]
      if (!definition) return { gloss: '' }
      return definition
    },
    deleteTerm () {
      if (confirm('Are you sure you want to delete this concept?')) {
        this.deleteProcess()
      }
    },
    deleteProcess () {
      /*
      API.deleteDefinition(this.term.id)
        .then(response => {
          for (const item in this.term.lexemes) {
            if (this.term.lexemes[item].source === this.term.source) {
              API.deleteLexeme(this.term.lexemes[item].id)
            }
          }
          this.$root.$emit('deleteTerm', this.term)
        })
        */
    },
    showWarrning (term) {
      return term.toLowerCase().substr(1) !== term.substr(1)
    },
    definitionMeaning (defId) {
      const htmlObject = document.createElement('div')
      htmlObject.innerHTML = this.definition(defId).gloss
      return htmlObject.textContent
    },
    changeShowEdit () {
      this.showEditDefinition = !this.showEditDefinition
    },
    changeInline () {
      this.inline = !this.inline
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.flexStyle2
  flex: 2

.flexStyle1
  flex: 1

.fullWidth
  width: 100%
  display: flex

@media (max-width: 530px)
  .fullWidth
    display: block

.errorMessage
  color: red

.whiteBG
  background: white
  border: thin solid
  border-radius: 5px
  padding: 2px

.editLabel
  padding: 0.5em

.line-clamp
  position: relative
  max-height: 3.9em /* exactly three lines */
  overflow: hidden
  text-overflow: ellipsis

.line-clamp:after
  content: ""
  text-align: right
  position: absolute
  bottom: 0
  right: 0
  width: 70%
  height: 1.2em

@supports (-webkit-line-clamp: 3)
  .line-clamp
    display: -webkit-box
    -webkit-line-clamp: 3
    -webkit-box-orient: vertical
    max-height: 3.6em /* I needed this to get it to work */
    height: auto
    overflow: hidden

@supports (-webkit-line-clamp: 3)
  .line-clamp:after
    display: none
</style>
