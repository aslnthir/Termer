<license>
  Vertraulich
</license>

<template>
<div class="fullWidth fullBorder" v-if="visible">
  <div class="fullWidth minWidth">
    <h3 class="glossHeadline">
      {{ glossary.name }}
    </h3>
    <div v-if="showSaved" class="saveMessageAnnimate">
      Saved
    </div>
    <span class="alignRight margin">
      <button @click="showListTerms">{{ $t('Edit concepts') }}</button>
      <button @click="showAddNewConceptFunc">{{ $t('Add concepts') }}</button>
      <button @click="showEditMeta">{{ $t('Edit glossary') }}</button>
    </span>
  </div>
    <div v-show="showMetaEdit" class="margin">
      <table class="fullBorder">
        <tr>
          <th>{{ $t('Glossary number') }}</th>
          <td>{{ glossaryClone.id }}</td>
        </tr>
        <tr>
          <th>{{ $t('Name') }}*</th>
          <td>
            <label v-for="text in glossary_errors.name"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.name" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Short name') }}</th>
          <td>
            <label v-for="text in glossary_errors.displayname"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.displayname" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Source URL') }}</th>
          <td>
            <label v-for="text in glossary_errors.url"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.url" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Logo URL') }}</th>
          <td>
            <label v-for="text in glossary_errors.logo_url"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.logo_url" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Description') }}</th>
          <td>
            <label v-for="text in glossary_errors.description"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.description" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Contact email') }}</th>
          <td>
            <label v-for="text in glossary_errors.contact_email"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="glossaryClone.contact_email" />
              </td>
        </tr>
        <tr>
          <th>{{ $t('Concept language') }}</th>
          <td>
            <label v-for="text in glossary_errors.lang_concept"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <select v-model="glossaryClone.lang_concept" title="The language in which the concept is given">
              <option v-for="lang in languages"
                      :key="lang[0]"
                      :value="lang[0]"
                      :selected="lang[0]==glossaryClone.lang_concept">
                {{ lang[1] }}
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
            <select v-model="glossaryClone.lang_description" title="The language in which the description is given">
              <option v-for="lang in languages"
                      :key="lang[0]"
                      :value="lang[0]"
                      :selected="lang[0]==glossaryClone.lang_description">
                {{ lang[1] }}
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
            <input type="checkbox" v-model="glossaryClone.markup_words" />
          </td>
        </tr>
         <tr>
          <th>{{ $t('Private') }}</th>
          <td>
            <label v-for="text in glossary_errors.private_source"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input type="checkbox" v-model="glossaryClone.private_source" />
          </td>
        </tr>
        <tr>
          <th colspan="2">
            <button @click="updateGlossary">
              {{ $t('Save') }}
            </button>
            <button @click="showEditMeta">
              {{ $t('Cancel') }}
            </button>
            <button @click="putGlossaryInGarbage" v-show="glossary.sharePremission">
              {{ $t('Delete') }}
            </button>
            <button v-if="glossary.sharePremission" @click="showShareFunc">
              {{ $t('Share') }}
            </button>
            <button v-else @click="unShareSource">
              {{ $t('Unshare') }}
            </button>
            <button @click="toggleHeadlineExample">
              {{ headlineExampleButtonText }}
            </button>
          </th>
        </tr>
        <tr v-if="showHeadlineExample">
          <td colspan="2">
            <div class="headline-example-p">
            <p>
              {{ $t('Note on logo, if its not shown, check the url.') }}
              {{ $t('Example source headline:') }}
            </p>
            </div>
            <div class="source-reference-wrapper color-background">
              <span class="flexpand bottom-border"></span>
              <source-reference
              :source=glossaryClone
              :canEdit="false">
              </source-reference>
            </div>
          </td>
        </tr>
      </table>

    </div>
    <div class="fullBorder margin" v-if="showShare && showMetaEdit">
      <manage-share :sourceID="glossary.id"></manage-share>
    </div>
    <div v-if="showTermList" class="margin">
      <div class="flexClass">
        <div class="flex4">
          <div class="tableCell"><label>{{ $t('Search') }}: </label></div>
          <div class="tableCell fullWidth"><input @change="searchFilter" v-model="searchText" /></div>
        </div>
        <div class="flex1" v-show="showListSize">
          <select v-model="listSize" @change="updateListSize" title="Size of the list of concepts">
            <option v-for="size in listSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="alignRight">
          {{ currentListingsString }}. {{ $t('Total count of terms') }}: {{ totalCount }}
          <button :disabled="!previusTermURL" @click="getPreviusTerms">{{ $t('Previus') }}</button>
          <button :disabled="!nextTermURL" @click="getNextTerms">{{ $t('Next') }}</button>
        </div>
      </div>
      <div class="fullBorder">
        <div class="flexClass darkbg">
          <div class="childFlex1">{{ $t('Concept') }}</div>
          <div class="childFlex2">{{ $t('Description') }}</div>
          <div class="childFlex1">{{ $t('Actions') }}</div>
        </div>
        <ul>
          <li class="listStyle" v-if="showAddNewConcept">
            <new-concept @created="hideAddNewConceptFunc" :glossary="glossary"></new-concept>
          </li>
          <li v-for="lexeme in lexemes"
              :key="lexeme.id"
              class="listStyle">
            <manage-term :lexeme="lexeme" :key="lexeme.id"></manage-term>
          </li>
        </ul>
      </div>
    </div>

