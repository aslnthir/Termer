<license>
  Vertraulich
</license>

<template>
<div class="fullWidth fullBorder" v-if="visible">
  <div class="fullWidth minWidth">
    <h3 class="glossHeadline">
      {{ source.name }}
    </h3>
    <div v-if="showSaved" class="saveMessageAnnimate">
      Saved
    </div>
    <span class="alignRight margin">
      <button @click="showEditMeta">{{ $t('Edit source') }}</button>
    </span>
  </div>
    <div v-show="showMetaEdit" class="margin">
      <table class="fullBorder">
        <tr>
          <th>{{ $t('Glossary number') }}</th>
          <td>{{ sourceClone.id }}</td>
        </tr>
        <tr>
          <th>{{ $t('Name') }}*</th>
          <td>
            <label v-for="text in source_errors.name"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.name" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Short name') }}</th>
          <td>
            <label v-for="text in source_errors.displayname"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.displayname" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Source URL') }}</th>
          <td>
            <label v-for="text in source_errors.url"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.url" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Logo URL') }}</th>
          <td>
            <label v-for="text in source_errors.logo_url"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.logo_url" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Description') }}</th>
          <td>
            <label v-for="text in source_errors.description"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.description" />
          </td>
        </tr>
        <tr>
          <th>{{ $t('Contact email') }}</th>
          <td>
            <label v-for="text in source_errors.contact_email"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input v-model="sourceClone.contact_email" />
              </td>
        </tr>
        <tr>
          <th>{{ $t('Highlight concepts') }}</th>
          <td>
            <label v-for="text in source_errors.markup_words"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input type="checkbox" v-model="sourceClone.markup_words" />
          </td>
        </tr>
         <tr>
          <th>{{ $t('Private') }}</th>
          <td>
            <label v-for="text in source_errors.private_source"
                   :key="text"
                   class="errorMessage">{{ text }}<br></label>
            <input type="checkbox" v-model="sourceClone.private_source" />
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
            <button @click="putGlossaryInGarbage" v-show="source.sharePremission">
              {{ $t('Delete') }}
            </button>
            <button v-if="source.sharePremission" @click="showShareFunc">
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
              :source=sourceClone
              :canEdit="false">
              </source-reference>
            </div>
          </td>
        </tr>
      </table>

    </div>
    <div class="fullBorder margin" v-if="showShare && showMetaEdit">
      <manage-share :sourceID="source.id"></manage-share>
    </div>
    <div class="margin">
      <ul>
        <li v-for="glossary in source.glossaries"
            :key="glossary.id"
            :class="{ annimateListItem: glossary.annimate }">
          <single-glossary
            :glossary="glossary"
            :source="source"
            :key="glossary.id"></single-glossary>
        </li>
      </ul>
    </div>

</div>
</template>

<script>
import singleGlossary from '@/components/manage_glossaries/manageSingleGlossary'
import sourceReference from '../SourceReference'
import manageShare from './manageShare'

export default {
  name: 'singleSource',
  props: ['source'],
  data () {
    return {
      glossaries: [],
      showMetaEdit: false,
      showTermList: false,
      showAddNewConcept: false,
      showShare: false,
      showSaved: false,
      showHeadlineExample: false,
      headlineExampleButtonText: this.$t('Show headline example'),
      source_errors: {},
      nextTermURL: '',
      previusTermURL: '',
      listSizes: ['10', '25', '50', '75', '100', '250', '500'],
      listSize: '50',
      offset: 0,
      totalCount: 0,
      searchText: '',
      visible: true,
      sourceClone: JSON.parse(JSON.stringify(this.source))
    }
  },
  computed: {
    definitionsParams () {
      const params = {
        limit: this.listSize,
        sources: this.source.id,
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
    }
  },
  components: {
    singleGlossary,
    manageShare,
    sourceReference
  },
  created: function () {
  },
  methods: {
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
    showEditMeta () {
      this.showMetaEdit = !this.showMetaEdit
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
        id: this.sourceClone.id,
        name: this.sourceClone.name,
        displayname: this.sourceClone.displayname,
        url: this.sourceClone.url,
        logo_url: this.sourceClone.logo_url,
        description: this.sourceClone.description,
        contact_email: this.sourceClone.contact_email,
        private_source: this.sourceClone.private_source,
        markup_words: this.sourceClone.private_source
      }

      this.$store.dispatch('Termer/updateSource', {
        source: data,
        backend: 'Termer'
      })
    },
    hideSaved () {
      this.showSaved = false
    },
    showShareFunc () {
      this.showShare = !this.showShare
    },
    putGlossaryInGarbage () {
      if (confirm('Are you sure you want to throw this source into the garbage bin?')) {
        const data = {
          in_garbedge: true
        }
        console.log(data)
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
