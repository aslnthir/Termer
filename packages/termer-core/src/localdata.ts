enum Types {
  notsynced = 'notsynced',
  syncing = 'syncing',
  syncerror = 'syncerror',
  synced = 'synced'
}
export interface NotSynced<T> {
  type: Types.notsynced
  data: T
}
export interface Syncing<T> {
  type: Types.syncing
  data: T
}
export interface SyncError<T> {
  type: Types.syncerror
  data: T
  error: Error
}
export interface Synced<T> {
  type: Types.synced
  data: T
}

// Data generated locally which can be sent to server.
// Sync means one-way sync. Doesn’t care/know about data being updated on the server side.
export type LocalData<T> = NotSynced<T> | Syncing<T> | SyncError<T> | Synced<T>

// For two-way sync:
// RemoteConflict (=== SyncError ???)
// does RemoteConflict even help, how to handle conflict?

/*
NotSynced<T> -> NotSynced<T>     | Data changed ready to be sent
NotSynced<T> -> Syncing<T>       | Sending to server
NotSynced<T> -> SyncError<T>     | Error trying to send data
NotSynced<T> -> Synced<T>        | in sync
---------------------------------+----------------------------------

*/

export const constructors = {
  notSynced<T>(data: T): NotSynced<T> {
    return {
      type: Types.notsynced,
      data
    }
  },
  syncing<T>(data: T): Syncing<T> {
    return {
      type: Types.syncing,
      data
    }
  },
  syncError<T>(data: T, error: Error): SyncError<T> {
    return {
      type: Types.syncerror,
      data,
      error
    }
  },
  synced<T>(data: T): Synced<T> {
    return {
      type: Types.synced,
      data
    }
  }
}

export const transformers = {
  toSynced<T>({ data }: LocalData<T>): Synced<T> {
    return {
      data,
      type: Types.synced
    }
  },
  toSyncError<T>({ data }: LocalData<T>, error: Error): SyncError<T> {
    return {
      data,
      error,
      type: Types.syncerror
    }
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isLocalData<T>(x: any): x is LocalData<T> {
  return x.type in Types
}

export function isSyncError<T>(x: LocalData<T>): x is SyncError<T> {
  return x.type === Types.syncerror
}

export function isNotSynced<T>(x: LocalData<T>): x is NotSynced<T> {
  return x.type === Types.notsynced
}

export function isSynced<T>(x: LocalData<T>): x is Synced<T> {
  return x.type === Types.synced
}

export function isSyncing<T>(x: LocalData<T>): x is Syncing<T> {
  return x.type === Types.syncing
}
