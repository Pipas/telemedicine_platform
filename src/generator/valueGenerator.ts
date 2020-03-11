import { Point } from "../models/point"

export class ValueGenerator {
  protected generating: boolean
  protected frequency: number
  protected callback: (point: Point) => void
  protected initTime: number
  private interval: NodeJS.Timeout

  constructor(frequency: number, callback: (point: Point) => void) {
    this.generating = false
    this.frequency = frequency
    this.callback = callback
  }

  setFrequency(frequency: number) {
    this.frequency = frequency
    this.start()
  }

  isGenerating(): boolean {
    return this.generating
  }

  start(): void {
    this.initTime = Date.now()
    this.interval = setInterval(() => {
      this.callback(this.generate())
    }, 1000 / this.frequency)
    this.generating = true
  }

  stop(): void {
    clearInterval(this.interval)
    this.generating = false
  }

  generate(): Point {
    return null
  }
}