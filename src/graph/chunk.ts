import { Vector2, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial } from 'three'
import { Buffer } from 'buffer/'

/**
 * Represents a chunk of graph data
 *
 * @export
 * @class Chunk
 */
export class Chunk {
  static material = new LineBasicMaterial({ color: 0x0000ff })

  // Max points allowed in a chunk
  static maxPoints = 1000

  public id: number
  public firstValue: number
  public lastValue: number

  public line: LineSegments

  constructor(id: number, firstValue: number = undefined, lastValue: number = undefined) {
    this.id = id
    this.firstValue = firstValue
    this.lastValue = lastValue
    this.line = this.createLineSegment()
  }

  /**
   * Adds points to the chunk LineSegment and updates it's geometry
   *
   * @param {Vector2[]} points
   * @memberof Chunk
   */
  addPoints(points: Vector2[]): void {
    const geometry = this.line.geometry as BufferGeometry
    const range = geometry.drawRange.count

    const positions = geometry.attributes.position as BufferAttribute

    let i = 0
    for (; i < points.length - 1; i++) {
      positions.set([points[i].x, points[i].y, 0, points[i + 1].x, points[i + 1].y, 0], range + i * 6)
    }

    positions.needsUpdate = true

    geometry.setDrawRange(0, range + i * 6)
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
  }

  /**
   * Returns the first value of the chunk
   *
   * @returns {number}
   * @memberof Chunk
   */
  getFirstValue(): number {
    if (this.firstValue != undefined) return this.firstValue

    return ((this.line.geometry as BufferGeometry).attributes.position as BufferAttribute).array[0]
  }

  /**
   * Returns the last value of the chunk
   *
   * @returns {number}
   * @memberof Chunk
   */
  getLastValue(): number {
    if (this.lastValue != undefined) return this.lastValue

    const geometry = this.line.geometry as BufferGeometry
    return (geometry.attributes.position as BufferAttribute).array[geometry.drawRange.count - 3]
  }

  /**
   * Returns the available space for points in the buffer
   *
   * @returns {number}
   * @memberof Chunk
   */
  availableSpace(): number {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return Chunk.maxPoints - range / 6
  }

  /**
   * Returns true if the chunk is at full capacity
   *
   * @returns {boolean}
   * @memberof Chunk
   */
  isFull(): boolean {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return range / 6 == Chunk.maxPoints
  }

  /**
   * Gets the chunks positions buffer
   *
   * @returns {BufferAttribute}
   * @memberof Chunk
   */
  getPositions(): BufferAttribute {
    const geometry = this.line.geometry as BufferGeometry

    return geometry.attributes.position as BufferAttribute
  }

  /**
   * Reconstructs the graph geometry from the saved buffer
   *
   * @param {Buffer} buffer
   * @memberof Chunk
   */
  fromBuffer(buffer: Buffer): void {
    const geometry = this.line.geometry as BufferGeometry

    const positions = geometry.attributes.position as BufferAttribute

    let i = 0
    for (; i < buffer.length / 4 - 2; i += 2) {
      positions.set(
        [
          buffer.readFloatBE(i * 4),
          buffer.readFloatBE((i + 1) * 4),
          0,
          buffer.readFloatBE((i + 2) * 4),
          buffer.readFloatBE((i + 3) * 4),
          0,
        ],
        i * 3,
      )
    }
    positions.needsUpdate = true

    geometry.setDrawRange(0, Chunk.maxPoints * 3 * 2)
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
  }

  /**
   * creates an empty Line Segment to be updated
   *
   * @returns {LineSegments}
   * @memberof Chunk
   */
  private createLineSegment(): LineSegments {
    const geometry = new BufferGeometry()

    const positions = new Float32Array(Chunk.maxPoints * 2 * 3)
    geometry.setAttribute('position', new BufferAttribute(positions, 3))

    geometry.setDrawRange(0, 0)

    return new LineSegments(geometry, Chunk.material)
  }
}
