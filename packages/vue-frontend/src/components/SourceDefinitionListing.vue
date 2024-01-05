<license>
  Vertraulich
</license>

<template>
  <div id="termer-resullt-listing">
    <div v-if="sourceTypeTest">
      <definition-listing-source-description v-for="(entryIds, sourceId) in results"
          :key="sourceId"
          :source="sources[sourceId]"
          :definitions="filterDefinitions(entryIds)"
          :lexemes="lexemes"
          :terms="terms"
          class="entries" />
    </div>
    <div v-else>
      <definition-listing v-for="(entryIds, sourceId) in results"
        :key="sourceId"
        :source="sources[sourceId]"
        :definitions="filterDefinitions(entryIds)"
        :lexemes="lexemes"
        :terms="terms"
        class="entries" />
    </div>
  </div>
</template>

<script>
import DefinitionListing from './DefinitionListing'
import DefinitionListingSourceDescription from './DefinitionListingSourceDescription'
import { mapState } from 'vuex'
export default {
  name: 'source-definition-listing',
  props: {
    selectedSources: {
      default: () => [],
      required: true
    },
    searchResult: {
      default: () => {},
      required: true
    },
    definitions: {
      default: () => {},
      required: true
    },
    lexemes: {
      default: () => {},
      required: true
    },
    terms: {
      default: () => {},
      required: true
    },
    sources: {
      default: () => [],
      required: true
    }
  },
  components: {
    DefinitionListing,
    DefinitionListingSourceDescription
  },
  computed: {
    results () {
      const keys = Object.keys(this.searchResult).filter(x => this.sourceIsSelected(x))
      return keys.reduce((obj, key) => {
        const entries = this.searchResult[key]
        if (entries && entries.length > 0) {
          obj[key] = entries
        }
        return obj
      }, {})
    },
    sourceTypeTest () {
      return this.Conf.sourceType === 'sourcedescription'
    },
    ...mapState(['Conf'])
  },
  methods: {
    filterDefinitions (entryIds) {
      // Convert ints to strings,
      // because the keys in an Object are strings.
      entryIds = entryIds.map(x => x + '')
      return Object.keys(this.definitions)
        .filter(x => entryIds.indexOf(x) > -1)
        .reduce((acc, key) => { acc[key] = this.definitions[key]; return acc }, {})
    },
    sourceIsSelected (sourceId) {
      return this.selectedSources.indexOf(sourceId) > -1
    }
  }
}
</script>

<style lang="sass" scoped>
.entries + .entries
  margin-top: 0.6em
</style>
