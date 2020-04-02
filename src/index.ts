import { GraphManager } from './graphManager'
import { ValueGenerator, GeneratorType } from './generator/valueGenerator'
import * as dat from 'dat.gui'
import { Vector2 } from 'three'
import * as Stats from 'stats.js'
import { WebsocketManager } from './websocketManager'

import * as localforage from 'localforage'

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
  if (generator != null) {
    const gui = new dat.GUI()
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

window.onbeforeunload = function(): void {
  localforage.clear()
  return null
}

window.onload = function(): void {
  localforage.clear()
  graphManager = new GraphManager()

  bindEventListeners()

  initWebSocket()

  initStats()
  render()
}
