<license>
  Vertraulich
</license>

<template>
<div class="content">
  <h2>Installere Termer i nettleseren</h2>
  <video controls width="500"
        src="https://box.tingtun.no/f/344dbfebc0b44eec803f/?dl=1">
  Installere Termer i nettleseren
  </video>
  <h2>Bruk Termer sammen med DSB kart</h2>
  <video controls width="500"
        src="https://box.tingtun.no/f/96c5edc82309443782d5/?dl=1">
  Bruk Termer sammen med DSB kart
  </video>
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
</div>
</template>

<script>

export default {
  name: 'ExercisePage',
  components: {
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    }
  },
  metaInfo () {
    return {
      title: this.$t('Exercise')
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
