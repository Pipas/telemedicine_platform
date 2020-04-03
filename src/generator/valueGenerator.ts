import { Vector2 } from 'three'

export enum GeneratorType {
  SineGenerator = 'SineGenerator',
  SquareGenerator = 'SquareGenerator',
  LinearGenerator = 'LinearGenerator',
}

export class ValueGenerator {
  private generatingFunction: (time: number) => Vector2
  public type = GeneratorType.SineGenerator
  public period = 1
  public multiplier = 10

  constructor() {
    this.updateGeneratingFunction()
  }

  generate(time: number): Vector2 {
    return this.generatingFunction(time)
  }

  updateGeneratingFunction(): void {
    switch (this.type) {
      case GeneratorType.SineGenerator:
        this.generatingFunction = (time: number): Vector2 => new Vector2(time, Math.sin((Math.PI * time) / this.period) * this.multiplier)
        break
      case GeneratorType.SquareGenerator:
        this.generatingFunction = (time: number): Vector2 => new Vector2(time, Math.floor(time / this.period) % 2 ? -1 * this.multiplier : 1 * this.multiplier)
        break
      case GeneratorType.LinearGenerator:
        this.generatingFunction = (time: number): Vector2 => new Vector2(time, time * this.multiplier)
        break
      default:
        break
    }
  }
}
