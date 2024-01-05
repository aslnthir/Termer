<license>
  Vertraulich
</license>

<template>
<div class="templateDiv">
  <div class="fullBorder">
    <div v-if="!error.detail">
      {{ $t('Please press confirm email.') }}<br><br>
      <button @click="sendCreateRequest">{{ $t('Confirm email') }}</button>
    </div>
    <div v-if="error.detail">
      {{ $t(errorMsg) }}
    </div>
  </div>
</div>
</template>

<script>

export default {
  name: 'verifyEmail',
  props: [],
  data () {
    return {
      key: '',
      response: false,
      error: {},
      errorMsg: 'Verification key not found'
    }
  },
  metaInfo () {
    return {
      title: this.$t('Verify user email')
    }
  },
  mounted () {
    const keyParam = (this.$route.params.key || '')
    if (keyParam) {
      this.key = keyParam
    }
  },
  methods: {
    sendCreateRequest () {
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
  display: inline-block
  margin: 2em
  padding: 1em
  background: #ffee98
.templateDiv
  text-align: center
</style>
