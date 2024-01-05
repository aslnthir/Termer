<license>
  Vertraulich
</license>

<template>
  <div class="centered-v centered">
    <div class="content">
      <div class="top">
        <glossary-search
          class="jumbo"
          :term="term"
          :hideSubmitButton="false"
          @changed="term => $router.push({name: 'showcase-search', params: { term } })"
          ></glossary-search>dfs
        <search-results :term="term"></search-results>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResults from '@/components/SearchResults'
import GlossarySearch from '@/components/GlossarySearch'

export default {
  name: 'showcase-search',
  components: {
    SearchResults,
    GlossarySearch
  },
  props: ['term']
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)

.centered
  text-align: center
  margin: 0 auto

.centered-v
  display: flex
  flex-direction: column

.fullheight
  height: 100%

.top
  flex: 1

.jumbo, .jumbo *
  font-size: 2rem
  display: inline-block
  overflow: initial
  padding-top: 1em

.content
  margin-left: 0.5em
  margin-right: 0.5em

.bottom-margin
  margin-bottom: 130px

</style>
