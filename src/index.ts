import { GraphManager } from './graphManager'
import { ValueGenerator } from './generator/valueGenerator'
import { SineGenerator } from './generator/sineGenerator'

let graphManager: GraphManager

let generator: ValueGenerator = new SineGenerator(1000, point => {
  graphManager.addPoint(point)
}, 10)

function toggleValues (): void {
  if(generator.isGenerating()) {
    generator.stop()
  } else {
    generator.start()
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
  graphManager.update()
  requestAnimationFrame(render)
}


window.onload = function (): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  graphManager = new GraphManager(canvas)

  bindEventListeners()
  render()

  graphManager.initGraph()
  toggleValues()
}
