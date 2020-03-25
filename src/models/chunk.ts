import { Vector2, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, ObjectLoader } from 'three'
import { GraphLine } from './graphLine'

export class Chunk {
  static loader = new ObjectLoader()
  static material = new LineBasicMaterial({ color: 0x0000ff })
  static _id = 0
  static maxPoints = 500
  id: number

  firstValue: number
  lastValue: number

  line: LineSegments

  constructor(encoded: string = null) {
    if (encoded != null) {
      this.fromBase64(encoded)
    } else {
      this.id = Chunk._id++
      this.line = this.createLineSegment()
    }
  }

  createLineSegment(): LineSegments {
    const geometry = new BufferGeometry()

    const positions = new Float32Array(Chunk.maxPoints * 2 * 3)
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    positions.set([0, 0, 0, 0, 0, 0], 0)

    geometry.setDrawRange(0, 0)

    return new LineSegments(geometry, GraphLine.material)
  }

  add(startPoint: Vector2, endPoint: Vector2): void {
    const geometry = this.line.geometry as BufferGeometry
    const range = geometry.drawRange.count

    const positions = geometry.attributes.position as BufferAttribute

    positions.set([startPoint.x, startPoint.y, 0, endPoint.x, endPoint.y, 0], range)
    positions.needsUpdate = true

    geometry.setDrawRange(0, range + 6)
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()

    if (this.firstValue == null) this.firstValue = endPoint.x
    this.lastValue = endPoint.x
  }

  isFull(): boolean {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return range / 6 == Chunk.maxPoints
  }

  toBase64(): string {
    return window.btoa(
      JSON.stringify({
        id: this.id,
        firstValue: this.firstValue,
        lastValue: this.lastValue,
        line: this.line.toJSON(),
      }),
    )
  }

  fromBase64(encoded: string): void {
    const unencoded = JSON.parse(window.atob(encoded))
    this.id = unencoded.id
    this.firstValue = unencoded.firstValue
    this.lastValue = unencoded.lastValue
    this.line = Chunk.loader.parse(unencoded.line) as LineSegments
  }
}
