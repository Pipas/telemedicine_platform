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
  new WebsocketManager(graphManager, generatorCallback, () => {
    console.log('error')
    generator = new GeneratorManager(generatorCallback, graphManager)
    generator.start()
  })
}

window.onload = function(): void {
  localforage.clear()
  graphManager = new GraphManager()

  initWebSocket()

  initStats()
  render()
}
