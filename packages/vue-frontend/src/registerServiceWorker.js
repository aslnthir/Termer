/* eslint-disable no-console */

import { register } from 'register-service-worker'

const init = Date.now()
export default function createServiceWorker (onUpdated) {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.VUE_APP_PUBLIC_PATH}service-worker.js`, {
      ready () {
        console.log(
          'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
        )
      },
      registered () {
        console.log('Service worker has been registered.')
      },
      cached () {
        console.log('Content has been cached for offline use.')
      },
      updatefound () {
        console.log('New content is downloading.')
      },
      updated (registration) {
        console.log('New content is available; please refresh.')
        onUpdated()
        const now = Date.now()
        const runtime = now - init
        // force the update if less than 5 seconds have passed.
        if (runtime < 5000) {
          window.addEventListener('unload', () => {
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          })
          window.location.reload(true)
        }
      },
      offline () {
        console.log('No internet connection found. App is running in offline mode.')
      },
      error (error) {
        console.error('Error during service worker registration:', error)
      }
    })
  }
}
