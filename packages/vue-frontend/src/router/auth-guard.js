import { statuses } from '@/store/auth'

let authorizedStatus
export default function (authorizedStatus_) {
  authorizedStatus = authorizedStatus_
  return guard
}

function guard (to, from, next) {
  if (to.matched.some(x => x.meta.requiresAuth)) {
    requiresAuth(to, from, next)
  } else {
    next()
  }
}

function requiresAuth (to, from, next) {
  const query = {}
  if (authorizedStatus() === statuses.SUCCESS) {
    next()
  } else {
    if (to.fullPath) {
      query.next = to.fullPath
    }
    next({ name: 'loginOptions', query })
  }
}
