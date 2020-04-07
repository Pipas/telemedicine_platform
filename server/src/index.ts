import * as WebSocket from 'ws'
import { GeneratorManager } from './generator/generatorManager'
import { Vector2 } from './vector2'

const server = new WebSocket.Server({
  port: 12345,
})

let valueBuffer: Vector2[][] = []
const generatorManager = new GeneratorManager(points => valueBuffer.push(points))

server.on('connection', ws => {
  connectWebsite()

  const interval = setInterval(() => {
    if (ws.readyState == 3) {
      clearInterval(interval)
      disconnectWebsite()
    }

    ws.send(JSON.stringify(valueBuffer))
    valueBuffer = []
  }, 16)

  ws.on('message', data => {
    if (data == 'toggle') {
      generatorManager.toggle()
    } else {
      const graphMessage = JSON.parse(data as string)
      console.log(graphMessage)
      generatorManager.changeValueGenerator(
        graphMessage.graph,
        graphMessage.type,
        graphMessage.period,
        graphMessage.multiplier,
      )
    }
  })
})

function connectWebsite() {
  console.log('Website Connected')
  if (!generatorManager.generating) {
    generatorManager.restart()
  }
}

function disconnectWebsite() {
  console.log('Website Disconnected')
  if (generatorManager.generating) {
    generatorManager.stop()
  }
}
