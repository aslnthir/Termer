<license>
  Vertraulich
</license>

<template>
  <span>
    <label class="size">
      <span
        :class="{
          checkedElm: checked,
          grayedOut: grayedOut,
          defaultClass: true
          }"
        :title="titleText"
        tabindex="0"
        @keyup.enter="update"
        :disabled="grayedOut">
        <input type="checkbox" v-model="checkedStatus">
        <span class="text">{{language.code}}</span>
      </span>
    </label>
  </span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'langauge-choice',
  props: [
    'language',
    'changeValue',
    'selected',
    'unavailable',
    'spesificSource',
    'conceptLanguageKey',
    'isSelected',
    'glossary'
  ],
  data () {
    return {
      checked: false
    }
  },
  components: {
  },
  computed: {
    checkedStatus: {
      get: function () {
        return this.checked
      },
      set: function (checked) {
        if (this.unavailable) return
        this.checked = checked
        this.update(checked)
      }
    },
    termerModelSelected () {
      return this.checkTermerModelSelected()
    },
    styleString () {
      if (this.styleValue) return this.styleValue
      return ''
    },
    titleText () {
      try {
        return this.language.name + ' ' +
        (
          this.language.nativeName
            ? '(' + this.language.nativeName + ')'
            : ''
        ) +
        (
          this.grayedOut
            ? this.$t('. This language is not available with the selected from languages.')
            : ''
        )
      } catch (e) {
        if (this.debug) {
          console.log('Debug language component: ', e)
        }
        return 'Unknown'
      }
    },
    grayedOut () {
      return this.unavailable
    },
    selectedClass () {
      return !(this.glossary) && this.checked
    },
    selectedGlossaryClass () {
      return this.glossary && this.checked
    },
    grayedOutGlossaryClass () {
      return this.glossary && !this.checked
    },
    selectedLanguages () {
      if (this.selected) return this.selected
      else return {}
    },
    ...mapState('Termer', ['debug'])
  },
  methods: {
    checkTermerModelSelected () {
      try {
        const selected = this.selected && this.selected.includes(this.language.code)
        return selected && !this.unavailable
      } catch (e) {
        if (this.debug) {
          console.log('Debug language component: ', e)
        }
        return false
      }
    },
    update (checkedStatus) {
      let remove = false
      if (!checkedStatus) {
        remove = true
      }
      let typeString
      let valueData
      if (this.spesificSource) {
        const values = []
        if (this.changeValue === 'ConceptLanguage') {
          if (remove) {
            this.selectedLanguages[this.language.code].forEach(x => {
              values.push(this.spesificSource.termerId + '/' + this.language.code + '/' + x)
            })
          } else {
            this.spesificSource.inputLanguages[this.language.code].forEach(x => {
              values.push(this.spesificSource.termerId + '/' + this.language.code + '/' + x)
            })
          }
        } else {
          if (remove) {
            values.push(this.spesificSource.termerId + '/' + this.conceptLanguageKey + '/' + this.language.code)
          } else {
            values.push(this.spesificSource.termerId + '/' + this.conceptLanguageKey + '/' + this.language.code)
          }
        }
        if (remove) {
          let allSelected = []
          Object.entries(this.selectedLanguages).forEach(([fromLang, toLangs]) => {
            toLangs.forEach(toLang => {
              allSelected.push(this.spesificSource.termerId + '/' + fromLang + '/' + toLang)
            })
          })
          allSelected = allSelected.filter(x => !values.includes(x))

          // this.$store.dispatch('Termer/userDeselectSource', this.spesificSource.termerId)
          typeString = 'Termer/userDeselectSource'
          valueData = this.spesificSource.termerId
          values.forEach(x => {
            this.$emit('update-event', {
              type: 'Termer/deselectUserSelectedSourceLanguage',
              value: x
            })
            // this.$store.dispatch('Termer/deselectUserSelectedSourceLanguage', x)
          })
          allSelected.forEach(x => {
            this.$emit('update-event', {
              type: 'Termer/selectUserSelectedSourceLanguage',
              value: x
            })
            // this.$store.dispatch('Termer/selectUserSelectedSourceLanguage', x)
          })
        } else {
          typeString = 'Termer/selectUserSelectedSourceLanguage'
          valueData = this.spesificSource.termerId
          // this.$store.dispatch('Termer/userSelectSource', this.spesificSource.termerId)
          values.forEach(x => {
            this.$emit('update-event', {
              type: 'Termer/selectUserSelectedSourceLanguage',
              value: x
            })
            // this.$store.dispatch('Termer/selectUserSelectedSourceLanguage', x)
          })
        }
      } else {
        if (this.changeValue === 'ConceptLanguage') {
          if (remove) {
            typeString = 'Termer/deselectFromLanguage'
            valueData = this.language.code
          } else {
            typeString = 'Termer/selectFromLanguage'
            valueData = this.language.code
          }
          this.$emit('update-event', {
            type: 'Termer/updateUserFromLanguage',
            value: {
              add: !remove,
              lang: this.language.code
            }
          })
        } else {
          if (remove) {
            typeString = 'Termer/deselectToLanguage'
            valueData = this.language.code
          } else {
            typeString = 'Termer/selectToLanguage'
            valueData = this.language.code
          }
          this.$emit('update-event', {
            type: 'Termer/updateUserToLanguage',
            value: {
              add: !remove,
              lang: this.language.code
            }
          })
        }
      }
      this.$emit('update-event', {
        type: typeString,
        value: valueData
      })
    }
  },
  created () {
    this.checked = this.termerModelSelected
  },
  watch: {
    selected (newvalue, oldval) {
      this.checked = this.checkTermerModelSelected()
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.defaultClass
  background-color: var(--termer-choice-background)
  color: var(--text-color)
  padding-left: 0.3em
  padding-right: 0.3em
  border-radius: 0.2em
  display: table
  word-break: break-word
  min-width: 2.2em
  border: solid thin
  padding: 0.3em

.choiceDiv
  padding-bottom: 0.2em
  padding-right: 0.2em

.checkedElm
  background-color: var(--termer-choice-background-selected)
  color: var(--invert-text-color)

.grayedOut
  border: 1px solid var(--termer-disable-boder)
  background-color: var(--termer-choice-background-disabled)

.size
  min-width: 2.4em
  display: inline-flex

input
  display: none

.text
  display: table-cell
  text-align: center
  width: 100%
</style>
