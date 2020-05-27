import { GraphManager } from './graph/graphManager'
import { WebsocketManager } from './websocketManager'
import * as localforage from 'localforage'
import { TimedValues } from './graph/timedValues'

let graphManager: GraphManager

let pointBuffer: TimedValues[] = []
let previousRender: number

function render(timestamp: number): void {
  if (previousRender == null) {
    previousRender = timestamp
    requestAnimationFrame(render)
    return
  }

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
  previousRender = timestamp
  requestAnimationFrame(render)
}

function initWebSocket(): void {
  new WebsocketManager(
    (points: TimedValues[]): void => {
      pointBuffer = [...pointBuffer, ...points]
    },
    () => {
      console.log('Error while loading connection')
    },
  )
}

window.onload = function(): void {
  localforage.clear()
  sessionStorage.clear()
  graphManager = new GraphManager()

  initWebSocket()
  requestAnimationFrame(render)
}
