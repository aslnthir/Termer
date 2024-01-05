<license>
  Vertraulich
</license>

<template>
<div class="fullWidth fullBorder">
  <div class="fullWidth minWidth">
    <h3 class="glossHeadline">
      {{ glossary.name }}
    </h3>
    <span class="alignRight">
      <button @click="restoreGlossary">{{ $t('Restore Glossary') }}</button>
      <button @click="deleteGlossary">{{ $t('Delete Glossary') }}</button>
    </span>
  </div>
</div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'singleGarbageGlossary',
  props: ['glossary'],
  data () {
    return {
      sourceEndpoint: 'sources/',
      glossaries: []
    }
  },
  computed: {
    GlossaryAPI () {
      return this.$store.getters.GlossaryAPI
    },
    ...mapState([
      'sources'
    ])
  },
  components: {
  },
  created: function () {
  },
  methods: {
    showEditMeta () {
      this.showMetaEdit = !this.showMetaEdit
    },
    showListTerms () {
      this.showTermList = !this.showTermList
    },
    restoreGlossary () {
      const data = {
        in_garbedge: false
      }
      this.GlossaryAPI.updateSource(this.glossary.id, data)
        .then(response => {
          response.annimate = true
          this.$store.dispatch('updateSource', response)
        })
    },
    deleteGlossary () {
      if (confirm('Are you sure you want to delete this glossary?')) {
        this.GlossaryAPI.deleteSource(this.glossary.id)
          .then(response => {
            this.$store.dispatch('deleteSource', this.glossary)
          })
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.editGlossary
  display: none
.glossHeadline
  display: inline-block
  margin: 4px
  flex: 4
.fullWidth
  width: 100%
.minWidth
  min-width: 385px
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
  margin: 5px
.listStyle
  list-style-type: none
.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc
.marginBottom
  margin-bottom: 2em
.darkbg
  background: rgb(224, 224, 219)

li:nth-child(even)
  background: rgb(224, 224, 219)
li:nth-child(odd)
  background: rgb(255, 253, 233)
tr:nth-child(even)
  background: rgb(224, 224, 219)
th
  background: #ffee98

</style>
