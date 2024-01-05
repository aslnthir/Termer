<template>
<layout>
  <template #header>
    <tingtun-header></tingtun-header>
  </template>

  <template #main>
    <!-- <router-view></router-view> -->
    <slot />
  </template>

  <template #footer>
    <hr>
    <footer-component class="footer"></footer-component>
  </template>
</layout>
</template>

<script>
import TingtunHeader from '@/components/TingtunHeader'
import FooterComponent from '@/components/FooterComponent'
import Layout from '@/layouts/3rows'
export default {
  components: {
    TingtunHeader,
    FooterComponent,
    Layout
  },
  beforeMount () {
    // Redirect to ukrainian.termer.no if the user is on the ukranian.termer.no
    // QR code for handout links to Ukranian
    const siteOrigin = window.location.href
    if (siteOrigin.indexOf('ukranian') !== -1) {
      window.location.replace(siteOrigin.replace('ukranian', 'ukrainian'))
    }
  }
}
</script>
