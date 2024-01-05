/*
 * Vertraulich
 */

import Vue from 'vue'
import VueMeta from 'vue-meta'
import App from './App'
import { sync } from 'vuex-router-sync'
import router from './router'
import store from './store'
import './i18n'
import createServiceWorker from './registerServiceWorker'
import ComponentSizeMonitorMixin from './ComponentSizeMonitorMixin'
import CustomButton from './components/CustomButton'
import ConfigButton from '@/components/ConfigButton'
import InPageLink from '@/components/InPageLink'
import TermerVideo from '@/components/TermerVideo'

Vue.use(VueMeta)
Vue.config.productionTip = false

createServiceWorker(function onUpdate () {
  store.dispatch('serviceWorkerUpdated')
})

// Convenience function for checking if the current window is an iframe.
function isInFrame () {
  return window.top !== window.self
}

Vue.prototype.$isInFrame = isInFrame

if (isInFrame()) {
  Vue.mixin(ComponentSizeMonitorMixin)
}

Vue.component('t-video', TermerVideo)
Vue.component('t-button', CustomButton)
Vue.component('config-button', ConfigButton)
Vue.component('in-page-link', InPageLink)

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  async beforeCreate () {
    let redirect = sessionStorage.redirect

    if (redirect) {
      // remove scheme:// part
      redirect = redirect.slice(redirect.indexOf('//') + 2)
      // remove vue app public path
      const publicPath = process.env.VUE_APP_PUBLIC_PATH
      const start = redirect.indexOf(publicPath)
      const length = publicPath.length
      const redirectPath = redirect.slice(start + length)
      // redirect to the intended path
      await this.$router.replace(redirectPath)
      // Make route accessible in store after the correct route has been set.
      sync(store, router)
      delete sessionStorage.redirect
    }
  }
})

if (process.env.VUE_APP_EXPOSE_VUE_OBJECT) {
  // Exposing the Vue object like this is useful for testing.
  window.$vue = vue
}
