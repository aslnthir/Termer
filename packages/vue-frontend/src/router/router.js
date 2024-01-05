// Idea from https://github.com/learningequality/kolibri/blob/develop/kolibri/core/assets/src/router.js
import VueRouter from 'vue-router'

export default function (vueRouterConfig) {
  const handlers = extractHandlers(vueRouterConfig.routes)
  const vueRouter = new VueRouter(vueRouterConfig)
  vueRouter.beforeEach((to, from, next) => {
    try {
      if (handlers[to.name]) {
        handlers[to.name](to, from)
      }
    } finally {
      next()
    }
  })
  return vueRouter
}

function extractHandlers (routes) {
  const handlers = {}
  routes.forEach(({ name, handler, component, children }) => {
    if (handler) {
      if (!name) throw new Error('route must have a name')
      if (name in handlers) throw new Error(`route names must be unique (${name})`)
      handlers[name] = handler
    }
    if (children) {
      Object.assign(handlers, extractHandlers(children))
    }
  })
  return handlers
}
