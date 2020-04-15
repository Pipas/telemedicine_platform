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

  width(): number {
    return this.maxX - this.minX
  }

  containsX(x: number): boolean {
    return this.minX <= x && this.maxX >= x
  }

  containsY(y: number): boolean {
    return this.minY <= y && this.maxY >= y
  }
}
