<license>
  Vertraulich
</license>

<template>
<div class="content">
  <h1 class="no_margin_left">{{ siteHeading }}</h1>

  <p>{{ $t('Click on a highlighted concept to show descriptions in a popup window. Select a word and press Enter to get the description of words that are not highlighted. For tablets and smartphones an additional tap on the selected word is needed to show the description.') }}</p><br>
  <lookup-help-text></lookup-help-text>
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
</div>
</template>

<script>
import lookupHelpText from '@/components/LookupHelpText'

export default {
  name: 'helpPage',
  data () {
    return {
      siteHeading: this.$t('Tingtun Termer help')
    }
  },
  components: {
    lookupHelpText
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    }
  },
  metaInfo () {
    return {
      title: this.$t('Help')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  max-width: Max(30em, 55%)
  margin: auto
  margin-top: 2em
</style>
