<template>
<div class="warrningMessage">
  <h4>{{ $t('Warning') }}</h4>
  <p>{{ $t('This action will delete all the personal data related to Termer from your browser and from our server.') }}</p>
  <p>{{ $t('if you have used Termer in other browsers, then you may want to remove your data from them as well.') }}</p>
  <p>{{ $t('This action cannot be undone and will also assign default values to all Termer settings.') }}</p>
  <div class="dataBox">
    <div tabindex="0"
         type="button"
         @click="toggleLocalDataShow"
         @keyup.enter="toggleLocalDataShow">
      {{ $t('Show the data stored in your browser') }} <span v-if="localData">-</span><span v-else>+</span>
    </div>
    <table v-if="localData">
      <tr v-for="(value, key) in allLocalStorrageData" :key="key">
        <th>{{key}}</th><td>{{value}}</td>
      </tr>
    </table>
  </div>
  <div class="dataBox">
    <div tabindex="0"
         type="button"
         @click="toggleServerDataShow"
         @keyup.enter="toggleServerDataShow">
      {{ $t('Show the data reset stored on our server') }} <span v-if="serverData">-</span><span v-else>+</span>
    </div>
    <table v-if="serverData">
      <tr v-for="(value, key) in userSettingsShown" :key="key">
        <th>{{key}}</th><td>{{value}}</td>
      </tr>
    </table>
  </div>
  <br>
  <button
    type="button"
    name="button"
    @keyup.enter="hideWarrningMessage"
    @click="hideWarrningMessage">
    {{ $t('Cancel') }}
  </button>
  <button
    type="button"
    name="button"
    class="saveButton"
    @keyup.enter="clearPersonalData"
    @click="clearPersonalData">
    {{ $t('Confirm to clear data') }}
  </button>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'clearDataWarrning',
  data () {
    return {
      localData: false,
      serverData: false
    }
  },
  computed: {
    userSettingsShown () {
      const data = {}
      if (!this.settings) {
        return {}
      }
      for (const key in this.settings) {
        if (!(key === 'id' || key === 'user')) {
          data[key] = this.settings[key]
        }
      }
      return data
    },
    allLocalStorrageData () {
      const data = {}
      for (var i = 0, len = localStorage.length; i < len; ++i) {
        data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i))
      }
      return data
    },
    ...mapGetters('User', ['settings'])
  },
  methods: {
    clearPersonalData () {
      localStorage.clear()
      const newSettings = { ...this.settings }
      newSettings.hide_public_glossaries = false
      newSettings.hide_private_glossaries = false
      newSettings.hide_group_glossaries = false
      newSettings.stored_selected_glossaries = {}
      this.$store.commit('User/settings', newSettings)
      this.$store.dispatch('User/pushData').then(() => {
        location.reload()
      })
    },
    toggleLocalDataShow () {
      this.localData = !this.localData
    },
    toggleServerDataShow () {
      this.serverData = !this.serverData
    },
    hideWarrningMessage () {
      this.$emit('close-warrning-window')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
li
  word-break: break-word
td
  word-break: break-word
  border-top: solid thin
  border-bottom: solid thin
  background: white
th
  border-top: solid thin
  border-bottom: solid thin
table
  border-collapse: collapse
h4
  color: red
.saveButton
  float: right
.warrningMessage
  position: absolute
  padding: 1em
  top: 50%
  left: 50%
  margin-right: -50%
  transform: translate(-50%, -50%)
  background: white
  border: solid thin
  border-radius: 1em
  max-width: 500px
.dataBox
  background: lightgray
  margin-bottom: 0.5em
</style>
