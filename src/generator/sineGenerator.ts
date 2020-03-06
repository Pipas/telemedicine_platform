import { ValueGenerator } from "./valueGenerator";

export class SineGenerator extends ValueGenerator {
  private n: number = 0
  private max: number

  constructor(frequency: number, callback: (val: number) => void, maxValue: number) {
    super(frequency, callback)
    this.max = maxValue
  }

  generate(): number {
    const val = Math.sin(this.n) * this.max

    this.n += 1 / this.frequency

    return val
  }
}