import { Vector2 } from 'three'

export enum GeneratorType {
  SineGenerator = 'SineGenerator',
  SquareGenerator = 'SquareGenerator',
  LinearGenerator = 'LinearGenerator',
}

export class ValueGenerator {
  private interval: NodeJS.Timeout
  protected generating: boolean
  protected callback: (points: Vector2[]) => void
  protected initTime: number
  private generatingFunction: () => Vector2[]
  public type: GeneratorType
  public period: number
  public multiplier: number
  public frequency: number

  constructor(callback: (points: Vector2[]) => void) {
    this.generating = false
    this.frequency = 1000
    this.callback = callback
    this.period = 1
    this.multiplier = 10
    this.type = GeneratorType.SineGenerator

    this.updateGeneratingFunction()
  }

  isGenerating(): boolean {
    return this.generating
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

  updateGeneratingFunction(): void {
    switch (this.type) {
      case GeneratorType.SineGenerator:
        this.generatingFunction = (): Vector2[] => {
          const time = (Date.now() - this.initTime) / 1000

          return [
            new Vector2(time, Math.sin((Math.PI * time) / this.period) * this.multiplier),
            new Vector2(time, Math.sin((Math.PI * (time + this.period/2)) / this.period) * this.multiplier),
          ]
        }
        break
      case GeneratorType.SquareGenerator:
        this.generatingFunction = (): Vector2[] => {
          const time = (Date.now() - this.initTime) / 1000
          const value = Math.floor(time / this.period) % 2 ? -1 * this.multiplier : 1 * this.multiplier

          return [new Vector2(time, value)]
        }
        break
      case GeneratorType.LinearGenerator:
        this.generatingFunction = (): Vector2[] => {
          const time = (Date.now() - this.initTime) / 1000
          const value = time * this.multiplier

          return [new Vector2(time, value)]
        }
        break
      default:
        break
    }
  }

  generate(): Vector2[] {
    return this.generatingFunction()
  }
}
