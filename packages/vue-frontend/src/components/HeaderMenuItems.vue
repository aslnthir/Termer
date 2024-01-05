<license>
  Vertraulich
</license>

<template>
  <span class="headermenu">
    <span v-if="user">
      <a href="/accounts/mypage/" :target="targetBlank">{{ user.username }}</a> |
      <a href="/privateglossary/" :target="targetBlank">{{ $t('Manage glossaries') }}</a> |
      <a :href="generateNextLogoutURL">{{ $t('Logout') }}</a> |
    </span>
    <span v-else>
      <a :href="generateNextLoginURL">{{ $t('Login') }}</a> |
    </span>
  </span>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'headermenuitems',
  props: ['target'],
  computed: {
    targetBlank () {
      if (this.target) {
        return ''
      } else {
        return '_blank'
      }
    },
    logoutURL () {
      let url_ = '/logout/'
      if (this.getNext) {
        url_ = url_ + '?next=' + window.location.href.replace(window.location.origin, '')
      } else {
        url_ = url_ + window.location.search + '?next=/'
      }
      return url_
    },
    loginURL () {
      let url_ = '/accounts/login/'
      if (this.getNext) {
        url_ = url_ + '?next=' + window.location.href.replace(window.location.origin, '')
      }
      return url_
    },
    getNext () {
      if (window.location.hash && window.location.hash === '#/config/') {
        return 'config'
      } else {
        return null
      }
    },
    generateNextLogoutURL () {
      const VuePath = this.$router.resolve({ name: 'logout' })
      const origin = window.location.origin
      const path = window.location.pathname
      const query = '?next=' + encodeURIComponent(decodeURIComponent(window.location.href.replace(window.location.origin, '')))
      const hash = VuePath.href
      return origin + path + query + hash
    },
    generateNextLoginURL () {
      const VuePath = this.$router.resolve({ name: 'loginOptions' })
      const origin = window.location.origin
      const path = window.location.pathname
      const query = '?next=' + encodeURIComponent(decodeURIComponent(window.location.href.replace(window.location.origin, '')))
      const hash = VuePath.href
      return origin + path + query + hash
    },
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['checkUser'])
  },
  created: function () {
    this.checkUser()
  }
}
</script>

<style scoped lang="sass">
a, a:visited
  text-decoration-line: underline
  white-space: nowrap
  color: white

span
  font-size: 90%

</style>
