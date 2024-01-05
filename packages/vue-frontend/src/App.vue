<license>
  Vertraulich
</license>

<template>
  <div id="app" :class="styleName">
    <!-- IE11: only the keydown event is triggered by the Enter key. -->
    <GlobalEvents
      @keydown.escape.capture="closeWindow"
    />
    <GlobalEvents
      @resize="handleResizeEvent"
      @message="handleMessages"
      target="window"
    />
    <component :is="layout">
      <router-view
        :user="user"
        :appStyle="appStyle"></router-view>
    </component>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import eventBus from './eventbus'
// eslint-disable-next-line import/no-webpack-loader-syntax
import { URL } from 'imports-loader?self=>{}!exports-loader?self!js-polyfills/url.js'
import debounce from 'lodash/debounce'
import GlobalEvents from 'vue-global-events'
import DefaultLayout from '@/layouts/Default'
import pinch from 'touch-pinch'
import '@/assets/css/default.sass'

export default {
  name: 'app',
  data () {
    return {
      styleName: ''
    }
  },
  watch: {
    $route (to, from) {
      this.$store.dispatch('Conf/updateRoute')
    },
    appStyle (value) {
      if (value === 'wien') {
        document.body.classList.add('app-style-wien')
      } else {
        document.body.classList.remove('app-style-wien')
      }
    },
    vueSettings (value) {
      if ('zoom-level' in value && document.getElementById('layout')) {
        const times = parseInt(value['zoom-level'].slice(0, -1)) / 100
        const fontSizeTimes = 13 * times
        document.getElementById('layout').style.fontSize = fontSizeTimes + 'px'
        eventBus.$emit('requestResize')
      }
    },
    theme (value) {
      this.styleName = value
      this.loadStyle()
    }
  },
  computed: {
    layout () {
      const defaultLayout = () => import('@/layouts/Default')
      return this.$route.meta.layout || defaultLayout
    },
    ...mapState(['user', 'theme']),
    ...mapState('Conf', ['appStyle']),
    ...mapState('Termer', ['vueSettings']),
    ...mapGetters(['site']),
    ...mapGetters({ language: 'Language/getLanguage' })
  },
  created () {
    // workaround: remove pwa manifest link inserted by vue-cli.
    // then we replace it with our own with custom href path.
    try {
      const el = document.head.querySelector('link[rel="manifest"]')
      if (el) el.remove()
    } catch (e) { /* ignored on purpose */ }
    window.App = this
    this.setLanguage()
    this.$store.dispatch('initialize')

    // initialize pinch-to-zoom gesture detector
    const deltaPerPixel = 0.001
    let scaleFactor = 1
    pinch(window).on('change', function (dist, prev) {
      const delta = dist - prev
      if (delta === 0) return
      scaleFactor = scaleFactor + delta * deltaPerPixel
      window.app.style.setProperty('--font-scale-factor', scaleFactor + 'px')
    })
    this.styleName = localStorage.getItem('siteTheme')
    if (!this.styleName) {
      this.styleName = 'default'
    }
    this.loadStyle()
  },
  components: {
    GlobalEvents,
    DefaultLayout
  },
  methods: {
    loadStyle () {
      try {
        require('@/assets/css/' + this.styleName + '.sass')
      } catch (e) {
        console.log('No souch theme', e)
      }
    },
    handleMessages (evt) {
      if (evt.data.msg === 'turnOn') {
        this.$store.dispatch('Conf/activate', true)
      } else if (evt.data.msg === 'turnOff') {
        this.$store.dispatch('Conf/deactivate', true)
      } else if (evt.data.msg === 'location') {
        const oldLocation = new URL(location)

        const newLocation = new URL(evt.data.location)
        if (oldLocation.href !== newLocation.href) {
          this.$store.dispatch('Conf/updateRoute', newLocation)
        }
        const urlQuery = {}
        for (var item in newLocation.searchParams._list) {
          urlQuery[newLocation.searchParams._list[item].name] = newLocation.searchParams._list[item].value
        }
        newLocation.pathname = newLocation.pathname.replace(
          new RegExp('^' + process.env.VUE_APP_PUBLIC_PATH),
          '/'
        )
        if (this.$route.name === 'empty') {
          this.$router.replace({ path: newLocation.pathname, query: urlQuery })
        } else {
          const currentRoute = { path: this.$route.path, query: this.$route.query }
          const newRoute = { path: newLocation.pathname, query: urlQuery }
          if (JSON.stringify(currentRoute) !== JSON.stringify(newRoute)) {
            this.$router.push(newRoute)
          }
        }
      } else if (evt.data.msg === 'removeDomains') {
        this.$store.dispatch('Conf/resetDomain')
      } else if (evt.data.msg === 'reloadMarkup') {
        this.$store.dispatch('updateDomains', evt.data.domains)
      }
    },
    handleResizeEvent (evt) {
      // XXX: I don’t think this is necessary. window.resize event is the
      // resize event inside the iframe, which is therefore triggered after we’ve
      // already resized it.
      debounce(() => eventBus.$emit('requestResize'), 24)
    },
    closeWindow (evt) {
      if (this.$isInFrame() && 'key' in evt && evt.key.toLowerCase() === 'escape') {
        window.parent.postMessage({
          msg: 'iframe-blur',
          name: window.name
        }, '*')
      }
    },
    setLanguage (locales) {
      this.$i18n.set(this.language)
    }
  },
  metaInfo () {
    // manifest for pwa
    let manifestFilepath = process.env.VUE_APP_PUBLIC_PATH
    if (this.site === 'insitu') {
      manifestFilepath += 'pwa/INSITU/'
    } else if (this.site === 'hovedredningssentralen') {
      manifestFilepath += 'pwa/Hovedredningssentralen/'
    } else if (this.site === 'helse') {
      manifestFilepath += 'pwa/Helse/'
    } else if (this.site === 'jus') {
      manifestFilepath += 'pwa/jus/'
    } else if (this.site === 'ukrainian') {
      manifestFilepath += 'pwa/ukrainian/'
    } else if (this.site === 'kildebruk') {
      manifestFilepath += 'pwa/Kildebruk/'
    } else {
      manifestFilepath += 'pwa/Termer/'
    }
    const iconFilepath = manifestFilepath + 'img/icons/'
    return {
      titleTemplate (subtitle) {
        return subtitle
          ? `${subtitle} – Tingtun Termer`
          : 'Tingtun Termer'
      },
      htmlAttrs: {
        lang: this.language
      },
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: `${iconFilepath}favicon-16x16.png`
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: `${iconFilepath}favicon-32x32.png`
        },
        {
          rel: 'icon',
          href: `${iconFilepath}favicon.ico`
        },
        {
          crossorigin: 'use-credentials',
          href: `${manifestFilepath}manifest.json`,
          rel: 'manifest'
        }, {
          rel: 'apple-touch-icon',
          href: `${iconFilepath}apple-touch-icon-152x152.png`
        }, {
          rel: 'mask-icon',
          href: `${iconFilepath}safari-pinned-tab.svg`,
          color: '#000000'
        }
      ],
      meta: [
        {
          name: 'msapplication-TileImage',
          content: `${iconFilepath}mstile-150x150.png`
        },
        {
          name: 'msapplication-TileColor',
          content: '#000000'
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes' // from vue-pwa: default 'no'
        }, {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'default'
        }, {
          name: 'apple-mobile-web-app-title',
          content: this.site
        }
      ]
    }
  }
}
</script>

<style lang="sass">
\:root
  --invert-text-color: white

.termerWhiteTextBox
  background: var(--information-box-color)
  padding: 1em
  border: 1px solid #ddd
  border-radius: 0.5em
  text-align: initial

#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  --font-scale-factor: 1px
  font-size: 13px /* fallback value */
  font-size: calc(13 * var(--font-scale-factor))
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  /* text-align: center;*/
  color: var(--text-color)
  height: 100%

.focusHighlight:focus
  outline: solid thin black

body
  margin: 0
  height: 100%
  &.app-style-wien
    background-color: var(--termer-background-color)

html
  height: 100%
  overflow-y: hidden
  background-color: grey

*
  box-sizing: border-box

a:link
  color: var(--link-color)

a:visited
  color: var(--link-color-visited)

a:hover
  color: var(--link-color-hover)

a:active
  color: var(--link-color-active)

select
  color: var(--text-color)
  background: var(--information-box-color)
  border-color: var(--select-border-color)

input
  background: var(--text-box-background)
  color: var(--text-box-color)

</style>
