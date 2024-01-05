export interface NotAsked {
  type: 'notasked'
}
interface Loading {
  type: 'loading'
}
interface RemoteError {
  type: 'error'
  error: Error
}
export interface Success<T> {
  type: 'success'
  data: T
}
export type RemoteData<T> = NotAsked | Loading | RemoteError | Success<T>

export const constructors = {
  notAsked(): NotAsked {
    return { type: 'notasked' }
  },

  loading(): Loading {
    return { type: 'loading' }
  },

  error(error: Error): RemoteError {
    return { type: 'error', error }
  },

  success<T>(x: T): Success<T> {
    return { type: 'success', data: x }
  }
}

export function isNotAsked<T>(obj: RemoteData<T>): obj is NotAsked {
  return obj && obj.type === 'notasked'
}

export function isSuccess<T>(obj: RemoteData<T>): obj is Success<T> {
  return obj && obj.type === 'success'
}

export function isLoading<T>(obj: RemoteData<T>): obj is Loading {
  return obj && obj.type === 'loading'
}

export function merge<T>(
  a: RemoteData<T[]> | null,
  b: RemoteData<T[]> | null
): RemoteData<T[]> {
  if (!a) a = constructors.notAsked()
  if (!b) return a
  if (a.type === 'success' && b.type === 'success') {
    return constructors.success([...new Set([...a.data, ...b.data])])
  } else return Object.assign({}, b)
}

export function mergeObject<T>(
  a: RemoteData<T> | null,
  b: RemoteData<T> | null
): RemoteData<T> {
  if (!a) a = constructors.notAsked()
  if (!b) return a
  if (a.type === 'success' && b.type === 'success') {
    return constructors.success(Object.assign(a.data, b.data))
  } else return Object.assign({}, b)
}
