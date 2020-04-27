import { EventDispatcher } from 'three'
import * as dat from 'dat.gui'
import * as toBuffer from 'blob-to-buffer'
import { Buffer } from 'buffer/'
import { inflate } from 'pako'
import { GraphManager } from './graphManager'
import { TimedValues } from './models/timedValues'
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

export class WebsocketManager extends EventDispatcher {
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
    super()
    this.graphManager = graphManager
    this.callback = callback
    this.onError = onError
    this.startConnections()
  }

  private async startConnections(): Promise<void> {
    this.readData = await spawn<readData>(new Worker('./workers/readData'))
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

  private decompressData(compressed: Buffer): TimedValues[] {
    const decompresssed = Buffer.from(inflate(compressed))
    const firstTime = decompresssed.readFloatBE(0)
    const lastTime = decompresssed.readFloatBE(4)
    const timeStep = (lastTime - firstTime) / ((decompresssed.length / 4 - 2) / 8)
    const timedValues = []
    let tempValues = []
    for (let i = 8; i < decompresssed.length; i += 4) {
      tempValues.push(decompresssed.readFloatBE(i))
      if (tempValues.length == 8) {
        timedValues.push(new TimedValues(firstTime + timedValues.length * timeStep, tempValues))
        tempValues = []
      }
    }

    return timedValues
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
