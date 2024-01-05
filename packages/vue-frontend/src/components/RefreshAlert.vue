<template>
  <div>
    <span>{{ $t('Please refresh this page to get the latest version.') }}</span>
    <button @click="refresh()">{{ $t('I’m ready!') }}</button>
    <p>
      {{ $t('For Chrome, Edge, and Firefox: Hold the Ctrl key and press the F5 key, or hold the Ctrl and Shift keys and press R.') }}
    </p>
    <p>
      {{ $t('For Mac OS: Hold down the ⇧ Shift key and click the Reload toolbar button or hold down the Cmd key and press R.') }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'refresh-alert',
  methods: {
    async refresh () {
      if (navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.unregister()
        }
      }
      window.location.reload(true)
    }
  }
}
</script>

<style lang="sass" scoped="true">
div
  font-weight: bold
  background-color: white
  text-align: center
  padding: 1.5em 0
  button
    margin: 0 1em
</style>
