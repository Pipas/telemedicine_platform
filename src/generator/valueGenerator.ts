import { Point } from "../models/point"

export enum GeneratorType {
  SineGenerator = 'SineGenerator',
  SquareGenerator = 'SquareGenerator'
}

export class ValueGenerator {
  private interval: NodeJS.Timeout
  protected generating: boolean
  protected callback: (point: Point) => void
  protected initTime: number
  private generatingFunction: () => Point
  public type: GeneratorType
  public period: number
  public multiplier: number
  public frequency: number
  public maxValue: number

  constructor(callback: (point: Point) => void) {
    this.generating = false
    this.frequency = 60
    this.callback = callback
    this.maxValue = 10
    this.period = 1
    this.multiplier = 1
    this.type = GeneratorType.SineGenerator

    this.updateGeneratingFunction()
  }

  isGenerating(): boolean {
    return this.generating
  }

  start(): void {
    if(this.initTime == null) this.initTime = Date.now()
    if(this.interval != null) clearInterval(this.interval)

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
    if(this.generating) {
      this.stop()
    } else {
      this.start()
    }
  }

  updateGeneratingFunction() {
    switch (this.type) {
      case GeneratorType.SineGenerator:
        this.generatingFunction = () => {
          const time = (Date.now() - this.initTime) / 1000
          const value = (Math.sin(Math.PI * time/ this.period)) * this.maxValue * this.multiplier

          return new Point(time, value )
        }
        break;
      case GeneratorType.SquareGenerator:
        this.generatingFunction = () => {
          const time = (Date.now() - this.initTime) / 1000
          const value = Math.floor(time / this.period) % 2 ? -this.maxValue * this.multiplier : this.maxValue * this.multiplier

          return new Point(time, value)
        }
        break;
      default:
        break;
    }
  }

  generate(): Point {
    return this.generatingFunction()
  }
}