<license>
  Vertraulich
</license>

<template>
<form class="templateDiv">
  <table class="fullBorder">
    <tr>
      <th colspan="2">
        {{ $t('Recover Password') }}
      </th>
    </tr>
    <tr>
      <th>{{ $t('Email') }}</th>
      <td>
        <label v-if="response">{{ response }}</label>
        <span v-if="!response">
          <label class="redColor" v-if="errors.email">{{ errors.email[0] }}</label>
          <label class="redColor" v-if="errors.non_field_errors">{{ errors.non_field_errors[0] }}</label><br>
          <input v-model="email" type="email" class="longInput" />
        </span>
      </td>
    </tr>
    <tr>
      <th colspan="2">
        <span v-if="!response">
        <button @click.prevent="sendRecovery">{{ $t('Request') }}</button>
        </span>
      </th>
    </tr>
    <tr>
      <th colspan="2">
        {{ response.detail }}
      </th>
    </tr>
  </table>
</form>
</template>

<script>

export default {
  name: 'passwordRecovery',
  props: [],
  data () {
    return {
      email: '',
      errors: {},
      response: ''
    }
  },
  components: {
  },
  computed: {
    data () {
      const data = {
        email: this.email
      }
      return data
    }
  },
  metaInfo () {
    return {
      title: this.$t('Password Recovery')
    }
  },
  methods: {
    sendRecovery () {
      throw new Error('not implemented')
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
