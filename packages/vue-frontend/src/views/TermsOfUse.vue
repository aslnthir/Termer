<license>
  Vertraulich
</license>

<template>
<div class="content">
  <MarkdownTextI18n :document="document" :site="site" />
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { mapGetters } from 'vuex'

export default {
  name: 'TermsOfService',
  components: {
    MarkdownTextI18n
  },
  computed: {
    document () {
      return 'tos_page/terms_of_service_'
    },
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    ...mapGetters(['site'])
  },
  metaInfo () {
    return {
      title: this.$t('Terms of service')
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
