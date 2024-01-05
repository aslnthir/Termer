<template>
<t-button :title="$t('Settings')" @click="openSettings" type="button">
  <settings-icon height="2em" width="2em" class="settings-icon" aria-hidden="true">
  </settings-icon>
</t-button>
</template>

<script>
import eventBus from '../eventbus'
import SettingsIcon from 'mdi-vue/Cog'
export default {
  components: {
    SettingsIcon
  },
  methods: {
    openSettings () {
      eventBus.$emit('openSettings')
    }
  }
}
</script>
