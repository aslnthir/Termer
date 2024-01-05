<template lang="md">

# Installere <span style="white-space:nowrap">Tingtun Termer</span>

<div v-if="browserIsMobile">
  <h3>For å installere TERMER på mobil</h3>
    1. Tapp på knappen merket «{{termerName}}»<br>
    2. Legg til et bokmerke for denne siden (tapp på stjernen)<br>
    3. Rediger bokmarket, erstatt URLen med scriptet<br>
</div>
<div v-else-if="browserIsFireFox">
  Høyre-klikk på knappen merket ‘{{termerName}}’ og velg "Bokmerk lenke" fra meyen
</div>
<div v-else>
  Dra og slipp knappen merket «{{termerName}}» til bokmerkeraden i nettleseren.
  Trykk Ctrl-Shift-B for å vise eller skjule bokmerkeraden.
</div>

<p>

<Bookmarklet />

<div v-if="browserIsMobile" class="instructionsMobile">
    <h3>For å bruke TERMER på en nettside</h3>
    <span>a. Gå til en side, for eksempel <a href="https://kildekompasset.no" target="blank">https://kildekompasset.no</a><br></span>
    <span>b. skriv kildebruk i adressefeltet<br></span>
    <span>c. Velg kilderbuk bokmerket (vist som alternativ med stjerne foran)<br></span>
</div>

<router-link :to="{name: 'bookmarklet-detailed'}">Klikk her</router-link>
for mer informasjon om installasjonen og for å installere Termer i nettleseren ved hjelp av tastaturet.

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
