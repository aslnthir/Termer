<license>
  Vertraulich
</license>

<template>
  <div id="manage-glossaries-view">
    <h2>{{ $t('Manage glossaries') }}</h2>
    <button class="marginBottom marginLeft" @click="showCreateGlossaryFunc">{{ $t('Create new glossary') }}</button>
    <div v-show="showCreateGlossary" class="marginBottom">
      <table class="fullBorder">
        <tr>
          <th colspan="2">{{ $t('New Glossary') }}</th>
        </tr>
        <tr>
          <th>{{ $t('Name') }}*</th>
          <td>
            <label v-for="text in glossary_errors.name"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="newGlossaryName" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Short name') }}</th>
          <td>
            <label v-for="text in glossary_errors.displayname"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="newGlossaryDisplayName" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Source URL') }}</th>
          <td>
            <label v-for="text in glossary_errors.url"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="newGlossaryURL" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Description') }}</th>
          <td>
            <label v-for="text in glossary_errors.description"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="newGlossaryDescription" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Contact email') }}</th>
          <td>
            <label v-for="text in glossary_errors.contact_email"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="newGlossaryEmail" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Concept language') }}</th>
          <td>
            <label v-for="text in glossary_errors.lang_concept"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <select v-model="newGlossaryConLang" title="The language in which the concept is given">
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>{{ $t('Concept description language') }}</th>
          <td>
            <label v-for="text in glossary_errors.lang_description"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <select v-model="newGlossaryDefLang" title="The language in which the description is given">
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>{{ $t('Highlight concepts') }}</th>
          <td>
            <label v-for="text in glossary_errors.markup_words"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input type="checkbox" v-model="newGlossaryMarkup" />
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <button @click="createNewGlossary">{{ $t('Create') }}</button>
            <button @click="cancelCreateGlossary">{{ $t('Cancel') }}</button>
          </th>
        </tr>
      </table>

    </div>
    <ul>
      <li v-for="source in manageableGlossaries"
          :key="source.id"
          :class="{ annimateListItem: source.annimate }">
        <single-source :source="source" :key="source.id"></single-source>
      </li>
    </ul>
    <div>
      <h2>{{ $t('Glossaries in garbage bin ') }}</h2>
      <ul>
        <li v-for="glossary in garbageGlossaries"
          :key="glossary.id"
          :class="{ annimateListItem: glossary.annimate }">
         <garbage-glossaries :glossary="glossary" :key="glossary.id"></garbage-glossaries>
        </li>
      </ul>
    </div>
    <div style="display: none;">
      <editor value="none"
              inline="true"
      ></editor>
    </div>
  </div>
</template>

<script>
import singleSource from '@/components/manage_glossaries/manageSingleSource'
import garbageGlossaries from '@/components/manage_glossaries/manageGarbageGlossaries'
// This is included only to make the editor load faster
// on the first editor opened on the management page.
// Thats the reason for the div that is not displayed.
import editor from '@/components/Editor'
import Vue from 'vue'
import { mapState } from 'vuex'
window.eventBus = new Vue()

export default {
  name: 'manageGlossaries',
  data () {
    return {
      newGlossaryName: '',
      newGlossaryDisplayName: '',
      newGlossaryURL: '',
      newGlossaryDescription: '',
      newGlossaryEmail: '',
      newGlossaryConLang: '',
      newGlossaryDefLang: '',
      newGlossaryMarkup: false,
      showCreateGlossary: false,
      glossary_errors: {}
    }
  },
  components: {
    singleSource,
    garbageGlossaries,
    editor
  },
  computed: {
    garbageGlossaries () {
      return this.filterdSources
        .filter(x => x.in_garbedge)
    },
    manageableGlossaries () {
      return this.filterdSources
        .filter(x => !x.in_garbedge)
    },
    filterdSources () {
      return Object.entries(this.sources).filter(
        ([key, data]) => {
          if (this.data && data.data.permissions) {
            console.log('source status?', data.data.permissions)
          }
          return key.startsWith('Termer/') &&
          data.type === 'success' &&
          data.data.permissions &&
          data.data.permissions.read &&
          data.data.permissions.write
        }
      ).map(([key, data]) => data.data)
    },
    languages () {
      return Object.values(this.supportedLanguages)
    },
    ...mapState('Termer', ['supportedLanguages', 'backends', 'sources'])
  },
  created () {
  },
  metaInfo () {
    return {
      title: this.$t('Manage Termer glossaries')
    }
  },
  methods: {
    glossaryCompare (a, b) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      }
      return 0
    },
    showCreateGlossaryFunc () {
      this.showCreateGlossary = !this.showCreateGlossary
    },
    cancelCreateGlossary () {
      this.newGlossaryName = ''
      this.newGlossaryDisplayName = ''
      this.newGlossaryURL = ''
      this.newGlossaryDescription = ''
      this.newGlossaryEmail = ''
      this.newGlossaryConLang = ''
      this.newGlossaryDefLang = ''
      this.newGlossaryMarkup = false
      this.showCreateGlossary = false
    },
    createNewGlossary () {
      const source = {
        url: this.newGlossaryURL,
        name: this.newGlossaryName,
        displayname: this.newGlossaryDisplayName,
        private_source: true,
        description: this.newGlossaryDescription,
        markup_words: this.newGlossaryMarkup,
        contact_email: this.newGlossaryEmail
      }
      const glossary = {
        url: this.newGlossaryURL,
        name: this.newGlossaryName,
        displayname: this.newGlossaryDisplayName,
        lang_concept: this.newGlossaryConLang,
        lang_description: this.newGlossaryDefLang,
        private_source: true,
        description: this.newGlossaryDescription,
        markup_words: this.newGlossaryMarkup,
        contact_email: this.newGlossaryEmail,
        source_description: source
      }
      this.$store.dispatch('Termer/createSource', {
        source: glossary,
        backend: 'Termer'
      })
    },
    popupateCreateErrors (list) {
      this.glossary_errors = list
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.manageGlossaries
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  text-align: left
  margin-left: 2em
  margin-right: 2em
  margin-bottom: 1em
  color: #2c3e50
  height: 100%

@media (max-width: 530px)
  .manageGlossaries
    margin-left: 0em
    margin-right: 0em
  h2
    margin-left: 0.5em
  .marginLeft
    margin-left: 1em

.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc

.marginBottom
  margin-bottom: 2em

.errorMessage
  color: red

.header
  background-color: #18587b
  border-bottom: 2px solid black
  margin-top: 0em
  padding: 5px 0px 0px 5px
  overflow: hidden
  min-height: 50px
  color: var(--invert-text-color)
  text-align: left
  display: flex

.termerHeadline
  flex: 1
  margin-top: 0.2em
  margin-bottom: 0.2em

.headlineLinks
  margin-right: 2em

.links
  color: var(--invert-text-color)

.annimateListItem
  animation-name: fadeInOut
  animation-duration: 9s

@keyframes fadeInOut
  0%
    opacity: 0

  45%
    opacity: 1

  100%
    opacity: 0%

a
  margin: 0.5em

input
  width: 99%
  box-sizing: border-box
tr:nth-child(even)
  background: rgb(224, 224, 219)
th
  background: #ffee98
  font-weight: normal

li
  list-style-type: none
  margin-bottom: 1em
ul
  padding: 0px
  margin: 1em
li:nth-child(even)
  background: rgb(224, 224, 219)
li:nth-child(odd)
  background: rgb(255, 253, 233)
</style>
