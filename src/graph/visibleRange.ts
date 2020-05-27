/**
 * Represents the graphs visible range
 *
 * @export
 * @class VisibleRange
 */
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

  /**
   * Returns the width of the visible range
   *
   * @returns {number}
   * @memberof VisibleRange
   */
  getWidth(): number {
    return this.maxX - this.minX
  }

  /**
   * Returns true if x is contained in the X range
   *
   * @param {number} x
   * @returns {boolean}
   * @memberof VisibleRange
   */
  containsX(x: number): boolean {
    return this.minX <= x && this.maxX >= x
  }

  /**
   * Returns true if y is contained in the Y range
   *
   * @param {number} y
   * @returns {boolean}
   * @memberof VisibleRange
   */
  containsY(y: number): boolean {
    return this.minY <= y && this.maxY >= y
  }
}
