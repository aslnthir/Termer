<license>
  Vertraulich
</license>

<template>
<div class="content">
  <MarkdownTextI18n document="home/home_" :site="site"/>
   <t-button :title="siteName" @click="openSettings" type="button">
     <router-link
       class="homePageSearchLink"
       :to="{ name: 'search' }">
       {{ searchPageLinkText }}
     </router-link>
   </t-button>
</div>
</template>

<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { mapGetters } from 'vuex'

export default {
  name: 'homePage',
  components: {
    MarkdownTextI18n
  },
  computed: {
    searchPageLinkText () {
      return this.$t('Go to') + ' ' + this.siteName
    },
    siteName () {
      let siteName = ''
      if (this.site !== 'default') siteName = this.site.toUpperCase()
      return siteName + ' TERMER'
    },
    ...mapGetters(['site'])
  },
  metaInfo () {
    return {
      title: this.$t('Home')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.homePageSearchLink
  color: var(--text-color)
  text-decoration: none

.content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  max-width: Max(30em, 55%)
  margin: auto
  margin-top: 2em
</style>
