import { ValueGenerator, GeneratorType } from './valueGenerator'
import { Vector2 } from 'three'
import * as dat from 'dat.gui'
import { GraphManager } from '../graphManager'

export class GeneratorManager {
  private gui: dat.GUI

  private generators: ValueGenerator[]
  private graphManager: GraphManager

  private interval: NodeJS.Timeout
  private callback: (points: Vector2[]) => void
  private initTime: number

  private generating = false
  private frequency = 60

  constructor(callback: (points: Vector2[]) => void, graphManager: GraphManager) {
    this.callback = callback
    this.graphManager = graphManager

    this.generators = []

    this.initGUI()
    this.createGenerator()
  }

  private initGUI(): void {
    this.gui = new dat.GUI()
    this.gui.add(this, 'frequency', 1, 1000).onChange(() => this.start())
    this.gui.add(this, 'toggle')
    this.gui.add(this, 'addGraph')
    this.gui.close()
  }

  addGraph(): void {
    this.createGenerator()
    this.graphManager.addGraph()
  }

  private createGenerator(): void {
    const newGenerator = new ValueGenerator()
    const controlsFolder = this.gui.addFolder(`Graph ${newGenerator.id}`)
    controlsFolder
      .add(newGenerator, 'type', [
        GeneratorType.SineGenerator,
        GeneratorType.SquareGenerator,
        GeneratorType.LinearGenerator,
      ])
      .onChange(() => newGenerator.updateGeneratingFunction())
    controlsFolder.add(newGenerator, 'period')
    controlsFolder.add(newGenerator, 'multiplier')

    this.generators.push(newGenerator)
  }

  start(): void {
    if (this.initTime == null) this.initTime = Date.now()
    if (this.interval != null) clearInterval(this.interval)

    this.interval = setInterval(() => {
      this.callback(this.generate())
    }, 1000 / this.frequency)
    this.generating = true
  }

  stop(): void {
    clearInterval(this.interval)
    this.generating = false
  }

  toggle(): void {
    if (this.generating) {
      this.stop()
    } else {
      this.start()
    }
  }

  generate(): Vector2[] {
    const time = (Date.now() - this.initTime) / 1000
    return this.generators.map(generator => generator.generate(time))
  }
}
