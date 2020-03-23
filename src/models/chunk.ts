import { Vector2, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial } from 'three'
import { GraphLine } from './graphLine'

export class Chunk {
  static material = new LineBasicMaterial({ color: 0x0000ff })
  static latestId = -1
  static maxPoints = 1000
  id: number

  firstValue: number
  lastValue: number

  line: LineSegments

  constructor() {
    this.id = Chunk.latestId++
    this.line = this.createLineSegment()
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
}
