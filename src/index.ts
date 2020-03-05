import { GraphManager } from './graphManager'

let interval: NodeJS.Timeout
let graphManager: GraphManager

let x = 0
let val = 0

function toggleValues (): void {
  if (interval) {
    clearInterval(interval)
    interval = null
  } else {
    interval = setInterval(() => {
      x += 1
      graphManager.addPoint(val)

      if (x > 100) {
        val += 4
        x = 0
        console.log('val: ' + val)
      }
    }, 1)
  }
}

function resizeCanvas (): void {
  graphManager.onWindowResize()
}

function bindEventListeners (): void {
  window.onresize = resizeCanvas

  document.getElementById('toggle').addEventListener('click', toggleValues)
  resizeCanvas()
}

function render (): void {
  requestAnimationFrame(render)
  graphManager.update()
}


window.onload = function (): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  graphManager = new GraphManager(canvas)

  bindEventListeners()
  render()

  graphManager.initGraph()
  toggleValues()
}
