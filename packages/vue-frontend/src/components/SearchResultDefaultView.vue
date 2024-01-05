<license>
  Vertraulich
</license>

<template>
<div>
  <search-result-click-markup-view v-if="domainsConfig"></search-result-click-markup-view>
</div>
</template>

<script>
import SearchResultClickMarkupView from './SearchResultClickMarkupView'

export default {
  name: 'SearchResultDefaultView',
  data () {
    return {
    }
  },
  props: {
    domainsConfig: String
  },
  components: {
    SearchResultClickMarkupView
  },
  computed: {
  },
  created: function () {
  },
  methods: {
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>

</style>
