import * as toBuffer from 'blob-to-buffer'
import { TimedValues } from './models/timedValues'
import { spawn, Worker, Transfer, TransferDescriptor } from 'threads'

type readData = (buffer: TransferDescriptor<ArrayBuffer>) => Promise<TimedValues[]>

export class WebsocketManager {
  // private websocketLocation = 'wss://protected-mesa-09317.herokuapp.com'
  private websocketLocation = 'ws://localhost:12345'
  private readData: readData
  private callback: (points: TimedValues[]) => void
  private onError: () => void
  private connection: WebSocket

  constructor(callback: (points: TimedValues[]) => void, onError: () => void) {
    this.callback = callback
    this.onError = onError
    this.startConnections()
  }

  private async startConnections(): Promise<void> {
    this.readData = await spawn<readData>(new Worker('./workers/readData'))
    this.connection = new WebSocket(this.websocketLocation)

    this.connection.addEventListener('open', () => {
      console.log('Connected to device')
    })

    this.connection.addEventListener('message', e => {
      toBuffer(e.data, (err, buffer) => {
        this.readData(Transfer(buffer.buffer)).then((values: TimedValues[]) => this.callback(values))
      })
    })

    this.connection.addEventListener('error', () => {
      this.onError()
    })

    window.onbeforeunload = (): void => {
      this.connection.onclose = (): void => {
        console.log('closing')
      } // disable onclose handler first
      this.connection.close()
    }
  }
}
