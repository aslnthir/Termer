import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import Router from './router.js'
import eventBus from '@/eventbus'

Vue.use(VueRouter)

const router = Router({
  mode: 'history',
  base: process.env.VUE_APP_PUBLIC_PATH,
  scrollBehavior (to, from, savedPosition) {
    return new Promise(resolve => {
      let position = savedPosition
      if (!position) {
        position = { x: 0, y: 0 }
        resolve(position)
      }
      function f () {
        resolve(position)
      }
      eventBus.$once('asyncComponentLoaded', f)
      window.setTimeout(() => {
        eventBus.$off('asyncComponentLoaded', f)
      }, 500)
    })
  },
  routes
})

function hasQueryParams (route) {
  return route.query && Object.keys(route.query).length > 0
}
// Preserve query parameters
// From https://stackoverflow.com/a/47195471
router.beforeEach((to, from, next) => {
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    const route = Object.assign({}, to, { query: from.query })
    next(route)
  } else {
    next()
  }
})

export default router
