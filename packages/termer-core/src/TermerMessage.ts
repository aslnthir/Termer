import { Message as ModelMessage } from './model'

export enum Type {
  // Note: Key and value MUST be the same in this enum.
  UpdateModel = 'UpdateModel',
  Announce = 'Announce',
  Port = 'Port',
  Master = 'Master'
}

export interface UpdateModel {
  type: Type.UpdateModel
  message: ModelMessage
}

export interface Announce {
  type: Type.Announce
  // source is optional because when this message is sent, the source is part
  // of the MessageEvent and not explicitly added to the  message data.
  source?: Window | MessagePort | ServiceWorker
}

export interface Port {
  type: Type.Port
  port: MessagePort
}

export interface Master {
  type: Type.Master
  // source is optional because when this message is sent, the source is part
  // of the MessageEvent and not explicitly added to the  message data.
  source?: Window | MessagePort | ServiceWorker
}

export type FromSlave = UpdateModel | Announce | Port

export type FromMaster = UpdateModel | Master

export type TermerMessage = FromMaster | FromSlave

export function eventToTermerMessage(msg: MessageEvent): TermerMessage | null {
  if (!msg.data.type) return null
  if (!(msg.data.type in Type)) return null
  const msgType: Type = msg.data.type
  switch (msgType) {
    case Type.Announce:
      if (!msg.source) return null
      return {
        type: msgType,
        source: msg.source
      }
      break
    case Type.Master:
      if (!msg.source) return null
      return {
        type: msgType,
        source: msg.source
      }
      break
    case Type.Port:
      return {
        type: msgType,
        port: msg.ports[0]
      }
      break
    case Type.UpdateModel: {
      const message = msg.data.message
      if (!message) return null
      return {
        type: msgType,
        message
      }
      break
    }
    default:
      return assertNever(msgType)
  }
  return null
}

function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export function isFromMaster(message: TermerMessage): message is FromMaster {
  if (message.type === Type.UpdateModel || message.type === Type.Master)
    return true
  else return false
}

export function isFromSlave(message: TermerMessage): message is FromSlave {
  if (
    message.type === Type.UpdateModel ||
    message.type === Type.Port ||
    message.type === Type.Announce
  )
    return true
  else return false
}

export function send(
  to: Window | MessagePort | ServiceWorker,
  message: TermerMessage
): void {
  const transferables: Transferable[] = []
  if (message.type === Type.Port) {
    transferables.push(message.port)
  }
  try {
    if (isWindow(to)) {
      // Window or iframe
      to.postMessage(message, '*', transferables)
    } else if (to instanceof MessagePort) {
      // MessagePort
      to.postMessage(message, transferables)
    } else {
      // ServiceWorker
      to.postMessage(message, transferables)
    }
  } catch (e) {
    console.error(e)
    console.error('Couldn’t send message:', message)
  }
}

function isWindow(o: object): o is Window {
  return (
    // This used to be done with `Object.hasOwnProperty.call(o, …)`, but in
    // IE11 this returns false for the checked properties if o is a
    // cross-origin iframe. `in` raises no such issue in IE11.
    'parent' in o &&
    'frames' in o &&
    'window' in o
  )
}

export function port(port: MessagePort): Port {
  return {
    type: Type.Port,
    port: port
  }
}

export function master(): Master {
  return {
    type: Type.Master
  }
}

export function announce(): Announce {
  return {
    type: Type.Announce
  }
}

export function updateModel(message: ModelMessage): UpdateModel {
  return {
    type: Type.UpdateModel,
    message
  }
}
