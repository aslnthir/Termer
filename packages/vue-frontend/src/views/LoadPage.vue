<license>
  Vertraulich
</license>

<template>
<div class="container">
  <pulse-loader
        id="loading-indicator"
        size="2em"
        color="#2c3e50">
  </pulse-loader>
</div>
</template>

<script>
import PulseLoader from 'vue-spinner/src/PulseLoader'

export default {
  name: 'loadPage',
  components: {
    PulseLoader
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.container
  height: 100%
  display: flex
  align-items: center
  justify-content: center

.text
  font-size: 2em
</style>
