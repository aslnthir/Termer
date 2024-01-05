<license>
  Vertraulich
</license>

<template>
  <div class="parentDiv">
    <div id="logout-view" class="fullBorder templateDiv">
      <a
        class="divButton"
        tabindex="0"
        @keyup.enter="logout"
        @click="logout"
        :title="$t('Logout')">
        {{ $t('Logout') }}
      </a>
      <div v-show="false">
        <label>
          {{ $t('Save selected glossaries from visited webpages') }}:
          <input type="checkbox" v-model="saveLocalStorageBool" />
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'logout',
  props: [],
  data () {
    return {
      errors: {},
      saveLocalStorageBool: false
    }
  },
  components: {
  },
  computed: {
    data () {
      let data = {}
      if (this.saveLocalStorageBool && typeof (Storage) !== 'undefined') {
        data = { saved_glossaries: JSON.parse(localStorage.getItem('SelectedGlossaries')) }
      }
      return data
    },
    ...mapState('Termer', ['backends'])
  },
  metaInfo () {
    return {
      title: this.$t('Logout')
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('Termer/logout')
      this.$router.push('/')
      /*
        .then(() => {
          if (typeof (Storage) !== 'undefined') {
            if (window.name === 'termer_addon_iframe') {
              parent.postMessage({ msg: 'removeStorageKey' }, '*')
            }
            if (typeof window.GlossaryStorage !== 'undefined') {
              window.GlossaryStorage.removeStorageKey({ key: 'SelectedGlossaries' }).then(response => {
                this.$store.dispatch('Conf/reloadMarkup')
              })
            }
          }
          if ('next' in this.$route.query) {
            let query = {}
            if ('cfg' in this.$route.query) {
              query = { cfg: this.$route.query.cfg }
            }
            const newRoute = { path: this.$route.query.next, query }
            this.reload(newRoute)
          } else {
            this.reload({ name: 'loginOptions' })
          }
        }).catch(response => {
          this.errors = response.error
        })
        */
    },
    reload (route) {
      // Force reload after logout in order to clear all user data.
      this.$router.push(route)
      window.location.reload()
    }
  },
  watch: {
    backends: function (currentValue, oldValue) {
      if (currentValue.Termer && currentValue.Termer.config &&
        currentValue.Termer.config.authenticated &&
        currentValue.Termer.config.authenticated.data === false
      ) {
        this.$router.push('/')
      }
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

.fullBorder
  border: thin solid
  border-radius: 5px
  box-shadow: 5px 5px 5px #d0cccc
  display: inline-block
  margin: 1em
  padding: 1em

.divButton
  border: thin solid
  border-radius: 5px
  border-color: black
  box-shadow: 5px 5px 5px #d0cccc
  display: inline-block
  min-width: 300px
  margin: 0.5em
  padding: 0.5em
  color: var(--invert-text-color)
  background-color: #18587b
  cursor: pointer
  &:focus
    background-color: #303
  &.big
    margin: 2em
    padding: 1em

.templateDiv
  text-align: center
</style>
