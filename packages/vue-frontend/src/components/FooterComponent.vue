<license>
  Vertraulich
</license>

<template>
  <div class="footer">
    <span id="links">
        <span>
          <router-link
            class="footer-link focusHighlight"
            :to="{ name: 'termsOfUse' }">
            {{ $t('Terms of use')}}
          </router-link>
        </span>
        <span class="help-link">
          |
          <router-link
            class="footer-link focusHighlight"
            :to="{ name: 'help' }">
            {{ $t('Help') }}
          </router-link>
        </span>
        <span class="about-link">
          |
          <router-link
            class="footer-link focusHighlight"
            :to="{ name: 'about' }">
            {{ $t('About') }}
          </router-link>
        </span>
        <span
          v-if="serviceWorkerNeedsUpdate"
          :title="$t('An update is available')">*
        </span>
        <span class="app-link">
          |
          <router-link class="footer-link focusHighlight"
            :target="installAppLinkTarget"
            :to="{ name: 'installApp', query: $route.query }">
            {{ $t('App') }}
          </router-link>
        </span>
        <slot />
      </span>
      <a
        href="http://tingtun.no"
        :title="$t('Link to Tingtun home page')"
        target="_blank"
        class="tingtun-small-link footer-link focusHighlight">
        <img class="tingtun-logo" src="../views/assets/images/tingtun-blue-logo.png" :alt="$t('Logo for Tingtun AS')" />
      </a>
      <!--<pbt-button></pbt-button>-->
      <FeedbackComponent/>
    <a
      href="http://tingtun.no"
      :title="$t('Link to Tingtun home page')"
      target="_blank"
      class="tingtun-link footer-link focusHighlight">
      <img class="tingtun-logo" src="../views/assets/images/tingtun-blue-logo.png" :alt="$t('Logo for Tingtun AS')" />
    </a>
  </div>
</template>

<script>
// import PbtButton from './PbtButton'
import { mapGetters } from 'vuex'
import FeedbackComponent from './FeedbackComponent'

export default {
  name: 'footer-component',
  data () {
    return {
    }
  },
  computed: {
    installAppLinkTarget () {
      let target = '_self'
      if (this.$isInFrame()) target = '_blank'
      return target
    },
    ...mapGetters(['serviceWorkerNeedsUpdate'])
  },
  components: {
    // PbtButton
    FeedbackComponent
  }
  /*
  <img class="ma-logo" src="/static/images/mobile-age-logo.png"></img>
  */
}
</script>

<style lang="sass" scoped>
.footer
  margin: 0.5em 1em 0 1em
  display: grid
  display: grid
  grid-template-columns: auto auto auto

#links
  /* flex: auto */

@media only screen and (max-width: 600px)
  .tingtun-link
    display: none
  .app-link
    display: none
  .about-link
    display: none
  .tingtun-small-link
    display: initial !important
    flex: auto

.ma-logo
  width: 10%
  height: 10%

.tingtun-logo
  width: 5em
  padding-top: 2px

.tingtun-link
  position: relative
  right: 15px
  text-align: right

.tingtun-small-link
  display: none
</style>
