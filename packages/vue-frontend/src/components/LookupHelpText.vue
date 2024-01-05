<license>
  Vertraulich
</license>

<template>
<div>
  <div class="content">
    <div class="box1">
      <p class="ptag" v-html="textPartOne"></p>
      <p class="ptag" v-html="textPartTwo"></p>
    </div>
    <div class="box2">
      <img src="../views/assets/images/Enter-button-notebook-type1.png" class="enterImg" :alt="imageText" />
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'lookupHelpText',
  data () {
    return {
      textPartOne: this.$t('To lookup words or concepts you can select <span style="background: #adc5e7">text</span> like you do to copy it, and press the enter-key.'),
      textPartTwo: this.$t('On the mobile you can “tap” on the selected text.'),
      imageText: this.$t('Image of the enter key')
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
.box1
  display: inline-block
  background: white
  border-radius: 0.5em
  bordeR: solid thin
  padding: 0.5em
  vertical-align: middle

.box1 > div
  display: inline

.box2
  display: inline-block
  vertical-align: middle
  margin-left: 1em

.ptag
  display: block

.content
  margin-left: 1em
  margin-right: 1em
  padding: 1em
  border-radius: 0.5em
  display: inline-block
  background: lightgray
.enterImg
  width: 7em
</style>
