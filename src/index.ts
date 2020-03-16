import { GraphManager } from './graphManager'
import { ValueGenerator, GeneratorType } from './generator/valueGenerator'
import * as dat from 'dat.gui'
import { Point } from './models/point'

let graphManager: GraphManager
let generator: ValueGenerator

function resizeCanvas(): void {
  graphManager.onWindowResize()
}

function bindEventListeners(): void {
  window.onresize = resizeCanvas

  resizeCanvas()
}

function render(): void {
  graphManager.update()
  requestAnimationFrame(render)
}

function initGUI(): void {
  const gui = new dat.GUI()
  gui
    .add(generator, 'type', [GeneratorType.SineGenerator, GeneratorType.SquareGenerator, GeneratorType.LinearGenerator])
    .onChange(() => generator.updateGeneratingFunction())
  gui.add(generator, 'frequency', 1, 1000).onChange(() => generator.start())
  gui.add(generator, 'period')
  gui.add(generator, 'multiplier')
  gui.add(generator, 'toggle')
}

const generatorCallback = (point: Point): void => graphManager.addPoint(point)

window.onload = function(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  graphManager = new GraphManager(canvas)

  bindEventListeners()
  graphManager.initGraph()

  generator = new ValueGenerator(generatorCallback)
  generator.start()

  initGUI()
  render()
}
