/*
 * Vertraulich
 */

import Vue from 'vue'
import store from './store'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.es.js'
import locales from './locales'

Vue.use(vuexI18n.plugin, store)

for (const locale in locales) {
  Vue.i18n.add(locale, locales[locale])
}
