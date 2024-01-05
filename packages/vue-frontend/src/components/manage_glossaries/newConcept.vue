<license>
  Vertraulich
</license>

<template>
<div class="fullWidth">
  <div class="flexStyle1">
    <div v-for="n in conceptNumber" :key="n" name="concept">
      <label v-if="errorMsg.lexemes" class="errorMsg">
      {{errorMsg.lexemes[0].lexeme.terms[0].term[0]}}
      <br></label>
      <input v-model="newConcept" />ii
      <span><label title="Groundform">{{ $t('Lemma') }}: <input type="checkbox" v-model="newLemma" disabled /></label></span>
      <span v-if="showWarrning(newConcept)" title="Warrning: With uppercase letters the word/phrase needs to match exact to be able to mark up">&#x26a0;</span>
    </div>
  </div>
  <div class="flexStyle2">
    <div class="fullWidth">
      <div class="flexStyle1 editLabel">
      <label v-if="errorMsg.meaning" class="errorMsg">{{ errorMsg.meaning[0] }}<br></label>
      <label>{{ $t('Meaning') }}:
      <editor v-model="newDescription"
              :inline="inline"
              class="whiteBG"
      ></editor></label>
      </div>
      <div class="flexStyle1 editLabel">
      <label>{{ $t('Comments') }}:
      <editor v-model="newComments"
              :inline="inline"
              class="whiteBG"
      ></editor></label>
      </div>
    </div>
  </div>
  <div class="flexStyle1">
    <button @click="createNewTerm">{{ $t('Save') }}</button>
    <button @click="cancelCreateNewConcept">{{ $t('Cancel') }}</button>
  </div>
</div>
</template>

<script>
import editor from './../Editor'

export default {
  name: 'manageTerm',
  props: ['glossary'],
  data () {
    return {
      conceptNumber: 1,
      emptyConcept: 1,
      newDescription: '',
      newComments: '',
      newConcept: '',
      newLemma: true,
      showConceptError: false,
      showDescriptionError: false,
      lexemeDict: {},
      errorMsg: {},
      inline: true
    }
  },
  components: {
    editor
  },
  computed: {
    lexemes () {
      const lexeme = {
        source: this.glossary.id,
        terms: this.terms
      }
      return [lexeme]
    },
    terms () {
      const term = {
        term: this.newConcept,
        lemma: this.newLemma
      }
      return [term]
    }
  },
  created: function () {
  },
  methods: {
    updateConceptNumber (e) {
      if (this.emptyConcept <= 1 && e.target.value !== '') {
        this.conceptNumber += 1
      } else if (this.emptyConcept > 1) {
        this.emptyConcept -= 1
      } else {
        this.emptyConcept += 1
      }
    },
    createNewTerm () {
      this.showConceptError = false
      if (!this.newComments) {
        this.newComments = null
      }
      const term = {
        meaning: this.newDescription,
        source: this.glossary.id,
        comments: this.newComments,
        lexemes: this.lexemes
      }

      this.$store.dispatch('Termer/createTerm', { term, backend: 'Termer' })
      this.$emit('created', 'close')
    },
    resetCreateNewTerm () {
      this.newConcept = ''
      this.newComments = null
      this.newDescription = ''
      this.$root.$emit('closeCreateNewConcept', 'newTerms')
    },
    cancelCreateNewConcept () {
      this.resetCreateNewTerm()
      this.$root.$emit('closeCreateNewConcept', 'newTerms')
    },
    showWarrning (term) {
      return term.toLowerCase().substr(1) !== term.substr(1)
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

.errorMsg
  color: red

.whiteBG
  background: white
  border: thin solid
  border-radius: 5px
  padding: 2px

.editLabel
  padding: 0.5em
</style>