</div>
</template>

<script>
import sourceReference from '../SourceReference'
import manageTerm from './manageTerm'
import newConcept from './newConcept'
import manageShare from './manageShare'
import { mapState } from 'vuex'
import { helpers } from 'termer-core'
// import { TermerAPI } from 'glossaryapi-client'
// const API = new TermerAPI(process.env.VUE_APP_TERMER_BACKEND + '/glossary2/')

export default {
  name: 'singleGlossary',
  props: ['glossary', 'source'],
  data () {
    return {
      glossaries: [],
      showMetaEdit: false,
      terms: [],
      lexemes: [],
      showTermList: true,
      showAddNewConcept: false,
      showShare: false,
      showSaved: false,
      showHeadlineExample: false,
      headlineExampleButtonText: this.$t('Show headline example'),
      glossary_errors: {},
      nextTermURL: '',
      previusTermURL: '',
      listSizes: ['10', '25', '50', '75', '100', '250', '500'],
      listSize: '50',
      offset: 0,
      totalCount: 0,
      searchText: '',
      visible: true,
      glossaryClone: JSON.parse(JSON.stringify(this.glossary))
    }
  },
  computed: {
    definitionsParams () {
      const params = {
        limit: this.listSize,
        sources: this.glossary.id,
        offset: this.offset
      }
      return params
    },
    showListSize () {
      if (this.nextTermURL) {
        return true
      } else if (this.previusTermURL) {
        return true
      }
      return false
    },
    currentListingsString () {
      const startNumber = 1 + this.offset
      const endNumber = this.offset + this.terms.length
      return startNumber.toString() + ' - ' + endNumber.toString()
    },
    writeableTerms () {
      if (this.showTermList) {
        return this.terms.filter(x => x.permissions.write)
      } else {
        return []
      }
    },
    languages () {
      return Object.values(this.supportedLanguages)
    },
    ...mapState('Termer', ['supportedLanguages', 'glossaryLexemes'])
  },
  components: {
    manageTerm,
    newConcept,
    manageShare,
    sourceReference
  },
  created: function () {
    this.getDefinitions()
    this.$root.$on('updateTerms', (newTerm) => {
      this.getDefinitions()
    })
    this.$root.$on('closeCreateNewConcept', (text) => {
      this.showAddNewConcept = false
    })
    this.$root.$on('deleteTerm', (term) => {
      const index = this.terms.indexOf(term)
      if (index > -1) {
        this.terms.splice(index, 1)
      }
    })
  },
  methods: {
    getDefinitions (params = this.definitionsParams) {
      const glossaryStringId = 'Termer/' + this.source.id + '/' + this.glossary.id
      const glossaryCompId = helpers.toGlossaryId(glossaryStringId)
      if (!(glossaryStringId in this.glossaryLexemes)) {
        // this.$set(this.glossaryStatus, glossaryStringId, 'loading')
        this.$store.dispatch('Termer/fetchDefintionList', glossaryCompId)
      }
    },
    setOffset (params) {
      if (!params.offset) {
        this.offset = 0
      } else {
        this.offset = parseInt(params.offset)
      }
    },
    getURLparams (url) {
      const params = new URL(url).search.substring(1)
      return JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    },
    getNextTerms () {
      const params = this.getURLparams(this.nextTermURL)
      if (!this.searchText) {
        this.getDefinitions(params)
      } else {
        this.searchStartWith(params)
      }
    },
    getPreviusTerms () {
      const params = this.getURLparams(this.previusTermURL)
      if (!this.searchText) {
        this.getDefinitions(params)
      } else {
        this.searchStartWith(params)
      }
    },
    updateListSize () {
      if (this.searchText) {
        this.searchFilter('This is not used')
      } else {
      //  let url = this.apiTermURL
        // url += '&offset=' + this.offset
        this.getDefinitions()
      }
    },
    showEditMeta () {
      this.showMetaEdit = !this.showMetaEdit
    },
    showListTerms () {
      this.showTermList = !this.showTermList
    },
    toggleHeadlineExample () {
      this.showHeadlineExample = !this.showHeadlineExample
      if (this.showHeadlineExample) {
        this.headlineExampleButtonText = this.$t('Hide headline example')
      } else {
        this.headlineExampleButtonText = this.$t('Show headline example')
      }
    },
    updateGlossary () {
      this.showSaved = false
      const data = {
        url: this.glossaryClone.url,
        id: this.glossaryClone.id,
        name: this.glossaryClone.name,
        displayname: this.glossaryClone.displayname,
        lang_concept: this.glossaryClone.lang_concept,
        lang_description: this.glossaryClone.lang_description,
        private_source: this.glossaryClone.private_source,
        description: this.glossaryClone.description,
        markup_words: this.glossaryClone.markup_words,
        contact_email: this.glossaryClone.contact_email,
        logo_url: this.glossaryClone.logo_url
      }

      this.$store.dispatch('Termer/updateGlossary', {
        glossary: data,
        backend: 'Termer'
      })
    },
    hideSaved () {
      this.showSaved = false
    },
    showAddNewConceptFunc () {
      if (!this.showTermList) {
        this.showTermList = true
      }
      this.showAddNewConcept = true
    },
    hideAddNewConceptFunc () {
      this.showAddNewConcept = false
    },
    showShareFunc () {
      this.showShare = !this.showShare
    },
    putGlossaryInGarbage () {
      if (confirm('Are you sure you want to throw this glossary into the garbage bin?')) {
        /*
        const data = {
          in_garbedge: true
        }
        /*
        API.updateSource(this.glossary.id, data)
          .then(response => {
            response.annimate = true
            this.$store.dispatch('updateSource', response)
          })
        */
      }
    },
    getParameterByName (name, url) {
      if (!url) url = window.location.href
      name = name.replace(/[[\]]/g, '\\$&')
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
      var results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    },
    searchFilter (e) {
      if (!this.searchText) {
        this.getDefinitions()
      } else {
        this.offset = 0
        this.searchStartWith()
      }
    },
    searchStartWith (params = this.definitionsParams) {
      /*
      API.definitionSearchStart(this.searchText, params)
        .then(response => {
          this.terms = response.results
          this.nextTermURL = response.next
          this.previusTermURL = response.previous
          this.totalCount = response.count
          this.setOffset(params)
        })
      */
    },
    unShareSource () {
      /*
      API.deleteSharedAccess(this.glossary.sharedIdentifier)
        .then(response => {
          this.visible = false
        })
      */
    }
  },
  watch: {
    glossaryLexemes: function (newVal) {
      const glossaryStringId = 'Termer/' + this.source.id + '/' + this.glossary.id
      if (glossaryStringId && glossaryStringId in newVal &&
        newVal[glossaryStringId].type === 'success') {
        this.lexemes = newVal[glossaryStringId].data
      }
      /*
      Object.entries(newVal).forEach((item, i) => {
        if (item[0] in this.glossaryStatus && item[1].type === 'success') {
          this.glossaryStatus[item[0]] = item[1].type
        }
      })
      */
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$border: 1px solid var(--border-color)

.bottom-border
  border-bottom: $border
  flex: 1

.source-reference-wrapper
  text-align: right
  display: flex
  padding-bottom: 1em

.color-background
  background: rgb(255, 253, 233)

// This is for correct word weapping.
.headline-example-p
  max-width: 389px

.editGlossary
  display: none
.glossHeadline
  display: inline-block
  margin: 4px
  flex: 4
.fullWidth
  width: 100%
.minWidth
  display: flex
.flexClass
  display: flex
.childFlex1
  flex: 1
  border-bottom: thin solid
.childFlex2
  flex: 2
  border-bottom: thin solid
.termsClass
  width: 700px
.termStyle
  display: inline-block
  width: 32%
  border-bottom: thin solid
.alignRight
  text-align: right
  display: table-cell
  flex: 4
.listStyle
  list-style-type: none
.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc
.searchInput
  width: auto
.margin
  margin: 1em
.darkbg
  background: rgb(224, 224, 219)
.errorMessage
  color: red
.flex1
  flex: 1
.flex4
  flex: 4
.tableCell
  display: table-cell
.saveMessageAnnimate
  font-size: 1.4rem
  opacity: 0
  animation-name: fadeInOut
  animation-duration: 9s
  text-align: center
  float: center
  height: 50px
  line-height: 50px

.saveMessageHidden
  display: none
  background: linear-gradient(to right, rgba(0,255,0,0), rgba(0,255,0,1), rgba(0,255,0,0))

@keyframes fadeInOut
  0%
    opacity: 0

  45%
    opacity: 1

  100%
    opacity: 0%

input
  width: 99%
  box-sizing: border-box

ul
  margin: 0px
  padding: 0px
li:nth-child(even)
  background: rgb(224, 224, 219)
li:nth-child(odd)
  background: rgb(255, 253, 233)
tr:nth-child(even)
  background: rgb(224, 224, 219)
th
  background: #ffee98
  font-weight: normal

</style>
