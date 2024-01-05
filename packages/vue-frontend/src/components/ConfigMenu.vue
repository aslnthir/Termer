<license>
  Vertraulich
</license>

<template>
  <div id="config-menu">
    <template v-if="$isInFrame()">
      <close-button class="close-button" style="color:white" />
    </template>
  </div>
</template>

<script>
import CloseButton from './CloseButton'

export default {
  name: 'configmenu',
  props: ['domainsConfig', 'config'],
  components: {
    CloseButton
  }
}
</script>

<style scoped lang="sass">
.close-button
  margin-top: 0.3em
#config-menu
  display: inline-block
  text-align: right
.dropMenu
  display: inline-block
  height: 100%
</style>
