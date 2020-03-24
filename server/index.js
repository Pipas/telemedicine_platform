const WebSocket = require('ws')

const server = new WebSocket.Server({
  port: 12345,
})

let valueBuffer = []
let generateInterval

function broadcast(data) {
  // console.log(data)
  server.clients.forEach(ws => {
    ws.send(JSON.stringify(data))
  })
}

server.on('connection', ws => {
  console.log('Connected')
  generate()

  const interval = setInterval(() => {
    broadcast(valueBuffer)
    valueBuffer = []
  }, 16);
})

function generate() {
  if(generateInterval) clearInterval(generateInterval)
  const initTime = Date.now()
  valueBuffer = []


  generateInterval = setInterval(() => {
    valueBuffer.push(sineGenerator(initTime))
  }, 1)
}

function sineGenerator(initTime) {
  const time = (Date.now() - initTime) / 1000
  const value = Math.sin((Math.PI * time) / 1) * 10

  return {
    x: time,
    y: value,
  }
}
