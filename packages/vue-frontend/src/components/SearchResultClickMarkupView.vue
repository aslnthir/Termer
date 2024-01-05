<license>
  Vertraulich
</license>

<template>
<div class="whiteBox">
  <div class="imageContainer">
      <div>
        {{ $t('Select domain to underline concepts for lookup on the page.') }}
      </div><br>

      <div>
        {{ $t('Click on the') }}
        <span tabindex="0"
              :title="titleText"
              @click="clickDemoConcept"
              @keyup.enter="clickDemoConcept"
              class="selected">{{ $t('underlined concept') }}</span>
        {{ $t('to look it up.') }}
      </div>
   </div>
</div>
</template>

<script>
export default {
  name: 'SearchResultClickMarkupView',
  data () {
    return {
      titleText: this.$t('Click to look up the phrase "underlined concept"')
    }
  },
  components: {
  },
  computed: {
  },
  created: function () {
  },
  methods: {
    clickDemoConcept (el) {
      const route = {
        name: this.$route.name,
        params: this.$route.params,
        query: this.$route.query
      }
      route.params.term = el.target.innerText
      this.$router.push(route)
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.imageContainer
  background: lightgray
  padding: 0.5em
  text-align: left

.whiteBox
  background: white
  padding: 0.5em
  border: thin solid black
  border-radius: 0.5em

.selected
  box-shadow: 0 0px 0 transparent, inset 0 -2.2px 0 #58b3c3
  cursor: pointer

.selected:focus
  z-index: 1
  background-color: #fffde9
  box-shadow: inset 0 0 0 1px #18587b
</style>
