<license>
  Vertraulich
</license>

<template>
<div id="header">
  <h1 class="termerHeadline">
    <router-link
       id="menu-home-link"
       :to="{ name: 'search' }">
      <span class="headerTitle" id="wide-text">{{ headTitleLong }}</span>
      <span class="headerTitle" id="narrow-text">{{ headTitleShort }}</span>
    </router-link></h1>
  <slot></slot>
  <site-language></site-language>
  <config-menu v-if="!dropMenu" id="config-menu" :config="false"></config-menu>
</div>
</template>

<script>
import ConfigMenu from './ConfigMenu'
import { getSiteName } from 'site-configurations'
import SiteLanguage from './ChangeWebsiteLanguage'

export default {
  name: 'tingtunHeader',
  components: {
    ConfigMenu,
    SiteLanguage
  },
  props: ['dropMenu'],
  computed: {
    headTitleShort () {
      if (getSiteName()) {
        return this.$t('TERMER') + ' - ' + getSiteName().toUpperCase()
      } else {
        return this.$t('TERMER')
      }
    },
    headTitleLong () {
      if (getSiteName()) {
        return this.$t('Tingtun TERMER') + ' - ' + getSiteName().toUpperCase()
      } else {
        return this.$t('Tingtun TERMER')
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
#header
  background-color: var(--termer-header-background)
  border-bottom: 2px solid black
  margin-top: 0em
  margin-bottom: 0em
  padding-left: 5px
  overflow: hidden
  color: var(--invert-text-color)
  text-align: left
  display: flex
  white-space: nowrap

#header > * + *
  margin-left: 1em

h1
  font-weight: bold
  font-size: 133%
  color: var(--invert-text-color)
  margin: 0
  padding-left: 1em
  padding-bottom: 0.1em
  padding-top: 0.3em
  display: inline-block
  flex: 1

.dropMenu
  margin-right: 1em

#config-menu
  text-align: right
  margin-right: 0.3em

#menu-home-link
  text-decoration: none

.headerTitle
  color: var(--invert-text-color)

#narrow-text
  display: inline

#wide-text
  display: none

@media (min-width: 450px)
  #narrow-text
    display: none
  #wide-text
    display: inline
</style>
