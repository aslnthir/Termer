<template>
<span>
  <span
    v-if="showAlert">
    <cloud-outline
      height="2em"
      width="2em"
      class="settings-icon"
      aria-hidden="true">
    </cloud-outline>
  </span>
  <span
    v-if="showDownload">
    <cloud-download-outline
      height="2em"
      width="2em"
      class="settings-icon"
      aria-hidden="true">
    </cloud-download-outline>
    <pulse-loader
      id="loading-indicator"
      :loading="true"
      class="loadingBar"
      size="0.5em">
    </pulse-loader>
  </span>
  <span
    v-if="showCheck">
    <cloud-check-outline
      height="2em"
      width="2em"
      class="settings-icon"
      aria-hidden="true">
    </cloud-check-outline>
  </span>
</span>
</template>

<script>
import { mapState } from 'vuex'
import CloudOutline from 'mdi-vue/CloudOutline'
import CloudDownloadOutline from 'mdi-vue/CloudDownloadOutline'
import CloudCheckOutline from 'mdi-vue/CloudCheckOutline'
import PulseLoader from 'vue-spinner/src/PulseLoader'
// check-bold
// cloud-check
// cloud-download
// cloud-alert
export default {
  name: 'statusIcon',
  data () {
    return {
    }
  },
  props: [
    'status'
  ],
  components: {
    CloudOutline,
    CloudDownloadOutline,
    CloudCheckOutline,
    PulseLoader
  },
  computed: {
    showAlert () {
      return this.status === 'notasked'
    },
    showDownload () {
      return this.status === 'loading'
    },
    showCheck () {
      return this.status === 'success'
    },
    ...mapState('Termer', [])
  },
  mounted () {
  },
  updated () {
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style lang="sass" scoped>
#loading-indicator
  display: inline
</style>
