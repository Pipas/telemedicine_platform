import { Vector2, LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial, ObjectLoader } from 'three'
import { GraphLine } from './graphLine'

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

  private addPoints(points: number[]): void {
    const geometry = this.line.geometry as BufferGeometry

    const positions = geometry.attributes.position as BufferAttribute

    let i = 0
    for (; i < points.length - 2; i += 2) {
      positions.set([points[i], points[i + 1], 0, points[i + 2], points[i + 3], 0], i * 3)
    }

    geometry.setDrawRange(0, Chunk.maxPoints * 3 * 2)
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
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

  isFull(): boolean {
    const range = (this.line.geometry as BufferGeometry).drawRange.count

    return range / 6 == Chunk.maxPoints
  }

  toBase64(): string {
    const geometry = this.line.geometry as BufferGeometry

    const positions = geometry.attributes.position as BufferAttribute

    const points = []
    for (let i = 0; i < positions.array.length; i += 6) {
      points.push(positions.array[i])
      points.push(positions.array[i + 1])
    }

    points.push(positions.array[positions.array.length - 3])
    points.push(positions.array[positions.array.length - 2])

    return window.btoa(
      JSON.stringify({
        id: this.id,
        points: points,
      }),
    )
  }

  fromBase64(encoded: string): void {
    const unencoded = JSON.parse(window.atob(encoded))
    if (this.id != unencoded.id) return
    this.addPoints(unencoded.points)
  }
}
