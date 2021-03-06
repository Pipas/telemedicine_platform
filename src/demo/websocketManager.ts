import * as dat from 'dat.gui'
import * as toBuffer from 'blob-to-buffer'
import { GraphManager } from '../graph/graphManager'
import { TimedValues } from '../graph/timedValues'
import { spawn, Worker, Transfer, TransferDescriptor } from 'threads'

type readData = (buffer: TransferDescriptor<ArrayBuffer>) => Promise<TimedValues[]>

enum GeneratorType {
  SineGenerator = 'SineGenerator',
  SquareGenerator = 'SquareGenerator',
  LinearGenerator = 'LinearGenerator',
}

class ChangeGraphMessage {
  graph: number
  type: GeneratorType
  period: number
  multiplier: number

  constructor() {
    this.graph = 0
    this.type = GeneratorType.SineGenerator
    this.period = 1
    this.multiplier = 10
  }

  toString(): string {
    return JSON.stringify({
      graph: Math.round(this.graph),
      type: this.type,
      period: this.period,
      multiplier: this.multiplier,
    })
  }
}

export class DemoWebsocketManager {
  // private websocketLocation = 'wss://protected-mesa-09317.herokuapp.com'
  private websocketLocation = 'ws://localhost:12345'
  private gui: dat.GUI
  private graphMessage: ChangeGraphMessage
  private graphManager: GraphManager
  private readData: readData
  private callback: (points: TimedValues[]) => void
  private onError: () => void
  connection: WebSocket

  constructor(graphManager: GraphManager, callback: (points: TimedValues[]) => void, onError: () => void) {
    this.graphManager = graphManager
    this.callback = callback
    this.onError = onError
    this.startConnections()
  }

  private async startConnections(): Promise<void> {
    this.readData = await spawn<readData>(new Worker('../workers/readData'))
    this.connection = new WebSocket(this.websocketLocation)

    this.connection.addEventListener('open', () => {
      console.log(`Connected to ${this.websocketLocation}`)
      this.initGUI()
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

  private initGUI(): void {
    this.graphMessage = new ChangeGraphMessage()

    this.gui = new dat.GUI()
    this.gui.addFolder('Connected to WebSocket')
    this.gui.add(this, 'toggle')
    this.gui.add(this, 'addGraph')
    this.gui.add(this, 'removeGraph')
    const controlsFolder = this.gui.addFolder('Change Graph Settings')
    controlsFolder.add(this.graphMessage, 'graph', 0, 8)
    controlsFolder.add(this.graphMessage, 'type', [
      GeneratorType.SineGenerator,
      GeneratorType.SquareGenerator,
      GeneratorType.LinearGenerator,
    ])
    controlsFolder.add(this.graphMessage, 'period')
    controlsFolder.add(this.graphMessage, 'multiplier')
    controlsFolder.add(this, 'sendMessage')

    this.gui.close()
  }

  sendMessage(): void {
    this.connection.send(this.graphMessage.toString())
  }

  toggle(): void {
    this.connection.send('toggle')
  }

  addGraph(): void {
    this.graphManager.addGraph()
  }

  removeGraph(): void {
    this.graphManager.deleteGraph()
  }
}
