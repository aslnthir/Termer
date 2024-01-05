<license>
  Vertraulich
</license>

<template>
  <div id="help-links">
    <router-link :to="{ name: 'help' }">{{ $t('Help') }}</router-link>
       |
    <router-link :to="{ name: 'about' }">{{ $t('About') }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'helpButtons',
  props: [],
  computed: {
    target () {
      if (window.location.hash === '#/config/') {
        return ''
      } else {
        return '_blank'
      }
    }
  }
}
</script>

<style lang="sass" scoped>
#help-links
  margin-top: 2em
</style>
