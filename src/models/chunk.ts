import { Vector2, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, ObjectLoader } from 'three'
import { GraphLine } from './graphLine'
import { deflate, inflate } from 'pako'
import { Buffer } from 'buffer/'

export class Chunk {
  static loader = new ObjectLoader()
  static material = new LineBasicMaterial({ color: 0x0000ff })
  static maxPoints = 1000

  id: number
  lastValue: number
  firstValue: number

  line: LineSegments

  constructor(id: number, firstValue: number = undefined, lastValue: number = undefined) {
    this.id = id
    this.firstValue = firstValue
    this.lastValue = lastValue
    this.line = this.createLineSegment()
  }

  createLineSegment(): LineSegments {
    const geometry = new BufferGeometry()

    const positions = new Float32Array(Chunk.maxPoints * 2 * 3)
    geometry.setAttribute('position', new BufferAttribute(positions, 3))

    geometry.setDrawRange(0, 0)

    return new LineSegments(geometry, GraphLine.material)
  }

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

  getFirstValue(): number {
    if (this.firstValue != undefined) return this.firstValue

    return ((this.line.geometry as BufferGeometry).attributes.position as BufferAttribute).array[0]
  }

  getLastValue(): number {
    if (this.lastValue != undefined) return this.lastValue

    const geometry = this.line.geometry as BufferGeometry
    return (geometry.attributes.position as BufferAttribute).array[geometry.drawRange.count - 3]
  }

  availableSpace(): number {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return Chunk.maxPoints - range / 6
  }

  isFull(): boolean {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return range / 6 == Chunk.maxPoints
  }

  getPositions(): BufferAttribute {
    const geometry = this.line.geometry as BufferGeometry

    return geometry.attributes.position as BufferAttribute
  }

  encode(): Uint8Array {
    const geometry = this.line.geometry as BufferGeometry

    const positions = geometry.attributes.position as BufferAttribute

    const buffer = Buffer.alloc(4 * ((positions.array.length / 6) * 2 + 2))
    let offset = 0
    for (let i = 0; i < positions.array.length; i += 6) {
      buffer.writeFloatBE(positions.array[i], offset)
      buffer.writeFloatBE(positions.array[i + 1], offset + 4)
      offset += 8
    }

    buffer.writeFloatBE(positions.array[positions.array.length - 3], offset)
    buffer.writeFloatBE(positions.array[positions.array.length - 2], offset + 4)

    return deflate(buffer)
  }

  decode(encoded: Uint8Array): void {
    const buffer = Buffer.from(inflate(encoded))
    this.fromBuffer(buffer)
  }
}
