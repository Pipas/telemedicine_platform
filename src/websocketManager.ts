import { EventDispatcher } from 'three'

export class WebsocketManager extends EventDispatcher {
  connection: WebSocket

  constructor(onConnection: () => void, onMessage: Function, onError: () => void) {
    super()
    this.connection = new WebSocket('ws://localhost:12345')

    this.connection.addEventListener('open', () => {
      onConnection()
    })

    this.connection.addEventListener('message', e => {
      onMessage(e.data)
    })

    this.connection.addEventListener('error', e => {
      onError()
    })
  }
}
