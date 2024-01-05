<license>
  Vertraulich
</license>

<template>
  <div>
    <heading :header="term"
      edit="true"
      @input="x => term = x">
    </heading>
    <entry
      edit="expanded"
      @input="x => meaning = x"
      :inlineCKEditor="true"
      :entryLanguage="source.lang_description"
      :entry="entry"></entry>
    <GlossarySelectSingle
      v-model="source" :writeOnly="true">
    </GlossarySelectSingle>
    <div v-html="status"></div>
    <button @click="doneClicked">{{ $t('Save') }}</button>
    <button @click="$router.go(-1)">{{ $t('Cancel') }}</button>
  </div>
</template>

<script>
import Entry from '@/components/Entry'
import Heading from '@/components/Heading'
import GlossarySelectSingle from '@/components/GlossarySelectSingle'
export default {
  data () {
    return {
      term: this.lemma,
      meaning: '',
      source: 'select a source',
      status: '&nbsp'
    }
  },
  computed: {
    canSaveEntry () {
      // These are required fields.
      return this.source.id && this.meaning && this.term
    },
    entry () {
      return {
        meaning: this.meaning,
        source: this.source.id || -1,
        lexemes: [{
          source: this.source.id || -1,
          terms: [{
            term: this.term,
            lemma: true
          }]
        }]
      }
    }
  },
  props: ['lemma'],
  components: {
    Entry,
    Heading,
    GlossarySelectSingle
  },
  methods: {
    doneClicked () {
      this.save().then(() => {
        this.$router.go(-1)
      }).catch(err => {
        this.status = err
      })
    },
    save () {
      if (this.canSaveEntry) {
        return Promise.reject(new Error('`createTerm()` not implemented'))
          .then(response => {
            this.$store.dispatch('addDefinition', response)
            this.status = 'Saved'
          }).catch(err => {
            let status = '<ul>'
            if (err.error) {
              for (const key of Object.keys(err.error)) {
                let errors = err.error[key]
                if (typeof errors === 'string') errors = [errors]
                if (errors.length > 1) {
                  status += '<li><ul>'
                  for (const error of errors) {
                    status += '<li>' + error
                  }
                  status += '</ul>'
                } else {
                  status += '<li>' + errors.join('')
                }
              }
              status += '</ul>'
            }
            return new Promise((resolve, reject) => reject(status))
          })
      } else {
        const status = 'All the fields are required'
        return new Promise((resolve, reject) => reject(status))
      }
    }
  }
}
</script>
