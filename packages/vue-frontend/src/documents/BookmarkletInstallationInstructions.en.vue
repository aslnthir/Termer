<template lang="md">

# Install Tingtun Termer

<div v-if="browserIsMobile">
  <h3>For å installere TERMER på mobil</h3>
    1. Tapp på knappen merket «{{termerName}}»<br>
    2. Legg til et bokmerke for denne siden (tapp på stjernen)<br>
    3. Rediger bokmarket, erstatt URLen med scriptet<br>
</div>
<div v-else-if="browserIsFireFox">
  "Right-click on the button labelled ‘{{ termerName }}’ and select "Bookmark link" from the menu.
</div>
<div v-else>
  Drag and drop the button labeled ‘{{termerName}}’ to your bookmarks bar.
  Press Ctrl-Shift-B to show or hide the bookmarks bar.
</div>
<p>

<Bookmarklet />

<div v-if="browserIsMobile" class="instructionsMobile">
    <h3>For å bruke TERMER på en nettside</h3>
    <span>a. Gå til en side, for eksempel <a href="https://kildekompasset.no" target="blank">https://kildekompasset.no</a><br></span>
    <span>b. skriv kildebruk i adressefeltet<br></span>
    <span>c. Velg kilderbuk bokmerket (vist som alternativ med stjerne foran)<br></span>
</div>

For more details and instructions for keyboard users, please refer to the <router-link :to="{name: 'bookmarklet-detailed'}">detailed installation instructions</router-link>.

</template>

<script>
import Bookmarklet from '@/components/Bookmarklet'
import { getSiteName } from 'site-configurations'
export default {
  components: {
    Bookmarklet
  },
  computed: {
    termerName () {
      if (getSiteName()) {
        return getSiteName().toUpperCase() + ' - ' + this.$t('TERMER')
      } else {
        return this.$t('TERMER')
      }
    },
    browserIsFireFox () {
      return navigator.userAgent.indexOf('Firefox') !== -1
    },
    browserIsMobile () {
      return /Mobi/i.test(navigator.userAgent)
    }
  }
}
</script>
<style>
.instructionsMobile{
  justify-content: none
}
</style>
