<license>
  Vertraulich
</license>

<template>
<div class="content">
  <MarkdownTextI18n document="Thanks_page" />
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'

export default {
  name: 'Thanks',
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
      title: this.$t('Terms of use')
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
