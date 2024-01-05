<license>
  Vertraulich
</license>

<template>
  <span id="source-reference" class="source-reference">
    <GlobalEvents
      v-if="backend.properties.auth"
      @visibilitychange="checkLogin"
    />
    <span v-if="source">
      <a target="_blank"
         class="focusHighlight"
         :href="addVar(source.url)"
         :title="source.name">
          <img v-show="logoLoaded"
               :alt="$t('Image of logo')"
               :src="source.logo_url"
               :id="imageID"/>
        {{source.displayname}}</a>
      | <span><!---
       --><span :title="languageName(languages.from)"><!---
         -->{{languages.from}}<!---
       --></span><!---
       --><arrow-right height="1.4em" width="1.4em" aria-hidden="true" /><!---
       --><span :title="languageName(languages.to)"><!---
         -->{{languages.to}}<!---
       --></span><!---
     --></span><!---
      <template v-if="backend.properties.auth">
        [<a v-if="!backend.config.authenticated.data"
            target="_blank" :href="backend.loginUrl"
            :title="$t('Opens in a new window. Please return here after logging in.')"
            @click="setLoginAttempted">log in</a>
         <a v-else
            target="_blank" :href="backend.loginUrl"
            :title="$t('Opens in a new window. Please return here after logging out.')"
            @click="setLoginAttempted"
            >log out</a>]
      </template>-->
      <span v-if="canEdit" id="edit">
        <span aria-hidden="true" id="separator">|</span><!--
     --><a-button
           @click.prevent="editing = !editing; $emit('edit', editing)"><!--
       -->{{ editing ? $t('finish editing') : $t('edit') }}
        </a-button>
      </span>
    </span>
    <span v-else>…</span>
  </span>
</template>

<script>
import AButton from './AButton'
import { mapState } from 'vuex'
import GlobalEvents from 'vue-global-events'
import ArrowRight from 'mdi-vue/ArrowRight'

export default {
  name: 'source-reference',
  props: {
    source: {},
    canEdit: {},
    languages: {},
    backend: {
      required: false
    }
  },
  data () {
    return {
      editing: false,
      logoLoaded: false,
      loginAttempted: false
    }
  },
  computed: {
    imageID () {
      if (!this.source) return null
      else return 'source-logo' + this.source.id
    },
    ...mapState('Termer', ['supportedLanguages']),
    ...mapState(['searchTerm'])
  },
  components: {
    AButton,
    GlobalEvents,
    ArrowRight
  },
  methods: {
    languageName (languageCode) {
      const language = this.supportedLanguages[languageCode]
      if (language && language.name) {
        return language.name
      }
      return ''
    },
    addVar (str) {
      if (!str) return '#'
      var reg = /\{\{(.*?)\}\}/g
      let found = reg.exec(str)
      while (found) {
        if (found[1] === 'searchTerm') {
          str = str.replace(found[0], this.searchTerm)
        } else {
          str = str.replace(found[0], '')
        }
        found = reg.exec(str)
      }
      str = str.replace(/&amp;/g, '&')
      return str
    },
    setLoginAttempted () {
      this.loginAttempted = true
    },
    checkLogin () {
      if (!document.hidden && this.loginAttempted) {
        this.$store.dispatch('Termer/checkLogin', this.backend.id)
        this.loginAttempted = false
      }
    }
  },
  mounted () {
    // Hide the logo image if cant be shown.
    const self = this
    const img = document.getElementById(this.imageID)
    if (img) {
      img.onload = function () {
        // the image is ready
        self.logoLoaded = true
      }
      img.onerror = function () {
        // the image has failed
        self.logoLoaded = false
      }
    }
  }
}
</script>

<style lang="sass" scoped>
$border: 1px solid var(--border-color)
.source-reference
  position: relative
  font-size: 80%
  border-right: $border
  border-top: $border
  border-left: $border
  border-radius: 5px 5px 0 0
  padding: 0.1em 0.3em 0 0.3em
#separator
  margin: 0 0.5em
#edit
  white-space: nowrap
img
  max-height: 20px
  max-width: 30px
  vertical-align: middle
</style>
