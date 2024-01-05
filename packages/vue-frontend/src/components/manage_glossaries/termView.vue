<license>
  Vertraulich
</license>

<template>
<div class="content">
  <div>
    {{term}}
  </div>
</div>
</template>

<script>
// import { mapState } from 'vuex'
// import levenshtein from 'js-levenshtein'
// Damerau–Levenshtein distance
export default {
  name: 'termView',
  props: ['term'],
  data () {
    return {
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
</style>
