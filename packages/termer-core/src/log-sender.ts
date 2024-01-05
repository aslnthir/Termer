import { Message } from './statistics-model'
import { LocalData, transformers } from './localdata'
import { termerStatsServer } from './global-constants'

const logEndpoint = termerStatsServer
function postLogMessage(message: Message): Promise<Response> {
  const obj: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(message)
  }
  return fetch(logEndpoint, obj)
}

export async function sendLogMessage(
  message: LocalData<Message>
): Promise<LocalData<Message>> {
  try {
    const result = await postLogMessage(message.data)
    if (result.ok) {
      // Receipt confirmed. Tag as synced.
      return transformers.toSynced(message)
    } else {
      // result.ok is false on errors.
      throw new Error('HTTP error ' + result.status)
    }
  } catch (e) {
    // fetch only reject on network errors.
    return transformers.toSyncError(message, e)
  }
}
