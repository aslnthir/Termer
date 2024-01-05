<license>
  Vertraulich
</license>

<template>
<div class="content">
  <MarkdownTextI18n document="Help" />
  <h2>{{$t('Change theme')}}</h2>
  <select @change="onChange" :title="title">
    <option v-for="name in themes" :value="name" :key="name">
      {{ name }}
    </option>
  </select>
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>

  <refresh-alert v-if="serviceWorkerNeedsUpdate" />

</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { mapGetters } from 'vuex'
import RefreshAlert from '@/components/RefreshAlert'

export default {
  name: 'HelpPage',
  components: {
    MarkdownTextI18n,
    RefreshAlert
  },
  data () {
    return {
      title: this.$t('Change theme for Termer')
    }
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    themes () {
      return [
        'default',
        'darkTheme'
      ]
    },
    ...mapGetters(['serviceWorkerNeedsUpdate'])
  },
  methods: {
    onChange (event) {
      this.$store.dispatch('updateTheme', event.target.value)
      localStorage.setItem('siteTheme', event.target.value)
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

<style lang="sass">
.helpVideo
  width: 100%

.instructVideo
  width: 50%
  display: inline
</style>
