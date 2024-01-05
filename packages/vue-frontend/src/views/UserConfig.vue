<template>
<div id="user-config-view">
  <tingtun-header></tingtun-header>
  <div class="settingsBox">
    <h2>{{ $t('Settings') }}</h2>
    <choose-language></choose-language>
    <div class="borderline"></div>
    <user-settings></user-settings>
    <div class="borderline"></div>
    <h3>{{ $t('Security settings') }}</h3>
    <div class="securityButtons">
      <div class="changePwDiv">
      <button
        class="changePwButton"
        @click="changeShowPW"
        @keyup.enter="changeShowPW">
        Change password
      </button>
      </div>
      <div class="changeEmailDiv">
      <button
        class="changeEmailButton"
        type="button"
        name="button"
        @keyup.enter="changeShowEmail"
        @click="changeShowEmail">
        {{ $t('Change email') }}
      </button>
      </div>
      <div class="delPersonalDataDiv">
      <button
        class="delPersonalDatabutton"
        type="button"
        name="button"
        @keyup.enter="showWarrningMessage"
        @click="showWarrningMessage">
        {{ $t('Clear all personal data') }}
      </button>
      </div>
    </div>
    <clear-data-warrning
      v-if="showWarrning"
      @close-warrning-window="hideWarrningMessage">
    </clear-data-warrning>
    <change-password class="changePwBox" v-if="showChangePW"></change-password>
    <div v-if="showChangeEmail" class="emailChangeDiv">
        <change-user-email></change-user-email>
    </div>
    <div class="bottomDiv">
      <button
        type="button"
        name="button"
        @keyup.enter="reloadPage"
        @click="reloadPage">
        {{ $t('Cancel') }}
      </button>
      <button
        class="saveButton"
        type="button"
        name="button"
        @keyup.enter="saveSettings"
        @click="saveSettings">
        {{ $t('Save') }}
      </button>
    </div>
  </div>
</div>
</template>

<script>
import tingtunHeader from '@/components/TingtunHeader'
import userSettings from '@/components/UserSettings'
import changePassword from '@/views/user_login/passwordChange'
import chooseLanguage from '@/components/ChooseLangauge'
import clearDataWarrning from '@/components/ClearDataWarrning'
import changeUserEmail from '@/components/ChangeUserEmail'
export default {
  name: 'userConfig',
  data () {
    return {
      showChangePW: false,
      showWarrning: false,
      showChangeEmail: false
    }
  },
  components: {
    tingtunHeader,
    changePassword,
    chooseLanguage,
    userSettings,
    clearDataWarrning,
    changeUserEmail
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    }
  },
  methods: {
    changeShowPW () {
      this.showChangePW = !this.showChangePW
    },
    changeShowEmail () {
      this.showChangeEmail = !this.showChangeEmail
    },
    saveSettings () {
      this.$store.dispatch('User/pushData')
    },
    reloadPage () {
      if (this.backUrl) {
        location.href = this.backUrl
      } else {
        location.reload()
      }
    },
    showWarrningMessage () {
      this.showWarrning = true
    },
    hideWarrningMessage () {
      this.showWarrning = false
    }
  },
  metaInfo () {
    return {
      title: this.$t('Settings')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
h2
  margin-top: 0em
h3
  margin-top: 0em
.saveButton
  float: right
.securityButtons
  display: flex
.delPersonalDataDiv
  flex: 1
.changeEmailDiv
  text-align: center
  flex: 1
.changePwDiv
  flex: 1
.delPersonalDataButton
  position: relative
  top: 50%
  transform: translateY(-50%)
.changeEmailButton
  margin: auto
  position: relative
  top: 50%
  transform: translateY(-50%)
.changePwButton
  position: relative
  top: 50%
  transform: translateY(-50%)
.changePwBox
  text-align: left
.settingsBox
  max-width: 460px
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin: 1em
.borderline
  width: 100%
  border-bottom: solid thin
  margin-top: 0.5em
.bottomDiv
  border-top: solid thin
  margin-top: 0.5em
  padding-top: 0.1em
.emailChangeDiv
  text-align: center
</style>
