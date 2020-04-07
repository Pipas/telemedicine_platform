import { ValueGenerator, GeneratorType } from './valueGenerator'
import { Vector2 } from '../vector2'

export class GeneratorManager {

  private generators: ValueGenerator[]

  private interval: NodeJS.Timeout
  private callback: (points: Vector2[]) => void
  private initTime: number

  generating = false
  private frequency = 1000

  private nGenerators = 8

  constructor(callback: (points: Vector2[]) => void) {
    this.callback = callback
    this.initGenerators()
  }

  private initGenerators(): void {
    this.generators = []

    for (let i = 0; i < this.nGenerators; i++) {
      this.generators.push(new ValueGenerator)
    }
  }

  start(): void {
    if (this.initTime == null) this.initTime = Date.now()
    if (this.interval != null) clearInterval(this.interval)

    this.interval = setInterval(() => {
      this.callback(this.generate())
    }, 1000 / this.frequency)
    this.generating = true
  }

  restart(): void {
    this.initTime = Date.now()
    this.start()
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

  changeValueGenerator(generator: number, type: GeneratorType, period: number, multiplier: number) {
    if(generator > this.generators.length - 1) return

    this.generators[generator].type = type
    this.generators[generator].updateGeneratingFunction()
    this.generators[generator].period = period
    this.generators[generator].multiplier = multiplier
  }
}
