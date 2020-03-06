import { GraphManager } from './graphManager'
import { ValueGenerator } from './generator/valueGenerator'
import { SineGenerator } from './generator/sineGenerator'

let graphManager: GraphManager

let generator: ValueGenerator = new SineGenerator(10, val => graphManager.addPoint(val), 10)

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
