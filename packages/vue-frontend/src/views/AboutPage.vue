<license>
  Vertraulich
</license>

<template>
<div>

<div class="content">
  <MarkdownTextI18n :document="document" :site="site"/>
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
  <i>{{ gitCommitHash }} ⫽ {{ gitCommitDate }}</i>
</div>

<div class="content"
  v-if="serviceWorkerNeedsUpdate">
  <refresh-alert />
</div>

</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { mapGetters } from 'vuex'
import RefreshAlert from '@/components/RefreshAlert'

export default {
  name: 'aboutPage',
  data () {
    return {
      gitCommitHash: process.env.VUE_APP_GIT_COMMIT_HASH.slice(0, 7),
      gitCommitDate: process.env.VUE_APP_GIT_COMMIT_DATE
    }
  },
  components: {
    MarkdownTextI18n,
    RefreshAlert
  },
  computed: {
    document () {
      return 'about/About_'
    },
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    ...mapGetters(['serviceWorkerNeedsUpdate', 'site'])
  },
  metaInfo () {
    return {
      title: this.$t('About')
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
