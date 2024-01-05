<license>
  Vertraulich
</license>

<template>
  <div class="parentDiv">
    <div class="fullBorder templateDiv">
      <Buttonish id="termer-login"
                 class="big"
                 :to="{name: 'login', query: this.$route.query}"
                 :title="$t('Login using Tingtun Termer')">
        Tingtun Termer {{ $t('login') }}
      </Buttonish>
      <Buttonish id="termer-new-user"
                 class="big"
                 :to="{name: 'createUser'}"
                 :title="$t('Create new Tingtun Termer user')"
                 :target="targetType">
        {{ $t('Create new Tingtun Termer user') }}
      </Buttonish>
    </div>
  </div>
</template>

<script>
import Buttonish from '@/components/Buttonish'

export default {
  name: 'loginOptions',
  data () {
    return {
      googleURL: '/accounts/google/login/',
      facebookURL: '/accounts/facebook/login/',
      githubURL: '/accounts/github/login/'
    }
  },
  components: {
    Buttonish
  },
  computed: {
    loggedInStatus () {
      return this.$store.getters['Auth/loggedInStatus']
    },
    token () {
      return document.getElementsByName('csrfmiddlewaretoken')[0].value
    },
    googleLogin () {
      return this.socialProviderPath(this.googleURL)
    },
    facebookLogin () {
      return this.socialProviderPath(this.facebookURL)
    },
    githubLogin () {
      return this.socialProviderPath(this.githubURL)
    },
    targetType () {
      if ('nextVue' in this.$route.query) {
        return '_blank'
      }
      return ''
    }
  },
  metaInfo () {
    return {
      title: this.$t('Select login method')
    }
  },
  created () {
    this.handleLoggedInStatus(this.loggedInStatus)
  },
  methods: {
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
    },
    socialProviderPath (url, params = '') {
      return url
    },
    handleLoggedInStatus (status) {
      if (status === false) {
        this.goToNext()
      }
    }
  },
  watch: {
    loggedInStatus (currentValue) {
      this.handleLoggedInStatus(currentValue)
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
// Reson for this class and the parent div
// https://stackoverflow.com/questions/27829250/child-margin-doesnt-affect-parent-height
.parentDiv
  overflow: auto

a
  display: block

.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc
  display: inline-block
  margin: 1em

.templateDiv
  text-align: center

</style>
