<license>
  Vertraulich
</license>

<template>
<div id="menu">
  <ul>
    <li>
      <div class="menuItem">
        <div class="menuButton" @click="showAddons" @keyup.enter="showAddons" tabindex="0">{{ $t('Addon') }}</div>
        <ul v-if="showAddon">
          <li>
            <a class="menuItem2" href="javascript:" @click="install" :title="$t('Only works in Firefox')">Firefox</a>
          </li>
          <li>
            <a class="menuItem2" href="https://chrome.google.com/webstore/detail/tingtun-termer/paaggbegnemfekmbabdacfnmkmodfadm">
              Chrome
            </a>
          </li>
        </ul>
      </div>
    </li>
    <!--
      These links requires user data from the Termer backend.
      They should not be part of this app menu. They should only be active if
      the Termer backend is active, and they should only be used for managing
      the Termer backend.
    <li>
      <Buttonish id="manage-link" :to="{name: 'manage'}">{{ $t('Manage Glossaries') }}</Buttonish>
    </li>
    <li>
      <Buttonish id="settings-link" :to="{name: 'userSettings'}">{{ $t('User Settings') }}</Buttonish>
    </li>
    -->
    <li>
      <Buttonish id="about-link" :to="{name: 'about'}">{{ $t('About Termer') }}</Buttonish>
    </li>
    <li>
      <Buttonish id="help-link" :to="{name: 'help'}">{{ $t('Help') }}</Buttonish>
    </li>
  </ul>
</div>
</template>

<script>
import Buttonish from './Buttonish.vue'
export default {
  name: 'termerLinks',
  data () {
    return {
      showAddon: false
    }
  },
  components: {
    Buttonish
  },
  computed: {
  },
  created: function () {
  },
  methods: {
    install () {
      const xpi = { 'Install Tingtun Termer for Firefox': '/media/webextensions/firefox/gecko/tingtun-glossary@glossary.tingtun.no/latest.zip?t=' + Date.now() }
      if (typeof InstallTrigger !== 'undefined') {
        window.InstallTrigger.install(xpi)
      }
    },
    showAddons () {
      this.showAddon = !this.showAddon
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
#menu
  text-align: center
  min-width: 200px
.menuItem
  border: thin solid
  border-radius: 5px
  border-color: black
  box-shadow: 5px 5px 5px #d0cccc
  display: inline-block
  min-width: 300px
  margin: 0.5em
  padding: 0.5em
  color: white
  background-color: #18587b

.menuButton
  cursor: pointer

.menuItem2
  border: thin solid
  border-radius: 5px
  border-color: black
  box-shadow: 5px 5px 5px #3a2456
  display: inline-block
  min-width: 200px
  margin: 0.5em
  padding: 0.5em
  color: white
  background-color: steelblue
li
  list-style-type: none
ul
  padding: 0px

</style>
