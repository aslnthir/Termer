<template>
<div class="container">
  <MarkdownTextI18n document="Privacy_statement" />
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">Back</a>
</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'

export default {
  name: 'privacyStatement',
  components: {
    MarkdownTextI18n
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    }
  },
  metaInfo () {
    return {
      title: this.$t('Privacy Statement')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.container
  padding: 0 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin: 0 1em
</style>
