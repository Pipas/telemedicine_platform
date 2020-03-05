import { Point } from "./point"

export class VisibleRange {
  minX: number
  maxX: number
  minY: number
  maxY: number

  constructor(minX: number, maxX: number, minY: number, maxY: number) {
    this.minX = minX
    this.maxX = maxX
    this.minY = minY
    this.maxY = maxY
  }

  contains(point: Point): boolean {
    return (this.minX <= point.x && this.maxX >= point.x && this.minY <= point.y && this.maxY >= point.y)
  }
}