import { ValueGenerator } from "./valueGenerator";
import { Point } from "../models/point";

export class SineGenerator extends ValueGenerator {
  private max: number

  constructor(frequency: number, callback: (point: Point) => void, maxValue: number) {
    super(frequency, callback)
    this.max = maxValue
  }

  generate(): Point {
    const time = (Date.now() - this.initTime) / 1000
    const value = Math.sin(time) * this.max

    return new Point(time, value)
  }
}