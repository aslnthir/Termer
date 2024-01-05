<license>
  Vertraulich
</license>

<template>
<div class="templateDiv">
  <table class="fullBorder">
    <tr>
      <th colspan="2">
        {{ $t('Recover Password') }}
      </th>
    </tr>
    <tr>
      <th>{{ $t('Password') }}</th>
      <td>
        <label class="redColor" v-if="errors.token">{{ $t('Invalid token') }}</label>
        <label class="redColor" v-if="errors.new_password1">{{ errors.new_password1[0] }}</label><br>
        <input @change="passwordMatch" v-if="showPw1" v-model="password1" autocomplete="off" type="text" />
        <input @change="passwordMatch" v-else v-model="password1" type="password" /><br>
        <label>{{ $t('Show password') }}: <input class="checkbox" type="checkbox" v-model="showPw1" /></label>
      </td>
    </tr>
    <tr>
      <th>{{ $t('Repeat password') }}</th>
      <td style="display: -webkit-box">
        <input @change="passwordMatch" v-if="showPw1" v-model="password2" autocomplete="off" type="text" />
        <input @change="passwordMatch" v-else v-model="password2" type="password" />
        <label v-if="noPwMatch" :title="$t(npPwMatchText)" :class="{'redColor': !greenText, 'greenColor': greenText}">{{ noPwMatch }}</label>
      </td>
    </tr>
    <tr>
      <th>{{ $t('Old password') }}</th>
      <td style="display: -webkit-box">
        <label class="redColor" v-if="errors.old_password">{{ errors.old_password[0] }}</label><br>
        <input v-if="showPw1" v-model="oldPassword" autocomplete="off" type="text" />
        <input v-else v-model="oldPassword" type="password" />
      </td>
    </tr>
    <tr>
      <th colspan="2">
        <button @click="confirmRecovery">{{ $t('Change password') }}</button>
      </th>
    </tr>
    <tr>
      <th colspan="2" v-if="response.detail">
        {{ response.detail }}
      </th>
    </tr>
  </table>
</div>
</template>

<script>

export default {
  name: 'passwordChange',
  props: [],
  data () {
    return {
      password1: '',
      password2: '',
      oldPassword: '',
      showPw1: false,
      npPwMatchText: '',
      noPwMatch: '',
      errors: {},
      response: {}
    }
  },
  metaInfo () {
    return {
      title: this.$t('Change password')
    }
  },
  methods: {
    async confirmRecovery () {
      const payload = {
        new_password1: this.password1,
        new_password2: this.password2,
        old_password: this.oldPassword
      }
      const { response, error } = await this.$store.dispatch('Auth/changePassword', payload)
      if (response) {
        this.response = response
        this.errors = {}
        this.resetFields()
      }
      if (error) {
        if (error.info) {
          this.errors = error.info
        } else {
          this.errors = error
        }
      }
    },
    passwordMatch (e) {
      if (this.password1 !== this.password2 && this.password1 && this.password2) {
        this.npPwMatchText = 'Passwords to not match'
        this.noPwMatch = '\u2716'
        this.greenText = false
      } else if (this.password1 && this.password2) {
        this.npPwMatchText = 'Passwords match'
        this.noPwMatch = '\u2714'
        this.greenText = true
      }
    },
    resetFields () {
      this.password1 = ''
      this.password2 = ''
      this.oldPassword = ''
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

.templateDiv
  text-align: center
table
  display: inline-block
  margin: 2em

th
  background: #ffee98
  font-weight: normal
.longInput
  width: 99%
input
  box-sizing: border-box
</style>
