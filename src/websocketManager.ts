import { EventDispatcher, Vector2 } from 'three'
import * as dat from 'dat.gui'
import { GraphManager } from './graphManager'

type WebsocketMessage = {
  x: number
  y: number
}[][]

enum GeneratorType {
  SineGenerator = 'SineGenerator',
  SquareGenerator = 'SquareGenerator',
  LinearGenerator = 'LinearGenerator',
}

type websocketMessage = {
  type: string
  data: string
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
  private gui: dat.GUI
  private graphMessage: ChangeGraphMessage
  private graphManager: GraphManager
  connection: WebSocket
  generatorCallback: (points: Vector2[]) => void

  constructor(graphManager: GraphManager, generatorCallback: (points: Vector2[]) => void, onError: () => void) {
    super()
    this.graphManager = graphManager
    this.connection = new WebSocket('ws://localhost:12345')

    this.connection.addEventListener('open', () => {
      console.log('connected')
      this.initGUI()
    })

    this.connection.addEventListener('message', e => {
      // onMessage(e.data)
      const data = JSON.parse(e.data) as WebsocketMessage
      data.forEach(points => generatorCallback(points.map(point => new Vector2(point.x, point.y))))
    })

    this.connection.addEventListener('error', e => {
      onError()
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
