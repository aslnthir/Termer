<template>
  <div id="defaultcontainer">
    <h4>{{ $t('Change email') }}</h4>
    <label for="email">{{ $t('Email') }}
      <input
        type="email"
        id="email"
        name="email"
        placeholder="example@mail.com"
        v-model="email"/>
    </label>
    <div>
      {{ $t('Verified: ') }}
      <span class="verifedEmailMessage"
            :title="verifedTitle"
            v-if="email_verified">&#x2713;</span>
      <span class="notVerifedTitle"
            :title="notVerifedTitle"
            v-else>&#x2716;</span>
    </div>
  </div>
</template>

<script>
import { mapUserFields } from '@/store/user'

export default {
  name: 'changeUserEmail',
  props: [],
  computed: {
    ...mapUserFields([
      'email',
      'email_verified'
    ]),
    verifedTitle () {
      return this.$t('The email is verifed')
    },
    notVerifedTitle () {
      return this.$t('The email is not verifed')
    }
  }
}
</script>

<style lang="sass" scoped>
#defaultcontainer
  margin: 0 auto
  border: solid thin
  border-radius: 0.5em
  padding: 1em
  display: inline-block
  background-color: #ffee98
  text-align: initial
  margin: 1em
  box-shadow: 5px 5px 5px #d0cccc
h4
  margin-bottom: 0.3em
  margin-top: 0em
.verifedEmailMessage
  color: green
  font-weight: bold
  font-size: x-large
.notVerifedTitle
  color: red
  font-weight: bold
  font-size: x-large
</style>
