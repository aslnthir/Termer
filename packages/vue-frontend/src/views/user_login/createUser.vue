<license>
  Vertraulich
</license>

<template>
<form class="templateDiv">
  <table class="fullBorder">
    <tr>
      <th colspan="2" class="contrastBackground">
        {{ $t('Create new user for Tingtun Termer') }}
      </th>
    </tr>
    <tr>
      <th class="contrastBackground">{{ $t('Email') }}</th>
      <td>
        <label class="redColor" v-if="errors.username">{{ errors.username[0] }}</label>
        <label class="redColor" v-if="errors.email">{{ errors.email[0] }}</label><br>
        <input v-model="email" type="email" class="longInput" />
      </td>
    </tr>
    <tr>
      <th class="contrastBackground">{{ $t('Password') }}</th>
      <td>
        <label class="redColor" v-if="errors.password1">{{ errors.password1[0] }}</label><br>
        <input @change="passwordMatch" v-if="showPw1" v-model="password1" autocomplete="off" type="text" />
        <input @change="passwordMatch" v-else v-model="password1" type="password" />
        <label>{{ $t('Show password') }}: <input class="checkbox" type="checkbox" v-model="showPw1" /></label>
      </td>
    </tr>
    <tr>
      <th class="contrastBackground">{{ $t('Repeat password') }}</th>
      <td style="display: -webkit-box">
        <input @change="passwordMatch" v-if="showPw1" v-model="password2" autocomplete="off" type="text" />
        <input @change="passwordMatch" v-else v-model="password2" type="password" />
        <label v-if="noPwMatch" :title="$t(npPwMatchText)" :class="{'redColor': !greenText, 'greenColor': greenText}">{{ noPwMatch }}</label>
      </td>
    </tr>
    <tr>
      <th class="contrastBackground">{{ $t('Access code') }}</th>
      <td>
        <label class="redColor" v-if="errors.accessCode">{{ errors.accessCode[0] }}<br></label>
        <input class="longInput" v-model="accessCode" />
      </td>
    </tr>
    <tr>
      <th class="contrastBackground">{{ $t('') }}</th>
      <td>
        <input class="" type="checkbox" v-model="privacyAccept" />
        <label class="">{{ $t('Accept our ') }}<a href="/privacy/">{{ $t('privacy policy') }}</a></label>
        <label class="redColor" v-if="errors.privacyAccept"><br>{{ errors.privacyAccept[0] }}</label>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="contrastBackground">
        <button @click="sendCreateRequest">{{ $t('Register') }}</button>
        <button @click="changeToLogin">{{ $t('Cancel') }}</button>
        <div v-if="errors.nonFieldErrors">
          {{ errors.nonFieldErrors }}
        </div>
      </td>
    </tr>
  </table>
</form>
</template>

<script>

import Vue from 'vue'

export default {
  name: 'createUser',
  props: [],
  data () {
    return {
      password1: '',
      password2: '',
      showPw1: false,
      email: '',
      noPwMatch: '',
      npPwMatchText: '',
      accessCode: '',
      greenText: true,
      privacyAccept: false,
      errors: {}
    }
  },
  metaInfo () {
    return {
      title: this.$t('Create new user')
    }
  },
  methods: {
    async sendCreateRequest () {
      if (this.password1 !== this.password2 || !this.email || !this.password1) return
      /*
      const data = {
        'username': this.email,
        'email': this.email,
        'password1': this.password1,
        'password2': this.password2,
        'accesscode': this.accessCode,
        'privacyAccept': this.privacyAccept
      }
      */
      try {
        await Promise.reject(new Error('`createUser()` not implemented'))
        if ('next' in this.$route.query) {
          window.location = window.location.origin + this.$route.query.next
        } else {
          window.location = window.location.origin
        }
      } catch (error) {
        if (error.info) {
          Vue.set(this, 'errors', error.info)
        } else {
          Vue.set(this.errors, 'nonFieldErrors', JSON.stringify(error))
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
    changeToLogin () {
      this.$router.push({ name: 'loginOptions' })
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

.contrastBackground
  background: #ffee98
  font-weight: normal

.longInput
  width: 99%
input
  box-sizing: border-box
</style>
