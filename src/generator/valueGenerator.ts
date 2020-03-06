export class ValueGenerator {
  protected generating: boolean
  protected frequency: number
  protected callback: (val: number) => void
  private interval: NodeJS.Timeout

  constructor(frequency: number, callback: (val: number) => void) {
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
    this.interval = setInterval(() => {
      this.callback(this.generate())
    }, 1000 / this.frequency)
    this.generating = true
  }

  stop(): void {
    clearInterval(this.interval)
    this.generating = false
  }

  generate(): number {
    return 1
  }
}