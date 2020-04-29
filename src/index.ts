import { GraphManager } from './graphManager'
import { Vector2 } from 'three'
import * as Stats from 'stats.js'
import { WebsocketManager } from './websocketManager'

import * as localforage from 'localforage'
import { GeneratorManager } from './generator/generatorManager'
import { TimedValues } from './models/timedValues'

let graphManager: GraphManager
let generator: GeneratorManager

let stats: Stats

let pointBuffer: TimedValues[] = []
let previousRender: number

const generatorCallback = (points: Vector2[]): void => graphManager.addPoints(points)
const webSocketCallback = (points: TimedValues[]): void => {
  pointBuffer = [...pointBuffer, ...points]
}

function render(timestamp: number): void {
  if (previousRender == null) {
    previousRender = timestamp
    requestAnimationFrame(render)
    return
  }

  stats.begin()

  const renderTime = timestamp - previousRender
  const points = []

  if (pointBuffer.length > 0) {
    points.push(pointBuffer.shift())
    while ((points[points.length - 1].time - points[0].time) * 1000 < renderTime && pointBuffer.length > 0) {
      points.push(pointBuffer.shift())
    }

    graphManager.addTimedValues(points)
  }

  graphManager.render()
  stats.end()
  previousRender = timestamp
  requestAnimationFrame(render)
}

function initStats(): void {
  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
}

function initWebSocket(): void {
  new WebsocketManager(graphManager, webSocketCallback, () => {
    console.log('error')
    generator = new GeneratorManager(generatorCallback, graphManager)
    generator.start()
  })
}

window.onload = function(): void {
  localforage.clear()
  sessionStorage.clear()
  graphManager = new GraphManager()

  initWebSocket()

  initStats()
  requestAnimationFrame(render)
}
