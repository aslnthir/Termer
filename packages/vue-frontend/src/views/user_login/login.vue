<license>
  Vertraulich
</license>

<template>
<form id="termer-login-form" class="templateDiv">
  <table class="fullBorder">
    <tr>
      <th colspan="2">
        {{ $t('Login to Tingtun Termer') }}
      </th>
    </tr>
    <tr>
      <th>{{ $t('Email/Username') }}</th>
      <td>
        <label class="redColor" v-if="errors.username">{{ errors.username[0] }}</label>
        <label class="redColor" v-if="errors.non_field_errors">{{ errors.non_field_errors[0] }}</label><br>
        <input v-model="email" type="email" class="longInput" autocomplete="username" />
      </td>
    </tr>
    <tr>
      <th>{{ $t('Password') }}</th>
      <td>
        <label class="redColor" v-if="errors.password">{{ errors.password[0] }}</label><br>
        <input v-if="showPw1" v-model="password1" autocomplete="off" type="text" />
        <input v-else v-model="password1" type="password" autocomplete="current-password" />
        <label>{{ $t('Show password') }}: <input class="checkbox" id="checkbox" type="checkbox" v-model="showPw1" /></label>
      </td>
    </tr>
    <tr>
      <th colspan="2">
        <button @click.prevent="loginUser">{{ $t('Login') }}</button>
        <button @click.prevent="changeToRecover">{{ $t('Forgot password?') }}</button>
      </th>
    </tr>
  </table>
</form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'login',
  props: [],
  data () {
    return {
      password1: '',
      showPw1: false,
      email: '',
      errors: {}
    }
  },
  computed: {
    ...mapState('Termer', ['backends'])
  },
  metaInfo () {
    return {
      title: this.$t('Login')
    }
  },
  methods: {
    async loginUser () {
      const payload = {
        username: this.email,
        password: this.password1
      }
      try {
        await this.$store.dispatch('Termer/login', payload)
      } catch (error) {
        if (error.info) {
          if (error.info.detail) {
            this.errors = { non_field_errors: [error.info.detail] }
          } else {
            this.errors = error.info
          }
        }
      }
    },
    changeToRecover () {
      this.$router.push({ name: 'passwordRecovery' })
    },
    goToNext () {
      if ('next' in this.$route.query) {
        let query = {}
        if ('cfg' in this.$route.query) {
          query = { cfg: this.$route.query.cfg }
        }
        const newRoute = { path: this.$route.query.next, query }
        this.$router.push(newRoute)
      } else {
        this.$router.push('/')
      }
    }
  },
  watch: {
    backends: function (currentValue, oldValue) {
      if (currentValue.Termer && currentValue.Termer.config &&
        currentValue.Termer.config.authenticated &&
        currentValue.Termer.config.authenticated.data
      ) {
        this.goToNext()
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc
.checkbox
  width: auto

.redColor
  color: red
.greenColor
  color: green

// Reson for this class and the parent div
// https://stackoverflow.com/questions/27829250/child-margin-doesnt-affect-parent-height
.templateDiv
  text-align: center
  overflow: auto

table
  display: inline-block
  margin: 1em

th
  background: #ffee98
  font-weight: normal
.longInput
  width: 99%
input
  box-sizing: border-box
</style>
