<license>
  Vertraulich
</license>

<template>
  x
<div class="whiteBox">
  <p class="headText">
    {{ $t('Look up concepts from the search results page or from a PDF document.')}}
  </p>
  <div class="imageContainer">
      <div class="webText">
        {{ $t('Select a') }} <span class="selected">{{ $t('text') }}</span><br>
      </div>

      <div class="text">
      {{ $t('and press the enter-key to search for the text.') }}
      </div>

      <div class="imageDiv">
        <img src="../views/assets/images/Enter-button-notebook-type1.png"
        :alt="$t('Select a text and press the enter-key to search for the text.')"
        class="defaultImage" />
      </div>

   </div>
</div>
</template>

<script>
export default {
  name: 'SearchResultDefaultHelpView',
  data () {
    return {
    }
  },
  components: {
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
.webText
  background: white
  display: inline-table
  padding: 0.2em
  border-radius: 0.5em

.imageContainer
  background: lightgray
  padding: 0.2em
  display: flex
  align-items: center

.whiteBox
  background: white
  padding: 1.5em
  border: 1px solid #ddd
  border-radius: 0.5em

.defaultImage
  width: 100%

.imageDiv
  width: 50px
  display: inline-block

.text
  display: inline-block
  margin: 0.5em

.selected
  background: #f18458
  color: white

.headText
  margin-top: 0
</style>
