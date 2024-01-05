<license>
  Vertraulich
</license>

<template>
  <div>
    <GlobalEvents
      @click="hideMenuOnClick"
      @keyup.escape="hideMenuOnEscape"
    />
    <div id="termerMenuButton" :class="{big: !config}" tabindex="0" v-on:click="toggleMenu" v-on:keyup.enter="toggleMenu">
      {{ $t('Menu') }}
      <menu-icon class="menu-icon" aria-hidden="true" />
    </div>
    <div id="termerMenu" class="manuDiv hiddenDiv">
      <ul class="menuList">
        <li>
          <router-link
             id="menu-home-link"
             :to="{ name: 'search' }">
            {{ this.$t('Home') }}
          </router-link>
        </li>
        <li>
          <router-link
             id="menu-contact-link"
             :to="{ name: 'contact', query: queryUrl }">
            {{ this.$t('Contact') }}
          </router-link>
        </li>
        <li>
          <router-link v-if="false"
             id="menu-manage-link"
             :to="{ name: 'manage' }"
             :target="linkTarget">
            {{ $t('Manage Glossaries') }}
          </router-link>
        </li>
        <li>
          <router-link v-if="false"
             id="menu-settings-link"
             :to="{ name: 'userSettings', query: queryUrl }">
            {{ $t('Settings') }}
          </router-link>
        </li>
        <li>
          <router-link
             id="menu-about-link"
              :to="{ name: 'about', query: queryUrl }">
            {{ $t('About') }}
          </router-link>
        </li>
        <li>
          <router-link
             id="menu-help-link"
            :to="{ name: 'help', query: queryUrl }">
            {{ $t('Help') }}
          </router-link>
        </li>
        <li>
          <router-link
             id="menu-privacy-link"
            :to="{ name: 'privacyStatement', query: queryUrl }">
            {{ $t('Privacy') }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import '@/polyfills/element-closest'
import GlobalEvents from 'vue-global-events'
import MenuIcon from 'mdi-vue/Menu'

export default {
  name: 'dropmenu',
  props: ['config'],
  components: {
    GlobalEvents,
    MenuIcon
  },
  data () {
    return {
      showMenu: false
    }
  },
  computed: {
    nextPath () {
      return this.$route.fullPath
    },
    linkTarget () {
      if (!this.config) return '_self'
      else return '_blank'
    },
    queryUrl () {
      const query = {}
      if (this.config) {
        query.back = this.nextPath
      } else if (this.$route.query.back) {
        query.back = encodeURIComponent(this.$route.query.back)
      }
      return query
    }
  },
  methods: {
    toggleMenu () {
      if (document.getElementById('termerMenu').classList.contains('hiddenDiv')) {
        document.getElementById('termerMenu').classList.remove('hiddenDiv')
      } else {
        document.getElementById('termerMenu').classList.add('hiddenDiv')
      }
    },
    hideMenuOnClick (event) {
      const target = event.target
      if (!target.closest('div#termerMenu') && !target.closest('div#termerMenuButton')) {
        const termerMenu = document.getElementById('termerMenu')
        if (termerMenu && !termerMenu.classList.contains('hiddenDiv')) {
          termerMenu.classList.add('hiddenDiv')
        }
      }
    },
    hideMenuOnEscape (event) {
      const termerMenu = document.getElementById('termerMenu')
      if (termerMenu && !termerMenu.classList.contains('hiddenDiv')) {
        termerMenu.classList.add('hiddenDiv')
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)

#termerMenuButton
  display: inline-flex
  align-items: center
  height: 100%

#termerMenuButton:hover
  cursor: pointer

.manuDiv
  background-color: white
  position: absolute
  right: 1em
  z-index: 200
  border: black thin solid
  border-radius: 0.2em
  top: 40px

.menuList
  margin: 0
  list-style-type: none
  padding-left: 0em
  padding-right: 0em

.hiddenDiv
  display: none

li
  padding-left: 1em
  padding-right: 1em
  text-align: right

li:hover
  background-color: var(--tingtun-blue)

li a:hover
  color: white
  background-color: var(--tingtun-blue)

li a
  padding-top: 0.2em
  color: black
  display: block
  width: 100%
  height: 100%

.big
  font-weight: bold
  font-size: 133%
  color: white

.menu-icon
  margin-left: 0.3em

</style>
