<license>
  Vertraulich
</license>

<template>
<div class="">
  <div class="">
    {{sourceLanguages}}
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'compareLanguages',
  props: ['sourceLanguages'],
  data () {
    return {
    }
  },
  components: {
  },
  computed: {
    someLangs () {
      console.log('update?', this.sourceLanguages)
      return this.sourceLanguages
    },
    ...mapState('Termer', ['lexemes', 'glossaries'])
  },
  methods: {
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
</style>
