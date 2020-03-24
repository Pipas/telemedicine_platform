import { GraphManager } from './graphManager'
import { ValueGenerator, GeneratorType } from './generator/valueGenerator'
import * as dat from 'dat.gui'
import { Vector2 } from 'three'
import * as Stats from 'stats.js'
import { WebsocketManager } from './websocketManager'

let graphManager: GraphManager
let generator: ValueGenerator

let stats: Stats

const generatorCallback = (point: Vector2): void => graphManager.addPoint(point)

function resizeCanvas(): void {
  graphManager.onWindowResize()
}

function bindEventListeners(): void {
  window.onresize = resizeCanvas

  resizeCanvas()
}

function render(): void {
  stats.begin()
  graphManager.update()
  stats.end()
  requestAnimationFrame(render)
}

function initGUI(): void {
  const gui = new dat.GUI()

  if (generator != null) {
    gui
      .add(generator, 'type', [
        GeneratorType.SineGenerator,
        GeneratorType.SquareGenerator,
        GeneratorType.LinearGenerator,
      ])
      .onChange(() => generator.updateGeneratingFunction())
    gui.add(generator, 'frequency', 1, 1000).onChange(() => generator.start())
    gui.add(generator, 'period')
    gui.add(generator, 'multiplier')
    gui.add(generator, 'toggle')
  }

  gui.add(graphManager, 'followLiveValue')
}

function initStats(): void {
  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
}

function initWebSocket(): void {
  new WebsocketManager(
    () => {
      console.log('WebSocketConnected')
      initGUI()
    },
    (data: string) => {
      const points = JSON.parse(data)
      points.forEach((point: { x: number; y: number }) => {
        graphManager.addPoint(new Vector2(point.x, point.y))
      })
    },
    () => {
      console.log('error')
      generator = new ValueGenerator(generatorCallback)
      generator.start()
      initGUI()
    },
  )
}

window.onload = function(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  graphManager = new GraphManager(canvas)

  bindEventListeners()
  graphManager.initGraph()

  initWebSocket()

  initStats()
  render()
}
