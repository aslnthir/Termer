<template>
<layout>
  <template #header>
    <tingtun-header>
    </tingtun-header>
  </template>

  <template #main>
    <!-- <router-view></router-view> -->
    <slot />
  </template>

  <template #footer>
    <hr>
    <footer-component>
    </footer-component>
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
  data () {
    return {
      showSelect: false
    }
  },
  computed: {
    glossarySelectText () {
      return this.$t('Settings') + ' ' + (
        this.showSelect
          ? '-'
          : '+'
      )
    }
  },
  methods: {
    openSelect () {
      this.showSelect = !this.showSelect
    }
  }
}
</script>
<style lang="sass" scoped>
#glossary-select
  margin-left: 0.5em
  margin-right: 0.5em
  text-align: left
  border-color: black
  border: solid thin
  padding: 0.4em
  border-radius: 0.5em
  background-color: #f0f0f0

.pdflink, .pdflink:visited
  color: white
  font-weight: bold
  background-color: #e2574c
  padding: 0.5em
  border-radius: 0.5em
  text-decoration: none

</style>
