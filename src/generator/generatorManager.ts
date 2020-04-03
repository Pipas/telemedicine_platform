import { ValueGenerator } from './valueGenerator'
import { Vector2 } from 'three'
import * as dat from 'dat.gui'

export class GeneratorManager {
  private gui: dat.GUI

  private generators: ValueGenerator[]

  private interval: NodeJS.Timeout
  private callback: (points: Vector2[]) => void
  private initTime: number

  private generating = false
  private frequency = 1

  constructor(callback: (points: Vector2[]) => void) {
    this.callback = callback

    this.generators = [
      new ValueGenerator(),
      new ValueGenerator(),
    ]

    this.initGUI()
  }

  private initGUI(): void {
    this.gui = new dat.GUI()
    // this.gui
    // .add(generator, 'type', [
    //   GeneratorType.SineGenerator,
    //   GeneratorType.SquareGenerator,
    //   GeneratorType.LinearGenerator,
    // ])
    // .onChange(() => generator.updateGeneratingFunction())
    this.gui.add(this, 'frequency', 1, 1000).onChange(() => this.start())
    // this.gui.add(generator, 'period')
    // this.gui.add(generator, 'multiplier')
    this.gui.add(this, 'toggle')
    this.gui.close()
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
    const time = Date.now() - this.initTime / 1000
    return this.generators.map(generator => generator.generate(time))
  }
}
