<license>
  Vertraulich
</license>

<template>
  <div>
    {{ $t('Text length exceed the limit of characters (') }}
    {{ this.textLength }}
    {{ $t(' out of maximum 5000).') }}
    {{ $t('Please select a shorter piece of text and try again.') }}
  </div>
</template>

<script>

export default {
  name: 'termToLong',
  props: ['term'],
  data () {
    return {
    }
  },
  computed: {
    textLength () {
      return this.term.length
    }
  },
  methods: {
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
</style>
