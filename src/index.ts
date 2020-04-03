import { GraphManager } from './graphManager'
import { Vector2 } from 'three'
import * as Stats from 'stats.js'
import { WebsocketManager } from './websocketManager'

import * as localforage from 'localforage'
import { GeneratorManager } from './generator/generatorManager'

let graphManager: GraphManager
let generator: GeneratorManager

let stats: Stats

const generatorCallback = (points: Vector2[]): void => graphManager.addPoints(points)

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

function initStats(): void {
  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
}

function initWebSocket(): void {
  new WebsocketManager(
    () => {
      console.log('WebSocketConnected')
    },
    (data: string) => {
      const points = JSON.parse(data)
      points.forEach((point: { x: number; y: number }) => {
        graphManager.addPoints([new Vector2(point.x, point.y)])
      })
    },
    () => {
      console.log('error')
      generator = new GeneratorManager(generatorCallback)
      generator.start()
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
